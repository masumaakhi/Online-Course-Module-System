// middleware/userAuth.js
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel.js");

// helper: cookie বা Authorization header থেকে টোকেন বের করা
function extractToken(req) {
  // 1) HttpOnly cookie
  if (req.cookies && req.cookies.token) return req.cookies.token;

  // 2) Authorization: Bearer <token>
  const h = req.headers.authorization || req.headers.Authorization;
  if (h && typeof h === "string" && h.startsWith("Bearer ")) {
    return h.split(" ")[1];
  }
  return null;
}

// General Auth Middleware
const userAuth = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id).lean();
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    req.user = user; // পরের হ্যান্ডলারগুলোর জন্য ইউজার সেট
    next();
  } catch (err) {
    const msg = err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    return res.status(401).json({ success: false, message: msg });
  }
};

// Admin guard
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied. Admins only." });
  }
  next();
};

const verifyAdmin = [userAuth, isAdmin];

module.exports = { userAuth, isAdmin, verifyAdmin };
