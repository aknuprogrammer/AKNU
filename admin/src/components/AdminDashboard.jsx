import React from "react";
import {
  UserGroupIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
 // DownloadIcon,
  BuildingLibraryIcon,
  ChartBarIcon,
  CakeIcon,
  IdentificationIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  // User data
  const user = {
    name: "Dr. Rajesh Kumar",
    role: "Administrator",
    campus: "University Headquarters"
  };

  // Date filter options
  const dateFilters = ["Today", "Week", "Month", "Quarter", "Year", "Custom"];

  // Campus data
  const campuses = ["Rajamahendravaram", "Tadepalligudem", "Kakinada", "Vizianagaram"];

  // Employee stats by campus
  const employeeStats = [
    {
      campus: "Rajamahendravaram",
      total: 320,
      present: 280,
      absent: 40,
      late: 15,
      leaveRequests: 8
    },
    {
      campus: "Tadepalligudem",
      total: 210,
      present: 185,
      absent: 25,
      late: 10,
      leaveRequests: 5
    },
    {
      campus: "Kakinada",
      total: 240,
      present: 215,
      absent: 25,
      late: 8,
      leaveRequests: 7
    },
    {
      campus: "Vizianagaram",
      total: 180,
      present: 160,
      absent: 20,
      late: 5,
      leaveRequests: 3
    }
  ];

  // Student stats by campus
  const studentStats = [
    {
      campus: "Rajamahendravaram",
      total: 4200,
      present: 3800,
      absent: 400,
      late: 120,
      leaveRequests: 45
    },
    {
      campus: "Tadepalligudem",
      total: 2800,
      present: 2500,
      absent: 300,
      late: 80,
      leaveRequests: 30
    },
    {
      campus: "Kakinada",
      total: 3500,
      present: 3200,
      absent: 300,
      late: 95,
      leaveRequests: 40
    },
    {
      campus: "Vizianagaram",
      total: 1900,
      present: 1700,
      absent: 200,
      late: 60,
      leaveRequests: 25
    }
  ];

  // Student growth data
  const studentGrowthData = {
    labels: ["2019", "2020", "2021", "2022", "2023"],
    datasets: [
      {
        label: "Total Students",
        data: [8500, 9200, 9800, 11200, 12400],
        borderColor: "#525b88",
        backgroundColor: "#525b88",
        tension: 0.3
      }
    ]
  };

  // Attendance trend data
  const attendanceTrendData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        label: "Rajamahendravaram",
        data: [92, 91, 93, 90, 89, 85],
        borderColor: "#525b88",
        backgroundColor: "transparent",
        tension: 0.1
      },
      {
        label: "Tadepalligudem",
        data: [89, 90, 88, 87, 86, 82],
        borderColor: "#4CAF50",
        backgroundColor: "transparent",
        tension: 0.1
      },
      {
        label: "Kakinada",
        data: [91, 92, 90, 89, 88, 84],
        borderColor: "#FF9800",
        backgroundColor: "transparent",
        tension: 0.1
      }
    ]
  };

  // Department distribution data
  const departmentData = {
    labels: ["Engineering", "Medicine", "Arts", "Science", "Commerce", "Law"],
    datasets: [
      {
        data: [320, 280, 150, 180, 120, 80],
        backgroundColor: [
          "#525b88",
          "#4CAF50",
          "#FF9800",
          "#9C27B0",
          "#2196F3",
          "#F44336"
        ]
      }
    ]
  };

  // Courses by enrollment data
  const coursesData = {
    labels: ["B.Tech", "MBBS", "B.Sc", "B.Com", "BA", "LLB"],
    datasets: [
      {
        label: "Enrolled Students",
        data: [4200, 2800, 1800, 1500, 1200, 800],
        backgroundColor: "#525b88"
      }
    ]
  };

  // College status data
  const collegeStatusData = {
    labels: ["Active", "Inactive", "Under Review"],
    datasets: [
      {
        data: [8, 2, 1],
        backgroundColor: ["#4CAF50", "#F44336", "#FF9800"]
      }
    ]
  };

  // District-wise enrollment data
  const districtData = {
    labels: ["East Godavari", "West Godavari", "Kakinada", "Vizianagaram", "Visakhapatnam"],
    datasets: [
      {
        label: "Students",
        data: [6500, 3200, 2800, 1900, 2500],
        backgroundColor: "#525b88"
      }
    ]
  };

  // Gender ratio data
  const genderData = {
    labels: ["Male", "Female", "Other"],
    datasets: [
      {
        data: [7200, 5000, 200],
        backgroundColor: ["#2196F3", "#E91E63", "#9E9E9E"]
      }
    ]
  };

  // Events data
  const events = [
    { name: "Tech Symposium", registered: 245, approved: 220 },
    { name: "Cultural Fest", registered: 320, approved: 300 },
    { name: "Sports Day", registered: 180, approved: 170 },
    { name: "Science Fair", registered: 150, approved: 140 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#525B88]">University Dashboard</h1>
         
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border">
            <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
            <select className="bg-transparent outline-none text-sm">
              {dateFilters.map((filter, index) => (
                <option key={index} value={filter}>{filter}</option>
              ))}
            </select>
          </div>
          <button className="flex items-center bg-[#525B88] text-white px-4 py-2 rounded-lg shadow-sm hover:bg-[#424a70] transition">
            {/* <DownloadIcon className="h-5 w-5 mr-2" /> */}
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#525B88]">
          <div className="flex items-center">
            <UserGroupIcon className="h-6 w-6 text-[#525B88] mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Employees</p>
              <p className="text-xl font-bold">{employeeStats.reduce((sum, campus) => sum + campus.total, 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
          <div className="flex items-center">
            <UserIcon className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Absent Today</p>
              <p className="text-xl font-bold">{employeeStats.reduce((sum, campus) => sum + campus.absent, 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center">
            <ClockIcon className="h-6 w-6 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Late Arrivals</p>
              <p className="text-xl font-bold">{employeeStats.reduce((sum, campus) => sum + campus.late, 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center">
            <DocumentTextIcon className="h-6 w-6 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Leave Approvals</p>
              <p className="text-xl font-bold">{employeeStats.reduce((sum, campus) => sum + campus.leaveRequests, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#525B88]">
          <div className="flex items-center">
            <UserGroupIcon className="h-6 w-6 text-[#525B88] mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-xl font-bold">{studentStats.reduce((sum, campus) => sum + campus.total, 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
          <div className="flex items-center">
            <UserIcon className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Absent Today</p>
              <p className="text-xl font-bold">{studentStats.reduce((sum, campus) => sum + campus.absent, 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center">
            <ClockIcon className="h-6 w-6 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Late Arrivals</p>
              <p className="text-xl font-bold">{studentStats.reduce((sum, campus) => sum + campus.late, 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center">
            <DocumentTextIcon className="h-6 w-6 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Leave Approvals</p>
              <p className="text-xl font-bold">{studentStats.reduce((sum, campus) => sum + campus.leaveRequests, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campus-wise Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Employee Stats by Campus */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <UserGroupIcon className="h-5 w-5 text-[#525b88] mr-2" />
            Employee Statistics by Campus
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campus</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Req.</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employeeStats.map((campus, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{campus.campus}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campus.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campus.present}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campus.absent}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campus.late}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campus.leaveRequests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Stats by Campus */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <AcademicCapIcon className="h-5 w-5 text-[#525b88] mr-2" />
            Student Statistics by Campus
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campus</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Req.</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentStats.map((campus, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{campus.campus}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campus.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campus.present}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campus.absent}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campus.late}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campus.leaveRequests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Student Growth */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 text-[#525b88] mr-2" />
            Student Growth (Year over Year)
          </h2>
          <div className="h-64">
            <Line
              data={studentGrowthData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Attendance Trend */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 text-[#525b88] mr-2" />
            Weekly Attendance Trend
          </h2>
          <div className="h-64">
            <Line
              data={attendanceTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Department Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <BuildingLibraryIcon className="h-5 w-5 text-[#525b88] mr-2" />
            Faculty Department Distribution
          </h2>
          <div className="h-64">
            <Pie
              data={departmentData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Courses by Enrollment */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <IdentificationIcon className="h-5 w-5 text-[#525b88] mr-2" />
            Courses by Enrollment
          </h2>
          <div className="h-64">
            <Bar
              data={coursesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* College Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <CakeIcon className="h-5 w-5 text-[#525b88] mr-2" />
            College Status Distribution
          </h2>
          <div className="h-64">
            <Pie
              data={collegeStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Third Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* District-wise Enrollment */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <MapPinIcon className="h-5 w-5 text-[#525b88] mr-2" />
            District-wise Student Enrollment
          </h2>
          <div className="h-64">
            <Bar
              data={districtData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Gender Ratio */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <UserIcon className="h-5 w-5 text-[#525b88] mr-2" />
            University Gender Ratio
          </h2>
          <div className="h-64">
            <Pie
              data={genderData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <CalendarIcon className="h-5 w-5 text-[#525b88] mr-2" />
          Upcoming Events
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.registered}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.approved}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${event.registered === event.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {event.registered === event.approved ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}