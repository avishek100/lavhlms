import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { filterOptions } from "@/config";
import { createContactInquiryService } from "@/services";
import { BookOpen, Clock3, GraduationCap, Mail, MessageSquareText, Target } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

const initialForm = {
  name: "",
  email: "",
  contactNumber: "",
  message: "",
  preferences: {
    category: [],
    formats: [],
    purposes: [],
    timeSlots: [],
  },
};

const preferenceSections = [
  { field: "category", label: "Course", icon: GraduationCap },
  { field: "formats", label: "Format", icon: BookOpen },
  { field: "purposes", label: "Purpose", icon: Target },
  { field: "timeSlots", label: "Time slot", icon: Clock3 },
];

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [isSending, setIsSending] = useState(false);
  const [preferencesError, setPreferencesError] = useState("");

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function togglePreference(field, value) {
    setForm((current) => {
      const selectedValues = current.preferences[field];
      return {
        ...current,
        preferences: {
          ...current.preferences,
          [field]: selectedValues.includes(value)
            ? selectedValues.filter((item) => item !== value)
            : [...selectedValues, value],
        },
      };
    });
    setPreferencesError("");
  }

  function toggleAllFormats() {
    setForm((current) => {
      const allFormats = filterOptions.formats.map((option) => option.id);
      const selectedAll = allFormats.every((value) =>
        current.preferences.formats.includes(value)
      );
      return {
        ...current,
        preferences: {
          ...current.preferences,
          formats: selectedAll ? [] : allFormats,
        },
      };
    });
    setPreferencesError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const hasSelectedPreference = Object.values(form.preferences).some(
      (selectedValues) => selectedValues.length > 0
    );
    if (!hasSelectedPreference) {
      setPreferencesError("Select at least one option so we know what you need.");
      return;
    }

    setPreferencesError("");
    setIsSending(true);
    try {
      const response = await createContactInquiryService(form);
      if (!response?.success) {
        throw new Error(response?.message || "Unable to send your message.");
      }
      toast.success("Message sent.");
      setForm(initialForm);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to send your message. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="min-h-[70vh] bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="py-2">
          <p className="text-sm font-semibold text-blue-700">Contact us</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            How can we help?
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Send a message to the ADS College administration. We’ll review your
            inquiry and use the contact details you provide to follow up.
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm text-slate-600">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Mail aria-hidden="true" className="h-5 w-5" />
            </span>
            Messages are delivered to the administrator’s inbox.
          </div>
        </section>
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareText
                aria-hidden="true"
                className="h-5 w-5 text-blue-700"
              />
              Send a message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Your name</Label>
                <Input
                  id="contact-name"
                  name="name"
                  autoComplete="name"
                  maxLength={100}
                  value={form.name}
                  onChange={updateField}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email address (optional)</Label>
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  value={form.email}
                  onChange={updateField}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-number">Contact number</Label>
                <Input
                  id="contact-number"
                  name="contactNumber"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={20}
                  placeholder="Enter your phone number"
                  value={form.contactNumber}
                  onChange={updateField}
                  required
                />
              </div>
              <fieldset
                aria-describedby={
                  preferencesError ? "contact-preferences-error" : undefined
                }
                className={`space-y-3 rounded-xl border p-3 sm:p-4 ${
                  preferencesError ? "border-rose-300" : "border-slate-200"
                }`}
              >
                <legend className="px-1 text-sm font-medium text-slate-900">
                  What are you interested in?
                </legend>
                <p className="text-xs text-slate-500">
                  Select at least one option.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {preferenceSections.map(({ field, label, icon: Icon }) => (
                    <fieldset
                      className="min-w-0 rounded-lg bg-slate-50 p-3"
                      key={field}
                    >
                      <legend className="flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                        {label}
                      </legend>
                      <div className="mt-1 grid gap-1">
                        {field === "formats" && (
                          <Label className="flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-slate-700 hover:bg-white">
                            <Checkbox
                              checked={filterOptions.formats.every((option) =>
                                form.preferences.formats.includes(option.id)
                              )}
                              onCheckedChange={toggleAllFormats}
                            />
                            Select all
                          </Label>
                        )}
                        {filterOptions[field].map((option) => (
                          <Label
                            key={option.id}
                            className="flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm text-slate-700 hover:bg-white"
                          >
                            <Checkbox
                              checked={form.preferences[field].includes(
                                option.id
                              )}
                              onCheckedChange={() =>
                                togglePreference(field, option.id)
                              }
                            />
                            <span className="leading-5">{option.label}</span>
                          </Label>
                        ))}
                      </div>
                    </fieldset>
                  ))}
                </div>
              </fieldset>
              {preferencesError && (
                <p
                  id="contact-preferences-error"
                  role="alert"
                  className="text-sm text-rose-700"
                >
                  {preferencesError}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  maxLength={5000}
                  value={form.message}
                  onChange={updateField}
                  required
                />
              </div>
              <Button type="submit" className="rounded-lg" disabled={isSending}>
                {isSending ? "Sending..." : "Send to administration"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
