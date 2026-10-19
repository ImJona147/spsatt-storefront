import Image from "next/image";
import { getTranslations } from "next-intl/server";

interface ClientLogo {
  src: string;
  alt: string;
  /** Dark-ink logos need a flip so they stay visible on dark surfaces. */
  invertInDark?: boolean;
}

const logos: ClientLogo[] = [
  { src: "/bussines/google.svg", alt: "Google" },
  { src: "/bussines/meta.svg", alt: "Meta" },
  { src: "/bussines/spotify.svg", alt: "Spotify" },
  { src: "/bussines/adidas.svg", alt: "Adidas", invertInDark: true },
  { src: "/bussines/rarras.svg", alt: "Rarras" },
];

function LogoStrip({ decorative = false }: { decorative?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center gap-16 px-10"
      aria-hidden={decorative || undefined}
    >
      {logos.map((logo) => (
        <Image
          key={logo.src}
          src={logo.src}
          alt={decorative ? "" : logo.alt}
          width={120}
          height={40}
          unoptimized
          decoding="async"
          className={`h-8 w-auto opacity-70 transition-opacity duration-300 hover:opacity-100 md:h-9 dark:opacity-60 dark:hover:opacity-90 ${
            logo.invertInDark ? "dark:invert" : ""
          }`}
        />
      ))}
    </div>
  );
}

interface ClientsSectionProps {
  locale: string;
}

export async function ClientsSection({ locale }: ClientsSectionProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });

  return (
    <section
      aria-labelledby="clients-caption"
      className="border-y border-border bg-card"
    >
      <div className="container mx-auto px-4 pt-10 sm:px-6 md:pt-12 lg:px-8">
        <p
          id="clients-caption"
          className="flex items-center justify-center gap-4 text-xs font-semibold tracking-[0.1em] text-foreground/70 uppercase"
        >
          <span aria-hidden className="h-px w-10 bg-border md:w-16" />
          {t("clientsTitle")}
          <span aria-hidden className="h-px w-10 bg-border md:w-16" />
        </p>
      </div>
      <div className="marquee-mask overflow-hidden pb-10 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
        <div className="marquee-track py-6">
          <LogoStrip />
          <LogoStrip decorative />
          <LogoStrip decorative />
          <LogoStrip decorative />
        </div>
      </div>
    </section>
  );
}
