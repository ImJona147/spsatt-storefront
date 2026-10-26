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
import { getPortfolioCategories } from "@/lib/data/portfolio";
import { resolveCategoryPage, toMedia } from "@/lib/portfolio";

interface PortfolioCategoryPageProps {
  params: Promise<{ country: string; locale: string; categoria: string }>;
}

export async function generateStaticParams() {
  const apiCategories = await getPortfolioCategories();
  return apiCategories
    .filter((category) => category.active)
    .map((category) => ({ categoria: category.slug }));
}

export async function generateMetadata({
  params,
}: PortfolioCategoryPageProps): Promise<Metadata> {
  const { locale, categoria } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  const category = resolveCategoryPage(
    categoria,
    await getPortfolioCategories(),
  );
  if (!category) return {};
  return {
    title: category.name,
    description: t("portfolioLead"),
  };
}

export default async function PortfolioCategoryPage({
  params,
}: PortfolioCategoryPageProps) {
  const { country, locale, categoria } = await params;
  const basePath = `/${country}/${locale}`;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  const category = resolveCategoryPage(
    categoria,
    await getPortfolioCategories(),
  );
  if (!category) notFound();

  const title = category.name;
  const images = toMedia(category.photoUrls, title);

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
        {category.photoUrls.length > 0 ? (
          <PortfolioGallery images={images} title={title} />
        ) : (
          <p className="rounded-xl border border-border bg-secondary p-6 text-center text-base text-muted-foreground">
            {t("portfolioNoPhotos")}
          </p>
        )}
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
