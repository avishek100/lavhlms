const mongoose = require("mongoose");

const ContactInquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, trim: true, lowercase: true, maxlength: 254 },
    contactNumber: { type: String, required: true, trim: true, maxlength: 20 },
    subject: { type: String, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    preferences: {
      category: [
        {
          type: String,
          enum: [
            "ielts-preparation",
            "pte-preparation",
            "duolingo-preparation",
            "celpip-preparation",
          ],
        },
      ],
      formats: [{ type: String, enum: ["full-course", "crash-course"] }],
      purposes: [
        {
          type: String,
          enum: [
            "medical-professional",
            "permanent-residency",
            "college-university-admission",
          ],
        },
      ],
      timeSlots: [{ type: String, enum: ["morning", "afternoon", "evening"] }],
    },
    status: { type: String, enum: ["new", "read"], default: "new" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactInquiry", ContactInquirySchema);
