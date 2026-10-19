import type {
  Cart,
  CreditCard,
  PaymentMethod,
  PaymentSession,
} from "@spree/sdk";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", async () => {
  const actual = await vi.importActual("next-intl");
  return {
    ...actual,
    useTranslations: () => (key: string) => key,
  };
});

vi.mock("@/lib/data/credit-cards", () => ({
  getCreditCards: vi.fn(),
}));

vi.mock("@/lib/data/payment", () => ({
  createCheckoutPaymentSession: vi.fn(),
  updateCheckoutPaymentSession: vi.fn(),
  createDirectPayment: vi.fn(),
}));

vi.mock("@/components/checkout/StripePaymentForm", () => ({
  StripePaymentForm: () => null,
  confirmWithSavedCard: vi.fn(),
}));

vi.mock("@/components/checkout/AdyenPaymentForm", () => ({
  AdyenPaymentForm: () => null,
}));

vi.mock("@/components/checkout/PayPalPaymentForm", () => ({
  PayPalPaymentForm: () => null,
}));

import { getCreditCards } from "@/lib/data/credit-cards";
import {
  createCheckoutPaymentSession,
  updateCheckoutPaymentSession,
} from "@/lib/data/payment";
import { PaymentSection } from "../PaymentSection";

const mockGetCreditCards = vi.mocked(getCreditCards);
const mockCreateSession = vi.mocked(createCheckoutPaymentSession);
const mockUpdateSession = vi.mocked(updateCheckoutPaymentSession);

const stripeMethod = {
  id: "pm_method_1",
  name: "Stripe",
  type: "stripe",
  session_required: true,
} as PaymentMethod;

const defaultCard = {
  id: "cc_1",
  brand: "visa",
  last4: "4242",
  month: 12,
  year: 2030,
  default: true,
  gateway_payment_profile_id: "pm_default_123",
} as CreditCard;

const baseCart = {
  id: "cart_1",
  total: "150.00",
  amount_due: "150.00",
  currency: "USD",
  payment_methods: [stripeMethod],
} as Cart;

function sessionResult() {
  return {
    success: true as const,
    session: {
      id: "ps_1",
      status: "pending",
      currency: "USD",
      external_id: "pi_1",
      external_data: { client_secret: "cs_test_abc" },
      customer_external_id: null,
      expires_at: null,
      amount: "150.00",
      payment_method_id: "pm_method_1",
      order_id: null,
      cart_id: "cart_1",
      payment_method: stripeMethod,
    } satisfies PaymentSession,
  };
}

function renderSection(cart: Cart) {
  return render(
    <PaymentSection
      cart={cart}
      countries={[]}
      isAuthenticated
      fetchStates={async () => []}
      onUpdateBillingAddress={async () => true}
      onPaymentComplete={async () => {}}
      processing={false}
      setProcessing={() => {}}
    />,
  );
}

describe("PaymentSection session management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSession.mockResolvedValue(sessionResult());
    mockUpdateSession.mockResolvedValue(sessionResult());
  });

  it("creates a single mount session that includes the default saved card", async () => {
    let resolveCards!: (value: { data: CreditCard[] }) => void;
    mockGetCreditCards.mockReturnValue(
      new Promise((resolve) => {
        resolveCards = resolve;
      }),
    );

    renderSection(baseCart);

    resolveCards({ data: [defaultCard] });

    await waitFor(() => {
      expect(mockCreateSession).toHaveBeenCalledTimes(1);
    });
    expect(mockCreateSession).toHaveBeenCalledWith("cart_1", "pm_method_1", {
      return_url: expect.stringContaining("/confirm-payment/cart_1"),
      stripe_payment_method_id: "pm_default_123",
    });
  });

  it("updates the session amount in place when the cart total changes", async () => {
    mockGetCreditCards.mockResolvedValue({ data: [defaultCard] });

    const { rerender } = renderSection(baseCart);

    await waitFor(() => {
      expect(mockCreateSession).toHaveBeenCalledTimes(1);
    });

    rerender(
      <PaymentSection
        cart={{ ...baseCart, total: "160.00" } as Cart}
        countries={[]}
        isAuthenticated
        fetchStates={async () => []}
        onUpdateBillingAddress={async () => true}
        onPaymentComplete={async () => {}}
        processing={false}
        setProcessing={() => {}}
      />,
    );

    await waitFor(() => {
      expect(mockUpdateSession).toHaveBeenCalledWith("cart_1", "ps_1", {
        amount: "160.00",
      });
    });
    expect(mockCreateSession).toHaveBeenCalledTimes(1);
  });
});
