const express = require("express");
const multer = require("multer");
const { MongoClient } = require("mongodb");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const client = new MongoClient(process.env.MONGO_DB);
const CLIENT_DOMAIN = process.env.CLIENT_DOMAIN;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;
const MONGO_DB_COLLECTION = process.env.MONGO_DB_COLLECTION || "temp";

router.post("/", upload.any(), async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", CLIENT_DOMAIN);
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const fields = {};
    req.body = JSON.parse(req.body.data);
    for (const key in req.body) fields[key] = req.body[key];
    if (fields._id === "") delete fields._id;

    fields.files = {};
    for (const key in req.files) fields.files[key] = req.files[key];
    fields.createdAt = new Date();

    await client.connect();
    const db = client.db(MONGODB_DB_NAME);
    const collection = db.collection(MONGO_DB_COLLECTION);

    const result = await collection.insertOne(fields);

    if (result.insertedId) {
      res.status(200).json({
        success: true,
        message: "Submission successful",
        doc_id: result.insertedId,
        createdAt: fields.createdAt,
      });
    } else {
      res.status(500).json({ success: false, message: "Submission failed - no insertedID" });
    }
  } catch (err) {
    console.error("Upload Error Details:", err);
    res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
  }

});

module.exports = router;
