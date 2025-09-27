// src/App.jsx
import React, { useEffect } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthGate from "./components/AuthGate";   // ⬅️ new

function App() {
useEffect(() => {
  axios.defaults.withCredentials = true;

  const id = axios.interceptors.request.use((config) => {
    const t = localStorage.getItem("token");
    if (t) config.headers.Authorization = `Bearer ${t}`;
    return config;
  });

  // app reload হলেও default header থাক
  const t = localStorage.getItem("token");
  if (t) axios.defaults.headers.common.Authorization = `Bearer ${t}`;

  return () => axios.interceptors.request.eject(id);
}, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0a1128] text-slate-100">
      <AuthGate />            {/* ⬅️ URL ?token ধরবে */}
      <Navbar />
      <main className="flex-1">
        <Outlet />
        <ScrollRestoration />
      </main>
      <Footer />
      <ToastContainer position="top-right" />
    </div>
  );
}
export default App;
