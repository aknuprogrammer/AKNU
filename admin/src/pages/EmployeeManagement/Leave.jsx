import React, { useState, useEffect } from "react";
import { useFormHook } from "../../Hooks/FormHook";
import { API } from "../../config/urls";
import { showAxiosError, showSuccessMessage } from "../../config/Toast";
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Filter, Eye, Plus } from "lucide-react";
import { z } from "zod";
import { jwtDecode } from "jwt-decode";

// Validation schema for leave form
const leaveSchema = z.object({
  employeeName: z.string().min(1, "Employee Name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
  reason: z.string().min(1, "Reason is required"),
  leaveType: z.enum(["casual leave", "sick leave"], {
    errorMap: () => ({ message: "Leave Type is required" }),
  }),
  leaveDuration: z.enum(["half day", "full day"], {
    errorMap: () => ({ message: "Leave Duration is required" }),
  }),
});

export default function Leave() {
  const {
    FormWrapper,
    errors,
    register,
    reset,
    setValue,
    watch,
    control,
    Controller,
  } = useFormHook({
    validation: leaveSchema,
  });

  // Watch form values to ensure select and radio buttons reflect current values
  const leaveTypeValue = watch("leaveType");
  const leaveDurationValue = watch("leaveDuration");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveList, setLeaveList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filteredList, setFilteredList] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [userEmployeeId, setUserEmployeeId] = useState(null);
  const [userEmployeeName, setUserEmployeeName] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Get user employee ID, name, and role from token (run first, before data fetching)
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
          const fullName = decoded.user.fullName || 
                          `${decoded.user.firstName || ""} ${decoded.user.lastName || ""}`.trim() ||
                          decoded.user.name || "";
          
          console.log("EmployeeId from token.user:", employeeId);
          console.log("FullName from token.user:", fullName);
          
          if (employeeId) {
            setUserEmployeeId(employeeId);
          }
          if (fullName) {
            setUserEmployeeName(fullName);
          }
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Fetch leave data (only after userEmployeeId is available)
  const fetchLeaveData = async () => {
    setLoading(true);
    try {
      const resp = await API.get("/employee/leave");
      let data = resp.data.data || resp.data || [];

      // Filter by logged-in user's employeeId (only for non-admin roles)
      if (userEmployeeId && userRole !== "super_admin" && userRole !== "admin") {
        data = data.filter(
          (item) => (item.employeeId || item.employeeID) === userEmployeeId
        );
      }

      setLeaveList(data);
    } catch (error) {
      showAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data when userEmployeeId is available OR when role is admin/super_admin
    if (userEmployeeId || userRole === "super_admin" || userRole === "admin") {
      fetchLeaveData();
    }
  }, [userEmployeeId, userRole]);

  // Effect to populate form when editing
  useEffect(() => {
    if (editingId && showForm) {
      // Find the item being edited
      const itemToEdit = leaveList.find((item) => item._id === editingId);
      if (itemToEdit) {
        // Normalize leaveType to match select options (lowercase, trimmed)
        const normalizedLeaveType = itemToEdit.leaveType
          ? itemToEdit.leaveType.toLowerCase().trim()
          : "";

        // Normalize leaveDuration to match radio button values
        const normalizedLeaveDuration = itemToEdit.leaveDuration
          ? itemToEdit.leaveDuration.toLowerCase().trim()
          : "";

        // For admin/super_admin: use item's employee details (can edit any employee)
        // For employees: use logged-in employee's details (can only edit their own)
        const employeeName = (userRole === "super_admin" || userRole === "admin")
          ? (itemToEdit.employeeName || "")
          : (userEmployeeName || itemToEdit.employeeName || "");
        const employeeId = (userRole === "super_admin" || userRole === "admin")
          ? (itemToEdit.employeeId || itemToEdit.employeeID || "")
          : (userEmployeeId || itemToEdit.employeeId || itemToEdit.employeeID || "");

        // Reset form with normalized values
        reset({
          employeeName: employeeName,
          employeeId: employeeId,
          startDate: itemToEdit.startDate
            ? itemToEdit.startDate.split("T")[0]
            : "",
          endDate: itemToEdit.endDate ? itemToEdit.endDate.split("T")[0] : "",
          reason: itemToEdit.reason || "",
          leaveType: normalizedLeaveType,
          leaveDuration: normalizedLeaveDuration,
        });
      }
    }
  }, [editingId, showForm, leaveList, reset, userEmployeeId, userEmployeeName]);

  // Effect to populate form when opening add form (only for non-admin roles)
  useEffect(() => {
    if (showForm && !editingId && userEmployeeId && userEmployeeName && userRole !== "super_admin" && userRole !== "admin") {
      setValue("employeeId", userEmployeeId);
      setValue("employeeName", userEmployeeName);
    }
  }, [showForm, editingId, userEmployeeId, userEmployeeName, userRole, setValue]);

  // Filter leave data based on search query and date range
  useEffect(() => {
    let filtered = leaveList;

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((record) => {
        const employeeName = (record.employeeName || "").toLowerCase();
        const employeeId = ((record.employeeId || record.employeeID) || "").toLowerCase();
        const leaveType = (record.leaveType || "").toLowerCase();
        const leaveDuration = (record.leaveDuration || "").toLowerCase();
        const status = (record.status || "").toLowerCase();
        return (
          employeeName.includes(query) ||
          employeeId.includes(query) ||
          leaveType.includes(query) ||
          leaveDuration.includes(query) ||
          status.includes(query)
        );
      });
    }

    // Apply date range filter
    if (fromDate) {
      filtered = filtered.filter((record) => {
        const recordDate = record.startDate
          ? record.startDate.split("T")[0]
          : record.startDate;
        return recordDate >= fromDate;
      });
    }
    if (toDate) {
      filtered = filtered.filter((record) => {
        const recordDate = record.endDate
          ? record.endDate.split("T")[0]
          : record.endDate;
        return recordDate <= toDate;
      });
    }

    setFilteredList(filtered);
  }, [leaveList, searchQuery, fromDate, toDate]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let resp;
      if (editingId) {
        resp = await API.put(`/employee/leave/${editingId}`, data);
        showSuccessMessage(resp.data.message || "Leave updated successfully!");
      } else {
        // Add status as "pending" for new leave requests
        const leaveData = {
          ...data,
          status: "pending",
        };
        resp = await API.post("/employee/leave", leaveData);
        showSuccessMessage(resp.data.message || "Leave created successfully!");
      }
      reset();
      setEditingId(null);
      setShowForm(false);
      fetchLeaveData();
    } catch (error) {
      showAxiosError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setShowForm(true);
    // Form values will be set by useEffect when showForm and editingId change
  };

  const handleCancel = () => {
    reset();
    setEditingId(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    reset();
  };

  const handleView = (item) => {
    setSelectedRecord(item);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedRecord(null);
  };

  // Calculate total days between start and end date
  const calculateTotalDays = (startDate, endDate) => {
    if (!startDate || !endDate) return "-";
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
      return diffDays;
    } catch (error) {
      return "-";
    }
  };


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this leave record?")) {
      return;
    }
    try {
      const resp = await API.delete(`/employee/leave/${id}`);
      showSuccessMessage(resp.data.message || "Leave deleted successfully!");
      fetchLeaveData();
    } catch (error) {
      showAxiosError(error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#525B88]">
            Leave Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track employee leave requests
          </p>
        </div>
        <button
          onClick={() => {
            // Auto-populate employee details when opening form (only for non-admin roles)
            if (userEmployeeId && userEmployeeName && userRole !== "super_admin" && userRole !== "admin") {
              setValue("employeeId", userEmployeeId);
              setValue("employeeName", userEmployeeName);
            }
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-[#525B88] text-white px-4 py-2 rounded-md hover:bg-[#3a4166] transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Leave
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-[#525B88] to-[#3a4166]">
              <h3 className="text-lg font-semibold text-white">
                {editingId ? "Edit Leave" : "Add Leave"}
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
              key={editingId || "new"} // Force re-render when editing changes
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
                    readOnly={!!userEmployeeId && userRole !== "super_admin" && userRole !== "admin"}
                    disabled={!!userEmployeeId && userRole !== "super_admin" && userRole !== "admin"}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                      errors.employeeName ? "border-red-500" : "border-gray-200"
                    } ${userEmployeeId && userRole !== "super_admin" && userRole !== "admin" ? "bg-gray-50 cursor-not-allowed" : ""}`}
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
                    readOnly={!!userEmployeeId && userRole !== "super_admin" && userRole !== "admin"}
                    disabled={!!userEmployeeId && userRole !== "super_admin" && userRole !== "admin"}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                      errors.employeeId ? "border-red-500" : "border-gray-200"
                    } ${userEmployeeId && userRole !== "super_admin" && userRole !== "admin" ? "bg-gray-50 cursor-not-allowed" : ""}`}
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
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register("startDate")}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                      errors.startDate ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register("endDate")}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                      errors.endDate ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Leave Type <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="leaveType"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                          errors.leaveType
                            ? "border-red-500"
                            : "border-gray-200"
                        }`}
                      >
                        <option value="">Select Leave Type</option>
                        <option value="casual leave">Casual Leave</option>
                        <option value="sick leave">Sick Leave</option>
                      </select>
                    )}
                  />
                  {errors.leaveType && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.leaveType.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Leave Duration <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="leaveDuration"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-6 mt-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="half day"
                            checked={field.value === "half day"}
                            onChange={() => field.onChange("half day")}
                            className="h-4 w-4 text-[#525B88] focus:ring-[#525B88] border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Half Day
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="full day"
                            checked={field.value === "full day"}
                            onChange={() => field.onChange("full day")}
                            className="h-4 w-4 text-[#525B88] focus:ring-[#525B88] border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Full Day
                          </span>
                        </label>
                      </div>
                    )}
                  />
                  {errors.leaveDuration && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.leaveDuration.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register("reason")}
                    rows={3}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#525B88] focus:border-[#525B88] transition-all duration-200 ${
                      errors.reason ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Enter reason for leave"
                  />
                  {errors.reason && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.reason.message}
                    </p>
                  )}
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

      {/* Leave Table */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-end gap-4">
          {/* Search Input - Same style as Timesheet */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Employee Name, ID, Leave Type, Status..."
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

        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="table-scroll-container">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-[#525b88]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                    Employee Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                    Total Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                    Leave Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">
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
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {item.employeeName || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {item.employeeId || item.employeeID || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {item.startDate ? item.startDate.split("T")[0] : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {item.endDate ? item.endDate.split("T")[0] : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium whitespace-nowrap">
                        <span className="inline-flex items-center">
                          {calculateTotalDays(item.startDate, item.endDate)}
                          {calculateTotalDays(item.startDate, item.endDate) !==
                            "-" && (
                            <span className="text-gray-500 ml-1">
                              {calculateTotalDays(
                                item.startDate,
                                item.endDate
                              ) === 1
                                ? "day"
                                : "days"}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {item.leaveType || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                          {item.leaveDuration || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === "approved" || item.status?.toLowerCase() === "approved"
                                ? "bg-green-100 text-green-800"
                                : item.status === "rejected" || item.status?.toLowerCase() === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {item.status
                              ? item.status.charAt(0).toUpperCase() +
                                item.status.slice(1)
                              : "Pending"}
                          </span>
                          {item.rejectionReason && 
                           (item.status === "rejected" || item.status?.toLowerCase() === "rejected") && (
                            <span
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-200 text-red-900 whitespace-nowrap"
                              title="Rejection reason available - Click view to see details"
                            >
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Reason
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                        <button
                          onClick={() => handleView(item)}
                          className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No leave records found
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
                Leave Details
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
                {/* Rejection Notice - Show prominently if rejected with reason */}
                {selectedRecord.rejectionReason && 
                 (selectedRecord.status === "rejected" || selectedRecord.status?.toLowerCase() === "rejected") && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-semibold text-red-800 mb-1">
                          Leave Request Rejected
                        </h3>
                        <p className="text-sm text-red-700 font-medium">
                          Your leave request has been rejected. Please see the rejection reason below.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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

                  {/* Start Date */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Start Date:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedRecord.startDate
                        ? selectedRecord.startDate.split("T")[0]
                        : "-"}
                    </p>
                  </div>

                  {/* End Date */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      End Date:
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedRecord.endDate
                        ? selectedRecord.endDate.split("T")[0]
                        : "-"}
                    </p>
                  </div>

                  {/* Total Days */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Total Days:
                    </label>
                    <p className="text-sm text-gray-900 font-medium">
                      {calculateTotalDays(
                        selectedRecord.startDate,
                        selectedRecord.endDate
                      )}
                      {calculateTotalDays(
                        selectedRecord.startDate,
                        selectedRecord.endDate
                      ) !== "-" && (
                        <span className="text-gray-500 ml-1">
                          {calculateTotalDays(
                            selectedRecord.startDate,
                            selectedRecord.endDate
                          ) === 1
                            ? "day"
                            : "days"}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Leave Type */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Leave Type:
                    </label>
                    <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 capitalize">
                      {selectedRecord.leaveType || "-"}
                    </span>
                  </div>

                  {/* Leave Duration */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Leave Duration:
                    </label>
                    <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 capitalize">
                      {selectedRecord.leaveDuration || "-"}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="mb-5 flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                      Status:
                    </label>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedRecord.status === "approved" || selectedRecord.status?.toLowerCase() === "approved"
                          ? "bg-green-100 text-green-800"
                          : selectedRecord.status === "rejected" || selectedRecord.status?.toLowerCase() === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedRecord.status
                        ? selectedRecord.status.charAt(0).toUpperCase() +
                          selectedRecord.status.slice(1)
                        : "Pending"}
                    </span>
                  </div>
                </div>

                {/* Reason - Full Width */}
                <div className="mb-5 flex items-start gap-3">
                  <label className="text-sm font-medium text-gray-700 min-w-[140px] pt-0.5">
                    Reason:
                  </label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap flex-1">
                    {selectedRecord.reason || "-"}
                  </p>
                </div>

                {/* Rejection Reason - Show if rejected - Make it prominent */}
                {selectedRecord.rejectionReason && (
                  <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-red-800 mb-2">
                          Rejection Reason from Admin:
                        </label>
                        <p className="text-sm text-red-700 whitespace-pre-wrap leading-relaxed">
                          {selectedRecord.rejectionReason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
