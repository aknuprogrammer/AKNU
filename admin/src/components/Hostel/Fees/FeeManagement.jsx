/**
 * Fee Management Component
 * Manages hostel fees, deposits, and payments
 */
import React, { useState, useEffect, useMemo } from "react";
import { Plus, DollarSign, CreditCard, Receipt, AlertCircle, CheckCircle } from "lucide-react";
import { FilterBar, DataTable, Modal, StatusBadge, SummaryCard } from "../shared";
import { API } from "../../../config/urls";

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState("structure"); // structure, payments, pending
  const [feeStructures, setFeeStructures] = useState([]);
  const [payments, setPayments] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  /**
   * Fetch hostels for dropdown
   */
  const fetchHostels = async () => {
    try {
      const response = await API.get("/hostel");
      let hostelsData = [];
      if (response.data) {
        if (response.data.success && response.data.data) {
          hostelsData = response.data.data;
        } else if (Array.isArray(response.data.data)) {
          hostelsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          hostelsData = response.data;
        }
      }
      setHostels(hostelsData);
    } catch (err) {
      console.error("Error fetching hostels:", err);
    }
  };

  /**
   * Fetch fee structures
   */
  const fetchFeeStructures = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get("/hostel/fee-structure", { params: filters });
      let structuresData = [];
      if (response.data) {
        if (response.data.success && response.data.data) {
          structuresData = response.data.data;
        } else if (Array.isArray(response.data.data)) {
          structuresData = response.data.data;
        } else if (Array.isArray(response.data)) {
          structuresData = response.data;
        }
      }
      setFeeStructures(structuresData);
    } catch (err) {
      console.error("Error fetching fee structures:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch fee structures");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch payments (from hostel-fee endpoint)
   */
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get("/hostel-fee");
      let paymentsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          paymentsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          paymentsData = response.data.data;
        }
      }
      setPayments(paymentsData);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    if (activeTab === "structure") {
      fetchFeeStructures();
    } else if (activeTab === "payments" || activeTab === "pending") {
      fetchPayments();
    }
  }, [activeTab, filters]);

  /**
   * Handle save fee structure
   */
  const handleSaveFeeStructure = async (formData) => {
    try {
      setLoading(true);
      let response;
      if (selectedItem && selectedItem._id) {
        // Update
        response = await API.put(`/hostel/fee-structure/${selectedItem._id}`, formData);
      } else {
        // Create
        response = await API.post("/hostel/fee-structure", formData);
      }

      if (response.data && (response.data.success || response.data._id)) {
        setShowModal(false);
        setSelectedItem(null);
        fetchFeeStructures();
        alert(selectedItem ? "Fee structure updated successfully!" : "Fee structure created successfully!");
      } else {
        throw new Error("Failed to save fee structure");
      }
    } catch (err) {
      console.error("Error saving fee structure:", err);
      alert(err.response?.data?.message || err.message || "Failed to save fee structure");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle delete fee structure
   */
  const handleDeleteFeeStructure = async (id) => {
    if (window.confirm("Are you sure you want to delete this fee structure?")) {
      try {
        setLoading(true);
        await API.delete(`/hostel/fee-structure/${id}`);
        fetchFeeStructures();
        alert("Fee structure deleted successfully!");
      } catch (err) {
        console.error("Error deleting fee structure:", err);
        alert(err.response?.data?.message || err.message || "Failed to delete fee structure");
      } finally {
        setLoading(false);
      }
    }
  };

  /**
   * Calculate statistics
   */
  const statistics = useMemo(() => {
    const totalCollected = payments
      .filter((p) => p.status === "success" || p.status === "active")
      .reduce((sum, p) => sum + (p.totalFee || p.amount || 0), 0);
    const pendingAmount = payments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + (p.totalFee || p.amount || 0), 0);

    return {
      totalStructures: feeStructures.length,
      totalCollected,
      pendingAmount,
      totalPayments: payments.length,
    };
  }, [feeStructures, payments]);

  /**
   * Fee Structure columns
   */
  const feeStructureColumns = [
    {
      key: "hostelName",
      title: "Hostel",
      cellType: "custom",
      render: (value, row) => {
        const hostel = typeof row.hostelId === 'object' ? row.hostelId : hostels.find(h => h._id === row.hostelId);
        return hostel?.name || value || "-";
      },
    },
    { 
      key: "roomType", 
      title: "Room Type", 
      cellType: "custom",
      render: (value, row) => {
        if (row.roomType === "Dormitory" && row.capacity) {
          return `${value} (Capacity: ${row.capacity})`;
        }
        return value;
      },
    },
    {
      key: "monthlyFee",
      title: "Monthly Fee",
      cellType: "custom",
      render: (value, row) => {
        const amount = value || 0;
        if (row.roomType === "Dormitory" && row.capacity > 1) {
          const perPerson = Math.round(amount / row.capacity);
          return `₹${perPerson.toLocaleString("en-IN")} (per person) / ₹${amount.toLocaleString("en-IN")} (total)`;
        }
        return `₹${amount.toLocaleString("en-IN")}`;
      },
    },
    {
      key: "annualFee",
      title: "Annual Fee",
      cellType: "custom",
      render: (value, row) => {
        const amount = value || 0;
        if (row.roomType === "Dormitory" && row.capacity > 1) {
          const perPerson = Math.round(amount / row.capacity);
          return `₹${perPerson.toLocaleString("en-IN")} (per person) / ₹${amount.toLocaleString("en-IN")} (total)`;
        }
        return `₹${amount.toLocaleString("en-IN")}`;
      },
    },
    {
      key: "deposit",
      title: "Deposit",
      cellType: "custom",
      render: (value) => `₹${value?.toLocaleString("en-IN") || 0}`,
    },
    {
      key: "messCharges",
      title: "Mess Charges",
      cellType: "custom",
      render: (value) => `₹${value?.toLocaleString("en-IN") || 0}`,
    },
    {
      key: "totalAnnualFee",
      title: "Total Annual",
      cellType: "custom",
      render: (value, row) => {
        const amount = value || 0;
        if (row.roomType === "Dormitory" && row.capacity > 1) {
          return `₹${amount.toLocaleString("en-IN")} (per person, capacity: ${row.capacity})`;
        }
        return `₹${amount.toLocaleString("en-IN")}`;
      },
    },
    {
      key: "status",
      title: "Status",
      cellType: "custom",
      render: (value) => <StatusBadge status={value} />,
    },
  ];

  /**
   * Payment columns
   */
  const paymentColumns = [
    { key: "registrationNumber", title: "Reg No", cellType: "text" },
    {
      key: "name",
      title: "Name",
      cellType: "custom",
      render: (value, row) => row.studentName || row.employeeName || value || "-",
    },
    {
      key: "amount",
      title: "Amount",
      cellType: "custom",
      render: (value, row) => `₹${(row.totalFee || value || 0).toLocaleString("en-IN")}`,
    },
    { key: "hostelName", title: "Hostel", cellType: "text" },
    { key: "roomType", title: "Room Type", cellType: "text" },
    {
      key: "paymentDate",
      title: "Payment Date",
      cellType: "custom",
      render: (value, row) => {
        if (row.joiningDate) {
          return new Date(row.joiningDate).toLocaleDateString("en-IN");
        }
        return value ? new Date(value).toLocaleDateString("en-IN") : "-";
      },
    },
    {
      key: "status",
      title: "Status",
      cellType: "custom",
      render: (value) => <StatusBadge status={value} />,
    },
  ];

  const tabs = [
    { id: "structure", label: "Fee Structure" },
    { id: "payments", label: "Payments" },
    { id: "pending", label: "Pending Payments" },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Fee Management
        </h2>
        {activeTab === "structure" && (
          <button
            onClick={() => {
              setSelectedItem(null);
              setShowModal(true);
            }}
            className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Fee Structure
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Fee Structures"
          value={statistics.totalStructures}
          icon={DollarSign}
          color="blue"
        />
        <SummaryCard
          title="Total Collected"
          value={`₹${statistics.totalCollected.toLocaleString("en-IN")}`}
          icon={CreditCard}
          color="green"
        />
        <SummaryCard
          title="Pending Amount"
          value={`₹${statistics.pendingAmount.toLocaleString("en-IN")}`}
          icon={AlertCircle}
          color="yellow"
        />
        <SummaryCard
          title="Total Payments"
          value={statistics.totalPayments}
          icon={Receipt}
          color="purple"
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
                ${
                  activeTab === tab.id
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
      {activeTab === "structure" && (
        <DataTable
          data={feeStructures}
          columns={feeStructureColumns}
          loading={loading}
          error={error}
          onView={(id) => {
            const item = feeStructures.find((f) => f._id === id);
            setSelectedItem(item);
            setShowModal(true);
          }}
          onEdit={(id) => {
            const item = feeStructures.find((f) => f._id === id);
            setSelectedItem(item);
            setShowModal(true);
          }}
          onDelete={handleDeleteFeeStructure}
          sortConfig={sortConfig}
          onSort={setSortConfig}
        />
      )}

      {activeTab === "payments" && (
        <DataTable
          data={payments}
          columns={paymentColumns}
          loading={loading}
          error={error}
          onView={(id) => {
            const payment = payments.find((p) => p._id === id);
            setSelectedItem(payment);
            setShowModal(true);
          }}
          sortConfig={sortConfig}
          onSort={setSortConfig}
        />
      )}

      {activeTab === "pending" && (
        <DataTable
          data={payments.filter((p) => p.status === "pending")}
          columns={paymentColumns}
          loading={loading}
          error={error}
          sortConfig={sortConfig}
          onSort={setSortConfig}
        />
      )}

      {/* Fee Structure Form Modal */}
      {showModal && activeTab === "structure" && (
        <FeeStructureForm
          feeStructure={selectedItem}
          hostels={hostels}
          onSave={handleSaveFeeStructure}
          onClose={() => {
            setShowModal(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
};

/**
 * Fee Structure Form Component
 */
const FeeStructureForm = ({ feeStructure, hostels, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    hostelId: "",
    roomType: "Double",
    capacity: "",
    monthlyFee: "",
    annualFee: "",
    deposit: "",
    messCharges: "",
    maintenanceFee: "",
    electricityCharges: "",
    waterCharges: "",
    otherCharges: "",
    status: "active",
    description: "",
  });

  useEffect(() => {
    if (feeStructure) {
      const hostelId = typeof feeStructure.hostelId === 'object' 
        ? feeStructure.hostelId._id 
        : feeStructure.hostelId;
      
      setFormData({
        hostelId: hostelId || "",
        roomType: feeStructure.roomType || "Double",
        capacity: feeStructure.capacity || (feeStructure.roomType === "Dormitory" ? "10" : ""),
        monthlyFee: feeStructure.monthlyFee || "",
        annualFee: feeStructure.annualFee || "",
        deposit: feeStructure.deposit || "",
        messCharges: feeStructure.messCharges || "",
        maintenanceFee: feeStructure.maintenanceFee || "",
        electricityCharges: feeStructure.electricityCharges || "",
        waterCharges: feeStructure.waterCharges || "",
        otherCharges: feeStructure.otherCharges || "",
        status: feeStructure.status || "active",
        description: feeStructure.description || "",
      });
    }
  }, [feeStructure]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Reset capacity when room type changes (unless it's dormitory)
      if (name === "roomType" && value !== "Dormitory") {
        updated.capacity = "";
      } else if (name === "roomType" && value === "Dormitory" && !prev.capacity) {
        updated.capacity = "10"; // Default capacity for dormitory
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.hostelId || !formData.monthlyFee || !formData.annualFee) {
      alert("Please fill all required fields: Hostel, Monthly Fee, and Annual Fee");
      return;
    }

    // Validate capacity for dormitory
    if (formData.roomType === "Dormitory" && (!formData.capacity || Number(formData.capacity) < 1)) {
      alert("Please enter a valid capacity (minimum 1) for dormitory");
      return;
    }

    // Prepare data
    const submitData = {
      hostelId: formData.hostelId,
      roomType: formData.roomType,
      capacity: formData.roomType === "Dormitory" ? Number(formData.capacity) || 10 : undefined,
      monthlyFee: Number(formData.monthlyFee) || 0,
      annualFee: Number(formData.annualFee) || 0,
      deposit: Number(formData.deposit) || 0,
      messCharges: Number(formData.messCharges) || 0,
      maintenanceFee: Number(formData.maintenanceFee) || 0,
      electricityCharges: Number(formData.electricityCharges) || 0,
      waterCharges: Number(formData.waterCharges) || 0,
      otherCharges: Number(formData.otherCharges) || 0,
      status: formData.status || "active",
      description: formData.description || undefined,
    };

    onSave(submitData);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={feeStructure ? "Edit Fee Structure" : "Add Fee Structure"}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="fee-structure-form"
            className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166]"
          >
            {feeStructure ? "Update" : "Save"}
          </button>
        </div>
      }
    >
      <form id="fee-structure-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hostel *
            </label>
            <select
              name="hostelId"
              value={formData.hostelId}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              required
            >
              <option value="">Select Hostel</option>
              {hostels.map((hostel) => (
                <option key={hostel._id} value={hostel._id}>
                  {hostel.name} ({hostel.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Type *
            </label>
            <select
              name="roomType"
              value={formData.roomType}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              required
            >
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Triple">Triple</option>
              <option value="Quad">Quad</option>
              <option value="Dormitory">Dormitory</option>
            </select>
          </div>

          {formData.roomType === "Dormitory" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity (Number of People) *
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                step="1"
                placeholder="e.g., 10"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Total cost will be divided by this number (per person cost)
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Fee (₹) *
            </label>
            <input
              type="number"
              name="monthlyFee"
              value={formData.monthlyFee}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Fee (₹) *
            </label>
            <input
              type="number"
              name="annualFee"
              value={formData.annualFee}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deposit (₹)
            </label>
            <input
              type="number"
              name="deposit"
              value={formData.deposit}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mess Charges (₹/month)
            </label>
            <input
              type="number"
              name="messCharges"
              value={formData.messCharges}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maintenance Fee (₹)
            </label>
            <input
              type="number"
              name="maintenanceFee"
              value={formData.maintenanceFee}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Electricity Charges (₹)
            </label>
            <input
              type="number"
              name="electricityCharges"
              value={formData.electricityCharges}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Water Charges (₹)
            </label>
            <input
              type="number"
              name="waterCharges"
              value={formData.waterCharges}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Other Charges (₹)
            </label>
            <input
              type="number"
              name="otherCharges"
              value={formData.otherCharges}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            placeholder="Optional description"
          />
        </div>
      </form>
    </Modal>
  );
};

export default FeeManagement;
