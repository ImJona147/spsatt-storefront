"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface MaintenanceCountdownProps {
  /** ISO timestamp from the dashboard; null or past hides the countdown. */
  endsAt: string | null;
  label: string;
  /** Preformatted target date ("26 oct 2026, 20:18") from the server. */
  dateLine?: string | null;
  units: {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
}

function split(remainingMs: number) {
  const total = Math.floor(remainingMs / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * Live "back at" countdown for the maintenance page: a scored panel with
 * Fraunces numerals, a primary header rule and a rising tick on every digit
 * change. Renders nothing until it has a real future date; when the moment
 * passes mid-session it refreshes the route once so an already-reopened
 * store recovers without a manual reload.
 */
export function MaintenanceCountdown({
  endsAt,
  label,
  dateLine,
  units,
}: MaintenanceCountdownProps) {
  const router = useRouter();
  const [remaining, setRemaining] = useState<number | null>(null);
  const sawFuture = useRef(false);
  const refreshed = useRef(false);

  useEffect(() => {
    const target = new Date(endsAt ?? "").getTime();
    if (Number.isNaN(target)) return;

    const tick = () => {
      const left = target - Date.now();
      if (left > 0) sawFuture.current = true;
      setRemaining(Math.max(0, left));
      if (left <= 0 && sawFuture.current && !refreshed.current) {
        refreshed.current = true;
        router.refresh();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endsAt, router]);

  if (remaining === null || remaining <= 0) return null;

  const parts = split(remaining);
  const entries = [
    { key: "days", value: parts.days, unit: units.days },
    { key: "hours", value: parts.hours, unit: units.hours },
    { key: "minutes", value: parts.minutes, unit: units.minutes },
    { key: "seconds", value: parts.seconds, unit: units.seconds },
  ];

  return (
    <div className="mx-auto mt-8 w-full max-w-lg rounded-lg border border-t-[3px] border-primary/20 border-t-primary bg-card p-5 shadow-sm sm:p-6 md:mx-0">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase">
          <span aria-hidden className="h-px w-5 bg-primary/60" />
          {label}
        </p>
        {dateLine && (
          <p className="text-xs text-muted-foreground tabular-nums sm:text-sm">
            {dateLine}
          </p>
        )}
      </div>
      <div
        role="timer"
        aria-label={label}
        className="mt-4 grid grid-cols-4 divide-x divide-border"
      >
        {entries.map((entry) => (
          <div
            key={entry.key}
            className="flex min-w-0 flex-col items-center gap-1.5 px-1"
          >
            <span
              key={entry.value}
              className={[
                "inline-block font-display text-4xl leading-none font-semibold tracking-tight tabular-nums sm:text-5xl",
                "animate-[countdown-tick_280ms_ease-out] motion-reduce:animate-none",
                entry.key === "seconds" ? "text-primary" : "text-foreground",
              ].join(" ")}
            >
              {pad(entry.value)}
            </span>
            <span className="text-[10px] font-semibold tracking-[0.14em] text-primary uppercase sm:text-[11px]">
              {entry.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
