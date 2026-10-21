import { describe, expect, it } from "vitest";
import {
  bootstrapSchema,
  contactSchema,
  contentSchema,
  projectSchema,
} from "../src/shared/validation";
import { pages, services } from "../src/shared/content";

const lead = {
  name: "Jordan Example",
  email: "JORDAN@example.com",
  company: "Example Studio",
  service: "Web Development",
  timeline: "Within 1–3 months",
  description:
    "We need a customer portal with role-based access and a clear onboarding workflow.",
  consent: true,
};
describe("input validation", () => {
  it("normalizes valid contact information", () =>
    expect(contactSchema.parse(lead).email).toBe("jordan@example.com"));
  it("rejects missing consent, invalid email and short description", () => {
    for (const fields of [
      { consent: false },
      { email: "broken" },
      { description: "short" },
    ])
      expect(contactSchema.safeParse({ ...lead, ...fields }).success).toBe(
        false,
      );
  });
  it("requires at least one project service", () =>
    expect(projectSchema.safeParse({ ...lead, services: [] }).success).toBe(
      false,
    ));
  it("does not accept weak bootstrap passwords", () =>
    expect(
      bootstrapSchema.safeParse({ email: lead.email, password: "password" })
        .success,
    ).toBe(false));
  it("restricts content images and slugs", () =>
    expect(
      contentSchema.safeParse({
        title: "Example",
        slug: "../attack",
        summary: "A summary with enough information.",
        body: "A detailed paragraph describing the content in more than fifty characters.",
        image: "https://tracker.invalid/a.svg",
        status: "published",
      }).success,
    ).toBe(false));
});
describe("content inventory", () => {
  it("rejects nonexistent local content images", () => {
    expect(
      contentSchema.safeParse({
        title: "Valid title",
        slug: "valid-slug",
        summary: "A sufficiently useful summary of this content.",
        body: "An original sufficiently long body for a local content validation test.",
        status: "draft",
        image: "/images/nonexistent.svg",
      }).success,
    ).toBe(false);
  });
  it("preserves all existing services and adds branding with unique detail pages", () => {
    expect(services).toHaveLength(14);
    expect(new Set(services.map((s) => s.slug)).size).toBe(14);
    expect(
      services.find((s) => s.slug === "branding-design")?.deliverables.length,
    ).toBeGreaterThan(0);
  });
  it("has all main route metadata", () => {
    for (const path of [
      "/about",
      "/services",
      "/contact",
      "/careers",
      "/blog",
      "/portfolio",
      "/start-project",
      "/privacy-policy",
    ])
      expect(pages[path]?.[1].length).toBeGreaterThan(30);
  });
});
