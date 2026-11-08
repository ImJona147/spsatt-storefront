import type { Metadata } from "next";
import { Suspense } from "react";
import { ClientsSection } from "@/components/home/ClientsSection";
import { CollectionCarouselsSection } from "@/components/home/CollectionCarouselsSection";
import { ContactSection } from "@/components/home/ContactSection";
import { FaqSection } from "@/components/home/FaqSection";
import { HeroSection } from "@/components/home/HeroSection";
import { PortfolioSection } from "@/components/home/PortfolioSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { WholesaleSection } from "@/components/home/WholesaleSection";
import { WhySection } from "@/components/home/WhySection";
import { ProductCarouselSkeleton } from "@/components/products/LazyProductCarousel";
import { resolveCurrency } from "@/lib/data/markets";
import { generateHomeMetadata } from "@/lib/metadata/home";

interface HomePageProps {
  params: Promise<{
    country: string;
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { country, locale } = await params;
  return generateHomeMetadata({ country, locale });
}

export default async function HomePage({ params }: HomePageProps) {
  const { country, locale } = await params;
  const basePath = `/${country}/${locale}`;
  const currency = await resolveCurrency(country);

  return (
    <div>
      <HeroSection basePath={basePath} locale={locale} />
      <ClientsSection locale={locale} />
      <Suspense
        fallback={
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <ProductCarouselSkeleton />
          </div>
        }
      >
        <CollectionCarouselsSection
          basePath={basePath}
          locale={locale}
          country={country}
          currency={currency}
        />
      </Suspense>
      <PortfolioSection basePath={basePath} locale={locale} />
      <ProcessSection locale={locale} />
      <WhySection locale={locale} />
      <WholesaleSection basePath={basePath} locale={locale} />
      <ContactSection locale={locale} />
      <FaqSection locale={locale} />
    </div>
  );
}
