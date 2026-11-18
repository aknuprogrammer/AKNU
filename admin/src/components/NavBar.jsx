import React, { useEffect, useState, useRef } from "react";
import { UserCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { aknuLogoNew, aknuadikavi } from "../assets/index.js";

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

export default function NavBar({ onLogout }) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const timerRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const logoutNow = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    if (onLogout) onLogout();
    navigate("/login-page", { replace: true });
  };

  const resetInactivityTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      logoutNow(); // Logout after 30 mins of no activity
    }, INACTIVITY_LIMIT);
  };

  // Handle user inactivity
  useEffect(() => {
    const activityEvents = ["mousemove", "keydown", "scroll", "click"];

    const handleActivity = () => {
      resetInactivityTimer();
    };

    if (localStorage.getItem("token")) {
      resetInactivityTimer();
      activityEvents.forEach((event) =>
        window.addEventListener(event, handleActivity)
      );
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      activityEvents.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
    };
  }, []);

  // Redirect to login if token not found on load
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      if (onLogout) onLogout();
      navigate("/login-page", { replace: true });
    }
  }, [navigate, onLogout]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logoutNow();
  };

  return (
    <div className="bg-[#525B88] flex items-center justify-between px-3 sm:px-4 md:px-6 shadow-lg py-4 relative">
      {/* Left spacer - ensures center content is centered, accounts for hamburger menu */}
      <div className="w-10 sm:w-12 md:w-0 lg:w-0"></div>

      {/* Center Content - University Info */}
      <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 flex-1 justify-center">
        <img
          src={aknuLogoNew}
          alt="Logo"
          className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 object-contain flex-shrink-0"
        />
        <div className="flex flex-col items-center text-center px-1 sm:px-2 gap-0.5 sm:gap-1">
          <span className="text-[#FCC203] font-semibold text-[9px] xs:text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg leading-tight">
            ADIKAVI NANNAYA UNIVERSITY
          </span>
          <span className="block text-white text-[5px] xs:text-[6px] sm:text-[8px] md:text-xs lg:text-sm font-normal leading-tight">
            RAJAMAHENDRAVARAM, ANDHRA PRADESH INDIA - 533296
          </span>
        </div>
        <img
          src={aknuadikavi}
          alt="Logo"
          className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 object-contain flex-shrink-0"
        />
      </div>

      {/* Right - Profile Button */}
      <div className="relative w-10 sm:w-12 md:w-auto">
        <button
          onClick={toggleDropdown}
          className="flex items-center justify-center sm:space-x-2 bg-white text-[#525B88] px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full hover:bg-gray-200 transition-all w-full sm:w-auto"
        >
          <UserCircle className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="hidden md:inline ml-0 sm:ml-0 md:ml-2">Profile</span>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 z-50">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-all"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
