import { useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";

export default function AuthGate() {
  const { getUserData } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      // 1) token save + axios header এ বসানো
      localStorage.setItem("token", token);
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;

      // 2) URL পরিষ্কার (token কুয়েরি সরিয়ে দাও)
      params.delete("token");
      const search = params.toString();
      navigate(
        { pathname: location.pathname, search: search ? `?${search}` : "" },
        { replace: true }
      );

      // 3) কনটেক্সটে ইউজার ডেটা রিফ্রেশ
      getUserData?.();
    }
  }, [location.search, getUserData, navigate, location.pathname]);

  return null; // UI দরকার নেই
}
