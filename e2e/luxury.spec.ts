import { test, expect } from "@playwright/test";

test("luxury compositions, capabilities and self-hosted fonts", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText(
    "We Build Digital Experiences That",
  );
  await expect(page.locator("h1")).toContainText("Move Businesses Forward.");
  await expect(page.locator(".flagship-hero")).toHaveCount(1);
  await expect(page.locator(".ivory")).toHaveCount(3);
  await page.getByRole("button", { name: /Applied intelligence/ }).click();
  await expect(page.locator(".capability-copy")).toContainText("human review");
  expect(
    await page.evaluate(() => getComputedStyle(document.body).backgroundColor),
  ).toBe("rgb(17, 17, 16)");
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
