const express = require("express");
const {
  getProfessors,
  createProfessor,
  updateProfessor,
  deleteProfessor,
  getProfessorById,
  getProfessorsBySubject,
  getProfessorByProfessorId,
} = require("../../../controllers/examination/selector/professorController");
const router = express.Router();

router.get("/", getProfessors);
router.post("/", createProfessor);
router.get("/subject/:subjectId", getProfessorsBySubject);
router.get("/professor-id/:professorId", getProfessorByProfessorId);
router.get("/:id", getProfessorById);
router.put("/:id", updateProfessor);
router.delete("/:id", deleteProfessor);

module.exports = router;

