const LibraryRules = require("../../models/library/LibraryRules");

// @desc Get active library rules
// @route GET /api/library/rules
// @route GET /api/library/rules/active
exports.getActiveRules = async (req, res) => {
  try {
    const { library } = req.query;
    
    if (!library) {
      return res.status(400).json({
        message: "Library ID is required",
      });
    }

    const activeRules = await LibraryRules.findOne({ 
      library: library,
      status: "active" 
    }).populate("library", "name libraryCode");

    if (!activeRules) {
      // Return default rules if no active rules exist for this library
      return res.json({
        library: library,
        issueDuration: {
          student: 14,
          faculty: 30,
        },
        finePerDay: {
          student: 5,
          faculty: 2,
        },
        maxRenewals: {
          student: 2,
          faculty: 3,
        },
        maxBooksLimit: {
          student: 3,
          faculty: 5,
        },
        lostBookCharge: {
          percentage: 150,
          fixedAmount: 500,
          usePercentage: true,
        },
        damagedBookCharge: {
          percentage: 50,
          fixedAmount: 200,
          usePercentage: true,
        },
        gracePeriod: 3,
        fineCap: 500,
        status: "active",
        isDefault: true,
      });
    }

    res.json(activeRules);
  } catch (error) {
    console.error("Error fetching active library rules:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get all library rules (for history)
// @route GET /api/library/rules/all
exports.getAllRules = async (req, res) => {
  try {
    const { status, library } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (library) {
      query.library = library;
    }

    const rules = await LibraryRules.find(query)
      .populate("library", "name libraryCode")
      .sort({ createdAt: -1 });

    res.json(rules);
  } catch (error) {
    console.error("Error fetching library rules:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get library rules by ID
// @route GET /api/library/rules/:id
exports.getRulesById = async (req, res) => {
  try {
    const { id } = req.params;
    const rules = await LibraryRules.findById(id)
      .populate("library", "name libraryCode");

    if (!rules) {
      return res.status(404).json({ message: "Library rules not found" });
    }

    res.json(rules);
  } catch (error) {
    console.error("Error fetching library rules:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Create or update active library rules
// @route POST /api/library/rules
// @route PUT /api/library/rules
exports.createOrUpdateRules = async (req, res) => {
  try {
    const {
      library,
      issueDuration,
      finePerDay,
      maxRenewals,
      maxBooksLimit,
      lostBookCharge,
      damagedBookCharge,
      gracePeriod,
      fineCap,
      description,
    } = req.body;

    // Validate required fields
    if (!library) {
      return res.status(400).json({
        message: "Library ID is required",
      });
    }

    if (
      !issueDuration ||
      !finePerDay ||
      !maxRenewals ||
      !maxBooksLimit ||
      !lostBookCharge ||
      !damagedBookCharge ||
      gracePeriod === undefined ||
      fineCap === undefined
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // Validate nested objects
    if (
      !issueDuration.student ||
      !issueDuration.faculty ||
      !finePerDay.student ||
      !finePerDay.faculty ||
      maxRenewals.student === undefined ||
      maxRenewals.faculty === undefined ||
      !maxBooksLimit.student ||
      !maxBooksLimit.faculty
    ) {
      return res.status(400).json({
        message: "All user type limits must be provided (student and faculty)",
      });
    }

    // Check if active rules exist for this library
    const existingActiveRules = await LibraryRules.findOne({ 
      library: library,
      status: "active" 
    });

    if (existingActiveRules) {
      // Update existing active rules
      existingActiveRules.issueDuration = issueDuration;
      existingActiveRules.finePerDay = finePerDay;
      existingActiveRules.maxRenewals = maxRenewals;
      existingActiveRules.maxBooksLimit = maxBooksLimit;
      existingActiveRules.lostBookCharge = lostBookCharge;
      existingActiveRules.damagedBookCharge = damagedBookCharge;
      existingActiveRules.gracePeriod = gracePeriod;
      existingActiveRules.fineCap = fineCap;
      if (description) {
        existingActiveRules.description = description;
      }

      const updatedRules = await existingActiveRules.save();

      return res.status(200).json({
        message: "Library rules updated successfully",
        data: updatedRules,
      });
    } else {
      // Create new active rules
      const newRules = new LibraryRules({
        library,
        issueDuration,
        finePerDay,
        maxRenewals,
        maxBooksLimit,
        lostBookCharge,
        damagedBookCharge,
        gracePeriod,
        fineCap,
        description,
        status: "active",
      });

      const savedRules = await newRules.save();

      return res.status(201).json({
        message: "Library rules created successfully",
        data: savedRules,
      });
    }
  } catch (error) {
    console.error("Error creating/updating library rules:", error);
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({
        message: "Validation Error",
        errors,
      });
    }

    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Create new library rules (for history)
// @route POST /api/library/rules/new
exports.createNewRules = async (req, res) => {
  try {
    const {
      library,
      issueDuration,
      finePerDay,
      maxRenewals,
      maxBooksLimit,
      lostBookCharge,
      damagedBookCharge,
      gracePeriod,
      fineCap,
      description,
      status = "inactive",
    } = req.body;

    // Validate required fields
    if (!library) {
      return res.status(400).json({
        message: "Library ID is required",
      });
    }

    if (
      !issueDuration ||
      !finePerDay ||
      !maxRenewals ||
      !maxBooksLimit ||
      !lostBookCharge ||
      !damagedBookCharge ||
      gracePeriod === undefined ||
      fineCap === undefined
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    const newRules = new LibraryRules({
      library,
      issueDuration,
      finePerDay,
      maxRenewals,
      maxBooksLimit,
      lostBookCharge,
      damagedBookCharge,
      gracePeriod,
      fineCap,
      description,
      status,
    });

    // If setting as active, deactivate others for this library
    if (status === "active") {
      await LibraryRules.updateMany(
        { library: library, _id: { $ne: newRules._id }, status: "active" },
        { status: "inactive" }
      );
    }

    const savedRules = await newRules.save();

    res.status(201).json({
      message: "Library rules created successfully",
      data: savedRules,
    });
  } catch (error) {
    console.error("Error creating library rules:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({
        message: "Validation Error",
        errors,
      });
    }

    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Update library rules by ID
// @route PUT /api/library/rules/:id
exports.updateRules = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const rules = await LibraryRules.findById(id);

    if (!rules) {
      return res.status(404).json({ message: "Library rules not found" });
    }

    // If setting as active, deactivate others for this library
    if (updateData.status === "active" && rules.status !== "active") {
      await LibraryRules.updateMany(
        { library: rules.library, _id: { $ne: id }, status: "active" },
        { status: "inactive" }
      );
    }

    // Update fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        rules[key] = updateData[key];
      }
    });

    const updatedRules = await rules.save();

    res.json({
      message: "Library rules updated successfully",
      data: updatedRules,
    });
  } catch (error) {
    console.error("Error updating library rules:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({
        message: "Validation Error",
        errors,
      });
    }

    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Delete library rules by ID
// @route DELETE /api/library/rules/:id
exports.deleteRules = async (req, res) => {
  try {
    const { id } = req.params;

    const rules = await LibraryRules.findById(id);

    if (!rules) {
      return res.status(404).json({ message: "Library rules not found" });
    }

    // Prevent deletion of active rules
    if (rules.status === "active") {
      return res.status(400).json({
        message: "Cannot delete active rules. Please set them to inactive first.",
      });
    }

    await LibraryRules.findByIdAndDelete(id);

    res.json({ message: "Library rules deleted successfully" });
  } catch (error) {
    console.error("Error deleting library rules:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

