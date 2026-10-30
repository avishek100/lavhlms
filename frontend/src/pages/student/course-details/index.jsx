import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import { fetchStudentViewCourseDetailsService } from "@/services";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  FileText,
  LockKeyhole,
  PlayCircle,
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
  const firstPreviewIndex = curriculum.findIndex((item) => item.freePreview);
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
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/courses")}
            className="mb-5 gap-2 px-0 text-slate-300 hover:bg-transparent hover:text-white"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to courses
          </Button>
          <h1 className="max-w-4xl text-3xl font-semibold tracking-tight sm:text-4xl">
            {studentViewCourseDetails?.title}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
            {studentViewCourseDetails?.subtitle}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-300">
            <span>
              {studentViewCourseDetails?.curriculum?.length || 0} lessons
            </span>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
        <section className="min-w-0 flex-1 space-y-5">
          <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">What you’ll learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(studentViewCourseDetails?.objectives || "")
                  .split(",")
                  .map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle aria-hidden="true" className="mr-2 h-5 w-5 shrink-0 text-emerald-600" />
                      <span className="text-sm leading-6 text-slate-700">{objective}</span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">About this course</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-slate-600">
              {studentViewCourseDetails?.description}
            </CardContent>
          </Card>
          <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Course curriculum</CardTitle>
              <p className="text-sm text-slate-500">
                Preview free lessons now. Full lessons unlock after approval.
              </p>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100">
              {curriculum.map((curriculumItem, index) => (
                  <button
                    type="button"
                    key={curriculumItem?._id || index}
                    disabled={!curriculumItem?.freePreview}
                    className="-mx-2 flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-sm text-slate-700 enabled:hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-400"
                    onClick={() => setSelectedPreviewIndex(index)}
                    aria-pressed={activePreviewIndex === index}
                  >
                    {curriculumItem?.freePreview ? (
                      curriculumItem?.readingMaterialUrl ||
                      curriculumItem?.lessonContent ? (
                      <FileText aria-hidden="true" className="h-4 w-4 text-blue-700" />
                      ) : (
                        <PlayCircle aria-hidden="true" className="h-4 w-4 text-blue-700" />
                      )
                    ) : (
                      <LockKeyhole aria-hidden="true" className="h-4 w-4" />
                    )}
                    <span>{curriculumItem?.title}</span>
                    <span className="ml-auto text-xs text-slate-500">
                      {curriculumItem?.freePreview
                        ? "1-minute preview"
                        : "Locked"}
                    </span>
                  </button>
                ))}
            </CardContent>
          </Card>
        </section>
        <aside className="w-full lg:w-[380px]">
          <Card className="top-24 overflow-hidden rounded-xl border-slate-200 shadow-sm lg:sticky">
            <CardContent className="p-6">
              <div className="mb-5 aspect-video overflow-hidden rounded-lg bg-slate-100">
                {selectedPreview?.videoUrl ? (
                  <VideoPlayer
                    url={selectedPreview.videoUrl}
                    width="100%"
                    height="100%"
                    maxPreviewSeconds={60}
                  />
                ) : selectedPreview?.readingMaterialUrl ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center text-slate-600">
                    <FileText aria-hidden="true" className="h-10 w-10 text-blue-700" />
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
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-emerald-700">
                <BookOpen aria-hidden="true" className="h-4 w-4" />
                IELTS &amp; PTE preparation
              </div>
              {canStartLearning ? (
                <Button
                  onClick={() => navigate(`/course-progress/${id}`)}
                  className="h-11 w-full rounded-lg"
                >
                  Start learning
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
