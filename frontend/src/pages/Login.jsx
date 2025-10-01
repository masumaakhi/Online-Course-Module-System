

import React, { useContext, useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
 axios.defaults.withCredentials = true;


const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading,setIsLoading] = useState(false);
 
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
     const { data } = await axios.post(`${backendUrl}/api/auth/login`, {
          email,
          password
        });

        if (data.success) {
          if(data.token) {
          localStorage.setItem('token', data.token);
        }
          setIsLoggedIn(true);
          await getUserData(); // 👈 Also add this here to load user info on login
          toast.success(data.message);
          navigate('/');
        } else {
          toast.error(data.message);
        }
      } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

        const handleGoogleLogin = () => {
        try {
             setIsLoading(true);
             const googleLoginUrl = `${backendUrl}/api/auth/google`;
             window.location.href = googleLoginUrl;
        } catch (error) {
            console.error('error login with google', error)
            setIsLoading(false)
        }
    };

   



    useEffect(() => {
       const token = localStorage.getItem('token');
    if(token) {
        navigate('/')
    } else{
        navigate('/login')
    }
    }, [navigate])

  return (
    <div className='flex flex-col items-center mt-20 px-4 text-center'>
      <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
        <h2 className='text-3xl font-semibold mb-4 text-white text-center'>Login</h2>
        <p className='text-center text-sm mb-6'>Login to your account</p>
        <form onSubmit={onSubmitHandler}>
          <button
            type="button"
              onClick={handleGoogleLogin}
            className="w-full py-2.5 mb-4  flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 488 512"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M488 261.8c0-17.8-1.5-35.1-4.3-51.8H249v98h135.4c-5.8 31.2-23.5 57.6-50 75.2v62.2h80.8c47.4-43.6 74.8-108 74.8-183.6z"
                fill="#4285F4"
              />
              <path
                d="M249 492c67.8 0 124.8-22.4 166.4-60.8l-80.8-62.2c-22.6 15.2-51.2 24.2-85.6 24.2-65.8 0-121.5-44.4-141.4-104.2H24v65.2C65.3 429.5 150.3 492 249 492z"
                fill="#34A853"
              />
              <path
                d="M107.6 289c-4.8-14.4-7.6-29.6-7.6-45s2.8-30.6 7.6-45v-65.2H24C8.7 160.3 0 203.3 0 244s8.7 83.7 24 116.2l83.6-65.2z"
                fill="#FBBC05"
              />
              <path
                d="M249 97.6c35.7 0 67.7 12.3 92.8 36.3l69.6-69.6C373.8 27.6 316.8 0 249 0 150.3 0 65.3 62.5 24 127.8l83.6 65.2C127.5 142 183.2 97.6 249 97.6z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
          <div className='flex mb-4 items-center gap-4 w-full px-5 py-2 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} alt="email" />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className='outline-none bg-transparent'
              type="email"
              placeholder='Email Id'
              required
            />
          </div>
          <div className='flex mb-4 items-center gap-4 w-full px-5 py-2 rounded-full bg-[#333A5C]'>
            <img src={assets.lock_icon} alt="lock" />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className='outline-none bg-transparent'
              type="password"
              placeholder='Password'
              required
            />
          </div>
          <p
            onClick={() => navigate('/reset-password')}
            className='mb-4 cursor-pointer text-indigo-500'
          >
            Forgot Password?
          </p>
          <button
            type='submit'
            className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium'
          >
            Login
          </button>
        </form>
        <p className='text-center mt-4 text-xs text-gray-400'>
          Don’t have an account?{' '}
          <span
            className='text-blue-500 cursor-pointer underline'
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
