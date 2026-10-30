import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  GraduationCap,
  Megaphone,
  Plus,
  ArrowUpRight,
  Users,
} from "lucide-react";
import {
  fetchActiveStudentCountService,
  fetchInstructorCourseListService,
} from "@/services";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

const programs = [
  { id: "ielts-preparation", label: "IELTS", color: "bg-sky-500" },
  { id: "pte-preparation", label: "PTE", color: "bg-violet-500" },
];

export default function AdminDashboard() {
  const [activeStudentCount, setActiveStudentCount] = useState(null);
  const [courses, setCourses] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      const [studentResult, courseResult] = await Promise.allSettled([
        fetchActiveStudentCountService(),
        fetchInstructorCourseListService(),
      ]);

      if (studentResult.status === "fulfilled" && studentResult.value?.success) {
        setActiveStudentCount(studentResult.value.data.count);
      } else {
        const error =
          studentResult.status === "rejected" ? studentResult.reason : null;
        toast.error(
          error?.response?.data?.message ||
            studentResult.value?.message ||
            "Unable to load the active student count."
        );
      }

      if (courseResult.status === "fulfilled" && courseResult.value?.success) {
        setCourses(courseResult.value.data || []);
      } else {
        const error =
          courseResult.status === "rejected" ? courseResult.reason : null;
        toast.error(
          error?.response?.data?.message ||
            courseResult.value?.message ||
            "Unable to load courses."
        );
      }
    }

    loadDashboard();
  }, []);

  const courseCountByProgram = Object.fromEntries(
    programs.map(({ id }) => [
      id,
      courses?.filter((course) => course.category === id).length ?? null,
    ])
  );
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      <section className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-white to-indigo-100 px-6 py-8 text-slate-900 shadow-lg shadow-blue-950/5 sm:px-9 sm:py-10">
        <div
          aria-hidden="true"
          className="absolute -right-12 -top-24 -z-10 h-72 w-72 rounded-full bg-sky-300/35 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 right-1/4 -z-10 h-64 w-64 rounded-full bg-indigo-300/30 blur-3xl"
        />
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-800 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Administrator workspace
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {greeting}, Lavh Shrestha
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              Your IELTS and PTE learning hub at a glance. Manage your students,
              courses, and announcements from one place.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Button
              asChild
              className="h-11 rounded-lg bg-blue-700 px-4 font-medium text-white hover:bg-blue-800"
            >
              <Link to="/admin/students/new">
                <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
                Add student
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-lg border-blue-200 bg-white/80 px-4 text-blue-800 hover:bg-blue-50 hover:text-blue-900"
            >
              <Link to="/admin/courses/new">
                <BookOpen aria-hidden="true" className="mr-2 h-4 w-4" />
                Create course
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section aria-label="Workspace overview">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Workspace overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              A snapshot of your active learning programs.
            </p>
          </div>
          <GraduationCap
            aria-hidden="true"
            className="hidden h-6 w-6 text-blue-700 sm:block"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <OverviewCard
            label="Active students"
            value={activeStudentCount}
            icon={Users}
            iconStyle="bg-emerald-50 text-emerald-700"
            detail="Currently able to sign in"
          />
          <OverviewCard
            label="Total courses"
            value={courses?.length ?? null}
            icon={BookOpen}
            iconStyle="bg-blue-50 text-blue-700"
            detail="Across all programs"
          />
          {programs.map((program) => (
            <OverviewCard
              key={program.id}
              label={`${program.label} courses`}
              value={courseCountByProgram[program.id]}
              icon={GraduationCap}
              iconStyle={
                program.label === "IELTS"
                  ? "bg-sky-50 text-sky-700"
                  : "bg-violet-50 text-violet-700"
              }
              detail={`Courses in ${program.label} preparation`}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Manage your workspace
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Jump straight into the tools you use most.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <ActionCard
            to="/admin/students"
            title="Student directory"
            description="Review student accounts and manage access."
            icon={Users}
            iconStyle="bg-emerald-50 text-emerald-700"
          />
          <ActionCard
            to="/admin/courses"
            title="Course library"
            description="Create, update, and organize IELTS and PTE lessons."
            icon={BookOpen}
            iconStyle="bg-blue-50 text-blue-700"
          />
          <ActionCard
            to="/admin/notices"
            title="Announcements"
            description="Share updates with all students."
            icon={Megaphone}
            iconStyle="bg-amber-50 text-amber-700"
          />
        </div>
      </section>
    </div>
  );
}

function OverviewCard({ label, value, icon: Icon, iconStyle, detail }) {
  return (
    <Card className="rounded-xl border-slate-200 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            {value === null ? (
              <Skeleton className="mt-3 h-8 w-16" />
            ) : (
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                {value}
              </p>
            )}
          </div>
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconStyle}`}
          >
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
          {detail}
        </p>
      </CardContent>
    </Card>
  );
}

OverviewCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  icon: PropTypes.elementType.isRequired,
  iconStyle: PropTypes.string.isRequired,
  detail: PropTypes.string.isRequired,
};

function ActionCard({ to, title, description, icon: Icon, iconStyle }) {
  return (
    <Link
      to={to}
      className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
    >
      <Card className="h-full rounded-xl border-slate-200 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:border-blue-200 group-hover:shadow-md">
        <CardContent className="flex h-full items-start gap-4 p-5">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
          >
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <ArrowUpRight
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-blue-700"
              />
            </div>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              {description}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

ActionCard.propTypes = {
  to: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  iconStyle: PropTypes.string.isRequired,
};
