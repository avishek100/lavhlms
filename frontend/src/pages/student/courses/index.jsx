import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  filterOptions,
  getCourseCategoryLabel,
  sortOptions,
} from "@/config";
import { StudentContext } from "@/context/student-context";
import { fetchStudentViewCourseListService } from "@/services";
import {
  ArrowUpDownIcon,
  BookOpen,
  Clock3,
  GraduationCap,
  RotateCcw,
  SlidersHorizontal,
  Target,
} from "lucide-react";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function createSearchParamsHelper(filterParams) {
  const queryParams = [];

  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");

      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    }
  }

  return queryParams.join("&");
}

function StudentViewCoursesPage() {
  const [sort, setSort] = useState("title-atoz");
  const [filters, setFilters] = useState({});
  const [searchError, setSearchError] = useState("");
  const requestIdRef = useRef(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const {
    studentViewCoursesList,
    setStudentViewCoursesList,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);
  const navigate = useNavigate();
  const courseCategoryOptions = useMemo(() => {
    const categories = new Set([
      ...filterOptions.category.map((option) => option.id),
      ...studentViewCoursesList
        .map((course) => course.category)
        .filter(Boolean),
    ]);

    return Array.from(categories).map((id) => ({
      id,
      label: getCourseCategoryLabel(id),
    }));
  }, [studentViewCoursesList]);
  const visibleCourses = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    const filterValues = {
      category: "category",
      formats: "formats",
      purposes: "purposes",
      timeSlots: "timeSlots",
    };

    return studentViewCoursesList.filter((course) => {
      const matchesFilters = Object.entries(filterValues).every(
        ([filterKey, courseKey]) => {
          const selectedOptions = filters[filterKey] || [];
          if (!selectedOptions.length) return true;

          const courseValues = Array.isArray(course[courseKey])
            ? course[courseKey]
            : [course[courseKey]];
          return selectedOptions.some((option) => courseValues.includes(option));
        }
      );
      const matchesSearch =
        !query ||
        [
          course?.title,
          course?.subtitle,
          course?.description,
          course?.instructorName,
        ].some((value) => value?.toLocaleLowerCase().includes(query));

      return matchesFilters && matchesSearch;
    });
  }, [filters, searchQuery, studentViewCoursesList]);
  const activeFilterCount = Object.values(filters).reduce(
    (count, selectedOptions) =>
      count + (Array.isArray(selectedOptions) ? selectedOptions.length : 0),
    0
  );
  const filterIcons = {
    category: GraduationCap,
    formats: BookOpen,
    purposes: Target,
    timeSlots: Clock3,
  };

  function handleFilterOnChange(getSectionId, getCurrentOption) {
    const selectedOptions = filters[getSectionId] || [];
    const nextSelectedOptions = selectedOptions.includes(getCurrentOption.id)
      ? selectedOptions.filter((id) => id !== getCurrentOption.id)
      : [...selectedOptions, getCurrentOption.id];
    const cpyFilters = { ...filters };

    if (nextSelectedOptions.length) cpyFilters[getSectionId] = nextSelectedOptions;
    else delete cpyFilters[getSectionId];

    setFilters(cpyFilters);
    sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
  }

  const fetchAllStudentViewCourses = useCallback(async (filters, sort) => {
    const requestId = ++requestIdRef.current;
    const query = new URLSearchParams({ sortBy: sort });
    if (searchQuery.trim()) query.set("search", searchQuery.trim());

    setSearchError("");
    setStudentViewCoursesList([]);
    setLoadingState(true);

    try {
      const response = await fetchStudentViewCourseListService(query);
      if (requestId !== requestIdRef.current) return;

      if (!response?.success) {
        throw new Error(response?.message || "Could not load courses.");
      }

      setStudentViewCoursesList(response.data || []);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      setStudentViewCoursesList([]);
      setSearchError(
        error?.response?.data?.message ||
          error?.message ||
          "Could not load courses. Please try again."
      );
    } finally {
      if (requestId === requestIdRef.current) setLoadingState(false);
    }
  }, [searchQuery, setLoadingState, setStudentViewCoursesList]);

  async function handleCourseNavigate(getCurrentCourseId) {
    navigate(`/course/details/${getCurrentCourseId}`);
  }

  useEffect(() => {
    const buildQueryStringForFilters = createSearchParamsHelper(filters);
    const params = new URLSearchParams(buildQueryStringForFilters);
    if (searchQuery) params.set("search", searchQuery);
    setSearchParams(params);
  }, [filters, searchQuery, setSearchParams]);

  useEffect(() => {
    setSort("title-atoz");
    const storedFilters = JSON.parse(sessionStorage.getItem("filters")) || {};
    const supportedFilters = Object.keys(filterOptions);
    const initialFilters = Object.fromEntries(
      Object.entries(storedFilters).filter(
        ([key, value]) =>
          supportedFilters.includes(key) &&
          Array.isArray(value) &&
          value.length > 0
      )
    );
    setFilters(initialFilters);
    sessionStorage.setItem("filters", JSON.stringify(initialFilters));
  }, []);

  useEffect(() => {
    if (filters !== null && sort !== null)
      fetchAllStudentViewCourses(filters, sort);
    return () => {
      requestIdRef.current += 1;
    };
  }, [fetchAllStudentViewCourses, filters, sort]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("filters");
    };
  }, []);

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-blue-700">
          IELTS &amp; PTE preparation
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Explore preparation courses
        </h1>
        <p className="mt-2 text-slate-500">
          Find focused lessons and practice materials for your English test.
        </p>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="h-fit w-full shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-24 lg:w-72">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
                <p className="text-xs text-slate-500">
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
                className="h-8 gap-1.5 px-2 text-xs text-slate-500 hover:text-blue-700"
                onClick={() => {
                  setFilters({});
                  sessionStorage.setItem("filters", "{}");
                }}
              >
                <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>
          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
            {Object.keys(filterOptions).map((sectionItem) => (
              <fieldset
                className="border-b border-slate-100 p-4 last:border-b-0"
                key={sectionItem}
              >
                <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                  {(() => {
                    const Icon = filterIcons[sectionItem];
                    return (
                      <Icon
                        aria-hidden="true"
                        className="h-4 w-4 text-blue-700"
                      />
                    );
                  })()}
                  {sectionItem === "category"
                    ? "Course"
                    : sectionItem === "formats"
                      ? "Format"
                      : sectionItem === "purposes"
                        ? "Purpose"
                        : "Time Slot"}
                </legend>
                {sectionItem === "formats" && (
                  <p className="-mt-2 mb-2 text-xs text-slate-500">
                    Select all that apply
                  </p>
                )}
                <div className="grid gap-2.5">
                  {(sectionItem === "category"
                    ? courseCategoryOptions
                    : filterOptions[sectionItem]
                  ).map((option) => (
                    <Label
                      key={option.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm font-normal text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
                    >
                      <Checkbox
                        checked={(filters[sectionItem] || []).includes(
                          option.id
                        )}
                        onCheckedChange={() =>
                          handleFilterOnChange(sectionItem, option)
                        }
                      />
                      {option.label}
                    </Label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </aside>
        <section className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <span className="text-sm text-slate-500">
              <span className="font-semibold text-slate-900">
                {loadingState ? "…" : visibleCourses.length}
              </span>{" "}
              {visibleCourses.length === 1 ? "course" : "courses"}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 gap-2 rounded-lg border-slate-200"
                >
                  <ArrowUpDownIcon className="h-4 w-4" />
                  <span className="font-medium">Sort by</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuRadioGroup
                  value={sort}
                  onValueChange={(value) => setSort(value)}
                >
                  {sortOptions.map((sortItem) => (
                    <DropdownMenuRadioItem
                      value={sortItem.id}
                      key={sortItem.id}
                    >
                      {sortItem.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-4">
            {loadingState ? (
              <Skeleton />
            ) : searchError ? (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-8 text-center"
              >
                <p className="font-medium text-rose-800">{searchError}</p>
              </div>
            ) : visibleCourses.length > 0 ? (
              visibleCourses.map((courseItem) => (
                <Card
                  onClick={() => handleCourseNavigate(courseItem?._id)}
                  className="cursor-pointer overflow-hidden rounded-xl border-slate-200 shadow-sm transition-shadow hover:shadow-md"
                  key={courseItem?._id}
                >
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
                    <div className="h-44 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-32 sm:w-48">
                      <img
                        src={courseItem?.image}
                        alt={courseItem?.title || "Course"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="mb-2 text-lg font-semibold text-slate-900">
                        {courseItem?.title}
                      </CardTitle>
                      <p className="mb-2 mt-3 text-sm text-slate-500">
                        {`${courseItem?.curriculum?.length} ${
                          courseItem?.curriculum?.length <= 1
                            ? "Lecture"
                            : "Lectures"
                        }`}
                      </p>
                      <p className="text-sm font-medium text-emerald-700">
                        English test preparation
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
                <h2 className="text-lg font-semibold text-slate-900">
                  {searchQuery.trim()
                    ? `No courses found for “${searchQuery.trim()}”`
                    : "No courses found"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Try another search or adjust your filters.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default StudentViewCoursesPage;
