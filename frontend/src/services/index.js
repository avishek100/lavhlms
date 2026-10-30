import axiosInstance, { publicAxiosInstance } from "@/api/axiosInstance";

export async function createStudentAccountService(formData) {
  const { data } = await axiosInstance.post("/auth/students", formData);
  return data;
}

export async function registerStudentAccountService(formData) {
  const { data } = await axiosInstance.post("/auth/register", formData);
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

export async function updateStudentApprovalService(studentId, approved) {
  const { data } = await axiosInstance.put(
    `/auth/students/${studentId}/approval`,
    { approved }
  );
  return data;
}

export async function deleteStudentAccountService(studentId, adminPassword) {
  const { data } = await axiosInstance.delete(`/auth/students/${studentId}`, {
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

export async function requestPasswordResetOtpService(email) {
  const { data } = await axiosInstance.post("/auth/forgot-password", { email });
  return data;
}

export async function verifyPasswordResetOtpService(formData) {
  const { data } = await axiosInstance.post("/auth/verify-reset-otp", formData);
  return data;
}

export async function resetPasswordWithTokenService(formData) {
  const { data } = await axiosInstance.post("/auth/reset-password", formData);
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
  const { data } = await axiosInstance.get(`/admin/courses/get`);

  return data;
}

export async function fetchAdminNoticesService() {
  const { data } = await axiosInstance.get("/admin/notices");
  return data;
}

export async function createAdminNoticeService(payload) {
  const { data } = await axiosInstance.post("/admin/notices", payload);
  return data;
}

export async function fetchStudentNoticesService() {
  const { data } = await axiosInstance.get("/student/notices");
  return data;
}

export async function addNewCourseService(formData) {
  const { data } = await axiosInstance.post(`/admin/courses/add`, formData);

  return data;
}

export async function fetchInstructorCourseDetailsService(id) {
  const { data } = await axiosInstance.get(
    `/admin/courses/get/details/${id}`
  );

  return data;
}

export async function updateCourseByIdService(id, formData) {
  const { data } = await axiosInstance.put(
    `/admin/courses/update/${id}`,
    formData
  );

  return data;
}

export async function deleteCourseService(id, adminPassword) {
  const { data } = await axiosInstance.delete(`/admin/courses/delete/${id}`, {
    data: { adminPassword },
  });

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
  const queryString = query?.toString();
  const { data } = await publicAxiosInstance.get(
    `/student/course/get${queryString ? `?${queryString}` : ""}`
  );

  return data;
}

export async function fetchStudentViewCourseDetailsService(courseId) {
  const { data } = await publicAxiosInstance.get(
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
