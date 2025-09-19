//controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel.js');
const transporter  = require('../config/nodemailer.js');
const { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } = require('../config/emailTemplates.js');

 const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({
            success: false,
            message: "Missing Details"
        });
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
const verifyOtp = String(Math.floor(100000 + Math.random() * 900000));
        const user = new userModel({
            name,
            email,
            password: hashedPassword,
           verifyOtp,
           verifyOtpExpiredAt: Date.now() + 24 * 60 * 60 * 1000
        });

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
//Sending welcome email
             
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to our platform',
            // text: `Hi ${name},\n\nWelcome to our platform! We're excited to have you join us.Your account has been successfully created with email id: ${email}.\n\nYour account verification OTP is: ${verifyOtp}\n\nBest regards,\nWebMern Team. `,
            html: EMAIL_VERIFY_TEMPLATE.replace('{{name}}', name).replace('{{email}}', email).replace('{{verifyOtp}}', verifyOtp)
        }
        
        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "Registration Successful" });

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};

 const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({
            success: false,
            message: "Missing Details"
        });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User Email does not exist" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.json({ success: false, message: "Invalid Password" });
        }
       

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ success: true, message: "Login Successful" });

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};

 const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        });

        return res.json({ success: true, message: "Logout Successful" });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};



//verify email using otp

 const verifyEmail = async (req, res) => {


 try{
    const { otp } = req.body;
    const user = await userModel.findOne({
        verifyOtp: otp,
        verifyOtpExpiredAt: { $gt: Date.now() }
    });
    if(!user){
        return res.json({ success: false, message: "User does not exist" });
    }


    if(user.verifyOtp === '' || user.verifyOtp !== otp){
        return res.json({success: false, message: "Invalid OTP"})
    }

    if(user.verifyOtpExpiredAt < Date.now()){
        return res.json({success: false, message: "OTP Expired"})
    }

    user.isAccountVerified = true;
    user.verifyOtp = '';
    user.verifyOtpExpiredAt = 0;
    await user.save();

    return res.json({success: true, message: "Email Verified Successfully"})

 }catch{
    res.json({success: false, message: error.message})
 }
}

//Check if user authenticated
 const isAuthenticated = async (req, res) => {
 try{
   return res.json({success: true, message: "User Authenticated"});
 }catch(error){
    res.json({ success: false, message: error.message})
 }
}

//Send Password Reset OTP
 const sendResetOtp = async (req, res) => {
    const {email} = req.body;

    if(!email){
        return res.json({success: false, message: "Missing Details"})
    }

    try{
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: "User does not exist"})
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpiredAt= Date.now() + 15  * 60 * 1000;
        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            // text: `Hi ${user.name},\n\nYour password reset OTP is: ${otp}\n\nBest regards,\nWebMern Team. `
            html:PASSWORD_RESET_TEMPLATE.replace('{{name}}', user.name).replace('{{email}}', user.email).replace('{{otp}}', otp)
           };

           await transporter.sendMail(mailOption);

           return res.json({success: true, message: "Password Reset OTP Sent on Email"})
    }catch (error) {
        res.json({success: false, message: error.message})
    }
    
}


//Reset User Password
 const resetPassword = async (req, res) => {
    const {email, otp, newPassword} = req.body;

    if(!email || !otp || !newPassword){
        return res.json({success: false, message: "Missing Details"})
    }

    try{
        const user = await userModel.findOne({ email });

        if(!user){
            return res.json({success: false, message: "User does not exist"})
        }

        if(user.resetOtp === '' || user.resetOtp !== otp){
            return res.json({success: false, message: "Invalid OTP"})
        }

        if(user.resetOtpExpiredAt < Date.now()){
            return res.json({success: false, message: "OTP Expired"})
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);


        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpiredAt = 0;
        await user.save();

        return res.json({success: true, message: "Password Reset Successfully"})

    }catch (error) {
        res.json({success: false, message: error.message})
    }
}


module.exports = {
    register,
    login,
    logout,
    verifyEmail,
    isAuthenticated,
    sendResetOtp,
    resetPassword
}



