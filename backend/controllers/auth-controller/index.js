const User = require("../../models/User");
const Attendance = require("../../models/Attendance");
const Course = require("../../models/Course");
const CourseProgress = require("../../models/CourseProgress");
const StudentCourses = require("../../models/StudentCourses");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs/promises");
const path = require("path");
const {
  createHash,
  randomBytes,
  randomInt,
  randomUUID,
  timingSafeEqual,
} = require("crypto");
const verifyAdministratorPassword = require("../../utils/verify-administrator-password");
const { sendPasswordResetOtp } = require("../../utils/email-service");
const INITIAL_STUDENT_PASSWORD = "changepassword";
const profileImageDirectory = path.resolve(__dirname, "../../uploads/profile-pictures");

function generateStudentNumber() {
  return `ADS${randomInt(100000, 1000000)}`;
}

function getOwnedProfileImagePath(userId, imageUrl) {
  if (typeof imageUrl !== "string" || !imageUrl.startsWith("/uploads/profile-pictures/")) {
    return null;
  }

  const fileName = path.basename(imageUrl);
  if (!fileName.startsWith(`${userId}-`)) {
    return null;
  }

  return path.join(profileImageDirectory, fileName);
}

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select(
        "_id userName userEmail userPhone studentNumber staffNumber parentName parentPhone address role image mustChangePassword approved"
      )
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Unable to load profile:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load your profile.",
    });
  }
};

const updateProfileImage = async (req, res) => {
  let newImagePath;
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Choose an image to upload.",
      });
    }

    const extensionByMimeType = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
    };
    const extension = extensionByMimeType[req.file.mimetype];
    if (!extension) {
      return res.status(400).json({
        success: false,
        message: "Use a JPG, PNG, GIF, or WebP profile picture.",
      });
    }

    const existingUser = await User.findById(req.user._id).select("image");
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    await fs.mkdir(profileImageDirectory, { recursive: true });
    const fileName = `${req.user._id}-${randomUUID()}${extension}`;
    newImagePath = path.join(profileImageDirectory, fileName);
    await fs.writeFile(newImagePath, req.file.buffer, { flag: "wx" });

    const imageUrl = `/uploads/profile-pictures/${fileName}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { image: imageUrl } },
      { new: true }
    ).select("_id userName image");

    if (!user) {
      await fs.unlink(newImagePath);
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    const oldImagePath = getOwnedProfileImagePath(
      req.user._id,
      existingUser.image
    );
    if (oldImagePath && oldImagePath !== newImagePath) {
      await fs.unlink(oldImagePath).catch((error) => {
        if (error.code !== "ENOENT") {
          console.error("Unable to remove replaced profile image:", error);
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile picture updated.",
      data: user,
    });
  } catch (error) {
    if (newImagePath) {
      await fs.unlink(newImagePath).catch((cleanupError) => {
        if (cleanupError.code !== "ENOENT") {
          console.error("Unable to clean up failed profile image:", cleanupError);
        }
      });
    }
    console.error("Unable to update profile picture:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update your profile picture.",
    });
  }
};

const deleteProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("_id image");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    const imagePath = getOwnedProfileImagePath(user._id, user.image);
    user.image = null;
    await user.save();

    if (imagePath) {
      await fs.unlink(imagePath).catch((error) => {
        if (error.code !== "ENOENT") throw error;
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile picture removed.",
      data: { _id: user._id, image: null },
    });
  } catch (error) {
    console.error("Unable to remove profile picture:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to remove your profile picture.",
    });
  }
};

function createEmailPattern(userEmail) {
  const escapedEmail = userEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escapedEmail}$`, "i");
}

const createStudentAccount = async (req, res) => {
  try {
    const userName =
      typeof req.body.studentName === "string"
        ? req.body.studentName.trim()
        : "";
    const parentName =
      typeof req.body.parentName === "string" ? req.body.parentName.trim() : "";
    const parentPhone =
      typeof req.body.parentPhone === "string"
        ? req.body.parentPhone.trim()
        : "";
    const userPhone =
      typeof req.body.userPhone === "string" ? req.body.userPhone.trim() : "";
    const address =
      typeof req.body.address === "string" ? req.body.address.trim() : "";
    const userEmail =
      typeof req.body.userEmail === "string"
        ? req.body.userEmail.trim().toLowerCase()
        : "";
    if (
      !userName ||
      !parentName ||
      !parentPhone ||
      !address ||
      !userPhone ||
      !userEmail
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Enter the student name, parent or guardian name, student and parent phone numbers, email, and address.",
      });
    }

    const parentPhoneDigitCount = parentPhone.replace(/\D/g, "").length;
    const userPhoneDigitCount = userPhone.replace(/\D/g, "").length;
    if (
      !/^[+()\d\s.-]{7,20}$/.test(parentPhone) ||
      parentPhoneDigitCount < 7 ||
      parentPhoneDigitCount > 15 ||
      !/^[+()\d\s.-]{7,20}$/.test(userPhone) ||
      userPhoneDigitCount < 7 ||
      userPhoneDigitCount > 15 ||
      (userEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail))
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter valid student and parent phone numbers and email address.",
      });
    }

    if (
      userEmail &&
      (await User.exists({ userEmail: createEmailPattern(userEmail) }))
    ) {
      return res.status(409).json({
        success: false,
        message: "This email address is already assigned to an account.",
      });
    }

    let newUser;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const accountNumber = generateStudentNumber();
      newUser = new User({
        userName,
        userEmail: userEmail || undefined,
        userPhone: userPhone || undefined,
        parentName,
        parentPhone,
        address,
        studentNumber: accountNumber,
        role: "student",
        collegeIssued: true,
        active: true,
        approved: true,
        mustChangePassword: true,
        password: await bcrypt.hash(INITIAL_STUDENT_PASSWORD, 10),
      });

      try {
        await newUser.save();
        break;
      } catch (error) {
        if (error.code !== 11000 || attempt === 4) throw error;
        newUser = null;
      }
    }

    return res.status(201).json({
      success: true,
      message: "Student account created successfully.",
      data: {
        _id: newUser._id,
        userName: newUser.userName,
        userEmail: newUser.userEmail,
        userPhone: newUser.userPhone,
        parentName: newUser.parentName,
        parentPhone: newUser.parentPhone,
        address: newUser.address,
        studentNumber: newUser.studentNumber,
        role: newUser.role,
        initialPassword: INITIAL_STUDENT_PASSWORD,
      },
    });
  } catch (error) {
    console.error("Unable to create student account:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create the student account.",
    });
  }
};

const registerStudentAccount = async (req, res) => {
  try {
    const userName =
      typeof req.body.studentName === "string" ? req.body.studentName.trim() : "";
    const userEmail =
      typeof req.body.userEmail === "string"
        ? req.body.userEmail.trim().toLowerCase()
        : "";
    const userPhone =
      typeof req.body.userPhone === "string" ? req.body.userPhone.trim() : "";
    const password = req.body.password;

    if (!userName || !userEmail || !userPhone || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Enter your name, email, phone number, and password.",
      });
    }

    const phoneDigitCount = userPhone.replace(/\D/g, "").length;
    if (
      userName.length > 100 ||
      userEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail) ||
      !/^[+()\d\s.-]{7,20}$/.test(userPhone) ||
      phoneDigitCount < 7 ||
      phoneDigitCount > 15 ||
      password.length < 8 ||
      password.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Use a valid email and phone number, and a password between 8 and 128 characters.",
      });
    }

    if (await User.exists({ userEmail: createEmailPattern(userEmail) })) {
      return res.status(409).json({
        success: false,
        message: "This email address is already assigned to an account.",
      });
    }

    let newUser;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      newUser = new User({
        userName,
        userEmail,
        userPhone,
        studentNumber: generateStudentNumber(),
        role: "student",
        collegeIssued: true,
        active: true,
        approved: false,
        mustChangePassword: false,
        password: await bcrypt.hash(password, 10),
      });

      try {
        await newUser.save();
        break;
      } catch (error) {
        if (error.code !== 11000 || attempt === 4) throw error;
        newUser = null;
      }
    }

    return res.status(201).json({
      success: true,
      message: "Registration submitted. Your account is waiting for admin approval.",
      data: {
        userName: newUser.userName,
        userEmail: newUser.userEmail,
        studentNumber: newUser.studentNumber,
        approved: newUser.approved,
      },
    });
  } catch (error) {
    console.error("Unable to register student:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to submit your registration.",
    });
  }
};

const getStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      collegeIssued: true,
    })
      .select(
        "_id userName userEmail userPhone studentNumber parentName parentPhone address active approved"
      )
      .sort({ userName: 1 })
      .lean();

    return res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error("Unable to load students:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load students.",
    });
  }
};

const updateStudentStatus = async (req, res) => {
  try {
    if (typeof req.body.active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Choose whether the student account should be active.",
      });
    }

    const student = await User.findOneAndUpdate(
      {
        _id: req.params.studentId,
        role: "student",
        collegeIssued: true,
      },
      { $set: { active: req.body.active } },
      { new: true, runValidators: true }
    ).select("_id userName studentNumber active approved");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: req.body.active
        ? "Student account unblocked."
        : "Student account blocked.",
      data: student,
    });
  } catch (error) {
    console.error("Unable to update student status:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update student status.",
    });
  }
};

const updateStudentApproval = async (req, res) => {
  try {
    if (typeof req.body.approved !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Choose whether to approve this student account.",
      });
    }

    const student = await User.findOneAndUpdate(
      {
        _id: req.params.studentId,
        role: "student",
        collegeIssued: true,
      },
      { $set: { approved: req.body.approved } },
      { new: true, runValidators: true }
    ).select("_id userName studentNumber approved active");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: req.body.approved
        ? "Student account approved."
        : "Student approval removed.",
      data: student,
    });
  } catch (error) {
    console.error("Unable to update student approval:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update student approval.",
    });
  }
};

const deleteStudentAccount = async (req, res) => {
  try {
    const { adminPassword } = req.body;
    if (typeof adminPassword !== "string" || !adminPassword) {
      return res.status(400).json({
        success: false,
        message: "Enter your administrator password to confirm deletion.",
      });
    }

    if (!(await verifyAdministratorPassword(req.user._id, adminPassword))) {
      return res.status(401).json({
        success: false,
        message: "Administrator password is incorrect.",
      });
    }

    const accountQuery = {
      _id: req.params.accountId,
      role: "student",
      collegeIssued: true,
    };

    const account = await User.findOne(accountQuery).select("_id userName image");
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Student account not found.",
      });
    }

    const accountId = String(account._id);
    await Promise.all([
      Attendance.updateMany(
        { "records.studentId": account._id },
        { $pull: { records: { studentId: account._id } } }
      ),
      CourseProgress.deleteMany({ userId: accountId }),
      StudentCourses.deleteMany({ userId: accountId }),
      Course.updateMany(
        { "students.studentId": accountId },
        { $pull: { students: { studentId: accountId } } }
      ),
    ]);

    await User.deleteOne({ _id: account._id });

    const imagePath = getOwnedProfileImagePath(account._id, account.image);
    if (imagePath) {
      await fs.unlink(imagePath).catch((error) => {
        if (error.code !== "ENOENT") {
          console.error("Unable to remove deleted account profile image:", error);
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student account deleted.",
      data: { _id: accountId },
    });
  } catch (error) {
    console.error("Unable to delete college account:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete the account.",
    });
  }
};

const loginUser = async (req, res) => {
  const { loginId, userEmail, password } = req.body;
  const identifier =
    typeof loginId === "string"
      ? loginId.trim()
      : typeof userEmail === "string"
        ? userEmail.trim()
        : undefined;
  if (typeof identifier !== "string" || typeof password !== "string") {
    return res.status(400).json({
      success: false,
      message: "Enter your email address and password.",
    });
  }

  const isEmail = identifier.includes("@");
  const checkUser = await User.findOne(
    isEmail
      ? { userEmail: createEmailPattern(identifier) }
      : {
          $or: [
            { studentNumber: identifier.toUpperCase() },
          ],
        }
  );

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const isConfiguredAdmin =
    Boolean(adminEmail) &&
    checkUser?.userEmail?.trim().toLowerCase() === adminEmail;

  if (
    checkUser &&
    checkUser.role === "student" &&
    !checkUser.active
  ) {
    return res.status(403).json({
      success: false,
    message: "This account is blocked. Contact the administrator.",
    });
  }

  if (
    !checkUser ||
    (!checkUser.active && !isConfiguredAdmin) ||
    !(await bcrypt.compare(password, checkUser.password))
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  if (
    !checkUser.collegeIssued &&
    !isConfiguredAdmin
  ) {
    return res.status(403).json({
      success: false,
      message: "This account is not authorized to sign in.",
    });
  }

  if (!isConfiguredAdmin && checkUser.role !== "student") {
    return res.status(403).json({
      success: false,
      message: "Only student and administrator accounts can sign in.",
    });
  }

  const userRole =
    isConfiguredAdmin
      ? "admin"
      : "student";

  const accessToken = jwt.sign(
    {
      _id: checkUser._id,
      userName: checkUser.userName,
      userEmail: checkUser.userEmail,
      role: userRole,
      collegeIssued: true,
      studentNumber: checkUser.studentNumber,
      staffNumber: checkUser.staffNumber,
      mustChangePassword: checkUser.mustChangePassword,
      approved: checkUser.approved !== false,
    },
    process.env.JWT_SECRET,
    { expiresIn: "120m" }
  );

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: {
      accessToken,
      user: {
        _id: checkUser._id,
        userName: checkUser.userName,
        userEmail: checkUser.userEmail,
        studentNumber: checkUser.studentNumber,
        staffNumber: checkUser.staffNumber,
        role: userRole,
        mustChangePassword: checkUser.mustChangePassword,
        approved: checkUser.approved !== false,
      },
    },
  });
};

const requestPasswordResetOtp = async (req, res) => {
  const userEmail =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail) || userEmail.length > 254) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid email address.",
    });
  }

  try {
    const user = await User.findOne({
      userEmail: createEmailPattern(userEmail),
    }).select(
      "+passwordResetOtpHash +passwordResetOtpExpiresAt +passwordResetOtpAttempts +passwordResetOtpSentAt +passwordResetTokenHash +passwordResetTokenExpiresAt"
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "We couldn't find an account with that email. Check the spelling or create an account.",
      });
    }

    if (
      !["student", "admin"].includes(user.role) ||
      user.collegeIssued !== true ||
      user.active !== true
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This account can't use password recovery right now. Please contact an administrator.",
      });
    }

    const now = new Date();
    const resendWaitMs = 60 * 1000;
    if (
      user.passwordResetOtpSentAt &&
      now - user.passwordResetOtpSentAt < resendWaitMs
    ) {
      return res.status(429).json({
        success: false,
        message: "Wait one minute before requesting another reset code.",
      });
    }

    const otp = String(randomInt(100000, 1000000));
    user.passwordResetOtpHash = await bcrypt.hash(otp, 10);
    user.passwordResetOtpExpiresAt = new Date(now.getTime() + 10 * 60 * 1000);
    user.passwordResetOtpAttempts = 0;
    user.passwordResetOtpSentAt = now;
    user.passwordResetTokenHash = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    await user.save();

    try {
      await sendPasswordResetOtp({ recipient: user.userEmail, otp });
    } catch (error) {
      user.passwordResetOtpHash = undefined;
      user.passwordResetOtpExpiresAt = undefined;
      user.passwordResetOtpAttempts = 0;
      user.passwordResetOtpSentAt = undefined;
      user.passwordResetTokenHash = undefined;
      user.passwordResetTokenExpiresAt = undefined;
      await user.save();
      console.error("Unable to deliver password reset OTP:", error.message);
      return res.status(503).json({
        success: false,
        message: "Unable to send the reset code right now. Please try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "A password reset code has been sent to your email.",
    });
  } catch (error) {
    console.error("Unable to process password reset request:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to process the password reset request.",
    });
  }
};

const verifyPasswordResetOtp = async (req, res) => {
  const userEmail =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const otp =
    typeof req.body?.otp === "string" ? req.body.otp.trim() : "";

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail) ||
    userEmail.length > 254 ||
    !/^\d{6}$/.test(otp)
  ) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid email address and six-digit code.",
    });
  }

  try {
    const user = await User.findOne({
      userEmail: createEmailPattern(userEmail),
      role: { $in: ["student", "admin"] },
      collegeIssued: true,
      active: true,
    }).select(
      "+passwordResetOtpHash +passwordResetOtpExpiresAt +passwordResetOtpAttempts"
    );
    const otpIsAvailable =
      user?.passwordResetOtpHash &&
      user.passwordResetOtpExpiresAt > new Date() &&
      user.passwordResetOtpAttempts < 5;

    if (!otpIsAvailable) {
      return res.status(400).json({
        success: false,
        message: "The reset code is invalid or expired. Request a new code.",
      });
    }

    if (!(await bcrypt.compare(otp, user.passwordResetOtpHash))) {
      user.passwordResetOtpAttempts += 1;
      if (user.passwordResetOtpAttempts >= 5) {
        user.passwordResetOtpHash = undefined;
        user.passwordResetOtpExpiresAt = undefined;
      }
      await user.save();
      return res.status(400).json({
        success: false,
        message: "The reset code is invalid or expired. Request a new code.",
      });
    }

    const resetToken = randomBytes(32).toString("hex");
    user.passwordResetTokenHash = createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetOtpHash = undefined;
    user.passwordResetOtpExpiresAt = undefined;
    user.passwordResetOtpAttempts = 0;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Code verified. You can now choose a new password.",
      data: { resetToken },
    });
  } catch (error) {
    console.error("Unable to verify password reset code:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify the reset code.",
    });
  }
};

const resetPasswordWithToken = async (req, res) => {
  const userEmail =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const resetToken =
    typeof req.body?.resetToken === "string" ? req.body.resetToken : "";
  const newPassword = req.body?.newPassword;

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail) ||
    userEmail.length > 254 ||
    !/^[a-f0-9]{64}$/.test(resetToken) ||
    typeof newPassword !== "string" ||
    newPassword.length < 8 ||
    newPassword.length > 128
  ) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid email, verified reset session, and password (8–128 characters).",
    });
  }

  try {
    const tokenHash = createHash("sha256").update(resetToken).digest("hex");
    const user = await User.findOne({
      userEmail: createEmailPattern(userEmail),
      role: { $in: ["student", "admin"] },
      collegeIssued: true,
      active: true,
    }).select(
      "+password +passwordResetOtpHash +passwordResetOtpExpiresAt +passwordResetOtpAttempts +passwordResetOtpSentAt +passwordResetTokenHash +passwordResetTokenExpiresAt"
    );

    const storedTokenHash = user?.passwordResetTokenHash;
    const tokenIsValid =
      typeof storedTokenHash === "string" &&
      /^[a-f0-9]{64}$/.test(storedTokenHash) &&
      user.passwordResetTokenExpiresAt &&
      user.passwordResetTokenExpiresAt > new Date() &&
      timingSafeEqual(
        Buffer.from(storedTokenHash, "hex"),
        Buffer.from(tokenHash, "hex")
      );
    if (!tokenIsValid) {
      return res.status(400).json({
        success: false,
        message: "The password reset session is invalid or expired. Verify a new code.",
      });
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      return res.status(400).json({
        success: false,
        message: "Choose a new password different from your current password.",
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        role: { $in: ["student", "admin"] },
        active: true,
        passwordResetTokenHash: tokenHash,
        passwordResetTokenExpiresAt: { $gt: new Date() },
      },
      {
        $set: {
          password: await bcrypt.hash(newPassword, 10),
          mustChangePassword: false,
          passwordResetOtpAttempts: 0,
        },
        $unset: {
          passwordResetOtpHash: 1,
          passwordResetOtpExpiresAt: 1,
          passwordResetOtpSentAt: 1,
          passwordResetTokenHash: 1,
          passwordResetTokenExpiresAt: 1,
        },
      },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        message: "The password reset session is invalid or expired. Verify a new code.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("Unable to reset password:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to reset the password.",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      newPassword.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter your current password and a new password of at least 8 characters.",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: "This account is unavailable.",
      });
    }
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Your current password is incorrect.",
      });
    }
    if (await bcrypt.compare(newPassword, user.password)) {
      return res.status(400).json({
        success: false,
        message: "Choose a new password different from your current password.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await user.save();

    const accessToken = jwt.sign(
      {
        _id: user._id,
        userName: user.userName,
        userEmail: user.userEmail,
        studentNumber: user.studentNumber,
        staffNumber: user.staffNumber,
        role: req.user.role,
        collegeIssued: true,
        mustChangePassword: false,
        approved: user.approved !== false,
      },
      process.env.JWT_SECRET,
      { expiresIn: "120m" }
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
      data: {
        accessToken,
        user: {
          _id: user._id,
          userName: user.userName,
          userEmail: user.userEmail,
          studentNumber: user.studentNumber,
          staffNumber: user.staffNumber,
          role: req.user.role,
          mustChangePassword: false,
          approved: user.approved !== false,
        },
      },
    });
  } catch (error) {
    console.error("Unable to change password:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to change the password.",
    });
  }
};

const getActiveStudentCount = async (req, res) => {
  try {
    const count = await User.countDocuments({
      role: "student",
      active: true,
      collegeIssued: true,
      approved: { $ne: false },
    });
    return res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    console.error("Unable to count active students:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load the active student count.",
    });
  }
};

module.exports = {
  getProfile,
  updateProfileImage,
  deleteProfileImage,
  createStudentAccount,
  registerStudentAccount,
  getStudents,
  updateStudentStatus,
  updateStudentApproval,
  deleteStudentAccount,
  getActiveStudentCount,
  changePassword,
  loginUser,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPasswordWithToken,
};



// const User = require("../../models/User");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// // Register User with Profile Picture
// const registerUser = async (req, res) => {
//   try {
//     const { userName, userEmail, password, role } = req.body;
//     console.log('Received Data:', req.body);  // Log incoming request data

//     if (!userName || !userEmail || !password || !role) {
//       console.log('Validation Error: Missing required fields');
//       return res.status(400).json({
//         success: false,
//         message: 'All fields (userName, userEmail, password, role) are required.',
//       });
//     }

//     const existingUser = await User.findOne({ $or: [{ userEmail }, { userName }] });
//     if (existingUser) {
//       console.log('Duplicate User Found:', existingUser);
//       return res.status(400).json({
//         success: false,
//         message: 'User name or user email already exists',
//       });
//     }

//     const hashPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({
//       userName,
//       userEmail,
//       password: hashPassword,
//       role,
//       image: req.file ? req.file.path : '',
//     });

//     await newUser.save();

//     console.log('User registered:', newUser);
//     return res.status(201).json({
//       success: true,
//       message: 'User registered successfully!',
//       user: {
//         _id: newUser._id,
//         userName: newUser.userName,
//         userEmail: newUser.userEmail,
//         role: newUser.role,
//         imageUrl: newUser.image ? `${req.protocol}://${req.get("host")}/${newUser.image}` : null,
//       },
//     });
//   } catch (error) {
//     console.error('Error during registration:', error);
//     res.status(500).json({ success: false, message: 'Server Error' });
//   }
// };


// // Login User with Profile Image
// const loginUser = async (req, res) => {
//   try {
//     const { userEmail, password } = req.body;

//     const checkUser = await User.findOne({ userEmail });


//     // if (!checkUser || !(await bcrypt.compare(password, checkUser.password))) {
//     //   return res.status(401).json({
//     //     success: false,
//     //     message: "Invalid credentials",
//     //   });
//     // }

//     console.log('Login Request:', req.body);

//     if (!checkUser) {
//       console.log('User not found');
//     } else {
//       const passwordMatch = await bcrypt.compare(password, checkUser.password);
//       console.log('Password Match:', passwordMatch);
//     }

//     const accessToken = jwt.sign(
//       {
//         _id: checkUser._id,
//         userName: checkUser.userName,
//         userEmail: checkUser.userEmail,
//         role: checkUser.role,
//       },
//       "JWT_SECRET",
//       { expiresIn: "120m" }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Logged in successfully",
//       data: {
//         accessToken,
//         user: {
//           _id: checkUser._id,
//           userName: checkUser.userName,
//           userEmail: checkUser.userEmail,
//           role: checkUser.role,
//           imageUrl: checkUser.image ? `${req.protocol}://${req.get("host")}/${checkUser.image}` : null,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Error during login:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

// module.exports = { registerUser, loginUser };
