const LibraryInfo = require("../../models/library/LibraryInfo");

// @desc Get all library info
// @route GET /api/library/library-info
exports.getLibraryInfo = async (req, res) => {
  try {
    const { libraryType, search } = req.query;
    let query = {};

    // Filter by library type
    if (libraryType) {
      query.libraryType = libraryType;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { libraryCode: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { headLibrarianName: { $regex: search, $options: "i" } },
      ];
    }

    const libraryInfo = await LibraryInfo.find(query).sort({ createdAt: -1 });

    res.json(libraryInfo);
  } catch (error) {
    console.error("Error fetching library info:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get library info by ID
// @route GET /api/library/library-info/:id
exports.getLibraryInfoById = async (req, res) => {
  try {
    const { id } = req.params;
    const libraryInfo = await LibraryInfo.findById(id);

    if (!libraryInfo) {
      return res.status(404).json({ message: "Library information not found" });
    }

    res.json(libraryInfo);
  } catch (error) {
    console.error("Error fetching library info:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Create library info
// @route POST /api/library/library-info
exports.createLibraryInfo = async (req, res) => {
  try {
    const {
      libraryCode,
      name,
      establishedYear,
      libraryType,
      description,
      address,
      openingTime,
      closingTime,
      headLibrarianName,
      headLibrarianContact,
      headLibrarianEmail,
    } = req.body;

    // Validate required fields
    if (!libraryCode || !name || !libraryType) {
      return res.status(400).json({
        message: "Library code, name, and library type are required",
      });
    }

    // Check if library with same code already exists
    const existingLibrary = await LibraryInfo.findOne({
      libraryCode: libraryCode.toUpperCase(),
    });
    if (existingLibrary) {
      return res.status(400).json({
        message: "Library with this code already exists",
      });
    }

    const libraryInfo = new LibraryInfo({
      libraryCode: libraryCode.toUpperCase(),
      name,
      establishedYear: establishedYear || null,
      libraryType,
      description: description || "",
      address: address || "",
      openingTime: openingTime || "",
      closingTime: closingTime || "",
      headLibrarianName: headLibrarianName || "",
      headLibrarianContact: headLibrarianContact || "",
      headLibrarianEmail: headLibrarianEmail || "",
    });

    await libraryInfo.save();

    res.status(201).json(libraryInfo);
  } catch (error) {
    console.error("Error creating library info:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Library with this code already exists",
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

// @desc Update library info
// @route PUT /api/library/library-info/:id
exports.updateLibraryInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      libraryCode,
      name,
      establishedYear,
      libraryType,
      description,
      address,
      openingTime,
      closingTime,
      headLibrarianName,
      headLibrarianContact,
      headLibrarianEmail,
    } = req.body;

    const updateData = {};
    if (libraryCode !== undefined)
      updateData.libraryCode = libraryCode.toUpperCase();
    if (name !== undefined) updateData.name = name;
    if (establishedYear !== undefined)
      updateData.establishedYear = establishedYear || null;
    if (libraryType !== undefined) updateData.libraryType = libraryType;
    if (description !== undefined) updateData.description = description;
    if (address !== undefined) updateData.address = address;
    if (openingTime !== undefined) updateData.openingTime = openingTime;
    if (closingTime !== undefined) updateData.closingTime = closingTime;
    if (headLibrarianName !== undefined)
      updateData.headLibrarianName = headLibrarianName;
    if (headLibrarianContact !== undefined)
      updateData.headLibrarianContact = headLibrarianContact;
    if (headLibrarianEmail !== undefined)
      updateData.headLibrarianEmail = headLibrarianEmail;

    // Check if libraryCode is being updated and if it conflicts with existing library
    if (libraryCode) {
      const existingLibrary = await LibraryInfo.findOne({
        libraryCode: libraryCode.toUpperCase(),
        _id: { $ne: id },
      });
      if (existingLibrary) {
        return res.status(400).json({
          message: "Library with this code already exists",
        });
      }
    }

    const libraryInfo = await LibraryInfo.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!libraryInfo) {
      return res.status(404).json({ message: "Library information not found" });
    }

    res.json(libraryInfo);
  } catch (error) {
    console.error("Error updating library info:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Library with this code already exists",
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

// @desc Delete library info
// @route DELETE /api/library/library-info/:id
exports.deleteLibraryInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const libraryInfo = await LibraryInfo.findByIdAndDelete(id);

    if (!libraryInfo) {
      return res.status(404).json({ message: "Library information not found" });
    }

    res.json({
      message: "Library information deleted successfully",
      data: libraryInfo,
    });
  } catch (error) {
    console.error("Error deleting library info:", error);
    res.status(500).json({
      message: "Delete failed",
      error: error.message,
    });
  }
};

