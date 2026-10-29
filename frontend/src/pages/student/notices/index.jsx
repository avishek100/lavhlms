import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchStudentNoticesService } from "@/services";
import { Megaphone } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function StudentNoticesPage() {
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNotices() {
      try {
        const response = await fetchStudentNoticesService();
        if (!response?.success) {
          toast.error(response?.message || "Unable to load notices.");
          return;
        }
        setNotices(response.data || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Unable to load notices.");
      } finally {
        setIsLoading(false);
      }
    }

    loadNotices();
  }, []);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <p className="text-sm font-medium text-blue-700">Student information</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Notices
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Updates and announcements from your teachers.
        </p>
      </header>
      {isLoading ? (
        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardContent className="py-8 text-sm text-slate-500">
            Loading notices...
          </CardContent>
        </Card>
      ) : notices.length ? (
        notices.map((notice) => (
          <Card key={notice._id} className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Megaphone aria-hidden="true" className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg">{notice.title}</CardTitle>
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
                </div>
                <time className="shrink-0 text-xs text-slate-500">
                  {new Date(notice.createdAt).toLocaleString()}
                </time>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {notice.message}
              </p>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardContent className="py-10 text-center text-sm text-slate-500">
            There are no notices yet.
          </CardContent>
        </Card>
      )}
    </main>
  );
}
