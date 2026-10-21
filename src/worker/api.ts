import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { z } from "zod";
import {
  applicationSchema,
  bootstrapSchema,
  contactSchema,
  contentSchema,
  gallerySchema,
  leadStatuses,
  loginSchema,
  newsletterSchema,
  projectSchema,
} from "../shared/validation";
import {
  digest,
  equal,
  hashPassword,
  isLocal,
  randomToken,
  rateLimit,
  verifyPassword,
  verifyTurnstile,
} from "./security";
import { emailConfigured, notification, processOutbox } from "./email";
import type { AppEnv, Session } from "./types";
import { commerce, commerceAdmin } from "./commerce";

export const api = new Hono<AppEnv>();
api.use(
  "*",
  bodyLimit({
    maxSize: 65536,
    onError: (c) => c.json({ error: "Request too large" }, 413),
  }),
);
api.use("*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  if (!["GET", "HEAD"].includes(c.req.method)) {
    if (c.req.header("Origin") !== new URL(c.req.url).origin)
      return c.json({ error: "Origin not allowed" }, 403);
    if (!c.req.header("Content-Type")?.startsWith("application/json"))
      return c.json({ error: "JSON required" }, 415);
    const body = await c.req.text();
    if (new TextEncoder().encode(body).length > 65536)
      return c.json({ error: "Request too large" }, 413);
    try {
      JSON.parse(body);
    } catch {
      return c.json({ error: "Invalid JSON" }, 400);
    }
  }
  await next();
});

api.post("/admin/bootstrap", async (c) => {
  if (!(await rateLimit(c, "bootstrap", 3, 3600)))
    return c.json({ error: "Try again later" }, 429);
  if (
    !c.env.ADMIN_BOOTSTRAP_SECRET ||
    !equal(
      c.req.header("X-Bootstrap-Secret") || "",
      c.env.ADMIN_BOOTSTRAP_SECRET,
    )
  )
    return c.json({ error: "Not authorized" }, 403);
  const parsed = bootstrapSchema.safeParse(await c.req.json());
  if (!parsed.success)
    return c.json(
      {
        error:
          "Use a valid email and a strong password of at least 14 characters with mixed case, a number and a symbol.",
      },
      400,
    );
  const id = randomToken();
  const result = await c.env.DB.prepare(
    "INSERT INTO admins(id,email,password_hash) SELECT ?,?,? WHERE NOT EXISTS(SELECT 1 FROM admins)",
  )
    .bind(id, parsed.data.email, await hashPassword(parsed.data.password))
    .run();
  if (!result.meta.changes)
    return c.json({ error: "Bootstrap is closed" }, 409);
  return c.json({ created: true }, 201);
});
api.post("/admin/login", async (c) => {
  if (!(await rateLimit(c, "login", 5, 900)))
    return c.json({ error: "Too many attempts. Try again later." }, 429);
  const parsed = loginSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid credentials" }, 401);
  const admin = await c.env.DB.prepare(
    "SELECT id,email,password_hash FROM admins WHERE email=?",
  )
    .bind(parsed.data.email)
    .first<{ id: string; email: string; password_hash: string }>();
  // Spend equivalent hashing work even when the account does not exist.
  const fallback = `pbkdf2-sha256-v2$${"0".repeat(64)}$${"0".repeat(64)}`;
  const valid = await verifyPassword(
    parsed.data.password,
    admin?.password_hash || fallback,
  );
  if (!admin || !valid) return c.json({ error: "Invalid credentials" }, 401);
  const token = randomToken();
  const csrf = randomToken();
  await c.env.DB.prepare(
    "INSERT INTO admin_sessions(token_hash,admin_id,csrf_token,expires_at) VALUES(?,?,?,?)",
  )
    .bind(
      await digest(token),
      admin.id,
      csrf,
      Math.floor(Date.now() / 1000) + 28800,
    )
    .run();
  setCookie(c, "cb_session", token, {
    httpOnly: true,
    secure: !isLocal(c.env, c.req.url),
    sameSite: "Strict",
    path: "/",
    maxAge: 28800,
  });
  return c.json({ email: admin.email, csrfToken: csrf });
});
api.use("/admin/*", async (c, next) => {
  const token = getCookie(c, "cb_session");
  if (!token) return c.json({ error: "Authentication required" }, 401);
  const session = await c.env.DB.prepare(
    "SELECT s.admin_id,s.csrf_token,s.token_hash,a.email FROM admin_sessions s JOIN admins a ON a.id=s.admin_id WHERE s.token_hash=? AND s.expires_at>?",
  )
    .bind(await digest(token), Math.floor(Date.now() / 1000))
    .first<Session>();
  if (!session) return c.json({ error: "Session expired" }, 401);
  if (
    !["GET", "HEAD"].includes(c.req.method) &&
    !equal(c.req.header("X-CSRF-Token") || "", session.csrf_token)
  )
    return c.json({ error: "Invalid CSRF token" }, 403);
  c.set("session", session);
  await next();
});
api.route("/admin/commerce", commerceAdmin);
api.route("/commerce", commerce);
api.get("/admin/session", (c) =>
  c.json({
    email: c.get("session").email,
    csrfToken: c.get("session").csrf_token,
  }),
);
api.post("/admin/logout", async (c) => {
  await c.env.DB.prepare("DELETE FROM admin_sessions WHERE token_hash=?")
    .bind(c.get("session").token_hash)
    .run();
  deleteCookie(c, "cb_session", { path: "/" });
  return c.json({ loggedOut: true });
});

for (const [path, schema, table, kind] of [
  ["/contact", contactSchema, "contacts", "contact"],
  ["/consultations/inquiry", contactSchema, "contacts", "consultation"],
  ["/projects/inquiry", projectSchema, "project_inquiries", "project inquiry"],
] as const) {
  api.post(path, async (c) => {
    if (!(await rateLimit(c, "inquiry", 5, 3600)))
      return c.json(
        { error: "Too many submissions. Please try again later." },
        429,
      );
    const parsed = schema.safeParse(await c.req.json());
    if (!parsed.success)
      return c.json(
        {
          error: "Please check your inquiry fields.",
          fields: parsed.error.flatten().fieldErrors,
        },
        400,
      );
    const data = parsed.data;
    if (!(await verifyTurnstile(c, data.turnstileToken, data.website)))
      return c.json(
        {
          error:
            "Security verification failed or is not configured. Please email us instead.",
        },
        422,
      );
    const id = randomToken();
    const insert =
      table === "contacts"
        ? c.env.DB.prepare(
            "INSERT INTO contacts(id,name,email,company,phone,service,budget,timeline,description,consent,kind) VALUES(?,?,?,?,?,?,?,?,?,1,?)",
          ).bind(
            id,
            data.name,
            data.email,
            data.company,
            data.phone,
            "service" in data ? data.service : "",
            data.budget,
            data.timeline,
            data.description,
            kind,
          )
        : c.env.DB.prepare(
            "INSERT INTO project_inquiries(id,name,email,company,phone,services_json,budget,timeline,description,consent) VALUES(?,?,?,?,?,?,?,?,?,1)",
          ).bind(
            id,
            data.name,
            data.email,
            data.company,
            data.phone,
            JSON.stringify("services" in data ? data.services : []),
            data.budget,
            data.timeline,
            data.description,
          );
    const statements = [insert, notification(c.env, kind, id)];
    if (c.env.SEND_CONFIRMATIONS === "true")
      statements.push(
        c.env.DB.prepare(
          "INSERT INTO email_outbox(id,kind,recipient,subject,text,status) VALUES(?,?,?,?,?,?)",
        ).bind(
          randomToken(),
          "confirmation",
          data.email,
          "Your CodesBoxs inquiry",
          `Your inquiry was stored. Reference: ${id}. This is a receipt, not a delivery estimate.`,
          emailConfigured(c.env) ? "pending" : "blocked",
        ),
      );
    await c.env.DB.batch(statements);
    c.executionCtx.waitUntil(processOutbox(c.env));
    return c.json(
      {
        id,
        stored: true,
        notification: emailConfigured(c.env) ? "queued" : "blocked",
        message:
          "Your inquiry has been saved. Email delivery is separate and is not yet confirmed.",
      },
      201,
    );
  });
}
api.post("/newsletter/subscribe", async (c) => {
  if (!(await rateLimit(c, "newsletter", 5, 3600)))
    return c.json({ error: "Please try again later" }, 429);
  const parsed = newsletterSchema.safeParse(await c.req.json());
  if (!parsed.success)
    return c.json({ error: "A valid email and consent are required" }, 400);
  if (
    !(await verifyTurnstile(c, parsed.data.turnstileToken, parsed.data.website))
  )
    return c.json(
      { error: "Security verification failed or is unavailable" },
      422,
    );
  const id = randomToken();
  const token = randomToken();
  const statements = [
    c.env.DB.prepare(
      "INSERT INTO newsletter_subscribers(id,email,consent,unsubscribe_hash) VALUES(?,?,1,?) ON CONFLICT(email) DO UPDATE SET status='subscribed',unsubscribe_hash=excluded.unsubscribe_hash WHERE newsletter_subscribers.status='unsubscribed'",
    ).bind(id, parsed.data.email, await digest(token)),
  ];
  if (c.env.SEND_CONFIRMATIONS === "true") {
    statements.push(
      c.env.DB.prepare(
        "INSERT INTO email_outbox(id,kind,recipient,subject,text,status) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM newsletter_subscribers WHERE email=? AND unsubscribe_hash=?)",
      ).bind(
        randomToken(),
        "newsletter",
        parsed.data.email,
        "CodesBoxs newsletter subscription",
        `Your subscription is stored. To unsubscribe, visit ${c.env.PUBLIC_SITE_URL}/newsletter/unsubscribe?token=${token}`,
        emailConfigured(c.env) ? "pending" : "blocked",
        parsed.data.email,
        await digest(token),
      ),
    );
  }
  await c.env.DB.batch(statements);
  c.executionCtx.waitUntil(processOutbox(c.env));
  return c.json(
    {
      stored: true,
      message:
        "Subscription recorded. If you were already subscribed, no duplicate was created.",
    },
    201,
  );
});
api.post("/newsletter/unsubscribe", async (c) => {
  if (!(await rateLimit(c, "unsubscribe", 20, 3600)))
    return c.json({ error: "Please try again later" }, 429);
  const parsed = z
    .object({ token: z.string().regex(/^[a-f0-9]{64}$/) })
    .safeParse(await c.req.json());
  if (!parsed.success)
    return c.json({ error: "Invalid unsubscribe token" }, 400);
  const result = await c.env.DB.prepare(
    "UPDATE newsletter_subscribers SET status='unsubscribed' WHERE unsubscribe_hash=?",
  )
    .bind(await digest(parsed.data.token))
    .run();
  if (!result.meta.changes)
    return c.json(
      {
        error:
          "This unsubscribe link is invalid or has been replaced. Contact us for help.",
      },
      404,
    );
  return c.json({ message: "Unsubscribe request processed." });
});

const publicTables = {
  services: "services",
  portfolio: "portfolio_projects",
  blog: "blog_posts",
  jobs: "job_openings",
} as const;
for (const [route, table] of Object.entries(publicTables)) {
  api.get(`/${route}`, async (c) => {
    const page = Math.max(
      1,
      Math.min(10000, Math.trunc(Number(c.req.query("page")) || 1)),
    );
    const rows = await c.env.DB.prepare(
      `SELECT * FROM ${table} WHERE status='published' ORDER BY created_at DESC LIMIT 20 OFFSET ?`,
    )
      .bind((page - 1) * 20)
      .all();
    return c.json({ items: rows.results, page });
  });
  api.get(`/${route}/:slug`, async (c) => {
    const row = await c.env.DB.prepare(
      `SELECT * FROM ${table} WHERE slug=? AND status='published'`,
    )
      .bind(c.req.param("slug"))
      .first();
    if (!row) return c.json({ error: "Not found" }, 404);
    if (table === "portfolio_projects") {
      const images = await c.env.DB.prepare(
        "SELECT url,alt FROM portfolio_images WHERE project_id=? ORDER BY position,id",
      )
        .bind(row.id)
        .all();
      return c.json({ ...row, gallery: images.results });
    }
    return c.json(row);
  });
}
api.post("/jobs/:id/apply", async (c) => {
  if (!(await rateLimit(c, "apply", 5, 3600)))
    return c.json({ error: "Please try again later" }, 429);
  const parsed = applicationSchema.safeParse(await c.req.json());
  if (!parsed.success)
    return c.json({ error: "Check application fields" }, 400);
  if (
    !(await verifyTurnstile(c, parsed.data.turnstileToken, parsed.data.website))
  )
    return c.json(
      { error: "Security verification failed or unavailable" },
      422,
    );
  const job = await c.env.DB.prepare(
    "SELECT id FROM job_openings WHERE id=? AND status='published'",
  )
    .bind(c.req.param("id"))
    .first();
  if (!job) return c.json({ error: "Position is not open" }, 404);
  const d = parsed.data;
  const id = randomToken();
  const existing = await c.env.DB.prepare(
    "SELECT id FROM job_applications WHERE job_id=? AND email=?",
  )
    .bind(c.req.param("id"), d.email)
    .first();
  if (existing)
    return c.json(
      { error: "An application for this email already exists" },
      409,
    );
  try {
    await c.env.DB.batch([
      c.env.DB.prepare(
        "INSERT INTO job_applications(id,job_id,name,email,cover_letter,portfolio_url,consent) VALUES(?,?,?,?,?,?,1)",
      ).bind(
        id,
        c.req.param("id"),
        d.name,
        d.email,
        d.cover_letter,
        d.portfolio_url,
      ),
      notification(c.env, "job application", id),
    ]);
  } catch (error) {
    if (
      await c.env.DB.prepare(
        "SELECT id FROM job_applications WHERE job_id=? AND email=?",
      )
        .bind(c.req.param("id"), d.email)
        .first()
    )
      return c.json(
        { error: "An application for this email already exists" },
        409,
      );
    throw error;
  }
  c.executionCtx.waitUntil(processOutbox(c.env));
  return c.json(
    {
      stored: true,
      id,
      notification: emailConfigured(c.env) ? "queued" : "blocked",
    },
    201,
  );
});

const adminTables: Record<string, string> = {
  contacts: "contacts",
  projects: "project_inquiries",
  subscribers: "newsletter_subscribers",
  applications: "job_applications",
  blog: "blog_posts",
  portfolio: "portfolio_projects",
  services: "services",
  jobs: "job_openings",
  audits: "audit_logs",
  emails: "email_outbox",
};
api.get("/admin/dashboard", async (c) => {
  const counts: Record<string, number> = {};
  for (const [key, table] of Object.entries(adminTables)) {
    const row = await c.env.DB.prepare(
      `SELECT COUNT(*) AS count FROM ${table}`,
    ).first<{ count: number }>();
    counts[key] = row?.count || 0;
  }
  return c.json({ counts });
});
api.get("/admin/leads", async (c) => {
  const rows = await c.env.DB.prepare(
    "SELECT id,name,email,status,created_at,'contact' AS kind FROM contacts UNION ALL SELECT id,name,email,status,created_at,'project' AS kind FROM project_inquiries ORDER BY created_at DESC LIMIT 50",
  ).all();
  return c.json({ items: rows.results });
});
api.get("/admin/settings", async (c) =>
  c.json({
    items: (
      await c.env.DB.prepare("SELECT * FROM site_settings ORDER BY key").all()
    ).results,
  }),
);
api.put("/admin/settings", async (c) => {
  const parsed = z
    .object({
      key: z.enum([
        "announcement",
        "contact_note",
        "footer_note",
        "business_email",
        "business_email_verified",
        "business_phone",
        "business_phone_verified",
        "registered_address",
        "document_address",
        "address_verified",
      ]),
      value: z.string().trim().max(500),
    })
    .safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid setting" }, 400);
  await c.env.DB.batch([
    c.env.DB.prepare(
      "INSERT INTO site_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP",
    ).bind(parsed.data.key, parsed.data.value),
    c.env.DB.prepare(
      "INSERT INTO audit_logs(id,admin_id,action,entity,entity_id) VALUES(?,?,?,?,?)",
    ).bind(
      randomToken(),
      c.get("session").admin_id,
      "update",
      "settings",
      parsed.data.key,
    ),
  ]);
  return c.json({ saved: true });
});
api.get("/admin/portfolio/:id/images", async (c) => {
  const project = await c.env.DB.prepare(
    "SELECT id FROM portfolio_projects WHERE id=?",
  )
    .bind(c.req.param("id"))
    .first();
  if (!project) return c.json({ error: "Project not found" }, 404);
  const images = await c.env.DB.prepare(
    "SELECT url,alt FROM portfolio_images WHERE project_id=? ORDER BY position,id",
  )
    .bind(c.req.param("id"))
    .all();
  return c.json({ items: images.results });
});
api.put("/admin/portfolio/:id/images", async (c) => {
  const parsed = gallerySchema.safeParse(await c.req.json());
  if (!parsed.success)
    return c.json(
      {
        error:
          "Select at most eight local illustrations and provide meaningful alternative text.",
      },
      400,
    );
  const id = c.req.param("id");
  if (
    !(await c.env.DB.prepare("SELECT id FROM portfolio_projects WHERE id=?")
      .bind(id)
      .first())
  )
    return c.json({ error: "Project not found" }, 404);
  await c.env.DB.batch([
    c.env.DB.prepare("DELETE FROM portfolio_images WHERE project_id=?").bind(
      id,
    ),
    ...parsed.data.map((image, position) =>
      c.env.DB.prepare(
        "INSERT INTO portfolio_images(id,project_id,url,alt,position) VALUES(?,?,?,?,?)",
      ).bind(randomToken(), id, image.url, image.alt, position),
    ),
    c.env.DB.prepare(
      "INSERT INTO audit_logs(id,admin_id,action,entity,entity_id) VALUES(?,?,?,?,?)",
    ).bind(
      randomToken(),
      c.get("session").admin_id,
      "update-gallery",
      "portfolio",
      id,
    ),
  ]);
  return c.json({ saved: true });
});
api.get("/admin/:entity", async (c) => {
  const entity = c.req.param("entity");
  const table = adminTables[entity];
  if (!table) return c.json({ error: "Unknown entity" }, 404);
  const page = Math.max(
    1,
    Math.min(10000, Math.trunc(Number(c.req.query("page")) || 1)),
  );
  const search = (c.req.query("search") || "").slice(0, 100);
  const searchable = ["blog", "portfolio", "services", "jobs"].includes(entity)
    ? "title"
    : ["contacts", "projects", "applications"].includes(entity)
      ? "name"
      : entity === "subscribers"
        ? "email"
        : "id";
  const status = c.req.query("status") || "";
  const hasStatus = !["audits"].includes(entity);
  const where = `${searchable} LIKE ?${hasStatus && status ? " AND status=?" : ""}`;
  const params =
    hasStatus && status ? [`%${search}%`, status] : [`%${search}%`];
  const [rows, count] = await c.env.DB.batch([
    c.env.DB.prepare(
      `SELECT * FROM ${table} WHERE ${where} ORDER BY created_at DESC LIMIT 20 OFFSET ?`,
    ).bind(...params, (page - 1) * 20),
    c.env.DB.prepare(
      `SELECT COUNT(*) AS total FROM ${table} WHERE ${where}`,
    ).bind(...params),
  ]);
  return c.json({
    items: rows.results,
    total: (count.results[0] as { total: number }).total,
    page,
  });
});
api.patch("/admin/:entity/:id/status", async (c) => {
  const entity = c.req.param("entity");
  if (!["contacts", "projects", "applications"].includes(entity))
    return c.json({ error: "Unknown lead type" }, 404);
  const parsed = z
    .object({ status: z.enum(leadStatuses) })
    .safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid status" }, 400);
  const result = await c.env.DB.batch([
    c.env.DB.prepare(
      `UPDATE ${adminTables[entity]} SET status=? WHERE id=?`,
    ).bind(parsed.data.status, c.req.param("id")),
    c.env.DB.prepare(
      "INSERT INTO audit_logs(id,admin_id,action,entity,entity_id) VALUES(?,?,?,?,?)",
    ).bind(
      randomToken(),
      c.get("session").admin_id,
      `status:${parsed.data.status}`,
      entity,
      c.req.param("id"),
    ),
  ]);
  return result[0].meta.changes
    ? c.json({ saved: true })
    : c.json({ error: "Not found" }, 404);
});
const columns: Record<string, string[]> = {
  blog: [
    "slug",
    "title",
    "summary",
    "body",
    "status",
    "category",
    "author",
    "image",
  ],
  portfolio: [
    "slug",
    "title",
    "summary",
    "body",
    "status",
    "category",
    "image",
    "technologies",
    "is_concept",
  ],
  services: ["slug", "title", "summary", "body", "status"],
  jobs: [
    "slug",
    "title",
    "summary",
    "body",
    "status",
    "location",
    "employment_type",
  ],
};
for (const method of ["post", "put"] as const) {
  api[method](`/admin/:entity${method === "put" ? "/:id" : ""}`, async (c) => {
    const entity = c.req.param("entity");
    const fields = columns[entity];
    const table = adminTables[entity];
    if (!fields || !table)
      return c.json({ error: "Unknown content type" }, 404);
    const parsed = contentSchema.safeParse(await c.req.json());
    if (!parsed.success)
      return c.json(
        {
          error: "Invalid content fields",
          fields: parsed.error.flatten().fieldErrors,
        },
        400,
      );
    if (
      entity === "jobs" &&
      (!parsed.data.location || !parsed.data.employment_type)
    )
      return c.json(
        { error: "Location and employment type are required" },
        400,
      );
    const id = method === "post" ? randomToken() : c.req.param("id")!;
    const values = fields.map((key) => {
      const value = parsed.data[key as keyof typeof parsed.data];
      return typeof value === "boolean" ? Number(value) : value;
    });
    const existing = await c.env.DB.prepare(
      `SELECT id FROM ${table} WHERE slug=? AND id<>?`,
    )
      .bind(parsed.data.slug, id)
      .first();
    if (existing) return c.json({ error: "Slug already exists" }, 409);
    const statement =
      method === "post"
        ? c.env.DB.prepare(
            `INSERT INTO ${table}(id,${fields.join(",")}) VALUES(${["id", ...fields].map(() => "?").join(",")})`,
          ).bind(id, ...values)
        : c.env.DB.prepare(
            `UPDATE ${table} SET ${fields.map((f) => `${f}=?`).join(",")},updated_at=CURRENT_TIMESTAMP WHERE id=?`,
          ).bind(...values, id);
    const writes = [statement];
    if (entity === "blog")
      writes.push(
        c.env.DB.prepare(
          "UPDATE blog_posts SET published_at=CASE WHEN status='published' THEN COALESCE(published_at,CURRENT_TIMESTAMP) ELSE NULL END WHERE id=?",
        ).bind(id),
      );
    writes.push(
      c.env.DB.prepare(
        "INSERT INTO audit_logs(id,admin_id,action,entity,entity_id) VALUES(?,?,?,?,?)",
      ).bind(
        randomToken(),
        c.get("session").admin_id,
        method === "post" ? "create" : "update",
        entity,
        id,
      ),
    );
    const results = await c.env.DB.batch(writes);
    if (!results[0].meta.changes) return c.json({ error: "Not found" }, 404);
    return c.json({ saved: true, id }, method === "post" ? 201 : 200);
  });
}
api.delete("/admin/:entity/:id", async (c) => {
  const entity = c.req.param("entity");
  if (!columns[entity]) return c.json({ error: "Unsupported operation" }, 404);
  const id = c.req.param("id");
  if (
    entity === "jobs" &&
    (await c.env.DB.prepare(
      "SELECT id FROM job_applications WHERE job_id=? LIMIT 1",
    )
      .bind(id)
      .first())
  )
    return c.json(
      { error: "This job has applications. Unpublish it instead." },
      409,
    );
  const results = await c.env.DB.batch([
    c.env.DB.prepare(`DELETE FROM ${adminTables[entity]} WHERE id=?`).bind(id),
    c.env.DB.prepare(
      "INSERT INTO audit_logs(id,admin_id,action,entity,entity_id) VALUES(?,?,?,?,?)",
    ).bind(randomToken(), c.get("session").admin_id, "delete", entity, id),
  ]);
  return results[0].meta.changes
    ? c.json({ deleted: true })
    : c.json({ error: "Not found" }, 404);
});
api.all("*", (c) => c.json({ error: "API route not found" }, 404));
