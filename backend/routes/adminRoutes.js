// routes/adminRoutes.js
const express = require('express');
const { verifyAdmin } = require('../middleware/userAuth.js');
const { getAllUsers, blockUser, editUser, deleteUser, getUserById } = require('../controllers/adminController.js');


const adminRouter = express.Router();

adminRouter.get('/users', verifyAdmin, getAllUsers);
adminRouter.get('/users/:id', getUserById);
adminRouter.put('/users/:id/block', verifyAdmin, blockUser);
adminRouter.put('/update/users/:id', verifyAdmin, editUser);
adminRouter.delete('/delete/users/:id', verifyAdmin, deleteUser);

module.exports = adminRouter;
