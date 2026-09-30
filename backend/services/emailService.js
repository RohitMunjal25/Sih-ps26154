const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendOTPEmail = async (email, otp, purpose) => {
  const subject = purpose === "verify_email" 
    ? "Verify your Gen AI Platform Account" 
    : "Reset your Gen AI Platform Password";

  const message = purpose === "verify_email"
    ? "Use this OTP to verify your email address for NTRO Gen AI Platform."
    : "Use this OTP to reset your secure password.";

  await transporter.sendMail({
    from: `"Gen AI Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Gen AI Content Transformation Platform</h2>
        <p>${message}</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 25px 0;">
          ${otp}
        </div>
        <p>This OTP is valid for 10 minutes.</p>
      </div>
    `,
  });
};

module.exports = { sendOTPEmail };