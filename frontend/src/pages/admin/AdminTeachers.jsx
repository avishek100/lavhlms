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
  deleteTeacherAccountService,
  fetchTeachersService,
  updateTeacherStatusService,
} from "@/services";
import { Trash2, UserRoundCheck, UserRoundX, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DeleteAccountDialog from "@/components/admin/DeleteAccountDialog";

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  const [updatingTeacherId, setUpdatingTeacherId] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [isDeletingTeacher, setIsDeletingTeacher] = useState(false);

  const loadTeachers = useCallback(async () => {
    try {
      const response = await fetchTeachersService();
      if (!response?.success) {
        toast.error(response?.message || "Unable to load teachers.");
        return;
      }
      setTeachers(response.data || []);
    } catch (error) {
      console.error("Unable to load teachers:", error);
      toast.error(error?.response?.data?.message || "Unable to load teachers.");
    } finally {
      setIsLoadingTeachers(false);
    }
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  async function handleToggleTeacher(teacher) {
    setUpdatingTeacherId(teacher._id);
    try {
      const response = await updateTeacherStatusService(
        teacher._id,
        !teacher.active
      );
      if (!response?.success) {
        toast.error(response?.message || "Unable to update teacher status.");
        return;
      }
      toast.success(response.message);
      setSelectedTeacher((current) =>
        current ? { ...current, ...response.data } : current
      );
      await loadTeachers();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to update teacher status."
      );
    } finally {
      setUpdatingTeacherId(null);
    }
  }

  async function handleDeleteTeacher(adminPassword) {
    if (!teacherToDelete) return;
    setIsDeletingTeacher(true);
    try {
      const response = await deleteTeacherAccountService(
        teacherToDelete._id,
        adminPassword
      );
      toast.success(response.message || "Teacher account deleted.");
      setTeachers((current) =>
        current.filter((teacher) => teacher._id !== teacherToDelete._id)
      );
      setSelectedTeacher(null);
      setTeacherToDelete(null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to delete the teacher account."
      );
    } finally {
      setIsDeletingTeacher(false);
    }
  }

  const activeCount = teachers.filter((teacher) => teacher.active).length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-blue-700">Admin workspace</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Teachers
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          View teacher records and manage instructor access.
        </p>
      </div>

      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Teacher directory</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              {isLoadingTeachers
                ? "Loading teacher accounts..."
                : `${teachers.length} teacher${teachers.length === 1 ? "" : "s"} total · ${activeCount} active`}
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
                  <TableHead>Department / Batch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingTeachers ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center">
                      Loading teachers...
                    </TableCell>
                  </TableRow>
                ) : teachers.length ? (
                  teachers.map((teacher) => (
                    <TableRow key={teacher._id}>
                      <TableCell className="font-medium">{teacher.userName}</TableCell>
                      <TableCell>{teacher.studentClass}</TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            teacher.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {teacher.active ? "Active" : "Blocked"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => setSelectedTeacher(teacher)}
                        >
                          View details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-10 text-center text-sm text-slate-500"
                    >
                      No teacher accounts have been created yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selectedTeacher)}
        onOpenChange={(open) => {
          if (!open) setSelectedTeacher(null);
        }}
      >
        {selectedTeacher && (
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTeacher.userName}</DialogTitle>
              <DialogDescription>
                Complete teacher account details
              </DialogDescription>
            </DialogHeader>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-slate-500">Staff ID</dt>
                <dd className="font-mono font-medium">
                  {selectedTeacher.staffNumber}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Department / batch</dt>
                <dd className="font-medium">{selectedTeacher.studentClass}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Emergency contact</dt>
                <dd className="font-medium">{selectedTeacher.parentName}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Contact phone</dt>
                <dd className="font-medium">{selectedTeacher.parentPhone}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Email</dt>
                <dd className="break-all font-medium">
                  {selectedTeacher.userEmail || "Not provided"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-slate-500">Address</dt>
                <dd className="font-medium">{selectedTeacher.address}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Account status</dt>
                <dd className="font-medium">
                  {selectedTeacher.active ? "Active" : "Blocked"}
                </dd>
              </div>
            </dl>
            <Button
              variant={selectedTeacher.active ? "destructive" : "default"}
              className="w-full sm:w-fit"
              disabled={updatingTeacherId === selectedTeacher._id}
              onClick={() => handleToggleTeacher(selectedTeacher)}
            >
              {selectedTeacher.active ? (
                <UserRoundX aria-hidden="true" className="mr-2 h-4 w-4" />
              ) : (
                <UserRoundCheck aria-hidden="true" className="mr-2 h-4 w-4" />
              )}
              {selectedTeacher.active ? "Block teacher" : "Unblock teacher"}
            </Button>
            <Button
              variant="destructive"
              className="w-full sm:ml-2 sm:w-fit"
              disabled={isDeletingTeacher}
              onClick={() => {
                setTeacherToDelete(selectedTeacher);
                setSelectedTeacher(null);
              }}
            >
              <Trash2 aria-hidden="true" className="mr-2 h-4 w-4" />
              Delete teacher
            </Button>
          </DialogContent>
        )}
      </Dialog>
      <DeleteAccountDialog
        account={teacherToDelete}
        accountType="teacher"
        isDeleting={isDeletingTeacher}
        onOpenChange={(open) => {
          if (!open && !isDeletingTeacher) setTeacherToDelete(null);
        }}
        onConfirm={handleDeleteTeacher}
      />
    </div>
  );
}
