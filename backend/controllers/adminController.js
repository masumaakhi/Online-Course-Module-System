//controllers/adminController.js

const userModel = require('../models/userModel.js');
// ✅ Get all users
 const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({}, 'name email role isBlocked isAccountVerified');
    res.json({ success: true, users });  // success:true সহ response pathao
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ✅ Block/unblock user
 const blockUser = async (req, res) => {
  const userId = req.params.id;
  const { block } = req.body;

  try {
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isBlocked = block;
    await user.save();
    res.json({ message: `User ${block ? 'blocked' : 'activated'} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

 const editUser = async (req, res) => {
  const userId = req.params.id;
  const { name, email, role, isAccountVerified } = req.body;

  try {
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.role = role ?? user.role;
    user.isAccountVerified = isAccountVerified ?? user.isAccountVerified;

    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

 const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await userModel.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

 const getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  blockUser,
  editUser,
  deleteUser,
  getUserById
};