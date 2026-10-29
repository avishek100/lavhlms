const Attendance = require("../../models/Attendance");
const Course = require("../../models/Course");
const Notice = require("../../models/Notice");
const User = require("../../models/User");

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === value
  );
}

function formatNoticeSender(notice) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const isAdministrator =
    notice.senderRole === "admin" ||
    (Boolean(adminEmail) &&
      notice.teacherId?.userEmail?.trim().toLowerCase() === adminEmail);

  return {
    ...notice,
    senderRole: isAdministrator ? "admin" : notice.senderRole || "instructor",
    senderName:
      notice.senderName ||
      (isAdministrator ? "ADS College" : notice.teacherId?.userName || "Teacher"),
  };
}

const getAttendanceClasses = async (req, res) => {
  try {
    const classes = await User.distinct("studentClass", {
      role: "student",
      collegeIssued: true,
      active: true,
      studentClass: { $type: "string", $ne: "" },
    });
    return res.status(200).json({
      success: true,
      data: classes.sort((first, second) => first.localeCompare(second)),
    });
  } catch (error) {
    console.error("Unable to load attendance classes:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load classes for attendance.",
    });
  }
};

const getAttendanceRoster = async (req, res) => {
  try {
    const { className, date } = req.query;
    if (typeof className !== "string" || !className.trim() || !isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: "Choose a class and valid attendance date.",
      });
    }

    const students = await User.find({
      role: "student",
      collegeIssued: true,
      active: true,
      studentClass: className.trim(),
    })
      .select("_id userName studentNumber studentClass")
      .sort({ userName: 1 })
      .lean();
    const attendance = await Attendance.findOne({
      teacherId: req.user._id,
      className: className.trim(),
      date,
    }).lean();
    const presentByStudentId = new Map(
      (attendance?.records || []).map((record) => [
        String(record.studentId),
        record.present,
      ])
    );

    return res.status(200).json({
      success: true,
      data: students.map((student) => ({
        ...student,
        present: presentByStudentId.get(String(student._id)) ?? false,
      })),
    });
  } catch (error) {
    console.error("Unable to load attendance roster:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load attendance roster.",
    });
  }
};

const saveAttendance = async (req, res) => {
  try {
    const { className, date, records } = req.body;
    if (
      typeof className !== "string" ||
      !className.trim() ||
      !isValidDate(date) ||
      !Array.isArray(records) ||
      records.length === 0 ||
      records.some(
        (record) =>
          typeof record.studentId !== "string" ||
          typeof record.present !== "boolean"
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide a class, valid date, and attendance for its students.",
      });
    }

    const requestedIds = records.map((record) => record.studentId);
    if (new Set(requestedIds).size !== requestedIds.length) {
      return res.status(400).json({
        success: false,
        message: "Each student can only appear once in attendance.",
      });
    }

    const students = await User.find({
      _id: { $in: requestedIds },
      role: "student",
      collegeIssued: true,
      active: true,
      studentClass: className.trim(),
    })
      .select("_id")
      .lean();
    if (students.length !== requestedIds.length) {
      return res.status(400).json({
        success: false,
        message: "Attendance includes a student outside the selected active class.",
      });
    }

    const attendance = await Attendance.findOneAndUpdate(
      {
        teacherId: req.user._id,
        className: className.trim(),
        date,
      },
      {
        $set: {
          records: records.map((record) => ({
            studentId: record.studentId,
            present: record.present,
          })),
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Attendance saved.",
      data: attendance,
    });
  } catch (error) {
    console.error("Unable to save attendance:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to save attendance.",
    });
  }
};

const getNoticeClasses = async (req, res) => {
  try {
    const classes =
      req.user.role === "admin"
        ? await User.distinct("studentClass", {
            role: "student",
            collegeIssued: true,
            active: true,
            studentClass: { $type: "string", $ne: "" },
          })
        : await Course.distinct("studentClass", {
            instructorId: req.user._id,
            studentClass: { $type: "string", $ne: "" },
          });

    return res.status(200).json({
      success: true,
      data: classes.sort((first, second) => first.localeCompare(second)),
    });
  } catch (error) {
    console.error("Unable to load notice classes:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load classes for notices.",
    });
  }
};

const getTeacherNotices = async (req, res) => {
  try {
    const noticeScope = req.user.role === "admin" ? {} : { teacherId: req.user._id };
    const notices = await Notice.find(noticeScope)
      .populate("teacherId", "userName userEmail role")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({
      success: true,
      data: notices.map(formatNoticeSender),
    });
  } catch (error) {
    console.error("Unable to load notices:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load notices.",
    });
  }
};

const createTeacherNotice = async (req, res) => {
  try {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const message =
      typeof req.body.message === "string" ? req.body.message.trim() : "";
    const audience = req.body.audience;
    const studentClasses = Array.isArray(req.body.studentClasses)
      ? [...new Set(
          req.body.studentClasses
            .filter((className) => typeof className === "string")
            .map((className) => className.trim())
            .filter(Boolean)
        )]
      : [];
    if (!title || title.length > 160 || !message || message.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Enter a notice title (up to 160 characters) and message (up to 5000 characters).",
      });
    }

    if (
      (audience !== "college" && audience !== "batch") ||
      (audience === "college" && req.user.role !== "admin") ||
      (audience === "batch" && studentClasses.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Choose a permitted audience and at least one batch.",
      });
    }

    if (audience === "batch") {
      const allowedClasses =
        req.user.role === "admin"
          ? await User.distinct("studentClass", {
              role: "student",
              collegeIssued: true,
              active: true,
              studentClass: { $type: "string", $ne: "" },
            })
          : await Course.distinct("studentClass", {
              instructorId: req.user._id,
              studentClass: { $type: "string", $ne: "" },
            });
      if (studentClasses.some((className) => !allowedClasses.includes(className))) {
        return res.status(403).json({
          success: false,
          message: "You can only send notices to batches you are authorized for.",
        });
      }
    }

    const user = await User.findById(req.user._id)
      .select("userName userEmail role")
      .lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Your account could not be found.",
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const isAdministrator =
      Boolean(adminEmail) &&
      user.userEmail?.trim().toLowerCase() === adminEmail;

    const notice = await Notice.create({
      teacherId: req.user._id,
      senderRole: isAdministrator ? "admin" : "instructor",
      senderName: isAdministrator ? "ADS College" : user.userName,
      audience,
      studentClasses: audience === "batch" ? studentClasses : [],
      title,
      message,
    });
    return res.status(201).json({
      success: true,
      message:
        audience === "college"
          ? "Notice sent to all active students."
          : `Notice sent to ${studentClasses.length === 1 ? "the selected batch" : "the selected batches"}.`,
      data: notice,
    });
  } catch (error) {
    console.error("Unable to send notice:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to send notice.",
    });
  }
};

const getStudentNotices = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).select("studentClass");
    const courseIds = student?.studentClass
      ? await Course.find({ studentClass: student.studentClass }).distinct("_id")
      : [];
    const noticeConditions = [
      { audience: "college" },
      {
        audience: { $exists: false },
        $or: [
          { courseId: { $exists: false } },
          { courseId: null },
          { courseId: { $in: courseIds } },
        ],
      },
    ];
    if (student?.studentClass) {
      noticeConditions.push({
        audience: "batch",
        studentClasses: student.studentClass,
      });
    }
    const notices = await Notice.find({ $or: noticeConditions })
      .populate("teacherId", "userName userEmail role")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({
      success: true,
      data: notices.map(formatNoticeSender),
    });
  } catch (error) {
    console.error("Unable to load student notices:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load notices.",
    });
  }
};

module.exports = {
  getAttendanceClasses,
  getAttendanceRoster,
  saveAttendance,
  getNoticeClasses,
  getTeacherNotices,
  createTeacherNotice,
  getStudentNotices,
};
