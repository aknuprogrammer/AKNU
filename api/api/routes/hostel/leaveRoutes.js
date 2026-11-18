const express = require("express");
const { getLeaves, updateLeaveStatus } = require("../../controllers/hostel/leaveController");
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");

const router = express.Router();

router.use(authenticationMiddleware);

router.get("/", getLeaves);
router.put("/:id/status", authorizationMiddleware("admin", "super_admin", "warden"), updateLeaveStatus);

module.exports = router;
