const express = require("express");
const {
  getExamTypes,
  createExamType,
  updateExamType,
  deleteExamType,
  getExamTypeById,
} = require("../../../controllers/examination/selector/examTypeController");
const router = express.Router();

router.get("/", getExamTypes);
router.post("/", createExamType);
router.get("/:id", getExamTypeById);
router.put("/:id", updateExamType);
router.delete("/:id", deleteExamType);

module.exports = router;

