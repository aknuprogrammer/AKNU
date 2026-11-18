const express = require("express");
const {
  createPayment,
  getPayments,
  getPaymentById,
  getPaymentsByStudentId,
} = require("../../controllers/admission/paymentController");
const router = express.Router();

// POST /api/payments => create a payment
router.post("/", createPayment);

// GET /api/payments => list all payments
router.get("/", getPayments);

// GET /api/payments/:id => get single payment
router.get("/:id", getPaymentById);

router.get("/student/:studentId", getPaymentsByStudentId);

module.exports = router;
