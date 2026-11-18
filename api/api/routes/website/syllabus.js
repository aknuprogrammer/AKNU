const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const Syllabus = require("../../../models/website/Syllabus");

// Ensure the upload directory exists
const UPLOAD_DIR = path.join(__dirname, "../../../uploads/syllabus");
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// GET all syllabuses
router.get("/all/:program", async (req, res) => {
    try {
        const { program } = req.params;
        const data = await Syllabus.find({ program })
            .sort({ effectiveYear: -1, createdAt: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve the file (Robust, environment-independent serving)
router.get("/file/view/:id/:fileId", async (req, res) => {
    try {
        const doc = await Syllabus.findById(req.params.id);
        if (!doc) return res.status(404).send("Syllabus record not found");
        
        const file = doc.files.id(req.params.fileId);
        if (!file || !file.pdfPath) {
            return res.status(404).send("File not found in record");
        }
        
        // 1. Try to resolve relative to the current server's UPLOAD_DIR using the filename
        const fileName = path.basename(file.pdfPath);
        const resolvedPath = path.join(UPLOAD_DIR, fileName);
        
        if (fs.existsSync(resolvedPath)) {
            return res.sendFile(resolvedPath);
        }
        
        // 2. Fallback to the stored path exactly as saved
        const absolutePath = path.resolve(file.pdfPath);
        if (fs.existsSync(absolutePath)) {
            return res.sendFile(absolutePath);
        }
        
        // 3. File was not found in either location
        return res.status(404).send("Physical file not found on server");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST Bulk Create (DISK STORAGE VERSION)
router.post("/bulk-create", async (req, res) => {
    console.log("Syllabus Bulk Create Started (Multi-File Mode)");
    try {
        const { program, effectiveYear, category, structure } = req.body;
        
        if (!program || !effectiveYear || !category || !structure) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const parsedStructure = typeof structure === 'string' ? JSON.parse(structure) : structure;
        const savedRecords = [];
        const files = req.files || [];

        for (let d = 0; d < parsedStructure.length; d++) {
            const dept = parsedStructure[d];
            if (!dept.subjects) continue;

            for (let s = 0; s < dept.subjects.length; s++) {
                const sub = dept.subjects[s];
                const subjectFiles = [];

                // For each subject, look for multiple files: file_d_s_f
                // sub.syllabuses will contain labels
                if (sub.syllabuses && sub.syllabuses.length > 0) {
                    for (let f = 0; f < sub.syllabuses.length; f++) {
                        const fileKey = `file_${d}_${s}_${f}`;
                        const file = files.find(fileItem => fileItem.fieldname === fileKey);

                        if (file) {
                            const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
                            const filePath = path.join(UPLOAD_DIR, fileName);
                            fs.writeFileSync(filePath, file.buffer);

                            subjectFiles.push({
                                title: sub.syllabuses[f].label || "Syllabus",
                                pdfPath: filePath,
                                fileName: file.originalname,
                                fileSize: file.size
                            });
                        }
                    }
                }

                const newSyllabus = new Syllabus({
                    program,
                    effectiveYear,
                    category,
                    department: dept.name,
                    title: sub.title,
                    files: subjectFiles
                });
                
                const saved = await newSyllabus.save();
                savedRecords.push(saved._id);
            }
        }

        res.status(201).json({ message: "Successfully uploaded to server disk", count: savedRecords.length });

    } catch (err) {
        console.error("Bulk Create Disk Error:", err);
        res.status(500).json({ error: `Server error: ${err.message}` });
    }
});

// DELETE a syllabus
router.delete("/:id", async (req, res) => {
    try {
        const doc = await Syllabus.findById(req.params.id);
        if (doc && doc.files && doc.files.length > 0) {
            doc.files.forEach(file => {
                if (file.pdfPath) {
                    const fileName = path.basename(file.pdfPath);
                    const absolutePath = path.join(UPLOAD_DIR, fileName);
                    if (fs.existsSync(absolutePath)) {
                        try {
                            fs.unlinkSync(absolutePath);
                        } catch (e) {
                            console.error("Error deleting file:", absolutePath, e);
                        }
                    } else if (fs.existsSync(file.pdfPath)) {
                        try {
                            fs.unlinkSync(file.pdfPath);
                        } catch (e) {
                            console.error("Error deleting file:", file.pdfPath, e);
                        }
                    }
                }
            });
        }
        await Syllabus.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted from disk and database" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// UPDATE a syllabus
router.put("/:id", async (req, res) => {
    try {
        const { program, effectiveYear, category, department, title, fileMetadata } = req.body;
        const syllabus = await Syllabus.findById(req.params.id);
        
        if (!syllabus) {
            return res.status(404).json({ error: "Syllabus not found" });
        }

        if (program) syllabus.program = program;
        if (effectiveYear) syllabus.effectiveYear = effectiveYear;
        if (category) syllabus.category = category;
        if (department) syllabus.department = department;
        if (title) syllabus.title = title;

        const files = req.files || [];
        const parsedMetadata = fileMetadata ? JSON.parse(fileMetadata) : [];

        // Track new file structure
        const updatedFiles = [];

        for (let i = 0; i < parsedMetadata.length; i++) {
            const meta = parsedMetadata[i];
            const uploadedFile = files.find(f => f.fieldname === `file_${i}`);

            if (uploadedFile) {
                // If there was an old file at this position (meta._id), delete it
                if (meta._id) {
                    const existing = syllabus.files.id(meta._id);
                    if (existing && existing.pdfPath) {
                        const oldFileName = path.basename(existing.pdfPath);
                        const oldPath = path.join(UPLOAD_DIR, oldFileName);
                        if (fs.existsSync(oldPath)) {
                            try { fs.unlinkSync(oldPath); } catch (e) {}
                        } else if (fs.existsSync(existing.pdfPath)) {
                            try { fs.unlinkSync(existing.pdfPath); } catch (e) {}
                        }
                    }
                }

                // Save new file
                const fileName = `${Date.now()}-${uploadedFile.originalname.replace(/\s+/g, '_')}`;
                const filePath = path.join(UPLOAD_DIR, fileName);
                fs.writeFileSync(filePath, uploadedFile.buffer);

                updatedFiles.push({
                    title: meta.label || "Syllabus",
                    pdfPath: filePath,
                    fileName: uploadedFile.originalname,
                    fileSize: uploadedFile.size
                });
            } else if (meta._id) {
                // Keep existing file but update label
                const existing = syllabus.files.id(meta._id);
                if (existing) {
                    existing.title = meta.label || "Syllabus";
                    updatedFiles.push(existing);
                }
            }
        }

        // Handle deletions: If a file was in syllabus.files but not in updatedFiles, delete it
        syllabus.files.forEach(oldFile => {
            const stillExists = updatedFiles.find(f => f._id && f._id.toString() === oldFile._id.toString());
            if (!stillExists) {
                if (oldFile.pdfPath) {
                    const oldFileName = path.basename(oldFile.pdfPath);
                    const oldPath = path.join(UPLOAD_DIR, oldFileName);
                    if (fs.existsSync(oldPath)) {
                        try { fs.unlinkSync(oldPath); } catch (e) {}
                    } else if (fs.existsSync(oldFile.pdfPath)) {
                        try { fs.unlinkSync(oldFile.pdfPath); } catch (e) {}
                    }
                }
            }
        });

        syllabus.files = updatedFiles;
        await syllabus.save();
        res.json({ message: "Syllabus updated successfully" });
    } catch (err) {
        console.error("Update Syllabus Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
