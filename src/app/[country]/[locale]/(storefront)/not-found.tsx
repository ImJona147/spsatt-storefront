import { GeneralNotFound } from "@/components/not-found/GeneralNotFound";

/**
 * 404 del storefront: URLs unmatched que Next responde con global-not-found y
 * notFound() lanzado bajo (storefront) — siempre con header y footer del
 * layout.
 */
export default function NotFound() {
  return <GeneralNotFound />;
}
