// src/context/AppContext.jsx

import { createContext, useState , useEffect} from "react";
import axios from 'axios';
import { toast } from "react-toastify";


export const AppContext = createContext();

export const AppContextProvider = (props) => {

  const backendUrl = process.env.NODE_ENV === 'production'
  ? 'https://online-course-module.onrender.com' // প্রোডাকশনে এই URL ব্যবহৃত হবে
  : 'http://localhost:5250';              // লোকালে এই URL ব্যবহৃত হবে
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);


//User tar data dekhte pabe
 const getUserData = async () => {
  try {
    const { data } = await axios.get(backendUrl + '/api/user/data', {
      withCredentials: true // যদি cookie-based token হয় : true
    });

    if (data?.success) {
      setUserData(data.userData);
      setIsLoggedIn(true);
      if (data.userData.role === "admin") {
        fetchAllUsers();
      }
    } else {
      // unauthorized / invalid session হলে কোনো toast বা console কিছুই দেখাবো না
      setIsLoggedIn(false);
      setUserData(null);
    }
  } catch (error) {
    // 401 মানে user লগইন করা নেই বা token invalid – silently ignore
    if (error.response && error.response.status === 401) {
      setIsLoggedIn(false);
      setUserData(null);
      return;
    }

    const msg = error.response?.data?.message || error.message || "Failed to load user data";
    toast.error(msg);
  }
};

//admin user data access korbe
const fetchAllUsers = async () => {
  try {
    const { data } = await axios.get(backendUrl + '/api/admin/users', {
      withCredentials: true // যদি cookie-based token হয়
    });
    if (data.success) {
      setAllUsers(data.users);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error("Failed to fetch users: " + error.message);
  }
};

useEffect(() => {
  getUserData();  // auto login if cookie/session valid
}, []);

    const value = {
        backendUrl,
        isLoggedIn,
        setIsLoggedIn,
        userData,
        setUserData,
        getUserData,
        allUsers,
        fetchAllUsers,
        setAllUsers
     //    getAuth
    };

     return (
          <AppContext.Provider value={value}>
               {props.children}
          </AppContext.Provider>
     )
}