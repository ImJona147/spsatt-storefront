import { notFound } from "next/navigation";

/**
 * Lanza notFound() dentro de un <Suspense> del caller: la validación
 * `instant` de Next 16.3.8 (dev tools) permite el error cuando hay un
 * Suspense entre el throw y el boundary — sin eso, cada 404 contaría como
 * Issue de consola ("Could not validate `instant`…").
 */
export function SignalNotFound() {
  notFound();
  return null;
}
