const express = require("express");
const router = express.Router();
const authenticationMiddleware = require("../../../middlewares/authentication");
const {
  getAllScripts,
  getScriptById,
  getScriptByBarcode,
  registerScript,
  updateScript,
  getScriptsByBundle,
  saveEvaluation,
} = require("../../../controllers/examination/postExamination/scriptController");

// All routes require authentication
router.use(authenticationMiddleware);

// @route   GET /api/examination/scripts
router.get("/", getAllScripts);

// @route   GET /api/examination/scripts/bundle/:bundleId
router.get("/bundle/:bundleId", getScriptsByBundle);

// @route   GET /api/examination/scripts/barcode/:barcode
router.get("/barcode/:barcode", getScriptByBarcode);

// @route   GET /api/examination/scripts/:id
router.get("/:id", getScriptById);

// @route   POST /api/examination/scripts/register
router.post("/register", registerScript);

// @route   PUT /api/examination/scripts/:id
router.put("/:id", updateScript);

// @route   PUT /api/examination/scripts/:id/evaluate
router.put("/:id/evaluate", saveEvaluation);

module.exports = router;

