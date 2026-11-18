const express = require("express");
const {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} = require("../../controllers/hostel/equipmentController");
const authenticationMiddleware = require("../../middlewares/authentication");
const authorizationMiddleware = require("../../middlewares/authorization");

const router = express.Router();

// Get all equipment
router.get(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  getAllEquipment
);

// Get equipment by ID
router.get(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  getEquipmentById
);

// Create new equipment
router.post(
  "/",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  createEquipment
);

// Update equipment
router.put(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  updateEquipment
);

// Delete equipment
router.delete(
  "/:id",
  authenticationMiddleware,
  authorizationMiddleware("super_admin"),
  deleteEquipment
);

module.exports = router;

