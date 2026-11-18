const AdmissionCommunication = require("../../../models/admission/selector/AdmissionCommunication");
const Student = require("../../../models/admission/FromStudents");
const CourseStreamMapping = require("../../../models/examination/selector/CourseStreamMapping");

exports.createCommunication = async (req, res) => {
  try {
    const { type, campusId, courseId, branchId, studentIds, targetType, title, message, startDate, timings, channels } = req.body;

    let query = { status: "Admitted" }; // Ensure we only target admitted students

    // If specific student IDs are provided, prioritize them
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      query._id = { $in: studentIds };
    } else {
      if (campusId) {
        query.campus = campusId;
      }

      // Strict Filtering Logic
      if (branchId) {
        // 1. Filter by Stream (Branch)
        const mappings = await CourseStreamMapping.find({ streamId: branchId }).select("_id");
        query.courseStreamMappingId = { $in: mappings.map(m => m._id) };
      } else if (courseId) {
        // 2. Filter by Course (if no Stream selected)
        const mappings = await CourseStreamMapping.find({ courseId: courseId }).select("_id");
        query.courseStreamMappingId = { $in: mappings.map(m => m._id) };
      }
    }

    // Fetch matching students for messaging
    const students = await Student.find(query)
      .select("firstName lastName email phone altPhone fatherEmail motherEmail fatherName motherName")
      .lean();

    const studentCount = students.length;

    // Services
    const emailService = require("../../../utils/emailService");
    const smsService = require("../../../utils/smsService");

    // Definitions (Restored)
    const targets = (targetType || "").split(",").map(t => t.trim());
    const selectedChannels = Array.isArray(channels) ? channels : ["App"];

    console.log(`--- [Communication Triggered: ${type}] ---`);
    console.log(`Targeting ${studentCount} students in ${targets.join(" & ")} group(s)`);

    // Prepare batch lists
    const emailRecipients = [];
    const smsRecipients = [];

    students.forEach(student => {
      const studentName = `${student.firstName} ${student.lastName}`;

      // 1. Process Students
      if (targets.includes("Students")) {
        if (selectedChannels.includes("Email") && student.email) {
          emailRecipients.push({ email: student.email, name: studentName });
        }
        if (selectedChannels.includes("SMS") && student.phone) {
          smsRecipients.push({ phone: student.phone, name: studentName });
        }
      }

      // 2. Process Parents
      if (targets.includes("Parents")) {
        const parentPhone = student.altPhone || student.phone; // Fallback

        // Send email to father if email exists
        if (selectedChannels.includes("Email") && student.fatherEmail) {
          emailRecipients.push({ email: student.fatherEmail, name: student.fatherName || `Father of ${studentName}` });
        }

        // Send email to mother if email exists
        if (selectedChannels.includes("Email") && student.motherEmail) {
          emailRecipients.push({ email: student.motherEmail, name: student.motherName || `Mother of ${studentName}` });
        }

        if (selectedChannels.includes("SMS") && parentPhone) {
          smsRecipients.push({ phone: parentPhone, name: `Parent of ${studentName}` });
        }
      }
    });

    // Send Batches
    if (emailRecipients.length > 0) {
      const emailBody = `
        <h3>${title}</h3>
        <p>Dear {{name}},</p>
        <p>${message}</p>
        <p><strong>Date:</strong> ${startDate || "N/A"}</p>
        <p><strong>Timings:</strong> ${timings || "N/A"}</p>
        <br>
        <p>Regards,<br>College Administration</p>
      `;
      await emailService.sendBatch(emailRecipients, title, emailBody);
    }

    if (smsRecipients.length > 0) {
      const smsBody = `${title}: ${message}. Date: ${startDate}`;
      await smsService.sendBatch(smsRecipients, smsBody);
    }

    const communication = new AdmissionCommunication({
      type,
      campusId: campusId || null,
      courseId: courseId || null,
      branchId,
      targetType,
      title,
      message,
      startDate,
      timings,
      channels: selectedChannels,
      sentCount: studentCount,
      status: "Sent"
    });

    await communication.save();
    res.status(201).json(communication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCommunications = async (req, res) => {
  try {
    const communications = await AdmissionCommunication.find()
      .populate("campusId", "name")
      .populate("courseId", "name")
      .populate("branchId", "name")
      .sort({ createdAt: -1 });
    res.json(communications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
