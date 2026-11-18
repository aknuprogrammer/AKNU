const express = require("express");
const {
  getLabSchedules,
  getLabScheduleById,
  createLabSchedule,
  updateLabSchedule,
  deleteLabSchedule,
} = require("../../controllers/labs/labScheduleController");
const router = express.Router();

router.get("/", getLabSchedules);
router.post("/", createLabSchedule);
router.get("/:id", getLabScheduleById);
router.put("/:id", updateLabSchedule);
router.delete("/:id", deleteLabSchedule);

module.exports = router;
