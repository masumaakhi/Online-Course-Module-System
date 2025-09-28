// src/components/Navbar.jsx
import React, { useState, useContext, useRef, useEffect } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setIsLoggedIn, setUserData } =
    useContext(AppContext);

  const [profileOpen, setProfileOpen] = useState(false);    // desktop dropdown
  const [mobileOpen, setMobileOpen] = useState(false);      // mobile drawer
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false); // ⬅️ mobile submenu

  // refs
  const profileRef = useRef(null);
  const mobileBtnRef = useRef(null);
  const mobileDrawerRef = useRef(null);

  // outside click guard
  useEffect(() => {
    const onDown = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (mobileOpen) {
        const insideBtn =
          mobileBtnRef.current && mobileBtnRef.current.contains(e.target);
        const insideDrawer =
          mobileDrawerRef.current && mobileDrawerRef.current.contains(e.target);
        if (!insideBtn && !insideDrawer) {
          setMobileOpen(false);
          setMobileProfileOpen(false); // ⬅️ drawer বন্ধ হলে সাবমেনুও বন্ধ
        }
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [mobileOpen]);

  // drawer টগল হলে সাবমেনু রিসেট
  useEffect(() => {
    if (!mobileOpen) setMobileProfileOpen(false);
  }, [mobileOpen]);

  const handleLogout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        `${backendUrl}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      if (data.success) {
        setIsLoggedIn(false);
        setUserData(null);
        toast.success(data.message || "Logged out");
        navigate("/");
      } else {
        toast.error(data.message || "Logout failed");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error.message || "An error occurred"
      );
    }
  };

  // 3D tilt (logo)
  const logoRef = useRef(null);
  const [logoStyle, setLogoStyle] = useState({
    transform: "rotateX(0deg) rotateY(0deg)",
  });
  const handleLogoMove = (e) => {
    const el = logoRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left,
      y = e.clientY - r.top;
    const rx = -((y - r.height / 2) / (r.height / 2)) * 8;
    const ry = ((x - r.width / 2) / (r.width / 2)) * 8;
    setLogoStyle({ transform: `rotateX(${rx}deg) rotateY(${ry}deg)` });
  };
  const resetLogo = () =>
    setLogoStyle({ transform: "rotateX(0deg) rotateY(0deg)" });

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Courses", to: "/courses" },
    { label: "Live Batches", to: "/batches" },
    { label: "Corporate", to: "/corporate" },
    { label: "Pricing", to: "/pricing" },
  ];

  const dashboardPath =
    userData?.role === "admin"
      ? "/admin-dashboard"
      : userData?.role === "instructor"
      ? "/instructor/dashboard"
      : userData?.role === "corporateAdmin"
      ? "/corporate-dashboard"
      : "/dashboard";

  return (
    <header className="sticky top-0 z-40 px-4 sm:px-6 lg:px-8">
      {/* bg video + wash */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <video
          className="w-full h-full object-cover opacity-35 mix-blend-screen"
          autoPlay
          muted
          loop
          playsInline
          src={assets?.nav3d || "/nav-loop.webm"}
        />
        <div className="absolute inset-0 backdrop-blur-md bg-slate-950/40" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_-20%,rgba(217,70,239,0.20),rgba(56,189,248,0.12)_40%,transparent_70%)]" />
      </div>

      {/* bar */}
      <div className="mx-auto max-w-7xl">
        <div className="h-16 flex items-center justify-between border-b border-white/10">
          {/* logo */}
          <div
            ref={logoRef}
            onMouseMove={handleLogoMove}
            onMouseLeave={resetLogo}
            style={{
              ...logoStyle,
              transformStyle: "preserve-3d",
              transition: "transform 160ms ease",
            }}
            className="relative"
          >
            <div
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-400 to-sky-400 shadow-[0_8px_30px_rgba(217,70,239,0.35)] ring-1 ring-white/20 flex items-center justify-center cursor-pointer"
              onClick={() => navigate("/")}
            >
              {assets?.logo ? (
                <img
                  src={assets.logo250}
                  alt="logo"
                  className="w-8 h-8 object-contain drop-shadow"
                />
              ) : (
                <span className="text-slate-900 font-black">S</span>
              )}
            </div>
          </div>

          {/* desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((n) => (
              <button
                key={n.label}
                onClick={() => navigate(n.to)}
                className="relative text-slate-200 hover:text-white transition-colors"
              >
                {n.label}
                <span className="absolute left-0 -bottom-2 h-px w-0 bg-gradient-to-r from-fuchsia-400 via-sky-400 to-emerald-300 transition-all duration-300 group-hover:w-full hover:w-full" />
              </button>
            ))}
          </nav>

          {/* right side */}
          <div className="flex items-center gap-3">
            {/* mobile hamburger */}
            <button
              ref={mobileBtnRef}
              onClick={() => {
                setMobileOpen((s) => !s);
                setProfileOpen(false);
              }}
              className="md:hidden inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/10 border border-white/15 text-slate-200"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-drawer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* profile — desktop only */}
            {userData ? (
              <div ref={profileRef} className="relative hidden md:block">
                <button
                  onClick={() => setProfileOpen((s) => !s)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 text-slate-900 font-semibold hover:bg-white transition"
                  title={userData?.name}
                >
                  {(userData?.name || "U")[0].toUpperCase()}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl overflow-hidden bg-white shadow-xl ring-1 ring-black/5 z-50">
                    <div className="px-4 py-3">
                      <div className="text-sm font-semibold text-slate-900">
                        {userData?.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {userData?.email}
                      </div>
                    </div>
                    <div className="h-px bg-slate-200" />
                    <ul className="py-1 text-sm text-slate-700">
                      <li>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-slate-100"
                          onClick={() => {
                            navigate(dashboardPath);
                            setProfileOpen(false);
                          }}
                        >
                          Dashboard
                        </button>
                      </li>
                      <li>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-slate-100"
                          onClick={() => {
                            navigate("/my-learning");
                            setProfileOpen(false);
                          }}
                        >
                          My Learning
                        </button>
                      </li>
                      {userData?.role === "admin" && (
                        <li>
                          <button
                            className="w-full text-left px-4 py-2 hover:bg-slate-100"
                            onClick={() => {
                              navigate("/admin-dashboard");
                              setProfileOpen(false);
                            }}
                          >
                            Admin Panel
                          </button>
                        </li>
                      )}
                      <li>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-slate-100"
                          onClick={() => {
                            navigate("/profile");
                            setProfileOpen(false);
                          }}
                        >
                          Profile
                        </button>
                      </li>
                    </ul>
                    <div className="h-px bg-slate-200" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center rounded-xl px-4 py-2 border border-white/15 text-slate-200 bg-white/5 hover:bg-white/10"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="inline-flex items-center rounded-xl px-4 py-2 border border-white/15 text-white"
                  style={{
                    background: "linear-gradient(90deg, #f0abfc33, #22d3ee33)",
                  }}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* mobile drawer */}
      <div
        id="mobile-drawer"
        ref={mobileDrawerRef}
        className={`md:hidden transition-[max-height] duration-300 overflow-hidden ${
          mobileOpen ? "max-h-[34rem]" : "max-h-0"
        }`}
      >
        <div className="mx-4 my-3 rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-3 space-y-2">
          {/* Profile header (tap to expand) */}
          {userData && (
            <button
              onClick={() => setMobileProfileOpen((s) => !s)}
              className="w-full flex items-center justify-between rounded-xl bg-white/10 px-3 py-2"
              aria-expanded={mobileProfileOpen}
            >
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-900 font-semibold">
                  {(userData?.name || "U")[0].toUpperCase()}
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-sm font-semibold">{userData?.name}</div>
                  <div className="text-xs text-slate-300 truncate">
                    {userData?.email}
                  </div>
                </div>
              </div>
              {/* caret */}
              <svg
                className={`h-4 w-4 transition-transform ${
                  mobileProfileOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}

          {/* Profile submenu (collapsible) */}
          {userData && (
            <div
              className={`grid gap-2 overflow-hidden transition-[max-height,opacity,margin] duration-300 ${
                mobileProfileOpen ? "max-h-64 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0"
              }`}
            >
              <button
                onClick={() => {
                  navigate(dashboardPath);
                  setMobileOpen(false);
                  setMobileProfileOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-slate-100 hover:bg-white/10"
              >
                Dashboard
              </button>

              {userData?.role === "admin" && (
                <button
                  onClick={() => {
                    navigate("/admin-dashboard");
                    setMobileOpen(false);
                    setMobileProfileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-slate-100 hover:bg-white/10"
                >
                  Admin Panel
                </button>
              )}

              <button
                onClick={() => {
                  navigate("/my-learning");
                  setMobileOpen(false);
                  setMobileProfileOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-slate-100 hover:bg-white/10"
              >
                My Learning
              </button>
              <button
                onClick={() => {
                  navigate("/profile");
                  setMobileOpen(false);
                  setMobileProfileOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-slate-100 hover:bg-white/10"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                  setMobileProfileOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-red-500 hover:bg-red-50/10"
              >
                Logout
              </button>
            </div>
          )}

          {/* primary nav items */}
          {navLinks.map((n) => (
            <button
              key={n.label}
              onClick={() => {
                navigate(n.to);
                setMobileOpen(false);
                setMobileProfileOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-100 hover:bg-white/10"
            >
              {n.label}
            </button>
          ))}

          {/* auth (when not logged in) */}
          {!userData && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  navigate("/login");
                  setMobileOpen(false);
                }}
                className="flex-1 rounded-xl px-4 py-2 border border-white/15 text-slate-200 bg-white/5 hover:bg-white/10"
              >
                Login
              </button>
              <button
                onClick={() => {
                  navigate("/signup");
                  setMobileOpen(false);
                }}
                className="flex-1 rounded-xl px-4 py-2 border border-white/15 text-white"
                style={{
                  background: "linear-gradient(90deg, #f0abfc33, #22d3ee33)",
                }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
