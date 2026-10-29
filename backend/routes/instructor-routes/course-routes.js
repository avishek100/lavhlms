const express = require("express");
const {
  addNewCourse,
  getAllCourses,
  getCourseDetailsByID,
  updateCourseByID,
} = require("../../controllers/instructor-controller/course-controller");
const authenticateMiddleware = require("../../middleware/auth-middleware");
const authorizeStaff = require("../../middleware/staff-middleware");
const router = express.Router();

router.use(authenticateMiddleware, authorizeStaff);
router.post("/add", addNewCourse);
router.get("/get", getAllCourses);
router.get("/get/details/:id", getCourseDetailsByID);
router.put("/update/:id", updateCourseByID);

module.exports = router;
