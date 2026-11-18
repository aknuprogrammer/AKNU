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
  DollarSign,
  FileText,
  School,
} from "lucide-react";
const FilterBar = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    studentName: "",
    registrationNumber: "",
    course: "",
    branch: "",
    yearSemester: "",
    collegeName: "",
    applicationType: "",
    paymentStatus: "",
    feeMin: "",
    feeMax: "",
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

      {/* College Name */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="collegeName"
          placeholder="College"
          value={filters.collegeName}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>

      {/* Application Type */}
      <div className="flex-1 min-w-[120px]">
        <select
          name="applicationType"
          value={filters.applicationType}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        >
          <option value="">All Types</option>
          <option value="UG">UG</option>
          <option value="PG">PG</option>
          <option value="PhD">PhD</option>
        </select>
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

const ApplicationFeeApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    studentName: "",
    registrationNumber: "",
    course: "",
    branch: "",
    yearSemester: "",
    collegeName: "",
    applicationType: "",
    paymentStatus: "",
    feeMin: "",
    feeMax: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Static data for Application Fee
  const staticData = [
    {
      _id: "1",
      registrationNumber: "AKNU2024001",
      studentName: "Rajesh Kumar",
      course: "B.Tech",
      branch: "Computer Science",
      collegeName: "Rajamahendravaram Campus",
      applicationType: "UG",
      mobile: "9876543210",
      email: "rajesh.kumar@example.com",
      fee: "1500",
      paymentStatus: "PAID",
      createdAt: "2024-01-15",
    },
    {
      _id: "2",
      registrationNumber: "AKNU2024002",
      studentName: "Priya Sharma",
      course: "B.Sc",
      branch: "Mathematics",
      collegeName: "Tadepalligudem Campus",
      applicationType: "UG",
      mobile: "9876543211",
      email: "priya.sharma@example.com",
      fee: "1500",
      paymentStatus: "PENDING",
      createdAt: "2024-01-16",
    },
    {
      _id: "3",
      registrationNumber: "AKNU2024003",
      studentName: "Amit Patel",
      course: "M.Tech",
      branch: "Electronics",
      collegeName: "Kakinada Campus",
      applicationType: "PG",
      mobile: "9876543212",
      email: "amit.patel@example.com",
      fee: "2000",
      paymentStatus: "PARTIAL",
      createdAt: "2024-01-17",
    },
    {
      _id: "4",
      registrationNumber: "AKNU2024004",
      studentName: "Sneha Reddy",
      course: "M.Sc",
      branch: "Physics",
      collegeName: "Vizianagaram Campus",
      applicationType: "PG",
      mobile: "9876543213",
      email: "sneha.reddy@example.com",
      fee: "2000",
      paymentStatus: "PAID",
      createdAt: "2024-01-18",
    },
  ];

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setApplications(staticData);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setError(error.message);
      setApplications([]);
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
      const fee = parseFloat(app.fee || app.applicationFee || 0);

      return (
        (filters.studentName === "" ||
          app.studentName
            ?.toLowerCase()
            .includes(filters.studentName.toLowerCase())) &&
        (filters.registrationNumber === "" ||
          app.registrationNumber
            ?.toString()
            .toLowerCase()
            .includes(filters.registrationNumber.toLowerCase())) &&
        (filters.course === "" ||
          app.course?.toLowerCase().includes(filters.course.toLowerCase())) &&
        (filters.branch === "" ||
          app.branch?.toLowerCase().includes(filters.branch.toLowerCase())) &&
        (filters.yearSemester === "" ||
          app.yearSemester
            ?.toLowerCase()
            .includes(filters.yearSemester.toLowerCase())) &&
        (filters.collegeName === "" ||
          app.collegeName
            ?.toLowerCase()
            .includes(filters.collegeName.toLowerCase())) &&
        (filters.applicationType === "" ||
          app.applicationType
            ?.toLowerCase()
            .includes(filters.applicationType.toLowerCase())) &&
        (filters.paymentStatus === "" ||
          app.paymentStatus
            ?.toLowerCase()
            .includes(filters.paymentStatus.toLowerCase())) &&
        (filters.feeMin === "" || fee >= parseFloat(filters.feeMin)) &&
        (filters.feeMax === "" || fee <= parseFloat(filters.feeMax))
      );
    });

    if (sortConfig.key) {
      return [...filtered].sort((a, b) => {
        if (["fee", "applicationFee"].includes(sortConfig.key)) {
          const aValue = parseFloat(a[sortConfig.key] || a.applicationFee || 0);
          const bValue = parseFloat(b[sortConfig.key] || b.applicationFee || 0);
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }
        if (sortConfig.key === "createdAt" || sortConfig.key === "applicationDate") {
          const dateA = new Date(a[sortConfig.key] || a.applicationDate || 0);
          const dateB = new Date(b[sortConfig.key] || b.applicationDate || 0);
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
          Application Fee Applications
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
                  onClick={() => requestSort("fee")}
                >
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Fee (₹)
                    {sortConfig.key === "fee" && (
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
              {filteredAndSortedApplications.length > 0 ? (
                filteredAndSortedApplications.map((app) => (
                  <tr key={app._id || app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.registrationNumber || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {app.studentName || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.course || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.branch || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.collegeName || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {app.applicationType || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span>{app.mobile || app.phoneNumber || "-"}</span>
                        {app.email && (
                          <span className="text-xs text-gray-500 truncate max-w-[120px]">
                            {app.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ₹{app.fee || app.applicationFee || "0"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          app.paymentStatus === "PAID"
                            ? "bg-green-100 text-green-800"
                            : app.paymentStatus === "PARTIAL"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {app.paymentStatus || "PENDING"}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.createdAt || app.applicationDate
                        ? new Date(app.createdAt || app.applicationDate).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-600">No application fee records found</p>
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
      )}
    </div>
  );
};

export default ApplicationFeeApplications;

