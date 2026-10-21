import { Hono } from "hono";
import { z } from "zod";
import {
  checkoutSchema,
  currencies,
  packageSchema,
  convertMinor,
  type Package,
  type Rates,
} from "../shared/commerce";
import {
  digest,
  equal,
  isLocal,
  randomToken,
  rateLimit,
  verifyTurnstile,
} from "./security";
import { notification } from "./email";
import type { AppEnv, Env } from "./types";

export const commerce = new Hono<AppEnv>();
const catalogSql = `SELECT p.*,s.title,s.slug,c.name AS category FROM service_packages p JOIN services s ON s.id=p.service_id JOIN service_categories c ON c.id=p.category_id WHERE p.approved=1 AND p.archived=0 AND s.status='published' AND c.published=1`;
const mockEnabled = (env: Env, url: string) =>
  isLocal(env, url) && env.PAYMENT_PROVIDER === "mock";
export async function getRates(env: Env): Promise<Rates> {
  const cached = (
    await env.DB.prepare("SELECT * FROM currency_rates").all<{
      currency: string;
      rate_decimal: string;
      fetched_at: number;
    }>()
  ).results;
  const oldest =
    cached.length === currencies.length
      ? Math.min(...cached.map((r) => r.fetched_at))
      : 0;
  if (oldest && Date.now() / 1000 - oldest < 86400)
    return {
      rates: Object.fromEntries(
        cached.map((r) => [r.currency, r.rate_decimal]),
      ),
      fetched_at: oldest,
      stale: false,
      provider: "ExchangeRate-API",
    };
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("Rate provider unavailable");
    const data = z
      .object({
        result: z.literal("success"),
        base_code: z.literal("USD"),
        time_last_update_unix: z.number().int().positive(),
        rates: z.record(z.string(), z.number().positive().max(10000000)),
      })
      .parse(await response.json());
    if (
      data.time_last_update_unix > Date.now() / 1000 + 300 ||
      Date.now() / 1000 - data.time_last_update_unix > 172800 ||
      data.rates.USD !== 1
    )
      throw new Error("Invalid rate timestamp");
    const rates: Rates["rates"] = {};
    for (const currency of currencies) {
      if (!data.rates[currency]) throw new Error("Missing rate");
      rates[currency] = data.rates[currency].toFixed(12);
    }
    await env.DB.batch(
      currencies.map((currency) =>
        env.DB.prepare(
          "INSERT INTO currency_rates(currency,rate_decimal,fetched_at,provider) VALUES(?,?,?,?) ON CONFLICT(currency) DO UPDATE SET rate_decimal=excluded.rate_decimal,fetched_at=excluded.fetched_at,provider=excluded.provider",
        ).bind(
          currency,
          rates[currency]!,
          data.time_last_update_unix,
          "ExchangeRate-API",
        ),
      ),
    );
    return {
      rates,
      fetched_at: data.time_last_update_unix,
      stale: false,
      provider: "ExchangeRate-API",
    };
  } catch {
    return {
      rates:
        oldest && Date.now() / 1000 - oldest < 172800
          ? Object.fromEntries(cached.map((r) => [r.currency, r.rate_decimal]))
          : { USD: "1" },
      fetched_at: oldest,
      stale: true,
      provider: "ExchangeRate-API",
    };
  }
}
commerce.get("/catalog", async (c) =>
  c.json({
    items: (await c.env.DB.prepare(catalogSql).all()).results,
    payment: mockEnabled(c.env, c.req.url) ? "mock" : "disabled",
  }),
);
commerce.get("/currency", async (c) => {
  if (!(await rateLimit(c, "currency", 60, 3600)))
    return c.json({ error: "Try again later" }, 429);
  return c.json(await getRates(c.env));
});
commerce.post("/checkout", async (c) => {
  if (!mockEnabled(c.env, c.req.url))
    return c.json(
      {
        error:
          "Live checkout is disabled pending merchant approval. Request a quote instead.",
      },
      503,
    );
  if (!(await rateLimit(c, "checkout", 10, 3600)))
    return c.json({ error: "Try again later" }, 429);
  const parsed = checkoutSchema.safeParse(await c.req.json());
  const key = c.req.header("Idempotency-Key") || "";
  const access = c.req.header("X-Order-Token") || "";
  if (
    !parsed.success ||
    !/^[\w-]{20,100}$/.test(key) ||
    !/^[\w-]{32,100}$/.test(access)
  )
    return c.json({ error: "Invalid order details or security token" }, 400);
  const d = parsed.data;
  if (!(await verifyTurnstile(c, d.turnstileToken, d.website)))
    return c.json({ error: "Security verification failed" }, 422);
  const requestHash = await digest(JSON.stringify(d));
  const accessHash = await digest(access);
  const existing = await c.env.DB.prepare(
    "SELECT id,request_hash,access_hash FROM orders WHERE idempotency_key=?",
  )
    .bind(key)
    .first<{ id: string; request_hash: string; access_hash: string }>();
  if (existing)
    return equal(existing.request_hash, requestHash) &&
      equal(existing.access_hash, accessHash)
      ? c.json({ id: existing.id, provider: "mock" }, 200)
      : c.json({ error: "Idempotency conflict" }, 409);
  const packages: (Package & { quantity: number })[] = [];
  for (const item of d.items) {
    const p = await c.env.DB.prepare(catalogSql + " AND p.id=?")
      .bind(item.package_id)
      .first<Package>();
    if (!p || p.pricing_type === "custom" || !p.amount_minor)
      return c.json(
        {
          error:
            "A package is unavailable or requires a quote. Review your cart.",
        },
        409,
      );
    packages.push({ ...p, quantity: item.quantity });
  }
  const total = packages.reduce(
    (sum, p) => sum + p.amount_minor! * p.quantity,
    0,
  );
  const rates = await getRates(c.env);
  const rate = rates.rates[d.display_currency];
  if (!rate || (d.display_currency !== "USD" && rates.stale))
    return c.json(
      { error: "Current conversion unavailable. Select USD and review again." },
      503,
    );
  const id = randomToken(),
    customer = randomToken(),
    attempt = randomToken();
  try {
    await c.env.DB.batch([
      c.env.DB.prepare(
        "INSERT INTO customers(id,name,email,country) VALUES(?,?,?,?)",
      ).bind(customer, d.name, d.email, d.country),
      c.env.DB.prepare(
        "INSERT INTO orders(id,access_hash,customer_id,idempotency_key,request_hash,amount_minor,currency,display_currency,requirements,terms_version,provider) VALUES(?,?,?,?,?,?,'USD',?,?,?,'mock')",
      ).bind(
        id,
        accessHash,
        customer,
        key,
        requestHash,
        total,
        d.display_currency,
        d.requirements,
        "draft-test-2026-10-21",
      ),
      ...packages.map((p) =>
        c.env.DB.prepare(
          "INSERT INTO order_items(id,order_id,package_id,title,description,deliverables,timeline,revisions,exclusions,quantity,amount_minor) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
        ).bind(
          randomToken(),
          id,
          p.id,
          `${p.title} — ${p.name}`,
          p.description,
          p.deliverables,
          p.timeline,
          p.revisions,
          p.exclusions,
          p.quantity,
          p.amount_minor,
        ),
      ),
      c.env.DB.prepare(
        "INSERT INTO payment_attempts(id,order_id,provider) VALUES(?,?,'mock')",
      ).bind(attempt, id),
      notification(c.env, "test order", id),
    ]);
  } catch (error) {
    const raced = await c.env.DB.prepare(
      "SELECT id,request_hash,access_hash FROM orders WHERE idempotency_key=?",
    )
      .bind(key)
      .first<{ id: string; request_hash: string; access_hash: string }>();
    if (
      raced &&
      equal(raced.request_hash, requestHash) &&
      equal(raced.access_hash, accessHash)
    )
      return c.json({ id: raced.id, provider: "mock" });
    throw error;
  }
  return c.json(
    {
      id,
      provider: "mock",
      amount_minor: total,
      currency: "USD",
      display_amount_minor: convertMinor(total, rate),
      display_currency: d.display_currency,
      rate_timestamp: rates.fetched_at,
    },
    201,
  );
});
commerce.get("/orders/:id", async (c) => {
  const order = await c.env.DB.prepare(
    "SELECT id,status,delivery_status,amount_minor,currency,provider,access_hash FROM orders WHERE id=?",
  )
    .bind(c.req.param("id"))
    .first<{
      id: string;
      status: string;
      delivery_status: string;
      amount_minor: number;
      currency: string;
      provider: string;
      access_hash: string;
    }>();
  if (
    !order ||
    !equal(order.access_hash, await digest(c.req.header("X-Order-Token") || ""))
  )
    return c.json({ error: "Order not found" }, 404);
  const { access_hash: ignored, ...safe } = order;
  void ignored;
  return c.json({
    ...safe,
    items: (
      await c.env.DB.prepare(
        "SELECT title,deliverables,timeline,revisions,exclusions,quantity,amount_minor FROM order_items WHERE order_id=?",
      )
        .bind(order.id)
        .all()
    ).results,
  });
});
commerce.post("/orders/:id/mock-payment", async (c) => {
  if (!mockEnabled(c.env, c.req.url))
    return c.json({ error: "Test payments unavailable" }, 403);
  const order = await c.env.DB.prepare(
    "SELECT access_hash FROM orders WHERE id=?",
  )
    .bind(c.req.param("id"))
    .first<{ access_hash: string }>();
  if (
    !order ||
    !equal(order.access_hash, await digest(c.req.header("X-Order-Token") || ""))
  )
    return c.json({ error: "Order not found" }, 404);
  await c.env.DB.batch([
    c.env.DB.prepare(
      "INSERT OR IGNORE INTO payment_events(id,attempt_id,status) SELECT 'mock:'||id,id,'test_paid' FROM payment_attempts WHERE order_id=?",
    ).bind(c.req.param("id")),
    c.env.DB.prepare(
      "UPDATE payment_attempts SET status='test_paid' WHERE order_id=? AND status='pending'",
    ).bind(c.req.param("id")),
    c.env.DB.prepare(
      "UPDATE orders SET status='test_paid' WHERE id=? AND status='pending'",
    ).bind(c.req.param("id")),
  ]);
  return c.json({
    status: "test_paid",
    message:
      "Simulation only. No funds collected. No live delivery obligation.",
  });
});
// No speculative RapidGateway endpoint, signature scheme or live callback exists.
commerce.post("/payments/rapidgateway/webhook", (c) =>
  c.json(
    {
      error:
        "Provider integration disabled pending official documentation and activation",
    },
    503,
  ),
);

// Mount under /admin/commerce AFTER the existing session/CSRF middleware.
export const commerceAdmin = new Hono<AppEnv>();
commerceAdmin.get("/catalog", async (c) =>
  c.json({
    items: (
      await c.env.DB.prepare(
        "SELECT p.*,s.title FROM service_packages p JOIN services s ON s.id=p.service_id ORDER BY p.created_at DESC",
      ).all()
    ).results,
    categories: (
      await c.env.DB.prepare(
        "SELECT * FROM service_categories ORDER BY position",
      ).all()
    ).results,
    services: (
      await c.env.DB.prepare(
        "SELECT id,title FROM services ORDER BY title",
      ).all()
    ).results,
  }),
);
const categorySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,80}$/),
  name: z.string().trim().min(2).max(100),
  slug: z.string().regex(/^[a-z0-9-]{1,80}$/),
  published: z.boolean(),
  position: z.number().int().min(0).max(1000),
  parent_id: z.string().max(80).nullable().default(null),
});
commerceAdmin.put("/categories", async (c) => {
  const p = categorySchema.safeParse(await c.req.json());
  if (!p.success || p.data.parent_id === p.data.id)
    return c.json({ error: "Invalid category" }, 400);
  const d = p.data;
  await c.env.DB.batch([
    c.env.DB.prepare(
      "INSERT INTO service_categories(id,name,slug,published,position,parent_id) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,slug=excluded.slug,published=excluded.published,position=excluded.position,parent_id=excluded.parent_id",
    ).bind(d.id, d.name, d.slug, Number(d.published), d.position, d.parent_id),
    c.env.DB.prepare(
      "INSERT INTO audit_logs(id,admin_id,action,entity,entity_id) VALUES(?,?,?,?,?)",
    ).bind(randomToken(), c.get("session").admin_id, "save", "category", d.id),
  ]);
  return c.json({ saved: true });
});
commerceAdmin.put("/packages/:id", async (c) => {
  const parsed = packageSchema.safeParse(await c.req.json());
  if (!parsed.success || !/^[\w-]{1,100}$/.test(c.req.param("id")))
    return c.json(
      { error: "Invalid package; complete every scope field and exact price" },
      400,
    );
  const p = parsed.data;
  if (
    !(await c.env.DB.prepare("SELECT id FROM services WHERE id=?")
      .bind(p.service_id)
      .first()) ||
    !(await c.env.DB.prepare("SELECT id FROM service_categories WHERE id=?")
      .bind(p.category_id)
      .first())
  )
    return c.json({ error: "Select an existing service and category" }, 400);
  await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO service_packages(id,service_id,category_id,name,description,deliverables,timeline,revisions,exclusions,pricing_type,amount_minor,approved,archived) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET service_id=excluded.service_id,category_id=excluded.category_id,name=excluded.name,description=excluded.description,deliverables=excluded.deliverables,timeline=excluded.timeline,revisions=excluded.revisions,exclusions=excluded.exclusions,pricing_type=excluded.pricing_type,amount_minor=excluded.amount_minor,approved=excluded.approved,archived=excluded.archived`,
    ).bind(
      c.req.param("id"),
      p.service_id,
      p.category_id,
      p.name,
      p.description,
      p.deliverables,
      p.timeline,
      p.revisions,
      p.exclusions,
      p.pricing_type,
      p.amount_minor,
      Number(p.approved),
      Number(p.archived),
    ),
    c.env.DB.prepare(
      "INSERT INTO audit_logs(id,admin_id,action,entity,entity_id) VALUES(?,?,?,?,?)",
    ).bind(
      randomToken(),
      c.get("session").admin_id,
      "save",
      "package",
      c.req.param("id"),
    ),
  ]);
  return c.json({ saved: true });
});
commerceAdmin.get("/orders", async (c) =>
  c.json({
    items: (
      await c.env.DB.prepare(
        "SELECT o.id,o.status,o.delivery_status,o.amount_minor,o.currency,o.provider,o.requirements,o.created_at,c.name,c.email FROM orders o JOIN customers c ON c.id=o.customer_id ORDER BY o.created_at DESC LIMIT 100",
      ).all()
    ).results,
  }),
);
commerceAdmin.get("/payments", async (c) =>
  c.json({
    items: (
      await c.env.DB.prepare(
        "SELECT * FROM payment_attempts ORDER BY created_at DESC LIMIT 100",
      ).all()
    ).results,
  }),
);
commerceAdmin.get("/readiness", async (c) => {
  const rows = (
    await c.env.DB.prepare("SELECT key,value FROM site_settings").all<{
      key: string;
      value: string;
    }>()
  ).results;
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const checks = {
    email: !!s.business_email && s.business_email_verified === "true",
    phone: !!s.business_phone && s.business_phone_verified === "true",
    address:
      !!s.registered_address &&
      s.registered_address === s.document_address &&
      s.address_verified === "true",
    policies: !!(
      await c.env.DB.prepare(
        "SELECT COUNT(DISTINCT slug) AS n FROM policy_versions WHERE approved=1",
      ).first<{ n: number }>()
    )?.n,
    live_gateway: false,
    public_url_verified: false,
  };
  return c.json({
    ready: false,
    checks,
    message:
      "Merchant readiness remains blocked until business evidence, approved policies, public deployment and official payment integration are verified.",
  });
});
