import { test, expect } from "@playwright/test";

test("flagship product previews and waveform controls work with honest demo labels", async ({
  page,
}) => {
  await page.goto("/");
  const hero = page.locator(".flagship-hero");
  await hero
    .getByRole("button", { name: "AI & automation", exact: true })
    .click();
  await expect(hero.locator(".workspace-main")).toContainText(
    "Intelligent operations",
  );
  await hero
    .getByRole("button", { name: "Digital storefront", exact: true })
    .click();
  await expect(hero.locator(".mock-store")).toContainText("Concept product");
  await hero.getByRole("button", { name: "Play waveform animation" }).click();
  await expect(
    hero.getByRole("button", { name: "Pause waveform animation" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(hero).toContainText("Visual demonstration");
  await expect(page.locator(".service-card")).toHaveCount(10);
  await expect(page.locator(".service-card .service-illustration")).toHaveCount(
    10,
  );
});

test("flagship fits every requested viewport with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 375, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `viewport ${width}`,
    ).toBe(true);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page
        .locator(".flagship-copy h1")
        .evaluate((node) => getComputedStyle(node).animationName),
    ).toBe("none");
  }
});
