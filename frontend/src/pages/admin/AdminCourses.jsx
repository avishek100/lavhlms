import InstructorCourses from "@/components/instructor-view/courses";
import { Skeleton } from "@/components/ui/skeleton";
import { InstructorContext } from "@/context/instructor-context";
import { fetchInstructorCourseListService } from "@/services";
import { useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("all");
  const { setInstructorCoursesList } = useContext(InstructorContext);

  useEffect(() => {
    async function loadCourses() {
      try {
        const response = await fetchInstructorCourseListService();
        if (response?.success) {
          const allCourses = response.data || [];
          setCourses(allCourses);
          setInstructorCoursesList(allCourses);
        } else {
          toast.error(response?.message || "Unable to load courses.");
        }
      } catch (error) {
        console.error("Unable to load admin courses:", error);
        toast.error("Unable to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, [setInstructorCoursesList]);

  const classes = useMemo(
    () => [...new Set(courses.map((course) => course.studentClass).filter(Boolean))].sort(),
    [courses]
  );
  const filteredCourses =
    selectedClass === "all"
      ? courses
      : courses.filter((course) => course.studentClass === selectedClass);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-blue-700">Admin workspace</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Courses
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Review every teacher’s courses by class/batch and manage lesson content.
        </p>
      </div>
      {loading ? (
        <Skeleton className="h-72 rounded-xl" />
      ) : (
        <>
          <div className="max-w-sm space-y-2">
            <label
              htmlFor="admin-course-class-filter"
              className="text-sm font-medium text-slate-700"
            >
              Filter by class / batch
            </label>
            <select
              id="admin-course-class-filter"
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={selectedClass}
              onChange={(event) => setSelectedClass(event.target.value)}
            >
              <option value="all">All classes and batches</option>
              {classes.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>
          <InstructorCourses listOfCourses={filteredCourses} />
        </>
      )}
    </div>
  );
}
