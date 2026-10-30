const mongoose = require("mongoose");

const LectureSchema = new mongoose.Schema({
  title: String,
  videoUrl: String,
  readingMaterialUrl: String,
  lessonContent: { type: String, maxlength: 20000 },
  public_id: String,
  freePreview: Boolean,
});

const CourseSchema = new mongoose.Schema({
  instructorId: String,
  instructorName: String,
  studentClass: { type: String, trim: true },
  date: Date,
  title: String,
  category: { type: String, trim: true, maxlength: 60 },
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
  level: String,
  primaryLanguage: String,
  subtitle: String,
  description: String,
  image: String,
  welcomeMessage: String,
  pricing: Number,
  objectives: String,
  students: [
    {
      studentId: String,
      studentName: String,
      studentEmail: String,
      paidAmount: String,
    },
  ],
  curriculum: [LectureSchema],
  isPublised: Boolean,
});

module.exports = mongoose.model("Course", CourseSchema);
