import EmptyIllustrationSvg from "../../../public/illustrations/empty.svg";

interface EmptyIllustrationProps {
  className?: string;
}

/**
 * Ilustración de estados vacíos (carrito, búsquedas, listas sin resultados).
 * text-primary colorea los acentos currentColor del SVG.
 */
export function EmptyIllustration({ className = "" }: EmptyIllustrationProps) {
  return (
    <EmptyIllustrationSvg
      aria-hidden
      focusable="false"
      className={`mx-auto block h-auto w-44 text-primary ${className}`}
    />
  );
}
