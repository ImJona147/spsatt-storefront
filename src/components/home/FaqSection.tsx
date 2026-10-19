import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/home/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import Questions from "../../../public/illustrations/questions.svg";

const faqs = [
  { qKey: "faq1Question", aKey: "faq1Answer" },
  { qKey: "faq2Question", aKey: "faq2Answer" },
  { qKey: "faq3Question", aKey: "faq3Answer" },
  { qKey: "faq4Question", aKey: "faq4Answer" },
  { qKey: "faq5Question", aKey: "faq5Answer" },
  { qKey: "faq6Question", aKey: "faq6Answer" },
] as const;

interface FaqSectionProps {
  locale: string;
}

export async function FaqSection({ locale }: FaqSectionProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  const items = faqs.map(({ qKey, aKey }) => ({
    question: t(qKey),
    answer: t(aKey),
  }));

  return (
    <section
      aria-labelledby="faq-title"
      className="border-y border-border bg-card"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="md:grid md:grid-cols-[1fr_15rem] md:items-start md:gap-8 lg:grid-cols-[1fr_17rem] lg:gap-12">
          <div>
            <SectionHeading
              eyebrow={t("faqEyebrow")}
              title={t("faqTitle")}
              lead={t("faqLead")}
              id="faq-title"
            />
            <ul className="mt-10 max-w-3xl border-t border-border">
              {items.map((item) => (
                <li key={item.question} className="border-b border-border">
                  <details className="group">
                    <summary className="faq-summary flex cursor-pointer items-center justify-between gap-4 py-5 text-left text-base font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                      {item.question}
                      <Plus
                        aria-hidden
                        className="size-5 shrink-0 text-primary transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
                      />
                    </summary>
                    <p className="pb-5 pr-8 text-sm leading-6 text-foreground/70">
                      {item.answer}
                    </p>
                  </details>
                </li>
              ))}
            </ul>
          </div>
          <Questions
            aria-hidden
            className="mx-auto mt-10 hidden h-auto w-full max-w-72 text-primary md:mt-6 md:block"
          />
        </div>
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map(({ question, answer }) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: {
              "@type": "Answer",
              text: answer,
            },
          })),
        }}
      />
    </section>
  );
}
