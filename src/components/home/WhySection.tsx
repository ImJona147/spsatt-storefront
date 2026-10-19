import { Layers, Ruler, Truck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/home/SectionHeading";
import Collaboration from "../../../public/illustrations/collaboration.svg";

const points = [
  { icon: Layers, titleKey: "whyItem1Title", bodyKey: "whyItem1Body" },
  { icon: Ruler, titleKey: "whyItem2Title", bodyKey: "whyItem2Body" },
  { icon: Truck, titleKey: "whyItem3Title", bodyKey: "whyItem3Body" },
] as const;

interface WhySectionProps {
  locale: string;
}

export async function WhySection({ locale }: WhySectionProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });

  return (
    <section aria-labelledby="why-title" className="border-y border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-10">
          <SectionHeading
            eyebrow={t("whyEyebrow")}
            title={t("whyTitle")}
            lead={t("whyLead")}
            id="why-title"
          />
          <Collaboration
            aria-hidden
            className="mx-auto text-primary h-auto w-44 shrink-0 md:mx-0 md:w-52 lg:w-64"
          />
        </div>
        <ul className="mt-10 grid gap-6 md:grid-cols-3 md:gap-8">
          {points.map((point) => {
            const Icon = point.icon;
            return (
              <li key={point.titleKey} className="flex items-start gap-3">
                <Icon
                  aria-hidden
                  className="mt-1 size-5 shrink-0 text-primary"
                  strokeWidth={1.8}
                />
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {t(point.titleKey)}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-foreground/70">
                    {t(point.bodyKey)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
