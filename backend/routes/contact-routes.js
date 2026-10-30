const express = require("express");
const authenticateMiddleware = require("../middleware/auth-middleware");
const authorizeStaff = require("../middleware/staff-middleware");
const {
  createContactInquiry,
  getContactInquiries,
  markContactInquiryRead,
} = require("../controllers/contact-inquiry-controller");

const publicRouter = express.Router();
publicRouter.post("/", createContactInquiry);

const adminRouter = express.Router();
adminRouter.use(authenticateMiddleware, authorizeStaff);
adminRouter.get("/", getContactInquiries);
adminRouter.put("/:id/read", markContactInquiryRead);

module.exports = { publicRouter, adminRouter };
