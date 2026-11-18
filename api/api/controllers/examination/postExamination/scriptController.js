const Script = require("../../../models/examination/postExamination/Script");
const Bundle = require("../../../models/examination/postExamination/Bundle");
const Subject = require("../../../models/examination/selector/Subject");

// @route   GET /api/examination/scripts
// @desc    Get all scripts with filters
// @access  Private
const getAllScripts = async (req, res) => {
  try {
    const { status, bundleId, subjectCode, subjectId, courseId, streamId, semesterId, search } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (bundleId) {
      filter.bundleId = bundleId;
    }

    if (subjectCode) {
      filter.subjectCode = subjectCode.toUpperCase();
    }

    if (subjectId) {
      filter.subjectId = subjectId;
    }

    // Filter by courseId, streamId, and semesterId through bundles
    // This ensures scripts from the correct branch and semester are returned
    // Note: Only apply this filter if bundleId is NOT already specified
    if ((courseId || streamId || semesterId) && !bundleId) {
      const bundleFilter = {};
      
      // Only add courseId/streamId/semesterId if they're provided
      // Note: Bundle.courseId, streamId, and semesterId are optional for backward compatibility
      if (courseId) {
        bundleFilter.courseId = courseId;
      }
      if (streamId) {
        bundleFilter.streamId = streamId;
      }
      if (semesterId) {
        bundleFilter.semesterId = semesterId;
      }

      // Find bundles matching the course/stream/semester criteria
      const matchingBundles = await Bundle.find(bundleFilter).select("_id").lean();
      const matchingBundleIds = matchingBundles.map((b) => b._id);

      if (matchingBundleIds.length > 0) {
        // Filter scripts by matching bundle IDs
        filter.bundleId = { $in: matchingBundleIds };
      } else {
        // No bundles found for the course/stream/semester combination
        // Fallback: If bundles don't have courseId/streamId/semesterId, fall back to subjectCode/subjectId filtering only
        // This handles backward compatibility for bundles created before these fields were added
        // Log a warning for debugging
        console.warn(
          `No bundles found matching courseId=${courseId}, streamId=${streamId}, semesterId=${semesterId}. ` +
          `Falling back to subjectCode/subjectId filtering only. ` +
          `Consider running migration script to populate courseId/streamId/semesterId in bundles.`
        );
        // Don't add bundleId filter - let subjectCode/subjectId filtering handle it
        // This allows scripts from bundles without courseId/streamId/semesterId to still be found
      }
    }

    if (search) {
      filter.$or = [
        { scriptBarcode: { $regex: search, $options: "i" } },
        { hallTicketNumber: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
        { studentName: { $regex: search, $options: "i" } },
      ];
    }

    const scripts = await Script.find(filter)
      .populate({
        path: "bundleId",
        select: "barcode bundleNumber subjectCode centerCode courseId streamId semesterId",
        populate: {
          path: "courseId streamId semesterId",
          select: "name code description",
        },
      })
      .populate("subjectId", "name code")
      .populate("scannedBy", "fullName email")
      .populate("scrutinizedBy", "fullName email")
      .sort({ scannedAt: -1 });

    res.status(200).json({
      success: true,
      data: scripts,
      count: scripts.length,
    });
  } catch (error) {
    console.error("Error fetching scripts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching scripts",
      error: error.message,
    });
  }
};

// @route   GET /api/examination/scripts/:id
// @desc    Get script by ID
// @access  Private
const getScriptById = async (req, res) => {
  try {
    const script = await Script.findById(req.params.id)
      .populate("bundleId", "barcode bundleNumber subjectCode centerCode")
      .populate("subjectId", "name code")
      .populate("scannedBy", "fullName email");

    if (!script) {
      return res.status(404).json({
        success: false,
        message: "Script not found",
      });
    }

    res.status(200).json({
      success: true,
      data: script,
    });
  } catch (error) {
    console.error("Error fetching script:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching script",
      error: error.message,
    });
  }
};

// @route   GET /api/examination/scripts/barcode/:barcode
// @desc    Get script by barcode
// @access  Private
const getScriptByBarcode = async (req, res) => {
  try {
    const script = await Script.findOne({
      scriptBarcode: req.params.barcode.toUpperCase(),
    })
      .populate("bundleId", "barcode bundleNumber subjectCode centerCode")
      .populate("subjectId", "name code")
      .populate("scannedBy", "fullName email");

    if (!script) {
      return res.status(404).json({
        success: false,
        message: "Script not found",
      });
    }

    res.status(200).json({
      success: true,
      data: script,
    });
  } catch (error) {
    console.error("Error fetching script:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching script",
      error: error.message,
    });
  }
};

// @route   POST /api/examination/scripts/register
// @desc    Register a script from a bundle
// @access  Private
const registerScript = async (req, res) => {
  try {
    const {
      scriptBarcode,
      bundleBarcode,
      rollNumber,
      studentName,
      hallTicketNumber,
    } = req.body;

    if (!scriptBarcode || !bundleBarcode) {
      return res.status(400).json({
        success: false,
        message: "Script barcode and bundle barcode are required",
      });
    }

    // Find bundle - allow both "Received" and "AllScriptsRegistered" status
    const bundle = await Bundle.findOne({
      barcode: bundleBarcode.toUpperCase(),
      status: { $in: ["Received", "AllScriptsRegistered"] },
    }).populate("subjectId", "name code");

    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: "Bundle not found or not received at spot centre",
      });
    }

    // Check if script already exists (created during bundle creation)
    const existingScript = await Script.findOne({
      scriptBarcode: scriptBarcode.toUpperCase(),
    });

    // If script exists and already has a hall ticket number, it's a duplicate registration
    if (existingScript && existingScript.hallTicketNumber) {
      return res.status(400).json({
        success: false,
        message: `Duplicate scan detected! This script was already registered at ${existingScript.scannedAt} with hall ticket ${existingScript.hallTicketNumber}`,
        data: existingScript,
      });
    }

    // Validate script belongs to correct subject
    if (!scriptBarcode.toUpperCase().includes(bundle.subjectCode)) {
      return res.status(400).json({
        success: false,
        message: `Script does not belong to subject ${bundle.subjectCode}. Please check the script.`,
      });
    }

    let script;
    
    if (existingScript) {
      // Update existing script (created during bundle creation) with hall ticket and registration details
      existingScript.hallTicketNumber = hallTicketNumber || existingScript.hallTicketNumber;
      existingScript.rollNumber = rollNumber || existingScript.rollNumber;
      existingScript.studentName = studentName || existingScript.studentName;
      existingScript.status = "Registered";
      existingScript.scannedBy = req.user?._id;
      existingScript.scannedAt = new Date(); // Set scannedAt when actually registered
      script = await existingScript.save();
    } else {
      // Create new script registration (fallback - should rarely happen if bundles are created correctly)
      // Extract sequence number from script barcode (format: SCRIPT-SUBJECTCODE-XXXX)
      let sequenceNumber = null;
      const barcodeParts = scriptBarcode.toUpperCase().split("-");
      if (barcodeParts.length >= 3) {
        const seqPart = barcodeParts[barcodeParts.length - 1];
        sequenceNumber = parseInt(seqPart) || null;
      }

      script = new Script({
        scriptBarcode: scriptBarcode.toUpperCase(),
        bundleId: bundle._id,
        bundleBarcode: bundle.barcode,
        subjectCode: bundle.subjectCode,
        subjectId: bundle.subjectId._id,
        sequenceNumber: sequenceNumber,
        status: "Registered",
        scannedBy: req.user?._id,
        rollNumber: rollNumber || null,
        studentName: studentName || null,
        hallTicketNumber: hallTicketNumber || null,
        scannedAt: new Date(), // Set scannedAt when registered
      });

      await script.save();
    }

    // Count registered scripts for this bundle
    const registeredCount = await Script.countDocuments({
      bundleId: bundle._id,
      status: "Registered",
    });

    // Update bundle's registered scripts count
    bundle.registeredScriptsCount = registeredCount;

    // Check if all scripts are registered
    if (registeredCount >= bundle.scriptCount) {
      bundle.allScriptsRegistered = true;
      bundle.status = "AllScriptsRegistered";
    }

    await bundle.save();

    await script.populate("bundleId", "barcode bundleNumber subjectCode centerCode");
    await script.populate("subjectId", "name code");
    await script.populate("scannedBy", "fullName email");

    const message =
      bundle.allScriptsRegistered
        ? "Script registered successfully! All scripts in bundle are now registered."
        : "Script registered successfully";

    res.status(201).json({
      success: true,
      message,
      data: script,
      bundle: {
        _id: bundle._id,
        registeredScriptsCount: bundle.registeredScriptsCount,
        scriptCount: bundle.scriptCount,
        allScriptsRegistered: bundle.allScriptsRegistered,
        status: bundle.status,
      },
    });
  } catch (error) {
    console.error("Error registering script:", error);
    res.status(500).json({
      success: false,
      message: "Error registering script",
      error: error.message,
    });
  }
};

// @route   PUT /api/examination/scripts/:id
// @desc    Update script details (student info, etc.)
// @access  Private
const updateScript = async (req, res) => {
  try {
    const { hallTicketNumber, studentName, rollNumber, status, scrutinyRemarks } = req.body;

    const script = await Script.findById(req.params.id);

    if (!script) {
      return res.status(404).json({
        success: false,
        message: "Script not found",
      });
    }

    if (hallTicketNumber) script.hallTicketNumber = hallTicketNumber;
    if (studentName) script.studentName = studentName;
    if (rollNumber) script.rollNumber = rollNumber;

    // Allow status updates for scrutiny (enum: Registered, Allocated, Evaluated, Scrutinized)
    if (status) {
      const allowedStatuses = ["Registered", "Allocated", "Evaluated", "Scrutinized"];
      if (allowedStatuses.includes(status)) {
        script.status = status;
        
        // When status is set to Scrutinized, ensure finalMarks is preserved
        if (status === "Scrutinized") {
          // Ensure marks object exists
          if (!script.marks) {
            script.marks = {};
          }
          
          // If finalMarks doesn't exist, calculate it from evaluations
          if (script.marks.finalMarks === undefined || script.marks.finalMarks === null) {
            const evaluations = [
              script.marks.firstEvaluation,
              script.marks.secondEvaluation,
              script.marks.thirdEvaluation,
            ].filter((e) => e && e.total > 0);

            if (evaluations.length > 0) {
              const sum = evaluations.reduce((acc, e) => acc + e.total, 0);
              script.marks.finalMarks = Math.round(sum / evaluations.length);
            }
          }
          
          // Set scrutiny metadata
          script.scrutinizedAt = new Date();
          script.scrutinizedBy = req.user?._id || null;
        }
      }
    }

    // Handle scrutiny remarks
    if (scrutinyRemarks !== undefined) {
      script.scrutinyRemarks = scrutinyRemarks || "";
    }

    await script.save();

    await script.populate("bundleId", "barcode bundleNumber subjectCode centerCode");
    await script.populate("subjectId", "name code");
    await script.populate("scrutinizedBy", "fullName email");

    res.status(200).json({
      success: true,
      message: "Script updated successfully",
      data: script,
    });
  } catch (error) {
    console.error("Error updating script:", error);
    res.status(500).json({
      success: false,
      message: "Error updating script",
      error: error.message,
    });
  }
};

// @route   PUT /api/examination/scripts/:id/evaluate
// @desc    Save evaluation marks for a script
// @access  Private
const saveEvaluation = async (req, res) => {
  try {
    const { evaluationType, marks, total, remarks, evaluatorId } = req.body;

    if (!evaluationType || !marks || total === undefined) {
      return res.status(400).json({
        success: false,
        message: "Evaluation type, marks, and total are required",
      });
    }

    const script = await Script.findById(req.params.id);

    if (!script) {
      return res.status(404).json({
        success: false,
        message: "Script not found",
      });
    }

    // No status check needed - bundles are allocated, not individual scripts
    // Scripts can be evaluated as long as they're in an allocated bundle

    // Initialize marks Map if needed
    if (!script.marks) {
      script.marks = {};
    }

    // Update the appropriate evaluation field
    const evaluationData = {
      marks: marks && typeof marks === "object" ? marks : {},
      total: total,
      remarks: remarks || "",
      evaluatedAt: new Date(),
      evaluatorId: evaluatorId || script.evaluatorId,
    };

    if (evaluationType === "first") {
      script.marks.firstEvaluation = evaluationData;
    } else if (evaluationType === "second") {
      script.marks.secondEvaluation = evaluationData;
    } else if (evaluationType === "third") {
      script.marks.thirdEvaluation = evaluationData;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid evaluation type. Must be 'first', 'second', or 'third'",
      });
    }

    // Calculate final marks (average of all evaluations)
    const evaluations = [
      script.marks.firstEvaluation,
      script.marks.secondEvaluation,
      script.marks.thirdEvaluation,
    ].filter((e) => e && e.total > 0);

    if (evaluations.length > 0) {
      const sum = evaluations.reduce((acc, e) => acc + e.total, 0);
      script.marks.finalMarks = Math.round(sum / evaluations.length);
    }

    // Update status to Evaluated if at least one evaluation is done
    if (evaluations.length > 0) {
      script.status = "Evaluated";
    }

    await script.save();

    // Update the allocation's evaluated count
    const EvaluatorAllocation = require("../../../models/examination/postExamination/EvaluatorAllocation");
    const allocation = await EvaluatorAllocation.findOne({
      evaluatorId: script.evaluatorId,
      scriptIds: script._id,
    });

    if (allocation) {
      const evaluatedCount = await Script.countDocuments({
        _id: { $in: allocation.scriptIds },
        status: "Evaluated",
      });
      allocation.evaluatedScripts = evaluatedCount;

      if (evaluatedCount >= allocation.allocatedScripts) {
        allocation.status = "Completed";
      }

      await allocation.save();
    }

    await script.populate("bundleId", "barcode bundleNumber subjectCode centerCode");
    await script.populate("subjectId", "name code");
    await script.populate("scannedBy", "fullName email");

    res.status(200).json({
      success: true,
      message: "Evaluation saved successfully",
      data: script,
    });
  } catch (error) {
    console.error("Error saving evaluation:", error);
    res.status(500).json({
      success: false,
      message: "Error saving evaluation",
      error: error.message,
    });
  }
};

// @route   GET /api/examination/scripts/bundle/:bundleId
// @desc    Get all scripts for a bundle
// @access  Private
const getScriptsByBundle = async (req, res) => {
  try {
    const scripts = await Script.find({ bundleId: req.params.bundleId })
      .populate("bundleId", "barcode bundleNumber subjectCode centerCode")
      .populate("subjectId", "name code")
      .populate("scannedBy", "fullName email")
      .sort({ sequenceNumber: 1 });

    res.status(200).json({
      success: true,
      data: scripts,
      count: scripts.length,
    });
  } catch (error) {
    console.error("Error fetching scripts by bundle:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching scripts by bundle",
      error: error.message,
    });
  }
};

module.exports = {
  getAllScripts,
  getScriptById,
  getScriptByBarcode,
  registerScript,
  updateScript,
  getScriptsByBundle,
  saveEvaluation,
};

