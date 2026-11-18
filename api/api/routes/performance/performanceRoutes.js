const express = require("express");
const router = express.Router();
const performanceController = require("../../controllers/performance/performanceController");
// Assuming there is some auth middleware, typically imported like:
// const { verifyToken } = require("../../middlewares/authMiddleware");

// Cycles
router.post("/cycles", performanceController.createCycle);
router.get("/cycles", performanceController.getCycles);
router.get("/cycles/active", performanceController.getActiveCycle);
router.put("/cycles/:cycleId/lock", performanceController.lockCycle);

// Specialized Review Actions
router.get("/reviews/cycle/:cycleId", performanceController.getAllReviewsForCycle);
router.post("/reviews/submit", performanceController.submitSelfAssessment);

// Generic Review Actions (Parameterized - must be last)
router.get("/reviews/:cycleId/:employeeId", performanceController.getEmployeeReview);
router.put("/reviews/:reviewId/manager-assessment", performanceController.updateManagerAssessment);

module.exports = router;
