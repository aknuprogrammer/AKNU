import React, { useEffect, useState } from "react";
import {
  Filter,
  Hash,
  School,
  Calendar,
  Users,
  Check,
  Clock,
  DollarSign,
  FileText,
} from "lucide-react";
import { BASE_URL } from "../../config/urls";

const FilterBar = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    collegeCode: "",
    collegeName: "",
    academicYear: "",
    totalStudentsMin: "",
    totalStudentsMax: "",
    paidStudentsMin: "",
    paidStudentsMax: "",
    totalAmountMin: "",
    totalAmountMax: "",
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
      {/* College Code */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="collegeCode"
          placeholder="College Code"
          value={filters.collegeCode}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>

      {/* College Name */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="collegeName"
          placeholder="College Name"
          value={filters.collegeName}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>

      {/* Academic Year */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="academicYear"
          placeholder="Academic Year"
          value={filters.academicYear}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>

      {/* Total Students Range */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="number"
          name="totalStudentsMin"
          placeholder="Min Students"
          value={filters.totalStudentsMin}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>
      <div className="flex-1 min-w-[120px]">
        <input
          type="number"
          name="totalStudentsMax"
          placeholder="Max Students"
          value={filters.totalStudentsMax}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
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

const SportsDetails = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    collegeCode: "",
    collegeName: "",
    academicYear: "",
    totalStudentsMin: "",
    totalStudentsMax: "",
    paidStudentsMin: "",
    paidStudentsMax: "",
    totalAmountMin: "",
    totalAmountMax: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const token = localStorage.getItem("token");

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/sports`,
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
      const totalStudents = parseInt(app.totalStudents) || 0;
      const paidStudents = parseInt(app.paidStudents) || 0;
      const totalAmount = parseInt(app.totalAmount) || 0;
      
      return (
        (filters.collegeCode === "" ||
          app.collegeCode
            ?.toLowerCase()
            .includes(filters.collegeCode.toLowerCase())) &&
        (filters.collegeName === "" ||
          app.collegeName
            ?.toLowerCase()
            .includes(filters.collegeName.toLowerCase())) &&
        (filters.academicYear === "" ||
          app.academicYear
            ?.toLowerCase()
            .includes(filters.academicYear.toLowerCase())) &&
        (filters.totalStudentsMin === "" ||
          totalStudents >= parseInt(filters.totalStudentsMin)) &&
        (filters.totalStudentsMax === "" ||
          totalStudents <= parseInt(filters.totalStudentsMax)) &&
        (filters.paidStudentsMin === "" ||
          paidStudents >= parseInt(filters.paidStudentsMin)) &&
        (filters.paidStudentsMax === "" ||
          paidStudents <= parseInt(filters.paidStudentsMax)) &&
        (filters.totalAmountMin === "" ||
          totalAmount >= parseInt(filters.totalAmountMin)) &&
        (filters.totalAmountMax === "" ||
          totalAmount <= parseInt(filters.totalAmountMax))
      );
    });

    if (sortConfig.key) {
      return [...filtered].sort((a, b) => {
        // Convert to numbers for numeric fields
        if (["totalStudents", "paidStudents", "pendingStudents", "totalAmount"].includes(sortConfig.key)) {
          const aValue = parseInt(a[sortConfig.key]) || 0;
          const bValue = parseInt(b[sortConfig.key]) || 0;
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

  useEffect(() => {
    fetchApplications();
  }, [filters]);

  return (
    <div className="p-6">
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Sports Fee Applications
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
                  onClick={() => requestSort("collegeCode")}
                >
                  <div className="flex items-center">
                    <Hash className="w-4 h-4 mr-1" />
                    College Code
                    {sortConfig.key === "collegeCode" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("collegeName")}
                >
                  <div className="flex items-center">
                    <School className="w-4 h-4 mr-1" />
                    College Name
                    {sortConfig.key === "collegeName" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("academicYear")}
                >
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Academic Year
                    {sortConfig.key === "academicYear" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("totalStudents")}
                >
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Total Students
                    {sortConfig.key === "totalStudents" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("paidStudents")}
                >
                  <div className="flex items-center">
                    <Check className="w-4 h-4 mr-1" />
                    Paid Students
                    {sortConfig.key === "paidStudents" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("pendingStudents")}
                >
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Pending Students
                    {sortConfig.key === "pendingStudents" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("totalAmount")}
                >
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Total Amount
                    {sortConfig.key === "totalAmount" && (
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
                    <FileText className="w-4 h-4 mr-1" />
                    Remarks
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("createdAt")}
                >
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Submitted On
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
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.collegeCode}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.collegeName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.academicYear}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {app.totalStudents}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-green-600 font-medium">
                    {app.paidStudents}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-red-600 font-medium">
                    {app.pendingStudents}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                    ₹{app.totalAmount}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 max-w-[200px] truncate">
                    {app.remarks || '-'}
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

export default SportsDetails;