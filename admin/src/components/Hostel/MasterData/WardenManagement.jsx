/**
 * Warden Management Component
 * Manages hostel warden information
 */
import React, { useState, useEffect, useMemo } from "react";
import { Plus, User, Mail, Phone, MapPin, Shield } from "lucide-react";
import { FilterBar, DataTable, Modal, StatusBadge, SummaryCard } from "../shared";
import { API } from "../../../config/urls";

const WardenManagement = () => {
  const [wardens, setWardens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedWarden, setSelectedWarden] = useState(null);
  const [filters, setFilters] = useState({
    name: "",
    hostelName: "",
    designation: "",
    status: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  /**
   * Fetch wardens from API
   */
  const fetchWardens = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get("/hostel/wardens", {
        params: filters, // Pass filters as query params
      });
      const wardensData = response.data.data || response.data;
      setWardens(Array.isArray(wardensData) ? wardensData : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch wardens");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWardens();
  }, [filters]);

  /**
   * Filter and sort data
   */
  const filteredAndSortedData = useMemo(() => {
    let filtered = wardens.filter((warden) => {
      return (
        (filters.name === "" ||
          warden.name?.toLowerCase().includes(filters.name.toLowerCase())) &&
        (filters.hostelName === "" ||
          warden.hostelName?.toLowerCase().includes(filters.hostelName.toLowerCase())) &&
        (filters.designation === "" || warden.designation === filters.designation) &&
        (filters.status === "" || warden.status === filters.status)
      );
    });

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (sortConfig.key === "joiningDate") {
          const dateA = new Date(aValue || 0);
          const dateB = new Date(bValue || 0);
          return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [wardens, filters, sortConfig]);

  /**
   * Calculate statistics
   */
  const statistics = useMemo(() => {
    const active = wardens.filter((w) => w.status === "active").length;
    const chiefWardens = wardens.filter((w) => w.designation === "Chief Warden").length;
    const assistantWardens = wardens.filter((w) => w.designation === "Assistant Warden").length;

    return {
      total: wardens.length,
      active,
      inactive: wardens.length - active,
      chiefWardens,
      assistantWardens,
    };
  }, [wardens]);

  /**
   * Table columns
   */
  const columns = [
    {
      key: "wardenId",
      title: "Warden ID",
      cellType: "text",
    },
    {
      key: "name",
      title: "Name",
      cellType: "text",
    },
    {
      key: "designation",
      title: "Designation",
      cellType: "text",
    },
    {
      key: "hostelName",
      title: "Hostel",
      cellType: "text",
    },
    {
      key: "email",
      title: "Email",
      cellType: "text",
    },
    {
      key: "phone",
      title: "Phone",
      cellType: "text",
    },
    {
      key: "joiningDate",
      title: "Joining Date",
      cellType: "date",
    },
    {
      key: "status",
      title: "Status",
      cellType: "custom",
      render: (value) => <StatusBadge status={value} />,
    },
  ];

  /**
   * Filter configuration
   */
  const filterConfig = [
    {
      name: "name",
      type: "text",
      placeholder: "Search warden name...",
      label: "Name",
    },
    {
      name: "hostelName",
      type: "text",
      placeholder: "Search hostel...",
      label: "Hostel",
    },
    {
      name: "designation",
      type: "select",
      placeholder: "All Designations",
      label: "Designation",
      options: [
        { value: "Chief Warden", label: "Chief Warden" },
        { value: "Assistant Warden", label: "Assistant Warden" },
        { value: "Deputy Warden", label: "Deputy Warden" },
      ],
    },
    {
      name: "status",
      type: "select",
      placeholder: "All Statuses",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Warden Management
        </h2>
        <button
          onClick={() => {
            setSelectedWarden(null);
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Warden
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <SummaryCard
          title="Total Wardens"
          value={statistics.total}
          icon={User}
          color="blue"
        />
        <SummaryCard
          title="Active"
          value={statistics.active}
          icon={Shield}
          color="green"
        />
        <SummaryCard
          title="Chief Wardens"
          value={statistics.chiefWardens}
          icon={User}
          color="purple"
        />
        <SummaryCard
          title="Assistant Wardens"
          value={statistics.assistantWardens}
          icon={User}
          color="indigo"
        />
        <SummaryCard
          title="Inactive"
          value={statistics.inactive}
          icon={User}
          color="red"
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilter={setFilters}
        filterConfig={filterConfig}
        className="mb-4"
      />

      {/* Data Table */}
      <DataTable
        data={filteredAndSortedData}
        columns={columns}
        loading={loading}
        error={error}
        onView={(id) => {
          const warden = wardens.find((w) => w._id === id);
          setSelectedWarden(warden);
          setShowModal(true);
        }}
        onEdit={(id) => {
          const warden = wardens.find((w) => w._id === id);
          setSelectedWarden(warden);
          setShowModal(true);
        }}
        onDelete={async (id) => {
          if (window.confirm("Are you sure you want to delete this warden?")) {
            try {
              await API.delete(`/hostel/wardens/${id}`);
              fetchWardens();
            } catch (err) {
              alert(err.response?.data?.message || "Failed to delete warden");
            }
          }
        }}
        sortConfig={sortConfig}
        onSort={setSortConfig}
        emptyState={{
          title: "No wardens found",
          message: "Wardens will appear here once they are added.",
        }}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedWarden(null);
        }}
        title={selectedWarden ? "Edit Warden" : "Add New Warden"}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedWarden(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="warden-form"
              className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166]"
            >
              {selectedWarden ? "Update" : "Save"}
            </button>
          </div>
        }
      >
        <WardenForm
          warden={selectedWarden}
          onSave={async (data) => {
            try {
              if (selectedWarden) {
                await API.put(`/hostel/wardens/${selectedWarden._id}`, data);
              } else {
                await API.post("/hostel/wardens", data);
              }
              setShowModal(false);
              setSelectedWarden(null);
              fetchWardens();
            } catch (err) {
              alert(err.response?.data?.message || "Failed to save warden");
            }
          }}
        />
      </Modal>
    </div>
  );
};

/**
 * Warden Form Component
 */
const WardenForm = ({ warden, onSave }) => {
  const [formData, setFormData] = useState({
    wardenId: "",
    name: "",
    designation: "Chief Warden",
    email: "",
    phone: "",
    alternatePhone: "",
    address: "",
    qualification: "",
    experience: "",
    joiningDate: new Date().toISOString().split("T")[0],
    status: "active",
    responsibilities: [],
  });

  useEffect(() => {
    if (warden) {
      // Format joiningDate for date input (YYYY-MM-DD)
      const formattedWarden = {
        ...warden,
        joiningDate: warden.joiningDate
          ? new Date(warden.joiningDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      };
      setFormData(formattedWarden);
    }
  }, [warden]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        responsibilities: checked
          ? [...prev.responsibilities, value]
          : prev.responsibilities.filter((r) => r !== value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Format joiningDate to ISO string
    const submitData = {
      ...formData,
      joiningDate: formData.joiningDate 
        ? new Date(formData.joiningDate).toISOString()
        : new Date().toISOString(),
    };
    onSave(submitData);
  };

  const responsibilityOptions = [
    "Hostel Administration",
    "Student Welfare",
    "Discipline",
    "Security",
    "Maintenance",
    "Mess Management",
    "Fee Collection",
    "Attendance",
  ];

  return (
    <form id="warden-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Warden ID *
          </label>
          <input
            type="text"
            name="wardenId"
            value={formData.wardenId}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Designation *
          </label>
          <select
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            required
          >
            <option value="Chief Warden">Chief Warden</option>
            <option value="Assistant Warden">Assistant Warden</option>
            <option value="Deputy Warden">Deputy Warden</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alternate Phone
          </label>
          <input
            type="tel"
            name="alternatePhone"
            value={formData.alternatePhone}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qualification
          </label>
          <input
            type="text"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            placeholder="e.g., Ph.D. in Physics"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience
          </label>
          <input
            type="text"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            placeholder="e.g., 15 years"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Joining Date *
          </label>
          <input
            type="date"
            name="joiningDate"
            value={formData.joiningDate}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            required
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

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="2"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Responsibilities
          </label>
          <div className="grid grid-cols-4 gap-2">
            {responsibilityOptions.map((resp) => (
              <label key={resp} className="flex items-center">
                <input
                  type="checkbox"
                  value={resp}
                  checked={formData.responsibilities.includes(resp)}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-[#525b88] focus:ring-[#525b88]"
                />
                <span className="ml-2 text-sm text-gray-700">{resp}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
};

export default WardenManagement;

