// //config/passport.js
// const passport = require("passport");
// const dotenv = require("dotenv");
// const { Strategy: GoogleStrategy } = require('passport-google-oauth20')
// const userModel = require("../models/userModel.js");
// const jwt = require("jsonwebtoken");

// dotenv.config();
// passport.use(new GoogleStrategy({
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: process.env.GOOGLE_CALLBACK_URL + '/api/auth/google/callback',


// }, async (accessToken, refreshToken, profile, done) => {

//   try{
//    let user = await userModel.findOne({googleId: profile.id})
//   if (!user) {
//   user = await userModel.create({
//     googleId: profile.id,
//     name: `${profile.name.givenName} ${profile.name.familyName || ''}`.trim(), // ✅ fix name
//     email: profile.emails[0].value, // ✅ make sure it's 'emails', not 'email'
//     isAccountVerified: true,
//     password: undefined 
//   });
// }
// const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
//       user.token = token; // optional

//    return done(null, user);
//   }catch (error) {
//     return done(error, null)

//   }
// }

// ));

// passport.serializeUser((user, done) => {
//  return done(null, user)
// });

// passport.deserializeUser(async(id, done) => {
//   try{
//     const user = await userModel.findById(id)
//     done(null, user);
//   } catch (error) {
//      done(error, null);
//   }
// })

// module.exports = passport;

// config/passport.js
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const API_BASE_URL =
  process.env.GOOGLE_CALLBACK_URL || `http://localhost:${process.env.PORT || 5250}`;

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error("❌ GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET missing in .env");
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Google console → Authorized redirect URIs-এ এইটা থাকতে হবে
      callbackURL: `${API_BASE_URL}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        // 1) googleId দিয়ে খুঁজি, না পেলে একই email-এর user থাকলে link করি
        let user =
          (await userModel.findOne({ googleId: profile.id })) ||
          (await userModel.findOne({ email }));

        if (!user) {
          user = await userModel.create({
            name:
              `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim() ||
              profile.displayName ||
              email?.split("@")[0] ||
              "User",
            email,
            googleId: profile.id,
            isAccountVerified: true,
          });
        } else if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        // sessionless flow: শুধু token পাঠালেই হবে
        return done(null, { id: user._id, token });
      } catch (err) {
        return done(err);
      }
    }
  )
);

// session ব্যবহার করছি না—তবু harmless no-op রাখলে সমস্যা নেই
passport.serializeUser((u, d) => d(null, u));
passport.deserializeUser((o, d) => d(null, o));

module.exports = passport;
