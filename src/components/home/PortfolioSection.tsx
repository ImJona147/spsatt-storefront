import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/home/SectionHeading";

const WIDE_SIZES = "(max-width: 767px) 100vw, (max-width: 1024px) 50vw, 33vw";
const NARROW_SIZES = "(max-width: 767px) 50vw, (max-width: 1024px) 25vw, 17vw";

interface PortfolioTile {
  slug: string;
  image: string;
  altKey: string;
  span: string;
  sizes: string;
}

const tiles: PortfolioTile[] = [
  {
    slug: "letras",
    image: "/portafolio/letras/la-casona.jpg",
    altKey: "portfolioLetters",
    span: "col-span-2 row-span-1 md:row-span-2",
    sizes: WIDE_SIZES,
  },
  {
    slug: "neon",
    image: "/portafolio/neon/neon-1.jpg",
    altKey: "portfolioNeon",
    span: "col-span-2",
    sizes: WIDE_SIZES,
  },
  {
    slug: "acrilico",
    image: "/portafolio/acrilico/llaveros-1.jpg",
    altKey: "portfolioAcrylic",
    span: "col-span-1",
    sizes: NARROW_SIZES,
  },
  {
    slug: "mobiliario",
    image: "/portafolio/mobiliario/mesa-venta.jpg",
    altKey: "portfolioFurniture",
    span: "col-span-1",
    sizes: NARROW_SIZES,
  },
  {
    slug: "reconocimientos",
    image: "/portafolio/reconocimientos/reconocimiento-1.jpg",
    altKey: "portfolioAwards",
    span: "col-span-2",
    sizes: WIDE_SIZES,
  },
  {
    slug: "impresion-digital",
    image: "/portafolio/impresion-digital/impresion-digital-1.jpg",
    altKey: "portfolioPrint",
    span: "col-span-1",
    sizes: NARROW_SIZES,
  },
  {
    slug: "otros",
    image: "/portafolio/otros/corte-laser.jpg",
    altKey: "portfolioOther",
    span: "col-span-1",
    sizes: NARROW_SIZES,
  },
];

interface PortfolioSectionProps {
  basePath: string;
  locale: string;
}

export async function PortfolioSection({
  basePath,
  locale,
}: PortfolioSectionProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });

  return (
    <section aria-labelledby="portfolio-title" className="bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <SectionHeading
          eyebrow={t("portfolioEyebrow")}
          title={t("portfolioTitle")}
          lead={t("portfolioLead")}
          id="portfolio-title"
        />
        <ul className="mt-10 grid auto-rows-[9rem] grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:auto-rows-[11.5rem]">
          {tiles.map((tile) => (
            <li key={tile.slug} className={tile.span}>
              <Link
                href={`${basePath}/portafolio/${tile.slug}`}
                className="group relative block h-full overflow-hidden rounded-xl border border-border"
              >
                <Image
                  src={tile.image}
                  alt={t(tile.altKey)}
                  fill
                  sizes={tile.sizes}
                  className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent"
                />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 md:p-4">
                  <span className="min-w-0">
                    <span className="block text-base font-semibold text-white md:text-lg">
                      {t(tile.altKey)}
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-xs font-medium text-white/75 transition-colors group-hover:text-white">
                      {t("portfolioView")}
                      <ArrowRight
                        aria-hidden
                        className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
                      />
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
