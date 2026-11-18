const express = require("express");
const router = express.Router();
const routeController = require("../../controllers/transportation/routeController");

// Create
router.post("/", routeController.createRoute);

// Read All
router.get("/", routeController.getAllRoutes);

// Read One
router.get("/:id", routeController.getRouteById);

// Update
router.put("/:id", routeController.updateRoute);

// Delete
router.delete("/:id", routeController.deleteRoute);

module.exports = router;
