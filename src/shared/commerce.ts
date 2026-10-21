import { z } from "zod";

export const currencies = [
  "USD",
  "PKR",
  "EUR",
  "GBP",
  "AED",
  "SAR",
  "CAD",
  "AUD",
] as const;
export type Currency = (typeof currencies)[number];
export const currencySchema = z.enum(currencies);
export const packageSchema = z
  .object({
    service_id: z.string().min(1).max(100),
    category_id: z.string().min(1).max(100),
    name: z.enum(["Basic", "Standard", "Premium", "Custom"]),
    description: z.string().trim().min(20).max(2000),
    deliverables: z.string().trim().min(10).max(4000),
    timeline: z.string().trim().min(5).max(500),
    revisions: z.string().trim().min(5).max(1000),
    exclusions: z.string().trim().min(5).max(2000),
    pricing_type: z.enum(["fixed", "tiered", "custom"]),
    amount_minor: z.number().int().positive().max(100000000).nullable(),
    approved: z.boolean(),
    archived: z.boolean().default(false),
  })
  .refine((p) => p.pricing_type === "custom" || p.amount_minor !== null, {
    message: "Exact price required",
  });
export const checkoutSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.email().max(254),
    country: z.string().regex(/^[A-Z]{2}$/),
    requirements: z.string().trim().min(10).max(6000),
    display_currency: currencySchema,
    terms: z.literal(true),
    items: z
      .array(
        z.object({
          package_id: z.string().min(1).max(100),
          quantity: z.number().int().min(1).max(10),
        }),
      )
      .min(1)
      .max(20),
    turnstileToken: z.string().max(2048).default(""),
    website: z.string().max(200).default(""),
  })
  .refine(
    (d) => new Set(d.items.map((i) => i.package_id)).size === d.items.length,
    { message: "Duplicate package" },
  );
export type Package = z.infer<typeof packageSchema> & {
  id: string;
  title: string;
  slug: string;
  category: string;
  currency: "USD";
};
export type Rates = {
  rates: Partial<Record<Currency, string>>;
  fetched_at: number;
  stale: boolean;
  provider: string;
};

// All supported currencies use two minor-unit digits. Decimal rates are converted
// to integer ratios; prices never accumulate binary floating-point rounding.
export function convertMinor(amount: number, rate: string): number {
  if (
    !Number.isSafeInteger(amount) ||
    amount < 0 ||
    !/^\d{1,8}(\.\d{1,12})?$/.test(rate)
  )
    throw new Error("Invalid money");
  const [whole, fraction = ""] = rate.split(".");
  const denominator = 10n ** BigInt(fraction.length);
  const numerator = BigInt(whole + fraction);
  if (numerator <= 0n) throw new Error("Invalid rate");
  const converted =
    (BigInt(amount) * numerator + denominator / 2n) / denominator;
  if (converted > BigInt(Number.MAX_SAFE_INTEGER))
    throw new Error("Money overflow");
  return Number(converted);
}
export function money(amount: number, currency: Currency = "USD") {
  return new Intl.NumberFormat("en", { style: "currency", currency }).format(
    amount / 100,
  );
}
export const commercePages: Record<string, [string, string]> = {
  "/pricing": ["Service packages", "Clear scope. Considered investment."],
  "/cart": [
    "Your project, assembled.",
    "Review your selected digital services.",
  ],
  "/checkout": [
    "Guest checkout",
    "No account required. Test payments only; no funds are collected.",
  ],
  "/order-confirmation": [
    "Order status",
    "A return URL is not proof of payment. Status is read from the server.",
  ],
  "/how-it-works": [
    "From idea to delivery.",
    "A transparent digital services customer journey.",
  ],
  "/refund-policy": [
    "Refund & cancellation policy",
    "Draft — business and legal approval required before live sales.",
  ],
  "/terms-and-conditions": [
    "Terms & conditions",
    "Draft — business and legal approval required before live sales.",
  ],
  "/shipping-policy": [
    "Digital delivery policy",
    "Digital services, without physical shipping. Draft pending business approval.",
  ],
  "/payment-policy": [
    "Payments, transparently.",
    "RapidGateway is not active. No live card payments are accepted.",
  ],
};
