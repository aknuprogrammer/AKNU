const FromStudents = require("../../models/admission/FromStudents");
const Payment = require("../../models/admission/Payment");
const College = require("../../models/admission/selector/College");
const Course = require("../../models/admission/selector/Course");
const admission = require("../../models/payments/admission");
const CourseStreamMapping = require("../../models/examination/selector/CourseStreamMapping");
const Stream = require("../../models/examination/selector/Stream");
const DocumentAcknowledgment = require("../../models/admission/DocumentAcknowledgment");
const mongoose = require("mongoose");

// Helper function to parse semester text to numeric semester number
const parseSemesterToNumber = (semesterText) => {
  if (!semesterText) return null;

  const text = semesterText.toString().trim();

  // Pattern 1: "Xst Year - Yst Semester" -> semester = (X-1)*2 + Y
  const pattern1 = text.match(
    /(\d+)(?:st|nd|rd|th)\s+Year\s*-\s*(\d+)(?:st|nd|rd|th)\s+Semester/i
  );
  if (pattern1) {
    const year = parseInt(pattern1[1]);
    const semesterInYear = parseInt(pattern1[2]);
    return (year - 1) * 2 + semesterInYear;
  }

  // Pattern 2: Just extract first number found
  const numMatch = text.match(/\d+/);
  if (numMatch) {
    const num = parseInt(numMatch[0]);
    if (num >= 1 && num <= 8) {
      return num;
    }
  }

  // Pattern 3: Roman numerals
  const romanMap = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
    VIII: 8,
  };
  const romanMatch = text.match(/\b([IVX]+)\b/i);
  if (romanMatch && romanMap[romanMatch[1].toUpperCase()]) {
    return romanMap[romanMatch[1].toUpperCase()];
  }

  return null;
};

// Helper function to fetch subjects for a student using courseId, stream, and semester
const fetchSubjectsForStudent = async (courseId, streamName, semesterYear) => {
  try {
    if (!courseId || !semesterYear) {
      return {
        success: false,
        subjects: [],
        error: "Course ID and semester are required",
      };
    }

    // Parse semester to get numeric semester number
    const semesterNumber = parseSemesterToNumber(semesterYear);
    if (!semesterNumber) {
      return {
        success: false,
        subjects: [],
        error: "Could not parse semester",
      };
    }

    // Find Stream by name and courseId (if streamName provided)
    let stream = null;
    if (streamName && streamName.trim()) {
      const streamNameTrimmed = streamName.trim();

      // Try exact match first
      stream = await Stream.findOne({
        name: { $regex: new RegExp(`^${streamNameTrimmed}$`, "i") },
        courseId: courseId,
        status: "Active",
      });

      // If not found, try partial match
      if (!stream) {
        stream = await Stream.findOne({
          name: { $regex: new RegExp(streamNameTrimmed, "i") },
          courseId: courseId,
          status: "Active",
        });
      }

      // Try by code
      if (!stream) {
        stream = await Stream.findOne({
          code: { $regex: new RegExp(`^${streamNameTrimmed}$`, "i") },
          courseId: courseId,
          status: "Active",
        });
      }
    }

    // Try to find CourseStreamMapping
    let mapping = null;

    if (stream) {
      // Try with specific stream
      mapping = await CourseStreamMapping.findOne({
        courseId: courseId,
        streamId: stream._id,
        semesterNumber: semesterNumber,
        status: "Active",
      })
        .populate({
          path: "streamId",
          select: "name code",
        })
        .populate({
          path: "subjects.subjectId",
          select: "name code",
        });

      console.log("🔍 Found mapping with stream:", {
        hasMapping: !!mapping,
        streamName: stream.name,
        streamId: stream._id.toString(),
        mappingStreamName: mapping?.streamId?.name,
      });
    }

    // If no mapping found with stream, try without stream (for courses without streams)
    if (!mapping) {
      mapping = await CourseStreamMapping.findOne({
        courseId: courseId,
        semesterNumber: semesterNumber,
        status: "Active",
      })
        .populate({
          path: "streamId",
          select: "name code",
        })
        .populate({
          path: "subjects.subjectId",
          select: "name code",
        });

      console.log("🔍 Found mapping without stream requirement:", {
        hasMapping: !!mapping,
        streamId: mapping?.streamId?._id?.toString(),
        streamName: mapping?.streamId?.name,
      });
    }

    // If still no mapping, try any mapping for this course and semester
    if (!mapping) {
      mapping = await CourseStreamMapping.findOne({
        courseId: courseId,
        semesterNumber: semesterNumber,
        status: "Active",
      })
        .populate({
          path: "streamId",
          select: "name code",
        })
        .populate({
          path: "subjects.subjectId",
          select: "name code",
        });

      console.log("🔍 Found mapping without specific stream:", {
        hasMapping: !!mapping,
        streamId: mapping?.streamId?._id?.toString(),
        streamName: mapping?.streamId?.name,
      });
    }

    if (!mapping || !mapping.subjects || mapping.subjects.length === 0) {
      return {
        success: false,
        subjects: [],
        error: `No subjects found for this course, stream, and semester combination`,
      };
    }

    // Format subjects
    const subjects = mapping.subjects.map((sub, index) => ({
      SubjectName: sub.subjectId?.name || "N/A",
      SubjectCode: sub.subjectId?.code || "N/A",
      SubjectOrder: index + 1,
      maxMarks: sub.maxMarks || 100,
      passMarks: sub.passMarks || 40,
    }));

    // Get the actual stream name from the mapping (most accurate)
    const actualStreamName =
      mapping.streamId?.name || stream?.name || streamName || null;

    // Generate semesterYear string from semesterNumber
    let semesterYearString = null;
    if (mapping.semesterNumber) {
      const year = Math.ceil(mapping.semesterNumber / 2);
      const semesterInYear = ((mapping.semesterNumber - 1) % 2) + 1;
      const yearOrdinal =
        year === 1
          ? "1st"
          : year === 2
            ? "2nd"
            : year === 3
              ? "3rd"
              : `${year}th`;
      const semesterOrdinal =
        semesterInYear === 1
          ? "1st"
          : semesterInYear === 2
            ? "2nd"
            : semesterInYear === 3
              ? "3rd"
              : `${semesterInYear}th`;
      semesterYearString = `${yearOrdinal} Year - ${semesterOrdinal} Semester`;
    }

    return {
      success: true,
      subjects: subjects,
      stream: actualStreamName,
      streamFromMapping: mapping.streamId?.name || null, // Stream found in CourseStreamMapping
      semesterFromMapping: semesterYearString, // Semester from CourseStreamMapping
    };
  } catch (err) {
    console.error("Error fetching subjects for student:", err);
    return { success: false, subjects: [], error: err.message };
  }
};

// helper: normalize docs from strings to {status, comment}
const normalizeDocuments = (docs) => {
  const normalized = {};
  Object.keys(docs || {}).forEach((key) => {
    const val = docs[key];
    normalized[key] = {
      submitted: val === "yes" ? "yes" : "no",
      verified: "not_verified", // officer will update later
      comment: "",
    };
  });
  return normalized;
};

exports.createStudent = async (req, res) => {
  try {
    // -------------------------------
    // Parse academicRecords if string
    // -------------------------------
    if (
      req.body.academicRecords &&
      typeof req.body.academicRecords === "string"
    ) {
      req.body.academicRecords = JSON.parse(req.body.academicRecords);
    }

    if (req.body.academicRecords && Array.isArray(req.body.academicRecords)) {
      req.body.academicRecords = req.body.academicRecords.map(
        (record, index) => ({
          id: record.id || `acad-${Date.now()}-${index}`,
          collegeName: record.collegeName || "",
          qualification: record.qualification || "",
          specialization: record.specialization || "", // ✅ new
          completionYear: record.completionYear || "",
          result: record.result || "", // ✅ replaces marks
          achievements: record.achievements || "", // ✅ new
        })
      );
    }

    // -------------------------------
    // Normalize documents
    // -------------------------------
    if (req.body.documents && typeof req.body.documents === "string") {
      req.body.documents = JSON.parse(req.body.documents);
    }

    if (req.body.documents && typeof req.body.documents === "object") {
      Object.keys(req.body.documents).forEach((key) => {
        const doc = req.body.documents[key];

        // Convert base64 string to Buffer
        if (doc.file && typeof doc.file === "string") {
          let base64String = doc.file;
          if (base64String.startsWith("data:")) {
            base64String = base64String.split(",")[1];
          }
          try {
            doc.file = Buffer.from(base64String, "base64");
          } catch (err) {
            console.error(
              `❌ Failed to decode base64 for docId=${doc.docId}`,
              err
            );
            doc.file = undefined;
          }
        }
      });
    }

    // -------------------------------
    // Check duplicates
    // -------------------------------
    const conditions = [];
    // console.log("----eq.body",req.body)
    if (req.body.phone) {
      conditions.push({ phone: req.body.phone });
    }

    if (req.body.aadharNumber) {
      conditions.push({ aadharNumber: req.body.aadharNumber });
    }

    if (req.body.hallTicketNo) {
      conditions.push({ hallTicketNo: req.body.hallTicketNo });
    }

    let existingStudent = null;

    if (conditions.length > 0) {
      existingStudent = await FromStudents.findOne({
        $or: conditions,
      });
    }

    if (existingStudent) {
      return res.status(409).json({
        message:
          "A student with the same phone, Aadhaar number, or hall ticket already exists.",
        student: existingStudent,
      });
    }

    // -------------------------------
    // Convert documents object to array
    // -------------------------------
    if (req.body.documents && !Array.isArray(req.body.documents)) {
      req.body.documents = Object.keys(req.body.documents).map(
        (key) => req.body.documents[key]
      );
    }

    // -------------------------------
    // Create student
    // -------------------------------
    const student = new FromStudents(req.body);
    const savedStudent = await student.save();

    // -------------------------------
    // Initial Payment Record
    // -------------------------------
    const payment = new admission({
      student: savedStudent._id,
      status: "pending",
      amount: 0,
      currency: "INR",
      receipt: `STUDENT-${savedStudent._id}-${Date.now()}`,
      gateway: null,
      rawResponse: null,
      razorpayPaymentId: `init-${savedStudent._id}-${Date.now()}`,
    });
    await payment.save();

    // Link payment
    savedStudent.payments = [payment._id];
    await savedStudent.save();

    res.status(201).json({
      message: "Student and initial payment record created",
      student: savedStudent,
      payment,
    });
  } catch (err) {
    console.error("Error creating student:", err);
    res.status(400).json({ error: err.message, details: err.errors });
  }
};

// Get all students
exports.getStudents = async (req, res) => {
  try {
    const students = await FromStudents.find()
      .populate({
        path: "campus", // field in StudentSchema
        model: "College", // Mongoose model for colleges
        select: "name code address city state", // fields you want to fetch
      })
      .populate({
        path: "batch",
        select: "code description",
      })
      .populate({
        path: "courseStreamMappingId",
        populate: [
          {
            path: "courseId",
            model: "Course_data",
            select: "name code",
          },
          {
            path: "streamId",
            model: "Stream",
            select: "name code",
          }
        ]
      });

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get all students and attach admission payments if they exist
exports.getStudentsWithPayments = async (req, res) => {
  try {
    // Fetch all students with populated courseStreamMappingId
    const students = await FromStudents.find()
      .populate({
        path: "courseStreamMappingId",
        populate: [
          {
            path: "courseId",
            model: "Course_data",
            select: "name code duration",
          },
          {
            path: "streamId",
            model: "Stream",
            select: "name code",
          },
          {
            path: "semesterId",
            model: "Semester",
            select: "numberOfSemesters description",
          },
        ],
      })
      .populate({
        path: "batch",
        model: "AcademicYear",
        select: "code startDate endDate description",
      });

    // Fetch colleges and payments
    const colleges = await College.find();
    // console.log("_______colleges", colleges);
    const payments = await Payment.find();

    // Map extra data into students
    const studentsWithData = students.map((student) => {
      const college = colleges.find(
        (c) => c._id.toString() === student.campus?.toString()
      );
      const course = student.courseStreamMappingId?.courseId || null;
      const stream = student.courseStreamMappingId?.streamId || null;
      const semester = student.courseStreamMappingId?.semesterId || null;
      const paymentForStudent = payments.find(
        (p) => p.studentId.toString() === student._id.toString()
      );

      return {
        ...student.toObject(),
        college: college || null,
        course: course || null,
        stream: stream || null,
        semester: semester || null,
        admissionPayment: paymentForStudent || null,
      };
    });

    // console.log("___studentsWithPayments", studentsWithData);
    res.json(studentsWithData);
  } catch (err) {
    console.error("Error fetching students with payments:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await FromStudents.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update student application
exports.updateStudent = async (req, res) => {
  try {
    // console.log("___ req.body,", req.body);

    const student = await FromStudents.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // If a correction is provided
    if (req.body.note && req.body.flag) {
      student.corrections = student.corrections || [];
      student.corrections.push({
        reason: req.body.note,
        flag: req.body.flag,
      });
    }

    // Handle documents update (similar to createStudent)
    if (req.body.documents) {
      let documents = req.body.documents;
      
      // Parse if string
      if (typeof documents === "string") {
        try {
          documents = JSON.parse(documents);
        } catch (err) {
          console.error("Failed to parse documents:", err);
          documents = [];
        }
      }

      // Convert to array if object
      if (documents && typeof documents === "object" && !Array.isArray(documents)) {
        documents = Object.keys(documents).map((key) => documents[key]);
      }

      // Process each document
      if (Array.isArray(documents)) {
        documents = documents.map((doc) => {
          const processedDoc = { ...doc };

          // Convert base64 string to Buffer if present
          if (doc.file && typeof doc.file === "string") {
            let base64String = doc.file;
            if (base64String.startsWith("data:")) {
              base64String = base64String.split(",")[1];
            }
            try {
              processedDoc.file = Buffer.from(base64String, "base64");
            } catch (err) {
              console.error(`Failed to decode base64 for docId=${doc.docId}`, err);
              processedDoc.file = undefined;
            }
          }

          // Ensure required fields have defaults
          if (!processedDoc.docId) {
            processedDoc.docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          }
          if (!processedDoc.submitted) {
            processedDoc.submitted = "no";
          }
          if (!processedDoc.verified) {
            processedDoc.verified = "not_verified";
          }

          return processedDoc;
        });

        // Update documents (replace existing or append based on your logic)
        // Option 1: Replace all documents
        student.documents = documents;
        
        // Option 2: Append to existing (uncomment if you want to append instead)
        // student.documents = [...(student.documents || []), ...documents];
      }
    }

    // Update other fields if there are any
    const { note, flag, documents, ...otherFields } = req.body;
    if (Object.keys(otherFields).length > 0) {
      Object.assign(student, otherFields);
    }

    const updatedStudent = await student.save();
    res.json({
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Delete student application
exports.deleteStudent = async (req, res) => {
  try {
    const student = await FromStudents.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update student selection status (selected / not_selected)
exports.updateSelectionStatus = async (req, res) => {
  try {
    const { status } = req.body; // "selected" or "not_selected"
    const student = await FromStudents.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ message: `Student marked as ${status}`, student });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add documents to student by registration number
exports.addDocumentsByRegistrationNumber = async (req, res) => {
  try {
    const { registrationNumber } = req.params;
    let { documents } = req.body;

    if (!registrationNumber) {
      return res.status(400).json({ message: "Registration number is required" });
    }

    // Find student by registration number
    const student = await FromStudents.findOne({ registrationNumber });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Handle file uploads from multipart/form-data
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // Map uploaded files to documents
      const fileMap = {};
      req.files.forEach((file) => {
        const fieldName = file.fieldname;
        // Extract document index from fieldname (e.g., "documents[0].file" -> 0)
        const match = fieldName.match(/documents\[(\d+)\]/);
        if (match) {
          const index = parseInt(match[1]);
          if (!fileMap[index]) fileMap[index] = {};
          if (fieldName.includes(".file")) {
            fileMap[index].file = file.buffer;
            fileMap[index].fileType = file.mimetype || "application/pdf";
          }
        }
      });

      // Merge file data with documents array
      if (documents && Array.isArray(documents)) {
        documents = documents.map((doc, index) => ({
          ...doc,
          ...(fileMap[index] || {})
        }));
      }
    }

    // Handle documents from JSON body
    if (!documents || !Array.isArray(documents)) {
      return res.status(400).json({ message: "Documents array is required" });
    }

    // Process documents (similar to updateStudent)
    const processedDocuments = documents.map((doc) => {
      const processedDoc = { ...doc };

      // Convert base64 string to Buffer if present
      if (doc.file && typeof doc.file === "string") {
        let base64String = doc.file;
        if (base64String.startsWith("data:")) {
          base64String = base64String.split(",")[1];
        }
        try {
          processedDoc.file = Buffer.from(base64String, "base64");
        } catch (err) {
          console.error(`Failed to decode base64 for docId=${doc.docId}`, err);
          processedDoc.file = undefined;
        }
      }

      // Ensure fileType is set based on file content if not provided
      if (processedDoc.file && !processedDoc.fileType) {
        processedDoc.fileType = "application/pdf"; // Default to PDF
      }

      // Ensure required fields have defaults
      if (!processedDoc.docId) {
        processedDoc.docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      if (!processedDoc.submitted) {
        processedDoc.submitted = "no";
      }
      if (!processedDoc.verified) {
        processedDoc.verified = "not_verified";
      }

      return processedDoc;
    });

    // Append documents to existing ones (or replace if you prefer)
    if (req.body.replace === true) {
      student.documents = processedDocuments;
    } else {
      student.documents = [...(student.documents || []), ...processedDocuments];
    }

    await student.save();

    res.json({
      message: "Documents added successfully",
      student: {
        _id: student._id,
        registrationNumber: student.registrationNumber,
        name: `${student.firstName} ${student.lastName}`,
        documentsCount: student.documents.length
      }
    });
  } catch (err) {
    console.error("Error adding documents:", err);
    res.status(400).json({ error: err.message });
  }
};

// Get a specific document by studentId + docId
exports.getStudentDocument = async (req, res) => {
  try {
    const { studentId, docId } = req.params;

    const student = await FromStudents.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Find matching document
    const document = student.documents.find((doc) => doc.docId === docId);
    if (!document)
      return res.status(404).json({ message: "Document not found" });

    // Set headers for file download/preview
    res.set("Content-Type", document.fileType || "application/octet-stream");
    res.set(
      "Content-Disposition",
      `inline; filename="${document.name || docId}"`
    );

    res.send(document.file);
  } catch (err) {
    console.error("Error fetching document:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get single student by Hall Ticket Number
exports.getStudentByHallTicket = async (req, res) => {
  try {
    const { hallTicketNo } = req.params;

    if (!hallTicketNo) {
      return res
        .status(400)
        .json({ message: "Hall Ticket Number is required" });
    }

    const student = await FromStudents.findOne({ hallTicketNo })
      .populate({
        path: "campus",
        model: "College",
        select: "name address city state",
      })
      .populate({
        path: "course",
        model: "Course_data",
        select: "name duration fee",
      });
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get students by College Code
exports.getStudentsByCollege = async (req, res) => {
  try {
    const { collegeCode } = req.params;
    console.log("___collegeCode", collegeCode);

    if (!collegeCode) {
      return res.status(400).json({ message: "College code is required" });
    }

    console.log("______1");
    // Find students where campus = collegeCode
    const students = await FromStudents.find({ campus: collegeCode })
      .populate({
        path: "campus",
        model: "College",
        select: "code name address city state",
      })
      .populate({
        path: "course",
        model: "Course_data",
        select: "name duration fee",
      });

    console.log("______2", students);

    // ✅ Always return array, even if empty
    res.json({
      message: `Fetched students for college code ${collegeCode}`,
      students: students || [],
    });
  } catch (err) {
    console.error("Error fetching students by college:", err);
    res.status(500).json({ error: err.message });
  }
};

// @desc Get students by college, registration number range, and course
// @route GET /api/students/by-filters
// Query params: collegeId, fromRegistrationNumber, toRegistrationNumber, courseId
exports.getStudentsByFilters = async (req, res) => {
  try {
    const {
      collegeId,
      fromRegistrationNumber,
      toRegistrationNumber,
      registrationNumber,
      courseId,
      streamId,
      semesterId,
      semesterNumber,
      status,
      batchId
    } = req.query;

    // if (!collegeId) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "College ID is required",
    //   });
    // }

    // Build query
    const query = {
      // campus: collegeId, // Now optional
      status: status || "Admitted",
    };

    if (collegeId && collegeId !== 'null' && collegeId !== 'undefined') {
      query.campus = collegeId;
    }

    if (batchId && batchId !== 'null' && batchId !== 'undefined') {
      query.batch = batchId;
    }

    if (registrationNumber && registrationNumber !== 'null' && registrationNumber !== 'undefined') {
      query.registrationNumber = registrationNumber;
    }

    // Add course/stream/semester filtering via Mapping
    if (courseId || streamId || semesterId) {
      const mappingQuery = { status: "Active" };
      if (courseId) mappingQuery.courseId = courseId;
      if (streamId) mappingQuery.streamId = streamId;
      if (semesterId) mappingQuery.semesterId = semesterId;
      if (semesterNumber && semesterNumber !== 'undefined' && semesterNumber !== 'null') {
        mappingQuery.semesterNumber = parseInt(semesterNumber, 10);
      }

      // console.log("DEBUG: Mapping Query:", mappingQuery);

      const mappings = await CourseStreamMapping.find(mappingQuery).select("_id").lean();

      // console.log(`DEBUG: Found ${mappings.length} mappings`);

      if (mappings.length > 0) {
        const mappingIds = mappings.map(m => m._id);
        query.courseStreamMappingId = { $in: mappingIds };
      } else if (courseId && !streamId && !semesterId) {
        // Fallback to course field if only course provided and no mappings found
        query.course = courseId;
      } else {
        // If specific criteria provided but no mappings found, force empty result
        query.courseStreamMappingId = new mongoose.Types.ObjectId();
      }
    }

    // console.log("DEBUG: Final Student Query:", JSON.stringify(query));

    // Fetch students first (without registration number filter)
    let students = await FromStudents.find(query)
      .populate("campus", "code name city")
      .populate("courseStreamMappingId", "courseId streamId semesterId")
      .populate({
        path: "courseStreamMappingId",
        populate: {
          path: "courseId",
          select: "code name",
        },
      })
      .select(
        "firstName middleName lastName registrationNumber hallTicketNo courseStreamMappingId campus status email phone"
      )
      .sort({ registrationNumber: 1 })
      .lean();

    // Filter by registration number range if provided (compare numeric prefix to allow varying lengths)
    if (fromRegistrationNumber || toRegistrationNumber) {
      // Helper to pull only digits from registration number
      const extractDigits = (regNum) => {
        if (!regNum) return null;
        const str = String(regNum).trim();
        const digits = str.replace(/\D/g, "");
        return digits || null;
      };

      const fromDigits = fromRegistrationNumber ? extractDigits(fromRegistrationNumber) : null;
      const toDigits = toRegistrationNumber ? extractDigits(toRegistrationNumber) : null;

      if (fromDigits !== null || toDigits !== null) {
        // Use the length of the provided range for prefix comparison
        const compareLen = Math.max(
          fromDigits ? fromDigits.length : 0,
          toDigits ? toDigits.length : 0
        );

        const toNumber = toDigits !== null ? parseInt(toDigits.slice(0, compareLen), 10) : null;
        const fromNumber = fromDigits !== null ? parseInt(fromDigits.slice(0, compareLen), 10) : null;

        students = students.filter((student) => {
          const studentDigits = extractDigits(student.registrationNumber);
          if (!studentDigits) return false;

          // Take prefix of the student's digits with the chosen compare length
          const studentPrefix = studentDigits.slice(0, compareLen);
          const studentNumber = parseInt(studentPrefix, 10);
          if (Number.isNaN(studentNumber)) return false;

          if (fromNumber !== null && toNumber !== null) {
            return studentNumber >= fromNumber && studentNumber <= toNumber;
          } else if (fromNumber !== null) {
            return studentNumber >= fromNumber;
          } else if (toNumber !== null) {
            return studentNumber <= toNumber;
          }
          return true;
        });
      }
    }

    // Filter by Payment Status (Exclude Paid)
    if (req.query.excludePaid === 'true') {
      try {
        const ExaminationPaymentTransaction = require("../../models/examination/ExaminationPaymentTransaction");
        // Use registrationNumber as primary key for payment check
        const studentIds = students.map(s => s.registrationNumber || s.hallTicketNo).filter(Boolean);

        // console.log(`DEBUG: Checking payments for ${studentIds.length} students. Sample IDs:`, studentIds.slice(0, 3));

        if (studentIds.length > 0) {
          // Check for both "SUCCESS" and "success" to be safe
          const paidTransactions = await ExaminationPaymentTransaction.find({
            registration_number: { $in: studentIds },
            payment_status: { $in: ["SUCCESS", "success"] }
          }).select("registration_number");

          const paidRegNos = paidTransactions.map(t => t.registration_number);
          // console.log(`DEBUG: Found ${paidRegNos.length} paid transactions. Sample:`, paidRegNos.slice(0, 3));

          const initialCount = students.length;
          students = students.filter(s => {
            const id = s.registrationNumber || s.hallTicketNo;
            return !paidRegNos.includes(id);
          });
          // console.log(`DEBUG: Excluded ${initialCount - students.length} paid students`);
        }
      } catch (err) {
        console.error("Error filtering paid students:", err);
      }
    }

    res.json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Error fetching students by filters:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Update student by Hall Ticket Number
// Update student by Hall Ticket Number
exports.updateStudentByHallTicket = async (req, res) => {
  try {
    const { hallTicketNo } = req.params;
    if (!hallTicketNo) {
      return res
        .status(400)
        .json({ message: "Hall Ticket Number is required" });
    }

    const student = await FromStudents.findOne({ hallTicketNo });
    if (!student) return res.status(404).json({ message: "Student not found" });

    let {
      note,
      flag,
      academicRecords,
      referenceNumber,
      corrections,
      ...otherFields
    } = req.body;

    // Parse JSON fields if they are strings
    if (academicRecords && typeof academicRecords === "string") {
      try {
        academicRecords = JSON.parse(academicRecords);
      } catch (err) {
        console.error("Failed to parse academicRecords:", err);
        academicRecords = [];
      }
    }

    if (corrections && typeof corrections === "string") {
      try {
        corrections = JSON.parse(corrections);
      } catch (err) {
        console.error("Failed to parse corrections:", err);
        corrections = [];
      }
    }

    // If referenceNumber is an array, convert to string (or take last value)
    if (Array.isArray(referenceNumber)) {
      referenceNumber = referenceNumber[referenceNumber.length - 1] || "";
    }

    // Update corrections array if new correction provided
    if (note && flag) {
      student.corrections = student.corrections || [];
      student.corrections.push({ reason: note, flag });
    }

    // Assign other parsed fields
    if (academicRecords) student.academicRecords = academicRecords;
    if (corrections) student.corrections = corrections;
    if (referenceNumber) student.referenceNumber = referenceNumber;

    // Assign other normal fields
    if (Object.keys(otherFields).length > 0) {
      Object.assign(student, otherFields);
    }

    const updatedStudent = await student.save();
    res.json({
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (err) {
    console.error("Error updating student by Hall Ticket:", err);
    res.status(400).json({ error: err.message, details: err.errors });
  }
};

// Get student by Registration Number (for examination application)
exports.getStudentByRegistrationNumber = async (req, res) => {
  try {
    const { registrationNumber } = req.params;

    if (!registrationNumber) {
      return res.status(400).json({
        success: false,
        error: "Registration number is required",
      });
    }

    const student = await FromStudents.findOne({ registrationNumber })
      .populate({
        path: "campus",
        model: "College",
        select: "name code address city state",
      })
      .populate({
        path: "courseStreamMappingId",
        model: "CourseStreamMapping",
        select:
          "courseId streamId semesterId semesterNumber timePeriod status subjects",
        populate: [
          {
            path: "courseId",
            model: "Course_data",
            select: "name code duration",
          },
          {
            path: "streamId",
            model: "Stream",
            select: "name code",
          },
          {
            path: "semesterId",
            model: "Semester",
            select: "numberOfSemesters description",
          },
          {
            path: "subjects.subjectId",
            model: "Subject",
            select: "name code syllabus status",
          },
        ],
      })
      .populate({
        path: "batch",
        model: "AcademicYear",
        select: "code startDate endDate description",
      });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "No student found for this registration number",
        data: null,
      });
    }

    // Get course, stream, and semester from courseStreamMappingId
    const mapping = student.courseStreamMappingId;

    if (!mapping) {
      return res.status(404).json({
        success: false,
        message: "Student found but course-stream mapping is missing",
        data: null,
      });
    }

    const courseId = mapping?.courseId?._id || mapping?.courseId;
    const courseName = mapping?.courseId?.name || "";
    const courseCode = mapping?.courseId?.code || "";
    const streamObject = mapping?.streamId;
    const streamName = streamObject?.name || "";
    const streamCode = streamObject?.code || "";
    const streamId = streamObject?._id || streamObject;
    const semesterId = mapping?.semesterId?._id || mapping?.semesterId;
    const semesterNumber = mapping?.semesterNumber;
    const semesterDescription = mapping?.semesterId?.description || "";

    // Generate semesterYear from semesterNumber (always use mapping data)
    let semesterYear = "";
    if (semesterNumber) {
      const year = Math.ceil(semesterNumber / 2);
      const semesterInYear = ((semesterNumber - 1) % 2) + 1;
      const yearOrdinal =
        year === 1
          ? "1st"
          : year === 2
            ? "2nd"
            : year === 3
              ? "3rd"
              : `${year}th`;
      const semesterOrdinal =
        semesterInYear === 1
          ? "1st"
          : semesterInYear === 2
            ? "2nd"
            : semesterInYear === 3
              ? "3rd"
              : `${semesterInYear}th`;
      semesterYear = `${yearOrdinal} Year - ${semesterOrdinal} Semester`;
    } else {
      semesterYear = student.semesterYear || "";
    }

    console.log("🔍 Student data:", {
      registrationNumber: student.registrationNumber,
      courseId: courseId?.toString(),
      courseName: courseName,
      streamName: streamName,
      streamId: streamId?.toString(),
      semesterYear: semesterYear,
      semesterId: semesterId?.toString(),
      semesterNumber: semesterNumber,
      batchId: student.batch?._id?.toString(),
      batchCode: student.batch?.code,
    });

    // Get subjects directly from the mapping
    let subjects = [];
    let subjectsError = null;

    if (
      mapping?.subjects &&
      Array.isArray(mapping.subjects) &&
      mapping.subjects.length > 0
    ) {
      // Format subjects from mapping
      subjects = mapping.subjects
        .filter(
          (sub) => sub.subjectId && (sub.subjectId.name || sub.subjectId._id)
        ) // Only include valid subjects
        .map((sub, index) => ({
          SubjectName: sub.subjectId?.name || "",
          SubjectCode: sub.subjectId?.code || "",
          SubjectOrder: index + 1, // Use array index as order
          _id: sub.subjectId?._id || null,
          maxMarks: sub.maxMarks || 100,
          passMarks: sub.passMarks || 40,
        }))
        .filter((sub) => sub.SubjectName) // Remove any subjects without names
        .sort((a, b) => (a.SubjectOrder || 0) - (b.SubjectOrder || 0));

      console.log("📚 Subjects from mapping:", {
        count: subjects.length,
        subjects: subjects.map((s) => s.SubjectName),
      });
    } else {
      // Fallback: Try to fetch subjects using the helper function
      if (courseId && semesterYear) {
        const subjectsData = await fetchSubjectsForStudent(
          courseId,
          streamName,
          semesterYear
        );
        if (subjectsData.success) {
          subjects = subjectsData.subjects || [];
        } else {
          subjectsError = subjectsData.error || "No subjects found in mapping";
        }
        console.log("📚 Subjects from helper function:", {
          success: subjectsData.success,
          count: subjects.length,
        });
      } else {
        subjectsError = "Missing course or semester information";
      }
    }

    // Use stream from mapping (most accurate)
    const finalStream = streamName || "";
    const finalSemesterYear = semesterYear;

    // Format response to match frontend expectations
    const formattedData = {
      registrationNumber: student.registrationNumber || "",
      nameSSC:
        `${student.firstName || ""} ${student.middleName || ""} ${student.lastName || ""
          }`.trim() ||
        student.firstName ||
        "",
      selectCourse: courseName || "", // From courseStreamMappingId
      courseCode: courseCode || "", // Course code from mapping
      selectCollege: student.campus?.name || "",
      collegeCode: student.campus?.code || "", // College code
      stream: finalStream, // Stream name from mapping
      streamCode: streamCode || "", // Stream code from mapping
      semesterYear: finalSemesterYear, // Semester from mapping
      semesterNumber: semesterNumber || null, // Semester number
      semesterDescription: semesterDescription || "", // Semester description
      batch: student.batch?.code || "", // Batch code from AcademicYear
      batchYear: student.batch?.code || "", // Alias for batch
      email: student.email || "",
      phone: student.phone || "",
      // Include subjects in the response (from mapping)
      subjects: subjects || [],
      subjectsError: subjectsError,
      // Include mapping details for reference
      courseStreamMapping: {
        _id: mapping._id,
        courseId: courseId,
        streamId: streamId,
        semesterId: semesterId,
        semesterNumber: semesterNumber,
        timePeriod: mapping.timePeriod || "",
        status: mapping.status || "",
      },
      // Include all original student data
      ...student.toObject(),
    };

    res.status(200).json({
      success: true,
      message: "Student found",
      data: formattedData,
    });
  } catch (err) {
    console.error("Error fetching student by registration number:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get students by hall ticket number range (based on last 3 digits)
// @desc Get students whose hall ticket numbers' last 3 digits fall within the specified range
// @route GET /api/students/hall-ticket-range
// @query fromRoll, toRoll (hall ticket numbers from exam center mapping, will extract last 3 digits)
// @query collegeId (optional, filter by college)
exports.getStudentsByHallTicketRange = async (req, res) => {
  try {
    const { fromRoll, toRoll, collegeId } = req.query;

    if (!fromRoll || !toRoll) {
      return res.status(400).json({
        success: false,
        error: "fromRoll and toRoll (hall ticket number ranges) are required",
      });
    }

    // Extract last 3 digits from fromRoll and toRoll
    const getLastThreeDigits = (value) => {
      const str = String(value).trim();
      const digits = str.replace(/\D/g, "");
      if (digits.length < 3) return null;
      return parseInt(digits.slice(-3), 10);
    };

    const fromLastThree = getLastThreeDigits(fromRoll);
    const toLastThree = getLastThreeDigits(toRoll);

    if (fromLastThree === null || toLastThree === null) {
      return res.status(400).json({
        success: false,
        error: "Invalid roll numbers. Must contain at least 3 digits.",
      });
    }

    if (fromLastThree > toLastThree) {
      return res.status(400).json({
        success: false,
        error:
          "fromRoll's last 3 digits must be less than or equal to toRoll's last 3 digits",
      });
    }

    // Build query to find students whose hall ticket numbers' last 3 digits are in range
    // Note: fromRoll and toRoll are hall ticket number ranges from exam center-college mappings
    // We match students by comparing the last 3 digits of their hallTicketNo field
    const query = {
      hallTicketNo: { $exists: true, $ne: null, $ne: "" },
    };

    // If collegeId is provided, filter by college
    if (collegeId) {
      query.campus = collegeId;
    }

    // Fetch all students with hall ticket numbers (we'll filter in memory for last 3 digits)
    // This is necessary because MongoDB doesn't have a direct way to query last N digits
    const allStudents = await FromStudents.find(query)
      .populate({
        path: "campus",
        model: "College",
        select: "name code address city state",
      })
      .populate({
        path: "courseStreamMappingId",
        model: "CourseStreamMapping",
        select: "courseId streamId semesterId semesterNumber",
        populate: [
          {
            path: "courseId",
            model: "Course_data",
            select: "name code",
          },
          {
            path: "streamId",
            model: "Stream",
            select: "name code",
          },
        ],
      })
      .select(
        "firstName middleName lastName registrationNumber hallTicketNo campus courseStreamMappingId status"
      )
      .lean();

    // Filter students whose hall ticket numbers' last 3 digits fall within the range
    const filteredStudents = allStudents.filter((student) => {
      if (!student.hallTicketNo) return false;
      const studentLastThree = getLastThreeDigits(student.hallTicketNo);
      if (studentLastThree === null) return false;
      return (
        studentLastThree >= fromLastThree && studentLastThree <= toLastThree
      );
    });

    // Sort by hall ticket number
    filteredStudents.sort((a, b) => {
      const aLastThree = getLastThreeDigits(a.hallTicketNo);
      const bLastThree = getLastThreeDigits(b.hallTicketNo);
      return aLastThree - bLastThree;
    });

    res.status(200).json({
      success: true,
      message: `Found ${filteredStudents.length} students in the specified range`,
      count: filteredStudents.length,
      data: filteredStudents,
    });
  } catch (err) {
    console.error("Error fetching students by hall ticket range:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update document received status (simplified - no acknowledgment storage)
// @desc Update documents' received status based on checkboxes
// @route POST /api/students/documents/update-received
exports.updateDocumentsReceived = async (req, res) => {
  try {
    const { registrationNumber, studentId, documents: documentsInput, sendEmail } = req.body;

    // Validate required fields
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: "Student ID is required",
      });
    }

    if (!documentsInput || !Array.isArray(documentsInput) || documentsInput.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one document must be provided",
      });
    }

    // Find student
    const student = await FromStudents.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    // Initialize documents array if it doesn't exist
    if (!student.documents || !Array.isArray(student.documents)) {
      student.documents = [];
    }

    // Update received status for each document
    documentsInput.forEach((inputDoc) => {
      const docId = inputDoc.docId;
      if (!docId) return;

      // Find the document in student's documents array
      const docIndex = student.documents.findIndex(
        (doc) =>
          String(doc.docId || "") === String(docId) ||
          String(doc._id || "") === String(docId) ||
          doc.name === inputDoc.name
      );

      if (docIndex !== -1) {
        // Update existing document
        student.documents[docIndex].received = inputDoc.received === true || inputDoc.received === "yes";
        if (inputDoc.received) {
          student.documents[docIndex].receivedAt = inputDoc.receivedAt || new Date().toISOString();
        } else {
          student.documents[docIndex].receivedAt = null;
        }
      } else {
        // Add new document entry
        student.documents.push({
          docId: String(docId),
          name: String(inputDoc.name || "Document"),
          received: inputDoc.received === true || inputDoc.received === "yes",
          receivedAt: inputDoc.received ? (inputDoc.receivedAt || new Date().toISOString()) : null,
          submitted: "no",
          verified: "not_verified",
          comment: "",
        });
      }
    });

    // Save the updated student
    await student.save();

    // Send email if requested
    if (sendEmail && student.email) {
      try {
        // TODO: Implement email sending service
        // For now, just log it
        console.log(`Email should be sent to ${student.email} with document receipt certificate`);
        // You can integrate nodemailer here
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(200).json({
      success: true,
      message: "Document received status updated successfully",
      studentId: student._id,
      registrationNumber: student.registrationNumber || registrationNumber,
    });
  } catch (err) {
    console.error("Error updating document received status:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to update document received status",
    });
  }
};

// Acknowledge document receipt (old endpoint - kept for backward compatibility)
// @desc Update documents' submitted status to "true" when student acknowledges receipt
// @route POST /api/students/documents/acknowledge
exports.acknowledgeDocuments = async (req, res) => {
  try {
    const { registrationNumber, studentId, regNo, documents: documentsInput } = req.body;

    // Validate required fields
    if (!registrationNumber && !studentId && !regNo) {
      return res.status(400).json({
        success: false,
        error: "Registration number, student ID, or regNo is required",
      });
    }

    // Parse documents if it's a string
    let documents = documentsInput;
    if (typeof documents === "string") {
      try {
        documents = JSON.parse(documents);
      } catch (parseError) {
        console.error("Failed to parse documents string:", parseError);
        return res.status(400).json({
          success: false,
          error: "Invalid documents format: documents must be a valid JSON array",
        });
      }
    }

    // Ensure documents is an array
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one document must be provided for acknowledgment",
      });
    }

    // Validate that each document is an object, not a string or other type
    const invalidDocs = documents.filter((doc, index) => {
      if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
        console.error(`Invalid document at index ${index}:`, doc);
        return true;
      }
      return false;
    });

    if (invalidDocs.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid document format: ${invalidDocs.length} document(s) are not valid objects`,
      });
    }

    // Find student by registration number, studentId, or regNo
    let student;
    if (studentId) {
      student = await FromStudents.findById(studentId);
    } else if (registrationNumber) {
      student = await FromStudents.findOne({ registrationNumber: registrationNumber.trim() });
    } else if (regNo) {
      student = await FromStudents.findOne({ registrationNumber: regNo.trim() });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    // Initialize documents array if it doesn't exist
    if (!student.documents || !Array.isArray(student.documents)) {
      student.documents = [];
    }

    // Update documents' submitted status
    let updatedCount = 0;
    const acknowledgedAt = new Date().toISOString();

    documents.forEach((ackDoc) => {
      const documentId = ackDoc.documentId || ackDoc._id || ackDoc.id;
      if (!documentId) return;

      // Find the document in student's documents array
      const docIndex = student.documents.findIndex(
        (doc) =>
          doc.docId === documentId ||
          doc._id?.toString() === documentId.toString() ||
          (doc.name === ackDoc.documentName && doc.name)
      );

      if (docIndex !== -1) {
        // Update existing document - only update submitted status, don't modify comment
        student.documents[docIndex].submitted = "true";
        updatedCount++;
      } else {
        // If document doesn't exist, create a new entry (optional)
        // This handles cases where documents might be added dynamically
        student.documents.push({
          docId: documentId,
          name: ackDoc.documentName || "Document",
          submitted: "true",
          verified: "not_verified",
          comment: studentDoc?.comment || "",
        });
        updatedCount++;
      }
    });

    // Save the updated student (update submitted status)
    await student.save();

    // Get student details for the acknowledgment record
    const studentName = `${student.firstName || ""} ${student.middleName || ""} ${student.lastName || ""}`.trim();
    
    // Get course, stream, batch info
    let courseName = "N/A";
    let streamName = "N/A";
    let batchName = "N/A";
    let collegeName = "N/A";

    if (student.courseStreamMappingId) {
      const mapping = await CourseStreamMapping.findById(student.courseStreamMappingId)
        .populate("courseId", "name")
        .populate("streamId", "name");
      if (mapping) {
        courseName = mapping.courseId?.name || "N/A";
        streamName = mapping.streamId?.name || "N/A";
      }
    }

    if (student.batch) {
      const AcademicYear = mongoose.model("AcademicYear");
      const batch = await AcademicYear.findById(student.batch);
      if (batch) {
        batchName = batch.name || batch.code || "N/A";
      }
    }

    if (student.campus) {
      const college = await College.findById(student.campus);
      if (college) {
        collegeName = college.name || "N/A";
      }
    }

    // Prepare documents for acknowledgment record
    const acknowledgedDocs = documents
      .map((ackDoc) => {
        // Ensure ackDoc is a plain object, not a string or other type
        if (!ackDoc || typeof ackDoc !== 'object') {
          console.warn("Invalid document format:", ackDoc);
          return null;
        }

        // Get document ID - ensure it's a valid string
        let documentId = ackDoc.documentId || ackDoc._id || ackDoc.id || ackDoc.docId;
        
        // If documentId is still undefined or invalid, skip this document
        if (!documentId) {
          console.warn("Document missing ID:", ackDoc);
          return null;
        }

        // Convert to string and ensure it's not empty
        documentId = String(documentId).trim();
        if (!documentId || documentId === 'undefined' || documentId === 'null') {
          console.warn("Document has invalid ID:", ackDoc);
          return null;
        }

        const studentDoc = student.documents.find(
          (doc) =>
            String(doc.docId || '') === documentId ||
            String(doc._id || '') === documentId ||
            doc.name === (ackDoc.documentName || ackDoc.name)
        );

        // Get document name - ensure it's a valid string
        let docName = ackDoc.documentName || ackDoc.name || studentDoc?.name || "Document";
        docName = String(docName).trim();
        
        if (!docName || docName === 'undefined' || docName === 'null') {
          console.warn("Document has invalid name:", ackDoc);
          return null;
        }

        // Ensure acknowledgedAt is a Date object
        let acknowledgedDate = new Date();
        if (ackDoc.acknowledgedAt) {
          acknowledgedDate = new Date(ackDoc.acknowledgedAt);
          if (isNaN(acknowledgedDate.getTime())) {
            acknowledgedDate = new Date();
          }
        }

        // Return a clean plain object with all required fields as strings
        return {
          docId: documentId,
          name: docName,
          documentName: String(ackDoc.documentName || studentDoc?.name || docName).trim(),
          type: String(studentDoc?.type || ackDoc.type || "").trim(),
          description: String(studentDoc?.description || ackDoc.description || "").trim(),
          fileType: String(studentDoc?.fileType || ackDoc.fileType || "application/pdf").trim(),
          verified: String(studentDoc?.verified || ackDoc.verified || "not_verified").trim(),
          comment: String(studentDoc?.comment || ackDoc.comment || "").trim(),
          acknowledgedAt: acknowledgedDate,
        };
      })
      .filter((doc) => doc !== null); // Remove any null entries

    // Ensure we have at least one valid document before proceeding
    if (acknowledgedDocs.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid documents to acknowledge",
      });
    }

    // Create or update acknowledgment record in separate table
    // Ensure all documents are plain objects with correct types
    const documentsForSave = acknowledgedDocs.map((doc) => {
      // Ensure doc is a plain object
      if (!doc || typeof doc !== 'object') {
        console.warn("Invalid document in acknowledgedDocs:", doc);
        return null;
      }

      // Validate required fields
      const docId = String(doc.docId || '').trim();
      const name = String(doc.name || '').trim();
      
      if (!docId || !name || docId === 'undefined' || name === 'undefined') {
        console.warn("Document missing required fields:", doc);
        return null;
      }

      // Return clean plain object with all fields properly typed
      return {
        docId: docId,
        name: name,
        documentName: doc.documentName ? String(doc.documentName).trim() : undefined,
        type: doc.type ? String(doc.type).trim() : undefined,
        description: doc.description ? String(doc.description).trim() : undefined,
        fileType: String(doc.fileType || "application/pdf").trim(),
        verified: String(doc.verified || "not_verified").trim(),
        comment: String(doc.comment || "").trim(),
        acknowledgedAt: doc.acknowledgedAt instanceof Date 
          ? doc.acknowledgedAt 
          : new Date(doc.acknowledgedAt || Date.now()),
      };
    }).filter((doc) => doc !== null); // Remove any null entries

    // Ensure we have at least one valid document after filtering
    if (documentsForSave.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid documents to acknowledge after validation",
      });
    }

    const acknowledgmentData = {
      studentId: student._id,
      registrationNumber: String(student.registrationNumber || registrationNumber || regNo),
      hallTicketNo: student.hallTicketNo ? String(student.hallTicketNo) : "",
      studentName: String(studentName),
      email: student.email ? String(student.email) : "",
      phone: student.phone ? String(student.phone) : "",
      course: courseName ? String(courseName) : "",
      stream: streamName ? String(streamName) : "",
      batch: batchName ? String(batchName) : "",
      college: collegeName ? String(collegeName) : "",
      documents: documentsForSave,
      acknowledgedAt: new Date(),
      acknowledgedBy: "Student",
      status: "active",
    };

    // Check if acknowledgment already exists for this student
    const existingAcknowledgment = await DocumentAcknowledgment.findOne({
      studentId: student._id,
      registrationNumber: student.registrationNumber || registrationNumber || regNo,
    }).lean();

    if (existingAcknowledgment) {
      // Re-fetch as Mongoose document (not lean) to be able to save
      const existingAckDoc = await DocumentAcknowledgment.findById(existingAcknowledgment._id);
      
      if (!existingAckDoc) {
        // If not found, create new
        await DocumentAcknowledgment.create(acknowledgmentData);
      } else {
        // Update existing acknowledgment - merge documents
        // Convert existing documents to plain objects
        const existingDocs = (existingAckDoc.documents || []).map((d) => {
          // Ensure we get a plain object, not a Mongoose subdocument
          let doc;
          if (d && typeof d === 'object') {
            if (d.toObject && typeof d.toObject === 'function') {
              doc = d.toObject();
            } else if (d.toJSON && typeof d.toJSON === 'function') {
              doc = d.toJSON();
            } else {
              // Already a plain object, but create a new one to avoid references
              doc = { ...d };
            }
          } else {
            console.warn("Invalid document in existingDocs:", d);
            return null;
          }

          // Validate and convert to plain object with all fields as strings
          if (!doc || typeof doc !== 'object') {
            return null;
          }

          return {
            docId: String(doc.docId || "").trim(),
            name: String(doc.name || "").trim(),
            documentName: doc.documentName ? String(doc.documentName).trim() : undefined,
            type: doc.type ? String(doc.type).trim() : undefined,
            description: doc.description ? String(doc.description).trim() : undefined,
            fileType: String(doc.fileType || "application/pdf").trim(),
            verified: String(doc.verified || "not_verified").trim(),
            comment: String(doc.comment || "").trim(),
            acknowledgedAt: doc.acknowledgedAt instanceof Date 
              ? doc.acknowledgedAt 
              : new Date(doc.acknowledgedAt || Date.now()),
          };
        }).filter((doc) => doc !== null); // Remove any null entries
        
        const existingDocIds = existingDocs.map((d) => String(d.docId || "")).filter(id => id);
        const newDocs = documentsForSave.filter((d) => {
          const docId = String(d.docId || "");
          return docId && !existingDocIds.includes(docId);
        });
        
        // Combine existing and new documents - ensure all are plain objects
        const allDocuments = [...existingDocs, ...newDocs].map((doc) => {
          // Ensure each document is a plain object
          return {
            docId: String(doc.docId || "").trim(),
            name: String(doc.name || "").trim(),
            documentName: doc.documentName ? String(doc.documentName).trim() : undefined,
            type: doc.type ? String(doc.type).trim() : undefined,
            description: doc.description ? String(doc.description).trim() : undefined,
            fileType: String(doc.fileType || "application/pdf").trim(),
            verified: String(doc.verified || "not_verified").trim(),
            comment: String(doc.comment || "").trim(),
            acknowledgedAt: doc.acknowledgedAt instanceof Date 
              ? doc.acknowledgedAt 
              : new Date(doc.acknowledgedAt || Date.now()),
          };
        });

        // Set documents as a new array to ensure Mongoose treats it correctly
        existingAckDoc.set('documents', allDocuments);
        existingAckDoc.acknowledgedAt = new Date();
        existingAckDoc.status = "active";
        // Update student info in case it changed
        existingAckDoc.studentName = String(studentName);
        existingAckDoc.email = student.email ? String(student.email) : "";
        existingAckDoc.phone = student.phone ? String(student.phone) : "";
        existingAckDoc.course = courseName ? String(courseName) : "";
        existingAckDoc.stream = streamName ? String(streamName) : "";
        existingAckDoc.batch = batchName ? String(batchName) : "";
        existingAckDoc.college = collegeName ? String(collegeName) : "";
        
        // Mark documents as modified to ensure Mongoose saves the array properly
        existingAckDoc.markModified("documents");
        await existingAckDoc.save();
      }
    } else {
      // Create new acknowledgment record
      try {
        // Ensure documents is an array of plain objects with all fields properly typed
        // documentsForSave is already validated, but let's create a fresh array to be safe
        const finalDocuments = documentsForSave.map((doc) => {
          // Double-check that doc is valid
          if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
            console.warn("Invalid document in documentsForSave:", doc);
            return null;
          }

          // Create a completely new plain object
          const cleanDoc = {
            docId: String(doc.docId || '').trim(),
            name: String(doc.name || '').trim(),
            documentName: doc.documentName ? String(doc.documentName).trim() : undefined,
            type: doc.type ? String(doc.type).trim() : undefined,
            description: doc.description ? String(doc.description).trim() : undefined,
            fileType: String(doc.fileType || "application/pdf").trim(),
            verified: String(doc.verified || "not_verified").trim(),
            comment: String(doc.comment || "").trim(),
            acknowledgedAt: doc.acknowledgedAt instanceof Date 
              ? doc.acknowledgedAt 
              : new Date(doc.acknowledgedAt || Date.now()),
          };

          // Validate required fields
          if (!cleanDoc.docId || !cleanDoc.name || cleanDoc.docId === 'undefined' || cleanDoc.name === 'undefined') {
            console.warn("Document missing required fields:", cleanDoc);
            return null;
          }

          return cleanDoc;
        }).filter((doc) => doc !== null); // Remove any null entries

        // Final validation
        if (finalDocuments.length === 0) {
          return res.status(400).json({
            success: false,
            error: "No valid documents to acknowledge after final validation",
          });
        }

        // Ensure all documents are plain objects (not Mongoose documents or strings)
        const plainDocuments = finalDocuments.map(doc => {
          // Create a completely new object to avoid any references
          return {
            docId: String(doc.docId).trim(),
            name: String(doc.name).trim(),
            documentName: doc.documentName ? String(doc.documentName).trim() : undefined,
            type: doc.type ? String(doc.type).trim() : undefined,
            description: doc.description ? String(doc.description).trim() : undefined,
            fileType: String(doc.fileType || "application/pdf").trim(),
            verified: String(doc.verified || "not_verified").trim(),
            comment: String(doc.comment || "").trim(),
            acknowledgedAt: doc.acknowledgedAt instanceof Date 
              ? doc.acknowledgedAt 
              : new Date(doc.acknowledgedAt || Date.now()),
          };
        });

        const cleanAcknowledgmentData = {
          studentId: student._id,
          registrationNumber: String(student.registrationNumber || registrationNumber || regNo),
          hallTicketNo: student.hallTicketNo ? String(student.hallTicketNo) : "",
          studentName: String(studentName),
          email: student.email ? String(student.email) : "",
          phone: student.phone ? String(student.phone) : "",
          course: courseName ? String(courseName) : "",
          stream: streamName ? String(streamName) : "",
          batch: batchName ? String(batchName) : "",
          college: collegeName ? String(collegeName) : "",
          documents: plainDocuments, // Use the validated plain documents array
          acknowledgedAt: new Date(),
          acknowledgedBy: "Student",
          status: "active",
        };
        
        await DocumentAcknowledgment.create(cleanAcknowledgmentData);
      } catch (createError) {
        console.error("Error creating DocumentAcknowledgment:", createError);
        console.error("Error details:", createError.errors || createError.message);
        // If creation fails, log the data for debugging
        console.error("Acknowledgment data documents:", JSON.stringify(documentsForSave, null, 2));
        throw createError;
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully acknowledged ${updatedCount} document(s)`,
      acknowledgedCount: updatedCount,
      studentId: student._id,
      registrationNumber: student.registrationNumber || registrationNumber,
    });
  } catch (err) {
    console.error("Error acknowledging documents:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to acknowledge documents",
    });
  }
};

// Get all students with received documents (from DocumentAcknowledgment table)
// @desc Fetch all students who have received documents from acknowledgment table
// @route GET /api/students/documents/received
exports.getStudentsWithReceivedDocuments = async (req, res) => {
  try {
    // Fetch from DocumentAcknowledgment table
    const acknowledgments = await DocumentAcknowledgment.find({
      status: { $ne: "revoked" },
    })
      .populate({
        path: "studentId",
        select: "firstName middleName lastName registrationNumber hallTicketNo email phone courseStreamMappingId campus batch",
        populate: [
          {
            path: "courseStreamMappingId",
            populate: [
              {
                path: "courseId",
                model: "Course_data",
                select: "name code",
              },
              {
                path: "streamId",
                model: "Stream",
                select: "name code",
              },
            ],
          },
          {
            path: "batch",
            model: "AcademicYear",
            select: "name code",
          },
          {
            path: "campus",
            model: "College",
            select: "name code",
          },
        ],
      })
      .sort({ acknowledgedAt: -1 })
      .lean();

    // Process acknowledgments to format response
    const processedStudents = acknowledgments
      .map((ack) => {
        if (!ack.documents || ack.documents.length === 0) {
          return null;
        }

        // Get student info from populated data or stored data
        const student = ack.studentId;
        const studentName = ack.studentName || 
          (student ? `${student.firstName || ""} ${student.middleName || ""} ${student.lastName || ""}`.trim() : "N/A");
        
        // Get course/stream from populated data or stored data
        const courseName = ack.course || 
          (student?.courseStreamMappingId?.courseId?.name) || "N/A";
        const streamName = ack.stream || 
          (student?.courseStreamMappingId?.streamId?.name) || "";
        const batchName = ack.batch || 
          (student?.batch?.name || student?.batch?.code) || "N/A";
        const collegeName = ack.college || 
          (student?.campus?.name) || "N/A";

        // Get most recent received date
        const receivedDates = ack.documents
          .map((doc) => doc.acknowledgedAt && new Date(doc.acknowledgedAt))
          .filter((date) => date && !isNaN(date.getTime()))
          .sort((a, b) => b - a);
        const mostRecentReceivedDate = receivedDates.length > 0 ? receivedDates[0] : ack.acknowledgedAt;

        return {
          _id: ack._id,
          studentId: ack.studentId?._id || ack.studentId || null,
          name: studentName,
          registrationNumber: ack.registrationNumber || "N/A",
          hallTicketNo: ack.hallTicketNo || "N/A",
          email: ack.email || "",
          phone: ack.phone || "",
          course: courseName,
          stream: streamName,
          batch: batchName,
          college: collegeName,
          receivedDocuments: ack.documents.map((doc) => ({
            docId: doc.docId || "",
            name: doc.name || doc.documentName || "Document",
            documentName: doc.documentName || doc.name || "Document",
            type: doc.type || "",
            description: doc.description || "",
            receivedAt: doc.acknowledgedAt || null,
            verified: doc.verified || "not_verified",
            comment: doc.comment || "",
          })),
          receivedCount: ack.documents.length,
          mostRecentReceivedDate: mostRecentReceivedDate,
          studentExists: !!ack.studentId,
        };
      })
      .filter((student) => student !== null)
      .sort((a, b) => {
        // Sort by most recent received date
        if (a.mostRecentReceivedDate && b.mostRecentReceivedDate) {
          return new Date(b.mostRecentReceivedDate) - new Date(a.mostRecentReceivedDate);
        }
        if (a.mostRecentReceivedDate) return -1;
        if (b.mostRecentReceivedDate) return 1;
        return 0;
      });

    res.status(200).json({
      success: true,
      data: processedStudents,
      count: processedStudents.length,
    });
  } catch (err) {
    console.error("Error fetching students with received documents:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to fetch students with received documents",
    });
  }
};

// Get all students with acknowledged documents (old endpoint - kept for backward compatibility)
// @desc Fetch all acknowledgment records from the separate DocumentAcknowledgment collection
// @route GET /api/students/documents/acknowledged
exports.getAcknowledgedStudents = async (req, res) => {
  try {
    // Fetch all acknowledgment records from the separate table
    // This includes records even if student has left the college
    const acknowledgments = await DocumentAcknowledgment.find({
      status: { $ne: "revoked" }, // Exclude revoked acknowledgments
    })
      .populate({
        path: "studentId",
        model: "Student",
        select: "firstName middleName lastName email phone",
      })
      .sort({ acknowledgedAt: -1 }) // Most recent first
      .lean();

    // Format the response
    const formattedStudents = acknowledgments.map((ack) => {
      // Use populated student data if available, otherwise use stored data
      const student = ack.studentId;
      const studentName = student
        ? `${student.firstName || ""} ${student.middleName || ""} ${student.lastName || ""}`.trim()
        : ack.studentName;

      return {
        _id: ack._id,
        studentId: ack.studentId?._id || ack.studentId,
        name: studentName || "N/A",
        registrationNumber: ack.registrationNumber || "N/A",
        hallTicketNo: ack.hallTicketNo || "N/A",
        email: student?.email || ack.email || "N/A",
        phone: student?.phone || ack.phone || "N/A",
        course: ack.course || "N/A",
        stream: ack.stream || "N/A",
        batch: ack.batch || "N/A",
        college: ack.college || "N/A",
        acknowledgedDocuments: (ack.documents || []).map((doc) => ({
          docId: doc.docId || "",
          name: doc.name || "Unknown Document",
          documentName: doc.documentName || doc.name,
          type: doc.type,
          description: doc.description,
          verified: doc.verified || "not_verified",
          comment: doc.comment || "",
          fileType: doc.fileType || "application/pdf",
          acknowledgedAt: doc.acknowledgedAt,
        })),
        acknowledgedCount: (ack.documents || []).length,
        acknowledgedAt: ack.acknowledgedAt,
        status: ack.status,
        studentExists: !!ack.studentId, // Whether student still exists in system
      };
    });

    res.status(200).json({
      success: true,
      count: formattedStudents.length,
      data: formattedStudents,
    });
  } catch (err) {
    console.error("Error fetching acknowledged students:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to fetch acknowledged students",
    });
  }
};

// Update document acknowledgment (edit verification status/comment)
// @desc Update a specific document's verification status or comment in the acknowledgment record
// @route PUT /api/students/documents/acknowledgment/:acknowledgmentId
exports.updateDocumentAcknowledgment = async (req, res) => {
  try {
    const { acknowledgmentId } = req.params;
    const { documentId, verified, comment } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Document ID is required",
      });
    }

    const acknowledgment = await DocumentAcknowledgment.findById(acknowledgmentId);
    if (!acknowledgment) {
      return res.status(404).json({
        success: false,
        error: "Acknowledgment record not found",
      });
    }

    // Update the specific document in the documents array
    const docIndex = acknowledgment.documents.findIndex(
      (doc) => doc.docId === documentId
    );

    if (docIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Document not found in acknowledgment record",
      });
    }

    // Update document fields
    if (verified) {
      acknowledgment.documents[docIndex].verified = verified;
    }
    if (comment !== undefined) {
      acknowledgment.documents[docIndex].comment = comment;
    }

    // Also update student's document if student still exists
    if (acknowledgment.studentId) {
      try {
        const student = await FromStudents.findById(acknowledgment.studentId);
        if (student && student.documents) {
          const studentDocIndex = student.documents.findIndex(
            (doc) => doc.docId === documentId
          );
          if (studentDocIndex !== -1) {
            if (verified) {
              student.documents[studentDocIndex].verified = verified;
            }
            if (comment !== undefined) {
              student.documents[studentDocIndex].comment = comment;
            }
            await student.save();
          }
        }
      } catch (studentError) {
        console.log("Student not found or update failed, continuing with acknowledgment update");
      }
    }

    await acknowledgment.save();

    res.status(200).json({
      success: true,
      message: "Document acknowledgment updated successfully",
      data: acknowledgment,
    });
  } catch (err) {
    console.error("Error updating document acknowledgment:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to update document acknowledgment",
    });
  }
};

// Revoke document acknowledgment
// @desc Remove/revoke a document acknowledgment
// @route PUT /api/students/documents/acknowledgment/:acknowledgmentId/revoke
exports.revokeDocumentAcknowledgment = async (req, res) => {
  try {
    const { acknowledgmentId } = req.params;
    const { documentId } = req.body;

    const acknowledgment = await DocumentAcknowledgment.findById(acknowledgmentId);
    if (!acknowledgment) {
      return res.status(404).json({
        success: false,
        error: "Acknowledgment record not found",
      });
    }

    if (documentId) {
      // Remove specific document from acknowledgment
      acknowledgment.documents = acknowledgment.documents.filter(
        (doc) => doc.docId !== documentId
      );

      // If no documents left, mark as revoked
      if (acknowledgment.documents.length === 0) {
        acknowledgment.status = "revoked";
      }
    } else {
      // Revoke entire acknowledgment
      acknowledgment.status = "revoked";
    }

    // Also update student's document if student still exists
    if (acknowledgment.studentId && documentId) {
      try {
        const student = await FromStudents.findById(acknowledgment.studentId);
        if (student && student.documents) {
          const studentDocIndex = student.documents.findIndex(
            (doc) => doc.docId === documentId
          );
          if (studentDocIndex !== -1) {
            student.documents[studentDocIndex].submitted = "no";
            await student.save();
          }
        }
      } catch (studentError) {
        console.log("Student not found or update failed, continuing with revocation");
      }
    }

    await acknowledgment.save();

    res.status(200).json({
      success: true,
      message: "Document acknowledgment revoked successfully",
      data: acknowledgment,
    });
  } catch (err) {
    console.error("Error revoking document acknowledgment:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to revoke document acknowledgment",
    });
  }
};
