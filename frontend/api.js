import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? 'https://my-mern-backend.onrender.com' // আপনার লাইভ ব্যাকএন্ড URL
    : 'http://localhost:5000',
  withCredentials: true // সব রিকোয়েস্টের সাথে কুকি পাঠানোর জন্য
});

export default API;