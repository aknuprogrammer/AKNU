const Evaluator = require("../../../models/examination/postExamination/Evaluator");

// @route   GET /api/examination/evaluators
// @desc    Get all evaluators
// @access  Private
const getAllEvaluators = async (req, res) => {
  try {
    const { subjectCode, status, college } = req.query;

    const query = {};
    if (status) query.status = status;
    if (college) query.college = college;
    if (subjectCode) {
      query.subjects = subjectCode.toUpperCase();
    }

    const evaluators = await Evaluator.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: evaluators,
      count: evaluators.length,
    });
  } catch (error) {
    console.error("Error fetching evaluators:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching evaluators",
      error: error.message,
    });
  }
};

// @route   GET /api/examination/evaluators/:id
// @desc    Get evaluator by ID
// @access  Private
const getEvaluatorById = async (req, res) => {
  try {
    const evaluator = await Evaluator.findOne({ evaluatorId: req.params.id });

    if (!evaluator) {
      return res.status(404).json({
        success: false,
        message: "Evaluator not found",
      });
    }

    res.status(200).json({
      success: true,
      data: evaluator,
    });
  } catch (error) {
    console.error("Error fetching evaluator:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching evaluator",
      error: error.message,
    });
  }
};

// @route   PUT /api/examination/evaluators/:id
// @desc    Update evaluator (e.g., currentLoad)
// @access  Private
const updateEvaluator = async (req, res) => {
  try {
    const { currentLoad, maxLoad, status } = req.body;

    const evaluator = await Evaluator.findOne({ evaluatorId: req.params.id });

    if (!evaluator) {
      return res.status(404).json({
        success: false,
        message: "Evaluator not found",
      });
    }

    if (currentLoad !== undefined) evaluator.currentLoad = currentLoad;
    if (maxLoad !== undefined) evaluator.maxLoad = maxLoad;
    if (status) evaluator.status = status;

    await evaluator.save();

    res.status(200).json({
      success: true,
      message: "Evaluator updated successfully",
      data: evaluator,
    });
  } catch (error) {
    console.error("Error updating evaluator:", error);
    res.status(500).json({
      success: false,
      message: "Error updating evaluator",
      error: error.message,
    });
  }
};

module.exports = {
  getAllEvaluators,
  getEvaluatorById,
  updateEvaluator,
};

