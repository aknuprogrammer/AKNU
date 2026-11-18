const FeePendingCommunication = require("../../../models/admission/selector/FeePendingCommunication");

// @desc Get all fee pending communications
// @route GET /api/fee-pending-communications
exports.getFeePendingCommunications = async (req, res) => {
  try {
    const communications = await FeePendingCommunication.find()
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

// @desc Create fee pending communication
// @route POST /api/fee-pending-communications
exports.createFeePendingCommunication = async (req, res) => {
  try {
    const Student = require("../../../models/admission/FromStudents");
    const CourseStreamMapping = require("../../../models/examination/selector/CourseStreamMapping");
    const emailService = require("../../../utils/emailService");
    const smsService = require("../../../utils/smsService");

    const { campusId, courseId, branchId, semesterId, semesterNumber, title, message, feeAmount, dueDate, channels, targets } = req.body;

    // 1. Find Students
    let query = { status: "Admitted" };
    if (campusId) query.campus = campusId;

    const mappingQuery = {};
    if (courseId) mappingQuery.courseId = courseId;
    if (branchId) mappingQuery.streamId = branchId;
    if (semesterId) mappingQuery.semesterId = semesterId;
    if (semesterNumber) mappingQuery.semesterNumber = semesterNumber;

    // Sanitize optional IDs to avoid BSON casting errors on empty strings
    const sanitizeId = (id) => (id && id !== "" && id !== "null" && id !== "undefined") ? id : null;
    const normalizeArray = (val) => Array.isArray(val) ? val : (val ? [val] : []);

    if (Object.keys(mappingQuery).length > 0) {
      const mappings = await CourseStreamMapping.find(mappingQuery).select("_id");
      query.courseStreamMappingId = { $in: mappings.map(m => m._id) };
    }

    // Students eligible for fee
    const studentsFull = await Student.find(query)
      .select("firstName lastName email phone altPhone fatherEmail motherEmail fatherName motherName registrationNumber hallTicketNo")
      .lean();

    // 2. Filter out Paid Students (ExaminationPaymentTransaction)
    const ExaminationPaymentTransaction = require("../../../models/examination/ExaminationPaymentTransaction");

    // Find successful transactions for these students
    const studentIds = studentsFull.map(s => s.registrationNumber || s.hallTicketNo).filter(Boolean);

    let students = studentsFull;

    if (studentIds.length > 0) {
      const paidTransactions = await ExaminationPaymentTransaction.find({
        registration_number: { $in: studentIds },
        payment_status: { $in: ["SUCCESS", "success"] }
      }).select("registration_number");

      const paidRegNos = paidTransactions.map(t => t.registration_number);

      // Filter logic
      students = studentsFull.filter(s => {
        const id = s.registrationNumber || s.hallTicketNo;
        return !paidRegNos.includes(id);
      });

      console.log(`[Fee Pending] Total: ${studentsFull.length}, Paid: ${paidRegNos.length}, Target: ${students.length}`);
    }

    // 3. Prepare Batches
    const emailRecipients = [];
    const smsRecipients = [];
    const selectedChannels = normalizeArray(channels);
    const targetGroups = targets ? normalizeArray(targets) : ["Students"];

    students.forEach(student => {
      const studentName = `${student.firstName} ${student.lastName}`;

      if (targetGroups.includes("Students")) {
        if (selectedChannels.includes("Email") && student.email) {
          emailRecipients.push({ email: student.email, name: studentName });
        }
        if (selectedChannels.includes("SMS") && student.phone) {
          smsRecipients.push({ phone: student.phone, name: studentName });
        }
      }

      if (targetGroups.includes("Parents")) {
        const parentPhone = student.altPhone || student.phone;
        if (selectedChannels.includes("SMS") && parentPhone) {
          smsRecipients.push({ phone: parentPhone, name: `Parent of ${studentName}` });
        }

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

    // 3. Send Messages
    if (emailRecipients.length > 0) {
      const emailBody = `
        <h3>Fee Reminder: ${title}</h3>
        <p>Dear {{name}},</p>
        <p>${message}</p>
        <p><strong>Pending Amount:</strong> ₹${feeAmount}</p>
        <p><strong>Due Date:</strong> ${dueDate}</p>
        <br>
        <p>Regards,<br>Accounts Department</p>
      `;
      await emailService.sendBatch(emailRecipients, title, emailBody);
    }

    if (smsRecipients.length > 0) {
      const smsBody = `Fee Alert: ${title}. Amount: ${feeAmount}. Due: ${dueDate}`;
      await smsService.sendBatch(smsRecipients, smsBody);
    }

    // 4. Save
    const communicationData = {
      ...req.body,
      campusId: sanitizeId(campusId),
      courseId: sanitizeId(courseId),
      branchId: sanitizeId(branchId),
      semesterId: sanitizeId(semesterId),
      sentCount: students.length,
      status: "Sent"
    };

    const communication = new FeePendingCommunication(communicationData);

    await communication.save();

    const populated = await FeePendingCommunication.findById(communication._id)
      .populate("campusId", "name code")
      .populate("courseId", "name code")
      .populate("branchId", "name code")
      .populate("semesterId", "numberOfSemesters description");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating fee pending communication:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Get fee pending communication by ID
// @route GET /api/fee-pending-communications/:id
exports.getFeePendingCommunicationById = async (req, res) => {
  try {
    const communication = await FeePendingCommunication.findById(req.params.id)
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

// @desc Delete fee pending communication
// @route DELETE /api/fee-pending-communications/:id
exports.deleteFeePendingCommunication = async (req, res) => {
  try {
    const communication = await FeePendingCommunication.findByIdAndDelete(req.params.id);

    if (!communication) {
      return res.status(404).json({ message: "Communication not found" });
    }

    res.json({ message: "Communication deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
