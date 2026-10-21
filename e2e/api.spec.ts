import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";

test("real local D1 persistence, authentication, CSRF, content and logout", async ({
  request,
  page,
}) => {
  const origin = "http://localhost:8787";
  const headers = { Origin: origin };
  const suffix = randomBytes(6).toString("hex");
  const email = `integration-${suffix}@example.com`;
  const password = `Local-Only!${randomBytes(20).toString("hex")}aA7`;
  const secret = await readFile(".test-bootstrap-secret", "utf8");
  const protectedResponse = await request.get("/api/admin/leads");
  expect(protectedResponse.status()).toBe(401);
  const bootstrap = await request.post("/api/admin/bootstrap", {
    headers: { ...headers, "X-Bootstrap-Secret": secret },
    data: { email, password },
  });
  expect(bootstrap.status(), await bootstrap.text()).toBe(201);
  const bad = await request.post("/api/admin/login", {
    headers,
    data: { email, password: "wrong" },
  });
  expect(bad.status()).toBe(401);
  const contact = await request.post("/api/contact", {
    headers,
    data: {
      name: "Integration Example",
      email: `lead-${suffix}@example.com`,
      service: "Web Development",
      timeline: "Within 1–3 months",
      description:
        "A real local database integration inquiry testing persistence and delivery status behavior.",
      consent: true,
    },
  });
  expect(contact.status()).toBe(201);
  const stored = await contact.json();
  expect(stored.notification).toBe("blocked");
  const login = await request.post("/api/admin/login", {
    headers,
    data: { email, password },
  });
  expect(login.status()).toBe(200);
  expect(login.headers()["set-cookie"]).toContain("HttpOnly");
  expect(login.headers()["set-cookie"]).toContain("SameSite=Strict");
  const session = await login.json();
  const authHeaders = { ...headers, "X-CSRF-Token": session.csrfToken };
  // Synthetic local-only fixture, never seeded or represented as an approved business price.
  const createService = await request.post("/api/admin/services", {
    headers: authHeaders,
    data: {
      title: "Local commerce fixture",
      slug: `commerce-${suffix}`,
      summary:
        "Synthetic local test service, not a business-approved offering.",
      body: "Synthetic local test content for checkout persistence verification only.",
      status: "published",
    },
  });
  expect(createService.status(), await createService.text()).toBe(201);
  const serviceFixture = await createService.json();
  const categoryId = `commerce-${suffix}`;
  expect(
    (
      await request.put("/api/admin/commerce/categories", {
        headers: authHeaders,
        data: {
          id: categoryId,
          slug: categoryId,
          name: "Local test category",
          published: true,
          position: 0,
          parent_id: null,
        },
      })
    ).status(),
  ).toBe(200);
  const fixturePackage = {
    service_id: serviceFixture.id,
    category_id: categoryId,
    name: "Basic",
    description: "Synthetic package for isolated local checkout testing only.",
    deliverables: "A synthetic test deliverable",
    timeline: "Local test only",
    revisions: "No real revisions",
    exclusions: "No real service delivery",
    pricing_type: "fixed",
    amount_minor: 12500,
    approved: true,
    archived: false,
  };
  expect(
    (
      await request.put("/api/admin/commerce/packages/" + categoryId, {
        headers: authHeaders,
        data: fixturePackage,
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await request.put("/api/admin/commerce/packages/" + categoryId, {
        headers,
        data: fixturePackage,
      })
    ).status(),
  ).toBe(403);
  const orderHeaders = {
    ...headers,
    "Idempotency-Key": `checkout-${suffix}-${suffix}`,
    "X-Order-Token": `access-${suffix}-${suffix}-${suffix}`,
  };
  const checkoutData = {
    name: "Local Test Buyer",
    email: "local-buyer@example.com",
    country: "PK",
    requirements: "Synthetic local project requirements",
    display_currency: "USD",
    terms: true,
    items: [{ package_id: categoryId, quantity: 2 }],
  };
  const createdOrder = await request.post("/api/commerce/checkout", {
    headers: orderHeaders,
    data: checkoutData,
  });
  expect(createdOrder.status(), await createdOrder.text()).toBe(201);
  const order = await createdOrder.json();
  expect(order.amount_minor).toBe(25000);
  const repeated = await request.post("/api/commerce/checkout", {
    headers: orderHeaders,
    data: checkoutData,
  });
  expect((await repeated.json()).id).toBe(order.id);
  expect(
    (
      await request.post("/api/commerce/checkout", {
        headers: orderHeaders,
        data: { ...checkoutData, name: "Changed Buyer" },
      })
    ).status(),
  ).toBe(409);
  expect((await request.get("/api/commerce/orders/" + order.id)).status()).toBe(
    404,
  );
  for (let i = 0; i < 2; i++)
    expect(
      (
        await request.post(
          "/api/commerce/orders/" + order.id + "/mock-payment",
          { headers: orderHeaders, data: {} },
        )
      ).status(),
    ).toBe(200);
  const verified = await request.get("/api/commerce/orders/" + order.id, {
    headers: orderHeaders,
  });
  expect((await verified.json()).status).toBe("test_paid");
  const readiness = await request.get("/api/admin/commerce/readiness");
  expect((await readiness.json()).ready).toBe(false);
  expect(
    (
      await request.put("/api/admin/commerce/packages/" + categoryId, {
        headers: authHeaders,
        data: { ...fixturePackage, archived: true },
      })
    ).status(),
  ).toBe(200);
  const subscriptionEmail = `unsubscribe-${suffix}@example.com`;
  const subscribe = () =>
    request.post("/api/newsletter/subscribe", {
      headers: { ...headers, "CF-Connecting-IP": "192.0.2.60" },
      data: { email: subscriptionEmail, consent: true },
    });
  expect((await subscribe()).status()).toBe(201);
  const mail = await (await request.get("/api/admin/emails")).json();
  const confirmation = mail.items.find(
    (item: { recipient: string }) => item.recipient === subscriptionEmail,
  );
  expect(confirmation).toBeTruthy();
  const unsubscribeToken = confirmation.text.match(/token=([a-f0-9]{64})/)[1];
  expect(
    (
      await request.post("/api/newsletter/unsubscribe", {
        headers,
        data: { token: "0".repeat(64) },
      })
    ).status(),
  ).toBe(404);
  expect(
    (
      await request.post("/api/newsletter/unsubscribe", {
        headers,
        data: { token: unsubscribeToken },
      })
    ).status(),
  ).toBe(200);
  expect((await subscribe()).status()).toBe(201);
  expect(
    (
      await request.post("/api/newsletter/unsubscribe", {
        headers,
        data: { token: unsubscribeToken },
      })
    ).status(),
  ).toBe(404);
  const subscriptions = await (
    await request.get("/api/admin/subscribers")
  ).json();
  expect(
    subscriptions.items.find(
      (item: { email: string }) => item.email === subscriptionEmail,
    ).status,
  ).toBe("subscribed");
  const leads = await request.get("/api/admin/contacts");
  expect(
    (await leads.json()).items.some(
      (row: { id: string }) => row.id === stored.id,
    ),
  ).toBe(true);
  const rejected = await request.patch(
    `/api/admin/contacts/${stored.id}/status`,
    { headers, data: { status: "Qualified" } },
  );
  expect(rejected.status()).toBe(403);
  expect(
    (
      await request.patch(`/api/admin/contacts/${stored.id}/status`, {
        headers: authHeaders,
        data: { status: "Qualified" },
      })
    ).status(),
  ).toBe(200);
  const project = await request.post("/api/projects/inquiry", {
    headers,
    data: {
      name: "Project Example",
      email: `project-${suffix}@example.com`,
      services: ["AI Development"],
      timeline: "Exploring options",
      description:
        "An AI-assisted knowledge workflow with source-aware retrieval and explicit review boundaries.",
      consent: true,
    },
  });
  expect(project.status()).toBe(201);
  const newsletter = await request.post("/api/newsletter/subscribe", {
    headers,
    data: { email: `subscriber-${suffix}@example.com`, consent: true },
  });
  expect(newsletter.status()).toBe(201);
  const article = {
    title: "Integration test article",
    slug: `integration-${suffix}`,
    summary:
      "A useful original summary for a locally verified integration test article.",
    body: "This locally generated article verifies content persistence, publication and safe plain text rendering through the real Worker API.",
    status: "draft",
    category: "Engineering",
  };
  const created = await request.post("/api/admin/blog", {
    headers: authHeaders,
    data: article,
  });
  expect(created.status()).toBe(201);
  const { id } = await created.json();
  expect((await request.get(`/api/blog/${article.slug}`)).status()).toBe(404);
  expect(
    (
      await request.put(`/api/admin/blog/${id}`, {
        headers: authHeaders,
        data: { ...article, status: "published" },
      })
    ).status(),
  ).toBe(200);
  expect((await request.get(`/blog/${article.slug}`)).status()).toBe(200);
  expect(
    (
      await request.put(`/api/admin/blog/${id}`, {
        headers: authHeaders,
        data: article,
      })
    ).status(),
  ).toBe(200);
  expect((await request.get(`/blog/${article.slug}`)).status()).toBe(404);
  expect(
    (
      await request.delete(`/api/admin/blog/${id}`, {
        headers: authHeaders,
        data: {},
      })
    ).status(),
  ).toBe(200);
  const outbox = await request.get("/api/admin/emails");
  for (const entity of ["services", "portfolio", "jobs"]) {
    const content = {
      ...article,
      slug: `${entity}-${suffix}`,
      title: `Verified local ${entity} test`,
      status: "published",
      location: "Local test only",
      employment_type: "Test position",
      is_concept: true,
    };
    const create = await request.post(`/api/admin/${entity}`, {
      headers: authHeaders,
      data: content,
    });
    expect(create.status(), entity).toBe(201);
    if (entity === "services") {
      const response = await request.get(`/services/${content.slug}`);
      expect(response.status()).toBe(200);
      expect(await response.text()).toContain(content.title);
      expect(await (await request.get("/services")).text()).toContain(
        `/services/${content.slug}`,
      );
    }
    const entry = await create.json();
    const publicRoute = entity === "portfolio" ? "portfolio" : entity;
    expect(
      (await request.get(`/api/${publicRoute}/${content.slug}`)).status(),
    ).toBe(200);
    expect(
      (
        await request.put(`/api/admin/${entity}/${entry.id}`, {
          headers: authHeaders,
          data: { ...content, title: `${content.title} edited` },
        })
      ).status(),
    ).toBe(200);
    if (entity === "jobs") {
      const applicationData = {
        name: "Integration Applicant",
        email: `applicant-${suffix}@example.com`,
        cover_letter:
          "A local integration application for a test-only position that verifies durable storage and private applicant access.",
        consent: true,
      };
      expect(
        (
          await request.post(`/api/jobs/${entry.id}/apply`, {
            headers,
            data: applicationData,
          })
        ).status(),
      ).toBe(201);
      expect(
        (
          await request.post(`/api/jobs/${entry.id}/apply`, {
            headers,
            data: applicationData,
          })
        ).status(),
      ).toBe(409);
      expect((await request.get("/api/admin/applications")).status()).toBe(200);
      expect(
        (
          await request.delete(`/api/admin/jobs/${entry.id}`, {
            headers: authHeaders,
            data: {},
          })
        ).status(),
      ).toBe(409);
      expect(
        (
          await request.put(`/api/admin/jobs/${entry.id}`, {
            headers: authHeaders,
            data: { ...content, status: "draft" },
          })
        ).status(),
      ).toBe(200);
      expect(
        (
          await request.post(`/api/jobs/${entry.id}/apply`, {
            headers,
            data: { ...applicationData, email: `closed-${suffix}@example.com` },
          })
        ).status(),
      ).toBe(404);
    } else {
      if (entity === "portfolio") {
        const gallery = [
          {
            url: "/images/dashboard.svg",
            alt: "Original concept dashboard with workflow panels",
          },
        ];
        expect(
          (
            await request.put(`/api/admin/portfolio/${entry.id}/images`, {
              headers: authHeaders,
              data: gallery,
            })
          ).status(),
        ).toBe(200);
        expect(
          (
            await (
              await request.get(`/api/admin/portfolio/${entry.id}/images`)
            ).json()
          ).items,
        ).toEqual(gallery);
        expect(
          await (await request.get(`/portfolio/${content.slug}`)).text(),
        ).toContain(gallery[0].alt);
        expect(
          (
            await request.put(`/api/admin/portfolio/${entry.id}/images`, {
              headers: authHeaders,
              data: [{ url: "/images/missing.svg", alt: "Invalid asset" }],
            })
          ).status(),
        ).toBe(400);
      }
      expect(
        (
          await request.delete(`/api/admin/${entity}/${entry.id}`, {
            headers: authHeaders,
            data: {},
          })
        ).status(),
      ).toBe(200);
    }
  }
  expect(
    (
      await request.put("/api/admin/settings", {
        headers: authHeaders,
        data: { key: "announcement", value: "Integration setting verified" },
      })
    ).status(),
  ).toBe(200);
  expect(await (await request.get("/")).text()).toContain(
    "Integration setting verified",
  );
  expect(
    (
      await request.put("/api/admin/settings", {
        headers: authHeaders,
        data: { key: "announcement", value: "" },
      })
    ).status(),
  ).toBe(200);
  const dashboard = await (await request.get("/api/admin/dashboard")).json();
  expect(dashboard.counts.contacts).toBeGreaterThan(0);
  expect(
    (await (await request.get("/api/admin/audits")).json()).items.length,
  ).toBeGreaterThan(0);
  expect(
    (await outbox.json()).items.some(
      (row: { status: string }) => row.status === "blocked",
    ),
  ).toBe(true);
  expect(
    (
      await request.post("/api/admin/logout", {
        headers: authHeaders,
        data: {},
      })
    ).status(),
  ).toBe(200);
  expect((await request.get("/api/admin/session")).status()).toBe(401);
  const html = await request.get("/");
  expect(html.headers()["x-content-type-options"]).toBe("nosniff");
  expect(html.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  await page.goto("/admin");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Overview", exact: true }),
  ).toBeVisible({ timeout: 45000 });
  await page
    .getByRole("navigation", { name: "Administration" })
    .getByRole("button", { name: "Contact leads", exact: true })
    .click();
  await expect(page.locator("table")).toContainText("Integration Example");
  await expect(page.locator("table")).toContainText("Qualified");
  await page
    .getByRole("navigation", { name: "Administration" })
    .getByRole("button", { name: "Articles", exact: true })
    .click();
  await page.getByRole("button", { name: "Create article" }).click();
  await page
    .getByLabel("title", { exact: true })
    .fill("Browser-managed original article");
  await page
    .getByLabel("slug", { exact: true })
    .fill(`browser-article-${suffix}`);
  await page
    .getByLabel("summary", { exact: true })
    .fill(
      "An original browser acceptance article demonstrating real administrator publishing controls.",
    );
  await page
    .getByLabel("body", { exact: true })
    .fill(
      "This original test article verifies that administrator edits reach the persisted database and public server-rendered route.",
    );
  await page.getByLabel("Publication status").selectOption("published");
  await page.getByRole("button", { name: "Save content" }).click();
  await expect(page.locator("table")).toContainText(
    "Browser-managed original article",
  );
  expect((await request.get(`/blog/browser-article-${suffix}`)).status()).toBe(
    200,
  );
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Administrator sign in" }),
  ).toBeVisible();
});
