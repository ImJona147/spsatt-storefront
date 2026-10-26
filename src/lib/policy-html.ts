const HEADING_PARAGRAPH = /<p><strong>([^<>]+)<\/strong><\/p>/g;
const NUMBERED_TITLE = /^\d+\.\s+\S/;
const UPDATE_LINE = /^última\s+actualizaci/i;

/**
 * El editor de políticas del dashboard guarda los títulos de sección como
 * `<p><strong>…</strong></p>` en vez de encabezados reales. Promueve los
 * títulos numerados a `<h2>` con id de ancla y elimina el título del documento
 * y la línea de última actualización, que la página ya muestra como H1 y como
 * línea de metadatos. Si el HTML no sigue ese patrón, se devuelve sin tocar.
 */
export function enhancePolicyHtml(html: string): string {
  const usedIds = new Set<string>();
  let titleDropped = false;

  return html.replace(
    HEADING_PARAGRAPH,
    (match: string, text: string, offset: number) => {
      const title = text.trim();

      if (NUMBERED_TITLE.test(title)) {
        return `<h2 id="${uniqueId(slugify(title), usedIds)}">${title}</h2>`;
      }

      if (!titleDropped && /^\s*$/.test(html.slice(0, offset))) {
        titleDropped = true;
        return "";
      }

      if (UPDATE_LINE.test(title)) return "";

      return match;
    },
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueId(base: string, used: Set<string>): string {
  const root = base || "apartado";
  let id = root;
  let suffix = 2;
  while (used.has(id)) {
    id = `${root}-${suffix}`;
    suffix += 1;
  }
  used.add(id);
  return id;
}
