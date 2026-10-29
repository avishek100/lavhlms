import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createTeacherNoticeService,
  fetchNoticeClassesService,
  fetchTeacherNoticesService,
} from "@/services";
import { Megaphone } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";

export default function InstructorNotices({ isAdmin = false }) {
  const [classes, setClasses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [audience, setAudience] = useState("batch");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const loadNotices = useCallback(async () => {
    try {
      const response = await fetchTeacherNoticesService();
      if (response?.success) setNotices(response.data || []);
      else toast.error(response?.message || "Unable to load notices.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to load notices.");
    }
  }, []);

  useEffect(() => {
    async function loadPage() {
      const [classesResult, noticesResult] = await Promise.allSettled([
        fetchNoticeClassesService(),
        fetchTeacherNoticesService(),
      ]);

      if (classesResult.status === "fulfilled" && classesResult.value?.success) {
        setClasses(classesResult.value.data || []);
      } else {
        const error =
          classesResult.status === "rejected"
            ? classesResult.reason
            : null;
        toast.error(
          error?.response?.data?.message ||
            classesResult.value?.message ||
            "Unable to load batches."
        );
      }

      InstructorNotices.propTypes = {
        isAdmin: PropTypes.bool,
      };

      if (noticesResult.status === "fulfilled" && noticesResult.value?.success) {
        setNotices(noticesResult.value.data || []);
      } else {
        const error =
          noticesResult.status === "rejected"
            ? noticesResult.reason
            : null;
        toast.error(
          error?.response?.data?.message ||
            noticesResult.value?.message ||
            "Unable to load notices."
        );
      }
      setIsLoading(false);
    }

    loadPage();
  }, []);

  function toggleClass(className) {
    setSelectedClasses((current) =>
      current.includes(className)
        ? current.filter((item) => item !== className)
        : [...current, className]
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSending(true);
    try {
      const response = await createTeacherNoticeService({
        audience: isAdmin ? audience : "batch",
        studentClasses:
          (isAdmin ? audience : "batch") === "batch" ? selectedClasses : [],
        title,
        message,
      });
      toast.success(response.message || "Notice sent.");
      setTitle("");
      setMessage("");
      setSelectedClasses([]);
      await loadNotices();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to send notice.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone aria-hidden="true" className="h-5 w-5 text-blue-700" />
            Send a notice
          </CardTitle>
          <p className="text-sm text-slate-500">
            {isAdmin
              ? "Send to selected batches or make an announcement to the whole college."
              : "Send a notice to one or more batches you teach."}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="notice-audience">Send to</Label>
                <select
                  id="notice-audience"
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                  value={audience}
                  onChange={(event) => setAudience(event.target.value)}
                >
                  <option value="batch">Selected batch(es)</option>
                  <option value="college">Whole college</option>
                </select>
              </div>
            )}
            {(!isAdmin || audience === "batch") && (
              <fieldset className="space-y-2" disabled={isLoading}>
                <legend className="text-sm font-medium">
                  Select batch{classes.length === 1 ? "" : "es"}
                </legend>
                {isLoading ? (
                  <p className="text-sm text-slate-500">Loading batches...</p>
                ) : classes.length ? (
                  <div className="grid gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-2">
                    {classes.map((className) => (
                      <label
                        key={className}
                        className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={selectedClasses.includes(className)}
                          onChange={() => toggleClass(className)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                        />
                        {className}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-amber-700">
                    No batches are available. A teacher must have a course
                    assigned to a batch before sending batch notices.
                  </p>
                )}
              </fieldset>
            )}
            <div className="space-y-2">
              <Label htmlFor="notice-title">Notice title</Label>
              <Input
                id="notice-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={160}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notice-message">Message</Label>
              <Textarea
                id="notice-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={5000}
                rows={5}
                required
              />
            </div>
            <Button
              type="submit"
              className="rounded-lg"
              disabled={
                isSending ||
                isLoading ||
                ((!isAdmin || audience === "batch") &&
                  (!classes.length || !selectedClasses.length))
              }
            >
              {isSending ? "Sending..." : "Send notice"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Sent notices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notices.length ? (
            notices.map((notice) => (
              <article
                key={notice._id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{notice.title}</h3>
                  <time className="text-xs text-slate-500">
                    {new Date(notice.createdAt).toLocaleString()}
                  </time>
                </div>
                <p className="mt-1 text-sm font-medium text-blue-700">
                  {notice.audience === "college"
                    ? "Whole college"
                    : notice.audience === "batch"
                      ? notice.studentClasses?.join(", ")
                      : notice.courseTitle || "Whole college"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Sent by {notice.senderName || "Teacher"}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {notice.message}
                </p>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-500">No notices sent yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
