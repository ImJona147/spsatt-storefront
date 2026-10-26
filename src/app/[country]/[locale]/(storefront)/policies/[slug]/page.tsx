import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { SignalNotFound } from "@/components/not-found/SignalNotFound";
import { POLICY_LINKS } from "@/lib/constants/policies";
import { cachedGetPolicy, getPolicy } from "@/lib/data/policies";
import {
  buildLocalizedAlternates,
  translationFingerprint,
} from "@/lib/metadata/alternates";
import { normalizeOpenGraphLocale } from "@/lib/metadata/store";
import { enhancePolicyHtml } from "@/lib/policy-html";
import { SOCIAL_IMAGE } from "@/lib/seo";
import { getStoreName, getStoreUrl } from "@/lib/store";

interface PolicyPageProps {
  params: Promise<{
    country: string;
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PolicyPageProps): Promise<Metadata> {
  const { country, locale, slug } = await params;
  const policy = await getPolicy(slug, { country, locale });

  const storeName = getStoreName();

  if (!policy) {
    const t = await getTranslations({
      locale: locale as Locale,
      namespace: "policies",
    });
    return {
      title: t("policyNotFound"),
      description: t("noContent"),
    };
  }

  const description = `${policy.name} — ${storeName}`;
  const storeUrl = getStoreUrl();
  const localizedAlternates = storeUrl
    ? await buildLocalizedAlternates({
        storeUrl,
        country,
        locale,
        path: `/policies/${policy.slug}`,
        currentResourceFingerprint: policyTranslationFingerprint(policy),
        resolvePath: async (target) => {
          const localizedPolicy = await cachedGetPolicy(policy.id, target);
          return localizedPolicy
            ? {
                path: `/policies/${localizedPolicy.slug}`,
                fingerprint: policyTranslationFingerprint(localizedPolicy),
              }
            : undefined;
        },
      })
    : undefined;

  return {
    title: policy.name,
    description,
    ...(localizedAlternates
      ? {
          alternates: {
            canonical: localizedAlternates.canonical,
            languages: localizedAlternates.languages,
          },
        }
      : {}),
    openGraph: {
      title: policy.name,
      description,
      ...(localizedAlternates ? { url: localizedAlternates.canonical } : {}),
      siteName: getStoreName(),
      locale: normalizeOpenGraphLocale(locale),
      type: "website",
      images: [SOCIAL_IMAGE],
    },
  };
}

export default async function PolicyPage({
  params,
}: PolicyPageProps): Promise<React.JSX.Element> {
  const { country, slug, locale } = await params;
  const [policy, t, tHeader] = await Promise.all([
    getPolicy(slug, { country, locale }),
    getTranslations({ locale: locale as Locale, namespace: "policies" }),
    getTranslations({ locale: locale as Locale, namespace: "header" }),
  ]);

  if (!policy) {
    return (
      <Suspense fallback={null}>
        <SignalNotFound />
      </Suspense>
    );
  }

  const basePath = `/${country}/${locale}`;
  const bodyHtml = policy.body_html
    ? enhancePolicyHtml(policy.body_html)
    : null;
  const updatedDate = formatUpdatedDate(policy.updated_at, locale);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <nav aria-label="breadcrumb" className="text-sm">
        <Link
          href={basePath}
          className="font-medium text-primary hover:underline underline-offset-4"
        >
          {tHeader("home")}
        </Link>
        <span className="mx-2 text-muted-foreground" aria-hidden="true">
          /
        </span>
        <span className="text-muted-foreground">{policy.name}</span>
      </nav>

      <header className="mt-5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          {policy.name}
        </h1>
        {updatedDate && (
          <p className="mt-2 text-sm text-muted-foreground">
            {t("lastUpdated")}: {updatedDate}
          </p>
        )}
      </header>

      <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start lg:gap-8">
        <nav
          aria-label={t("storePolicies")}
          className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:hidden"
        >
          {POLICY_LINKS.map((link) => {
            const active = link.slug === policy.slug;
            return (
              <Link
                key={link.slug}
                href={`${basePath}/policies/${link.slug}`}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 whitespace-nowrap rounded-lg border px-4 py-3 text-sm transition-colors ${
                  active
                    ? "border-transparent bg-secondary font-medium text-secondary-foreground"
                    : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {t(link.nameKey)}
              </Link>
            );
          })}
        </nav>

        <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
          <p className="px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t("storePolicies")}
          </p>
          <ul className="mt-2 space-y-1">
            {POLICY_LINKS.map((link) => {
              const active = link.slug === policy.slug;
              return (
                <li key={link.slug}>
                  <Link
                    href={`${basePath}/policies/${link.slug}`}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-md px-3 py-3 text-sm transition-colors ${
                      active
                        ? "bg-secondary font-medium text-secondary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {t(link.nameKey)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>

        <article className="min-w-0 rounded-lg border border-border bg-card p-5 sm:p-8">
          {bodyHtml ? (
            <div
              className="policy-prose prose"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          ) : policy.body ? (
            <div className="policy-prose prose whitespace-pre-wrap">
              {policy.body}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("noContent")}</p>
          )}
        </article>
      </div>
    </div>
  );
}

function formatUpdatedDate(iso: string, locale: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(date);
}

function policyTranslationFingerprint(policy: {
  name: string;
  slug: string;
  body: string | null;
  body_html: string | null;
}): string {
  return translationFingerprint(
    policy.name,
    policy.slug,
    policy.body,
    policy.body_html,
  );
}
