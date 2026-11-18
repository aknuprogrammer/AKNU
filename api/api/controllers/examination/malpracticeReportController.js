const MalpracticeReport = require("../../models/examination/MalpracticeReport");
const Subject = require("../../models/examination/selector/Subject");
const Invigilator = require("../../models/examination/selector/Invigilator");
const ExaminationCenter = require("../../models/examination/selector/ExaminationCenter");

// @desc Get all malpractice reports
// @route GET /api/examination/malpractice-reports
exports.getMalpracticeReports = async (req, res) => {
  try {
    const {
      examDate,
      subjectId,
      rollNumber,
      invigilatorEmployeeId,
    } = req.query;

    const query = {};
    if (examDate) query.examDate = new Date(examDate);
    if (subjectId) query.subjectId = subjectId;
    if (rollNumber) query.rollNumber = rollNumber;
    if (invigilatorEmployeeId)
      query.invigilatorEmployeeId = invigilatorEmployeeId;

    const reports = await MalpracticeReport.find(query)
      .populate("studentId", "registrationNumber name")
      .populate("subjectId", "code name")
      .populate("examinationCenterId", "name code")
      .populate("invigilatorId", "name invigilatorCode")
      .sort({ examDate: -1, createdAt: -1 });

    res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get malpractice report by ID
// @route GET /api/examination/malpractice-reports/:id
exports.getMalpracticeReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await MalpracticeReport.findById(id)
      .populate("studentId", "registrationNumber name")
      .populate("subjectId", "code name")
      .populate("examinationCenterId", "name code")
      .populate("invigilatorId", "name invigilatorCode");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Malpractice report not found",
      });
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Create malpractice report
// @route POST /api/examination/malpractice-reports
exports.createMalpracticeReport = async (req, res) => {
  try {
    const reportData = req.body;
    console.log("Received report data:", JSON.stringify(reportData, null, 2));

    // Ensure examDate is a Date object if it's a string
    if (reportData.examDate && typeof reportData.examDate === 'string') {
      reportData.examDate = new Date(reportData.examDate);
    }

    // Populate subject details
    if (reportData.subjectId) {
      const subject = await Subject.findById(reportData.subjectId);
      if (subject) {
        reportData.subjectCode = subject.code;
        reportData.subjectName = subject.name;
      }
    }

    // Populate invigilator details
    if (reportData.invigilatorId) {
      const invigilator = await Invigilator.findById(reportData.invigilatorId);
      if (invigilator) {
        reportData.invigilatorName = invigilator.name;
        reportData.invigilatorCode = invigilator.invigilatorCode;
      }
    }

    // Populate examination center details
    if (reportData.examinationCenterId) {
      const center = await ExaminationCenter.findById(reportData.examinationCenterId);
      if (center) {
        reportData.examinationCenterName = center.name;
        reportData.examinationCenterCode = center.code;
      }
    }

    // Validate required fields
    if (!reportData.examDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid Data",
        error: "Exam date is required",
      });
    }

    if (!reportData.subjectId) {
      return res.status(400).json({
        success: false,
        message: "Invalid Data",
        error: "Subject is required",
      });
    }

    if (!reportData.examinationCenterId) {
      return res.status(400).json({
        success: false,
        message: "Invalid Data",
        error: "Examination center is required",
      });
    }

    if (!reportData.rollNumber || !reportData.rollNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid Data",
        error: "Roll number is required",
      });
    }

    if (!reportData.invigilatorId) {
      return res.status(400).json({
        success: false,
        message: "Invalid Data",
        error: "Invigilator is required",
      });
    }

    if (!reportData.invigilatorEmployeeId || !reportData.invigilatorEmployeeId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid Data",
        error: "Invigilator employee ID is required",
      });
    }

    if (!reportData.description || !reportData.description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid Data",
        error: "Description is required",
      });
    }

    // Generate report number before creating
    if (!reportData.reportNumber) {
      try {
        const year = new Date().getFullYear();
        const count = await MalpracticeReport.countDocuments({
          examDate: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1),
          },
        });
        reportData.reportNumber = `ER-${year}-${String(count + 1).padStart(5, "0")}`;
      } catch (error) {
        console.error("Error generating report number:", error);
        // Fallback
        const year = new Date().getFullYear();
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        reportData.reportNumber = `ER-${year}-${String(timestamp).slice(-8)}${String(random).padStart(3, "0")}`;
      }
    }

    console.log("Creating report with data:", JSON.stringify(reportData, null, 2));
    const report = new MalpracticeReport(reportData);
    await report.save();
    console.log("Report saved successfully:", report.reportNumber);

    await report.populate([
      { path: "studentId", select: "registrationNumber name" },
      { path: "subjectId", select: "code name" },
      { path: "examinationCenterId", select: "name code" },
      { path: "invigilatorId", select: "name invigilatorCode" },
    ]);

    res.status(201).json({
      success: true,
      data: report,
      message: "Malpractice report created successfully",
    });
  } catch (error) {
    console.error("Error creating malpractice report:", error);
    console.error("Error stack:", error.stack);
    res.status(400).json({
      success: false,
      message: "Invalid Data",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// @desc Update malpractice report
// @route PUT /api/examination/malpractice-reports/:id
exports.updateMalpracticeReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;


    const report = await MalpracticeReport.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("studentId", "registrationNumber name")
      .populate("subjectId", "code name")
      .populate("examinationCenterId", "name code")
      .populate("invigilatorId", "name invigilatorCode");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Malpractice report not found",
      });
    }

    res.json({
      success: true,
      data: report,
      message: "Malpractice report updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid Data",
      error: error.message,
    });
  }
};

// @desc Delete malpractice report
// @route DELETE /api/examination/malpractice-reports/:id
exports.deleteMalpracticeReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await MalpracticeReport.findByIdAndDelete(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Malpractice report not found",
      });
    }

    res.json({
      success: true,
      message: "Malpractice report deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

