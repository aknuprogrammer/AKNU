import React, { useEffect, useState } from "react";
import {
  Filter,
  Hash,
  User,
  BookOpen,
  School,
  Calendar,
  FileText,
  Phone,
  Mail,
  ClipboardList,
} from "lucide-react";
import { BASE_URL } from "../../config/urls";

const FilterBar = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    registrationNumber: "",
    hallTicketNumber: "",
    studentName: "",
    collegeName: "",
    courseName: "",
    yearSemester: "",
    applicationType: "",
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  return (
    <div className="w-full bg-white border border-[#525b88] shadow-lg rounded-md overflow-hidden">
      <form onSubmit={handleSubmit} className="p-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3 overflow-x-auto pb-2">
          {/* Compact filter inputs with smaller min-width */}
          <div className="flex-none min-w-[150px]">
            <input
              type="text"
              name="registrationNumber"
              placeholder="Reg Number"
              value={filters.registrationNumber}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>

          <div className="flex-none min-w-[150px]">
            <input
              type="text"
              name="hallTicketNumber"
              placeholder="Hall Ticket"
              value={filters.hallTicketNumber}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>

          <div className="flex-none min-w-[150px]">
            <input
              type="text"
              name="studentName"
              placeholder="Student Name"
              value={filters.studentName}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>

          <div className="flex-none min-w-[150px]">
            <input
              type="text"
              name="collegeName"
              placeholder="College"
              value={filters.collegeName}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>

          <div className="flex-none min-w-[120px]">
            <input
              type="text"
              name="courseName"
              placeholder="Course"
              value={filters.courseName}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>

          <div className="flex-none min-w-[100px]">
            <input
              type="text"
              name="yearSemester"
              placeholder="Year/Sem"
              value={filters.yearSemester}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>

          <div className="flex-none min-w-[120px]">
            <select
              name="applicationType"
              value={filters.applicationType}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            >
              <option value="">All Types</option>
              <option value="regular">Regular</option>
              <option value="supplementary">Supplementary</option>
            </select>
          </div>

          {/* Apply Filter Button */}
          <div className="flex-none">
            <button
              type="submit"
              className={`flex items-center justify-center px-3 py-1.5 h-[36px] rounded-md text-sm font-medium transition-colors bg-[#525B88] text-white hover:bg-[#3a4166]`}
            >
              <Filter className="h-4 w-4" />
              <span className="ml-1 hidden md:inline">Filter</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

const FeesForm = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    registrationNumber: "",
    hallTicketNumber: "",
    studentName: "",
    collegeName: "",
    courseName: "",
    yearSemester: "",
    applicationType: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const token = localStorage.getItem("token");

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/exam`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
      return (
        (filters.registrationNumber === "" ||
          app.registrationNumber
            ?.toString()
            .toLowerCase()
            .includes(filters.registrationNumber.toLowerCase())) &&
        (filters.hallTicketNumber === "" ||
          app.hallTicketNumber
            ?.toString()
            .toLowerCase()
            .includes(filters.hallTicketNumber.toLowerCase())) &&
        (filters.studentName === "" ||
          app.studentName
            ?.toLowerCase()
            .includes(filters.studentName.toLowerCase())) &&
        (filters.collegeName === "" ||
          app.collegeName
            ?.toLowerCase()
            .includes(filters.collegeName.toLowerCase())) &&
        (filters.courseName === "" ||
          app.courseName
            ?.toLowerCase()
            .includes(filters.courseName.toLowerCase())) &&
        (filters.yearSemester === "" ||
          app.yearSemester
            ?.toLowerCase()
            .includes(filters.yearSemester.toLowerCase())) &&
        (filters.applicationType === "" ||
          app.applicationType
            ?.toLowerCase()
            .includes(filters.applicationType.toLowerCase()))
      );
    });

    if (sortConfig.key) {
      return [...filtered].sort((a, b) => {
        if (sortConfig.key === "dob" || sortConfig.key === "createdAt") {
          const dateA = new Date(a[sortConfig.key] || 0);
          const dateB = new Date(b[sortConfig.key] || 0);
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
          Examination Fee Applications
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
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer whitespace-nowrap"
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
                  onClick={() => requestSort("hallTicketNumber")}
                >
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    Hall Ticket
                    {sortConfig.key === "hallTicketNumber" && (
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
                  onClick={() => requestSort("fatherName")}
                >
                  <div className="flex items-center">
                    Father
                    {sortConfig.key === "fatherName" && (
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
                  onClick={() => requestSort("collegeName")}
                >
                  <div className="flex items-center">
                    <School className="w-4 h-4 mr-1" />
                    College
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
                  onClick={() => requestSort("courseName")}
                >
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    Course
                    {sortConfig.key === "courseName" && (
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
                  onClick={() => requestSort("subjects")}
                >
                  <div className="flex items-center">
                    <ClipboardList className="w-4 h-4 mr-1" />
                    Subjects
                    {sortConfig.key === "subjects" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("applicationType")}
                >
                  <div className="flex items-center">
                    Type
                    {sortConfig.key === "applicationType" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("feePaid")}
                >
                  <div className="flex items-center">
                    Fee (₹)
                    {sortConfig.key === "feePaid" && (
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
                    <Mail className="w-4 h-4 mr-1" />
                    Email
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    Mobile
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("createdAt")}
                >
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Applied On
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
                    {app.registrationNumber}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.hallTicketNumber}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.studentName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.fatherName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.dob ? new Date(app.dob).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.collegeName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.courseName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.yearSemester}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 max-w-[200px] truncate">
                    {app.subjects}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {app.applicationType}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ₹{app.feePaid}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 max-w-[180px] truncate">
                    {app.email || "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.mobile}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.createdAt
                      ? new Date(app.createdAt).toLocaleDateString()
                      : "-"}
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

export default FeesForm;
