"use client";

import { useTranslations } from "next-intl";

export default function PolicyLoading() {
  const t = useTranslations("common");

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 md:py-12 lg:px-8"
    >
      <span className="sr-only">{t("loading")}</span>
      <div aria-hidden="true" className="animate-pulse space-y-4">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-8 w-2/3 max-w-sm rounded bg-muted" />
        <div className="h-4 w-48 rounded bg-muted" />
        <div className="mt-6 rounded-lg border border-border bg-card p-5 sm:p-8">
          <div className="space-y-3">
            <div className="h-4 w-1/3 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-4 w-11/12 rounded bg-muted" />
            <div className="h-4 w-3/5 rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
