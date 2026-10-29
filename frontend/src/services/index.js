import axiosInstance from "@/api/axiosInstance";

export async function createStudentAccountService(formData) {
  const { data } = await axiosInstance.post("/auth/students", formData);
  return data;
}

export async function fetchStudentsService() {
  const { data } = await axiosInstance.get("/auth/students");
  return data;
}

export async function updateStudentStatusService(studentId, active) {
  const { data } = await axiosInstance.put(
    `/auth/students/${studentId}/status`,
    { active }
  );
  return data;
}

export async function deleteStudentAccountService(studentId, adminPassword) {
  const { data } = await axiosInstance.delete(`/auth/students/${studentId}`, {
    data: { adminPassword },
  });
  return data;
}

export async function createTeacherAccountService(formData) {
  const { data } = await axiosInstance.post("/auth/teachers", formData);
  return data;
}

export async function fetchTeachersService() {
  const { data } = await axiosInstance.get("/auth/teachers");
  return data;
}

export async function updateTeacherStatusService(teacherId, active) {
  const { data } = await axiosInstance.put(
    `/auth/teachers/${teacherId}/status`,
    { active }
  );
  return data;
}

export async function deleteTeacherAccountService(teacherId, adminPassword) {
  const { data } = await axiosInstance.delete(`/auth/teachers/${teacherId}`, {
    data: { adminPassword },
  });
  return data;
}

export async function fetchProfileService() {
  const { data } = await axiosInstance.get("/auth/profile");
  return data;
}

export async function updateProfileImageService(file) {
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await axiosInstance.post("/auth/profile/image", formData);
  return data;
}

export async function deleteProfileImageService() {
  const { data } = await axiosInstance.delete("/auth/profile/image");
  return data;
}

export async function fetchActiveStudentCountService() {
  const { data } = await axiosInstance.get("/auth/students/active-count");
  return data;
}

export async function changePasswordService(formData) {
  const { data } = await axiosInstance.post("/auth/change-password", formData);
  return data;
}

export async function loginService(formData) {
  const { data } = await axiosInstance.post("/auth/login", {
    ...formData,
    userEmail: formData.loginId,
  });

  return data;
}

export async function checkAuthService() {
  const { data } = await axiosInstance.get("/auth/check-auth");

  return data;
}

export async function mediaUploadService(formData, onProgressCallback) {
  const { data } = await axiosInstance.post("/media/upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = progressEvent.total
        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
        : 50;
      if (typeof onProgressCallback === "function") {
        onProgressCallback(percentCompleted);
      }
    },
  });

  return data;
}

export async function mediaDeleteService(id) {
  const { data } = await axiosInstance.delete(`/media/delete/${id}`);

  return data;
}

export async function fetchInstructorCourseListService() {
  const { data } = await axiosInstance.get(`/instructor/course/get`);

  return data;
}

export async function fetchAttendanceClassesService() {
  const { data } = await axiosInstance.get("/instructor/attendance/classes");
  return data;
}

export async function fetchAttendanceRosterService(className, date) {
  const { data } = await axiosInstance.get("/instructor/attendance", {
    params: { className, date },
  });
  return data;
}

export async function saveAttendanceService(payload) {
  const { data } = await axiosInstance.put("/instructor/attendance", payload);
  return data;
}

export async function fetchTeacherNoticesService() {
  const { data } = await axiosInstance.get("/instructor/notices");
  return data;
}

export async function fetchNoticeClassesService() {
  const { data } = await axiosInstance.get("/instructor/notices/classes");
  return data;
}

export async function createTeacherNoticeService(payload) {
  const { data } = await axiosInstance.post("/instructor/notices", payload);
  return data;
}

export async function fetchStudentNoticesService() {
  const { data } = await axiosInstance.get("/student/notices");
  return data;
}

export async function addNewCourseService(formData) {
  const { data } = await axiosInstance.post(`/instructor/course/add`, formData);

  return data;
}

export async function fetchInstructorCourseDetailsService(id) {
  const { data } = await axiosInstance.get(
    `/instructor/course/get/details/${id}`
  );

  return data;
}

export async function updateCourseByIdService(id, formData) {
  const { data } = await axiosInstance.put(
    `/instructor/course/update/${id}`,
    formData
  );

  return data;
}

export async function mediaBulkUploadService(formData, onProgressCallback) {
  const { data } = await axiosInstance.post("/media/bulk-upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = progressEvent.total
        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
        : 50;
      if (typeof onProgressCallback === "function") {
        onProgressCallback(percentCompleted);
      }
    },
  });

  return data;
}

export async function fetchStudentViewCourseListService(query) {
  const { data } = await axiosInstance.get(`/student/course/get?${query}`);

  return data;
}

export async function fetchStudentViewCourseDetailsService(courseId) {
  const { data } = await axiosInstance.get(
    `/student/course/get/details/${courseId}`
  );

  return data;
}

export async function fetchStudentBoughtCoursesService(studentId) {
  const { data } = await axiosInstance.get(
    `/student/courses-bought/get/${studentId}`
  );

  return data;
}

export async function getCurrentCourseProgressService(userId, courseId) {
  const { data } = await axiosInstance.get(
    `/student/course-progress/get/${userId}/${courseId}`
  );

  return data;
}

export async function markLectureAsViewedService(userId, courseId, lectureId) {
  const { data } = await axiosInstance.post(
    `/student/course-progress/mark-lecture-viewed`,
    {
      userId,
      courseId,
      lectureId,
    }
  );

  return data;
}

export async function resetCourseProgressService(userId, courseId) {
  const { data } = await axiosInstance.post(
    `/student/course-progress/reset-progress`,
    {
      userId,
      courseId,
    }
  );

  return data;
}
