import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../config/urls";
import { Download, X } from "lucide-react";

const CDCComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingFile, setViewingFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/cdc-complaint/complaints`);
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

  const filteredComplaints = complaints.filter((c) => {
    if (!searchTerm) return true;
    return (
      safeIncludes(c.complainantName, searchTerm) ||
      safeIncludes(c.affiliatedCollegeName, searchTerm) ||
      safeIncludes(c.mobileNumber, searchTerm) ||
      safeIncludes(c.emailId, searchTerm)
    );
  });



  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const bufferToUrl = (bufferData, mimeType) => {
    const blob = new Blob([new Uint8Array(bufferData.data)], { type: mimeType });
    return URL.createObjectURL(blob);
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-teal-500"></div></div>;
  if (error) return <div className="p-4 text-red-700 bg-red-100">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#525B88]">CDC Complaint Admin Panel</h1>
          <p className="mt-2">Manage Affiliated College complaints</p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Complainant Name or College or Mobile or Email"
              className="w-[45%] pl-10 border-2 border-teal-100 p-2 focus:outline-none focus:border-teal-500 transition-colors"
            />
            <div className="absolute left-3 top-3.5 text-teal-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Complainant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">College</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nature</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Files</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredComplaints.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{c.complainantName}<br/><span className="text-xs text-gray-500">{c.emailId}</span></td>
                  <td className="px-6 py-4 text-sm">{c.affiliatedCollegeName}</td>
                  <td className="px-6 py-4 text-sm">{formatDate(c.incidentDate)}</td>
                  <td className="px-6 py-4 text-sm">{(c.natureOfComplaint || []).join(", ")}</td>
                  <td className="px-6 py-4">
                    {c.files?.length > 0 ? (
                      <button onClick={() => setViewingFile({...c.files[0], url: bufferToUrl(c.files[0].buffer, c.files[0].mimeType)})} className="text-blue-600 cursor-pointer hover:underline">View File</button>
                    ) : "NA"}
                  </td>
                  <td className="px-6 py-4"><button onClick={() => setSelectedComplaint(c)} className="cursor-pointer">View Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Details Modal */}
        {selectedComplaint && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">CDC Complaint Details</h2>
                <button onClick={() => setSelectedComplaint(null)} className="text-gray-500 cursor-pointer"><X /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className=" border-b mb-2">Complainant Details</h3>
                  <p>Name: {selectedComplaint.complainantName}</p>
                  <p>College: {selectedComplaint.affiliatedCollegeName}</p>
                  <p>Address: {selectedComplaint.address}</p>
                  <p>Mobile: {selectedComplaint.mobileNumber}</p>
                  <p>Email: {selectedComplaint.emailId}</p>
                </div>
                <div>
                  <h3 className=" border-b mb-2">Complaint Info</h3>
                  <p>Nature: {(selectedComplaint.natureOfComplaint || []).join(", ")}</p>
                  <p>Date: {formatDate(selectedComplaint.incidentDate)}</p>
                  <p>Reported to Authority: {selectedComplaint.reportedToAuthority}</p>
                  {selectedComplaint.authorityDetails && <p>Authority Details: {selectedComplaint.authorityDetails}</p>}
                </div>
              </div>
              <div className="mt-6">
                <h3 className=" border-b mb-2">Description</h3>
                <p className="bg-gray-50 p-4 rounded whitespace-pre-wrap">{selectedComplaint.description}</p>
              </div>
              {selectedComplaint.files?.length > 0 && (
                <div className="mt-6">
                  <h3 className="border-b mb-2">Supporting Files</h3>
                  <div className="flex gap-4">
                    {selectedComplaint.files.map((f, i) => (
                      <a key={i} href={bufferToUrl(f.buffer, f.mimeType)} download={f.originalName} className="p-2 flex items-center gap-2  text-teal-700 ">
                        <Download size={15}/> <span>{f.originalName}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* File Viewer */}
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
      </div>
    </div>
  );
};

export default CDCComplaint;
