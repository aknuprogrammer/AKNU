const Block = require("../../models/hostel/Block");
const Room = require("../../models/hostel/Room");
const Bed = require("../../models/hostel/Bed");
const Hostel = require("../../models/hostel/Hostel");

/**
 * @desc Get all blocks
 * @route GET /api/hostel/blocks
 * @access Private
 */
exports.getAllBlocks = async (req, res) => {
  try {
    const { hostelId, status } = req.query;
    let query = {};

    if (hostelId) {
      query.hostelId = hostelId;
    }

    if (status) {
      query.status = status;
    }

    const blocks = await Block.find(query)
      .populate("hostelId", "name code")
      .sort({ floorNumber: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: blocks,
      count: blocks.length,
    });
  } catch (error) {
    console.error("Error fetching blocks:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc Get block by ID with rooms and stats
 * @route GET /api/hostel/blocks/:id
 * @access Private
 */
exports.getBlockById = async (req, res) => {
  try {
    const { id } = req.params;

    const block = await Block.findById(id).populate("hostelId", "name code");

    if (!block) {
      return res.status(404).json({
        success: false,
        message: "Block not found",
      });
    }

    // Get rooms in this block
    const rooms = await Room.find({ blockId: id })
      .sort({ roomNumber: 1 });

    // Get beds in this block
    const beds = await Bed.find({ blockId: id });

    // Calculate statistics
    const stats = {
      totalRooms: rooms.length,
      totalBeds: beds.length,
      occupiedBeds: beds.filter((b) => b.status === "occupied").length,
      availableBeds: beds.filter((b) => b.status === "available").length,
      maintenanceBeds: beds.filter((b) => b.status === "maintenance").length,
      availableRooms: rooms.filter((r) => r.status === "available").length,
      occupiedRooms: rooms.filter((r) => r.status === "occupied").length,
    };

    res.status(200).json({
      success: true,
      data: {
        block,
        rooms,
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching block:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc Create a new block
 * @route POST /api/hostel/blocks
 * @access Private
 */
exports.createBlock = async (req, res) => {
  try {
    const {
      hostelId,
      name,
      code,
      floorNumber,
      totalRooms,
      totalBeds,
      facilities,
      description,
      status,
    } = req.body;

    // Validate required fields
    if (!hostelId || !name || !code) {
      return res.status(400).json({
        success: false,
        message: "Hostel ID, name, and code are required",
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

    // Check if block with same code already exists in this hostel
    const existingBlock = await Block.findOne({
      hostelId,
      code: code.toUpperCase(),
    });

    if (existingBlock) {
      return res.status(400).json({
        success: false,
        message: "Block with this code already exists in this hostel",
      });
    }

    const block = new Block({
      hostelId,
      name: name.trim(),
      code: code.toUpperCase().trim(),
      floorNumber: floorNumber || 0,
      totalRooms: totalRooms || 0,
      totalBeds: totalBeds || 0,
      facilities: Array.isArray(facilities) ? facilities : [],
      description: (description || "").trim(),
      status: status || "active",
    });

    await block.save();
    await block.populate("hostelId", "name code");

    res.status(201).json({
      success: true,
      message: "Block created successfully",
      data: block,
    });
  } catch (error) {
    console.error("Error creating block:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Block with this code already exists",
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
 * @desc Update a block
 * @route PUT /api/hostel/blocks/:id
 * @access Private
 */
exports.updateBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If code is being updated, check for duplicates
    if (updateData.code) {
      const block = await Block.findById(id);
      if (block) {
        const existingBlock = await Block.findOne({
          hostelId: block.hostelId,
          code: updateData.code.toUpperCase(),
          _id: { $ne: id },
        });

        if (existingBlock) {
          return res.status(400).json({
            success: false,
            message: "Block with this code already exists",
          });
        }
        updateData.code = updateData.code.toUpperCase();
      }
    }

    const block = await Block.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("hostelId", "name code");

    if (!block) {
      return res.status(404).json({
        success: false,
        message: "Block not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Block updated successfully",
      data: block,
    });
  } catch (error) {
    console.error("Error updating block:", error);
    res.status(400).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

/**
 * @desc Delete a block
 * @route DELETE /api/hostel/blocks/:id
 * @access Private
 */
exports.deleteBlock = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if block has rooms
    const roomsCount = await Room.countDocuments({ blockId: id });
    if (roomsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete block. It has ${roomsCount} room(s). Please delete rooms first.`,
      });
    }

    const block = await Block.findByIdAndDelete(id);

    if (!block) {
      return res.status(404).json({
        success: false,
        message: "Block not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Block deleted successfully",
      data: block,
    });
  } catch (error) {
    console.error("Error deleting block:", error);
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};

