import { loadStripe } from "@stripe/stripe-js";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export const isStripeTestMode =
  stripePublishableKey?.startsWith("pk_test_") === true;

/** Whether Stripe is configured (publishable key present in env). */
export const isStripeConfigured = Boolean(stripePublishableKey);

export const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : Promise.resolve(null);
