import { Store } from "lucide-react";
import Image from "next/image";
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

  return (
    <section className="relative isolate overflow-hidden bg-background">
      <div aria-hidden className="absolute inset-0 -z-10">
        <Image
          src="/img_background.webp"
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-b from-background/95 via-background/90 to-background/80 sm:bg-linear-to-r sm:from-background sm:from-40% sm:via-background/92 sm:to-background/45" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col justify-center py-12 sm:min-h-[calc(100dvh-4rem)] sm:py-16 md:py-20">
          <p className="flex items-center gap-3 text-xs font-semibold tracking-widest text-primary uppercase">
            <span aria-hidden className="h-px w-8 bg-primary" />
            {t("heroEyebrow")}
          </p>
          <h1 className="font-display mt-5 text-[clamp(2.5rem,5.5vw,4rem)] leading-[1.06] font-semibold tracking-[-0.015em] text-balance text-foreground">
            {t("heroTitle")}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-foreground/90">
            {t("heroDescription")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={`${basePath}/products`}>
                <Store aria-hidden className="size-4" />
                {t("heroCtaCatalog")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
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
          <ul className="font-display mt-9 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-foreground/15 pt-6 text-lg font-medium text-foreground/90">
            {services.map((service, index) => (
              <li key={service} className="flex items-baseline gap-3">
                {index > 0 && (
                  <span
                    aria-hidden
                    className="font-sans text-sm font-normal text-primary"
                  >
                    /
                  </span>
                )}
                {service}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
