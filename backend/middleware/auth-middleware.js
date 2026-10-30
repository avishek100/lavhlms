const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = (token, secretKey) => {
  return jwt.verify(token, secretKey);
};

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "User is not authenticated",
    });
  }

  const token = authHeader.split(" ")[1];

  let payload;
  try {
    payload = verifyToken(token, process.env.JWT_SECRET);
  } catch (e) {
    return res.status(401).json({
      success: false,
      message: "invalid token",
    });
  }

  if (payload.collegeIssued !== true) {
    return res.status(401).json({
      success: false,
      message: "This account is not authorized to sign in.",
    });
  }

  try {
    const user = await User.findById(payload._id).select("active role approved");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "This account is unavailable.",
      });
    }
    if (
      !["admin", "student"].includes(payload.role) ||
      !["admin", "student"].includes(user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Only student and administrator accounts can sign in.",
      });
    }
    if (user.role === "student" && !user.active) {
      return res.status(403).json({
        success: false,
        message: "This account is blocked. Contact the administrator.",
      });
    }

    if (
      payload.mustChangePassword &&
      !["/change-password", "/check-auth"].includes(req.path)
    ) {
      return res.status(403).json({
        success: false,
        message: "Change your temporary password before continuing.",
        code: "PASSWORD_CHANGE_REQUIRED",
      });
    }

    req.user = {
      ...payload,
      approved: user.approved !== false,
    };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
