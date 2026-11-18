// @desc Get all professors

const Professor = require("../../../models/examination/selector/Professor");

// @route GET /api/examination/professors
exports.getProfessors = async (req, res) => {
  try {
    const professors = await Professor.find()
      .populate("subjectIds", "code name")
      .sort({ createdAt: -1 });
    res.json(professors);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create a professor
// @route POST /api/examination/professors
exports.createProfessor = async (req, res) => {
  try {
    const { name, professorId, designation, contactNumber, email, alternateContactNumber, subjectIds, status, notes } =
      req.body;

    const professor = new Professor({
      name,
      professorId,
      designation,
      contactNumber,
      email,
      alternateContactNumber,
      subjectIds,
      status,
      notes,
    });

    await professor.save();

    // Populate subjectIds before sending response
    await professor.populate("subjectIds", "code name");

    res.status(201).json(professor);
  } catch (error) {
    console.error("Error creating professor:", error);
    if (error.message === "At least one subject is required") {
      return res.status(400).json({
        message: "Validation Error",
        error: error.message,
      });
    }
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update a professor
// @route PUT /api/examination/professors/:id
exports.updateProfessor = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProfessor = await Professor.findByIdAndUpdate(id, req.body, {
      new: true,
    }).populate("subjectIds", "code name");
    if (!updatedProfessor)
      return res.status(404).json({ message: "Professor not found" });
    res.json(updatedProfessor);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete a professor
// @route DELETE /api/examination/professors/:id
exports.deleteProfessor = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProfessor = await Professor.findByIdAndDelete(id);
    if (!deletedProfessor)
      return res.status(404).json({ message: "Professor not found" });
    res.json({ message: "Professor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// @desc Get single professor by ID
// @route GET /api/examination/professors/:id
exports.getProfessorById = async (req, res) => {
  try {
    const { id } = req.params;
    const professor = await Professor.findById(id).populate(
      "subjectIds",
      "code name"
    );
    if (!professor)
      return res.status(404).json({ message: "Professor not found" });
    res.json(professor);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get professors by subjectId
// @route GET /api/examination/professors/subject/:subjectId
exports.getProfessorsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const professors = await Professor.find({ subjectIds: subjectId })
      .populate("subjectIds", "code name")
      .sort({ name: 1 });
    res.json(professors);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get professors by professorId
// @route GET /api/examination/professors/professor-id/:professorId
exports.getProfessorByProfessorId = async (req, res) => {
  try {
    const { professorId } = req.params;
    const professor = await Professor.findOne({ professorId }).populate(
      "subjectIds",
      "code name"
    );
    if (!professor)
      return res.status(404).json({ message: "Professor not found" });
    res.json(professor);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

