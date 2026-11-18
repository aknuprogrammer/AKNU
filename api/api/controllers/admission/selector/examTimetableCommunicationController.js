const ExamTimetableCommunication = require("../../../models/admission/selector/ExamTimetableCommunication");

// @desc Get all exam timetable communications
// @route GET /api/exam-timetable-communications
exports.getExamTimetableCommunications = async (req, res) => {
  try {
    const communications = await ExamTimetableCommunication.find()
      .populate("campusId", "name code")
      .populate("courseId", "name code")
      .populate("branchId", "name code")
      .populate("semesterId", "numberOfSemesters description")
      .sort({ createdAt: -1 });

    res.json(communications);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create exam timetable communication
// @route POST /api/exam-timetable-communications
exports.createExamTimetableCommunication = async (req, res) => {
  try {
    const Student = require("../../../models/admission/FromStudents");
    const CourseStreamMapping = require("../../../models/examination/selector/CourseStreamMapping");
    const emailService = require("../../../utils/emailService");
    const smsService = require("../../../utils/smsService");

    const data = { ...req.body };
    const { campusId, courseId, branchId, semesterId, semesterNumber, title, message, examStartDate, channels, targets, studentIds } = data;

    // Sanitize fields for saving
    const sanitizeId = (id) => (id && id !== "" && id !== "null" && id !== "undefined") ? id : null;
    const normalizeArray = (val) => Array.isArray(val) ? val : (val ? [val] : []);

    // Add file data if present
    if (req.file) {
      data.fileData = req.file.buffer;
      data.contentType = req.file.mimetype;
      data.originalName = req.file.originalname;
    }

    // Sanitize fields for saving
    data.campusId = sanitizeId(campusId);
    data.courseId = sanitizeId(courseId);
    data.branchId = sanitizeId(branchId);
    data.semesterId = sanitizeId(semesterId);

    const communication = new ExamTimetableCommunication(data);
    await communication.save();

    // --- Start Notification Logic ---
    // 1. Find Students
    let query = { status: "Admitted" };
    
    // If specific student IDs are provided, prioritize them
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      query._id = { $in: studentIds };
    } else {
      const cleanCampusId = sanitizeId(campusId);
      if (cleanCampusId) query.campus = cleanCampusId;

      const mappingQuery = {};
      if (sanitizeId(courseId)) mappingQuery.courseId = sanitizeId(courseId);
      if (sanitizeId(branchId)) mappingQuery.streamId = sanitizeId(branchId);
      if (sanitizeId(semesterId)) mappingQuery.semesterId = sanitizeId(semesterId);
      if (semesterNumber && semesterNumber !== "undefined" && semesterNumber !== "null") {
        mappingQuery.semesterNumber = parseInt(semesterNumber, 10);
      }

      console.log("[Exam Comm] Mapping Query:", mappingQuery);

      if (Object.keys(mappingQuery).length > 0) {
        const mappings = await CourseStreamMapping.find(mappingQuery).select("_id");
        console.log(`[Exam Comm] Found ${mappings.length} mappings`);
        query.courseStreamMappingId = { $in: mappings.map((m) => m._id) };
      }
    }

    console.log("[Exam Comm] Student Query:", query);

    const students = await Student.find(query)
      .select("firstName lastName email phone altPhone fatherEmail motherEmail fatherName motherName")
      .lean();

    console.log(`[Exam Comm] Found ${students.length} students matching query`);

    // 2. Prepare Batches
    const emailRecipients = [];
    const smsRecipients = [];
    const selectedChannels = normalizeArray(channels);
    const targetGroups = targets ? normalizeArray(targets) : ["Students"];

    console.log("[Exam Comm] Target Groups:", targetGroups, "Channels:", selectedChannels);

    students.forEach((student) => {
      const studentName = `${student.firstName} ${student.lastName}`;
      if (targetGroups.includes("Students")) {
        if (selectedChannels.includes("Email")) {
          if (student.email) {
            emailRecipients.push({ email: student.email, name: studentName });
          } else {
            console.log(`[Exam Comm] Missing email for student: ${studentName}`);
          }
        }
        if (selectedChannels.includes("SMS") && student.phone) smsRecipients.push({ phone: student.phone, name: studentName });
      }
      if (targetGroups.includes("Parents")) {
        const parentPhone = student.altPhone || student.phone;
        if (selectedChannels.includes("SMS") && parentPhone) smsRecipients.push({ phone: parentPhone, name: `Parent of ${studentName}` });

        if (selectedChannels.includes("Email")) {
          if (student.fatherEmail) {
            emailRecipients.push({ email: student.fatherEmail, name: student.fatherName || `Father of ${studentName}` });
          }
          if (student.motherEmail) {
            emailRecipients.push({ email: student.motherEmail, name: student.motherName || `Mother of ${studentName}` });
          }
          if (!student.fatherEmail && !student.motherEmail) {
            console.log(`[Exam Comm] Missing parent emails for student: ${studentName}`);
          }
        }
      }
    });

    console.log(`[Exam Comm] Prepared ${emailRecipients.length} email recipients and ${smsRecipients.length} SMS recipients`);

    // 3. Prepare Attachment
    const attachments = [];
    if (req.file && req.file.buffer) {
      attachments.push({
        filename: req.file.originalname || 'exam_timetable.pdf',
        content: req.file.buffer,
        contentType: req.file.mimetype || 'application/pdf'
      });
      console.log(`[Exam Comm] Attachment prepared: ${req.file.originalname} (${req.file.size} bytes)`);
    } else {
      console.log(`[Exam Comm] WARNING: No file attachment found`);
    }

    // 4. Send
    if (emailRecipients.length > 0) {
      const emailBody = `
        <h3>Exam Timetable Published: ${title}</h3>
        <p>Dear {{name}},</p>
        <p>${message}</p>
        <p><strong>Exam Start Date:</strong> ${examStartDate}</p>
        <br>
        <p>Please find the examination timetable attached to this email.</p>
        <p>Regards,<br>Examination Branch</p>
      `;
      const sentCount = await emailService.sendBatch(emailRecipients, title, emailBody, attachments);
      console.log(`[Exam Comm] Batch email result: ${sentCount} sent successfully`);
    }

    if (smsRecipients.length > 0) {
      const smsBody = `Exam Alert: ${title}. Starts: ${examStartDate}. Check app for timetable.`;
      const sentCount = await smsService.sendBatch(smsRecipients, smsBody);
      console.log(`[Exam Comm] Batch SMS result: ${sentCount} sent successfully`);
    }
    // --- End Notification Logic ---

    // Don't return the heavy file buffer in the response
    const populated = await ExamTimetableCommunication.findById(communication._id)
      .select("-fileData")
      .populate("campusId", "name code")
      .populate("courseId", "name code")
      .populate("branchId", "name code")
      .populate("semesterId", "numberOfSemesters description");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating exam timetable communication:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Get PDF file
// @route GET /api/exam-timetable-communications/:id/pdf
exports.getExamTimetablePdf = async (req, res) => {
  try {
    const communication = await ExamTimetableCommunication.findById(req.params.id).select("fileData contentType originalName");

    if (!communication || !communication.fileData) {
      return res.status(404).json({ message: "PDF not found" });
    }

    res.set("Content-Type", communication.contentType || "application/pdf");
    res.set("Content-Disposition", `inline; filename="${communication.originalName || 'timetable.pdf'}"`);
    res.send(communication.fileData);
  } catch (error) {
    console.error("Error serving PDF:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get exam timetable communication by ID
// @route GET /api/exam-timetable-communications/:id
exports.getExamTimetableCommunicationById = async (req, res) => {
  try {
    const communication = await ExamTimetableCommunication.findById(req.params.id)
      .populate("campusId", "name code")
      .populate("courseId", "name code")
      .populate("branchId", "name code")
      .populate("semesterId", "numberOfSemesters description");

    if (!communication) {
      return res.status(404).json({ message: "Communication not found" });
    }

    res.json(communication);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Delete exam timetable communication
// @route DELETE /api/exam-timetable-communications/:id
exports.deleteExamTimetableCommunication = async (req, res) => {
  try {
    const communication = await ExamTimetableCommunication.findByIdAndDelete(req.params.id);

    if (!communication) {
      return res.status(404).json({ message: "Communication not found" });
    }

    res.json({ message: "Communication deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
