const Equipment = require("../../models/labs/Equipment");

// @desc Get all equipment
// @route GET /api/labs/equipment
exports.getEquipment = async (req, res) => {
  try {
    const { category, assignedLab, condition, status, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }
    if (assignedLab) {
      query.assignedLab = assignedLab;
    }
    if (condition) {
      query.condition = condition;
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { equipmentName: { $regex: search, $options: "i" } },
        { assetId: { $regex: search, $options: "i" } },
        { serialNumber: { $regex: search, $options: "i" } },
      ];
    }

    const equipment = await Equipment.find(query)
      .populate("category", "name code")
      .populate("assignedLab", "labName building location")
      .sort({ createdAt: -1 });

    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get equipment by ID
// @route GET /api/labs/equipment/:id
exports.getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findById(id)
      .populate("category", "name code description")
      .populate("assignedLab", "labName building location");

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create equipment
// @route POST /api/labs/equipment
exports.createEquipment = async (req, res) => {
  try {
    const equipment = new Equipment(req.body);
    await equipment.save();
    
    await equipment.populate("category", "name code");
    await equipment.populate("assignedLab", "labName building location");

    res.status(201).json(equipment);
  } catch (error) {
    console.error("Error creating equipment:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update equipment
// @route PUT /api/labs/equipment/:id
exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("category", "name code")
      .populate("assignedLab", "labName building location");

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    res.json(equipment);
  } catch (error) {
    console.error("Error updating equipment:", error);
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete equipment
// @route DELETE /api/labs/equipment/:id
exports.deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findByIdAndDelete(id);

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    res.json({ message: "Equipment deleted successfully", data: equipment });
  } catch (error) {
    console.error("Error deleting equipment:", error);
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};
