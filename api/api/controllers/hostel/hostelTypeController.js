const HostelType = require("../../models/hostel/HostelType");

/**
 * @desc Get all hostel types
 * @route GET /api/hostel/types
 * @access Private (Admin, Super Admin)
 */
exports.getAllHostelTypes = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const hostelTypes = await HostelType.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: hostelTypes,
      count: hostelTypes.length,
    });
  } catch (error) {
    console.error("Error fetching hostel types:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc Get hostel type by ID
 * @route GET /api/hostel/types/:id
 * @access Private (Admin, Super Admin)
 */
exports.getHostelTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const hostelType = await HostelType.findById(id);

    if (!hostelType) {
      return res.status(404).json({
        success: false,
        message: "Hostel type not found",
      });
    }

    res.status(200).json({
      success: true,
      data: hostelType,
    });
  } catch (error) {
    console.error("Error fetching hostel type:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc Create a new hostel type
 * @route POST /api/hostel/types
 * @access Private (Super Admin)
 */
exports.createHostelType = async (req, res) => {
  try {
    const { name, code, description, status } = req.body;

    // Validate required fields
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Name and code are required",
      });
    }

    // Check if hostel type with same code already exists
    const existingType = await HostelType.findOne({
      $or: [
        { code: code.toUpperCase() },
        { name: { $regex: new RegExp(`^${name}$`, "i") } },
      ],
    });

    if (existingType) {
      return res.status(400).json({
        success: false,
        message:
          existingType.code === code.toUpperCase()
            ? "Hostel type with this code already exists"
            : "Hostel type with this name already exists",
      });
    }

    const hostelType = new HostelType({
      name,
      code: code.toUpperCase(),
      description: description || "",
      status: status || "active",
    });

    await hostelType.save();

    res.status(201).json({
      success: true,
      message: "Hostel type created successfully",
      data: hostelType,
    });
  } catch (error) {
    console.error("Error creating hostel type:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Hostel type with this ${field} already exists`,
        error: error.message,
      });
    }

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
 * @desc Update a hostel type
 * @route PUT /api/hostel/types/:id
 * @access Private (Super Admin)
 */
exports.updateHostelType = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If code is being updated, check for duplicates
    if (updateData.code) {
      const existingType = await HostelType.findOne({
        code: updateData.code.toUpperCase(),
        _id: { $ne: id },
      });

      if (existingType) {
        return res.status(400).json({
          success: false,
          message: "Hostel type with this code already exists",
        });
      }
      updateData.code = updateData.code.toUpperCase();
    }

    // If name is being updated, check for duplicates
    if (updateData.name) {
      const existingType = await HostelType.findOne({
        name: { $regex: new RegExp(`^${updateData.name}$`, "i") },
        _id: { $ne: id },
      });

      if (existingType) {
        return res.status(400).json({
          success: false,
          message: "Hostel type with this name already exists",
        });
      }
    }

    const hostelType = await HostelType.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!hostelType) {
      return res.status(404).json({
        success: false,
        message: "Hostel type not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Hostel type updated successfully",
      data: hostelType,
    });
  } catch (error) {
    console.error("Error updating hostel type:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Hostel type with this ${field} already exists`,
        error: error.message,
      });
    }

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
 * @desc Delete a hostel type
 * @route DELETE /api/hostel/types/:id
 * @access Private (Super Admin)
 */
exports.deleteHostelType = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if any hostel is using this type
    const Hostel = require("../../models/hostel/Hostel");
    const hostelsUsingType = await Hostel.countDocuments({ hostelTypeId: id });
    
    if (hostelsUsingType > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete hostel type. ${hostelsUsingType} hostel(s) are using this type.`,
      });
    }

    const hostelType = await HostelType.findByIdAndDelete(id);

    if (!hostelType) {
      return res.status(404).json({
        success: false,
        message: "Hostel type not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Hostel type deleted successfully",
      data: hostelType,
    });
  } catch (error) {
    console.error("Error deleting hostel type:", error);
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};

