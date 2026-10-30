function requireApprovedStudent(req, res, next) {
  if (req.user?.role === "student" && req.user.approved === false) {
    return res.status(403).json({
      success: false,
      code: "APPROVAL_REQUIRED",
      message: "Your account is awaiting administrator approval.",
    });
  }

  next();
}

module.exports = requireApprovedStudent;
