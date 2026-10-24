import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/home/SectionHeading";
import { PortfolioGallery } from "@/components/portfolio/PortfolioGallery";
import {
  BUSINESS_WHATSAPP_MESSAGE,
  buildWhatsAppUrl,
} from "@/lib/constants/business";
import { getPortfolioCategory, toMedia } from "@/lib/portfolio";

interface PortfolioCategoryPageProps {
  params: Promise<{ country: string; locale: string; categoria: string }>;
}

export function generateStaticParams() {
  return [
    { categoria: "letras" },
    { categoria: "neon" },
    { categoria: "acrilico" },
    { categoria: "mobiliario" },
    { categoria: "reconocimientos" },
    { categoria: "impresion-digital" },
    { categoria: "otros" },
  ];
}

export async function generateMetadata({
  params,
}: PortfolioCategoryPageProps): Promise<Metadata> {
  const { locale, categoria } = await params;
  const category = getPortfolioCategory(categoria);
  if (!category) return {};
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  return {
    title: t(category.nameKey),
    description: t("portfolioLead"),
  };
}

export default async function PortfolioCategoryPage({
  params,
}: PortfolioCategoryPageProps) {
  const { country, locale, categoria } = await params;
  const category = getPortfolioCategory(categoria);
  if (!category) notFound();

  const basePath = `/${country}/${locale}`;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  const title = t(category.nameKey);
  const images = toMedia(category.photos, title);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <nav aria-label="breadcrumb" className="mb-6">
        <Link
          href={`${basePath}/portafolio`}
          className="text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          {t("portfolioTitle")}
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <span className="text-sm text-muted-foreground">{title}</span>
      </nav>

      <SectionHeading eyebrow={t("portfolioEyebrow")} title={title} />

      <div className="mt-10">
        <PortfolioGallery images={images} title={title} />
      </div>

      <div className="mt-12 rounded-xl border border-border bg-secondary p-6 text-center">
        <p className="text-base font-medium text-foreground">
          {t("portfolioLead")}
        </p>
        <a
          href={buildWhatsAppUrl(BUSINESS_WHATSAPP_MESSAGE)}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          {t("portfolioView")}
        </a>
      </div>
    </div>
  );
}
