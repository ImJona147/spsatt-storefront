"use client";

import { useEffect } from "react";

/**
 * Maintenance tab title. Next also emits `<title>` elements for the matched
 * child segments (their generateMetadata runs even though the layout
 * short-circuits), and their order in <head> isn't guaranteed — so the
 * maintenance value is enforced on the document once hydrated. The SSR'd
 * `<title>` still covers the no-JS case.
 */
export function MaintenanceTitle({ value }: { value: string }) {
  useEffect(() => {
    document.title = value;
  }, [value]);

  return <title>{value}</title>;
}
