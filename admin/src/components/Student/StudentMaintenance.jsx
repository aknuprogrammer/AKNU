import React, { useState, useEffect } from "react";
import { Plus, Wrench, AlertTriangle, CheckCircle, Clock, FileText, Search, XCircle } from "lucide-react";
import { apiRequest } from "../../services/apiService";
import { Toaster, toast } from "react-hot-toast";

const StudentMaintenance = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        registrationNumber: "",
        category: "Electrical",
        description: "",
        priority: "medium"
    });

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await apiRequest("hostel/student/maintenance");
            setRequests(response.data || []);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to fetch requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.description) {
            toast.error("Please provide a description");
            return;
        }

        setSubmitting(true);
        try {
            await apiRequest("hostel/maintenance/apply", "POST", formData);
            toast.success("Maintenance request submitted successfully!");
            setShowModal(false);
            setFormData({
                registrationNumber: "",
                category: "Electrical",
                description: "",
                priority: "medium"
            });
            fetchRequests();
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to submit request");
        } finally {
            setSubmitting(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            completed: "bg-green-100 text-green-700 border-green-200",
            cancelled: "bg-red-100 text-red-700 border-red-200",
            pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
            "in-progress": "bg-blue-100 text-blue-700 border-blue-200"
        };

        return (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
            </div>
        );
    };

    const PriorityBadge = ({ priority }) => {
        const styles = {
            urgent: "text-red-600 bg-red-50",
            high: "text-orange-600 bg-orange-50",
            medium: "text-blue-600 bg-blue-50",
            low: "text-gray-600 bg-gray-50"
        };
        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${styles[priority]}`}>
                {priority}
            </span>
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <Toaster position="top-right" />
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#2a3563]">Maintenance Queries</h1>
                        <p className="text-gray-500 mt-1 text-sm">Submit and track your hostel maintenance requests</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-5 py-2.5 bg-[#525b88] text-white rounded-lg hover:bg-[#3a4166] transition-all shadow-sm hover:shadow-md flex items-center gap-2 font-medium text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Request
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                            <div className="w-8 h-8 border-4 border-[#525b88] border-t-transparent rounded-full animate-spin mb-3"></div>
                            <p className="text-sm">Loading your requests...</p>
                        </div>
                    ) : requests.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                        <th className="px-6 py-4">Reg No</th>
                                        <th className="px-6 py-4">Hostel</th>
                                        <th className="px-6 py-4">Applied On</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4">Priority</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Action Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {requests.map((request) => (
                                        <tr key={request._id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-[#2a3563]">
                                                    {request.applicationId?.registrationNumber || "N/A"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                                {request.applicationId?.hostelName || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "N/A"}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {request.category}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={request.description}>
                                                {request.description}
                                            </td>
                                            <td className="px-6 py-4">
                                                <PriorityBadge priority={request.priority} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={request.status} />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {request.actionBy ? (
                                                    <div className="mb-1">
                                                        <span className="text-[10px] font-bold uppercase text-gray-400 block mb-0.5">Handled By</span>
                                                        <span className="text-xs font-semibold text-[#525b88] bg-[#525b88]/5 px-1.5 py-0.5 rounded">
                                                            {request.actionBy.name || request.actionBy.email.split('@')[0]}
                                                        </span>
                                                    </div>
                                                ) : null}
                                                {request.remarks ? (
                                                    <div className="text-xs text-gray-500 italic mt-1 border-l-2 border-gray-100 pl-2">
                                                        "{request.remarks}"
                                                    </div>
                                                ) : request.actionBy ? null : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-16 text-center flex flex-col items-center justify-center text-gray-400">
                            <div className="bg-gray-50 p-4 rounded-full mb-3">
                                <Wrench className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-lg font-medium text-gray-600">No maintenance requests</p>
                            <p className="text-sm mt-1">Found something broken? Let us know!</p>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2a3563]/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden shrink-0">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Submit Maintenance Request</h3>
                                <p className="text-xs text-gray-500">Tell us what needs attention</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Registration Number</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter your Registration Number"
                                    value={formData.registrationNumber}
                                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all text-sm font-medium text-gray-700 uppercase"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all text-sm font-medium text-gray-700"
                                >
                                    <option value="Electrical">Electrical</option>
                                    <option value="Plumbing">Plumbing</option>
                                    <option value="Carpentry">Carpentry</option>
                                    <option value="Cleaning">Cleaning</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Priority</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all text-sm font-medium text-gray-700"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                                <textarea
                                    required
                                    rows="4"
                                    placeholder="Describe the issue in detail (e.g., Room 102 fan making noise)..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all text-sm resize-none"
                                ></textarea>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2.5 bg-[#525b88] text-white rounded-lg hover:bg-[#3a4166] transition-all shadow-md flex items-center justify-center gap-2 font-semibold text-sm disabled:opacity-70"
                                >
                                    {submitting ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        "Submit Request"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentMaintenance;
