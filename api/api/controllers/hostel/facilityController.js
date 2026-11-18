const Facility = require("../../models/hostel/Facility");

// @desc Get all facilities
// @route GET /api/hostel/facilities
exports.getFacilities = async (req, res) => {
  try {
    const { status, category, type, search } = req.query;
    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    } else {
      // Default to active only
      query.status = "active";
    }

    // Filter by category
    if (category) {
      query.category = { $in: [category, "both"] };
    }

    // Filter by type
    if (type) {
      query.type = { $in: [type, "both"] };
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const facilities = await Facility.find(query)
      .sort({ order: 1, name: 1 })
      .select("-__v");

    res.status(200).json({
      success: true,
      data: facilities,
      count: facilities.length,
    });
  } catch (error) {
    console.error("Error fetching facilities:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get facility by ID
// @route GET /api/hostel/facilities/:id
exports.getFacilityById = async (req, res) => {
  try {
    const { id } = req.params;
    const facility = await Facility.findById(id).select("-__v");

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found",
      });
    }

    res.status(200).json({
      success: true,
      data: facility,
    });
  } catch (error) {
    console.error("Error fetching facility:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Create a new facility
// @route POST /api/hostel/facilities
exports.createFacility = async (req, res) => {
  try {
    const { name, code, type, description, icon, category, status, order } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Facility name is required",
      });
    }

    // Check if facility with same name already exists
    const existingFacility = await Facility.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingFacility) {
      return res.status(400).json({
        success: false,
        message: "Facility with this name already exists",
      });
    }

    const facility = await Facility.create({
      name: name.trim(),
      code: code ? code.trim().toUpperCase() : undefined,
      type: type || "checkbox",
      description: description ? description.trim() : undefined,
      icon: icon ? icon.trim() : undefined,
      category: category || "both",
      status: status || "active",
      order: order || 0,
    });

    res.status(201).json({
      success: true,
      message: "Facility created successfully",
      data: facility,
    });
  } catch (error) {
    console.error("Error creating facility:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Update a facility
// @route PUT /api/hostel/facilities/:id
exports.updateFacility = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, type, description, icon, category, status, order } = req.body;

    const facility = await Facility.findById(id);

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found",
      });
    }

    // Check if name is being changed and if new name already exists
    if (name && name.toLowerCase() !== facility.name.toLowerCase()) {
      const existingFacility = await Facility.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id },
      });

      if (existingFacility) {
        return res.status(400).json({
          success: false,
          message: "Facility with this name already exists",
        });
      }
    }

    // Update fields
    if (name !== undefined) facility.name = name.trim();
    if (code !== undefined) facility.code = code ? code.trim().toUpperCase() : null;
    if (type !== undefined) facility.type = type;
    if (description !== undefined) facility.description = description ? description.trim() : null;
    if (icon !== undefined) facility.icon = icon ? icon.trim() : null;
    if (category !== undefined) facility.category = category;
    if (status !== undefined) facility.status = status;
    if (order !== undefined) facility.order = order;

    await facility.save();

    res.status(200).json({
      success: true,
      message: "Facility updated successfully",
      data: facility,
    });
  } catch (error) {
    console.error("Error updating facility:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Delete a facility
// @route DELETE /api/hostel/facilities/:id
exports.deleteFacility = async (req, res) => {
  try {
    const { id } = req.params;

    const facility = await Facility.findById(id);

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found",
      });
    }

    await Facility.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Facility deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting facility:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Bulk create facilities (for seeding default data)
// @route POST /api/hostel/facilities/bulk
exports.bulkCreateFacilities = async (req, res) => {
  try {
    const { facilities } = req.body;

    if (!Array.isArray(facilities) || facilities.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Facilities array is required",
      });
    }

    const createdFacilities = [];
    const errors = [];

    for (const facilityData of facilities) {
      try {
        const existingFacility = await Facility.findOne({
          name: { $regex: new RegExp(`^${facilityData.name}$`, "i") },
        });

        if (existingFacility) {
          errors.push({
            name: facilityData.name,
            error: "Facility already exists",
          });
          continue;
        }

        const facility = await Facility.create({
          name: facilityData.name.trim(),
          code: facilityData.code ? facilityData.code.trim().toUpperCase() : undefined,
          type: facilityData.type || "checkbox",
          description: facilityData.description ? facilityData.description.trim() : undefined,
          icon: facilityData.icon ? facilityData.icon.trim() : undefined,
          category: facilityData.category || "both",
          status: facilityData.status || "active",
          order: facilityData.order || 0,
        });

        createdFacilities.push(facility);
      } catch (error) {
        errors.push({
          name: facilityData.name,
          error: error.message,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Created ${createdFacilities.length} facility(ies)`,
      data: {
        created: createdFacilities,
        errors: errors,
      },
    });
  } catch (error) {
    console.error("Error bulk creating facilities:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

