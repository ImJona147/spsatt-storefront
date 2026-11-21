"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { StorefrontBanner as Banner } from "@/lib/data/storefront-banners";

interface StorefrontBannerProps {
  banner: Banner;
  basePath: string;
  locale: string;
}

export function StorefrontBanner({
  banner,
  basePath,
  locale,
}: StorefrontBannerProps) {
  const [visible, setVisible] = useState(false);
  const storageKey = `storefront-banner:${banner.id}:${banner.updated_at}`;

  useEffect(() => {
    try {
      setVisible(
        !banner.dismissible || localStorage.getItem(storageKey) !== "dismissed",
      );
    } catch {
      setVisible(true);
    }
  }, [banner.dismissible, storageKey]);

  if (!visible) return null;

  const linkPath = banner.link_path?.startsWith("/")
    ? `${basePath}${banner.link_path}`
    : null;

  return (
    <aside
      aria-label={locale === "es" ? "Aviso de la tienda" : "Store announcement"}
      className="relative flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-10 py-2.5 text-center text-sm"
      style={{
        backgroundColor: banner.background_color,
        color: banner.text_color,
      }}
    >
      <span className="font-semibold">{banner.title}</span>
      {banner.message && <span>{banner.message}</span>}
      {linkPath && banner.link_label && (
        <Link
          href={linkPath}
          className="font-semibold underline underline-offset-2 hover:no-underline"
        >
          {banner.link_label}
        </Link>
      )}
      {banner.dismissible && (
        <button
          type="button"
          className="absolute inset-y-0 right-2 my-auto flex size-8 items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label={locale === "es" ? "Cerrar aviso" : "Dismiss announcement"}
          onClick={() => {
            setVisible(false);
            try {
              localStorage.setItem(storageKey, "dismissed");
            } catch {
              // Closing still works when storage is unavailable.
            }
          }}
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      )}
    </aside>
  );
}
