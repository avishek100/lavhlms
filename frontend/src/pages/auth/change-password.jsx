import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthContext } from "@/context/auth-context";
import { KeyRound } from "lucide-react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChangePasswordPage() {
  const { auth, handleChangePassword } = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      return;
    }

    setIsSubmitting(true);
    const changed = await handleChangePassword({
      currentPassword,
      newPassword,
    });
    setIsSubmitting(false);

    if (changed) {
      navigate(
        auth.user.role === "admin"
          ? "/admin"
          : auth.user.role === "instructor"
            ? "/instructor"
            : "/home",
        { replace: true }
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <KeyRound aria-hidden="true" className="h-5 w-5" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold text-slate-900">
          Change your temporary password
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Your initial password is shared by all new students. Change it now to
          keep your account private. Choose at least 8 characters.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              aria-invalid={Boolean(confirmPassword && newPassword !== confirmPassword)}
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-sm text-rose-600" role="alert">
                Passwords do not match.
              </p>
            )}
          </div>
          <Button
            className="w-full"
            type="submit"
            disabled={
              isSubmitting ||
              !newPassword ||
              newPassword !== confirmPassword
            }
          >
            {isSubmitting ? "Updating password..." : "Set new password"}
          </Button>
        </form>
      </section>
    </main>
  );
}
