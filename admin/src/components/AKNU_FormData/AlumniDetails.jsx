import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Briefcase,
  GraduationCap,
  Hash,
  Filter,
  Home,
  Phone,
  Building,
  MapPin,
  BookOpen,
  FileText,
  Check,
} from "lucide-react";
import { BASE_URL } from "../../config/urls";

const FilterBar = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    registrationNumber: "",
    name: "",
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
      className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-1/2 p-3 bg-white border border-[#525b88] shadow-lg"
    >
      <div className="w-full md:flex-1">
        <input
          type="text"
          name="name"
          placeholder="Search By Name"
          value={filters.name}
          onChange={handleChange}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^a-zA-Z' ]/g, "");
          }}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>

      <div className="w-full md:w-auto">
        <button
          type="submit"
          className="w-full md:w-auto flex items-center justify-center px-4 py-2 h-[37px] rounded-md text-sm font-medium transition-colors bg-[#525B88] text-white hover:bg-[#3a4166]"
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};

export default function AlumniDetails() {
  const [alumniData, setAlumniData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [sortByDateAsc, setSortByDateAsc] = useState(true);
  const [sortOrder, setSortOrder] = useState("asc");
  const [expandedRow, setExpandedRow] = useState(null);

  const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const handleFilter = (filters) => {
    const filtered = alumniData.filter((alumni) => {
      const fullName = `${alumni.firstName} ${alumni.lastName}`.toLowerCase();
      return (
        filters.name === "" || fullName.includes(filters.name.toLowerCase())
      );
    });
    setFilteredEvents(filtered);
  };

  const handleSortByDate = () => {
    const sorted = [...filteredEvents].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return sortByDateAsc ? dateA - dateB : dateB - dateA;
    });
    setFilteredEvents(sorted);
    setSortByDateAsc(!sortByDateAsc);
    setSortOrder(sortByDateAsc ? "desc" : "asc");
  };

  const toggleRowExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const token = localStorage.getItem("token");
  const fetchAlumniData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/alumni-form/alumni-registration`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      
      const processedData = data.map(alumni => {
        if (alumni.photo && alumni.photo.data) {
          return {
            ...alumni,
            photoBase64: arrayBufferToBase64(alumni.photo.data),
            photoContentType: alumni.photoContentType
          };
        }
        return alumni;
      });
      
      setAlumniData(processedData);
      setFilteredEvents(processedData);
    } catch (error) {
      console.error("Error fetching alumni data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumniData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#525b88] mb-6">
        Alumni Directory
      </h2>
      <FilterBar onFilter={handleFilter} />
      {loading ? (
        <div className="flex justify-center mt-4 items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="border overflow-x-auto mt-4 border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#525b88]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Alumni Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Current Occupation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Pass Out Year
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                  onClick={handleSortByDate}
                >
                  Date {sortOrder === "asc" ? "▲" : "▼"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((alumni) => (
                <React.Fragment key={alumni._id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {alumni.photoBase64 && alumni.photoContentType ? (
                          <div className="flex-shrink-0 rounded-full p-1 mr-3 border border-gray-200">
                            <img
                              src={`data:${alumni.photoContentType};base64,${alumni.photoBase64}`}
                              alt="Profile"
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-3">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                        <div className="font-medium text-gray-900">
                          {alumni.firstName} {alumni.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        {alumni.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 text-gray-400 mr-2" />
                        {alumni.currentOccupation}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {alumni.branch}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {alumni.passOutYear}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {alumni.createdAt
                        ? new Date(alumni.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => toggleRowExpand(alumni._id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {expandedRow === alumni._id ? "Hide" : "View"} Details
                      </button>
                    </td>
                  </tr>
                  {expandedRow === alumni._id && (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-4">
                            <div className="flex items-start">
                              <Building className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-gray-700">College</h4>
                                <p className="text-gray-600">{alumni.college || "Not specified"}</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <Phone className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-gray-700">Phone</h4>
                                <p className="text-gray-600">{alumni.phone || "Not specified"}</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <Home className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-gray-700">Address</h4>
                                <p className="text-gray-600">
                                  {alumni.address1 || "Not specified"}
                                  {alumni.address2 && `, ${alumni.address2}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <MapPin className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-gray-700">Location</h4>
                                <p className="text-gray-600">
                                  {[alumni.city, alumni.state, alumni.country]
                                    .filter(Boolean)
                                    .join(", ") || "Not specified"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-start">
                              <BookOpen className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-gray-700">Highest Qualification</h4>
                                <p className="text-gray-600">{alumni.highestQualification || "Not specified"}</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <Briefcase className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-gray-700">Current Designation</h4>
                                <p className="text-gray-600">{alumni.currentDesignation || "Not specified"}</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <Building className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-gray-700">Current Company</h4>
                                <p className="text-gray-600">{alumni.currentCompany || "Not specified"}</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <FileText className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-gray-700">Description</h4>
                                <p className="text-gray-600">{alumni.description || "Not specified"}</p>
                              </div>
                            </div>
                            <div className="flex items-start">
                              <Check className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-gray-700">Terms Accepted</h4>
                                <p className="text-gray-600">{alumni.terms ? "Yes" : "No"}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}