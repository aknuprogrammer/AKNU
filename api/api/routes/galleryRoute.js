const express = require("express");
const multer = require("multer");
const Gallery = require("../models/gallery");
const authenticationMiddleware = require("../middlewares/authentication");

const galleryRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST route to create a new gallery entry (with file upload and alignno logic)
galleryRouter.post(
  "/",
  authenticationMiddleware,
  upload.single("img"),
  async (req, res) => {
    console.log("above try");
    try {
      const { title, description, alignno, mediatype } = req.body;
      console.log("below try", title);
      // Validate required fields
      if (!title || !alignno || !req.file || !mediatype) {
        return res.status(400).json({
          success: false,
          error: "Title, alignno, mediatype, and image/video are required",
        });
      }

      // Check for duplicate alignno
      const exists = await Gallery.findOne({ alignno });
      if (exists) {
        return res.status(400).json({
          success: false,
          error: "Align number already exists",
        });
      }

      // File validation by media type
      const img = req.file;
      const isImage = mediatype === "image";
      const isVideo = mediatype === "video";

      if (isImage && !img.mimetype.startsWith("image/")) {
        return res.status(400).json({
          success: false,
          error: "Invalid image format. Please upload JPG, PNG, or GIF.",
        });
      }

      if (isVideo && !img.mimetype.startsWith("video/")) {
        return res.status(400).json({
          success: false,
          error: "Invalid video format. Please upload MP4, MOV, or AVI.",
        });
      }

      // Optional: file size limit check
      const maxImageSize = 5 * 1024 * 1024; // 5MB
      const maxVideoSize = 10 * 1024 * 1024; // 10MB
      if (isImage && img.size > maxImageSize) {
        return res.status(400).json({
          success: false,
          error: "Image file size must be less than 5MB",
        });
      }
      if (isVideo && img.size > maxVideoSize) {
        return res.status(400).json({
          success: false,
          error: "Video file size must be less than 10MB",
        });
      }

      const newGalleryItem = new Gallery({
        title,
        description,
        alignno,
        mediatype,
        img,
      });

      const savedGalleryItem = await newGalleryItem.save();
      res.status(201).json({ success: true, data: savedGalleryItem });
    } catch (err) {
      console.log(82, "error occured while uploading", err);
      res.status(400).json({ success: false, error: err.message });
    }
  }
);

// GET route to fetch all gallery entries sorted by alignno with pagination
galleryRouter.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = req.query.limit === "all" ? 0 : (parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    let query = Gallery.find().select("-img.buffer").sort({ alignno: 1 });
    if (limit > 0) {
      query = query.skip(skip).limit(limit);
    }

    const galleryItems = await query;
    const total = await Gallery.countDocuments();

    res.status(200).json({ 
      success: true, 
      data: galleryItems,
      total,
      page,
      limit: limit > 0 ? limit : total,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT route to update a gallery entry by ID (with alignno logic)
galleryRouter.put(
  "/:id",
  authenticationMiddleware,
  upload.single("img"),
  async (req, res) => {
    try {
      const { title, description, alignno } = req.body;
      // Validate required fields
      if (!title || !alignno) {
        return res
          .status(400)
          .json({ success: false, error: "Title and alignno are required" });
      }
      // Check for duplicate alignno (excluding self)
      const exists = await Gallery.findOne({
        alignno,
        _id: { $ne: req.params.id },
      });
      if (exists) {
        return res
          .status(400)
          .json({ success: false, error: "alignno already exists" });
      }
      const updateData = { title, description, alignno };
      if (req.file) {
        updateData.img = req.file;
      }
      const updatedGalleryItem = await Gallery.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );
      if (!updatedGalleryItem) {
        return res
          .status(404)
          .json({ success: false, error: "Gallery item not found" });
      }
      res.status(200).json({ success: true, data: updatedGalleryItem });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
);

// DELETE route to delete a gallery entry by ID and re-align others
galleryRouter.delete("/:id", authenticationMiddleware, async (req, res) => {
  try {
    const toDelete = await Gallery.findById(req.params.id);
    if (!toDelete)
      return res
        .status(404)
        .json({ success: false, error: "Gallery item not found" });
    const deletedAlignno = toDelete.alignno;
    await Gallery.findByIdAndDelete(req.params.id);
    // Decrement alignno for all items with alignno > deletedAlignno
    await Gallery.updateMany(
      { alignno: { $gt: deletedAlignno } },
      { $inc: { alignno: -1 } }
    );
    res.status(200).json({ success: true, message: "Deleted and realigned" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET: Serve image buffer for a gallery item by id
galleryRouter.get("/image/:id", async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item || !item.img || !item.img.buffer) {
      return res.status(404).json({ success: false, error: "Image not found" });
    }
    res.setHeader("Content-Type", item.img.mimetype || "image/jpeg");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=\"${item.img.originalname || "image"}\"`
    );
    res.send(item.img.buffer);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

galleryRouter.get("/video/:id", async (req, res) => {
  try {
    const id = req.params.id.replace(".mp4", "");
    const item = await Gallery.findById(id);
    if (!item || item.mediatype !== "video") {
      return res.status(404).send("Video not found");
    }

    const videoBuffer = item.img.buffer;
    const range = req.headers.range;

    if (!range) {
      res.writeHead(200, {
        "Content-Length": videoBuffer.length,
        "Content-Type": item.img.mimetype || "video/mp4",
      });
      return res.end(videoBuffer);
    }

    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoBuffer.length - 1);

    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoBuffer.length}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": item.img.mimetype || "video/mp4",
    };

    res.writeHead(206, headers);
    res.end(videoBuffer.slice(start, end + 1));
  } catch (err) {
    console.error("Video stream error:", err);
    res.status(500).send("Error streaming video");
  }
});

module.exports = galleryRouter;
