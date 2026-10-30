import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerStudentAccountService } from "@/services";
import { GraduationCap, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

const initialFormData = {
  studentName: "",
  userEmail: "",
  userPhone: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registration, setRegistration] = useState(null);

  function updateField(event) {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await registerStudentAccountService({
        studentName: formData.studentName,
        userEmail: formData.userEmail,
        userPhone: formData.userPhone,
        password: formData.password,
      });
      if (!response?.success) {
        toast.error(response?.message || "Unable to submit your registration.");
        return;
      }

      setRegistration(response.data);
      setFormData(initialFormData);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to submit your registration."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700 text-white">
            <GraduationCap aria-hidden="true" className="h-6 w-6" />
          </span>
          <h1 className="mt-5 text-2xl font-semibold text-slate-900">
            Create a student account
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Register for IELTS and PTE learning resources. Course access starts
            after an administrator approves your student ID.
          </p>
        </div>

        {registration ? (
          <div className="mt-6 space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700"
              />
              <div>
                <h2 className="font-semibold text-emerald-950">
                  Registration submitted
                </h2>
                <p className="mt-1 text-sm leading-6 text-emerald-800">
                  You can sign in to view the overview while your account is
                  pending. Courses become available after approval.
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Your student ID
              </p>
              <p className="mt-1 font-mono text-xl font-semibold text-slate-900">
                {registration.studentNumber}
              </p>
              <p className="mt-1 break-all text-sm text-slate-600">
                {registration.userEmail}
              </p>
            </div>
            <Button asChild className="w-full">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-name">Full name</Label>
              <Input
                id="student-name"
                name="studentName"
                autoComplete="name"
                maxLength={100}
                value={formData.studentName}
                onChange={updateField}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-email">Email address</Label>
              <Input
                id="student-email"
                name="userEmail"
                type="email"
                autoComplete="email"
                maxLength={254}
                value={formData.userEmail}
                onChange={updateField}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-phone">Phone number</Label>
              <Input
                id="student-phone"
                name="userPhone"
                type="tel"
                autoComplete="tel"
                pattern="[+\(\)0-9 .\-]{7,20}"
                title="Enter a valid phone number."
                value={formData.userPhone}
                onChange={updateField}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-password">Password</Label>
              <Input
                id="student-password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                value={formData.password}
                onChange={updateField}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                value={formData.confirmPassword}
                onChange={updateField}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Create account"}
            </Button>
            <p className="text-center text-sm text-slate-600">
              Already registered?{" "}
              <Link className="font-medium text-blue-700 hover:underline" to="/login">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </section>
    </main>
  );
}
