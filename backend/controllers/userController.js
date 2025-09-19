//controllers/userController.js

const userModel = require("../models/userModel");

const getUserData = async (req, res) => {
    try{


  const user = await userModel.findById(req.user._id).select('name email role isAccountVerified');;
  if(!user){
      return res.json({success: false, message: "User does not exist"})
  }

   res.json({
    success: true, 
    userData : {
             name: user.name,
             email: user.email,
             role: user.role,
           isAccountVerified: user.isAccountVerified

  }
});

    } catch (error){
        res.json({success: false, message: error.message})
    }
}

module.exports = {
    getUserData
}