//routes/userRoutes.js

const express = require('express');
const { userAuth, isAdmin } = require('../middleware/userAuth.js');
const { getUserData } = require('../controllers/userController.js');

const userRouter = express.Router();

// ✅ Run userAuth first to verify token and attach user, then check admin role
userRouter.get('/isAdminData', userAuth, isAdmin, getUserData);

// ✅ Regular user access (just checks if authenticated)
userRouter.get('/data', userAuth, getUserData);


module.exports = userRouter;
