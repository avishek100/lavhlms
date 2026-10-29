const express = require("express");
const {
  createStudentAccount,
  createTeacherAccount,
  getTeachers,
  updateTeacherStatus,
  deleteTeacherAccount,
  getStudents,
  updateStudentStatus,
  deleteStudentAccount,
  getActiveStudentCount,
  changePassword,
  loginUser,
  getProfile,
  updateProfileImage,
  deleteProfileImage,
} = require("../../controllers/auth-controller/index");
const authenticateMiddleware = require("../../middleware/auth-middleware");
const multer = require("multer");
const router = express.Router();
const profileImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (/^image\/(jpeg|png|gif|webp)$/.test(file.mimetype)) {
      return callback(null, true);
    }

    callback(new Error("Use a JPG, PNG, GIF, or WebP profile picture."));
  },
});
const handleProfileImageUpload = (req, res, next) => {
  profileImageUpload.single("image")(req, res, (error) => {
    if (!error) return next();
    return res.status(400).json({
      success: false,
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Profile picture must be 2 MB or smaller."
          : error.message,
    });
  });
};

function requireAdministrator(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Administrator access is required.",
    });
  }

  next();
}

router.post("/register", (req, res) => {
  res.status(403).json({
    success: false,
    message: "Student accounts are issued by ADS College staff.",
  });
});
router.get(
  "/students",
  authenticateMiddleware,
  requireAdministrator,
  getStudents
);
router.get(
  "/teachers",
  authenticateMiddleware,
  requireAdministrator,
  getTeachers
);
router.post(
  "/teachers",
  authenticateMiddleware,
  requireAdministrator,
  createTeacherAccount
);
router.put(
  "/teachers/:teacherId/status",
  authenticateMiddleware,
  requireAdministrator,
  updateTeacherStatus
);
router.delete(
  "/teachers/:accountId",
  authenticateMiddleware,
  requireAdministrator,
  deleteTeacherAccount
);
router.put(
  "/students/:studentId/status",
  authenticateMiddleware,
  requireAdministrator,
  updateStudentStatus
);
router.delete(
  "/students/:accountId",
  authenticateMiddleware,
  requireAdministrator,
  deleteStudentAccount
);
router.get(
  "/students/active-count",
  authenticateMiddleware,
  requireAdministrator,
  getActiveStudentCount
);
router.post(
  "/students",
  authenticateMiddleware,
  requireAdministrator,
  createStudentAccount
);
router.get("/profile", authenticateMiddleware, getProfile);
router.post(
  "/profile/image",
  authenticateMiddleware,
  handleProfileImageUpload,
  updateProfileImage
);
router.delete("/profile/image", authenticateMiddleware, deleteProfileImage);
router.post("/login", loginUser);
router.post("/change-password", authenticateMiddleware, changePassword);
router.get("/check-auth", authenticateMiddleware, (req, res) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    data: {
      user,
    },
  });
});

module.exports = router;



// const express = require("express");
// const { registerUser, loginUser } = require("../../controllers/auth-controller/index");
// const authenticateMiddleware = require("../../middleware/auth-middleware");
// const upload = require("../../middleware/uploadMiddleware");

// const router = express.Router();

// // Register with profile image upload
// router.post("/register", upload.single("profileImage"), registerUser);

// // Login route
// router.post("/login", loginUser);
// router.post("/uploadImage", upload, uploadImage);
// // Check authentication
// router.get("/check-auth", authenticateMiddleware, (req, res) => {
//   const user = req.user;
//   res.status(200).json({
//     success: true,
//     message: "Authenticated user!",
//     data: { user },
//   });
// });

// module.exports = router;
