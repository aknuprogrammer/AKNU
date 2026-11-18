// @desc Get all invigilators

const Invigilator = require("../../../models/examination/selector/Invigilator");

// @route GET /api/examination/invigilators
exports.getInvigilators = async (req, res) => {
  try {
    const invigilators = await Invigilator.find()
      .populate("collegeId", "code name location")
      .sort({ createdAt: -1 });
    res.json(invigilators);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create an invigilator
// @route POST /api/examination/invigilators
exports.createInvigilator = async (req, res) => {
  try {
    const {
      invigilatorCode,
      name,
      collegeId,
      collegeName,
      collegeCode,
      role,
      year,
      status,
      notes,
    } = req.body;

    // If collegeId is provided, fetch and populate collegeName and collegeCode if not provided
    let finalCollegeName = collegeName;
    let finalCollegeCode = collegeCode;
    if (collegeId && (!collegeName || !collegeCode)) {
      const College = require("../../../models/admission/selector/College");
      const college = await College.findById(collegeId);
      if (college) {
        finalCollegeName = collegeName || college.name;
        finalCollegeCode = collegeCode || college.code;
      }
    }

    const invigilator = new Invigilator({
      invigilatorCode,
      name,
      collegeId,
      collegeName: finalCollegeName,
      collegeCode: finalCollegeCode,
      role,
      year,
      status,
      notes,
    });

    await invigilator.save();

    // Populate collegeId before sending response
    await invigilator.populate("collegeId", "code name location");

    res.status(201).json(invigilator);
  } catch (error) {
    console.error("Error creating invigilator:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update an invigilator
// @route PUT /api/examination/invigilators/:id
exports.updateInvigilator = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedInvigilator = await Invigilator.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    ).populate("collegeId", "code name location");
    if (!updatedInvigilator)
      return res.status(404).json({ message: "Invigilator not found" });
    res.json(updatedInvigilator);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete an invigilator
// @route DELETE /api/examination/invigilators/:id
exports.deleteInvigilator = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInvigilator = await Invigilator.findByIdAndDelete(id);
    if (!deletedInvigilator)
      return res.status(404).json({ message: "Invigilator not found" });
    res.json({ message: "Invigilator deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// @desc Get single invigilator by ID
// @route GET /api/examination/invigilators/:id
exports.getInvigilatorById = async (req, res) => {
  try {
    const { id } = req.params;
    const invigilator = await Invigilator.findById(id).populate(
      "collegeId",
      "code name location"
    );
    if (!invigilator)
      return res.status(404).json({ message: "Invigilator not found" });
    res.json(invigilator);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get invigilators by collegeId
// @route GET /api/examination/invigilators/college/:collegeId
exports.getInvigilatorsByCollege = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const invigilators = await Invigilator.find({ collegeId })
      .populate("collegeId", "code name location")
      .sort({ name: 1 });
    res.json(invigilators);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get invigilators by role
// @route GET /api/examination/invigilators/role/:role
exports.getInvigilatorsByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const invigilators = await Invigilator.find({ role })
      .populate("collegeId", "code name location")
      .sort({ name: 1 });
    res.json(invigilators);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get invigilators by year
// @route GET /api/examination/invigilators/year/:year
exports.getInvigilatorsByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const invigilators = await Invigilator.find({ year })
      .populate("collegeId", "code name location")
      .sort({ name: 1 });
    res.json(invigilators);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get invigilator by invigilatorCode
// @route GET /api/examination/invigilators/code/:invigilatorCode
exports.getInvigilatorByCode = async (req, res) => {
  try {
    const { invigilatorCode } = req.params;
    const invigilator = await Invigilator.findOne({
      invigilatorCode: invigilatorCode.toUpperCase(),
    }).populate("collegeId", "code name location");
    if (!invigilator)
      return res.status(404).json({ message: "Invigilator not found" });
    res.json(invigilator);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

