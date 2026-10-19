import type { Metadata } from "next";
import { ClientsSection } from "@/components/home/ClientsSection";
import { ContactSection } from "@/components/home/ContactSection";
import { FaqSection } from "@/components/home/FaqSection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { HeroSection } from "@/components/home/HeroSection";
import { PortfolioSection } from "@/components/home/PortfolioSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { WholesaleSection } from "@/components/home/WholesaleSection";
import { WhySection } from "@/components/home/WhySection";
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

  return (
    <div>
      <HeroSection basePath={basePath} locale={locale} />
      <ClientsSection locale={locale} />
      <FeaturedProductsSection
        basePath={basePath}
        locale={locale}
        country={country}
      />
      <PortfolioSection basePath={basePath} locale={locale} />
      <ProcessSection locale={locale} />
      <WhySection locale={locale} />
      <WholesaleSection basePath={basePath} locale={locale} />
      <ContactSection locale={locale} />
      <FaqSection locale={locale} />
    </div>
  );
}
