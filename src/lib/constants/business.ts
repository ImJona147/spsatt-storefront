/**
 * Real business contact data (source: SPSATT's Facebook cover, confirmed by
 * the owner; location pin from the owner's Google Maps listing). Used by the
 * home contact section and the footer.
 */
export const BUSINESS_PHONE_DISPLAY = "294 942 3064";
export const BUSINESS_PHONE_TEL = "+522949423064";
export const BUSINESS_EMAIL = "contacto@spsatt.com.mx";
export const BUSINESS_ADDRESS =
  "Independencia Ote. 246, Belén Grande, 95700 San Andrés Tuxtla, Veracruz";

/** SPSATT pin on Google Maps (owner-provided place URL), 95700 San Andrés Tuxtla. */
export const BUSINESS_COORDS = {
  lat: 18.446339,
  lng: -95.210548,
} as const;

export const BUSINESS_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=18.446339%2C-95.210548";

/** Zero-JS OpenStreetMap embed centered on the pin. */
export const BUSINESS_MAP_EMBED_URL =
  "https://www.openstreetmap.org/export/embed.html?bbox=-95.2125%2C18.4452%2C-95.2085%2C18.4475&layer=mapnik&marker=18.446339%2C-95.210548";

export const BUSINESS_WHATSAPP_NUMBER = "522949423064";
export const BUSINESS_WHATSAPP_MESSAGE =
  "Hola SPSATT, quiero cotizar un proyecto";

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const BUSINESS_HOURS = [
  { label: "Lunes a viernes", value: "9 a.m.–2 p.m. · 4–8 p.m." },
  { label: "Sábado", value: "9 a.m.–5 p.m." },
  { label: "Domingo", value: "Cerrado" },
] as const;
