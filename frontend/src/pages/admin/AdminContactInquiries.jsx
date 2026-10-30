import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { filterOptions } from "@/config";
import {
  fetchContactInquiriesService,
  markContactInquiryReadService,
} from "@/services";
import { CalendarDays, Mail, MailOpen } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const dateRanges = [
  { value: "all", label: "All dates" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last-7-days", label: "Last 7 days" },
  { value: "last-30-days", label: "Last 30 days" },
  { value: "this-month", label: "This month" },
];

function isInDateRange(createdAt, range, now = new Date()) {
  if (range === "all") return true;

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const start = new Date(today);

  if (range === "yesterday") {
    start.setDate(start.getDate() - 1);
    return date >= start && date < today;
  }
  if (range === "last-7-days") start.setDate(start.getDate() - 6);
  if (range === "last-30-days") start.setDate(start.getDate() - 29);
  if (range === "this-month") start.setDate(1);

  return date >= start && date < tomorrow;
}

export default function AdminContactInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("all");

  const filteredInquiries = useMemo(
    () =>
      inquiries
        .filter((inquiry) => isInDateRange(inquiry.createdAt, dateRange))
        .sort(
          (first, second) =>
            new Date(second.createdAt).getTime() -
            new Date(first.createdAt).getTime()
        ),
    [dateRange, inquiries]
  );

  const loadInquiries = useCallback(async () => {
    try {
      const response = await fetchContactInquiriesService();
      if (!response?.success) {
        throw new Error(response?.message || "Unable to load contact messages.");
      }
      setInquiries(response.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load contact messages."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  async function markAsRead(id) {
    try {
      await markContactInquiryReadService(id);
      setInquiries((current) =>
        current.map((inquiry) =>
          inquiry._id === id ? { ...inquiry, status: "read" } : inquiry
        )
      );
      window.dispatchEvent(new Event("contact-inquiries-updated"));
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to update this message."
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-700">Inbox</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Contact messages
        </h1>
        <p className="mt-2 text-slate-500">
          Inquiries sent from the public Contact Us form.
        </p>
      </div>
      {isLoading ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading messages…
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <label
              htmlFor="contact-inquiry-date-range"
              className="flex items-center gap-2 text-sm font-medium text-slate-700"
            >
              <CalendarDays aria-hidden="true" className="h-4 w-4 text-blue-700" />
              Filter by date
            </label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger
                id="contact-inquiry-date-range"
                className="w-full sm:w-52"
                aria-label="Filter contact messages by date"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {filteredInquiries.length ? (
            <>
              <p className="text-sm text-slate-500">
                Showing {filteredInquiries.length}{" "}
                {filteredInquiries.length === 1 ? "message" : "messages"}.
              </p>
              <div className="space-y-4">
                {filteredInquiries.map((inquiry) => (
                  <Card
                    key={inquiry._id}
                    className="rounded-xl border-slate-200 shadow-sm"
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                      <div className="min-w-0">
                        <CardTitle className="text-base">
                          {inquiry.subject || "Contact inquiry"}
                        </CardTitle>
                        <p className="mt-1 text-sm text-slate-600">
                          {inquiry.name || "Name not provided"}
                          {inquiry.email && (
                            <>
                              {" · "}
                              <a
                                className="text-blue-700 hover:underline"
                                href={`mailto:${inquiry.email}`}
                              >
                                {inquiry.email}
                              </a>
                            </>
                          )}
                          {inquiry.contactNumber && (
                            <>
                              {" · "}
                              <a
                                className="text-blue-700 hover:underline"
                                href={`tel:${inquiry.contactNumber}`}
                              >
                                {inquiry.contactNumber}
                              </a>
                            </>
                          )}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                          inquiry.status === "new"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {inquiry.status === "new" ? "New" : "Read"}
                      </span>
                    </CardHeader>
                    <CardContent>
                      {Object.entries(inquiry.preferences || {}).some(
                        ([, selected]) => selected?.length
                      ) && (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {Object.entries(inquiry.preferences || {}).flatMap(
                            ([field, selected]) =>
                              (selected || []).map((value) => {
                                const option = filterOptions[field]?.find(
                                  (item) => item.id === value
                                );
                                return option ? (
                                  <span
                                    key={`${field}-${value}`}
                                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800"
                                  >
                                    {option.label}
                                  </span>
                                ) : null;
                              })
                          )}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {inquiry.message}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                        <time className="text-xs text-slate-500">
                          {new Date(inquiry.createdAt).toLocaleString()}
                        </time>
                        {inquiry.status === "new" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => markAsRead(inquiry._id)}
                          >
                            <MailOpen aria-hidden="true" className="h-4 w-4" />
                            Mark as read
                          </Button>
                        )}
                        {inquiry.status === "read" && (
                          <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                            <Mail aria-hidden="true" className="h-4 w-4" />
                            Reviewed
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              {inquiries.length
                ? "No contact messages found for this date range."
                : "No contact messages yet."}
            </p>
          )}
        </>
      )}
    </div>
  );
}
