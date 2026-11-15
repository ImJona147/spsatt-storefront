"use client";

import type { Category, Collection } from "@spree/sdk";
import { ArrowLeft, ChevronRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { RegionPreferences } from "@/components/layout/RegionPreferences";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTitle,
} from "@/components/ui/sheet";
import { collectionName } from "@/lib/i18n/collection-labels";

type PanelType =
  | { kind: "main" }
  | { kind: "category"; category: Category }
  | { kind: "collections" };

type NavCollection = Pick<Collection, "id" | "name" | "permalink">;

interface MobileMenuProps {
  rootCategories: Category[];
  /** Collections listed in their own panel, like a category's children. */
  collections?: NavCollection[];
  basePath: string;
  /** Whether the wholesale addon is enabled — gates the trade portal link. */
  wholesaleEnabled: boolean;
  /** Whether marketplace seller pages are enabled — gates the sellers link. */
  marketplaceEnabled?: boolean;
}

export function MobileMenu({
  rootCategories,
  collections = [],
  basePath,
  wholesaleEnabled,
  marketplaceEnabled = false,
}: MobileMenuProps) {
  const t = useTranslations("header");
  const tc = useTranslations("collections");
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [panelStack, setPanelStack] = useState<PanelType[]>([{ kind: "main" }]);
  // animatedIndex trails panelStack — new panels mount off-screen, then animate in
  const [animatedIndex, setAnimatedIndex] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentPanel = panelStack[panelStack.length - 1];

  const cancelPendingCallbacks = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const pushPanel = (panel: PanelType) => {
    cancelPendingCallbacks();
    // Step 1: mount the new panel off-screen (translate-x-full) via flushSync
    flushSync(() => {
      setPanelStack((prev) => [...prev, panel]);
    });
    // Step 2: on next frame, update animatedIndex to trigger slide-in
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      setAnimatedIndex((prev) => prev + 1);
    });
  };

  const popPanel = () => {
    cancelPendingCallbacks();
    // Step 1: animate out by decrementing animatedIndex
    setAnimatedIndex((prev) => Math.max(0, prev - 1));
    // Step 2: after transition, remove the panel from the stack
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setPanelStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    }, 300);
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      cancelPendingCallbacks();
      setPanelStack([{ kind: "main" }]);
      setAnimatedIndex(0);
    }
  };

  // Shared link style
  const linkClass =
    "group flex min-h-11 items-center rounded-xl px-3.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  // Shared button style for items with children (chevron)
  const categoryButtonClass =
    "group flex min-h-11 w-full items-center justify-between rounded-xl px-3.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <Button
        variant="outline"
        size="icon-lg"
        onClick={() => setOpen(!open)}
        aria-label={open ? t("closeMenu") : t("openMenu")}
        aria-expanded={open}
        aria-controls={menuId}
        className="relative z-[60] size-11 rounded-xl border-border bg-background shadow-sm transition-[background-color,transform,box-shadow] hover:bg-accent hover:shadow-md active:scale-95 motion-reduce:transition-none"
      >
        <Menu
          aria-hidden
          className={`absolute size-5 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
            open
              ? "rotate-90 scale-75 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          }`}
        />
        <X
          aria-hidden
          className={`absolute size-5 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
            open
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-75 opacity-0"
          }`}
        />
      </Button>

      <SheetContent
        id={menuId}
        side="left"
        className="flex flex-col !gap-0 !rounded-none overflow-hidden border-r border-border bg-background shadow-2xl max-md:!top-16 max-md:!h-[calc(100%-4rem)] max-md:!w-full max-md:!max-w-none max-md:!border-r-0 max-md:!border-t max-md:!border-border sm:!max-w-[25rem]"
        showCloseButton={false}
        overlayClassName="max-md:!top-16 max-md:!bg-transparent"
      >
        <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
        {/* Menu header — changes based on active panel */}
        <div className="relative flex h-14 shrink-0 items-center justify-between overflow-hidden border-b border-border bg-background px-5 text-foreground">
          {/* "Menu" title — visible when on main panel */}
          <span
            className={`absolute left-5 text-base font-semibold tracking-tight transition-[opacity,transform] duration-300 ease-in-out ${
              currentPanel.kind === "main"
                ? "translate-x-0 opacity-100"
                : "-translate-x-8 opacity-0 pointer-events-none"
            }`}
          >
            {t("menu")}
          </span>
          {/* Back button + category name — visible on sub-panels */}
          <button
            type="button"
            onClick={popPanel}
            tabIndex={currentPanel.kind === "main" ? -1 : 0}
            aria-hidden={currentPanel.kind === "main"}
            className={`absolute left-5 flex cursor-pointer items-center gap-2 text-base font-semibold transition-all duration-300 ease-in-out ${
              currentPanel.kind !== "main"
                ? "translate-x-0 opacity-100"
                : "translate-x-8 opacity-0 pointer-events-none"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>
              {currentPanel.kind === "category"
                ? currentPanel.category.name
                : currentPanel.kind === "collections"
                  ? t("collections")
                  : ""}
            </span>
          </button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleOpenChange(false)}
            aria-label={t("closeMenu")}
            className="ml-auto cursor-pointer text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Sliding panels container */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {/* Main menu panel */}
          <div
            className={`absolute inset-0 flex flex-col bg-background transition-transform duration-300 ease-in-out ${
              animatedIndex === 0 && currentPanel.kind === "main"
                ? "translate-x-0"
                : "-translate-x-full"
            }`}
          >
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4">
              <div className="mb-2 grid grid-cols-2 gap-2 border-b border-border pb-4">
                <Link
                  href={basePath || "/"}
                  onClick={() => setOpen(false)}
                  className={`${linkClass} bg-muted/60`}
                >
                  {t("home")}
                </Link>
                <Link
                  href={`${basePath}/products`}
                  onClick={() => setOpen(false)}
                  className={`${linkClass} bg-muted/60`}
                >
                  {t("allProducts")}
                </Link>
              </div>
              <p className="px-3.5 pb-1 pt-1 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {t("categories")}
              </p>
              {collections.length > 0 ? (
                <button
                  type="button"
                  onClick={() => pushPanel({ kind: "collections" })}
                  className={categoryButtonClass}
                >
                  <span>{t("collections")}</span>
                  <span className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <ChevronRight className="size-4" />
                  </span>
                </button>
              ) : (
                <Link
                  href={`${basePath}/collections`}
                  onClick={() => setOpen(false)}
                  className={linkClass}
                >
                  {t("collections")}
                </Link>
              )}
              {marketplaceEnabled && (
                <Link
                  href={`${basePath}/sellers`}
                  onClick={() => setOpen(false)}
                  className={linkClass}
                >
                  {t("sellers")}
                </Link>
              )}
              {rootCategories.map((category) =>
                category.children && category.children.length > 0 ? (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => pushPanel({ kind: "category", category })}
                    className={categoryButtonClass}
                  >
                    <span>{category.name}</span>
                    <span className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <ChevronRight className="size-4" />
                    </span>
                  </button>
                ) : (
                  <Link
                    key={category.id}
                    href={`${basePath}/c/${category.permalink}`}
                    onClick={() => setOpen(false)}
                    className={linkClass}
                  >
                    {category.name}
                  </Link>
                ),
              )}
              <Link
                href={`${basePath}/#contact`}
                onClick={() => setOpen(false)}
                className={linkClass}
              >
                {t("contact")}
              </Link>
              {/* Secondary links — kept out of the category list above. */}
              <div className="mt-2 border-t border-border pt-2">
                {wholesaleEnabled && (
                  <Link
                    href={`${basePath}/wholesale`}
                    onClick={() => setOpen(false)}
                    className={`${linkClass} block`}
                  >
                    {t("wholesale")}
                  </Link>
                )}
                <SheetClose asChild>
                  <Link
                    href={`${basePath}/account`}
                    className={`${linkClass} block`}
                  >
                    {t("myAccount")}
                  </Link>
                </SheetClose>
              </div>
            </nav>

            {/* Footer: centered Region and language control (mobile only) */}
            <SheetFooter className="items-center gap-2 border-t border-border pt-4 lg:hidden">
              <RegionPreferences variant="menu" />
            </SheetFooter>
          </div>

          {/* Sub-panels — one for each level in the stack */}
          {panelStack.map((panel, index) => {
            if (panel.kind === "main") return null;
            const isAnimatedIn = index <= animatedIndex;
            let translateClass = "translate-x-full";
            if (isAnimatedIn && index < panelStack.length - 1)
              translateClass = "-translate-x-full";
            else if (isAnimatedIn) translateClass = "translate-x-0";

            const title =
              panel.kind === "category"
                ? panel.category.name
                : t("collections");
            const viewAllHref =
              panel.kind === "category"
                ? `${basePath}/c/${panel.category.permalink}`
                : `${basePath}/collections`;

            return (
              <div
                key={`${panel.kind}-${panel.kind === "category" ? panel.category.id : "all"}-${index}`}
                className={`absolute inset-0 flex flex-col bg-background transition-transform duration-300 ease-in-out ${translateClass}`}
              >
                {/* Children */}
                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 pt-3">
                  {panel.kind === "collections"
                    ? collections.map((collection) => (
                        <Link
                          key={collection.id}
                          href={`${basePath}/collections/${collection.permalink}`}
                          onClick={() => handleOpenChange(false)}
                          className={linkClass}
                        >
                          {collectionName(tc, collection)}
                        </Link>
                      ))
                    : panel.category.children?.map((child) =>
                        child.children && child.children.length > 0 ? (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() =>
                              pushPanel({ kind: "category", category: child })
                            }
                            className={categoryButtonClass}
                          >
                            <span>{child.name}</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </button>
                        ) : (
                          <Link
                            key={child.id}
                            href={`${basePath}/c/${child.permalink}`}
                            onClick={() => handleOpenChange(false)}
                            className={linkClass}
                          >
                            {child.name}
                          </Link>
                        ),
                      )}
                </nav>

                {/* "View all" at the bottom */}
                <div className="border-t border-border px-4 py-3">
                  <Link
                    href={viewAllHref}
                    onClick={() => handleOpenChange(false)}
                    className="block w-full text-center text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
                  >
                    {t("viewAllCategory", { category: title })}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
