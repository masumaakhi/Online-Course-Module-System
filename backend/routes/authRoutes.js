// routes/authRoutes.js
const express = require("express");
const passport = require("passport");
const {
  isAuthenticated,
  login, logout, register,
  resetPassword, sendResetOtp, verifyEmail,
} = require("../controllers/authController.js");
const { userAuth } = require("../middleware/userAuth.js");

const authRouter = express.Router();

// normal auth
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/verify-account", userAuth, verifyEmail);
authRouter.get("/is-auth", userAuth, isAuthenticated);
authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", resetPassword);

// Google auth start
authRouter.get("/google",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  })
);

// Google callback
authRouter.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user) => {
    if (err || !user) {
      console.error("Google auth error:", err);
      return res.redirect(`${process.env.CLIENT_URL}/login?err=google_failed`);
    }

    const token = user.token;
    const isProd = process.env.NODE_ENV === "production";

    // Cookie (Chrome/Edge এ ভালো কাজ করে)
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Firefox/ITP safe fallback → token query দিয়ে frontend এ রিডাইরেক্ট
    return res.redirect(`${process.env.CLIENT_URL}/auth/landing?token=${token}`);
  })(req, res, next);
});

module.exports = authRouter;
