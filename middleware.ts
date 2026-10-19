import { type NextRequest, NextResponse } from "next/server";
import { resolveSupportedLocale } from "@/i18n/locales";

/**
 * Primeros segmentos reales bajo /:country/:locale. Lo que no esté aquí ni
 * sea un asset/archivo se reescribe al sentinel pagina-no-encontrada para
 * que el 404 se resuelva con el chrome del storefront (ver (storefront)/
 * not-found.tsx). Rutas nuevas de storefront → añadir a este Set.
 */
const STOREFRONT_ROUTES = new Set([
  "account",
  "c",
  "cart",
  "checkout",
  "confirm-payment",
  "order-placed",
  "pagina-no-encontrada",
  "policies",
  "products",
  "wholesale",
]);

const DEFAULT_COUNTRY = (
  process.env.NEXT_PUBLIC_DEFAULT_COUNTRY || "us"
).toLowerCase();
const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en";

function sentinelUrl(
  request: NextRequest,
  country: string,
  locale: string,
): URL {
  const url = request.nextUrl.clone();
  url.pathname = `/${country}/${locale}/pagina-no-encontrada`;
  return url;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    // Raíz del dominio → mercado por defecto (antes lo hacía un page raíz
    // que ya no existe en el árbol de rutas).
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_COUNTRY}/${DEFAULT_LOCALE}`;
    return NextResponse.redirect(url);
  }

  const first = segments[0];
  // Rutas internas de Next, APIs y archivos estáticos (favicon, robots, SVG…).
  if (first.startsWith("_") || first === "api" || first === "dev") {
    return NextResponse.next();
  }
  if (segments[segments.length - 1].includes(".")) {
    return NextResponse.next();
  }

  const locale =
    segments.length >= 2 ? resolveSupportedLocale(segments[1]) : undefined;

  if (locale) {
    const rest = segments.slice(2);
    if (rest.length === 0 || STOREFRONT_ROUTES.has(rest[0])) {
      return NextResponse.next();
    }
    return NextResponse.rewrite(sentinelUrl(request, segments[0], locale));
  }

  // Sin locale válido: deep link de una ruta conocida → mercado por defecto.
  if (STOREFRONT_ROUTES.has(segments[0])) {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_COUNTRY}/${DEFAULT_LOCALE}/${segments.join("/")}`;
    return NextResponse.redirect(url);
  }

  // /es → /mx/es (raíz de locale sin país).
  if (segments.length === 1 && resolveSupportedLocale(segments[0])) {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_COUNTRY}/${segments[0]}`;
    return NextResponse.redirect(url);
  }

  // URL totalmente desconocida → 404 localizado con chrome.
  return NextResponse.rewrite(
    sentinelUrl(
      request,
      DEFAULT_COUNTRY,
      resolveSupportedLocale(DEFAULT_LOCALE) ?? DEFAULT_LOCALE,
    ),
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
