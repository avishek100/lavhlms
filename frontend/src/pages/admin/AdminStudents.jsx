import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteStudentAccountService,
  fetchStudentsService,
  updateStudentApprovalService,
  updateStudentStatusService,
} from "@/services";
import { Trash2, UserRoundCheck, UserRoundX, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DeleteAccountDialog from "@/components/admin/DeleteAccountDialog";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [updatingStudentId, setUpdatingStudentId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);

  const loadStudents = useCallback(async () => {
    try {
      const response = await fetchStudentsService();
      if (!response?.success) {
        toast.error(response?.message || "Unable to load students.");
        return;
      }
      setStudents(response.data || []);
    } catch (error) {
      console.error("Unable to load students:", error);
      toast.error(error?.response?.data?.message || "Unable to load students.");
    } finally {
      setIsLoadingStudents(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  async function handleToggleStudent(student) {
    setUpdatingStudentId(student._id);
    try {
      const response = await updateStudentStatusService(
        student._id,
        !student.active
      );
      if (!response?.success) {
        toast.error(response?.message || "Unable to update student status.");
        return;
      }
      toast.success(response.message);
      setSelectedStudent((currentStudent) =>
        currentStudent ? { ...currentStudent, ...response.data } : currentStudent
      );
      await loadStudents();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to update student status."
      );
    } finally {
      setUpdatingStudentId(null);
    }
  }

  async function handleApproveStudent(student) {
    setUpdatingStudentId(student._id);
    try {
      const response = await updateStudentApprovalService(student._id, true);
      if (!response?.success) {
        toast.error(response?.message || "Unable to approve student.");
        return;
      }

      toast.success(response.message || "Student approved.");
      setStudents((current) =>
        current.map((item) =>
          item._id === student._id ? { ...item, ...response.data } : item
        )
      );
      setSelectedStudent((current) =>
        current?._id === student._id
          ? { ...current, ...response.data }
          : current
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to approve student."
      );
    } finally {
      setUpdatingStudentId(null);
    }
  }

  async function handleDeleteStudent(adminPassword) {
    if (!studentToDelete) return;
    setIsDeletingStudent(true);
    try {
      const response = await deleteStudentAccountService(
        studentToDelete._id,
        adminPassword
      );
      toast.success(response.message || "Student account deleted.");
      setStudents((current) =>
        current.filter((student) => student._id !== studentToDelete._id)
      );
      setSelectedStudent(null);
      setStudentToDelete(null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to delete the student account."
      );
    } finally {
      setIsDeletingStudent(false);
    }
  }

  const activeCount = students.filter(
    (student) => student.active && student.approved !== false
  ).length;
  const pendingCount = students.filter(
    (student) => student.approved === false
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-blue-700">Admin workspace</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Students
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          View student records and manage their access to courses.
        </p>
      </div>

      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Student directory</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              {isLoadingStudents
                ? "Loading student accounts..."
                : `${students.length} total · ${activeCount} approved and active · ${pendingCount} pending`}
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Users aria-hidden="true" className="h-5 w-5" />
          </span>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingStudents ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center">
                      Loading students...
                    </TableCell>
                  </TableRow>
                ) : students.length ? (
                  students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="font-medium">
                        {student.userName}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {student.studentNumber}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            student.approved === false
                              ? "bg-amber-50 text-amber-800"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {student.approved === false ? "Pending" : "Approved"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            student.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {student.active ? "Active" : "Blocked"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {student.approved === false && (
                          <Button
                            variant="default"
                            size="sm"
                            className="mr-2 rounded-lg"
                            disabled={updatingStudentId === student._id}
                            onClick={() => handleApproveStudent(student)}
                          >
                            Approve
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => setSelectedStudent(student)}
                        >
                          View details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-slate-500"
                    >
                      No student accounts have been created yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selectedStudent)}
        onOpenChange={(open) => {
          if (!open) setSelectedStudent(null);
        }}
      >
        {selectedStudent && (
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedStudent.userName}</DialogTitle>
              <DialogDescription>
                Complete student account details
              </DialogDescription>
            </DialogHeader>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-slate-500">Student ID</dt>
                <dd className="font-mono font-medium">
                  {selectedStudent.studentNumber}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Course access</dt>
                <dd className="font-medium">
                  {selectedStudent.approved === false
                    ? "Waiting for approval"
                    : "Approved"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Parent / guardian</dt>
                <dd className="font-medium">
                  {selectedStudent.parentName || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Guardian phone</dt>
                <dd className="font-medium">
                  {selectedStudent.parentPhone || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Student phone</dt>
                <dd className="font-medium">{selectedStudent.userPhone || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Email</dt>
                <dd className="break-all font-medium">
                  {selectedStudent.userEmail || "Not provided"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-slate-500">Address</dt>
                <dd className="font-medium">
                  {selectedStudent.address || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Account status</dt>
                <dd className="font-medium">
                  {selectedStudent.active ? "Active" : "Blocked"}
                </dd>
              </div>
            </dl>
            {selectedStudent.approved === false && (
              <Button
                className="w-full sm:w-fit"
                disabled={updatingStudentId === selectedStudent._id}
                onClick={() => handleApproveStudent(selectedStudent)}
              >
                {updatingStudentId === selectedStudent._id
                  ? "Approving..."
                  : "Approve student"}
              </Button>
            )}
            <Button
              variant={selectedStudent.active ? "destructive" : "default"}
              className="w-full sm:w-fit"
              disabled={updatingStudentId === selectedStudent._id}
              onClick={() => handleToggleStudent(selectedStudent)}
            >
              {selectedStudent.active ? (
                <UserRoundX aria-hidden="true" className="mr-2 h-4 w-4" />
              ) : (
                <UserRoundCheck aria-hidden="true" className="mr-2 h-4 w-4" />
              )}
              {selectedStudent.active ? "Block student" : "Unblock student"}
            </Button>
            <Button
              variant="destructive"
              className="w-full sm:ml-2 sm:w-fit"
              disabled={isDeletingStudent}
              onClick={() => {
                setStudentToDelete(selectedStudent);
                setSelectedStudent(null);
              }}
            >
              <Trash2 aria-hidden="true" className="mr-2 h-4 w-4" />
              Delete student
            </Button>
          </DialogContent>
        )}
      </Dialog>
      <DeleteAccountDialog
        account={studentToDelete}
        accountType="student"
        isDeleting={isDeletingStudent}
        onOpenChange={(open) => {
          if (!open && !isDeletingStudent) setStudentToDelete(null);
        }}
        onConfirm={handleDeleteStudent}
      />
    </div>
  );
}
