const User = require("../../models/User");
const Attendance = require("../../models/Attendance");
const Course = require("../../models/Course");
const CourseProgress = require("../../models/CourseProgress");
const Notice = require("../../models/Notice");
const StudentCourses = require("../../models/StudentCourses");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs/promises");
const path = require("path");
const { randomInt, randomUUID } = require("crypto");
const INITIAL_STUDENT_PASSWORD = "changepassword";
const profileImageDirectory = path.resolve(__dirname, "../../uploads/profile-pictures");

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
        "_id userName userEmail userPhone studentNumber staffNumber parentName parentPhone address studentClass role image mustChangePassword"
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

const createCollegeAccount = async (req, res, role) => {
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
    const studentClass =
      typeof req.body.studentClass === "string"
        ? req.body.studentClass.trim()
        : "";

    if (
      !userName ||
      !parentName ||
      !parentPhone ||
      !address ||
      !studentClass ||
      (role === "student" && (!userPhone || !userEmail))
    ) {
      return res.status(400).json({
        success: false,
        message:
          role === "student"
            ? "Enter the student name, parent or guardian name, student and parent phone numbers, email, address, and class or batch."
            : "Enter the teacher name, parent or guardian name and phone, address, and class or batch.",
      });
    }

    const parentPhoneDigitCount = parentPhone.replace(/\D/g, "").length;
    const userPhoneDigitCount = userPhone.replace(/\D/g, "").length;
    if (
      !/^[+()\d\s.-]{7,20}$/.test(parentPhone) ||
      parentPhoneDigitCount < 7 ||
      parentPhoneDigitCount > 15 ||
      (role === "student" &&
        (!/^[+()\d\s.-]{7,20}$/.test(userPhone) ||
          userPhoneDigitCount < 7 ||
          userPhoneDigitCount > 15)) ||
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
      const accountNumber = `${role === "student" ? "ADS" : "ADT"}${randomInt(100000, 1000000)}`;
      newUser = new User({
        userName,
        userEmail: userEmail || undefined,
        userPhone: userPhone || undefined,
        parentName,
        parentPhone,
        address,
        studentClass,
        ...(role === "student"
          ? { studentNumber: accountNumber }
          : { staffNumber: accountNumber }),
        role,
        collegeIssued: true,
        active: true,
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
      message: `${role === "student" ? "Student" : "Teacher"} account created successfully.`,
      data: {
        _id: newUser._id,
        userName: newUser.userName,
        userEmail: newUser.userEmail,
        userPhone: newUser.userPhone,
        parentName: newUser.parentName,
        parentPhone: newUser.parentPhone,
        address: newUser.address,
        studentClass: newUser.studentClass,
        studentNumber: newUser.studentNumber,
        staffNumber: newUser.staffNumber,
        role: newUser.role,
        initialPassword: INITIAL_STUDENT_PASSWORD,
      },
    });
  } catch (error) {
    console.error(`Unable to create ${role} account:`, error);
    return res.status(500).json({
      success: false,
      message: `Unable to create the ${role} account.`,
    });
  }
};

const createStudentAccount = (req, res) =>
  createCollegeAccount(req, res, "student");

const createTeacherAccount = (req, res) =>
  createCollegeAccount(req, res, "instructor");

const getStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      collegeIssued: true,
    })
      .select(
        "_id userName userEmail userPhone studentNumber parentName parentPhone address studentClass active"
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

const getTeachers = async (req, res) => {
  try {
    const query = {
      role: "instructor",
      collegeIssued: true,
    };
    const adminEmail = process.env.ADMIN_EMAIL?.trim();
    if (adminEmail) {
      query.userEmail = { $not: createEmailPattern(adminEmail) };
    }
    const teachers = await User.find(query)
      .select(
        "_id userName userEmail staffNumber parentName parentPhone address studentClass active"
      )
      .sort({ userName: 1 })
      .lean();

    return res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    console.error("Unable to load teachers:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load teachers.",
    });
  }
};

const updateTeacherStatus = async (req, res) => {
  try {
    if (typeof req.body.active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Choose whether the teacher account should be active.",
      });
    }

    const query = {
      _id: req.params.teacherId,
      role: "instructor",
      collegeIssued: true,
    };
    const adminEmail = process.env.ADMIN_EMAIL?.trim();
    if (adminEmail) {
      query.userEmail = { $not: createEmailPattern(adminEmail) };
    }
    const teacher = await User.findOneAndUpdate(
      query,
      { $set: { active: req.body.active } },
      { new: true, runValidators: true }
    ).select("_id userName staffNumber active");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: req.body.active
        ? "Teacher account unblocked."
        : "Teacher account blocked.",
      data: teacher,
    });
  } catch (error) {
    console.error("Unable to update teacher status:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update teacher status.",
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
    ).select("_id userName studentNumber active");

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

const deleteCollegeAccount = async (req, res, role) => {
  try {
    const { adminPassword } = req.body;
    if (typeof adminPassword !== "string" || !adminPassword) {
      return res.status(400).json({
        success: false,
        message: "Enter your administrator password to confirm deletion.",
      });
    }

    const administrator = await User.findById(req.user._id).select(
      "password userEmail"
    );
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (
      !administrator ||
      !adminEmail ||
      administrator.userEmail?.trim().toLowerCase() !== adminEmail ||
      !(await bcrypt.compare(adminPassword, administrator.password))
    ) {
      return res.status(401).json({
        success: false,
        message: "Administrator password is incorrect.",
      });
    }

    const accountQuery = {
      _id: req.params.accountId,
      role,
      collegeIssued: true,
    };
    if (role === "instructor") {
      if (adminEmail) {
        accountQuery.userEmail = { $not: createEmailPattern(adminEmail) };
      }
    }

    const account = await User.findOne(accountQuery).select("_id userName image");
    if (!account) {
      return res.status(404).json({
        success: false,
        message: `${role === "student" ? "Student" : "Teacher"} account not found.`,
      });
    }

    const accountId = String(account._id);
    if (role === "student") {
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
    } else {
      await Promise.all([
        Attendance.deleteMany({ teacherId: account._id }),
        Notice.updateMany(
          { teacherId: account._id },
          {
            $set: {
              senderRole: "instructor",
              senderName: account.userName,
            },
          }
        ),
        Course.updateMany(
          { instructorId: accountId },
          {
            $set: {
              instructorId: String(req.user._id),
              instructorName: "ADS College",
            },
          }
        ),
      ]);
    }

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
      message: `${role === "student" ? "Student" : "Teacher"} account deleted.`,
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

const deleteStudentAccount = (req, res) =>
  deleteCollegeAccount(req, res, "student");

const deleteTeacherAccount = (req, res) =>
  deleteCollegeAccount(req, res, "instructor");

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
            { staffNumber: identifier.toUpperCase() },
          ],
        }
  );

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const isConfiguredAdmin =
    Boolean(adminEmail) &&
    checkUser?.userEmail?.trim().toLowerCase() === adminEmail;

  if (
    checkUser &&
    ["student", "instructor"].includes(checkUser.role) &&
    !checkUser.active
  ) {
    return res.status(403).json({
      success: false,
      message: "This college account is blocked. Contact college staff.",
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
    !isConfiguredAdmin &&
    checkUser.role !== "instructor"
  ) {
    return res.status(403).json({
      success: false,
      message: "This account was not issued by ADS College. Contact college staff for access.",
    });
  }

  const userRole =
    isConfiguredAdmin
      ? "admin"
      : checkUser.role === "instructor"
        ? "instructor"
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
      },
    },
  });
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
  createTeacherAccount,
  getTeachers,
  updateTeacherStatus,
  getStudents,
  updateStudentStatus,
  deleteStudentAccount,
  deleteTeacherAccount,
  getActiveStudentCount,
  changePassword,
  loginUser,
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
