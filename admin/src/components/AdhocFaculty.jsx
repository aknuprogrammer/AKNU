import React, { useState, useEffect } from "react";
import axios from "axios";
import DisplayDownload_FormDetails from "./form_upload/DisplayDownload_FormDetails";
import { BASE_URL } from "../config/urls";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";

const AdhocFaculty = () => {
  const [limit, setLimit] = useState(200);
  const [startDate, setStartDate] = useState("");
  const [searchName, setSearchName] = useState("");
  const [data, setData] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchPhone, setSearchPhone] = useState("");
  const [page, setPage] = useState(1);

  const fetchDocuments = async (pageNum = 1) => {
    setIsLoading(true);

    try {
      const response = await axios.get(BASE_URL + "/get-documents", {
        params: {
          limit: parseInt(limit),
          skip: (pageNum - 1) * limit,
          startDate: startDate || undefined,
          name: searchName || undefined,
          mobileNumber: searchPhone || undefined,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
      const rawData = response.data.data;
      const seenPhones = new Set();
      const seenEmails = new Set();
      const uniqueData = rawData.filter((item) => {
        if (seenPhones.has(item.mobileNumber) || seenEmails.has(item.email)) {
          return false;
        }
        seenPhones.add(item.mobileNumber);
        seenEmails.add(item.email);
        return true;
      });

      setData(uniqueData);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch data");
    }
    setIsLoading(false);
  };

  // Fetch data when page changes
  useEffect(() => {
    fetchDocuments(page);
    // eslint-disable-next-line
  }, [page]);

  const handleDownload = (fileObj) => {
    if (!fileObj?.buffer || !fileObj?.mimetype) {
      alert("Invalid file structure");
      return;
    }

    const byteCharacters = atob(fileObj.buffer);

    const byteNumbers = new Array(byteCharacters.length)
      .fill()
      .map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], { type: fileObj.mimetype });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileObj.originalname || "file";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#525B88] mb-6">
          Admin Panel for Ad-hoc Faculty
        </h1>

        {/* Compact Filters */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 p-4 w-full bg-white border border-[#525b88]  shadow-sm">
          <div className="flex-1">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z' ]/g, "");
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              placeholder="Search by name"
            />
          </div>

          <div className="flex-1">
            <input
              type="text"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              placeholder="Search by phone"
            />
          </div>

          <div className="flex-1">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>

          <button
            onClick={fetchDocuments}
            disabled={isLoading}
            className={`flex items-center justify-center px-4 py-2 h-[37px] rounded-md text-sm font-medium transition-colors ${
              isLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#525B88] text-white hover:bg-[#3a4166]"
            }`}
          >
            {isLoading ? "Fetching..." : <Filter className="h-4 w-4" />}
          </button>
        </div>
        {/* Fetch Button */}

        {/* Status Messages */}
        {error && (
          <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        {/* Table Controls */}
        <div className="flex justify-between items-center mt-6 mb-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Showing {data.length} records (Page {page})
          </h2>
          <div className="flex items-center space-x-2">
            <button
              className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs font-semibold text-gray-700">
              {page}
            </span>
            <button
              className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
              onClick={() =>
                setPage((prev) => (data.length === limit ? prev + 1 : prev))
              }
              disabled={data.length < limit}
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Compact Table */}
        <div className="overflow-auto border border-gray-200  shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#525b88]">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Department
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((doc) => (
                <tr key={doc._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {doc.name}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {doc.email}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {doc.mobileNumber}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {doc.department}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="text-blue-600 hover:text-blue-900 text-xs font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-4 text-center text-sm text-gray-500"
                  >
                    No records found. Adjust filters and try again.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 backdrop-blur-sm bg-transparent bg-opacity-30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Application Details
                </h3>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <DisplayDownload_FormDetails
                  obj={selectedDoc}
                  files={Object.entries(selectedDoc || {})
                    .filter(
                      ([_, value]) =>
                        value &&
                        typeof value === "object" &&
                        "data" in value &&
                        "fileName" in value
                    )
                    .map(([key]) => key)}
                />

                {selectedDoc.files &&
                  Object.values(selectedDoc.files).length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Attachments
                      </h4>
                      <ul className="space-y-2">
                        {Object.values(selectedDoc.files).map((file, idx) => (
                          <li
                            key={idx}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-600 truncate max-w-xs">
                              {file.originalname}
                            </span>
                            <button
                              onClick={() => handleDownload(file)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              Download
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdhocFaculty;
