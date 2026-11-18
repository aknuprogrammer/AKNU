import React, { useEffect, useState } from "react";
import {
  Filter,
  User,
  Hash,
  BookOpen,
  Calendar,
  Phone,
  DollarSign,
  FileText,
  CheckCircle,
} from "lucide-react";
const FilterBar = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    registrationNumber: "",
    hallTicketNumber: "",
    studentName: "",
    course: "",
    subject: "",
    examYear: "",
    examType: "",
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

      {/* Hall Ticket Number */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="hallTicketNumber"
          placeholder="Hall Ticket"
          value={filters.hallTicketNumber}
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

      {/* Subject */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={filters.subject}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>

      {/* Exam Type */}
      <div className="flex-1 min-w-[120px]">
        <select
          name="examType"
          value={filters.examType}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        >
          <option value="">All Types</option>
          <option value="regular">Regular</option>
          <option value="supplementary">Supplementary</option>
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

const RatificationFeeApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    registrationNumber: "",
    hallTicketNumber: "",
    studentName: "",
    course: "",
    subject: "",
    examYear: "",
    examType: "",
    paymentStatus: "",
    feeMin: "",
    feeMax: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Static data for Ratification Fee
  const staticData = [
    {
      _id: "1",
      registrationNumber: "AKNU2024001",
      hallTicketNumber: "HT2024001",
      studentName: "Rajesh Kumar",
      course: "B.Tech",
      subject: "Advanced Algorithms",
      examYear: "2024",
      examType: "Regular",
      mobile: "9876543210",
      email: "rajesh.kumar@example.com",
      fee: "3000",
      paymentStatus: "PAID",
      createdAt: "2024-01-08",
    },
    {
      _id: "2",
      registrationNumber: "AKNU2024003",
      hallTicketNumber: "HT2024003",
      studentName: "Amit Patel",
      course: "M.Tech",
      subject: "Machine Learning",
      examYear: "2024",
      examType: "Regular",
      mobile: "9876543212",
      email: "amit.patel@example.com",
      fee: "3000",
      paymentStatus: "PENDING",
      createdAt: "2024-01-11",
    },
    {
      _id: "3",
      registrationNumber: "AKNU2024006",
      hallTicketNumber: "HT2024006",
      studentName: "Anjali Desai",
      course: "M.Sc",
      subject: "Data Structures",
      examYear: "2024",
      examType: "Supplementary",
      mobile: "9876543215",
      email: "anjali.desai@example.com",
      fee: "3000",
      paymentStatus: "PAID",
      createdAt: "2024-01-13",
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
      const fee = parseFloat(app.fee || app.ratificationFee || 0);

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
        (filters.course === "" ||
          app.course?.toLowerCase().includes(filters.course.toLowerCase())) &&
        (filters.subject === "" ||
          app.subject?.toLowerCase().includes(filters.subject.toLowerCase())) &&
        (filters.examYear === "" ||
          app.examYear?.toString().includes(filters.examYear)) &&
        (filters.examType === "" ||
          app.examType?.toLowerCase().includes(filters.examType.toLowerCase())) &&
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
        if (["fee", "ratificationFee"].includes(sortConfig.key)) {
          const aValue = parseFloat(a[sortConfig.key] || a.ratificationFee || 0);
          const bValue = parseFloat(b[sortConfig.key] || b.ratificationFee || 0);
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
          Ratification Fee Applications
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
                  onClick={() => requestSort("subject")}
                >
                  <div className="flex items-center">
                    Subject
                    {sortConfig.key === "subject" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("examYear")}
                >
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Exam Year
                    {sortConfig.key === "examYear" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("examType")}
                >
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Exam Type
                    {sortConfig.key === "examType" && (
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
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.hallTicketNumber || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {app.studentName || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.course || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.subject || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.examYear || "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {app.examType || "-"}
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
                      ₹{app.fee || app.ratificationFee || "0"}
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
                    colSpan="11"
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <CheckCircle className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-600">No ratification fee records found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Records will appear here once ratification applications are submitted
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

export default RatificationFeeApplications;

