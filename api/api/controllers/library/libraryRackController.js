const LibraryRack = require("../../models/library/LibraryRack");

// @desc Get all library racks
// @route GET /api/library/racks
exports.getLibraryRacks = async (req, res) => {
  try {
    const { library, search, status } = req.query;
    let query = {};

    // Filter by library
    if (library) {
      query.library = library;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { rackNumber: { $regex: search, $options: "i" } },
        { rackName: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { floor: { $regex: search, $options: "i" } },
        { section: { $regex: search, $options: "i" } },
      ];
    }

    const racks = await LibraryRack.find(query)
      .populate("library", "name libraryCode")
      .sort({ createdAt: -1 });

    res.json(racks);
  } catch (error) {
    console.error("Error fetching library racks:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get library rack by ID
// @route GET /api/library/racks/:id
exports.getLibraryRackById = async (req, res) => {
  try {
    const { id } = req.params;
    const rack = await LibraryRack.findById(id).populate(
      "library",
      "name libraryCode"
    );

    if (!rack) {
      return res.status(404).json({ message: "Library rack not found" });
    }

    res.json(rack);
  } catch (error) {
    console.error("Error fetching library rack:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Create library rack
// @route POST /api/library/racks
exports.createLibraryRack = async (req, res) => {
  try {
    const {
      library,
      rackNumber,
      rackName,
      location,
      floor,
      section,
      capacity,
      status,
    } = req.body;

    // Validate required fields
    if (!library || !rackNumber || !rackName || !location) {
      return res.status(400).json({
        message: "Library, rack number, rack name, and location are required",
      });
    }

    // Check if rack with same number exists in the same library
    const existingRack = await LibraryRack.findOne({
      library,
      rackNumber: rackNumber.trim(),
    });
    if (existingRack) {
      return res.status(400).json({
        message: "Rack with this number already exists in this library",
      });
    }

    const rack = new LibraryRack({
      library,
      rackNumber: rackNumber.trim(),
      rackName: rackName.trim(),
      location: location.trim(),
      floor: floor ? floor.trim() : "",
      section: section ? section.trim() : "",
      capacity: capacity ? parseInt(capacity) : 0,
      status: status || "active",
    });

    await rack.save();
    await rack.populate("library", "name libraryCode");

    res.status(201).json(rack);
  } catch (error) {
    console.error("Error creating library rack:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Rack with this number already exists in this library",
        error: error.message,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        error: error.message,
      });
    }

    res.status(400).json({
      message: "Invalid Data",
      error: error.message,
    });
  }
};

// @desc Update library rack
// @route PUT /api/library/racks/:id
exports.updateLibraryRack = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      library,
      rackNumber,
      rackName,
      location,
      floor,
      section,
      capacity,
      status,
    } = req.body;

    const updateData = {};
    if (library !== undefined) updateData.library = library;
    if (rackNumber !== undefined) updateData.rackNumber = rackNumber.trim();
    if (rackName !== undefined) updateData.rackName = rackName.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (floor !== undefined) updateData.floor = floor ? floor.trim() : "";
    if (section !== undefined) updateData.section = section ? section.trim() : "";
    if (capacity !== undefined) updateData.capacity = parseInt(capacity) || 0;
    if (status !== undefined) updateData.status = status;

    // Check if rackNumber is being updated and if it conflicts with existing rack
    if (rackNumber) {
      const existingRack = await LibraryRack.findOne({
        library: library || (await LibraryRack.findById(id))?.library,
        rackNumber: rackNumber.trim(),
        _id: { $ne: id },
      });
      if (existingRack) {
        return res.status(400).json({
          message: "Rack with this number already exists in this library",
        });
      }
    }

    const rack = await LibraryRack.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("library", "name libraryCode");

    if (!rack) {
      return res.status(404).json({ message: "Library rack not found" });
    }

    res.json(rack);
  } catch (error) {
    console.error("Error updating library rack:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Rack with this number already exists in this library",
        error: error.message,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        error: error.message,
      });
    }

    res.status(400).json({
      message: "Update failed",
      error: error.message,
    });
  }
};

// @desc Delete library rack
// @route DELETE /api/library/racks/:id
exports.deleteLibraryRack = async (req, res) => {
  try {
    const { id } = req.params;
    const rack = await LibraryRack.findByIdAndDelete(id);

    if (!rack) {
      return res.status(404).json({ message: "Library rack not found" });
    }

    res.json({
      message: "Library rack deleted successfully",
      data: rack,
    });
  } catch (error) {
    console.error("Error deleting library rack:", error);
    res.status(500).json({
      message: "Delete failed",
      error: error.message,
    });
  }
};

