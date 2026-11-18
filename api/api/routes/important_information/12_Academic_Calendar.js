const express = require("express");
const {
  Model_AcademicCalendar,
} = require("../../models/Important_Information");
const router = express.Router();

// 📄 View file
router.get("/academic_calendar/file/view/:dbid", async (req, res) => {
  try {
    const fileDoc = await Model_AcademicCalendar.findById(
      req.params.dbid
    ).select({
      file: 1,
    });
    if (!fileDoc || !fileDoc.file || !fileDoc.file.buffer) {
      return res.status(404).send("File not found");
    }
    const buffer = fileDoc.file.buffer;
    const { mimetype, originalname } = fileDoc.file;
    res.setHeader("Content-Type", mimetype || "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${originalname}"`);
    res.setHeader("Content-Length", buffer.length);
    return res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 📥 Download file
router.get("/academic_calendar/file/download/:dbid", async (req, res) => {
  try {
    const fileDoc = await Model_AcademicCalendar.findById(
      req.params.dbid
    ).select({
      file: 1,
    });
    if (!fileDoc || !fileDoc.file || !fileDoc.file.buffer) {
      return res.status(404).send("File not found");
    }
    const buffer = fileDoc.file.buffer;
    const { mimetype, originalname } = fileDoc.file;
    res.setHeader("Content-Type", mimetype || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${originalname}"`
    );
    res.setHeader("Content-Length", buffer.length);
    return res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📜 Get all
router.get("/academic_calendar/all", async (req, res) => {
  try {
    const data = await Model_AcademicCalendar.find().select({
      _id: 1,
      title: 1,
      date: 1,
      note: 1,
      "file.originalname": 1,
    });
    console.log(">>> data:", data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🕒 Get recent n
router.get("/academic_calendar/recent/:n", async (req, res) => {
  try {
    const n = parseInt(req.params.n) || 5;
    const data = await Model_AcademicCalendar.find()
      .select({ _id: 1, title: 1, date: 1, note: 1, "file.originalname": 1 })
      .sort({ createdAt: -1 })
      .limit(n);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ Create
router.post("/academic_calendar", async (req, res) => {
  try {
    const fields = { ...req.body };
    if (req?.files?.length) {
        if (req.files[0].size > 512000) {
            return res.status(400).json({ error: "The uploaded pdf size should be upto 500kb." });
        }
        fields.file = req.files[0];
    }
    const result = new Model_AcademicCalendar(fields);
    const saved = await result.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✏️ Update
router.patch("/academic_calendar/:dbid", async (req, res) => {
  try {
    const fields = { ...req.body };
    if (req?.files?.length) {
        if (req.files[0].size > 512000) {
            return res.status(400).json({ error: "The uploaded pdf size should be upto 500kb." });
        }
        fields.file = req.files[0];
    }
    if (fields?.file && !fields?.file?.originalname) delete fields.file;
    const updated = await Model_AcademicCalendar.findByIdAndUpdate(
      req.params.dbid,
      { $set: fields },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ Delete
router.delete("/academic_calendar/:dbid", async (req, res) => {
  try {
    await Model_AcademicCalendar.findByIdAndDelete(req.params.dbid);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
