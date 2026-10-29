import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTeacherAccountService } from "@/services";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

const emptyTeacherAccount = {
  studentName: "",
  parentName: "",
  parentPhone: "",
  userEmail: "",
  address: "",
  studentClass: "",
};

export default function AdminAddTeacher() {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [createdTeacher, setCreatedTeacher] = useState(null);
  const [teacherAccount, setTeacherAccount] = useState(emptyTeacherAccount);

  async function handleCreateTeacher(event) {
    event.preventDefault();
    setIsCreatingAccount(true);
    try {
      const response = await createTeacherAccountService(teacherAccount);
      toast.success(response.message || "Teacher account created.");
      setCreatedTeacher(response.data);
      setTeacherAccount(emptyTeacherAccount);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to create the teacher account."
      );
    } finally {
      setIsCreatingAccount(false);
    }
  }

  function updateTeacherAccount(event) {
    setTeacherAccount({
      ...teacherAccount,
      [event.target.name]: event.target.value,
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-blue-700">Admin workspace</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Add teacher
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enter the teacher and emergency-contact details to issue an instructor account.
        </p>
      </div>

      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus aria-hidden="true" className="h-5 w-5 text-blue-700" />
            Teacher information
          </CardTitle>
          <p className="text-sm text-slate-500">
            A staff ID is generated automatically. Email is optional. The
            temporary password is <span className="font-mono">changepassword</span>;
            teachers must change it after signing in.
          </p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleCreateTeacher}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="space-y-2">
              <Label htmlFor="teacher-name">Teacher name</Label>
              <Input
                id="teacher-name"
                name="studentName"
                value={teacherAccount.studentName}
                onChange={updateTeacherAccount}
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher-contact-name">Emergency contact name</Label>
              <Input
                id="teacher-contact-name"
                name="parentName"
                value={teacherAccount.parentName}
                onChange={updateTeacherAccount}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher-contact-phone">Emergency contact phone</Label>
              <Input
                id="teacher-contact-phone"
                name="parentPhone"
                type="tel"
                autoComplete="tel"
                value={teacherAccount.parentPhone}
                onChange={updateTeacherAccount}
                pattern="[+()0-9 .-]{7,20}"
                title="Enter a valid phone number."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher-email">Teacher email (optional)</Label>
              <Input
                id="teacher-email"
                name="userEmail"
                type="email"
                autoComplete="email"
                value={teacherAccount.userEmail}
                onChange={updateTeacherAccount}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher-department">Department / batch</Label>
              <Input
                id="teacher-department"
                name="studentClass"
                value={teacherAccount.studentClass}
                onChange={updateTeacherAccount}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="teacher-address">Address</Label>
              <Input
                id="teacher-address"
                name="address"
                autoComplete="street-address"
                value={teacherAccount.address}
                onChange={updateTeacherAccount}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Button
                type="submit"
                className="rounded-lg"
                disabled={isCreatingAccount}
              >
                {isCreatingAccount ? "Creating..." : "Create teacher account"}
              </Button>
            </div>
          </form>
          {createdTeacher && (
            <div
              className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4"
              role="status"
            >
              <p className="font-semibold text-emerald-900">
                Teacher account created for {createdTeacher.userName}
              </p>
              <p className="mt-1 text-sm text-emerald-800">
                Emergency contact: {createdTeacher.parentName} · Phone:{" "}
                {createdTeacher.parentPhone}
              </p>
              <dl className="mt-3 grid gap-2 text-sm text-emerald-900 sm:grid-cols-2">
                <div>
                  <dt className="font-medium">Staff ID</dt>
                  <dd className="font-mono text-base">{createdTeacher.staffNumber}</dd>
                </div>
                <div>
                  <dt className="font-medium">Temporary password</dt>
                  <dd className="font-mono text-base">
                    {createdTeacher.initialPassword}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-sm text-emerald-800">
                Give these login details to the teacher and ask them to change
                the temporary password after signing in.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
