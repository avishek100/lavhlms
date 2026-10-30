const Notice = require("../../models/Notice");
const User = require("../../models/User");

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

const getAdminNotices = async (req, res) => {
  try {
    const notices = await Notice.find({})
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

const createAdminNotice = async (req, res) => {
  try {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    const message =
      typeof req.body.message === "string" ? req.body.message.trim() : "";
    if (!title || title.length > 160 || !message || message.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Enter a notice title (up to 160 characters) and message (up to 5000 characters).",
      });
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
      senderRole: "admin",
      senderName: isAdministrator ? "ADS College" : user.userName,
      audience: "college",
      studentClasses: [],
      title,
      message,
    });
    return res.status(201).json({
      success: true,
      message: "Notice sent to all students.",
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
    const notices = await Notice.find({})
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
  getAdminNotices,
  createAdminNotice,
  getStudentNotices,
};
