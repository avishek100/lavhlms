import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import VideoPlayer from "@/components/video-player";
import { getCourseCategoryLabel } from "@/config";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import { fetchStudentViewCourseDetailsService } from "@/services";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle,
  GraduationCap,
  FileText,
  LockKeyhole,
  PlayCircle,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function StudentViewCourseDetailsPage() {
  const { auth } = useContext(AuthContext);
  const {
    studentViewCourseDetails,
    setStudentViewCourseDetails,
    currentCourseDetailsId,
    setCurrentCourseDetailsId,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(-1);
  const curriculum = studentViewCourseDetails?.curriculum || [];
  const objectives = (studentViewCourseDetails?.objectives || "")
    .split(",")
    .map((objective) => objective.trim())
    .filter(Boolean);
  const firstPreviewIndex = curriculum.findIndex((item) => item.freePreview);
  const previewCount = curriculum.filter((item) => item.freePreview).length;
  const activePreviewIndex =
    selectedPreviewIndex >= 0 &&
    curriculum[selectedPreviewIndex]?.freePreview
      ? selectedPreviewIndex
      : firstPreviewIndex;
  const selectedPreview = curriculum[activePreviewIndex];
  const canStartLearning =
    auth?.authenticate &&
    auth?.user?.role === "student" &&
    auth.user.approved !== false;
  const isPendingApproval =
    auth?.user?.role === "student" && auth.user.approved === false;

  const fetchStudentViewCourseDetails = useCallback(async () => {
    const response = await fetchStudentViewCourseDetailsService(
      currentCourseDetailsId
    );

    if (response?.success) {
      setStudentViewCourseDetails(response?.data);
      setLoadingState(false);
    } else {
      setStudentViewCourseDetails(null);
      setLoadingState(false);
    }
  }, [
    currentCourseDetailsId,
    setLoadingState,
    setStudentViewCourseDetails,
  ]);

  useEffect(() => {
    if (currentCourseDetailsId !== null) fetchStudentViewCourseDetails();
  }, [currentCourseDetailsId, fetchStudentViewCourseDetails]);

  useEffect(() => {
    if (id) {
      setCurrentCourseDetailsId(id);
      setSelectedPreviewIndex(-1);
    }
  }, [id, setCurrentCourseDetailsId]);

  useEffect(() => {
    if (!location.pathname.includes("course/details"))
      setStudentViewCourseDetails(null),
        setCurrentCourseDetailsId(null);
  }, [
    location.pathname,
    setCurrentCourseDetailsId,
    setStudentViewCourseDetails,
  ]);

  if (loadingState) return <Skeleton />;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/courses")}
            className="mb-8 gap-2 px-0 text-slate-300 hover:bg-transparent hover:text-white"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to courses
          </Button>
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)]">
            <div>
              {studentViewCourseDetails?.category && (
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-400/10 px-3 py-1 text-sm font-medium text-blue-100">
                  <Sparkles aria-hidden="true" className="h-4 w-4" />
                  {getCourseCategoryLabel(studentViewCourseDetails.category)}
                </span>
              )}
              <h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {studentViewCourseDetails?.title}
              </h1>
              {studentViewCourseDetails?.subtitle && (
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
                  {studentViewCourseDetails.subtitle}
                </p>
              )}
              {studentViewCourseDetails?.instructorName && (
                <p className="mt-6 inline-flex items-center gap-2 text-sm text-slate-300">
                  <UserRound aria-hidden="true" className="h-4 w-4 text-blue-300" />
                  Taught by{" "}
                  <span className="font-medium text-white">
                    {studentViewCourseDetails.instructorName}
                  </span>
                </p>
              )}
              <div className="mt-7 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                  <BookOpen aria-hidden="true" className="h-4 w-4 text-blue-300" />
                  {curriculum.length} lessons
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                  <PlayCircle aria-hidden="true" className="h-4 w-4 text-emerald-300" />
                  {previewCount} free {previewCount === 1 ? "preview" : "previews"}
                </span>
                {studentViewCourseDetails?.primaryLanguage && (
                  <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                    <GraduationCap aria-hidden="true" className="h-4 w-4 text-blue-300" />
                    {studentViewCourseDetails.primaryLanguage}
                  </span>
                )}
              </div>
            </div>
            <div className="relative aspect-[16/7] overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-blue-500/30 to-indigo-950 shadow-2xl md:aspect-[4/3]">
              {studentViewCourseDetails?.image ? (
                <img
                  src={studentViewCourseDetails.image}
                  alt={studentViewCourseDetails.title || "Course"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-blue-100">
                  <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10">
                    <GraduationCap aria-hidden="true" className="h-10 w-10" />
                  </span>
                  <span className="text-sm font-medium">Build your skills with confidence</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-sm font-medium text-white">
                <CheckCircle aria-hidden="true" className="h-5 w-5 text-emerald-300" />
                Learn at your own pace
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:flex-row lg:px-8">
        <section className="min-w-0 flex-1 space-y-6">
          <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Course outcomes
              </p>
              <CardTitle className="text-xl">What you’ll learn</CardTitle>
            </CardHeader>
            <CardContent>
              {objectives.length ? (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {objectives.map((objective, index) => (
                    <li
                      key={`${objective}-${index}`}
                      className="flex items-start gap-3 rounded-lg bg-slate-50 p-3"
                    >
                      <CheckCircle
                        aria-hidden="true"
                        className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                      />
                      <span className="text-sm leading-6 text-slate-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-6 text-slate-500">
                  Explore the course lessons to see what’s covered.
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Course overview
              </p>
              <CardTitle className="text-xl">About this course</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-slate-600">
              {studentViewCourseDetails?.description || "Course details will be available soon."}
            </CardContent>
          </Card>
          <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                    Your learning path
                  </p>
                  <CardTitle className="mt-1 text-xl">Course curriculum</CardTitle>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {curriculum.length} lessons
                </span>
              </div>
              <p className="text-sm text-slate-500">
                Try a free preview. The full course is available after approval.
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              {curriculum.length ? (
                <ol className="divide-y divide-slate-100">
                  {curriculum.map((curriculumItem, index) => (
                    <li
                      key={curriculumItem?._id || index}
                      className="list-none"
                    >
                      <button
                        type="button"
                        disabled={!curriculumItem?.freePreview}
                        className={`-mx-2 flex w-full items-center gap-3 rounded-lg px-3 py-3.5 text-left text-sm transition-colors disabled:cursor-not-allowed ${
                          activePreviewIndex === index
                            ? "bg-blue-50 text-blue-950"
                            : "text-slate-700 enabled:hover:bg-slate-50 disabled:text-slate-400"
                        }`}
                        onClick={() => setSelectedPreviewIndex(index)}
                        aria-pressed={activePreviewIndex === index}
                      >
                        {curriculumItem?.freePreview ? (
                          curriculumItem?.readingMaterialUrl ||
                          curriculumItem?.lessonContent ? (
                            <FileText
                              aria-hidden="true"
                              className="h-4 w-4 text-blue-700"
                            />
                          ) : (
                            <PlayCircle
                              aria-hidden="true"
                              className="h-4 w-4 text-blue-700"
                            />
                          )
                        ) : (
                          <LockKeyhole
                            aria-hidden="true"
                            className="h-4 w-4"
                          />
                        )}
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-500 shadow-sm">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1 font-medium">
                          {curriculumItem?.title}
                        </span>
                        <span
                          className={`shrink-0 text-xs ${
                            curriculumItem?.freePreview
                              ? "font-medium text-blue-700"
                              : "text-slate-500"
                          }`}
                        >
                          {curriculumItem?.freePreview ? "Preview" : "Locked"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="py-5 text-sm text-slate-500">
                  Course lessons will be added soon.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
        <aside className="w-full lg:w-[380px]">
          <Card className="top-24 overflow-hidden rounded-xl border-slate-200 shadow-sm lg:sticky">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
                <div className="flex items-center justify-between bg-white px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Free lesson preview
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
                      {selectedPreview?.title || "Preview the course"}
                    </p>
                  </div>
                  <PlayCircle aria-hidden="true" className="ml-3 h-5 w-5 shrink-0 text-blue-700" />
                </div>
                <div className="aspect-video overflow-hidden">
                  {selectedPreview?.videoUrl ? (
                    <VideoPlayer
                      url={selectedPreview.videoUrl}
                      width="100%"
                      height="100%"
                      maxPreviewSeconds={60}
                    />
                  ) : selectedPreview?.readingMaterialUrl ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center text-slate-600">
                      <FileText
                        aria-hidden="true"
                        className="h-10 w-10 text-blue-700"
                      />
                      <span className="text-sm font-medium">
                        {selectedPreview.title}
                      </span>
                      <a
                        href={selectedPreview.readingMaterialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-blue-700 hover:underline"
                      >
                        Open lesson preview
                      </a>
                    </div>
                  ) : selectedPreview?.lessonContent ? (
                    <div className="h-full overflow-y-auto p-4 text-sm leading-6 text-slate-700">
                      {selectedPreview.lessonContent}
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
                      <BookOpen aria-hidden="true" className="h-10 w-10" />
                      <span className="text-sm">
                        {selectedPreview
                          ? "Preview lesson content unavailable"
                          : "No free preview is available"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mb-4 rounded-lg bg-blue-50 p-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                  <BookOpen aria-hidden="true" className="h-4 w-4" />
                  {studentViewCourseDetails?.category
                    ? `${getCourseCategoryLabel(studentViewCourseDetails.category)} preparation`
                    : "Build your skills"}
                </p>
                <p className="mt-1 text-xs leading-5 text-blue-800">
                  {canStartLearning
                    ? "Your learning journey is ready when you are."
                    : "Sign in with an approved student account to unlock every lesson."}
                </p>
              </div>
              {canStartLearning ? (
                <Button
                  onClick={() => navigate(`/course-progress/${id}`)}
                  className="h-12 w-full rounded-lg bg-blue-700 font-semibold hover:bg-blue-800"
                >
                  Start learning
                  <ArrowUpRight aria-hidden="true" className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-center text-sm text-slate-500">
                    {isPendingApproval
                      ? "Full course access will be available after approval."
                      : "Sign in with an approved student account to access the full course."}
                  </p>
                  {!isPendingApproval && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Button
                        onClick={() => navigate("/login")}
                        className="h-11 w-full rounded-lg"
                      >
                        Sign in
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate("/register")}
                        className="h-11 w-full rounded-lg"
                      >
                        Sign up
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}

export default StudentViewCourseDetailsPage;
