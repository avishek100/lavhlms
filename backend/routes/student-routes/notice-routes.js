const express = require("express");
const authenticateMiddleware = require("../../middleware/auth-middleware");
const {
  getStudentNotices,
} = require("../../controllers/instructor-controller/activity-controller");

const router = express.Router();
router.use(authenticateMiddleware);
router.get("/", getStudentNotices);

module.exports = router;
