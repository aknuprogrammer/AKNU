const express = require("express");
const router = express.Router();
const vehicleTypeController = require("../../controllers/transportation/vehicleTypeController");

// Create
router.post("/", vehicleTypeController.createVehicleType);

// Read All
router.get("/", vehicleTypeController.getAllVehicleTypes);

// Read One
router.get("/:id", vehicleTypeController.getVehicleTypeById);

// Update
router.put("/:id", vehicleTypeController.updateVehicleType);

// Delete
router.delete("/:id", vehicleTypeController.deleteVehicleType);

module.exports = router;
