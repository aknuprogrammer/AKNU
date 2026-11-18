const express = require("express");
const router = express.Router();
const authenticationMiddleware = require("../../../middlewares/authentication");
const {
  getAllBundles,
  getBundleById,
  getBundleByBarcode,
  createBundle,
  dispatchBundle,
  receiveBundle,
  deleteBundle,
  markHallTicketEvaluated,
} = require("../../../controllers/examination/postExamination/bundleController");

// All routes require authentication
router.use(authenticationMiddleware);

// @route   GET /api/examination/bundles
router.get("/", getAllBundles);

// @route   GET /api/examination/bundles/barcode/:barcode
router.get("/barcode/:barcode", getBundleByBarcode);

// @route   GET /api/examination/bundles/:id
router.get("/:id", getBundleById);

// @route   POST /api/examination/bundles
router.post("/", createBundle);

// @route   PUT /api/examination/bundles/:id/dispatch
router.put("/:id/dispatch", dispatchBundle);

// @route   PUT /api/examination/bundles/receive
router.put("/receive", receiveBundle);

// @route   PUT /api/examination/bundles/:id/mark-evaluated
router.put("/:id/mark-evaluated", markHallTicketEvaluated);

// @route   DELETE /api/examination/bundles/:id
router.delete("/:id", deleteBundle);

module.exports = router;

