const Floor = require("../../models/hostel/Floor");
const Room = require("../../models/hostel/Room");
const Bed = require("../../models/hostel/Bed");
const Facility = require("../../models/hostel/Facility");

/**
 * @desc Get available floors, rooms, and beds for a hostel
 * @route GET /api/hostel/availability/:hostelId
 * @access Public (for application form)
 */
exports.getHostelAvailability = async (req, res) => {
  try {
    const { hostelId } = req.params;

    if (!hostelId) {
      return res.status(400).json({
        success: false,
        message: "Hostel ID is required",
      });
    }

    // Get all active floors for this hostel
    const floors = await Floor.find({
      hostelId: hostelId,
      status: "active",
    })
      .sort({ floorNumber: 1 })
      .lean();

    // Get all available rooms for this hostel (with available beds)
    const rooms = await Room.find({
      hostelId: hostelId,
      status: { $in: ["available", "occupied"] }, // Include partially occupied rooms
    })
      .populate("floorId", "floorNumber name")
      .sort({ floorId: 1, roomNumber: 1 })
      .lean();

    // Get all beds for these rooms
    const roomIds = rooms.map((r) => r._id);
    const beds = await Bed.find({
      hostelId: hostelId,
      roomId: { $in: roomIds },
    })
      .sort({ roomId: 1, bedNumber: 1 })
      .lean();

    // Get facilities
    const facilities = await Facility.find({ status: "active" })
      .select("name code type description category")
      .lean();

    // Group rooms by floor
    const floorsWithRooms = floors.map((floor) => {
      const floorRooms = rooms.filter(
        (room) =>
          (room.floorId?._id?.toString() === floor._id.toString()) ||
          (room.floorId?.toString() === floor._id.toString())
      );

      // Add beds and availability info to each room
      const roomsWithBeds = floorRooms.map((room) => {
        const roomBeds = beds.filter(
          (bed) => bed.roomId?.toString() === room._id.toString()
        );

        // Calculate availability info
        // If specific Bed documents exist, use them. Otherwise, generate virtual beds based on capacity.
        let availableBedsCount = 0;
        let finalBeds = [];

        if (roomBeds.length > 0) {
          finalBeds = roomBeds;
          availableBedsCount = roomBeds.filter(
            (bed) => bed.status === "available"
          ).length;
        } else {
          const totalCapacity = room.capacity || 0;
          const occupiedCount = room.occupied || 0;
          availableBedsCount = Math.max(0, totalCapacity - occupiedCount);

          // Generate virtual beds for the ENTIRE capacity
          finalBeds = Array.from({ length: totalCapacity }, (_, i) => ({
            _id: `vbed-${room._id}-${i}`,
            bedNumber: `${room.roomNumber}-${i + 1}`,
            status: i < occupiedCount ? "occupied" : "available",
            isVirtual: true
          }));
        }

        // Get room facilities
        let roomFacilities = [];
        if (room.facilities && Array.isArray(room.facilities)) {
          roomFacilities = room.facilities
            .map((facilityId) => {
              return facilities.find(
                (f) => f._id.toString() === facilityId.toString()
              );
            })
            .filter(Boolean);
        }

        return {
          ...room,
          beds: finalBeds,
          availableBeds: availableBedsCount,
          totalBeds: roomBeds.length || room.capacity || 0,
          facilities: roomFacilities,
        };
      });

      return {
        ...floor,
        rooms: roomsWithBeds,
        totalAvailableRooms: roomsWithBeds.filter(r => r.availableBeds > 0).length,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        floors: floorsWithRooms,
        facilities: facilities,
      },
    });
  } catch (error) {
    console.error("Error fetching hostel availability:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

