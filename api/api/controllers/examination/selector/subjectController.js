// @desc Get all subjects

const Subject = require("../../../models/examination/selector/Subject");

// @route GET /api/examination/subjects
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ code: 1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create a subject
// @route POST /api/examination/subjects
exports.createSubject = async (req, res) => {
  try {
    const { code, name, description, syllabus, status } = req.body;

    const subject = new Subject({
      code,
      name,
      description,
      syllabus,
      status,
    });

    await subject.save();

    res.status(201).json(subject);
  } catch (error) {
    console.error("Error creating subject:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update a subject
// @route PUT /api/examination/subjects/:id
exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSubject = await Subject.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedSubject)
      return res.status(404).json({ message: "Subject not found" });
    res.json(updatedSubject);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete a subject
// @route DELETE /api/examination/subjects/:id
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSubject = await Subject.findByIdAndDelete(id);
    if (!deletedSubject)
      return res.status(404).json({ message: "Subject not found" });
    res.json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// @desc Get single subject by ID
// @route GET /api/examination/subjects/:id
exports.getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id);
    if (!subject)
      return res.status(404).json({ message: "Subject not found" });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

