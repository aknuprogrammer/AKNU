const Consumable = require("../../models/labs/Consumable");

// @desc Get all consumables
// @route GET /api/labs/consumables
exports.getConsumables = async (req, res) => {
  try {
    const { assignedLab, status, search, lowStock } = req.query;
    let query = {};

    if (assignedLab) {
      query.assignedLab = assignedLab;
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }
    if (lowStock === "true") {
      query.$expr = { $lte: ["$quantity", "$threshold"] };
    }

    const consumables = await Consumable.find(query)
      .populate("assignedLab", "labName building location")
      .sort({ createdAt: -1 });

    res.json(consumables);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get consumable by ID
// @route GET /api/labs/consumables/:id
exports.getConsumableById = async (req, res) => {
  try {
    const { id } = req.params;
    const consumable = await Consumable.findById(id)
      .populate("assignedLab", "labName building location");

    if (!consumable) {
      return res.status(404).json({ message: "Consumable not found" });
    }

    res.json(consumable);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create consumable
// @route POST /api/labs/consumables
exports.createConsumable = async (req, res) => {
  try {
    const consumable = new Consumable(req.body);
    await consumable.save();

    await consumable.populate("assignedLab", "labName building location");

    res.status(201).json(consumable);
  } catch (error) {
    console.error("Error creating consumable:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update consumable
// @route PUT /api/labs/consumables/:id
exports.updateConsumable = async (req, res) => {
  try {
    const { id } = req.params;
    const consumable = await Consumable.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("assignedLab", "labName building location");

    if (!consumable) {
      return res.status(404).json({ message: "Consumable not found" });
    }

    res.json(consumable);
  } catch (error) {
    console.error("Error updating consumable:", error);
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete consumable
// @route DELETE /api/labs/consumables/:id
exports.deleteConsumable = async (req, res) => {
  try {
    const { id } = req.params;
    const consumable = await Consumable.findByIdAndDelete(id);

    if (!consumable) {
      return res.status(404).json({ message: "Consumable not found" });
    }

    res.json({ message: "Consumable deleted successfully", data: consumable });
  } catch (error) {
    console.error("Error deleting consumable:", error);
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// @desc Get unique consumable categories
// @route GET /api/labs/consumables/categories
exports.getConsumableCategories = async (req, res) => {
  try {
    // Get distinct categories from consumables collection
    const categories = await Consumable.distinct("category", {
      category: { $exists: true, $ne: null, $ne: "" },
    });

    // Filter out empty strings and sort
    const uniqueCategories = categories
      .filter((cat) => cat && cat.trim())
      .map((cat) => cat.trim())
      .sort();

    res.json(uniqueCategories);
  } catch (error) {
    console.error("Error fetching consumable categories:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};