const Letter = require("../../models/letter-heads/Letter");
const UserDetail = require("../../models/User"); // Detailed User profile

// Create new letter
const createLetter = async (req, res) => {
  try {
    const { 
      title, 
      uploadedBy, 
      letterCode, 
      type,
      logo,
      description,
      email,
      phone,
      footerText,
      layout,
      faithfulText,
      hrText,
      greetings,
      thumbnail,
      department,
      refNo
    } = req.body;

    if (!letterCode) {
      return res.status(400).json({ message: "Letter Code is Required" });
    }

    if (!title || !uploadedBy) {
      return res
        .status(400)
        .json({ message: "Title and User name is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const dateFiled = new Date().toISOString();
    
    let systemIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || "Unknown";
    if (typeof systemIp === 'string' && systemIp.includes(',')) {
      systemIp = systemIp.split(',')[0].trim();
    }
    if (systemIp === '::1' || systemIp === '127.0.0.1' || systemIp === '::ffff:127.0.0.1') {
      systemIp = 'Localhost';
    }

    const letter = new Letter({
      title,
      uploadedBy,
      dateFiled,
      letterCode,
      type: type || "uploaded",
      logo,
      description,
      email,
      phone,
      footerText,
      layout,
      faithfulText,
      hrText,
      greetings,
      thumbnail,
      department,
      refNo,
      systemIp,
      file: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        originalName: req.file.originalname,
      },
    });

    await letter.save();
    res.status(201).json({ message: "Letter uploaded successfully", letter });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all letters (without binary data)
const getLetters = async (req, res) => {
  try {
    const role = (req.user?.role || "").toLowerCase();
    const email = req.user?.email || "";
    let params = {};
    const requestAll = req.query.all === "true";

    // Map Roles to Codes
    const roleToCode = {
      "vc": "2",
      "vice chancellor": "2",
      "registrar": "3",
      "registar": "3",
      "admin": "1", // General Admin letters
      "user": "10", // Fallback/Others
    };

    if (role === "super_admin") {
      // Super Admin sees all in the library
      params = {};
    } else {
      const targetCode = roleToCode[role];
      if (targetCode) {
        let allowedCodes = [targetCode];
        if (targetCode === "2" || targetCode === "3") {
          allowedCodes = ["2", "3"]; // VC and Registrar share visibility
        }
        params = { letterCode: { $in: allowedCodes }, status: { $ne: "disabled" } };
      } else {
        // Fallback for others
        params = { letterCode: "10", status: { $ne: "disabled" } };
      }
    }


    console.log(`[AUTH-LOG] Role Login: ${role}, Filter:`, params);

    const letters = await Letter.find(params)
      .select("-file.data -logo -description -greetings -hrText -faithfulText -footerText")
      .sort({ createdAt: -1 });

    res.json(letters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single letter file (download endpoint) - FIXED VERSION
const getLetterFile = async (req, res) => {
  try {
    const letter = await Letter.findById(req.params.id);
    if (!letter) return res.status(404).json({ message: "Letter not found" });

    // Ensure we're sending the buffer correctly
    const buffer = letter.file.data;

    // Convert to Buffer if it's not already
    const fileBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

    res.set("Content-Type", letter.file.contentType);
    res.set(
      "Content-Disposition",
      `inline; filename="${letter.file.originalName}"`
    );
    res.set("Content-Length", fileBuffer.length);
    res.send(fileBuffer);
  } catch (error) {
    console.error("Error in getLetterFile:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteLetter = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[BACKEND] Request to Toggle Status for Letter: ${id}`);

    const letter = await Letter.findById(id);
    if (!letter) {
      console.log(`[BACKEND] Letter NOT FOUND: ${id}`);
      return res.status(404).json({ message: "Letter not found" });
    }

    const currentStatus = letter.status || "active";
    const newStatus = currentStatus === "disabled" ? "active" : "disabled";

    console.log(`[BACKEND] Current Status: ${currentStatus} -> Changing To: ${newStatus}`);

    const updated = await Letter.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true }
    );

    console.log(`[BACKEND] Updated Status Success: ${updated.status}`);
    res.status(200).json({
      success: true,
      message: `Template ${newStatus === "active" ? "Enabled" : "Disabled"} successfully`,
      data: updated,
    });
  } catch (error) {
    console.error("[BACKEND ERROR] Toggle Status:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get single template metadata
const getLetterMetadata = async (req, res) => {
  try {
    const letter = await Letter.findById(req.params.id)
      .select("-file.data")
      .lean();
    if (!letter) return res.status(404).json({ message: "Template not found" });
    res.json(letter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createLetter,
  getLetters,
  getLetterFile,
  deleteLetter,
  getLetterMetadata,
};

