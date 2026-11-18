import axios from "axios";
import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config/urls";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ChatWithUs() {
  const [chatData, setChatData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [subDepartmentFilter, setSubDepartmentFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10); // Number of records per page

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/chat-with-us/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setChatData(response.data.data.reverse());
        setFilteredData(response.data.data);
      } else {
        console.error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = chatData;

    if (departmentFilter) {
      result = result.filter((item) =>
        item.department?.toLowerCase().includes(departmentFilter.toLowerCase())
      );
    }

    if (subDepartmentFilter) {
      result = result.filter((item) =>
        item.subDepartment
          ?.toLowerCase()
          .includes(subDepartmentFilter.toLowerCase())
      );
    }

    setFilteredData(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [departmentFilter, subDepartmentFilter, chatData]);

  const sortByDate = () => {
    const sortedData = [...filteredData].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);

      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setFilteredData(sortedData);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get unique departments and sub-departments for filter options
  const departments = [...new Set(chatData.map((item) => item.department))];
  const subDepartments = [
    ...new Set(chatData.map((item) => item.subDepartment)),
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#525B88] mb-6">
        Chat With Us Records
      </h1>

      {/* Filter Section */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4 p-4 w-full bg-white border border-[#525b88]  shadow-sm">
        <div className="flex-1">
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            value={departmentFilter}
            onChange={(e) =>
              setDepartmentFilter(
                e.target.value === "Others" ? "" : e.target.value
              )
            }
          >
            <option value="">All Departments</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>
                {dept?.trim() ? dept : "Others"}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <select
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            value={subDepartmentFilter}
            onChange={(e) =>
              setSubDepartmentFilter(
                e.target.value === "Others" ? "" : e.target.value
              )
            }
          >
            <option value="">All Sub-Departments</option>
            {subDepartments.map((subDept, index) => (
              <option key={index} value={subDept}>
                {subDept?.trim() ? subDept : "Others"}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="w-full flex justify-end mb-4">
        {filteredData.length > recordsPerPage && (
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                disabled={currentPage === 1}
                title="Previous Page"
                className={`p-1.5 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="px-2 text-xs font-semibold text-gray-700">
                {currentPage}
              </span>

              <button
                onClick={() =>
                  paginate(
                    currentPage < totalPages ? currentPage + 1 : totalPages
                  )
                }
                disabled={currentPage === totalPages}
                title="Next Page"
                className={`p-1.5 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white  overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#525B88]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Aadhaar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Sub-Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Message
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:text-blue-500"
                  onClick={sortByDate}
                >
                  Date {sortOrder === "asc" ? "▲" : "▼"}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRecords.map((item, index) => (
                <tr
                  key={item._id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.countryCode} {item.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.aadhaar}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.department?.trim() ? item.department : "NAN"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.subDepartment?.trim() ? item.subDepartment : "NAN"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {item.message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredData.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No records found matching your filters.
          </div>
        )}
      </div>

      {/* Pagination */}
    </div>
  );
}
