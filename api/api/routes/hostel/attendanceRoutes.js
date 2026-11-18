const express = require("express");
const { getAttendance, saveBulkAttendance, getAttendanceStats } = require("../../controllers/hostel/attendanceController");
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");

const router = express.Router();

router.use(authenticationMiddleware);

router.get("/", authorizationMiddleware("admin", "super_admin", "warden"), getAttendance);
router.post("/bulk", authorizationMiddleware("admin", "super_admin", "warden"), saveBulkAttendance);
router.get("/stats", authorizationMiddleware("admin", "super_admin", "warden"), getAttendanceStats);

module.exports = router;
