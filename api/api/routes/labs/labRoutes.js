const express = require("express");
const {
  getLabs,
  getLabById,
  createLab,
  updateLab,
  deleteLab,
} = require("../../controllers/labs/labController");
const router = express.Router();

router.get("/", getLabs);
router.post("/", createLab);
router.get("/:id", getLabById);
router.put("/:id", updateLab);
router.delete("/:id", deleteLab);

module.exports = router;
