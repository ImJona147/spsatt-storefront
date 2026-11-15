import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDefaultCountry, getDefaultLocale } from "@/lib/store";

const isMissingStorefrontResource = vi.hoisted(() => vi.fn());

vi.mock("@/lib/spree/missing-resource", () => ({
  isMissingStorefrontResource,
}));

const { proxy } = await import("@/proxy");

function request(
  path: string,
  init?: ConstructorParameters<typeof NextRequest>[1],
): NextRequest {
  return new NextRequest(`https://store.example${path}`, init);
}

function root(): string {
  return `https://store.example/${getDefaultCountry()}/${getDefaultLocale()}`;
}

describe("storefront proxy", () => {
  beforeEach(() => {
    isMissingStorefrontResource.mockReset();
    isMissingStorefrontResource.mockResolvedValue(false);
  });

  it("redirects a bare locale to the default country", async () => {
    const response = await proxy(request("/es"));

    expect(response.headers.get("location")).toBe(
      `https://store.example/${getDefaultCountry()}/es`,
    );
  });

  it("redirects a bare country code instead of treating it as a path", async () => {
    const response = await proxy(request("/mx"));

    expect(response.headers.get("location")).toBe(root());
  });

  it("keeps pass-through requests on the real route", async () => {
    const response = await proxy(request("/mx/es/products"));

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(isMissingStorefrontResource).toHaveBeenCalledWith("/products", {
      country: "mx",
      locale: "es",
    });
  });

  it("rewrites to the global 404 when the record is missing", async () => {
    isMissingStorefrontResource.mockResolvedValue(true);

    const response = await proxy(request("/mx/es/products/sin-existe"));

    expect(response.headers.get("x-middleware-rewrite")).toContain(
      "/_storefront-not-found",
    );
    expect(
      response.headers.get("x-middleware-request-x-spree-request-pathname"),
    ).toBe("/mx/es/products/sin-existe");
    expect(response.cookies.get("spree_country")?.value).toBe("mx");
    expect(response.cookies.get("spree_locale")?.value).toBe("es");
    expect(response.cookies.get("spree_missing_page")?.value).toBe("1");
  });

  it("leaves the existence check to the page for in-app requests", async () => {
    const response = await proxy(
      request("/mx/es/products/sin-existe", {
        headers: { "sec-fetch-dest": "empty" },
      }),
    );

    expect(isMissingStorefrontResource).not.toHaveBeenCalled();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("skips the existence check when the Store API cannot answer", async () => {
    const response = await proxy(request("/mx/es/products/sin-existe"));

    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
