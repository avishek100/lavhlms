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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
  getCourseCategoryLabel,
} from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import { deleteCourseService } from "@/services";
import { Edit, Trash2 } from "lucide-react";
import PropTypes from "prop-types";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

function AdminCourseList({
  listOfCourses = [],
  onCourseDeleted,
}) {
  const navigate = useNavigate();
  const {
    setInstructorCoursesList,
    setCurrentEditedCourseId,
    setCourseLandingFormData,
    setCourseCurriculumFormData,
  } = useContext(InstructorContext);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [adminPassword, setAdminPassword] = useState("");

  useEffect(() => {
    setAdminPassword("");
  }, [courseToDelete]);

  async function handleDeleteCourse(event) {
    event.preventDefault();
    if (!courseToDelete) return;
    setDeletingCourseId(courseToDelete._id);
    try {
      const response = await deleteCourseService(
        courseToDelete._id,
        adminPassword
      );
      if (!response?.success) {
        toast.error(response?.message || "Unable to delete the course.");
        return;
      }
      setInstructorCoursesList((courses) =>
        courses.filter((course) => course._id !== courseToDelete._id)
      );
      onCourseDeleted?.(courseToDelete._id);
      toast.success(response.message || "Course deleted.");
      setCourseToDelete(null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to delete the course."
      );
    } finally {
      setDeletingCourseId(null);
    }
  }

  return (
    <Card className="rounded-xl border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg font-semibold text-slate-900">
          All courses
        </CardTitle>
        <Button
          onClick={() => {
            setCurrentEditedCourseId(null);
            setCourseLandingFormData(courseLandingInitialFormData);
            setCourseCurriculumFormData(courseCurriculumInitialFormData);
            navigate("/admin/courses/new");
          }}
          className="h-10 rounded-lg px-4"
        >
          Create course
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Exam program</TableHead>
                <TableHead>Lessons</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listOfCourses.length > 0
                ? listOfCourses.map((course) => (
                    <TableRow key={course?._id}>
                      <TableCell className="font-medium">
                        {course?.title}
                      </TableCell>
                      <TableCell>
                        {getCourseCategoryLabel(course?.category) || "Unassigned"}
                      </TableCell>
                      <TableCell>
                        {course?.curriculum?.length || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          aria-label={`Edit ${course?.title || "course"}`}
                          onClick={() => {
                            navigate(`/admin/courses/${course?._id}/edit`);
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          <Edit aria-hidden="true" className="h-4 w-4" />
                        </Button>
                        <Button
                          aria-label={`Delete ${course?.title || "course"}`}
                          onClick={() => setCourseToDelete(course)}
                          variant="ghost"
                          size="sm"
                          className="text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                        >
                          <Trash2 aria-hidden="true" className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-12 text-center text-sm text-slate-500"
                      >
                        You haven’t created any courses yet.
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <Dialog
        open={Boolean(courseToDelete)}
        onOpenChange={(open) => {
          if (!open && !deletingCourseId) setCourseToDelete(null);
        }}
      >
        {courseToDelete && (
          <DialogContent>
            <form onSubmit={handleDeleteCourse} className="space-y-5">
              <DialogHeader>
                <DialogTitle>Delete this course?</DialogTitle>
                <DialogDescription>
                  This permanently deletes “{courseToDelete.title}” and removes
                  student enrollments and progress. Payment history and existing
                  notices are retained. This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="delete-course-admin-password">
                  Administrator password
                </Label>
                <Input
                  id="delete-course-admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={Boolean(deletingCourseId)}
                  onClick={() => setCourseToDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={Boolean(deletingCourseId)}
                >
                  {deletingCourseId ? "Deleting..." : "Delete course"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </Card>
  );
}

AdminCourseList.propTypes = {
  listOfCourses: PropTypes.arrayOf(PropTypes.object),
  onCourseDeleted: PropTypes.func,
};

export default AdminCourseList;
