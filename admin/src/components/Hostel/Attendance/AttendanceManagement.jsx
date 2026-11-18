/**
 * Attendance & Leave Management Component
 * Tracks student/staff presence and manages leave requests
 */
import React, { useState, useEffect, useMemo } from "react";
import { Plus, Calendar, Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import { FilterBar, DataTable, Modal, StatusBadge, SummaryCard } from "../shared";
import { API } from "../../../config/urls";

const AttendanceManagement = () => {
  const [activeTab, setActiveTab] = useState("attendance"); // attendance, leaves, outpass
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [outPasses, setOutPasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("in"); // "in" or "out"
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split("T")[0],
    hostelId: ""
  });
  const [hostels, setHostels] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  /**
   * Fetch attendance
   */
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await API.get("/hostel/attendance", {
        params: {
          hostelId: filters.hostelId,
          date: filters.date || new Date().toISOString().split("T")[0]
        }
      });
      if (response.data && response.data.success) {
        setAttendance(response.data.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch leaves
   */
  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const response = await API.get("/hostel/leaves", {
        params: { hostelId: filters.hostelId }
      });
      if (response.data && response.data.success) {
        setLeaves(response.data.data.map(l => ({
          ...l,
          registrationNumber: l.applicationId?.registrationNumber || l.applicationId?.employeeId,
          name: l.applicationId?.studentName || l.applicationId?.employeeName
        })));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch out passes
   */
  const fetchOutPasses = async () => {
    setLoading(true);
    try {
      const response = await API.get("/hostel/outpass", {
        params: { hostelId: filters.hostelId }
      });
      if (response.data && response.data.success) {
        setOutPasses(response.data.data.map(o => ({
          ...o,
          registrationNumber: o.applicationId?.registrationNumber || o.applicationId?.employeeId,
          name: o.applicationId?.studentName || o.applicationId?.employeeName
        })));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await API.get("/hostel");
        if (response.data && response.data.success) {
          setHostels(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching hostels:", err);
      }
    };
    fetchHostels();
  }, []);

  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttendance();
    } else if (activeTab === "leaves") {
      fetchLeaves();
    } else if (activeTab === "outpass") {
      fetchOutPasses();
    }
  }, [activeTab, filters]);

  /**
   * Calculate statistics
   */
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0, pendingLeaves: 0 });

  const fetchStats = async () => {
    try {
      const response = await API.get("/hostel/attendance/stats");
      if (response.data && response.data.success) {
        setStats({
          present: response.data.data.presentCount,
          absent: response.data.data.absentCount,
          total: response.data.data.totalActive,
          pendingLeaves: leaves.filter(l => l.status === "pending").length
        });
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [attendance, leaves]);

  /**
   * Attendance columns
   */
  const attendanceColumns = [
    { key: "registrationNumber", title: "Reg No", cellType: "text" },
    { key: "name", title: "Name", cellType: "text" },
    { key: "date", title: "Date", cellType: "date" },
    {
      key: "status",
      title: "Status",
      cellType: "custom",
      render: (value) => <StatusBadge status={value} />,
    },
    { key: "checkInTime", title: "Check In", cellType: "text" },
    { key: "checkOutTime", title: "Check Out", cellType: "text" },
  ];

  /**
   * Leave columns
   */
  const leaveColumns = [
    { key: "registrationNumber", title: "Reg No", cellType: "text" },
    { key: "name", title: "Name", cellType: "text" },
    { key: "leaveType", title: "Leave Type", cellType: "text" },
    { key: "startDate", title: "Start Date", cellType: "date" },
    { key: "endDate", title: "End Date", cellType: "date" },
    { key: "reason", title: "Reason", cellType: "text" },
    {
      key: "status",
      title: "Status",
      cellType: "custom",
      render: (value) => <StatusBadge status={value} />,
    },
  ];

  /**
   * Out pass columns
   */
  const outPassColumns = [
    { key: "registrationNumber", title: "Reg No", cellType: "text" },
    { key: "name", title: "Name", cellType: "text" },
    {
      key: "outDateTime",
      title: "Out Date & Time",
      cellType: "custom",
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.outDate}</span>
          <span className="text-xs text-gray-500">{row.outTime}</span>
        </div>
      )
    },
    {
      key: "expectedReturn",
      title: "Expected Return",
      cellType: "custom",
      render: (_, row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.expectedReturnDate || row.outDate}</span>
          <span className="text-xs text-gray-500">{row.expectedReturnTime}</span>
        </div>
      )
    },
    {
      key: "actualReturnTime",
      title: "Actual Return",
      cellType: "custom",
      render: (value) => value ? (
        <span className="text-green-600 font-medium">{value}</span>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
    { key: "purpose", title: "Purpose", cellType: "text" },
    {
      key: "status",
      title: "Status",
      cellType: "custom",
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: "actionBy",
      title: "Action By",
      cellType: "custom",
      render: (_, row) => row.actionBy ? (row.actionBy.email || row.actionBy.name || "Admin") : "-"
    },
    {
      key: "actions",
      title: "Actions",
      cellType: "custom",
      render: (_, row) => (
        <div className="flex gap-2 items-center">
          {/* View Details Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItem(row);
              setShowModal(true);
              setModalMode("view");
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
            title="View Details"
          >
            <FileText className="w-4 h-4" />
          </button>

          {row.status === "pending" && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handleOutPassAction(row._id, "approve"); }}
                className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs font-medium"
              >
                Approve
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleOutPassAction(row._id, "reject"); }}
                className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium"
              >
                Reject
              </button>
            </>
          )}

          {(row.status === "approved" || row.status === "completed") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuickReturn(row._id);
              }}
              className="p-1.5 text-orange-600 hover:bg-orange-50 rounded"
              title="Mark Return Now"
            >
              <Clock className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  /**
   * View Out Pass Details Modal
   */
  const ViewOutPassModal = ({ outpass, onClose }) => {
    return (
      <Modal isOpen={true} onClose={onClose} title="Out Pass Details" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Student Name</p>
              <p className="text-sm font-medium">{outpass.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Reg No</p>
              <p className="text-sm font-medium">{outpass.registrationNumber}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Out Date</p>
              <p className="text-sm">{outpass.outDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Out Time</p>
              <p className="text-sm">{outpass.outTime}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Expected Return</p>
              <p className="text-sm font-medium text-[#525B88]">{outpass.expectedReturnTime}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Actual Return</p>
              <p className="text-sm font-medium text-green-600">{outpass.actualReturnTime || "Not returned"}</p>
            </div>
          </div>
          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Purpose</p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md italic">"{outpass.purpose}"</p>
          </div>
          {outpass.actionBy && (
            <div className="bg-blue-50 p-3 rounded-md flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-semibold">Approved By</p>
                <p className="text-sm font-medium">{outpass.actionBy.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-600 font-semibold">Status</p>
                <StatusBadge status={outpass.status} />
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  };

  const tabs = [
    { id: "attendance", label: "Attendance" },
    // { id: "leaves", label: "Leaves" },
    { id: "outpass", label: "Out Passes" },
  ];

  /**
   * Handle leave approval/rejection
   */
  const handleLeaveAction = async (id, action) => {
    try {
      const response = await API.put(`/hostel/leaves/${id}/status`, {
        status: action === "approve" ? "approved" : "rejected"
      });
      if (response.data && response.data.success) {
        setLeaves(prev => prev.map(l => l._id === id ? { ...l, status: response.data.data.status } : l));
        alert(`Leave ${action}d successfully`);
      }
    } catch (err) {
      alert(`Failed to ${action} leave`);
    }
  };

  /**
   * Handle outpass approval/rejection
   */
  /**
   * Handle quick return (one-click timestamp)
   */
  const handleQuickReturn = async (id) => {
    // Format: "YYYY-MM-DD HH:mm" or "DD/MM/YYYY HH:mm"
    const now = new Date();
    const timestamp = now.toLocaleDateString() + " " + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      const response = await API.put(`/hostel/outpass/${id}/status`, {
        status: "completed",
        actualReturnTime: timestamp
      });
      if (response.data && response.data.success) {
        setOutPasses(prev => prev.map(o => o._id === id ? {
          ...o,
          status: "completed",
          actualReturnTime: timestamp,
          actionBy: response.data.data.actionBy // Update approver too
        } : o));
        alert("Return time marked: " + timestamp);
      }
    } catch (err) {
      alert("Failed to mark return time");
    }
  };

  const handleOutPassAction = async (id, action) => {
    try {
      const response = await API.put(`/hostel/outpass/${id}/status`, {
        status: action === "approve" ? "approved" : "rejected"
      });
      if (response.data && response.data.success) {
        setOutPasses(prev => prev.map(o => o._id === id ? { ...o, status: response.data.data.status } : o));
        alert(`Outpass ${action}d successfully`);
      }
    } catch (err) {
      alert(`Failed to ${action} outpass`);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Attendance & Leave Management
        </h2>

        {activeTab === "attendance" && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedItem(null);
                setModalMode("in");
                setShowModal(true);
              }}
              className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Mark Check In
            </button>
            <button
              onClick={() => {
                setSelectedItem(null);
                setModalMode("out");
                setShowModal(true);
              }}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Mark Check Out
            </button>
          </div>
        )}

        {activeTab === "outpass" && (
          <button
            onClick={() => {
              setSelectedItem(null);
              setShowModal(true);
            }}
            className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate Out Pass
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6">
        <FilterBar
          filters={filters}
          onFilter={setFilters}
          filterConfig={[
            {
              name: "date",
              type: "date",
              label: "Attendance Date"
            },
            {
              name: "hostelId",
              type: "select",
              label: "Hostel",
              options: hostels.map(h => ({ value: h._id, label: h.name })),
              placeholder: "All Hostels"
            }
          ]}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Present Today"
          value={stats.present}
          icon={CheckCircle}
          color="green"
        />
        <SummaryCard
          title="Absent Today"
          value={stats.absent}
          icon={XCircle}
          color="red"
        />
        <SummaryCard
          title="Total Students"
          value={stats.total}
          icon={Calendar}
          color="blue"
        />
        <SummaryCard
          title="Pending Leaves"
          value={stats.pendingLeaves}
          icon={FileText}
          color="yellow"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                ${activeTab === tab.id
                  ? "border-[#525b88] text-[#525b88]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === "attendance" && (
        <DataTable
          data={attendance}
          columns={attendanceColumns}
          loading={loading}
          error={error}
          sortConfig={sortConfig}
          onSort={setSortConfig}
        />
      )}

      {activeTab === "leaves" && (
        <>
          <DataTable
            data={leaves}
            columns={leaveColumns}
            loading={loading}
            error={error}
            onView={(id) => {
              const leave = leaves.find((l) => l._id === id);
              setSelectedItem(leave);
              setShowModal(true);
            }}
            sortConfig={sortConfig}
            onSort={setSortConfig}
          />
          {/* Action buttons for pending leaves */}
          {leaves
            .filter((l) => l.status === "pending")
            .map((leave) => (
              <div key={leave._id} className="mt-2 flex gap-2">
                <button
                  onClick={() => handleLeaveAction(leave._id, "approve")}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleLeaveAction(leave._id, "reject")}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            ))}
        </>
      )}

      {activeTab === "outpass" && (
        <DataTable
          data={outPasses}
          columns={outPassColumns}
          loading={loading}
          error={error}
          sortConfig={sortConfig}
          onSort={setSortConfig}
        />
      )}
      {/* Modal for Marking Attendance */}
      {showModal && activeTab === "attendance" && (
        <MarkAttendanceModal
          mode={modalMode} // Pass mode
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchAttendance();
          }}
        />
      )}

      {/* Modal for Generating Out Pass */}
      {showModal && activeTab === "outpass" && (!modalMode || modalMode === "generate") && (
        <GenerateOutPassModal
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchOutPasses();
          }}
        />
      )}

      {/* Modal for Viewing Details */}
      {showModal && activeTab === "outpass" && modalMode === "view" && selectedItem && (
        <ViewOutPassModal
          outpass={selectedItem}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};



/**
 * Mark Attendance Modal Component
 */
const MarkAttendanceModal = ({ mode = "in", onClose, onSave }) => {
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch Hostels
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await API.get("/hostel");
        if (response.data && response.data.success) {
          setHostels(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching hostels:", err);
      }
    };
    fetchHostels();
  }, []);

  // Fetch students when hostel or date changes
  useEffect(() => {
    if (selectedHostel && date) {
      const fetchList = async () => {
        setLoading(true);
        try {
          const response = await API.get("/hostel/attendance", {
            params: { hostelId: selectedHostel, date, includeUnmarked: true }
          });
          if (response.data && response.data.success) {
            setStudents(response.data.data.map(s => ({
              ...s,
              // If mode is 'in': default unmarked to 'present'
              // If mode is 'out': unchecked (empty checkOutTime)
              status: mode === "in" && s.status === "not_marked" ? "present" : s.status,
              // For UI tracking of checkout
              isCheckedOut: !!s.checkOutTime
            })));
          }
        } catch (err) {
          console.error("Error fetching student list:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchList();
    }
  }, [selectedHostel, date, mode]);

  const toggleStatus = (applicationId) => {
    setStudents(prev => prev.map(s => {
      if (s.applicationId === applicationId) {
        if (mode === "in") {
          return { ...s, status: s.status === "present" ? "absent" : "present" };
        } else {
          // Check Out Mode: Toggle check out status
          return { ...s, isCheckedOut: !s.isCheckedOut };
        }
      }
      return s;
    }));
  };

  const handleSave = async () => {
    if (!selectedHostel) return alert("Please select a hostel");
    setSaving(true);

    // Capture current time
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    try {
      await API.post("/hostel/attendance/bulk", {
        hostelId: selectedHostel,
        date,
        attendanceData: students.map(s => {
          const payload = {
            applicationId: s.applicationId,
            status: s.status,
            remarks: s.remarks
          };

          if (mode === "in") {
            // "Check In" logic
            payload.checkInTime = s.status === "present" ? (s.checkInTime || currentTime) : "";
            // Don't overwrite checkOutTime if it exists
            payload.checkOutTime = s.checkOutTime;
          } else {
            // "Check Out" logic
            // Preserve existing checkInTime
            payload.checkInTime = s.checkInTime;
            // Set checkOutTime if checked out
            payload.checkOutTime = s.isCheckedOut ? (s.checkOutTime || currentTime) : "";
          }

          return payload;
        })
      });
      alert(`${mode === "in" ? "Attendance" : "Check-out"} saved successfully!`);
      onSave();
    } catch (err) {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={mode === "in" ? "Mark Daily Attendance (Check In)" : "Mark Check Out"}
      size="xl"
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || students.length === 0}
            className={`px-4 py-2 text-white rounded-md disabled:opacity-50 ${mode === "in" ? "bg-[#525B88] hover:bg-[#3a4166]" : "bg-orange-600 hover:bg-orange-700"}`}
          >
            {saving ? "Saving..." : (mode === "in" ? "Save Attendance" : "Save Check Out")}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Hostel</label>
            <select
              value={selectedHostel}
              onChange={(e) => setSelectedHostel(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">-- Choose Hostel --</option>
              {hostels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center">Loading list...</div>
        ) : students.length > 0 ? (
          <div className="max-h-[400px] overflow-y-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resident</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room/Bed</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.applicationId}>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.registrationNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      R: {student.roomNumber} / B: {student.bedNumber}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleStatus(student.applicationId)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${mode === "in"
                          ? (student.status === "present" ? "bg-green-100 text-green-800 border-green-200 border" : "bg-red-100 text-red-800 border-red-200 border")
                          : (student.isCheckedOut ? "bg-orange-100 text-orange-800 border-orange-200 border" : "bg-gray-100 text-gray-600 border-gray-200 border")
                          }`}
                      >
                        {mode === "in"
                          ? (student.status === "present" ? "Present" : "Absent")
                          : (student.isCheckedOut ? "Checked Out" : "Still In")}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={student.remarks || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStudents(prev => prev.map(s => s.applicationId === student.applicationId ? { ...s, remarks: val } : s));
                        }}
                        placeholder="Note..."
                        className="w-full border-none focus:ring-0 text-sm p-0"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : selectedHostel ? (
          <div className="py-10 text-center text-gray-500">No active residents found in this hostel.</div>
        ) : (
          <div className="py-10 text-center text-gray-500">Select a hostel to load the resident list.</div>
        )}
      </div>
    </Modal>
  );
};

/**
 * Generate Out Pass Modal
 */
const GenerateOutPassModal = ({ onClose, onSave }) => {
  const [hostels, setHostels] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loadingResidents, setLoadingResidents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    hostelId: "",
    applicationId: "",
    outDate: new Date().toISOString().split("T")[0],
    outTime: "",
    expectedReturnDate: new Date().toISOString().split("T")[0],
    expectedReturnTime: "",
    purpose: ""
  });

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await API.get("/hostel");
        if (response.data && response.data.success) setHostels(response.data.data);
      } catch (err) { console.error(err); }
    };
    fetchHostels();
  }, []);

  useEffect(() => {
    if (formData.hostelId) {
      const fetchResidents = async () => {
        setLoadingResidents(true);
        try {
          const response = await API.get("/hostel/attendance", {
            params: { hostelId: formData.hostelId, date: formData.outDate }
          });
          if (response.data && response.data.success) setResidents(response.data.data);
        } catch (err) { console.error(err); }
        finally { setLoadingResidents(false); }
      };
      fetchResidents();
    }
  }, [formData.hostelId, formData.outDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.applicationId) return alert("Please select a resident");
    setSaving(true);
    try {
      await API.post("/hostel/outpass", formData);
      alert("Out pass generated successfully!");
      onSave();
    } catch (err) {
      alert("Failed to generate out pass");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Generate Student Out Pass" size="md"
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 bg-[#525B88] text-white rounded-md">
            {saving ? "Generating..." : "Generate Pass"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Hostel</label>
          <select
            value={formData.hostelId}
            onChange={e => setFormData({ ...formData, hostelId: e.target.value })}
            className="w-full border rounded-md p-2 text-sm"
          >
            <option value="">Select Hostel</option>
            {hostels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Resident</label>
          <select
            value={formData.applicationId}
            onChange={e => setFormData({ ...formData, applicationId: e.target.value })}
            className="w-full border rounded-md p-2 text-sm"
            disabled={!formData.hostelId || loadingResidents}
          >
            <option value="">{loadingResidents ? "Loading..." : "Select Resident"}</option>
            {residents.map(r => (
              <option key={r.applicationId} value={r.applicationId}>
                {r.name} ({r.registrationNumber}) - {r.roomNumber}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Out Date</label>
            <input
              type="date"
              value={formData.outDate}
              onChange={e => setFormData({ ...formData, outDate: e.target.value })}
              className="w-full border rounded-md p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Expected Return Date</label>
            <input
              type="date"
              value={formData.expectedReturnDate}
              onChange={e => setFormData({ ...formData, expectedReturnDate: e.target.value })}
              className="w-full border rounded-md p-2 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Out Time</label>
            <input type="time" value={formData.outTime} onChange={e => setFormData({ ...formData, outTime: e.target.value })} className="w-full border rounded-md p-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Expected Return Time</label>
            <input type="time" value={formData.expectedReturnTime} onChange={e => setFormData({ ...formData, expectedReturnTime: e.target.value })} className="w-full border rounded-md p-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Purpose</label>
          <textarea value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} className="w-full border rounded-md p-2 text-sm" rows="3" placeholder="Reason for going out..."></textarea>
        </div>
      </div>
    </Modal>
  );
};

export default AttendanceManagement;

