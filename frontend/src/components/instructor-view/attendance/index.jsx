import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchAttendanceClassesService,
  fetchAttendanceRosterService,
  saveAttendanceService,
} from "@/services";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

function getTodayDate() {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

export default function InstructorAttendance() {
  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState("");
  const [date, setDate] = useState(getTodayDate);
  const [students, setStudents] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadClasses() {
      try {
        const response = await fetchAttendanceClassesService();
        if (!response?.success) {
          toast.error(response?.message || "Unable to load class list.");
          return;
        }
        const availableClasses = response.data || [];
        setClasses(availableClasses);
        setClassName((current) => current || availableClasses[0] || "");
      } catch (error) {
        toast.error(error?.response?.data?.message || "Unable to load class list.");
      } finally {
        setLoadingClasses(false);
      }
    }

    loadClasses();
  }, []);

  useEffect(() => {
    if (!className || !date) {
      setStudents([]);
      return;
    }

    let current = true;
    setLoadingRoster(true);
    fetchAttendanceRosterService(className, date)
      .then((response) => {
        if (!current) return;
        if (!response?.success) {
          toast.error(response?.message || "Unable to load attendance roster.");
          return;
        }
        setStudents(response.data || []);
      })
      .catch((error) => {
        if (current) {
          toast.error(
            error?.response?.data?.message || "Unable to load attendance roster."
          );
        }
      })
      .finally(() => {
        if (current) setLoadingRoster(false);
      });

    return () => {
      current = false;
    };
  }, [className, date]);

  function setStudentPresence(studentId, present) {
    setStudents((current) =>
      current.map((student) =>
        student._id === studentId ? { ...student, present } : student
      )
    );
  }

  async function handleSaveAttendance() {
    setSaving(true);
    try {
      const response = await saveAttendanceService({
        className,
        date,
        records: students.map(({ _id, present }) => ({
          studentId: _id,
          present,
        })),
      });
      toast.success(response.message || "Attendance saved.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to save attendance.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="rounded-xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Take attendance</CardTitle>
        <p className="text-sm text-slate-500">
          Choose a class and date, mark each active student, and save the register.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="attendance-class" className="text-sm font-medium">
              Class / batch
            </label>
            <select
              id="attendance-class"
              className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
              value={className}
              onChange={(event) => setClassName(event.target.value)}
              disabled={loadingClasses || classes.length === 0}
            >
              {classes.length === 0 ? (
                <option value="">
                  {loadingClasses ? "Loading classes..." : "No student classes found"}
                </option>
              ) : (
                classes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="attendance-date" className="text-sm font-medium">
              Date
            </label>
            <input
              id="attendance-date"
              type="date"
              className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead className="text-right">Attendance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingRoster ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center">
                    Loading students...
                  </TableCell>
                </TableRow>
              ) : students.length ? (
                students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell className="font-medium">{student.userName}</TableCell>
                    <TableCell className="font-mono">{student.studentNumber}</TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          size="sm"
                          variant={student.present ? "default" : "outline"}
                          onClick={() => setStudentPresence(student._id, true)}
                        >
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant={!student.present ? "destructive" : "outline"}
                          onClick={() => setStudentPresence(student._id, false)}
                        >
                          Absent
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="py-10 text-center text-slate-500">
                    {className
                      ? "No active students are in this class."
                      : "Create student accounts with a class/batch to take attendance."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {students.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {students.filter((student) => student.present).length} present ·{" "}
              {students.filter((student) => !student.present).length} absent
            </p>
            <Button
              className="rounded-lg"
              disabled={saving || loadingRoster}
              onClick={handleSaveAttendance}
            >
              {saving ? "Saving..." : "Save attendance"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
