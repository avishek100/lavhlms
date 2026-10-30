import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { filterOptions } from "@/config";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import { fetchStudentViewCourseListService } from "@/services";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  FileText,
  GraduationCap,
  Headphones,
  RotateCcw,
  Search,
  Sparkles,
  ShieldCheck,
  SlidersHorizontal,
  Target,
} from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import banner from "../../../../public/banner-img.png";

function StudentHomePage() {
  const { auth } = useContext(AuthContext);
  const { studentViewCoursesList, setStudentViewCoursesList } =
    useContext(StudentContext);
  const navigate = useNavigate();
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState("");
  const [courseFilters, setCourseFilters] = useState({});
  const filteredCourses = useMemo(
    () =>
      studentViewCoursesList.filter((course) =>
        Object.entries(courseFilters).every(([field, selectedValues]) => {
          if (!selectedValues.length) return true;
          const courseValues = Array.isArray(course[field])
            ? course[field]
            : [course[field]];
          return selectedValues.some((value) => courseValues.includes(value));
        })
      ),
    [courseFilters, studentViewCoursesList]
  );
  const activeFilterCount = Object.values(courseFilters).reduce(
    (count, selectedValues) => count + selectedValues.length,
    0
  );
  const filterIcons = {
    category: GraduationCap,
    formats: BookOpen,
    purposes: Target,
    timeSlots: Clock3,
  };
  const isPendingApproval =
    auth?.user?.role === "student" && auth.user.approved === false;

  function handleCourseFilterChange(section, optionId) {
    setCourseFilters((currentFilters) => {
      const selectedValues = currentFilters[section] || [];
      const nextValues = selectedValues.includes(optionId)
        ? selectedValues.filter((value) => value !== optionId)
        : [...selectedValues, optionId];

      return {
        ...currentFilters,
        [section]: nextValues,
      };
    });
  }

  function handleNavigateToCoursesPage(examProgramId) {
    sessionStorage.removeItem("filters");
    sessionStorage.setItem(
      "filters",
      JSON.stringify({ category: [examProgramId] })
    );
    navigate("/courses");
  }

  async function handleCourseNavigate(getCurrentCourseId) {
    navigate(`/course/details/${getCurrentCourseId}`);
  }

  useEffect(() => {
    let isCurrent = true;
    setIsLoadingCourses(true);
    setCoursesError("");
    fetchStudentViewCourseListService()
      .then((response) => {
        if (!isCurrent) return;
        if (!response?.success) {
          throw new Error(response?.message || "Could not load courses.");
        }
        setStudentViewCoursesList(response.data || []);
      })
      .catch((error) => {
        if (isCurrent) {
          console.error("Unable to load preparation courses:", error);
          setStudentViewCoursesList([]);
          setCoursesError(
            error?.response?.data?.message ||
              error?.message ||
              "Could not load courses. Please try again."
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoadingCourses(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [setStudentViewCoursesList]);
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8 lg:px-8">
        <aside className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
                <SlidersHorizontal
                  aria-hidden="true"
                  className="h-4 w-4"
                />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-950">
                  Filters
                </h3>
                <p className="text-xs text-slate-400">
                  {activeFilterCount
                    ? `${activeFilterCount} selected`
                    : "Find your course"}
                </p>
              </div>
            </div>
            {activeFilterCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                className="h-8 gap-1.5 px-2 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                onClick={() => setCourseFilters({})}
              >
                <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>
          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
            {Object.entries(filterOptions).map(([section, options]) => {
              const Icon = filterIcons[section];
              const sectionTitle =
                section === "category"
                  ? "Course"
                  : section === "formats"
                    ? "Format"
                    : section === "purposes"
                      ? "Purpose"
                      : "Time Slot";

              return (
                <fieldset
                  className="border-b border-slate-100 px-4 py-3 last:border-b-0"
                  key={section}
                >
                  <legend className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <Icon
                      aria-hidden="true"
                      className="h-4 w-4 text-slate-800"
                    />
                    {sectionTitle}
                  </legend>
                  <div className="grid gap-0.5">
                    {section === "formats" && (
                      <Label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50">
                        <Checkbox
                          checked={
                            (courseFilters[section] || []).length ===
                            options.length
                          }
                          onCheckedChange={() =>
                            setCourseFilters((currentFilters) => ({
                              ...currentFilters,
                              [section]:
                                (currentFilters[section] || []).length ===
                                options.length
                                  ? []
                                  : options.map((option) => option.id),
                            }))
                          }
                        />
                        Select all
                      </Label>
                    )}
                    {options.map((option) => (
                      <Label
                        key={option.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
                      >
                        <Checkbox
                          checked={(courseFilters[section] || []).includes(
                            option.id
                          )}
                          onCheckedChange={() =>
                            handleCourseFilterChange(section, option.id)
                          }
                        />
                        {option.label}
                      </Label>
                    ))}
                  </div>
                </fieldset>
              );
            })}
          </div>
        </aside>
        <div className="min-w-0">
      <section className="grid items-center gap-8 py-12 md:py-16 lg:grid-cols-[1fr_1.1fr]">
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
          {isPendingApproval ? (
            <div className="mt-8 flex max-w-lg items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
              />
              <div>
                <p className="font-semibold">Your registration is pending approval</p>
                <p className="mt-1 text-sm leading-6 text-amber-900">
                  Student ID:{" "}
                  <span className="font-mono font-semibold">
                    {auth.user.studentNumber}
                  </span>
                  . You can browse courses and preview free lessons now. Full
                  course access unlocks after an administrator approves your
                  account.
                </p>
              </div>
            </div>
          ) : (
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
          )}
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
        <div className="py-10">
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

      <section className="py-12">
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {isLoadingCourses ? (
            <p className="col-span-full rounded-xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500">
              Loading preparation courses…
            </p>
          ) : coursesError ? (
            <p className="col-span-full rounded-xl border border-rose-200 bg-rose-50 px-5 py-10 text-center text-sm text-rose-700">
              {coursesError}
            </p>
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((courseItem) => (
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
                className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <img
                  src={courseItem?.image}
                  width={300}
                  height={150}
                  alt={courseItem?.title || "Course"}
                  className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="line-clamp-2 min-h-12 font-semibold text-slate-900">
                    {courseItem?.title}
                  </h3>
                  {courseItem?.subtitle &&
                    courseItem.subtitle !== courseItem.title && (
                      <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-700">
                        {courseItem.subtitle}
                      </p>
                    )}
                  {courseItem?.description && (
                    <p className="mt-2 line-clamp-3 text-sm leading-5 text-slate-500">
                      {courseItem.description}
                    </p>
                  )}
                  <p className="mt-auto pt-4 text-sm font-medium text-emerald-700">
                    Preview lessons · Sign in for full access
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500">
              {activeFilterCount
                ? "No courses match these filters. Try changing or clearing your selections."
                : "No preparation courses are available yet. Check back soon."}
            </p>
          )}
        </div>
      </section>
        </div>
      </div>
    </main>
  );
}

export default StudentHomePage;
