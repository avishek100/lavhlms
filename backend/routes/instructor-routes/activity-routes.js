const express = require("express");
const authenticateMiddleware = require("../../middleware/auth-middleware");
const authorizeStaff = require("../../middleware/staff-middleware");
const {
  getAdminNotices,
  createAdminNotice,
} = require("../../controllers/instructor-controller/activity-controller");

const router = express.Router();
router.use(authenticateMiddleware, authorizeStaff);

router.get("/notices", getAdminNotices);
router.post("/notices", createAdminNotice);

module.exports = router;
