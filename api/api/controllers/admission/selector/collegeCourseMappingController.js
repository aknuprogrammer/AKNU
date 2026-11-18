const CollegeCourseMapping = require("../../../models/admission/selector/CollegeCourseMapping");

// Get all mappings
exports.getMappings = async (req, res) => {
  try {
    const mappings = await CollegeCourseMapping.find()
      .populate("college", "name code") // populate college details
      .populate("courses", "code name"); // populate courses_data details

    res.json(mappings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single mapping by ID
exports.getMappingById = async (req, res) => {
  try {
    const mapping = await CollegeCourseMapping.findById(req.params.id)
      .populate("college", "name code")
      .populate("courses", "code name"); // <-- fix here
    if (!mapping) return res.status(404).json({ message: "Mapping not found" });
    res.json(mapping);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new mapping
exports.createMapping = async (req, res) => {
  const { collegeId, courseIds } = req.body; // frontend should send { collegeId, courseIds[] }
  if (!collegeId || !courseIds || courseIds.length === 0) {
    return res
      .status(400)
      .json({ message: "College and at least one course are required" });
  }

  try {
    const newMapping = new CollegeCourseMapping({
      college: collegeId,
      courses: courseIds, // store multiple courses
    });
    const saved = await newMapping.save();
    res.status(201).json(saved);
  } catch (err) {
    console.log("_______error", err);
    res.status(400).json({ message: err.message });
  }
};

// Update mapping
exports.updateMapping = async (req, res) => {
  const { collegeId, courseIds } = req.body;
  try {
    const updated = await CollegeCourseMapping.findByIdAndUpdate(
      req.params.id,
      { college: collegeId, courses: courseIds },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Mapping not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete mapping
exports.deleteMapping = async (req, res) => {
  try {
    const deleted = await CollegeCourseMapping.findByIdAndDelete(req.params.id);
    console.log("______deleted",deleted)
    if (!deleted) return res.status(404).json({ message: "Mapping not found" });
    res.json({ message: "Mapping deleted successfully" });
  } catch (err) {
    console.log("_________eerrr",err)
    res.status(500).json({ message: err.message });
  }
};
