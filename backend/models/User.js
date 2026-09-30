const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    otpPurpose: { type: String, enum: ["verify_email", "reset_password"], default: null },
    role: { type: String, enum: ["operator", "admin"], default: "operator" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);