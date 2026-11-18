const express = require("express");
const {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequest,
  approveRequest,
  rejectRequest,
  assignEvaluator,
  enterMarks,
  completeRequest,
  deleteRequest,
  getStatistics,
  createRequestsFromPayment,
} = require("../../../controllers/examination/revaluation/revaluationRequestController");

const router = express.Router();

// Statistics endpoint (must come before /requests/:id)
router.get("/statistics", getStatistics);

// Create requests from payment transaction (must come before /requests/:id)
router.post("/create-from-payment/:paymentTransactionId", createRequestsFromPayment);

// Request management endpoints
router.get("/requests", getAllRequests);
router.get("/requests/:id", getRequestById);
router.post("/requests", createRequest);
router.put("/requests/:id", updateRequest);
router.put("/requests/:id/approve", approveRequest);
router.put("/requests/:id/reject", rejectRequest);
router.put("/requests/:id/assign-evaluator", assignEvaluator);
router.put("/requests/:id/enter-marks", enterMarks);
router.put("/requests/:id/complete", completeRequest);
router.delete("/requests/:id", deleteRequest);

module.exports = router;
