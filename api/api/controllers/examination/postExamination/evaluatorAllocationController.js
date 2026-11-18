const EvaluatorAllocation = require("../../../models/examination/postExamination/EvaluatorAllocation");
const Script = require("../../../models/examination/postExamination/Script");
const Subject = require("../../../models/examination/selector/Subject");
const Bundle = require("../../../models/examination/postExamination/Bundle");
const Evaluator = require("../../../models/examination/postExamination/Evaluator");

// @route   GET /api/examination/evaluator-allocations
// @desc    Get all evaluator allocations
// @access  Private
const getAllAllocations = async (req, res) => {
  try {
    const { evaluatorId, subjectCode, status } = req.query;

    const query = {};
    if (evaluatorId) query.evaluatorId = evaluatorId;
    if (subjectCode) query.subjectCode = subjectCode.toUpperCase();
    if (status) query.status = status;

    const allocations = await EvaluatorAllocation.find(query)
      .populate("subjectId", "name code")
      .populate("bundleId", "barcode bundleNumber subjectCode scriptCount scripts evaluatorId")
      .populate({
        path: "bundleId",
        populate: {
          path: "evaluatorId",
          select: "evaluatorId name college phoneNumber email",
        },
      })
      .populate("scriptIds", "scriptBarcode rollNumber studentName hallTicketNumber status")
      .populate("allocatedBy", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: allocations,
      count: allocations.length,
    });
  } catch (error) {
    console.error("Error fetching allocations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching allocations",
      error: error.message,
    });
  }
};

// @route   GET /api/examination/evaluator-allocations/:id
// @desc    Get allocation by ID
// @access  Private
const getAllocationById = async (req, res) => {
  try {
    const allocation = await EvaluatorAllocation.findById(req.params.id)
      .populate("subjectId", "name code")
      .populate("scriptIds", "scriptBarcode rollNumber studentName hallTicketNumber status marks")
      .populate("allocatedBy", "fullName email");

    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: "Allocation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: allocation,
    });
  } catch (error) {
    console.error("Error fetching allocation:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching allocation",
      error: error.message,
    });
  }
};

// @route   POST /api/examination/evaluator-allocations
// @desc    Create new evaluator allocation
// @access  Private
const createAllocation = async (req, res) => {
  try {
    const {
      evaluatorId,
      evaluatorName,
      evaluatorCollege,
      bundleId,
      bundleBarcode,
    } = req.body;

    // Validate required fields
    if (!evaluatorId || !evaluatorName || !evaluatorCollege || !bundleId || !bundleBarcode) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Find bundle
    const bundle = await Bundle.findById(bundleId).populate("subjectId", "name code");
    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: "Bundle not found",
      });
    }

    // Verify bundle barcode matches
    if (bundle.barcode.toUpperCase() !== bundleBarcode.toUpperCase()) {
      return res.status(400).json({
        success: false,
        message: "Bundle barcode does not match",
      });
    }

    // Check if bundle is already allocated
    const existingAllocation = await EvaluatorAllocation.findOne({
      bundleId: bundle._id,
      status: "Active",
    });

    if (existingAllocation) {
      return res.status(400).json({
        success: false,
        message: "This bundle is already allocated to an evaluator",
      });
    }

    // Check if evaluator already has 3 or more active bundles
    const evaluatorActiveBundles = await EvaluatorAllocation.countDocuments({
      evaluatorId: evaluatorId,
      status: "Active",
    });

    if (evaluatorActiveBundles >= 3) {
      return res.status(400).json({
        success: false,
        message: `Evaluator ${evaluatorName} already has ${evaluatorActiveBundles} active bundles. Maximum 3 bundles allowed per evaluator.`,
      });
    }

    // Get subject information from bundle
    const subject = bundle.subjectId;
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found for this bundle",
      });
    }

    // Find evaluator by evaluatorId (string) to get the document _id
    const evaluator = await Evaluator.findOne({ evaluatorId: evaluatorId });
    if (!evaluator) {
      return res.status(404).json({
        success: false,
        message: "Evaluator not found",
      });
    }

    // Update bundle with evaluator document _id
    bundle.evaluatorId = evaluator._id;
    await bundle.save();

    // Create allocation - use bundle's scriptCount for allocatedScripts
    // evaluatedScripts will be calculated from bundle.scripts.length
    const allocation = new EvaluatorAllocation({
      evaluatorId,
      evaluatorName,
      evaluatorCollege,
      subjectCode: bundle.subjectCode,
      subjectId: subject._id,
      bundleBarcode: bundle.barcode,
      bundleId: bundle._id,
      allocatedScripts: bundle.scriptCount,
      evaluatedScripts: bundle.scripts ? bundle.scripts.length : 0,
      scriptIds: [], // Empty array since we're allocating by bundle
      status: "Active",
      allocatedBy: req.user?._id,
    });

    await allocation.save();

    await allocation.populate("subjectId", "name code");
    await allocation.populate("bundleId", "barcode bundleNumber subjectCode scriptCount scripts evaluatorId");

    res.status(201).json({
      success: true,
      message: "Bundle allocated successfully",
      data: allocation,
    });
  } catch (error) {
    console.error("Error creating allocation:", error);
    res.status(500).json({
      success: false,
      message: "Error creating allocation",
      error: error.message,
    });
  }
};

// @route   PUT /api/examination/evaluator-allocations/:id
// @desc    Update allocation
// @access  Private
const updateAllocation = async (req, res) => {
  try {
    const allocation = await EvaluatorAllocation.findById(req.params.id);

    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: "Allocation not found",
      });
    }

    // Update evaluated count based on scripts
    const evaluatedCount = await Script.countDocuments({
      _id: { $in: allocation.scriptIds },
      status: "Evaluated",
    });

    allocation.evaluatedScripts = evaluatedCount;

    // Update status if all scripts are evaluated
    if (evaluatedCount >= allocation.allocatedScripts) {
      allocation.status = "Completed";
    }

    await allocation.save();

    await allocation.populate("subjectId", "name code");
    await allocation.populate("scriptIds", "scriptBarcode rollNumber studentName hallTicketNumber status marks");

    res.status(200).json({
      success: true,
      message: "Allocation updated successfully",
      data: allocation,
    });
  } catch (error) {
    console.error("Error updating allocation:", error);
    res.status(500).json({
      success: false,
      message: "Error updating allocation",
      error: error.message,
    });
  }
};

// @route   GET /api/examination/evaluator-allocations/evaluator/:evaluatorId
// @desc    Get allocations for a specific evaluator
// @access  Private
const getAllocationsByEvaluator = async (req, res) => {
  try {
    const { evaluatorId } = req.params;

    const allocations = await EvaluatorAllocation.find({
      evaluatorId,
      status: "Active",
    })
      .populate("subjectId", "name code")
      .populate("scriptIds", "scriptBarcode rollNumber studentName hallTicketNumber status marks")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: allocations,
      count: allocations.length,
    });
  } catch (error) {
    console.error("Error fetching evaluator allocations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching evaluator allocations",
      error: error.message,
    });
  }
};

module.exports = {
  getAllAllocations,
  getAllocationById,
  createAllocation,
  updateAllocation,
  getAllocationsByEvaluator,
};

