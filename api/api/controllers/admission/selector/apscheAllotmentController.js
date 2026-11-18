const xlsx = require("xlsx");
const path = require("path");
const ApscheAllotment = require("../../../models/admission/selector/ApscheAllotment");

// GET all
exports.getAllAllotments = async (req, res) => {
  try {
    const allotments = await ApscheAllotment.find().sort({ date: -1 });
    res.json(allotments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET by ID
exports.getAllotmentById = async (req, res) => {
  try {
    const allotment = await ApscheAllotment.findById(req.params.id);
    if (!allotment)
      return res.status(404).json({ message: "Allotment not found" });
    res.json(allotment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Expected normalized keys
const REQUIRED_COLUMNS = [
  "hallTicket",
  "rank",
  "applicantName",
  "gender",
  "caste",
  "region",
  "allotedCategory",
];

// Mapping normalized keys to model fields
const COLUMN_MAP = {
  hallticket: "hallTicket",
  rank: "rank",
  applicantname: "applicantName",
  gender: "gender",
  caste: "caste",
  region: "region",
  allotedcategory: "allotedCategory",
};

// Optional extra columns to ignore (like serial numbers)
const ALLOWED_EXTRA_COLUMNS = ["sn no", "sr no", "serial"];

// Normalize Excel column names
const normalizeColumn = (col) =>
  col
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

exports.createAllotment = async (req, res) => {
  try {
    console.log("_____req.file", req.file);
    if (!req.file)
      return res.status(400).json({ message: "Excel file is required" });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });

    if (!workbook.SheetNames.length) {
      return res.status(400).json({ message: "Excel file has no sheets" });
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { defval: "" });
    console.log("_______________1: Excel rows read", data.length);

    if (!data.length)
      return res.status(400).json({ message: "Excel file is empty" });
    console.log("_______________2: Data exists");

    // Map Excel columns to model fields
    const fileColumns = Object.keys(data[0]);
    const mappedColumns = {};
    console.log("_______________3: File columns", fileColumns);

    fileColumns.forEach((col) => {
      const normalized = normalizeColumn(col);
      if (COLUMN_MAP[normalized]) {
        mappedColumns[col] = COLUMN_MAP[normalized];
      }
    });
    console.log("_______________4: Mapped columns", mappedColumns);

    // Check missing and extra columns
    const missingColumns = REQUIRED_COLUMNS.filter(
      (col) => !Object.values(mappedColumns).includes(col)
    );
    console.log("_______________5: Missing columns", missingColumns);

    const extraColumns = fileColumns.filter((col) => {
      const cleanCol = col.toString().trim().toLowerCase();
      return !mappedColumns[col] && !ALLOWED_EXTRA_COLUMNS.includes(cleanCol);
    });
    console.log(
      "_______________6: Extra columns check",
      missingColumns.length > 0,
      extraColumns.length > 0,
      missingColumns,
      extraColumns
    );

    if (missingColumns.length || extraColumns.length) {
      return res.status(400).json({
        message: "Excel columns mismatch",
        missingColumns,
        extraColumns,
      });
    }
    console.log("_______________7: Columns validated");

    // Convert rows and validate
    const records = [];
    const invalidRows = [];

    data.forEach((row, idx) => {
      const mappedRow = {};
      Object.entries(row).forEach(([col, value]) => {
        const key = mappedColumns[col];
        if (key) mappedRow[key] = value?.toString().trim() || "";
      });
      console.log("_______________8: Row processed", idx + 2);

      if (!mappedRow.hallTicket) {
        invalidRows.push(idx + 2); // Excel row number
        return;
      }
      console.log("_______________9: Hall ticket exists");

      REQUIRED_COLUMNS.forEach((field) => {
        if (!mappedRow[field]) mappedRow[field] = "";
      });
      console.log("_______________10: Required columns filled");

      records.push(mappedRow);
    });

    if (invalidRows.length) {
      return res.status(400).json({
        message: "Some rows have missing required fields",
        rows: invalidRows,
      });
    }
    console.log("_______________11: All rows processed successfully");

    // Check duplicates
    const hallTickets = records.map((r) => r.hallTicket);
    const duplicates = hallTickets.filter(
      (item, index) => hallTickets.indexOf(item) !== index
    );
    console.log("_______________12: Duplicate check");

    if (duplicates.length) {
      return res.status(400).json({
        message: "Duplicate Hall Ticket numbers found",
        duplicates: [...new Set(duplicates)],
      });
    }
    console.log("_______________13: No duplicates found");

    // Insert into DB
    const savedRecords = await ApscheAllotment.insertMany(records);
    console.log("_______________14: Records saved");

    res.status(201).json({
      message: "Allotments created successfully",
      savedRecords,
    });
  } catch (err) {
    console.error("Error in createAllotment:", err);
    res
      .status(500)
      .json({ message: "Unexpected server error", error: err.message });
  }
};

// GET by Hall Ticket Number
exports.getAllotmentByHallTicket = async (req, res) => {
  try {
    const { hallTicket } = req.params;
console.log("_____hallTicket", hallTicket);
    if (!hallTicket) {
      return res.status(400).json({ message: "Hall Ticket is required" });
    }

    const allotment = await ApscheAllotment.findOne({
      hallTicket: hallTicket.trim(),
    });

    console.log("_@@@@____allotment",allotment)
    if (!allotment) {
      return res
        .status(404)
        .json({ message: "Allotment not found for this Hall Ticket" });
    }

    res.json(allotment);
  } catch (err) {
    console.error("Error fetching allotment by hall ticket:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// UPDATE
exports.updateAllotment = async (req, res) => {
  try {
    const updated = await ApscheAllotment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updated)
      return res.status(404).json({ message: "Allotment not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
exports.deleteAllotment = async (req, res) => {
  try {
    const allotment = await ApscheAllotment.findByIdAndDelete(req.params.id);
    if (!allotment)
      return res.status(404).json({ message: "Allotment not found" });
    res.json({ message: "Allotment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
