import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SPSATT – Artículos publicitarios",
    short_name: "SPSATT",
    description: "Artículos publicitarios en San Andrés Tuxtla, Veracruz.",
    start_url: "/",
    display: "standalone",
    background_color: "#36488F",
    theme_color: "#36488F",
    lang: "es-MX",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
