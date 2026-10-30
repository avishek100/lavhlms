import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  getCurrentCourseProgressService,
  markLectureAsViewedService,
  resetCourseProgressService,
} from "@/services";
import {
  Check,
  ChevronLeft,
  ExternalLink,
  FileText,
  PanelRightClose,
  PanelRightOpen,
  Play,
} from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

function StudentViewCourseProgressPage() {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const { studentCurrentCourseProgress, setStudentCurrentCourseProgress } =
    useContext(StudentContext);
  const [lockCourse, setLockCourse] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [showCourseCompleteDialog, setShowCourseCompleteDialog] =
    useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const [isMarkingLessonComplete, setIsMarkingLessonComplete] = useState(false);
  const { id } = useParams();

  const fetchCurrentCourseProgress = useCallback(async () => {
    const response = await getCurrentCourseProgressService(auth?.user?._id, id);
    if (response?.success) {
      if (!response?.data?.hasAccess) {
        setLockCourse(true);
      } else {
        setLockCourse(false);
        setStudentCurrentCourseProgress({
          courseDetails: response?.data?.courseDetails,
          progress: response?.data?.progress,
        });

        if (response?.data?.completed) {
          setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
          setShowCourseCompleteDialog(true);
          return;
        }

        if (response?.data?.progress?.length === 0) {
          setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
        } else {
          const lastIndexOfViewedAsTrue = response?.data?.progress.reduceRight(
            (acc, obj, index) => {
              return acc === -1 && obj.viewed ? index : acc;
            },
            -1
          );

          setCurrentLecture(
            response?.data?.courseDetails?.curriculum[
            lastIndexOfViewedAsTrue + 1
            ]
          );
        }
      }
    }
  }, [
    auth?.user?._id,
    id,
    setCurrentLecture,
    setLockCourse,
    setShowCourseCompleteDialog,
    setStudentCurrentCourseProgress,
  ]);

  const updateCourseProgress = useCallback(async () => {
    if (currentLecture) {
      try {
        const response = await markLectureAsViewedService(
          auth?.user?._id,
          studentCurrentCourseProgress?.courseDetails?._id,
          currentLecture._id
        );

        if (response?.success) {
          fetchCurrentCourseProgress();
        } else {
          toast.error(response?.message || "Unable to update lesson progress.");
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Unable to update lesson progress."
        );
      }
    }
  }, [
    auth?.user?._id,
    currentLecture,
    fetchCurrentCourseProgress,
    studentCurrentCourseProgress?.courseDetails?._id,
  ]);

  async function handleRewatchCourse() {
    const response = await resetCourseProgressService(
      auth?.user?._id,
      studentCurrentCourseProgress?.courseDetails?._id
    );

    if (response?.success) {
      setCurrentLecture(null);
      setShowCourseCompleteDialog(false);
      fetchCurrentCourseProgress();
    }
  }

  async function handleMarkLessonComplete() {
    if (!currentLecture?._id) return;
    setIsMarkingLessonComplete(true);

    try {
      const response = await markLectureAsViewedService(
        auth?.user?._id,
        studentCurrentCourseProgress?.courseDetails?._id,
        currentLecture._id
      );

      if (response?.success) {
        fetchCurrentCourseProgress();
      } else {
        toast.error(response?.message || "Unable to update lesson progress.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to update lesson progress."
      );
    } finally {
      setIsMarkingLessonComplete(false);
    }
  }

  useEffect(() => {
    fetchCurrentCourseProgress();
  }, [fetchCurrentCourseProgress]);

  useEffect(() => {
    if (currentLecture?.progressValue === 1) updateCourseProgress();
  }, [currentLecture, updateCourseProgress]);

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      <header className="flex min-h-16 items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <Button
            onClick={() => navigate("/student-courses")}
            className="shrink-0 gap-1 text-slate-300 hover:bg-slate-800 hover:text-white sm:gap-2"
            variant="ghost"
            size="sm"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            <span className="hidden sm:inline">My courses</span>
          </Button>
          <h1 className="truncate text-sm font-medium text-slate-100 sm:text-base">
            {studentCurrentCourseProgress?.courseDetails?.title}
          </h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          aria-label={isSideBarOpen ? "Hide course content" : "Show course content"}
          onClick={() => setIsSideBarOpen(!isSideBarOpen)}
          className="shrink-0 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          {isSideBarOpen ? (
            <PanelRightClose aria-hidden="true" className="h-4 w-4" />
          ) : (
            <PanelRightOpen aria-hidden="true" className="h-4 w-4" />
          )}
        </Button>
      </header>
      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        <section className="min-w-0 flex-1 overflow-y-auto">
          <div className="aspect-video w-full bg-black">
            {currentLecture?.videoUrl ? (
              <VideoPlayer
                width="100%"
                height="100%"
                url={currentLecture.videoUrl}
                onProgressUpdate={setCurrentLecture}
                progressData={currentLecture}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-300">
                <div className="text-center">
                  <FileText aria-hidden="true" className="mx-auto h-12 w-12" />
                  <p className="mt-3">
                    {currentLecture?.lessonContent
                      ? "Written lesson"
                      : "This lesson has reading material"}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="px-5 py-6 sm:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Current lesson
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                  {currentLecture?.title || "Choose a lesson to begin"}
                </h2>
              </div>
              <Button
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={handleMarkLessonComplete}
                disabled={
                  isMarkingLessonComplete ||
                  !currentLecture?._id ||
                  studentCurrentCourseProgress?.progress?.some(
                    (item) =>
                      item.lectureId === currentLecture._id && item.viewed
                  )
                }
              >
                <Check aria-hidden="true" className="h-4 w-4" />
                {isMarkingLessonComplete
                  ? "Saving..."
                  : studentCurrentCourseProgress?.progress?.some(
                        (item) =>
                          item.lectureId === currentLecture?._id && item.viewed
                      )
                    ? "Lesson completed"
                    : "Mark lesson complete"}
              </Button>
            </div>
            {currentLecture?.lessonContent && (
              <article className="mt-5 rounded-xl bg-slate-900 p-5 text-sm leading-7 text-slate-200 sm:p-7">
                <div className="whitespace-pre-wrap">
                  {currentLecture.lessonContent}
                </div>
              </article>
            )}
            {currentLecture?.readingMaterialUrl && (
              <a
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                href={currentLecture.readingMaterialUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText aria-hidden="true" className="h-4 w-4" />
                Open reading material
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
              </a>
            )}
          </div>
        </section>
        {isSideBarOpen && (
          <aside className="flex max-h-[55vh] w-full shrink-0 flex-col border-t border-slate-200 bg-white text-slate-900 lg:max-h-none lg:w-[360px] lg:border-l lg:border-t-0">
          <Tabs defaultValue="content" className="flex min-h-0 flex-1 flex-col">
            <TabsList className="grid h-12 w-full shrink-0 grid-cols-2 rounded-none border-b border-slate-200 bg-white p-1">
              <TabsTrigger
                  value="content"
                  className="h-full rounded-md text-slate-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-800"
              >
                Course Content
              </TabsTrigger>
              <TabsTrigger
                  value="overview"
                  className="h-full rounded-md text-slate-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-800"
              >
                Overview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="min-h-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-1 p-3">
                  {studentCurrentCourseProgress?.courseDetails?.curriculum.map(
                    (item) => (
                      <button
                        type="button"
                        onClick={() => setCurrentLecture(item)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors ${
                          currentLecture?._id === item._id
                            ? "bg-blue-50 font-medium text-blue-800"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                        key={item._id}
                      >
                        {studentCurrentCourseProgress?.progress?.find(
                          (progressItem) => progressItem.lectureId === item._id
                        )?.viewed ? (
                          <Check
                            aria-hidden="true"
                            className="h-4 w-4 shrink-0 text-emerald-600"
                          />
                        ) : (
                          item.readingMaterialUrl && !item.videoUrl ? (
                            <FileText aria-hidden="true" className="h-4 w-4 shrink-0" />
                          ) : (
                            <Play aria-hidden="true" className="h-4 w-4 shrink-0" />
                          )
                        )}
                        <span className="line-clamp-2">{item?.title}</span>
                      </button>
                    )
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="overview" className="min-h-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <h2 className="mb-3 text-lg font-semibold text-slate-900">About this course</h2>
                  <p className="text-sm leading-6 text-slate-600">
                    {studentCurrentCourseProgress?.courseDetails?.description}
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
          </aside>
        )}

      </div>
      <Dialog open={lockCourse}>
        <DialogContent className="sm:w-[425px]">
          <DialogHeader>
            <DialogTitle>You can&apos;t view this page</DialogTitle>
            <DialogDescription>
              Sign in to your account to access this preparation course.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Dialog open={showCourseCompleteDialog}>
        <DialogContent showOverlay={false} className="sm:w-[425px]">
          <DialogHeader>
            <DialogTitle>Congratulations!</DialogTitle>
            <DialogDescription className="flex flex-col gap-3">
              <Label>You have completed the course</Label>
              <div className="flex flex-row gap-3">
                <Button onClick={() => navigate("/student-courses")}>
                  My courses
                </Button>
                <Button onClick={handleRewatchCourse}>Rewatch Course</Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default StudentViewCourseProgressPage;
