const authorizeStaff = (req, res, next) => {
  if (!["admin", "instructor"].includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: "Staff access is required.",
    });
  }

  next();
};

module.exports = authorizeStaff;
