const express = require("express");
const router = express.Router();
const {
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    getItemsByCategory,
    getItemsByLocation,
    addMaintenanceRecord,
} = require("../../controllers/library/physicalInventoryController");

// Main routes
router.get("/", getAllItems);
router.post("/", createItem);
router.get("/:id", getItemById);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

// Additional routes
router.get("/category/:category", getItemsByCategory);
router.get("/location/:location", getItemsByLocation);
router.post("/:id/maintenance", addMaintenanceRecord);

module.exports = router;
