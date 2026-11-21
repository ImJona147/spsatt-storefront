import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StorefrontBanner as Banner } from "@/lib/data/storefront-banners";
import { StorefrontBanner } from "./StorefrontBanner";

const banners = ["Primero", "Segundo"].map((title, index) => ({
  id: String(index),
  title,
  animation: "slide",
  autoplay: true,
  sticky: true,
  dismissible: true,
  updated_at: "one",
  background_color: "#123b3a",
  text_color: "#ffffff",
})) as Banner[];

describe("announcement carousel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("moves the carousel track on next and pauses automatic rotation", () => {
    const { container } = render(
      <StorefrontBanner banners={banners} basePath="/mx/es" locale="es" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Aviso siguiente" }));
    const track = container.querySelector('[style*="translate3d"]');
    expect(track?.getAttribute("style")).toContain("-100%");
    act(() => vi.advanceTimersByTime(6000));
    expect(track?.getAttribute("style")).toContain("-100%");
  });

  it("rotates automatically but respects reduced motion", () => {
    const { container, unmount } = render(
      <StorefrontBanner banners={banners} basePath="/mx/es" locale="es" />,
    );
    act(() => vi.advanceTimersByTime(6000));
    expect(
      container.querySelector('[style*="translate3d"]')?.getAttribute("style"),
    ).toContain("-100%");
    unmount();
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    const reduced = render(
      <StorefrontBanner banners={banners} basePath="/mx/es" locale="es" />,
    );
    act(() => vi.advanceTimersByTime(6000));
    expect(
      reduced.container
        .querySelector('[style*="translate3d"]')
        ?.getAttribute("style"),
    ).toContain("-0%");
  });
});
