import type { Media, Price, Product, Variant } from "@spree/sdk";
import { describe, expect, it } from "vitest";
import {
  buildGoogleMerchantFeed,
  GOOGLE_MERCHANT_COLUMNS,
} from "@/lib/google-merchant/feed";

const OPTIONS = {
  storeUrl: "https://spsatt.com.mx",
  country: "mx",
  locale: "es",
  brand: "SPSATT",
};

function price(amount: string, currency = "MXN"): Price {
  return { amount, currency } as Price;
}

function media(overrides: Partial<Media> = {}): Media {
  return {
    id: "media_1",
    product_id: "prod_1",
    variant_ids: [],
    position: 1,
    alt: null,
    media_type: "image",
    external_video_url: null,
    focal_point_x: null,
    focal_point_y: null,
    video_provider: null,
    video_embed_url: null,
    video_url: null,
    poster_url: null,
    original_url: "https://cdn.example.com/original.webp",
    mini_url: null,
    small_url: null,
    medium_url: null,
    large_url: "https://cdn.example.com/large.webp",
    xlarge_url: "https://cdn.example.com/xlarge.webp",
    og_image_url: null,
    ...overrides,
  } as Media;
}

function variant(overrides: Partial<Variant> = {}): Variant {
  return {
    id: "variant_1",
    product_id: "prod_1",
    sku: "SKU-1",
    options_text: "",
    track_inventory: true,
    media_count: 0,
    preorder_ships_at: null,
    thumbnail_url: null,
    purchasable: true,
    in_stock: true,
    backorderable: false,
    preorder: false,
    weight: null,
    height: null,
    width: null,
    depth: null,
    weight_unit: "kg",
    dimensions_unit: "cm",
    minimum_order_quantity: 1,
    order_multiple: 1,
    purchase_unit: "unit",
    units_per_carton: null,
    price: price("800.00"),
    original_price: null,
    seller_id: null,
    option_values: [],
    ...overrides,
  } as Variant;
}

function product(overrides: Partial<Product> = {}): Product {
  const defaultVariant = variant();
  return {
    id: "prod_1",
    name: "Reconocimiento personalizado",
    slug: "reconocimiento",
    meta_title: null,
    meta_description: null,
    meta_keywords: null,
    variant_count: 1,
    available_on: null,
    preorder_ships_at: null,
    purchasable: true,
    preorder: false,
    in_stock: true,
    backorderable: false,
    available: true,
    description: "Reconocimiento para eventos y empresas.",
    description_html: null,
    default_variant_id: "variant_1",
    buy_box_variant_id: "variant_1",
    thumbnail_url: "https://cdn.example.com/thumb.webp",
    tags: [],
    price: price("800.00"),
    original_price: null,
    seller_id: null,
    media: [media()],
    variants: [defaultVariant],
    default_variant: defaultVariant,
    option_types: [],
    custom_fields: [],
    categories: [],
    ...overrides,
  } as unknown as Product;
}

function rows(feed: string): Array<Record<string, string>> {
  const [header, ...lines] = feed.replace(/\n$/, "").split("\n");
  const columns = header.split("\t");
  return lines.map((line) => {
    const values = line.split("\t");
    return Object.fromEntries(
      columns.map((column, index) => [column, values[index] ?? ""]),
    );
  });
}

describe("buildGoogleMerchantFeed", () => {
  it("writes the Merchant Center header and one row per variant", () => {
    const first = variant({ sku: "SKU-1", options_text: "Color: Blanco" });
    const second = variant({
      id: "variant_2",
      sku: "SKU-2",
      options_text: "Color: Negro",
      price: price("850.00"),
    });
    const feed = buildGoogleMerchantFeed(
      [
        product({
          variants: [first, second],
          default_variant: first,
          default_variant_id: first.id,
          price: first.price,
        }),
      ],
      OPTIONS,
    );

    const parsed = rows(feed);
    expect(feed.split("\n")[0]).toBe(GOOGLE_MERCHANT_COLUMNS.join("\t"));
    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toMatchObject({
      id: "SKU-1",
      title: "Reconocimiento personalizado - Color: Blanco",
      price: "800.00 MXN",
      item_group_id: "SKU-1",
    });
    expect(parsed[1]).toMatchObject({
      id: "SKU-2",
      title: "Reconocimiento personalizado - Color: Negro",
      price: "850.00 MXN",
      item_group_id: "SKU-1",
    });
  });

  it("falls back to the variant id when there is no SKU", () => {
    const only = variant({ sku: null });
    const parsed = rows(
      buildGoogleMerchantFeed(
        [
          product({
            variants: [only],
            default_variant: only,
            default_variant_id: only.id,
          }),
        ],
        OPTIONS,
      ),
    );

    expect(parsed[0]?.id).toBe("variant_1");
  });

  it("maps stock, preorder and backorder availability", () => {
    const preorder = variant({
      preorder: true,
      preorder_ships_at: "2026-01-15T12:00:00Z",
    });
    const backorder = variant({
      id: "variant_2",
      sku: "SKU-2",
      backorderable: true,
      in_stock: false,
    });
    const unavailable = variant({
      id: "variant_3",
      sku: "SKU-3",
      purchasable: false,
      in_stock: false,
    });
    const parsed = rows(
      buildGoogleMerchantFeed(
        [
          product({
            variants: [preorder, backorder, unavailable],
            default_variant: preorder,
            default_variant_id: preorder.id,
          }),
        ],
        OPTIONS,
      ),
    );

    expect(parsed[0]).toMatchObject({
      availability: "preorder",
      availability_date: "2026-01-15T12:00:00Z",
    });
    expect(parsed[1]?.availability).toBe("backorder");
    expect(parsed[2]?.availability).toBe("out_of_stock");
  });

  it("uses custom GTIN, MPN and brand values when present", () => {
    const parsed = rows(
      buildGoogleMerchantFeed(
        [
          product({
            custom_fields: [
              { key: "gtin", label: "GTIN", value: "7501234567890" },
              { key: "mpn", label: "MPN", value: "MPN-1" },
              { key: "marca", label: "Marca", value: "Otra marca" },
            ] as unknown as NonNullable<Product["custom_fields"]>,
          }),
        ],
        OPTIONS,
      ),
    );

    expect(parsed[0]).toMatchObject({
      identifier_exists: "yes",
      gtin: "7501234567890",
      mpn: "MPN-1",
      brand: "Otra marca",
    });
  });

  it("does not treat unrelated custom field names as GTIN", () => {
    const parsed = rows(
      buildGoogleMerchantFeed(
        [
          product({
            custom_fields: [
              {
                key: "booleano.booleano",
                label: "Booleano",
                value: "true",
              },
            ] as unknown as NonNullable<Product["custom_fields"]>,
          }),
        ],
        OPTIONS,
      ),
    );

    expect(parsed[0]?.identifier_exists).toBe("no");
    expect(parsed[0]?.gtin).toBe("");
  });

  it("strips HTML and truncates descriptions to 200 characters", () => {
    const parsed = rows(
      buildGoogleMerchantFeed(
        [
          product({
            description: null,
            description_html: `<p>${"Detalle ".repeat(60)}</p>`,
          }),
        ],
        OPTIONS,
      ),
    );

    expect(parsed[0]?.description).not.toContain("<p>");
    expect(parsed[0]?.description.length).toBeLessThanOrEqual(200);
  });

  it("uses the main image and adds up to ten additional image links", () => {
    const parsed = rows(
      buildGoogleMerchantFeed(
        [
          product({
            media: [
              media({ id: "media_1" }),
              media({
                id: "media_2",
                xlarge_url: "https://cdn.example.com/second.webp",
              }),
            ],
          }),
        ],
        OPTIONS,
      ),
    );

    expect(parsed[0]?.image_link).toBe("https://cdn.example.com/xlarge.webp");
    expect(parsed[0]?.additional_image_link).toBe(
      "https://cdn.example.com/second.webp",
    );
  });

  it("skips rows without a price or image", () => {
    const broken = {
      ...product(),
      price: null,
      media: [],
      thumbnail_url: null,
      default_variant: null,
      variants: [],
    } as unknown as Product;
    const parsed = rows(buildGoogleMerchantFeed([broken], OPTIONS));

    expect(parsed).toEqual([]);
  });

  it("keeps every row aligned with the header", () => {
    const feed = buildGoogleMerchantFeed([product()], OPTIONS);
    const lines = feed.replace(/\n$/, "").split("\n");
    const columnCount = GOOGLE_MERCHANT_COLUMNS.length;

    for (const line of lines) {
      expect(line.split("\t")).toHaveLength(columnCount);
    }
  });
});
