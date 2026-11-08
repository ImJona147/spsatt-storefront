import type { Product } from "@spree/sdk";
import { connection, type NextRequest, NextResponse } from "next/server";
import { buildGoogleMerchantFeed } from "@/lib/google-merchant/feed";
import { getClient } from "@/lib/spree";
import {
  getDefaultCountry,
  getDefaultLocale,
  getStoreName,
  getStoreUrl,
} from "@/lib/store";

const PAGE_SIZE = 100;
const MAX_PAGES = 100;

export async function GET(request: NextRequest): Promise<NextResponse> {
  await connection();

  const expectedToken = process.env.GOOGLE_MERCHANT_FEED_TOKEN?.trim();
  if (
    expectedToken &&
    request.nextUrl.searchParams.get("token") !== expectedToken
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  const storeUrl = (getStoreUrl() || request.nextUrl.origin).replace(/\/$/, "");
  const country = (
    process.env.GOOGLE_MERCHANT_COUNTRY || getDefaultCountry()
  ).toLowerCase();
  const locale = (
    process.env.GOOGLE_MERCHANT_LOCALE || getDefaultLocale()
  ).toLowerCase();
  const brand = process.env.GOOGLE_MERCHANT_BRAND?.trim() || getStoreName();

  try {
    const products = await listAllProducts(country, locale);
    const feed = buildGoogleMerchantFeed(products, {
      storeUrl,
      country,
      locale,
      brand,
      assetBaseUrl: process.env.SPREE_IMAGES_URL || process.env.SPREE_API_URL,
    });

    return new NextResponse(feed, {
      headers: {
        "Content-Type": "text/tab-separated-values; charset=utf-8",
        "Content-Disposition": 'inline; filename="google-merchant.tsv"',
        "Cache-Control":
          "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (error) {
    console.error("Google Merchant feed failed", error);
    return NextResponse.json(
      { error: "Google Merchant feed is temporarily unavailable" },
      { status: 502 },
    );
  }
}

async function listAllProducts(
  country: string,
  locale: string,
): Promise<Product[]> {
  const client = getClient();
  const products: Product[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const response = await client.products.list(
      {
        page,
        limit: PAGE_SIZE,
        expand: [
          "media",
          "variants",
          "default_variant",
          "option_types",
          "custom_fields",
          "categories",
        ],
      },
      { country, locale },
    );

    products.push(...response.data);
    if (page >= response.meta.pages || response.data.length === 0) break;
  }

  return products;
}
