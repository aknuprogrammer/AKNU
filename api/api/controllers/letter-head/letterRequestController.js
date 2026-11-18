// import LetterRequest from "../../models/letter-heads/LetterRequest.js";
const LetterRequest = require("../../models/letter-heads/LetterRequest");
const Letter = require("../../models/letter-heads/Letter");
const Department = require("../../models/departmentModal");
// const CollegeModel = require("../../models/admission/selector/College");
// Create new request
// import crypto from "crypto";
const crypto = require("crypto");
const createLetterRequest = async (req, res) => {
  console.log("API HIT");

  try {
    const {
      name,
      email,
      department,
      systemIp,
      date,
      facultyId,
      reason,
      authorization,
      letterIds,
      campus,
      requestKind: bodyRequestKind,
      refNo,
    } = req.body;

    const ip = systemIp || req.ip;

    if (
      !name ||
      !email ||
      !department ||
      !campus ||
      !facultyId ||
      !reason ||
      !authorization ||
      !letterIds ||
      letterIds?.length < 1
    ) {
      return res.status(400).send({ message: "Please Fill all fields" });
    }

    const dept = await Department.findById(department);

    if (!dept) {
      return res.status(404).send({ messsage: "Department Not Found" });
    }

    // const exCampus = await CollegeModel.findById(campus);

    // if (!exCampus) {
    //   return res.status(404).send({ messsage: "Campus Not Found" });
    // }

    // Generate a unique 12-character alphanumeric ID
    const randomId = crypto.randomBytes(6).toString("hex").toUpperCase(); // 12 hex chars

    // Format date as YYYY-MM-DD
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    // Create full request ID
    const requestId = `AKNU-${campus}-${dept.shortCode?.toUpperCase()}-${randomId}`;

    const firstLetterId = (letterIds && letterIds.length > 0) ? letterIds[0] : null;
    const firstLetter = firstLetterId ? await Letter.findById(firstLetterId).select("type").lean() : null;
      
    const inferredKind =
      firstLetter?.type === "created" ? "letter" : "template";
    const requestKind =
      bodyRequestKind === "letter" || bodyRequestKind === "template"
        ? bodyRequestKind
        : inferredKind;

    const newRequest = new LetterRequest({
      name,
      email,
      department,
      systemIp: ip,
      date,
      facultyId,
      reason,
      authorization,
      letterIds,
      requestId,
      campus,
      requestKind,
      ...(refNo != null && refNo !== "" ? { refNo } : {}),
    });

    await newRequest.save();

    res.status(201).json(newRequest);
  } catch (error) {
    console.log("______error", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all requests

const getLetterRequests = async (req, res) => {
  try {
    const role = req.user?.role?.toLowerCase();
    const isAdmin = ["super_admin", "admin", "vc", "registrar"].includes(role);
    const requestAll = req.query.all === "true" && isAdmin; // Only allow all if authorized and requested

    console.log(`[DEBUG] getLetterRequests - User: ${req.user?.email}, Role: ${role}, isAdmin: ${isAdmin}, requestAll: ${requestAll}`);

    let query = {};
    if (!requestAll) {
      if (!req.user?.email) {
        console.warn("[DEBUG] Missing email in non-admin request");
        return res.status(400).json({ success: false, message: "User email missing from token" });
      }
      query = { email: req.user.email };
    }



    console.log(`[DEBUG] Request Query:`, query);

    const requests = await LetterRequest.find(query)
      .populate("department")
      .lean();

    console.log(`[DEBUG] Found ${requests ? requests.length : 0} requests with letter metadata`);
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("Critical Error in getLetterRequests:", error);
    res.status(500).json({ success: false, message: "Internal server error while fetching requests", error: error.message });
  }
};

// Get single request
const getLetterRequestById = async (req, res) => {
  try {
    const request = await LetterRequest.findById(req.params.id);
    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete request
const deleteLetterRequest = async (req, res) => {
  try {
    const deleted = await LetterRequest.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    res.status(200).json({ success: true, message: "Request deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single letter file (download endpoint) - FIXED VERSION
const getLetterFile = async (req, res) => {
  try {
    const letter = await LetterRequest.findById(req.params.id);
    if (!letter) return res.status(404).json({ message: "Letter not found" });

    console.log(letter);
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

const markRequestUsed = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await LetterRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.isUsed = true;
    await request.save();

    res.json({ message: "Request marked as used", success: true, isUsed: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveLetterRequest = async (req, res) => {
  try {
    const updated = await LetterRequest.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rejectLetterRequest = async (req, res) => {
  try {
    const updated = await LetterRequest.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  deleteLetterRequest,
  getLetterRequestById,
  getLetterRequests,
  getLetterFile,
  createLetterRequest,
  approveLetterRequest,
  rejectLetterRequest,
  markRequestUsed,
};
