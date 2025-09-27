// src/pages/AuthLanding.jsx
import { useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";

export default function AuthLanding() {
  const { getUserData } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("auth_token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    // cookie থাকলে/না থাকলে – দুক্ষেত্রেই ইউজার ডেটা রিফ্রেশ
    getUserData().finally(() => navigate("/", { replace: true }));
  }, [location.search, getUserData, navigate]);

  return <div className="min-h-screen grid place-items-center">Finishing login…</div>;
}
