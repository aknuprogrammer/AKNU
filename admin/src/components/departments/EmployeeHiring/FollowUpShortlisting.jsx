import React, { useState, useEffect } from "react";
import SectionCard from "./SectionCard";
import { applicationsApi } from "../../../services/apiService";
import { toast } from "react-hot-toast";
import { EyeIcon, FileTextIcon } from "lucide-react";

const FollowUpShortlisting = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await applicationsApi.getAll();
      // Handle both response.data.data and response.data formats
      const apps = response.data?.data || response.data || [];
      const allApps = Array.isArray(apps) ? apps : [];
      // Filter out already selected or rejected if desired, or show all actionable ones
      const actionable = allApps.filter(app => ["Received", "Shortlisted", "Interviewed"].includes(app.status));
      setApplications(actionable);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await applicationsApi.updateStatus(id, { status: newStatus });
      toast.success(`Candidate marked as ${newStatus}`);
      fetchApplications();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update candidate status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewDetails = (app) => {
    setSelectedApplication(app);
    setShowDetailsModal(true);
  };

  const statusColors = {
    Received: "bg-blue-50 text-blue-600",
    Shortlisted: "bg-emerald-50 text-emerald-600",
    Interviewed: "bg-orange-50 text-orange-600",
    Selected: "bg-green-50 text-green-600",
    Rejected: "bg-red-50 text-red-600",
  };

  return (
    <SectionCard
      title="Follow-Up & Shortlisting"
      description="Review submitted applications and move candidates through the selection stages."
    >
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-gray-500">No pending applications for review.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Candidate Information</th>
                <th className="px-6 py-4">Position Applied For</th>
                <th className="px-6 py-4">Applied Date</th>
                {/* <th className="px-6 py-4">Status</th> */}
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {applications.map((app) => (
                <tr
                  key={app._id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mr-3">
                        {app.candidateName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-gray-800">{app.candidateName}</p>
                        <p className="text-xs text-gray-400">{app.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-700">
                      {app.notificationId?.jobTitle || "N/A"}
                    </p>
                    <p className="text-xs text-emerald-600">
                      {app.notificationId?.departmentId?.title || "N/A"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  {/* <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        statusColors[app.status] || "bg-gray-50 text-gray-500"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td> */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(app)}
                          className="text-blue-600 cursor-pointer hover:text-blue-700 font-bold text-xs uppercase tracking-wider group-hover:underline transition-all"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={async () => {
                            try {
                              await applicationsApi.viewResume(app._id);
                            } catch (error) {
                              console.error("Error viewing resume:", error);
                              toast.error("Failed to view resume");
                            }
                          }}
                          className="text-emerald-600 cursor-pointer hover:text-emerald-700 font-bold text-xs uppercase tracking-wider group-hover:underline transition-all"
                        >
                          <FileTextIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <button
                          disabled={updatingId === app._id || app.status === "Shortlisted"}
                          onClick={() => handleStatusUpdate(app._id, "Shortlisted")}
                          className="px-2.5 py-1 cursor-pointer bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Shortlist
                        </button>
                        <button
                          disabled={updatingId === app._id || app.status === "Interviewed"}
                          onClick={() => handleStatusUpdate(app._id, "Interviewed")}
                          className="px-2.5 cursor-pointer py-1 bg-orange-50 text-orange-700 text-[10px] font-bold uppercase rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Interview
                        </button>
                        <button
                          disabled={updatingId === app._id}
                          onClick={() => handleStatusUpdate(app._id, "Selected")}
                          className="px-2.5 cursor-pointer py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Select
                        </button>
                        <button
                          disabled={updatingId === app._id}
                          onClick={() => handleStatusUpdate(app._id, "Rejected")}
                          className="px-2.5 cursor-pointer py-1 bg-red-50 text-red-700 text-[10px] font-bold uppercase rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Application Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-6 rounded-t-lg flex justify-between items-center">
              <h2 className="text-2xl font-bold">Application Details</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedApplication(null);
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <label className="">
                    Candidate Name : 
                  </label>
                  <p className="text-gray-800 font-semibold">{selectedApplication.candidateName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="">
                    Email : 
                  </label>
                  <p className="text-gray-800 font-semibold">{selectedApplication.email}</p>
                </div>
                <div className="flex items-center gap-2"  >
                  <label className="">
                    Phone : 
                  </label>
                  <p className="text-gray-800 font-semibold">{selectedApplication.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="">
                    Applied Date : 
                  </label>
                  <p className="text-gray-800 font-semibold">
                    {new Date(selectedApplication.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="">
                    Position : 
                  </label>
                  <p className="text-gray-800 font-semibold">{selectedApplication.notificationId?.jobTitle || "N/A"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="">
                    Department : 
                  </label>
                  <p className="text-gray-800 font-semibold">{selectedApplication.notificationId?.departmentId?.title || "N/A"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="">
                    Status : 
                  </label>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColors[selectedApplication.status] || "bg-gray-50 text-gray-500"}`}>
                    {selectedApplication.status}
                  </span>
                </div>
              </div>
              {selectedApplication.coverLetter && (
                <div className="flex items-center gap-2">
                  <label className="">
                    Cover Letter : 
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={async () => {
                    try {
                      await applicationsApi.viewResume(selectedApplication._id);
                    } catch (error) {
                      console.error("Error viewing resume:", error);
                      toast.error("Failed to view resume");
                    }
                  }}
                  className="flex-1 py-2 px-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  View Resume
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedApplication(null);
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
};

export default FollowUpShortlisting;

