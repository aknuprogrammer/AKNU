const express = require("express");
const {
  getInvigilators,
  createInvigilator,
  updateInvigilator,
  deleteInvigilator,
  getInvigilatorById,
  getInvigilatorsByCollege,
  getInvigilatorsByRole,
  getInvigilatorsByYear,
  getInvigilatorByCode,
} = require("../../../controllers/examination/selector/invigilatorController");
const router = express.Router();

router.get("/", getInvigilators);
router.post("/", createInvigilator);
router.get("/college/:collegeId", getInvigilatorsByCollege);
router.get("/role/:role", getInvigilatorsByRole);
router.get("/year/:year", getInvigilatorsByYear);
router.get("/code/:invigilatorCode", getInvigilatorByCode);
router.get("/:id", getInvigilatorById);
router.put("/:id", updateInvigilator);
router.delete("/:id", deleteInvigilator);

module.exports = router;

