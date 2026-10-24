import { SpreeError } from "@spree/sdk";

const TRANSIENT_404_RETRY_DELAYS_MS = [250, 500];

const sleep = (ms: number) =>
  new Promise((resolve: (value: unknown) => void) => setTimeout(resolve, ms));

/**
 * The Spree Store API intermittently answers 404 on resource lookups that do
 * exist (observed on both product and category endpoints in production
 * logs). A real miss is rare enough that two short retries are cheap; a
 * transient miss otherwise surfaces to the visitor as "not found". Call
 * inside the "use cache: remote" function so a recovered success is cached
 * normally and a final failure is never cached.
 */
export async function withTransient404Retry<T>(
  fetchResource: () => Promise<T>,
): Promise<T> {
  let lastError: unknown;
  for (
    let attempt = 0;
    attempt <= TRANSIENT_404_RETRY_DELAYS_MS.length;
    attempt++
  ) {
    try {
      return await fetchResource();
    } catch (error) {
      const isTransient404 =
        error instanceof SpreeError && error.status === 404;
      if (!isTransient404 || attempt === TRANSIENT_404_RETRY_DELAYS_MS.length) {
        throw error;
      }
      lastError = error;
      await sleep(TRANSIENT_404_RETRY_DELAYS_MS[attempt] ?? 0);
    }
  }
  throw lastError;
}
