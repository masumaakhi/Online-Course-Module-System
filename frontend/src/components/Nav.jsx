import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Nav = () => {
  const navigate = useNavigate();
  const appContext = useContext(AppContext);
  const { userData, backendUrl, setIsLoggedIn, setUserData } = appContext || {};
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        setIsLoggedIn(false);
        setUserData(null);
        navigate("/");
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md  border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl my-5 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => navigate("/")}
              className="text-2xl font-bold text-white hover:text-blue-400 transition-colors"
            >
              SkillSync
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button
                onClick={() => navigate("/")}
                className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => navigate("/courses")}
                className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Courses
              </button>
              <button
                onClick={() => navigate("/batches")}
                className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Live Batches
              </button>
              <button
                onClick={() => navigate("/corporate")}
                className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
              >
                Corporate
              </button>
            </div>
          </div>

          {/* Auth Section */}
          <div className="hidden md:block">
            {userData ? (
              <div className="flex items-center space-x-4">
                <span className="text-slate-300 text-sm">
                  Welcome, {userData.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate("/login")}
                  className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-300 hover:text-white p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-800/95 backdrop-blur-md">
            <button
              onClick={() => {
                navigate("/");
                setIsMenuOpen(false);
              }}
              className="text-slate-300 hover:text-white block px-3 py-2 text-base font-medium w-full text-left"
            >
              Home
            </button>
            <button
              onClick={() => {
                navigate("/courses");
                setIsMenuOpen(false);
              }}
              className="text-slate-300 hover:text-white block px-3 py-2 text-base font-medium w-full text-left"
            >
              Courses
            </button>
            <button
              onClick={() => {
                navigate("/batches");
                setIsMenuOpen(false);
              }}
              className="text-slate-300 hover:text-white block px-3 py-2 text-base font-medium w-full text-left"
            >
              Live Batches
            </button>
            <button
              onClick={() => {
                navigate("/corporate");
                setIsMenuOpen(false);
              }}
              className="text-slate-300 hover:text-white block px-3 py-2 text-base font-medium w-full text-left"
            >
              Corporate
            </button>
            {userData ? (
              <div className="pt-4 border-t border-slate-700">
                <div className="px-3 py-2 text-slate-300 text-sm">
                  Welcome, {userData.name}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white block px-3 py-2 text-base font-medium w-full text-left rounded-lg mt-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-700 space-y-2">
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsMenuOpen(false);
                  }}
                  className="text-slate-300 hover:text-white block px-3 py-2 text-base font-medium w-full text-left"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    navigate("/signup");
                    setIsMenuOpen(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white block px-3 py-2 text-base font-medium w-full text-left rounded-lg"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Nav;
