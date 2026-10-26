import type { Country, Market } from "@spree/sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { REQUEST_PATHNAME_HEADER, REQUEST_SEARCH_HEADER } from "@/i18n/routing";

const mocks = vi.hoisted(() => ({
  getMarkets: vi.fn(),
  getMaintenanceStatus: vi.fn(),
  headers: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("not-found");
  }),
  redirect: vi.fn((location: string) => {
    throw new Error(`redirect:${location}`);
  }),
}));

vi.mock("next/headers", () => ({ headers: mocks.headers }));
vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
  redirect: mocks.redirect,
}));
vi.mock("next-intl", () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));
vi.mock("@/lib/data/markets", () => ({ getMarkets: mocks.getMarkets }));
vi.mock("@/lib/data/storefront-settings", () => ({
  getMaintenanceStatus: mocks.getMaintenanceStatus,
}));
vi.mock("@/components/maintenance/MaintenanceContent", () => ({
  MaintenanceContent: () => null,
}));
vi.mock("@/lib/store", () => ({
  getDefaultCountry: () => "us",
  getDefaultLocale: () => "en",
  getStoreName: () => "SPSATT",
}));
vi.mock("next-intl/server", () => ({
  getTranslations: () => (key: string) => key,
}));
vi.mock("@/lib/metadata/store", () => ({
  generateStoreMetadata: async () => ({
    title: { template: "%s | SPSATT", default: "SPSATT" },
    robots: { index: true, follow: true },
  }),
}));
vi.mock("@/components/layout/DocumentShell", () => ({
  DocumentShell: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@/components/cart/CartDrawer", () => ({ CartDrawer: () => null }));
vi.mock("@/components/seo/JsonLd", () => ({ JsonLd: () => null }));
vi.mock("@/components/ui/sonner", () => ({ Toaster: () => null }));
vi.mock("@/contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@/contexts/CartContext", () => ({
  CartProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@/contexts/StoreContext", () => ({
  StoreProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import { MaintenanceContent } from "@/components/maintenance/MaintenanceContent";
import { CountryLocaleLayoutContent, generateMetadata } from "./layout";

function country(iso: string): Country {
  return {
    iso,
    iso3: iso,
    name: iso,
    states_required: false,
    zipcode_required: false,
  } as Country;
}

function market(overrides: Partial<Market> = {}): Market {
  return {
    id: "market-1",
    name: "Market",
    currency: "USD",
    default_locale: "en",
    tax_inclusive: false,
    default: true,
    country_codes: ["US"],
    supported_locales: ["en"],
    countries: [country("US")],
    ...overrides,
  } as Market;
}

describe("CountryLocaleLayout Market fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getMaintenanceStatus.mockResolvedValue(null);
  });

  it("redirects to the Market locale without dropping path or query", async () => {
    mocks.getMarkets.mockResolvedValue({
      data: [
        market({
          default_locale: "es",
          supported_locales: ["es"],
          country_codes: ["AR"],
          countries: [country("AR")],
        }),
      ],
    });
    mocks.headers.mockResolvedValue(
      new Headers({
        [REQUEST_PATHNAME_HEADER]: "/ar/en/products/coffee",
        [REQUEST_SEARCH_HEADER]: "?sort=price",
      }),
    );

    await expect(
      CountryLocaleLayoutContent({
        children: <main />,
        params: Promise.resolve({ country: "ar", locale: "en" }),
      }),
    ).rejects.toThrow("redirect:/ar/es/products/coffee?sort=price");
    expect(mocks.redirect).toHaveBeenCalledWith(
      "/ar/es/products/coffee?sort=price",
    );
    expect(mocks.getMarkets).toHaveBeenCalledWith({
      country: "us",
      locale: "en",
    });
  });

  it("redirects a storefront-supported locale that is unavailable in the Market", async () => {
    mocks.getMarkets.mockResolvedValue({
      data: [
        market(),
        market({
          id: "market-eu",
          name: "Europe",
          currency: "EUR",
          default: false,
          default_locale: "de",
          supported_locales: ["de", "es", "fr"],
          country_codes: ["PL"],
          countries: [country("PL")],
        }),
      ],
    });
    mocks.headers.mockResolvedValue(
      new Headers({
        [REQUEST_PATHNAME_HEADER]: "/pl/pl",
      }),
    );

    await expect(
      CountryLocaleLayoutContent({
        children: <main />,
        params: Promise.resolve({ country: "pl", locale: "pl" }),
      }),
    ).rejects.toThrow("redirect:/pl/de");
    expect(mocks.redirect).toHaveBeenCalledWith("/pl/de");
    expect(mocks.getMarkets).toHaveBeenCalledWith({
      country: "us",
      locale: "en",
    });
  });

  it("redirects an unknown country to the default Market and keeps the page", async () => {
    mocks.getMarkets.mockResolvedValue({ data: [market()] });
    mocks.headers.mockResolvedValue(
      new Headers({
        [REQUEST_PATHNAME_HEADER]: "/zz/en/products/coffee",
      }),
    );

    await expect(
      CountryLocaleLayoutContent({
        children: <main />,
        params: Promise.resolve({ country: "zz", locale: "en" }),
      }),
    ).rejects.toThrow("redirect:/us/en/products/coffee");
  });

  it.each([
    ["an empty Markets response", []],
    [
      "a Market without countries",
      [market({ countries: [], country_codes: [] })],
    ],
  ])("does not redirect the default route to itself for %s", async (_, markets) => {
    mocks.getMarkets.mockResolvedValue({ data: markets });

    await expect(
      CountryLocaleLayoutContent({
        children: <main />,
        params: Promise.resolve({ country: "us", locale: "en" }),
      }),
    ).resolves.toBeDefined();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("redirects a non-default route once when no Market target is available", async () => {
    mocks.getMarkets.mockResolvedValue({ data: [] });
    mocks.headers.mockResolvedValue(
      new Headers({
        [REQUEST_PATHNAME_HEADER]: "/zz/en/products/coffee",
        [REQUEST_SEARCH_HEADER]: "?sort=price",
      }),
    );

    await expect(
      CountryLocaleLayoutContent({
        children: <main />,
        params: Promise.resolve({ country: "zz", locale: "en" }),
      }),
    ).rejects.toThrow("redirect:/us/en/products/coffee?sort=price");
  });
});

describe("CountryLocaleLayout maintenance mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getMaintenanceStatus.mockResolvedValue(null);
  });

  it("renders the maintenance page and skips market data while the switch is on", async () => {
    mocks.getMaintenanceStatus.mockResolvedValue({
      active: true,
      title: "Volvemos pronto",
      message: "Mantenimiento en curso.",
    });

    const tree = (await CountryLocaleLayoutContent({
      children: <main />,
      params: Promise.resolve({ country: "us", locale: "en" }),
    })) as React.ReactElement<{ children: React.ReactElement }>;

    expect(tree.props.children.type).toBe(MaintenanceContent);
    expect(mocks.getMarkets).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("keeps the normal render when the switch is off", async () => {
    mocks.getMaintenanceStatus.mockResolvedValue(null);
    mocks.getMarkets.mockResolvedValue({ data: [market()] });

    await CountryLocaleLayoutContent({
      children: <main />,
      params: Promise.resolve({ country: "us", locale: "en" }),
    });

    expect(mocks.getMaintenanceStatus).toHaveBeenCalled();
    expect(mocks.getMarkets).toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});

describe("CountryLocaleLayout generateMetadata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getMaintenanceStatus.mockResolvedValue(null);
  });

  const layoutProps = {
    children: <main />,
    params: Promise.resolve({ country: "us", locale: "en" }),
  };

  it("keeps the store metadata while maintenance is off", async () => {
    const metadata = await generateMetadata(layoutProps);

    expect(metadata.title).toEqual({
      template: "%s | SPSATT",
      default: "SPSATT",
    });
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });

  it("forces the localized maintenance title and noindex while it is on", async () => {
    mocks.getMaintenanceStatus.mockResolvedValue({
      active: true,
      title: "",
      message: "",
      endsAt: null,
    });

    const metadata = await generateMetadata(layoutProps);

    // getTranslations is mocked to the key — real locales resolve "tab".
    expect(metadata.title).toEqual({ absolute: "tab | SPSATT" });
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
