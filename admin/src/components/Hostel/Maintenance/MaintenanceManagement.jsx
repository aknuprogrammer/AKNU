/**
 * Maintenance Management Component
 * Tracks and manages hostel maintenance requests and work
 */
import React, { useState, useEffect, useMemo } from "react";
import { Plus, Wrench, AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react";
import { FilterBar, DataTable, Modal, StatusBadge, SummaryCard } from "../shared";
import { apiRequest } from "../../../services/apiService";
import { toast, Toaster } from "react-hot-toast";

const MaintenanceManagement = () => {
  const [activeTab, setActiveTab] = useState("requests"); // requests, workorders, schedule
  const [requests, setRequests] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [workOrderFormData, setWorkOrderFormData] = useState({
    assignedTo: "",
    priority: "medium",
    estimatedCost: 0,
    remarks: "",
    category: "Electrical",
    description: "",
    hostelId: "",
    hostelName: "",
    roomId: "",
    roomNumber: "",
    requestId: ""
  });

  const [requestFormData, setRequestFormData] = useState({
    registrationNumber: "",
    category: "Electrical",
    description: "",
    priority: "medium",
    hostelId: "",
    hostelName: "",
    roomId: "",
    roomNumber: "",
    studentName: ""
  });

  const [hostels, setHostels] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [fetchingAllocation, setFetchingAllocation] = useState(false);
  const [fetchingRooms, setFetchingRooms] = useState(false);

  /**
   * Fetch maintenance requests
   */
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("hostel/maintenance");
      const formattedData = (response.data || []).map(req => ({
        ...req,
        registrationNumber: req.applicationId?.registrationNumber || "N/A",
        name: req.applicationId?.studentName || "N/A",
        hostelName: req.applicationId?.hostelName || "N/A",
        roomNumber: req.applicationId?.roomNumber || "N/A",
        requestDate: req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "N/A"
      }));
      setRequests(formattedData);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch work orders
   */
  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      const response = await apiRequest("hostel/workorders");
      const formattedData = (response.data || []).map(wo => ({
        ...wo,
        regNo: wo.requestId?.applicationId?.registrationNumber || "N/A",
        studentName: wo.requestId?.applicationId?.studentName || "N/A",
        hostel: wo.requestId?.applicationId?.hostelName || wo.hostelName || "N/A",
        room: wo.requestId?.applicationId?.roomNumber || wo.roomNumber || "N/A",
        category: wo.requestId?.category || wo.category || "N/A",
        description: wo.requestId?.description || wo.description || "N/A"
      }));
      setWorkOrders(formattedData);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to fetch work orders");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch all hostels
   */
  const fetchHostels = async () => {
    try {
      const response = await apiRequest("hostel");
      if (response.success) {
        setHostels(response.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch hostels", err);
    }
  };

  /**
   * Fetch rooms for a hostel
   */
  const fetchRooms = async (hostelId) => {
    if (!hostelId) {
      setAvailableRooms([]);
      return;
    }
    setFetchingRooms(true);
    try {
      const response = await apiRequest(`hostel/availability/${hostelId}`);
      if (response.success && response.data) {
        // Flat map all rooms from all floors
        const allRooms = response.data.floors.flatMap(floor => floor.rooms || []);
        setAvailableRooms(allRooms);
      }
    } catch (err) {
      console.error("Failed to fetch rooms", err);
      toast.error("Failed to load rooms for this hostel");
    } finally {
      setFetchingRooms(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchWorkOrders();
    fetchHostels();
  }, [activeTab]);

  /**
   * Calculate statistics
   */
  const statistics = useMemo(() => {
    const pending = requests.filter((r) => r.status === "pending").length;
    const inProgress = requests.filter((r) => r.status === "in-progress").length;
    const completed = requests.filter((r) => r.status === "completed").length;
    const urgent = requests.filter((r) => r.priority === "urgent").length;

    return {
      pending,
      inProgress,
      completed,
      urgent,
    };
  }, [requests]);

  /**
   * Request columns
   */
  const requestColumns = [
    { key: "registrationNumber", title: "Reg No", cellType: "text" },
    { key: "name", title: "Name", cellType: "text" },
    { key: "hostelName", title: "Hostel", cellType: "text" },
    { key: "roomNumber", title: "Room", cellType: "text" },
    { key: "category", title: "Category", cellType: "text" },
    { key: "description", title: "Description", cellType: "text" },
    {
      key: "priority",
      title: "Priority",
      cellType: "custom",
      render: (value) => (
        <StatusBadge
          status={value}
          statusConfig={{
            urgent: { color: "bg-red-100 text-red-800", label: "Urgent" },
            high: { color: "bg-orange-100 text-orange-800", label: "High" },
            medium: { color: "bg-yellow-100 text-yellow-800", label: "Medium" },
            low: { color: "bg-blue-100 text-blue-800", label: "Low" },
          }}
        />
      ),
    },
    {
      key: "status",
      title: "Status",
      cellType: "custom",
      render: (value) => <StatusBadge status={value} />,
    },
    { key: "requestDate", title: "Request Date", cellType: "date" },
    {
      key: "actions",
      title: "Actions",
      cellType: "custom",
      render: (_, row) => (
        <div className="flex gap-2">
          {row.status === "pending" && (
            <button
              onClick={() => {
                setSelectedItem(row);
                setWorkOrderFormData({ ...workOrderFormData, priority: row.priority });
                setShowWorkOrderModal(true);
              }}
              className="p-1 px-2 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors flex items-center font-semibold"
              title="Create Work Order"
            >
              <Wrench className="w-3 h-3 mr-1" />
              Work Order
            </button>
          )}
          {row.status === "in-progress" && (
            <button
              onClick={() => handleStatusUpdate(row._id, "completed")}
              className="p-1 px-2 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors font-semibold"
              title="Mark as Completed"
            >
              Finish
            </button>
          )}
          {row.status !== "completed" && row.status !== "cancelled" && (
            <button
              onClick={() => handleStatusUpdate(row._id, "cancelled")}
              className="p-1 px-2 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors font-semibold"
              title="Cancel Request"
            >
              Cancel
            </button>
          )}
        </div>
      )
    }
  ];

  /**
   * Work order columns
   */
  const workOrderColumns = [
    { key: "regNo", title: "Reg No", cellType: "text" },
    { key: "studentName", title: "Student", cellType: "text" },
    { key: "hostel", title: "Hostel", cellType: "text" },
    { key: "category", title: "Category", cellType: "text" },
    { key: "assignedTo", title: "Assigned To", cellType: "text" },
    {
      key: "estimatedCost",
      title: "Estimated Cost",
      cellType: "custom",
      render: (value) => `₹${value?.toLocaleString("en-IN") || 0}`,
    },
    {
      key: "status",
      title: "Status",
      cellType: "custom",
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: "createdAt",
      title: "Issued On",
      cellType: "custom",
      render: (val) => val ? new Date(val).toLocaleDateString() : "N/A"
    },
    {
      key: "actions",
      title: "Actions",
      cellType: "custom",
      render: (_, row) => (
        <div className="flex gap-2">
          {row.status === 'issued' && (
            <button
              onClick={() => handleWOStatusUpdate(row._id, 'in-progress')}
              className="p-1 px-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-semibold"
            >
              Start
            </button>
          )}
          {row.status === 'in-progress' && (
            <button
              onClick={() => handleWOStatusUpdate(row._id, 'completed')}
              className="p-1 px-2 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 font-semibold"
            >
              Complete
            </button>
          )}
        </div>
      )
    }
  ];

  const tabs = [
    { id: "requests", label: "Maintenance Requests" },
    { id: "workorders", label: "Work Orders" },
    // { id: "schedule", label: "Preventive Maintenance" },
  ];

  /**
   * Handle request status update
   */
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const remarks = prompt("Enter remarks (optional):") || "";
      const response = await apiRequest(`hostel/maintenance/${id}/status`, "PUT", {
        status: newStatus,
        remarks
      });

      if (response.success) {
        toast.success(`Request marked as ${newStatus}`);
        fetchRequests();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  /**
   * Create Work Order
   */
  const handleCreateWorkOrder = async (e) => {
    e.preventDefault();
    try {
      const finalRequestId = selectedItem?._id || workOrderFormData.requestId;
      const payload = {
        ...workOrderFormData,
        requestId: finalRequestId || undefined
      };

      const response = await apiRequest("hostel/workorders", "POST", payload);

      if (response.success) {
        toast.success("Work order assigned successfully!");
        setShowWorkOrderModal(false);
        setWorkOrderFormData({
          assignedTo: "",
          priority: "medium",
          estimatedCost: 0,
          remarks: "",
          category: "Electrical",
          description: "",
          hostelName: "",
          roomNumber: "",
          requestId: ""
        });
        fetchRequests(); // Refresh requests to see status change
        setActiveTab("workorders"); // Switch to work orders tab
      }
    } catch (err) {
      toast.error(err.message || "Failed to create work order");
    }
  };

  /**
   * Fetch Allocation Details by Reg Number
   */
  const handleRegSearch = async (regNumber, mode = "request") => {
    if (!regNumber || regNumber.length < 3) return;

    setFetchingAllocation(true);
    try {
      const response = await apiRequest(`hostel/allocation/${regNumber}`);
      if (response.success && response.data) {
        const data = response.data;
        if (mode === "request") {
          setRequestFormData(prev => ({
            ...prev,
            studentName: data.studentName,
            hostelName: data.hostelName,
            roomNumber: data.roomNumber
          }));
        } else {
          setWorkOrderFormData(prev => ({
            ...prev,
            hostelName: data.hostelName,
            roomNumber: data.roomNumber
          }));
        }
        toast.success(`Found allocation for ${data.studentName}`);
      }
    } catch (err) {
      // Don't show toast for every partial match search
      console.log("Allocation not found for this reg number yet");
    } finally {
      setFetchingAllocation(false);
    }
  };

  /**
   * Create Maintenance Request (Admin)
   */
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await apiRequest("hostel/maintenance/apply", "POST", {
        ...requestFormData,
        studentEmail: "admin@aknu.edu.in" // Placeholder or fetch actual if needed
      });

      if (response.success) {
        toast.success("Maintenance request created successfully!");
        setShowModal(false);
        setRequestFormData({
          registrationNumber: "",
          category: "Electrical",
          description: "",
          priority: "medium",
          hostelName: "",
          roomNumber: "",
          studentName: ""
        });
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.message || "Failed to create request");
    }
  };

  /**
   * Update Work Order Status
   */
  const handleWOStatusUpdate = async (id, status) => {
    try {
      const response = await apiRequest(`hostel/workorders/${id}/status`, "PUT", { status });
      if (response.success) {
        toast.success(`Work order ${status}`);
        fetchWorkOrders();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update work order");
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Maintenance Management
        </h2>
        {activeTab === "requests" && (
          <button
            onClick={() => {
              setSelectedItem(null);
              setShowModal(true);
            }}
            className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Request
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Pending"
          value={statistics.pending}
          icon={Clock}
          color="yellow"
        />
        <SummaryCard
          title="In Progress"
          value={statistics.inProgress}
          icon={Wrench}
          color="blue"
        />
        <SummaryCard
          title="Completed"
          value={statistics.completed}
          icon={CheckCircle}
          color="green"
        />
        <SummaryCard
          title="Urgent"
          value={statistics.urgent}
          icon={AlertTriangle}
          color="red"
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
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === "requests" && (
        <div className="animate-fadeIn">
          {loading ? (
            <div className="bg-white p-12 rounded-lg border border-gray-200 text-center flex flex-col items-center shadow-sm">
              <div className="w-8 h-8 border-4 border-[#525b88] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-gray-500">Loading maintenance requests...</p>
            </div>
          ) : requests.length > 0 ? (
            <DataTable
              data={requests}
              columns={requestColumns}
              loading={loading}
              error={error}
              sortConfig={sortConfig}
              onSort={setSortConfig}
            />
          ) : (
            <div className="bg-white p-12 rounded-lg border border-gray-200 text-center text-gray-500 shadow-sm">
              <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium">No maintenance requests found</p>
              <p className="text-sm">New requests will appear here for assignment.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "workorders" && (
        <div className="animate-fadeIn">
          {loading ? (
            <div className="bg-white p-12 rounded-lg border border-gray-200 text-center flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-[#525b88] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-gray-500 font-medium">Loading work orders...</p>
            </div>
          ) : workOrders.length > 0 ? (
            <DataTable
              data={workOrders}
              columns={workOrderColumns}
              loading={loading}
              error={error}
              sortConfig={sortConfig}
              onSort={setSortConfig}
            />
          ) : (
            <div className="bg-white p-12 rounded-lg border border-gray-200 text-center text-gray-500">
              <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-lg font-medium">No work orders issued</p>
              <p className="text-sm">Assign a request to see work orders here.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "schedule" && (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center text-gray-500 shadow-sm">
          <Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-lg font-medium">Scheduling Module</p>
          <p className="text-sm">Preventive Maintenance Schedule is currently under development.</p>
        </div>
      )}

      {/* Work Order Assignment Modal */}
      <Modal
        isOpen={showWorkOrderModal}
        onClose={() => setShowWorkOrderModal(false)}
        title={selectedItem ? "Assign Work Order" : "Issue Manual Work Order"}
      >
        <form onSubmit={handleCreateWorkOrder} className="space-y-5">
          {selectedItem ? (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-2">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Selected Request</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Student:</span>
                  <p className="font-semibold text-[#2a3563]">{selectedItem?.name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>
                  <p className="font-semibold text-[#2a3563]">{selectedItem?.hostelName} - {selectedItem?.roomNumber}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Description:</span>
                  <p className="text-gray-700">{selectedItem?.description}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-indigo-600">Link to Pending Request (Optional)</label>
                <select
                  value={workOrderFormData.requestId}
                  onChange={(e) => {
                    const reqId = e.target.value;
                    const selectedReq = requests.find(r => r._id === reqId);
                    if (selectedReq) {
                      setWorkOrderFormData({
                        ...workOrderFormData,
                        requestId: reqId,
                        category: selectedReq.category,
                        description: selectedReq.description,
                        hostelName: selectedReq.hostelName,
                        roomNumber: selectedReq.roomNumber,
                        priority: selectedReq.priority
                      });
                    } else {
                      setWorkOrderFormData({
                        ...workOrderFormData,
                        requestId: "",
                        description: "",
                        hostelName: "",
                        roomNumber: ""
                      });
                    }
                  }}
                  className="w-full px-4 py-2 border-2 border-indigo-100 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all text-sm bg-indigo-50/30"
                >
                  <option value="">-- Select a Pending Request --</option>
                  {requests.filter(r => r.status === 'pending').map(r => (
                    <option key={r._id} value={r._id}>
                      [{r.registrationNumber}] {r.name} - {r.category} ({r.hostelName})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">Selecting a request will auto-fill the details below</p>
              </div>

              {workOrderFormData.requestId && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg animate-fadeIn">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-blue-500" />
                    <p className="text-xs font-bold text-blue-700 uppercase">Fetched Request Details</p>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div>
                      <span className="text-blue-400">Hostel:</span>
                      <p className="font-semibold text-blue-900">{workOrderFormData.hostelName}</p>
                    </div>
                    <div>
                      <span className="text-blue-400">Room:</span>
                      <p className="font-semibold text-blue-900">{workOrderFormData.roomNumber}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-blue-400">Description:</span>
                      <p className="text-blue-800 italic">"{workOrderFormData.description}"</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hostel Name</label>
                  <select
                    required
                    value={workOrderFormData.hostelId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const name = hostels.find(h => h._id === id)?.name || "";
                      setWorkOrderFormData({ ...workOrderFormData, hostelId: id, hostelName: name, roomId: "", roomNumber: "" });
                      fetchRooms(id);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all text-sm"
                  >
                    <option value="">-- Select Hostel --</option>
                    {hostels.map(h => (
                      <option key={h._id} value={h._id}>{h.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Room / Location</label>
                  <select
                    required
                    value={workOrderFormData.roomId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const num = availableRooms.find(r => r._id === id)?.roomNumber || "";
                      setWorkOrderFormData({ ...workOrderFormData, roomId: id, roomNumber: num });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all text-sm"
                    disabled={!workOrderFormData.hostelId || fetchingRooms}
                  >
                    <option value="">{fetchingRooms ? "Loading rooms..." : "-- Select Room --"}</option>
                    {availableRooms.map(r => (
                      <option key={r._id} value={r._id}>{r.roomNumber}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                <select
                  value={workOrderFormData.category}
                  onChange={(e) => setWorkOrderFormData({ ...workOrderFormData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all text-sm"
                >
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Job Description</label>
                <textarea
                  required
                  rows="2"
                  placeholder="Describe the maintenance job..."
                  value={workOrderFormData.description}
                  onChange={(e) => setWorkOrderFormData({ ...workOrderFormData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all text-sm"
                ></textarea>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assigned To (Staff/Vendor)</label>
            <input
              type="text"
              required
              placeholder="Enter staff name or vendor"
              value={workOrderFormData.assignedTo}
              onChange={(e) => setWorkOrderFormData({ ...workOrderFormData, assignedTo: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
              <select
                value={workOrderFormData.priority}
                onChange={(e) => setWorkOrderFormData({ ...workOrderFormData, priority: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Est. Cost (₹)</label>
              <input
                type="number"
                min="0"
                value={workOrderFormData.estimatedCost}
                onChange={(e) => setWorkOrderFormData({ ...workOrderFormData, estimatedCost: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Remarks / Instructions</label>
            <textarea
              rows="3"
              placeholder="Provide specific instructions for the work..."
              value={workOrderFormData.remarks}
              onChange={(e) => setWorkOrderFormData({ ...workOrderFormData, remarks: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => setShowWorkOrderModal(false)}
              className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#525b88] text-white text-sm font-semibold rounded-lg hover:bg-[#3a4377] transition-all shadow-md shadow-indigo-200"
            >
              Issue Work Order
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Maintenance Request Modal (Admin) */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create Maintenance Request"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hostel Name</label>
              <select
                required
                value={requestFormData.hostelId}
                onChange={(e) => {
                  const id = e.target.value;
                  const name = hostels.find(h => h._id === id)?.name || "";
                  setRequestFormData({ ...requestFormData, hostelId: id, hostelName: name, roomId: "", roomNumber: "" });
                  fetchRooms(id);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition-all focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88]"
              >
                <option value="">-- Select Hostel --</option>
                {hostels.map(h => (
                  <option key={h._id} value={h._id}>{h.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Room / Location</label>
              <select
                required
                value={requestFormData.roomId}
                onChange={(e) => {
                  const id = e.target.value;
                  const num = availableRooms.find(r => r._id === id)?.roomNumber || "";
                  setRequestFormData({ ...requestFormData, roomId: id, roomNumber: num });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition-all focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88]"
                disabled={!requestFormData.hostelId || fetchingRooms}
              >
                <option value="">{fetchingRooms ? "Loading rooms..." : "-- Select Room --"}</option>
                {availableRooms.map(r => (
                  <option key={r._id} value={r._id}>{r.roomNumber}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
              <select
                value={requestFormData.category}
                onChange={(e) => setRequestFormData({ ...requestFormData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all"
              >
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Priority</label>
              <select
                value={requestFormData.priority}
                onChange={(e) => setRequestFormData({ ...requestFormData, priority: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea
              required
              rows="3"
              placeholder="Describe the maintenance issue..."
              value={requestFormData.description}
              onChange={(e) => setRequestFormData({ ...requestFormData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#525b88] text-white text-sm font-semibold rounded-lg hover:bg-[#3a4377] transition-all shadow-md shadow-indigo-200"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaintenanceManagement;
