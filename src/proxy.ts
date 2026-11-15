import { type NextRequest, NextResponse } from "next/server";
import { resolveSupportedLocale, SUPPORTED_LOCALES } from "@/i18n/locales";
import { REQUEST_PATHNAME_HEADER, REQUEST_SEARCH_HEADER } from "@/i18n/routing";
import { createSpreeMiddleware } from "@/lib/spree/middleware";
import { isMissingStorefrontResource } from "@/lib/spree/missing-resource";
import { getDefaultCountry, getDefaultLocale } from "@/lib/store";

/**
 * Camino que no casa con ninguna ruta, para que Next responda con
 * app/global-not-found.tsx y un 404 real. Reescribir a una ruta que sí existe
 * devuelve 200: el notFound() de una página bajo el layout que hace streaming
 * ya no puede cambiar el status, y Google lo lee como soft 404.
 */
const NOT_FOUND_REWRITE_PATH = "/_storefront-not-found";

const STOREFRONT_PATH = /^\/([^/]+)\/([^/]+)(\/.+)$/;

/**
 * Marca una URL que el proxy respondió con la página de 404, acotada a esa
 * ruta. Los proveedores de carrito y sesión de la página de 404 ejecutan
 * Server Actions sobre esa misma URL; sin la marca, la ruta real del registro
 * respondería con otro árbol de páginas y el navegador recargaría la de 404
 * otra vez, en bucle.
 */
const MISSING_PAGE_COOKIE = "spree_missing_page";

const spreeMiddleware = createSpreeMiddleware({
  defaultCountry: getDefaultCountry(),
  defaultLocale: getDefaultLocale(),
  supportedLocales: SUPPORTED_LOCALES,
});

/**
 * Los status solo importan en cargas completas de página. Next quita sus
 * headers de router antes de que corra el proxy, así que en-app navigations,
 * prefetches y Server Actions se distinguen por el Sec-Fetch-Dest del
 * navegador. Los rastreadores que no lo mandan se tratan como carga de
 * página.
 */
function isPageLoad(request: NextRequest): boolean {
  const destination = request.headers.get("sec-fetch-dest");
  return (
    (request.method === "GET" || request.method === "HEAD") &&
    (!destination || destination === "document")
  );
}

function rewriteToNotFound(request: NextRequest): NextResponse {
  // La URL original viaja en el header para que la página de 404 renderice en
  // el país y el idioma del visitante.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_PATHNAME_HEADER, request.nextUrl.pathname);
  requestHeaders.set(REQUEST_SEARCH_HEADER, request.nextUrl.search);
  return NextResponse.rewrite(new URL(NOT_FOUND_REWRITE_PATH, request.url), {
    request: { headers: requestHeaders },
  });
}

export const proxy = async (request: NextRequest): Promise<NextResponse> => {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);

  // /es → /mx/es (deep link de locale sin país)
  if (segments.length === 1 && resolveSupportedLocale(segments[0])) {
    const url = request.nextUrl.clone();
    url.pathname = `/${getDefaultCountry()}/${segments[0]}`;
    return NextResponse.redirect(url);
  }

  // /mx → /mx/es. Un código de país suelto no es una ruta del storefront, y
  // el middleware de abajo lo trataría como camino cualquiera y lo prefijaría
  // otra vez: /mx acabaría en /mx/es/mx, una URL inexistente.
  if (segments.length === 1 && /^[a-z]{2}$/i.test(segments[0])) {
    const url = request.nextUrl.clone();
    url.pathname = `/${getDefaultCountry()}/${getDefaultLocale()}`;
    return NextResponse.redirect(url);
  }

  const response = spreeMiddleware(request);
  // Redirecciones ya decididas; solo los passthrough son /{country}/{locale}/…
  if (response.status !== 200) return response;

  const match = request.nextUrl.pathname.match(STOREFRONT_PATH);
  if (!match) return response;

  const [, country, locale, path] = match;
  if (!resolveSupportedLocale(locale)) return response;

  const markedMissing = request.cookies.has(MISSING_PAGE_COOKIE);
  if (!isPageLoad(request)) {
    return markedMissing ? rewriteToNotFound(request) : response;
  }

  // Un registro ausente se decide aquí, antes de renderizar: dentro del layout
  // que hace streaming el notFound() de la página llega tarde y responde 200.
  // Solo un 404 del Store API cuenta como ausente; timeouts y caídas dejan la
  // decisión en la página.
  if (await isMissingStorefrontResource(path, { country, locale })) {
    const notFound = rewriteToNotFound(request);
    // Conserva los cookies de país e idioma que el middleware fijó para esta
    // URL, que los de carrito y sesión de la página de 404 leen.
    for (const cookie of response.cookies.getAll()) {
      notFound.cookies.set(cookie);
    }
    notFound.cookies.set(MISSING_PAGE_COOKIE, "1", {
      path: request.nextUrl.pathname,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60,
    });
    return notFound;
  }

  // El registro ya existe de nuevo (o nunca faltó): esta URL deja de mandar
  // sus acciones a la página de 404.
  if (markedMissing) {
    response.cookies.set(MISSING_PAGE_COOKIE, "", {
      path: request.nextUrl.pathname,
      maxAge: 0,
    });
  }

  return response;
};

export const config = {
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico|.*\\..*$).*)"],
};
