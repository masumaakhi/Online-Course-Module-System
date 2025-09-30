// //routes/authRoutes.js

// const express = require('express');
// const passport = require('passport');
// const {
//   isAuthenticated,
//   login,
//   logout,
//   register,
//   resetPassword,
//   sendResetOtp,
//   verifyEmail,
// } = require('../controllers/authController.js');
// const { userAuth } = require('../middleware/userAuth.js');

// const authRouter = express.Router();

// // Normal Auth Routes
// authRouter.post('/register', register);
// authRouter.post('/login', login);
// authRouter.post('/logout', logout);
// authRouter.post('/verify-account', userAuth, verifyEmail);
// authRouter.get('/is-auth', userAuth, isAuthenticated);
// authRouter.post('/send-reset-otp', sendResetOtp);
// authRouter.post('/reset-password', resetPassword);

// // Google Auth Routes
// authRouter.get(
//   '/google',
//   passport.authenticate('google', {
//     session: false,
//     scope: ['profile', 'email'],
//   })
// );



// authRouter.get('/google/callback',
//   passport.authenticate('google', { failureRedirect: '/' }),
//   (req, res) => {
//     const token = req.user.token; // ✅ Define first

//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//     });

//     res.redirect(`${process.env.CLIENT_URL}?token=${token}`);
//   }
// );

// module.exports = authRouter;


// routes/authRoutes.js
const express = require("express");
const passport = require("passport");
const {
  isAuthenticated,
  login,
  logout,
  register,
  resetPassword,
  sendResetOtp,
  verifyEmail,
} = require("../controllers/authController.js");
const { userAuth } = require("../middleware/userAuth.js");

const authRouter = express.Router();

// Normal auth
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/verify-account", userAuth, verifyEmail);
authRouter.get("/is-auth", userAuth, isAuthenticated);
authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", resetPassword);

// Google auth start
authRouter.get(
  "/google",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  })
);

// Google auth callback (session:false, cookie dev/prod safe)
authRouter.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user) => {
    if (err || !user) {
      console.error("Google auth error:", err);
      return res.redirect(`${process.env.CLIENT_URL}/login?err=google_failed`);
    }

    const token = user.token;
    // Align cookie with email/password login to avoid Firefox cross-site issues
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // Cookie is set; redirect user back to app
    return res.redirect(`${process.env.CLIENT_URL}`);
  })(req, res, next);
});


module.exports = authRouter;
