const Lab = require("../../models/labs/Lab");

// @desc Get all labs
// @route GET /api/labs/labs
exports.getLabs = async (req, res) => {
  try {
    const { status, labTypeId, building, search } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }
    if (labTypeId) {
      query.labTypeId = labTypeId;
    }
    if (building) {
      query.building = { $regex: building, $options: "i" };
    }
    if (search) {
      query.$or = [
        { labName: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { building: { $regex: search, $options: "i" } },
      ];
    }

    const labs = await Lab.find(query)
      .populate("labTypeId", "code name description")
      .sort({ createdAt: -1 });

    res.json(labs);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get lab by ID
// @route GET /api/labs/labs/:id
exports.getLabById = async (req, res) => {
  try {
    const { id } = req.params;
    const lab = await Lab.findById(id).populate("labTypeId", "code name description");

    if (!lab) {
      return res.status(404).json({ message: "Lab not found" });
    }

    res.json(lab);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create a lab
// @route POST /api/labs/labs
exports.createLab = async (req, res) => {
  try {
    const {
      labName,
      labTypeId,
      building,
      location,
      capacity,
      description,
      equipmentCount,
      inCharge,
      contact,
      status,
    } = req.body;

    const lab = new Lab({
      labName,
      labTypeId,
      building,
      location,
      capacity,
      description,
      equipmentCount: equipmentCount || 0,
      inCharge,
      contact,
      status: status || "active",
    });

    await lab.save();
    await lab.populate("labTypeId", "code name description");

    res.status(201).json(lab);
  } catch (error) {
    console.error("Error creating lab:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update a lab
// @route PUT /api/labs/labs/:id
exports.updateLab = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const lab = await Lab.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("labTypeId", "code name description");

    if (!lab) {
      return res.status(404).json({ message: "Lab not found" });
    }

    res.json(lab);
  } catch (error) {
    console.error("Error updating lab:", error);
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete a lab
// @route DELETE /api/labs/labs/:id
exports.deleteLab = async (req, res) => {
  try {
    const { id } = req.params;
    const lab = await Lab.findByIdAndDelete(id);

    if (!lab) {
      return res.status(404).json({ message: "Lab not found" });
    }

    res.json({ message: "Lab deleted successfully", data: lab });
  } catch (error) {
    console.error("Error deleting lab:", error);
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};
