const nodemailer = require("nodemailer");

function createInstitutionEmailTransport() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;

  if (!host || !Number.isInteger(port) || !user || !password) {
    throw new Error(
      "Institution email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD."
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass: password },
  });
}

async function sendPasswordResetOtp({ recipient, otp }) {
  const from = process.env.INSTITUTION_EMAIL_FROM?.trim();
  if (!from) {
    throw new Error(
      "Institution email sender is not configured. Set INSTITUTION_EMAIL_FROM."
    );
  }

  const transport = createInstitutionEmailTransport();
  await transport.sendMail({
    from,
    to: recipient,
    subject: "Your password reset code",
    text: `Your password reset code is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`,
    html: `<p>Your password reset code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${otp}</p><p>This code expires in 10 minutes. If you did not request this, ignore this email.</p>`,
  });
}

module.exports = { sendPasswordResetOtp };
