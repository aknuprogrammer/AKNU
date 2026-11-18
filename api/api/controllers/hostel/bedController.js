const Bed = require("../../models/hostel/Bed");
const Room = require("../../models/hostel/Room");
const Hostel = require("../../models/hostel/Hostel");

/**
 * @desc Get all beds
 * @route GET /api/hostel/beds
 * @access Private
 */
exports.getAllBeds = async (req, res) => {
  try {
    const { hostelId, floorId, roomId, status } = req.query;
    let query = {};

    if (hostelId) {
      query.hostelId = hostelId;
    }

    if (floorId) {
      query.floorId = floorId;
    }

    if (roomId) {
      query.roomId = roomId;
    }

    if (status) {
      query.status = status;
    }

    const beds = await Bed.find(query)
      .populate("hostelId", "name code")
      .populate("floorId", "name floorNumber")
      .populate("roomId", "roomNumber roomType")
      .sort({ floorId: 1, roomId: 1, bedNumber: 1 });

    res.status(200).json({
      success: true,
      data: beds,
      count: beds.length,
    });
  } catch (error) {
    console.error("Error fetching beds:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc Get bed by ID
 * @route GET /api/hostel/beds/:id
 * @access Private
 */
exports.getBedById = async (req, res) => {
  try {
    const { id } = req.params;

    const bed = await Bed.findById(id)
      .populate("hostelId", "name code")
      .populate("floorId", "name floorNumber")
      .populate("roomId", "roomNumber roomType capacity")
      .populate("allocatedTo", "registrationNumber firstName lastName");

    if (!bed) {
      return res.status(404).json({
        success: false,
        message: "Bed not found",
      });
    }

    res.status(200).json({
      success: true,
      data: bed,
    });
  } catch (error) {
    console.error("Error fetching bed:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc Create a new bed
 * @route POST /api/hostel/beds
 * @access Private
 */
exports.createBed = async (req, res) => {
  try {
    const {
      hostelId,
      floorId,
      roomId,
      bedNumber,
      bedType,
      facilities,
      condition,
      remarks,
      status,
    } = req.body;

    // Validate required fields
    if (!hostelId || !floorId || !roomId || !bedNumber) {
      return res.status(400).json({
        success: false,
        message: "Hostel ID, Floor ID, Room ID, and bed number are required",
      });
    }

    // Validate references exist
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(400).json({
        success: false,
        message: "Hostel not found",
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(400).json({
        success: false,
        message: "Room not found",
      });
    }

    // Get floorId from room
    const roomFloorId = typeof room.floorId === 'object' ? room.floorId._id : room.floorId;
    if (!roomFloorId) {
      return res.status(400).json({
        success: false,
        message: "Room must have a floor assigned",
      });
    }

    // Validate floorId matches if provided
    if (floorId && roomFloorId.toString() !== floorId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Floor ID does not match the room's floor",
      });
    }

    // Check if bed with same number already exists in this room
    const existingBed = await Bed.findOne({
      roomId,
      bedNumber: bedNumber.trim(),
    });

    if (existingBed) {
      return res.status(400).json({
        success: false,
        message: "Bed with this number already exists in this room",
      });
    }

    const bed = new Bed({
      hostelId,
      floorId: roomFloorId,
      roomId,
      bedNumber: bedNumber.trim(),
      bedType: bedType || "Single",
      facilities: Array.isArray(facilities) ? facilities : [],
      condition: condition || "Good",
      remarks: (remarks || "").trim(),
      status: status || "available",
    });

    await bed.save();
    await bed.populate("hostelId", "name code");
    await bed.populate("floorId", "name floorNumber");
    await bed.populate("roomId", "roomNumber roomType");

    // Update room occupied count if bed is occupied
    if (bed.status === "occupied") {
      await Room.findByIdAndUpdate(roomId, {
        $inc: { occupied: 1 },
      });
    }

    res.status(201).json({
      success: true,
      message: "Bed created successfully",
      data: bed,
    });
  } catch (error) {
    console.error("Error creating bed:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Bed with this number already exists",
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
 * @desc Update a bed
 * @route PUT /api/hostel/beds/:id
 * @access Private
 */
exports.updateBed = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const oldBed = await Bed.findById(id);
    if (!oldBed) {
      return res.status(404).json({
        success: false,
        message: "Bed not found",
      });
    }

    // If bedNumber is being updated, check for duplicates
    if (updateData.bedNumber) {
      const existingBed = await Bed.findOne({
        roomId: oldBed.roomId,
        bedNumber: updateData.bedNumber.trim(),
        _id: { $ne: id },
      });

      if (existingBed) {
        return res.status(400).json({
          success: false,
          message: "Bed with this number already exists in this room",
        });
      }
      updateData.bedNumber = updateData.bedNumber.trim();
    }

    const bed = await Bed.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("hostelId", "name code")
      .populate("floorId", "name floorNumber")
      .populate("roomId", "roomNumber roomType");

    // Update room occupied count if status changed
    if (updateData.status && updateData.status !== oldBed.status) {
      const room = await Room.findById(oldBed.roomId);
      if (room) {
        let occupiedChange = 0;
        if (oldBed.status === "occupied" && updateData.status !== "occupied") {
          occupiedChange = -1;
        } else if (oldBed.status !== "occupied" && updateData.status === "occupied") {
          occupiedChange = 1;
        }

        if (occupiedChange !== 0) {
          await Room.findByIdAndUpdate(oldBed.roomId, {
            $inc: { occupied: occupiedChange },
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Bed updated successfully",
      data: bed,
    });
  } catch (error) {
    console.error("Error updating bed:", error);
    res.status(400).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

/**
 * @desc Delete a bed
 * @route DELETE /api/hostel/beds/:id
 * @access Private
 */
exports.deleteBed = async (req, res) => {
  try {
    const { id } = req.params;

    const bed = await Bed.findById(id);
    if (!bed) {
      return res.status(404).json({
        success: false,
        message: "Bed not found",
      });
    }

    // Update room occupied count if bed was occupied
    if (bed.status === "occupied") {
      await Room.findByIdAndUpdate(bed.roomId, {
        $inc: { occupied: -1 },
      });
    }

    await Bed.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Bed deleted successfully",
      data: bed,
    });
  } catch (error) {
    console.error("Error deleting bed:", error);
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};

