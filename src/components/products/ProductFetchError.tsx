"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

/**
 * Friendly in-page state shown when the product fetch failed for a reason
 * other than "this product does not exist" (backend hiccup, network). A
 * router.refresh() re-runs the server components without a full reload.
 */
export function ProductFetchError() {
  const router = useRouter();
  const t = useTranslations("products");

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("loadErrorTitle")}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {t("loadErrorDescription")}
        </p>
        <Button
          size="lg"
          className="mt-8 gap-2.5 font-semibold"
          onClick={() => router.refresh()}
        >
          <RefreshCw className="size-5" aria-hidden="true" />
          {t("retry")}
        </Button>
      </div>
    </div>
  );
}
