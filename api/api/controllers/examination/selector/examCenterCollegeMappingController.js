// @desc Get all exam center-college mappings

const ExamCenterCollegeMapping = require("../../../models/examination/selector/ExamCenterCollegeMapping");

// @route GET /api/examination/exam-center-college-mappings
exports.getExamCenterCollegeMappings = async (req, res) => {
  try {
    const mappings = await ExamCenterCollegeMapping.find()
      .populate("examCenterId", "code name address capacity")
      .populate("collegeId", "code name location")
      .populate("invigilatorId", "invigilatorCode name role")
      .sort({ createdAt: -1 });
    res.json(mappings);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create an exam center-college mapping
// @route POST /api/examination/exam-center-college-mappings
exports.createExamCenterCollegeMapping = async (req, res) => {
  try {
    const {
      examCenterId,
      examCenterName,
      examCenterCode,
      collegeId,
      collegeName,
      collegeCode,
      fromRoll,
      toRoll,
      roomName,
      roomCode,
      invigilatorId,
      invigilatorName,
      invigilatorCode,
      status,
      notes,
    } = req.body;

    // Auto-populate examCenterName and examCenterCode if not provided
    let finalExamCenterName = examCenterName;
    let finalExamCenterCode = examCenterCode;
    if (examCenterId && (!examCenterName || !examCenterCode)) {
      const ExaminationCenter = require("../../../models/examination/selector/ExaminationCenter");
      const examCenter = await ExaminationCenter.findById(examCenterId);
      if (examCenter) {
        finalExamCenterName = examCenterName || examCenter.name;
        finalExamCenterCode = examCenterCode || examCenter.code;
      }
    }

    // Auto-populate collegeName and collegeCode if not provided
    let finalCollegeName = collegeName;
    let finalCollegeCode = collegeCode;
    if (collegeId && (!collegeName || !collegeCode)) {
      const College = require("../../../models/admission/selector/College");
      const college = await College.findById(collegeId);
      if (college) {
        finalCollegeName = collegeName || college.name;
        finalCollegeCode = collegeCode || college.code;
      }
    }

    // Auto-populate invigilatorName and invigilatorCode if not provided
    let finalInvigilatorName = invigilatorName;
    let finalInvigilatorCode = invigilatorCode;
    if (invigilatorId && (!invigilatorName || !invigilatorCode)) {
      const Invigilator = require("../../../models/examination/selector/Invigilator");
      const invigilator = await Invigilator.findById(invigilatorId);
      if (invigilator) {
        finalInvigilatorName = invigilatorName || invigilator.name;
        finalInvigilatorCode = invigilatorCode || invigilator.invigilatorCode;
      }
    }

    // Validate roll numbers are alphanumeric
    if (fromRoll) {
      const fromRollTrimmed = String(fromRoll).trim();
      if (!/^[A-Za-z0-9]+$/.test(fromRollTrimmed)) {
        return res.status(400).json({
          message: "Validation Error",
          error: "From Roll Number must contain only letters and numbers (alphanumeric)",
        });
      }
    }

    if (toRoll) {
      const toRollTrimmed = String(toRoll).trim();
      if (!/^[A-Za-z0-9]+$/.test(toRollTrimmed)) {
        return res.status(400).json({
          message: "Validation Error",
          error: "To Roll Number must contain only letters and numbers (alphanumeric)",
        });
      }
    }

    // Validate that fromRoll is less than toRoll (using string comparison for alphanumeric)
    if (fromRoll && toRoll) {
      const fromRollTrimmed = String(fromRoll).trim();
      const toRollTrimmed = String(toRoll).trim();
      if (fromRollTrimmed.localeCompare(toRollTrimmed) >= 0) {
        return res.status(400).json({
          message: "Validation Error",
          error: "From Roll Number must be less than To Roll Number",
        });
      }
    }

    // Convert empty strings to null/undefined for optional ObjectId fields
    const finalInvigilatorId = invigilatorId && String(invigilatorId).trim() !== "" && invigilatorId !== null
      ? invigilatorId 
      : null;

    const mapping = new ExamCenterCollegeMapping({
      examCenterId,
      examCenterName: finalExamCenterName,
      examCenterCode: finalExamCenterCode,
      collegeId,
      collegeName: finalCollegeName,
      collegeCode: finalCollegeCode,
      fromRoll,
      toRoll,
      roomName,
      roomCode,
      invigilatorId: finalInvigilatorId,
      invigilatorName: finalInvigilatorId ? finalInvigilatorName : null,
      invigilatorCode: finalInvigilatorId ? finalInvigilatorCode : null,
      status,
      notes,
    });

    await mapping.save();

    // Populate before sending response
    await mapping.populate("examCenterId", "code name address capacity");
    await mapping.populate("collegeId", "code name location");
    if (mapping.invigilatorId) {
      await mapping.populate("invigilatorId", "invigilatorCode name role");
    }

    res.status(201).json(mapping);
  } catch (error) {
    console.error("Error creating exam center-college mapping:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate mapping",
        error: "This exam center-college combination already exists",
      });
    }
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update an exam center-college mapping
// @route PUT /api/examination/exam-center-college-mappings/:id
exports.updateExamCenterCollegeMapping = async (req, res) => {
  try {
    const { id } = req.params;
    const { fromRoll, toRoll } = req.body;

    // Validate roll numbers are alphanumeric if provided
    if (fromRoll) {
      const fromRollTrimmed = String(fromRoll).trim();
      if (!/^[A-Za-z0-9]+$/.test(fromRollTrimmed)) {
        return res.status(400).json({
          message: "Validation Error",
          error: "From Roll Number must contain only letters and numbers (alphanumeric)",
        });
      }
    }

    if (toRoll) {
      const toRollTrimmed = String(toRoll).trim();
      if (!/^[A-Za-z0-9]+$/.test(toRollTrimmed)) {
        return res.status(400).json({
          message: "Validation Error",
          error: "To Roll Number must contain only letters and numbers (alphanumeric)",
        });
      }
    }

    // Validate that fromRoll is less than toRoll (using string comparison for alphanumeric)
    // Get existing mapping to check both old and new values
    const existingMapping = await ExamCenterCollegeMapping.findById(id);
    if (existingMapping) {
      const finalFromRoll = fromRoll ? String(fromRoll).trim() : existingMapping.fromRoll;
      const finalToRoll = toRoll ? String(toRoll).trim() : existingMapping.toRoll;
      
      if (finalFromRoll && finalToRoll) {
        if (finalFromRoll.localeCompare(finalToRoll) >= 0) {
          return res.status(400).json({
            message: "Validation Error",
            error: "From Roll Number must be less than To Roll Number",
          });
        }
      }
    }

    // Convert empty strings to null/undefined for optional ObjectId fields
    if (req.body.invigilatorId !== undefined) {
      const invigilatorIdValue = req.body.invigilatorId;
      req.body.invigilatorId = invigilatorIdValue && String(invigilatorIdValue).trim() !== "" 
        ? invigilatorIdValue 
        : null;
      
      // Also clear invigilatorName and invigilatorCode if invigilatorId is being cleared
      if (!req.body.invigilatorId) {
        req.body.invigilatorName = null;
        req.body.invigilatorCode = null;
      }
    }

    const updatedMapping = await ExamCenterCollegeMapping.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true, // Ensure model validators run
      }
    )
      .populate("examCenterId", "code name address capacity")
      .populate("collegeId", "code name location")
      .populate("invigilatorId", "invigilatorCode name role");
    if (!updatedMapping)
      return res
        .status(404)
        .json({ message: "Exam center-college mapping not found" });
    res.json(updatedMapping);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete an exam center-college mapping
// @route DELETE /api/examination/exam-center-college-mappings/:id
exports.deleteExamCenterCollegeMapping = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMapping = await ExamCenterCollegeMapping.findByIdAndDelete(id);
    if (!deletedMapping)
      return res
        .status(404)
        .json({ message: "Exam center-college mapping not found" });
    res.json({ message: "Exam center-college mapping deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// @desc Get single exam center-college mapping by ID
// @route GET /api/examination/exam-center-college-mappings/:id
exports.getExamCenterCollegeMappingById = async (req, res) => {
  try {
    const { id } = req.params;
    const mapping = await ExamCenterCollegeMapping.findById(id)
      .populate("examCenterId", "code name address capacity")
      .populate("collegeId", "code name location")
      .populate("invigilatorId", "invigilatorCode name role");
    if (!mapping)
      return res
        .status(404)
        .json({ message: "Exam center-college mapping not found" });
    res.json(mapping);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get mappings by examCenterId
// @route GET /api/examination/exam-center-college-mappings/exam-center/:examCenterId
exports.getMappingsByExamCenter = async (req, res) => {
  try {
    const { examCenterId } = req.params;
    const mappings = await ExamCenterCollegeMapping.find({ examCenterId })
      .populate("examCenterId", "code name address capacity")
      .populate("collegeId", "code name location")
      .populate("invigilatorId", "invigilatorCode name role")
      .sort({ createdAt: -1 });
    res.json(mappings);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get mappings by collegeId
// @route GET /api/examination/exam-center-college-mappings/college/:collegeId
exports.getMappingsByCollege = async (req, res) => {
  try {
    const { collegeId } = req.params;
    const mappings = await ExamCenterCollegeMapping.find({ collegeId })
      .populate("examCenterId", "code name address capacity")
      .populate("collegeId", "code name location")
      .populate("invigilatorId", "invigilatorCode name role")
      .sort({ createdAt: -1 });
    res.json(mappings);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get mappings by invigilatorId
// @route GET /api/examination/exam-center-college-mappings/invigilator/:invigilatorId
exports.getMappingsByInvigilator = async (req, res) => {
  try {
    const { invigilatorId } = req.params;
    const mappings = await ExamCenterCollegeMapping.find({ invigilatorId })
      .populate("examCenterId", "code name address capacity")
      .populate("collegeId", "code name location")
      .populate("invigilatorId", "invigilatorCode name role")
      .sort({ createdAt: -1 });
    res.json(mappings);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


