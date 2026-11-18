// @desc Get all colleges

const College = require("../../../models/admission/selector/College");

// @route GET /api/colleges_data
exports.getColleges = async (req, res) => {
  try {
    const colleges = await College.find()
      .populate("collegeTypeId", "name code")
      .populate("collegeCategoryId", "name code")
      .populate("courseCategoryId", "name code")
      .sort({ name: 1 });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get college by ID
// @route GET /api/colleges_data/:id
exports.getCollegeById = async (req, res) => {
  try {
    const { id } = req.params;
    const college = await College.findById(id)
      .populate("collegeTypeId", "name code")
      .populate("collegeCategoryId", "name code")
      .populate("courseCategoryId", "name code");
    if (!college)
      return res.status(404).json({ message: "College not found" });
    res.json(college);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create a college
// @route POST /api/colleges_data
exports.createCollege = async (req, res) => {
  try {
    const {
      code,
      name,
      addressLine1,
      addressLine2,
      city,
      district,
      state,
      pincode,
      collegeTypeId,
      collegeCategoryId,
      courseCategoryId,
      comments,
      status,
    } = req.body;

    const college = new College({
      code,
      name,
      addressLine1,
      addressLine2,
      city,
      district,
      state,
      pincode,
      collegeTypeId,
      collegeCategoryId,
      courseCategoryId,
      comments,
      status,
    });

    await college.save();

    // Populate before sending response
    await college.populate("collegeTypeId", "name code");
    await college.populate("collegeCategoryId", "name code");
    await college.populate("courseCategoryId", "name code");

    res.status(201).json(college);
  } catch (error) {
    console.error("Error creating college:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate college code",
        error: "A college with this code already exists",
      });
    }
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update a college
// @route PUT /api/colleges_data/:id
exports.updateCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCollege = await College.findByIdAndUpdate(id, req.body, {
      new: true,
    })
      .populate("collegeTypeId", "name code")
      .populate("collegeCategoryId", "name code")
      .populate("courseCategoryId", "name code");
    if (!updatedCollege)
      return res.status(404).json({ message: "College not found" });
    res.json(updatedCollege);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate college code",
        error: "A college with this code already exists",
      });
    }
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete a college
// @route DELETE /api/colleges_data/:id
exports.deleteCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCollege = await College.findByIdAndDelete(id);
    if (!deletedCollege)
      return res.status(404).json({ message: "College not found" });
    res.json({ message: "College deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// @desc Get colleges by collegeTypeId
// @route GET /api/colleges_data/type/:collegeTypeId
exports.getCollegesByType = async (req, res) => {
  try {
    const { collegeTypeId } = req.params;
    const colleges = await College.find({ collegeTypeId })
      .populate("collegeTypeId", "name code")
      .populate("collegeCategoryId", "name code")
      .populate("courseCategoryId", "name code")
      .sort({ name: 1 });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get colleges by collegeCategoryId
// @route GET /api/colleges_data/category/:collegeCategoryId
exports.getCollegesByCategory = async (req, res) => {
  try {
    const { collegeCategoryId } = req.params;
    const colleges = await College.find({ collegeCategoryId })
      .populate("collegeTypeId", "name code")
      .populate("collegeCategoryId", "name code")
      .populate("courseCategoryId", "name code")
      .sort({ name: 1 });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get colleges by courseCategoryId
// @route GET /api/colleges_data/course-category/:courseCategoryId
exports.getCollegesByCourseCategory = async (req, res) => {
  try {
    const { courseCategoryId } = req.params;
    const colleges = await College.find({ courseCategoryId })
      .populate("collegeTypeId", "name code")
      .populate("collegeCategoryId", "name code")
      .populate("courseCategoryId", "name code")
      .sort({ name: 1 });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get colleges by location
// @route GET /api/colleges_data/location
exports.getCollegesByLocation = async (req, res) => {
  try {
    const { city, district, state } = req.query;
    const colleges = await College.findByLocation(city, district, state).sort({
      name: 1,
    });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get colleges by status
// @route GET /api/colleges_data/status/:status
exports.getCollegesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const colleges = await College.find({ status })
      .populate("collegeTypeId", "name code")
      .populate("collegeCategoryId", "name code")
      .populate("courseCategoryId", "name code")
      .sort({ name: 1 });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get colleges by classification (type, category, courseCategory)
// @route GET /api/colleges_data/classification
exports.getCollegesByClassification = async (req, res) => {
  try {
    const { collegeTypeId, collegeCategoryId, courseCategoryId } = req.query;
    const colleges = await College.findByClassification(
      collegeTypeId,
      collegeCategoryId,
      courseCategoryId
    ).sort({ name: 1 });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
