import InstructorCourses from "@/components/instructor-view/courses";
import InstructorDashboard from "@/components/instructor-view/dashboard";
import InstructorAttendance from "@/components/instructor-view/attendance";
import InstructorNotices from "@/components/instructor-view/notices";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import { fetchInstructorCourseListService } from "@/services";
import {
  BarChart,
  Book,
  ClipboardCheck,
  GraduationCap,
  LogOut,
  Megaphone,
} from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

function InstructorDashboardpage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { auth, resetCredentials } = useContext(AuthContext);
  const { instructorCoursesList, setInstructorCoursesList } =
    useContext(InstructorContext);
  const navigate = useNavigate();

  const fetchAllCourses = useCallback(async () => {
    try {
      const response = await fetchInstructorCourseListService();
      if (response?.success) {
        setInstructorCoursesList(response.data || []);
      } else {
        toast.error(response?.message || "Unable to load your courses.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to load your courses.");
    }
  }, [setInstructorCoursesList]);

  useEffect(() => {
    fetchAllCourses();
  }, [fetchAllCourses]);

  const menuItems = [
    {
      icon: BarChart,
      label: "Dashboard",
      value: "dashboard",
      component: <InstructorDashboard listOfCourses={instructorCoursesList} />,
    },
    {
      icon: Book,
      label: "Courses",
      value: "courses",
      component: <InstructorCourses listOfCourses={instructorCoursesList} />,
    },
    {
      icon: ClipboardCheck,
      label: "Attendance",
      value: "attendance",
      component: <InstructorAttendance />,
    },
    {
      icon: Megaphone,
      label: "Notices",
      value: "notices",
      component: <InstructorNotices />,
    },
    {
      icon: LogOut,
      label: "Logout",
      value: "logout",
      component: null,
    },
  ];

  function handleLogout() {
    resetCredentials();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-full shrink-0 border-b border-slate-200 bg-white md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="p-4 md:sticky md:top-0 md:p-5">
          <Link to="/" className="mb-8 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 text-white">
              <GraduationCap aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="font-semibold tracking-tight text-slate-900">
              IELTS &amp; PTE Prep
            </span>
          </Link>
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Instructor
          </p>
          <nav
            className="flex gap-1 overflow-x-auto md:block md:space-y-1"
            aria-label="Instructor navigation"
          >
            {menuItems.map((menuItem) => (
              <Button
                className={`mb-1 h-10 shrink-0 justify-start rounded-lg md:w-full ${
                  activeTab === menuItem.value
                    ? "bg-blue-50 text-blue-800 hover:bg-blue-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                key={menuItem.value}
                variant="ghost"
                onClick={
                  menuItem.value === "logout"
                    ? handleLogout
                    : () => setActiveTab(menuItem.value)
                }
              >
                <menuItem.icon className="mr-2 h-4 w-4" />
                {menuItem.label}
              </Button>
            ))}
          </nav>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-700">
                Welcome{auth?.user?.userName ? `, ${auth.user.userName}` : ""}
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                {menuItems.find((item) => item.value === activeTab)?.label ||
                  "Dashboard"}
              </h1>
            </div>
            <Button
              variant="outline"
              className="rounded-lg border-slate-200 bg-white md:hidden"
              onClick={handleLogout}
            >
              Sign out
            </Button>
          </header>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {menuItems.map((menuItem) => (
              <TabsContent key={menuItem.value} value={menuItem.value}>
                {menuItem.component !== null ? menuItem.component : null}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default InstructorDashboardpage;
