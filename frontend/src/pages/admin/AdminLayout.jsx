import { AuthContext } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  UserPlus,
  Users,
} from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { fetchContactInquiriesService } from "@/services";
import { toast } from "react-hot-toast";

const navigationItems = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Students", to: "/admin/students", icon: Users, end: true },
  { label: "Add Student", to: "/admin/students/new", icon: UserPlus },
  { label: "Courses", to: "/admin/courses", icon: BookOpen },
  { label: "Notices", to: "/admin/notices", icon: Megaphone },
  { label: "Contact messages", to: "/admin/contact-inquiries", icon: Mail },
];

export default function AdminLayout() {
  const { resetCredentials } = useContext(AuthContext);
  const navigate = useNavigate();
  const [hasUnreadContactMessages, setHasUnreadContactMessages] = useState(false);

  const updateUnreadContactMessages = useCallback(async () => {
    try {
      const response = await fetchContactInquiriesService();
      if (!response?.success) {
        throw new Error(response?.message || "Unable to check contact messages.");
      }
      setHasUnreadContactMessages(
        (response.data || []).some((inquiry) => inquiry.status === "new")
      );
    } catch (error) {
      console.error("Unable to check for unread contact messages:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to check contact messages."
      );
    }
  }, []);

  useEffect(() => {
    updateUnreadContactMessages();
    const intervalId = window.setInterval(updateUnreadContactMessages, 60000);
    window.addEventListener(
      "contact-inquiries-updated",
      updateUnreadContactMessages
    );

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(
        "contact-inquiries-updated",
        updateUnreadContactMessages
      );
    };
  }, [updateUnreadContactMessages]);

  function handleLogout() {
    resetCredentials();
    sessionStorage.removeItem("filters");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="border-b border-slate-200 bg-white md:min-h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div className="p-4 md:sticky md:top-0 md:p-5">
          <Link to="/admin" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 text-white">
              <GraduationCap aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="font-semibold tracking-tight text-slate-900">
              IELTS &amp; PTE Prep
            </span>
          </Link>
          <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Administration
          </p>
          <nav
            className="flex gap-1 overflow-x-auto md:block md:space-y-1"
            aria-label="Admin navigation"
          >
            {navigationItems.map(({ label, to, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                aria-label={
                  label === "Contact messages" && hasUnreadContactMessages
                    ? `${label}, unread messages`
                    : label
                }
                className={({ isActive }) =>
                  `flex h-10 shrink-0 items-center rounded-lg px-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-800"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon aria-hidden="true" className="mr-2 h-4 w-4" />
                <span>{label}</span>
                {label === "Contact messages" && hasUnreadContactMessages && (
                  <span
                    aria-hidden="true"
                    className="ml-auto h-2.5 w-2.5 rounded-full bg-red-600"
                  />
                )}
              </NavLink>
            ))}
          </nav>
          <div className="mt-5 hidden border-t border-slate-100 pt-4 md:block">
            <p className="truncate px-3 text-sm text-slate-500">
              Lavh Shrestha
            </p>
            <Button
              variant="ghost"
              className="mt-2 h-10 w-full justify-start rounded-lg px-3 text-slate-600 hover:text-slate-900"
              onClick={handleLogout}
            >
              <LogOut aria-hidden="true" className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 md:hidden">
            <span className="truncate text-sm text-slate-500">
              Lavh Shrestha
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={handleLogout}
            >
              <LogOut aria-hidden="true" className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
