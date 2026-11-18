const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  getAllAllotments,
  getAllotmentById,
  createAllotment,
  updateAllotment,
  deleteAllotment,
  getAllotmentByHallTicket,
} = require("../../../controllers/admission/selector/apscheAllotmentController");

const upload = multer({ storage: multer.memoryStorage() });

// Routes
router.get("/", getAllAllotments);
router.get("/:id", getAllotmentById);
router.post("/", upload.single("file"), createAllotment); // "file" is field name in FormData
// router.post("/", upload.single("file"), (req, res) => {
//   console.log("req.body:", req.body); // should show title and date
//   console.log("req.file:", req.file); // uploaded file
//   res.send("OK");
// });
console.log("_______dfas")
// New route: fetch by hall ticket
router.get("/hallTicket/:hallTicket", getAllotmentByHallTicket);

router.put("/:id", updateAllotment);
router.delete("/:id", deleteAllotment);

module.exports = router;
