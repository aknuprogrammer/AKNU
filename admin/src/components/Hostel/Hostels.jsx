import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import AddFormModal from "./AddFormModal";
import { API } from "../../config/urls";
import {
  Filter,
  Home,
  Bed,
  Calendar,
  Hash,
  Clock,
  DollarSign,
  FileText,
  User,
  BookOpen,
  Users,
  Eye,
  Plus,
} from "lucide-react";
import {
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const FilterBar = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    registrationNumber: "",
    studentName: "",
    course: "",
    hostelName: "",
    roomType: "",
    status: "",
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row md:items-center gap-3 p-3 w-full bg-white border border-[#525b88] shadow-lg"
    >
      {/* Registration Number */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="registrationNumber"
          placeholder="Registration No"
          value={filters.registrationNumber}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>
      
      {/* Student Name */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="studentName"
          placeholder="Student Name"
          value={filters.studentName}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>

      {/* Course */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="course"
          placeholder="Course"
          value={filters.course}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>

      {/* Hostel Name */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="hostelName"
          placeholder="Hostel Name"
          value={filters.hostelName}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>

      {/* Room Type */}
      <div className="flex-1 min-w-[120px]">
        <select
          name="roomType"
          value={filters.roomType}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        >
          <option value="">All Room Types</option>
          <option value="general">General</option>
          <option value="AC">AC</option>
          <option value="non-AC">Non-AC</option>
          <option value="attached">Attached</option>
        </select>
      </div>

      {/* Status */}
      <div className="flex-1 min-w-[120px]">
        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Apply Filter Button */}
      <div>
        <button
          type="submit"
          className={`flex items-center justify-center px-4 py-2 h-[37px] rounded-md text-sm font-medium transition-colors bg-[#525B88] text-white hover:bg-[#3a4166]`}
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};

const HostelTable = ({
  applications,
  filters,
  sortConfig,
  requestSort,
  loading,
  error,
  hostelType,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const filteredAndSortedApplications = React.useMemo(() => {
    const filtered = applications.filter((app) => {
      return (
        (filters.registrationNumber === "" ||
          app.registrationNumber
            ?.toString()
            .toLowerCase()
            .includes(filters.registrationNumber.toLowerCase())) &&
        (filters.studentName === "" ||
          app.studentName
            ?.toLowerCase()
            .includes(filters.studentName.toLowerCase())) &&
        (filters.course === "" ||
          app.course
            ?.toLowerCase()
            .includes(filters.course.toLowerCase())) &&
        (filters.hostelName === "" ||
          app.hostelName
            ?.toLowerCase()
            .includes(filters.hostelName.toLowerCase())) &&
        (filters.roomType === "" ||
          app.roomType
            ?.toLowerCase()
            .includes(filters.roomType.toLowerCase())) &&
        (filters.status === "" ||
          app.status
            ?.toLowerCase()
            .includes(filters.status.toLowerCase()))
      );
    });

    if (sortConfig.key) {
      return [...filtered].sort((a, b) => {
        if (sortConfig.key === "joiningDate" || sortConfig.key === "createdAt") {
          const dateA = new Date(a[sortConfig.key] || 0);
          const dateB = new Date(b[sortConfig.key] || 0);
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        }
        if (["feePerMonth", "totalFee"].includes(sortConfig.key)) {
          const aValue = parseFloat(a[sortConfig.key] || 0);
          const bValue = parseFloat(b[sortConfig.key] || 0);
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [applications, filters, sortConfig]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#525b88]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        Error fetching data: {error}
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto mt-4 border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#525b88]">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer whitespace-nowrap"
                onClick={() => requestSort("registrationNumber")}
              >
                <div className="flex items-center">
                  Reg No
                  {sortConfig.key === "registrationNumber" && (
                    <span className="ml-1">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("studentName")}
              >
                <div className="flex items-center">
                  {hostelType === "staff" ? "Employee" : "Student"}
                  {sortConfig.key === "studentName" && (
                    <span className="ml-1">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("hostelName")}
              >
                <div className="flex items-center">
                  Hostel
                  {sortConfig.key === "hostelName" && (
                    <span className="ml-1">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("status")}
              >
                <div className="flex items-center">
                  Status
                  {sortConfig.key === "status" && (
                    <span className="ml-1">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedApplications.length > 0 ? (
              filteredAndSortedApplications.map((app) => (
                <tr key={app._id || app.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.registrationNumber || app.employeeId || "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {app.studentName || app.employeeName || "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.hostelName || "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          app.status === "active"
                            ? "bg-green-100 text-green-800"
                            : app.status === "inactive"
                            ? "bg-red-100 text-red-800"
                            : app.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {app.status || "active"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView(app._id)}
                        className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onEdit(app._id)}
                        className="text-[#525b88] hover:text-[#3a4166]"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(app._id)}
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
                  colSpan="5"
                  className="px-4 py-12 text-center text-sm text-gray-500"
                >
                <div className="flex flex-col items-center">
                  <Home className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-600">
                    No {hostelType === "girls" ? "girls" : hostelType === "boys" ? "boys" : "staff"} hostel records found
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Records will appear here once applications are submitted
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </>
  );
};

const Hostels = () => {
  const [activeTab, setActiveTab] = useState("girls");
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    registrationNumber: "",
    studentName: "",
    course: "",
    hostelName: "",
    roomType: "",
    status: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  // Static data for each hostel type
  const [hostelData, setHostelData] = useState({
    girls: [],
    boys: [],
    staff: [],
  });

  // Static data
  const staticData = {
    girls: [
      {
        _id: "1",
        registrationNumber: "AKNU2024001",
        studentName: "Priya Sharma",
        course: "B.Tech",
        hostelName: "Saraswati Girls Hostel",
        roomType: "AC",
        joiningDate: "2024-01-15",
        duration: 12,
        feePerMonth: 5000,
        totalFee: 60000,
        remarks: "Allocated room 101",
        status: "active",
      },
      {
        _id: "2",
        registrationNumber: "AKNU2024002",
        studentName: "Sneha Reddy",
        course: "M.Sc",
        hostelName: "Lakshmi Girls Hostel",
        roomType: "non-AC",
        joiningDate: "2024-01-10",
        duration: 12,
        feePerMonth: 3500,
        totalFee: 42000,
        remarks: "Allocated room 205",
        status: "active",
      },
      {
        _id: "3",
        registrationNumber: "AKNU2024003",
        studentName: "Anjali Desai",
        course: "B.Sc",
        hostelName: "Saraswati Girls Hostel",
        roomType: "attached",
        joiningDate: "2024-01-20",
        duration: 12,
        feePerMonth: 6000,
        totalFee: 72000,
        remarks: "Allocated room 301",
        status: "pending",
      },
    ],
    boys: [
      {
        _id: "1",
        registrationNumber: "AKNU2024004",
        studentName: "Rajesh Kumar",
        course: "B.Tech",
        hostelName: "Vishwakarma Boys Hostel",
        roomType: "AC",
        joiningDate: "2024-01-12",
        duration: 12,
        feePerMonth: 5000,
        totalFee: 60000,
        remarks: "Allocated room 101",
        status: "active",
      },
      {
        _id: "2",
        registrationNumber: "AKNU2024005",
        studentName: "Amit Patel",
        course: "M.Tech",
        hostelName: "Vivekananda Boys Hostel",
        roomType: "non-AC",
        joiningDate: "2024-01-08",
        duration: 12,
        feePerMonth: 3500,
        totalFee: 42000,
        remarks: "Allocated room 305",
        status: "inactive",
      },
      {
        _id: "3",
        registrationNumber: "AKNU2024006",
        studentName: "Karan Singh",
        course: "B.Tech",
        hostelName: "Vishwakarma Boys Hostel",
        roomType: "attached",
        joiningDate: "2024-01-18",
        duration: 12,
        feePerMonth: 6000,
        totalFee: 72000,
        remarks: "Allocated room 201",
        status: "active",
      },
    ],
    staff: [
      {
        _id: "1",
        employeeId: "EMP001",
        employeeName: "Dr. Rajesh Kumar",
        department: "Computer Science",
        hostelName: "Staff Quarters Block A",
        roomType: "AC",
        joiningDate: "2024-01-05",
        duration: 24,
        feePerMonth: 8000,
        totalFee: 192000,
        remarks: "Allocated flat 101",
        status: "active",
      },
      {
        _id: "2",
        employeeId: "EMP002",
        employeeName: "Dr. Priya Sharma",
        department: "Mathematics",
        hostelName: "Staff Quarters Block B",
        roomType: "attached",
        joiningDate: "2024-01-10",
        duration: 24,
        feePerMonth: 10000,
        totalFee: 240000,
        remarks: "Allocated flat 205",
        status: "active",
      },
      {
        _id: "3",
        employeeId: "EMP003",
        employeeName: "Dr. Amit Patel",
        department: "Physics",
        hostelName: "Staff Quarters Block A",
        roomType: "AC",
        joiningDate: "2024-01-15",
        duration: 24,
        feePerMonth: 8000,
        totalFee: 192000,
        remarks: "Allocated flat 301",
        status: "pending",
      },
    ],
  };

  const fetchHostelData = async (type) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch data from API
      const response = await API.get("/hostel-fee");
      
      if (response.data && Array.isArray(response.data)) {
        // Filter data based on application type
        const filteredData = response.data.filter((item) => {
          if (type === "staff") {
            return item.applicationType === "staff" || item.employeeId;
          } else if (type === "girls") {
            return (item.applicationType === "student" || item.registrationNumber) && 
                   (!item.gender || item.gender.toLowerCase() === "female");
          } else if (type === "boys") {
            return (item.applicationType === "student" || item.registrationNumber) && 
                   (!item.gender || item.gender.toLowerCase() === "male");
          }
          return item.applicationType === "student" || item.registrationNumber;
        });
        
        setHostelData((prev) => ({
          ...prev,
          [type]: filteredData,
        }));
      } else {
        // Fallback to static data if API returns unexpected format
        setHostelData((prev) => ({
          ...prev,
          [type]: staticData[type] || [],
        }));
      }
    } catch (error) {
      console.error("Error fetching hostel data:", error);
      setError(error.message);
      // Fallback to static data on error
      setHostelData((prev) => ({
        ...prev,
        [type]: staticData[type] || [],
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters) => {
    setFilters(filters);
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleView = (id) => {
    const record = hostelData[activeTab].find((item) => item._id === id);
    if (record) {
      setSelectedRecord(record);
      setShowViewModal(true);
    } else {
      console.error("Record not found for ID:", id, "in tab:", activeTab);
    }
  };

  const handleCloseModal = () => {
    setShowViewModal(false);
    setSelectedRecord(null);
  };

  const handleEdit = (id) => {
    const record = hostelData[activeTab].find((item) => item._id === id);
    if (record) {
      // Format joiningDate for date input (YYYY-MM-DD)
      const formattedRecord = { ...record };
      if (formattedRecord.joiningDate) {
        const date = new Date(formattedRecord.joiningDate);
        if (!isNaN(date.getTime())) {
          formattedRecord.joiningDate = date.toISOString().split('T')[0];
        }
      }
      setEditFormData(formattedRecord);
      setShowEditModal(true);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editFormData) {
      try {
        setLoading(true);
        // Calculate total fee
        const totalFee = (editFormData.feePerMonth || 0) * (parseInt(editFormData.duration) || 0);
        
        // Prepare data for API
        const apiData = {
          ...editFormData,
          totalFee: totalFee,
        };

        // Call API to update hostel application
        const response = await API.put(`/hostel-fee/${editFormData._id}`, apiData);
        
        if (response.data) {
          // Update local state
          setHostelData((prev) => ({
            ...prev,
            [activeTab]: prev[activeTab].map((item) =>
              item._id === editFormData._id ? response.data : item
            ),
          }));
          setShowEditModal(false);
          setEditFormData(null);
          alert("Hostel application updated successfully!");
        }
      } catch (error) {
        console.error("Error updating hostel application:", error);
        alert(`Error updating hostel application: ${error.response?.data?.error || error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };
      
      // Auto-calculate totalFee when duration or feePerMonth changes
      if (name === "duration" || name === "feePerMonth") {
        const duration = name === "duration" ? Number(value) : Number(prev.duration || 0);
        const feePerMonth = name === "feePerMonth" ? Number(value) : Number(prev.feePerMonth || 0);
        updated.totalFee = duration * feePerMonth;
      }
      
      return updated;
    });
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleAddSubmit = async (formData) => {
    try {
      setLoading(true);
      // Calculate total fee
      const totalFee = (formData.feePerMonth || 0) * (parseInt(formData.duration) || 0);
      
      // Prepare data for API
      const apiData = {
        ...formData,
        totalFee: totalFee,
        applicationType: activeTab === "staff" ? "staff" : "student",
        status: formData.status || "active",
      };

      // Call API to save hostel application
      const response = await API.post("/hostel-fee", apiData);
      
      if (response.data) {
        // Add the saved item to local state
        const newItem = {
          ...response.data,
          // Ensure all fields are present for display
          registrationNumber: response.data.registrationNumber || "",
          employeeId: response.data.employeeId || "",
          studentName: response.data.studentName || "",
          employeeName: response.data.employeeName || "",
        };
        
        setHostelData((prev) => ({
          ...prev,
          [activeTab]: [...prev[activeTab], newItem],
        }));
        setShowAddModal(false);
        // Optionally show success message
        alert("Hostel application saved successfully!");
      }
    } catch (error) {
      console.error("Error saving hostel application:", error);
      alert(`Error saving hostel application: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        setLoading(true);
        // Call API to delete hostel application
        await API.delete(`/hostel-fee/${id}`);
        
        // Update local state
        setHostelData((prev) => ({
          ...prev,
          [activeTab]: prev[activeTab].filter((item) => item._id !== id),
        }));
        alert("Hostel application deleted successfully!");
      } catch (error) {
        console.error("Error deleting hostel application:", error);
        alert(`Error deleting hostel application: ${error.response?.data?.error || error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setHostelData((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((item) =>
        item._id === id ? { ...item, status: newStatus } : item
      ),
    }));
  };

  useEffect(() => {
    fetchHostelData(activeTab);
  }, [activeTab]);

  const tabs = [
    { id: "girls", label: "Girls Hostel" },
    { id: "boys", label: "Boys Hostel"},
    { id: "staff", label: "Staff Hostel"},
  ];

  return (
    <>
      <div className="p-6">
        <div className="flex flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
            Hostel Management
          </h2>
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
            title="Add New Application"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Application
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`
                   ${
                     activeTab === tab.id
                       ? "border-[#525b88] text-[#525b88]"
                       : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                   }
                   whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                 `}
               >
                 {tab.label}
               </button>
            ))}
          </nav>
        </div>

        {/* Filter Bar */}
        <FilterBar onFilter={handleFilter} />

         {/* Table */}
         <HostelTable
           applications={hostelData[activeTab]}
           filters={filters}
           sortConfig={sortConfig}
           requestSort={requestSort}
           loading={loading}
           error={error}
           hostelType={activeTab}
           onView={handleView}
           onEdit={handleEdit}
           onDelete={handleDelete}
           onStatusChange={handleStatusChange}
         />
      </div>

       {/* Edit Modal */}
       {showEditModal &&
         editFormData &&
         createPortal(
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
             <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
               {/* Header */}
               <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
                 <h3 className="text-lg font-semibold text-white">
                   Edit {activeTab === "staff" ? "Employee" : "Student"} Hostel Record
                 </h3>
                 <button
                   onClick={() => {
                     setShowEditModal(false);
                     setEditFormData(null);
                   }}
                   className="text-white/80 hover:text-white transition-colors"
                 >
                   ✕
                 </button>
               </div>

               {/* Content */}
               <div className="flex-1 overflow-y-auto">
                 <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                     {/* Registration/Employee Number */}
                     <div className="mb-5">
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         {activeTab === "staff" ? "Employee ID:" : "Registration Number:"}
                       </label>
                       <input
                         type="text"
                         name={activeTab === "staff" ? "employeeId" : "registrationNumber"}
                         value={
                           editFormData[activeTab === "staff" ? "employeeId" : "registrationNumber"] || ""
                         }
                         onChange={handleEditChange}
                         className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                         required
                       />
                     </div>

                     {/* Name */}
                     <div className="mb-5">
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         {activeTab === "staff" ? "Employee Name:" : "Student Name:"}
                       </label>
                       <input
                         type="text"
                         name={activeTab === "staff" ? "employeeName" : "studentName"}
                         value={
                           editFormData[activeTab === "staff" ? "employeeName" : "studentName"] || ""
                         }
                         onChange={handleEditChange}
                         className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                         required
                       />
                     </div>

                     {/* Course/Department */}
                     <div className="mb-5">
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         {activeTab === "staff" ? "Department:" : "Course:"}
                       </label>
                       <input
                         type="text"
                         name={activeTab === "staff" ? "department" : "course"}
                         value={editFormData[activeTab === "staff" ? "department" : "course"] || ""}
                         onChange={handleEditChange}
                         className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                         required
                       />
                     </div>

                     {/* Hostel Name */}
                     <div className="mb-5">
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Hostel Name:
                       </label>
                       <input
                         type="text"
                         name="hostelName"
                         value={editFormData.hostelName || ""}
                         onChange={handleEditChange}
                         className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                         required
                       />
                     </div>

                     {/* Room Type */}
                     <div className="mb-5">
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Room Type:
                       </label>
                       <select
                         name="roomType"
                         value={editFormData.roomType || ""}
                         onChange={handleEditChange}
                         className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                         required
                       >
                         <option value="">Select Room Type</option>
                         <option value="general">General</option>
                         <option value="AC">AC</option>
                         <option value="non-AC">Non-AC</option>
                         <option value="attached">Attached</option>
                       </select>
                     </div>

                     {/* Joining Date */}
                     <div className="mb-5">
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Joining Date:
                       </label>
                       <input
                         type="date"
                         name="joiningDate"
                         value={editFormData.joiningDate || ""}
                         onChange={handleEditChange}
                         className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                         required
                       />
                     </div>

                     {/* Duration */}
                     <div className="mb-5">
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Duration (months):
                       </label>
                       <input
                         type="number"
                         name="duration"
                         value={editFormData.duration || ""}
                         onChange={handleEditChange}
                         className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                         min="1"
                         required
                       />
                     </div>

                     {/* Fee Per Month */}
                     <div className="mb-5">
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Fee Per Month (₹):
                       </label>
                       <input
                         type="number"
                         name="feePerMonth"
                         value={editFormData.feePerMonth || ""}
                         onChange={handleEditChange}
                         className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                         min="0"
                         required
                       />
                     </div>

                     {/* Status */}
                     <div className="mb-5">
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Status:
                       </label>
                       <select
                         name="status"
                         value={editFormData.status || ""}
                         onChange={handleEditChange}
                         className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                         required
                       >
                         <option value="active">Active</option>
                         <option value="inactive">Inactive</option>
                         <option value="pending">Pending</option>
                       </select>
                     </div>

                     {/* Remarks */}
                     <div className="mb-5 col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Remarks:
                       </label>
                       <textarea
                         name="remarks"
                         value={editFormData.remarks || ""}
                         onChange={handleEditChange}
                         rows="3"
                         className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                       />
                     </div>
                   </div>

                   {/* Action Buttons */}
                   <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                     <button
                       type="button"
                       onClick={() => {
                         setShowEditModal(false);
                         setEditFormData(null);
                       }}
                       className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                     >
                       Cancel
                     </button>
                     <button
                       type="submit"
                       className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166] transition-colors"
                     >
                       Save Changes
                     </button>
                   </div>
                 </form>
               </div>
             </div>
           </div>,
           document.body
         )}

       {/* View Details Modal */}
       {showViewModal && selectedRecord && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
           <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
             {/* Header */}
             <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
               <h3 className="text-lg font-semibold text-white">
                 {activeTab === "staff" ? "Employee" : "Student"} Hostel Details
               </h3>
               <button
                 onClick={handleCloseModal}
                 className="text-white/80 hover:text-white transition-colors"
               >
                 ✕
               </button>
             </div>

             {/* Content */}
             <div className="flex-1 overflow-y-auto">
               <div className="p-6 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   {/* Registration/Employee ID */}
                   <div className="mb-5 flex items-center gap-3">
                     <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                       {activeTab === "staff" ? "Employee ID" : "Registration Number"}:
                     </label>
                     <p className="text-sm text-gray-900">
                       {selectedRecord.registrationNumber || selectedRecord.employeeId || "-"}
                     </p>
                   </div>

                   {/* Name */}
                   <div className="mb-5 flex items-center gap-3">
                     <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                       {activeTab === "staff" ? "Employee Name" : "Student Name"}:
                     </label>
                     <p className="text-sm text-gray-900">
                       {selectedRecord.studentName || selectedRecord.employeeName || "-"}
                     </p>
                   </div>

                   {/* Course/Department */}
                   {activeTab !== "staff" ? (
                     <div className="mb-5 flex items-center gap-3">
                       <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                         Course:
                       </label>
                       <p className="text-sm text-gray-900">
                         {selectedRecord.course || "-"}
                       </p>
                     </div>
                   ) : (
                     <div className="mb-5 flex items-center gap-3">
                       <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                         Department:
                       </label>
                       <p className="text-sm text-gray-900">
                         {selectedRecord.department || "-"}
                       </p>
                     </div>
                   )}

                   {/* Hostel Name */}
                   <div className="mb-5 flex items-center gap-3">
                     <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                       Hostel Name:
                     </label>
                     <p className="text-sm text-gray-900">
                       {selectedRecord.hostelName || "-"}
                     </p>
                   </div>

                   {/* Room Type */}
                   <div className="mb-5 flex items-center gap-3">
                     <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                       Room Type:
                     </label>
                     <p className="text-sm text-gray-900 capitalize">
                       {selectedRecord.roomType || "-"}
                     </p>
                   </div>

                   {/* Joining Date */}
                   <div className="mb-5 flex items-center gap-3">
                     <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                       Joining Date:
                     </label>
                     <p className="text-sm text-gray-900">
                       {selectedRecord.joiningDate
                         ? new Date(selectedRecord.joiningDate).toLocaleDateString("en-IN", {
                             year: "numeric",
                             month: "long",
                             day: "numeric",
                           })
                         : "-"}
                     </p>
                   </div>

                   {/* Duration */}
                   <div className="mb-5 flex items-center gap-3">
                     <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                       Duration:
                     </label>
                     <p className="text-sm text-gray-900">
                       {selectedRecord.duration ? `${selectedRecord.duration} months` : "-"}
                     </p>
                   </div>

                   {/* Fee Per Month */}
                   <div className="mb-5 flex items-center gap-3">
                     <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                       Fee Per Month:
                     </label>
                     <p className="text-sm text-gray-900">
                       {selectedRecord.feePerMonth ? `₹${selectedRecord.feePerMonth}` : "-"}
                     </p>
                   </div>

                   {/* Total Fee */}
                   <div className="mb-5 flex items-center gap-3">
                     <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                       Total Fee:
                     </label>
                     <p className="text-sm text-gray-900 font-medium">
                       {selectedRecord.totalFee ? `₹${selectedRecord.totalFee}` : "-"}
                     </p>
                   </div>

                   {/* Status */}
                   <div className="mb-5 flex items-center gap-3">
                     <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                       Status:
                     </label>
                     <span
                       className={`px-3 py-1 rounded-full text-xs ${
                         selectedRecord.status === "active"
                           ? "bg-green-100 text-green-800"
                           : selectedRecord.status === "inactive"
                           ? "bg-red-100 text-red-800"
                           : selectedRecord.status === "pending"
                           ? "bg-yellow-100 text-yellow-800"
                           : "bg-gray-100 text-gray-800"
                       }`}
                     >
                       {selectedRecord.status || "active"}
                     </span>
                   </div>
                 </div>

                 {/* Remarks - Full Width */}
                 <div className="mb-5 flex items-start gap-3">
                   <label className="text-sm font-medium text-gray-700 min-w-[140px] pt-0.5">
                     Remarks:
                   </label>
                   <p className="text-sm text-gray-900 whitespace-pre-wrap flex-1">
                     {selectedRecord.remarks || "-"}
                   </p>
                 </div>
               </div>
             </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  // Format joiningDate for date input (YYYY-MM-DD)
                  const formattedRecord = { ...selectedRecord };
                  if (formattedRecord.joiningDate) {
                    const date = new Date(formattedRecord.joiningDate);
                    if (!isNaN(date.getTime())) {
                      formattedRecord.joiningDate = date.toISOString().split('T')[0];
                    }
                  }
                  setEditFormData(formattedRecord);
                  setShowViewModal(false);
                  setShowEditModal(true);
                }}
                className="px-5 py-2.5 bg-[#525b88] text-white rounded-lg hover:bg-[#3a4166] transition-colors"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
           </div>
         </div>
       )}

      {/* Add Modal */}
      {showAddModal && (
        <AddFormModal
          formType="hostels"
          initialData={null}
          activeTab={activeTab}
          onSubmit={handleAddSubmit}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </>
  );
};

export default Hostels;

