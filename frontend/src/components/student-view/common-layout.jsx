import { Outlet, useLocation } from "react-router-dom";
import StudentViewCommonHeader from "./header";
import Footer from "../Footer";

function StudentViewCommonLayout() {
  const location = useLocation();
  const isCourseProgressPage = location.pathname.includes("course-progress");

  return (
    <div>
      {!isCourseProgressPage && <StudentViewCommonHeader />}

      <Outlet />

      {!isCourseProgressPage && <Footer />}
    </div>
  );
}

export default StudentViewCommonLayout;
