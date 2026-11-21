"use server";

import type { PaginatedResponse } from "@spree/sdk";
import { getClient } from "@/lib/spree";

export interface StorefrontBanner {
  id: string;
  sticky: boolean;
  autoplay: boolean;
  discount_percent: number | null;
  secondary_label: string | null;
  secondary_path: string | null;
  title: string;
  message: string | null;
  link_label: string | null;
  link_path: string | null;
  background_color: string;
  text_color: string;
  dismissible: boolean;
  updated_at: string;
}

export async function getCurrentBanners(): Promise<StorefrontBanner[]> {
  try {
    const response = await getClient().request<
      PaginatedResponse<StorefrontBanner>
    >("GET", "/storefront_banners", { params: { limit: 100 } });
    return response.data;
  } catch {
    return [];
  }
}
