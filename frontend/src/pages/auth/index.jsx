import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthContext } from "@/context/auth-context";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function AuthPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    signInFormData,
    setSignInFormData,
    handleLoginUser,
  } = useContext(AuthContext);

  async function handleLoginSubmit(event) {
    setIsSubmitting(true);
    try {
      const user = await handleLoginUser(event);
      if (user) {
        const requestedLocation = location.state?.from;
        navigate(
          user.mustChangePassword
            ? "/change-password"
            : user.role === "admin"
              ? "/admin"
              : requestedLocation
                ? `${requestedLocation.pathname}${requestedLocation.search || ""}${requestedLocation.hash || ""}`
                : "/",
          { replace: true }
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateSignInField(event) {
    setSignInFormData({
      ...signInFormData,
      [event.target.name]: event.target.value,
    });
  }

  function renderField({
    id,
    name,
    label,
    type = "text",
    autoComplete,
    placeholder,
    value,
    onChange,
    icon: Icon,
  }) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </Label>
        <div className="relative">
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <Input
            id={id}
            name={name}
            type={type}
            autoComplete={autoComplete}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required
            className="h-11 rounded-lg border-slate-200 pl-10 placeholder:text-slate-400 focus-visible:ring-blue-600"
          />
        </div>
      </div>
    );
  }

  function renderSubmitButton(idleText, busyText) {
    return (
      <Button
        disabled={isSubmitting}
        type="submit"
        className="mt-1 h-11 w-full rounded-lg bg-blue-700 font-medium text-white transition-colors hover:bg-blue-800"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle
              aria-hidden="true"
              className="mr-2 h-4 w-4 animate-spin"
            />
            {busyText}
          </>
        ) : (
          <>
            {idleText}
            <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50 text-slate-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-blue-50 to-transparent"
      />

      <header className="relative mx-auto flex h-20 w-full max-w-6xl items-center px-5 sm:px-8">
        <Link to="/" className="inline-flex items-center gap-3 rounded-md">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white">
            <GraduationCap aria-hidden="true" className="h-6 w-6" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            IELTS &amp; PTE Prep
          </span>
        </Link>
      </header>

      <section className="relative flex flex-1 items-center justify-center px-4 pb-12 pt-4 sm:px-6">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_60px_-36px_rgba(15,23,42,0.28)] md:grid-cols-[0.9fr_1.1fr]">
          <aside className="hidden flex-col justify-between bg-slate-900 p-9 text-white md:flex">
            <div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-blue-200">
                <BookOpen aria-hidden="true" className="h-5 w-5" />
              </span>
              <h1 className="mt-8 max-w-xs text-3xl font-semibold leading-tight tracking-tight">
                Prepare with purpose. Progress with confidence.
              </h1>
              <p className="mt-4 max-w-xs text-sm leading-6 text-slate-300">
                Sign in to continue your IELTS or PTE preparation.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <ShieldCheck aria-hidden="true" className="h-4 w-4 text-blue-300" />
              Your learning journey, all in one place
            </div>
          </aside>

          <div className="p-5 sm:p-8 md:p-10">
            <div className="mb-7">
              <h2 className="text-2xl font-semibold tracking-tight">
                Welcome back
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in with your email address.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {renderField({
                id: "signin-email",
                name: "loginId",
                label: "Email",
                type: "email",
                autoComplete: "email",
                placeholder: "Enter your email",
                value: signInFormData.loginId,
                onChange: updateSignInField,
                icon: Mail,
              })}
              {renderField({
                id: "signin-password",
                name: "password",
                label: "Password",
                type: "password",
                autoComplete: "current-password",
                placeholder: "Enter your password",
                value: signInFormData.password,
                onChange: updateSignInField,
                icon: LockKeyhole,
              })}
              {renderSubmitButton("Sign in", "Signing in...")}
            </form>

            <div className="mt-4 text-right text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <p className="mt-6 text-center text-sm text-slate-500">
              New to the learning platform?{" "}
              <Link
                to="/register"
                className="font-medium text-blue-700 hover:underline"
              >
                Create a student account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;
