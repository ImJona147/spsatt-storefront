import { Hammer, Lightbulb, Ruler } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/home/SectionHeading";
import ManufacturingProcess from "../../../public/illustrations/manufacturing-process.svg";

const steps = [
  {
    icon: Lightbulb,
    titleKey: "processStep1Title",
    bodyKey: "processStep1Body",
  },
  { icon: Ruler, titleKey: "processStep2Title", bodyKey: "processStep2Body" },
  { icon: Hammer, titleKey: "processStep3Title", bodyKey: "processStep3Body" },
] as const;

interface ProcessSectionProps {
  locale: string;
}

export async function ProcessSection({ locale }: ProcessSectionProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });

  return (
    <section
      aria-labelledby="process-title"
      className="border-y border-border bg-secondary"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12">
          <SectionHeading
            eyebrow={t("processEyebrow")}
            title={t("processTitle")}
            lead={t("processLead")}
            id="process-title"
          />
          <div className="flex justify-center md:justify-end">
            <ManufacturingProcess
              aria-hidden
              className="h-auto w-52 text-primary md:w-64 lg:w-72"
            />
          </div>
        </div>
        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-0">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.titleKey} className="relative">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-xs font-semibold tabular-nums text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {index < steps.length - 1 && (
                    <span
                      aria-hidden
                      className="hidden h-px flex-1 bg-border md:block"
                    />
                  )}
                </div>
                <div className="mt-5 md:pr-8">
                  <div className="flex items-center gap-2">
                    <Icon
                      aria-hidden
                      className="size-4 text-primary"
                      strokeWidth={1.8}
                    />
                    <h3 className="text-base font-semibold text-foreground">
                      {t(step.titleKey)}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-foreground/70">
                    {t(step.bodyKey)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
