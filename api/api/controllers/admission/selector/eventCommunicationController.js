const EventCommunication = require("../../../models/admission/selector/EventCommunication");

// @desc Get all event communications
// @route GET /api/event-communications
exports.getEventCommunications = async (req, res) => {
  try {
    const communications = await EventCommunication.find()
      .populate("campusId", "name code")
      .populate("courseId", "name code")
      .populate("branchId", "name code")
      .sort({ createdAt: -1 });

    res.json(communications);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create event communication
// @route POST /api/event-communications
exports.createEventCommunication = async (req, res) => {
  try {
    const Student = require("../../../models/admission/FromStudents");
    const CourseStreamMapping = require("../../../models/examination/selector/CourseStreamMapping");
    const emailService = require("../../../utils/emailService");
    const smsService = require("../../../utils/smsService");

    const { campusId, courseId, branchId, title, message, eventDate, eventTime, venue, channels, targets, studentIds } = req.body;

    // Sanitize optional IDs to avoid BSON casting errors on empty strings
    const sanitizeId = (id) => (id && id !== "" && id !== "null" && id !== "undefined") ? id : null;
    const normalizeArray = (val) => Array.isArray(val) ? val : (val ? [val] : []);

    // 1. Find Students
    let query = { status: "Admitted" };
    
    // If specific student IDs are provided, prioritize them
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      query._id = { $in: studentIds };
    } else {
      const cleanCampusId = sanitizeId(campusId);
      if (cleanCampusId) query.campus = cleanCampusId;

      const cleanBranchId = sanitizeId(branchId);
      const cleanCourseId = sanitizeId(courseId);

      if (cleanBranchId) {
        const mappings = await CourseStreamMapping.find({ streamId: cleanBranchId }).select("_id");
        query.courseStreamMappingId = { $in: mappings.map(m => m._id) };
      } else if (cleanCourseId) {
        const mappings = await CourseStreamMapping.find({ courseId: cleanCourseId }).select("_id");
        query.courseStreamMappingId = { $in: mappings.map(m => m._id) };
      }
    }
    
    const students = await Student.find(query)
      .select("firstName lastName email phone altPhone fatherEmail motherEmail fatherName motherName")
      .lean();

    // 2. Prepare
    const emailRecipients = [];
    const smsRecipients = [];
    const selectedChannels = normalizeArray(channels);
    const targetGroups = targets ? normalizeArray(targets) : ["Students"];

    students.forEach(student => {
      const studentName = `${student.firstName} ${student.lastName}`;
      if (targetGroups.includes("Students")) {
        if (selectedChannels.includes("Email") && student.email) emailRecipients.push({ email: student.email, name: studentName });
        if (selectedChannels.includes("SMS") && student.phone) smsRecipients.push({ phone: student.phone, name: studentName });
      }
      if (targetGroups.includes("Parents")) {
        const parentPhone = student.altPhone || student.phone;
        if (selectedChannels.includes("SMS") && parentPhone) smsRecipients.push({ phone: parentPhone, name: `Parent of ${studentName}` });

        // Send email to father if email exists
        if (selectedChannels.includes("Email") && student.fatherEmail) {
          emailRecipients.push({
            email: student.fatherEmail,
            name: student.fatherName || `Father of ${studentName}`,
          });
        }

        // Send email to mother if email exists
        if (selectedChannels.includes("Email") && student.motherEmail) {
          emailRecipients.push({
            email: student.motherEmail,
            name: student.motherName || `Mother of ${studentName}`,
          });
        }
      }
    });

    // 3. Send
    if (emailRecipients.length > 0) {
      const emailBody = `
        <h3>Event Invitation: ${title}</h3>
        <p>Dear {{name}},</p>
        <p>${message}</p>
        <p><strong>When:</strong> ${eventDate} at ${eventTime}</p>
        <p><strong>Where:</strong> ${venue}</p>
        <br>
        <p>Regards,<br>Events Committee</p>
      `;
      await emailService.sendBatch(emailRecipients, title, emailBody);
    }

    if (smsRecipients.length > 0) {
      const smsBody = `Event: ${title}. ${eventDate} @ ${venue}.`;
      await smsService.sendBatch(smsRecipients, smsBody);
    }

    const communicationData = {
      ...req.body,
      campusId: cleanCampusId,
      courseId: cleanCourseId,
      branchId: cleanBranchId,
      sentCount: students.length,
      status: "Sent"
    };

    const communication = new EventCommunication(communicationData);
    await communication.save();

    const populated = await EventCommunication.findById(communication._id)
      .populate("campusId", "name code")
      .populate("courseId", "name code")
      .populate("branchId", "name code");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating event communication:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Get event communication by ID
// @route GET /api/event-communications/:id
exports.getEventCommunicationById = async (req, res) => {
  try {
    const communication = await EventCommunication.findById(req.params.id)
      .populate("campusId", "name code")
      .populate("courseId", "name code")
      .populate("branchId", "name code");

    if (!communication) {
      return res.status(404).json({ message: "Communication not found" });
    }

    res.json(communication);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Delete event communication
// @route DELETE /api/event-communications/:id
exports.deleteEventCommunication = async (req, res) => {
  try {
    const communication = await EventCommunication.findByIdAndDelete(req.params.id);

    if (!communication) {
      return res.status(404).json({ message: "Communication not found" });
    }

    res.json({ message: "Communication deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
