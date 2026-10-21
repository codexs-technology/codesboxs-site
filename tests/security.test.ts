import { describe, expect, it } from "vitest";
import {
  equal,
  hashPassword,
  verifyPassword,
  isLocal,
} from "../src/worker/security";
import type { Env } from "../src/worker/types";

describe("password and environment boundaries", () => {
  it("uses standard versioned PBKDF2 and rejects incorrect passwords", async () => {
    const hash = await hashPassword("A-long-Test!Password2026");
    expect(hash.startsWith("pbkdf2-sha256-v2$")).toBe(true);
    expect(await verifyPassword("A-long-Test!Password2026", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  }, 60000);
  it("never permits local bypass for public or production hosts", () => {
    const env = { ENVIRONMENT: "development", LOCAL_TEST_MODE: "true" } as Env;
    expect(isLocal(env, "http://localhost:8787")).toBe(true);
    expect(isLocal(env, "https://public.example.com")).toBe(false);
    expect(
      isLocal({ ...env, ENVIRONMENT: "production" }, "http://localhost:8787"),
    ).toBe(false);
  });
  it("checks exact token equality", () => {
    expect(equal("abc", "abc")).toBe(true);
    expect(equal("abc", "abd")).toBe(false);
  });
});
