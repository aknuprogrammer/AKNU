const HostelFeeStructure = require("../../models/hostel/HostelFeeStructure");
const Hostel = require("../../models/hostel/Hostel");

/**
 * @desc Get all fee structures
 * @route GET /api/hostel/fee-structure
 * @access Private (Admin, Super Admin)
 */
exports.getAllFeeStructures = async (req, res) => {
  try {
    const { hostelId, roomType, status } = req.query;
    let query = {};

    // Filter by hostelId
    if (hostelId) {
      query.hostelId = hostelId;
    }

    // Filter by roomType
    if (roomType) {
      query.roomType = roomType;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const feeStructures = await HostelFeeStructure.find(query)
      .populate("hostelId", "name code address")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: feeStructures,
      count: feeStructures.length,
    });
  } catch (error) {
    console.error("Error fetching fee structures:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc Get fee structure by ID
 * @route GET /api/hostel/fee-structure/:id
 * @access Private (Admin, Super Admin)
 */
exports.getFeeStructureById = async (req, res) => {
  try {
    const { id } = req.params;
    const feeStructure = await HostelFeeStructure.findById(id).populate(
      "hostelId",
      "name code address"
    );

    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
    }

    res.status(200).json({
      success: true,
      data: feeStructure,
    });
  } catch (error) {
    console.error("Error fetching fee structure:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc Create a new fee structure
 * @route POST /api/hostel/fee-structure
 * @access Private (Super Admin)
 */
exports.createFeeStructure = async (req, res) => {
  try {
    const {
      hostelId,
      roomType,
      capacity,
      monthlyFee,
      annualFee,
      deposit,
      messCharges,
      maintenanceFee,
      electricityCharges,
      waterCharges,
      otherCharges,
      status,
      effectiveFrom,
      effectiveTo,
      description,
    } = req.body;

    // Validate required fields
    if (!hostelId || !roomType || !monthlyFee || !annualFee) {
      return res.status(400).json({
        success: false,
        message: "Hostel ID, room type, monthly fee, and annual fee are required",
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

    // Check if fee structure already exists for this hostel and room type
    const existingFeeStructure = await HostelFeeStructure.findOne({
      hostelId: hostelId,
      roomType: roomType,
      status: "active",
    });

    if (existingFeeStructure) {
      return res.status(400).json({
        success: false,
        message: `An active fee structure already exists for ${hostel.name} - ${roomType} room type`,
      });
    }

    // Set default capacity based on room type
    let roomCapacity = 1;
    if (roomType === "Dormitory") {
      roomCapacity = Number(capacity) || 10; // Default 10 for dormitory
    } else if (roomType === "Single") {
      roomCapacity = 1;
    } else if (roomType === "Double") {
      roomCapacity = 2;
    } else if (roomType === "Triple") {
      roomCapacity = 3;
    } else if (roomType === "Quad") {
      roomCapacity = 4;
    }

    const newFeeStructure = await HostelFeeStructure.create({
      hostelId: hostelId,
      hostelName: hostel.name,
      roomType: roomType,
      capacity: roomCapacity,
      monthlyFee: Number(monthlyFee) || 0,
      annualFee: Number(annualFee) || 0,
      deposit: Number(deposit) || 0,
      messCharges: Number(messCharges) || 0,
      maintenanceFee: Number(maintenanceFee) || 0,
      electricityCharges: Number(electricityCharges) || 0,
      waterCharges: Number(waterCharges) || 0,
      otherCharges: Number(otherCharges) || 0,
      status: status || "active",
      effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
      effectiveTo: effectiveTo ? new Date(effectiveTo) : undefined,
      description: description ? description.trim() : undefined,
    });

    await newFeeStructure.populate("hostelId", "name code address");

    res.status(201).json({
      success: true,
      message: "Fee structure created successfully",
      data: newFeeStructure,
    });
  } catch (error) {
    console.error("Error creating fee structure:", error);

    // Handle validation errors
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
      message: "Invalid Data",
      error: error.message,
    });
  }
};

/**
 * @desc Update a fee structure
 * @route PUT /api/hostel/fee-structure/:id
 * @access Private (Super Admin)
 */
exports.updateFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If hostelId is being updated, validate it exists
    if (updateData.hostelId) {
      const hostel = await Hostel.findById(updateData.hostelId);
      if (!hostel) {
        return res.status(400).json({
          success: false,
          message: "Hostel not found",
        });
      }
      updateData.hostelName = hostel.name;
    }

    // Convert date strings to Date objects
    if (updateData.effectiveFrom) {
      updateData.effectiveFrom = new Date(updateData.effectiveFrom);
    }
    if (updateData.effectiveTo) {
      updateData.effectiveTo = new Date(updateData.effectiveTo);
    }

    // Handle capacity update
    if (updateData.roomType === "Dormitory" && updateData.capacity !== undefined) {
      updateData.capacity = Number(updateData.capacity) || 10;
    } else if (updateData.roomType) {
      // Set default capacity based on room type
      if (updateData.roomType === "Single") {
        updateData.capacity = 1;
      } else if (updateData.roomType === "Double") {
        updateData.capacity = 2;
      } else if (updateData.roomType === "Triple") {
        updateData.capacity = 3;
      } else if (updateData.roomType === "Quad") {
        updateData.capacity = 4;
      }
    }

    // Convert numeric fields
    if (updateData.monthlyFee !== undefined) {
      updateData.monthlyFee = Number(updateData.monthlyFee) || 0;
    }
    if (updateData.annualFee !== undefined) {
      updateData.annualFee = Number(updateData.annualFee) || 0;
    }
    if (updateData.deposit !== undefined) {
      updateData.deposit = Number(updateData.deposit) || 0;
    }
    if (updateData.messCharges !== undefined) {
      updateData.messCharges = Number(updateData.messCharges) || 0;
    }
    if (updateData.maintenanceFee !== undefined) {
      updateData.maintenanceFee = Number(updateData.maintenanceFee) || 0;
    }
    if (updateData.electricityCharges !== undefined) {
      updateData.electricityCharges = Number(updateData.electricityCharges) || 0;
    }
    if (updateData.waterCharges !== undefined) {
      updateData.waterCharges = Number(updateData.waterCharges) || 0;
    }
    if (updateData.otherCharges !== undefined) {
      updateData.otherCharges = Number(updateData.otherCharges) || 0;
    }

    const feeStructure = await HostelFeeStructure.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate("hostelId", "name code address");

    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fee structure updated successfully",
      data: feeStructure,
    });
  } catch (error) {
    console.error("Error updating fee structure:", error);

    // Handle validation errors
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
      message: "Update failed",
      error: error.message,
    });
  }
};

/**
 * @desc Delete a fee structure
 * @route DELETE /api/hostel/fee-structure/:id
 * @access Private (Super Admin)
 */
exports.deleteFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const feeStructure = await HostelFeeStructure.findByIdAndDelete(id);

    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: "Fee structure not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Fee structure deleted successfully",
      data: feeStructure,
    });
  } catch (error) {
    console.error("Error deleting fee structure:", error);
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};

