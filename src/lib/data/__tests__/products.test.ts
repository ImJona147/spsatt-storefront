import { SpreeError } from "@spree/sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGet = vi.fn();

vi.mock("@/lib/spree", () => ({
  getClientForSurface: () => ({ products: { get: mockGet } }),
  cacheTagSuffix: () => "",
  DEFAULT_SURFACE: "dtc",
  getAccessToken: vi.fn().mockResolvedValue(undefined),
  getLocaleOptions: vi.fn().mockResolvedValue({ locale: "es", country: "mx" }),
}));

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

import { cachedGetProduct } from "../products";

function notFoundError() {
  return new SpreeError(
    { error: { code: "not_found", message: "Resource not found" } },
    404,
  );
}

function serverError() {
  return new SpreeError(
    { error: { code: "server_error", message: "Internal server error" } },
    500,
  );
}

describe("cachedGetProduct transient 404 retry", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it("recovers when a transient 404 is followed by a success", async () => {
    const product = { id: "product-1", slug: "reconocimiento-1" };
    mockGet
      .mockRejectedValueOnce(notFoundError())
      .mockResolvedValueOnce(product);

    const result = await cachedGetProduct(
      "reconocimiento-1",
      [],
      {
        locale: "es",
        country: "mx",
      },
      "dtc",
    );

    expect(result).toEqual(product);
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it("throws after exhausting retries when the 404 persists", async () => {
    mockGet.mockRejectedValue(notFoundError());

    await expect(
      cachedGetProduct(
        "missing-product",
        [],
        { locale: "es", country: "mx" },
        "dtc",
      ),
    ).rejects.toMatchObject({ status: 404 });
    expect(mockGet).toHaveBeenCalledTimes(3);
  });

  it("does not retry non-404 errors", async () => {
    mockGet.mockRejectedValue(serverError());

    await expect(
      cachedGetProduct(
        "reconocimiento-1",
        [],
        { locale: "es", country: "mx" },
        "dtc",
      ),
    ).rejects.toMatchObject({ status: 500 });
    expect(mockGet).toHaveBeenCalledTimes(1);
  });
});
