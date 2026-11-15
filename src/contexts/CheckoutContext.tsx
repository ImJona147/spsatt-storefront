"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

const PENDING = Symbol("pending");

interface CheckoutContextValue {
  summaryContent: ReactNode | typeof PENDING;
  setSummaryContent: (content: ReactNode) => void;
}

const CheckoutContext = createContext<CheckoutContextValue | undefined>(
  undefined,
);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [summaryContent, setSummaryContent] = useState<
    ReactNode | typeof PENDING
  >(PENDING);

  const value = useMemo<CheckoutContextValue>(
    () => ({ summaryContent, setSummaryContent }),
    [summaryContent],
  );

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
}

function CheckoutSummarySkeleton() {
  return (
    <div aria-hidden="true" className="space-y-4 motion-safe:animate-pulse motion-reduce:animate-none">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-lg bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
        </div>
        <div className="h-4 w-16 rounded bg-muted" />
      </div>
      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex justify-between">
          <div className="h-4 w-20 rounded bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-16 rounded bg-muted" />
          <div className="h-4 w-12 rounded bg-muted" />
        </div>
        <div className="flex justify-between border-t border-border pt-3">
          <div className="h-5 w-14 rounded bg-muted" />
          <div className="h-6 w-24 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function CheckoutSummary() {
  const { summaryContent } = useCheckout();
  if (summaryContent === PENDING) return <CheckoutSummarySkeleton />;
  return <>{summaryContent}</>;
}
