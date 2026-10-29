import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchActiveStudentCountService,
  fetchInstructorCourseListService,
} from "@/services";
import { BookOpen, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [activeStudentCount, setActiveStudentCount] = useState(null);
  const [courseCount, setCourseCount] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [studentResponse, courseResponse] = await Promise.all([
          fetchActiveStudentCountService(),
          fetchInstructorCourseListService(),
        ]);

        if (studentResponse?.success) {
          setActiveStudentCount(studentResponse.data.count);
        } else {
          toast.error(
            studentResponse?.message || "Unable to load the active student count."
          );
        }

        if (courseResponse?.success) {
          setCourseCount(courseResponse.data?.length || 0);
        } else {
          toast.error(courseResponse?.message || "Unable to load courses.");
        }
      } catch (error) {
        console.error("Unable to load admin dashboard:", error);
        toast.error("Unable to load dashboard information. Please try again.");
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-blue-700">Admin workspace</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          A quick overview of IELTS and PTE preparation courses and student accounts.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Active students
            </CardTitle>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Users aria-hidden="true" className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            {activeStudentCount === null ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-semibold text-slate-900">
                {activeStudentCount}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Courses
            </CardTitle>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <BookOpen aria-hidden="true" className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            {courseCount === null ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-semibold text-slate-900">
                {courseCount}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild className="rounded-lg">
            <Link to="/admin/students/new">
              <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
              Create student account
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-lg">
            <Link to="/admin/courses">Manage courses</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
