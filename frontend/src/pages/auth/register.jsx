import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700 text-white">
          <GraduationCap aria-hidden="true" className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold text-slate-900">
          IELTS &amp; PTE Prep accounts
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Student accounts are created by your instructor. Contact them to
          receive your login details.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link to="/login">Go to sign in</Link>
        </Button>
      </section>
    </main>
  );
}
