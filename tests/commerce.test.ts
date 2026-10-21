import { describe, it, expect } from "vitest";
import {
  convertMinor,
  checkoutSchema,
  packageSchema,
  currencies,
} from "../src/shared/commerce";
describe("commerce trust boundaries", () => {
  it("converts decimal rates with integer half-up rounding", () => {
    expect(convertMinor(100, "278.1234")).toBe(27812);
    expect(convertMinor(1, "1.5")).toBe(2);
    expect(convertMinor(0, "1")).toBe(0);
  });
  it("rejects unsafe money and invalid rates", () => {
    for (const amount of [-1, 1.5, NaN, Number.MAX_SAFE_INTEGER + 1])
      expect(() => convertMinor(amount, "1")).toThrow();
    for (const rate of ["0", "-1", "NaN", "1e4"])
      expect(() => convertMinor(100, rate)).toThrow();
  });
  it("supports all eight requested display currencies", () =>
    expect(currencies).toHaveLength(8));
  it("does not accept duplicate package lines or missing terms", () => {
    const d = {
      name: "Test Buyer",
      email: "buyer@example.com",
      country: "PK",
      requirements: "Test requirements",
      display_currency: "USD",
      terms: true,
      items: [{ package_id: "test", quantity: 1 }],
    };
    expect(checkoutSchema.safeParse(d).success).toBe(true);
    expect(checkoutSchema.safeParse({ ...d, terms: false }).success).toBe(
      false,
    );
    expect(
      checkoutSchema.safeParse({ ...d, items: [...d.items, ...d.items] })
        .success,
    ).toBe(false);
  });
  it("requires approved-scope fields and an exact fixed price", () => {
    expect(
      packageSchema.safeParse({
        name: "Basic",
        pricing_type: "fixed",
        amount_minor: null,
      }).success,
    ).toBe(false);
  });
});
