import { readdir } from "node:fs/promises";
import { join } from "node:path";
import Image from "next/image";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";

interface ClientLogo {
  src: string;
  alt: string;
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
        alt: formatOrganizationName(file.name),
      }));
  } catch {
    return [];
  }
}

function formatOrganizationName(fileName: string): string {
  const name = fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
  if (name.length <= 4) return name.toUpperCase();
  return name.replace(/\b\w/g, (letter) => letter.toUpperCase());
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
      className="flex shrink-0 items-center gap-10 px-6"
      aria-hidden={decorative || undefined}
    >
      {logos.map((logo) => (
        <div
          key={logo.src}
          className="relative h-7 w-28 shrink-0 md:h-8 md:w-32"
        >
          <Image
            src={logo.src}
            alt={decorative ? "" : logo.alt}
            title={logo.alt}
            fill
            sizes="(min-width: 768px) 128px, 112px"
            unoptimized
            decoding="async"
            className="object-contain opacity-80 transition-opacity duration-300 hover:opacity-100 dark:opacity-85 dark:hover:opacity-100"
          />
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
      {logos.length > 0 && (
        <div className="marquee-mask overflow-hidden pb-3 mask-[linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
          <div className="marquee-track py-2">
            <LogoStrip logos={logos} />
            <LogoStrip logos={logos} decorative />
            <LogoStrip logos={logos} decorative />
            <LogoStrip logos={logos} decorative />
          </div>
        </div>
      )}
    </section>
  );
}
