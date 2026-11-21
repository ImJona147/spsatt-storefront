"use server";

import type { PaginatedResponse } from "@spree/sdk";
import { getClient } from "@/lib/spree";

export interface StorefrontBanner {
  id: string;
  title: string;
  message: string | null;
  link_label: string | null;
  link_path: string | null;
  background_color: string;
  text_color: string;
  dismissible: boolean;
  updated_at: string;
}

export async function getCurrentBanner(): Promise<StorefrontBanner | null> {
  try {
    const response = await getClient().request<
      PaginatedResponse<StorefrontBanner>
    >("GET", "/storefront_banners", { params: { limit: 1 } });
    return response.data[0] ?? null;
  } catch {
    return null;
  }
}
