/**
 * Hostel Master Data Management Component
 * Manages hostel information, blocks, rooms, and beds
 */
import React, { useState, useEffect, useMemo } from "react";
import { Plus, Building2, Users, Bed, Home, ChevronDown, ChevronUp } from "lucide-react";
import { FilterBar, DataTable, Modal, StatusBadge, SummaryCard } from "../shared";
import { API } from "../../../config/urls";
import { getWardenOptions, getWardenName } from "../../../utils/hostel/wardenService";
import { getHostelTypeOptions } from "../../../utils/hostel/hostelTypeService";
import FacilitiesSelector from "../FacilitiesSelector";

const HostelMaster = () => {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    type: "",
    status: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  /**
   * Fetch hostels from API
   */
  const fetchHostels = async () => {
    setLoading(true);
    setError(null);
    try {
      // Map filter params to match API expectations
      const apiParams = {
        ...filters,
        hostelType: filters.type, // Map 'type' to 'hostelType' for API
      };
      delete apiParams.type; // Remove 'type' as API expects 'hostelType'
      
      const response = await API.get("/hostel", {
        params: apiParams,
      });
      console.log("Hostels API Response:", response.data);
      
      // Handle different response structures
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
      
      // Normalize hostelTypeId - extract ID if it's a populated object
      hostelsData = hostelsData.map(hostel => {
        // If hostelTypeId is an object (populated), extract just the _id
        if (hostel.hostelTypeId && typeof hostel.hostelTypeId === 'object' && hostel.hostelTypeId._id) {
          return {
            ...hostel,
            hostelTypeId: hostel.hostelTypeId._id,
            // Keep the populated data in a separate field for display if needed
            hostelType: hostel.hostelTypeId
          };
        }
        return hostel;
      });
      
      // Filter out empty objects (only have _id, createdAt, etc.)
      hostelsData = hostelsData.filter(hostel => {
        return hostel.name || hostel.code || hostel.hostelTypeId;
      });
      
      console.log("Processed Hostels Data:", hostelsData);
      console.log("Number of hostels:", hostelsData.length);
      setHostels(Array.isArray(hostelsData) ? hostelsData : []);
    } catch (err) {
      console.error("Error fetching hostels:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch hostels");
      setHostels([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
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
    let filtered = hostels.filter((hostel) => {
      return (
        (filters.name === "" ||
          hostel.name?.toLowerCase().includes(filters.name.toLowerCase())) &&
        (filters.type === "" || 
          (hostel.hostelTypeId && hostel.hostelTypeId.toString() === filters.type)) &&
        (filters.status === "" || hostel.status === filters.status)
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
  }, [hostels, filters, sortConfig]);

  /**
   * Calculate statistics
   */
  const statistics = useMemo(() => {
    const totalCapacity = hostels.reduce((sum, h) => sum + (h.capacity || 0), 0);
    const totalOccupied = hostels.reduce((sum, h) => sum + (h.occupied || 0), 0);
    const totalAvailable = totalCapacity - totalOccupied;
    const occupancyRate = totalCapacity > 0 ? ((totalOccupied / totalCapacity) * 100).toFixed(1) : 0;

    return {
      totalHostels: hostels.length,
      totalCapacity,
      totalOccupied,
      totalAvailable,
      occupancyRate,
    };
  }, [hostels]);

  /**
   * Table columns configuration
   */
  const columns = [
    {
      key: "code",
      title: "Code",
      cellType: "text",
    },
    {
      key: "name",
      title: "Hostel Name",
      cellType: "text",
    },
    {
      key: "hostelType",
      title: "Type",
      cellType: "custom",
      render: (value, row) => {
        // Handle populated hostelType object (stored separately) or direct value
        if (row.hostelType && typeof row.hostelType === "object" && row.hostelType !== null) {
          return <span className="capitalize">{row.hostelType.name || "-"}</span>;
        }
        // If we have hostelTypeId but no hostelType object, try to find it from options
        if (row.hostelTypeId && hostelTypeOptions.length > 0) {
          const typeOption = hostelTypeOptions.find(opt => opt.value === row.hostelTypeId);
          if (typeOption) {
            return <span className="capitalize">{typeOption.label || "-"}</span>;
          }
        }
        return <span className="capitalize">{value || "-"}</span>;
      },
    },
    {
      key: "capacity",
      title: "Capacity",
      cellType: "number",
    },
    {
      key: "occupied",
      title: "Occupied",
      cellType: "number",
    },
    {
      key: "available",
      title: "Available",
      cellType: "custom",
      render: (value, row) => (row.capacity || 0) - (row.occupied || 0),
    },
    {
      key: "wardenName",
      title: "Warden",
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
      placeholder: "Search hostel name...",
      label: "Hostel Name",
    },
    {
      name: "type",
      type: "select",
      placeholder: "All Types",
      label: "Type",
      options: [
        { value: "girls", label: "Girls" },
        { value: "boys", label: "Boys" },
        { value: "staff", label: "Staff" },
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
        { value: "maintenance", label: "Maintenance" },
      ],
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Hostel Master Data
        </h2>
        <button
          onClick={() => {
            setSelectedHostel(null);
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Hostel
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <SummaryCard
          title="Total Hostels"
          value={statistics.totalHostels}
          icon={Building2}
          color="blue"
        />
        <SummaryCard
          title="Total Capacity"
          value={statistics.totalCapacity}
          icon={Users}
          color="green"
        />
        <SummaryCard
          title="Occupied"
          value={statistics.totalOccupied}
          icon={Bed}
          color="indigo"
        />
        <SummaryCard
          title="Available"
          value={statistics.totalAvailable}
          icon={Home}
          color="yellow"
        />
        <SummaryCard
          title="Occupancy Rate"
          value={`${statistics.occupancyRate}%`}
          icon={Users}
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
          const hostel = hostels.find((h) => h._id === id);
          setSelectedHostel(hostel);
          setIsViewMode(true);
          setShowModal(true);
        }}
        onEdit={(id) => {
          const hostel = hostels.find((h) => h._id === id);
          setSelectedHostel(hostel);
          setIsViewMode(false);
          setShowModal(true);
        }}
        onDelete={async (id) => {
          if (window.confirm("Are you sure you want to delete this hostel?")) {
            try {
              await API.delete(`/hostel/${id}`);
              fetchHostels();
            } catch (err) {
              alert(err.response?.data?.message || "Failed to delete hostel");
            }
          }
        }}
        sortConfig={sortConfig}
        onSort={handleSort}
        emptyState={{
          title: "No hostels found",
          message: "Hostels will appear here once they are added.",
        }}
      />

      {/* Add/Edit/View Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedHostel(null);
          setIsViewMode(false);
        }}
        title={
          isViewMode 
            ? "View Hostel Details" 
            : selectedHostel 
            ? "Edit Hostel" 
            : "Add New Hostel"
        }
        size="lg"
        footer={
          isViewMode ? (
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsViewMode(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166]"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedHostel(null);
                  setIsViewMode(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedHostel(null);
                  setIsViewMode(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="hostel-form"
                className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166]"
              >
                {selectedHostel ? "Update" : "Save"}
              </button>
            </div>
          )
        }
      >
        <HostelForm
          hostel={selectedHostel}
          isViewMode={isViewMode}
          onSave={async (data) => {
            try {
              console.log("Saving hostel data:", data);
              
              // Validate required fields before sending
              if (!data.name || !data.code || !data.hostelTypeId || !data.capacity) {
                alert("Please fill all required fields (Name, Code, Hostel Type, Capacity)");
                return;
              }
              
              // Ensure Content-Type header is set
              const config = {
                headers: {
                  'Content-Type': 'application/json',
                },
              };
              
              let response;
              if (selectedHostel) {
                response = await API.put(`/hostel/${selectedHostel._id}`, data, config);
              } else {
                response = await API.post("/hostel", data, config);
              }
              console.log("Save response:", response.data);
              console.log("Full response:", response);
              
              // Always refetch after save to get updated data with populated fields
              setShowModal(false);
              setSelectedHostel(null);
              setIsViewMode(false);
              
              // Small delay to ensure backend has processed
              setTimeout(() => {
                fetchHostels();
              }, 500);
            } catch (err) {
              console.error("Error saving hostel:", err);
              const errorMessage = err.response?.data?.message || 
                                 err.response?.data?.error || 
                                 err.message || 
                                 "Failed to save hostel";
              alert(errorMessage);
            }
          }}
        />
      </Modal>
    </div>
  );
};

/**
 * Hostel Form Component
 */
const HostelForm = ({ hostel, isViewMode = false, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    hostelTypeId: "",
    capacity: "",
    occupied: "",
    numberOfFloors: "1",
    address: "",
    wardenId: "",
    wardenName: "",
    status: "active",
    facilities: [],
    facilityCounts: {},
  });
  // Store room counts for each floor: { floorNumber: roomCount }
  const [floorRoomCounts, setFloorRoomCounts] = useState({});
  // Store room details for each floor: { floorNumber: [{ roomNumber, roomType, capacity, facilities, facilityCounts, description, status }] }
  const [floorRooms, setFloorRooms] = useState({});
  // Track expanded/collapsed state for floors: { floorNumber: true/false }
  const [expandedFloors, setExpandedFloors] = useState({});
  // Track expanded/collapsed state for rooms: { "floorNumber-roomIndex": true/false }
  const [expandedRooms, setExpandedRooms] = useState({});
  const [wardenOptions, setWardenOptions] = useState([]);
  const [hostelTypeOptions, setHostelTypeOptions] = useState([]);

  useEffect(() => {
    // Fetch warden options
    const loadWardens = async () => {
      try {
        const options = await getWardenOptions();
        setWardenOptions(options);
      } catch (err) {
        console.error("Failed to load wardens:", err);
      }
    };

    // Fetch hostel type options
    const loadHostelTypes = async () => {
      try {
        const options = await getHostelTypeOptions();
        setHostelTypeOptions(options);
      } catch (err) {
        console.error("Failed to load hostel types:", err);
      }
    };

    loadWardens();
    loadHostelTypes();
  }, []);

  // Fetch floors and rooms when editing
  useEffect(() => {
    const fetchFloorsAndRooms = async () => {
      if (hostel && hostel._id) {
        try {
          // Fetch floors for this hostel
          const floorsResponse = await API.get("/hostel/floors", {
            params: { hostelId: hostel._id },
          });
          const floors = floorsResponse.data?.data || floorsResponse.data || [];
          
          // Fetch all rooms for this hostel
          const roomsResponse = await API.get("/hostel/rooms", {
            params: { hostelId: hostel._id },
          });
          const rooms = roomsResponse.data?.data || roomsResponse.data || [];
          
          // Organize rooms by floor number
          const roomsByFloor = {};
          const roomCountsByFloor = {};
          
          floors.forEach((floor) => {
            const floorNumber = floor.floorNumber || 0;
            const floorRoomsForThisFloor = rooms.filter((room) => {
              const roomFloorId = typeof room.floorId === 'object' ? room.floorId._id : room.floorId;
              return roomFloorId === floor._id;
            });
            
            roomCountsByFloor[floorNumber] = floorRoomsForThisFloor.length;
            roomsByFloor[floorNumber] = floorRoomsForThisFloor.map((room) => ({
              roomNumber: room.roomNumber || "",
              roomType: room.roomType || "Double",
              capacity: room.capacity || 2,
              facilities: Array.isArray(room.facilities) ? room.facilities : [],
              facilityCounts: room.facilityCounts || {},
              description: room.description || "",
              status: room.status || "available",
            }));
          });
          
          setFloorRoomCounts(roomCountsByFloor);
          setFloorRooms(roomsByFloor);
        } catch (error) {
          console.error("Error fetching floors and rooms:", error);
          setFloorRoomCounts({});
          setFloorRooms({});
        }
      }
    };
    
    fetchFloorsAndRooms();
  }, [hostel?._id]);

  useEffect(() => {
    if (hostel) {
      // Map hostelTypeId from populated hostelType or direct hostelTypeId
      const { contact, type, hostelType, ...rest } = hostel;
      
      // Extract ID from hostelTypeId if it's an object (populated)
      let hostelTypeIdValue = "";
      if (hostel.hostelTypeId) {
        if (typeof hostel.hostelTypeId === 'object' && hostel.hostelTypeId._id) {
          hostelTypeIdValue = hostel.hostelTypeId._id;
        } else if (typeof hostel.hostelTypeId === 'string') {
          hostelTypeIdValue = hostel.hostelTypeId;
        }
      } else if (hostelType?._id) {
        hostelTypeIdValue = hostelType._id;
      }
      
      // Handle facilityCounts - convert Map to object if needed
      let facilityCountsObj = {};
      if (hostel.facilityCounts) {
        if (hostel.facilityCounts instanceof Map) {
          // Convert Map to object
          facilityCountsObj = Object.fromEntries(hostel.facilityCounts);
        } else if (typeof hostel.facilityCounts === 'object') {
          facilityCountsObj = hostel.facilityCounts;
        }
      }
      
      // Ensure facilities is an array
      const facilitiesArray = Array.isArray(hostel.facilities) ? hostel.facilities : [];
      
      const formattedHostel = {
        ...rest,
        hostelTypeId: hostelTypeIdValue,
        facilities: facilitiesArray,
        facilityCounts: facilityCountsObj,
        // Ensure all fields have default values
        name: rest.name || "",
        code: rest.code || "",
        capacity: rest.capacity || "",
        occupied: rest.occupied || "",
        numberOfFloors: rest.numberOfFloors || "1",
        address: rest.address || "",
        wardenId: rest.wardenId || "",
        wardenName: rest.wardenName || "",
        status: rest.status || "active",
      };
      setFormData(formattedHostel);
    } else {
      // Reset form when no hostel is selected
      setFormData({
        name: "",
        code: "",
        hostelTypeId: "",
        capacity: "",
        occupied: "",
        numberOfFloors: "1",
        address: "",
        wardenId: "",
        wardenName: "",
        status: "active",
        facilities: [],
        facilityCounts: {},
      });
      setFloorRoomCounts({});
      setFloorRooms({});
      setExpandedFloors({});
      setExpandedRooms({});
    }
  }, [hostel]);
  
  // Update floor room counts when numberOfFloors changes
  useEffect(() => {
    const numFloors = Number(formData.numberOfFloors) || 1;
    const currentCounts = { ...floorRoomCounts };
    const currentRooms = { ...floorRooms };
    
    // Initialize room counts for all floors (0 to numFloors-1)
    for (let i = 0; i < numFloors; i++) {
      if (currentCounts[i] === undefined) {
        currentCounts[i] = 0;
      }
      if (currentRooms[i] === undefined) {
        currentRooms[i] = [];
      }
    }
    
    // Remove counts for floors beyond the current number
    Object.keys(currentCounts).forEach(floorNum => {
      if (Number(floorNum) >= numFloors) {
        delete currentCounts[floorNum];
        delete currentRooms[floorNum];
      }
    });
    
    setFloorRoomCounts(currentCounts);
    setFloorRooms(currentRooms);
  }, [formData.numberOfFloors]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        facilities: checked
          ? [...prev.facilities, value]
          : prev.facilities.filter((f) => f !== value),
      }));
    } else if (name === "wardenId") {
      const selectedWarden = wardenOptions.find((w) => w.value === value);
      setFormData((prev) => ({
        ...prev,
        wardenId: value,
        wardenName: selectedWarden?.warden?.name || "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const handleFloorRoomCountChange = (floorNumber, count) => {
    const newCount = Number(count) || 0;
    setFloorRoomCounts(prev => ({
      ...prev,
      [floorNumber]: newCount,
    }));
    
    // When room count changes, initialize or adjust room entries
    const currentRooms = floorRooms[floorNumber] || [];
    const currentCount = currentRooms.length;
    
    if (newCount > currentCount) {
      // Need to add room entries for new rooms
      const roomsToAdd = newCount - currentCount;
      const newRooms = Array.from({ length: roomsToAdd }, () => ({
        roomNumber: "",
        roomType: "Double",
        capacity: 2,
        facilities: [],
        facilityCounts: {},
        description: "",
        status: "available",
      }));
      
      setFloorRooms(prev => ({
        ...prev,
        [floorNumber]: [...currentRooms, ...newRooms],
      }));
    } else if (newCount < currentCount) {
      // Remove excess room entries
      setFloorRooms(prev => ({
        ...prev,
        [floorNumber]: currentRooms.slice(0, newCount),
      }));
    }
  };
  
  // Handle room entry field changes
  const handleRoomEntryChange = (floorNumber, index, field, value) => {
    setFloorRooms(prev => {
      const updated = { ...prev };
      if (!updated[floorNumber]) updated[floorNumber] = [];
      updated[floorNumber][index] = {
        ...updated[floorNumber][index],
        [field]: value,
      };
      return updated;
    });
  };
  
  // Handle facility checkbox for room entries
  const handleRoomFacilityChange = (floorNumber, index, facility, checked) => {
    setFloorRooms(prev => {
      const updated = { ...prev };
      if (!updated[floorNumber]) updated[floorNumber] = [];
      const currentFacilities = updated[floorNumber][index]?.facilities || [];
      updated[floorNumber][index] = {
        ...updated[floorNumber][index],
        facilities: checked
          ? [...currentFacilities, facility]
          : currentFacilities.filter((f) => f !== facility),
      };
      return updated;
    });
  };
  
  // Handle facility counts for room entries
  const handleRoomFacilityCountChange = (floorNumber, index, field, value) => {
    setFloorRooms(prev => {
      const updated = { ...prev };
      if (!updated[floorNumber]) updated[floorNumber] = [];
      updated[floorNumber][index] = {
        ...updated[floorNumber][index],
        facilityCounts: {
          ...(updated[floorNumber][index]?.facilityCounts || {}),
          [field]: Number(value) || 0
        }
      };
      return updated;
    });
  };
  
  // Toggle floor expansion
  const toggleFloorExpansion = (floorNumber) => {
    setExpandedFloors(prev => ({
      ...prev,
      [floorNumber]: !prev[floorNumber]
    }));
  };
  
  // Toggle room expansion
  const toggleRoomExpansion = (floorNumber, roomIndex) => {
    const key = `${floorNumber}-${roomIndex}`;
    setExpandedRooms(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Don't submit if in view mode
    if (isViewMode) {
      return;
    }
    
    // Prepare data for API - ensure proper types and ALL fields
    const submitData = {
      name: (formData.name || "").trim(),
      code: (formData.code || "").trim(),
      hostelTypeId: formData.hostelTypeId || "",
      capacity: formData.capacity ? Number(formData.capacity) : 0,
      occupied: formData.occupied ? Number(formData.occupied) : 0,
      numberOfFloors: formData.numberOfFloors ? Number(formData.numberOfFloors) : 1,
      address: (formData.address || "").trim(),
      status: formData.status || "active",
      facilities: Array.isArray(formData.facilities) ? formData.facilities : [],
      facilityCounts: formData.facilityCounts || {},
    };
    
    // Add wardenId only if it exists
    if (formData.wardenId && formData.wardenId !== "") {
      submitData.wardenId = formData.wardenId;
    }
    
    // Add floor room counts and room details if provided (for both new and existing hostels)
    if (Object.keys(floorRoomCounts).length > 0) {
      // Convert floor room counts to array format: [{ floorNumber: 0, roomCount: 10 }, ...]
      submitData.floorRoomCounts = Object.keys(floorRoomCounts).map(floorNum => ({
        floorNumber: Number(floorNum),
        roomCount: Number(floorRoomCounts[floorNum]) || 0,
      }));
      
      // Collect all room data from all floors
      const allRooms = [];
      for (const floorNumber in floorRooms) {
        const roomsForFloor = floorRooms[floorNumber] || [];
        for (const roomEntry of roomsForFloor) {
          if (roomEntry.roomNumber && roomEntry.capacity) {
            allRooms.push({
              floorNumber: Number(floorNumber),
              roomNumber: roomEntry.roomNumber.trim(),
              roomType: roomEntry.roomType || "Double",
              capacity: Number(roomEntry.capacity),
              facilities: Array.isArray(roomEntry.facilities) ? roomEntry.facilities : [],
              facilityCounts: roomEntry.facilityCounts || {},
              description: (roomEntry.description || "").trim(),
              status: roomEntry.status || "available",
            });
          }
        }
      }
      
      if (allRooms.length > 0) {
        submitData.bulkRooms = allRooms;
      }
    }
    
    // For edit mode, include hostelId so backend knows which hostel to update
    if (hostel && hostel._id) {
      submitData.hostelId = hostel._id;
    }
    
    // Validate required fields
    if (!submitData.name || !submitData.code || !submitData.hostelTypeId || !submitData.capacity) {
      alert("Please fill all required fields: Name, Code, Hostel Type, and Capacity");
      return;
    }
    
    // Ensure hostelTypeId is not null or empty string
    if (!submitData.hostelTypeId) {
      alert("Please select a Hostel Type");
      return;
    }
    
    // Validate room details if provided
    if (submitData.bulkRooms && submitData.bulkRooms.length > 0) {
      for (const room of submitData.bulkRooms) {
        if (!room.roomNumber || !room.capacity) {
          const floorName = room.floorNumber === 0 ? "Ground Floor" : room.floorNumber === 1 ? "First Floor" : `Floor ${room.floorNumber}`;
          alert(`Please fill room number and capacity for all rooms on ${floorName}`);
          return;
        }
      }
    }
    
    console.log("=== FRONTEND: Submitting hostel data ===");
    console.log(JSON.stringify(submitData, null, 2));
    console.log("Data keys:", Object.keys(submitData));
    // Ensure hostelTypeId is a string, not an object
    if (submitData.hostelTypeId && typeof submitData.hostelTypeId === 'object') {
      submitData.hostelTypeId = submitData.hostelTypeId._id || submitData.hostelTypeId.toString();
    }
    
    console.log("hostelTypeId value:", submitData.hostelTypeId);
    console.log("hostelTypeId type:", typeof submitData.hostelTypeId);
    
    onSave(submitData);
  };


  return (
    <form id="hostel-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hostel Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isViewMode}
            readOnly={isViewMode}
            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm ${
              isViewMode 
                ? "bg-gray-100 cursor-not-allowed" 
                : "focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            }`}
            required={!isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hostel Code *
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            disabled={isViewMode}
            readOnly={isViewMode}
            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm ${
              isViewMode 
                ? "bg-gray-100 cursor-not-allowed" 
                : "focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            }`}
            required={!isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hostel Type *
          </label>
          <select
            name="hostelTypeId"
            value={formData.hostelTypeId}
            onChange={handleChange}
            disabled={isViewMode}
            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm ${
              isViewMode 
                ? "bg-gray-100 cursor-not-allowed" 
                : "focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            }`}
            required={!isViewMode}
          >
            <option value="">Select Hostel Type</option>
            {hostelTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Capacity *
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            disabled={isViewMode}
            readOnly={isViewMode}
            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm ${
              isViewMode 
                ? "bg-gray-100 cursor-not-allowed" 
                : "focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            }`}
            min="1"
            required={!isViewMode}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Occupied
          </label>
          <input
            type="number"
            name="occupied"
            value={formData.occupied}
            onChange={handleChange}
            disabled={isViewMode}
            readOnly={isViewMode}
            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm ${
              isViewMode 
                ? "bg-gray-100 cursor-not-allowed" 
                : "focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            }`}
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Floors *
          </label>
          <input
            type="number"
            name="numberOfFloors"
            value={formData.numberOfFloors}
            onChange={handleChange}
            disabled={isViewMode}
            readOnly={isViewMode}
            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm ${
              isViewMode 
                ? "bg-gray-100 cursor-not-allowed" 
                : "focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            }`}
            min="1"
            max="50"
            required={!isViewMode}
          />
          <p className="mt-1 text-xs text-gray-500">
            Floors will be automatically created (Ground Floor, First Floor, etc.)
          </p>
        </div>
      </div>

      {/* Show room count inputs for each floor (for add, edit, and view) */}
      {Number(formData.numberOfFloors) > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5 mt-4">
          <h4 className="text-base font-semibold text-gray-900 mb-1">
            {isViewMode ? "Rooms for Each Floor" : "Enter Number of Rooms for Each Floor"}
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            This hostel has <strong>{formData.numberOfFloors}</strong> floor(s). {isViewMode ? "Room counts for each floor:" : "Enter how many rooms you want on each floor."}
          </p>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {Array.from({ length: Number(formData.numberOfFloors) }, (_, index) => {
              const floorNumber = index;
              const floorName = floorNumber === 0 ? "Ground Floor" : floorNumber === 1 ? "First Floor" : `Floor ${floorNumber}`;
              return (
                <div key={floorNumber} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-300 shadow-sm">
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900 text-base">
                      {floorName}
                    </span>
                    <span className="text-sm text-gray-500 ml-3">
                      (Floor #{floorNumber})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Total Rooms:</label>
                    <input
                      type="number"
                      min="0"
                      value={floorRoomCounts[floorNumber] !== undefined ? floorRoomCounts[floorNumber] : 0}
                      onChange={(e) => handleFloorRoomCountChange(floorNumber, e.target.value)}
                      disabled={isViewMode}
                      readOnly={isViewMode}
                      className={`w-24 rounded-md border-2 border-gray-300 px-3 py-2 text-sm font-medium ${
                        isViewMode 
                          ? "bg-gray-100 cursor-not-allowed" 
                          : "focus:border-[#525b88] focus:ring-2 focus:ring-[#525b88]"
                      }`}
                      placeholder="0"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Enter the total number of rooms for each floor. After entering the number, you'll see room detail forms below to fill in details for each room.
            </p>
          </div>
        </div>
      )}

      {/* Show room detail forms for each floor when room count is entered (for add, edit, and view) */}
      {Number(formData.numberOfFloors) > 0 && Object.keys(floorRoomCounts).length > 0 && (
        <div className="space-y-6 mt-6 max-h-[600px] overflow-y-auto">
          {Array.from({ length: Number(formData.numberOfFloors) }, (_, index) => {
            const floorNumber = index;
            const floorName = floorNumber === 0 ? "Ground Floor" : floorNumber === 1 ? "First Floor" : `Floor ${floorNumber}`;
            const roomCount = floorRoomCounts[floorNumber] || 0;
            const roomsForFloor = floorRooms[floorNumber] || [];
            
            if (roomCount <= 0) return null;
            
            const isFloorExpanded = expandedFloors[floorNumber] !== false; // Default to expanded
            
            return (
              <div key={floorNumber} className="bg-gray-50 border-2 border-gray-300 rounded-lg p-5">
                <div 
                  className="mb-4 cursor-pointer flex items-center justify-between"
                  onClick={() => toggleFloorExpansion(floorNumber)}
                >
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {floorName}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Enter details for <strong>{roomCount}</strong> room(s)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFloorExpansion(floorNumber);
                    }}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {isFloorExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
                
                {isFloorExpanded && (
                  <div className="space-y-4">
                    {roomsForFloor.map((room, roomIndex) => {
                      const roomKey = `${floorNumber}-${roomIndex}`;
                      const isRoomExpanded = expandedRooms[roomKey] !== false; // Default to expanded
                      
                      return (
                        <div key={roomIndex} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div 
                            className="flex items-center justify-between mb-3 cursor-pointer"
                            onClick={() => toggleRoomExpansion(floorNumber, roomIndex)}
                          >
                            <h5 className="text-sm font-semibold text-gray-800">
                              Room {roomIndex + 1} {room.roomNumber && `- ${room.roomNumber}`}
                            </h5>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRoomExpansion(floorNumber, roomIndex);
                              }}
                              className="text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              {isRoomExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          
                          {isRoomExpanded && (
                            <>
                              <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Room Number *
                          </label>
                          <input
                            type="text"
                            value={room.roomNumber || ""}
                            onChange={(e) => handleRoomEntryChange(floorNumber, roomIndex, "roomNumber", e.target.value)}
                            disabled={isViewMode}
                            readOnly={isViewMode}
                            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm ${
                              isViewMode 
                                ? "bg-gray-100 cursor-not-allowed" 
                                : "focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                            }`}
                            placeholder="e.g., 101, A-01"
                            required={!isViewMode}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Room Type *
                          </label>
                          <select
                            value={room.roomType || "Double"}
                            onChange={(e) => handleRoomEntryChange(floorNumber, roomIndex, "roomType", e.target.value)}
                            disabled={isViewMode}
                            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm ${
                              isViewMode 
                                ? "bg-gray-100 cursor-not-allowed" 
                                : "focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                            }`}
                            required={!isViewMode}
                          >
                            <option value="Single">Single</option>
                            <option value="Double">Double</option>
                            <option value="Triple">Triple</option>
                            <option value="Quad">Quad</option>
                            <option value="Dormitory">Dormitory</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Capacity *
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={room.capacity || 2}
                            onChange={(e) => handleRoomEntryChange(floorNumber, roomIndex, "capacity", e.target.value)}
                            disabled={isViewMode}
                            readOnly={isViewMode}
                            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm ${
                              isViewMode 
                                ? "bg-gray-100 cursor-not-allowed" 
                                : "focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                            }`}
                            required={!isViewMode}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status *
                          </label>
                          <select
                            value={room.status || "available"}
                            onChange={(e) => handleRoomEntryChange(floorNumber, roomIndex, "status", e.target.value)}
                            disabled={isViewMode}
                            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm ${
                              isViewMode 
                                ? "bg-gray-100 cursor-not-allowed" 
                                : "focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                            }`}
                            required={!isViewMode}
                          >
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="reserved">Reserved</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Facilities Component */}
                      <div className="mt-4">
                        <FacilitiesSelector
                          selectedFacilities={room.facilities || []}
                          facilityCounts={room.facilityCounts || {}}
                          onFacilitiesChange={(facilities) => {
                            if (!isViewMode) {
                              // Update room facilities
                              setFloorRooms(prev => {
                                const updated = { ...prev };
                                if (!updated[floorNumber]) updated[floorNumber] = [];
                                updated[floorNumber][roomIndex] = {
                                  ...updated[floorNumber][roomIndex],
                                  facilities: facilities,
                                };
                                return updated;
                              });
                            }
                          }}
                          onFacilityCountsChange={(facilityId, value) => {
                            if (!isViewMode) {
                              handleRoomFacilityCountChange(floorNumber, roomIndex, facilityId, value);
                            }
                          }}
                          category="room"
                          showCounts={true}
                          disabled={isViewMode}
                        />
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={room.description || ""}
                          onChange={(e) => handleRoomEntryChange(floorNumber, roomIndex, "description", e.target.value)}
                          disabled={isViewMode}
                          readOnly={isViewMode}
                          rows={2}
                          className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm ${
                            isViewMode 
                              ? "bg-gray-100 cursor-not-allowed" 
                              : "focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                          }`}
                          placeholder="Optional room description"
                        />
                      </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={isViewMode}
            readOnly={isViewMode}
            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm ${
              isViewMode 
                ? "bg-gray-100 cursor-not-allowed" 
                : "focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Warden *
          </label>
          <select
            name="wardenId"
            value={formData.wardenId}
            onChange={handleChange}
            disabled={isViewMode}
            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm ${
              isViewMode 
                ? "bg-gray-100 cursor-not-allowed" 
                : "focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            }`}
            required={!isViewMode}
          >
            <option value="">Select Warden</option>
            {wardenOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
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
            disabled={isViewMode}
            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm ${
              isViewMode 
                ? "bg-gray-100 cursor-not-allowed" 
                : "focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            }`}
            required={!isViewMode}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Facilities
        </label>
        <FacilitiesSelector
          selectedFacilities={formData.facilities || []}
          facilityCounts={formData.facilityCounts || {}}
          onFacilitiesChange={(facilities) => {
            if (!isViewMode) {
              setFormData(prev => ({ ...prev, facilities }));
            }
          }}
          onFacilityCountsChange={(facilityId, value) => {
            if (!isViewMode) {
              setFormData(prev => ({
                ...prev,
                facilityCounts: {
                  ...(prev.facilityCounts || {}),
                  [facilityId]: Number(value) || 0
                }
              }));
            }
          }}
          category="hostel"
          showCounts={true}
          disabled={isViewMode}
        />
      </div>
    </form>
  );
};

export default HostelMaster;

