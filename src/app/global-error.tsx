"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import { DEFAULT_LOCALE, resolveSupportedLocale } from "@/i18n/locales";
import Error500Svg from "../../public/illustrations/error-500.svg";

/**
 * Last-resort error boundary. It replaces the root layout, so next-intl's
 * provider and globals.css are gone: copy is inlined per locale (detected
 * from the URL after mount) and styling ships in an inline <style> block
 * using static hexes captured from the design tokens.
 */
interface ErrorCopy {
  title: string;
  description: string;
  retry: string;
  home: string;
}

const COPY: Record<string, ErrorCopy> = {
  es: {
    title: "Algo salió mal",
    description:
      "Ocurrió un error inesperado. Intenta de nuevo en unos segundos.",
    retry: "Reintentar",
    home: "Volver al inicio",
  },
  en: {
    title: "Something went wrong",
    description: "An unexpected error occurred. Please try again.",
    retry: "Try again",
    home: "Back to home",
  },
  de: {
    title: "Etwas ist schiefgelaufen",
    description:
      "Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.",
    retry: "Erneut versuchen",
    home: "Zur Startseite",
  },
  fr: {
    title: "Une erreur est survenue",
    description: "Une erreur inattendue s'est produite. Veuillez réessayer.",
    retry: "Réessayer",
    home: "Retour à l'accueil",
  },
  pl: {
    title: "Coś poszło nie tak",
    description: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
    retry: "Spróbuj ponownie",
    home: "Wróć do strony głównej",
  },
};

const STYLES = `
  :root {
    --ge-bg: #fafafa;
    --ge-fg: #1a1d23;
    --ge-muted: #64748b;
    --ge-border: #e2e8f0;
    --ge-primary: #36488f;
    --ge-primary-fg: #ffffff;
    --ge-soft: #f1f5f9;
    color-scheme: light dark;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --ge-bg: #111218;
      --ge-fg: #f8fafc;
      --ge-muted: #94a3b8;
      --ge-border: #272b38;
      --ge-primary: #4f68cf;
      --ge-soft: #1a1d27;
    }
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    min-height: 100svh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 20px;
    background: var(--ge-bg);
    color: var(--ge-fg);
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    text-align: center;
  }
  .ge-card { position: relative; max-width: 460px; }
  .ge-glow {
    position: absolute;
    top: -48px;
    left: 50%;
    width: 260px;
    height: 260px;
    transform: translateX(-50%);
    border-radius: 50%;
    background: var(--ge-primary);
    opacity: 0.14;
    filter: blur(64px);
    pointer-events: none;
  }
  .ge-art {
    position: relative;
    width: clamp(190px, 46vw, 260px);
    height: auto;
    color: var(--ge-primary);
  }
  h1 {
    position: relative;
    margin: 32px 0 0;
    font-size: clamp(1.75rem, 5vw, 2.25rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }
  .ge-desc {
    position: relative;
    margin: 16px auto 0;
    max-width: 420px;
    font-size: 1rem;
    line-height: 1.6;
    color: var(--ge-muted);
  }
  .ge-actions {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
    margin-top: 32px;
  }
  .ge-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 0 22px;
    border-radius: 10px;
    font-size: 0.9375rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: background 150ms ease, border-color 150ms ease;
  }
  .ge-btn:focus-visible {
    outline: 2px solid var(--ge-primary);
    outline-offset: 2px;
  }
  .ge-btn--primary {
    border: 1px solid var(--ge-primary);
    background: var(--ge-primary);
    color: var(--ge-primary-fg);
  }
  .ge-btn--primary:hover { filter: brightness(1.08); }
  .ge-btn--outline {
    border: 1px solid var(--ge-border);
    background: transparent;
    color: var(--ge-fg);
  }
  .ge-btn--outline:hover { background: var(--ge-soft); }
  @media (prefers-reduced-motion: reduce) {
    .ge-btn { transition: none; }
  }
`;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState<string>(DEFAULT_LOCALE);

  useEffect(() => {
    Sentry.captureException(error);
    const [, , segment] = window.location.pathname.split("/");
    setLocale(resolveSupportedLocale(segment) ?? DEFAULT_LOCALE);
  }, [error]);

  const copy = COPY[locale] ?? COPY[DEFAULT_LOCALE];

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <style>{STYLES}</style>
      </head>
      <body>
        <main className="ge-card">
          <div className="ge-glow" aria-hidden="true" />
          <Error500Svg
            aria-hidden
            focusable="false"
            className="ge-art"
            role="presentation"
          />
          <h1>{copy.title}</h1>
          <p className="ge-desc">{copy.description}</p>
          <div className="ge-actions">
            <button
              type="button"
              className="ge-btn ge-btn--primary"
              onClick={reset}
            >
              {copy.retry}
            </button>
            <a className="ge-btn ge-btn--outline" href="/">
              {copy.home}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
