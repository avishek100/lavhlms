// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   userName: String,
//   userEmail: String,
//   password: String,
//   role: String,
// });

// module.exports = mongoose.model("User", UserSchema);


const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true,
  },
  userEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  userPhone: {
    type: String,
    trim: true,
  },
  studentNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  staffNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  parentName: {
    type: String,
    trim: true,
  },
  parentPhone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  studentClass: {
    type: String,
    trim: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  approved: {
    type: Boolean,
    default: true,
  },
  passwordResetOtpHash: {
    type: String,
    select: false,
  },
  passwordResetOtpExpiresAt: {
    type: Date,
    select: false,
  },
  passwordResetOtpAttempts: {
    type: Number,
    default: 0,
    select: false,
  },
  passwordResetOtpSentAt: {
    type: Date,
    select: false,
  },
  passwordResetTokenHash: {
    type: String,
    select: false,
  },
  passwordResetTokenExpiresAt: {
    type: Date,
    select: false,
  },
  mustChangePassword: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["student", "admin", "instructor"],
    default: "student",
  },
  collegeIssued: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
    trim: true,

  },
  image: {
    type: String,
    default: null,
    trim: true,
  }
});


module.exports = mongoose.model("User", UserSchema);
// const UserSchema = new mongoose.Schema({
//   userName: String,
//   userEmail: String,
//   password: String,
//   role: String,
//   image: { type: String, default: "" }, // New field for profile image
// });
