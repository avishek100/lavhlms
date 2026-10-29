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
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import { AuthContext } from "@/context/auth-context";
import { Edit } from "lucide-react";
import PropTypes from "prop-types";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

function InstructorCourses({ listOfCourses = [] }) {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const isAdmin = auth?.user?.role === "admin";
  const {
    setCurrentEditedCourseId,
    setCourseLandingFormData,
    setCourseCurriculumFormData,
  } = useContext(InstructorContext);

  return (
    <Card className="rounded-xl border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg font-semibold text-slate-900">
          {isAdmin ? "All courses" : "Your courses"}
        </CardTitle>
        <Button
          onClick={() => {
            setCurrentEditedCourseId(null);
            setCourseLandingFormData(courseLandingInitialFormData);
            setCourseCurriculumFormData(courseCurriculumInitialFormData);
            navigate(
              isAdmin ? "/admin/courses/new" : "/instructor/create-new-course"
            );
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
                <TableHead>Class / batch</TableHead>
                {isAdmin && <TableHead>Teacher</TableHead>}
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
                        {course?.studentClass || "Unassigned"}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          {course?.instructorName || "Unknown teacher"}
                        </TableCell>
                      )}
                      <TableCell>
                        {course?.curriculum?.length || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          aria-label={`Edit ${course?.title || "course"}`}
                          onClick={() => {
                            navigate(
                              isAdmin
                                ? `/admin/courses/${course?._id}/edit`
                                : `/instructor/edit-course/${course?._id}`
                            );
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          <Edit aria-hidden="true" className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                : (
                    <TableRow>
                      <TableCell
                        colSpan={isAdmin ? 5 : 4}
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
    </Card>
  );
}

InstructorCourses.propTypes = {
  listOfCourses: PropTypes.arrayOf(PropTypes.object),
};

export default InstructorCourses;
