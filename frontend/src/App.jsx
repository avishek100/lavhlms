import { useLayoutEffect, useContext } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";
import ForgotPasswordPage from "./pages/auth/forgot-password";
import ChangePasswordPage from "./pages/auth/change-password";
import RouteGuard from "./components/route-guard";
import { AuthContext } from "./context/auth-context";
import StudentViewCommonLayout from "./components/student-view/common-layout";
import StudentHomePage from "./pages/student/home";
import ExamPreparationPage from "./pages/student/exam-preparation";
import NotFoundPage from "./pages/not-found";
import AdminCourseEditor from "./pages/admin/AdminCourseEditor";
import StudentViewCoursesPage from "./pages/student/courses";
import StudentViewCourseDetailsPage from "./pages/student/course-details";
import StudentCoursesPage from "./pages/student/student-courses";
import StudentViewCourseProgressPage from "./pages/student/course-progress";
import StudentProfilePage from "./pages/student/profile";
import StudentNoticesPage from "./pages/student/notices";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminAddStudent from "./pages/admin/AdminAddStudent";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminNotices from "./components/instructor-view/notices";
import { Toaster } from 'react-hot-toast';

function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const { auth } = useContext(AuthContext);

  return (
      <>
          <ScrollToTop />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "12px",
                background: "#0f172a",
                color: "#fff",
                fontSize: "14px",
              },
              success: {
                iconTheme: {
                  primary: "#34d399",
                  secondary: "#0f172a",
                },
              },
              error: {
                iconTheme: {
                  primary: "#fb7185",
                  secondary: "#0f172a",
                },
              },
            }}
          />
    <Routes>
      <Route path="/auth" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/change-password"
        element={
          <RouteGuard
            element={<ChangePasswordPage />}
            authenticated={auth?.authenticate}
            user={auth?.user}
          />
        }
      />
      <Route
        path="/admin"
        element={
          <RouteGuard
            element={<AdminLayout />}
            authenticated={auth?.authenticate}
            user={auth?.user}
            requiredRole="admin"
          />
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="students/new" element={<AdminAddStudent />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route
          path="notices"
          element={<AdminNotices />}
        />
        <Route path="courses/new" element={<AdminCourseEditor />} />
        <Route path="courses/:courseId/edit" element={<AdminCourseEditor />} />
      </Route>
      <Route
        path="/"
        element={<StudentViewCommonLayout />}
      >
        <Route path="" element={<StudentHomePage />} />
        <Route path="home" element={<StudentHomePage />} />
        <Route
          path="ielts"
          element={<ExamPreparationPage exam="ielts" />}
        />
        <Route
          path="pte"
          element={<ExamPreparationPage exam="pte" />}
        />
        <Route
          path="courses"
          element={<StudentViewCoursesPage />}
        />
        <Route
          path="course/details/:id"
          element={<StudentViewCourseDetailsPage />}
        />
        <Route
          path="student-courses"
          element={
            <RouteGuard
              element={<StudentCoursesPage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
              requiredRole="student"
              requiresApproved
            />
          }
        />
        <Route
          path="profile"
          element={
            <RouteGuard
              element={<StudentProfilePage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
              requiredRole="student"
            />
          }
        />
        <Route
          path="notices"
          element={
            <RouteGuard
              element={<StudentNoticesPage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
              requiredRole="student"
            />
          }
        />
        <Route
          path="course-progress/:id"
          element={
            <RouteGuard
              element={<StudentViewCourseProgressPage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
              requiredRole="student"
              requiresApproved
            />
          }
        />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
      </>
  );
}

export default App;
