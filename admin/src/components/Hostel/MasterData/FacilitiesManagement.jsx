/**
 * Facilities Management Component
 * Manages hostel facilities (AC, WiFi, etc.)
 */
import React, { useState, useEffect, useMemo } from "react";
import { Plus, Settings } from "lucide-react";
import { FilterBar, DataTable, Modal, StatusBadge, SummaryCard } from "../shared";
import { API } from "../../../config/urls";

const FacilitiesManagement = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [filters, setFilters] = useState({
    name: "",
    category: "",
    type: "",
    status: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  /**
   * Fetch facilities from API
   */
  const fetchFacilities = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiParams = {
        ...filters,
      };
      
      const response = await API.get("/hostel/facilities", {
        params: apiParams,
      });
      
      let facilitiesData = [];
      if (response.data) {
        if (response.data.success && response.data.data) {
          facilitiesData = response.data.data;
        } else if (Array.isArray(response.data.data)) {
          facilitiesData = response.data.data;
        } else if (Array.isArray(response.data)) {
          facilitiesData = response.data;
        }
      }
      
      setFacilities(Array.isArray(facilitiesData) ? facilitiesData : []);
    } catch (err) {
      console.error("Error fetching facilities:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch facilities");
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [filters]);

  /**
   * Handle filter changes
   */
  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  /**
   * Handle sorting
   */
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  /**
   * Filter and sort data
   */
  const filteredAndSortedData = useMemo(() => {
    let filtered = facilities.filter((facility) => {
      return (
        (filters.name === "" ||
          facility.name?.toLowerCase().includes(filters.name.toLowerCase())) &&
        (filters.category === "" || facility.category === filters.category) &&
        (filters.type === "" || facility.type === filters.type) &&
        (filters.status === "" || facility.status === filters.status)
      );
    });

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
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
  }, [facilities, filters, sortConfig]);

  /**
   * Calculate statistics
   */
  const statistics = useMemo(() => {
    return {
      total: facilities.length,
      active: facilities.filter(f => f.status === "active").length,
      roomFacilities: facilities.filter(f => f.category === "room" || f.category === "both").length,
      hostelFacilities: facilities.filter(f => f.category === "hostel" || f.category === "both").length,
    };
  }, [facilities]);

  /**
   * Table columns configuration
   */
  const columns = [
    {
      key: "name",
      title: "Facility Name",
      cellType: "text",
    },
    {
      key: "code",
      title: "Code",
      cellType: "text",
      render: (value) => value || "-",
    },
    {
      key: "type",
      title: "Type",
      cellType: "custom",
      render: (value) => (
        <span className="capitalize px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
          {value || "checkbox"}
        </span>
      ),
    },
    {
      key: "category",
      title: "Category",
      cellType: "custom",
      render: (value) => (
        <span className="capitalize px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
          {value || "both"}
        </span>
      ),
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
      placeholder: "Search facility name...",
      label: "Facility Name",
    },
    {
      name: "category",
      type: "select",
      placeholder: "All Categories",
      label: "Category",
      options: [
        { value: "", label: "All Categories" },
        { value: "room", label: "Room" },
        { value: "hostel", label: "Hostel" },
        { value: "both", label: "Both" },
      ],
    },
    {
      name: "type",
      type: "select",
      placeholder: "All Types",
      label: "Type",
      options: [
        { value: "", label: "All Types" },
        { value: "checkbox", label: "Checkbox" },
        { value: "count", label: "Count" },
        { value: "both", label: "Both" },
      ],
    },
    {
      name: "status",
      type: "select",
      placeholder: "All Statuses",
      label: "Status",
      options: [
        { value: "", label: "All Statuses" },
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
          Facilities Management
        </h2>
        <button
          onClick={() => {
            setSelectedFacility(null);
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Facility
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Total Facilities"
          value={statistics.total}
          icon={Settings}
          color="blue"
        />
        <SummaryCard
          title="Active Facilities"
          value={statistics.active}
          icon={Settings}
          color="green"
        />
        <SummaryCard
          title="Room Facilities"
          value={statistics.roomFacilities}
          icon={Settings}
          color="indigo"
        />
        <SummaryCard
          title="Hostel Facilities"
          value={statistics.hostelFacilities}
          icon={Settings}
          color="purple"
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilter={handleFilter}
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
          const facility = facilities.find((f) => f._id === id);
          setSelectedFacility(facility);
          setShowModal(true);
        }}
        onEdit={(id) => {
          const facility = facilities.find((f) => f._id === id);
          setSelectedFacility(facility);
          setShowModal(true);
        }}
        onDelete={async (id) => {
          if (window.confirm("Are you sure you want to delete this facility?")) {
            try {
              await API.delete(`/hostel/facilities/${id}`);
              fetchFacilities();
            } catch (err) {
              alert(err.response?.data?.message || "Failed to delete facility");
            }
          }
        }}
        sortConfig={sortConfig}
        onSort={handleSort}
        emptyState={{
          title: "No facilities found",
          message: "Facilities will appear here once they are added.",
        }}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedFacility(null);
        }}
        title={selectedFacility ? "Edit Facility" : "Add New Facility"}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedFacility(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="facility-form"
              className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166]"
            >
              {selectedFacility ? "Update" : "Save"}
            </button>
          </div>
        }
      >
        <FacilityForm
          facility={selectedFacility}
          onSave={async (data) => {
            try {
              console.log("Saving facility data:", data);
              
              if (!data.name) {
                alert("Please fill all required fields (Name)");
                return;
              }
              
              const config = {
                headers: {
                  'Content-Type': 'application/json',
                },
              };
              
              let response;
              if (selectedFacility) {
                response = await API.put(`/hostel/facilities/${selectedFacility._id}`, data, config);
              } else {
                response = await API.post("/hostel/facilities", data, config);
              }
              
              console.log("Save response:", response.data);
              
              setShowModal(false);
              setSelectedFacility(null);
              
              setTimeout(() => {
                fetchFacilities();
              }, 500);
            } catch (err) {
              console.error("Error saving facility:", err);
              const errorMessage = err.response?.data?.message || 
                                 err.response?.data?.error || 
                                 err.message || 
                                 "Failed to save facility";
              alert(errorMessage);
            }
          }}
        />
      </Modal>
    </div>
  );
};

/**
 * Facility Form Component
 */
const FacilityForm = ({ facility, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "checkbox",
    description: "",
    category: "both",
    status: "active",
  });

  useEffect(() => {
    if (facility) {
      setFormData({
        name: facility.name || "",
        code: facility.code || "",
        type: facility.type || "checkbox",
        description: facility.description || "",
        category: facility.category || "both",
        status: facility.status || "active",
      });
    }
  }, [facility]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = {
      name: (formData.name || "").trim(),
      code: formData.code ? formData.code.trim() : undefined,
      type: formData.type || "checkbox",
      description: formData.description ? formData.description.trim() : undefined,
      category: formData.category || "both",
      status: formData.status || "active",
    };
    
    if (!submitData.name) {
      alert("Please fill all required fields: Name");
      return;
    }
    
    onSave(submitData);
  };

  return (
    <form id="facility-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Facility Name *
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
            Code
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            required
          >
            <option value="checkbox">Checkbox</option>
            <option value="count">Count</option>
            <option value="both">Both</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            required
          >
            <option value="room">Room</option>
            <option value="hostel">Hostel</option>
            <option value="both">Both</option>
          </select>
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
  );
};

export default FacilitiesManagement;

