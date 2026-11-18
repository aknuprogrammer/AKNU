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
  getPaymentsByRegistrationRange,
  updateMissingCourseStreamMappingIds,
} = require("../../controllers/examination/examinationPaymentController");

const router = express.Router();

// Payment initiation endpoint (Full Easebuzz Integration)
// Note: This reuses the examination payment controller which will handle revaluation_subjects
router.post("/initiate-payment", initiatePayment);

// Payment endpoints (Legacy support)
router.post("/payment-initiated", paymentInitiated);
router.post("/payment-success", paymentSuccess);
router.post("/payment-failure", paymentFailure);

// Webhook endpoint for Easebuzz (Server-to-Server)
router.post("/payment-webhook", paymentWebhook);

// Payment callback endpoint (when user returns from payment gateway)
router.post("/payment-callback", paymentCallback);
router.get("/payment-callback", paymentCallback); // Also handle GET requests

// Payment status and history endpoints
router.get("/payment-status/:transactionId", getPaymentStatus);

// Admin/Dashboard endpoints
// IMPORTANT: More specific routes must come before dynamic routes
router.get("/payments/range", getPaymentsByRegistrationRange); // Get payments by registration number range (for jumbling centers) - MUST be before /payments/:registrationNumber
router.get("/payments", getAllPayments); // Get all payments with filters
router.get("/payments/:registrationNumber", getPaymentHistory);

// Verify transaction endpoint
router.post("/verify-transaction", verifyTransaction);

// Update payment status endpoint (for frontend to manually trigger status check)
router.post("/update-payment-status/:transactionId", updatePaymentStatus);

// Update missing courseStreamMappingIds for existing transactions (Admin utility)
router.post("/update-missing-course-stream-mapping-ids", updateMissingCourseStreamMappingIds);

module.exports = router;

