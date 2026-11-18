const express = require("express");
const {
  getConsumables,
  getConsumableById,
  createConsumable,
  updateConsumable,
  deleteConsumable,
  getConsumableCategories,
} = require("../../controllers/labs/consumableController");
const router = express.Router();

router.get("/", getConsumables);
router.get("/categories", getConsumableCategories);
router.post("/", createConsumable);
router.get("/:id", getConsumableById);
router.put("/:id", updateConsumable);
router.delete("/:id", deleteConsumable);

module.exports = router;
