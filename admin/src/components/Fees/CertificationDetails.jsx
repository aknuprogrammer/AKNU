import React, { useEffect, useState } from "react";
import {
  User,
  BookOpen,
  School,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  ClipboardList,
  Target,
  Filter,
  Hash,
} from "lucide-react";
import { BASE_URL } from "../../config/urls";
import ApplicationSelector from "./certificateSelector";
const FilterBar = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    registrationNumber: "",
    selectCollege: "",
    mobileNumber: "",
    yearOfPassing: "",
    name: "",
    decision: "",
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
      {/* Branch */}

      {/* Name */}
      {/* Registration Number */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="registrationNumber"
          placeholder="search by reg no"
          value={filters.registrationNumber}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={filters.name}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>

      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="mobileNumber"
          placeholder="mobileNumber"
          value={filters.mobileNumber}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="yearOfPassing"
          placeholder="yearOfPassing"
          value={filters.yearOfPassing}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>
      <div className="flex-1 min-w-[120px]">
        <select
          name="selectCollege"
          value={filters.selectCollege}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        >
          <option value="">All Campus</option>
          <option value="rajamahendravaram">Rajamahendravaram</option>
          <option value="tadepalligudem">Tadepalligudem</option>
          <option value="kakinada">Kakinada</option>
        </select>
      </div>

      {/* Decision Dropdown */}

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
const CertificateDetails = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    registrationNumber: "",
    selectCollege: "",
    mobileNumber: "",
    yearOfPassing: "",
    name: "",
    decision: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Fetch data
  const token = localStorage.getItem("token");

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/certification-form/apply-certificate`,
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

  // Filter function
  const handleFilter = (filters) => {
    setFilters(filters);
  };

  // Sorting function
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Combined filtered and sorted data
  const filteredAndSortedApplications = React.useMemo(() => {
    // First apply filters
    const filtered = applications.filter((form) => {
      return (
        (filters.registrationNumber === "" ||
          form.registrationNumber
            ?.toString()
            .toLowerCase()
            .includes(filters.registrationNumber.toLowerCase())) &&
        (filters.selectCollege === "" ||
          form.selectCollege
            ?.toLowerCase()
            .includes(filters.selectCollege.toLowerCase())) &&
        (filters.mobileNumber === "" ||
          form.mobileNumber
            ?.toString()
            .toLowerCase()
            .includes(filters.mobileNumber.toLowerCase())) &&
        (filters.yearOfPassing === "" ||
          form.yearOfPassing
            ?.toString()
            .toLowerCase()
            .includes(filters.yearOfPassing.toLowerCase())) &&
        (filters.name === "" ||
          form.name?.toLowerCase().includes(filters.name.toLowerCase())) &&
        (filters.decision === "" ||
          form.decision?.toLowerCase().includes(filters.decision.toLowerCase()))
      );
    });

    // Then apply sorting if configured
    if (sortConfig.key) {
      return [...filtered].sort((a, b) => {
        if (sortConfig.key === "createdAt") {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
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
          Certificate Applications
        </h2>
        <a
          href="/ApplicationSelector"
          className="flex items-center space-x-2 group transition-all duration-200"
        >
          <span className="text-[#525b88] group-hover:text-[#3a4377] font-medium text-lg transition-colors duration-200">
            Go to Form Selectors
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-[#525b88] group-hover:text-[#3a4377] transition-colors duration-200"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </a>
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
                    Reg Number
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
                  onClick={() => requestSort("nameSSC")}
                >
                  <div className="flex items-center">
                    Name (SSC)
                    {sortConfig.key === "nameSSC" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("selectCourse")}
                >
                  <div className="flex items-center">
                    Course
                    {sortConfig.key === "selectCourse" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("selectCollege")}
                >
                  <div className="flex items-center">
                    College
                    {sortConfig.key === "selectCollege" && (
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
                    App Type
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
                  onClick={() => requestSort("applicationPurpose")}
                >
                  <div className="flex items-center">
                    Purpose
                    {sortConfig.key === "applicationPurpose" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("mobileNumber")}
                >
                  <div className="flex items-center">
                    Mobile
                    {sortConfig.key === "mobileNumber" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("eMail")}
                >
                  <div className="flex items-center">
                    Email
                    {sortConfig.key === "eMail" && (
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
                  <div className="flex items-center">Address</div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("dateOfBirth")}
                >
                  <div className="flex items-center">
                    DOB
                    {sortConfig.key === "dateOfBirth" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("admittedYear")}
                >
                  <div className="flex items-center">
                    Admitted
                    {sortConfig.key === "admittedYear" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer whitespace-nowrap"
                  onClick={() => requestSort("yearOfPassing")}
                >
                  <div className="flex items-center">
                    Month/Year Pass
                    {sortConfig.key === "yearOfPassing" && (
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
                  <div className="flex items-center">Document</div>
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("createdAt")}
                >
                  <div className="flex items-center">
                    Date{" "}
                    {sortConfig.key === "createdAt" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "▲" : "▼"}
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
                    {app.nameSSC?.trim()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.selectCourse}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.selectCollege}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.applicationType?.trim()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.applicationPurpose}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.mobileNumber}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <div className="max-w-[180px] truncate">{app.eMail}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <div className="max-w-[200px] truncate">
                      {app.fullAddress?.trim()}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.dateOfBirth?.trim()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.admittedYear}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.monthOfPassing} / {app.yearOfPassing}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.uploadDocuments ? (
                      <a
                        href={`${BASE_URL}/certification-form/file/${app._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 border border-blue-300 rounded-full text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        {app.uploadDocuments.fileName}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">No File</span>
                    )}
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

export default CertificateDetails;
