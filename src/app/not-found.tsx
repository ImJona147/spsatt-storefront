import { RootNotFound } from "@/components/not-found/RootNotFound";

/**
 * 404 global: atrapa URLs sin ruta matcheada (Next usa el not-found raíz,
 * no el anidado). Sin layout localizado — RootNotFound lleva su propio
 * provider de next-intl resolviendo el locale del pathname.
 */
export default function NotFound() {
  return <RootNotFound />;
}
