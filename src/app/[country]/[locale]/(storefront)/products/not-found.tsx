import { ProductsNotFound } from "@/components/not-found/ProductsNotFound";

/**
 * 404 de la sección de productos: atrapa notFound() de products/[slug]
 * (slug inexistente) y URLs sueltas bajo /products/*.
 */
export default function NotFound() {
  return <ProductsNotFound />;
}
