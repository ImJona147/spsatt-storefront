import { GeneralNotFound } from "@/components/not-found/GeneralNotFound";

/**
 * 404 del storefront: unmatched URLs (vía rewrite de middleware al sentinel
 * pagina-no-encontrada) y notFound() lanzado bajo (storefront) — siempre con
 * header y footer del layout.
 */
export default function NotFound() {
  return <GeneralNotFound />;
}
