import type { Price, Product } from "@spree/sdk";
import { describe, expect, it } from "vitest";
import {
  campaignPrice,
  hasCatalogSale,
  withCampaignPrice,
} from "./campaign-price";

const price = { amount: "800.00", currency: "MXN" } as Price;
describe("campaign prices", () => {
  it("shows the 15 percent discount before checkout without mutating the catalog price", () => {
    expect(campaignPrice(price, 15)?.amount).toBe("680.00");
    expect(price.amount).toBe("800.00");
    expect(campaignPrice({ ...price, amount: "10.70" }, 15)?.amount).toBe(
      "9.10",
    );
  });
  it("keeps hidden prices hidden and rejects invalid discounts", () => {
    expect(campaignPrice(null, 15)).toBeNull();
    expect(campaignPrice(price, 101)).toBe(price);
    expect(campaignPrice(price, Number.NaN)).toBe(price);
  });
});

it("does not turn a general promotion into a catalog Oferta", () => {
  const product = { price, original_price: null } as Product;
  const discounted = withCampaignPrice(product, 15);
  expect(discounted.price.amount).toBe("680.00");
  expect(hasCatalogSale(discounted)).toBe(false);
  expect(
    hasCatalogSale(
      withCampaignPrice(
        { ...product, price: { ...price, compare_at_amount: "900.00" } },
        15,
      ),
    ),
  ).toBe(true);
});
