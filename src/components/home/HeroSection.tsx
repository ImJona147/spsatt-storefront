import { Store } from "lucide-react";
import { getImageProps } from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/ui/svgs/whatsappIcon";
import {
  BUSINESS_WHATSAPP_MESSAGE,
  buildWhatsAppUrl,
} from "@/lib/constants/business";

interface HeroSectionProps {
  basePath: string;
  locale: string;
}

export async function HeroSection({ basePath, locale }: HeroSectionProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  const services = t.raw("services") as string[];
  // The background is wider than the viewport when it covers the mobile hero.
  const imageOptions = {
    alt: t("heroImageAlt"),
    sizes: "(max-width: 639px) 640px, 100vw",
    loading: "eager",
    fetchPriority: "high",
  } as const;
  const { props: smallImage } = getImageProps({
    ...imageOptions,
    src: "/img_background_960x536.webp",
    width: 961,
    height: 536,
  });
  const { props: mediumImage } = getImageProps({
    ...imageOptions,
    src: "/img_background_1104x617.webp",
    width: 1104,
    height: 617,
  });
  const { props: largeImage } = getImageProps({
    ...imageOptions,
    src: "/img_background_1280x714.webp",
    width: 1280,
    height: 714,
  });

  return (
    <section className="relative isolate overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10">
        <picture>
          <source
            media="(max-width: 360px)"
            srcSet={smallImage.srcSet}
            sizes={smallImage.sizes}
          />
          <source
            media="(max-width: 414px)"
            srcSet={mediumImage.srcSet}
            sizes={mediumImage.sizes}
          />
          <img
            {...largeImage}
            alt={largeImage.alt}
            className="size-full object-cover object-[68%_center] sm:object-center lg:object-right"
          />
        </picture>
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-b from-background/98 via-background/90 via-60% to-background/70 lg:bg-linear-to-r lg:from-background lg:from-35% lg:via-background/95 lg:via-55% lg:to-transparent"
        />
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col py-9 sm:py-12 lg:mx-0 lg:min-h-[min(38rem,calc(100svh-4rem))] lg:max-w-[min(38rem,55%)] lg:justify-center lg:py-16">
          <p className="inline-flex w-fit items-center gap-2.5 text-xs leading-relaxed font-semibold tracking-[0.1em] text-foreground uppercase lg:leading-normal">
            <span aria-hidden className="h-px w-6 shrink-0 bg-primary" />
            {t("heroEyebrow")}
          </p>
          <h1 className="mt-4 max-w-[17ch] text-[clamp(1.875rem,7vw,2.75rem)] leading-[1.16] font-semibold tracking-[-0.015em] text-balance text-foreground lg:text-[clamp(2.75rem,3.8vw,3.5rem)] lg:leading-[1.08] lg:tracking-tight">
            {t("heroTitle")}
          </h1>
          <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-foreground sm:text-base">
            {t("heroDescription")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 lg:mt-7">
            <Button
              asChild
              className="max-w-full whitespace-normal text-center"
            >
              <Link href={`${basePath}/products`}>
                <Store aria-hidden className="size-4" />
                {t("heroCtaCatalog")}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="max-w-full whitespace-normal text-center"
            >
              <a
                href={buildWhatsAppUrl(BUSINESS_WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsappIcon aria-hidden className="size-4" />
                {t("ctaWhatsApp")}
              </a>
            </Button>
          </div>
          <ul className="mt-7 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4 text-xs font-medium text-foreground sm:text-sm lg:mt-8">
            {services.map((service) => (
              <li key={service} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="size-1.5 shrink-0 rounded-full bg-primary"
                />
                {service}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
