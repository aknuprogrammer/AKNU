const express = require("express");
const router = express.Router();
const {
    getAllResources,
    getResourceById,
    createResource,
    updateResource,
    deleteResource,
    incrementView,
    incrementDownload,
    getResourcesByType,
    getPopularResources,
    searchResources,
} = require("../../controllers/library/digitalResourceController");

// Main routes
router.get("/", getAllResources);
router.post("/", createResource);
router.get("/popular", getPopularResources);
router.get("/search", searchResources);
router.get("/type/:type", getResourcesByType);
router.get("/:id", getResourceById);
router.put("/:id", updateResource);
router.delete("/:id", deleteResource);

// Analytics routes
router.post("/:id/view", incrementView);
router.post("/:id/download", incrementDownload);

module.exports = router;
