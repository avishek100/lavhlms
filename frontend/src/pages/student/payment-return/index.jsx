import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { captureAndFinalizePaymentService } from "@/services";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function PaypalPaymentReturnPage() {
  const [status, setStatus] = useState("processing");
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const paymentId = params.get("paymentId");
  const payerId = params.get("PayerID");

  useEffect(() => {
    if (paymentId && payerId) {
      async function capturePayment() {
        const storedOrderId = sessionStorage.getItem("currentOrderId");
        const orderId = storedOrderId ? JSON.parse(storedOrderId) : null;

        if (!orderId) {
          setStatus("error");
          return;
        }

        try {
          const response = await captureAndFinalizePaymentService(
            paymentId,
            payerId,
            orderId
          );

          if (response?.success) {
            sessionStorage.removeItem("currentOrderId");
            setStatus("success");
            window.location.assign("/student-courses");
          } else {
            setStatus("error");
          }
        } catch (error) {
          console.error("Unable to complete PayPal payment:", error);
          setStatus("error");
        }
      }

      capturePayment();
    } else {
      setStatus("error");
    }
  }, [payerId, paymentId]);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="items-center px-8 pt-9 text-center">
          {status === "processing" ? (
            <LoaderCircle aria-hidden="true" className="mb-3 h-10 w-10 animate-spin text-blue-700" />
          ) : status === "success" ? (
            <CheckCircle2 aria-hidden="true" className="mb-3 h-10 w-10 text-emerald-600" />
          ) : (
            <XCircle aria-hidden="true" className="mb-3 h-10 w-10 text-rose-600" />
          )}
          <CardTitle className="text-xl">
            {status === "processing"
              ? "Confirming your payment"
              : status === "success"
                ? "Payment confirmed"
                : "Payment could not be confirmed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-8 text-center">
          <p className="text-sm leading-6 text-slate-500">
            {status === "processing"
              ? "Please keep this page open while we securely confirm your PayPal payment."
              : status === "success"
                ? "Your course is ready. Taking you to your courses now."
                : "We couldn’t verify this payment. You can return to your courses or try again."}
          </p>
          {status === "error" && (
            <Button asChild className="mt-5 rounded-lg">
              <Link to="/student-courses">Go to my courses</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default PaypalPaymentReturnPage;
