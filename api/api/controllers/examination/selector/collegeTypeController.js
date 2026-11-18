// @desc Get all college types

const CollegeType = require("../../../models/examination/selector/CollegeType");

// @route GET /api/examination/college-types
exports.getCollegeTypes = async (req, res) => {
  try {
    const collegeTypes = await CollegeType.find().sort({ createdAt: -1 });
    res.json(collegeTypes);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create a college type
// @route POST /api/examination/college-types
exports.createCollegeType = async (req, res) => {
  try {
    const { name, code, description, status } = req.body;

    const collegeType = new CollegeType({
      name,
      code,
      description,
      status,
    });

    await collegeType.save();

    res.status(201).json(collegeType);
  } catch (error) {
    console.error("Error creating college type:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update a college type
// @route PUT /api/examination/college-types/:id
exports.updateCollegeType = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCollegeType = await CollegeType.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedCollegeType)
      return res.status(404).json({ message: "College type not found" });
    res.json(updatedCollegeType);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete a college type
// @route DELETE /api/examination/college-types/:id
exports.deleteCollegeType = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCollegeType = await CollegeType.findByIdAndDelete(id);
    if (!deletedCollegeType)
      return res.status(404).json({ message: "College type not found" });
    res.json({ message: "College type deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// @desc Get single college type by ID
// @route GET /api/examination/college-types/:id
exports.getCollegeTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const collegeType = await CollegeType.findById(id);
    if (!collegeType)
      return res.status(404).json({ message: "College type not found" });
    res.json(collegeType);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

