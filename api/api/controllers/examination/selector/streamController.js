// @desc Get all streams

const Stream = require("../../../models/examination/selector/Stream");

// @route GET /api/examination/streams
exports.getStreams = async (req, res) => {
  try {
    const streams = await Stream.find()
      .populate("courseId", "code name")
      .sort({ createdAt: -1 });
    res.json(streams);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Create a stream
// @route POST /api/examination/streams
exports.createStream = async (req, res) => {
  try {
    const { courseId, code, name, description, status } = req.body;

    const stream = new Stream({
      courseId,
      code,
      name,
      description,
      status,
    });

    await stream.save();

    // Populate courseId before sending response
    await stream.populate("courseId", "code name");

    res.status(201).json(stream);
  } catch (error) {
    console.error("Error creating stream:", error);
    res.status(400).json({ message: "Invalid Data", error: error.message });
  }
};

// @desc Update a stream
// @route PUT /api/examination/streams/:id
exports.updateStream = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStream = await Stream.findByIdAndUpdate(id, req.body, {
      new: true,
    }).populate("courseId", "code name");
    if (!updatedStream)
      return res.status(404).json({ message: "Stream not found" });
    res.json(updatedStream);
  } catch (error) {
    res.status(400).json({ message: "Update failed", error: error.message });
  }
};

// @desc Delete a stream
// @route DELETE /api/examination/streams/:id
exports.deleteStream = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStream = await Stream.findByIdAndDelete(id);
    if (!deletedStream)
      return res.status(404).json({ message: "Stream not found" });
    res.json({ message: "Stream deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// @desc Get single stream by ID
// @route GET /api/examination/streams/:id
exports.getStreamById = async (req, res) => {
  try {
    const { id } = req.params;
    const stream = await Stream.findById(id).populate(
      "courseId",
      "code name"
    );
    if (!stream)
      return res.status(404).json({ message: "Stream not found" });
    res.json(stream);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc Get streams by courseId
// @route GET /api/examination/streams/course/:courseId
exports.getStreamsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const streams = await Stream.find({ courseId })
      .populate("courseId", "code name")
      .sort({ name: 1 });
    res.json(streams);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

