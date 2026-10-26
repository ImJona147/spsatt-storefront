import { describe, expect, it } from "vitest";
import {
  type PortfolioCategoryApi,
  pickCoverUrl,
  resolveCategoryPage,
  resolveHomeTile,
  resolveIndexCategories,
} from "@/lib/portfolio";

function apiCategory(
  overrides: Partial<PortfolioCategoryApi> = {},
): PortfolioCategoryApi {
  return {
    id: "portfolio_1",
    name: "Neón",
    slug: "neon",
    position: 1,
    active: true,
    cover_url: "https://cdn.test/cover.jpg",
    photos_urls: ["https://cdn.test/1.jpg", "https://cdn.test/2.jpg"],
    ...overrides,
  };
}

describe("pickCoverUrl", () => {
  it("prefers the admin cover", () => {
    expect(pickCoverUrl(apiCategory())).toBe("https://cdn.test/cover.jpg");
  });

  it("falls back to the first photo when the cover is empty", () => {
    const category = apiCategory({ cover_url: null });
    expect(pickCoverUrl(category)).toBe("https://cdn.test/1.jpg");
  });

  it("returns null when the category has no images at all", () => {
    const category = apiCategory({ cover_url: null, photos_urls: [] });
    expect(pickCoverUrl(category)).toBeNull();
  });
});

describe("resolveHomeTile", () => {
  const tile = { slug: "neon" };

  it("resolves name and cover from the API", () => {
    expect(resolveHomeTile(tile, [apiCategory()])).toEqual({
      image: "https://cdn.test/cover.jpg",
      name: "Neón",
    });
  });

  it("returns null when the API does not know the slug", () => {
    expect(resolveHomeTile(tile, [])).toBeNull();
  });

  it("returns null when the API has the category deactivated", () => {
    expect(resolveHomeTile(tile, [apiCategory({ active: false })])).toBeNull();
  });

  it("keeps the tile with a placeholder when the category has no images", () => {
    const imageless = apiCategory({ cover_url: null, photos_urls: [] });
    expect(resolveHomeTile(tile, [imageless])).toEqual({
      image: null,
      name: "Neón",
    });
  });
});

describe("resolveIndexCategories", () => {
  it("orders active categories by position and drops inactive ones", () => {
    const second = apiCategory({
      id: "portfolio_2",
      slug: "letras",
      name: "Letras y letreros",
      position: 2,
    });
    const inactive = apiCategory({
      id: "portfolio_3",
      slug: "otros",
      name: "Otros trabajos",
      position: 0,
      active: false,
    });
    const result = resolveIndexCategories([second, inactive, apiCategory()]);
    expect(result.map((category) => category.slug)).toEqual(["neon", "letras"]);
    expect(result[0].name).toBe("Neón");
  });

  it("returns an empty list when the API returns nothing", () => {
    expect(resolveIndexCategories([])).toEqual([]);
  });

  it("keeps an imageless category instead of inventing a cover", () => {
    const imageless = apiCategory({ cover_url: null, photos_urls: [] });
    const [entry] = resolveIndexCategories([imageless]);
    expect(entry.coverUrl).toBeNull();
    expect(entry.photoUrls).toEqual([]);
  });
});

describe("resolveCategoryPage", () => {
  it("returns the API category even with zero photos", () => {
    const imageless = apiCategory({ cover_url: null, photos_urls: [] });
    expect(resolveCategoryPage("neon", [imageless])).toEqual({
      slug: "neon",
      name: "Neón",
      coverUrl: null,
      photoUrls: [],
    });
  });

  it("404s a category the API has deactivated", () => {
    const inactive = apiCategory({ active: false });
    expect(resolveCategoryPage("neon", [inactive])).toBeNull();
  });

  it("404s slugs the API does not know", () => {
    expect(resolveCategoryPage("no-existe", [apiCategory()])).toBeNull();
  });
});
