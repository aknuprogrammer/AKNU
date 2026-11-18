/**
 * Hostel Type Management Component
 * Manages hostel type master data
 */
import React, { useState, useEffect, useMemo } from "react";
import { Plus, Tag } from "lucide-react";
import { FilterBar, DataTable, Modal, StatusBadge, SummaryCard } from "../shared";
import { API } from "../../../config/urls";

const HostelTypeManagement = () => {
  const [hostelTypes, setHostelTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [filters, setFilters] = useState({
    name: "",
    code: "",
    status: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  /**
   * Fetch hostel types from API
   */
  const fetchHostelTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get("/hostel/types", {
        params: filters,
      });
      const typesData = response.data.data || response.data;
      setHostelTypes(Array.isArray(typesData) ? typesData : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to fetch hostel types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostelTypes();
  }, [filters]);

  /**
   * Filter and sort data
   */
  const filteredAndSortedData = useMemo(() => {
    let filtered = hostelTypes.filter((type) => {
      return (
        (filters.name === "" ||
          type.name?.toLowerCase().includes(filters.name.toLowerCase())) &&
        (filters.code === "" ||
          type.code?.toLowerCase().includes(filters.code.toLowerCase())) &&
        (filters.status === "" || type.status === filters.status)
      );
    });

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
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
  }, [hostelTypes, filters, sortConfig]);

  /**
   * Calculate statistics
   */
  const statistics = useMemo(() => {
    const active = hostelTypes.filter((t) => t.status === "active").length;
    return {
      total: hostelTypes.length,
      active,
      inactive: hostelTypes.length - active,
    };
  }, [hostelTypes]);

  /**
   * Table columns
   */
  const columns = [
    {
      key: "code",
      title: "Code",
      cellType: "text",
    },
    {
      key: "name",
      title: "Name",
      cellType: "text",
    },
    {
      key: "description",
      title: "Description",
      cellType: "text",
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
      placeholder: "Search name...",
      label: "Name",
    },
    {
      name: "code",
      type: "text",
      placeholder: "Search code...",
      label: "Code",
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
          Hostel Type Management
        </h2>
        <button
          onClick={() => {
            setSelectedType(null);
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Hostel Type
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          title="Total Types"
          value={statistics.total}
          icon={Tag}
          color="blue"
        />
        <SummaryCard
          title="Active"
          value={statistics.active}
          icon={Tag}
          color="green"
        />
        <SummaryCard
          title="Inactive"
          value={statistics.inactive}
          icon={Tag}
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
          const type = hostelTypes.find((t) => t._id === id);
          setSelectedType(type);
          setShowModal(true);
        }}
        onEdit={(id) => {
          const type = hostelTypes.find((t) => t._id === id);
          setSelectedType(type);
          setShowModal(true);
        }}
        onDelete={async (id) => {
          if (window.confirm("Are you sure you want to delete this hostel type?")) {
            try {
              await API.delete(`/hostel/types/${id}`);
              fetchHostelTypes();
            } catch (err) {
              alert(err.response?.data?.message || "Failed to delete hostel type");
            }
          }
        }}
        sortConfig={sortConfig}
        onSort={setSortConfig}
        emptyState={{
          title: "No hostel types found",
          message: "Hostel types will appear here once they are added.",
        }}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedType(null);
        }}
        title={selectedType ? "Edit Hostel Type" : "Add New Hostel Type"}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedType(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="hostel-type-form"
              className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166]"
            >
              {selectedType ? "Update" : "Save"}
            </button>
          </div>
        }
      >
        <HostelTypeForm
          type={selectedType}
          onSave={async (data) => {
            try {
              if (selectedType) {
                await API.put(`/hostel/types/${selectedType._id}`, data);
              } else {
                await API.post("/hostel/types", data);
              }
              setShowModal(false);
              setSelectedType(null);
              fetchHostelTypes();
            } catch (err) {
              alert(err.response?.data?.message || "Failed to save hostel type");
            }
          }}
        />
      </Modal>
    </div>
  );
};

/**
 * Hostel Type Form Component
 */
const HostelTypeForm = ({ type, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    status: "active",
  });

  useEffect(() => {
    if (type) {
      setFormData({ ...type });
    }
  }, [type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form id="hostel-type-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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
            Code *
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
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
    </form>
  );
};

export default HostelTypeManagement;

