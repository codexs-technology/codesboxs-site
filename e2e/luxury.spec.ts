import { test, expect } from "@playwright/test";

test("luxury compositions, capabilities and self-hosted fonts", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Digital Ideas.");
  await expect(page.locator("h1")).toContainText("Extraordinary");
  await expect(page.locator("h1")).toContainText("Results.");
  await expect(page.locator(".cinematic-hero")).toHaveCount(1);
  await expect(page.locator(".ivory")).toHaveCount(4);
  await page.getByRole("button", { name: /Applied intelligence/ }).click();
  await expect(page.locator(".capability-copy")).toContainText("human review");
  expect(
    await page.evaluate(() => getComputedStyle(document.body).backgroundColor),
  ).toBe("rgb(16, 16, 15)");
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() => document.fonts.check('16px "Space Grotesk"')),
  ).toBe(true);
  for (const width of [320, 375, 768, 1440, 2560]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
