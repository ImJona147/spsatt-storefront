---
name: SPSATT
description: "Soluciones publicitarias para tu negocio: sistema de diseño de la tienda SPSATT"
colors:
  primary: "oklch(0.4258 0.1189 270.0203)"
  primary-dark: "oklch(0.5521 0.1610 270.1361)"
  background: "oklch(0.9851 0 0)"
  foreground: "oklch(0.2303 0.0125 264.2926)"
  card: "oklch(1 0 0)"
  secondary: "oklch(0.9611 0.0070 268.5473)"
  muted-foreground: "oklch(0.5544 0.0407 257.4166)"
  border: "oklch(0.9288 0.0126 255.5078)"
  destructive: "oklch(0.5858 0.2220 17.5846)"
  background-dark: "oklch(0.1509 0.0109 276.1744)"
  foreground-dark: "oklch(0.9842 0.0034 247.8575)"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.011em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.1em"
rounded:
  sm: "0.2rem"
  md: "0.4rem"
  lg: "0.6rem"
  pill: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    filter: "brightness(1.08)"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-secondary-hover:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "10px 14px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: SPSATT

## Overview

**Creative North Star: "Las Ideas, Hechas"**

La promesa de SPSATT es que una idea se vuelve una pieza física. El sistema la traduce con el tema shadcn comprometido de `IMPORTANTE.MD`: un azul profundo (primary) para acciones y superficies de marca, y neutros claros u oscuros que el modo oscuro resuelve solo.

La voz tipográfica nace de la portada de Facebook real de SPSATT: titulares en serif itálica que llevan el eslogan "Donde las ideas se hacen realidad", apoyados por Inter, que hace el trabajo diario de comercio: precios, formularios, navegación. La personalidad de los componentes es robusta y segura: superficies sólidas, esquinas suaves, bordes finos, sin fragilidad.

El oro de la identidad (degradado #FFF0B8 a #E9C35A a #B8861F) se revocó para UI por decisión del usuario: queda solo en el arte del logotipo y en la portada original, nunca en botones, acentos ni ornamentos.

Deuda honesta: home, chrome (header, footer, menú), el flujo de cuenta público (login, registro, olvido y restablecimiento de contraseña) y las páginas autenticadas de la cuenta (resumen, pedidos, detalle de pedido, direcciones, métodos de pago, tarjetas regalo y perfil — shell AccountShell con nav en grid 2 columnas en móvil, todo visible sin scroll, sidebar sticky en desktop, ritmo densificado para 1366×768 sin scroll inicial) usan tokens del tema; quedan rincones fuera del alcance actual: checkout y el pie de página en modo oscuro (sigue con superficie azul de marca, no resuelto con tokens).

Dial: ENERGY 2 / RHYTHM 2 / MOTION 1

**Key Characteristics:**

- Primary del tema `IMPORTANTE.MD` como color de acción y superficie de marca; sin acentos de color adicionales en UI.
- Serif itálica (Fraunces) para display y eslogan; Inter para todo lo transaccional.
- Componentes robustos: relleno generoso, bordes finos, radio suave y constante.
- Profundidad por capas sutiles: tono sobre tono, sombra mínima, elevación en hover.
- Todo color sale de tokens semánticos shadcn: nada de `bg-white` ni `text-gray-*` en componentes.

## Colors

La paleta es azul de marca + oro de acción sobre neutros claros u oscuros, nunca más de eso.

### Primary

- **Primary del tema** (oklch(0.4258 0.1189 270.0203); en modo oscuro oklch(0.5521 0.1610 270.1361)): claro del tema, oscuro fijado por el usuario para asegurar contraste sobre `background` 0.1509. Acciones primarias, superficies de marca (header, footer), enlaces activos, eyebrows. Es la única azul de interfaz: `--primary` y `--ring` provienen del tema, sin overrides hex.
- **Azul Taller** (#3b3c97, del logo `public/spsatt.svg`): variante propia del logotipo. Solo para el logo; no se introduce en la UI. Referencia histórica: la portada usaba #36488F, hoy subsumida por el oklch del tema (mismo azul, otro espacio).

### Terciario

- **Oro de identidad** (#FFF0B8 a #E9C35A a #B8861F): revocado para UI por decisión del usuario (2026-10-17). No aparece en botones, acentos, líneas ni ornamentos; vive únicamente en el arte del logotipo y en la portada original.

### Neutral

- **Papel** (oklch(0.9851 0 0)) fondo claro; **Tinta** (oklch(0.2303 0.0125 264.2926)) texto principal.
- **Card** (oklch(1 0 0)) superficies elevadas; **Lavado** (oklch(0.9611 0.0070 268.5473)) superficies secundarias y chips.
- **Gris Humo** (oklch(0.5544 0.0407 257.4166)) texto secundario; **Borde** (oklch(0.9288 0.0126 255.5078)) bordes finos de 1px.
- **Rojo Alerta** (oklch(0.5858 0.2220 17.5846)) solo errores y estados destructivos.
- Modo oscuro: fondo oklch(0.1509 0.0109 276.1744), texto oklch(0.9842 0.0034 247.8575).

### Named Rules

**The Token Rule.** Todo color de UI proviene de los tokens semánticos del tema shadcn (`IMPORTANTE.MD`). Prohibido `bg-white`, `text-gray-*`, hex sueltos ni oro: cualquier valor fijo rompe el modo oscuro o se pelea con el tema.

**The Dark Mode Rule.** El modo oscuro es igual de canónico que el claro: la clase `.dark` resuelve los tokens y next-themes (attribute class) con el toggle del topbar controla el estado. Ningún componente puede asumir fondo claro.

## Typography

**Display Font:** Fraunces (con fallback Georgia, serif)
**Body Font:** Inter (con fallback system-ui, sans-serif)
**Label Font:** Inter (mismas familias, en mayúsculas con tracking)

**Character:** La serif itálica de Fraunces es la voz de la marca (titulares y eslogan, con carácter de portada impresa); Inter es la voz de la tienda (legible en español, densa en datos, sin discusiones). Motivo de elección: Fraunces tiene itálica real y variable (opsz) que rinde bien en web sin pesar; Inter está fijada en el tema comprometido de `IMPORTANTE.MD` y es legible a tamaños de UI.

### Hierarchy

- **Display** (600, clamp(2.25rem, 4.5vw, 3.25rem), 1.1): titulares de hero y categoría. En itálica (500-600 italic) cuando lleva el eslogan "Donde las ideas se hacen realidad".
- **Headline** (600, 1.75rem, 1.2): títulos de sección.
- **Title** (600, 1.125rem, 1.3): títulos de tarjeta y producto.
- **Body** (400, 1rem, 1.5): descripciones, copy de formulario, listas. Medida máxima de lectura 65-75ch.
- **Label** (600, 0.75rem, tracking 0.1em, mayúsculas): eyebrows de sección ("ARTÍCULOS PUBLICITARIOS", "COTIZA YA"), etiquetas de campo.

### Named Rules

**The Italic Tagline Rule.** El eslogan en serif itálica aparece una sola vez por pantalla, en el hero o su equivalente. Si está en todos lados, no es una voz, es un patrón.

## Layout

Contenedor fluido con padding horizontal generoso (mínimo 16px en móvil, 24-32px en escritorio), breakpoints estándar de Tailwind (640/768/1024/1280px). Base de espaciado de 4px (`--spacing: 0.25rem` del tema) con pasos usados: 8px, 16px, 24px, 32px. Las secciones respiran con separación vertical de 48-64px en escritorio y 32-40px en móvil. Patrón de la portada: composición de dos columnas en escritorio (mensaje a la izquierda, datos/acción a la derecha) que colapsa a una sola columna en móvil. El header es fijo con carrito y búsqueda; el menú móvil es drawer. Densidad: cómoda, no minimalista: este público lee especificaciones de producto.

## Elevation & Depth

Filosofía elegida: capas sutiles. La profundidad viene del tono (fondo vs card vs lavado) y de bordes finos de 1px, no de sombras grandes. Las sombras del tema son mínimas por diseño y solo se refuerzan en estados de elevación real (hover, drawer, diálogo).

### Shadow Vocabulary

- **Descanso** (`box-shadow: 0 2px 8px 0 hsl(0 0% 0% / 0.03), 0 1px 2px -1px hsl(0 0% 0% / 0.03)`): tarjetas en reposo, casi imperceptible.
- **Hover/Elevación** (`box-shadow: 0 4px 12px 0 hsl(0 0% 0% / 0.3)` en modo oscuro; equivalente suave en claro): solo al interactuar o en overlays (drawer, diálogo).

### Named Rules

**The Grounded Rule.** En reposo todo descansa sobre el suelo (tono + borde). La sombra aparece solo como respuesta a estado (hover, apertura, foco). Si dos elementos flotan a la vez, la jerarquía se rompió.

## Shapes

Radio base 0.6rem (tema `--radius`), escala: 0.2rem (sm), 0.4rem (md), 0.6rem (lg). Sin píldora reservada: la geometría usa la escala del tema (lg para tarjetas, inputs y botones, md para controles pequeños). Bordes de 1px en Borde neutro. Sin esquinas rectas ni radios exagerados: la geometría es robusta, no juguetona.

## Components

### Buttons

- **Shape:** radio lg (0.6rem), igual que la escala del tema (shadcn `Button`).
- **Primary:** fondo `--primary` con texto `--primary-foreground`, peso 500. Para la acción principal de la pantalla ("Ver catálogo", "Agregar al carrito"). Hover vía filtro `brightness(1.08)`.
- **Outline:** fondo transparente, borde 1px `--border`, texto `--foreground`. Para acciones secundarias (teléfono, cancelar).
- **Hover / Focus:** focus-visible con anillo `--ring` de 2px con offset. Transición 150ms ease.
- **Ghost:** texto `--foreground`, fondo transparente, hover en `--accent`. Acciones de icono del topbar (cuenta, tema, búsqueda).

### Service Line

- En lugar de chips, el hero lista los servicios (MDF, Acrílico, Neón, Láser, Impresión 3D, Sublimación) como texto en `--muted-foreground` separado por "·". Sin bordes, sin píldora, sin iconos dorados.

### Cards / Containers

- **Corner Style:** radio lg (0.6rem).
- **Background:** Card (oklch(1 0 0)) sobre fondo Papel; en modo oscuro, card sobre fondo oscuro.
- **Shadow Strategy:** Grounded Rule: sombra de reposo mínima, hover eleva.
- **Border:** 1px Borde neutro.
- **Internal Padding:** 24px (spacing lg).

### Inputs / Fields

- **Style:** fondo Papel (o background actual), texto Tinta, borde 1px Borde, radio lg (0.6rem), padding 10px 14px.
- **Focus:** anillo/borde Azul Real 2px con offset, sin glow.
- **Error / Disabled:** borde y texto en Rojo Alerta con mensaje asociado; disabled en Lavado con texto Gris Humo.

### Navigation

- **Style:** header fijo con logo (SPSATT svg), enlaces en Body 500, y acciones de icono a la derecha: tema (sol/luna), búsqueda, cuenta y carrito. El toggle claro/oscuro vive en el topbar junto a región/idioma, búsqueda y cuenta (next-themes, attribute class). Hover en enlaces: subrayado fino o color primary; activo marcado con aria-current. Móvil: drawer lateral con el mismo vocabulario. Sin sombras pesadas: separación por borde fino.

### Signature Component: Eyebrow

- Label en mayúsculas con tracking en color primary precedido de una línea corta de 24-32px en primary (como en "ARTÍCULOS PUBLICITARIOS" de la portada, donde la línea va antes del texto). Marca el inicio de sección. Uno por sección como máximo.

### Auth Split (login / registro / olvido / restablecer)

- Layout de dos columnas en desktop (`md:grid-cols-2`, `max-w-5xl`, `min-h-[60svh]`, centrado vertical). Formulario `max-w-md` a la izquierda; ilustración a la derecha con glow `bg-primary/10 blur-3xl`, oculta en móvil (`hidden md:flex`, `aria-hidden`).
- **H1:** Fraunces (`font-display`), `text-3xl sm:text-4xl`, `font-semibold tracking-tight`, color `--foreground`.
- **Lead:** una sola línea de `text-sm sm:text-base` en `--muted-foreground`, `mt-2.5`, copy específico de la acción (no genérico tipo "Bienvenido").
- **Ritmo compacto** para laptops 1366×768: contenedor `py-6 sm:py-8`, formulario `mt-5 space-y-3`, sin doble margen (el `Field` ya aplica `gap-2`).
- **Campos:** labels `FieldLabel`, placeholders reales del mercado (`gerencia@tuempresa.mx`, `Laura`, `Hernández`), no `you@example.com`. Eye toggle con `aria-label` Mostrar/Ocultar contraseña.
- **Checklist de contraseña** (registro y restablecer): 5 reglas en vivo bajo el campo, check `--primary` al cumplir, círculo `--muted-foreground` pendiente; botón deshabilitado hasta reglas + coincidencia. Indicador de coincidencia con `aria-live`.
- **Estados de resultado** (éxito o enlace inválido) viven en la misma grilla Auth Split: icono en `bg-primary/10 text-primary` (nunca verde fijo), título Fraunces, cuerpo muted, acción outline o primary y link de vuelta. Sin card centrada suelta.
- **Ilustraciones:** login y restablecer usan `login.svg` (llave/monitor); registro `register.svg`; olvido `questions.svg`. Siempre `text-primary` + glow, sin fondos fijos que rompan dark.
- Tokens shadcn en cada estado; nada de `green-100`, `gray-*` ni `bg-white`.

## Do's and Don'ts

### Do:

- **Do** usar los tokens semánticos shadcn (background, foreground, primary, muted, border) en todo componente; el modo oscuro se resuelve solo.
- **Do** usar el botón primary (bg-primary con texto primary-foreground) para la acción principal de la pantalla.
- **Do** usar Fraunces en itálica una sola vez por pantalla, para el eslogan o el titular de mayor peso emocional.
- **Do** resolver profundidad con tono y borde de 1px; sombra solo en hover, drawer o diálogo.
- **Do** mantener el toggle claro/oscuro en el topbar, junto a región, búsqueda y cuenta.
- **Do** verificar contraste AA en cada modo (texto sobre primary siempre en primary-foreground).

### Don't:

- **Don't** usar el oro en UI: botones, acentos, líneas y ornamentos quedaron revocados; el oro es solo del logotipo y la portada.
- **Don't** poner `bg-white`, `text-gray-*` ni hex sueltos que rompan el modo oscuro: solo tokens shadcn.
- **Don't** convertir todo en píldora ni agregar glow, glassmorphism o sombras grandes: la personalidad es robusta, no brillante.
- **Don't** introducir la tipografía Geist ni el azul del starter (`#0077ff`): este documento sustituye a esos valores.
- **Don't** inventar números, testimonios ni logos de clientes que no existan en el backend o en `public/` (los logos de `public/bussines/` solo si son clientes reales confirmados).
