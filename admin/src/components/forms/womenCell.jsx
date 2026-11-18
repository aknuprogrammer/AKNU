import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../config/urls";
import { Download, X } from "lucide-react";

const WomenCell = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingFile, setViewingFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState("");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/women-cell/complaints`);
        setComplaints(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);
  const safeIncludes = (value, search) => {
    if (!value || !search) return false;
    return String(value).toLowerCase().includes(search.toLowerCase());
  };

  // Then use it in your filter:
  const filteredComplaints = complaints.filter((c) => {
    if (!searchTerm) return true;
    return (
      safeIncludes(c.name, searchTerm) ||
      safeIncludes(c.department, searchTerm) ||
      safeIncludes(c.rollNo, searchTerm) ||
      safeIncludes(c.email, searchTerm) ||
      safeIncludes(c.phone, searchTerm) ||
      (c.complaintTypes && c.complaintTypes.some(type => safeIncludes(type, searchTerm)))
    );
  });



  const handleStatusUpdate = async () => {
    if (!selectedComplaint || !statusUpdate) return;

    try {
      await axios.put(
        `${BASE_URL}/women-cell/complaints/${selectedComplaint._id}`,
        { status: statusUpdate }
      );

      setComplaints((prev) =>
        prev.map((c) =>
          c._id === selectedComplaint._id ? { ...c, status: statusUpdate } : c
        )
      );
      setSelectedComplaint(null);
      setStatusUpdate("");
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString.slice(0, 5); // Just show hours:minutes
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        Error loading complaints: {error}
      </div>
    );
  }

  const bufferToUrl = (bufferData, mimeType) => {
    const blob = new Blob([new Uint8Array(bufferData.data)], {
      type: mimeType,
    });
    return URL.createObjectURL(blob);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-teal-800 text-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold">
            Women's Cell Complaint Admin Panel
          </h1>
          <p className="mt-2 text-teal-100">
            View and manage all submitted complaints
          </p>
        </div>

        {/* Search Field */}
        <div className="p-6 mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Name, Department, Roll No, Email, or Phone..."
              className="w-[45%] pl-10 border-2 border-teal-100 p-2 focus:outline-none focus:border-teal-500 transition-colors"
            />
            <div className="absolute left-3 top-3.5 text-teal-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Complaint Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Complaint Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Incident Date
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Files
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredComplaints.length > 0 ? (
                  filteredComplaints.map((complaint) => (
                    <tr key={complaint._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {complaint.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {complaint.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {complaint.department}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {complaint.rollNo}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {(complaint.complaintTypes || []).join(", ")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(complaint.incidentDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatTime(complaint.incidentTime)}
                        </div>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            complaint.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : complaint.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : complaint.status === "resolved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {complaint.status
                            ? complaint.status.replace("_", " ").toUpperCase()
                            : "PENDING"}
                        </span>
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {complaint.files?.length > 0 ? (
                            <div className="space-y-1">
                              {complaint.files.map((file, index) => {
                                const fileUrl = bufferToUrl(
                                  file.buffer,
                                  file.mimeType
                                );
                                return (
                                  <button
                                    key={index}
                                    onClick={() =>
                                      setViewingFile({ ...file, url: fileUrl })
                                    }
                                    className="flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                                  >
                                    <svg
                                      className="h-4 w-4 mr-1" /* ... file icon ... */
                                    />
                                    <span className="truncate max-w-xs">
                                      {file.originalName}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            "NA"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedComplaint(complaint)}
                          className="text-teal-600 hover:text-teal-900 mr-3"
                        >
                          View
                        </button>
                        {/* <button
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setStatusUpdate("");
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Update
                        </button> */}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No complaints found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* File Viewer Modal */}
        {viewingFile && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="flex justify-between items-center bg-gray-100 p-4 border-b">
                <h3 className="text-lg font-semibold truncate max-w-[60%]">
                  {viewingFile.originalName}
                </h3>
                <div className="flex items-center gap-4">
                  <a
                    href={viewingFile.url}
                    download={viewingFile.originalName}
                    className="p-2 text-teal-600 hover:bg-teal-50 rounded-full transition-colors"
                    title="Download File"
                  >
                    <Download size={20} />
                  </a>
                  <button
                    onClick={() => {
                      URL.revokeObjectURL(viewingFile.url);
                      setViewingFile(null);
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
                    title="Close"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-4 overflow-auto flex-grow flex items-center justify-center bg-gray-50">
                {viewingFile.mimeType.startsWith("image/") ? (
                  <img
                    src={viewingFile.url}
                    alt={viewingFile.originalName}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <iframe
                    src={viewingFile.url}
                    className="w-full h-full border-0"
                    title={viewingFile.originalName}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Complaint Detail Modal */}
        {selectedComplaint && (
          <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Complaint Details
                  </h2>
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      Personal Information
                    </h3>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedComplaint.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Department/Course
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedComplaint.department}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Roll No/Employee ID
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedComplaint.rollNo}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Contact Information
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        Phone: {selectedComplaint.phone}
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        Email: {selectedComplaint.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Residential Address
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedComplaint.address}
                      </p>
                    </div>
                  </div>

                  {/* Complaint Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      Complaint Details
                    </h3>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Complaint Types
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {(selectedComplaint.complaintTypes || []).join(", ")}
                      </p>
                      {selectedComplaint.otherComplaint && (
                        <p className="mt-1 text-sm text-gray-900">
                          <span className="font-medium">Other:</span>{" "}
                          {selectedComplaint.otherComplaint}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Incident Details
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        Date: {formatDate(selectedComplaint.incidentDate)}
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        Time: {formatTime(selectedComplaint.incidentTime)}
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        Place: {selectedComplaint.incidentPlace}
                      </p>
                    </div>
                    {selectedComplaint.involvedPerson && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Involved Person(s)
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedComplaint.involvedPerson}
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          Designation: {selectedComplaint.involvedDesignation}
                        </p>
                      </div>
                    )}
                    {selectedComplaint.witnessName && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Witness(es)
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          Name: {selectedComplaint.witnessName}
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          Contact: {selectedComplaint.witnessContact}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Resolution Preference
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedComplaint.resolution}
                      </p>
                      {selectedComplaint.otherResolution && (
                        <p className="mt-1 text-sm text-gray-900">
                          <span className="font-medium">Other:</span>{" "}
                          {selectedComplaint.otherResolution}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Supporting Files */}
                {selectedComplaint.supportingFiles?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      Supporting Documents
                    </h3>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedComplaint.supportingFiles.map((file, index) => (
                        <div
                          key={index}
                          className="border rounded-md p-3 hover:bg-gray-50"
                        >
                          <div className="flex items-center">
                            <svg
                              className="h-8 w-8 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.filename}
                              </p>
                              <p className="text-xs text-gray-500">
                                {Math.round(file.size / 1024)} KB
                              </p>
                            </div>
                          </div>
                          <a
                            href={`${BASE_URL}/api/women-cell/files/${file.filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-teal-700 bg-teal-100 hover:bg-teal-200"
                          >
                            View/Download
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Update Section */}
                {/* <div className="mt-8 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Update Complaint Status
                  </h3>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <select
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select new status</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button
                      onClick={handleStatusUpdate}
                      disabled={!statusUpdate}
                      className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Update Status
                    </button>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WomenCell;
