import React, { useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
// import { set } from "mongoose";

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContext);
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState('');
  const [otp, setOtp] = useState(0);
  const [isOtpSubmited, setIsOtpSubmited] = useState(false);

  const inputRefs = React.useRef([])
     const handleInput = (e, input) => {
        if(e.target.value.length > 0 && input < inputRefs.current.length - 1) {
          inputRefs.current[input + 1].focus();
        }
     }
  
     const handleKeyDown = (e, input) => {
        if(e.key === 'Backspace' && e.target.value === '' && input > 0) {
          inputRefs.current[input - 1].focus();
        }
     }
  
     const handlePaste = (e) => {
      const paste = e.clipboardData.getData('Text');
      const pasteArray = paste.split('');
      pasteArray.forEach((char, index) => {
        if(inputRefs.current[index]) {
          inputRefs.current[index].value = char;
        }
      })
     }

     const onSubmitEmail = async(e) => {
      e.preventDefault();
      try{
        const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, {email});
        if (data.success) {
          setIsEmailSent(true);
          toast.success(data.message, { autoClose: 1000 });
        } else {
          toast.error(data.message);
        }
      }catch(error){
        toast.error(error.response?.data?.message || "Login failed");
      }
     }


     const onSumitOTP = async (e) => {
       e.preventDefault();
       const otpArray = inputRefs.current.map(e => e.value);
      setOtp(otpArray.join(''));
      setIsOtpSubmited(true)
     }

     const onSubmitNewPassword = async (e) => {
      e.preventDefault();
      try{
        const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, {email, otp, newPassword});
        if (data.success) {
          navigate('/login');
          toast.success(data.message, { autoClose: 1000 });
        } else {
          toast.error(data.message);
        }
      }catch(error){
        toast.error(error.response?.data?.message || "Login failed");
      }
     }
  
  return (
    <div className="flex flex-col items-center mt-20 px-4 text-center">

{/* Enter Email form  */}

{!isEmailSent &&  
      <form
        onSubmit={onSubmitEmail}
        className="bg-slate-900 p-8 rounded-l shadow-lg w-96 text-sm"
      >
        <h1 className="text-2xl font-semibold mb-4 text-white text-center">
          Reset Password
        </h1>
        <p className="text-center text-sm mb-6 text-indigo-300">
         Enter your Registered Email Address 
        </p>
        <div className="flex mb-4 items-center gap-4 w-full px-5 py-2.5 rounded-full bg-[#333A5C]"> 
          <img src={assets.mail_icon} alt="mailIcon" className="w-3 h-3"/>
          <input type="email"  placeholder="Enter your email" className="outline-none bg-transparent text-white" value={email} onChange={(e) => setEmail(e.target.value)} required/>
        </div>
        <button
          className= "w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium"
        >
          Submit
        </button>
      </form>
}
      {/* otp input form */}

      {!isOtpSubmited && isEmailSent && 

 <form onSubmit={onSumitOTP} className='bg-slate-900 p-8 rounded-l shadow-lg w-96 text-sm'>
        <h1 className='text-2xl font-semibold mb-4 text-white text-center'>Reset Password otp</h1>
      <p className='text-center text-sm mb-6 text-indigo-300'>Enter the otp sent to your email</p>

      <div className='flex justify-between mb-8' onPaste={handlePaste}>
          {Array(6).fill(0).map((_, index) => (
            <input type="text" maxLength={1} key={index} required className='w-12 h-12 bg-[#333A5C] text-white rounded-md text-xl text-center ' 
            ref={e => inputRefs.current[index] = e}
             onInput={(e) => handleInput(e, index)}
             onKeyDown={(e) => handleKeyDown(e, index)}           
             
             />      
        ))}
      </div>
      <button  className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium'>Submit</button> 

      </form>
}
      {/* Enter New Password */}

      {isOtpSubmited &&  isEmailSent && 

       <form
        onSubmit={onSubmitNewPassword}
        className="bg-slate-900 p-8 rounded-l shadow-lg w-96 text-sm"
      >
        <h1 className="text-2xl font-semibold mb-4 text-white text-center">
          New Password
        </h1>
        <p className="text-center text-sm mb-6 text-indigo-300">
         Enter the New Password below 
        </p>
        <div className="flex mb-4 items-center gap-4 w-full px-5 py-2.5 rounded-full bg-[#333A5C]"> 
          <img src={assets.lock_icon} alt="mailIcon" className="w-3 h-3"/>
          <input type="password"  placeholder="Enter the new Password" className="outline-none bg-transparent text-white" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required/>
        </div>
        <button
          className= "w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium"
        >
          Submit
        </button>
      </form>
}
    </div>
  );
};

export default ResetPassword;
