import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import VideoPlayer from "@/components/video-player";
import { courseCurriculumInitialFormData } from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import {
  mediaBulkUploadService,
  mediaDeleteService,
  mediaUploadService,
} from "@/services";
import {
  AlertCircle,
  CheckCircle2,
  Film,
  Link as LinkIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useContext, useRef, useState } from "react";
import { toast } from "react-hot-toast";

function CourseCurriculum() {
  const {
    courseCurriculumFormData,
    setCourseCurriculumFormData,
    setMediaUploadProgress,
    setMediaUploadProgressPercentage,
  } = useContext(InstructorContext);

  const bulkUploadInputRef = useRef(null);
  const [uploadingLectureIndex, setUploadingLectureIndex] = useState(null);
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [activeInputMode, setActiveInputMode] = useState({}); // { [index]: 'file' | 'url' }
  const [urlInputs, setUrlInputs] = useState({}); // { [index]: string }
  const [previewIndex, setPreviewIndex] = useState(null);

  function handleNewLecture() {
    setCourseCurriculumFormData([
      ...courseCurriculumFormData,
      {
        ...courseCurriculumInitialFormData[0],
        title: `Lecture ${courseCurriculumFormData.length + 1}`,
        freePreview: courseCurriculumFormData.length === 0, // first lecture default free
      },
    ]);
  }

  function handleCourseTitleChange(event, currentIndex) {
    const cpy = [...courseCurriculumFormData];
    cpy[currentIndex] = {
      ...cpy[currentIndex],
      title: event.target.value,
    };
    setCourseCurriculumFormData(cpy);
  }

  function handleReadingMaterialChange(event, currentIndex) {
    const cpy = [...courseCurriculumFormData];
    cpy[currentIndex] = {
      ...cpy[currentIndex],
      readingMaterialUrl: event.target.value,
    };
    setCourseCurriculumFormData(cpy);
  }

  function handleLessonContentChange(event, currentIndex) {
    const cpy = [...courseCurriculumFormData];
    cpy[currentIndex] = {
      ...cpy[currentIndex],
      lessonContent: event.target.value,
    };
    setCourseCurriculumFormData(cpy);
  }

  function handleFreePreviewChange(currentValue, currentIndex) {
    const cpy = [...courseCurriculumFormData];
    cpy[currentIndex] = {
      ...cpy[currentIndex],
      freePreview: currentValue,
    };
    setCourseCurriculumFormData(cpy);
  }

  async function handleSingleLectureUpload(event, currentIndex) {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const videoFormData = new FormData();
    videoFormData.append("file", selectedFile);

    try {
      setUploadingLectureIndex(currentIndex);
      setUploadPercentage(0);
      setMediaUploadProgress(true);

      const response = await mediaUploadService(
        videoFormData,
        (progress) => {
          setUploadPercentage(progress);
          setMediaUploadProgressPercentage(progress);
        }
      );

      if (response?.success && response?.data?.url) {
        const cpy = [...courseCurriculumFormData];
        cpy[currentIndex] = {
          ...cpy[currentIndex],
          videoUrl: response.data.secure_url || response.data.url,
          public_id: response.data.public_id || `media_${Date.now()}`,
        };
        setCourseCurriculumFormData(cpy);
        toast.success(`Lecture ${currentIndex + 1} video added successfully!`);
      } else {
        toast.error(response?.message || "Failed to upload video.");
      }
    } catch (error) {
      console.error("Lecture video upload failed:", error);
      toast.error(
        error.response?.data?.message || "Unable to upload video. Please try again."
      );
    } finally {
      setUploadingLectureIndex(null);
      setUploadPercentage(0);
      setMediaUploadProgress(false);
      setMediaUploadProgressPercentage(0);
      event.target.value = "";
    }
  }

  function handleAttachVideoUrl(currentIndex) {
    const inputUrl = (urlInputs[currentIndex] || "").trim();
    if (!inputUrl) {
      toast.error("Please enter a valid video link (YouTube, Vimeo, or MP4 URL).");
      return;
    }

    const cpy = [...courseCurriculumFormData];
    cpy[currentIndex] = {
      ...cpy[currentIndex],
      videoUrl: inputUrl,
      public_id: `ext_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setCourseCurriculumFormData(cpy);
    setUrlInputs({ ...urlInputs, [currentIndex]: "" });
    toast.success(`Video linked to Lecture ${currentIndex + 1}!`);
  }

  async function handleReplaceVideo(currentIndex) {
    const cpy = [...courseCurriculumFormData];
    const currentPublicId = cpy[currentIndex].public_id;

    if (currentPublicId && !currentPublicId.startsWith("ext_")) {
      mediaDeleteService(currentPublicId).catch(() => {});
    }

    cpy[currentIndex] = {
      ...cpy[currentIndex],
      videoUrl: "",
      public_id: "",
    };
    setCourseCurriculumFormData(cpy);
    if (previewIndex === currentIndex) setPreviewIndex(null);
  }

  async function handleDeleteLecture(currentIndex) {
    const cpy = [...courseCurriculumFormData];
    const currentPublicId = cpy[currentIndex]?.public_id;

    if (currentPublicId && !currentPublicId.startsWith("ext_")) {
      mediaDeleteService(currentPublicId).catch(() => {});
    }

    const updated = cpy.filter((_, index) => index !== currentIndex);
    setCourseCurriculumFormData(
      updated.length > 0 ? updated : [{ ...courseCurriculumInitialFormData[0], freePreview: true }]
    );
    if (previewIndex === currentIndex) setPreviewIndex(null);
  }

  async function handleMediaBulkUpload(event) {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    const bulkFormData = new FormData();
    selectedFiles.forEach((fileItem) => bulkFormData.append("files", fileItem));

    try {
      setIsBulkUploading(true);
      setMediaUploadProgress(true);
      const toastId = toast.loading(`Uploading ${selectedFiles.length} videos...`);

      const response = await mediaBulkUploadService(
        bulkFormData,
        setMediaUploadProgressPercentage
      );

      if (response?.success && Array.isArray(response.data)) {
        const hasExistingContent = courseCurriculumFormData.some(
          (item) =>
            item.title?.trim() ||
            item.videoUrl?.trim() ||
            item.readingMaterialUrl?.trim()
        );

        const baseList = hasExistingContent ? [...courseCurriculumFormData] : [];

        const newLectures = response.data.map((item, idx) => ({
          title: `Lecture ${baseList.length + idx + 1}: ${
            selectedFiles[idx]?.name?.replace(/\.[^/.]+$/, "") || "Lesson"
          }`,
          videoUrl: item?.secure_url || item?.url,
          public_id: item?.public_id || `media_${Date.now()}_${idx}`,
          freePreview: baseList.length === 0 && idx === 0,
        }));

        setCourseCurriculumFormData([...baseList, ...newLectures]);
        toast.success(`Successfully uploaded ${response.data.length} lectures!`, { id: toastId });
      } else {
        toast.error(response?.message || "Unable to upload selected videos.", { id: toastId });
      }
    } catch (error) {
      console.error("Bulk upload failed:", error);
      toast.error(error.response?.data?.message || "Failed to bulk upload videos.");
    } finally {
      setIsBulkUploading(false);
      setMediaUploadProgress(false);
      setMediaUploadProgressPercentage(0);
      event.target.value = "";
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900">
            Course Curriculum & Lessons
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Add a video lecture or enter written lesson content. You can also
            attach a PDF or document link.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            ref={bulkUploadInputRef}
            accept="video/*"
            multiple
            className="hidden"
            id="bulk-media-upload"
            onChange={handleMediaBulkUpload}
          />
          <Button
            as="label"
            htmlFor="bulk-media-upload"
            variant="outline"
            className="cursor-pointer gap-2"
            disabled={isBulkUploading}
          >
            {isBulkUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Bulk Upload Videos
              </>
            )}
          </Button>
          <Button onClick={handleNewLecture} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Lecture
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {courseCurriculumFormData.map((curriculumItem, index) => {
          const hasVideo = Boolean(curriculumItem?.videoUrl);
          const hasReadingMaterial = Boolean(curriculumItem?.readingMaterialUrl);
          const hasWrittenContent = Boolean(curriculumItem?.lessonContent?.trim());
          const isUploadingThis = uploadingLectureIndex === index;
          const currentMode = activeInputMode[index] || "file";

          return (
            <div
              key={curriculumItem.public_id || `lecture-${index}`}
              className={`rounded-xl border p-5 transition-all ${
                hasVideo || hasReadingMaterial || hasWrittenContent
                  ? "border-emerald-300 bg-emerald-50/20"
                  : isUploadingThis
                  ? "border-blue-300 bg-blue-50/20"
                  : "border-slate-200 bg-white"
              }`}
            >
              {/* Header Row: Title, Status Badge, Preview Switch, Delete */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900 text-base">
                    Lecture {index + 1}
                  </span>

                  {/* Status Indicator */}
                  {isUploadingThis ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Uploading {uploadPercentage}%...
                    </span>
                  ) : hasVideo ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Video Ready
                    </span>
                  ) : hasReadingMaterial ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Reading Material Ready
                    </span>
                  ) : hasWrittenContent ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Written Lesson Ready
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      No Video Attached
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      onCheckedChange={(val) => handleFreePreviewChange(val, index)}
                      checked={curriculumItem.freePreview}
                      id={`freePreview-${index + 1}`}
                    />
                    <Label
                      htmlFor={`freePreview-${index + 1}`}
                      className="text-xs sm:text-sm font-medium text-slate-700 cursor-pointer"
                    >
                      Free Preview
                    </Label>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLecture(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2 gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </div>

              {/* Lecture Title Input */}
              <div className="mt-4">
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Lecture Title
                </Label>
                <Input
                  name={`title-${index + 1}`}
                  placeholder="e.g. Introduction & Course Overview"
                  className="mt-1"
                  onChange={(event) => handleCourseTitleChange(event, index)}
                  value={curriculumItem.title || ""}
                />
              </div>

              <div className="mt-4">
                <Label
                  htmlFor={`written-lesson-${index}`}
                  className="text-xs font-semibold uppercase tracking-wider text-slate-600"
                >
                  Written lesson content
                </Label>
                <Textarea
                  id={`written-lesson-${index}`}
                  placeholder="Write the lesson content students will read..."
                  className="mt-1 min-h-40"
                  value={curriculumItem.lessonContent || ""}
                  onChange={(event) => handleLessonContentChange(event, index)}
                  maxLength={20000}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Use this instead of a video, or add it as a written supplement.
                  {curriculumItem.lessonContent?.length
                    ? ` ${curriculumItem.lessonContent.length}/20,000 characters`
                    : ""}
                </p>
              </div>

              <div className="mt-4">
                <Label
                  htmlFor={`reading-material-${index}`}
                  className="text-xs font-semibold uppercase tracking-wider text-slate-600"
                >
                  PDF or document link
                </Label>
                <Input
                  id={`reading-material-${index}`}
                  type="url"
                  placeholder="https://example.com/reading-material.pdf"
                  className="mt-1"
                  value={curriculumItem.readingMaterialUrl || ""}
                  onChange={(event) => handleReadingMaterialChange(event, index)}
                />
                {hasReadingMaterial && (
                  <a
                    className="mt-2 inline-block max-w-full truncate text-sm text-blue-700 underline"
                    href={curriculumItem.readingMaterialUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Preview reading material
                  </a>
                )}
              </div>

              {/* Video Content Section */}
              <div className="mt-4">
                {isUploadingThis ? (
                  /* Uploading in progress indicator */
                  <div className="p-4 border border-blue-200 bg-blue-50/60 rounded-lg flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm font-medium text-blue-900">
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        Uploading video to course...
                      </span>
                      <span className="font-bold text-blue-700">{uploadPercentage}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-200"
                        style={{ width: `${uploadPercentage}%` }}
                      />
                    </div>
                  </div>
                ) : hasVideo ? (
                  /* Video is attached */
                  <div className="space-y-3">
                    <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <Film className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-semibold text-emerald-950 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            Video Attached Successfully
                          </p>
                          <p className="text-xs text-slate-500 truncate max-w-lg mt-0.5" title={curriculumItem.videoUrl}>
                            {curriculumItem.videoUrl}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPreviewIndex(previewIndex === index ? null : index)
                          }
                          className="h-8 text-xs font-medium"
                        >
                          {previewIndex === index ? "Hide Player" : "Preview Video"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleReplaceVideo(index)}
                          className="h-8 text-xs font-medium text-slate-700 hover:text-slate-900"
                        >
                          Replace
                        </Button>
                      </div>
                    </div>

                    {/* Collapsible video preview */}
                    {previewIndex === index ? (
                      <div className="rounded-lg overflow-hidden border border-slate-300 bg-black p-1">
                        <VideoPlayer
                          url={curriculumItem.videoUrl}
                          width="100%"
                          height="280px"
                        />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  /* No video attached yet: User can either Upload File OR Paste Link */
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/60">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Attach Video Source
                      </span>
                      <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-xs font-medium">
                        <button
                          type="button"
                          onClick={() => setActiveInputMode({ ...activeInputMode, [index]: "file" })}
                          className={`px-3 py-1 rounded-md transition-all ${
                            currentMode === "file"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          📁 Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveInputMode({ ...activeInputMode, [index]: "url" })}
                          className={`px-3 py-1 rounded-md transition-all ${
                            currentMode === "url"
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          🔗 Paste Link
                        </button>
                      </div>
                    </div>

                    {currentMode === "file" ? (
                      /* File upload mode */
                      <label className="mt-3 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/20 rounded-lg p-6 cursor-pointer transition-colors group">
                        <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-600 mb-2 transition-colors" />
                        <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">
                          Click to choose a video file
                        </span>
                        <span className="text-xs text-slate-500 mt-1">
                          Supports MP4, WebM, MOV files
                        </span>
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(event) => handleSingleLectureUpload(event, index)}
                        />
                      </label>
                    ) : (
                      /* Direct URL mode */
                      <div className="mt-3 space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g. https://www.youtube.com/watch?v=... or direct MP4 link"
                            value={urlInputs[index] || ""}
                            onChange={(e) =>
                              setUrlInputs({ ...urlInputs, [index]: e.target.value })
                            }
                            className="bg-white text-sm"
                          />
                          <Button
                            type="button"
                            onClick={() => handleAttachVideoUrl(index)}
                            className="shrink-0 gap-1.5"
                          >
                            <LinkIcon className="w-4 h-4" />
                            Attach Video
                          </Button>
                        </div>
                        <p className="text-xs text-slate-500">
                          Paste any YouTube, Vimeo, or external MP4/WebM video URL.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleNewLecture}
            className="w-full border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 text-slate-700 py-6 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Another Lecture
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default CourseCurriculum;
