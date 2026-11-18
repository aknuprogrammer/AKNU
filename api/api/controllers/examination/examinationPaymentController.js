const ExaminationPaymentTransaction = require("../../models/examination/ExaminationPaymentTransaction");
const RevaluationRequest = require("../../models/examination/revaluation/RevaluationRequest");
const CombinedResult = require("../../models/examination/CombinedResult");
const easebuzzService = require("../../services/easebuzzService");
const submerchants = require("../../config/submerchants");
const FromStudents = require("../../models/admission/FromStudents");

// @desc Initiate payment with Easebuzz (Full Integration)
// @route POST /api/examination-application/initiate-payment
exports.initiatePayment = async (req, res) => {
  try {
    const {
      amount,
      firstname,
      email,
      phone,
      registration_number,
      course,
      semester,
      regular_subjects = [],
      supplementary_subjects = [],
      revaluation_subjects = [], // For revaluation applications
      productinfo,
      surl,
      furl,
    } = req.body;

    // Validate required fields
    if (!amount || !firstname || !email || !phone || !registration_number) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: amount, firstname, email, phone, registration_number",
      });
    }

    // Check Easebuzz credentials
    if (!easebuzzService.key || !easebuzzService.salt) {
      return res.status(500).json({
        success: false,
        message:
          "Easebuzz credentials not configured. Please add EASEBUZZ_MERCHANT_KEY and EASEBUZZ_SALT_KEY to your .env file.",
      });
    }

    // Prepare payment details
    // IMPORTANT: Always use backend callback URL, not frontend URL
    // Backend callback will update status and then redirect to frontend
    // Determine if this is a revaluation payment
    const isRevaluation = revaluation_subjects && revaluation_subjects.length > 0;
    const callbackBasePath = isRevaluation 
      ? "/api/revaluation-application/payment-callback"
      : "/api/examination-application/payment-callback";
    const backendCallbackUrl = `${
      process.env.BACKEND_URL || "http://localhost:4567"
    }${callbackBasePath}`;

    // Helper function to sanitize UDF fields for Easebuzz
    // Easebuzz may reject special characters or long values
    const sanitizeUdfField = (value, maxLength = 100) => {
      if (!value) return "";
      // Remove special characters that might cause issues (keep alphanumeric, spaces, hyphens)
      let sanitized = String(value)
        .trim()
        .replace(/[^\w\s\-]/g, "") // Remove special chars except word chars, spaces, hyphens
        .replace(/\s+/g, " "); // Replace multiple spaces with single space
      // Truncate if too long
      if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
      }
      return sanitized;
    };

    const paymentDetails = {
      amount: parseFloat(amount),
      productinfo: sanitizeUdfField(productinfo || "Examination Fee", 100), // Sanitize productinfo to remove special characters
      firstname: firstname,
      email: email,
      phone: phone,
      feeType: "exam", // Always use exam for examination module
      // Always use backend callback - it will handle status update and redirect to frontend
      surl: backendCallbackUrl,
      furl: backendCallbackUrl,
      // UDF fields for additional data - sanitized for Easebuzz compatibility
      udf1: sanitizeUdfField(registration_number, 50), // registration_number
      udf2: sanitizeUdfField(course, 100), // course (sanitized - removes apostrophes, etc.)
      udf3: sanitizeUdfField(semester, 50), // semester
      // For revaluation, use revaluation count, otherwise use regular/supplementary counts
      udf4: revaluation_subjects.length > 0 
        ? `${revaluation_subjects.length}_0` 
        : `${regular_subjects.length}_${supplementary_subjects.length}`, // subject counts
      // Note: udf5 contains JSON but won't be sent to Easebuzz (stored in DB only)
      // Easebuzz uses udf5-udf7 for sub-merchant ID, so we can't send JSON there
      udf5: JSON.stringify({
        // subjects JSON (stored in DB, not sent to Easebuzz)
        regularSubjects: regular_subjects,
        supplementarySubjects: supplementary_subjects,
        revaluationSubjects: revaluation_subjects,
      }),
    };

    // Initiate payment with Easebuzz
    let result;
    try {
      result = await easebuzzService.initiatePayment(paymentDetails);
    } catch (error) {
      console.error("Payment initiation error:", error);
      return res.status(500).json({
        success: false,
        message: "Payment initiation failed",
        error: error.message || error.error || "Unknown error occurred",
      });
    }

    if (!result.success) {
      console.error("Easebuzz payment error:", result.error);
      return res.status(400).json({
        success: false,
        message: result.error || "Payment initiation failed",
        error: result.error,
      });
    }

    // Get student's courseStreamMappingId from registration number
    let courseStreamMappingId = null;
    try {
      const student = await FromStudents.findOne({
        registrationNumber: registration_number,
      })
        .select("courseStreamMappingId registrationNumber")
        .lean();
      if (student) {
        if (student.courseStreamMappingId) {
          courseStreamMappingId = student.courseStreamMappingId;
          console.log(
            `✅ Found courseStreamMappingId for ${registration_number}: ${courseStreamMappingId}`
          );
        } else {
          console.warn(
            `⚠️ Student ${registration_number} found but has no courseStreamMappingId`
          );
        }
      } else {
        console.warn(
          `⚠️ Student not found for registration number: ${registration_number}`
        );
      }
    } catch (err) {
      console.error(
        `❌ Error fetching student courseStreamMappingId for ${registration_number}:`,
        err
      );
      // Continue without courseStreamMappingId if fetch fails
    }

    // Convert regular_subjects and supplementary_subjects to ObjectIds if they're strings
    // Assuming they come as courseStreamMappingIds (ObjectIds as strings or ObjectIds)
    const regularSubjectsIds = regular_subjects
      .map((sub) => {
        if (typeof sub === "string" && sub.match(/^[0-9a-fA-F]{24}$/)) {
          return sub; // Valid ObjectId string
        }
        return sub; // Already ObjectId or invalid (will be filtered)
      })
      .filter(Boolean);

    const supplementarySubjectsIds = supplementary_subjects
      .map((sub) => {
        if (typeof sub === "string" && sub.match(/^[0-9a-fA-F]{24}$/)) {
          return sub; // Valid ObjectId string
        }
        return sub; // Already ObjectId or invalid (will be filtered)
      })
      .filter(Boolean);

    // Convert revaluation_subjects (result IDs) to ObjectIds if they're strings
    const revaluationSubjectsIds = revaluation_subjects
      .map((sub) => {
        if (typeof sub === "string" && sub.match(/^[0-9a-fA-F]{24}$/)) {
          return sub; // Valid ObjectId string
        }
        return sub; // Already ObjectId or invalid (will be filtered)
      })
      .filter(Boolean);

    // Get submerchant info for database storage
    const submerchantInfo = submerchants.exam || {};

    // Create payment transaction record
    const paymentTransaction = new ExaminationPaymentTransaction({
      transaction_id: result.txnid,
      registration_number: registration_number,
      student_name: firstname,
      course: course || "",
      semester: semester || "",
      email: email,
      phone: phone,
      amount: paymentDetails.amount,
      payment_gateway: "Easebuzz",
      payment_status: "PENDING",
      courseStreamMappingId: courseStreamMappingId,
      regular_subjects: regularSubjectsIds,
      supplementary_subjects: supplementarySubjectsIds,
      regular_subject_count: regularSubjectsIds.length,
      supplementary_subject_count: supplementarySubjectsIds.length,
      revaluation_subjects: revaluationSubjectsIds,
      revaluation_subject_count: revaluationSubjectsIds.length,
      payment_link: result.paymentUrl,
      sub_merchant_id:
        result.paymentData.sub_merchant_id || submerchantInfo.id || null,
      merchant_key: result.paymentData.key,
      bank_account: submerchantInfo.bank_account || null,
      bank_name: submerchantInfo.bank_name || null,
      account_number: submerchantInfo.account_number || null,
      ifsc_code: submerchantInfo.ifsc_code || null,
    });

    await paymentTransaction.save();

    res.status(200).json({
      success: true,
      message: "Payment initiated successfully",
      data: {
        transactionId: result.txnid,
        paymentUrl: result.paymentUrl,
        paymentData: {
          txnid: result.txnid,
          amount: paymentDetails.amount,
          sub_merchant_id: result.paymentData.sub_merchant_id || null,
        },
      },
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// @desc Record payment initiation (legacy endpoint for compatibility)
// @route POST /api/examination-application/payment-initiated
exports.paymentInitiated = async (req, res) => {
  try {
    const {
      transactionId,
      amount,
      studentData,
      subjects,
      paymentGateway,
      paymentLink,
    } = req.body;

    // Validation
    if (!transactionId || !amount || !studentData) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: transactionId, amount, studentData",
      });
    }

    // Check if transaction already exists
    const existingTransaction = await ExaminationPaymentTransaction.findOne({
      transaction_id: transactionId,
    });

    if (existingTransaction) {
      return res.status(200).json({
        success: true,
        message: "Payment initiation already recorded",
        data: {
          id: existingTransaction._id,
          transactionId: existingTransaction.transaction_id,
        },
      });
    }

    // Get student's courseStreamMappingId from registration number
    let courseStreamMappingId = null;
    try {
      const student = await FromStudents.findOne({
        registrationNumber: studentData.registrationNumber,
      })
        .select("courseStreamMappingId")
        .lean();
      if (student && student.courseStreamMappingId) {
        courseStreamMappingId = student.courseStreamMappingId;
      }
    } catch (err) {
      console.error("Error fetching student courseStreamMappingId:", err);
    }

    // Convert subjects to ObjectIds if they're courseStreamMappingIds
    const regularSubjectsIds = (subjects?.regular || [])
      .map((sub) => {
        if (typeof sub === "string" && sub.match(/^[0-9a-fA-F]{24}$/)) {
          return sub;
        }
        return sub;
      })
      .filter(Boolean);

    const supplementarySubjectsIds = (subjects?.supplementary || [])
      .map((sub) => {
        if (typeof sub === "string" && sub.match(/^[0-9a-fA-F]{24}$/)) {
          return sub;
        }
        return sub;
      })
      .filter(Boolean);

    // Create new payment transaction
    const paymentTransaction = new ExaminationPaymentTransaction({
      transaction_id: transactionId,
      registration_number: studentData.registrationNumber || "",
      student_name: studentData.name || "",
      course: studentData.course || "",
      semester: studentData.semester || "",
      email: studentData.email || "",
      phone: studentData.phone || "",
      amount: amount,
      payment_gateway: paymentGateway || "Easebuzz",
      payment_status: "PENDING",
      courseStreamMappingId: courseStreamMappingId,
      regular_subjects: regularSubjectsIds,
      supplementary_subjects: supplementarySubjectsIds,
      regular_subject_count: regularSubjectsIds.length,
      supplementary_subject_count: supplementarySubjectsIds.length,
      payment_link: paymentLink || "",
    });

    await paymentTransaction.save();

    res.status(201).json({
      success: true,
      message: "Payment initiation recorded",
      data: {
        id: paymentTransaction._id,
        transactionId: paymentTransaction.transaction_id,
      },
    });
  } catch (error) {
    console.error("Error recording payment initiation:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Record successful payment
// @route POST /api/examination-application/payment-success
exports.paymentSuccess = async (req, res) => {
  try {
    const {
      transactionId,
      transactionData,
      studentData,
      subjects,
      amount,
      paymentGateway,
    } = req.body;

    // Validation
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: transactionId",
      });
    }

    // Find existing transaction
    let paymentTransaction = await ExaminationPaymentTransaction.findOne({
      transaction_id: transactionId,
    });

    if (!paymentTransaction) {
      // Get student's courseStreamMappingId
      let courseStreamMappingId = null;
      try {
        const student = await FromStudents.findOne({
          registrationNumber: studentData?.registrationNumber,
        })
          .select("courseStreamMappingId")
          .lean();
        if (student && student.courseStreamMappingId) {
          courseStreamMappingId = student.courseStreamMappingId;
        }
      } catch (err) {
        console.error("Error fetching student courseStreamMappingId:", err);
      }

      // Convert subjects to ObjectIds
      const regularSubjectsIds = (subjects?.regular || [])
        .map((sub) => {
          if (typeof sub === "string" && sub.match(/^[0-9a-fA-F]{24}$/)) {
            return sub;
          }
          return sub;
        })
        .filter(Boolean);

      const supplementarySubjectsIds = (subjects?.supplementary || [])
        .map((sub) => {
          if (typeof sub === "string" && sub.match(/^[0-9a-fA-F]{24}$/)) {
            return sub;
          }
          return sub;
        })
        .filter(Boolean);

      // Create new if doesn't exist (webhook might have created it)
      paymentTransaction = new ExaminationPaymentTransaction({
        transaction_id: transactionId,
        registration_number: studentData?.registrationNumber || "",
        student_name: studentData?.name || "",
        course: studentData?.course || "",
        semester: studentData?.semester || "",
        email: transactionData?.email || studentData?.email || "",
        phone: transactionData?.phone || studentData?.phone || "",
        amount: amount || parseFloat(transactionData?.amount) || 0,
        payment_gateway: paymentGateway || "Easebuzz",
        payment_status: "SUCCESS",
        courseStreamMappingId: courseStreamMappingId,
        regular_subjects: regularSubjectsIds,
        supplementary_subjects: supplementarySubjectsIds,
        regular_subject_count: regularSubjectsIds.length,
        supplementary_subject_count: supplementarySubjectsIds.length,
        easebuzz_transaction_data: transactionData || {},
        bank_reference_number: transactionData?.bank_ref_num || "",
        payment_mode: transactionData?.payment_mode || "",
        payment_completed_at: new Date(),
      });
    } else {
      // Update existing transaction
      paymentTransaction.payment_status = "SUCCESS";
      paymentTransaction.easebuzz_transaction_data =
        transactionData || paymentTransaction.easebuzz_transaction_data;
      paymentTransaction.bank_reference_number =
        transactionData?.bank_ref_num ||
        paymentTransaction.bank_reference_number;
      paymentTransaction.payment_mode =
        transactionData?.payment_mode || paymentTransaction.payment_mode;
      paymentTransaction.payment_completed_at = new Date();
    }

    await paymentTransaction.save();

    res.status(200).json({
      success: true,
      message: "Payment recorded successfully",
      data: {
        id: paymentTransaction._id,
        transactionId: paymentTransaction.transaction_id,
        status: paymentTransaction.payment_status,
      },
    });
  } catch (error) {
    console.error("Error recording payment success:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Record failed payment
// @route POST /api/examination-application/payment-failure
exports.paymentFailure = async (req, res) => {
  try {
    const {
      transactionId,
      studentData,
      subjects,
      amount,
      paymentGateway,
      errorMessage,
    } = req.body;

    // Validation
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: transactionId",
      });
    }

    // Find existing transaction
    let paymentTransaction = await ExaminationPaymentTransaction.findOne({
      transaction_id: transactionId,
    });

    if (!paymentTransaction) {
      // Get student's courseStreamMappingId
      let courseStreamMappingId = null;
      try {
        const student = await FromStudents.findOne({
          registrationNumber: studentData?.registrationNumber,
        })
          .select("courseStreamMappingId")
          .lean();
        if (student && student.courseStreamMappingId) {
          courseStreamMappingId = student.courseStreamMappingId;
        }
      } catch (err) {
        console.error("Error fetching student courseStreamMappingId:", err);
      }

      // Convert subjects to ObjectIds
      const regularSubjectsIds = (subjects?.regular || [])
        .map((sub) => {
          if (typeof sub === "string" && sub.match(/^[0-9a-fA-F]{24}$/)) {
            return sub;
          }
          return sub;
        })
        .filter(Boolean);

      const supplementarySubjectsIds = (subjects?.supplementary || [])
        .map((sub) => {
          if (typeof sub === "string" && sub.match(/^[0-9a-fA-F]{24}$/)) {
            return sub;
          }
          return sub;
        })
        .filter(Boolean);

      // Create new if doesn't exist
      paymentTransaction = new ExaminationPaymentTransaction({
        transaction_id: transactionId,
        registration_number: studentData?.registrationNumber || "",
        student_name: studentData?.name || "",
        course: studentData?.course || "",
        semester: studentData?.semester || "",
        email: studentData?.email || "",
        phone: studentData?.phone || "",
        amount: amount || 0,
        payment_gateway: paymentGateway || "Easebuzz",
        payment_status: "FAILED",
        courseStreamMappingId: courseStreamMappingId,
        regular_subjects: regularSubjectsIds,
        supplementary_subjects: supplementarySubjectsIds,
        regular_subject_count: regularSubjectsIds.length,
        supplementary_subject_count: supplementarySubjectsIds.length,
        error_message: errorMessage || "Payment failed",
        payment_completed_at: new Date(),
      });
    } else {
      // Update existing transaction
      paymentTransaction.payment_status = "FAILED";
      paymentTransaction.error_message =
        errorMessage || paymentTransaction.error_message;
      paymentTransaction.payment_completed_at = new Date();
    }

    await paymentTransaction.save();

    res.status(200).json({
      success: true,
      message: "Payment failure recorded",
      data: {
        id: paymentTransaction._id,
        transactionId: paymentTransaction.transaction_id,
        status: paymentTransaction.payment_status,
      },
    });
  } catch (error) {
    console.error("Error recording payment failure:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Handle Easebuzz webhook (S2S Integration)
// @route POST /api/examination-application/payment-webhook
exports.paymentWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    const { txnid, status, hash } = webhookData;

    console.log("Transaction Webhook received:", { txnid, status });

    // Verify webhook hash for security
    const isValidHash = easebuzzService.verifyWebhookHash(webhookData, hash);

    if (!isValidHash) {
      console.error("Invalid webhook hash - potential security threat");
      return res.status(400).json({
        success: false,
        message: "Invalid webhook hash",
      });
    }

    // Process webhook data
    const processedData = easebuzzService.processWebhookData(webhookData);

    // Parse subject data from udf5 if available
    let regularSubjects = [];
    let supplementarySubjects = [];
    let regularCount = 0;
    let supplementaryCount = 0;

    if (webhookData.udf5) {
      try {
        const subjectsData = JSON.parse(webhookData.udf5);
        regularSubjects =
          subjectsData.regularSubjects || subjectsData.regular || [];
        supplementarySubjects =
          subjectsData.supplementarySubjects ||
          subjectsData.supplementary ||
          [];
      } catch (e) {
        console.error("Error parsing subjects from udf5:", e);
      }
    }

    // Parse subject counts from udf4 if available
    if (webhookData.udf4) {
      const counts = webhookData.udf4.split("_");
      if (counts.length >= 2) {
        regularCount = parseInt(counts[0]) || 0;
        supplementaryCount = parseInt(counts[1]) || 0;
      }
    }

    // Find or create transaction
    let paymentTransaction = await ExaminationPaymentTransaction.findOne({
      transaction_id: txnid,
    });

    const paymentStatus =
      status === "success"
        ? "SUCCESS"
        : status === "failed"
        ? "FAILED"
        : "PENDING";

    if (!paymentTransaction) {
      // Get student's courseStreamMappingId from registration number
      let courseStreamMappingId = null;
      const registrationNumber = webhookData.udf1 || "";
      try {
        const student = await FromStudents.findOne({ registrationNumber })
          .select("courseStreamMappingId registrationNumber")
          .lean();
        if (student) {
          if (student.courseStreamMappingId) {
            courseStreamMappingId = student.courseStreamMappingId;
            console.log(
              `✅ [Webhook] Found courseStreamMappingId for ${registrationNumber}: ${courseStreamMappingId}`
            );
          } else {
            console.warn(
              `⚠️ [Webhook] Student ${registrationNumber} found but has no courseStreamMappingId`
            );
          }
        } else {
          console.warn(
            `⚠️ [Webhook] Student not found for registration number: ${registrationNumber}`
          );
        }
      } catch (err) {
        console.error(
          `❌ [Webhook] Error fetching student courseStreamMappingId for ${registrationNumber}:`,
          err
        );
      }

      // Convert subjects to ObjectIds if they're courseStreamMappingIds
      const regularSubjectsIds = (regularSubjects || [])
        .map((sub) => {
          if (typeof sub === "string" && sub.match(/^[0-9a-fA-F]{24}$/)) {
            return sub;
          }
          return sub;
        })
        .filter(Boolean);

      const supplementarySubjectsIds = (supplementarySubjects || [])
        .map((sub) => {
          if (typeof sub === "string" && sub.match(/^[0-9a-fA-F]{24}$/)) {
            return sub;
          }
          return sub;
        })
        .filter(Boolean);

      // Create new transaction
      const submerchantInfo = submerchants.exam || {};

      paymentTransaction = new ExaminationPaymentTransaction({
        transaction_id: txnid,
        registration_number: registrationNumber,
        student_name: webhookData.firstname || "",
        course: webhookData.udf2 || "",
        semester: webhookData.udf3 || "",
        email: webhookData.email || "",
        phone: webhookData.phone || "",
        amount: parseFloat(webhookData.amount) || 0,
        payment_gateway: "Easebuzz",
        payment_status: paymentStatus,
        courseStreamMappingId: courseStreamMappingId,
        regular_subjects: regularSubjectsIds,
        supplementary_subjects: supplementarySubjectsIds,
        regular_subject_count: regularSubjectsIds.length || regularCount,
        supplementary_subject_count:
          supplementarySubjectsIds.length || supplementaryCount,
        easebuzz_transaction_data: webhookData,
        bank_reference_number: webhookData.bank_ref_num || "",
        payment_mode: webhookData.payment_mode || "",
        payment_completed_at: paymentStatus === "SUCCESS" ? new Date() : null,
        sub_merchant_id:
          webhookData.sub_merchant_id || submerchantInfo.id || null,
        merchant_key: webhookData.key || null,
        bank_account: submerchantInfo.bank_account || null,
        bank_name: submerchantInfo.bank_name || null,
        account_number: submerchantInfo.account_number || null,
        ifsc_code: submerchantInfo.ifsc_code || null,
      });
    } else {
      // Update existing transaction (idempotency)
      paymentTransaction.payment_status = paymentStatus;
      paymentTransaction.easebuzz_transaction_data = webhookData;
      paymentTransaction.bank_reference_number =
        webhookData.bank_ref_num || paymentTransaction.bank_reference_number;
      paymentTransaction.payment_mode =
        webhookData.payment_mode || paymentTransaction.payment_mode;

      if (paymentStatus === "SUCCESS") {
        paymentTransaction.payment_completed_at = new Date();
      }

      // Update subject data if not already set
      if (regularSubjects.length > 0) {
        const regularSubjectsIds = regularSubjects
          .map((sub) => {
            if (typeof sub === "string" && sub.match(/^[0-9a-fA-F]{24}$/)) {
              return sub;
            }
            return sub;
          })
          .filter(Boolean);
        paymentTransaction.regular_subjects = regularSubjectsIds;
      }
      if (supplementarySubjects.length > 0) {
        const supplementarySubjectsIds = supplementarySubjects
          .map((sub) => {
            if (typeof sub === "string" && sub.match(/^[0-9a-fA-F]{24}$/)) {
              return sub;
            }
            return sub;
          })
          .filter(Boolean);
        paymentTransaction.supplementary_subjects = supplementarySubjectsIds;
      }
      if (regularCount > 0) {
        paymentTransaction.regular_subject_count = regularCount;
      }
      if (supplementaryCount > 0) {
        paymentTransaction.supplementary_subject_count = supplementaryCount;
      }

      // Update courseStreamMappingId if not set
      if (!paymentTransaction.courseStreamMappingId && webhookData.udf1) {
        try {
          const student = await FromStudents.findOne({
            registrationNumber: webhookData.udf1,
          })
            .select("courseStreamMappingId registrationNumber")
            .lean();
          if (student) {
            if (student.courseStreamMappingId) {
              paymentTransaction.courseStreamMappingId =
                student.courseStreamMappingId;
              console.log(
                `✅ [Webhook Update] Added courseStreamMappingId for ${webhookData.udf1}: ${student.courseStreamMappingId}`
              );
            } else {
              console.warn(
                `⚠️ [Webhook Update] Student ${webhookData.udf1} found but has no courseStreamMappingId`
              );
            }
          } else {
            console.warn(
              `⚠️ [Webhook Update] Student not found for registration number: ${webhookData.udf1}`
            );
          }
        } catch (err) {
          console.error(
            `❌ [Webhook Update] Error fetching student courseStreamMappingId for ${webhookData.udf1}:`,
            err
          );
        }
      }

      // Update submerchant info if available
      if (webhookData.sub_merchant_id) {
        paymentTransaction.sub_merchant_id = webhookData.sub_merchant_id;
      }
      if (webhookData.key) {
        paymentTransaction.merchant_key = webhookData.key;
      }
    }

    await paymentTransaction.save();

    console.log(
      `Payment ${txnid} updated to status: ${paymentStatus} via webhook`
    );

    // Return success response (Easebuzz expects 200 status)
    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
      data: {
        transactionId: txnid,
        status: paymentStatus,
      },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get payment status by transaction ID (with Easebuzz verification)
// @route GET /api/examination-application/payment-status/:transactionId
exports.getPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    // Get payment from database
    const paymentTransaction = await ExaminationPaymentTransaction.findOne({
      transaction_id: transactionId,
    });

    if (!paymentTransaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // ALWAYS check status with Easebuzz API to ensure we have latest status
    try {
      const statusResult = await easebuzzService.checkTransactionStatus(
        transactionId
      );

      if (statusResult.success && statusResult.data && statusResult.data.data) {
        const statusData = statusResult.data.data;

        // Map Easebuzz status to our status format
        let newStatus = paymentTransaction.payment_status; // Default to current status

        // Easebuzz returns status in various formats - handle all of them
        const easebuzzStatus = String(
          statusData.status || statusData.transaction_status || ""
        ).toLowerCase();

        if (
          easebuzzStatus === "success" ||
          easebuzzStatus === "captured" ||
          easebuzzStatus === "1"
        ) {
          newStatus = "SUCCESS";
        } else if (
          easebuzzStatus === "failed" ||
          easebuzzStatus === "bounced" ||
          easebuzzStatus === "0" ||
          easebuzzStatus === "failure"
        ) {
          newStatus = "FAILED";
        } else if (
          easebuzzStatus === "pending" ||
          easebuzzStatus === "initiated" ||
          easebuzzStatus === "2"
        ) {
          newStatus = "PENDING";
        } else if (
          easebuzzStatus === "cancelled" ||
          easebuzzStatus === "usercancelled"
        ) {
          newStatus = "CANCELLED";
        }

        console.log(
          `🔄 Status check: Easebuzz=${easebuzzStatus}, Mapped=${newStatus}, Current DB=${paymentTransaction.payment_status}`
        );

        // ALWAYS update if status is different OR if current status is PENDING (to catch successful payments)
        const shouldUpdate =
          newStatus !== paymentTransaction.payment_status ||
          paymentTransaction.payment_status === "PENDING" ||
          !paymentTransaction.easebuzz_transaction_data;

        if (shouldUpdate) {
          const oldStatus = paymentTransaction.payment_status;
          paymentTransaction.payment_status = newStatus;
          paymentTransaction.bank_reference_number =
            statusData.easepayid ||
            statusData.bank_ref_num ||
            statusData.mihpayid ||
            paymentTransaction.bank_reference_number;
          paymentTransaction.payment_mode =
            statusData.mode ||
            statusData.payment_mode ||
            paymentTransaction.payment_mode;
          paymentTransaction.easebuzz_transaction_data = statusData;

          if (newStatus === "SUCCESS") {
            paymentTransaction.payment_completed_at = statusData.addedon
              ? new Date(statusData.addedon)
              : new Date();
          }

          await paymentTransaction.save();

          console.log(
            `✅ Payment ${transactionId} status updated via Transaction Status API: ${oldStatus} -> ${newStatus}`
          );
        } else {
          console.log(
            `ℹ️ Payment ${transactionId} status unchanged: ${newStatus}`
          );
        }
      }
    } catch (statusError) {
      console.error(
        `Failed to check status for ${transactionId}:`,
        statusError
      );
      // Continue with database status if API check fails
    }

    // Enrich with submerchant info
    const submerchantInfo = submerchants.exam || {};
    const paymentData = paymentTransaction.toObject();

    if (!paymentData.bank_account && submerchantInfo.bank_account) {
      paymentData.bank_account = submerchantInfo.bank_account;
      paymentData.bank_name = submerchantInfo.bank_name;
      paymentData.account_number = submerchantInfo.account_number;
      paymentData.ifsc_code = submerchantInfo.ifsc_code;
    }

    res.status(200).json({
      success: true,
      data: {
        transactionId: paymentTransaction.transaction_id,
        status: paymentTransaction.payment_status,
        amount: paymentTransaction.amount,
        studentName: paymentTransaction.student_name,
        registrationNumber: paymentTransaction.registration_number,
        course: paymentTransaction.course,
        semester: paymentTransaction.semester,
        paymentDate: paymentTransaction.payment_completed_at,
        createdAt: paymentTransaction.createdAt,
        sub_merchant_id: paymentTransaction.sub_merchant_id,
        merchant_key: paymentTransaction.merchant_key,
        bank_account: paymentData.bank_account,
        bank_name: paymentData.bank_name,
        account_number: paymentData.account_number,
        ifsc_code: paymentData.ifsc_code,
        regular_subjects: paymentTransaction.regular_subjects,
        supplementary_subjects: paymentTransaction.supplementary_subjects,
        regular_subject_count: paymentTransaction.regular_subject_count,
        supplementary_subject_count:
          paymentTransaction.supplementary_subject_count,
        revaluation_subjects: paymentTransaction.revaluation_subjects || [],
        revaluation_subject_count: paymentTransaction.revaluation_subject_count || 0,
        subjects: paymentTransaction.revaluation_subjects && paymentTransaction.revaluation_subjects.length > 0
          ? paymentTransaction.revaluation_subjects
          : undefined, // Include as 'subjects' alias for revaluation payments
      },
    });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get payment history by registration number
// @route GET /api/examination-application/payments/:registrationNumber
exports.getPaymentHistory = async (req, res) => {
  try {
    const { registrationNumber } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    if (!registrationNumber) {
      return res.status(400).json({
        success: false,
        message: "Registration number is required",
      });
    }

    const query = { registration_number: registrationNumber };
    if (status) {
      query.payment_status = status.toUpperCase();
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const paymentTransactions = await ExaminationPaymentTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select(
        "transaction_id payment_status amount createdAt payment_completed_at course semester sub_merchant_id merchant_key bank_account regular_subject_count supplementary_subject_count"
      );

    const total = await ExaminationPaymentTransaction.countDocuments(query);

    // Enrich with submerchant info
    const submerchantInfo = submerchants.exam || {};
    const enrichedPayments = paymentTransactions.map((transaction) => {
      const paymentData = transaction.toObject();
      if (!paymentData.bank_account && submerchantInfo.bank_account) {
        paymentData.bank_account = submerchantInfo.bank_account;
        paymentData.bank_name = submerchantInfo.bank_name;
      }
      return paymentData;
    });

    res.status(200).json({
      success: true,
      data: {
        payments: enrichedPayments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total: total,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get all payments (Admin/Dashboard endpoint)
// @route GET /api/examination-application/payments
exports.getAllPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      registrationNumber,
      startDate,
      endDate,
      revaluationOnly,
      search,
    } = req.query;

    const query = {};

    if (status) {
      query.payment_status = status.toUpperCase();
    }

    if (registrationNumber) {
      query.registration_number = registrationNumber;
    }

    // Filter for revaluation payments only
    if (revaluationOnly === "true" || revaluationOnly === true) {
      // Check that revaluation_subject_count > 0 (simpler than checking array size)
      query.revaluation_subject_count = { $gt: 0 };
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Search functionality
    if (search) {
      query.$or = [
        { transaction_id: { $regex: search, $options: "i" } },
        { registration_number: { $regex: search, $options: "i" } },
        { student_name: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Use Mongoose find with pagination and populate subjects
    // Using .lean() to get plain JavaScript objects which preserves array structure better
    const payments = await ExaminationPaymentTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-easebuzz_transaction_data") // Exclude large JSON field
      .populate({
        path: "regular_subjects",
        populate: {
          path: "subjects.subjectId",
          select: "name code",
        },
      })
      .populate({
        path: "supplementary_subjects",
        populate: {
          path: "subjects.subjectId",
          select: "name code",
        },
      })
      .lean(); // Use lean() to get plain objects instead of Mongoose documents

    const total = await ExaminationPaymentTransaction.countDocuments(query);

    // Enrich payments with bank account info from submerchant config and extract subject names
    const submerchantInfo = submerchants.exam || {};
    
    // Debug: Log first payment to see what we get from populate
    if (payments.length > 0) {
      console.log("🔍 First payment after populate:", {
        transactionId: payments[0].transaction_id,
        regular_subjects_type: typeof payments[0].regular_subjects,
        regular_subjects_isArray: Array.isArray(payments[0].regular_subjects),
        regular_subjects_length: payments[0].regular_subjects?.length || 0,
        regular_subjects_first: payments[0].regular_subjects?.[0] ? JSON.stringify(payments[0].regular_subjects[0], null, 2).substring(0, 500) : null,
      });
    }
    
    const enrichedPayments = payments.map((payment) => {
      const paymentData = payment; // Already a plain object from .lean()

      if (!paymentData.bank_account && submerchantInfo.bank_account) {
        paymentData.bank_account = submerchantInfo.bank_account;
        paymentData.bank_name = submerchantInfo.bank_name;
        paymentData.account_number = submerchantInfo.account_number;
        paymentData.ifsc_code = submerchantInfo.ifsc_code;
      }

      // Extract subject names from CourseStreamMapping documents
      // With .lean(), regular_subjects should be an array of plain objects
      if (paymentData.regular_subjects && Array.isArray(paymentData.regular_subjects) && paymentData.regular_subjects.length > 0) {
        const subjectNames = [];
        console.log(`🔍 Processing ${paymentData.regular_subjects.length} regular_subjects mappings for ${paymentData.transaction_id}`);
        paymentData.regular_subjects.forEach((mapping, idx) => {
          console.log(`  Mapping ${idx}:`, {
            hasSubjects: !!mapping?.subjects,
            subjectsIsArray: Array.isArray(mapping?.subjects),
            subjectsLength: mapping?.subjects?.length || 0,
          });
          // mapping should be a plain object with subjects array
          if (mapping && mapping.subjects && Array.isArray(mapping.subjects)) {
            mapping.subjects.forEach((sub, subIdx) => {
              console.log(`    Subject ${subIdx}:`, {
                hasSubjectId: !!sub?.subjectId,
                subjectIdType: typeof sub?.subjectId,
                subjectIdName: sub?.subjectId?.name,
              });
              if (sub && sub.subjectId && sub.subjectId.name) {
                subjectNames.push(sub.subjectId.name);
              }
            });
          }
        });
        paymentData.regular_subjects_names = subjectNames;
        console.log(`✅ Extracted ${subjectNames.length} regular subject names:`, subjectNames);
      } else {
        paymentData.regular_subjects_names = [];
        if (paymentData.regular_subjects) {
          console.log(`⚠️ regular_subjects exists but not usable for ${paymentData.transaction_id}:`, {
            type: typeof paymentData.regular_subjects,
            isArray: Array.isArray(paymentData.regular_subjects),
            length: paymentData.regular_subjects?.length,
          });
        }
      }

      // Extract subject names from supplementary subjects
      // With .lean(), supplementary_subjects should be an array of plain objects
      if (paymentData.supplementary_subjects && Array.isArray(paymentData.supplementary_subjects) && paymentData.supplementary_subjects.length > 0) {
        const subjectNames = [];
        paymentData.supplementary_subjects.forEach((mapping) => {
          // mapping should be a plain object with subjects array
          if (mapping && mapping.subjects && Array.isArray(mapping.subjects)) {
            mapping.subjects.forEach((sub) => {
              if (sub && sub.subjectId && sub.subjectId.name) {
                subjectNames.push(sub.subjectId.name);
              }
            });
          }
        });
        paymentData.supplementary_subjects_names = subjectNames;
      } else {
        paymentData.supplementary_subjects_names = [];
      }

      return paymentData;
    });

    res.status(200).json({
      success: true,
      data: {
        payments: enrichedPayments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total: total,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching all payments:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Get payment transactions by registration number range (for jumbling centers)
// @route GET /api/examination-application/payments/range
exports.getPaymentsByRegistrationRange = async (req, res) => {
  try {
    const { fromRegistrationNumber, toRegistrationNumber, status, course } =
      req.query;
    console.log("req.query", req.query);
    if (!fromRegistrationNumber || !toRegistrationNumber) {
      return res.status(400).json({
        success: false,
        message: "fromRegistrationNumber and toRegistrationNumber are required",
      });
    }

    // Exclude revaluation payments - revaluation students don't write the exam, so they shouldn't be in seating arrangements
    // Revaluation payments have revaluation_subject_count > 0 or revaluation_subjects array with items
    // We want payments where revaluation_subject_count <= 0 or doesn't exist
    const query = {
      payment_status: status ? status.toUpperCase() : "SUCCESS", // Default to SUCCESS
      $or: [
        { revaluation_subject_count: { $exists: false } },
        { revaluation_subject_count: { $lte: 0 } },
        { revaluation_subject_count: null },
      ],
    };

    // Build registration number range query
    // Extract numeric parts for comparison
    const extractNumericPart = (regNum) => {
      if (!regNum) return null;
      const str = String(regNum).trim();
      // Extract all digits
      const digits = str.replace(/\D/g, "");
      return digits ? parseInt(digits, 10) : null;
    };

    const fromNum = extractNumericPart(fromRegistrationNumber);
    const toNum = extractNumericPart(toRegistrationNumber);

    if (fromNum === null || toNum === null) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration number format",
      });
    }

    if (fromNum > toNum) {
      return res.status(400).json({
        success: false,
        message:
          "fromRegistrationNumber must be less than or equal to toRegistrationNumber",
      });
    }

    console.log(`🔍 Fetching payments with status: ${query.payment_status}`);
    console.log(
      `📊 Range: ${fromRegistrationNumber} (${fromNum}) to ${toRegistrationNumber} (${toNum})`
    );

    // First, check total count of all payments (for debugging)
    const totalPayments = await ExaminationPaymentTransaction.countDocuments(
      {}
    );
    console.log(`📈 Total payments in database: ${totalPayments}`);

    // Check count by status (excluding revaluation)
    const successCount = await ExaminationPaymentTransaction.countDocuments({
      payment_status: "SUCCESS",
      $or: [
        { revaluation_subject_count: { $exists: false } },
        { revaluation_subject_count: 0 },
        { revaluation_subject_count: null },
      ],
    });
    const pendingCount = await ExaminationPaymentTransaction.countDocuments({
      payment_status: "PENDING",
    });
    console.log(
      `📊 Payments by status (excluding revaluation) - SUCCESS: ${successCount}, PENDING: ${pendingCount}`
    );

    // Fetch all payment transactions with SUCCESS status (excluding revaluation)
    const allPayments = await ExaminationPaymentTransaction.find(query)
      .select("registration_number payment_status course")
      .limit(10) // Limit for logging
      .lean();

    console.log(
      `✅ Found ${allPayments.length} payment(s) with status ${query.payment_status}`
    );

    // Log sample registration numbers for debugging
    if (allPayments.length > 0) {
      console.log(
        `📝 Sample registration numbers:`,
        allPayments.slice(0, 5).map((p) => p.registration_number)
      );
    }

    // Now fetch all (without limit) for filtering using the same query (excludes revaluation payments)
    const allPaymentsForFilter = await ExaminationPaymentTransaction.find(query)
      .select("-easebuzz_transaction_data")
      .lean();

    console.log(`📊 After excluding revaluation payments: ${allPaymentsForFilter.length} payment(s) for filtering`);

    // Filter by registration number range
    const filteredPayments = allPaymentsForFilter.filter((payment) => {
      const regNum = extractNumericPart(payment.registration_number);
      if (regNum === null) {
        console.log(
          `⚠️  Skipping payment with invalid registration number: ${payment.registration_number}`
        );
        return false;
      }
      const inRange = regNum >= fromNum && regNum <= toNum;
      if (inRange) {
        console.log(
          `✓ Payment ${payment.registration_number} (${regNum}) is in range`
        );
      }
      return inRange;
    });

    console.log(
      `📋 Filtered to ${filteredPayments.length} payment(s) in range`
    );

    // Apply course filter if provided
    let finalPayments = filteredPayments;
    if (course) {
      console.log(`🎓 Filtering by course: ${course}`);
      finalPayments = filteredPayments.filter((payment) => {
        const paymentCourse = payment.course || "";
        const matches = paymentCourse
          .toLowerCase()
          .includes(course.toLowerCase());
        if (matches) {
          console.log(`✓ Course match: ${paymentCourse}`);
        }
        return matches;
      });
      console.log(`📚 After course filter: ${finalPayments.length} payment(s)`);
    }

    // Transform to student-like format for jumbling centers
    const students = finalPayments.map((payment) => ({
      registrationNumber: payment.registration_number,
      firstName: payment.student_name?.split(" ")[0] || "",
      middleName: payment.student_name?.split(" ").slice(1, -1).join(" ") || "",
      lastName: payment.student_name?.split(" ").slice(-1)[0] || "",
      name: payment.student_name,
      course: payment.course || "",
      semester: payment.semester || "",
      email: payment.email || "",
      phone: payment.phone || "",
      amount: payment.amount,
      payment_status: payment.payment_status,
    }));

    console.log(`📤 Returning ${students.length} student(s) to frontend`);

    res.status(200).json({
      success: true,
      data: students,
      total: students.length,
    });
  } catch (error) {
    console.error("Error fetching payments by registration range:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Handle Easebuzz callback (SURL/FURL redirect handler)
// @route POST /api/examination-application/payment-callback
// @route GET /api/examination-application/payment-callback
exports.paymentCallback = async (req, res) => {
  try {
    // Easebuzz sends callback data as form-url-encoded (POST) or query params (GET)
    // Handle both formats - Easebuzz may send POST with form data
    let callbackData = {};

    console.log("=== CALLBACK RECEIVED ===");
    console.log("Method:", req.method);
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Body:", req.body);
    console.log("Query:", req.query);

    if (req.method === "POST") {
      // POST: form-url-encoded data in body
      callbackData = req.body || {};
      // Also check query params in case data is there
      if (Object.keys(callbackData).length === 0) {
        callbackData = req.query || {};
      }
    } else {
      // GET: query parameters
      callbackData = req.query || {};
    }

    const {
      txnid,
      status,
      mihpayid,
      bank_ref_num,
      payment_mode,
      amount,
      firstname,
      email,
      phone,
      productinfo,
      addedon,
    } = callbackData;

    console.log("=== PAYMENT CALLBACK RECEIVED ===");
    console.log("Method:", req.method);
    console.log("Full request body:", req.body);
    console.log("Full query params:", req.query);
    console.log("Callback data:", callbackData);
    console.log("Transaction ID:", txnid);
    console.log("Status:", status);

    if (!txnid) {
      console.error("Missing txnid in callback");
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:5177"
        }/examination-application/payment-failure?error=missing_txnid`
      );
    }

    // Find payment record
    let paymentTransaction = await ExaminationPaymentTransaction.findOne({
      transaction_id: txnid,
    });

    // Determine redirect path - check request path first, then transaction data
    const requestPath = req.path || req.originalUrl || "";
    const isRevaluationCallback = requestPath.includes("revaluation-application");
    let frontendBasePath = "/examination-application"; // default
    
    if (paymentTransaction) {
      // Determine if this is a revaluation payment based on transaction data
      const isRevaluation = paymentTransaction.revaluation_subjects && paymentTransaction.revaluation_subjects.length > 0;
      frontendBasePath = isRevaluation 
        ? "/revaluation-application"
        : "/examination-application";
    } else if (isRevaluationCallback) {
      // Use revaluation path if request came from revaluation callback endpoint
      frontendBasePath = "/revaluation-application";
    }

    if (!paymentTransaction) {
      console.error("Payment not found for txnid:", txnid);
      // Still redirect, but try to check status via API
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:5177"
        }${frontendBasePath}/payment-success?txnid=${txnid}&check_status=true`
      );
    }

    // Map Easebuzz status to our status format
    let newStatus = paymentTransaction.payment_status;
    const easebuzzStatus = String(status || "").toLowerCase();

    console.log("Easebuzz status received:", easebuzzStatus);
    console.log("Current DB status:", paymentTransaction.payment_status);

    if (easebuzzStatus === "success" || easebuzzStatus === "captured") {
      newStatus = "SUCCESS";
    } else if (easebuzzStatus === "failed" || easebuzzStatus === "bounced") {
      newStatus = "FAILED";
    } else if (
      easebuzzStatus === "cancelled" ||
      easebuzzStatus === "usercancelled"
    ) {
      newStatus = "CANCELLED";
    } else if (!status) {
      // If no status in callback, check with Easebuzz API
      console.log("No status in callback, checking with Easebuzz API...");
      try {
        const statusResult = await easebuzzService.checkTransactionStatus(
          txnid
        );
        if (
          statusResult.success &&
          statusResult.data &&
          statusResult.data.data
        ) {
          const apiStatus = String(
            statusResult.data.data.status || ""
          ).toLowerCase();
          if (apiStatus === "success" || apiStatus === "captured") {
            newStatus = "SUCCESS";
          } else if (apiStatus === "failed" || apiStatus === "bounced") {
            newStatus = "FAILED";
          }
          // Update callback data with API response
          Object.assign(callbackData, statusResult.data.data);
        }
      } catch (apiError) {
        console.error("Error checking status via API:", apiError);
      }
    }

    // Update courseStreamMappingId if not set
    if (!paymentTransaction.courseStreamMappingId && callbackData.udf1) {
      try {
        const student = await FromStudents.findOne({
          registrationNumber: callbackData.udf1,
        })
          .select("courseStreamMappingId registrationNumber")
          .lean();
        if (student) {
          if (student.courseStreamMappingId) {
            paymentTransaction.courseStreamMappingId =
              student.courseStreamMappingId;
            console.log(
              `✅ [Callback] Added courseStreamMappingId for ${callbackData.udf1}: ${student.courseStreamMappingId}`
            );
          } else {
            console.warn(
              `⚠️ [Callback] Student ${callbackData.udf1} found but has no courseStreamMappingId`
            );
          }
        } else {
          console.warn(
            `⚠️ [Callback] Student not found for registration number: ${callbackData.udf1}`
          );
        }
      } catch (err) {
        console.error(
          `❌ [Callback] Error fetching student courseStreamMappingId for ${callbackData.udf1}:`,
          err
        );
      }
    }

    // Update payment status - ALWAYS update if we have new information
    const shouldUpdate =
      newStatus !== paymentTransaction.payment_status ||
      !paymentTransaction.easebuzz_transaction_data ||
      !paymentTransaction.bank_reference_number;

    if (shouldUpdate) {
      paymentTransaction.payment_status = newStatus;
      paymentTransaction.easebuzz_transaction_data = callbackData;
      paymentTransaction.bank_reference_number =
        bank_ref_num || mihpayid || paymentTransaction.bank_reference_number;
      paymentTransaction.payment_mode =
        payment_mode || paymentTransaction.payment_mode;

      if (newStatus === "SUCCESS") {
        paymentTransaction.payment_completed_at = addedon
          ? new Date(addedon)
          : new Date();
      }

      await paymentTransaction.save();
      console.log(
        `✅ Payment ${txnid} updated to status: ${newStatus} via callback`
      );

      // If payment is successful and it's a revaluation payment, create RevaluationRequest records
      if (newStatus === "SUCCESS" && paymentTransaction.revaluation_subjects && paymentTransaction.revaluation_subjects.length > 0) {
        try {
          await createRevaluationRequests(paymentTransaction);
          console.log(`✅ Created revaluation requests for payment ${txnid}`);
        } catch (revalError) {
          console.error(`❌ Error creating revaluation requests for payment ${txnid}:`, revalError);
          // Don't fail the callback if request creation fails - payment is still successful
        }
      }
    } else {
      console.log(`ℹ️ Payment ${txnid} status unchanged: ${newStatus}`);
    }

    // Redirect to frontend based on status and payment type
    if (newStatus === "SUCCESS") {
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:5177"
        }${frontendBasePath}/payment-success?txnid=${txnid}`
      );
    } else {
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:5177"
        }${frontendBasePath}/payment-failure?txnid=${txnid}&status=${newStatus}`
      );
    }
  } catch (error) {
    console.error("❌ Callback processing error:", error);
    const txnid = req.body?.txnid || req.query?.txnid || "";
    // Determine redirect path from request path
    const requestPath = req.path || req.originalUrl || "";
    const isRevaluationCallback = requestPath.includes("revaluation-application");
    const errorRedirectPath = isRevaluationCallback 
      ? "/revaluation-application"
      : "/examination-application";
    return res.redirect(
      `${
        process.env.FRONTEND_URL || "http://localhost:5177"
      }${errorRedirectPath}/payment-failure?txnid=${txnid}&error=processing_error`
    );
  }
};

// @desc Manually update payment status (for frontend to call after redirect)
// @route POST /api/examination-application/update-payment-status/:transactionId
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    // Find payment record
    const paymentTransaction = await ExaminationPaymentTransaction.findOne({
      transaction_id: transactionId,
    });

    if (!paymentTransaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Check status with Easebuzz API
    console.log(
      `🔍 Checking payment status for ${transactionId} with Easebuzz API...`
    );
    const statusResult = await easebuzzService.checkTransactionStatus(
      transactionId
    );

    console.log(
      "📦 Easebuzz status result:",
      JSON.stringify(statusResult, null, 2)
    );

    if (statusResult.success && statusResult.data && statusResult.data.data) {
      const statusData = statusResult.data.data;
      console.log(
        "📊 Status data from Easebuzz:",
        JSON.stringify(statusData, null, 2)
      );

      // Easebuzz returns status in various formats - handle all of them
      const easebuzzStatus = String(
        statusData.status || statusData.transaction_status || ""
      ).toLowerCase();
      console.log("🔄 Parsed Easebuzz status:", easebuzzStatus);

      let newStatus = paymentTransaction.payment_status;

      // Map all possible Easebuzz status values
      if (
        easebuzzStatus === "success" ||
        easebuzzStatus === "captured" ||
        easebuzzStatus === "1"
      ) {
        newStatus = "SUCCESS";
      } else if (
        easebuzzStatus === "failed" ||
        easebuzzStatus === "bounced" ||
        easebuzzStatus === "0" ||
        easebuzzStatus === "failure"
      ) {
        newStatus = "FAILED";
      } else if (
        easebuzzStatus === "cancelled" ||
        easebuzzStatus === "usercancelled" ||
        easebuzzStatus === "cancelledbyuser"
      ) {
        newStatus = "CANCELLED";
      } else if (
        easebuzzStatus === "pending" ||
        easebuzzStatus === "initiated" ||
        easebuzzStatus === "2"
      ) {
        newStatus = "PENDING";
      }

      console.log(
        `📝 Status mapping: ${easebuzzStatus} -> ${newStatus} (current DB: ${paymentTransaction.payment_status})`
      );

      // Update courseStreamMappingId if not set
      if (
        !paymentTransaction.courseStreamMappingId &&
        paymentTransaction.registration_number
      ) {
        try {
          const student = await FromStudents.findOne({
            registrationNumber: paymentTransaction.registration_number,
          })
            .select("courseStreamMappingId registrationNumber")
            .lean();
          if (student) {
            if (student.courseStreamMappingId) {
              paymentTransaction.courseStreamMappingId =
                student.courseStreamMappingId;
              console.log(
                `✅ [Status Check] Added courseStreamMappingId for ${paymentTransaction.registration_number}: ${student.courseStreamMappingId}`
              );
            } else {
              console.warn(
                `⚠️ [Status Check] Student ${paymentTransaction.registration_number} found but has no courseStreamMappingId`
              );
            }
          } else {
            console.warn(
              `⚠️ [Status Check] Student not found for registration number: ${paymentTransaction.registration_number}`
            );
          }
        } catch (err) {
          console.error(
            `❌ [Status Check] Error fetching student courseStreamMappingId for ${paymentTransaction.registration_number}:`,
            err
          );
        }
      }

      // ALWAYS update if status is different OR if we don't have transaction data
      const shouldUpdate =
        newStatus !== paymentTransaction.payment_status ||
        !paymentTransaction.easebuzz_transaction_data ||
        paymentTransaction.payment_status === "PENDING";

      if (shouldUpdate) {
        const oldStatus = paymentTransaction.payment_status;
        paymentTransaction.payment_status = newStatus;
        paymentTransaction.easebuzz_transaction_data = statusData;
        paymentTransaction.bank_reference_number =
          statusData.easepayid ||
          statusData.bank_ref_num ||
          statusData.mihpayid ||
          paymentTransaction.bank_reference_number;
        paymentTransaction.payment_mode =
          statusData.mode ||
          statusData.payment_mode ||
          paymentTransaction.payment_mode;

        if (newStatus === "SUCCESS") {
          paymentTransaction.payment_completed_at = statusData.addedon
            ? new Date(statusData.addedon)
            : new Date();
        }

        await paymentTransaction.save();
        console.log(
          `✅ Payment ${transactionId} status updated: ${oldStatus} -> ${newStatus}`
        );
      } else {
        console.log(
          `ℹ️ Payment ${transactionId} status unchanged: ${newStatus}`
        );
      }

      return res.status(200).json({
        success: true,
        message: "Payment status updated",
        data: {
          transactionId: paymentTransaction.transaction_id,
          status: paymentTransaction.payment_status,
          previousStatus: paymentTransaction.payment_status,
          easebuzzStatus: easebuzzStatus,
        },
      });
    } else {
      console.error(
        "❌ Failed to get status from Easebuzz:",
        statusResult.error || "Unknown error"
      );
      return res.status(200).json({
        success: false,
        message: "Could not verify payment status with Easebuzz",
        error: statusResult.error,
        data: {
          transactionId: paymentTransaction.transaction_id,
          status: paymentTransaction.payment_status,
        },
      });
    }
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc Update hall ticket status for a payment transaction
// @route PUT /api/examination-application/payments/:transactionId/hall-ticket
exports.updateHallTicketStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { hallTicketId, hallTicketGenerated } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    // Find payment record
    const paymentTransaction = await ExaminationPaymentTransaction.findOne({
      transaction_id: transactionId,
    });

    if (!paymentTransaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Update hall ticket information
    if (hallTicketId !== undefined) {
      paymentTransaction.hall_ticket_id = hallTicketId;
    }
    if (hallTicketGenerated !== undefined) {
      paymentTransaction.hall_ticket_generated = hallTicketGenerated;
      if (hallTicketGenerated) {
        paymentTransaction.hall_ticket_generated_at = new Date();
      } else {
        paymentTransaction.hall_ticket_generated_at = null;
      }
    }

    await paymentTransaction.save();

    res.status(200).json({
      success: true,
      message: "Hall ticket status updated successfully",
      data: {
        transactionId: paymentTransaction.transaction_id,
        hallTicketId: paymentTransaction.hall_ticket_id,
        hallTicketGenerated: paymentTransaction.hall_ticket_generated,
        hallTicketGeneratedAt: paymentTransaction.hall_ticket_generated_at,
      },
    });
  } catch (error) {
    console.error("Error updating hall ticket status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating hall ticket status",
      error: error.message,
    });
  }
};

// @desc Update missing courseStreamMappingIds for existing payment transactions
// @route POST /api/examination-application/update-missing-course-stream-mapping-ids
exports.updateMissingCourseStreamMappingIds = async (req, res) => {
  try {
    console.log("🔄 Starting to update missing courseStreamMappingIds...");

    // Find all payment transactions without courseStreamMappingId
    const transactionsWithoutMapping = await ExaminationPaymentTransaction.find(
      {
        $or: [
          { courseStreamMappingId: { $exists: false } },
          { courseStreamMappingId: null },
        ],
      }
    )
      .select("transaction_id registration_number courseStreamMappingId")
      .lean();

    console.log(
      `📊 Found ${transactionsWithoutMapping.length} transactions without courseStreamMappingId`
    );

    let updatedCount = 0;
    let notFoundCount = 0;
    let noMappingCount = 0;
    let errorCount = 0;

    for (const transaction of transactionsWithoutMapping) {
      try {
        if (!transaction.registration_number) {
          console.warn(
            `⚠️ Transaction ${transaction.transaction_id} has no registration number`
          );
          continue;
        }

        const student = await FromStudents.findOne({
          registrationNumber: transaction.registration_number,
        })
          .select("courseStreamMappingId registrationNumber")
          .lean();

        if (student) {
          if (student.courseStreamMappingId) {
            await ExaminationPaymentTransaction.updateOne(
              { _id: transaction._id },
              { $set: { courseStreamMappingId: student.courseStreamMappingId } }
            );
            updatedCount++;
            console.log(
              `✅ Updated transaction ${transaction.transaction_id} for ${transaction.registration_number}`
            );
          } else {
            noMappingCount++;
            console.warn(
              `⚠️ Student ${transaction.registration_number} has no courseStreamMappingId`
            );
          }
        } else {
          notFoundCount++;
          console.warn(
            `⚠️ Student not found for registration number: ${transaction.registration_number}`
          );
        }
      } catch (err) {
        errorCount++;
        console.error(
          `❌ Error updating transaction ${transaction.transaction_id}:`,
          err
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Update completed",
      data: {
        total: transactionsWithoutMapping.length,
        updated: updatedCount,
        studentNotFound: notFoundCount,
        noMappingInStudent: noMappingCount,
        errors: errorCount,
      },
    });
  } catch (error) {
    console.error("Error updating missing courseStreamMappingIds:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Helper function to generate unique revaluation request number
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

// Helper function to create RevaluationRequest records after successful payment
const createRevaluationRequests = async (paymentTransaction) => {
  if (!paymentTransaction.revaluation_subjects || paymentTransaction.revaluation_subjects.length === 0) {
    return;
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
  for (const result of results) {
    // Check if request already exists for this result and payment
    const existingRequest = await RevaluationRequest.findOne({
      resultId: result._id,
      paymentTransactionId: paymentTransaction._id,
    });

    if (existingRequest) {
      console.log(`Revaluation request already exists for result ${result._id}`);
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
    console.log(`✅ Created ${requests.length} revaluation request(s) for payment ${paymentTransaction.transaction_id}`);
  }

  return requests;
};

// @desc Verify transaction via Easebuzz API
// @route GET /api/examination-application/verify-transaction/:transactionId
exports.verifyTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    const statusResult = await easebuzzService.checkTransactionStatus(
      transactionId
    );

    if (!statusResult.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to verify transaction",
        error: statusResult.error,
      });
    }

    res.status(200).json({
      success: true,
      data: statusResult.data,
    });
  } catch (error) {
    console.error("Error verifying transaction:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
