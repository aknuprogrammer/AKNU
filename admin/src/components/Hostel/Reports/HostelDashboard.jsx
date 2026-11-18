/**
 * Hostel Management Dashboard
 * Comprehensive reporting and analytics
 */
import React, { useState, useEffect, useMemo } from "react";
import { BarChart3, TrendingUp, Users, Bed, DollarSign, AlertCircle } from "lucide-react";
import { SummaryCard } from "../shared";
import { API } from "../../../config/urls";

const HostelDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch dashboard data
   */
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setDashboardData({
        totalHostels: 3,
        totalCapacity: 650,
        totalOccupied: 580,
        totalAvailable: 70,
        occupancyRate: 89.2,
        totalApplications: 120,
        pendingApplications: 15,
        totalRevenue: 2500000,
        pendingPayments: 150000,
        maintenancePending: 8,
        complaintsPending: 5,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#525b88]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error loading dashboard: {error}
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Hostel Management Dashboard
        </h2>
        <p className="text-gray-600 mt-2">Overview of all hostel operations</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Total Hostels"
          value={dashboardData.totalHostels}
          icon={Bed}
          color="blue"
        />
        <SummaryCard
          title="Occupancy Rate"
          value={`${dashboardData.occupancyRate}%`}
          icon={TrendingUp}
          color="green"
        />
        <SummaryCard
          title="Total Revenue"
          value={`₹${dashboardData.totalRevenue.toLocaleString("en-IN")}`}
          icon={DollarSign}
          color="purple"
        />
        <SummaryCard
          title="Pending Items"
          value={
            dashboardData.pendingApplications +
            dashboardData.maintenancePending +
            dashboardData.complaintsPending
          }
          icon={AlertCircle}
          color="yellow"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Capacity</p>
              <p className="text-2xl font-bold text-[#525b88]">{dashboardData.totalCapacity}</p>
            </div>
            <Users className="w-8 h-8 text-[#525b88]" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-indigo-600">{dashboardData.totalOccupied}</p>
            </div>
            <Bed className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">{dashboardData.totalAvailable}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Pending Applications</p>
          <p className="text-xl font-bold text-yellow-600">{dashboardData.pendingApplications}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Pending Payments</p>
          <p className="text-xl font-bold text-orange-600">
            ₹{dashboardData.pendingPayments.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Maintenance Pending</p>
          <p className="text-xl font-bold text-red-600">{dashboardData.maintenancePending}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Complaints Pending</p>
          <p className="text-xl font-bold text-blue-600">{dashboardData.complaintsPending}</p>
        </div>
      </div>
    </div>
  );
};

export default HostelDashboard;

