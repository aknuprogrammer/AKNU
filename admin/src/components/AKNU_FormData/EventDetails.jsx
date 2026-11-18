import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle2, XCircle, Filter } from "lucide-react";
import { BASE_URL } from "../../config/urls";

const FilterBar = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    occupation: "",
    eventTitle: "",
    location: "",
    name: "",
    registrationNumber: "",
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
      className="flex flex-col md:flex-row md:items-end gap-4 p-4 w-full bg-white border border-[#525b88] rounded-lg shadow-sm"
    >
      {/* Branch */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="occupation"
          placeholder="search by occupation"
          value={filters.occupation}
          onChange={handleChange}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^a-zA-Z' ]/g, "");
          }}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>
      {/* Event Title */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="eventTitle"
          placeholder="search by event title"
          value={filters.eventTitle}
          onChange={handleChange}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^a-zA-Z' ]/g, "");
          }}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>
      {/* Location */}

      {/* Name */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="name"
          placeholder="search by name"
          value={filters.name}
          onChange={handleChange}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^a-zA-Z' ]/g, "");
          }}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        />
      </div>
      {/* Registration Number */}
      <div className="flex-1 min-w-[120px]">
        <input
          type="text"
          name="registrationNumber"
          placeholder="search by reg no"
          value={filters.registrationNumber}
          onChange={handleChange}
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
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

export default function EventDetails() {
  const [formUploads, setFormUploads] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [sortByDateAsc, setSortByDateAsc] = useState(true);
  const [sortOrder, setSortOrder] = useState("asc");

  const token = localStorage.getItem("token");
  const fetchFormUploads = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/form-upload/`, {
        headers: {
          Authorization: `Bearer ${token}`, // 👈 Proper placement bro!
        },
      });
  
      setFormUploads(response.data);
      setFilteredEvents(response.data);
    } catch (error) {
      console.error("Error fetching form uploads:", error.message);
      alert("Failed to fetch data. Please try again.");
    }
  };
  const handleFilter = (filters) => {
    const filtered = formUploads.filter((event) => {
      return (
        (filters.occupation === "" ||
          event.occupation
            .toLowerCase()
            .includes(filters.occupation.toLowerCase())) &&
        (filters.eventTitle === "" ||
          event.eventTitle
            .toLowerCase()
            .includes(filters.eventTitle.toLowerCase())) &&
        (filters.location === "" ||
          event.location
            .toLowerCase()
            .includes(filters.location.toLowerCase())) &&
        (filters.name === "" ||
          event.name.toLowerCase().includes(filters.name.toLowerCase())) &&
        (filters.registrationNumber === "" ||
          event.registrationNumber
            .toLowerCase()
            .includes(filters.registrationNumber.toLowerCase())) &&
        (filters.decision === "" ||
          event.decision.toLowerCase().includes(filters.decision.toLowerCase()))
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

  const handleApprove = async (id) => {
    try {
      const response = await fetch(
        `${BASE_URL}/form-upload/update-decision/${id}?action=approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        await fetchFormUploads();
        alert("Event approved successfully!");
        // Optionally, refresh your list here or update state to remove the approved item
      } else {
        alert("Failed to approve event");
        console.error("Failed to approve event");
      }
    } catch (error) {
      alert("Error approving event");
      console.error("Error approving event:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(
        `${BASE_URL}/form-upload/update-decision/${id}?action=reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        await fetchFormUploads();
        alert("Event rejected successfully!");
        // Optionally, refresh your list here or update state to remove the rejected item
      } else {
        alert("Failed to reject event");
        console.error("Failed to reject event");
      }
    } catch (error) {
      alert("Error rejecting event");
      console.error("Error rejecting event:", error);
    }
  };

  useEffect(() => {
    fetchFormUploads();
  }, []);

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold text-[#525b88] mb-8">
        Event Submissions
      </h1>
      <FilterBar onFilter={handleFilter} />
      <div className="bg-white  mt-3  border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#525b88]">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Event
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Contact
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer"
                onClick={handleSortByDate}
              >
                Date {sortOrder === "asc" ? "▲" : "▼"}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Occupation
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
              >
                Description
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
            {filteredEvents.map((event) => (
              <tr key={event._id} className="hover:bg-gray-50">
                {/* Event Info */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-[#525b88] bg-opacity-10 p-2 rounded-full mr-3">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-xs text-gray-900">
                        {event.eventTitle}
                      </div>
                      <div className="text-sm text-gray-500">
                        {event.location}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Organizer Info */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{event.name}</div>
                </td>

                {/* Contact Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center">{event.phoneNumber}</div>
                  </div>
                </td>

                {/* CreatedAt Date */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {event.createdAt
                    ? new Date(event.createdAt).toLocaleDateString()
                    : "-"}
                </td>

                {/* Additional Details */}
                <td className="px-6 py-4">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold  ">
                    {event.occupation}
                  </span>
                </td>

                {/* Description */}
                <td className="px-6 py-4 max-w-[250px] break-words" title={event.description}>
                  <span className="text-xs text-gray-600">
                    {event.description || "-"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  {event.decision === "approve" && (
                    <span className="text-green-600 font-semibold">
                      Approved
                    </span>
                  )}

                  {event.decision === "rejected" && (
                    <span className="text-red-600 font-semibold">Rejected</span>
                  )}

                  {event.decision === "pending" && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleReject(event._id)}
                        className="inline-flex items-center px-3 py-1 cursor-pointer text-sm font-medium text-red-600 "
                      >
                        <XCircle className="-ml-0.5 mr-1.5 h-4 w-4" />
                        
                      </button>
                      <button
                        onClick={() => handleApprove(event._id)}
                        className="inline-flex items-center px-3 py-1 cursor-pointer text-sm font-medium text-green-600"
                      >
                        <CheckCircle2 className="-ml-0.5 mr-1.5 h-4 w-4" />
                        
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
