const express = require("express");
const router = express.Router();
const routeMappingController = require("../../controllers/transportation/routeMappingController");

// Create
router.post("/", routeMappingController.createRouteMapping);

// Read All
router.get("/", routeMappingController.getAllRouteMappings);

// Read One
router.get("/:id", routeMappingController.getRouteMappingById);

// Update
router.put("/:id", routeMappingController.updateRouteMapping);

// Delete
router.delete("/:id", routeMappingController.deleteRouteMapping);

module.exports = router;
