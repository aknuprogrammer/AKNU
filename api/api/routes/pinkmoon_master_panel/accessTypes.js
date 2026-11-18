// routes/accessTypeRoutes.js

const express = require("express");
const router = express.Router();
const {
  getAllAccessTypes,
  getAccessTypeById,
  createAccessType,
  updateAccessType,
  deleteAccessType,
  searchAccessTypes,
  getAccessTypesByPermission,
  getAccessTypeStats,
} = require("../../controllers/pinkmoon_master_panel/accessController");

router.get("/", getAllAccessTypes);
router.get("/stats/summary", getAccessTypeStats);
router.get("/search/:name", searchAccessTypes);
router.get("/permission/:permission", getAccessTypesByPermission);
router.get("/:id", getAccessTypeById);
router.post("/", createAccessType);
router.put("/:id", updateAccessType);
router.delete("/:id", deleteAccessType);

module.exports = router;
