# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Negocios mexicanos: empresas que compran productos de decoración y publicidad (reconocimientos, letreros, piezas personalizadas) para su negocio. La tienda es Spanish-first (`/mx/es/` por defecto); el portal mayorista (B2B) existe en el código pero está desactivado en este despliegue.

## Product Purpose

SPSATT es un negocio mexicano que elabora todo tipo de producto con decoración y publicidad, vendiéndolo en línea a través de esta storefront. El éxito es que un negocio mexicano pueda configurar, cotizar y comprar piezas personalizadas y recibir el pedido, con la tienda sirviendo como escaparate y canal de venta del catálogo alojado en Spree.

## Positioning

Fabricación propia con amplia cobertura de materiales y tecnología: reconocimientos en acrílico y otros materiales, letreros LED neón, muebles, y trabajos en CNC, MDF y triplay, un solo proveedor para decoración y publicidad hecha a medida, no un revendedor de catálogo genérico.

## Operating Context

- Mercado/región: México (`NEXT_PUBLIC_DEFAULT_COUNTRY=mx`), sitio `https://spsatt.com.mx`.
- Local físico y contacto (dato real de la portada de Facebook del negocio): Independencia Ote. 246, Belen Grande, 95700 San Andrés Tuxla, Veracruz. Teléfono/canal de cotización (confirmado: es el canal de cotizaciones, confirmar si es WhatsApp en implementación): 294 942 3064. Horario: lunes a viernes 9 a.m.–2 p.m. y 4–8 p.m.; sábado 9 a.m.–5 p.m.; domingo cerrado.
- Backend/headless: Spree Commerce API en `https://dash.spsatt.com.mx` (`@spree/sdk`); catálogo, categorías, políticas y stock viven allí, no en este repo.
- Moneda: resuelta por país desde la API de Spree Markets (`resolveCurrency`); fallback del cliente `USD`.
- Idiomas: 5 paquetes i18n (`es`, `en`, `de`, `fr`, `pl`); el runtime usa `es` por defecto (`NEXT_PUBLIC_DEFAULT_LOCALE=es`). La comunicación con el cliente del proyecto es siempre en español.
- Correos transaccionales vía Resend, activados por webhooks de Spree; desde `SPSATT <pedidos@spsatt.com.mx>`, soporte `contacto@spsatt.com.mx`.
- Pagos: Stripe configurado (test); Adyen y PayPal en código pero sin claves.
- Despliegue: Docker multi-stage (Node 22, standalone, puerto 3001) y/o Vercel; CI en GitHub Actions (lint, typecheck, unit, E2E con backend Spree en Docker).

## Capabilities and Constraints

- Rutas storefront: home, productos (`/products`, `/products/[slug]`), categoría (`/c/[...permalink]`), carrito, cuenta (login/registro/perfil/direcciones/pedidos), políticas (`/policies/[slug]`).
- Checkout de una página (invitado o autenticado), múltiples envíos, cupones/tarjetas de regalo, express checkout con Stripe.
- Búsqueda con sugerencias, filtros y orden en la URL.
- Portal mayorista completo en desactivado (`SPREE_WHOLESALE_CHANNEL` comentado en `.env`); decisión pendiente si se reactiva.
- Sin CMS: contenido desde Spree + JSON de i18n.
- Restricción técnica: TypeScript estricto, Biome (no ESLint), Server Actions para mutaciones, App Router con `cacheComponents`.
- Deuda conocida a preservar en futuro trabajo: la home y el footer aún muestran copy demo del starter de Spree ("Demo-only: Remove for production"), el header usa `spree.png`, y existe un ancla muerta `#contact` en el menú móvil.
- Estado de integración de marca: el logo ya está en `public/spsatt.svg`, pero `STORE_LOGO_URL` sigue vacío y el código aún no lo usa.
- Decisión pendiente (no inventar): canal mayorista activo o no; canal GTM (`GTM_ID` vacío); Sentry (DSN vacío).

## Brand Commitments

- Nombre: **SPSATT** (mayúsculas, `NEXT_PUBLIC_STORE_NAME=SPSATT`).
- Eslogan/descripción: "Soluciones publicitarias para tu negocio" (`NEXT_PUBLIC_STORE_DESCRIPTION`); segundo eslogan confirmado del material de marca: "Donde las ideas se hacen realidad" (titular de la portada de Facebook).
- El tema shadcn de `IMPORTANTE.MD` es el sistema de diseño canónico: `--primary`/`--ring` en los valores oklch del archivo, sin overrides. La azul de portada `#36488F`/`#303f7e` queda como referencia histórica del mismo azul.
- El acento dorado (`#FFF0B8` a `#E9C35A` a `#B8861F`) se revocó para UI (decisión del usuario 2026-10-17): no hay botones, acentos ni ornamentos dorados; el oro vive solo en el logotipo/portada. El logo `public/spsatt.svg` usa `#3b3c97` + blanco (variante propia; reconciliar en diseño).
- Tipografía: delegada al diseñador ("la más adecuada para una página web"), decisión abierta que el diseño debe resolver y mostrar al usuario.
- La portada de Facebook (`public/brand/spsatt-portada-facebook.png`, copiada al repo) es evidencia del lenguaje de marca: fondo azul profundo con textura de ondas, acento dorado (botón "Cotiza ya", iconos, eyebrows), titular en serif itálica blanca, eyebrows en mayúsculas con tracking amplio, chips de servicios (MDF, ACRÍLICO, NEÓN, LÁSER, IMPRESIÓN 3D, SUBLIMACIÓN, "Y MUCHO MÁS").
- Compromiso visual vinculante del usuario: el tema definido en `IMPORTANTE.MD` (tokens shadcn/Tailwind en oklch, Inter, radius 0.6rem, modo claro/oscuro) "se aplicará más adelante al diseño", es la dirección de identidad comprometida, no una sugerencia. Los hex primarios de arriba tienen prioridad sobre los valores `--primary` actuales de ese tema; la reconciliación de tokens es trabajo de diseño.
- SEO fijo: título "SPSATT | Soluciones Publicitarias", descripción "Soluciones publicitarias de alta calidad y servicio excepcional.", keywords "publicidad, spsatt, imprenta, mexico".
- Activos de marca ya en el repo: `public/spsatt.svg` (logo), `public/background.jpeg`, `public/bussines/` (logos de clientes: adidas, google, meta, rarras, spotify), `public/illustrations/` (contact-us, empty, login, manufacturing-process, not-found, register), `public/portafolio/` con fotos por categoría (acrilico, impresion-digital, letras, mobiliario, neon, otros, reconocimientos). El código aún no los usa (sigue `spree.png` y el copy demo).

## Evidence on Hand

- `.env`: única verdad SPSATT específica hoy: backend, store name, SEO, correos, Stripe/Resend.
- `IMPORTANTE.MD`: tema de tokens (shadcn/Tailwind oklch) comprometido para aplicar.
- Portada de Facebook con el lenguaje visual y datos de contacto reales: `/home/imjona/Escritorio/spsatt/portada/spsatt-portada-facebook.png` (fuera del repo).
- `messages/*.json`: copy de cliente completo en 5 idiomas, pero genérico del starter (con acentos faltantes en varios lugares); no es copy definitivo de SPSATT.
- `src/app/dev/emails/fixtures.tsx`: fixtures de demo ("Jane Smith", "$") solo para previsualizar emails.
- Ausencias que futuro trabajo **no debe fabricar**: no hay fotos de producto, testimonios, casos de éxito, ni prensa en el repo; el catálogo real no es inspeccionable desde aquí (vive en Spree). El contenido de políticas también vive en el backend.

## Product Principles

1. Verdad de catálogo: todo lo que se muestre debe salir de Spree o de contenido confirmado; nunca inventar productos, precios ni pruebas sociales.
2. Mexicano y en español primero: la experiencia por defecto es `/mx/es/`, en español, para negocios mexicanos.
3. El taller es la ventaja: la comunicación de producto gira en torno a fabricación propia y variedad de materiales (acrílico, neón LED, CNC, MDF, triplay), no en un catálogo genérico.
4. El código del starter es plataforma, no producto: el demo residue de Spree es deuda a eliminar, no contenido a conservar.
5. Mantener la tienda operable de verdad: carrito, checkout y pedidos funcionando contra el backend real son la prioridad antes que cualquier capa nueva.
