const Publisher = require("../../models/library/Publisher");

// @desc Get all publishers
// @route GET /api/library/publishers
exports.getPublishers = async (req, res) => {
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
        { publisherCode: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const publishers = await Publisher.find(query).sort({ createdAt: -1 });

    res.json(publishers);
  } catch (error) {
    console.error("Error fetching publishers:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get publisher by ID
// @route GET /api/library/publishers/:id
exports.getPublisherById = async (req, res) => {
  try {
    const { id } = req.params;
    const publisher = await Publisher.findById(id);

    if (!publisher) {
      return res.status(404).json({ message: "Publisher not found" });
    }

    res.json(publisher);
  } catch (error) {
    console.error("Error fetching publisher:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Create a publisher
// @route POST /api/library/publishers
exports.createPublisher = async (req, res) => {
  try {
    const { publisherCode, name, description, establishedYear, status } =
      req.body;

    // Validate required fields
    if (!publisherCode || !name) {
      return res.status(400).json({
        message: "Publisher code and name are required",
      });
    }

    // Check if publisher with same code already exists
    const existingPublisher = await Publisher.findOne({
      publisherCode: publisherCode.toUpperCase(),
    });
    if (existingPublisher) {
      return res.status(400).json({
        message: "Publisher with this code already exists",
      });
    }

    const publisher = new Publisher({
      publisherCode: publisherCode.toUpperCase(),
      name,
      description: description || "",
      establishedYear: establishedYear || null,
      status: status || "active",
    });

    await publisher.save();

    res.status(201).json(publisher);
  } catch (error) {
    console.error("Error creating publisher:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Publisher with this code already exists",
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

// @desc Update a publisher
// @route PUT /api/library/publishers/:id
exports.updatePublisher = async (req, res) => {
  try {
    const { id } = req.params;
    const { publisherCode, name, description, establishedYear, status } =
      req.body;

    const updateData = {};
    if (publisherCode !== undefined)
      updateData.publisherCode = publisherCode.toUpperCase();
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (establishedYear !== undefined)
      updateData.establishedYear = establishedYear || null;
    if (status !== undefined) updateData.status = status;

    // Check if publisherCode is being updated and if it conflicts with existing publisher
    if (publisherCode) {
      const existingPublisher = await Publisher.findOne({
        publisherCode: publisherCode.toUpperCase(),
        _id: { $ne: id },
      });
      if (existingPublisher) {
        return res.status(400).json({
          message: "Publisher with this code already exists",
        });
      }
    }

    const publisher = await Publisher.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!publisher) {
      return res.status(404).json({ message: "Publisher not found" });
    }

    res.json(publisher);
  } catch (error) {
    console.error("Error updating publisher:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Publisher with this code already exists",
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

// @desc Delete a publisher
// @route DELETE /api/library/publishers/:id
exports.deletePublisher = async (req, res) => {
  try {
    const { id } = req.params;
    const publisher = await Publisher.findByIdAndDelete(id);

    if (!publisher) {
      return res.status(404).json({ message: "Publisher not found" });
    }

    res.json({
      message: "Publisher deleted successfully",
      data: publisher,
    });
  } catch (error) {
    console.error("Error deleting publisher:", error);
    res.status(500).json({
      message: "Delete failed",
      error: error.message,
    });
  }
};

