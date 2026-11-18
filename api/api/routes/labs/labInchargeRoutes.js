const express = require("express");
const {
  getLabIncharges,
  getLabInchargeById,
  createLabIncharge,
  updateLabIncharge,
  deleteLabIncharge,
} = require("../../controllers/labs/labInchargeController");
const router = express.Router();

router.get("/", getLabIncharges);
router.post("/", createLabIncharge);
router.get("/:id", getLabInchargeById);
router.put("/:id", updateLabIncharge);
router.delete("/:id", deleteLabIncharge);

module.exports = router;

