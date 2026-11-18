/**
 * Floors, Rooms, Beds, and Equipment Management Component
 * Simplified structure: Hostel -> Floors -> Rooms -> Equipment
 */
import React, { useState, useEffect, useMemo } from "react";
import { Plus, Building2, Home, Package } from "lucide-react";
import { DataTable, Modal, StatusBadge, SummaryCard } from "../shared";
import { API } from "../../../config/urls";

/**
 * Room View Component - Shows read-only room details
 */
const RoomView = ({ room, hostels, floors }) => {
  if (!room) return null;

  const hostel = hostels.find(h => h._id === (typeof room.hostelId === 'object' ? room.hostelId._id : room.hostelId));
  const floor = floors.find(f => f._id === (typeof room.floorId === 'object' ? room.floorId._id : room.floorId));
  const facilityCounts = room.facilityCounts || {};

  const InfoRow = ({ label, value }) => (
    <div className="py-3 border-b border-gray-100">
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div className="mt-1 text-base text-gray-900">{value || "-"}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <InfoRow label="Hostel" value={hostel ? `${hostel.name} (${hostel.code})` : "-"} />
          <InfoRow label="Floor" value={floor ? (floor.name || `Floor ${floor.floorNumber}`) : "-"} />
          <InfoRow label="Room Number" value={room.roomNumber} />
          <InfoRow label="Room Type" value={room.roomType} />
          <InfoRow label="Capacity" value={room.capacity} />
          <InfoRow label="Occupied" value={room.occupied || 0} />
          <InfoRow label="Available" value={room.available || 0} />
          <InfoRow label="Status" value={<StatusBadge status={room.status} />} />
        </div>
        <div>
          <div className="py-3 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-500 mb-2">Facilities</div>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(room.facilities) && room.facilities.length > 0 ? (
                room.facilities.map((facility, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-md">
                    {facility}
                  </span>
                ))
              ) : (
                <span className="text-gray-400">No facilities selected</span>
              )}
            </div>
          </div>
          
          <div className="py-3 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-500 mb-3">Facilities Count</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛏️</span>
                <span className={`text-sm ${(facilityCounts.beds || 0) > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                  Beds: <strong>{facilityCounts.beds || 0}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🌀</span>
                <span className={`text-sm ${(facilityCounts.fans || 0) > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                  Fans: <strong>{facilityCounts.fans || 0}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📚</span>
                <span className={`text-sm ${(facilityCounts.studyTables || 0) > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                  Study Tables: <strong>{facilityCounts.studyTables || 0}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">💺</span>
                <span className={`text-sm ${(facilityCounts.chairs || 0) > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                  Chairs: <strong>{facilityCounts.chairs || 0}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">👔</span>
                <span className={`text-sm ${(facilityCounts.wardrobes || 0) > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                  Wardrobes: <strong>{facilityCounts.wardrobes || 0}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                <span className={`text-sm ${(facilityCounts.ledLights || 0) > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                  LED Lights: <strong>{facilityCounts.ledLights || 0}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🔌</span>
                <span className={`text-sm ${(facilityCounts.powerSockets || 0) > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                  Power Sockets: <strong>{facilityCounts.powerSockets || 0}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🪟</span>
                <span className={`text-sm ${(facilityCounts.windows || 0) > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                  Windows: <strong>{facilityCounts.windows || 0}</strong>
                </span>
              </div>
            </div>
          </div>
          
          {room.description && (
            <div className="py-3">
              <div className="text-sm font-medium text-gray-500 mb-2">Description</div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{room.description}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Floor View Component - Shows read-only floor details
 */
const FloorView = ({ floor, hostels }) => {
  if (!floor) return null;

  const hostel = hostels.find(h => h._id === (typeof floor.hostelId === 'object' ? floor.hostelId._id : floor.hostelId));

  const InfoRow = ({ label, value }) => (
    <div className="py-3 border-b border-gray-100">
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div className="mt-1 text-base text-gray-900">{value || "-"}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <InfoRow label="Hostel" value={hostel ? `${hostel.name} (${hostel.code})` : "-"} />
      <InfoRow label="Floor Number" value={floor.floorNumber === 0 ? "Ground Floor" : floor.floorNumber === 1 ? "First Floor" : `Floor ${floor.floorNumber}`} />
      <InfoRow label="Floor Name" value={floor.name || "-"} />
      <InfoRow label="Total Rooms" value={floor.totalRooms || 0} />
      <InfoRow label="Status" value={<StatusBadge status={floor.status} />} />
      {Array.isArray(floor.facilities) && floor.facilities.length > 0 && (
        <div className="py-3 border-b border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-2">Facilities</div>
          <div className="flex flex-wrap gap-2">
            {floor.facilities.map((facility, idx) => (
              <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-md">
                {facility}
              </span>
            ))}
          </div>
        </div>
      )}
      {floor.description && (
        <div className="py-3">
          <div className="text-sm font-medium text-gray-500 mb-2">Description</div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">{floor.description}</div>
        </div>
      )}
    </div>
  );
};

/**
 * Equipment View Component - Shows read-only equipment details
 */
const EquipmentView = ({ equipment, hostels, floors, rooms }) => {
  if (!equipment) return null;

  const hostel = hostels.find(h => h._id === (typeof equipment.hostelId === 'object' ? equipment.hostelId._id : equipment.hostelId));
  const floor = floors.find(f => f._id === (typeof equipment.floorId === 'object' ? equipment.floorId._id : equipment.floorId));
  const room = rooms.find(r => r._id === (typeof equipment.roomId === 'object' ? equipment.roomId._id : equipment.roomId));

  const InfoRow = ({ label, value }) => (
    <div className="py-3 border-b border-gray-100">
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div className="mt-1 text-base text-gray-900">{value || "-"}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <InfoRow label="Hostel" value={hostel ? `${hostel.name} (${hostel.code})` : "-"} />
          <InfoRow label="Floor" value={floor ? (floor.name || `Floor ${floor.floorNumber}`) : "-"} />
          <InfoRow label="Room" value={room ? room.roomNumber : "-"} />
          <InfoRow label="Item Name" value={equipment.itemName} />
          <InfoRow label="Category" value={equipment.category} />
        </div>
        <div>
          <InfoRow label="Quantity" value={equipment.quantity} />
          <InfoRow label="Condition" value={equipment.condition} />
          <InfoRow label="Status" value={<StatusBadge status={equipment.status} />} />
          {equipment.description && (
            <div className="py-3 border-b border-gray-100">
              <div className="text-sm font-medium text-gray-500 mb-2">Description</div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{equipment.description}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BlocksRoomsBeds = () => {
  const [activeTab, setActiveTab] = useState("floors");
  const [hostels, setHostels] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState(false); // true for view, false for edit/add

  /**
   * Fetch all hostels
   */
  const fetchHostels = async () => {
    try {
      const response = await API.get("/hostel");
      let hostelsData = [];
      if (response.data?.success && response.data?.data) {
        hostelsData = response.data.data;
      } else if (Array.isArray(response.data?.data)) {
        hostelsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        hostelsData = response.data;
      }
      setHostels(hostelsData);
    } catch (err) {
      console.error("Error fetching hostels:", err);
    }
  };

  /**
   * Fetch floors for selected hostel with room counts
   */
  const fetchFloors = async () => {
    if (!selectedHostel) {
      setFloors([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await API.get("/hostel/floors", {
        params: { hostelId: selectedHostel },
      });
      let floorsData = response.data?.success ? response.data.data : response.data || [];
      floorsData = Array.isArray(floorsData) ? floorsData : [];

      // Fetch room counts for each floor
      const floorsWithCounts = await Promise.all(
        floorsData.map(async (floor) => {
          try {
            const roomsResponse = await API.get("/hostel/rooms", {
              params: { floorId: floor._id },
            });
            const roomsData = roomsResponse.data?.success 
              ? roomsResponse.data.data 
              : roomsResponse.data || [];
            return {
              ...floor,
              roomCount: Array.isArray(roomsData) ? roomsData.length : 0,
            };
    } catch (err) {
            return { ...floor, roomCount: 0 };
          }
        })
      );

      setFloors(floorsWithCounts);
    } catch (err) {
      console.error("Error fetching floors:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch rooms for selected floor or all rooms for hostel
   */
  const fetchRooms = async () => {
    // If no floor selected but hostel is selected, fetch all rooms for the hostel
    if (!selectedFloor && !selectedHostel) {
      setRooms([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedFloor) {
        params.floorId = selectedFloor;
      }
      if (selectedHostel) {
        params.hostelId = selectedHostel;
      }
      
      const response = await API.get("/hostel/rooms", { params });
      const roomsData = response.data?.success ? response.data.data : response.data || [];
      setRooms(Array.isArray(roomsData) ? roomsData : []);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch equipment for selected room
   */
  const fetchEquipment = async () => {
    if (!selectedRoom) {
      setEquipment([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = { roomId: selectedRoom };
      if (selectedHostel) params.hostelId = selectedHostel;
      if (selectedFloor) params.floorId = selectedFloor;
      
      const response = await API.get("/hostel/equipment", { params });
      const equipmentData = response.data?.success ? response.data.data : response.data || [];
      setEquipment(Array.isArray(equipmentData) ? equipmentData : []);
    } catch (err) {
      console.error("Error fetching equipment:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    if (selectedHostel) {
      // Always fetch floors when hostel is selected
      fetchFloors();
      setSelectedFloor("");
      setSelectedRoom("");
      // If on floors tab, ensure it's displayed
      if (activeTab !== "floors") {
        setActiveTab("floors");
      }
    } else {
      setFloors([]);
      setSelectedFloor("");
      setSelectedRoom("");
    }
  }, [selectedHostel]);

  useEffect(() => {
    if (activeTab === "rooms" && (selectedFloor || selectedHostel)) {
      fetchRooms();
    } else if (activeTab === "equipment" && selectedRoom) {
      fetchEquipment();
    }
  }, [activeTab, selectedFloor, selectedRoom, selectedHostel]);

  /**
   * Handle save
   */
  const handleSave = async (formData) => {
    try {
      setLoading(true);
      let response;
      
      if (selectedItem) {
        // Update
        if (activeTab === "floors") {
          // Check if we need to create rooms for this floor
          if (formData.createRooms && formData.createRooms.length > 0) {
            // Create rooms for a single floor (when editing)
            try {
              const createPromises = formData.createRooms.map(roomData => 
                API.post("/hostel/rooms", roomData)
              );
              await Promise.all(createPromises);
              // Also update the floor
              response = await API.put(`/hostel/floors/${selectedItem._id}`, formData);
            } catch (err) {
              throw err;
            }
          } else {
            response = await API.put(`/hostel/floors/${selectedItem._id}`, formData);
          }
        } else if (activeTab === "rooms") {
          response = await API.put(`/hostel/rooms/${selectedItem._id}`, formData);
        } else if (activeTab === "equipment") {
          response = await API.put(`/hostel/equipment/${selectedItem._id}`, formData);
        }
      } else {
        // Create
        if (activeTab === "floors" || activeTab === "floors-rooms") {
          // Check if we need to create rooms for floors
          if (formData.floorRoomCounts && formData.hostelId) {
            // If we have bulkRooms with room details, create rooms with details
            if (formData.bulkRooms && Array.isArray(formData.bulkRooms) && formData.bulkRooms.length > 0) {
              // First create/update floors with room counts
              // Then create rooms with details
              try {
                // Create rooms with details
                const roomsResponse = await API.post("/hostel/rooms/bulk", {
                  rooms: formData.bulkRooms,
                });
                
                // Also update floor room counts if needed
                response = await API.post("/hostel/floors/create-rooms", {
                  hostelId: formData.hostelId,
                  floorRoomCounts: formData.floorRoomCounts,
                });
                
                // Merge responses
                response = {
                  data: {
                    success: true,
                    message: `Successfully created ${formData.bulkRooms.length} room(s) with details`,
                    data: {
                      roomsCreated: roomsResponse.data?.data?.created || formData.bulkRooms,
                      totalRoomsCreated: formData.bulkRooms.length,
                    }
                  }
                };
              } catch (err) {
                throw err;
              }
            } else {
              // Use the new endpoint to create rooms for floors with default settings
              response = await API.post("/hostel/floors/create-rooms", {
                hostelId: formData.hostelId,
                floorRoomCounts: formData.floorRoomCounts,
              });
            }
          } else {
            // Regular floor creation
            response = await API.post("/hostel/floors", formData);
          }
        } else if (activeTab === "rooms") {
          // Check if this is bulk room creation
          if (formData.bulkRooms && Array.isArray(formData.bulkRooms)) {
            response = await API.post("/hostel/rooms/bulk", {
              rooms: formData.bulkRooms,
            });
          } else {
            // Single room creation
            response = await API.post("/hostel/rooms", formData);
          }
        } else if (activeTab === "equipment") {
          response = await API.post("/hostel/equipment", formData);
        }
      }
      
      if (response?.data?.success) {
        setShowModal(false);
        setSelectedItem(null);
        setViewMode(false);
        
        // Show success message if rooms were created
        if ((activeTab === "floors" || activeTab === "floors-rooms") && formData.floorRoomCounts && response.data.data) {
          const totalRooms = response.data.data.totalRoomsCreated || 0;
          if (totalRooms > 0) {
            if (formData.bulkRooms && formData.bulkRooms.length > 0) {
              alert(`Success! Created ${totalRooms} room(s) with details across ${response.data.data.roomsCreated?.length || 0} floor(s).`);
            } else {
              alert(`Success! Created ${totalRooms} room(s) across ${response.data.data.roomsCreated?.length || 0} floor(s).`);
            }
          }
        } else if (activeTab === "rooms" && formData.bulkRooms && response.data.data) {
          const createdCount = response.data.count || response.data.data?.created?.length || 0;
          const errorCount = response.data.data?.errors?.length || 0;
          if (createdCount > 0) {
            if (errorCount > 0) {
              alert(`Success! Created ${createdCount} room(s). ${errorCount} room(s) failed.`);
            } else {
              alert(`Success! Created ${createdCount} room(s).`);
            }
          }
        }
        
        // Refresh data - always refresh floors to show updated room counts
        if (activeTab === "floors") {
          // Refresh floors to show updated room counts in the table
          await fetchFloors();
        } else if (activeTab === "rooms") {
          // If bulk rooms were created, refresh rooms for all floors of the hostel
          if (formData.bulkRooms && selectedHostel) {
            // Refresh floors first to get updated counts
            await fetchFloors();
            // If a floor is selected, refresh rooms for that floor
            if (selectedFloor) {
              await fetchRooms();
            } else {
              // If no floor selected, fetch all rooms for the hostel
              try {
                const params = { hostelId: selectedHostel };
                const roomsResponse = await API.get("/hostel/rooms", { params });
                const roomsData = roomsResponse.data?.success ? roomsResponse.data.data : roomsResponse.data || [];
                setRooms(Array.isArray(roomsData) ? roomsData : []);
              } catch (err) {
                console.error("Error fetching all rooms:", err);
              }
            }
          } else {
            // Regular single room creation/update
            await fetchRooms();
          }
          // Also refresh floors to update room counts
          if (selectedHostel) await fetchFloors();
        } else if (activeTab === "equipment") {
          fetchEquipment();
        }
        
        // If rooms were created for floors or in bulk, ensure floors table is refreshed
        if ((formData.floorRoomCounts || formData.bulkRooms) && selectedHostel) {
          // Double refresh to ensure room counts are updated
          setTimeout(async () => {
            await fetchFloors();
            // Also refresh rooms if we're on the rooms tab
            if (activeTab === "rooms" && selectedFloor) {
              await fetchRooms();
            } else if (activeTab === "rooms" && selectedHostel) {
              // Fetch all rooms for the hostel if no floor is selected
              try {
                const params = { hostelId: selectedHostel };
                const roomsResponse = await API.get("/hostel/rooms", { params });
                const roomsData = roomsResponse.data?.success ? roomsResponse.data.data : roomsResponse.data || [];
                setRooms(Array.isArray(roomsData) ? roomsData : []);
              } catch (err) {
                console.error("Error fetching all rooms:", err);
              }
            }
          }, 500);
        }
      }
    } catch (err) {
      console.error("Error saving:", err);
      alert(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    
    try {
      setLoading(true);
      let response;
      
      if (activeTab === "floors") {
        response = await API.delete(`/hostel/floors/${id}`);
      } else if (activeTab === "rooms") {
        response = await API.delete(`/hostel/rooms/${id}`);
      } else if (activeTab === "equipment") {
        response = await API.delete(`/hostel/equipment/${id}`);
      }
      
      if (response?.data?.success) {
        // Refresh data
        if (activeTab === "floors") {
          fetchFloors();
        } else if (activeTab === "rooms") {
          fetchRooms();
          // Also refresh floors to update room counts
          if (selectedHostel) fetchFloors();
        } else if (activeTab === "equipment") {
          fetchEquipment();
        }
      }
    } catch (err) {
      console.error("Error deleting:", err);
      alert(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get columns based on active tab
   */
  const getColumns = () => {
    if (activeTab === "floors") {
      return [
        { 
          key: "floorNumber", 
          title: "Floor Number", 
          cellType: "custom",
          render: (value, row) => (
            <span className="font-semibold text-gray-900">
              {value === 0 ? "Ground Floor" : value === 1 ? "First Floor" : `Floor ${value}`}
            </span>
          )
        },
        { 
          key: "name", 
          title: "Floor Name", 
          cellType: "text",
          render: (value, row) => (
            <span className="text-gray-700">
              {value || (row.floorNumber === 0 ? "Ground Floor" : row.floorNumber === 1 ? "First Floor" : `Floor ${row.floorNumber}`)}
            </span>
          )
        },
        { 
          key: "roomCount", 
          title: "Number of Rooms", 
          cellType: "custom",
          render: (value, row) => (
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-blue-600">
                {value || 0}
              </span>
              <span className="text-sm text-gray-600">
                {value === 1 ? 'room' : 'rooms'}
              </span>
            </div>
          )
        },
        {
          key: "status",
          title: "Status",
          cellType: "custom",
          render: (value) => <StatusBadge status={value} />,
        },
  ];
    }
    if (activeTab === "rooms") {
      return [
    { key: "roomNumber", title: "Room Number", cellType: "text" },
        { 
          key: "roomType", 
          title: "Room Type", 
          cellType: "text",
          render: (value) => <span className="capitalize">{value || "-"}</span>
        },
    { key: "capacity", title: "Capacity", cellType: "number" },
        { key: "occupied", title: "Occupied", cellType: "number" },
        { key: "available", title: "Available", cellType: "number" },
    {
      key: "status",
      title: "Status",
      cellType: "custom",
      render: (value) => <StatusBadge status={value} />,
    },
  ];
    }
    if (activeTab === "equipment") {
      return [
        { key: "itemName", title: "Item Name", cellType: "text" },
        { key: "category", title: "Category", cellType: "text" },
        { key: "quantity", title: "Quantity", cellType: "number" },
        { key: "condition", title: "Condition", cellType: "text" },
    {
      key: "status",
      title: "Status",
      cellType: "custom",
      render: (value) => <StatusBadge status={value} />,
    },
      ];
    }
    return [];
  };

  /**
   * Get statistics
   */
  const statistics = useMemo(() => {
    if (activeTab === "floors") {
      return {
        total: floors.length,
        active: floors.filter(f => f.status === "active").length,
        totalRooms: floors.reduce((sum, f) => sum + (f.roomCount || 0), 0),
      };
    }
    if (activeTab === "rooms") {
      return {
        total: rooms.length,
        available: rooms.filter(r => r.status === "available").length,
        occupied: rooms.filter(r => r.status === "occupied").length,
        totalCapacity: rooms.reduce((sum, r) => sum + (r.capacity || 0), 0),
      };
    }
    if (activeTab === "equipment") {
      return {
        total: equipment.length,
        available: equipment.filter(e => e.status === "available").length,
        inUse: equipment.filter(e => e.status === "in-use").length,
      };
    }
    return {};
  }, [floors, rooms, equipment, activeTab]);

  const tabs = [
    { id: "floors", label: "Floors", icon: Building2 },
    { id: "rooms", label: "Rooms", icon: Home },
    // { id: "equipment", label: "Equipment", icon: Package },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
          Hostel Infrastructure Management
        </h2>
        <button
          onClick={() => {
            setSelectedItem(null);
            setViewMode(false);
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {activeTab === "floors" ? "Floor" : activeTab === "rooms" ? "Room" : "Equipment"}
        </button>
      </div>

      {/* Hostel Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Hostel *
        </label>
        <select
          value={selectedHostel}
          onChange={(e) => {
            setSelectedHostel(e.target.value);
            setSelectedFloor("");
            setSelectedRoom("");
            // Switch to floors tab when hostel is selected
            if (e.target.value) {
              setActiveTab("floors");
            }
          }}
          className="w-full md:w-1/3 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
        >
          <option value="">Select Hostel</option>
          {hostels.map((hostel) => (
            <option key={hostel._id} value={hostel._id}>
              {hostel.name} ({hostel.code}) - {hostel.numberOfFloors || 1} Floor(s)
            </option>
          ))}
        </select>
        {selectedHostel && floors.length > 0 && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <strong>{floors.length}</strong> floor(s) found for this hostel. 
              <span className="ml-2">Total rooms: <strong>{floors.reduce((sum, f) => sum + (f.roomCount || 0), 0)}</strong></span>
            </p>
            <p className="text-xs text-green-700 mt-1">
              Click "Add Floor" to enter room counts for each floor, or view the floors table below.
            </p>
          </div>
        )}
      </div>

      {/* Floor Selection (for Rooms tab) */}
      {activeTab === "rooms" && selectedHostel && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Floor * (to view/add rooms)
          </label>
          <select
            value={selectedFloor}
            onChange={(e) => {
              setSelectedFloor(e.target.value);
              setSelectedRoom("");
            }}
            className="w-full md:w-1/3 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          >
            <option value="">Select Floor to Add/View Rooms</option>
            {floors.map((floor) => (
              <option key={floor._id} value={floor._id}>
                {floor.name || `Floor ${floor.floorNumber}`} ({floor.roomCount || 0} rooms)
              </option>
            ))}
          </select>
          {!selectedFloor && floors.length > 0 && (
            <p className="mt-2 text-sm text-blue-600">
              Select a floor above to add rooms. Total floors available: <strong>{floors.length}</strong>
            </p>
          )}
        </div>
      )}

      {/* Room Selection (for Equipment tab) */}
      {activeTab === "equipment" && selectedFloor && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Room *
          </label>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="w-full md:w-1/3 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          >
            <option value="">Select Room</option>
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.roomNumber} ({room.roomType || "N/A"})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Summary Cards */}
      {activeTab === "floors" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <SummaryCard title="Total Floors" value={statistics.total} icon={Building2} color="blue" />
          <SummaryCard title="Active Floors" value={statistics.active} icon={Building2} color="green" />
          <SummaryCard title="Total Rooms" value={statistics.totalRooms} icon={Home} color="indigo" />
        </div>
      )}
      {activeTab === "rooms" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <SummaryCard title="Total Rooms" value={statistics.total} icon={Home} color="blue" />
          <SummaryCard title="Available" value={statistics.available} icon={Home} color="green" />
          <SummaryCard title="Occupied" value={statistics.occupied} icon={Home} color="red" />
          <SummaryCard title="Total Capacity" value={statistics.totalCapacity} icon={Package} color="indigo" />
        </div>
      )}
      {activeTab === "equipment" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <SummaryCard title="Total Equipment" value={statistics.total} icon={Package} color="blue" />
          <SummaryCard title="Available" value={statistics.available} icon={Package} color="green" />
          <SummaryCard title="In Use" value={statistics.inUse} icon={Package} color="yellow" />
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
            <button
              key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "rooms") {
                    setSelectedRoom("");
                  }
                }}
              className={`
                ${
                  activeTab === tab.id
                    ? "border-[#525b88] text-[#525b88]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
              `}
            >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
            </button>
            );
          })}
        </nav>
      </div>

      {/* Info message when floors are displayed */}
      {activeTab === "floors" && selectedHostel && floors.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Floors Table:</strong> Showing {floors.length} floor(s) with their room counts. 
            Room counts are updated automatically after adding rooms.
          </p>
        </div>
      )}

      {/* Data Table */}
        <DataTable
        data={
          activeTab === "floors" 
            ? (floors || []) 
            : activeTab === "rooms" 
            ? (rooms || []) 
            : (equipment || [])
        }
        columns={getColumns()}
          loading={loading}
          error={error}
        onView={(id) => {
          const item = (activeTab === "floors" ? floors : activeTab === "rooms" ? rooms : equipment).find((i) => i._id === id);
          setSelectedItem(item);
          setViewMode(true);
          setShowModal(true);
        }}
          onEdit={(id) => {
          const item = (activeTab === "floors" ? floors : activeTab === "rooms" ? rooms : equipment).find((i) => i._id === id);
          setSelectedItem(item);
          setViewMode(false);
            setShowModal(true);
          }}
        onDelete={handleDelete}
        emptyState={{
          title: `No ${activeTab} found`,
          message: activeTab === "floors" 
            ? selectedHostel 
              ? "No floors found for this hostel. Floors should be auto-generated when hostel is created. Please check the hostel settings."
              : "Please select a hostel to view its floors."
            : activeTab === "rooms"
            ? selectedFloor
              ? "No rooms found for this floor. Click 'Add Room' to create rooms."
              : "Please select a floor to view or add rooms."
            : selectedRoom
            ? "No equipment found for this room. Click 'Add Equipment' to add equipment."
            : "Please select a room to view or add equipment.",
        }}
      />

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedItem(null);
        }}
        title={viewMode ? `View ${activeTab === "floors" ? "Floor" : activeTab === "rooms" ? "Room" : "Equipment"} Details` : `${selectedItem ? "Edit" : "Add"} ${activeTab === "floors" ? "Floor" : activeTab === "rooms" ? "Room" : "Equipment"}`}
        size="lg"
        footer={!viewMode ? (
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedItem(null);
                setViewMode(false);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form={`${activeTab}-form`}
              className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166]"
            >
              {selectedItem ? "Update" : "Save"}
            </button>
          </div>
        ) : (
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedItem(null);
                setViewMode(false);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => {
                setViewMode(false);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-[#525b88] rounded-md hover:bg-[#3a4166]"
            >
              Edit
            </button>
          </div>
        )}
      >
        {viewMode ? (
          // View Mode - Show read-only details
          <>
            {activeTab === "floors" && selectedItem && (
              <FloorView floor={selectedItem} hostels={hostels} />
            )}
            {activeTab === "rooms" && selectedItem && (
              <RoomView room={selectedItem} hostels={hostels} floors={floors} />
            )}
            {activeTab === "equipment" && selectedItem && (
              <EquipmentView equipment={selectedItem} hostels={hostels} floors={floors} rooms={rooms} />
            )}
          </>
        ) : (
          // Edit/Add Mode - Show forms
          <>
            {activeTab === "floors" && (
              <FloorForm 
                floor={selectedItem} 
                hostels={hostels} 
                floors={floors}
                selectedHostel={selectedHostel}
                onSave={handleSave} 
              />
            )}
            {activeTab === "rooms" && (
              <RoomForm 
                room={selectedItem} 
                hostels={hostels} 
                floors={floors} 
                selectedHostel={selectedHostel}
                selectedFloor={selectedFloor}
                onSave={handleSave} 
              />
            )}
            {activeTab === "equipment" && (
              <EquipmentForm equipment={selectedItem} hostels={hostels} floors={floors} rooms={rooms} onSave={handleSave} />
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

/**
 * Floor Form Component
 */
const FloorForm = ({ floor, hostels, floors, selectedHostel, onSave }) => {
  const [formData, setFormData] = useState({
    hostelId: "",
    floorNumber: 0,
    name: "",
    facilities: [],
    description: "",
    status: "active",
    numberOfRooms: 0, // Number of rooms to create for this floor
  });

  // For bulk room creation: store room counts per floor
  const [floorRoomCounts, setFloorRoomCounts] = useState({});
  // Store room details for each floor: { floorId: [{ roomNumber, roomType, capacity, facilities, facilityCounts, description, status }] }
  const [floorRooms, setFloorRooms] = useState({});
  const [selectedHostelInForm, setSelectedHostelInForm] = useState(selectedHostel || "");
  const [floorsForHostel, setFloorsForHostel] = useState([]);

  // Fetch floors when hostel is selected in the form
  useEffect(() => {
    const fetchFloorsForHostel = async () => {
      if (selectedHostelInForm) {
        try {
          const response = await API.get("/hostel/floors", {
            params: { hostelId: selectedHostelInForm },
          });
          let floorsData = response.data?.success ? response.data.data : response.data || [];
          floorsData = Array.isArray(floorsData) ? floorsData : [];

          // Fetch room counts for each floor
          const floorsWithCounts = await Promise.all(
            floorsData.map(async (f) => {
              try {
                const roomsResponse = await API.get("/hostel/rooms", {
                  params: { floorId: f._id },
                });
                const roomsData = roomsResponse.data?.success 
                  ? roomsResponse.data.data 
                  : roomsResponse.data || [];
                return {
                  ...f,
                  roomCount: Array.isArray(roomsData) ? roomsData.length : 0,
                };
              } catch (err) {
                return { ...f, roomCount: 0 };
              }
            })
          );

          setFloorsForHostel(floorsWithCounts);
          
          // Initialize room counts
          const initialCounts = {};
          floorsWithCounts.forEach(f => {
            initialCounts[f._id] = f.roomCount || 0;
          });
          setFloorRoomCounts(initialCounts);
        } catch (err) {
          console.error("Error fetching floors:", err);
          setFloorsForHostel([]);
        }
      } else {
        setFloorsForHostel([]);
        setFloorRoomCounts({});
      }
    };

    fetchFloorsForHostel();
  }, [selectedHostelInForm]);

  useEffect(() => {
    if (floor) {
      // Editing existing floor
      const hostelId = typeof floor.hostelId === 'object' ? floor.hostelId._id : floor.hostelId;
      setFormData({
        ...floor,
        hostelId: hostelId || "",
        numberOfRooms: floor.roomCount || 0,
      });
      setSelectedHostelInForm(hostelId || "");
    } else {
      // Adding new floor - pre-fill with selected hostel from main component
      const hostelToUse = selectedHostel || "";
      setSelectedHostelInForm(hostelToUse);
      setFormData({
        hostelId: hostelToUse,
        floorNumber: 0,
        name: "",
        facilities: [],
        description: "",
        status: "active",
        numberOfRooms: 0,
      });
    }
  }, [floor, selectedHostel]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        facilities: checked
          ? [...prev.facilities, value]
          : prev.facilities.filter((f) => f !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }
  };

  const handleFloorRoomCountChange = (floorId, count) => {
    const newCount = Number(count) || 0;
    setFloorRoomCounts(prev => ({
      ...prev,
      [floorId]: newCount,
    }));
    
    // When room count changes, initialize or adjust room entries
    const floor = floorsForHostel.find(f => f._id === floorId);
    if (floor) {
      const currentRooms = floorRooms[floorId] || [];
      const currentCount = currentRooms.length;
      const existingCount = floor.roomCount || 0;
      
      if (newCount > existingCount) {
        // Need to add room entries for new rooms
        const roomsToAdd = newCount - existingCount;
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
          [floorId]: [...currentRooms, ...newRooms],
        }));
      } else if (newCount < currentCount) {
        // Remove excess room entries
        setFloorRooms(prev => ({
          ...prev,
          [floorId]: currentRooms.slice(0, newCount),
        }));
      }
    }
  };
  
  // Handle room entry field changes
  const handleRoomEntryChange = (floorId, index, field, value) => {
    setFloorRooms(prev => {
      const updated = { ...prev };
      if (!updated[floorId]) updated[floorId] = [];
      updated[floorId][index] = {
        ...updated[floorId][index],
        [field]: value,
      };
      return updated;
    });
  };
  
  // Handle facility checkbox for room entries
  const handleRoomFacilityChange = (floorId, index, facility, checked) => {
    setFloorRooms(prev => {
      const updated = { ...prev };
      if (!updated[floorId]) updated[floorId] = [];
      const currentFacilities = updated[floorId][index]?.facilities || [];
      updated[floorId][index] = {
        ...updated[floorId][index],
        facilities: checked
          ? [...currentFacilities, facility]
          : currentFacilities.filter((f) => f !== facility),
      };
      return updated;
    });
  };
  
  // Handle facility counts for room entries
  const handleRoomFacilityCountChange = (floorId, index, field, value) => {
    setFloorRooms(prev => {
      const updated = { ...prev };
      if (!updated[floorId]) updated[floorId] = [];
      updated[floorId][index] = {
        ...updated[floorId][index],
        facilityCounts: {
          ...(updated[floorId][index]?.facilityCounts || {}),
          [field]: Number(value) || 0
        }
      };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If adding new floor (not editing) and we have floor room counts
    if (!floor && selectedHostelInForm && floorsForHostel && floorsForHostel.length > 0 && Object.keys(floorRoomCounts).length > 0) {
      // Validate that all rooms have required fields
      for (const floorId in floorRooms) {
        const roomsForFloor = floorRooms[floorId] || [];
        const floor = floorsForHostel.find(f => f._id === floorId);
        const targetCount = floorRoomCounts[floorId] || 0;
        const existingCount = floor?.roomCount || 0;
        const newRoomsNeeded = targetCount - existingCount;
        
        if (newRoomsNeeded > 0) {
          // Check if we have room entries for new rooms
          const newRoomEntries = roomsForFloor.slice(existingCount);
          for (let i = 0; i < newRoomEntries.length; i++) {
            const room = newRoomEntries[i];
            if (!room.roomNumber || !room.capacity) {
              alert(`Please fill room number and capacity for all new rooms on ${floor?.name || "floor"}`);
              return;
            }
          }
        }
      }
      
      // Collect all room data
      const allRooms = [];
      for (const floorId in floorRooms) {
        const floor = floorsForHostel.find(f => f._id === floorId);
        const targetCount = floorRoomCounts[floorId] || 0;
        const existingCount = floor?.roomCount || 0;
        const newRoomsNeeded = targetCount - existingCount;
        
        if (newRoomsNeeded > 0) {
          const roomsForFloor = floorRooms[floorId] || [];
          const newRoomEntries = roomsForFloor.slice(existingCount);
          
          for (const roomEntry of newRoomEntries) {
            allRooms.push({
              hostelId: selectedHostelInForm,
              floorId: floorId,
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
      
      // Send floor room counts and room details to backend
      await onSave({ 
        floorRoomCounts, 
        hostelId: selectedHostelInForm,
        bulkRooms: allRooms.length > 0 ? allRooms : undefined,
      });
      return;
    }
    
    // If editing existing floor and numberOfRooms is set
    if (floor && formData.numberOfRooms !== undefined) {
      const currentRoomCount = floor.roomCount || 0;
      const targetCount = formData.numberOfRooms;
      const roomsToCreate = [];
      
      if (targetCount > currentRoomCount) {
        const newRoomsNeeded = targetCount - currentRoomCount;
        for (let i = 1; i <= newRoomsNeeded; i++) {
          const roomNumber = `${floor.floorNumber}-${String(currentRoomCount + i).padStart(3, '0')}`;
          roomsToCreate.push({
            hostelId: formData.hostelId,
            floorId: floor._id,
            roomNumber: roomNumber,
            roomType: "Double",
            capacity: 2,
            status: "available",
          });
        }
      }
      
      if (roomsToCreate.length > 0) {
        await onSave({ ...formData, createRooms: roomsToCreate });
        return;
      }
    }
    
    // For new single floor or if no rooms to create, just save the floor
    if (!formData.hostelId || formData.floorNumber === undefined) {
      alert("Please fill all required fields");
      return;
    }
    await onSave(formData);
  };

  const handleHostelChange = (e) => {
    const hostelId = e.target.value;
    setSelectedHostelInForm(hostelId);
    setFormData(prev => ({ ...prev, hostelId }));
  };

  return (
    <form id="floors-form" onSubmit={handleSubmit} className="space-y-4">
      {/* Hostel Selection - Always show when adding */}
      {!floor && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Select Hostel * (to see floors and enter room counts)
          </label>
          <select
            value={selectedHostelInForm}
            onChange={handleHostelChange}
            className="w-full rounded-md border-2 border-gray-300 px-3 py-2 text-sm font-medium focus:border-[#525b88] focus:ring-2 focus:ring-[#525b88]"
            required
          >
            <option value="">-- Select a Hostel --</option>
            {hostels.map((hostel) => (
              <option key={hostel._id} value={hostel._id}>
                {hostel.name} ({hostel.code}) - {hostel.numberOfFloors || 1} Floor(s)
              </option>
            ))}
          </select>
          {selectedHostelInForm && (
            <p className="mt-2 text-sm text-blue-700">
              ✓ Hostel selected. {floorsForHostel.length > 0 ? `Found ${floorsForHostel.length} floor(s).` : "Loading floors..."}
            </p>
          )}
        </div>
      )}

      {/* Show existing floors and allow entering room count for each when adding */}
      {!floor && selectedHostelInForm && floorsForHostel && floorsForHostel.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
          <h4 className="text-base font-semibold text-gray-900 mb-1">
            Enter Number of Rooms for Each Floor
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            This hostel has <strong>{floorsForHostel.length}</strong> floor(s). Enter how many rooms you want on each floor.
          </p>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {floorsForHostel.sort((a, b) => a.floorNumber - b.floorNumber).map((f) => (
              <div key={f._id} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-300 shadow-sm">
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 text-base">
                    {f.name || (f.floorNumber === 0 ? "Ground Floor" : f.floorNumber === 1 ? "First Floor" : `Floor ${f.floorNumber}`)}
                  </span>
                  <span className="text-sm text-gray-500 ml-3">
                    (Floor #{f.floorNumber} • Currently: <strong>{f.roomCount || 0}</strong> rooms)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Total Rooms:</label>
                  <input
                    type="number"
                    min="0"
                    value={floorRoomCounts[f._id] !== undefined ? floorRoomCounts[f._id] : (f.roomCount || 0)}
                    onChange={(e) => handleFloorRoomCountChange(f._id, e.target.value)}
                    className="w-24 rounded-md border-2 border-gray-300 px-3 py-2 text-sm font-medium focus:border-[#525b88] focus:ring-2 focus:ring-[#525b88]"
                    placeholder="0"
                  />
                  {floorRoomCounts[f._id] !== undefined && floorRoomCounts[f._id] > (f.roomCount || 0) && (
                    <span className="text-xs text-green-600 font-medium">
                      +{floorRoomCounts[f._id] - (f.roomCount || 0)} new
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Enter the total number of rooms you want for each floor. After entering the number, you'll see room detail forms below to fill in details for each new room.
            </p>
          </div>
        </div>
      )}
      
      {/* Show room detail forms for each floor when room count is entered */}
      {!floor && selectedHostelInForm && floorsForHostel && floorsForHostel.length > 0 && Object.keys(floorRoomCounts).length > 0 && (
        <div className="space-y-6 mt-6 max-h-[600px] overflow-y-auto">
          {floorsForHostel.sort((a, b) => a.floorNumber - b.floorNumber).map((f) => {
            const targetCount = floorRoomCounts[f._id] || 0;
            const existingCount = f.roomCount || 0;
            const newRoomsNeeded = targetCount - existingCount;
            const roomsForFloor = floorRooms[f._id] || [];
            const newRoomEntries = newRoomsNeeded > 0 ? roomsForFloor.slice(existingCount) : [];
            
            if (newRoomsNeeded <= 0) return null;
            
            return (
              <div key={f._id} className="bg-gray-50 border-2 border-gray-300 rounded-lg p-5">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {f.name || (f.floorNumber === 0 ? "Ground Floor" : f.floorNumber === 1 ? "First Floor" : `Floor ${f.floorNumber}`)}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Enter details for <strong>{newRoomsNeeded}</strong> new room(s)
                  </p>
                </div>
                
                <div className="space-y-4">
                  {newRoomEntries.map((room, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-semibold text-gray-800">Room {index + 1}</h5>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Room Number *
                          </label>
                          <input
                            type="text"
                            value={room.roomNumber || ""}
                            onChange={(e) => handleRoomEntryChange(f._id, existingCount + index, "roomNumber", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                            placeholder="e.g., 101, A-01"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Room Type *
                          </label>
                          <select
                            value={room.roomType || "Double"}
                            onChange={(e) => handleRoomEntryChange(f._id, existingCount + index, "roomType", e.target.value)}
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
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Capacity *
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={room.capacity || 2}
                            onChange={(e) => handleRoomEntryChange(f._id, existingCount + index, "capacity", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status *
                          </label>
                          <select
                            value={room.status || "available"}
                            onChange={(e) => handleRoomEntryChange(f._id, existingCount + index, "status", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                            required
                          >
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="reserved">Reserved</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Facilities
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {["AC", "Non-AC", "Attached Bathroom", "Common Bathroom", "Balcony", "Study Table", "Wardrobe", "Fan", "LED Light", "WiFi", "Power Socket"].map((facility) => (
                            <label key={facility} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={(room.facilities || []).includes(facility)}
                                onChange={(e) => handleRoomFacilityChange(f._id, existingCount + index, facility, e.target.checked)}
                                className="rounded border-gray-300 text-[#525b88] focus:ring-[#525b88]"
                              />
                              <span className="ml-2 text-sm text-gray-700">{facility}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <FacilitiesCounts
                        facilityCounts={room.facilityCounts || {}}
                        onCountChange={(field, value) => handleRoomFacilityCountChange(f._id, existingCount + index, field, value)}
                      />
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={room.description || ""}
                          onChange={(e) => handleRoomEntryChange(f._id, existingCount + index, "description", e.target.value)}
                          rows={2}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                          placeholder="Optional room description"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Show regular form fields when editing a single floor */}
      {floor && (
        <>
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
              disabled
            >
              <option value={formData.hostelId}>
                {hostels.find(h => h._id === formData.hostelId)?.name || "Selected Hostel"}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Floor Number *
            </label>
            <input
              type="number"
              name="floorNumber"
              value={formData.floorNumber}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              min="0"
              required
              disabled
            />
            <p className="mt-1 text-xs text-gray-500">0 = Ground Floor, 1 = First Floor, etc.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Floor Name (Optional)
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              placeholder="Leave empty for auto-generated name"
            />
          </div>
        </>
      )}

      {/* Show room count input when editing a single floor */}
      {floor && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Rooms for This Floor *
          </label>
          <input
            type="number"
            name="numberOfRooms"
            value={formData.numberOfRooms}
            onChange={handleChange}
            className="w-full rounded-md border-2 border-gray-300 px-3 py-2 text-sm font-medium focus:border-[#525b88] focus:ring-2 focus:ring-[#525b88]"
            min="0"
            required
          />
          <div className="mt-2 flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              Current rooms: <strong className="text-gray-900">{floor.roomCount || 0}</strong>
            </span>
            {formData.numberOfRooms > (floor.roomCount || 0) && (
              <span className="text-green-600 font-medium">
                Will create: <strong>+{formData.numberOfRooms - (floor.roomCount || 0)}</strong> new rooms
              </span>
            )}
          </div>
        </div>
      )}

      {/* Show message if no floors found */}
      {!floor && selectedHostelInForm && floorsForHostel.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800">
            <strong>No floors found for this hostel.</strong> Floors should be auto-generated when the hostel is created with numberOfFloors. Please check the hostel settings or create floors first.
          </p>
        </div>
      )}

      {/* Show message if no hostel selected */}
      {!floor && !selectedHostelInForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <p className="text-sm text-gray-600">
            👆 Please select a hostel above to see its floors and enter room counts for each floor.
          </p>
        </div>
      )}

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
          <option value="maintenance">Maintenance</option>
        </select>
    </div>
    </form>
  );
};

/**
 * Facilities Counts Component
 * Allows entering counts for beds, fans, tables, etc.
 */
const FacilitiesCounts = ({ facilityCounts = {}, onCountChange, floorId, roomIndex }) => {
  const facilityFields = [
    { key: "beds", label: "Beds", icon: "🛏️" },
    { key: "fans", label: "Fans", icon: "🌀" },
    { key: "studyTables", label: "Study Tables", icon: "📚" },
    { key: "chairs", label: "Chairs", icon: "💺" },
    { key: "wardrobes", label: "Wardrobes", icon: "👔" },
    { key: "ledLights", label: "LED Lights", icon: "💡" },
    { key: "powerSockets", label: "Power Sockets", icon: "🔌" },
    { key: "windows", label: "Windows", icon: "🪟" },
  ];

  return (
    <div className="mt-4 bg-gray-50 border border-gray-300 rounded-lg p-4">
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        Facilities Count (How many items in this room)
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {facilityFields.map((field) => (
          <div key={field.key}>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <span className="mr-1">{field.icon}</span>
              {field.label}
            </label>
            <input
              type="number"
              min="0"
              value={facilityCounts[field.key] || ""}
              onChange={(e) => onCountChange(field.key, e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              placeholder="0"
            />
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Enter the number of each facility/item available in this room.
      </p>
    </div>
  );
};

/**
 * Room Form Component
 */
const RoomForm = ({ room, hostels, floors, selectedHostel, selectedFloor, onSave }) => {
  const [selectedHostelInForm, setSelectedHostelInForm] = useState("");
  const [floorsForHostel, setFloorsForHostel] = useState([]);
  const [floorRooms, setFloorRooms] = useState({}); // { floorId: [{ roomNumber, roomType, capacity, facilities, description, status }] }
  const [formData, setFormData] = useState({
    hostelId: "",
    floorId: "",
    roomNumber: "",
    roomType: "Double",
    capacity: 2,
    facilities: [],
    facilityCounts: {},
    description: "",
    status: "available",
  });

  // Fetch floors when hostel is selected (for adding mode)
  useEffect(() => {
    const fetchFloorsForHostel = async () => {
      if (!selectedHostelInForm) {
        setFloorsForHostel([]);
        setFloorRooms({});
        return;
      }

      try {
        const response = await API.get("/hostel/floors", {
          params: { hostelId: selectedHostelInForm },
        });
        let floorsData = [];
        if (response.data?.success && response.data?.data) {
          floorsData = response.data.data;
        } else if (Array.isArray(response.data?.data)) {
          floorsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          floorsData = response.data;
        }

        // Fetch room counts for each floor
        const floorsWithCounts = await Promise.all(
          floorsData.map(async (floor) => {
            try {
              const roomsResponse = await API.get("/hostel/rooms", {
                params: { floorId: floor._id },
              });
              let rooms = [];
              if (roomsResponse.data?.success && roomsResponse.data?.data) {
                rooms = roomsResponse.data.data;
              } else if (Array.isArray(roomsResponse.data?.data)) {
                rooms = roomsResponse.data.data;
              } else if (Array.isArray(roomsResponse.data)) {
                rooms = roomsResponse.data;
              }
              return { ...floor, roomCount: rooms.length };
            } catch (err) {
              console.error(`Error fetching rooms for floor ${floor._id}:`, err);
              return { ...floor, roomCount: 0 };
            }
          })
        );

        setFloorsForHostel(floorsWithCounts);
        // Initialize empty room arrays for each floor
        const initialFloorRooms = {};
        floorsWithCounts.forEach((floor) => {
          initialFloorRooms[floor._id] = [];
        });
        setFloorRooms(initialFloorRooms);
      } catch (err) {
        console.error("Error fetching floors:", err);
        setFloorsForHostel([]);
      }
    };

    if (!room) {
      // Only fetch when adding (not editing)
      fetchFloorsForHostel();
    }
  }, [selectedHostelInForm, room]);

  useEffect(() => {
    if (room) {
      // Editing existing room
      const hostelId = typeof room.hostelId === 'object' ? room.hostelId._id : room.hostelId;
      const floorId = typeof room.floorId === 'object' ? room.floorId._id : room.floorId;
      setFormData({
        ...room,
        hostelId: hostelId || "",
        floorId: floorId || "",
        facilityCounts: room.facilityCounts || {},
      });
    } else {
      // Adding new room - reset form
      setFormData({
        hostelId: "",
        floorId: "",
        roomNumber: "",
        roomType: "Double",
        capacity: 2,
        facilities: [],
        facilityCounts: {},
        description: "",
        status: "available",
      });
    }
  }, [room]);

  const handleHostelChange = (e) => {
    const hostelId = e.target.value;
    setSelectedHostelInForm(hostelId);
    setFormData(prev => ({ ...prev, hostelId }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        facilities: checked
          ? [...prev.facilities, value]
          : prev.facilities.filter((f) => f !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }
  };

  // Handle adding room entries for a specific floor based on floor's totalRooms
  const handleAddRoomToFloor = (floorId) => {
    const floor = floorsForHostel.find(f => f._id === floorId);
    if (!floor) return;

    const targetCount = floor.totalRooms || 0;
    if (targetCount < 1) {
      alert("This floor doesn't have a room count set. Please set the total rooms for this floor first.");
      return;
    }

    const currentRooms = floorRooms[floorId] || [];
    const currentCount = currentRooms.length;

    // Check if we've already reached or exceeded the target
    if (currentCount >= targetCount) {
      alert(`You have already added ${currentCount} room(s). The target is ${targetCount} rooms for this floor.`);
      return;
    }

    // Calculate how many more rooms we need to add
    const roomsToAdd = targetCount - currentCount;

    const newRooms = Array.from({ length: roomsToAdd }, () => ({
      roomNumber: "",
      roomType: "Double",
      capacity: 2,
      facilities: [],
      facilityCounts: {},
      description: "",
      status: "available",
    }));

    setFloorRooms((prev) => ({
      ...prev,
      [floorId]: [
        ...(prev[floorId] || []),
        ...newRooms,
      ],
    }));
  };

  // Handle removing a room entry from a floor
  const handleRemoveRoomFromFloor = (floorId, index) => {
    setFloorRooms((prev) => ({
      ...prev,
      [floorId]: prev[floorId].filter((_, i) => i !== index),
    }));
  };

  // Handle room entry field changes
  const handleRoomEntryChange = (floorId, index, field, value) => {
    setFloorRooms((prev) => {
      const updated = { ...prev };
      if (!updated[floorId]) updated[floorId] = [];
      updated[floorId][index] = {
        ...updated[floorId][index],
        [field]: value,
      };
      return updated;
    });
  };

  // Handle facility checkbox for room entries
  const handleRoomFacilityChange = (floorId, index, facility, checked) => {
    setFloorRooms((prev) => {
      const updated = { ...prev };
      if (!updated[floorId]) updated[floorId] = [];
      const currentFacilities = updated[floorId][index]?.facilities || [];
      updated[floorId][index] = {
        ...updated[floorId][index],
        facilities: checked
          ? [...currentFacilities, facility]
          : currentFacilities.filter((f) => f !== facility),
      };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If editing, use the regular form submission
    if (room) {
      if (!formData.hostelId || !formData.floorId || !formData.roomNumber || !formData.capacity) {
        alert("Please fill all required fields");
        return;
      }
      onSave(formData);
      return;
    }

    // If adding, collect all rooms from all floors
    const allRooms = [];
    for (const floorId in floorRooms) {
      const roomsForFloor = floorRooms[floorId] || [];
      for (const roomEntry of roomsForFloor) {
        if (!roomEntry.roomNumber || !roomEntry.capacity) {
          alert(`Please fill room number and capacity for all rooms in ${floorsForHostel.find(f => f._id === floorId)?.name || "floor"}`);
          return;
        }
        allRooms.push({
          hostelId: selectedHostelInForm,
          floorId: floorId,
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

    if (allRooms.length === 0) {
      alert("Please add at least one room");
      return;
    }

    // Call onSave with bulk room data
    onSave({ bulkRooms: allRooms });
  };

  const filteredFloors = (floors || []).filter(f => {
    const fHostelId = typeof f.hostelId === 'object' ? f.hostelId._id : f.hostelId;
    return !formData.hostelId || fHostelId === formData.hostelId;
  });

  const facilityOptions = ["AC", "Non-AC", "Attached Bathroom", "Common Bathroom", "Balcony", "Study Table", "Wardrobe", "Fan", "LED Light", "WiFi", "Power Socket"];

  // If editing, show the regular form
  if (room) {
    return (
      <form id="rooms-form" onSubmit={handleSubmit} className="space-y-4">
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
              disabled
            >
              <option value={formData.hostelId}>
                {hostels.find(h => h._id === formData.hostelId)?.name || "Selected Hostel"}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Floor *
            </label>
            <select
              name="floorId"
              value={formData.floorId}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              required
              disabled
            >
              <option value={formData.floorId}>
                {filteredFloors.find(f => f._id === formData.floorId)?.name || "Selected Floor"}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Number *
            </label>
            <input
              type="text"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              required
            />
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity *
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
              min="1"
              max="20"
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
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Facilities (Checkboxes)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {facilityOptions.map((facility) => (
              <label key={facility} className="flex items-center">
                <input
                  type="checkbox"
                  value={facility}
                  checked={formData.facilities.includes(facility)}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-[#525b88] focus:ring-[#525b88]"
                />
                <span className="ml-2 text-sm text-gray-700">{facility}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Facilities Count Component */}
        <FacilitiesCounts
          facilityCounts={formData.facilityCounts || {}}
          onCountChange={(field, value) => {
            setFormData(prev => ({
              ...prev,
              facilityCounts: {
                ...(prev.facilityCounts || {}),
                [field]: Number(value) || 0
              }
            }));
          }}
        />

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
          />
        </div>
      </form>
    );
  }

  // If adding, show floors with room entry forms
  return (
    <form id="rooms-form" onSubmit={handleSubmit} className="space-y-4">
      {/* Hostel Selection */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Select Hostel * (to see floors and add rooms)
        </label>
        <select
          value={selectedHostelInForm}
          onChange={handleHostelChange}
          className="w-full rounded-md border-2 border-gray-300 px-3 py-2 text-sm font-medium focus:border-[#525b88] focus:ring-2 focus:ring-[#525b88]"
          required
        >
          <option value="">-- Select a Hostel --</option>
          {hostels.map((hostel) => (
            <option key={hostel._id} value={hostel._id}>
              {hostel.name} ({hostel.code}) - {hostel.numberOfFloors || 1} Floor(s)
            </option>
          ))}
        </select>
        {selectedHostelInForm && (
          <p className="mt-2 text-sm text-blue-700">
            ✓ Hostel selected. {floorsForHostel.length > 0 ? `Found ${floorsForHostel.length} floor(s).` : "Loading floors..."}
          </p>
        )}
      </div>

      {/* Show floors with room entry forms */}
      {selectedHostelInForm && floorsForHostel && floorsForHostel.length > 0 && (
        <div className="space-y-6 max-h-[600px] overflow-y-auto">
          {floorsForHostel.sort((a, b) => a.floorNumber - b.floorNumber).map((floor) => (
            <div key={floor._id} className="bg-gray-50 border-2 border-gray-300 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-base font-semibold text-gray-900">
                    {floor.name || (floor.floorNumber === 0 ? "Ground Floor" : floor.floorNumber === 1 ? "First Floor" : `Floor ${floor.floorNumber}`)}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Currently: <strong>{floor.roomCount || 0}</strong> room(s)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600">
                    Target: <strong className="text-gray-900">{floor.totalRooms || 0}</strong> rooms
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddRoomToFloor(floor._id)}
                    disabled={(floorRooms[floor._id]?.length || 0) >= (floor.totalRooms || 0) || !floor.totalRooms || floor.totalRooms === 0}
                    className={`px-4 py-2 text-white text-sm font-medium rounded-md transition-colors ${
                      (floorRooms[floor._id]?.length || 0) >= (floor.totalRooms || 0) || !floor.totalRooms || floor.totalRooms === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#525b88] hover:bg-[#424870]"
                    }`}
                  >
                    + Add Room(s)
                  </button>
                  {(floorRooms[floor._id]?.length || 0) > 0 && floor.totalRooms > 0 && (
                    <span className="text-sm text-gray-600">
                      ({floorRooms[floor._id].length} / {floor.totalRooms})
                    </span>
                  )}
                </div>
              </div>

              {/* Room entries for this floor */}
              {floorRooms[floor._id] && floorRooms[floor._id].length > 0 && (
                <div className="space-y-4 mt-4">
                  {floorRooms[floor._id].map((roomEntry, index) => (
                    <div key={index} className="bg-white border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Room #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRoomFromFloor(floor._id, index)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Room Number *
                          </label>
                          <input
                            type="text"
                            value={roomEntry.roomNumber || ""}
                            onChange={(e) => handleRoomEntryChange(floor._id, index, "roomNumber", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                            required
                            placeholder="e.g., 101, 102"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Room Type *
                          </label>
                          <select
                            value={roomEntry.roomType || "Double"}
                            onChange={(e) => handleRoomEntryChange(floor._id, index, "roomType", e.target.value)}
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

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Capacity *
                          </label>
                          <input
                            type="number"
                            value={roomEntry.capacity || 2}
                            onChange={(e) => handleRoomEntryChange(floor._id, index, "capacity", Number(e.target.value))}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                            min="1"
                            max="20"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status *
                          </label>
                          <select
                            value={roomEntry.status || "available"}
                            onChange={(e) => handleRoomEntryChange(floor._id, index, "status", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                            required
                          >
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="reserved">Reserved</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Facilities (Checkboxes)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {facilityOptions.map((facility) => (
                            <label key={facility} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={(roomEntry.facilities || []).includes(facility)}
                                onChange={(e) => handleRoomFacilityChange(floor._id, index, facility, e.target.checked)}
                                className="rounded border-gray-300 text-[#525b88] focus:ring-[#525b88]"
                              />
                              <span className="ml-2 text-sm text-gray-700">{facility}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Facilities Count Component */}
                      <FacilitiesCounts
                        floorId={floor._id}
                        roomIndex={index}
                        facilityCounts={roomEntry.facilityCounts || {}}
                        onCountChange={(field, value) => handleRoomEntryChange(floor._id, index, "facilityCounts", {
                          ...(roomEntry.facilityCounts || {}),
                          [field]: Number(value) || 0
                        })}
                      />

                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={roomEntry.description || ""}
                          onChange={(e) => handleRoomEntryChange(floor._id, index, "description", e.target.value)}
                          rows={2}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
                          placeholder="Optional room description"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(!floorRooms[floor._id] || floorRooms[floor._id].length === 0) && (
                <p className="text-sm text-gray-500 italic mt-2">No rooms added yet. Click "Add Room" to add rooms for this floor.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedHostelInForm && floorsForHostel.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800">
            No floors found for this hostel. Please create floors first.
          </p>
        </div>
      )}
    </form>
  );
};

/**
 * Equipment Form Component
 */
const EquipmentForm = ({ equipment, hostels, floors, rooms, onSave }) => {
  const [formData, setFormData] = useState({
    hostelId: "",
    floorId: "",
    roomId: "",
    itemName: "",
    category: "Furniture",
    quantity: 1,
    condition: "Good",
    status: "available",
    description: "",
  });

  useEffect(() => {
    if (equipment) {
      const hostelId = typeof equipment.hostelId === 'object' ? equipment.hostelId._id : equipment.hostelId;
      const floorId = typeof equipment.floorId === 'object' ? equipment.floorId._id : equipment.floorId;
      const roomId = typeof equipment.roomId === 'object' ? equipment.roomId._id : equipment.roomId;
      setFormData({
        ...equipment,
        hostelId: hostelId || "",
        floorId: floorId || "",
        roomId: roomId || "",
      });
    }
  }, [equipment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.hostelId || !formData.itemName || !formData.category || !formData.quantity) {
      alert("Please fill all required fields");
      return;
    }
    onSave(formData);
  };

  const filteredFloors = (floors || []).filter(f => {
    const fHostelId = typeof f.hostelId === 'object' ? f.hostelId._id : f.hostelId;
    return !formData.hostelId || fHostelId === formData.hostelId;
  });

  const filteredRooms = (rooms || []).filter(r => {
    const rHostelId = typeof r.hostelId === 'object' ? r.hostelId._id : r.hostelId;
    const rFloorId = typeof r.floorId === 'object' ? r.floorId._id : r.floorId;
    return (!formData.hostelId || rHostelId === formData.hostelId) &&
           (!formData.floorId || rFloorId === formData.floorId);
  });

  return (
    <form id="equipment-form" onSubmit={handleSubmit} className="space-y-4">
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
            Floor (Optional)
          </label>
          <select
            name="floorId"
            value={formData.floorId}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            disabled={!formData.hostelId}
          >
            <option value="">Select Floor (Optional)</option>
            {filteredFloors.map((floor) => (
              <option key={floor._id} value={floor._id}>
                {floor.name || `Floor ${floor.floorNumber}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room (Optional)
          </label>
          <select
            name="roomId"
            value={formData.roomId}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            disabled={!formData.hostelId}
          >
            <option value="">Select Room (Optional)</option>
            {filteredRooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.roomNumber} ({room.roomType || "N/A"})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Item Name *
          </label>
          <input
            type="text"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            required
          />
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
            <option value="Furniture">Furniture</option>
            <option value="Electronics">Electronics</option>
            <option value="Appliances">Appliances</option>
            <option value="Bedding">Bedding</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Security">Security</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity *
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condition
          </label>
          <select
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          >
            <option value="New">New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
            <option value="Needs Repair">Needs Repair</option>
            <option value="Damaged">Damaged</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]"
          >
            <option value="available">Available</option>
            <option value="in-use">In Use</option>
            <option value="maintenance">Maintenance</option>
            <option value="damaged">Damaged</option>
            <option value="disposed">Disposed</option>
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
        />
      </div>
    </form>
  );
};

export default BlocksRoomsBeds;
