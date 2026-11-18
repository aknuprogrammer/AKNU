// @desc Get all semesters

const Semester = require("../../../models/examination/selector/Semester");

// @route GET /api/examination/semesters
exports.getSemesters = async (req, res) => {
  try {
    const semesters = await Semester.find().sort({ numberOfSemesters: 1 });
    res.json(semesters);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create a semester
// @route POST /api/examination/semesters
exports.createSemester = async (req, res) => {
  try {
    const { numberOfSemesters, description, status } = req.body;

    const semester = new Semester({
      numberOfSemesters,
      description,
      status,
    });

    await semester.save();

    res.status(201).json(semester);
  } catch (error) {
    console.error("Error creating semester:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update a semester
// @route PUT /api/examination/semesters/:id
exports.updateSemester = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSemester = await Semester.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedSemester)
      return res.status(404).json({ message: "Semester not found" });
    res.json(updatedSemester);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete a semester
// @route DELETE /api/examination/semesters/:id
exports.deleteSemester = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSemester = await Semester.findByIdAndDelete(id);
    if (!deletedSemester)
      return res.status(404).json({ message: "Semester not found" });
    res.json({ message: "Semester deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// @desc Get single semester by ID
// @route GET /api/examination/semesters/:id
exports.getSemesterById = async (req, res) => {
  try {
    const { id } = req.params;
    const semester = await Semester.findById(id);
    if (!semester)
      return res.status(404).json({ message: "Semester not found" });
    res.json(semester);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

