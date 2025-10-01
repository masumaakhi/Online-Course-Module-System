// // src/pages/GoogleSuccess.jsx

// import { useEffect, useContext } from 'react';
// import axios from 'axios';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { AppContext } from '../context/AppContext';
// import { toast } from 'react-toastify';

// const GoogleSuccess = () => {
//   const { backendUrl, setIsLoggedIn, setUserData } = useContext(AppContext);
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const urlParams = new URLSearchParams(location.search);
//         const token = urlParams.get("token");

//         const res = await axios.get(`${backendUrl}/api/auth/google/success?token=${token}`, {
//           withCredentials: true,
//         });

//         if (res.data.success) {
//           setUserData(res.data.user);
//           setIsLoggedIn(true);
//           localStorage.setItem('user', JSON.stringify(res.data.user));
//           toast.success("Google Login successful");
//           navigate('/'); // React-style navigation
//         } else {
//           toast.error("Google login failed");
//         }
//       } catch (error) {
//         console.error('Google login error:', error);
//         toast.error("Login error");
//       }
//     };

//     fetchUser();
//   }, [backendUrl, setUserData, setIsLoggedIn, location.search, navigate]);

//   return <div>Logging in with Google...</div>;
// };

// export default GoogleSuccess;
// src/pages/GoogleSuccess.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function GoogleSuccess() {
  const { search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // URL থেকে 'token' প্যারামিটারটি খুঁজে বের করা
    const token = new URLSearchParams(search).get("token");

    if (token) {
      // টোকেন পাওয়া গেলে localStorage-এ সেভ করা
      localStorage.setItem("token", token);
      
      // ভবিষ্যতের সকল axios রিকোয়েস্টের জন্য হেডার সেট করা
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      
      // ব্যবহারকারীকে হোম পেজে রিডাইরেক্ট করা
      navigate("/", { replace: true });
    } else {
      // টোকেন না পাওয়া গেলে লগইন পেজে ফেরত পাঠানো
      navigate("/login", { replace: true });
    }
  }, [search, navigate]);

  return (
      <div className="min-h-screen grid place-items-center">
          <p>Logging in, please wait...</p>
      </div>
  );
}