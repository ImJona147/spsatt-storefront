import { Suspense } from "react";
import { SignalNotFound } from "@/components/not-found/SignalNotFound";

/**
 * Ruta centinela: el middleware reescribe aquí las URLs unmatched para que
 * el 404 se resuelva dentro del layout del storefront (header/footer).
 * El pathname visible sigue siendo el original (rewrite, no redirect).
 * SignalNotFound bajo Suspense evita el issue "Could not validate `instant`"
 * de Next DevTools (NEXT_HTTP_ERROR_FALLBACK:404 sin Suspense intermedio).
 */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignalNotFound />
    </Suspense>
  );
}
