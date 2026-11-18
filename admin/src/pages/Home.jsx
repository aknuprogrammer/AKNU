import React from "react";
import {
  InformationCircleIcon,
  ShieldCheckIcon,
  UserIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  DocumentTextIcon,
  MapPinIcon,
  ChartBarIcon,
  CalendarIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { getRoleFromToken, getUserFromToken } from "../ProtectedRoute";
import { iumsLogoNew1 } from "../assets/index.js";
export default function Home() {
  // Get current user info
  const currentUser = getUserFromToken();
  const userRole = getRoleFromToken();

  // User data
  const user = {
    name:
      currentUser?.fullName || localStorage.getItem("name") || "Administrator",
    role: userRole || "Administrator",
    email: currentUser?.email || "N/A",
    campus: "University Headquarters",
  };

  const isSuperAdmin = userRole === "super_admin";

  const features = [
    { name: "Employee Management System (EMS)", icon: UserIcon },
    { name: "Student Information Management", icon: AcademicCapIcon },
    { name: "Examination Management", icon: DocumentTextIcon },
    { name: "Admission Processing", icon: BuildingLibraryIcon },
    { name: "Letter Head Management", icon: DocumentTextIcon },
    { name: "Faculty Tracking System", icon: MapPinIcon },
    { name: "Holiday Calendar Management", icon: CalendarIcon },
    { name: "Real-time Analytics and Reporting", icon: ChartBarIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Hero Section with Gradient */}
      <div className="relative bg-gradient-to-r from-[#525B88] via-[#636c9a] to-[#525B88] text-white py-12 px-6 rounded-b-3xl shadow-xl mb-8">
        <div className="absolute inset-0 bg-black opacity-10 rounded-b-3xl"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 flex items-center">
                <SparklesIcon className="h-10 w-10 mr-3 text-yellow-300" />
                Welcome to iUMS
              </h1>
              <p className="text-xl text-blue-100">
                Integrated University Management System
              </p>
              <p className="text-sm text-blue-200 mt-2">
                Streamlining your educational institute day to day operations
                with cutting-edge technology
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <img
                  src={iumsLogoNew1}
                  alt="iumsLogo"
                  className="max-w-40 max-h-40 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-8">
        {/* Quick Stats Section - Moved to Top */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-[#525B88] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-[#525B88]/10 p-3 rounded-lg">
                <UserIcon className="h-8 w-8 text-[#525B88]" />
              </div>
              <span className="text-3xl font-bold text-[#525B88]">∞</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              System Users
            </h3>
            <p className="text-sm text-gray-500">Active and managed</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-emerald-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-100 p-3 rounded-lg">
                <AcademicCapIcon className="h-8 w-8 text-emerald-600" />
              </div>
              <span className="text-3xl font-bold text-emerald-600">8+</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Modules
            </h3>
            <p className="text-sm text-gray-500">Integrated systems</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-blue-600">24/7</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Analytics
            </h3>
            <p className="text-sm text-gray-500">Real-time insights</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <CalendarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-purple-600">✓</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Support
            </h3>
            <p className="text-sm text-gray-500">Always available</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* About Product Section - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-[#525b88] to-[#636c9a] p-3 rounded-xl mr-4">
                  <InformationCircleIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    About Product
                  </h2>
                  <p className="text-sm text-gray-500">
                    Comprehensive University Management Solution
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-l-4 border-[#525b88]">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    <strong className="text-gray-900 text-xl">
                      iUMS (Integrated University Management System)
                    </strong>{" "}
                    is a comprehensive administrative platform designed to
                    streamline and manage all aspects of university operations.
                    This system provides a centralized solution for managing
                    employees, students, examinations, admissions, and various
                    administrative tasks with real-time analytics and reporting
                    capabilities.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <AcademicCapIcon className="h-6 w-6 text-[#525b88] mr-2" />
                    Key Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.map((feature, index) => {
                      const IconComponent = feature.icon;
                      return (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group"
                        >
                          <div className="bg-[#525b88] p-2 rounded-lg group-hover:scale-110 transition-transform">
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 pt-1">
                            {feature.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                      <p className="text-sm font-semibold text-gray-800">
                        Version 1.0.0
                      </p>
                    </div>
                    {/* <p className="text-xs text-gray-500">
                      © {new Date().getFullYear()} AKNU. All rights reserved.
                    </p> */}
                  </div>
                  {/* <div className="flex items-center space-x-2 bg-gradient-to-r from-[#525b88] to-[#636c9a] text-white px-4 py-2 rounded-lg">
                    <BuildingLibraryIcon className="h-5 w-5" />
              
                  </div> */}
                </div>
              </div>
            </div>
          </div>

          {/* Super Admin / Admin Information Section - Takes 1 column */}
          <div className="lg:col-span-1">
            <div
              className={`bg-gradient-to-br ${
                isSuperAdmin
                  ? "from-emerald-500 to-teal-600"
                  : "from-blue-500 to-indigo-600"
              } rounded-2xl shadow-xl p-6 text-white relative overflow-hidden`}
            >
              {/* Decorative background pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="bg-white/20 backdrop-blur-lg p-3 rounded-xl mr-3">
                    {isSuperAdmin ? (
                      <ShieldCheckIcon className="h-8 w-8 text-white" />
                    ) : (
                      <UserIcon className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {isSuperAdmin ? "Super Admin" : "Admin"}
                    </h2>
                    <p className="text-sm text-white/80">Information</p>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center border-2 border-white/30">
                      <span className="text-white text-2xl font-bold">
                        {user.name?.charAt(0)?.toUpperCase() ||
                          (isSuperAdmin ? "SA" : "A")}
                      </span>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">
                        {user.name}
                      </p>
                      <p className="text-sm text-white/80 capitalize">
                        {user.role?.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/90 flex items-center">
                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                        Email
                      </span>
                      <span className="text-sm font-medium text-white truncate ml-2">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/90 flex items-center">
                        <BuildingLibraryIcon className="h-4 w-4 mr-2" />
                        Campus
                      </span>
                      <span className="text-sm font-medium text-white">
                        {user.campus}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-lg rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/90 flex items-center">
                        <ShieldCheckIcon className="h-4 w-4 mr-2" />
                        Access
                      </span>
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-white/30 text-white">
                        {isSuperAdmin ? "Full Access" : "Admin Access"}
                      </span>
                    </div>
                  </div>
                </div>

                {isSuperAdmin && (
                  <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                    <p className="text-xs text-white/90 leading-relaxed">
                      <strong className="font-bold text-white">
                        Super Admin Privileges:
                      </strong>{" "}
                      Complete access to all system modules, administrative
                      functions, user management, and system configurations.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
