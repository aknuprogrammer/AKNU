import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CheckCircle2,
  Filter,
  XCircle,
  User,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { BASE_URL } from "../../config/urls";

const FilterBar = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    course: "",
    campus: "",
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
      className="flex flex-col md:flex-row md:items-center gap-3 p-3 bg-white border border-[#525b88] shadow-lg"
    >
      {/* Campus Dropdown */}
      <div className="flex-1 min-w-[120px]">
        <select
          name="campus"
          value={filters.campus}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        >
          <option value="">All Campus</option>
          <option value="rajamahendravaram">Rajamahendravaram</option>
          <option value="tadepalligudem">Tadepalligudem</option>
          <option value="kakinada">Kakinada</option>
        </select>
      </div>

      {/* Course Input */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="course" // ✅ corrected here (was "Course")
          placeholder="search by course"
          value={filters.course}
          onChange={handleChange}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^a-zA-Z' ]/g, "");
          }}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>

      {/* Decision Dropdown */}
      <div className="flex-1 min-w-[140px]">
        <select
          name="decision"
          value={filters.decision}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        >
          <option value="">All Decisions</option>
          <option value="pending">Pending</option>
          <option value="approve">Approved</option>
          <option value="rejected">Rejected</option>
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

export default function AdmissionDetails() {
  const [admissionForms, setAdmissionForms] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [sortByDateAsc, setSortByDateAsc] = useState(true);
  const [sortOrder, setSortOrder] = useState("asc"); // Track sort order
  const token = localStorage.getItem("token");
  const fetchAdmissionForms = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/admission-form/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAdmissionForms(response.data);
      setFilteredEvents(response.data);
    } catch (error) {
      console.error("Error fetching admission forms:", error.message);
    }
  };

  const handleFilter = (filters) => {
    const filtered = admissionForms.filter((form) => {
      return (
        (filters.course === "" ||
          form.preferredCourse
            .toLowerCase()
            .includes(filters.course.toLowerCase())) &&
        (filters.campus === "" ||
          form.preferredCampus
            .toLowerCase()
            .includes(filters.campus.toLowerCase())) &&
        (filters.decision === "" ||
          form.decision.toLowerCase().includes(filters.decision.toLowerCase()))
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
    setSortOrder(sortByDateAsc ? "desc" : "asc"); // Update sort order
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(
        `${BASE_URL}/admission-form/update-decision/${id}?action=approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`, // 👈 Correct placement bro!
            "Content-Type": "application/json", // Optional but good to have
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert("Approved Admission");
        await fetchAdmissionForms();
      } else {
        alert("Failed to approve Admission");
        console.error("Failed to approve Admission");
      }
    } catch (error) {
      console.error("Error approving Admission:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(
        `${BASE_URL}/admission-form/update-decision/${id}?action=reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`, // 👈 Correct placement again!
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        await fetchAdmissionForms();
        alert("Rejected Admission");
      } else {
        alert("Failed to reject Admission");
        console.error("Failed to reject Admission");
      }
    } catch (error) {
      console.error("Error rejecting Admission:", error);
    }
  };

  useEffect(() => {
    fetchAdmissionForms();
  }, []);

  return (
    <div className="min-h-screen overflow-y-hidden p-4 md:p-8">
      <h1 className="text-2xl font-bold text-[#525b88]  mb-6">
        Admission Applications
      </h1>
      <FilterBar onFilter={handleFilter} />
      <div className="bg-white shadow-md border mt-4 border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#525b88] text-white ">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white  uppercase tracking-wider"
              >
                Applicant
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Contact
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Course & Campus
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortByDate()}
              >
                Date {sortOrder === "asc" ? "▲" : "▼"}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Details
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEvents.map((form) => (
              <tr key={form._id} className="hover:bg-gray-50">
                {/* Applicant Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {form.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        Father: {form.fatherName}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Contact Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-1" />
                      {form.countryCode} {form.phone}
                    </div>
                    <div className="flex items-center mt-1">
                      <Mail className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="truncate max-w-[180px]">
                        {form.email}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Course Info */}
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="font-medium text-blue-700">
                      {form.preferredCourse}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      {form.preferredCampus}
                    </div>
                  </div>
                </td>

                {/* Date Column */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {form.createdAt
                    ? new Date(form.createdAt).toLocaleDateString()
                    : "-"}
                </td>

                {/* Additional Details */}
                <td className="px-6 py-4 align-top">
                  <div className="text-sm text-gray-700 space-y-1">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-800">DOB:</span>
                      <span className="ml-1">{form.dob}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">Gender:</span>
                      <span className="ml-1">{form.gender}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">
                        Aadhaar:
                      </span>
                      <span className="ml-1">{form.aadhaar}</span>
                    </div>
                    {form.message && (
                      <div className="text-xs italic text-gray-500 truncate max-w-[200px] mt-1">
                        <span className="font-medium text-gray-600">
                          Message:
                        </span>{" "}
                        "{form.message}"
                      </div>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {form.decision === "approve" && (
                    <span className="text-green-600 font-semibold">
                      Approved
                    </span>
                  )}

                  {form.decision === "rejected" && (
                    <span className="text-red-600 font-semibold">Rejected</span>
                  )}

                  {form.decision === "pending" && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleReject(form._id)}
                        className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none"
                      >
                        <XCircle className="-ml-0.5 mr-1.5 h-4 w-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(form._id)}
                        className="inline-flex items-center px-3 py-1 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-600 bg-white hover:bg-green-50 focus:outline-none"
                      >
                        <CheckCircle2 className="-ml-0.5 mr-1.5 h-4 w-4" />
                        Approve
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
