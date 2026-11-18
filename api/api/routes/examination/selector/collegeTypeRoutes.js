const express = require("express");
const {
  getCollegeTypes,
  createCollegeType,
  updateCollegeType,
  deleteCollegeType,
  getCollegeTypeById,
} = require("../../../controllers/examination/selector/collegeTypeController");
const router = express.Router();

router.get("/", getCollegeTypes);
router.post("/", createCollegeType);
router.get("/:id", getCollegeTypeById);
router.put("/:id", updateCollegeType);
router.delete("/:id", deleteCollegeType);

module.exports = router;

