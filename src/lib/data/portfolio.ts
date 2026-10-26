"use server";

import type { PaginatedResponse } from "@spree/sdk";
import { cacheLife, cacheTag } from "next/cache";
import type { PortfolioCategoryApi } from "@/lib/portfolio";
import { getClient } from "@/lib/spree";

async function cachedListPortfolioCategories(): Promise<
  PortfolioCategoryApi[]
> {
  "use cache: remote";
  cacheLife("hours");
  cacheTag("portfolio-categories");
  const response = await getClient().request<
    PaginatedResponse<PortfolioCategoryApi>
  >("GET", "/portfolio_categories", {
    params: { sort: "position", limit: 100 },
  });
  return response.data;
}

// Failures are never cached: pages fall back to the static list in
// @/lib/portfolio instead of breaking.
export async function getPortfolioCategories(): Promise<
  PortfolioCategoryApi[]
> {
  try {
    return await cachedListPortfolioCategories();
  } catch {
    return [];
  }
}
