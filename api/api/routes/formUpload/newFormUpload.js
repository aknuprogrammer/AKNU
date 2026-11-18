// routes/formRoutes.js
const express = require("express");
const adhocRoute = express.Router();
const FormSubmission = require("../../models/newAdhocModel");
const upload = require("../../middlewares/multerConfig");

// ✅ Helper to convert file to buffer
const bufferify = (file) => {
  if (!file) return null;
  return {
    data: file.buffer,
    contentType: file.mimetype,
    fileName: file.originalname,
  };
};

// ✅ All expected file fields
const fileFields = [
  { name: "aadhaar" },
  { name: "pan" },
  { name: "ssc" },
  { name: "intermediate" },
  { name: "phdGraduation" },
  { name: "netCert" },
  { name: "setCert" },
  { name: "sletCert" },
  { name: "mphil" },
  { name: "med" },
  { name: "bed" },
  // { name: "set" },
  { name: "experience" },
  { name: "publication" },
  { name: "patentsProof" },
  { name: "photo" },
  { name: "signature" },
  { name: "graduation" },
  { name: "postGraduation" },
  { name: "additionalDegree" },
  { name: "additional" },
  { name: "publicationProof", maxCount: 1 },
  { name: "mphilCertificate" }, // ✅ ADD any field you're uploading in frontend
];

adhocRoute.post("/", upload.fields(fileFields), async (req, res) => {
  try {
    const body = req.body;

    // ✅ Parse JSON string fields
    const parseJSON = (field) => {
      try {
        return JSON.parse(field || "[]");
      } catch {
        return [];
      }
    };

    body.graduationDegrees = parseJSON(body.graduationDegrees);
    body.postGraduationDegrees = parseJSON(body.postGraduationDegrees);
    body.additionalDegrees = parseJSON(body.additionalDegrees);
    body.nationalPatents = parseJSON(body.nationalPatents);
    body.internationalPatents = parseJSON(body.internationalPatents);
    body.best3Articles = parseJSON(body.best3Articles);
    body.awardsIfAny = parseJSON(body.awardsIfAny);

    const files = req.files;
    console.log("________req", req.body);
    const doc = new FormSubmission({
      ...body,
      aadhaar: bufferify(files?.aadhaar?.[0]),
      pan: bufferify(files?.pan?.[0]),
      ssc: bufferify(files?.ssc?.[0]),
      intermediate: bufferify(files?.intermediate?.[0]),
      phdGraduation: bufferify(files?.phdGraduation?.[0]),
      net: bufferify(files?.net?.[0]),
      set: bufferify(files?.set?.[0]),
      slet: bufferify(files?.slet?.[0]),
      mphil: bufferify(files?.mphil?.[0]),
      med: bufferify(files?.med?.[0]),
      bed: bufferify(files?.bed?.[0]),
      set: bufferify(files?.set?.[0]),
      experience: bufferify(files?.experience?.[0]),
      publication: bufferify(files?.publication?.[0]),
      patentsProof: bufferify(files?.patentsProof?.[0]),
      photo: bufferify(files?.photo?.[0]),
      signature: bufferify(files?.signature?.[0]),
      graduation: files?.graduation?.map(bufferify) || [],
      postGraduation: files?.postGraduation?.map(bufferify) || [],
      additionalDegree: files?.additionalDegree?.map(bufferify) || [],
      additional: files?.additional?.map(bufferify) || [],
      // Optional extra file
      mphilCertificate: bufferify(files?.mphilCertificate?.[0]),
    });

    const saved = await doc.save();

    res
      .status(201)
      .json({ message: "Form submitted successfully", id: saved._id });
  } catch (err) {
    console.error("❌ Submission Error:", err);
    
    // Handle duplicate key error (code 11000)
    if (err.code === 11000) {
      return res.status(409).json({ 
        error: "A record with this Email or Mobile Number already exists." 
      });
    }
    
    res.status(500).json({ error: "Form submission failed" });
  }
});

// 📌 GET: Fetch form by ID
adhocRoute.get("/:id", async (req, res) => {
  try {
    const form = await FormSubmission.findById(req.params.id);
    if (!form) return res.status(404).json({ error: "Form not found" });
    res.status(200).json(form);
  } catch (err) {
    console.error("Get Form Error:", err);
    res.status(500).json({ error: "Failed to fetch form" });
  }
});

module.exports = adhocRoute;
