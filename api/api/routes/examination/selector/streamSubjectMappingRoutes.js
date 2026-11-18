const express = require("express");
const {
  getStreamSubjectMappings,
  createStreamSubjectMapping,
  updateStreamSubjectMapping,
  deleteStreamSubjectMapping,
  getStreamSubjectMappingById,
  getMappingsByStream,
  getMappingsBySubject,
} = require("../../../controllers/examination/selector/streamSubjectMappingController");
const router = express.Router();

router.get("/", getStreamSubjectMappings);
router.post("/", createStreamSubjectMapping);
router.get("/stream/:streamId", getMappingsByStream);
router.get("/subject/:subjectId", getMappingsBySubject);
router.get("/:id", getStreamSubjectMappingById);
router.put("/:id", updateStreamSubjectMapping);
router.delete("/:id", deleteStreamSubjectMapping);

module.exports = router;

