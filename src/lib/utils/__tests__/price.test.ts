import { describe, expect, it } from "vitest";
import { discountedUnitPrice, lineItemAmount } from "../price";

describe("lineItemAmount", () => {
  it("multiplies price by quantity, ignoring tax and discounts", () => {
    expect(lineItemAmount({ price: "19.99", quantity: 3 })).toBe("59.97");
  });

  it("keeps extra decimals for display rounding", () => {
    expect(lineItemAmount({ price: "19.9990", quantity: 3 })).toBe("59.9970");
  });

  it("is null when the price is hidden", () => {
    expect(lineItemAmount({ price: null, quantity: 2 })).toBeNull();
  });
});

describe("discountedUnitPrice", () => {
  it("uses the discount already calculated by Spree without applying another campaign", () => {
    expect(
      discountedUnitPrice({
        price: "800.00",
        quantity: 2,
        discounted_amount: "1360.00",
      }),
    ).toBe("680.0000");
  });
  it("keeps hidden and undiscounted amounts unchanged", () => {
    expect(
      discountedUnitPrice({
        price: null,
        quantity: 1,
        discounted_amount: null,
      }),
    ).toBeNull();
    expect(discountedUnitPrice({ price: "800.00", quantity: 1 })).toBe(
      "800.00",
    );
  });
});
