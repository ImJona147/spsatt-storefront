import type { Media } from "@spree/sdk";

/** Category as returned by the Store API `portfolio_categories` endpoint. */
export interface PortfolioCategoryApi {
  id: string;
  name: string;
  slug: string;
  position: number;
  active: boolean;
  cover_url: string | null;
  photos_urls: string[];
}

export interface ResolvedPortfolioCategory {
  slug: string;
  name: string;
  coverUrl: string | null;
  photoUrls: string[];
}

/** Cover the admin set, else the first photo, else nothing to show. */
export function pickCoverUrl(category: PortfolioCategoryApi): string | null {
  return category.cover_url ?? category.photos_urls[0] ?? null;
}

/**
 * Resolves one fixed home bento tile (spans stay in code). Returns null when
 * the API does not know the slug or has the category deactivated.
 */
export function resolveHomeTile(
  tile: { slug: string },
  apiCategories: PortfolioCategoryApi[],
): { image: string | null; name: string } | null {
  const api = apiCategories.find((category) => category.slug === tile.slug);
  if (!api?.active) return null;
  return { image: pickCoverUrl(api), name: api.name };
}

/** Index grid: active API categories ordered by admin position. */
export function resolveIndexCategories(
  apiCategories: PortfolioCategoryApi[],
): ResolvedPortfolioCategory[] {
  return apiCategories
    .filter((category) => category.active)
    .sort((a, b) => a.position - b.position)
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      coverUrl: pickCoverUrl(category),
      photoUrls: category.photos_urls,
    }));
}

/**
 * One category page. Returns null (404) when the API does not know the slug
 * or has the category deactivated; a known category with zero photos is a
 * real state and renders with an empty gallery.
 */
export function resolveCategoryPage(
  slug: string,
  apiCategories: PortfolioCategoryApi[],
): ResolvedPortfolioCategory | null {
  const api = apiCategories.find((category) => category.slug === slug);
  if (!api?.active) return null;
  return {
    slug: api.slug,
    name: api.name,
    coverUrl: pickCoverUrl(api),
    photoUrls: api.photos_urls,
  };
}

/**
 * Wraps photos in the Media shape so the product lightbox can zoom them.
 *
 * Only `original_url` is set: blob proxy URLs serve a single file, while on
 * the PDP the Spree CDN provides distinct xlarge/large/small renditions.
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
