const express = require("express");
const {
  getCoursesByStudentId,
} = require("../../controllers/student-controller/student-courses-controller");
const authenticateMiddleware = require("../../middleware/auth-middleware");

const router = express.Router();

router.use(authenticateMiddleware);
router.get("/get/:studentId", getCoursesByStudentId);

module.exports = router;
