import AdminCourseList from "@/components/instructor-view/courses";
import { Skeleton } from "@/components/ui/skeleton";
import { courseExamOptions, getCourseCategoryLabel } from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import { fetchInstructorCourseListService } from "@/services";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
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

  const filteredCourses =
    selectedCategory === "all"
      ? courses
      : courses.filter((course) => course.category === selectedCategory);
  const categories = [
    ...courseExamOptions,
    ...Array.from(
      new Set(
        courses
          .map((course) => course.category)
          .filter(
            (category) =>
              category &&
              !courseExamOptions.some((option) => option.id === category)
          )
      )
    ).map((category) => ({
      id: category,
      label: getCourseCategoryLabel(category),
    })),
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-blue-700">Admin workspace</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Courses
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Manage all courses and lesson content.
        </p>
      </div>
      {loading ? (
        <Skeleton className="h-72 rounded-xl" />
      ) : (
        <>
          <div className="max-w-sm space-y-2">
            <label
              htmlFor="admin-course-category-filter"
              className="text-sm font-medium text-slate-700"
            >
              Filter
            </label>
            <select
              id="admin-course-category-filter"
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option value="all">All courses</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <AdminCourseList
            listOfCourses={filteredCourses}
            onCourseDeleted={(courseId) =>
              setCourses((current) =>
                current.filter((course) => course._id !== courseId)
              )
            }
          />
        </>
      )}
    </div>
  );
}
