/**
 * Room Allocation Management Component
 * Manages room and bed allocations for students/staff
 */
import React, { useState, useEffect, useMemo } from "react";
import { Plus, MapPin, Users, Bed, Home } from "lucide-react";
import { FilterBar, DataTable, Modal, StatusBadge, SummaryCard } from "../shared";
import { API } from "../../../config/urls";

const RoomAllocation = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [filters, setFilters] = useState({
    registrationNumber: "",
    name: "",
    hostelName: "",
    roomNumber: "",
    status: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  /**
   * Fetch allocations from API
   */
  const fetchAllocations = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API endpoint
      // const response = await API.get("/hostel/allocations");
      // setAllocations(response.data);
      
      // Mock data
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAllocations([
        {
          _id: "1",
          registrationNumber: "AKNU2024001",
          name: "Priya Sharma",
          course: "B.Tech",
          hostelName: "Saraswati Girls Hostel",
          blockName: "Block A",
          roomNumber: "101",
          bedNumber: "1",
          allocatedDate: "2024-01-15",
          status: "active",
        },
        {
          _id: "2",
          registrationNumber: "AKNU2024002",
          name: "Sneha Reddy",
          course: "M.Sc",
          hostelName: "Lakshmi Girls Hostel",
          blockName: "Block B",
          roomNumber: "205",
          bedNumber: "2",
          allocatedDate: "2024-01-10",
          status: "active",
        },
      ]);
    } catch (err) {
      setError(err.message || "Failed to fetch allocations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  /**
   * Filter and sort data
   */
  const filteredAndSortedData = useMemo(() => {
    let filtered = allocations.filter((allocation) => {
      return (
        (filters.registrationNumber === "" ||
          allocation.registrationNumber?.toLowerCase().includes(filters.registrationNumber.toLowerCase())) &&
        (filters.name === "" ||
          allocation.name?.toLowerCase().includes(filters.name.toLowerCase())) &&
        (filters.hostelName === "" ||
          allocation.hostelName?.toLowerCase().includes(filters.hostelName.toLowerCase())) &&
        (filters.roomNumber === "" ||
          allocation.roomNumber?.toLowerCase().includes(filters.roomNumber.toLowerCase())) &&
        (filters.status === "" || allocation.status === filters.status)
      );
    });

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (sortConfig.key === "allocatedDate") {
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
  }, [allocations, filters, sortConfig]);

  /**
   * Calculate statistics
   */
  const statistics = useMemo(() => {
    const active = allocations.filter((a) => a.status === "active").length;
    return {
      total: allocations.length,
      active,
      inactive: allocations.length - active,
    };
  }, [allocations]);

  /**
   * Table columns
   */
  const columns = [
    {
      key: "registrationNumber",
      title: "Registration No",
      cellType: "text",
    },
    {
      key: "name",
      title: "Name",
      cellType: "text",
    },
    {
      key: "hostelName",
      title: "Hostel",
      cellType: "text",
    },
    {
      key: "blockName",
      title: "Block",
      cellType: "text",
    },
    {
      key: "roomNumber",
      title: "Room",
      cellType: "text",
    },
    {
      key: "bedNumber",
      title: "Bed",
      cellType: "text",
    },
    {
      key: "allocatedDate",
      title: "Allocated Date",
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
      name: "registrationNumber",
      type: "text",
      placeholder: "Registration No",
    },
    {
      name: "name",
      type: "text",
      placeholder: "Name",
    },
    {
      name: "hostelName",
      type: "text",
      placeholder: "Hostel Name",
    },
    {
      name: "roomNumber",
      type: "text",
      placeholder: "Room Number",
    },
    {
      name: "status",
      type: "select",
      placeholder: "All Statuses",
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
          Room Allocations
        </h2>
        <button
          onClick={() => {
            setSelectedAllocation(null);
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Allocation
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          title="Total Allocations"
          value={statistics.total}
          icon={Users}
          color="blue"
        />
        <SummaryCard
          title="Active"
          value={statistics.active}
          icon={Bed}
          color="green"
        />
        <SummaryCard
          title="Inactive"
          value={statistics.inactive}
          icon={Home}
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
          const allocation = allocations.find((a) => a._id === id);
          setSelectedAllocation(allocation);
          setShowModal(true);
        }}
        onEdit={(id) => {
          const allocation = allocations.find((a) => a._id === id);
          setSelectedAllocation(allocation);
          setShowModal(true);
        }}
        onDelete={(id) => {
          if (window.confirm("Are you sure you want to deallocate this room?")) {
            setAllocations(allocations.filter((a) => a._id !== id));
          }
        }}
        sortConfig={sortConfig}
        onSort={setSortConfig}
        emptyState={{
          title: "No allocations found",
          message: "Room allocations will appear here once created.",
        }}
      />
    </div>
  );
};

export default RoomAllocation;

