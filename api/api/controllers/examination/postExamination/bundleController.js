const Bundle = require("../../../models/examination/postExamination/Bundle");
const Script = require("../../../models/examination/postExamination/Script");
const Subject = require("../../../models/examination/selector/Subject");
const ExaminationCenter = require("../../../models/examination/selector/ExaminationCenter");
const Course = require("../../../models/admission/selector/Course");
const Stream = require("../../../models/examination/selector/Stream");
const CourseStreamMapping = require("../../../models/examination/selector/CourseStreamMapping");
const SeatingArrangement = require("../../../models/examination/SeatingArrangement");

// @route   GET /api/examination/bundles
// @desc    Get all bundles with filters
// @access  Private
const getAllBundles = async (req, res) => {
  try {
    const { status, subjectCode, centerCode, search } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (subjectCode) {
      filter.subjectCode = subjectCode.toUpperCase();
    }

    if (centerCode) {
      filter.centerCode = centerCode.toUpperCase();
    }

    if (search) {
      filter.$or = [
        { barcode: { $regex: search, $options: "i" } },
        { subjectCode: { $regex: search, $options: "i" } },
        { centerCode: { $regex: search, $options: "i" } },
      ];
    }

    const bundles = await Bundle.find(filter)
      .populate("courseId", "name code")
      .populate("streamId", "name code")
      .populate("semesterId", "name code description")
      .populate("subjectId", "name code")
      .populate("centerId", "name code")
      .populate("evaluatorId", "evaluatorId name college phoneNumber email")
      .populate("createdBy", "fullName email")
      .populate("receivedBy", "fullName email")
      .sort({ createdAt: -1 });

    // Update registered scripts count for each bundle and check completion
    // Only count scripts that have actually been scanned (have scannedAt set)
    // Scripts created during bundle creation have status "Registered" but no scannedAt
    const bundleIds = bundles.map((b) => b._id);
    const registeredCounts = await Script.aggregate([
      {
        $match: {
          bundleId: { $in: bundleIds },
          scannedAt: { $ne: null }, // Only count scripts that have been scanned
        },
      },
      {
        $group: {
          _id: "$bundleId",
          count: { $sum: 1 },
        },
      },
    ]);

    // Create a map for quick lookup
    const countMap = {};
    registeredCounts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    // Update bundles and save if needed
    const bundlesToUpdate = [];
    for (const bundle of bundles) {
      const registeredCount = countMap[bundle._id.toString()] || 0;
      bundle.registeredScriptsCount = registeredCount;

      // Check if all scripts are registered and update status if needed
      if (
        registeredCount >= bundle.scriptCount &&
        bundle.status === "Received"
      ) {
        bundle.allScriptsRegistered = true;
        bundle.status = "AllScriptsRegistered";
        bundlesToUpdate.push(bundle);
      }
    }

    // Save updated bundles
    if (bundlesToUpdate.length > 0) {
      await Promise.all(bundlesToUpdate.map((b) => b.save()));
    }

    res.status(200).json({
      success: true,
      data: bundles,
      count: bundles.length,
    });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bundles",
      error: error.message,
    });
  }
};

// @route   GET /api/examination/bundles/:id
// @desc    Get bundle by ID
// @access  Private
const getBundleById = async (req, res) => {
  try {
    const bundle = await Bundle.findById(req.params.id)
      .populate("courseId", "name code")
      .populate("streamId", "name code")
      .populate("subjectId", "name code")
      .populate("centerId", "name code")
      .populate("evaluatorId", "evaluatorId name college phoneNumber email")
      .populate("createdBy", "fullName email")
      .populate("receivedBy", "fullName email");

    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: "Bundle not found",
      });
    }

    res.status(200).json({
      success: true,
      data: bundle,
    });
  } catch (error) {
    console.error("Error fetching bundle:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bundle",
      error: error.message,
    });
  }
};

// @route   GET /api/examination/bundles/barcode/:barcode
// @desc    Get bundle by barcode
// @access  Private
const getBundleByBarcode = async (req, res) => {
  try {
    const bundle = await Bundle.findOne({
      barcode: req.params.barcode.toUpperCase(),
    })
      .populate("courseId", "name code")
      .populate("streamId", "name code")
      .populate("subjectId", "name code")
      .populate("centerId", "name code")
      .populate("evaluatorId", "evaluatorId name college phoneNumber email")
      .populate("createdBy", "fullName email")
      .populate("receivedBy", "fullName email");
    console.log("bundle", bundle);
    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: "Bundle not found",
      });
    }

    res.status(200).json({
      success: true,
      data: bundle,
    });
  } catch (error) {
    console.error("Error fetching bundle:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bundle",
      error: error.message,
    });
  }
};

// @route   POST /api/examination/bundles
// @desc    Create a new bundle
// @access  Private
const createBundle = async (req, res) => {
  try {
    const {
      courseId,
      streamId,
      semesterId,
      subjectCode,
      subjectId,
      centerCode,
      scripts,
      scriptCount,
    } = req.body;
    console.log("req.body", req.body);
    console.log("Validating bundle creation with:", {
      courseId,
      streamId,
      semesterId,
      subjectCode,
      subjectId,
      centerCode,
      scriptsCount: scripts?.length,
      scriptCount,
    });

    // Validate required fields
    if (!subjectCode || !centerCode) {
      return res.status(400).json({
        success: false,
        message: "Subject code and center code are required",
      });
    }

    // Validate courseId, streamId, and semesterId are provided (strongly recommended for proper filtering)
    // Note: These are technically optional for backward compatibility, but required for correct filtering
    if (!courseId || !streamId || !semesterId) {
      console.warn(
        "Bundle creation without courseId/streamId/semesterId - filtering may not work correctly. " +
        "It is strongly recommended to provide courseId, streamId, and semesterId."
      );
      // We don't block creation, but log a warning
    }

    // If courseId and streamId are provided, validate the relationships
    let course = null;
    let stream = null;
    
    if (courseId) {
      course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }
    }

    if (streamId) {
      stream = await Stream.findById(streamId);
      if (!stream) {
        return res.status(404).json({
          success: false,
          message: "Stream not found",
        });
      }

      // Validate stream belongs to course if both are provided using CourseStreamMapping
      if (courseId) {
        const courseStreamMapping = await CourseStreamMapping.findOne({
          courseId: courseId,
          streamId: streamId,
          status: "Active",
        });

        console.log("CourseStreamMapping check:", {
          courseId,
          streamId,
          found: !!courseStreamMapping,
        });

        if (!courseStreamMapping) {
          return res.status(400).json({
            success: false,
            message: "Stream does not belong to the selected course. Please ensure the stream is mapped to this course in CourseStreamMapping.",
          });
        }
      }
    }

    // Validate scripts array
    if (!scripts || !Array.isArray(scripts) || scripts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Scripts array is required and must not be empty",
      });
    }

    // Validate script count matches
    if (scriptCount !== scripts.length) {
      return res.status(400).json({
        success: false,
        message: "Script count does not match the number of scripts provided",
      });
    }

    // Validate script count
    if (scriptCount < 1 || scriptCount > 50) {
      return res.status(400).json({
        success: false,
        message: "Script count must be between 1 and 50",
      });
    }

    // Find subject - use subjectId if provided, otherwise find by code
    let subject = null;
    if (subjectId) {
      subject = await Subject.findById(subjectId);
      if (!subject || subject.status !== "Active") {
        return res.status(404).json({
          success: false,
          message: "Subject not found or inactive",
        });
      }
      // Validate subject code matches if both are provided
      if (subjectCode && subject.code.toUpperCase() !== subjectCode.toUpperCase()) {
        return res.status(400).json({
          success: false,
          message: "Subject code does not match the provided subject ID",
        });
      }
    } else {
      subject = await Subject.findOne({
        code: subjectCode.toUpperCase(),
        status: "Active",
      });

      if (!subject) {
        return res.status(404).json({
          success: false,
          message: "Subject not found or inactive",
        });
      }
    }

    // Validate course-stream-semester-subject relationship using CourseStreamMapping
    if (courseId && streamId) {
      const mappingQuery = {
        courseId: courseId,
        streamId: streamId,
        "subjects.subjectId": subject._id,
        status: "Active",
      };

      // If semesterId is provided, include it in the validation
      if (semesterId) {
        mappingQuery.semesterId = semesterId;
      }

      const courseStreamMapping = await CourseStreamMapping.findOne(mappingQuery);

      console.log("CourseStreamMapping subject validation:", {
        courseId,
        streamId,
        semesterId,
        subjectId: subject._id,
        found: !!courseStreamMapping,
      });

      if (!courseStreamMapping) {
        const errorMessage = semesterId
          ? "Subject does not belong to the selected course, stream, and semester combination. Please ensure the subject is mapped to this course-stream-semester combination in CourseStreamMapping."
          : "Subject does not belong to the selected course and stream combination. Please ensure the subject is mapped to this course-stream combination in CourseStreamMapping.";
        
        return res.status(400).json({
          success: false,
          message: errorMessage,
        });
      }
    } else if (streamId) {
      // If only streamId is provided, validate using StreamSubjectMapping as fallback
      const StreamSubjectMapping = require("../../../models/examination/selector/StreamSubjectMapping");
      const streamSubjectMapping = await StreamSubjectMapping.findOne({
        streamId: streamId,
        subjectId: subject._id,
        status: "Active",
      });

      if (!streamSubjectMapping) {
        return res.status(400).json({
          success: false,
          message: "Subject does not belong to the selected stream",
        });
      }
    }

    // Find examination center
    const center = await ExaminationCenter.findOne({
      code: centerCode.toUpperCase(),
      status: "Active",
    });

    if (!center) {
      return res.status(404).json({
        success: false,
        message: "Examination center not found or inactive",
      });
    }

    // Check for duplicate scripts across all bundles
    // Scripts from seating arrangements are full barcodes like "SCRIPT-EC001-REG202500134-R1-S1"
    // When saved, they become: "BUNDLE-ECON101-001-SCRIPT-EC001-REG202500134-R1-S1"
    // So we need to check if any script ending with the provided script number already exists
    const upperScripts = scripts.map(s => s.toUpperCase().trim());
    
    // Extract script numbers (last part after last dash) from the provided scripts
    // e.g., "S1" from "SCRIPT-EC001-REG202500134-R1-S1"
    const scriptNumbers = upperScripts.map(s => {
      const parts = s.split('-');
      return parts[parts.length - 1];
    });

    console.log("Checking for duplicate scripts:", {
      providedScripts: upperScripts,
      extractedScriptNumbers: scriptNumbers,
      subjectId: subject._id,
      centerCode: centerCode.toUpperCase()
    });

    // Check if any scripts with the same script number exist for this subject
    // Script barcodes in DB are like: "BUNDLE-ECON101-001-SCRIPT-EC001-REG202500134-R1-S1"
    // So we check if any script ends with the script number
    // Note: We should check for the full script identifier (originalScriptNumber or the full script code from seating arrangement)
    // to avoid false positives from just matching the last segment "S1"
    
    // Extract the full script identifier from the provided scripts
    // Scripts from seating arrangements are like: "SCRIPT-EC003-REG30738818-R1-S1"
    // We need to check if this exact pattern exists in any existing script's originalScriptNumber or scriptBarcode
    const existingScripts = await Script.find({
      subjectId: subject._id,
      $or: upperScripts.map(scriptCode => ({
        $or: [
          { originalScriptNumber: scriptCode },
          { scriptBarcode: { $regex: new RegExp(scriptCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } }
        ]
      }))
    }).select('scriptBarcode originalScriptNumber bundleId').lean();

    if (existingScripts.length > 0) {
      // Fetch bundle information for all found scripts
      const bundleIds = [...new Set(existingScripts.map(s => s.bundleId).filter(Boolean))];
      const bundles = await Bundle.find({ _id: { $in: bundleIds } })
        .select('barcode bundleNumber')
        .lean();
      const bundleMap = new Map(bundles.map(b => [b._id.toString(), b]));

      const duplicateInfo = existingScripts.map(script => {
        const scriptNum = script.scriptBarcode.split('-').pop();
        const bundle = script.bundleId ? bundleMap.get(script.bundleId.toString()) : null;
        return {
          scriptBarcode: script.scriptBarcode,
          scriptNumber: scriptNum,
          originalScriptNumber: script.originalScriptNumber || 'N/A',
          bundleBarcode: bundle?.barcode || 'Unknown (Bundle may be deleted)',
          bundleNumber: bundle?.bundleNumber || 'Unknown'
        };
      });

      console.log("Duplicate scripts found:", duplicateInfo);

      return res.status(400).json({
        success: false,
        message: `Duplicate script numbers found in existing bundles`,
        duplicates: duplicateInfo,
        error: `The following script numbers already exist: ${duplicateInfo.map(d => `${d.originalScriptNumber || d.scriptNumber} (in bundle ${d.bundleBarcode})`).join(', ')}`
      });
    }

    // Get the next unique bundle number with retry mechanism to handle concurrent requests
    let bundleNumber = "001";
    let barcode = "";
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loop
    
    while (attempts < maxAttempts) {
      // Find the highest bundle number for this subject
      const lastBundle = await Bundle.findOne({
        subjectCode: subjectCode.toUpperCase(),
      })
        .sort({ bundleNumber: -1 })
        .limit(1);

      if (lastBundle && lastBundle.bundleNumber) {
        const lastNum = parseInt(lastBundle.bundleNumber);
        bundleNumber = String(lastNum + 1).padStart(3, "0");
      } else {
        bundleNumber = "001";
      }

      // Generate bundle barcode
      barcode = `BUNDLE-${subjectCode.toUpperCase()}-${bundleNumber}`;

      // Check if barcode already exists (double-check for uniqueness)
      const existingBundle = await Bundle.findOne({ 
        barcode: barcode.toUpperCase() 
      });
      
      if (!existingBundle) {
        // Barcode is unique, break out of loop
        break;
      }
      
      // If barcode exists, increment and try again
      attempts++;
      console.log(`Bundle barcode ${barcode} already exists, trying next number...`);
    }

    if (attempts >= maxAttempts) {
      return res.status(500).json({
        success: false,
        message: "Unable to generate unique bundle barcode after multiple attempts. Please try again.",
      });
    }

    console.log(`Generated unique bundle barcode: ${barcode}`);

    // Create bundle
    const bundle = new Bundle({
      bundleNumber,
      barcode,
      courseId: courseId || undefined,
      streamId: streamId || undefined,
      semesterId: semesterId || undefined,
      subjectCode: subjectCode.toUpperCase(),
      subjectId: subject._id,
      centerCode: centerCode.toUpperCase(),
      centerId: center._id,
      scriptCount,
      scripts: scripts.map(s => s.toUpperCase()),
      createdBy: req.user?._id,
    });

    await bundle.save();

    // Create individual script documents for each script number
    // Note: Scripts are created WITHOUT scannedAt timestamp, WITHOUT hallTicketNumber, and WITHOUT status
    // Status and scannedAt will be set when scripts are actually registered via script registration endpoint
    // We need to work around the model default by using insertMany with explicit null values
    const scriptDocuments = scripts.map((scriptNumber, index) => {
      return {
        scriptBarcode: `${barcode}-${scriptNumber.toUpperCase()}`,
        originalScriptNumber: scriptNumber.toUpperCase(),
        bundleId: bundle._id,
        bundleBarcode: barcode,
        subjectCode: subjectCode.toUpperCase(),
        subjectId: subject._id,
        sequenceNumber: index + 1,
        status: null, // Explicitly set to null - will be set to "Registered" when actually scanned
        scannedAt: null, // Explicitly set to null - will be set when actually scanned
        // Don't set scannedBy - will be set when script is actually registered
      };
    });

    // Insert all script documents
    await Script.insertMany(scriptDocuments);

    // Populate before sending response
    await bundle.populate([
      { path: "courseId", select: "name code" },
      { path: "streamId", select: "name code" },
      { path: "semesterId", select: "name code description" },
      { path: "subjectId", select: "name code" },
      { path: "centerId", select: "name code" },
      { path: "createdBy", select: "fullName email" },
    ]);

    res.status(201).json({
      success: true,
      message: "Bundle created successfully",
      data: bundle,
    });
  } catch (error) {
    console.error("Error creating bundle:", error);
    
    // Handle duplicate key error (MongoDB unique constraint violation)
    if (error.code === 11000 || error.code === 11001) {
      const field = Object.keys(error.keyPattern || {})[0] || 'barcode';
      return res.status(400).json({
        success: false,
        message: `Bundle ${field} must be unique. A bundle with this ${field} already exists.`,
        error: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error creating bundle",
      error: error.message,
    });
  }
};

// @route   PUT /api/examination/bundles/:id/dispatch
// @desc    Dispatch a bundle
// @access  Private
const dispatchBundle = async (req, res) => {
  try {
    const bundle = await Bundle.findById(req.params.id);

    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: "Bundle not found",
      });
    }

    if (bundle.status !== "Created") {
      return res.status(400).json({
        success: false,
        message: `Bundle is in ${bundle.status} status. Cannot dispatch.`,
      });
    }

    bundle.status = "Dispatched";
    bundle.dispatchedAt = new Date();
    await bundle.save();

    await bundle.populate([
      { path: "courseId", select: "name code" },
      { path: "streamId", select: "name code" },
      { path: "semesterId", select: "name code description" },
      { path: "subjectId", select: "name code" },
      { path: "centerId", select: "name code" },
    ]);

    res.status(200).json({
      success: true,
      message: "Bundle dispatched successfully",
      data: bundle,
    });
  } catch (error) {
    console.error("Error dispatching bundle:", error);
    res.status(500).json({
      success: false,
      message: "Error dispatching bundle",
      error: error.message,
    });
  }
};

// @route   PUT /api/examination/bundles/receive
// @desc    Receive a bundle at spot centre
// @access  Private
const receiveBundle = async (req, res) => {
  try {
    const { barcode } = req.body;

    if (!barcode) {
      return res.status(400).json({
        success: false,
        message: "Bundle barcode is required",
      });
    }

    const bundle = await Bundle.findOne({ barcode: barcode.toUpperCase() });

    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: "Bundle not found. Please check the barcode.",
      });
    }

    if (bundle.status !== "Dispatched") {
      return res.status(400).json({
        success: false,
        message: `Bundle is in ${bundle.status} status. Cannot receive.`,
      });
    }

    // When bundle is received, mark all scripts as registered
    // This means all scripts are considered received/registered at the spot centre
    // Also extract hall ticket numbers from originalScriptNumber (format: SCRIPT-EC003-REG30738818-R1-S1)
    const receiveDate = new Date();
    
    // Get all scripts for this bundle to extract hall ticket numbers
    const scripts = await Script.find({ bundleId: bundle._id });
    
    // Update each script with hall ticket number extracted from originalScriptNumber
    // Optionally fetch student details from SeatingArrangement if available
    for (const script of scripts) {
      let hallTicketNumber = script.hallTicketNumber;
      let rollNumber = script.rollNumber;
      let studentName = script.studentName;
      
      // Extract hall ticket number from originalScriptNumber if not already set
      // Pattern: SCRIPT-EC003-REG30738818-R1-S1 -> extract REG30738818
      if (!hallTicketNumber && script.originalScriptNumber) {
        const originalScriptUpper = script.originalScriptNumber.toUpperCase();
        // Look for REG followed by alphanumeric characters
        const regMatch = originalScriptUpper.match(/REG[A-Z0-9]+/);
        if (regMatch) {
          hallTicketNumber = regMatch[0];
        }
      }
      
      // Try to fetch student details from SeatingArrangement if originalScriptNumber matches scriptCode
      if (script.originalScriptNumber && (!studentName || !rollNumber)) {
        try {
          const arrangement = await SeatingArrangement.findOne({
            scriptCode: script.originalScriptNumber.toUpperCase(),
            status: "Active",
          });
          
          if (arrangement) {
            // registrationNumber in seating arrangements is the hall ticket number
            hallTicketNumber = hallTicketNumber || arrangement.registrationNumber || null;
            studentName = studentName || arrangement.studentName || null;
            rollNumber = rollNumber || arrangement.rollNumber || null;
          }
        } catch (error) {
          // Log error but don't fail the entire operation
          console.error(`Error fetching seating arrangement for script ${script._id}:`, error.message);
        }
      }
      
      // Update script with registration details
      await Script.findByIdAndUpdate(script._id, {
        $set: {
          status: "Registered",
          scannedAt: receiveDate,
          scannedBy: req.user?._id,
          hallTicketNumber: hallTicketNumber || script.hallTicketNumber,
          rollNumber: rollNumber || script.rollNumber,
          studentName: studentName || script.studentName,
        },
      });
    }

    // Update bundle with registered scripts count (should equal total script count since all are registered)
    bundle.registeredScriptsCount = bundle.scriptCount;
    bundle.status = "Received";
    bundle.receivedAtSpotCentre = receiveDate;
    bundle.receivedBy = req.user?._id;
    await bundle.save();

    await bundle.populate([
      { path: "courseId", select: "name code" },
      { path: "streamId", select: "name code" },
      { path: "subjectId", select: "name code" },
      { path: "centerId", select: "name code" },
      { path: "receivedBy", select: "fullName email" },
    ]);

    res.status(200).json({
      success: true,
      message: "Bundle received successfully",
      data: bundle,
    });
  } catch (error) {
    console.error("Error receiving bundle:", error);
    res.status(500).json({
      success: false,
      message: "Error receiving bundle",
      error: error.message,
    });
  }
};

// @route   DELETE /api/examination/bundles/:id
// @desc    Delete a bundle (only if not dispatched)
// @access  Private
const deleteBundle = async (req, res) => {
  try {
    const bundle = await Bundle.findById(req.params.id);

    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: "Bundle not found",
      });
    }

    if (bundle.status !== "Created") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete bundle that has been dispatched or received",
      });
    }

    await Bundle.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Bundle deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting bundle:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting bundle",
      error: error.message,
    });
  }
};

// @route   PUT /api/examination/bundles/:id/mark-evaluated
// @desc    Mark a hall ticket number as evaluated
// @access  Private
const markHallTicketEvaluated = async (req, res) => {
  try {
    const { id } = req.params;
    const { hallTicketNumber } = req.body;

    if (!hallTicketNumber) {
      return res.status(400).json({
        success: false,
        message: "Hall ticket number is required",
      });
    }

    const bundle = await Bundle.findById(id);
    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: "Bundle not found",
      });
    }

    // Check if hall ticket number is within the bundle's range
    if (bundle.startHallTicketNumber && bundle.endHallTicketNumber) {
      const hallTicketNumbers = generateHallTicketNumbers(
        bundle.startHallTicketNumber,
        bundle.endHallTicketNumber
      );
      if (!hallTicketNumbers.includes(hallTicketNumber)) {
        return res.status(400).json({
          success: false,
          message: "Hall ticket number is not within this bundle's range",
        });
      }
    }

    // Initialize scripts array if it doesn't exist
    if (!bundle.scripts) {
      bundle.scripts = [];
    }

    // Add hall ticket number if not already present
    if (!bundle.scripts.includes(hallTicketNumber)) {
      bundle.scripts.push(hallTicketNumber);
      await bundle.save();
    }

    // Update the allocation's evaluatedScripts count
    const EvaluatorAllocation = require("../../../models/examination/postExamination/EvaluatorAllocation");
    const allocation = await EvaluatorAllocation.findOne({
      bundleId: bundle._id,
      status: "Active",
    });

    if (allocation) {
      allocation.evaluatedScripts = bundle.scripts.length;
      if (allocation.evaluatedScripts >= allocation.allocatedScripts) {
        allocation.status = "Completed";
      }
      await allocation.save();
    }

    res.status(200).json({
      success: true,
      message: "Hall ticket marked as evaluated",
      data: {
        bundle: bundle,
        evaluatedCount: bundle.scripts.length,
        totalCount: bundle.scriptCount,
      },
    });
  } catch (error) {
    console.error("Error marking hall ticket as evaluated:", error);
    res.status(500).json({
      success: false,
      message: "Error marking hall ticket as evaluated",
      error: error.message,
    });
  }
};

// Helper function to generate hall ticket numbers from start to end
const generateHallTicketNumbers = (start, end) => {
  if (!start || !end) return [];

  const extractNumber = (ht) => {
    const match = ht.match(/(\d+)$/);
    return match ? parseInt(match[1]) : null;
  };

  const extractPrefix = (ht) => {
    const match = ht.match(/^(.+?)(\d+)$/);
    return match ? match[1] : ht;
  };

  const startNum = extractNumber(start);
  const endNum = extractNumber(end);
  const prefix = extractPrefix(start);

  if (startNum === null || endNum === null || startNum > endNum) {
    return [];
  }

  const hallTickets = [];
  for (let i = startNum; i <= endNum; i++) {
    const numStr = i.toString();
    const originalStartNumStr = startNum.toString();
    const padding = originalStartNumStr.length;
    const paddedNum = numStr.padStart(padding, '0');
    hallTickets.push(prefix + paddedNum);
  }

  return hallTickets;
};

module.exports = {
  getAllBundles,
  getBundleById,
  getBundleByBarcode,
  createBundle,
  dispatchBundle,
  receiveBundle,
  deleteBundle,
  markHallTicketEvaluated,
};
