// @desc Get all stream-subject mappings

const StreamSubjectMapping = require("../../../models/examination/selector/StreamSubjectMapping");

// @route GET /api/examination/stream-subject-mappings
exports.getStreamSubjectMappings = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    
    const query = {};
    if (activeOnly === "true" || activeOnly === true) {
      query.status = "Active";
    }
    
    const mappings = await StreamSubjectMapping.find(query)
      .populate("streamId", "code name status")
      .populate("subjectId", "code name status")
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      count: mappings.length,
      data: mappings,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create a stream-subject mapping
// @route POST /api/examination/stream-subject-mappings
exports.createStreamSubjectMapping = async (req, res) => {
  try {
    const { streamId, subjectId, status, notes } = req.body;

    const mapping = new StreamSubjectMapping({
      streamId,
      subjectId,
      status,
      notes,
    });

    await mapping.save();

    // Populate before sending response
    await mapping.populate("streamId", "code name");
    await mapping.populate("subjectId", "code name");

    res.status(201).json(mapping);
  } catch (error) {
    console.error("Error creating stream-subject mapping:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({
          message: "Duplicate mapping",
          error: "This stream-subject combination already exists",
        });
    }
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update a stream-subject mapping
// @route PUT /api/examination/stream-subject-mappings/:id
exports.updateStreamSubjectMapping = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMapping = await StreamSubjectMapping.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    )
      .populate("streamId", "code name")
      .populate("subjectId", "code name");
    if (!updatedMapping)
      return res
        .status(404)
        .json({ message: "Stream-subject mapping not found" });
    res.json(updatedMapping);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete a stream-subject mapping
// @route DELETE /api/examination/stream-subject-mappings/:id
exports.deleteStreamSubjectMapping = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMapping = await StreamSubjectMapping.findByIdAndDelete(id);
    if (!deletedMapping)
      return res
        .status(404)
        .json({ message: "Stream-subject mapping not found" });
    res.json({ message: "Stream-subject mapping deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// @desc Get single stream-subject mapping by ID
// @route GET /api/examination/stream-subject-mappings/:id
exports.getStreamSubjectMappingById = async (req, res) => {
  try {
    const { id } = req.params;
    const mapping = await StreamSubjectMapping.findById(id)
      .populate("streamId", "code name")
      .populate("subjectId", "code name");
    if (!mapping)
      return res
        .status(404)
        .json({ message: "Stream-subject mapping not found" });
    res.json(mapping);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get mappings by streamId
// @route GET /api/examination/stream-subject-mappings/stream/:streamId
exports.getMappingsByStream = async (req, res) => {
  try {
    const { streamId } = req.params;
    const { activeOnly } = req.query;
    
    const query = { streamId };
    if (activeOnly === "true" || activeOnly === true) {
      query.status = "Active";
    }
    
    const mappings = await StreamSubjectMapping.find(query)
      .populate("streamId", "code name status")
      .populate("subjectId", "code name status")
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      count: mappings.length,
      data: mappings,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get mappings by subjectId
// @route GET /api/examination/stream-subject-mappings/subject/:subjectId
exports.getMappingsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const mappings = await StreamSubjectMapping.find({ subjectId })
      .populate("streamId", "code name")
      .populate("subjectId", "code name")
      .sort({ createdAt: -1 });
    res.json(mappings);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

