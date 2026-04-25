// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";

// Prevent "server-only" from throwing outside a server context
vi.mock("server-only", () => ({}));

// Mock next/headers so we can control cookie reads and writes
const mockCookieStore = {
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
};
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

// Import after mocks are registered (vi.mock is hoisted, but imports must follow)
import { createSession } from "@/lib/auth";

const COOKIE_NAME = "auth-token";

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── createSession ────────────────────────────────────────────────────────────

test("createSession sets an httpOnly cookie with a signed JWT", async () => {
  await createSession("user-1", "alice@example.com");

  expect(mockCookieStore.set).toHaveBeenCalledOnce();
  const [name, token, options] = mockCookieStore.set.mock.calls[0];

  expect(name).toBe(COOKIE_NAME);
  // Token must be a non-empty string (the signed JWT)
  expect(typeof token).toBe("string");
  expect(token.length).toBeGreaterThan(0);
  // Cookie options
  expect(options.httpOnly).toBe(true);
  expect(options.sameSite).toBe("lax");
  expect(options.path).toBe("/");
  expect(options.expires).toBeInstanceOf(Date);
  // Expiry should be ~7 days from now
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  expect(options.expires.getTime()).toBeGreaterThan(Date.now() + sevenDays - 5000);
});

