const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    className: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    records: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        present: { type: Boolean, required: true },
      },
    ],
  },
  { timestamps: true }
);

AttendanceSchema.index(
  { teacherId: 1, className: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model("Attendance", AttendanceSchema);
