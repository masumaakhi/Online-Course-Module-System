//config/passport.js
const passport = require("passport");
const dotenv = require("dotenv");
const { Strategy: GoogleStrategy } = require('passport-google-oauth20')
const userModel = require("../models/userModel.js");
const jwt = require("jsonwebtoken");

dotenv.config();
passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL + '/api/auth/google/callback',


}, async (accessToken, refreshToken, profile, done) => {

  try{
   let user = await userModel.findOne({googleId: profile.id})
  if (!user) {
  user = await userModel.create({
    googleId: profile.id,
    name: `${profile.name.givenName} ${profile.name.familyName || ''}`.trim(), // ✅ fix name
    email: profile.emails[0].value, // ✅ make sure it's 'emails', not 'email'
    isAccountVerified: true,
    password: undefined 
  });
}
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      user.token = token; // optional

   return done(null, user);
  }catch (error) {
    return done(error, null)

  }
}

));

passport.serializeUser((user, done) => {
 return done(null, user)
});

passport.deserializeUser(async(id, done) => {
  try{
    const user = await userModel.findById(id)
    done(null, user);
  } catch (error) {
     done(error, null);
  }
})

module.exports = passport;