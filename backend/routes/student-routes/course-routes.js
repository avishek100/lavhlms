const express = require("express");
const {
  getStudentViewCourseDetails,
  getAllStudentViewCourses,
} = require("../../controllers/student-controller/course-controller");
const authenticateMiddleware = require("../../middleware/auth-middleware");
const router = express.Router();

router.use(authenticateMiddleware);
router.get("/get", getAllStudentViewCourses);
router.get("/get/details/:id", getStudentViewCourseDetails);

module.exports = router;
