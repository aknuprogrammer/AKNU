const express = require("express");
const {
  initiatePayment,
  paymentInitiated,
  paymentSuccess,
  paymentFailure,
  paymentWebhook,
  paymentCallback,
  getPaymentStatus,
  getPaymentHistory,
  getAllPayments,
  verifyTransaction,
  updatePaymentStatus,
  updateHallTicketStatus,
  getPaymentsByRegistrationRange,
  updateMissingCourseStreamMappingIds,
} = require("../../controllers/examination/examinationPaymentController");

const router = express.Router();

// Payment initiation endpoint (Full Easebuzz Integration)
router.post("/initiate-payment", initiatePayment);

// Payment endpoints (Legacy support)
router.post("/payment-initiated", paymentInitiated);
router.post("/payment-success", paymentSuccess);
router.post("/payment-failure", paymentFailure);

// Webhook endpoint (Easebuzz S2S Integration)
router.post("/payment-webhook", paymentWebhook);

// Callback endpoint (Easebuzz SURL/FURL redirect handler)
router.post("/payment-callback", paymentCallback);
router.get("/payment-callback", paymentCallback); // Also handle GET requests

// Payment status and history endpoints
router.get("/payment-status/:transactionId", getPaymentStatus);

// Admin/Dashboard endpoints
// IMPORTANT: More specific routes must come before dynamic routes
router.get("/payments/range", getPaymentsByRegistrationRange); // Get payments by registration number range (for jumbling centers) - MUST be before /payments/:registrationNumber
router.get("/payments", getAllPayments); // Get all payments with filters
router.get("/payments/:registrationNumber", getPaymentHistory); // Get payment history by registration number - MUST be last

// Transaction verification endpoint
router.get("/verify-transaction/:transactionId", verifyTransaction);

// Manual status update endpoint (for frontend to call)
router.post("/update-payment-status/:transactionId", updatePaymentStatus);

// Hall ticket update endpoint
router.put("/payments/:transactionId/hall-ticket", updateHallTicketStatus);

// Update missing courseStreamMappingIds for existing transactions (Admin utility)
router.post("/update-missing-course-stream-mapping-ids", updateMissingCourseStreamMappingIds);

module.exports = router;
