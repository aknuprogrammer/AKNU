const express = require("express");
const {
  getStreams,
  createStream,
  updateStream,
  deleteStream,
  getStreamById,
  getStreamsByCourse,
} = require("../../../controllers/examination/selector/streamController");
const router = express.Router();

router.get("/", getStreams);
router.post("/", createStream);
router.get("/course/:courseId", getStreamsByCourse);
router.get("/:id", getStreamById);
router.put("/:id", updateStream);
router.delete("/:id", deleteStream);

module.exports = router;

