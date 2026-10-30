import CourseCurriculum from "@/components/instructor-view/courses/add-new-course/course-curriculum";
import CourseLanding from "@/components/instructor-view/courses/add-new-course/course-landing";
import CourseSettings from "@/components/instructor-view/courses/add-new-course/course-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  courseCurriculumInitialFormData,
  courseExamOptions,
  courseLandingInitialFormData,
} from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import {
  addNewCourseService,
  fetchInstructorCourseListService,
  fetchInstructorCourseDetailsService,
  updateCourseByIdService,
} from "@/services";
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Film, Image as ImageIcon, LayoutList, Save } from "lucide-react";
import { toast } from "react-hot-toast";

function AdminCourseEditor() {
  const {
    courseLandingFormData,
    courseCurriculumFormData,
    setCourseLandingFormData,
    setCourseCurriculumFormData,
    setCurrentEditedCourseId,
  } = useContext(InstructorContext);

  const [activeTab, setActiveTab] = useState("course-landing-page");
  const [isSaving, setIsSaving] = useState(false);
  const [courseCategories, setCourseCategories] = useState([]);
  const dashboardPath = "/admin/courses";
  const navigate = useNavigate();
  const params = useParams();

  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    return value === null || value === undefined || String(value).trim() === "";
  }

  // Count ready lectures and check completion status
  const videosCount = courseCurriculumFormData.filter(
    (item) =>
      (item?.videoUrl && item.videoUrl.trim() !== "") ||
      (item?.lessonContent && item.lessonContent.trim() !== "") ||
      (item?.readingMaterialUrl && item.readingMaterialUrl.trim() !== "")
  ).length;
  const totalLectures = courseCurriculumFormData.length;

  const isDetailsFilled =
    !isEmpty(courseLandingFormData.title) &&
    !isEmpty(courseLandingFormData.category);

  const isSettingsFilled = Boolean(courseLandingFormData.image);

  function getValidationError() {
    if (isEmpty(courseLandingFormData.title)) {
      return {
        message: "Please enter a course title in Course details.",
        tab: "course-landing-page",
      };
    }

    if (isEmpty(courseLandingFormData.category)) {
      return {
        message: "Please select an exam program in Course details.",
        tab: "course-landing-page",
      };
    }

    if (isEmpty(courseLandingFormData.description)) {
      return {
        message: "Please enter a brief course description in Course details.",
        tab: "course-landing-page",
      };
    }

    const nonEmptyLectures = courseCurriculumFormData.filter(
      (item) =>
        item.title?.trim() ||
        item.videoUrl?.trim() ||
        item.readingMaterialUrl?.trim() ||
        item.lessonContent?.trim()
    );

    if (nonEmptyLectures.length === 0) {
      return {
        message: "Please add at least one video lecture or written lesson in Lessons.",
        tab: "curriculum",
      };
    }

    for (let i = 0; i < nonEmptyLectures.length; i++) {
      const lecture = nonEmptyLectures[i];
      if (isEmpty(lecture.title)) {
        return {
          message: `Lecture ${i + 1} is missing a title. Please enter it in Lessons.`,
          tab: "curriculum",
        };
      }
      if (
        isEmpty(lecture.videoUrl) &&
        isEmpty(lecture.readingMaterialUrl) &&
        isEmpty(lecture.lessonContent)
      ) {
        return {
          message: `Lesson ${i + 1} needs a video, written content, or reading material link.`,
          tab: "curriculum",
        };
      }
    }

    return null;
  }

  async function handleCreateCourse() {
    const error = getValidationError();
    if (error) {
      toast.error(error.message);
      setActiveTab(error.tab);
      return;
    }

    // Sanitize curriculum items
    const sanitizedCurriculum = courseCurriculumFormData
      .filter(
        (item) =>
          item.title?.trim() ||
          item.videoUrl?.trim() ||
          item.readingMaterialUrl?.trim() ||
          item.lessonContent?.trim()
      )
      .map((item, idx) => ({
        title: item.title?.trim() || `Lecture ${idx + 1}`,
        videoUrl: item.videoUrl?.trim(),
        readingMaterialUrl: item.readingMaterialUrl?.trim(),
        lessonContent: item.lessonContent?.trim(),
        public_id: item.public_id || `media_${Date.now()}_${idx}`,
        freePreview: Boolean(item.freePreview),
      }));

    // If no lecture has free preview, make the first one free preview automatically
    const hasFree = sanitizedCurriculum.some((item) => item.freePreview);
    if (!hasFree && sanitizedCurriculum.length > 0) {
      sanitizedCurriculum[0].freePreview = true;
    }

    const courseFinalFormData = {
      date: new Date(),
      ...courseLandingFormData,
      subtitle: courseLandingFormData.subtitle || courseLandingFormData.title,
      objectives:
        courseLandingFormData.objectives || courseLandingFormData.description,
      welcomeMessage:
        courseLandingFormData.welcomeMessage || "Welcome to the course!",
      pricing: 0,
      students: [],
      curriculum: sanitizedCurriculum,
      isPublised: true,
    };

    setIsSaving(true);
    try {
      const response = params.courseId
        ? await updateCourseByIdService(params.courseId, courseFinalFormData)
        : await addNewCourseService(courseFinalFormData);

      if (!response?.success) {
        toast.error(response?.message || "Unable to save the course.");
        return;
      }

      toast.success(params.courseId ? "Course updated successfully!" : "Course published successfully!");
      setCourseLandingFormData(courseLandingInitialFormData);
      setCourseCurriculumFormData(courseCurriculumInitialFormData);
      navigate(dashboardPath);
      setCurrentEditedCourseId(null);
    } catch (error) {
      console.error("Unable to save course:", error);
      toast.error(error.response?.data?.message || "Unable to save the course. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const fetchCurrentCourseDetails = useCallback(async () => {
    const response = await fetchInstructorCourseDetailsService(
      params.courseId
    );

    if (response?.success) {
      const setCourseFormData = Object.keys(
        courseLandingInitialFormData
      ).reduce((acc, key) => {
        acc[key] = response?.data[key] || courseLandingInitialFormData[key];
        return acc;
      }, {});

      setCourseLandingFormData(setCourseFormData);
      setCourseCurriculumFormData(
        response?.data?.curriculum?.length
          ? response.data.curriculum
          : courseCurriculumInitialFormData
      );
    }
  }, [
    params.courseId,
    setCourseCurriculumFormData,
    setCourseLandingFormData,
  ]);

  useEffect(() => {
    let isCurrent = true;
    fetchInstructorCourseListService()
      .then((response) => {
        if (!isCurrent) return;
        if (!response?.success) {
          toast.error(response?.message || "Unable to load exam categories.");
          return;
        }
        const categories = [
          ...new Set(
            (response.data || [])
              .map((course) => course.category)
              .filter(
                (category) =>
                  category &&
                  !courseExamOptions.some((option) => option.id === category)
              )
          ),
        ];
        setCourseCategories(categories);
      })
      .catch((error) => {
        if (isCurrent) {
          toast.error(
            error?.response?.data?.message || "Unable to load exam categories."
          );
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    if (params.courseId) {
      setCurrentEditedCourseId(params.courseId);
      fetchCurrentCourseDetails();
      return;
    }

    setCurrentEditedCourseId(null);
    setCourseLandingFormData(courseLandingInitialFormData);
    setCourseCurriculumFormData(courseCurriculumInitialFormData);
  }, [
    fetchCurrentCourseDetails,
    params.courseId,
    setCurrentEditedCourseId,
    setCourseCurriculumFormData,
    setCourseLandingFormData,
  ]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Top Header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate(dashboardPath)}
              className="mb-3 -ml-3 gap-2 text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Back to dashboard
            </Button>
            <p className="text-sm font-medium text-blue-700">
              {params.courseId ? "Course Editor" : "Course Creator"}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              {params.courseId ? "Update Course" : "Create New Course"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Complete the course details, add your lesson videos, and publish when ready.
            </p>
          </div>

          <Button
            className="h-10 gap-2 rounded-lg px-6 font-semibold shadow-sm bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleCreateCourse}
            disabled={isSaving}
          >
            <Save aria-hidden="true" className="h-4 w-4" />
            {isSaving ? "Saving Course..." : "Save Course"}
          </Button>
        </div>

        {/* Tabbed Content Card */}
        <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden bg-white">
          <CardContent className="p-4 sm:p-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid h-auto w-full grid-cols-3 rounded-lg bg-slate-100 p-1 sm:inline-flex sm:w-auto gap-1">
                <TabsTrigger
                  className="rounded-md gap-2 py-2 text-xs sm:text-sm font-medium"
                  value="course-landing-page"
                >
                  <LayoutList className="w-4 h-4" />
                  <span>1. Details</span>
                  {isDetailsFilled ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : null}
                </TabsTrigger>

                <TabsTrigger
                  className="rounded-md gap-2 py-2 text-xs sm:text-sm font-medium"
                  value="curriculum"
                >
                  <Film className="w-4 h-4" />
                  <span>2. Lessons ({videosCount}/{totalLectures})</span>
                  {videosCount > 0 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : null}
                </TabsTrigger>

                <TabsTrigger
                  className="rounded-md gap-2 py-2 text-xs sm:text-sm font-medium"
                  value="settings"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>3. Cover & Settings</span>
                  {isSettingsFilled ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : null}
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Course Details */}
              <TabsContent value="course-landing-page" className="focus-visible:outline-none">
                <CourseLanding categories={courseCategories} />
                <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    onClick={() => setActiveTab("curriculum")}
                    className="gap-2"
                  >
                    Continue to Lessons
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>

              {/* Tab 2: Lessons / Curriculum */}
              <TabsContent value="curriculum" className="focus-visible:outline-none">
                <CourseCurriculum />
                <div className="mt-6 flex justify-between pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("course-landing-page")}
                  >
                    ← Back to Details
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab("settings")}
                    className="gap-2"
                  >
                    Continue to Settings
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>

              {/* Tab 3: Settings */}
              <TabsContent value="settings" className="focus-visible:outline-none">
                <CourseSettings />
                <div className="mt-6 flex justify-between pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("curriculum")}
                  >
                    ← Back to Lessons
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreateCourse}
                    disabled={isSaving}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving Course..." : "Save & Publish Course"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default AdminCourseEditor;
