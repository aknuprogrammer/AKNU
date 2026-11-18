const LabType = require("../../models/labs/LabType");

// @desc Get all lab types
// @route GET /api/labs/lab-types
exports.getLabTypes = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const labTypes = await LabType.find(query).sort({ createdAt: -1 });
    res.json(labTypes);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get lab type by ID
// @route GET /api/labs/lab-types/:id
exports.getLabTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const labType = await LabType.findById(id);
    
    if (!labType) {
      return res.status(404).json({ message: "Lab type not found" });
    }
    
    res.json(labType);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create a lab type
// @route POST /api/labs/lab-types
exports.createLabType = async (req, res) => {
  try {
    const { code, name, description, status } = req.body;

    // Check if code already exists
    const existingLabType = await LabType.findOne({ code: code.toUpperCase() });
    if (existingLabType) {
      return res.status(400).json({ message: "Lab type with this code already exists" });
    }

    const labType = new LabType({
      code: code.toUpperCase(),
      name,
      description,
      status: status || "Active",
    });

    await labType.save();
    res.status(201).json(labType);
  } catch (error) {
    console.error("Error creating lab type:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update a lab type
// @route PUT /api/labs/lab-types/:id
exports.updateLabType = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, status } = req.body;

    // Check if code is being changed and if it already exists
    if (code) {
      const existingLabType = await LabType.findOne({ 
        code: code.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingLabType) {
        return res.status(400).json({ message: "Lab type with this code already exists" });
      }
    }

    const updateData = {};
    if (code) updateData.code = code.toUpperCase();
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    const labType = await LabType.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!labType) {
      return res.status(404).json({ message: "Lab type not found" });
    }

    res.json(labType);
  } catch (error) {
    console.error("Error updating lab type:", error);
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete a lab type
// @route DELETE /api/labs/lab-types/:id
exports.deleteLabType = async (req, res) => {
  try {
    const { id } = req.params;
    const labType = await LabType.findByIdAndDelete(id);

    if (!labType) {
      return res.status(404).json({ message: "Lab type not found" });
    }

    res.json({ message: "Lab type deleted successfully", data: labType });
  } catch (error) {
    console.error("Error deleting lab type:", error);
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};
