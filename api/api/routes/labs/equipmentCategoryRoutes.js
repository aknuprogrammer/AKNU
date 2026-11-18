const express = require("express");
const {
  getEquipmentCategories,
  getEquipmentCategoryById,
  createEquipmentCategory,
  updateEquipmentCategory,
  deleteEquipmentCategory,
} = require("../../controllers/labs/equipmentCategoryController");
const router = express.Router();

router.get("/", getEquipmentCategories);
router.post("/", createEquipmentCategory);
router.get("/:id", getEquipmentCategoryById);
router.put("/:id", updateEquipmentCategory);
router.delete("/:id", deleteEquipmentCategory);

module.exports = router;
