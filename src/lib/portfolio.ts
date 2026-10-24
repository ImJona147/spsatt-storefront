import type { Media } from "@spree/sdk";

export interface PortfolioCategory {
  slug: string;
  /** i18n key under the `home` namespace for the category name. */
  nameKey:
    | "portfolioNeon"
    | "portfolioAcrylic"
    | "portfolioLetters"
    | "portfolioFurniture"
    | "portfolioAwards"
    | "portfolioPrint"
    | "portfolioOther";
  /** Representative cover used by the home bento tile. */
  cover: string;
  photos: string[];
}

/**
 * Portfolio is a curated gallery of finished pieces, kept as static data
 * (photos ship in /public/portafolio). Slugs are stable routes; do not
 * rename without a redirect.
 */
export const PORTFOLIO_CATEGORIES: PortfolioCategory[] = [
  {
    slug: "letras",
    nameKey: "portfolioLetters",
    cover: "/portafolio/letras/la-casona.jpg",
    photos: [
      "/portafolio/letras/la-casona.jpg",
      "/portafolio/letras/maranta.jpg",
      "/portafolio/letras/marisqueria.jpg",
      "/portafolio/letras/centro-medico.jpg",
      "/portafolio/letras/tomografias.jpg",
    ],
  },
  {
    slug: "neon",
    nameKey: "portfolioNeon",
    cover: "/portafolio/neon/neon-1.jpg",
    photos: [
      "/portafolio/neon/neon-1.jpg",
      "/portafolio/neon/neon-2.jpg",
      "/portafolio/neon/neon-3.jpg",
      "/portafolio/neon/neon-4.jpg",
      "/portafolio/neon/open.jpg",
    ],
  },
  {
    slug: "acrilico",
    nameKey: "portfolioAcrylic",
    cover: "/portafolio/acrilico/llaveros-1.jpg",
    photos: [
      "/portafolio/acrilico/llaveros-1.jpg",
      "/portafolio/acrilico/llaveros-2.jpg",
      "/portafolio/acrilico/llaveros-3.jpg",
      "/portafolio/acrilico/llaveros-4.jpg",
      "/portafolio/acrilico/medallas.jpg",
    ],
  },
  {
    slug: "mobiliario",
    nameKey: "portfolioFurniture",
    cover: "/portafolio/mobiliario/mesa-venta.jpg",
    photos: [
      "/portafolio/mobiliario/mesa-venta.jpg",
      "/portafolio/mobiliario/mesa-2.jpg",
    ],
  },
  {
    slug: "reconocimientos",
    nameKey: "portfolioAwards",
    cover: "/portafolio/reconocimientos/reconocimiento-1.jpg",
    photos: [
      "/portafolio/reconocimientos/reconocimiento-1.jpg",
      "/portafolio/reconocimientos/reconocimiento-2.jpg",
    ],
  },
  {
    slug: "impresion-digital",
    nameKey: "portfolioPrint",
    cover: "/portafolio/impresion-digital/impresion-digital-1.jpg",
    photos: [
      "/portafolio/impresion-digital/impresion-digital-1.jpg",
      "/portafolio/impresion-digital/vinil.jpg",
    ],
  },
  {
    slug: "otros",
    nameKey: "portfolioOther",
    cover: "/portafolio/otros/corte-laser.jpg",
    photos: [
      "/portafolio/otros/corte-laser.jpg",
      "/portafolio/otros/corte-laser-1.jpg",
      "/portafolio/otros/oso.jpg",
      "/portafolio/otros/porton-acabado.jpg",
      "/portafolio/otros/vaso-1.jpg",
      "/portafolio/otros/vasos.jpg",
      "/portafolio/otros/vasos-personlizados.jpg",
    ],
  },
];

export function getPortfolioCategory(slug: string): PortfolioCategory | null {
  return (
    PORTFOLIO_CATEGORIES.find((category) => category.slug === slug) ?? null
  );
}

/**
 * Wraps local photos in the Media shape so the product lightbox can zoom them.
 *
 * Only `original_url` is set: on the PDP the Spree CDN provides distinct
 * xlarge/large/small renditions, but a local asset has a single file, and
 * every lightbox code path reads xlarge→large→original in that order.
 * With all four pointing at the same file the chosen rendition would depend
 * on array order, so leaving the derived sizes null keeps resolution
 * selection deterministic.
 */
export function toMedia(photos: string[], altPrefix: string): Media[] {
  return photos.map((src, index) => ({
    id: src,
    product_id: null,
    variant_ids: [],
    position: index,
    alt: `${altPrefix} ${index + 1}`,
    media_type: "image",
    external_video_url: null,
    focal_point_x: null,
    focal_point_y: null,
    video_provider: null,
    video_embed_url: null,
    video_url: null,
    poster_url: null,
    original_url: src,
    mini_url: null,
    small_url: null,
    medium_url: null,
    large_url: null,
    xlarge_url: null,
    og_image_url: null,
  }));
}
