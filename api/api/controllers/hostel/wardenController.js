const Warden = require("../../models/hostel/Warden");

/**
 * @desc Get all wardens
 * @route GET /api/hostel/wardens
 * @access Private (Admin, Super Admin)
 */
exports.getAllWardens = async (req, res) => {
  try {
    const { status, designation, hostelId, search } = req.query;
    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by designation
    if (designation) {
      query.designation = designation;
    }

    // Filter by hostel
    if (hostelId) {
      query.hostelId = hostelId;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { wardenId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { hostelName: { $regex: search, $options: "i" } },
      ];
    }

    const wardens = await Warden.find(query)
      .populate("hostelId", "name code")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: wardens,
      count: wardens.length,
    });
  } catch (error) {
    console.error("Error fetching wardens:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc Get warden by ID
 * @route GET /api/hostel/wardens/:id
 * @access Private (Admin, Super Admin)
 */
exports.getWardenById = async (req, res) => {
  try {
    const { id } = req.params;
    const warden = await Warden.findById(id).populate("hostelId", "name code");

    if (!warden) {
      return res.status(404).json({
        success: false,
        message: "Warden not found",
      });
    }

    res.status(200).json({
      success: true,
      data: warden,
    });
  } catch (error) {
    console.error("Error fetching warden:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc Get warden by hostel ID
 * @route GET /api/hostel/wardens/hostel/:hostelId
 * @access Private (Admin, Super Admin)
 */
exports.getWardenByHostelId = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const warden = await Warden.findOne({ hostelId, status: "active" }).populate(
      "hostelId",
      "name code"
    );

    if (!warden) {
      return res.status(404).json({
        success: false,
        message: "No active warden found for this hostel",
      });
    }

    res.status(200).json({
      success: true,
      data: warden,
    });
  } catch (error) {
    console.error("Error fetching warden by hostel:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc Create a new warden
 * @route POST /api/hostel/wardens
 * @access Private (Super Admin)
 */
exports.createWarden = async (req, res) => {
  try {
    const {
      wardenId,
      name,
      designation,
      hostelId,
      hostelName,
      email,
      phone,
      alternatePhone,
      address,
      qualification,
      experience,
      joiningDate,
      status,
      responsibilities,
    } = req.body;

    // Validate required fields
    if (!wardenId || !name || !designation || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Warden ID, name, designation, email, and phone are required",
      });
    }

    // Check if warden with same ID already exists
    const existingWarden = await Warden.findOne({
      $or: [
        { wardenId: wardenId.toUpperCase() },
        { email: email.toLowerCase() },
      ],
    });

    if (existingWarden) {
      return res.status(400).json({
        success: false,
        message: existingWarden.wardenId === wardenId.toUpperCase()
          ? "Warden with this ID already exists"
          : "Warden with this email already exists",
      });
    }

    // If hostelId is provided, check if hostel already has an active warden
    if (hostelId) {
      const existingHostelWarden = await Warden.findOne({
        hostelId,
        status: "active",
        designation: "Chief Warden",
      });

      if (existingHostelWarden && designation === "Chief Warden") {
        return res.status(400).json({
          success: false,
          message: "This hostel already has an active Chief Warden",
        });
      }
    }

    const warden = new Warden({
      wardenId: wardenId.toUpperCase(),
      name,
      designation,
      hostelId: hostelId || undefined, // Optional - can be assigned later from hostel side
      hostelName: hostelName || "",
      email: email.toLowerCase(),
      phone,
      alternatePhone: alternatePhone || "",
      address: address || "",
      qualification: qualification || "",
      experience: experience || "",
      joiningDate: joiningDate || new Date(),
      status: status || "active",
      responsibilities: responsibilities || [],
    });

    await warden.save();

    // Populate hostel info before sending response
    await warden.populate("hostelId", "name code");

    res.status(201).json({
      success: true,
      message: "Warden created successfully",
      data: warden,
    });
  } catch (error) {
    console.error("Error creating warden:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Warden with this ${field} already exists`,
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
 * @desc Update a warden
 * @route PUT /api/hostel/wardens/:id
 * @access Private (Super Admin)
 */
exports.updateWarden = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If wardenId is being updated, check for duplicates
    if (updateData.wardenId) {
      const existingWarden = await Warden.findOne({
        wardenId: updateData.wardenId.toUpperCase(),
        _id: { $ne: id },
      });

      if (existingWarden) {
        return res.status(400).json({
          success: false,
          message: "Warden with this ID already exists",
        });
      }
      updateData.wardenId = updateData.wardenId.toUpperCase();
    }

    // If email is being updated, check for duplicates
    if (updateData.email) {
      const existingWarden = await Warden.findOne({
        email: updateData.email.toLowerCase(),
        _id: { $ne: id },
      });

      if (existingWarden) {
        return res.status(400).json({
          success: false,
          message: "Warden with this email already exists",
        });
      }
      updateData.email = updateData.email.toLowerCase();
    }

    // If hostelId is being updated and designation is Chief Warden, check for conflicts
    if (updateData.hostelId && updateData.designation === "Chief Warden") {
      const existingHostelWarden = await Warden.findOne({
        hostelId: updateData.hostelId,
        status: "active",
        designation: "Chief Warden",
        _id: { $ne: id },
      });

      if (existingHostelWarden) {
        return res.status(400).json({
          success: false,
          message: "This hostel already has an active Chief Warden",
        });
      }
    }

    const warden = await Warden.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("hostelId", "name code");

    if (!warden) {
      return res.status(404).json({
        success: false,
        message: "Warden not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Warden updated successfully",
      data: warden,
    });
  } catch (error) {
    console.error("Error updating warden:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Warden with this ${field} already exists`,
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
 * @desc Delete a warden
 * @route DELETE /api/hostel/wardens/:id
 * @access Private (Super Admin)
 */
exports.deleteWarden = async (req, res) => {
  try {
    const { id } = req.params;
    const warden = await Warden.findByIdAndDelete(id);

    if (!warden) {
      return res.status(404).json({
        success: false,
        message: "Warden not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Warden deleted successfully",
      data: warden,
    });
  } catch (error) {
    console.error("Error deleting warden:", error);
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};

/**
 * @desc Get wardens by designation
 * @route GET /api/hostel/wardens/designation/:designation
 * @access Private (Admin, Super Admin)
 */
exports.getWardensByDesignation = async (req, res) => {
  try {
    const { designation } = req.params;
    const { status } = req.query;

    let query = { designation };
    if (status) {
      query.status = status;
    }

    const wardens = await Warden.find(query)
      .populate("hostelId", "name code")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: wardens,
      count: wardens.length,
    });
  } catch (error) {
    console.error("Error fetching wardens by designation:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

