const express = require("express");
const {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} = require("../../controllers/labs/equipmentController");
const router = express.Router();

router.get("/", getEquipment);
router.post("/", createEquipment);
router.get("/:id", getEquipmentById);
router.put("/:id", updateEquipment);
router.delete("/:id", deleteEquipment);

module.exports = router;
