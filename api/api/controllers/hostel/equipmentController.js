const HostelEquipment = require("../../models/hostel/HostelEquipment");
const Hostel = require("../../models/hostel/Hostel");
const Room = require("../../models/hostel/Room");

/**
 * @desc Get all equipment
 * @route GET /api/hostel/equipment
 * @access Private
 */
exports.getAllEquipment = async (req, res) => {
  try {
    const { hostelId, floorId, roomId, category, status } = req.query;
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

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    const equipment = await HostelEquipment.find(query)
      .populate("hostelId", "name code")
      .populate("floorId", "name floorNumber")
      .populate("roomId", "roomNumber roomType")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: equipment,
      count: equipment.length,
    });
  } catch (error) {
    console.error("Error fetching equipment:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc Get equipment by ID
 * @route GET /api/hostel/equipment/:id
 * @access Private
 */
exports.getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await HostelEquipment.findById(id)
      .populate("hostelId", "name code")
      .populate("floorId", "name floorNumber")
      .populate("roomId", "roomNumber roomType");

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    console.error("Error fetching equipment:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc Create new equipment
 * @route POST /api/hostel/equipment
 * @access Private
 */
exports.createEquipment = async (req, res) => {
  try {
    const {
      hostelId,
      floorId,
      roomId,
      itemName,
      category,
      quantity,
      unit,
      brand,
      model,
      serialNumber,
      purchaseDate,
      purchasePrice,
      supplier,
      warrantyExpiry,
      condition,
      status,
      location,
      description,
    } = req.body;

    // Validate required fields
    if (!hostelId || !itemName || !category || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Hostel ID, item name, category, and quantity are required",
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

    let finalFloorId = floorId || null;

    // Validate room if provided and get floorId from room
    if (roomId) {
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(400).json({
          success: false,
          message: "Room not found",
        });
      }
      // Get floorId from room
      finalFloorId = typeof room.floorId === 'object' ? room.floorId._id : room.floorId;
    }

    const equipment = new HostelEquipment({
      hostelId,
      floorId: finalFloorId,
      roomId: roomId || null,
      itemName: itemName.trim(),
      category,
      quantity: Number(quantity),
      unit: unit || "piece",
      brand: brand ? brand.trim() : "",
      model: model ? model.trim() : "",
      serialNumber: serialNumber ? serialNumber.trim() : "",
      purchaseDate: purchaseDate || Date.now(),
      purchasePrice: purchasePrice ? Number(purchasePrice) : 0,
      supplier: supplier ? supplier.trim() : "",
      warrantyExpiry: warrantyExpiry || null,
      condition: condition || "Good",
      status: status || "available",
      location: location ? location.trim() : "",
      description: description ? description.trim() : "",
    });

    await equipment.save();
    await equipment.populate("hostelId", "name code");
    if (equipment.floorId) {
      await equipment.populate("floorId", "name floorNumber");
    }
    if (equipment.roomId) {
      await equipment.populate("roomId", "roomNumber roomType");
    }

    res.status(201).json({
      success: true,
      message: "Equipment created successfully",
      data: equipment,
    });
  } catch (error) {
    console.error("Error creating equipment:", error);
    res.status(400).json({
      success: false,
      message: "Invalid Data",
      error: error.message,
    });
  }
};

/**
 * @desc Update equipment
 * @route PUT /api/hostel/equipment/:id
 * @access Private
 */
exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate references if being updated
    if (updateData.roomId) {
      const room = await Room.findById(updateData.roomId);
      if (!room) {
        return res.status(400).json({
          success: false,
          message: "Room not found",
        });
      }
      // Update floorId from room if roomId is being updated
      const roomFloorId = typeof room.floorId === 'object' ? room.floorId._id : room.floorId;
      if (roomFloorId) {
        updateData.floorId = roomFloorId;
      }
    }

    const equipment = await HostelEquipment.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("hostelId", "name code")
      .populate("floorId", "name floorNumber")
      .populate("roomId", "roomNumber roomType");

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Equipment updated successfully",
      data: equipment,
    });
  } catch (error) {
    console.error("Error updating equipment:", error);
    res.status(400).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

/**
 * @desc Delete equipment
 * @route DELETE /api/hostel/equipment/:id
 * @access Private
 */
exports.deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await HostelEquipment.findByIdAndDelete(id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Equipment deleted successfully",
      data: equipment,
    });
  } catch (error) {
    console.error("Error deleting equipment:", error);
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};

