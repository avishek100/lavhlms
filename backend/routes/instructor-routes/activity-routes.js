const express = require("express");
const authenticateMiddleware = require("../../middleware/auth-middleware");
const authorizeStaff = require("../../middleware/staff-middleware");
const {
  getAttendanceClasses,
  getAttendanceRoster,
  saveAttendance,
  getNoticeClasses,
  getTeacherNotices,
  createTeacherNotice,
} = require("../../controllers/instructor-controller/activity-controller");

const router = express.Router();
router.use(authenticateMiddleware, authorizeStaff);

router.get("/attendance/classes", getAttendanceClasses);
router.get("/attendance", getAttendanceRoster);
router.put("/attendance", saveAttendance);
router.get("/notices/classes", getNoticeClasses);
router.get("/notices", getTeacherNotices);
router.post("/notices", createTeacherNotice);

module.exports = router;
