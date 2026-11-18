const express = require("express");

const { getHostelAvailability } = require("../../controllers/hostel/availabilityController");
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");

const router = express.Router();

const {
  getAllHostels,
  getHostelById,
  createHostel,
  updateHostel,
  deleteHostel,
  applyOutpass,
  getStudentOutpasses,
  getAllOutpasses,
  updateOutpassStatus,
  createMaintenanceRequest,
  getStudentMaintenanceRequests,
  getAllMaintenanceRequests,
  updateMaintenanceStatus,
  createWorkOrder,
  getAllWorkOrders,
  updateWorkOrderStatus,
  getAllocationByRegNumber
} = require("../../controllers/hostel/hostelController");

// --- Outpass Routes ---

// Apply for Outpass (Student)
router.post(
  "/outpass/apply",
  authenticationMiddleware,
  authorizationMiddleware("user", "admin", "super_admin"),
  applyOutpass
);

// Get Student Outpass History
router.get(
  "/student/outpass",
  authenticationMiddleware,
  authorizationMiddleware("user", "admin", "super_admin"),
  getStudentOutpasses
);

// Get All Outpasses (Admin)
router.get(
  "/outpass",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  getAllOutpasses
);

// Update Outpass Status (Admin)
router.put(
  "/outpass/:id/status",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  updateOutpassStatus
);

// --- Maintenance Routes ---
router.post("/maintenance/apply", authenticationMiddleware, createMaintenanceRequest);
router.get("/student/maintenance", authenticationMiddleware, getStudentMaintenanceRequests);
router.get(
  "/maintenance",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  getAllMaintenanceRequests
);
router.put(
  "/maintenance/:id/status",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  updateMaintenanceStatus
);

// --- Work Order Routes ---
router.get("/workorders", authenticationMiddleware, authorizationMiddleware("admin", "super_admin"), getAllWorkOrders);
router.post("/workorders", authenticationMiddleware, authorizationMiddleware("admin", "super_admin"), createWorkOrder);
router.put("/workorders/:id/status", authenticationMiddleware, authorizationMiddleware("admin", "super_admin"), updateWorkOrderStatus);

// --- Allocation Routes ---
router.get("/allocation/:regNumber", authenticationMiddleware, authorizationMiddleware("admin", "super_admin"), getAllocationByRegNumber);

// --- Hostel Routes ---


// Get all hostels
router.get(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  getAllHostels
);

// Get hostel availability (floors, rooms, beds) - Public for application form
router.get("/availability/:hostelId", getHostelAvailability);

// Get hostel by ID
router.get(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  getHostelById
);

// Create a new hostel
router.post(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  createHostel
);

// Update a hostel
router.put(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  updateHostel
);

// Delete a hostel
router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  deleteHostel
);



module.exports = router;

