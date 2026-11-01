import type { Media } from "@spree/sdk";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MediaLightbox } from "@/components/products/MediaLightbox";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

function media(id: string, alt: string): Media {
  return {
    id,
    alt,
    media_type: "image",
    original_url: `https://example.com/${id}.jpg`,
    xlarge_url: `https://example.com/${id}-xlarge.jpg`,
    large_url: `https://example.com/${id}-large.jpg`,
  } as unknown as Media;
}

const images = [media("one", "Front"), media("two", "Back")];

function renderLightbox() {
  return render(
    <MediaLightbox
      images={images}
      activeIndex={0}
      productName="Product"
      onClose={vi.fn()}
      onNavigate={vi.fn()}
    />,
  );
}

describe("MediaLightbox", () => {
  it("shows the original upload instead of the cropped rendition", () => {
    renderLightbox();
    expect(screen.getByAltText("Front")).toHaveAttribute(
      "src",
      "https://example.com/one.jpg",
    );
  });

  it("zooms in with the buttons and returns to 1x on zoom out", () => {
    renderLightbox();
    const surface = screen.getByAltText("Front").parentElement as HTMLElement;
    const scaleOf = () => surface.style.transform;

    expect(scaleOf()).toContain("scale(1)");
    expect(screen.getByLabelText("lightboxZoomOut")).toBeDisabled();

    fireEvent.click(screen.getByLabelText("lightboxZoomIn"));
    expect(scaleOf()).toContain("scale(1.6)");
    expect(screen.getByLabelText("lightboxZoomOut")).toBeEnabled();

    fireEvent.click(screen.getByLabelText("lightboxZoomOut"));
    expect(scaleOf()).toContain("scale(1)");
  });

  it("toggles zoom on double click", () => {
    renderLightbox();
    const surface = screen.getByAltText("Front").parentElement as HTMLElement;

    fireEvent.doubleClick(screen.getByAltText("Front"));
    expect(surface.style.transform).toContain("scale(2.5)");

    fireEvent.doubleClick(screen.getByAltText("Front"));
    expect(surface.style.transform).toContain("scale(1)");
  });
});
