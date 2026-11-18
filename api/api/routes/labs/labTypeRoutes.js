const express = require("express");
const {
  getLabTypes,
  getLabTypeById,
  createLabType,
  updateLabType,
  deleteLabType,
} = require("../../controllers/labs/labTypeController");
const router = express.Router();

router.get("/", getLabTypes);
router.post("/", createLabType);
router.get("/:id", getLabTypeById);
router.put("/:id", updateLabType);
router.delete("/:id", deleteLabType);

module.exports = router;
