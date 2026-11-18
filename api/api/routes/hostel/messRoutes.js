const express = require("express");
const router = express.Router();
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");
const messController = require("../../controllers/hostel/messController");

// --- Menu Routes ---
router.get("/menu", authenticationMiddleware, messController.getAllMenus);
router.delete(
    "/menu/hostel/:hostelId",
    authenticationMiddleware,
    authorizationMiddleware("admin", "super_admin"),
    messController.deleteWeeklyMenu
);
router.post(
    "/menu",
    authenticationMiddleware,
    authorizationMiddleware("admin", "super_admin"),
    messController.createMenu
);

// --- Attendance Routes ---
router.get(
    "/attendance",
    authenticationMiddleware,
    authorizationMiddleware("admin", "super_admin"),
    messController.getAllAttendance
);
router.post(
    "/menu/bulk",
    authenticationMiddleware,
    authorizationMiddleware("admin", "super_admin"),
    messController.bulkCreateMenu
);
router.get(
    "/attendance/status",
    authenticationMiddleware,
    messController.getMessAttendanceStatus
);
router.post(
    "/attendance",
    authenticationMiddleware,
    authorizationMiddleware("admin", "super_admin"),
    messController.markAttendance
);
router.post(
    "/attendance/bulk",
    authenticationMiddleware,
    authorizationMiddleware("admin", "super_admin"),
    messController.bulkMarkAttendance
);

module.exports = router;
