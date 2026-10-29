import MediaProgressbar from "@/components/media-progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InstructorContext } from "@/context/instructor-context";
import { mediaUploadService } from "@/services";
import { useContext, useState } from "react";
import { toast } from "react-hot-toast";

function CourseSettings() {
  const {
    courseLandingFormData,
    setCourseLandingFormData,
    mediaUploadProgress,
    setMediaUploadProgress,
    mediaUploadProgressPercentage,
    setMediaUploadProgressPercentage,
  } = useContext(InstructorContext);

  const [imageUrlInput, setImageUrlInput] = useState("");

  async function handleImageUploadChange(event) {
    const selectedImage = event.target.files?.[0];

    if (selectedImage) {
      const imageFormData = new FormData();
      imageFormData.append("file", selectedImage);

      try {
        setMediaUploadProgress(true);
        const response = await mediaUploadService(
          imageFormData,
          setMediaUploadProgressPercentage
        );
        if (response?.success && response.data?.url) {
          setCourseLandingFormData({
            ...courseLandingFormData,
            image: response.data.secure_url || response.data.url,
          });
          toast.success("Course image uploaded successfully!");
        } else {
          toast.error(response?.message || "Unable to upload the course image.");
        }
      } catch (error) {
        console.error(
          "Unable to upload course image:",
          error.response?.data?.message || error.message
        );
        toast.error(
          error.response?.data?.message ||
            "Unable to upload course image. Please try again."
        );
      } finally {
        setMediaUploadProgress(false);
        setMediaUploadProgressPercentage(0);
        event.target.value = "";
      }
    }
  }

  function handleAttachImageUrl() {
    if (!imageUrlInput.trim()) {
      toast.error("Please enter a valid image URL.");
      return;
    }
    setCourseLandingFormData({
      ...courseLandingFormData,
      image: imageUrlInput.trim(),
    });
    setImageUrlInput("");
    toast.success("Course image attached!");
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">
          Course Cover Image & Settings
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Upload a high-quality cover image for your course or paste an image link.
        </p>
      </CardHeader>
      <div className="px-6">
        {mediaUploadProgress ? (
          <MediaProgressbar
            isMediaUploading={mediaUploadProgress}
            progress={mediaUploadProgressPercentage}
          />
        ) : null}
      </div>
      <CardContent className="pt-2">
        {courseLandingFormData?.image ? (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 max-w-md bg-slate-100 shadow-sm">
              <img
                src={courseLandingFormData.image}
                alt="Course Cover"
                className="max-h-64 w-full object-cover"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setCourseLandingFormData({
                  ...courseLandingFormData,
                  image: "",
                })
              }
              className="text-sm"
            >
              Change / Remove Image
            </Button>
          </div>
        ) : (
          <div className="space-y-4 max-w-xl">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold text-slate-700">
                Upload Image File
              </Label>
              <Input
                onChange={handleImageUploadChange}
                type="file"
                accept="image/*"
                className="cursor-pointer"
              />
              <span className="text-xs text-slate-500">
                Recommended dimensions: 750x422 pixels (JPG, PNG, WebP)
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Or Use Image Link
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="e.g. https://images.unsplash.com/... or direct image URL"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="text-sm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAttachImageUrl}
                className="shrink-0"
              >
                Attach Link
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CourseSettings;
