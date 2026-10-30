import { AuthContext } from "@/context/auth-context";
import {
  BookOpen,
  GraduationCap,
  LogOut,
  Menu,
  Megaphone,
  UserRound,
} from "lucide-react";
import { fetchProfileService } from "@/services";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

function StudentViewCommonHeader() {
  const navigate = useNavigate();
  const { auth, resetCredentials } = useContext(AuthContext);
  const [profileImage, setProfileImage] = useState("");
  const isPendingApproval =
    auth?.user?.role === "student" && auth.user.approved === false;

  useEffect(() => {
    if (auth?.user?.role !== "student") {
      setProfileImage("");
      return undefined;
    }

    let isCurrent = true;
    function loadProfileImage() {
      fetchProfileService()
        .then((response) => {
          if (isCurrent && response?.success) {
            setProfileImage(response.data.image || "");
          }
        })
        .catch((error) => {
          console.error("Unable to load profile picture for navigation:", error);
        });
    }

    loadProfileImage();
    window.addEventListener("student-profile-updated", loadProfileImage);

    return () => {
      isCurrent = false;
      window.removeEventListener("student-profile-updated", loadProfileImage);
    };
  }, [auth?.user?._id, auth?.user?.role]);

  function handleLogout() {
    resetCredentials();
    sessionStorage.removeItem("filters");
    navigate("/login");
  }

  function navigateToProgramCourses(category) {
    sessionStorage.setItem("filters", JSON.stringify({ category: [category] }));
    navigate("/courses", { state: { programCategory: category } });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:flex-nowrap lg:px-8"
      >
        <Link to="/home" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 text-white">
            <GraduationCap aria-hidden="true" className="h-5 w-5" />
          </span>
          <span className="font-semibold tracking-tight text-slate-900">
            IELTS &amp; PTE Prep
          </span>
        </Link>
        <div className="hidden items-center justify-end gap-0.5 lg:flex">
          <Button
            asChild
            variant="ghost"
            className="text-slate-600 hover:text-blue-700"
          >
            <Link to="/ielts">IELTS</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="text-slate-600 hover:text-blue-700"
          >
            <Link to="/pte">PTE</Link>
          </Button>
          <Button
            variant="ghost"
            className="text-slate-600 hover:text-blue-700"
            onClick={() =>
            navigateToProgramCourses("duolingo-preparation")
            }
          >
            Duolingo
          </Button>
          <Button
            variant="ghost"
            className="text-slate-600 hover:text-blue-700"
            onClick={() => navigateToProgramCourses("celpip-preparation")}
          >
            CELPIP
          </Button>
          <Button
            asChild
            variant="ghost"
            className="gap-2 text-slate-600 hover:text-blue-700"
          >
            <Link to="/courses">
              <BookOpen aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">All courses</span>
              <span className="sm:hidden">All</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="text-slate-600 hover:text-blue-700"
          >
            <Link to="/about">About us</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="text-slate-600 hover:text-blue-700"
          >
            <Link to="/contact">Contact us</Link>
          </Button>
          {!isPendingApproval && auth?.user?.role === "student" && (
            <>
              <Button
                asChild
                variant="ghost"
                className="text-slate-600 hover:text-blue-700"
              >
                <Link to="/student-courses">My courses</Link>
              </Button>
            </>
          )}
          {auth?.user?.role === "student" && (
            <Button
              asChild
              variant="ghost"
              className="gap-2 text-slate-600 hover:text-blue-700"
            >
              <Link to="/notices">
                <Megaphone aria-hidden="true" className="h-4 w-4" />
                <span className="hidden sm:inline">Notices</span>
              </Link>
            </Button>
          )}
          {auth?.user?.role === "admin" && (
            <Button
              asChild
              variant="ghost"
              className="text-slate-600 hover:text-blue-700"
            >
              <Link to="/admin">Admin</Link>
            </Button>
          )}
          {auth?.user?.role === "student" && (
            <Link
              to="/profile"
              aria-label="Open profile settings"
              title="Profile settings"
              className="flex h-10 items-center gap-2 rounded-lg px-2 text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-blue-50 text-blue-700">
                {profileImage ? (
                  <img
                    src={`${(import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "")}${profileImage}`}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound aria-hidden="true" className="h-5 w-5" />
                )}
              </span>
            </Link>
          )}
          {!auth?.authenticate ? (
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
            >
              Sign in
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          )}
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-lg lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu aria-hidden="true" className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent className="flex w-[min(22rem,85vw)] flex-col overflow-y-auto p-5">
            <SheetHeader className="mb-5 text-left">
              <SheetTitle>
                <Link to="/home" className="text-slate-900">
                  IELTS &amp; PTE Prep
                </Link>
              </SheetTitle>
              <SheetDescription className="sr-only">
                Navigate to courses, college information, and account pages.
              </SheetDescription>
            </SheetHeader>
            <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
              {[
                ["Home", "/home"],
                ["IELTS", "/ielts"],
                ["PTE", "/pte"],
                ["All courses", "/courses"],
                ["About us", "/about"],
                ["Contact us", "/contact"],
                ...(auth?.user?.role === "student" && !isPendingApproval
                  ? [["My courses", "/student-courses"]]
                  : []),
                ...(auth?.user?.role === "student"
                  ? [["Notices", "/notices"]]
                  : []),
                ...(auth?.user?.role === "admin"
                  ? [["Admin", "/admin"]]
                  : []),
              ].map(([label, to]) => (
                <SheetClose asChild key={to}>
                  <Link
                    to={to}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-800"
                  >
                    {label}
                  </Link>
                </SheetClose>
              ))}
              {["Duolingo", "CELPIP"].map((program) => (
                <SheetClose asChild key={program}>
                  <button
                    type="button"
                    onClick={() =>
                      navigateToProgramCourses(
                        program === "Duolingo"
                          ? "duolingo-preparation"
                          : "celpip-preparation"
                      )
                    }
                    className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-800"
                  >
                    {program}
                  </button>
                </SheetClose>
              ))}
              {auth?.user?.role === "student" && (
                <SheetClose asChild>
                  <Link
                    to="/profile"
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-800"
                  >
                    Profile
                  </Link>
                </SheetClose>
              )}
            </nav>
            <div className="mt-auto border-t border-slate-100 pt-4">
              <SheetClose asChild>
                {auth?.authenticate ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut aria-hidden="true" className="h-4 w-4" />
                    Sign out
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/login")}
                  >
                    Sign in
                  </Button>
                )}
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}

export default StudentViewCommonHeader;
