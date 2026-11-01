interface SectionLabelProps {
  children: string;
}

/** Section marker shared across the product page: short rule + uppercase label. */
export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <h2 className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-primary dark:text-[oklch(0.64_0.14_270)]">
      <span aria-hidden className="h-px w-8 bg-primary" />
      {children}
    </h2>
  );
}
