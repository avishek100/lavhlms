import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStudentAccountService } from "@/services";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

const emptyStudentAccount = {
  studentName: "",
  parentName: "",
  parentPhone: "",
  userPhone: "",
  userEmail: "",
  address: "",
  studentClass: "",
};

export default function AdminAddStudent() {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [createdStudent, setCreatedStudent] = useState(null);
  const [studentAccount, setStudentAccount] = useState(emptyStudentAccount);

  async function handleCreateStudent(event) {
    event.preventDefault();
    setIsCreatingAccount(true);

    try {
      const response = await createStudentAccountService(studentAccount);
      toast.success(response.message || "Student account created.");
      setCreatedStudent(response.data);
      setStudentAccount(emptyStudentAccount);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to create the student account."
      );
    } finally {
      setIsCreatingAccount(false);
    }
  }

  function updateStudentAccount(event) {
    setStudentAccount({
      ...studentAccount,
      [event.target.name]: event.target.value,
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-blue-700">Admin workspace</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Add student
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enter the student and guardian details to issue a college account.
        </p>
      </div>

      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus aria-hidden="true" className="h-5 w-5 text-blue-700" />
            Student information
          </CardTitle>
          <p className="text-sm text-slate-500">
            Student ID is generated automatically. Student email and both
            contact phone numbers are required.
            The temporary password is{" "}
            <span className="font-mono">changepassword</span>; students must
            change it after signing in.
          </p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleCreateStudent}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="space-y-2">
              <Label htmlFor="student-name">Student name</Label>
              <Input
                id="student-name"
                name="studentName"
                value={studentAccount.studentName}
                onChange={updateStudentAccount}
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent-name">Parent / guardian name</Label>
              <Input
                id="parent-name"
                name="parentName"
                value={studentAccount.parentName}
                onChange={updateStudentAccount}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent-phone">Parent / guardian phone</Label>
              <Input
                id="parent-phone"
                name="parentPhone"
                type="tel"
                autoComplete="tel"
                value={studentAccount.parentPhone}
                onChange={updateStudentAccount}
                pattern="[+()0-9 .-]{7,20}"
                title="Enter a valid phone number."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-phone">Student phone</Label>
              <Input
                id="student-phone"
                name="userPhone"
                type="tel"
                autoComplete="tel"
                value={studentAccount.userPhone}
                onChange={updateStudentAccount}
                pattern="[+()0-9 .-]{7,20}"
                title="Enter a valid phone number."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-email">Student email</Label>
              <Input
                id="student-email"
                name="userEmail"
                type="email"
                autoComplete="email"
                value={studentAccount.userEmail}
                onChange={updateStudentAccount}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-class">Class / batch</Label>
              <Input
                id="student-class"
                name="studentClass"
                value={studentAccount.studentClass}
                onChange={updateStudentAccount}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="student-address">Address</Label>
              <Input
                id="student-address"
                name="address"
                autoComplete="street-address"
                value={studentAccount.address}
                onChange={updateStudentAccount}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Button
                type="submit"
                className="rounded-lg"
                disabled={isCreatingAccount}
              >
                {isCreatingAccount ? "Creating..." : "Create account"}
              </Button>
            </div>
          </form>
          {createdStudent && (
            <div
              className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4"
              role="status"
            >
              <p className="font-semibold text-emerald-900">
                Student account created for {createdStudent.userName}
              </p>
              <p className="mt-1 text-sm text-emerald-800">
                Guardian: {createdStudent.parentName} · Phone:{" "}
                {createdStudent.parentPhone}
              </p>
              <p className="mt-1 text-sm text-emerald-800">
                Student phone: {createdStudent.userPhone} · Email:{" "}
                {createdStudent.userEmail}
              </p>
              <dl className="mt-3 grid gap-2 text-sm text-emerald-900 sm:grid-cols-2">
                <div>
                  <dt className="font-medium">Student number</dt>
                  <dd className="font-mono text-base">
                    {createdStudent.studentNumber}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Temporary password</dt>
                  <dd className="font-mono text-base">
                    {createdStudent.initialPassword}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-sm text-emerald-800">
                Give these login details to the student and ask them to change
                the temporary password after signing in.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
