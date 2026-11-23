import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@stripe/stripe-js", () => ({
  loadStripe: vi.fn().mockResolvedValue(null),
}));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("Stripe mode shown at checkout", () => {
  it("hides test card instructions for live keys", async () => {
    vi.stubEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "pk_live_example");
    const config = await import("./stripe");
    expect(config.isStripeTestMode).toBe(false);
    expect(config.isStripeConfigured).toBe(true);
  });
  it("shows test card instructions only for test keys", async () => {
    vi.stubEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "pk_test_example");
    expect((await import("./stripe")).isStripeTestMode).toBe(true);
  });
  it("does not advertise test payments when no key is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "");
    const config = await import("./stripe");
    expect(config.isStripeTestMode).toBe(false);
    expect(config.isStripeConfigured).toBe(false);
  });
});
