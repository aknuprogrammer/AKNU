// @desc Get all college other categories

const CollegeOtherCategory = require("../../../models/examination/selector/CollegeOtherCategory");

// @route GET /api/examination/college-other-categories
exports.getCollegeOtherCategories = async (req, res) => {
  try {
    const collegeOtherCategories = await CollegeOtherCategory.find().sort({
      createdAt: -1,
    });
    res.json(collegeOtherCategories);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create a college other category
// @route POST /api/examination/college-other-categories
exports.createCollegeOtherCategory = async (req, res) => {
  try {
    const { name, code, description, status } = req.body;

    const collegeOtherCategory = new CollegeOtherCategory({
      name,
      code,
      description,
      status,
    });

    await collegeOtherCategory.save();

    res.status(201).json(collegeOtherCategory);
  } catch (error) {
    console.error("Error creating college other category:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update a college other category
// @route PUT /api/examination/college-other-categories/:id
exports.updateCollegeOtherCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCollegeOtherCategory =
      await CollegeOtherCategory.findByIdAndUpdate(id, req.body, {
        new: true,
      });
    if (!updatedCollegeOtherCategory)
      return res
        .status(404)
        .json({ message: "College other category not found" });
    res.json(updatedCollegeOtherCategory);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete a college other category
// @route DELETE /api/examination/college-other-categories/:id
exports.deleteCollegeOtherCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCollegeOtherCategory =
      await CollegeOtherCategory.findByIdAndDelete(id);
    if (!deletedCollegeOtherCategory)
      return res
        .status(404)
        .json({ message: "College other category not found" });
    res.json({ message: "College other category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// @desc Get single college other category by ID
// @route GET /api/examination/college-other-categories/:id
exports.getCollegeOtherCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const collegeOtherCategory = await CollegeOtherCategory.findById(id);
    if (!collegeOtherCategory)
      return res
        .status(404)
        .json({ message: "College other category not found" });
    res.json(collegeOtherCategory);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

