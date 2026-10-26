"use server";

import { cacheLife, cacheTag } from "next/cache";
import { getClient } from "@/lib/spree";

export interface MaintenanceStatus {
  active: boolean;
  title: string;
  message: string;
  /** Scheduled end (ISO) from the dashboard — null means no countdown. */
  endsAt: string | null;
}

interface MaintenanceSettingsPayload {
  maintenance: {
    active: boolean;
    title: string;
    message: string;
    ends_at?: string | null;
  };
}

// Seconds before the storefront re-reads the dashboard switch. 15 keeps a
// flip visible within seconds without a settings call on every request;
// e2e shortens it through MAINTENANCE_TTL_SECONDS.
const MAINTENANCE_TTL = Math.max(
  1,
  Number(process.env.MAINTENANCE_TTL_SECONDS ?? "15") || 15,
);

async function cachedGetSettings(): Promise<MaintenanceSettingsPayload> {
  "use cache: remote";
  cacheLife({
    stale: 0,
    revalidate: MAINTENANCE_TTL,
    expire: MAINTENANCE_TTL * 60,
  });
  cacheTag("storefront-settings");
  return getClient().request("GET", "/storefront_settings");
}

/**
 * The dashboard's maintenance switch, or null when it cannot be read: a
 * settings outage must not take the storefront down by itself.
 */
export async function getMaintenanceStatus(): Promise<MaintenanceStatus | null> {
  try {
    const settings = await cachedGetSettings();
    const maintenance = settings.maintenance;
    if (!maintenance) return null;
    return {
      active: maintenance.active,
      title: maintenance.title,
      message: maintenance.message,
      endsAt: maintenance.ends_at ?? null,
    };
  } catch {
    return null;
  }
}
