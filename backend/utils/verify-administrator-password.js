const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function verifyAdministratorPassword(userId, password) {
  if (typeof password !== "string" || !password) return false;

  const administrator = await User.findById(userId).select(
    "password userEmail"
  );
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  return Boolean(
    administrator &&
      adminEmail &&
      administrator.userEmail?.trim().toLowerCase() === adminEmail &&
      (await bcrypt.compare(password, administrator.password))
  );
}

module.exports = verifyAdministratorPassword;
