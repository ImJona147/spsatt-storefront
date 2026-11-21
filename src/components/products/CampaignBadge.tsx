"use client";
import { useEffect, useState } from "react";
import {
  getCurrentBanners,
  type StorefrontBanner,
} from "@/lib/data/storefront-banners";

let pending: Promise<StorefrontBanner[]> | undefined;
export function CampaignBadge() {
  const [percent, setPercent] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    pending ??= getCurrentBanners();
    void pending.then((banners) => {
      if (alive)
        setPercent(
          Math.max(0, ...banners.map((b) => b.discount_percent ?? 0)) || null,
        );
    });
    return () => {
      alive = false;
    };
  }, []);
  return percent ? (
    <span className="absolute bottom-2 left-2 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background">
      −{percent}%
    </span>
  ) : null;
}
