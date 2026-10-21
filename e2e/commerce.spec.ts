import { test, expect } from "@playwright/test";
test("commerce routes and safe unapproved catalog", async ({
  request,
  page,
}) => {
  for (const path of [
    "/pricing",
    "/cart",
    "/checkout",
    "/how-it-works",
    "/refund-policy",
    "/terms-and-conditions",
    "/shipping-policy",
    "/payment-policy",
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }
  expect((await request.get("/api/admin/commerce/orders")).status()).toBe(401);
  expect(
    (
      await request.post("/api/commerce/payments/rapidgateway/webhook", {
        headers: { Origin: "http://localhost:8787" },
        data: { status: "paid" },
      })
    ).status(),
  ).toBe(503);
  await page.goto("/pricing");
  await expect(
    page.getByRole("heading", { name: "Service packages", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Display currency", { exact: true })
    .selectOption("PKR");
  await page.goto("/cart");
  await expect(
    page.getByText("Your cart is empty.", { exact: false }),
  ).toBeVisible();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
