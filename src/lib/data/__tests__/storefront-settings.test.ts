import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRequest = vi.fn();

vi.mock("@/lib/spree", () => ({
  getClient: () => ({ request: mockRequest }),
}));
vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

import { getMaintenanceStatus } from "../storefront-settings";

describe("getMaintenanceStatus", () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it("returns the switch as the store reports it", async () => {
    mockRequest.mockResolvedValue({
      maintenance: {
        active: true,
        title: "Volvemos pronto",
        message: "Mantenimiento en curso.",
        ends_at: null,
      },
    });

    await expect(getMaintenanceStatus()).resolves.toEqual({
      active: true,
      title: "Volvemos pronto",
      message: "Mantenimiento en curso.",
      endsAt: null,
    });
    expect(mockRequest).toHaveBeenCalledWith("GET", "/storefront_settings");
  });

  it("maps the scheduled end to endsAt for the countdown", async () => {
    mockRequest.mockResolvedValue({
      maintenance: {
        active: true,
        title: "",
        message: "",
        ends_at: "2026-10-26T18:00:00Z",
      },
    });

    await expect(getMaintenanceStatus()).resolves.toMatchObject({
      endsAt: "2026-10-26T18:00:00Z",
    });
  });

  it("fails open when the settings call errors", async () => {
    mockRequest.mockRejectedValue(new Error("backend down"));

    await expect(getMaintenanceStatus()).resolves.toBeNull();
  });

  it("treats a missing maintenance block as off", async () => {
    mockRequest.mockResolvedValue({});

    await expect(getMaintenanceStatus()).resolves.toBeNull();
  });
});
