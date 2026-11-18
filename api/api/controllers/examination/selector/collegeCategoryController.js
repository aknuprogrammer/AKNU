// @desc Get all college categories

const CollegeCategory = require("../../../models/examination/selector/CollegeCategory");

// @route GET /api/examination/college-categories
exports.getCollegeCategories = async (req, res) => {
  try {
    const collegeCategories = await CollegeCategory.find().sort({
      createdAt: -1,
    });
    res.json(collegeCategories);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create a college category
// @route POST /api/examination/college-categories
exports.createCollegeCategory = async (req, res) => {
  try {
    const { name, code, description, status } = req.body;

    const collegeCategory = new CollegeCategory({
      name,
      code,
      description,
      status,
    });

    await collegeCategory.save();

    res.status(201).json(collegeCategory);
  } catch (error) {
    console.error("Error creating college category:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update a college category
// @route PUT /api/examination/college-categories/:id
exports.updateCollegeCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCollegeCategory = await CollegeCategory.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedCollegeCategory)
      return res
        .status(404)
        .json({ message: "College category not found" });
    res.json(updatedCollegeCategory);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete a college category
// @route DELETE /api/examination/college-categories/:id
exports.deleteCollegeCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCollegeCategory = await CollegeCategory.findByIdAndDelete(id);
    if (!deletedCollegeCategory)
      return res
        .status(404)
        .json({ message: "College category not found" });
    res.json({ message: "College category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// @desc Get single college category by ID
// @route GET /api/examination/college-categories/:id
exports.getCollegeCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const collegeCategory = await CollegeCategory.findById(id);
    if (!collegeCategory)
      return res
        .status(404)
        .json({ message: "College category not found" });
    res.json(collegeCategory);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

