import { readdir } from "node:fs/promises";
import { join } from "node:path";
import Image from "next/image";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { clientLogoName } from "@/lib/constants/client-logos";

interface ClientLogo {
  src: string;
  name: string;
}

const LOGO_SLOT_WIDTH_PX = 128;
const LOGO_STRIP_PADDING_PX = 48;
const MIN_LOOP_HALF_WIDTH_PX = 2400;
const MARQUEE_SPEED_PX_PER_S = 30;

function estimatedStripWidthPx(logoCount: number): number {
  return Math.max(logoCount, 1) * LOGO_SLOT_WIDTH_PX + LOGO_STRIP_PADDING_PX;
}

function marqueeCopies(logoCount: number): number {
  const needed = Math.ceil(
    (2 * MIN_LOOP_HALF_WIDTH_PX) / estimatedStripWidthPx(logoCount),
  );
  return Math.max(4, needed + (needed % 2));
}

function marqueeDurationSeconds(logoCount: number, copies: number): number {
  return (
    (estimatedStripWidthPx(logoCount) * copies) / (2 * MARQUEE_SPEED_PX_PER_S)
  );
}

async function getClientLogos(): Promise<ClientLogo[]> {
  try {
    const files = await readdir(join(process.cwd(), "public", "bussines"), {
      withFileTypes: true,
    });
    return files
      .filter(
        (file) =>
          file.isFile() && /\.(avif|jpe?g|png|svg|webp)$/i.test(file.name),
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((file) => ({
        src: `/bussines/${file.name}`,
        name: clientLogoName(file.name),
      }));
  } catch {
    return [];
  }
}

function LogoStrip({
  logos,
  decorative = false,
}: {
  logos: ClientLogo[];
  decorative?: boolean;
}) {
  return (
    <div
      className="flex shrink-0 items-center gap-8 px-6 sm:gap-10"
      aria-hidden={decorative || undefined}
    >
      {logos.map((logo) => (
        <div key={logo.src} className="group relative shrink-0">
          <div className="relative h-8 w-24 sm:h-9 sm:w-28">
            <Image
              src={logo.src}
              alt={decorative ? "" : logo.name}
              fill
              sizes="(min-width: 640px) 112px, 96px"
              unoptimized
              decoding="async"
              className="object-contain opacity-85 transition-opacity duration-300 group-hover:opacity-100"
            />
          </div>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 rounded-md border border-border bg-popover px-2 py-1 text-xs font-medium whitespace-nowrap text-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100"
          >
            {logo.name}
          </span>
        </div>
      ))}
    </div>
  );
}

interface ClientsSectionProps {
  locale: string;
}

export async function ClientsSection({ locale }: ClientsSectionProps) {
  await connection();
  const logos = await getClientLogos();
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });

  if (logos.length === 0) {
    return null;
  }

  const copies = marqueeCopies(logos.length);
  const duration = marqueeDurationSeconds(logos.length, copies);

  return (
    <section
      aria-labelledby="clients-caption"
      className="border-y border-border bg-card"
    >
      <div className="container mx-auto px-4 pt-4 sm:px-6 md:pt-5 lg:px-8">
        <p
          id="clients-caption"
          className="flex items-center justify-center gap-3 text-center text-xs font-semibold tracking-[0.08em] text-foreground/80 uppercase"
        >
          <span aria-hidden className="h-px w-6 shrink-0 bg-border md:w-16" />
          {t("clientsTitle")}
          <span aria-hidden className="h-px w-6 shrink-0 bg-border md:w-16" />
        </p>
      </div>
      <div className="marquee-mask overflow-hidden mask-[linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
        <div
          className="marquee-track pt-9 pb-5"
          style={{ animationDuration: `${duration.toFixed(1)}s` }}
        >
          <LogoStrip logos={logos} />
          {Array.from({ length: copies - 1 }, (_, index) => (
            <LogoStrip key={index} logos={logos} decorative />
          ))}
        </div>
      </div>
    </section>
  );
}
