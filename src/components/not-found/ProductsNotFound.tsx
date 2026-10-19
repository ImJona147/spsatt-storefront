"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractBasePath } from "@/lib/utils/path";
import Product404Svg from "../../../public/illustrations/product-404.svg";

/**
 * 404 de productos: buscador real contra el PLP (products?q=) más enlaces
 * rápidos. Aterriza en products/not-found.tsx, dentro del layout storefront.
 */
export function ProductsNotFound() {
  const t = useTranslations("notFound");
  const router = useRouter();
  const pathname = usePathname();
  const basePath = extractBasePath(pathname ?? "");
  const [query, setQuery] = useState("");

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    const target = trimmed
      ? `${basePath}/products?q=${encodeURIComponent(trimmed)}`
      : `${basePath}/products`;
    router.push(target);
  }

  return (
    <div className="flex min-h-[68svh] items-center">
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-2 md:items-center md:gap-14 lg:gap-20">
        <div className="text-center md:text-left">
          <h1 className="font-display text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t("productsTitle")}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg md:mx-0">
            {t("productsDescription")}
          </p>
          <search>
            <form
              onSubmit={handleSearch}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row md:mx-0"
            >
              <label htmlFor="not-found-search" className="sr-only">
                {t("searchLabel")}
              </label>
              <Input
                id="not-found-search"
                name="q"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("searchPlaceholder")}
                className="h-11 flex-1 rounded-md"
              />
              <Button type="submit" size="lg" className="h-11 shrink-0">
                {t("searchCta")}
              </Button>
            </form>
          </search>
          <div className="mt-4">
            <Button asChild size="lg" variant="outline">
              <Link href={`${basePath}/products`}>{t("allProducts")}</Link>
            </Button>
          </div>
          <nav
            aria-label={t("quickLinksLabel")}
            className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border/70 pt-5 text-sm md:justify-start"
          >
            <Link
              href={basePath || "/"}
              className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {t("navHome")}
            </Link>
            <span aria-hidden className="text-border">
              ·
            </span>
            <Link
              href={`${basePath}/#contact`}
              className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {t("navContact")}
            </Link>
          </nav>
        </div>
        <div className="relative flex items-center justify-center">
          <div
            aria-hidden
            className="absolute inset-6 rounded-full bg-primary/10 blur-3xl"
          />
          <Product404Svg
            aria-hidden
            focusable="false"
            className="relative h-auto w-64 text-primary sm:w-80 lg:w-96"
          />
        </div>
      </section>
    </div>
  );
}
