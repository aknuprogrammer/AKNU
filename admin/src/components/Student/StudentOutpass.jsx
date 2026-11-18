import React, { useState, useEffect } from "react";
import { Plus, Clock, Calendar, CheckCircle, XCircle, AlertCircle, FileText, Search } from "lucide-react";
import { apiRequest } from "../../services/apiService"; // Assuming this is the standard way to make requests
import { Toaster, toast } from "react-hot-toast";

const StudentOutpass = () => {
    const [outpasses, setOutpasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        registrationNumber: "",
        outDate: new Date().toISOString().split("T")[0],
        outTime: "",
        expectedReturnDate: new Date().toISOString().split("T")[0],
        expectedReturnTime: "",
        purpose: ""
    });

    const fetchOutpasses = async () => {
        setLoading(true);
        try {
            const response = await apiRequest("hostel/student/outpass");
            setOutpasses(response.data || []);
        } catch (err) {
            console.error(err);
            // toast.error("Failed to fetch history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOutpasses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validation updated
        if (!formData.registrationNumber || !formData.outTime || !formData.expectedReturnTime || !formData.purpose) {
            toast.error("Please fill in all fields");
            return;
        }

        setSubmitting(true);
        try {
            await apiRequest("hostel/outpass/apply", "POST", formData);
            toast.success("Outpass application submitted successfully!");
            setShowModal(false);
            setFormData({
                registrationNumber: "", // Reset
                outDate: new Date().toISOString().split("T")[0],
                outTime: "",
                expectedReturnDate: new Date().toISOString().split("T")[0],
                expectedReturnTime: "",
                purpose: ""
            });
            fetchOutpasses();
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to submit application");
        } finally {
            setSubmitting(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            approved: "bg-green-100 text-green-700 border-green-200",
            rejected: "bg-red-100 text-red-700 border-red-200",
            pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
            returned: "bg-blue-100 text-blue-700 border-blue-200"
        };

        const icons = {
            approved: <CheckCircle className="w-3.5 h-3.5" />,
            rejected: <XCircle className="w-3.5 h-3.5" />,
            pending: <AlertCircle className="w-3.5 h-3.5" />,
            returned: <CheckCircle className="w-3.5 h-3.5" />
        };

        return (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                {icons[status] || <Clock className="w-3.5 h-3.5" />}
                {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
            </div>
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#2a3563]">Outpass Applications</h1>
                        <p className="text-gray-500 mt-1 text-sm">Manage your hostel outpass requests and view history</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-5 py-2.5 bg-[#525b88] text-white rounded-lg hover:bg-[#3a4166] transition-all shadow-sm hover:shadow-md flex items-center gap-2 font-medium text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Apply Outpass
                    </button>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Card Header with Search (Dummy for consistent look) */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search history..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                            <div className="w-8 h-8 border-4 border-[#525b88] border-t-transparent rounded-full animate-spin mb-3"></div>
                            <p className="text-sm">Loading your applications...</p>
                        </div>
                    ) : outpasses.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                        <th className="px-6 py-4">Reg No</th>
                                        <th className="px-6 py-4">Applied On</th>
                                        <th className="px-6 py-4">Out Details</th>
                                        <th className="px-6 py-4">Expected Return</th>
                                        <th className="px-6 py-4">Actual Return</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Approved By</th>
                                        <th className="px-6 py-4">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {outpasses.map((pass) => (
                                        <tr key={pass._id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {pass.applicationId?.registrationNumber || "-"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(pass.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{pass.outDate}</span>
                                                    <span className="text-xs text-gray-500">{pass.outTime}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{pass.expectedReturnDate || pass.outDate}</span>
                                                    <span className="text-xs text-gray-500">{pass.expectedReturnTime}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-green-600">
                                                {pass.actualReturnTime || <span className="text-gray-400 font-normal">-</span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={pass.purpose}>
                                                {pass.purpose}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={pass.status} />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {pass.actionBy ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">{pass.actionBy.email || pass.actionBy.name || "Admin"}</span>
                                                        <span className="text-xs text-gray-500">{new Date(pass.actionDate).toLocaleDateString()}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 italic">
                                                {pass.remarks || <span className="text-gray-300">-</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-16 text-center flex flex-col items-center justify-center text-gray-400">
                            <div className="bg-gray-50 p-4 rounded-full mb-3">
                                <FileText className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-lg font-medium text-gray-600">No applications yet</p>
                            <p className="text-sm mt-1">Click "Apply Outpass" to create your first request.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Application Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2a3563]/40 backdrop-blur-sm p-4 transition-all">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">New Application</h3>
                                <p className="text-xs text-gray-500">Fill details to request a hostel outpass</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Added Registration Number Input */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Registration Number</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter your registration number"
                                    value={formData.registrationNumber}
                                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all text-sm font-medium text-gray-700"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Out Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split("T")[0]}
                                        value={formData.outDate}
                                        onChange={(e) => setFormData({ ...formData, outDate: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all text-sm font-medium text-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Expected Return Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={formData.outDate}
                                        value={formData.expectedReturnDate}
                                        onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all text-sm font-medium text-gray-700"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Out Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.outTime}
                                        onChange={(e) => setFormData({ ...formData, outTime: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all text-sm font-medium text-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Expected Return Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.expectedReturnTime}
                                        onChange={(e) => setFormData({ ...formData, expectedReturnTime: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all text-sm font-medium text-gray-700"
                                    />
                                </div>
                            </div>


                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Purpose of Visit</label>
                                <textarea
                                    required
                                    rows="3"
                                    placeholder="Enter detailed reason (e.g., Medical appointment, Family function)..."
                                    value={formData.purpose}
                                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
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
                                    className="flex-1 px-4 py-2.5 bg-[#525b88] text-white rounded-lg hover:bg-[#3a4166] transition-all font-semibold text-sm disabled:opacity-70 flex justify-center items-center gap-2 shadow-sm hover:shadow"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Application"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )}
        </div >
    );
};

export default StudentOutpass;
