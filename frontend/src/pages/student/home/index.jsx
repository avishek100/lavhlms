import { Button } from "@/components/ui/button";
import { StudentContext } from "@/context/student-context";
import { fetchStudentViewCourseListService } from "@/services";
import {
  ArrowRight,
  BookOpen,
  FileText,
  GraduationCap,
  Headphones,
  Search,
  Sparkles,
} from "lucide-react";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import banner from "../../../../public/banner-img.png";

function StudentHomePage() {
  const { studentViewCoursesList, setStudentViewCoursesList } =
    useContext(StudentContext);
  const navigate = useNavigate();

  function handleNavigateToCoursesPage(examProgramId) {
    sessionStorage.removeItem("filters");
    sessionStorage.setItem(
      "filters",
      JSON.stringify({ category: [examProgramId] })
    );
    navigate("/courses");
  }

  async function fetchAllStudentViewCourses() {
    const response = await fetchStudentViewCourseListService();
    if (response?.success) setStudentViewCoursesList(response?.data);
  }

  async function handleCourseNavigate(getCurrentCourseId) {
    navigate(`/course/details/${getCurrentCourseId}`);
  }

  useEffect(() => {
    fetchAllStudentViewCourses();
  }, []);
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[1fr_1.1fr] lg:px-8">
        <div className="max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-sm font-medium text-blue-800">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            IELTS &amp; PTE preparation
          </div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">
            Feel ready for your English test.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
            Build your reading, writing, listening, and speaking skills with
            focused IELTS and PTE preparation, practical lessons, and a clear
            path toward your goals.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              onClick={() => navigate("/courses")}
              className="h-11 gap-2 rounded-lg px-5"
            >
              Explore preparation courses
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                handleNavigateToCoursesPage("ielts-preparation")
              }
              className="h-11 rounded-lg border-slate-200 px-5"
            >
              Find IELTS lessons
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">
              <BookOpen aria-hidden="true" className="h-4 w-4 text-blue-700" />
              IELTS preparation
            </span>
            <span className="inline-flex items-center gap-2">
              <GraduationCap aria-hidden="true" className="h-4 w-4 text-blue-700" />
              PTE preparation
            </span>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-3 rounded-3xl bg-blue-100/60" />
          <img
            src={banner}
            width={600}
            height={400}
            alt="Students preparing for an English language exam"
            className="relative max-h-[420px] w-full rounded-2xl border border-white object-cover shadow-sm"
          />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div>
              <p className="text-sm font-medium text-blue-700">
                Choose your exam
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                Prepare for IELTS or PTE
              </h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                name: "IELTS",
                path: "/ielts",
                description:
                  "Explore lessons and practice materials for your IELTS preparation.",
                icon: FileText,
              },
              {
                name: "PTE",
                path: "/pte",
                description:
                  "Find focused practice to help you prepare for the PTE test.",
                icon: Headphones,
              },
            ].map(({ path, name, description, icon: Icon }) => (
              <Button
                className="h-auto justify-between gap-5 whitespace-normal rounded-xl border-slate-200 bg-white p-5 text-left text-slate-700 shadow-none hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
                variant="outline"
                key={name}
                onClick={() => navigate(path)}
              >
                <span className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-base font-semibold text-slate-900">
                      {name} preparation
                    </span>
                    <span className="mt-1 block text-sm font-normal leading-6 text-slate-500">
                      {description}
                    </span>
                  </span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-blue-700"
                />
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-blue-700">
              Learn with focused practice
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Preparation courses
            </h2>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/courses")}
            className="gap-2 text-blue-700 hover:text-blue-800"
          >
            Browse all preparation
            <Search aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {studentViewCoursesList && studentViewCoursesList.length > 0 ? (
            studentViewCoursesList.map((courseItem) => (
              <div
                key={courseItem?._id}
                onClick={() => handleCourseNavigate(courseItem?._id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    handleCourseNavigate(courseItem?._id);
                  }
                }}
                role="button"
                tabIndex={0}
                className="group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <img
                  src={courseItem?.image}
                  width={300}
                  height={150}
                  alt={courseItem?.title || "Course"}
                  className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="p-4">
                  <h3 className="line-clamp-2 min-h-12 font-semibold text-slate-900">
                    {courseItem?.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {courseItem?.instructorName}
                  </p>
                  <p className="mt-4 text-sm font-medium text-emerald-700">
                    English test preparation
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500">
              No preparation courses are available yet. Check back soon.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default StudentHomePage;
