// middleware/userAuth.js
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel.js");

// General Auth Middleware
const userAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.json({ success: false});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.json({ success: false, message: "User not found" });

        }

        req.user = user; // Store user info for next middleware
        next();
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Admin Middleware
const isAdmin = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.json({ success: false, message: "Access denied. Admins only." });
    }
    next();
};

 const verifyAdmin = [userAuth, isAdmin];

 module.exports = {
    userAuth,
    isAdmin,
    verifyAdmin
 }