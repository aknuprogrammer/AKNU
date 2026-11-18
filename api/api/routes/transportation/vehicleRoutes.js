const express = require("express");
const router = express.Router();
const vehicleController = require("../../controllers/transportation/vehicleController");

// Create
router.post("/", vehicleController.createVehicle);

// Read All
router.get("/", vehicleController.getAllVehicles);

// Read One
router.get("/:id", vehicleController.getVehicleById);

// Update
router.put("/:id", vehicleController.updateVehicle);

// Delete
router.delete("/:id", vehicleController.deleteVehicle);

module.exports = router;
