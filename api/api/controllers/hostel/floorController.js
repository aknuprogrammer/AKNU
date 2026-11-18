const Floor = require("../../models/hostel/Floor");
const Room = require("../../models/hostel/Room");
const Bed = require("../../models/hostel/Bed");
const HostelEquipment = require("../../models/hostel/HostelEquipment");
const Hostel = require("../../models/hostel/Hostel");

/**
 * @desc Get all floors
 * @route GET /api/hostel/floors
 * @access Private
 */
exports.getAllFloors = async (req, res) => {
  try {
    const { hostelId, status } = req.query;
    let query = {};

    if (hostelId) {
      query.hostelId = hostelId;
    }

    if (status) {
      query.status = status;
    }

    const floors = await Floor.find(query)
      .populate("hostelId", "name code")
      .sort({ floorNumber: 1 });

    res.status(200).json({
      success: true,
      count: floors.length,
      data: floors,
    });
  } catch (error) {
    console.error("Error fetching floors:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching floors",
      error: error.message,
    });
  }
};

/**
 * @desc Get floor by ID
 * @route GET /api/hostel/floors/:id
 * @access Private
 */
exports.getFloorById = async (req, res) => {
  try {
    const floor = await Floor.findById(req.params.id).populate(
      "hostelId",
      "name code"
    );

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found",
      });
    }

    res.status(200).json({
      success: true,
      data: floor,
    });
  } catch (error) {
    console.error("Error fetching floor:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching floor",
      error: error.message,
    });
  }
};

/**
 * @desc Create a new floor
 * @route POST /api/hostel/floors
 * @access Private
 */
exports.createFloor = async (req, res) => {
  try {
    const { hostelId, floorNumber, name, facilities, description, status } =
      req.body;

    if (!hostelId || floorNumber === undefined) {
      return res.status(400).json({
        success: false,
        message: "Hostel ID and floor number are required",
      });
    }

    // Check if floor with same number already exists for this hostel
    const existingFloor = await Floor.findOne({
      hostelId,
      floorNumber: Number(floorNumber),
    });

    if (existingFloor) {
      return res.status(400).json({
        success: false,
        message: "Floor with this number already exists for this hostel",
      });
    }

    const floor = new Floor({
      hostelId,
      floorNumber: Number(floorNumber),
      name: name || undefined, // Will be auto-generated if not provided
      facilities: Array.isArray(facilities) ? facilities : [],
      description: description || "",
      status: status || "active",
    });

    await floor.save();
    await floor.populate("hostelId", "name code");

    res.status(201).json({
      success: true,
      message: "Floor created successfully",
      data: floor,
    });
  } catch (error) {
    console.error("Error creating floor:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Floor with this number already exists for this hostel",
        error: error.message,
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: messages,
      });
    }

    res.status(400).json({
      success: false,
      message: "Error creating floor",
      error: error.message,
    });
  }
};

/**
 * @desc Update a floor
 * @route PUT /api/hostel/floors/:id
 * @access Private
 */
exports.updateFloor = async (req, res) => {
  try {
    const { name, facilities, description, status } = req.body;

    const floor = await Floor.findByIdAndUpdate(
      req.params.id,
      {
        ...(name !== undefined && { name }),
        ...(facilities !== undefined && { facilities }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
      },
      { new: true, runValidators: true }
    ).populate("hostelId", "name code");

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Floor updated successfully",
      data: floor,
    });
  } catch (error) {
    console.error("Error updating floor:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: messages,
      });
    }

    res.status(400).json({
      success: false,
      message: "Error updating floor",
      error: error.message,
    });
  }
};

/**
 * @desc Create rooms for floors based on room counts
 * @route POST /api/hostel/floors/create-rooms
 * @access Private
 */
exports.createRoomsForFloors = async (req, res) => {
  try {
    const { hostelId, floorRoomCounts } = req.body;

    if (!hostelId) {
      return res.status(400).json({
        success: false,
        message: "Hostel ID is required",
      });
    }

    if (!floorRoomCounts || typeof floorRoomCounts !== 'object') {
      return res.status(400).json({
        success: false,
        message: "Floor room counts are required",
      });
    }

    // Validate hostel exists
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(400).json({
        success: false,
        message: "Hostel not found",
      });
    }

    // Get all floors for this hostel
    const floors = await Floor.find({ hostelId }).sort({ floorNumber: 1 });

    if (floors.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No floors found for this hostel",
      });
    }

    const roomsCreated = [];
    const errors = [];

    // Process each floor
    for (const floor of floors) {
      const targetRoomCount = floorRoomCounts[floor._id.toString()];
      
      if (targetRoomCount === undefined || targetRoomCount === null) {
        continue; // Skip floors not in the request
      }

      // Get current room count for this floor
      const currentRoomCount = await Room.countDocuments({ floorId: floor._id });
      const roomsToCreate = Number(targetRoomCount) - currentRoomCount;

      if (roomsToCreate > 0) {
        // Create rooms for this floor
        const newRooms = [];
        for (let i = 1; i <= roomsToCreate; i++) {
          const roomNumber = `${floor.floorNumber}-${String(currentRoomCount + i).padStart(3, '0')}`;
          
          // Check if room number already exists
          const existingRoom = await Room.findOne({
            hostelId,
            floorId: floor._id,
            roomNumber,
          });

          if (!existingRoom) {
            newRooms.push({
              hostelId,
              floorId: floor._id,
              roomNumber,
              roomType: "Double",
              capacity: 2,
              occupied: 0,
              available: 2,
              status: "available",
            });
          }
        }

        if (newRooms.length > 0) {
          try {
            const createdRooms = await Room.insertMany(newRooms);
            roomsCreated.push({
              floorId: floor._id,
              floorName: floor.name || `Floor ${floor.floorNumber}`,
              floorNumber: floor.floorNumber,
              roomsCreated: createdRooms.length,
              roomNumbers: createdRooms.map(r => r.roomNumber),
            });

            // Update floor's totalRooms count
            await Floor.findByIdAndUpdate(floor._id, {
              $inc: { totalRooms: createdRooms.length },
            });
          } catch (err) {
            errors.push({
              floorId: floor._id,
              floorName: floor.name || `Floor ${floor.floorNumber}`,
              error: err.message,
            });
          }
        }
      } else if (roomsToCreate < 0) {
        // User wants fewer rooms than current - we won't delete, just inform
        errors.push({
          floorId: floor._id,
          floorName: floor.name || `Floor ${floor.floorNumber}`,
          error: `Cannot reduce rooms. Current: ${currentRoomCount}, Requested: ${targetRoomCount}. Please delete rooms manually if needed.`,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully created ${roomsCreated.reduce((sum, f) => sum + f.roomsCreated, 0)} rooms across ${roomsCreated.length} floor(s)`,
      data: {
        roomsCreated,
        errors: errors.length > 0 ? errors : undefined,
        totalRoomsCreated: roomsCreated.reduce((sum, f) => sum + f.roomsCreated, 0),
      },
    });
  } catch (error) {
    console.error("Error creating rooms for floors:", error);
    res.status(500).json({
      success: false,
      message: "Error creating rooms for floors",
      error: error.message,
    });
  }
};

/**
 * @desc Delete a floor
 * @route DELETE /api/hostel/floors/:id
 * @access Private
 */
exports.deleteFloor = async (req, res) => {
  try {
    const floor = await Floor.findById(req.params.id);

    if (!floor) {
      return res.status(404).json({
        success: false,
        message: "Floor not found",
      });
    }

    // Check if floor has rooms
    const roomCount = await Room.countDocuments({ floorId: floor._id });
    if (roomCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete floor. It has ${roomCount} room(s) associated with it.`,
      });
    }

    // Check if floor has beds
    const bedCount = await Bed.countDocuments({ floorId: floor._id });
    if (bedCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete floor. It has ${bedCount} bed(s) associated with it.`,
      });
    }

    // Check if floor has equipment
    const equipmentCount = await HostelEquipment.countDocuments({
      floorId: floor._id,
    });
    if (equipmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete floor. It has ${equipmentCount} equipment item(s) associated with it.`,
      });
    }

    await Floor.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Floor deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting floor:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting floor",
      error: error.message,
    });
  }
};

