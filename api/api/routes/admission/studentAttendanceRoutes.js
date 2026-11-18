const express = require("express");
const { getAttendance, bulkCreateAttendance } = require("../../controllers/admission/studentAttendanceController");

const router = express.Router();

router.get("/", getAttendance);
router.post("/bulk", bulkCreateAttendance);

module.exports = router;
