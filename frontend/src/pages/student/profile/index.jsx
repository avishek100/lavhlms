import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthContext } from "@/context/auth-context";
import {
  deleteProfileImageService,
  fetchProfileService,
  updateProfileImageService,
} from "@/services";
import {
  Camera,
  KeyRound,
  LoaderCircle,
  LogOut,
  Trash2,
  UserRound,
} from "lucide-react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

export default function StudentProfilePage() {
  const { handleChangePassword, resetCredentials } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const fileInputRef = useRef(null);

  const loadProfile = useCallback(async () => {
    try {
      const response = await fetchProfileService();
      if (!response?.success) {
        toast.error(response?.message || "Unable to load your profile.");
        return;
      }
      setProfile(response.data);
    } catch (error) {
      console.error("Unable to load student profile:", error);
      toast.error(error?.response?.data?.message || "Unable to load your profile.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function handleImageSelected(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      toast.error("Choose a JPG, PNG, GIF, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile pictures must be 2 MB or smaller.");
      return;
    }

    setIsUploading(true);
    try {
      const response = await updateProfileImageService(file);
      setProfile((current) => ({ ...current, image: response.data.image }));
      window.dispatchEvent(new Event("student-profile-updated"));
      toast.success(response.message || "Profile picture updated.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to update your profile picture."
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemoveImage() {
    setIsRemovingImage(true);
    try {
      const response = await deleteProfileImageService();
      setProfile((current) => ({ ...current, image: null }));
      window.dispatchEvent(new Event("student-profile-updated"));
      toast.success(response.message || "Profile picture removed.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to remove your profile picture."
      );
    } finally {
      setIsRemovingImage(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("The new passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    const changed = await handleChangePassword({
      currentPassword,
      newPassword,
    });
    setIsChangingPassword(false);

    if (changed) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setProfile((current) => ({ ...current, mustChangePassword: false }));
    }
  }

  function handleSignOut() {
    resetCredentials();
    sessionStorage.removeItem("filters");
    navigate("/login", { replace: true });
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <p className="text-sm text-slate-500">Your profile could not be loaded.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-700">Student account</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              My profile
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              View your college details, manage your profile picture, and update your password.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            onClick={handleSignOut}
          >
            <LogOut aria-hidden="true" className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>

      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Profile picture</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-blue-700">
            {profile.image ? (
              <img
                src={`${API_BASE_URL}${profile.image}`}
                alt={`${profile.userName}'s profile`}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound aria-hidden="true" className="h-12 w-12" />
            )}
          </div>
          <div>
            <p className="font-medium text-slate-900">{profile.userName}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="sr-only"
                onChange={handleImageSelected}
              />
              <Button
                type="button"
                className="rounded-lg"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <LoaderCircle aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Camera aria-hidden="true" className="mr-2 h-4 w-4" />
                )}
                {isUploading ? "Uploading..." : "Upload picture"}
              </Button>
              {profile.image && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg"
                  disabled={isRemovingImage}
                  onClick={handleRemoveImage}
                >
                  <Trash2 aria-hidden="true" className="mr-2 h-4 w-4" />
                  {isRemovingImage ? "Removing..." : "Remove picture"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Student details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500">Full name</dt>
              <dd className="mt-1 font-medium text-slate-900">{profile.userName}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Student ID</dt>
              <dd className="mt-1 font-mono font-medium text-slate-900">
                {profile.studentNumber || "Not assigned"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Class / Batch</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {profile.studentClass || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Email</dt>
              <dd className="mt-1 break-all font-medium text-slate-900">
                {profile.userEmail || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Student phone</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {profile.userPhone || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Parent / guardian</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {profile.parentName || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Guardian phone</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {profile.parentPhone || "Not provided"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-slate-500">Address</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {profile.address || "Not provided"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound aria-hidden="true" className="h-5 w-5 text-blue-700" />
            Change password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
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
                aria-invalid={Boolean(
                  confirmPassword && newPassword !== confirmPassword
                )}
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-rose-600" role="alert">
                  Passwords do not match.
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Button
                type="submit"
                className="rounded-lg"
                disabled={
                  isChangingPassword ||
                  newPassword.length < 8 ||
                  newPassword !== confirmPassword
                }
              >
                {isChangingPassword ? "Updating password..." : "Update password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
