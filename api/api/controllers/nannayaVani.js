const NannayaVani = require("../models/nannayaVaniModel");

// @desc    Get all editions
// @route   GET /api/editions
// @access  Public
exports.getEditions = async (req, res) => {
  try {
    const editions = await NannayaVani.find()
      .sort({ date: -1 })
      .select("-pdfData");
    res.json(
      editions.map((edition) => ({
        id: edition._id,
        date: edition.date.toISOString().split("T")[0],
        edition: edition.edition,
        downloadLink: `/api/editions/${edition._id}/download`,
        previewLink: `/api/editions/${edition._id}/preview`,
        originalName: edition.originalName,
      }))
    );
  } catch (err) {
    console.error("Error fetching editions:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get PDF content
// @route   GET /api/editions/:id/download
// @access  Public
exports.downloadEdition = async (req, res) => {
  try {
    const edition = await NannayaVani.findById(req.params.id);
    if (!edition) {
      return res.status(404).json({ message: "Edition not found" });
    }

    res.set({
      "Content-Type": edition.contentType,
      "Content-Disposition": `attachment; filename="${edition.originalName}"`,
    });
    res.send(edition.pdfData);
  } catch (err) {
    console.error("Error downloading edition:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Preview PDF
// @route   GET /api/editions/:id/preview
// @access  Public
exports.previewEdition = async (req, res) => {
  try {
    console.log("__sdfdsfiuytfgfs", req.params.id);
    const edition = await NannayaVani.findById(req.params.id);
    if (!edition) return res.status(404).send("Edition not found");

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${edition.originalName}"`,
    });
    res.send(edition.pdfData);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// @desc    Create new edition
// @route   POST /api/editions
// @access  Private
exports.createEdition = async (req, res) => {
  try {
    const { date, edition } = req.body;
    if (!date || !edition || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newEdition = new NannayaVani({
      date,
      edition: `Edition #${edition}`,
      pdfData: req.file.buffer,
      contentType: req.file.mimetype,
      originalName: req.file.originalname,
    });

    await newEdition.save();

    // Return the edition without the PDF buffer
    const editionResponse = newEdition.toObject();
    delete editionResponse.pdfData;

    res.status(201).json(editionResponse);
  } catch (err) {
    console.error("Error creating edition:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// @desc    Update edition
// @route   PUT /api/editions/:id
// @access  Private
exports.updateEdition = async (req, res) => {
  try {
    const { date, edition } = req.body;
    const editionId = req.params.id;

    const updateData = {
      date,
      edition: `Edition #${edition}`,
      updatedAt: Date.now(),
    };

    if (req.file) {
      updateData.pdfData = req.file.buffer;
      updateData.contentType = req.file.mimetype;
      updateData.originalName = req.file.originalname;
    }

    const updatedEdition = await NannayaVani.findByIdAndUpdate(
      editionId,
      updateData,
      { new: true }
    ).select("-pdfData");

    if (!updatedEdition) {
      return res.status(404).json({ message: "Edition not found" });
    }

    res.json(updatedEdition);
  } catch (err) {
    console.error("Error updating edition:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// @desc    Delete edition
// @route   DELETE /api/editions/:id
// @access  Private
exports.deleteEdition = async (req, res) => {
  try {
    console.log("____res", req.params.id);
    const edition = await NannayaVani.findByIdAndDelete(req.params.id);
    if (!edition) {
      return res.status(404).json({ message: "Edition not found" });
    }

    res.json({ message: "Edition deleted successfully" });
  } catch (err) {
    console.error("Error deleting edition:", err);
    res.status(500).json({ message: "Server error" });
  }
};
