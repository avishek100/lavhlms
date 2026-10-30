import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  requestPasswordResetOtpService,
  resetPasswordWithTokenService,
  verifyPasswordResetOtpService,
} from "@/services";
import {
  ArrowLeft,
  GraduationCap,
  KeyRound,
  LoaderCircle,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOtpRequested, setIsOtpRequested] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const otpInputRefs = useRef([]);

  async function handleRequestOtp(event) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await requestPasswordResetOtpService(email.trim());
      if (!response?.success) {
        toast.error(response?.message || "Unable to send a reset code.");
        return;
      }

      toast.success(response.message || "Check your email for a reset code.");
      setIsOtpRequested(true);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to send a reset code."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendOtp() {
    setIsResending(true);
    try {
      const response = await requestPasswordResetOtpService(email.trim());
      if (!response?.success) {
        toast.error(response?.message || "Unable to resend the reset code.");
        return;
      }

      toast.success(response.message || "Check your email for a reset code.");
      setOtpDigits(["", "", "", "", "", ""]);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to resend the reset code."
      );
    } finally {
      setIsResending(false);
    }
  }

  function updateOtpDigit(index, value) {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      setOtpDigits((current) =>
        current.map((digit, digitIndex) =>
          digitIndex === index ? "" : digit
        )
      );
      return;
    }

    setOtpDigits((current) => {
      const nextDigits = [...current];
      digits.slice(0, 6 - index).split("").forEach((digit, offset) => {
        nextDigits[index + offset] = digit;
      });
      return nextDigits;
    });
    otpInputRefs.current[Math.min(index + digits.length, 5)]?.focus();
  }

  function handleOtpKeyDown(index, event) {
    if (
      event.key === "Backspace" &&
      !event.currentTarget.value &&
      index > 0
    ) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpPaste(event, index) {
    event.preventDefault();
    const digits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6 - index);
    if (!digits) return;

    setOtpDigits((current) => {
      const nextDigits = [...current];
      digits.split("").forEach((digit, offset) => {
        nextDigits[index + offset] = digit;
      });
      return nextDigits;
    });
    otpInputRefs.current[Math.min(index + digits.length, 5)]?.focus();
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await verifyPasswordResetOtpService({
        email: email.trim(),
        otp: otpDigits.join(""),
      });
      if (!response?.data?.resetToken) {
        toast.error("Unable to verify the reset code. Please try again.");
        return;
      }

      setResetToken(response.data.resetToken);
      setIsOtpVerified(true);
      toast.success(response.message || "Code verified.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to verify the reset code."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await resetPasswordWithTokenService({
        email: email.trim(),
        resetToken,
        newPassword,
      });
      toast.success(response.message || "Password reset successfully.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to reset your password."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="flex min-h-[680px] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:min-h-[700px] sm:p-10">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-700"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to sign in
        </Link>
        <div className="mx-auto mt-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          {isOtpVerified ? (
            <ShieldCheck aria-hidden="true" className="h-10 w-10" />
          ) : isOtpRequested ? (
            <KeyRound aria-hidden="true" className="h-10 w-10" />
          ) : (
            <Mail aria-hidden="true" className="h-10 w-10" />
          )}
        </div>
        <div className="mt-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {isOtpVerified
              ? "Create a new password"
              : isOtpRequested
                ? "Enter OTP code"
                : "Reset your password"}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            {isOtpVerified
              ? "Your email has been verified. Choose a new password for your account."
              : isOtpRequested
                ? `If an account is registered with ${email}, a six-digit code has been sent. Check your inbox and spam folder.`
                : "Enter your account email and we’ll send you a secure password reset code."}
          </p>
        </div>

        {!isOtpRequested ? (
          <form onSubmit={handleRequestOtp} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-slate-700">
                Email address
              </Label>
              <div className="relative">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                />
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-14 rounded-xl border-slate-200 bg-white pl-12 text-base shadow-sm focus-visible:ring-blue-600"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="h-14 w-full rounded-lg bg-blue-700 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <LoaderCircle
                  aria-hidden="true"
                  className="mr-2 h-5 w-5 animate-spin"
                />
              )}
              {isSubmitting ? "Sending code..." : "Send reset code"}
            </Button>
          </form>
        ) : !isOtpVerified ? (
          <form onSubmit={handleVerifyOtp} className="mt-8 space-y-5">
            <div className="flex flex-wrap items-center justify-center gap-x-2 text-sm text-slate-500">
              <span>Enter the code for</span>
              <span className="font-medium text-slate-700">{email}</span>
              <button
                type="button"
                className="font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-800"
                onClick={() => {
                  setIsOtpRequested(false);
                  setIsOtpVerified(false);
                  setResetToken("");
                  setOtpDigits(["", "", "", "", "", ""]);
                }}
              >
                Change
              </button>
            </div>
            <fieldset>
              <legend className="sr-only">Six-digit verification code</legend>
              <div className="flex justify-center gap-2 sm:gap-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      otpInputRefs.current[index] = element;
                    }}
                    aria-label={`Code digit ${index + 1}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={index === 0 ? 6 : 1}
                    value={otpDigits[index]}
                    onChange={(event) =>
                      updateOtpDigit(index, event.target.value)
                    }
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    onPaste={(event) => handleOtpPaste(event, index)}
                    required
                    className="h-14 min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 text-center text-xl font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:h-[4.5rem] sm:max-w-[3.75rem]"
                  />
                ))}
              </div>
            </fieldset>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 py-1 text-sm font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting || isResending}
              onClick={handleResendOtp}
            >
              {isResending && (
                <LoaderCircle
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin"
                />
              )}
              Resend code
            </button>
            <Button
              type="submit"
              className="h-14 w-full rounded-lg bg-blue-700 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
              disabled={
                isSubmitting ||
                isResending ||
                otpDigits.some((digit) => !digit)
              }
            >
              {isSubmitting && (
                <LoaderCircle
                  aria-hidden="true"
                  className="mr-2 h-5 w-5 animate-spin"
                />
              )}
              {isSubmitting ? "Verifying code..." : "Verify code"}
            </Button>
            <p className="text-center text-sm text-slate-500">
              If you don’t receive a code, confirm this is your registration
              email or{" "}
              <Link
                to="/register"
                className="font-medium text-blue-700 hover:underline"
              >
                create an account
              </Link>
              .
            </p>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="mt-8 space-y-5">
            <p className="flex items-center justify-center gap-2 text-sm text-slate-600">
              <ShieldCheck
                aria-hidden="true"
                className="h-4 w-4 text-blue-700"
              />
              Code verified for <span className="font-medium">{email}</span>
            </p>
            <div className="space-y-2">
              <Label htmlFor="reset-new-password" className="text-slate-700">
                New password
              </Label>
              <Input
                id="reset-new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="h-12 rounded-lg border-slate-200 bg-white focus-visible:ring-blue-600"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-confirm-password" className="text-slate-700">
                Confirm new password
              </Label>
              <Input
                id="reset-confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-12 rounded-lg border-slate-200 bg-white focus-visible:ring-blue-600"
                required
              />
            </div>
            <Button
              type="submit"
              className="h-14 w-full rounded-lg bg-blue-700 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
              disabled={isSubmitting || !resetToken}
            >
              {isSubmitting && (
                <LoaderCircle
                  aria-hidden="true"
                  className="mr-2 h-5 w-5 animate-spin"
                />
              )}
              {isSubmitting ? "Resetting password..." : "Change password"}
            </Button>
          </form>
        )}

        <p className="mt-auto flex items-center justify-center gap-2 pt-6 text-xs text-slate-500">
          {isOtpVerified ? (
            <ShieldCheck aria-hidden="true" className="h-4 w-4 text-blue-700" />
          ) : isOtpRequested ? (
            <ShieldCheck aria-hidden="true" className="h-4 w-4 text-blue-700" />
          ) : (
            <GraduationCap
              aria-hidden="true"
              className="h-4 w-4 text-blue-700"
            />
          )}
          Your account information is kept secure.
        </p>
      </section>
    </main>
  );
}
