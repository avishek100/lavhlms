import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import { fetchStudentBoughtCoursesService } from "@/services";
import { ArrowRight, BookOpen, Watch } from "lucide-react";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function StudentCoursesPage() {
  const { auth } = useContext(AuthContext);
  const { studentBoughtCoursesList, setStudentBoughtCoursesList } =
    useContext(StudentContext);
  const navigate = useNavigate();

  async function fetchStudentBoughtCourses() {
    const response = await fetchStudentBoughtCoursesService(auth?.user?._id);
    if (response?.success) {
      setStudentBoughtCoursesList(response?.data);
    }
  }
  useEffect(() => {
    fetchStudentBoughtCourses();
  }, []);

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-blue-700">Your learning</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          My courses
        </h1>
        <p className="mt-2 text-slate-500">
          Continue your IELTS and PTE preparation and track your progress.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {studentBoughtCoursesList && studentBoughtCoursesList.length > 0 ? (
          studentBoughtCoursesList.map((course) => (
            <Card key={course?.courseId || course?._id} className="group flex flex-col overflow-hidden border-slate-200 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex-grow p-4">
                <img
                  src={course?.courseImage}
                  alt={course?.title}
                  className="mb-4 h-48 w-full rounded-lg object-cover"
                />
                <h3 className="font-semibold text-slate-900">{course?.title}</h3>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  onClick={() =>
                    navigate(`/course-progress/${course?.courseId}`)
                  }
                  className="h-10 flex-1 gap-2 rounded-lg"
                >
                  <Watch className="mr-2 h-4 w-4" />
                  Continue learning
                  <ArrowRight aria-hidden="true" className="ml-auto h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <BookOpen aria-hidden="true" className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No courses yet
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Courses you enroll in will appear here automatically.
            </p>
            <Button className="mt-5 rounded-lg" onClick={() => navigate("/courses")}>
              Explore courses
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

export default StudentCoursesPage;
