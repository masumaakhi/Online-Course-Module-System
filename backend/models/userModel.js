// models/userModel.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true, // email সবসময় unique
      lowercase: true,
    },

    password: {
      type: String,
      required: function () {
        return !this.googleId; // google login হলে password required হবে না
      },
    },

    googleId: {
      type: String,
      sparse: true, // null হলে multiple document allow করবে
    },

    role: {
      type: String,
      enum: ["admin", "user", "instructor", "corporateAdmin", "student"],
      default: "student",
    },

    // OTP verification fields
    verifyOtp: {
      type: String,
      default: "",
    },
    verifyOtpExpiredAt: {
      type: Number,
      default: 0,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },

    // Reset password OTP fields
    resetOtp: {
      type: String,
      default: "",
    },
    resetOtpExpiredAt: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // createdAt, updatedAt auto add হবে
);

// Index ঠিক করার জন্য আগে ensureIndexes করতে হবে
// userSchema.index({ googleId: 1 }, { sparse: true });

const userModel =
  mongoose.models.user || mongoose.model("user", userSchema);

module.exports = userModel;
