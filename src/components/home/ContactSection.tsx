import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/home/SectionHeading";
import { Button } from "@/components/ui/button";
import {
  BUSINESS_ADDRESS,
  BUSINESS_EMAIL,
  BUSINESS_HOURS,
  BUSINESS_MAP_EMBED_URL,
  BUSINESS_MAPS_URL,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_TEL,
} from "@/lib/constants/business";
import ContactUs from "../../../public/illustrations/contact-us.svg";

interface ContactSectionProps {
  locale: string;
}

export async function ContactSection({ locale }: ContactSectionProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="scroll-mt-24 bg-secondary"
    >
      <div className="container mx-auto px-4 py-10 sm:px-6 md:py-16 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="order-2 lg:order-1">
            <div className="flex items-start justify-between gap-6">
              <SectionHeading
                eyebrow={t("contactEyebrow")}
                title={t("contactTitle")}
                lead={t("contactDescription")}
                id="contact-title"
              />
              <ContactUs
                aria-hidden
                className="mt-1 text-primary hidden h-auto w-40 shrink-0 md:block lg:w-48"
              />
            </div>
            <ul className="mt-7 space-y-4 text-sm text-foreground/80">
              <li className="flex items-start gap-3">
                <MapPin
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0 text-primary"
                  strokeWidth={1.8}
                />
                <span>{BUSINESS_ADDRESS}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0 text-primary"
                  strokeWidth={1.8}
                />
                <span>
                  {BUSINESS_HOURS.map((row) => (
                    <span key={row.label} className="block">
                      <span className="font-medium">{row.label}:</span>{" "}
                      {row.value}
                    </span>
                  ))}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0 text-primary"
                  strokeWidth={1.8}
                />
                <a
                  href={`tel:${BUSINESS_PHONE_TEL}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {BUSINESS_PHONE_DISPLAY}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0 text-primary"
                  strokeWidth={1.8}
                />
                <a
                  href={`mailto:${BUSINESS_EMAIL}`}
                  className="underline-offset-4 hover:underline"
                >
                  {BUSINESS_EMAIL}
                </a>
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <a href={`tel:${BUSINESS_PHONE_TEL}`}>
                  <Phone aria-hidden className="size-4" />
                  {t("contactCta")}
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href={BUSINESS_MAPS_URL} target="_blank" rel="noreferrer">
                  {t("contactDirections")}
                  <ArrowUpRight aria-hidden className="size-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="order-1 overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:order-2">
            <iframe
              title={t("contactMapLabel")}
              src={BUSINESS_MAP_EMBED_URL}
              loading="lazy"
              className="h-64 w-full border-0 sm:h-80 lg:h-104"
            />
            <a
              href={BUSINESS_MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 border-t border-border px-5 py-4 text-sm transition-colors hover:bg-secondary"
            >
              <span className="flex items-start gap-2 text-foreground/80">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {BUSINESS_ADDRESS}
              </span>
              <ArrowUpRight
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
