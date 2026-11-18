const express = require("express");
const {
  getMappings,
  getMappingById,
  createMapping,
  updateMapping,
  deleteMapping,
} = require("../../../controllers/admission/selector/collegeCourseMappingController");
const router = express.Router();

// CRUD routes
router.get("/", getMappings);
router.get("/:id", getMappingById);
router.post("/", createMapping);
router.put("/:id", updateMapping);
router.delete("/:id", deleteMapping);

module.exports = router;
