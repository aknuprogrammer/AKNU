// @desc Get all academic years

const AcademicYear = require("../../../models/examination/selector/AcademicYear");

// @route GET /api/examination/academic-years
exports.getAcademicYears = async (req, res) => {
  try {
    const academicYears = await AcademicYear.find().sort({ startDate: -1 });
    res.json(academicYears);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create an academic year
// @route POST /api/examination/academic-years
exports.createAcademicYear = async (req, res) => {
  try {
    const { code, startDate, endDate, description, status } = req.body;

    const academicYear = new AcademicYear({
      code,
      startDate,
      endDate,
      description,
      status,
    });

    await academicYear.save();

    res.status(201).json(academicYear);
  } catch (error) {
    console.error("Error creating academic year:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update an academic year
// @route PUT /api/examination/academic-years/:id
exports.updateAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAcademicYear = await AcademicYear.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedAcademicYear)
      return res.status(404).json({ message: "Academic year not found" });
    res.json(updatedAcademicYear);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete an academic year
// @route DELETE /api/examination/academic-years/:id
exports.deleteAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAcademicYear = await AcademicYear.findByIdAndDelete(id);
    if (!deletedAcademicYear)
      return res.status(404).json({ message: "Academic year not found" });
    res.json({ message: "Academic year deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// @desc Get single academic year by ID
// @route GET /api/examination/academic-years/:id
exports.getAcademicYearById = async (req, res) => {
  try {
    const { id } = req.params;
    const academicYear = await AcademicYear.findById(id);
    if (!academicYear)
      return res.status(404).json({ message: "Academic year not found" });
    res.json(academicYear);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

