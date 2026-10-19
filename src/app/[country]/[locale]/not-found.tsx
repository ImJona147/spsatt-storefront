import { GeneralNotFound } from "@/components/not-found/GeneralNotFound";

/**
 * 404 general del storefront localizado: unmatched URLs bajo /:country/:locale
 * y notFound() sin un boundary más cercano (policies, wholesale, etc.).
 * El contenido es client para resolver i18n y basePath sin params.
 */
export default function NotFound() {
  return <GeneralNotFound />;
}
