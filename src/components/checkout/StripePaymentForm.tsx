"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { CircleAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { stripePromise } from "@/lib/utils/stripe";

export interface StripePaymentFormHandle {
  confirmPayment: (returnUrl: string) => Promise<{ error?: string }>;
  fetchUpdates: () => Promise<void>;
}

interface StripePaymentFormProps {
  clientSecret: string;
  onReady: (handle: StripePaymentFormHandle) => void;
}

function StripePaymentFormInner({
  onReady,
  appearanceTheme,
}: {
  onReady: (handle: StripePaymentFormHandle) => void;
  appearanceTheme: "stripe" | "night";
}) {
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    elements?.update({
      appearance: {
        theme: appearanceTheme,
        variables: {
          fontFamily: "Inter, system-ui, sans-serif",
          fontSizeBase: "14px",
          borderRadius: "6px",
        },
      },
    });
  }, [appearanceTheme, elements]);
  const [error, setError] = useState<string | null>(null);

  const confirmPayment = useCallback(
    async (returnUrl: string) => {
      if (!stripe || !elements) {
        return { error: "Stripe has not loaded yet" };
      }

      setError(null);

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: "if_required",
      });

      if (result.error) {
        const message =
          result.error.message || "An error occurred during payment.";
        setError(message);
        return { error: message };
      }

      return {};
    },
    [stripe, elements],
  );

  const fetchUpdates = useCallback(async () => {
    if (!elements) return;
    await elements.fetchUpdates();
  }, [elements]);

  useEffect(() => {
    if (stripe && elements) {
      onReady({ confirmPayment, fetchUpdates });
    }
  }, [stripe, elements, confirmPayment, fetchUpdates, onReady]);

  return (
    <div>
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      {error && (
        <Alert variant="destructive" className="mt-3">
          <CircleAlert />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export function StripePaymentForm({
  clientSecret,
  onReady,
}: StripePaymentFormProps) {
  const { resolvedTheme } = useTheme();
  const appearanceTheme = resolvedTheme === "dark" ? "night" : "stripe";

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: appearanceTheme,
          variables: {
            fontFamily: "Inter, system-ui, sans-serif",
            fontSizeBase: "14px",
            borderRadius: "6px",
          },
          rules: {
            ".Input": {
              paddingTop: "13px",
              paddingBottom: "13px",
              boxShadow: "",
            },
          },
        },
      }}
    >
      <StripePaymentFormInner
        onReady={onReady}
        appearanceTheme={appearanceTheme}
      />
    </Elements>
  );
}

/**
 * Confirm payment with a saved card (no Elements/PaymentElement needed).
 */
export async function confirmWithSavedCard(
  clientSecret: string,
  paymentMethodId: string,
  returnUrl: string,
): Promise<{ error?: string }> {
  const stripe = await stripePromise;
  if (!stripe) {
    return { error: "Stripe has not loaded yet" };
  }

  const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: paymentMethodId,
    return_url: returnUrl,
  });

  if (result.error) {
    return {
      error: result.error.message || "An error occurred during payment.",
    };
  }

  return {};
}
