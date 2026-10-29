import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import VideoPlayer from "@/components/video-player";
import { StudentContext } from "@/context/student-context";
import { fetchStudentViewCourseDetailsService } from "@/services";
import { ArrowLeft, BookOpen, CheckCircle, FileText, PlayCircle } from "lucide-react";
import { useContext, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function StudentViewCourseDetailsPage() {
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

  async function fetchStudentViewCourseDetails() {
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
  }

  useEffect(() => {
    if (currentCourseDetailsId !== null) fetchStudentViewCourseDetails();
  }, [currentCourseDetailsId]);

  useEffect(() => {
    if (id) setCurrentCourseDetailsId(id);
  }, [id]);

  useEffect(() => {
    if (!location.pathname.includes("course/details"))
      setStudentViewCourseDetails(null),
        setCurrentCourseDetailsId(null);
  }, [location.pathname]);

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
              By <span className="font-medium text-white">{studentViewCourseDetails?.instructorName}</span>
            </span>
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
            </CardHeader>
            <CardContent className="divide-y divide-slate-100">
              {studentViewCourseDetails?.curriculum?.map(
                (curriculumItem, index) => (
                  <button
                    type="button"
                    key={curriculumItem?._id || index}
                    className="-mx-2 flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-sm text-slate-700 hover:bg-blue-50"
                    onClick={() => navigate(`/course-progress/${id}`)}
                  >
                    {curriculumItem?.readingMaterialUrl ||
                    curriculumItem?.lessonContent ? (
                      <FileText aria-hidden="true" className="h-4 w-4 text-blue-700" />
                    ) : (
                      <PlayCircle aria-hidden="true" className="h-4 w-4 text-blue-700" />
                    )}
                    <span>{curriculumItem?.title}</span>
                    {(curriculumItem?.readingMaterialUrl ||
                      curriculumItem?.lessonContent) && (
                      <span className="ml-auto text-xs text-slate-500">Reading</span>
                    )}
                  </button>
                )
              )}
            </CardContent>
          </Card>
        </section>
        <aside className="w-full lg:w-[380px]">
          <Card className="top-24 overflow-hidden rounded-xl border-slate-200 shadow-sm lg:sticky">
            <CardContent className="p-6">
              <div className="mb-5 aspect-video overflow-hidden rounded-lg bg-slate-100">
                {studentViewCourseDetails?.curriculum?.some(
                  (item) => item.videoUrl
                ) ? (
                  <VideoPlayer
                    url={
                      studentViewCourseDetails.curriculum.find(
                        (item) => item.videoUrl
                      ).videoUrl
                    }
                    width="100%"
                    height="100%"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
                    <FileText aria-hidden="true" className="h-10 w-10" />
                    <span className="text-sm">Written course lessons</span>
                  </div>
                )}
              </div>
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-emerald-700">
                <BookOpen aria-hidden="true" className="h-4 w-4" />
                IELTS &amp; PTE preparation
              </div>
              <Button
                onClick={() => navigate(`/course-progress/${id}`)}
                className="h-11 w-full rounded-lg"
              >
                Start learning
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}

export default StudentViewCourseDetailsPage;
