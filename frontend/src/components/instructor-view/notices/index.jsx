import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { courseExamOptions, getStudentProgramLabel } from "@/config";
import {
  createAdminNoticeService,
  fetchAdminNoticesService,
} from "@/services";
import { Megaphone } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function AdminNotices() {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("college");
  const [recipientProgram, setRecipientProgram] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const loadNotices = useCallback(async () => {
    try {
      const response = await fetchAdminNoticesService();
      if (response?.success) setNotices(response.data || []);
      else toast.error(response?.message || "Unable to load notices.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to load notices.");
    }
  }, []);

  useEffect(() => {
    async function loadPage() {
      try {
        const response = await fetchAdminNoticesService();
        if (response?.success) {
          setNotices(response.data || []);
        } else {
          toast.error(response?.message || "Unable to load notices.");
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Unable to load notices.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPage();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSending(true);
    try {
      const response = await createAdminNoticeService({
        title,
        message,
        audience,
        recipientProgram: audience === "program" ? recipientProgram : "",
      });
      toast.success(response.message || "Notice sent.");
      setTitle("");
      setMessage("");
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
            Choose whether all students or only one exam program should receive
            this notice.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notice-audience">Send to</Label>
              <select
                id="notice-audience"
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
              >
                <option value="college">All students</option>
                <option value="program">A specific exam program</option>
              </select>
            </div>
            {audience === "program" && (
              <div className="space-y-2">
                <Label htmlFor="notice-program">Exam program</Label>
                <select
                  id="notice-program"
                  value={recipientProgram}
                  onChange={(event) => setRecipientProgram(event.target.value)}
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
                  required
                >
                  <option value="" disabled>
                    Select a program
                  </option>
                  {courseExamOptions.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.label}
                    </option>
                  ))}
                </select>
              </div>
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
              disabled={isSending || isLoading}
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
                  {notice.audience === "program"
                    ? `${getStudentProgramLabel(notice.recipientProgram)} students`
                    : "All students"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Sent by {notice.senderName || "Administrator"}
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
