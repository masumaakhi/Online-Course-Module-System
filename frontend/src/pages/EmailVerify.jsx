import React from 'react'
import axios from 'axios'
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

const EmailVerify = () => {
  axios.defaults.withCredentials = true; // 👈 Global setting

  const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContext);
  const navigate = useNavigate();

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


   const onSubmitHandler = async (e) => {
    
    try{
      e.preventDefault();
      const otpArray = inputRefs.current.map(e => e.value);
      const otp = otpArray.join('');

      const { data } = await axios.post(`${backendUrl}/api/auth/verify-account`, {
        otp
      })

      if (data.success) {
        setIsLoggedIn(true);
        await getUserData(); // 👈 Also add this here to load user info on login
        toast.success(data.message);
        navigate('/');
      } else {
        toast.error(data.message);
      }
    }catch(error){
      toast.error(error.response?.data?.message || "Login failed");
    }
   }

  return (
    <div className='flex flex-col items-center mt-20 px-4 text-center'>
      <img
              onClick={() => navigate('/')}
              src={assets.logo}
              alt="logo"
              className='absolute top-10 left-12 -translate-x-1/2 -translate-y-1/2 cursor-pointer sm:w-32'
            />
      <form onSubmit={onSubmitHandler} className='bg-slate-900 p-8 rounded-l shadow-lg w-96 text-sm'>
        <h1 className='text-2xl font-semibold mb-4 text-white text-center'>Verify Email otp</h1>
      <p className='text-center text-sm mb-6 text-indigo-300'>Check your email to verify your account</p>

      <div className='flex justify-between mb-8' onPaste={handlePaste}>
          {Array(6).fill(0).map((_, index) => (
            <input type="text" maxLength={1} key={index} required className='w-12 h-12 bg-[#333A5C] text-white rounded-md text-xl text-center ' 
            ref={e => inputRefs.current[index] = e}
             onInput={(e) => handleInput(e, index)}
             onKeyDown={(e) => handleKeyDown(e, index)}           
             
             />      
        ))}
      </div>
      <button  className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium'>Verify</button> 

      </form>
      
    </div>
  )
}

export default EmailVerify