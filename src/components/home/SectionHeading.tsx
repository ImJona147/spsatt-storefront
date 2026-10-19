interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  id?: string;
}

/**
 * Canonical section intro: short rule + eyebrow, display title, optional lead.
 * Every landing section starts with this so the rhythm stays identical.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  id,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p
        className={`flex items-center gap-3 text-xs font-semibold tracking-widest text-primary uppercase ${
          centered ? "justify-center" : ""
        }`}
      >
        <span aria-hidden className="h-px w-8 bg-primary" />
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mt-4 text-2xl font-bold tracking-tight text-balance text-foreground sm:text-3xl lg:text-4xl"
      >
        {title}
      </h2>
      {lead && (
        <p className="mt-4 text-base leading-7 text-foreground/70">{lead}</p>
      )}
    </div>
  );
}
