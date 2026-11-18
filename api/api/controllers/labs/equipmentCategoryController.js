const EquipmentCategory = require("../../models/labs/EquipmentCategory");

// @desc Get all equipment categories
// @route GET /api/labs/equipment-categories
exports.getEquipmentCategories = async (req, res) => {
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

    const categories = await EquipmentCategory.find(query).sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get equipment category by ID
// @route GET /api/labs/equipment-categories/:id
exports.getEquipmentCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await EquipmentCategory.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Equipment category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create an equipment category
// @route POST /api/labs/equipment-categories
exports.createEquipmentCategory = async (req, res) => {
  try {
    const { name, code, description, status } = req.body;

    // Check if name or code already exists
    const existingCategory = await EquipmentCategory.findOne({
      $or: [{ name }, { code: code.toUpperCase() }],
    });

    if (existingCategory) {
      return res.status(400).json({ 
        message: "Equipment category with this name or code already exists" 
      });
    }

    const category = new EquipmentCategory({
      name,
      code: code.toUpperCase(),
      description,
      status: status || "Active",
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating equipment category:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update an equipment category
// @route PUT /api/labs/equipment-categories/:id
exports.updateEquipmentCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, status } = req.body;

    // Check if name or code is being changed and if it already exists
    if (name || code) {
      const existingCategory = await EquipmentCategory.findOne({
        $or: [{ name }, { code: code?.toUpperCase() }],
        _id: { $ne: id },
      });

      if (existingCategory) {
        return res.status(400).json({ 
          message: "Equipment category with this name or code already exists" 
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (code) updateData.code = code.toUpperCase();
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    const category = await EquipmentCategory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Equipment category not found" });
    }

    res.json(category);
  } catch (error) {
    console.error("Error updating equipment category:", error);
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete an equipment category
// @route DELETE /api/labs/equipment-categories/:id
exports.deleteEquipmentCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await EquipmentCategory.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: "Equipment category not found" });
    }

    res.json({ message: "Equipment category deleted successfully", data: category });
  } catch (error) {
    console.error("Error deleting equipment category:", error);
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};
