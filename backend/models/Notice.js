const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: { type: String, enum: ["admin", "instructor"] },
    senderName: { type: String, trim: true },
    audience: { type: String, enum: ["college", "batch"] },
    studentClasses: [{ type: String, trim: true }],
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    courseTitle: { type: String, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", NoticeSchema);
