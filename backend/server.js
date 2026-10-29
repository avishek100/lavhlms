const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const authRoutes = require("./routes/auth-routes/index");
const mediaRoutes = require("./routes/instructor-routes/media-routes");
const instructorCourseRoutes = require("./routes/instructor-routes/course-routes");
const studentViewCourseRoutes = require("./routes/student-routes/course-routes");
const studentCoursesRoutes = require("./routes/student-routes/student-courses-routes");
const studentCourseProgressRoutes = require("./routes/student-routes/course-progress-routes");
const instructorActivityRoutes = require("./routes/instructor-routes/activity-routes");
const studentNoticeRoutes = require("./routes/student-routes/notice-routes");
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const allowedOrigins = [
  ...(process.env.CLIENT_URL || "").split(",").map((origin) => origin.trim()),
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.includes(origin));
    },
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

async function createConfiguredAdministrator() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) {
    console.warn("Administrator bootstrap skipped: set ADMIN_EMAIL in server/.env.");
    return;
  }

  const emailPattern = new RegExp(
    `^${adminEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
    "i"
  );
  const existingAdmin = await User.findOne({ userEmail: emailPattern });
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!existingAdmin && !adminPassword) {
    console.warn(
      "No administrator account exists. Set ADMIN_PASSWORD in server/.env to bootstrap one."
    );
    return;
  }
  if (adminPassword && adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  if (existingAdmin?.collegeIssued) {
    let needsUpdate = false;
    if (!existingAdmin.active) {
      existingAdmin.active = true;
      needsUpdate = true;
    }
    if (existingAdmin.mustChangePassword) {
      existingAdmin.mustChangePassword = false;
      needsUpdate = true;
    }
    if (existingAdmin.role !== "instructor") {
      existingAdmin.role = "instructor";
      needsUpdate = true;
    }
    if (needsUpdate) await existingAdmin.save();
    return;
  }
  if (existingAdmin && !adminPassword) {
    console.warn(
      "The configured administrator email belongs to an old account. Set ADMIN_PASSWORD in server/.env to activate it."
    );
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  if (existingAdmin) {
    existingAdmin.userName ||= "ADS College Administrator";
    existingAdmin.password = passwordHash;
    existingAdmin.role = "instructor";
    existingAdmin.collegeIssued = true;
    existingAdmin.active = true;
    existingAdmin.mustChangePassword = false;
    await existingAdmin.save();
    console.log("Upgraded configured account to ADS College administrator.");
    return;
  }

  await User.create({
    userName: "ADS College Administrator",
    userEmail: adminEmail,
    password: passwordHash,
    role: "instructor",
    collegeIssued: true,
  });
  console.log("Configured ADS College administrator account.");
}

//database connection
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("mongodb is connected");
    await createConfiguredAdministrator();
  })
  .catch((error) => console.error("MongoDB connection or admin bootstrap failed:", error));

//routes configuration
app.use("/auth", authRoutes);
app.use("/media", mediaRoutes);
app.use("/instructor/course", instructorCourseRoutes);
app.use("/instructor", instructorActivityRoutes);
app.use("/student/notices", studentNoticeRoutes);
app.use("/student/course", studentViewCourseRoutes);
app.use("/student/courses-bought", studentCoursesRoutes);
app.use("/student/course-progress", studentCourseProgressRoutes);

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
});

app.listen(PORT, () => {
  console.log(`Server is now running on port ${PORT}`);
});
