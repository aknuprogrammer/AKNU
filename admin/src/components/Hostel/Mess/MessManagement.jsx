/**
 * Mess Management Component
 * Manages mess operations, menu, and attendance
 */
import React, { useState, useEffect, useMemo } from "react";
import { Plus, UtensilsCrossed, Calendar, Users, DollarSign, Star, Search, Loader2 } from "lucide-react";
import { FilterBar, DataTable, Modal, StatusBadge, SummaryCard } from "../shared";
import { apiRequest } from "../../../services/apiService";
import { toast } from "react-hot-toast";

const MessManagement = () => {
  const [activeTab, setActiveTab] = useState("menu"); // menu, attendance
  const [menus, setMenus] = useState([]);
  const [messAttendance, setMessAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewHostel, setPreviewHostel] = useState(null);
  const [previewData, setPreviewData] = useState([]);

  const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const [menuFormData, setMenuFormData] = useState({
    hostelId: "",
    weeklyMenu: DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day,
      breakfast: { veg: "", nonVeg: "" },
      lunch: { veg: "", nonVeg: "" },
      snacks: { veg: "", nonVeg: "" },
      dinner: { veg: "", nonVeg: "" }
    }))
  });

  const [attendanceFormData, setAttendanceFormData] = useState({
    hostelId: "",
    date: new Date().toISOString().split("T")[0],
    mealType: "Breakfast"
  });

  const [attendanceList, setAttendanceList] = useState([]);
  const [attendanceSearch, setAttendanceSearch] = useState("");

  const [hostels, setHostels] = useState([]);
  const [fetchingAllocation, setFetchingAllocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Fetch menus
   */
  const fetchMenus = async () => {
    setLoading(true);
    try {
      // Fetch only hostels that have menus for the main grid
      const response = await apiRequest("hostel/mess/menu?summary=true");
      if (response.success) {
        setMenus(response.data || []);
      }
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch menus");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch mess attendance
   */
  const fetchMessAttendance = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await apiRequest(`hostel/mess/attendance?${queryParams}`);
      if (response.success) {
        setMessAttendance(response.data || []);
      }
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch hostels
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


  useEffect(() => {
    fetchHostels();
    if (activeTab === "menu") {
      fetchMenus();
    } else if (activeTab === "attendance") {
      fetchMessAttendance();
    }
  }, [activeTab, filters]);

  const handleAddMenu = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await apiRequest("hostel/mess/menu/bulk", "POST", menuFormData);
      if (response.success) {
        toast.success("Weekly menu saved successfully!");
        setShowModal(false);
        fetchMenus();
        setMenuFormData({
          hostelId: "",
          weeklyMenu: DAYS_OF_WEEK.map(day => ({
            dayOfWeek: day,
            breakfast: { veg: "", nonVeg: "" },
            lunch: { veg: "", nonVeg: "" },
            snacks: { veg: "", nonVeg: "" },
            dinner: { veg: "", nonVeg: "" }
          }))
        });
      }
    } catch (err) {
      toast.error(err.message || "Failed to save weekly menu");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle Bulk Mess Attendance Status Fetch
   */
  const fetchAttendanceStatus = async () => {
    const { hostelId, date, mealType } = attendanceFormData;
    if (!hostelId || !date || !mealType) return;

    setFetchingAllocation(true);
    try {
      const response = await apiRequest(`hostel/mess/attendance/status?hostelId=${hostelId}&date=${date}&mealType=${mealType}`);
      if (response.success) {
        setAttendanceList(response.data || []);
      }
    } catch (err) {
      toast.error("Failed to fetch student list");
    } finally {
      setFetchingAllocation(false);
    }
  };

  /**
   * Effect to refetch status when primary fields change
   */
  useEffect(() => {
    if (showModal && activeTab === "attendance") {
      fetchAttendanceStatus();
    }
  }, [attendanceFormData.hostelId, attendanceFormData.date, attendanceFormData.mealType]);

  /**
   * Handle Bulk Mark Attendance Save
   */
  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await apiRequest("hostel/mess/attendance/bulk", "POST", {
        date: attendanceFormData.date,
        mealType: attendanceFormData.mealType,
        attendanceData: attendanceList
      });
      if (response.success) {
        toast.success("Mess attendance saved successfully!");
        setShowModal(false);
        fetchMessAttendance();
      }
    } catch (err) {
      toast.error(err.message || "Failed to save attendance");
    } finally {
      setSubmitting(false);
    }
  };



  /**
   * Handle View Menu (Preview)
   */
  const handleViewMenu = async (hostel) => {
    setLoading(true);
    try {
      const response = await apiRequest(`hostel/mess/menu?hostelId=${hostel._id}`);
      if (response.success) {
        setPreviewHostel(hostel);
        setPreviewData(response.data || []);
        setShowPreviewModal(true);
      }
    } catch (err) {
      toast.error("Failed to fetch menu details");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Edit Menu
   */
  const handleEditMenu = async (hostel) => {
    setLoading(true);
    try {
      const response = await apiRequest(`hostel/mess/menu?hostelId=${hostel._id}`);
      if (response.success) {
        const existingData = response.data || [];
        // Map existing data to form format
        const weeklyMenu = DAYS_OF_WEEK.map(day => {
          const dayData = (existingData || []).find(d => d.dayOfWeek === day);
          return {
            dayOfWeek: day,
            breakfast: dayData?.breakfast || { veg: "", nonVeg: "" },
            lunch: dayData?.lunch || { veg: "", nonVeg: "" },
            snacks: dayData?.snacks || { veg: "", nonVeg: "" },
            dinner: dayData?.dinner || { veg: "", nonVeg: "" }
          };
        });

        setMenuFormData({
          hostelId: hostel._id,
          weeklyMenu
        });
        setSelectedItem(hostel);
        setShowModal(true);
      }
    } catch (err) {
      toast.error("Failed to fetch menu for editing");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Delete Menu
   */
  const handleDeleteMenu = async (hostelId) => {
    if (!window.confirm("Are you sure you want to delete the entire weekly menu for this hostel?")) return;

    setLoading(true);
    try {
      const response = await apiRequest(`hostel/mess/menu/hostel/${hostelId}`, "DELETE");
      if (response.success) {
        toast.success("Weekly menu deleted successfully");
        fetchMenus();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete menu");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate statistics
   */
  const statistics = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayRows = messAttendance.filter(row => row.date === today);

    return {
      breakfastCount: todayRows.filter((a) => a.breakfast?.attended).length,
      lunchCount: todayRows.filter((a) => a.lunch?.attended).length,
      dinnerCount: todayRows.filter((a) => a.dinner?.attended).length,
    };
  }, [messAttendance]);

  /**
   * Menu columns
   */
  const menuColumns = [
    {
      key: "name",
      title: "Hostel Name",
      cellType: "text"
    },
    {
      key: "menu_actions",
      title: "Actions",
      cellType: "custom",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewMenu(row)}
            className="px-3 py-1 text-xs font-bold text-[#525b88] border border-[#525b88] rounded hover:bg-[#525b88] hover:text-white transition-all uppercase tracking-tighter"
          >
            View Menu
          </button>
          <button
            onClick={() => handleEditMenu(row)}
            className="px-3 py-1 text-xs font-bold text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition-all uppercase tracking-tighter"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteMenu(row._id)}
            className="px-3 py-1 text-xs font-bold text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white transition-all uppercase tracking-tighter"
          >
            Delete
          </button>
        </div>
      )
    },
  ];

  const attendanceColumns = [
    { key: "registrationNumber", title: "Reg No", cellType: "text" },
    { key: "name", title: "Name", cellType: "text" },
    { key: "date", title: "Date", cellType: "date" },
    {
      key: "breakfast",
      title: "Breakfast",
      cellType: "custom",
      render: (value) => (
        <div className="flex flex-col gap-0.5">
          <span className={`text-xs font-bold ${value?.attended ? 'text-green-600' : value === null ? 'text-gray-300' : 'text-red-500'}`}>
            {value?.attended ? "✓ Attended" : value === null ? "—" : "✗ Absent"}
          </span>
          {value?.guestMeals > 0 && <span className="text-[10px] text-orange-500 font-medium">+{value.guestMeals} Guest</span>}
        </div>
      )
    },
    {
      key: "lunch",
      title: "Lunch",
      cellType: "custom",
      render: (value) => (
        <div className="flex flex-col gap-0.5">
          <span className={`text-xs font-bold ${value?.attended ? 'text-green-600' : value === null ? 'text-gray-300' : 'text-red-500'}`}>
            {value?.attended ? "✓ Attended" : value === null ? "—" : "✗ Absent"}
          </span>
          {value?.guestMeals > 0 && <span className="text-[10px] text-orange-500 font-medium">+{value.guestMeals} Guest</span>}
        </div>
      )
    },
    {
      key: "snacks",
      title: "Snacks",
      cellType: "custom",
      render: (value) => (
        <div className="flex flex-col gap-0.5">
          <span className={`text-xs font-bold ${value?.attended ? 'text-green-600' : value === null ? 'text-gray-300' : 'text-red-500'}`}>
            {value?.attended ? "✓ Attended" : value === null ? "—" : "✗ Absent"}
          </span>
          {value?.guestMeals > 0 && <span className="text-[10px] text-orange-500 font-medium">+{value.guestMeals} Guest</span>}
        </div>
      )
    },
    {
      key: "dinner",
      title: "Dinner",
      cellType: "custom",
      render: (value) => (
        <div className="flex flex-col gap-0.5">
          <span className={`text-xs font-bold ${value?.attended ? 'text-green-600' : value === null ? 'text-gray-300' : 'text-red-500'}`}>
            {value?.attended ? "✓ Attended" : value === null ? "—" : "✗ Absent"}
          </span>
          {value?.guestMeals > 0 && <span className="text-[10px] text-orange-500 font-medium">+{value.guestMeals} Guest</span>}
        </div>
      )
    }
  ];


  const tabs = [
    { id: "menu", label: "Menu Management" },
    { id: "attendance", label: "Mess Attendance" },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Mess Management
        </h2>
        {activeTab === "menu" && (
          <button
            onClick={() => {
              setSelectedItem(null);
              setShowModal(true);
            }}
            className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Menu
          </button>
        )}
        {activeTab === "attendance" && (
          <button
            onClick={() => {
              setSelectedItem(null);
              setShowModal(true);
            }}
            className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Mark Attendance
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Breakfast Today"
          value={statistics.breakfastCount}
          icon={UtensilsCrossed}
          color="yellow"
        />
        <SummaryCard
          title="Lunch Today"
          value={statistics.lunchCount}
          icon={UtensilsCrossed}
          color="blue"
        />
        <SummaryCard
          title="Dinner Today"
          value={statistics.dinnerCount}
          icon={UtensilsCrossed}
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
      {activeTab === "menu" && (
        <DataTable
          data={menus}
          columns={menuColumns}
          loading={loading}
          error={error}
          sortConfig={sortConfig}
          onSort={setSortConfig}
        />
      )}

      {activeTab === "attendance" && (
        <div className="space-y-6">
          <FilterBar
            filters={filters}
            onFilter={setFilters}
            filterConfig={[
              {
                name: "registrationNumber",
                type: "text",
                label: "Registration No",
                placeholder: "Search by Reg No..."
              },
              {
                name: "date",
                type: "date",
                label: "Attendance Date"
              },
              {
                name: "mealType",
                type: "select",
                label: "Meal Type",
                options: [
                  { value: "Breakfast", label: "Breakfast" },
                  { value: "Lunch", label: "Lunch" },
                  { value: "Snacks", label: "Snacks" },
                  { value: "Dinner", label: "Dinner" }
                ],
                placeholder: "All Meals"
              }
            ]}
          />
          <DataTable
            data={messAttendance}
            columns={attendanceColumns}
            loading={loading}
            error={error}
            sortConfig={sortConfig}
            onSort={setSortConfig}
          />
        </div>
      )}


      {/* Modals */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={activeTab === "menu" ? "Weekly Menu Editor" : "Mark Mess Attendance (Bulk)"}
        maxWidth={activeTab === "menu" ? "max-w-6xl" : "max-w-4xl"}
      >
        {activeTab === "menu" ? (
          <form onSubmit={handleAddMenu} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-[#525b88]/5 rounded-xl border border-[#525b88]/10">
              <div className="flex-1 max-w-md">
                <label className="block text-sm font-bold text-[#525b88] mb-2 uppercase tracking-wider">Select Hostel</label>
                <select
                  required
                  value={menuFormData.hostelId}
                  onChange={(e) => setMenuFormData({ ...menuFormData, hostelId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all text-sm font-medium"
                >
                  <option value="">-- Choose Hostel --</option>
                  {hostels.map(h => (
                    <option key={h._id} value={h._id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-xs text-gray-500 font-medium">Bulk Entry Mode</p>
                <p className="text-sm font-bold text-[#525b88]">All 7 Days Schedule</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[#525b88] uppercase bg-gray-50 font-bold border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 min-w-[120px]">Day</th>
                    <th className="px-4 py-3 min-w-[200px]">Breakfast (Morning)</th>
                    <th className="px-4 py-3 min-w-[200px]">Lunch (Afternoon)</th>
                    <th className="px-4 py-3 min-w-[200px]">Snacks (Optional)</th>
                    <th className="px-4 py-3 min-w-[200px]">Dinner (Night)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {menuFormData.weeklyMenu.map((dayData, index) => (
                    <tr key={dayData.dayOfWeek} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4 font-bold text-[#2a3563] bg-gray-50/30">
                        {dayData.dayOfWeek}
                      </td>
                      <td className="px-2 py-2">
                        <div className="space-y-2">
                          <input
                            type="text"
                            required
                            placeholder="Veg Menu..."
                            value={dayData.breakfast.veg}
                            onChange={(e) => {
                              const newWeekly = [...menuFormData.weeklyMenu];
                              newWeekly[index].breakfast.veg = e.target.value;
                              setMenuFormData({ ...menuFormData, weeklyMenu: newWeekly });
                            }}
                            className="w-full px-3 py-1.5 border border-green-200 rounded-md focus:ring-2 focus:ring-green-100 outline-none text-xs"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Non-Veg Menu..."
                            value={dayData.breakfast.nonVeg}
                            onChange={(e) => {
                              const newWeekly = [...menuFormData.weeklyMenu];
                              newWeekly[index].breakfast.nonVeg = e.target.value;
                              setMenuFormData({ ...menuFormData, weeklyMenu: newWeekly });
                            }}
                            className="w-full px-3 py-1.5 border border-red-200 rounded-md focus:ring-2 focus:ring-red-100 outline-none text-xs"
                          />
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <div className="space-y-2">
                          <input
                            type="text"
                            required
                            placeholder="Veg Menu..."
                            value={dayData.lunch.veg}
                            onChange={(e) => {
                              const newWeekly = [...menuFormData.weeklyMenu];
                              newWeekly[index].lunch.veg = e.target.value;
                              setMenuFormData({ ...menuFormData, weeklyMenu: newWeekly });
                            }}
                            className="w-full px-3 py-1.5 border border-green-200 rounded-md focus:ring-2 focus:ring-green-100 outline-none text-xs"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Non-Veg Menu..."
                            value={dayData.lunch.nonVeg}
                            onChange={(e) => {
                              const newWeekly = [...menuFormData.weeklyMenu];
                              newWeekly[index].lunch.nonVeg = e.target.value;
                              setMenuFormData({ ...menuFormData, weeklyMenu: newWeekly });
                            }}
                            className="w-full px-3 py-1.5 border border-red-200 rounded-md focus:ring-2 focus:ring-red-100 outline-none text-xs"
                          />
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Veg Snacks..."
                            value={dayData.snacks.veg}
                            onChange={(e) => {
                              const newWeekly = [...menuFormData.weeklyMenu];
                              newWeekly[index].snacks.veg = e.target.value;
                              setMenuFormData({ ...menuFormData, weeklyMenu: newWeekly });
                            }}
                            className="w-full px-3 py-1.5 border border-green-200 rounded-md focus:ring-2 focus:ring-green-100 outline-none text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Non-Veg Snacks..."
                            value={dayData.snacks.nonVeg}
                            onChange={(e) => {
                              const newWeekly = [...menuFormData.weeklyMenu];
                              newWeekly[index].snacks.nonVeg = e.target.value;
                              setMenuFormData({ ...menuFormData, weeklyMenu: newWeekly });
                            }}
                            className="w-full px-3 py-1.5 border border-red-200 rounded-md focus:ring-2 focus:ring-red-100 outline-none text-xs"
                          />
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <div className="space-y-2">
                          <input
                            type="text"
                            required
                            placeholder="Veg Menu..."
                            value={dayData.dinner.veg}
                            onChange={(e) => {
                              const newWeekly = [...menuFormData.weeklyMenu];
                              newWeekly[index].dinner.veg = e.target.value;
                              setMenuFormData({ ...menuFormData, weeklyMenu: newWeekly });
                            }}
                            className="w-full px-3 py-1.5 border border-green-200 rounded-md focus:ring-2 focus:ring-green-100 outline-none text-xs"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Non-Veg Menu..."
                            value={dayData.dinner.nonVeg}
                            onChange={(e) => {
                              const newWeekly = [...menuFormData.weeklyMenu];
                              newWeekly[index].dinner.nonVeg = e.target.value;
                              setMenuFormData({ ...menuFormData, weeklyMenu: newWeekly });
                            }}
                            className="w-full px-3 py-1.5 border border-red-200 rounded-md focus:ring-2 focus:ring-red-100 outline-none text-xs"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all uppercase tracking-wider"
                disabled={submitting}
              >
                Discard
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 text-sm font-bold text-white bg-[#525b88] rounded-xl hover:bg-[#3a4166] shadow-lg shadow-[#525b88]/20 transition-all flex items-center justify-center min-w-[180px] uppercase tracking-wider"
                disabled={submitting}
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Weekly Menu"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleMarkAttendance} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-tighter">Hostel</label>
                <select
                  required
                  value={attendanceFormData.hostelId}
                  onChange={(e) => setAttendanceFormData({ ...attendanceFormData, hostelId: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all text-sm font-medium"
                >
                  <option value="">-- Select Hostel --</option>
                  {hostels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-tighter">Meal Date</label>
                <input
                  type="date"
                  required
                  value={attendanceFormData.date}
                  onChange={(e) => setAttendanceFormData({ ...attendanceFormData, date: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 uppercase tracking-tighter">Meal Session</label>
                <select
                  required
                  value={attendanceFormData.mealType}
                  onChange={(e) => setAttendanceFormData({ ...attendanceFormData, mealType: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#525b88]/20 focus:border-[#525b88] outline-none transition-all text-sm font-medium"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 py-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by name or registration number..."
                  value={attendanceSearch}
                  onChange={(e) => setAttendanceSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#525b88]/20 outline-none text-sm"
                />
              </div>
              <div className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg uppercase">
                Showing {attendanceList.filter(s => s.name.toLowerCase().includes(attendanceSearch.toLowerCase()) || s.registrationNumber.includes(attendanceSearch)).length} Residents
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 max-h-[400px]">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-[#525b88] uppercase bg-gray-50 font-bold border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 min-w-[50px]">Mark</th>
                    <th className="px-4 py-3 min-w-[200px]">Resident Details</th>
                    <th className="px-4 py-3 text-center">Room/Bed</th>
                    <th className="px-4 py-3 min-w-[100px]">Guests</th>
                    <th className="px-4 py-3 min-w-[200px]">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {fetchingAllocation ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-20 text-center">
                        <Loader2 className="w-8 h-8 mx-auto text-[#525b88] animate-spin mb-2" />
                        <p className="text-gray-500 font-medium">Fetching messy roster...</p>
                      </td>
                    </tr>
                  ) : attendanceList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-20 text-center text-gray-400">
                        {attendanceFormData.hostelId ? "No active residents found in this hostel." : "Please select a hostel to load the roster."}
                      </td>
                    </tr>
                  ) : (
                    attendanceList
                      .filter(s => s.name.toLowerCase().includes(attendanceSearch.toLowerCase()) || s.registrationNumber.includes(attendanceSearch))
                      .map((student, idx) => (
                        <tr key={student.registrationNumber} className={`hover:bg-gray-50/50 transition-colors ${student.attended ? 'bg-green-50/20' : ''}`}>
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={student.attended}
                              onChange={(e) => {
                                const newList = [...attendanceList];
                                // Find actual index in original list to avoid filter mismatch
                                const realIdx = newList.findIndex(s => s.registrationNumber === student.registrationNumber);
                                newList[realIdx].attended = e.target.checked;
                                setAttendanceList(newList);
                              }}
                              className="w-5 h-5 rounded border-gray-300 text-[#525b88] focus:ring-[#525b88]/20"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-bold text-[#2a3563]">{student.name}</div>
                            <div className="text-[10px] font-bold text-gray-400 tracking-wider font-mono">{student.registrationNumber}</div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600">
                              {student.roomNumber || "-"}/{student.bedNumber || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={student.guestMeals || ""}
                              onChange={(e) => {
                                const newList = [...attendanceList];
                                const realIdx = newList.findIndex(s => s.registrationNumber === student.registrationNumber);
                                newList[realIdx].guestMeals = parseInt(e.target.value) || 0;
                                setAttendanceList(newList);
                              }}
                              className="w-full px-2 py-1 border border-gray-200 rounded text-center text-xs outline-none focus:ring-1 focus:ring-[#525b88]/30"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <input
                              type="text"
                              placeholder="Add remarks..."
                              value={student.remarks || ""}
                              onChange={(e) => {
                                const newList = [...attendanceList];
                                const realIdx = newList.findIndex(s => s.registrationNumber === student.registrationNumber);
                                newList[realIdx].remarks = e.target.value;
                                setAttendanceList(newList);
                              }}
                              className="w-full px-2 py-1 border border-gray-200 rounded text-xs outline-none focus:ring-1 focus:ring-[#525b88]/30"
                            />
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all uppercase tracking-wider"
                disabled={submitting}
              >
                Discard
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 text-sm font-bold text-white bg-[#525b88] rounded-xl hover:bg-[#3a4166] shadow-lg shadow-[#525b88]/20 transition-all flex items-center justify-center min-w-[200px] uppercase tracking-wider disabled:opacity-50"
                disabled={submitting || attendanceList.length === 0}
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Bulk Attendance"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Weekly Menu Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={`Weekly Menu Preview: ${previewHostel?.name || ""}`}
        maxWidth="max-w-6xl"
      >
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#525b88] uppercase bg-gray-50 font-bold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 min-w-[120px]">Day</th>
                <th className="px-4 py-3 min-w-[200px]">Breakfast</th>
                <th className="px-4 py-3 min-w-[200px]">Lunch</th>
                <th className="px-4 py-3 min-w-[200px]">Snacks</th>
                <th className="px-4 py-3 min-w-[200px]">Dinner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {DAYS_OF_WEEK.map((day) => {
                const dayData = (previewData || []).find(d => d.dayOfWeek === day);
                return (
                  <tr key={day} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4 font-bold text-[#2a3563] bg-gray-50/30">
                      {day}
                    </td>
                    {["breakfast", "lunch", "snacks", "dinner"].map(meal => (
                      <td key={meal} className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="text-green-600 font-semibold text-xs border-l-2 border-green-200 pl-2">
                            <span className="uppercase text-[10px] block opacity-70">Vegetarian</span>
                            {dayData?.[meal]?.veg || "N/A"}
                          </div>
                          <div className="text-red-600 font-semibold text-xs border-l-2 border-red-200 pl-2">
                            <span className="uppercase text-[10px] block opacity-70">Non-Veg Alternative</span>
                            {dayData?.[meal]?.nonVeg || "N/A"}
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end pt-4">
          <button
            onClick={() => setShowPreviewModal(false)}
            className="px-6 py-2 bg-[#525b88] text-white rounded-lg font-bold uppercase tracking-wider text-sm hover:bg-[#3a4166] transition-all"
          >
            Close Preview
          </button>
        </div>
      </Modal>
    </div >
  );
};

export default MessManagement;

