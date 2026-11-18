/**
 * Complaints & Grievances Management Component
 * Handles complaints and grievances from residents
 */
import React, { useState, useEffect, useMemo } from "react";
import { Plus, AlertCircle, CheckCircle, Clock, MessageSquare } from "lucide-react";
import { FilterBar, DataTable, Modal, StatusBadge, SummaryCard } from "../shared";
import { API } from "../../../config/urls";

const ComplaintManagement = () => {
  const [activeTab, setActiveTab] = useState("all"); // all, pending, resolved, grievances
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({
    category: "",
    priority: "",
    status: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  /**
   * Fetch complaints
   */
  const fetchComplaints = async () => {
    setLoading(true);
    try {
      // TODO: API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setComplaints([
        {
          _id: "1",
          registrationNumber: "AKNU2024001",
          name: "Priya Sharma",
          category: "Infrastructure",
          description: "Water leakage in room 101",
          priority: "high",
          status: "pending",
          complaintDate: "2024-01-23",
          isAnonymous: false,
        },
        {
          _id: "2",
          registrationNumber: "AKNU2024002",
          name: "Sneha Reddy",
          category: "Food",
          description: "Food quality is poor",
          priority: "medium",
          status: "resolved",
          complaintDate: "2024-01-20",
          resolutionDate: "2024-01-22",
          isAnonymous: false,
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  /**
   * Filter complaints by tab
   */
  const filteredByTab = useMemo(() => {
    if (activeTab === "all") return complaints;
    if (activeTab === "pending") return complaints.filter((c) => c.status === "pending");
    if (activeTab === "resolved") return complaints.filter((c) => c.status === "resolved");
    if (activeTab === "grievances") return complaints.filter((c) => c.isGrievance);
    return complaints;
  }, [complaints, activeTab]);

  /**
   * Filter and sort data
   */
  const filteredAndSortedData = useMemo(() => {
    let filtered = filteredByTab.filter((complaint) => {
      return (
        (filters.category === "" || complaint.category === filters.category) &&
        (filters.priority === "" || complaint.priority === filters.priority) &&
        (filters.status === "" || complaint.status === filters.status)
      );
    });

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (sortConfig.key === "complaintDate" || sortConfig.key === "resolutionDate") {
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
  }, [filteredByTab, filters, sortConfig]);

  /**
   * Calculate statistics
   */
  const statistics = useMemo(() => {
    return {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === "pending").length,
      resolved: complaints.filter((c) => c.status === "resolved").length,
      highPriority: complaints.filter((c) => c.priority === "high" || c.priority === "urgent").length,
    };
  }, [complaints]);

  /**
   * Complaint columns
   */
  const complaintColumns = [
    { key: "registrationNumber", title: "Reg No", cellType: "text" },
    {
      key: "name",
      title: "Name",
      cellType: "custom",
      render: (value, row) => (row.isAnonymous ? "Anonymous" : value),
    },
    { key: "category", title: "Category", cellType: "text" },
    {
      key: "description",
      title: "Description",
      cellType: "custom",
      render: (value) => (
        <span className="max-w-xs truncate block" title={value}>
          {value}
        </span>
      ),
    },
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
    { key: "complaintDate", title: "Complaint Date", cellType: "date" },
  ];

  /**
   * Filter configuration
   */
  const filterConfig = [
    {
      name: "category",
      type: "select",
      placeholder: "All Categories",
      options: [
        { value: "Infrastructure", label: "Infrastructure" },
        { value: "Food", label: "Food" },
        { value: "Security", label: "Security" },
        { value: "Maintenance", label: "Maintenance" },
        { value: "Other", label: "Other" },
      ],
    },
    {
      name: "priority",
      type: "select",
      placeholder: "All Priorities",
      options: [
        { value: "urgent", label: "Urgent" },
        { value: "high", label: "High" },
        { value: "medium", label: "Medium" },
        { value: "low", label: "Low" },
      ],
    },
    {
      name: "status",
      type: "select",
      placeholder: "All Statuses",
      options: [
        { value: "pending", label: "Pending" },
        { value: "in-progress", label: "In Progress" },
        { value: "resolved", label: "Resolved" },
        { value: "closed", label: "Closed" },
      ],
    },
  ];

  const tabs = [
    { id: "all", label: "All Complaints", count: statistics.total },
    { id: "pending", label: "Pending", count: statistics.pending },
    { id: "resolved", label: "Resolved", count: statistics.resolved },
    { id: "grievances", label: "Grievances", count: 0 },
  ];

  /**
   * Handle complaint resolution
   */
  const handleResolve = async (id, resolution) => {
    try {
      // TODO: API call
      setComplaints(
        complaints.map((c) =>
          c._id === id
            ? { ...c, status: "resolved", resolution, resolutionDate: new Date().toISOString().split("T")[0] }
            : c
        )
      );
    } catch (err) {
      alert("Failed to resolve complaint");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Complaints & Grievances
        </h2>
        <button
          onClick={() => {
            setSelectedItem(null);
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Register Complaint
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Total Complaints"
          value={statistics.total}
          icon={MessageSquare}
          color="blue"
        />
        <SummaryCard
          title="Pending"
          value={statistics.pending}
          icon={Clock}
          color="yellow"
        />
        <SummaryCard
          title="Resolved"
          value={statistics.resolved}
          icon={CheckCircle}
          color="green"
        />
        <SummaryCard
          title="High Priority"
          value={statistics.highPriority}
          icon={AlertCircle}
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
                ${
                  activeTab === tab.id
                    ? "border-[#525b88] text-[#525b88]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              `}
            >
              {tab.label} ({tab.count || 0})
            </button>
          ))}
        </nav>
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
        columns={complaintColumns}
        loading={loading}
        error={error}
        onView={(id) => {
          const complaint = complaints.find((c) => c._id === id);
          setSelectedItem(complaint);
          setShowModal(true);
        }}
        onEdit={(id) => {
          const complaint = complaints.find((c) => c._id === id);
          setSelectedItem(complaint);
          setShowModal(true);
        }}
        sortConfig={sortConfig}
        onSort={setSortConfig}
        emptyState={{
          title: "No complaints found",
          message: "Complaints will appear here once registered.",
        }}
      />
    </div>
  );
};

export default ComplaintManagement;

