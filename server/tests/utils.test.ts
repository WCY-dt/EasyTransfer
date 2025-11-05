import { describe, it, expect } from "vitest";
import { generateId, hasConfusingCharacters } from "../src/utils.js";
import type { Socket } from "socket.io";

describe("hasConfusingCharacters", () => {
  it("should return true for IDs containing 0", () => {
    expect(hasConfusingCharacters("A0BC")).toBe(true);
  });

  it("should return true for IDs containing 1", () => {
    expect(hasConfusingCharacters("A1BC")).toBe(true);
  });

  it("should return true for IDs containing O", () => {
    expect(hasConfusingCharacters("AOBC")).toBe(true);
  });

  it("should return true for IDs containing I", () => {
    expect(hasConfusingCharacters("AIBC")).toBe(true);
  });

  it("should return true for IDs containing L", () => {
    expect(hasConfusingCharacters("ALBC")).toBe(true);
  });

  it("should return false for IDs without confusing characters", () => {
    expect(hasConfusingCharacters("ABCD")).toBe(false);
    expect(hasConfusingCharacters("WXYZ")).toBe(false);
    expect(hasConfusingCharacters("2345")).toBe(false);
  });
});

describe("generateId", () => {
  it("should generate a 4-character ID", () => {
    const id = generateId();
    expect(id).toHaveLength(4);
  });

  it("should generate an uppercase ID", () => {
    const id = generateId();
    expect(id).toBe(id.toUpperCase());
  });

  it("should not contain confusing characters", () => {
    // Test multiple times to ensure consistency
    for (let i = 0; i < 100; i++) {
      const id = generateId();
      expect(hasConfusingCharacters(id)).toBe(false);
    }
  });

  it("should not generate duplicate IDs when clients exist", () => {
    const mockClients = {
      ABCD: {} as Socket,
      EFGH: {} as Socket,
      WXYZ: {} as Socket,
    };

    // Generate multiple IDs and ensure none match existing ones
    for (let i = 0; i < 20; i++) {
      const id = generateId(mockClients);
      expect(Object.keys(mockClients)).not.toContain(id);
    }
  });

  it("should generate different IDs on subsequent calls", () => {
    const ids = new Set();
    for (let i = 0; i < 50; i++) {
      ids.add(generateId());
    }
    // With 50 calls and a large ID space (32^4 = 1,048,576), collisions should be extremely rare
    expect(ids.size).toBeGreaterThanOrEqual(49);
  });

  it("should handle empty clients object", () => {
    const id = generateId({});
    expect(id).toHaveLength(4);
    expect(hasConfusingCharacters(id)).toBe(false);
  });

  it("should only use alphanumeric characters", () => {
    for (let i = 0; i < 50; i++) {
      const id = generateId();
      expect(id).toMatch(/^[A-Z2-9]+$/);
    }
  });
});
