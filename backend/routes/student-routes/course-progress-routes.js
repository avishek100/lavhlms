const express = require("express");
const {
  getCurrentCourseProgress,
  markCurrentLectureAsViewed,
  resetCurrentCourseProgress,
} = require("../../controllers/student-controller/course-progress-controller");
const authenticateMiddleware = require("../../middleware/auth-middleware");
const requireApprovedStudent = require("../../middleware/approved-student-middleware");

const router = express.Router();

router.use(authenticateMiddleware, requireApprovedStudent);
router.get("/get/:userId/:courseId", getCurrentCourseProgress);
router.post("/mark-lecture-viewed", markCurrentLectureAsViewed);
router.post("/reset-progress", resetCurrentCourseProgress);
module.exports = router;
