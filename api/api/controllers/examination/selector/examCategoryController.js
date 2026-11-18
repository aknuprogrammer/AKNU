// @desc Get all exam categories

const ExamCategory = require("../../../models/examination/selector/ExamCategory");

// @route GET /api/examination/exam-categories
exports.getExamCategories = async (req, res) => {
  try {
    const examCategories = await ExamCategory.find().sort({ createdAt: -1 });
    res.json(examCategories);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create an exam category
// @route POST /api/examination/exam-categories
exports.createExamCategory = async (req, res) => {
  try {
    const { name, code, description, status } = req.body;

    const examCategory = new ExamCategory({
      name,
      code,
      description,
      status,
    });

    await examCategory.save();

    res.status(201).json(examCategory);
  } catch (error) {
    console.error("Error creating exam category:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update an exam category
// @route PUT /api/examination/exam-categories/:id
exports.updateExamCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedExamCategory = await ExamCategory.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedExamCategory)
      return res.status(404).json({ message: "Exam category not found" });
    res.json(updatedExamCategory);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete an exam category
// @route DELETE /api/examination/exam-categories/:id
exports.deleteExamCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExamCategory = await ExamCategory.findByIdAndDelete(id);
    if (!deletedExamCategory)
      return res.status(404).json({ message: "Exam category not found" });
    res.json({ message: "Exam category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// @desc Get single exam category by ID
// @route GET /api/examination/exam-categories/:id
exports.getExamCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const examCategory = await ExamCategory.findById(id);
    if (!examCategory)
      return res.status(404).json({ message: "Exam category not found" });
    res.json(examCategory);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

