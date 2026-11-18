const express = require("express");
const router = express.Router();
const driverMappingController = require("../../controllers/transportation/driverMappingController");

// Create
router.post("/", driverMappingController.createDriverMapping);

// Read All
router.get("/", driverMappingController.getAllDriverMappings);

// Read One
router.get("/:id", driverMappingController.getDriverMappingById);

// Update
router.put("/:id", driverMappingController.updateDriverMapping);

// Delete
router.delete("/:id", driverMappingController.deleteDriverMapping);

module.exports = router;
