// @desc Get all exam types

const ExamType = require("../../../models/examination/selector/ExamType");

// @route GET /api/examination/exam-types
exports.getExamTypes = async (req, res) => {
  try {
    const examTypes = await ExamType.find().sort({ createdAt: -1 });
    res.json(examTypes);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create an exam type
// @route POST /api/examination/exam-types
exports.createExamType = async (req, res) => {
  try {
    const { name, code, description, status } = req.body;

    const examType = new ExamType({
      name,
      code,
      description,
      status,
    });

    await examType.save();

    res.status(201).json(examType);
  } catch (error) {
    console.error("Error creating exam type:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update an exam type
// @route PUT /api/examination/exam-types/:id
exports.updateExamType = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedExamType = await ExamType.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedExamType)
      return res.status(404).json({ message: "Exam type not found" });
    res.json(updatedExamType);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete an exam type
// @route DELETE /api/examination/exam-types/:id
exports.deleteExamType = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExamType = await ExamType.findByIdAndDelete(id);
    if (!deletedExamType)
      return res.status(404).json({ message: "Exam type not found" });
    res.json({ message: "Exam type deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// @desc Get single exam type by ID
// @route GET /api/examination/exam-types/:id
exports.getExamTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const examType = await ExamType.findById(id);
    if (!examType)
      return res.status(404).json({ message: "Exam type not found" });
    res.json(examType);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

