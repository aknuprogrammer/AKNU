import React, { useState, useEffect, useRef } from "react";
import { useFormHook } from "../../Hooks/FormHook";
import { API } from "../../config/urls";
import { showAxiosError, showSuccessMessage } from "../../config/Toast";
import {
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Eye, Plus, Download } from "lucide-react";
import { z } from "zod";
import * as XLSX from "xlsx";
import { jwtDecode } from "jwt-decode";

// Validation schema for timesheet form
const timesheetSchema = z.object({
  employeeName: z.string().min(1, "Employee Name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  date: z.string().min(1, "Date is required"),
  inTime: z.string().min(1, "In Time is required"),
  outTime: z.string().min(1, "Out Time is required"),
  breakMinutes: z
    .string()
    .min(1, "Break (minutes) is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Break must be a valid number",
    }),
  status: z.string().min(1, "Status is required"),
  subject: z.string().min(1, "Subject is required"),
  chapter: z.string().min(1, "Chapter is required"),
  task: z.string().min(1, "Task is required"),
  hours: z
    .string()
    .min(1, "Hours is required")
    .refine(
      (val) => {
        // Accept HH:MM format (e.g., "7:30", "1:20")
        if (typeof val === "string" && val.includes(":")) {
          const [hours, minutes] = val.split(":");
          return (
            !isNaN(Number(hours)) &&
            !isNaN(Number(minutes)) &&
            Number(hours) >= 0 &&
            Number(minutes) >= 0 &&
            Number(minutes) < 60
          );
        }
        // Also accept decimal format for backward compatibility
        return !isNaN(Number(val)) && Number(val) >= 0;
      },
      {
        message: "Hours must be in HH:MM format (e.g., 7:30) or a valid number",
      }
    ),
});

export default function Timesheet() {
  const { FormWrapper, errors, register, reset, setValue, watch } = useFormHook(
    {
      validation: timesheetSchema,
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timesheetList, setTimesheetList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [userEmployeeId, setUserEmployeeId] = useState(null);
  const [userEmployeeName, setUserEmployeeName] = useState("");
  const [userRole, setUserRole] = useState(null);

  // Fetch employee by username (from login credentials)
  const fetchEmployeeByUsername = async (username) => {
    try {
      // First try to get from profile API
      try {
        const profileResp = await API.get("/login/profile");
        if (profileResp.data?.employeeId || profileResp.data?.employeeID) {
          const empId =
            profileResp.data.employeeId || profileResp.data.employeeID;
          setUserEmployeeId(empId);
          const name =
            profileResp.data.fullName ||
            profileResp.data.name ||
            `${profileResp.data.firstName || ""} ${
              profileResp.data.lastName || ""
            }`.trim();
          setUserEmployeeName(name);
          return;
        }
      } catch (profileError) {
        console.log(
          "Profile API failed, trying onboarding data:",
          profileError
        );
      }

      // If profile API doesn't work, try onboarding data
      const resp = await API.get("/employee/onboarding");
      const employees = resp.data.data || resp.data || [];
      console.log("All employees from onboarding:", employees);

      // Find employee by username (which should match the login username)
      const employee = employees.find((emp) => {
        // Check if username matches any credential field
        const empUsername = emp.username || emp.user?.username;
        return empUsername === username;
      });

      if (employee) {
        const empId = employee.employeeId || employee.employeeID;
        const fullName = `${employee.firstName || ""} ${
          employee.lastName || ""
        }`.trim();
        setUserEmployeeId(empId);
        setUserEmployeeName(fullName || employee.employeeName || "");
      } else {
        console.warn("Employee not found by username in onboarding data");
      }
    } catch (error) {
      console.error("Error fetching employee by username:", error);
    }
  };

  // Fetch employee details from onboarding by employeeId
  const fetchEmployeeDetails = async (employeeId) => {
    try {
      console.log("Fetching employee details for ID:", employeeId);
      const resp = await API.get("/employee/onboarding");
      const employees = resp.data.data || resp.data || [];
      console.log("All employees:", employees);
      const employee = employees.find(
        (emp) => (emp.employeeId || emp.employeeID) === employeeId
      );
      console.log("Found employee:", employee);
      if (employee) {
        const fullName = `${employee.firstName || ""} ${
          employee.lastName || ""
        }`.trim();
        const nameToSet = fullName || employee.employeeName || "";
        console.log("Setting employee name to:", nameToSet);
        setUserEmployeeName(nameToSet);
      } else {
        console.warn("Employee not found in onboarding data");
        // Try to get name from token as fallback
        try {
          const token = localStorage.getItem("token");
          if (token) {
            const decoded = jwtDecode(token);
            setUserEmployeeName(decoded.name || decoded.fullName || "");
          }
        } catch (err) {
          console.error("Error getting name from token:", err);
        }
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
      // If API fails, try to get name from token
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const decoded = jwtDecode(token);
          setUserEmployeeName(decoded.name || decoded.fullName || "");
        }
      } catch (err) {
        console.error("Error getting name from token:", err);
      }
    }
  };

  // Get user employee ID, name, and role from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Full decoded token:", decoded);

        // Get role from token
        setUserRole(decoded.role);

        // Get employeeId and name from decoded.user object
        if (decoded.user) {
          const employeeId = decoded.user.employeeId || decoded.user.employeeID;
          const fullName =
            decoded.user.fullName ||
            `${decoded.user.firstName || ""} ${
              decoded.user.lastName || ""
            }`.trim() ||
            decoded.user.name ||
            "";

          console.log("EmployeeId from token.user:", employeeId);
          console.log("FullName from token.user:", fullName);

          if (employeeId) {
            setUserEmployeeId(employeeId);
          }
          if (fullName) {
            setUserEmployeeName(fullName);
          }
        } else {
          // Fallback: try to get from profile API or onboarding data
          const username = decoded.role || decoded.username;
          console.log("Username from token:", username);

          if (username) {
            fetchEmployeeByUsername(username);
          }
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Fetch timesheet data
  const fetchTimesheetData = async () => {
    setLoading(true);
    try {
      const resp = await API.get("/timesheet");
      console.log("53", resp.data);
      let data = resp.data.data || resp.data || [];

      // Filter by logged-in user's employeeId (only for non-admin roles)
      if (
        userEmployeeId &&
        userRole !== "super_admin" &&
        userRole !== "admin"
      ) {
        data = data.filter(
          (item) => (item.employeeId || item.employeeID) === userEmployeeId
        );
      }

      setTimesheetList(data);
    } catch (error) {
      showAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data when userEmployeeId is available OR when role is admin/super_admin
    if (
      userEmployeeId !== null ||
      userRole === "super_admin" ||
      userRole === "admin"
    ) {
      fetchTimesheetData();
    }
  }, [userEmployeeId, userRole]);

  // Populate form fields when form opens and employee details are available (only for non-admin roles)
  useEffect(() => {
    if (
      showForm &&
      userEmployeeId &&
      userRole !== "super_admin" &&
      userRole !== "admin"
    ) {
      setValue("employeeId", userEmployeeId);
      if (userEmployeeName) {
        setValue("employeeName", userEmployeeName);
      }
    }
  }, [showForm, userEmployeeId, userEmployeeName, userRole, setValue]);

  // Filter timesheet data based on search query and date range
  useEffect(() => {
    let filtered = timesheetList;

    // Apply search query filter (similar to onboarding)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((record) => {
        const employeeName = (record.employeeName || "").toLowerCase();
        const employeeId = (
          record.employeeId ||
          record.employeeID ||
          ""
        ).toLowerCase();
        const subject = (record.subject || "").toLowerCase();
        const status = (record.status || "").toLowerCase();
        const chapter = (record.chapter || "").toLowerCase();
        const task = (record.task || "").toLowerCase();

        return (
          employeeName.includes(query) ||
          employeeId.includes(query) ||
          subject.includes(query) ||
          status.includes(query) ||
          chapter.includes(query) ||
          task.includes(query)
        );
      });
    }

    // Apply date range filter
    if (fromDate) {
      filtered = filtered.filter((record) => {
        const recordDate = record.date ? record.date.split("T")[0] : "";
        return recordDate >= fromDate;
      });
    }

    if (toDate) {
      filtered = filtered.filter((record) => {
        const recordDate = record.date ? record.date.split("T")[0] : "";
        return recordDate <= toDate;
      });
    }

    setFilteredList(filtered);
  }, [timesheetList, searchQuery, fromDate, toDate]);

  // Calculate hours from inTime, outTime, and breakMinutes - returns HH:MM format
  const calculateHours = (inTime, outTime, breakMinutes) => {
    if (!inTime || !outTime) {
      return "";
    }

    try {
      // Convert time strings (HH:MM) to minutes
      const [inHours, inMins] = inTime.split(":").map(Number);
      const [outHours, outMins] = outTime.split(":").map(Number);

      const inTotalMinutes = inHours * 60 + inMins;
      const outTotalMinutes = outHours * 60 + outMins;

      // Calculate difference in minutes
      let diffMinutes = outTotalMinutes - inTotalMinutes;

      // Handle case where outTime is next day (e.g., night shift)
      if (diffMinutes < 0) {
        diffMinutes += 24 * 60; // Add 24 hours
      }

      // Subtract break minutes
      const breakMins = Number(breakMinutes) || 0;
      const workMinutes = diffMinutes - breakMins;

      // Convert to HH:MM format
      if (workMinutes < 0) {
        return "0:00";
      }

      const hours = Math.floor(workMinutes / 60);
      const minutes = workMinutes % 60;
      return `${hours}:${minutes.toString().padStart(2, "0")}`;
    } catch (error) {
      console.error("Error calculating hours:", error);
      return "";
    }
  };

  // Use ref to track if we're updating from calculation (to prevent infinite loops)
  const isCalculatingRef = useRef(false);

  // Watch for changes in inTime, outTime, and breakMinutes to auto-calculate hours
  const inTime = watch("inTime");
  const outTime = watch("outTime");
  const breakMinutes = watch("breakMinutes");

  useEffect(() => {
    // Only calculate if we have both inTime and outTime, and we're not already calculating
    if (!isCalculatingRef.current && inTime && outTime) {
      isCalculatingRef.current = true;
      const calculatedHours = calculateHours(
        inTime,
        outTime,
        breakMinutes || "0"
      );
      if (calculatedHours) {
        setValue("hours", calculatedHours, { shouldValidate: false });
      }
      // Reset flag after a short delay to allow state to update
      setTimeout(() => {
        isCalculatingRef.current = false;
      }, 0);
    }
  }, [inTime, outTime, breakMinutes, setValue]);

  // Convert HH:MM format to decimal hours for API
  const convertHoursToDecimal = (hoursString) => {
    if (!hoursString || typeof hoursString !== "string") {
      return 0;
    }
    try {
      // Check if it's in HH:MM format
      if (hoursString.includes(":")) {
        const [hours, minutes] = hoursString.split(":").map(Number);
        return hours + (minutes || 0) / 60;
      }
      // If it's already a number, return it
      return Number(hoursString) || 0;
    } catch (error) {
      return 0;
    }
  };

  // Export filtered timesheet data to Excel
  const handleExportToExcel = () => {
    if (filteredList.length === 0) {
      showAxiosError({ response: { data: { message: "No data to export" } } });
      return;
    }

    try {
      // Prepare data for Excel export
      const excelData = filteredList.map((item, index) => ({
        "S.No": index + 1,
        "Employee Name": item.employeeName || "-",
        "Employee ID": item.employeeId || item.employeeID || "-",
        Date: item.date ? item.date.split("T")[0] : "-",
        "In Time": item.inTime || "-",
        "Out Time": item.outTime || "-",
        "Break (minutes)": item.breakMinutes ?? "-",
        Hours: formatHoursForDisplay(item.hours),
        Status: item.status
          ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
          : "-",
        Subject: item.subject || "-",
        Chapter: item.chapter || "-",
        Task: item.task || "-",
      }));

      // Create a new workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Timesheet");

      // Set column widths for better readability
      const columnWidths = [
        { wch: 6 }, // S.No
        { wch: 20 }, // Employee Name
        { wch: 15 }, // Employee ID
        { wch: 12 }, // Date
        { wch: 10 }, // In Time
        { wch: 10 }, // Out Time
        { wch: 15 }, // Break (minutes)
        { wch: 10 }, // Hours
        { wch: 12 }, // Status
        { wch: 20 }, // Subject
        { wch: 20 }, // Chapter
        { wch: 30 }, // Task
      ];
      worksheet["!cols"] = columnWidths;

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `Timesheet_${currentDate}.xlsx`;

      // Write the file
      XLSX.writeFile(workbook, filename);
      showSuccessMessage("Timesheet data exported successfully!");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      showAxiosError({
        response: { data: { message: "Failed to export data to Excel" } },
      });
    }
  };

  // Format hours for display (convert decimal to HH:MM if needed)
  const formatHoursForDisplay = (hours) => {
    if (!hours && hours !== 0) return "-";

    // If it's already in HH:MM format, return as is
    if (typeof hours === "string" && hours.includes(":")) {
      return hours;
    }

    // Convert decimal to HH:MM format
    try {
      const decimalHours = Number(hours);
      if (isNaN(decimalHours)) return "-";

      const hoursPart = Math.floor(decimalHours);
      const minutesPart = Math.round((decimalHours - hoursPart) * 60);
      return `${hoursPart}:${minutesPart.toString().padStart(2, "0")}`;
    } catch (error) {
      return hours?.toString() || "-";
    }
  };

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        breakMinutes: Number(data.breakMinutes),
        hours: convertHoursToDecimal(data.hours),
      };

      let resp;
      if (editingId) {
        resp = await API.put(`/timesheet/${editingId}`, payload);
        showSuccessMessage(
          resp.data.message || "Timesheet updated successfully!"
        );
      } else {
        resp = await API.post("/timesheet", payload);
        showSuccessMessage(
          resp.data.message || "Timesheet created successfully!"
        );
      }
      reset();
      setEditingId(null);
      setShowForm(false);
      fetchTimesheetData();
    } catch (error) {
      showAxiosError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (item) => {
    setEditingId(item._id);

    // Ensure employee details are fetched before opening form
    if (userEmployeeId && !userEmployeeName) {
      await fetchEmployeeDetails(userEmployeeId);
    }

    // Wait a bit for state to update
    setTimeout(() => {
      // For admin/super_admin: use item's employee details (can edit any employee)
      // For employees: use logged-in employee's details (can only edit their own)
      const employeeName =
        userRole === "super_admin" || userRole === "admin"
          ? item.employeeName || ""
          : userEmployeeName || item.employeeName || "";
      const employeeId =
        userRole === "super_admin" || userRole === "admin"
          ? item.employeeId || item.employeeID || ""
          : userEmployeeId || item.employeeId || item.employeeID || "";

      console.log("Edit - Setting employeeName to:", employeeName);
      console.log("Edit - Setting employeeId to:", employeeId);

      setValue("employeeName", employeeName);
      setValue("employeeId", employeeId);
      setValue("date", item.date ? item.date.split("T")[0] : "");
      setValue("inTime", item.inTime || "");
      setValue("outTime", item.outTime || "");
      setValue("breakMinutes", item.breakMinutes?.toString() || "");
      setValue("status", item.status || "");
      setValue("subject", item.subject || "");
      setValue("chapter", item.chapter || "");
      setValue("task", item.task || "");

      // Recalculate hours when editing (in case times have changed)
      const calculatedHours = calculateHours(
        item.inTime || "",
        item.outTime || "",
        item.breakMinutes?.toString() || "0"
      );

      // If item.hours is in decimal format, convert it to HH:MM, otherwise use calculated
      let hoursValue = calculatedHours;
      if (!calculatedHours && item.hours) {
        // Convert decimal hours to HH:MM format
        const decimalHours = Number(item.hours);
        const hours = Math.floor(decimalHours);
        const minutes = Math.round((decimalHours - hours) * 60);
        hoursValue = `${hours}:${minutes.toString().padStart(2, "0")}`;
      }
      setValue("hours", hoursValue || "");
      setShowForm(true);
    }, 100);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    reset();
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this timesheet record?")
    ) {
      return;
    }
    try {
      const resp = await API.delete(`/timesheet/${id}`);
      showSuccessMessage(
        resp.data.message || "Timesheet deleted successfully!"
      );
      fetchTimesheetData();
    } catch (error) {
      showAxiosError(error);
    }
  };

  const handleCancel = () => {
    reset();
    setEditingId(null);
  };

  const handleView = (item) => {
    setSelectedRecord(item);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedRecord(null);
  };

  const statusOptions = [
    { value: "in_progress", label: "In Progress" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "not_started", label: "Not Started" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#525B88]">
            Timesheet Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track employee timesheet records
          </p>
        </div>
        <button
          onClick={async () => {
            // Ensure employee details are fetched before opening form
            if (userEmployeeId && !userEmployeeName) {
              await fetchEmployeeDetails(userEmployeeId);
            }
            // Wait a bit for state to update
            setTimeout(() => {
              setValue("date", new Date().toISOString().split("T")[0]);
              // Only auto-populate for non-admin roles
              if (
                userEmployeeId &&
                userRole !== "super_admin" &&
                userRole !== "admin"
              ) {
                setValue("employeeId", userEmployeeId);
                console.log("Setting employeeId to:", userEmployeeId);
              }
              if (
                userEmployeeName &&
                userRole !== "super_admin" &&
                userRole !== "admin"
              ) {
                setValue("employeeName", userEmployeeName);
                console.log("Setting employeeName to:", userEmployeeName);
              }
              setShowForm(true);
            }, 100);
          }}
          className="flex items-center gap-2 bg-[#525B88] text-white px-4 py-2 rounded-md hover:bg-[#3a4166] transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Timesheet
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-[#525B88] to-[#3a4166]">
              <h3 className="text-lg font-semibold text-white">
                {editingId ? "Edit Timesheet" : "Add Timesheet"}
              </h3>
              <button
                onClick={handleCloseForm}
                className="text-white/80 hover:text-white transition-colors focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form Body */}
            <FormWrapper
              submitFn={handleSubmit}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Employee Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("employeeName")}
                    disabled={
                      !!userEmployeeId &&
                      userRole !== "super_admin" &&
                      userRole !== "admin"
                    }
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                      errors.employeeName ? "border-red-500" : "border-gray-200"
                    } ${
                      userEmployeeId &&
                      userRole !== "super_admin" &&
                      userRole !== "admin"
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    placeholder="Enter employee name"
                  />
                  {errors.employeeName && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.employeeName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("employeeId")}
                    disabled={
                      !!userEmployeeId &&
                      userRole !== "super_admin" &&
                      userRole !== "admin"
                    }
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                      errors.employeeId ? "border-red-500" : "border-gray-200"
                    } ${
                      userEmployeeId &&
                      userRole !== "super_admin" &&
                      userRole !== "admin"
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    placeholder="Enter employee ID"
                  />
                  {errors.employeeId && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.employeeId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register("date")}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                      errors.date ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.date.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    In Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    {...register("inTime")}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                      errors.inTime ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {errors.inTime && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.inTime.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Out Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    {...register("outTime")}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                      errors.outTime ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {errors.outTime && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.outTime.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Break (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("breakMinutes")}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                      errors.breakMinutes ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Enter break in minutes"
                    min="0"
                  />
                  {errors.breakMinutes && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.breakMinutes.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("status")}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                      errors.status ? "border-red-500" : "border-gray-200"
                    }`}
                  >
                    <option value="">Select Status</option>
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.status.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Project <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("subject")}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                      errors.subject ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Enter Project name"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Module <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("chapter")}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                      errors.chapter ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Enter module name"
                  />
                  {errors.chapter && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.chapter.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Task <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("task")}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                      errors.task ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Enter task"
                  />
                  {errors.task && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.task.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Hours <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 font-normal ml-2">
                      (Auto-calculated)
                    </span>
                  </label>
                  <input
                    type="text"
                    {...register("hours")}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 bg-gray-50 ${
                      errors.hours ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Auto-calculated (e.g., 7:30)"
                    readOnly
                  />
                  {errors.hours && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.hours.message}
                    </p>
                  )}
                  {/* <p className="mt-1 text-xs text-gray-500">
                    Format: HH:MM (e.g., 7:30 = 7 hours 30 minutes)
                  </p> */}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex-shrink-0 flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-5 py-2.5 transition-all border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#525B88]"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 transition-all text-white rounded-lg shadow-md shadow-[#525B88]/20 bg-gradient-to-r from-[#525B88] to-[#3a4166] hover:from-[#3a4166] hover:to-[#2d3450] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#525B88] disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Submitting..."
                    : editingId
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </FormWrapper>
          </div>
        </div>
      )}

      {/* Timesheet Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-end gap-4">
          {/* Search Input - Same style as Onboarding */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Employee Name, ID, Subject, Status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88] focus:border-[#525b88] text-sm"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* From Date */}
          <div className="flex-shrink-0">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88] focus:border-[#525b88] text-sm"
            />
          </div>

          {/* To Date */}
          <div className="flex-shrink-0">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88] focus:border-[#525b88] text-sm"
            />
          </div>

          {/* Download Excel Button */}
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={handleExportToExcel}
              className="flex items-center justify-center gap-2 px-4 py-2 h-[37px] rounded-lg text-sm font-medium transition-colors bg-[#525B88] text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
              title="Download filtered data as Excel"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download Excel</span>
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="table-scroll-container">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#525b88]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Employee Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredList.length > 0 ? (
                  filteredList.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.employeeName || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.employeeId || item.employeeID || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.date ? item.date.split("T")[0] : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {item.status
                            ? item.status.charAt(0).toUpperCase() +
                              item.status.slice(1)
                            : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.subject || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatHoursForDisplay(item.hours)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(item)}
                            className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-[#525b88] hover:text-[#3a4166]"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No timesheet records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-[#525B88] to-[#3a4166]">
              <h3 className="text-lg font-semibold text-white">
                Timesheet Details
              </h3>
              <button
                onClick={handleCloseViewModal}
                className="text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Employee Name */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Employee Name:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedRecord.employeeName || "-"}
                    </p>
                  </div>

                  {/* Employee ID */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Employee ID:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedRecord.employeeId ||
                        selectedRecord.employeeID ||
                        "-"}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Date:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedRecord.date
                        ? selectedRecord.date.split("T")[0]
                        : "-"}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Status:
                    </label>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        selectedRecord.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedRecord.status
                        ? selectedRecord.status.charAt(0).toUpperCase() +
                          selectedRecord.status.slice(1)
                        : "-"}
                    </span>
                  </div>

                  {/* In Time */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      In Time:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedRecord.inTime || "-"}
                    </p>
                  </div>

                  {/* Out Time */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Out Time:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedRecord.outTime || "-"}
                    </p>
                  </div>

                  {/* Break (minutes) */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Break (minutes):
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedRecord.breakMinutes ?? "-"}
                    </p>
                  </div>

                  {/* Hours */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Hours:
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatHoursForDisplay(selectedRecord.hours)}
                    </p>
                  </div>

                  {/* Subject */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Subject:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedRecord.subject || "-"}
                    </p>
                  </div>

                  {/* Chapter */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Chapter:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedRecord.chapter || "-"}
                    </p>
                  </div>
                </div>

                {/* Task - Full Width */}
                <div className="mb-5 flex items-start gap-3">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px] pt-0.5">
                    Task:
                  </label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap flex-1">
                    {selectedRecord.task || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCloseViewModal}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
