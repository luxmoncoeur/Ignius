import { describe, expect, it } from "vitest";
import { hashPassword, isLegacyPlaintext, verifyPassword } from "@/lib/passwords";

describe("passwords", () => {
  it("verifies a scrypt hash and rejects the wrong password", () => {
    const stored = hashPassword("correct horse");
    expect(stored.startsWith("scrypt$")).toBe(true);
    expect(verifyPassword("correct horse", stored)).toBe(true);
    expect(verifyPassword("wrong", stored)).toBe(false);
  });

  it("flags legacy plaintext passwords for rehashing", () => {
    expect(isLegacyPlaintext("hunter2")).toBe(true);
    expect(isLegacyPlaintext(hashPassword("x"))).toBe(false);
  });
});
