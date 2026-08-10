import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";

/**
 * StripePaymentButton
 *
 * Calls the Firebase stripeCheckoutSession function and redirects the user
 * to Stripe's hosted checkout page.
 *
 * Props:
 *   amount        — number  (e.g. 99)
 *   currency      — string  (e.g. "EGP", "USD")
 *   planName      — string  (e.g. "Pro Plan Monthly")
 *   planDuration  — string  ("monthly" | "annual" | "one-time" | "recharge")
 *   userId        — string  (current user UID)
 *   adminId       — string  (tenant/admin UID, optional)
 *   creditsToAdd  — number  (credits to grant after payment, optional)
 *   buttonText    — string  (optional button label override)
 *   disabled      — boolean (optional, defaults to false)
 *   className     — string  (optional CSS classes)
 *   style         — object  (optional inline styles)
 */

interface StripePaymentButtonProps {
  amount: number;
  currency?: string;
  planName?: string;
  planDuration?: string;
  userId: string;
  adminId?: string;
  creditsToAdd?: number;
  buttonText?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  isRtl?: boolean;
}

// Firebase Functions base URL — update this if your project / region differs
const FUNCTIONS_BASE_URL =
  "https://us-central1-partner-os-e1f2e.cloudfunctions.net";

export default function StripePaymentButton({
  amount,
  currency = "EGP",
  planName,
  planDuration = "monthly",
  userId,
  adminId,
  creditsToAdd = 0,
  buttonText,
  disabled = false,
  className = "",
  style = {},
  isRtl = false,
}: StripePaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    if (!userId) {
      setError(isRtl ? "معرّف المستخدم مطلوب" : "User ID is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${FUNCTIONS_BASE_URL}/stripeCheckoutSession`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            currency,
            planName,
            planDuration,
            userId,
            adminId,
            creditsToAdd,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            (isRtl
              ? "فشل إنشاء جلسة الدفع"
              : "Failed to create checkout session")
        );
      }

      if (data.url) {
        // Redirect to Stripe Checkout hosted page
        window.location.href = data.url;
      } else {
        throw new Error(
          isRtl
            ? "لم يُرجع الخادم رابط الدفع"
            : "No checkout URL returned from server"
        );
      }
    } catch (err: any) {
      console.error("Stripe redirect error:", err);
      setError(
        err.message ||
          (isRtl
            ? "فشل طلب الدفع. حاول مرة أخرى."
            : "Payment request failed. Please try again.")
      );
      setLoading(false);
    }
  };

  const defaultLabel = isRtl
    ? `ادفع ${amount} ${currency} بأمان`
    : `Pay ${amount} ${currency} securely`;

  return (
    <div style={{ display: "inline-block", width: "100%" }}>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading || disabled}
        className={
          className ||
          "w-full py-4 px-6 rounded-xl font-black text-sm bg-emerald-500 hover:bg-emerald-600 text-white transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        }
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          cursor: loading || disabled ? "not-allowed" : "pointer",
          opacity: loading || disabled ? 0.7 : 1,
          ...style,
        }}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>
              {buttonText
                ? `${buttonText}...`
                : isRtl
                  ? "جاري التحويل..."
                  : "Redirecting..."}
            </span>
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            <span>{buttonText || defaultLabel}</span>
          </>
        )}
      </button>

      {error && (
        <div
          style={{
            color: "var(--red, #ef4444)",
            fontSize: "12px",
            marginTop: "6px",
            textAlign: "center",
          }}
        >
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
