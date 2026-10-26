import { getTranslations } from "next-intl/server";
import { WhatsappIcon } from "@/components/ui/svgs/whatsappIcon";
import {
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_WHATSAPP_MESSAGE,
  buildWhatsAppUrl,
} from "@/lib/constants/business";
import type { MaintenanceStatus } from "@/lib/data/storefront-settings";
import { getStoreName } from "@/lib/store";
import MaintenanceSvg from "../../../public/illustrations/maintenance.svg";
import { MaintenanceCountdown } from "./MaintenanceCountdown";
import { MaintenanceThemeToggle } from "./MaintenanceThemeToggle";
import { MaintenanceTitle } from "./MaintenanceTitle";

interface MaintenanceContentProps {
  locale: Locale;
  status: MaintenanceStatus;
}

function formatEndsAt(iso: string, locale: Locale): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/**
 * Full-page notice while the maintenance switch is on. Admin copy wins; the
 * localized pair fills whatever it leaves blank. Two-column error layout with
 * a tinted ambience layer (floating primary washes + dot grid), and the live
 * countdown only when the dashboard set a scheduled end.
 */
export async function MaintenanceContent({
  locale,
  status,
}: MaintenanceContentProps) {
  const t = await getTranslations({ locale, namespace: "maintenance" });
  const title = status.title.trim() || t("title");
  const message = status.message.trim() || t("message");
  const documentTitle = `${t("tab")} | ${getStoreName()}`;
  const dateLine = status.endsAt ? formatEndsAt(status.endsAt, locale) : null;

  return (
    <div className="relative flex min-h-[68svh] flex-1 items-center overflow-hidden">
      {/* Every route keeps the maintenance tab: page-level generateMetadata
          wins over the layout's, so the title is set here too — and enforced
          on the document after hydration (see MaintenanceTitle). */}
      <MaintenanceTitle value={documentTitle} />

      {/* The maintenance page replaces the storefront shell chrome, so the
          theme switch lives here (DocumentShell still provides next-themes). */}
      <div className="absolute top-4 right-4 z-10">
        <MaintenanceThemeToggle label={t("themeToggle")} />
      </div>

      {/* Ambience: two drifting primary washes over a masked dot grid. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="maintenance-float absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="maintenance-float-slow absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(color-mix(in oklab, var(--primary) 18%, transparent) 1.5px, transparent 1.5px)",
            backgroundSize: "26px 26px",
            maskImage:
              "radial-gradient(ellipse at center, black 25%, transparent 78%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 25%, transparent 78%)",
          }}
        />
      </div>

      <section className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-2 md:items-center md:gap-14 lg:gap-20">
        <div className="text-center md:text-left">
          <p className="flex items-center justify-center gap-3 text-xs font-semibold tracking-widest text-primary uppercase md:justify-start">
            <span aria-hidden className="h-px w-8 bg-primary" />
            {t("eyebrow")}
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-foreground/85 sm:text-lg md:mx-0">
            {message}
          </p>
          <MaintenanceCountdown
            endsAt={status.endsAt}
            label={t("countdown.label")}
            dateLine={dateLine}
            units={{
              days: t("countdown.days"),
              hours: t("countdown.hours"),
              minutes: t("countdown.minutes"),
              seconds: t("countdown.seconds"),
            }}
          />
          <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center md:justify-start">
            <a
              href={buildWhatsAppUrl(BUSINESS_WHATSAPP_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              <WhatsappIcon aria-hidden className="size-5 shrink-0" />
              {t("whatsapp")}{" "}
              <span className="text-muted-foreground tabular-nums">
                · {BUSINESS_PHONE_DISPLAY}
              </span>
            </a>
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <div
            aria-hidden
            className="absolute h-80 w-[20rem] rounded-full bg-primary/10 sm:h-96 sm:w-[24rem]"
          />
          <div
            aria-hidden
            className="absolute h-88 w-88 rounded-full border border-dashed border-primary/30 sm:h-104 sm:w-104"
          />
          <MaintenanceSvg
            aria-hidden
            focusable="false"
            className="maintenance-float-art relative h-auto w-64 text-primary sm:w-80 lg:w-96"
          />
        </div>
      </section>
    </div>
  );
}
