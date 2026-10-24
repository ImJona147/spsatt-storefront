import { type NextRequest, NextResponse } from "next/server";
import { resolveSupportedLocale, SUPPORTED_LOCALES } from "@/i18n/locales";
import { createSpreeMiddleware } from "@/lib/spree/middleware";
import { getDefaultCountry, getDefaultLocale } from "@/lib/store";

// Rutas reales bajo /{country}/{locale}. Cualquier otra raíz se reescribe al
// sentinel pagina-no-encontrada para que el 404 se resuelva con el chrome del
// storefront (ver (storefront)/not-found.tsx). Rutas nuevas → añadir aquí.
const STOREFRONT_ROUTES = new Set([
  "account",
  "c",
  "cart",
  "checkout",
  "confirm-payment",
  "order-placed",
  "pagina-no-encontrada",
  "policies",
  "portafolio",
  "products",
  "wholesale",
]);

const spreeMiddleware = createSpreeMiddleware({
  defaultCountry: getDefaultCountry(),
  defaultLocale: getDefaultLocale(),
  supportedLocales: SUPPORTED_LOCALES,
});

export const proxy = (request: NextRequest) => {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);

  // /es → /mx/es (deep link de locale sin país)
  if (segments.length === 1 && resolveSupportedLocale(segments[0])) {
    const url = request.nextUrl.clone();
    url.pathname = `/${getDefaultCountry()}/${segments[0]}`;
    return NextResponse.redirect(url);
  }

  // /{country}/{locale}/ruta-desconocida → 404 localizado con chrome
  if (segments.length >= 3) {
    const locale = resolveSupportedLocale(segments[1]);
    if (locale && !STOREFRONT_ROUTES.has(segments[2])) {
      const url = request.nextUrl.clone();
      url.pathname = `/${segments[0].toLowerCase()}/${locale}/pagina-no-encontrada`;
      return NextResponse.rewrite(url);
    }
  }

  return spreeMiddleware(request);
};

export const config = {
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico|.*\\..*$).*)"],
};
