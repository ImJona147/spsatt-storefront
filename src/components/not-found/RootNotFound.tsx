"use client";

import { Fraunces, Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import "../../app/globals.css";
import {
  DEFAULT_LOCALE,
  resolveSupportedLocale,
  STORE_TIME_ZONE,
} from "@/i18n/locales";
import de from "../../../messages/de.json";
import en from "../../../messages/en.json";
import es from "../../../messages/es.json";
import fr from "../../../messages/fr.json";
import pl from "../../../messages/pl.json";
import { GeneralNotFound } from "./GeneralNotFound";

// Mismas variables que DocumentShell: el root 404 no pasa por ese layout.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});
const frauncesItalic = Fraunces({
  variable: "--font-fraunces-italic",
  subsets: ["latin"],
  display: "swap",
  style: "italic",
});

const MESSAGES = { de, en, es, fr, pl } as const;

/**
 * 404 raíz (red de seguridad: el middleware reescribe casi todo al sentinel
 * con chrome). Next lo renderiza sin layout localizado, así que lleva
 * globals.css y las variables de fuente propias. Sin ThemeProvider: mutaría
 * <html> sin suppressHydrationWarning y React reporta el mismatch como
 * Issue en Next DevTools — el tema correcto vive en el boundary storefront.
 */
export function RootNotFound() {
  const pathname = usePathname() ?? "";
  const candidate = pathname.split("/").filter(Boolean)[1];
  const locale = resolveSupportedLocale(candidate) ?? DEFAULT_LOCALE;

  return (
    <div
      className={`${inter.variable} ${fraunces.variable} ${frauncesItalic.variable} flex min-h-screen flex-col bg-background font-sans text-foreground antialiased`}
    >
      <NextIntlClientProvider
        locale={locale}
        messages={MESSAGES[locale]}
        timeZone={STORE_TIME_ZONE}
      >
        <GeneralNotFound />
      </NextIntlClientProvider>
    </div>
  );
}
