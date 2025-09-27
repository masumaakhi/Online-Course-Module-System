// src/components/AuthGate.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function AuthGate() {
  const { search, pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const t = params.get("token");
    if (t) {
      localStorage.setItem("token", t);
      axios.defaults.headers.common.Authorization = `Bearer ${t}`;
      navigate(pathname, { replace: true }); // URL থেকে ?token সরিয়ে দাও
    }
  }, [search, pathname, navigate]);

  return null;
}
