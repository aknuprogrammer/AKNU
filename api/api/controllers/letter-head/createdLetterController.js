const CreateLetter = require("../../models/letter-heads/CreateLetter");
const UserDetail = require("../../models/User"); // Detailed User profile

// POST: create/save letter
exports.createLetters = async (req, res) => {
  try {
    const data = req.body;
    // Validate required fields
    if (!data.logo || !data.title || !data.refNo) {
      return res.status(400).json({ message: "Logo, title, and refNo are required" });
    }

    const letter = new CreateLetter({
      logo: data.logo,
      title: data.title,
      description: data.description,
      email: data.email,
      phone: data.phone,
      faithfulText: data.faithfulText,
      closingText: data.closingText, // Fixed: Added closingText mapping
      footerText: data.footerText,
      greetings: data.greetings,
      hrText: data.hrText,
      layout: data.layout,
      letterContent: data.letterContent,
      letterText: data.letterText,
      refNo: data.refNo,
      pageSize: data.pageSize,
      department: data.department,
      templateId: data.templateId,
      subject: data.subject,
      signatureName: data.signatureName,
      margins: data.margins,
      letterCode: data.letterCode,
      thumbnail: data.thumbnail, // Added thumbnail support for library preview
    });

    await letter.save();
    res.status(201).json({ message: "Letter saved successfully", letter });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET: fetch all letters
exports.getAllLetters = async (req, res) => {
  try {
    const role = (req.user?.role || "").toLowerCase();
    const email = req.user?.email || "";
    let query = {};
    const requestAll = req.query.all === "true";
    const roleToCode = {
      "vc": "2",
      "vice chancellor": "2",
      "registrar": "3",
      "registar": "3",
      "admin": "1",
      "user": "10",
    };

    const isAdmin = ["super_admin", "admin"].includes(role);
    const isAuthorizedAll = requestAll && isAdmin; // Only allow all institutional history for Super Admin/Admin

    if (isAuthorizedAll) {
      // Admin oversaw all history
      query = {};
    } else {
      // Management roles (VC, Registrar) and users see their OWN letters OR letters created for their ROLE
      if (!email) return res.status(400).json({ message: "User email missing" });
      
      const targetCode = roleToCode[role];
      if (targetCode) {
        let allowedCodes = [targetCode];
        if (targetCode === "2" || targetCode === "3") {
          allowedCodes = ["2", "3"]; // VC and Registrar share visibility
        }

        query = { 
          $or: [
            { email: email }, 
            { letterCode: { $in: allowedCodes } }
          ], 
          status: { $ne: "disabled" } 
        };
      } else {
        query = { email: email, status: { $ne: "disabled" } };
      }
    }



    console.log(`[AUTH-LOG-HIST] Role Login: ${role}, Filter:`, query);

    const letters = await CreateLetter.find(query)
      .select("-logo -letterContent -letterText") // Exclude large fields for listing
      .sort({ createdAt: -1 });
    res.json(letters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET: fetch a single letter by refNo
exports.getLetterByRef = async (req, res) => {
  try {
    const { refNo } = req.params;
    const letter = await CreateLetter.findOne({ refNo });
    if (!letter) return res.status(404).json({ message: "Letter not found" });
    res.json(letter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET: fetch letter by ID
exports.getLetterById = async (req, res) => {
  try {
    const letter = await CreateLetter.findById(req.params.id);
    if (!letter) return res.status(404).json({ message: "Letter not found" });
    res.json(letter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH: update letter
exports.updateLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    // We update everything except _id
    delete data._id;
    
    const updated = await CreateLetter.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return res.status(404).json({ message: "Letter not found" });
    res.json({ message: "Letter updated successfully", letter: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE: toggle status of a letter
exports.deleteCreatedLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const letter = await CreateLetter.findById(id);
    if (!letter) return res.status(404).json({ message: "Letter not found" });

    const newStatus = (letter.status === "disabled") ? "active" : "disabled";
    letter.status = newStatus;
    await letter.save();

    res.json({ 
      message: `Letter successfully ${newStatus === "disabled" ? "disabled" : "enabled"}`, 
      status: letter.status 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
