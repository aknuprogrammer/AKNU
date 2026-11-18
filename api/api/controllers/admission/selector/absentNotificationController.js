const AbsentNotification = require("../../../models/admission/selector/AbsentNotification");
const Student = require("../../../models/admission/FromStudents");

// @desc Get all absent notifications
// @route GET /api/absent-notifications
exports.getAbsentNotifications = async (req, res) => {
  try {
    const notifications = await AbsentNotification.find()
      .populate("campusId", "name code")
      .populate("courseId", "name code")
      .populate("branchId", "name code")
      .populate(
        "studentId",
        "firstName lastName registrationNumber hallTicketNo"
      )
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create absent notification
// @route POST /api/absent-notifications
exports.createAbsentNotification = async (req, res) => {
  try {
    const emailService = require("../../../utils/emailService");
    const smsService = require("../../../utils/smsService");

    const data = { ...req.body };
    console.log("Absent notification request data:", data);
    const {
      courseId,
      branchId,
      semesterId,
      studentId,
      absentDate,
      remarks,
      channels,
      targets,
    } = data;

    // Sanitize optional IDs to avoid BSON casting errors on empty strings
    const sanitizeId = (id) =>
      id && id !== "" && id !== "null" && id !== "undefined" ? id : null;
    const normalizeArray = (val) =>
      Array.isArray(val) ? val : val ? [val] : [];

    // Validate required fields FIRST before doing anything else
    if (!absentDate) {
      return res
        .status(400)
        .json({ message: "Invalid Data", error: "absentDate is required" });
    }

    // Validate and convert absentDate
    const absentDateObj =
      absentDate instanceof Date ? absentDate : new Date(absentDate);
    if (isNaN(absentDateObj.getTime())) {
      return res.status(400).json({
        message: "Invalid Data",
        error: "absentDate must be a valid date",
      });
    }

    // campusId is optional now - get it from data if provided
    const cleanCampusId = sanitizeId(data.campusId);

    // Ensure title and message are provided (required fields)
    const defaultTitle = data.title || "Absent Notification";
    const defaultMessage =
      data.message ||
      `This is to inform you that your ward was marked absent on ${absentDateObj.toLocaleDateString()}.${
        remarks ? ` Remarks: ${remarks}` : ""
      }`;

    let students = [];

    // If specific student IDs are provided, prioritize them
    if (
      req.body.studentIds &&
      Array.isArray(req.body.studentIds) &&
      req.body.studentIds.length > 0
    ) {
      console.log(
        `Fetching ${req.body.studentIds.length} students by IDs:`,
        req.body.studentIds
      );
      students = await Student.find({ _id: { $in: req.body.studentIds } })
        .select(
          "firstName lastName email phone altPhone fatherEmail motherEmail fatherName motherName campus"
        )
        .lean();
      console.log(`Found ${students.length} students`);

      if (students.length === 0) {
        return res.status(400).json({
          message: "Invalid Data",
          error: "No students found with the provided student IDs",
        });
      }
    } else {
      // Filter by course/branch/semester using CourseStreamMapping
      const CourseStreamMapping = require("../../../models/examination/selector/CourseStreamMapping");
      let query = { status: "Admitted" };

      // campusId is optional - only filter by it if provided
      if (cleanCampusId) query.campus = cleanCampusId;

      const cleanBranchId = sanitizeId(branchId);
      const cleanCourseId = sanitizeId(courseId);
      const cleanSemesterId = sanitizeId(semesterId);

      if (cleanBranchId) {
        const mappingQuery = { streamId: cleanBranchId };
        if (cleanSemesterId) mappingQuery.semesterId = cleanSemesterId;
        const mappings = await CourseStreamMapping.find(mappingQuery).select(
          "_id"
        );
        query.courseStreamMappingId = { $in: mappings.map((m) => m._id) };
      } else if (cleanCourseId) {
        const mappingQuery = { courseId: cleanCourseId };
        if (cleanSemesterId) mappingQuery.semesterId = cleanSemesterId;
        const mappings = await CourseStreamMapping.find(mappingQuery).select(
          "_id"
        );
        query.courseStreamMappingId = { $in: mappings.map((m) => m._id) };
      }

      students = await Student.find(query)
        .select(
          "firstName lastName email phone altPhone fatherEmail motherEmail fatherName motherName"
        )
        .lean();
    }

    // Validate that we have students to notify BEFORE processing
    if (students.length === 0) {
      console.error("No students found to notify");
      return res.status(400).json({
        message: "Invalid Data",
        error:
          "No students found to notify. Please check the filters or student IDs.",
      });
    }

    console.log(`Found ${students.length} students to notify`);

    // 2. Prepare Batches
    const emailRecipients = [];
    const smsRecipients = [];
    // Validate and normalize channels - ensure they're valid enum values
    const validChannels = ["Email", "SMS", "App"];
    const selectedChannels = normalizeArray(channels).filter((ch) =>
      validChannels.includes(ch)
    );
    // Default to Email if no valid channels provided
    const finalChannels =
      selectedChannels.length > 0 ? selectedChannels : ["Email"];
    const targetGroups = targets ? normalizeArray(targets) : ["Parents"];

    students.forEach((student) => {
      const studentName = `${student.firstName} ${student.lastName}`;
      if (targetGroups.includes("Students")) {
        if (finalChannels.includes("Email") && student.email)
          emailRecipients.push({ email: student.email, name: studentName });
        if (finalChannels.includes("SMS") && student.phone)
          smsRecipients.push({ phone: student.phone, name: studentName });
      }
      if (targetGroups.includes("Parents")) {
        const parentPhone = student.altPhone || student.phone;
        if (finalChannels.includes("SMS") && parentPhone)
          smsRecipients.push({
            phone: parentPhone,
            name: `Parent of ${studentName}`,
          });

        // Send email to father if email exists
        if (finalChannels.includes("Email") && student.fatherEmail) {
          emailRecipients.push({
            email: student.fatherEmail,
            name: student.fatherName || `Father of ${studentName}`,
          });
        }

        // Send email to mother if email exists
        if (finalChannels.includes("Email") && student.motherEmail) {
          emailRecipients.push({
            email: student.motherEmail,
            name: student.motherName || `Mother of ${studentName}`,
          });
        }
      }
    });

    // 3. Send
    if (emailRecipients.length > 0) {
      // Use custom message if provided, otherwise use default
      const emailBody =
        data.message ||
        `
        <h3>Absent Notification</h3>
        <p>Dear {{name}},</p>
        <p>This is to inform you that your ward was marked absent on <strong>${absentDate}</strong>.</p>
        ${remarks ? `<p>Remarks: ${remarks}</p>` : ""}
        <br>
        <p>Please ensure regular attendance for academic progress.</p>
        <p>Regards,<br>Attendance Cell</p>
      `;
      const emailTitle = data.title || "Absent Notification";
      await emailService.sendBatch(emailRecipients, emailTitle, emailBody);
    }

    if (smsRecipients.length > 0) {
      const smsBody = `Absent Alert: Student was absent on ${absentDate}.${
        remarks ? ` Remarks: ${remarks}` : ""
      }`;
      await smsService.sendBatch(smsRecipients, smsBody);
    }

    console.log(`Processing notifications for ${students.length} students`);

    // Create notification records for each student (or a single bulk record)
    // For bulk notifications, we'll create one record per student for accurate tracking
    const notifications = [];

    // absentDateObj is already validated and converted above

    for (const student of students) {
      try {
        // Ensure student has _id
        if (!student._id) {
          console.error(`Student missing _id:`, student);
          continue;
        }

        const notificationData = {
          title: defaultTitle,
          message: defaultMessage,
          absentDate: absentDateObj,
          courseId: sanitizeId(courseId),
          branchId: sanitizeId(branchId),
          studentId: student._id,
          sentCount: 1,
          status: "Sent",
          channels: finalChannels,
          subject: data.subject || null,
        };

        // Only add campusId if provided
        if (cleanCampusId) {
          notificationData.campusId = cleanCampusId;
        }

        console.log(`Creating notification for student ${student._id}:`, {
          title: notificationData.title,
          studentId: notificationData.studentId,
          absentDate: notificationData.absentDate,
        });

        const notification = new AbsentNotification(notificationData);

        // Validate before saving
        const validationError = notification.validateSync();
        if (validationError) {
          console.error(
            `Validation error for student ${student._id}:`,
            validationError
          );
          throw validationError;
        }

        await notification.save();
        notifications.push(notification);
      } catch (saveError) {
        console.error(
          `Error saving notification for student ${student._id || "unknown"}:`,
          saveError.message || saveError
        );
        if (saveError.errors) {
          console.error("Validation errors:", saveError.errors);
        }
        // Continue with other students even if one fails
      }
    }

    // Return the first notification (or all if needed)
    if (notifications.length === 0) {
      return res.status(400).json({ message: "No students to notify" });
    }

    const populated = await AbsentNotification.findById(notifications[0]._id)
      .populate("campusId", "name code")
      .populate("courseId", "name code")
      .populate("branchId", "name code")
      .populate("studentId", "firstName lastName hallTicketNo");

    res
      .status(201)
      .json({ ...populated.toObject(), sentCount: students.length });
  } catch (error) {
    console.error("Error creating absent notification:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
    });
    res.status(400).json({
      message: "Invalid Data",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// @desc Get absent notification by ID
// @route GET /api/absent-notifications/:id
exports.getAbsentNotificationById = async (req, res) => {
  try {
    const notification = await AbsentNotification.findById(req.params.id)
      .populate("campusId", "name code")
      .populate("courseId", "name code")
      .populate("branchId", "name code")
      .populate(
        "studentId",
        "firstName lastName registrationNumber hallTicketNo"
      );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Delete absent notification
// @route DELETE /api/absent-notifications/:id
exports.deleteAbsentNotification = async (req, res) => {
  try {
    const notification = await AbsentNotification.findByIdAndDelete(
      req.params.id
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
