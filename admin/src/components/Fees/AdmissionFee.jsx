import React, { useEffect, useState } from "react";
import {
  Filter,
  User,
  Hash,
  BookOpen,
  GitBranch,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Users,
  Check,
  Clock,
  DollarSign,
  FileText,
} from "lucide-react";
import { BASE_URL } from "../../config/urls";

const FilterBar = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    studentName: "",
    registrationNumber: "",
    course: "",
    branch: "",
    yearSemester: "",
    gender: "",
    category: "",
    paymentStatus: "",
    paidFeeMin: "",
    paidFeeMax: "",
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

      {/* Registration Number */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="registrationNumber"
          placeholder="Reg Number"
          value={filters.registrationNumber}
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

      {/* Branch */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="branch"
          placeholder="Branch"
          value={filters.branch}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>

      {/* Payment Status */}
      <div className="flex-1 min-w-[120px]">
        <select
          name="paymentStatus"
          value={filters.paymentStatus}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        >
          <option value="">All Statuses</option>
          <option value="PAID">Paid</option>
          <option value="PARTIAL">Partial</option>
          <option value="PENDING">Pending</option>
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

const AdmissionFeeApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    studentName: "",
    registrationNumber: "",
    course: "",
    branch: "",
    yearSemester: "",
    gender: "",
    category: "",
    paymentStatus: "",
    paidFeeMin: "",
    paidFeeMax: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const token = localStorage.getItem("token");

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/admission`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setApplications(result);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setError(error.message);
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

  const filteredAndSortedApplications = React.useMemo(() => {
    const filtered = applications.filter((app) => {
      const paidFee = parseFloat(app.paidFee) || 0;
      
      return (
        (filters.studentName === "" ||
          app.studentName
            ?.toLowerCase()
            .includes(filters.studentName.toLowerCase())) &&
        (filters.registrationNumber === "" ||
          app.registrationNumber
            ?.toLowerCase()
            .includes(filters.registrationNumber.toLowerCase())) &&
        (filters.course === "" ||
          app.course
            ?.toLowerCase()
            .includes(filters.course.toLowerCase())) &&
        (filters.branch === "" ||
          app.branch
            ?.toLowerCase()
            .includes(filters.branch.toLowerCase())) &&
        (filters.yearSemester === "" ||
          app.yearSemester
            ?.toLowerCase()
            .includes(filters.yearSemester.toLowerCase())) &&
        (filters.gender === "" ||
          app.gender
            ?.toLowerCase()
            .includes(filters.gender.toLowerCase())) &&
        (filters.category === "" ||
          app.category
            ?.toLowerCase()
            .includes(filters.category.toLowerCase())) &&
        (filters.paymentStatus === "" ||
          app.paymentStatus
            ?.toLowerCase()
            .includes(filters.paymentStatus.toLowerCase())) &&
        (filters.paidFeeMin === "" ||
          paidFee >= parseFloat(filters.paidFeeMin)) &&
        (filters.paidFeeMax === "" ||
          paidFee <= parseFloat(filters.paidFeeMax))
      );
    });

    if (sortConfig.key) {
      return [...filtered].sort((a, b) => {
        // Convert to numbers for numeric fields
        if (["totalFee", "paidFee", "pendingFee"].includes(sortConfig.key)) {
          const aValue = parseFloat(a[sortConfig.key]) || 0;
          const bValue = parseFloat(b[sortConfig.key]) || 0;
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }
        if (sortConfig.key === "dob") {
          const dateA = new Date(a.dob || 0);
          const dateB = new Date(b.dob || 0);
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
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

  useEffect(() => {
    fetchApplications();
  }, [filters]);

  return (
    <div className="p-6">
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Admission Fee Applications
        </h2>
      </div>

      <FilterBar onFilter={handleFilter} />

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#525b88]"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error fetching data: {error}
          <button
            onClick={fetchApplications}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto mt-4 border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#525b88]">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("studentName")}
                >
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    Student
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
                  onClick={() => requestSort("registrationNumber")}
                >
                  <div className="flex items-center">
                    <Hash className="w-4 h-4 mr-1" />
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
                  onClick={() => requestSort("course")}
                >
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    Course
                    {sortConfig.key === "course" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("branch")}
                >
                  <div className="flex items-center">
                    <GitBranch className="w-4 h-4 mr-1" />
                    Branch
                    {sortConfig.key === "branch" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("yearSemester")}
                >
                  <div className="flex items-center">
                    Year/Sem
                    {sortConfig.key === "yearSemester" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("gender")}
                >
                  <div className="flex items-center">
                    Gender
                    {sortConfig.key === "gender" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("dob")}
                >
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    DOB
                    {sortConfig.key === "dob" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("category")}
                >
                  <div className="flex items-center">
                    Category
                    {sortConfig.key === "category" && (
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
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    Contact
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("totalFee")}
                >
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Total Fee
                    {sortConfig.key === "totalFee" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("paidFee")}
                >
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Paid
                    {sortConfig.key === "paidFee" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("pendingFee")}
                >
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Pending
                    {sortConfig.key === "pendingFee" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("paymentStatus")}
                >
                  <div className="flex items-center">
                    Status
                    {sortConfig.key === "paymentStatus" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("createdAt")}
                >
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Submitted
                    {sortConfig.key === "createdAt" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedApplications.map((app) => (
                <tr key={app._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {app.studentName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.registrationNumber}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.course}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.branch}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.yearSemester}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {app.gender}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.dob ? new Date(app.dob).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.category}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col">
                      <span>{app.mobile}</span>
                      {app.email && (
                        <span className="text-xs text-gray-500 truncate max-w-[120px]">
                          {app.email}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                    ₹{app.totalFee}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    ₹{app.paidFee}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                    ₹{app.pendingFee}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      app.paymentStatus === "PAID" 
                        ? "bg-green-100 text-green-800" 
                        : app.paymentStatus === "PARTIAL" 
                          ? "bg-yellow-100 text-yellow-800" 
                          : "bg-red-100 text-red-800"
                    }`}>
                      {app.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdmissionFeeApplications;