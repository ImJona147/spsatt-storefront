"use server";

import type { PaginatedResponse } from "@spree/sdk";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { cache } from "react";
import type { PortfolioCategoryApi } from "@/lib/portfolio";
import { getClient } from "@/lib/spree";

async function cachedPortfolioCategories(): Promise<PortfolioCategoryApi[]> {
  "use cache";
  cacheLife({ stale: 0, revalidate: 60, expire: 120 });
  cacheTag("portfolio-categories");
  const response = await getClient().request<
    PaginatedResponse<PortfolioCategoryApi>
  >("GET", "/portfolio_categories", {
    params: { sort: "position", limit: 100 },
  });
  return response.data;
}

const listPortfolioCategories = cache(async () => {
  await connection();
  return cachedPortfolioCategories();
});

export async function getPortfolioCategories(): Promise<
  PortfolioCategoryApi[]
> {
  try {
    return await listPortfolioCategories();
  } catch {
    return [];
  }
}
