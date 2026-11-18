const Room = require("../../models/hostel/Room");
const Bed = require("../../models/hostel/Bed");
const Hostel = require("../../models/hostel/Hostel");

/**
 * @desc Get all rooms
 * @route GET /api/hostel/rooms
 * @access Private
 */
exports.getAllRooms = async (req, res) => {
  try {
    const { hostelId, floorId, status } = req.query;
    let query = {};

    if (hostelId) {
      query.hostelId = hostelId;
    }

    if (floorId) {
      query.floorId = floorId;
    }

    if (status) {
      query.status = status;
    }

    const rooms = await Room.find(query)
      .populate("hostelId", "name code")
      .populate("floorId", "name floorNumber")
      .sort({ floorId: 1, roomNumber: 1 });

    res.status(200).json({
      success: true,
      data: rooms,
      count: rooms.length,
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc Get room by ID with beds and equipment
 * @route GET /api/hostel/rooms/:id
 * @access Private
 */
exports.getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id)
      .populate("hostelId", "name code")
      .populate("floorId", "name floorNumber");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Get beds in this room
    const beds = await Bed.find({ roomId: id }).sort({ bedNumber: 1 });

    // Get equipment in this room
    const HostelEquipment = require("../../models/hostel/HostelEquipment");
    const equipment = await HostelEquipment.find({ roomId: id });

    res.status(200).json({
      success: true,
      data: {
        room,
        beds,
        equipment,
      },
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc Create a new room
 * @route POST /api/hostel/rooms
 * @access Private
 */
exports.createRoom = async (req, res) => {
  try {
    const {
      hostelId,
      floorId,
      roomNumber,
      roomType,
      capacity,
      facilities,
      facilityCounts,
      description,
      status,
    } = req.body;

    // Validate required fields
    if (!hostelId || !floorId || !roomNumber || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Hostel ID, Floor ID, room number, and capacity are required",
      });
    }

    // Validate hostel and floor exist
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(400).json({
        success: false,
        message: "Hostel not found",
      });
    }

    const Floor = require("../../models/hostel/Floor");
    const floor = await Floor.findById(floorId);
    if (!floor) {
      return res.status(400).json({
        success: false,
        message: "Floor not found",
      });
    }

    // Check if room with same number already exists in this floor
    const existingRoom = await Room.findOne({
      hostelId,
      floorId,
      roomNumber: roomNumber.trim(),
    });

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: "Room with this number already exists in this floor",
      });
    }

    const room = new Room({
      hostelId,
      floorId,
      roomNumber: roomNumber.trim(),
      roomType: roomType || "Double",
      capacity: Number(capacity),
      occupied: 0,
      facilities: Array.isArray(facilities) ? facilities : [],
      facilityCounts: facilityCounts && typeof facilityCounts === 'object' ? facilityCounts : {},
      description: (description || "").trim(),
      status: status || "available",
    });

    await room.save();
    await room.populate("hostelId", "name code");
    await room.populate("floorId", "name floorNumber");

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
    });
  } catch (error) {
    console.error("Error creating room:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Room with this number already exists",
        error: error.message,
      });
    }

    res.status(400).json({
      success: false,
      message: "Invalid Data",
      error: error.message,
    });
  }
};

/**
 * @desc Update a room
 * @route PUT /api/hostel/rooms/:id
 * @access Private
 */
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If roomNumber is being updated, check for duplicates
    if (updateData.roomNumber) {
      const room = await Room.findById(id);
      if (room) {
        const existingRoom = await Room.findOne({
          hostelId: room.hostelId,
          floorId: room.floorId,
          roomNumber: updateData.roomNumber.trim(),
          _id: { $ne: id },
        });

        if (existingRoom) {
          return res.status(400).json({
            success: false,
            message: "Room with this number already exists in this floor",
          });
        }
        updateData.roomNumber = updateData.roomNumber.trim();
      }
    }

    const room = await Room.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("hostelId", "name code")
      .populate("floorId", "name floorNumber");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: room,
    });
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(400).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

/**
 * @desc Delete a room
 * @route DELETE /api/hostel/rooms/:id
 * @access Private
 */
exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if room has beds
    const bedsCount = await Bed.countDocuments({ roomId: id });
    if (bedsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete room. It has ${bedsCount} bed(s). Please delete beds first.`,
      });
    }

    const room = await Room.findByIdAndDelete(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
      data: room,
    });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};

/**
 * @desc Create multiple rooms with full details
 * @route POST /api/hostel/rooms/bulk
 * @access Private
 */
exports.createBulkRooms = async (req, res) => {
  try {
    const { rooms } = req.body; // Array of room objects

    if (!Array.isArray(rooms) || rooms.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Rooms array is required and must not be empty",
      });
    }

    const Floor = require("../../models/hostel/Floor");
    const createdRooms = [];
    const errors = [];

    for (let i = 0; i < rooms.length; i++) {
      const roomData = rooms[i];
      const {
        hostelId,
        floorId,
        roomNumber,
        roomType,
        capacity,
        facilities,
        facilityCounts,
        description,
        status,
      } = roomData;

      // Validate required fields
      if (!hostelId || !floorId || !roomNumber || !capacity) {
        errors.push({
          index: i,
          roomNumber: roomNumber || "N/A",
          error: "Hostel ID, Floor ID, room number, and capacity are required",
        });
        continue;
      }

      // Validate hostel and floor exist
      const hostel = await Hostel.findById(hostelId);
      if (!hostel) {
        errors.push({
          index: i,
          roomNumber: roomNumber || "N/A",
          error: "Hostel not found",
        });
        continue;
      }

      const floor = await Floor.findById(floorId);
      if (!floor) {
        errors.push({
          index: i,
          roomNumber: roomNumber || "N/A",
          error: "Floor not found",
        });
        continue;
      }

      // Check if room with same number already exists in this floor
      const existingRoom = await Room.findOne({
        hostelId,
        floorId,
        roomNumber: roomNumber.trim(),
      });

      if (existingRoom) {
        errors.push({
          index: i,
          roomNumber: roomNumber || "N/A",
          error: "Room with this number already exists in this floor",
        });
        continue;
      }

      try {
        const room = new Room({
          hostelId,
          floorId,
          roomNumber: roomNumber.trim(),
          roomType: roomType || "Double",
          capacity: Number(capacity),
          occupied: 0,
          facilities: Array.isArray(facilities) ? facilities : [],
          facilityCounts: facilityCounts && typeof facilityCounts === 'object' ? facilityCounts : {},
          description: (description || "").trim(),
          status: status || "available",
        });

        await room.save();
        await room.populate("hostelId", "name code");
        await room.populate("floorId", "name floorNumber");
        createdRooms.push(room);
      } catch (error) {
        errors.push({
          index: i,
          roomNumber: roomNumber || "N/A",
          error: error.message,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdRooms.length} room(s)${errors.length > 0 ? `, ${errors.length} failed` : ""}`,
      data: {
        created: createdRooms,
        errors: errors.length > 0 ? errors : undefined,
      },
      count: createdRooms.length,
    });
  } catch (error) {
    console.error("Error creating bulk rooms:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

