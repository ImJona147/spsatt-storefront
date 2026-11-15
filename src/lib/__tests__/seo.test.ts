import type { Product } from "@spree/sdk";
import { afterEach, describe, expect, it, vi } from "vitest";
import { brandedTitle } from "@/lib/metadata/title";
import { validGtin } from "@/lib/product-identifiers";
import { buildProductJsonLd } from "@/lib/seo";

const product = {
  name: "Agenda azul",
  description: "<p>Agenda de espiral</p>",
  price: { amount: "500.00", currency: "MXN" },
  in_stock: true,
  purchasable: true,
  custom_fields: [],
} as unknown as Product;

afterEach(() => vi.unstubAllEnvs());

describe("product SEO", () => {
  it("uses the actual brand and validated stored identifiers", () => {
    const result = buildProductJsonLd(
      {
        ...product,
        custom_fields: [
          { key: "marca", label: "Marca", value: "Zegno" },
          { key: "ean", label: "EAN", value: "4006381333931" },
          { key: "mpn", label: "MPN", value: "AGENDA-27" },
        ],
      } as Product,
      "https://example.com/agenda",
    );
    expect(result.brand).toEqual({ "@type": "Brand", name: "Zegno" });
    expect(result.gtin13).toBe("4006381333931");
    expect(result.mpn).toBe("AGENDA-27");
  });

  it("does not invent identifiers, reviews or commercial terms", () => {
    const result = buildProductJsonLd(product, "https://example.com/agenda");
    expect(result).not.toHaveProperty("gtin13");
    expect(result).not.toHaveProperty("aggregateRating");
    expect(result).not.toHaveProperty("review");
    expect(result.offers).not.toHaveProperty("shippingDetails");
    expect(result.offers).not.toHaveProperty("hasMerchantReturnPolicy");
  });

  it("rejects invalid GTIN lengths and check digits", () => {
    expect(validGtin("4006381333932")).toBe(false);
    expect(validGtin("REC-MDF-01")).toBe(false);
  });

  it("keeps the store suffix exactly once", () => {
    vi.stubEnv("NEXT_PUBLIC_STORE_NAME", "SPSATT");
    expect(brandedTitle("Reconocimiento | Spsatt | SPSATT")).toBe(
      "Reconocimiento | SPSATT",
    );
    expect(brandedTitle("Agenda azul")).toBe("Agenda azul | SPSATT");
  });
});
