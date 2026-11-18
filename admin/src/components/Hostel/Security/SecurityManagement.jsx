/**
 * Security & Access Control Management Component
 * Manages security and access control (Visitor Management)
 */
import React, { useState, useEffect, useMemo } from "react";
import { Plus, UserCheck, Clock, Search, Loader2, LogOut, Phone, User, FileText } from "lucide-react";
import { FilterBar, DataTable, Modal, StatusBadge, SummaryCard } from "../shared";
import { apiRequest } from "../../../services/apiService";
import { toast } from "react-hot-toast";

const SecurityManagement = () => {
  const [activeTab, setActiveTab] = useState("visitors");
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: "entryTime", direction: "desc" });

  const [visitorFormData, setVisitorFormData] = useState({
    visitorName: "",
    visitorPhone: "",
    visitorIdProof: "",
    registrationNumber: "",
    relationship: "",
    purpose: ""
  });

  const [studentInfo, setStudentInfo] = useState(null);
  const [lookingUpStudent, setLookingUpStudent] = useState(false);

  /**
   * Fetch visitors
   */
  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await apiRequest(`hostel/visitors?${queryParams}`);
      if (response.success) {
        setVisitors(response.data || []);
      }
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch visitors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [filters]);

  const handleLookupStudent = async () => {
    const regNo = visitorFormData.registrationNumber.trim();
    if (!regNo) {
      toast.error("Please enter a registration number");
      return;
    }

    setLookingUpStudent(true);
    try {
      const response = await apiRequest(`hostel/visitors/lookup/${regNo}`);
      if (response.success) {
        setStudentInfo(response.data);
        toast.success("Student found!");
      }
    } catch (err) {
      setStudentInfo(null);
      toast.error(err.message || "Student not found or not an active hostel resident");
    } finally {
      setLookingUpStudent(false);
    }
  };

  const handleRegisterVisitor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await apiRequest("hostel/visitors", "POST", visitorFormData);
      if (response.success) {
        toast.success("Visitor registered successfully!");
        setShowModal(false);
        fetchVisitors();
        setVisitorFormData({
          visitorName: "",
          visitorPhone: "",
          visitorIdProof: "",
          registrationNumber: "",
          relationship: "",
          purpose: ""
        });
        setStudentInfo(null);
      }
    } catch (err) {
      toast.error(err.message || "Failed to register visitor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = async (id) => {
    if (!window.confirm("Are you sure you want to checkout this visitor?")) return;
    try {
      const response = await apiRequest(`hostel/visitors/${id}/checkout`, "PATCH");
      if (response.success) {
        toast.success("Visitor checked out!");
        fetchVisitors();
      }
    } catch (err) {
      toast.error(err.message || "Failed to checkout visitor");
    }
  };

  /**
   * Calculate statistics
   */
  const statistics = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayVisitors = visitors.filter((v) =>
      v.entryTime?.startsWith(today)
    ).length;
    const activeVisitors = visitors.filter((v) => v.status === "active").length;

    return {
      todayVisitors,
      activeVisitors,
    };
  }, [visitors]);

  /**
   * Visitor columns
   */
  const visitorColumns = [
    { key: "visitorName", title: "Visitor Name", cellType: "text" },
    { key: "visitorPhone", title: "Phone", cellType: "text" },
    { key: "relationship", title: "Relationship", cellType: "text" },
    { key: "visitorIdProof", title: "ID Proof", cellType: "text" },
    {
      key: "studentRegNo",
      title: "Host (Reg No)",
      cellType: "custom",
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-[#525b88]">{row.studentId?.studentName || "N/A"}</span>
          <span className="text-xs text-gray-500">{row.studentRegNo}</span>
        </div>
      )
    },
    { key: "purpose", title: "Purpose", cellType: "text" },
    {
      key: "entryTime",
      title: "Entry",
      cellType: "custom",
      render: (value) => value ? new Date(value).toLocaleString() : "-",
    },
    {
      key: "exitTime",
      title: "Exit",
      cellType: "custom",
      render: (value) => value ? new Date(value).toLocaleString() : "-",
    },
    {
      key: "status",
      title: "Status",
      cellType: "custom",
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: "actions",
      title: "Actions",
      cellType: "custom",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.status === "active" && (
            <button
              onClick={() => handleCheckout(row._id)}
              className="flex items-center px-2 py-1 text-[10px] font-bold text-red-600 border border-red-200 rounded hover:bg-red-50 transition-all uppercase tracking-tighter"
            >
              <LogOut className="w-3 h-3 mr-1" />
              Checkout
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Security & Visitor Management
        </h2>
        <button
          onClick={() => {
            setSelectedItem(null);
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Register Visitor
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Visitors Today"
          value={statistics.todayVisitors}
          icon={UserCheck}
          color="blue"
        />
        <SummaryCard
          title="Currently In"
          value={statistics.activeVisitors}
          icon={Clock}
          color="yellow"
        />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <FilterBar
          filters={filters}
          onFilter={setFilters}
          filterConfig={[
            {
              name: "registrationNumber",
              type: "text",
              label: "Host Reg No",
              placeholder: "Search by Host Reg No..."
            },
            {
              name: "date",
              type: "date",
              label: "Entry Date"
            },
            {
              name: "status",
              type: "select",
              label: "Status",
              options: [
                { value: "active", label: "Active" },
                { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled" }
              ],
              placeholder: "All Status"
            }
          ]}
        />
      </div>

      {/* Visitor List */}
      <DataTable
        data={visitors}
        columns={visitorColumns}
        loading={loading}
        error={error}
        sortConfig={sortConfig}
        onSort={setSortConfig}
      />

      {/* Register Visitor Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Register New Visitor"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleRegisterVisitor} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Visitor Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#525b88] uppercase tracking-wider flex items-center">
                <User className="w-4 h-4 mr-2" />
                Visitor Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 pointer-events-none uppercase">Visitor Name</label>
                  <input
                    type="text"
                    required
                    value={visitorFormData.visitorName}
                    onChange={(e) => setVisitorFormData({ ...visitorFormData, visitorName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 outline-none text-sm"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 pointer-events-none uppercase">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={visitorFormData.visitorPhone}
                    onChange={(e) => setVisitorFormData({ ...visitorFormData, visitorPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 outline-none text-sm"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 pointer-events-none uppercase">ID Proof (Aadhar/Other)</label>
                <input
                  type="text"
                  required
                  value={visitorFormData.visitorIdProof}
                  onChange={(e) => setVisitorFormData({ ...visitorFormData, visitorIdProof: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 outline-none text-sm"
                  placeholder="ID Number"
                />
              </div>
            </div>

            {/* Host Info */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-[#525b88] uppercase tracking-wider flex items-center">
                <Search className="w-4 h-4 mr-2" />
                Host Student Details
              </h3>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 pointer-events-none uppercase">Host Registration Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={visitorFormData.registrationNumber}
                    onChange={(e) => {
                      setVisitorFormData({ ...visitorFormData, registrationNumber: e.target.value });
                      setStudentInfo(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 outline-none text-sm"
                    placeholder="e.g. AKNU2024001"
                  />
                  <button
                    type="button"
                    onClick={handleLookupStudent}
                    disabled={lookingUpStudent || !visitorFormData.registrationNumber}
                    className="px-4 py-2 bg-[#525b88] text-white rounded-lg hover:bg-[#3a4166] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-bold uppercase tracking-wider"
                  >
                    {lookingUpStudent ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    {lookingUpStudent ? "Looking..." : "Lookup"}
                  </button>
                </div>
              </div>
              {studentInfo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                    <UserCheck className="w-4 h-4" />
                    Student Found
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500 font-semibold">Name:</span>
                      <p className="font-bold text-gray-700">{studentInfo.studentName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold">Hostel:</span>
                      <p className="font-bold text-gray-700">{studentInfo.hostelId?.name || studentInfo.hostelName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold">Room:</span>
                      <p className="font-bold text-gray-700">{studentInfo.roomNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold">Bed:</span>
                      <p className="font-bold text-gray-700">{studentInfo.bedNumber}</p>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 pointer-events-none uppercase">Relationship to Student</label>
                <select
                  required
                  value={visitorFormData.relationship}
                  onChange={(e) => setVisitorFormData({ ...visitorFormData, relationship: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 outline-none text-sm"
                >
                  <option value="">-- Select Relationship --</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Relative">Relative</option>
                  <option value="Friend">Friend</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 pointer-events-none uppercase">Purpose of Visit</label>
                <textarea
                  required
                  rows="3"
                  value={visitorFormData.purpose}
                  onChange={(e) => setVisitorFormData({ ...visitorFormData, purpose: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 outline-none text-sm resize-none"
                  placeholder="Reason for meeting..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all uppercase tracking-wider"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 text-sm font-bold text-white bg-[#525b88] rounded-xl hover:bg-[#3a4166] shadow-lg shadow-[#525b88]/20 transition-all flex items-center justify-center min-w-[150px] uppercase tracking-wider"
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Register Entry"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SecurityManagement;
