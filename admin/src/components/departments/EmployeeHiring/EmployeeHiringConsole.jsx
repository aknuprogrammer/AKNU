import { useState, useEffect } from "react";
import HiringNotification from "./HiringNotification";
import ReceivingApplications from "./ReceivingApplications";
import FollowUpShortlisting from "./FollowUpShortlisting";
import SelectedCandidates from "./SelectedCandidates";
import { hiringApi } from "../../../services/apiService";
import { toast } from "react-hot-toast";

const EmployeeHiringConsole = () => {
  const [activeTab, setActiveTab] = useState("notification");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create, edit, view
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: "notification", name: "Hiring Notification" },
    { id: "applications", name: "Receiving Applications" },
    { id: "followup", name: "Follow-Up / Shortlisting" },
    { id: "selected", name: "Selected Candidates" },
  ];

  useEffect(() => {
    if (activeTab === "notification") {
      fetchNotifications();
    }
  }, [activeTab]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await hiringApi.getNotifications();
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode, data = null) => {
    setModalMode(mode);
    setSelectedNotification(data);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (modalMode === "create") {
        await hiringApi.createNotification(data);
        toast.success("Hiring Notification Created Successfully");
      } else if (modalMode === "edit") {
        await hiringApi.updateNotification(selectedNotification._id, data);
        toast.success("Notification Updated Successfully");
      }
      setIsModalOpen(false);
      fetchNotifications();
    } catch (error) {
      console.error("Error processing notification:", error);
      toast.error(error.message || `Failed to ${modalMode} notification`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;
    try {
      await hiringApi.deleteNotification(id);
      toast.success("Notification deleted");
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleToggleStatus = async (notif) => {
    const newStatus = notif.status === "Open" ? "Closed" : "Open";
    try {
      await hiringApi.updateNotification(notif._id, { status: newStatus });
      toast.success(`Notification ${newStatus === "Open" ? "Published" : "Unpublished"}`);
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "notification":
        return (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Job Postings</h2>
                <p className="text-sm text-gray-500 mt-1">Manage institutional hiring and recruitment records</p>
              </div>
              <button
                onClick={() => openModal("create")}
                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Notification
              </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Job Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Experience</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Deadline</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">Loading notifications...</td></tr>
                  ) : notifications.length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500 font-medium">No previous notifications</td></tr>
                  ) : (
                    notifications.map((notif) => (
                      <tr key={notif._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {notif.jobTitle}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {notif.departmentId?.title || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {notif.requiredExperience}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {notif.applicationDeadline ? new Date(notif.applicationDeadline).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                            notif.status === "Open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                          }`}>
                            {notif.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <div className="flex justify-center space-x-2">
                            <button onClick={() => openModal("view", notif)} title="View" className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button onClick={() => openModal("edit", notif)} title="Edit" className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button onClick={() => handleToggleStatus(notif)} title={notif.status === "Open" ? "Unpublish" : "Publish"} className={`p-1 rounded-md transition-colors ${notif.status === "Open" ? "text-orange-600 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}`}>
                              {notif.status === "Open" ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </button>
                            <button onClick={() => handleDelete(notif._id)} title="Delete" className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "applications":
        return <ReceivingApplications />;
      case "followup":
        return <FollowUpShortlisting />;
      case "selected":
        return <SelectedCandidates />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Hiring Center</h1>
        <p className="text-gray-500 mt-2">Manage institutional hiring and recruitment records.</p>
      </div>

      {/* Tabs Navigation - Matching Communication Style */}
      <div className="flex space-x-4 border-b overflow-x-auto pb-3 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content Area - Matching Communication Style */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {renderActiveTab()}
      </div>

      {/* Hiring Notification Modal */}
      {isModalOpen && (
        <HiringNotification
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={selectedNotification}
          mode={modalMode}
        />
      )}
    </div>
  );
};

export default EmployeeHiringConsole;


