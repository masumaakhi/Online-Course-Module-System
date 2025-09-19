

// src/App.jsx
import React, { useEffect } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

function App() {
  useEffect(() => {
    axios.defaults.withCredentials = true; // set once for all requests
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0a1128] text-slate-100">
      {/* Shared Navbar */}
       <Navbar />

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
        <ScrollRestoration />
      </main>

      {/* Shared Footer */}
      <Footer />
      {/* Global toasts */}
      <ToastContainer position="top-right" />
    </div>
  );
}

export default App;
