const RevaluationRequest = require("../../../models/examination/revaluation/RevaluationRequest");
const CombinedResult = require("../../../models/examination/CombinedResult");
const FromStudents = require("../../../models/admission/FromStudents");
const ExaminationPaymentTransaction = require("../../../models/examination/ExaminationPaymentTransaction");
// Ensure Subject model is loaded for population
require("../../../models/examination/selector/Subject");

// Import the createRevaluationRequests function from payment controller
// We'll recreate it here to avoid circular dependencies
const createRevaluationRequestsFromPayment = async (paymentTransaction) => {
  if (!paymentTransaction.revaluation_subjects || paymentTransaction.revaluation_subjects.length === 0) {
    return { created: 0, skipped: 0, errors: [] };
  }

  // Get student information
  const student = await FromStudents.findOne({
    registrationNumber: paymentTransaction.registration_number,
  }).lean();

  if (!student) {
    throw new Error(`Student not found for registration number: ${paymentTransaction.registration_number}`);
  }

  // Fetch all result records for the revaluation subjects
  const resultIds = paymentTransaction.revaluation_subjects;
  const results = await CombinedResult.find({
    _id: { $in: resultIds },
  })
    .populate("subjectId", "subjectName subjectCode")
    .lean();

  if (results.length === 0) {
    throw new Error("No results found for the selected subjects");
  }

  // Create a revaluation request for each result
  const requests = [];
  let skipped = 0;
  for (const result of results) {
    // Check if request already exists for this result and payment
    const existingRequest = await RevaluationRequest.findOne({
      resultId: result._id,
      paymentTransactionId: paymentTransaction._id,
    });

    if (existingRequest) {
      skipped++;
      continue;
    }

    // Generate unique request number
    const requestNumber = await generateRequestNumber();

    // Create revaluation request
    const revaluationRequest = new RevaluationRequest({
      requestNumber,
      studentId: student._id,
      registrationNumber: paymentTransaction.registration_number,
      studentName: paymentTransaction.student_name,
      courseStreamMappingId: paymentTransaction.courseStreamMappingId || student.courseStreamMappingId,
      resultId: result._id,
      subjectId: result.subjectId?._id || result.subjectId,
      subjectName: result.subjectId?.subjectName || result.subjectName || "N/A",
      originalMarks: result.totalMarks || 0,
      originalMaxMarks: result.maxMarks || 100,
      originalGrade: result.grade || null,
      originalStatus: result.status || "FAIL",
      paymentTransactionId: paymentTransaction._id,
      paymentStatus: paymentTransaction.payment_status === "SUCCESS" ? "Paid" : "Pending",
      status: "Pending",
      requestDate: new Date(),
    });

    requests.push(revaluationRequest);
  }

  // Save all requests
  if (requests.length > 0) {
    await RevaluationRequest.insertMany(requests);
  }

  return {
    created: requests.length,
    skipped: skipped,
    total: results.length,
  };
};

// Helper function to generate unique request number
const generateRequestNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `RV-${year}-`;

  // Find the latest request number for this year
  const latestRequest = await RevaluationRequest.findOne({
    requestNumber: new RegExp(`^${prefix}`),
  })
    .sort({ requestNumber: -1 })
    .select("requestNumber")
    .lean();

  let sequence = 1;
  if (latestRequest && latestRequest.requestNumber) {
    const lastSeq = parseInt(latestRequest.requestNumber.split("-")[2] || "0");
    sequence = lastSeq + 1;
  }

  // Format: RV-YYYY-XXX (e.g., RV-2025-001)
  return `${prefix}${String(sequence).padStart(3, "0")}`;
};

// @desc Get all revaluation requests with filters
// @route GET /api/revaluation/requests
exports.getAllRequests = async (req, res) => {
  try {
    console.log("📥 Fetching revaluation requests with params:", req.query);
    const {
      status,
      registrationNumber,
      subjectId,
      studentId,
      paymentStatus,
      dateFrom,
      dateTo,
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (registrationNumber) {
      query.registrationNumber = { $regex: registrationNumber, $options: "i" };
    }

    if (subjectId) {
      query.subjectId = subjectId;
    }

    if (studentId) {
      query.studentId = studentId;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (dateFrom || dateTo) {
      query.requestDate = {};
      if (dateFrom) {
        query.requestDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.requestDate.$lte = new Date(dateTo);
      }
    }

    if (search) {
      // First, try to find payment transactions by transaction_id
      const matchingPayments = await ExaminationPaymentTransaction.find({
        transaction_id: { $regex: search, $options: "i" },
      }).select("_id").lean();
      
      const paymentIds = matchingPayments.map((p) => p._id);
      
      query.$or = [
        { registrationNumber: { $regex: search, $options: "i" } },
        { studentName: { $regex: search, $options: "i" } },
        { requestNumber: { $regex: search, $options: "i" } },
        { subjectName: { $regex: search, $options: "i" } },
      ];
      
      // If we found payment transactions, also search by paymentTransactionId
      if (paymentIds.length > 0) {
        query.$or.push({ paymentTransactionId: { $in: paymentIds } });
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    // Fetch requests with comprehensive population
    // Note: studentId ref is "FromStudents" but model is registered as "Student"
    // Using maxTimeMS to prevent long-running queries
    console.log("🔍 Executing query:", JSON.stringify(query, null, 2));
    
    const requests = await RevaluationRequest.find(query)
      .maxTimeMS(30000) // 30 second timeout
      .populate({
        path: "studentId",
        model: "Student", // Use "Student" model name instead of "FromStudents"
        select: "registrationNumber nameSSC email phone selectCourse selectStream semesterYear"
      })
      .populate({
        path: "subjectId",
        select: "name code"
      })
      .populate({
        path: "resultId",
        select: "totalMarks maxMarks status grade internalMarks externalMarks examType subjectId courseStreamMappingId createdAt updatedAt isPass",
        populate: [
          { 
            path: "subjectId",
            select: "name code"
          },
          { 
            path: "courseStreamMappingId",
            select: "courseId streamId semesterId",
            populate: [
              { path: "courseId", select: "name code" },
              { path: "streamId", select: "name code" },
              { path: "semesterId", select: "name number" }
            ]
          }
        ]
      })
      .populate({
        path: "paymentTransactionId",
        select: "transaction_id amount payment_status payment_completed_at bank_reference_number payment_mode payment_gateway createdAt updatedAt revaluation_subjects revaluation_subject_count registration_number student_name email phone courseStreamMappingId"
      })
      .populate({
        path: "assignedEvaluatorId",
        select: "name professorId employeeId contactNumber email"
      })
      .populate({
        path: "courseStreamMappingId",
        populate: [
          { path: "courseId", select: "name code" },
          { path: "streamId", select: "name code" },
          { path: "semesterId", select: "name number" }
        ]
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean()
      .exec();
    
    console.log(`✅ Fetched ${requests.length} requests`);

    // Get total count with timeout
    const total = await RevaluationRequest.countDocuments(query).maxTimeMS(10000).exec();
    console.log(`📊 Total count: ${total}`);

    // Enrich requests with additional payment and exam information
    const enrichedRequests = requests.map((request) => {
      const enriched = { ...request };
      
      // Add payment transaction details in structured format
      if (request.paymentTransactionId) {
        enriched.payment = {
          transactionId: request.paymentTransactionId.transaction_id,
          amount: request.paymentTransactionId.amount,
          status: request.paymentTransactionId.payment_status,
          completedAt: request.paymentTransactionId.payment_completed_at,
          bankReference: request.paymentTransactionId.bank_reference_number,
          paymentMode: request.paymentTransactionId.payment_mode,
          paymentGateway: request.paymentTransactionId.payment_gateway,
          createdAt: request.paymentTransactionId.createdAt,
          updatedAt: request.paymentTransactionId.updatedAt,
          revaluationSubjectCount: request.paymentTransactionId.revaluation_subject_count || 0,
          studentName: request.paymentTransactionId.student_name,
          registrationNumber: request.paymentTransactionId.registration_number,
          email: request.paymentTransactionId.email,
          phone: request.paymentTransactionId.phone,
        };
      }

      // Add exam marks details from CombinedResult
      if (request.resultId) {
        enriched.examMarks = {
          totalMarks: request.resultId.totalMarks || request.originalMarks,
          maxMarks: request.resultId.maxMarks || request.originalMaxMarks,
          internalMarks: request.resultId.internalMarks || null,
          externalMarks: request.resultId.externalMarks || null,
          grade: request.resultId.grade || request.originalGrade,
          status: request.resultId.status || request.originalStatus,
          isPass: request.resultId.isPass || false,
          examType: request.resultId.examType || null,
          resultDate: request.resultId.createdAt || null,
        };

        // Add subject details from populated result or direct subjectId
        // Subject model uses 'name' and 'code' fields
        let subjectName = "N/A";
        let subjectCode = null;
        
        // Try to get subject name from populated resultId.subjectId
        if (request.resultId.subjectId && typeof request.resultId.subjectId === 'object') {
          subjectName = request.resultId.subjectId.name || request.resultId.subjectId.subjectName || subjectName;
          subjectCode = request.resultId.subjectId.code || request.resultId.subjectId.subjectCode || subjectCode;
        }
        
        // Fallback to direct subjectId populate
        if (subjectName === "N/A" && request.subjectId && typeof request.subjectId === 'object') {
          subjectName = request.subjectId.name || request.subjectId.subjectName || subjectName;
          subjectCode = request.subjectId.code || request.subjectId.subjectCode || subjectCode;
        }
        
        // Final fallback to stored subjectName field
        if (subjectName === "N/A" && request.subjectName) {
          subjectName = request.subjectName;
        }
        
        enriched.examMarks.subject = {
          name: subjectName,
          code: subjectCode,
        };
        
        // Also update the main subjectName field if it was populated
        if (request.subjectId && typeof request.subjectId === 'object' && request.subjectId.name) {
          enriched.subjectName = request.subjectId.name;
        }

        // Add course/stream/semester details from courseStreamMappingId in result
        if (request.resultId.courseStreamMappingId) {
          const mapping = request.resultId.courseStreamMappingId;
          if (mapping.courseId) {
            enriched.examMarks.course = {
              name: mapping.courseId.name,
              code: mapping.courseId.code,
            };
          }
          if (mapping.streamId) {
            enriched.examMarks.stream = {
              name: mapping.streamId.name,
              code: mapping.streamId.code,
            };
          }
          if (mapping.semesterId) {
            enriched.examMarks.semester = {
              name: mapping.semesterId.name,
              number: mapping.semesterId.number,
            };
          }
        }
      }

      // Add course stream mapping details
      if (request.courseStreamMappingId) {
        enriched.courseInfo = {
          course: request.courseStreamMappingId.courseId?.name || null,
          courseCode: request.courseStreamMappingId.courseId?.code || null,
          stream: request.courseStreamMappingId.streamId?.name || null,
          streamCode: request.courseStreamMappingId.streamId?.code || null,
          semester: request.courseStreamMappingId.semesterId?.name || null,
          semesterNumber: request.courseStreamMappingId.semesterId?.number || null,
        };
      }

      return enriched;
    });

    res.status(200).json({
      success: true,
      data: {
        requests: enrichedRequests,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          totalRecords: total,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching revaluation requests:", error);
    
    // Handle specific MongoDB errors
    if (error.name === 'MongoTimeoutError' || error.code === 'ECONNRESET') {
      console.error("MongoDB connection timeout or reset. Retrying...");
      return res.status(503).json({
        success: false,
        message: "Database connection timeout. Please try again.",
        error: "Connection timeout - the query took too long to execute",
      });
    }
    
    if (error.name === 'MongoNetworkError') {
      console.error("MongoDB network error");
      return res.status(503).json({
        success: false,
        message: "Database connection error. Please try again.",
        error: "Network error - unable to connect to database",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get single revaluation request by ID
// @route GET /api/revaluation/requests/:id
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await RevaluationRequest.findById(id)
      .populate("studentId", "registrationNumber nameSSC email phone selectCourse selectStream semesterYear")
      .populate("subjectId", "subjectName subjectCode")
      .populate("resultId")
      .populate("paymentTransactionId")
      .populate("assignedEvaluatorId", "name professorId employeeId contactNumber")
      .populate("courseStreamMappingId")
      .lean();

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Revaluation request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Error fetching revaluation request:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Create new revaluation request (manual creation - usually auto-created after payment)
// @route POST /api/revaluation/requests
exports.createRequest = async (req, res) => {
  try {
    const {
      registrationNumber,
      resultId,
      paymentTransactionId,
      remarks,
    } = req.body;

    // Validate required fields
    if (!registrationNumber || !resultId || !paymentTransactionId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: registrationNumber, resultId, paymentTransactionId",
      });
    }

    // Check if request already exists
    const existingRequest = await RevaluationRequest.findOne({
      resultId,
      paymentTransactionId,
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Revaluation request already exists for this result and payment",
      });
    }

    // Get student information
    const student = await FromStudents.findOne({
      registrationNumber,
    }).lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get result information
    const result = await CombinedResult.findById(resultId)
      .populate("subjectId", "subjectName subjectCode")
      .lean();

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    // Get payment transaction
    const paymentTransaction = await ExaminationPaymentTransaction.findById(
      paymentTransactionId
    ).lean();

    if (!paymentTransaction) {
      return res.status(404).json({
        success: false,
        message: "Payment transaction not found",
      });
    }

    // Generate request number
    const requestNumber = await generateRequestNumber();

    // Create revaluation request
    const revaluationRequest = new RevaluationRequest({
      requestNumber,
      studentId: student._id,
      registrationNumber,
      studentName: student.nameSSC || student.name || "N/A",
      courseStreamMappingId: student.courseStreamMappingId || paymentTransaction.courseStreamMappingId,
      resultId: result._id,
      subjectId: result.subjectId?._id || result.subjectId,
      subjectName: result.subjectId?.subjectName || result.subjectName || "N/A",
      originalMarks: result.totalMarks || 0,
      originalMaxMarks: result.maxMarks || 100,
      originalGrade: result.grade || null,
      originalStatus: result.status || "FAIL",
      paymentTransactionId: paymentTransaction._id,
      paymentStatus: paymentTransaction.payment_status === "SUCCESS" ? "Paid" : "Pending",
      status: "Pending",
      requestDate: new Date(),
      remarks: remarks || "",
    });

    await revaluationRequest.save();

    // Populate before returning
    await revaluationRequest.populate([
      { path: "studentId", select: "registrationNumber nameSSC email phone" },
      { path: "subjectId", select: "subjectName subjectCode" },
      { path: "resultId" },
      { path: "paymentTransactionId" },
    ]);

    res.status(201).json({
      success: true,
      message: "Revaluation request created successfully",
      data: revaluationRequest,
    });
  } catch (error) {
    console.error("Error creating revaluation request:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Update revaluation request
// @route PUT /api/revaluation/requests/:id
exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const request = await RevaluationRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Revaluation request not found",
      });
    }

    // Update fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        request[key] = updateData[key];
      }
    });

    await request.save();

    // Populate before returning
    await request.populate([
      { path: "studentId", select: "registrationNumber nameSSC email phone" },
      { path: "subjectId", select: "subjectName subjectCode" },
      { path: "resultId" },
      { path: "paymentTransactionId" },
      { path: "assignedEvaluatorId", select: "name professorId employeeId" },
    ]);

    res.status(200).json({
      success: true,
      message: "Revaluation request updated successfully",
      data: request,
    });
  } catch (error) {
    console.error("Error updating revaluation request:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Approve revaluation request
// @route PUT /api/revaluation/requests/:id/approve
exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const request = await RevaluationRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Revaluation request not found",
      });
    }

    // Validate payment status
    if (request.paymentStatus !== "Paid") {
      return res.status(400).json({
        success: false,
        message: "Cannot approve request. Payment status must be 'Paid'",
      });
    }

    // Update status
    request.status = "Approved";
    request.approvedAt = new Date();
    if (remarks) {
      request.remarks = remarks;
    }

    await request.save();

    await request.populate([
      { path: "studentId", select: "registrationNumber nameSSC email phone" },
      { path: "subjectId", select: "subjectName subjectCode" },
      { path: "resultId" },
      { path: "paymentTransactionId" },
    ]);

    res.status(200).json({
      success: true,
      message: "Revaluation request approved successfully",
      data: request,
    });
  } catch (error) {
    console.error("Error approving revaluation request:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Reject revaluation request
// @route PUT /api/revaluation/requests/:id/reject
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason, remarks } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const request = await RevaluationRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Revaluation request not found",
      });
    }

    // Update status
    request.status = "Rejected";
    request.rejectedAt = new Date();
    request.rejectionReason = rejectionReason;
    if (remarks) {
      request.remarks = remarks;
    }

    await request.save();

    await request.populate([
      { path: "studentId", select: "registrationNumber nameSSC email phone" },
      { path: "subjectId", select: "subjectName subjectCode" },
      { path: "resultId" },
      { path: "paymentTransactionId" },
    ]);

    res.status(200).json({
      success: true,
      message: "Revaluation request rejected successfully",
      data: request,
    });
  } catch (error) {
    console.error("Error rejecting revaluation request:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Assign evaluator to revaluation request
// @route PUT /api/revaluation/requests/:id/assign-evaluator
exports.assignEvaluator = async (req, res) => {
  try {
    const { id } = req.params;
    const { evaluatorId } = req.body;

    if (!evaluatorId) {
      return res.status(400).json({
        success: false,
        message: "Evaluator ID is required",
      });
    }

    const request = await RevaluationRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Revaluation request not found",
      });
    }

    if (request.status !== "Approved") {
      return res.status(400).json({
        success: false,
        message: "Request must be approved before assigning evaluator",
      });
    }

    // Update evaluator assignment
    request.assignedEvaluatorId = evaluatorId;
    request.assignedAt = new Date();
    request.status = "In Progress";

    await request.save();

    await request.populate([
      { path: "studentId", select: "registrationNumber nameSSC email phone" },
      { path: "subjectId", select: "subjectName subjectCode" },
      { path: "resultId" },
      { path: "paymentTransactionId" },
      { path: "assignedEvaluatorId", select: "name professorId employeeId contactNumber" },
    ]);

    res.status(200).json({
      success: true,
      message: "Evaluator assigned successfully",
      data: request,
    });
  } catch (error) {
    console.error("Error assigning evaluator:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Enter revaluation marks
// @route PUT /api/revaluation/requests/:id/enter-marks
exports.enterMarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { revaluationMarks, revaluationMaxMarks, newGrade, remarks } = req.body;

    if (revaluationMarks === undefined || revaluationMarks === null) {
      return res.status(400).json({
        success: false,
        message: "Revaluation marks are required",
      });
    }

    if (revaluationMarks < 0) {
      return res.status(400).json({
        success: false,
        message: "Revaluation marks cannot be negative",
      });
    }

    const request = await RevaluationRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Revaluation request not found",
      });
    }

    if (request.status !== "In Progress") {
      return res.status(400).json({
        success: false,
        message: "Request must be in progress before entering marks",
      });
    }

    // Update marks
    request.revaluationMarks = revaluationMarks;
    request.revaluationMaxMarks = revaluationMaxMarks || request.originalMaxMarks;
    request.difference = revaluationMarks - request.originalMarks;
    if (newGrade) {
      request.newGrade = newGrade;
    }
    if (remarks) {
      request.remarks = remarks;
    }

    // Determine new status based on pass marks (you may need to get this from exam setup)
    // For now, using original max marks and assuming 40% is passing
    const passMarks = (request.revaluationMaxMarks * 40) / 100;
    request.newStatus = revaluationMarks >= passMarks ? "PASS" : "FAIL";

    await request.save();

    await request.populate([
      { path: "studentId", select: "registrationNumber nameSSC email phone" },
      { path: "subjectId", select: "subjectName subjectCode" },
      { path: "resultId" },
      { path: "paymentTransactionId" },
      { path: "assignedEvaluatorId", select: "name professorId employeeId" },
    ]);

    res.status(200).json({
      success: true,
      message: "Revaluation marks entered successfully",
      data: request,
    });
  } catch (error) {
    console.error("Error entering revaluation marks:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Complete revaluation process
// @route PUT /api/revaluation/requests/:id/complete
exports.completeRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await RevaluationRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Revaluation request not found",
      });
    }

    if (request.revaluationMarks === null || request.revaluationMarks === undefined) {
      return res.status(400).json({
        success: false,
        message: "Cannot complete request. Revaluation marks must be entered first",
      });
    }

    // Update status
    request.status = "Completed";
    request.revaluationCompletedAt = new Date();

    // TODO: Update the actual CombinedResult with new marks
    // This would update the student's result in the system
    const result = await CombinedResult.findById(request.resultId);
    if (result) {
      result.totalMarks = request.revaluationMarks;
      result.status = request.newStatus;
      result.isPass = request.newStatus === "PASS";
      if (request.newGrade) {
        result.grade = request.newGrade;
      }
      await result.save();
    }

    await request.save();

    await request.populate([
      { path: "studentId", select: "registrationNumber nameSSC email phone" },
      { path: "subjectId", select: "subjectName subjectCode" },
      { path: "resultId" },
      { path: "paymentTransactionId" },
      { path: "assignedEvaluatorId", select: "name professorId employeeId" },
    ]);

    res.status(200).json({
      success: true,
      message: "Revaluation completed successfully. Student result has been updated.",
      data: request,
    });
  } catch (error) {
    console.error("Error completing revaluation request:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Delete revaluation request (soft delete - set status to Cancelled)
// @route DELETE /api/revaluation/requests/:id
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await RevaluationRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Revaluation request not found",
      });
    }

    // Soft delete - set status to Cancelled
    request.status = "Cancelled";
    await request.save();

    res.status(200).json({
      success: true,
      message: "Revaluation request cancelled successfully",
    });
  } catch (error) {
    console.error("Error deleting revaluation request:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get revaluation statistics
// @route GET /api/revaluation/statistics
exports.getStatistics = async (req, res) => {
  try {
    const stats = await RevaluationRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const paymentStats = await RevaluationRequest.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await RevaluationRequest.countDocuments();

    const statistics = {
      total,
      byStatus: {},
      byPaymentStatus: {},
    };

    stats.forEach((stat) => {
      statistics.byStatus[stat._id] = stat.count;
    });

    paymentStats.forEach((stat) => {
      statistics.byPaymentStatus[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error("Error fetching revaluation statistics:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Create revaluation requests from payment transaction
// @route POST /api/revaluation/create-from-payment/:paymentTransactionId
exports.createRequestsFromPayment = async (req, res) => {
  try {
    const { paymentTransactionId } = req.params;

    if (!paymentTransactionId) {
      return res.status(400).json({
        success: false,
        message: "Payment transaction ID is required",
      });
    }

    // Get payment transaction
    const paymentTransaction = await ExaminationPaymentTransaction.findById(
      paymentTransactionId
    ).lean();

    if (!paymentTransaction) {
      return res.status(404).json({
        success: false,
        message: "Payment transaction not found",
      });
    }

    // Check if it has revaluation subjects
    if (!paymentTransaction.revaluation_subjects || paymentTransaction.revaluation_subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: "This payment transaction does not have any revaluation subjects",
      });
    }

    // Create revaluation requests
    const result = await createRevaluationRequestsFromPayment(paymentTransaction);

    res.status(200).json({
      success: true,
      message: `Created ${result.created} revaluation request(s). ${result.skipped} already existed.`,
      data: result,
    });
  } catch (error) {
    console.error("Error creating revaluation requests from payment:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
