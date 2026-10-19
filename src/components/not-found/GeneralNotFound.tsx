"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/ui/svgs/whatsappIcon";
import {
  BUSINESS_WHATSAPP_MESSAGE,
  buildWhatsAppUrl,
} from "@/lib/constants/business";
import { extractBasePath } from "@/lib/utils/path";
import NotFoundSvg from "../../../public/illustrations/not-found.svg";

/**
 * 404 general: contenido de los boundaries (storefront con chrome,
 * [country]/[locale] como fallback y root como red de seguridad).
 * Sin params — el basePath sale del pathname del cliente.
 */
export function GeneralNotFound() {
  const t = useTranslations("notFound");
  const basePath = extractBasePath(usePathname() ?? "");

  return (
    <div className="flex min-h-[68svh] items-center">
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-2 md:items-center md:gap-14 lg:gap-20">
        <div className="text-center md:text-left">
          <h1 className="font-display text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg md:mx-0">
            {t("description")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Button asChild size="lg">
              <Link href={basePath || "/"}>{t("backHome")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={`${basePath}/products`}>{t("viewCatalog")}</Link>
            </Button>
          </div>
          <div className="mt-7 border-t border-border/70 pt-5">
            <a
              href={buildWhatsAppUrl(BUSINESS_WHATSAPP_MESSAGE)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <WhatsappIcon aria-hidden className="size-4 text-primary" />
              {t("whatsapp")}
            </a>
          </div>
        </div>
        <div className="relative flex items-center justify-center md:order-first">
          <div
            aria-hidden
            className="absolute inset-6 rounded-full bg-primary/10 blur-3xl"
          />
          <NotFoundSvg
            aria-hidden
            focusable="false"
            className="relative h-auto w-64 text-primary sm:w-80 lg:w-96"
          />
        </div>
      </section>
    </div>
  );
}
