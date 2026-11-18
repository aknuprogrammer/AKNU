const express = require("express");
const multer = require("multer");
const ExcelJS = require("exceljs");
const xlsx = require("xlsx"); // For .xls file support
const { parse: parseCSV } = require("csv-parse/sync");
const ResultBatch = require("../models/results/resultBatchSchema");
const RVResult = require("../models/results/rvResults");
const Result = require("../models/results/resultSchema");
const RegularAndBacklogResult = require("../models/results/rANDb");

const resultRouter = express.Router();

// ✅ Helper to insert in chunks to prevent timeouts
const chunkedInsert = async (Model, data, chunkSize = 5000) => {
  let totalInserted = 0;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    try {
      const result = await Model.insertMany(chunk, { ordered: false });
      totalInserted += result.length;
    } catch (err) {
      // If some records fail (e.g. duplicates), we still count the ones that succeeded
      if (err.insertedDocs) totalInserted += err.insertedDocs.length;
      else if (err.writeErrors) {
        // approx calculation if we have write errors but want to keep going
        totalInserted += (chunk.length - err.writeErrors.length);
      }
      console.error(`Chunk insertion partial failure: ${err.message}`);
    }
  }
  return totalInserted;
};

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  // file size limit removed (unlimited)
  fileFilter: (req, file, cb) => {
    // Check file extension
    const allowedExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = file.originalname
      .toLowerCase()
      .substring(file.originalname.lastIndexOf("."));

    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Only Excel (.xlsx, .xls) or CSV (.csv) files are allowed. Received: ${fileExtension}`
        ),
        false
      );
    }
  },
});

// ✅ Parse a CSV buffer into an array of row objects (same shape as xlsx sheet_to_json)
const parseCSVBuffer = (buffer) => {
  const records = parseCSV(buffer, {
    columns: true,       // use first row as header keys
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });
  return records;
};

// ✅ Helper function to handle RegisterNumber query (supports both string and number types)
const buildRegisterNumberQuery = (registerNumber) => {
  const clean = registerNumber.trim();

  // Optimized path for numeric Hall Ticket Numbers (very common)
  // Exact matching uses indices much more efficiently than case-insensitive regex
  if (/^\d+$/.test(clean)) {
    return {
      $or: [
        { RegisterNumber: clean }, // Match as string (exact)
        { RegisterNumber: Number(clean) }, // Match as number (exact)
      ],
    };
  }

  // Fallback for non-numeric or mixed Hall Ticket Numbers
  const reg = new RegExp(`^${clean}$`, "i");
  return { RegisterNumber: reg };
};

// ✅ check if row is empty
const isEmptyRow = (baseData) => {
  return (
    !baseData.RegisterNumber &&
    !baseData.StudentName &&
    !baseData.CourseName &&
    !baseData.SubjectName &&
    !baseData.Grade
  );
};

const ROMAN_SEMESTER_MAP = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
  IX: 9,
  X: 10,
  "1ST": 1,
  "2ND": 2,
  "3RD": 3,
  "4TH": 4,
  "5TH": 5,
  "6TH": 6,
  "7TH": 7,
  "8TH": 8,
};

// Robust semester parser that parses numbers, Roman numerals, words like "IV SEM", or extracts from title
const parseSemester = (sem, title = "") => {
  if (typeof sem === "number" && !isNaN(sem) && sem >= 1 && sem <= 16) {
    return sem;
  }

  const tryExtract = (input) => {
    if (input == null) return null;
    let str = "";
    if (typeof input === "object") {
      str = input.text ?? input.richText?.map((r) => r.text).join("") ?? input.toString();
    } else {
      str = input.toString();
    }
    str = str.trim();
    if (!str) return null;

    // Direct clean integer check
    if (/^\d+$/.test(str)) {
      const n = parseInt(str, 10);
      if (n >= 1 && n <= 16) return n;
    }

    // Roman numerals with optional semester/sem word or boundary (e.g. "IV Semester", "IV SEM", "IV", "III Sem")
    const romanMatch = str.match(/\b(VIII|VII|VI|IV|V|III|II|I|IX|X)\b/i);
    if (romanMatch) {
      const key = romanMatch[1].toUpperCase();
      if (ROMAN_SEMESTER_MAP[key]) return ROMAN_SEMESTER_MAP[key];
    }

    // "Semester 4", "Sem-4", "4th Semester", "4 Sem", "Sem 4"
    const digitMatch = str.match(/(?:sem(?:ester)?\s*[-:]?\s*(\d+))|(?:\b(\d+)(?:st|nd|rd|th)?\s*(?:sem|semester)\b)/i);
    if (digitMatch) {
      const n = parseInt(digitMatch[1] || digitMatch[2], 10);
      if (n >= 1 && n <= 16) return n;
    }

    // Fallback: any standalone digit between 1 and 16
    const anyDigit = str.match(/\b([1-9]|1[0-6])\b/);
    if (anyDigit) return parseInt(anyDigit[1], 10);

    return null;
  };

  const fromSem = tryExtract(sem);
  if (fromSem) return fromSem;

  const fromTitle = tryExtract(title);
  if (fromTitle) return fromTitle;

  return null;
};

// Compare two batches to determine which one is the most recent/latest result
const compareBatches = (batchA, batchB) => {
  const semA = parseSemester(batchA?.semester, batchA?.title) || 0;
  const semB = parseSemester(batchB?.semester, batchB?.title) || 0;

  const dateA = new Date(batchA?.resultDate || 0).getTime();
  const dateB = new Date(batchB?.resultDate || 0).getTime();

  const createdA = new Date(batchA?.createdAt || 0).getTime();
  const createdB = new Date(batchB?.createdAt || 0).getTime();

  // 1. If result publication dates differ significantly (> 30 days), newer date takes priority
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  if (Math.abs(dateB - dateA) > THIRTY_DAYS_MS) {
    return dateB - dateA;
  }

  // 2. If result dates are close (same release period / month):
  // Check if one was uploaded significantly later (> 7 days apart)
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  if (Math.abs(createdB - createdA) > SEVEN_DAYS_MS) {
    return createdB - createdA;
  }

  // 3. For batches in the same exam release / upload cycle (e.g. Sep 2026 Instant IV Sem vs Instant III Sem):
  // Higher semester MUST come first on top! (e.g. IV > III)
  if (semB !== semA) {
    return semB - semA;
  }

  // 4. Same semester and same cycle: newer upload timestamp wins (e.g. Instant/RV over older Regular)
  if (createdB !== createdA) {
    return createdB - createdA;
  }

  return dateB - dateA;
};

resultRouter.post(
  "/upload",
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {

        return res.status(400).json({
          error: "File upload error",
          details: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          error: "File validation error",
          details: err.message,
        });
      }
      next();
    });
  },
  async (req, res) => {
  try {
    const fileBuffer = req.file?.buffer;
    if (!fileBuffer) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    

    const { Level, ResultTitle, ResultDate, ResultType } = req.body;
    if (!Level || !ResultTitle || !ResultDate || !ResultType) {
      return res.status(400).json({
        error: "Missing Level, ResultTitle, ResultDate, or ResultType",
      });
    }

    const normalizeSemester = (sem) => parseSemester(sem, ResultTitle);

    // ── CSV branch ────────────────────────────────────────────────────────────
    const fileExt = (req.file?.originalname || "").toLowerCase().split(".").pop();
    if (fileExt === "csv") {
      let csvRows;
      try {
        csvRows = parseCSVBuffer(fileBuffer);
      } catch (csvErr) {
        return res.status(400).json({
          error: "Failed to parse CSV file",
          details: csvErr.message,
          suggestion: "Ensure the CSV uses comma delimiters and has a header row.",
        });
      }

      if (!csvRows || csvRows.length === 0) {
        return res.status(400).json({ error: "CSV file is empty or has no data rows" });
      }

      // Normalise header keys to lowercase-no-spaces for matching
      const normaliseKey = (k) => k?.toLowerCase().replace(/\s+/g, "");

      const getVal = (row, ...keys) => {
        for (const key of keys) {
          const normKey = normaliseKey(key);
          const found = Object.keys(row).find((k) => normaliseKey(k) === normKey);
          if (found && row[found] !== undefined && row[found] !== "") return row[found].trim ? row[found].trim() : row[found];
        }
        return null;
      };

      // Detect semester from first few data rows or fallback to ResultTitle
      let rawSem = null;
      for (const row of csvRows.slice(0, 10)) {
        rawSem = getVal(row, "Semester", "semester", "sem", "Sem");
        if (rawSem) break;
      }
      const detectedSemester = parseSemester(rawSem, ResultTitle);

      const batchData = {
        level: Level.toUpperCase(),
        title: ResultTitle,
        resultDate: new Date(ResultDate),
        type: ResultType,
        semester: detectedSemester || null,
        createdAt: new Date(),
      };
      const batch = await ResultBatch.create(batchData);

      const resultsToInsert = [];
      const uniqueKeys = new Set();

      for (const row of csvRows) {
        const baseData = {
          RegisterNumber: getVal(row, "RegisterNumber", "Register Number", "Student Regdno", "Regd No", "RegNo", "regno"),
          StudentName: getVal(row, "StudentName", "Student Name", "name", "Name"),
          CourseName: getVal(row, "CourseName", "Course Name", "course", "Course"),
          Semester: normalizeSemester(getVal(row, "Semester", "semester", "sem") || detectedSemester),
          SubjectName: getVal(row, "SubjectName", "Subject Name", "subject", "Subject"),
          Grade: getVal(row, "Grade", "grade", "Grade Obtained"),
          batchId: batch._id,
          SubjectOrder: getVal(row, "SubjectOrder", "Subject Order") || null,
          createdAt: new Date(),
        };

        if (!baseData.RegisterNumber || !baseData.CourseName || !baseData.SubjectName || !baseData.Grade) {
          console.warn("❌ Skipping incomplete CSV row:", baseData);
          continue;
        }

        const uniqueKey = `${baseData.RegisterNumber}|${baseData.CourseName}|${baseData.Semester}|${baseData.SubjectName}`;
        if (uniqueKeys.has(uniqueKey)) continue;
        uniqueKeys.add(uniqueKey);

        resultsToInsert.push(baseData);
      }

      if (resultsToInsert.length === 0) {
        return res.status(400).json({
          error: "No valid rows found in CSV",
          suggestion: "Ensure the CSV has columns: RegisterNumber, CourseName, SubjectName, Grade",
        });
      }

      try {
        let insertedCount;
        if (ResultType === "rv") {
          insertedCount = await chunkedInsert(RVResult, resultsToInsert);
        } else if (ResultType === "rANDb") {
          insertedCount = await chunkedInsert(RegularAndBacklogResult, resultsToInsert);
        } else {
          insertedCount = await chunkedInsert(Result, resultsToInsert);
        }
        return res.status(200).json({
          message: "CSV upload successful",
          batchId: batch._id,
          insertedCount,
          type: ResultType,
        });
      } catch (insertErr) {
        console.error("❌ CSV insertion error:", insertErr.message);
        return res.status(500).json({ error: "Insert failed", details: insertErr.message });
      }
    }
    // ── End CSV branch ────────────────────────────────────────────────────────

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);
    const sheet = workbook.worksheets[0];
    const row1Values = sheet.getRow(1).values;

    // Robust header detection
    const looksLikeHeaders = (values) => {
      const headerKeywords = ["reg", "name", "course", "subject", "grade", "sem"];
      return values.some(
        (v) =>
          v &&
          headerKeywords.some((k) =>
            v.toString().toLowerCase().includes(k)
          )
      );
    };

    let startRow = 2;
    let headers = [];

    // If row 1 doesn't look like headers and first cell looks like a Register Number
    if (
      !looksLikeHeaders(row1Values) &&
      /^\d{10,14}$/.test(row1Values[1]?.toString()?.trim())
    ) {
      console.log("⚠️ Row 1 looks like data. Using positional fallback.");
      startRow = 1;
      // Define standard layout based on user's sample
      headers = [
        null,
        "RegisterNumber",
        "StudentName",
        "CourseName",
        "Semester",
        "SubjectName",
        "Grade",
        "SubjectOrder",
      ];
    } else {
      headers = row1Values.map((cell) =>
        typeof cell === "object" ? cell.text?.trim() : cell?.toString()?.trim()
      );
    }

    const semesterCol = headers.findIndex((h) =>
      h?.toLowerCase()?.includes("semester")
    );

    let detectedSemester = null;
    if (semesterCol >= 0) {
      for (let r = startRow; r <= Math.min(sheet.rowCount, startRow + 10); r++) {
        const rowVals = sheet.getRow(r).values;
        const semesterValue = rowVals[semesterCol];
        if (semesterValue) {
          detectedSemester = parseSemester(semesterValue, ResultTitle);
          if (detectedSemester) break;
        }
      }
    }
    if (!detectedSemester) {
      detectedSemester = parseSemester(null, ResultTitle);
    }

    const batchData = {
      level: Level.toUpperCase(),
      title: ResultTitle,
      resultDate: new Date(ResultDate),
      type: ResultType,
      semester: detectedSemester || null,
      createdAt: new Date(),
    };

    const batch = await ResultBatch.create(batchData);

    const resultsToInsert = [];
    const uniqueKeys = new Set();

    for (let i = startRow; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i).values;
      const rowData = {};

      for (let j = 1; j < headers.length; j++) {
        const key = headers[j];
        if (!key) continue;

        let value = row[j];

        if (value instanceof Date) {
          // keep date as-is
        } else if (typeof value === "object" && value !== null) {
          value = value.text?.toString().trim() || JSON.stringify(value);
        } else if (typeof value === "string") {
          value = value.trim(); // Keep original case, don't force lowercase
        }

        // Store with normalized key (trimmed, original case)
        const normalizedKey = key.trim();
        rowData[normalizedKey] = value;
        // Also store with lowercase key for case-insensitive lookup
        rowData[normalizedKey.toLowerCase()] = value;
      }

      const rowSemester =
        semesterCol >= 0
          ? normalizeSemester(row[semesterCol])
          : detectedSemester;

      // Helper function for case-insensitive lookup
      const getValue = (keys) => {
        for (const key of keys) {
          // Try original case first
          if (
            rowData[key] !== undefined &&
            rowData[key] !== null &&
            rowData[key] !== ""
          ) {
            return rowData[key];
          }
          // Try lowercase
          const lowerKey = key.toLowerCase();
          if (
            rowData[lowerKey] !== undefined &&
            rowData[lowerKey] !== null &&
            rowData[lowerKey] !== ""
          ) {
            return rowData[lowerKey];
          }
        }
        return null;
      };

      console.log("___rowData", rowData);
      const baseData = {
        RegisterNumber: getValue([
          "RegisterNumber",
          "Register Number",
          "register number",
          "Student Regdno",
          "student regdno",
          "Student RegdNo",
          "student_regdno",
          "student-regdno",
          "registernumber",
          "Regd No",
          "regno",
          "RegNo",
          "reg_no",
          "reg-no",
          "reg number",
        ]),

        StudentName: getValue([
          "StudentName",
          "Student Name",
          "student name",
          "studentname",
          "student Name",
          "student_name",
          "student-name",
          "name",
          "Name",
        ]),

        CourseName: getValue([
          "CourseName",
          "Course Name",
          "course name",
          "coursename",
          "course",
          "Course",
          "course_name",
          "course-name",
        ]),

        Semester: normalizeSemester(
          getValue([
            "Semester",
            "semester",
            "sem",
            "Sem",
            "semeter",
            "sem_no",
            "sem-no",
            "sem no",
          ]) || detectedSemester
        ),

        SubjectName: getValue([
          "SubjectName",
          "Subject Name",
          "subject name",
          "subject Name",
          "subjectname",
          "subject_name",
          "subject-name",
          "subject",
          "Subject",
        ]),

        Grade: getValue([
          "Grade",
          "grade",
          "Grade Obtained",
          "grade obtained",
          "grade Obtained",
          "grade_obtained",
          "grade-obtained",
        ]),

        batchId: batch._id,
        SubjectOrder:
          getValue([
            "SubjectOrder",
            "subject order",
            "subjectorder",
            "Subject Order",
          ]) || null,
        createdAt: new Date(),
      };

      const uniqueKey = `${baseData.RegisterNumber}|${baseData.CourseName}|${baseData.Semester}|${baseData.SubjectName}`;
      if (uniqueKeys.has(uniqueKey)) continue;
      uniqueKeys.add(uniqueKey);

      if (
        !baseData.RegisterNumber ||
        !baseData.CourseName ||
        !baseData.SubjectName ||
        !baseData.Grade
      ) {
        console.warn("❌ Skipping incomplete row:", baseData);
        continue;
      }

      const meta = {};
      for (const key in rowData) {
        if (!Object.keys(baseData).includes(key)) {
          meta[key] = rowData[key];
        }
      }

      resultsToInsert.push({ ...baseData, meta });
    }
    if (resultsToInsert.length === 0) {
      console.log("⚠️ No valid rows to insert");
      return res.status(400).json({
        error: "No valid rows found in Excel file",
        suggestion:
          "Please verify that your Excel file has the correct headers (RegisterNumber, StudentName, CourseName, Semester, SubjectName, Grade) and that the data starts from row 2.",
      });
    }

    try {
      let insertedCount;
      if (ResultType === "rv") {
        insertedCount = await chunkedInsert(RVResult, resultsToInsert);
      } else if (ResultType === "rANDb") {
        insertedCount = await chunkedInsert(RegularAndBacklogResult, resultsToInsert);
      } else {
        insertedCount = await chunkedInsert(Result, resultsToInsert);
      }

      res.status(200).json({
        message: "Upload successful",
        batchId: batch._id,
        insertedCount,
        type: ResultType,
      });
    } catch (err) {
      console.error("❌ insertion error:", err.message);
      res.status(500).json({ error: "Insert failed", details: err.message });
    }
  } catch (err) {
    console.error("❌ Upload failed:", err.message);
    res.status(400).json({
      error: "Failed to process upload",
      details: err.message || "The file might be corrupted or invalid.",
    });
  }
});

resultRouter.post(
  "/upload-rv",
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {

        return res.status(400).json({
          error: "File upload error",
          details: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          error: "File validation error",
          details: err.message,
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const fileBuffer = req.file?.buffer;
      if (!fileBuffer) {
        console.log("NO BUFFER");

        return res.status(400).json({ error: "No file uploaded" });
      }

      const {
        Level,
        ResultTitle,
        ResultDate,
        Semester: bodySemester,
      } = req.body;
      if (!Level || !ResultTitle || !ResultDate) {
        console.log(
          "_____missing fields",
          Level,
          ResultTitle,
          ResultDate,
          bodySemester
        );
        return res
          .status(400)
          .json({ error: "Missing Level, ResultTitle, or ResultDate" });
      }

      const normalizeSemester = (sem) => parseSemester(sem, ResultTitle);

      // Helper to safely get cell text
      const getCellText = (cell) => {
        if (cell == null || cell === undefined) return null;
        if (typeof cell === "object") {
          return (
            cell.text ??
            cell.richText?.map((rt) => rt.text).join("") ??
            cell.toString().trim()
          );
        }
        return cell.toString().trim();
      };

      // Extract file extension from filename
      const fileName = req.file?.originalname || "";
      const fileExtension = fileName
        .toLowerCase()
        .substring(fileName.lastIndexOf("."));

      // Handle .xls files using xlsx library (SheetJS) - ExcelJS doesn't support .xls well
      if (fileExtension === ".xls") {
        try {
          console.log("Processing .xls file using xlsx library");
          const workbook = xlsx.read(fileBuffer, { type: "buffer" });

          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            return res.status(400).json({
              error: "Excel file contains no worksheets",
              suggestion:
                "Please ensure the Excel file has at least one sheet with data",
            });
          }

          const sheetName = workbook.SheetNames[0];
          const xlsxSheet = workbook.Sheets[sheetName];

          // Convert to JSON format for easier processing
          const jsonData = xlsx.utils.sheet_to_json(xlsxSheet, {
            header: 1,
            defval: null,
          });

          if (!jsonData || jsonData.length === 0) {
            return res.status(400).json({
              error: "Excel file is empty",
              suggestion: "Please ensure the Excel file contains data",
            });
          }

          // Extract headers from first row
          const headerRow = jsonData[0] || [];
          const headers = {};
          headerRow.forEach((header, index) => {
            const headerText = getCellText(header)
              ?.toLowerCase()
              .replace(/\s+/g, "");
            if (headerText) {
              headers[headerText] = index; // Array index (0-based)
            }
          });

          console.log("Detected headers from .xls:", headers);

          // Detect semester from second row
          let detectedSemester = null;
          if (jsonData[1] && headers["semester"] !== undefined) {
            detectedSemester = normalizeSemester(
              jsonData[1][headers["semester"]]
            );
          }

          const finalSemester =
            detectedSemester || normalizeSemester(bodySemester);
          if (!finalSemester || finalSemester < 1 || finalSemester > 10) {
            return res
              .status(400)
              .json({ error: "Semester is required and must be 1–10" });
          }

          // Create batch
          const batch = await ResultBatch.create({
            level: Level.toUpperCase(),
            title: ResultTitle,
            resultDate: new Date(ResultDate),
            type: "rv",
            semester: finalSemester,
            createdAt: new Date(),
          });

          const resultsToInsert = [];
          const uniqueKeys = new Set();

          // Process rows starting from index 1 (row 2)
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];

            // Skip empty rows
            if (!row || row.every((cell) => cell == null || cell === ""))
              continue;

            const baseData = {
              RegisterNumber:
                headers["registernumber"] !== undefined
                  ? getCellText(row[headers["registernumber"]])
                  : null,
              CourseName:
                headers["coursename"] !== undefined
                  ? getCellText(row[headers["coursename"]])
                  : null,
              Semester:
                headers["semester"] !== undefined
                  ? normalizeSemester(getCellText(row[headers["semester"]])) ||
                    finalSemester
                  : finalSemester,
              SubjectName:
                headers["subjectname"] !== undefined
                  ? getCellText(row[headers["subjectname"]])
                  : null,
              Grade:
                headers["grade"] !== undefined
                  ? getCellText(row[headers["grade"]])
                  : null,
              batchId: batch._id,
              createdAt: new Date(),
            };

            // Skip rows missing required fields
            if (
              !baseData.RegisterNumber ||
              !baseData.CourseName ||
              !baseData.SubjectName ||
              !baseData.Grade
            )
              continue;

            const uniqueKey = `${baseData.RegisterNumber}|${baseData.CourseName}|${baseData.Semester}|${baseData.SubjectName}`;
            if (uniqueKeys.has(uniqueKey)) continue;
            uniqueKeys.add(uniqueKey);

            resultsToInsert.push(baseData);
          }

          if (resultsToInsert.length === 0)
            return res
              .status(400)
              .json({ error: "No valid RV rows to insert" });

          const inserted = await RVResult.insertMany(resultsToInsert, {
            ordered: false,
          });

          const insertedCount = await chunkedInsert(RVResult, resultsToInsert);

          return res.status(200).json({
            message: "RV results uploaded successfully",
            batchId: batch._id,
            insertedCount,
          });
        } catch (xlsError) {
          console.error("Error processing .xls file:", xlsError);
          return res.status(400).json({
            error: "Failed to parse .xls file",
            details: xlsError.message || "The .xls file may be corrupted",
            suggestion: "Please ensure the file is a valid Excel .xls file",
          });
        }
      }

      // Load .xlsx Excel file with better error handling using ExcelJS
      const workbook = new ExcelJS.Workbook();
      try {
        await workbook.xlsx.load(fileBuffer);
      } catch (excelError) {
        console.error("Excel loading error:", excelError);
        console.error("Error details:", {
          message: excelError.message,
          stack: excelError.stack,
          bufferLength: fileBuffer.length,
          fileName: req.file.originalname,
        });

        return res.status(400).json({
          error: "Failed to parse Excel file",
          details:
            excelError.message ||
            "The uploaded file may be corrupted or not a valid Excel file",
          suggestion:
            "Please ensure the file is a valid .xlsx or .xls file and try again",
        });
      }

      // Validate workbook has worksheets
      if (!workbook.worksheets || workbook.worksheets.length === 0) {
        return res.status(400).json({
          error: "Excel file contains no worksheets",
          suggestion:
            "Please ensure the Excel file has at least one sheet with data",
        });
      }

      const sheet = workbook.worksheets[0];
      if (!sheet) {
        return res.status(400).json({
          error: "Failed to access the first worksheet",
          suggestion: "Please ensure the Excel file has a valid worksheet",
        });
      }

      const row1Values = sheet.getRow(1).values;

      // Robust header detection
      const looksLikeHeaders = (values) => {
        const headerKeywords = ["reg", "name", "course", "subject", "grade", "sem"];
        return values.some(
          (v) =>
            v &&
            headerKeywords.some((k) =>
              v.toString().toLowerCase().includes(k)
            )
        );
      };

      let startRow = 2;
      let headers = {};

      if (
        !looksLikeHeaders(row1Values) &&
        /^\d{10,14}$/.test(row1Values[1]?.toString()?.trim())
      ) {
        console.log("⚠️ Row 1 looks like data. Using positional fallback.");
        startRow = 1;
        headers = {
          registernumber: 1,
          studentname: 2,
          coursename: 3,
          semester: 4,
          subjectname: 5,
          grade: 6,
        };
      } else {
        const headerRow = sheet.getRow(1);
        headerRow.eachCell((cell, colNumber) => {
          const headerText = getCellText(cell)?.toLowerCase().replace(/\s+/g, "");
          if (headerText) headers[headerText] = colNumber;
        });
      }

      console.log("Detected headers:", headers);

      // Detect semester
      const firstDataRow = sheet.getRow(startRow);
      let detectedSemester = null;
      if (headers["semester"]) {
        detectedSemester = normalizeSemester(
          getCellText(firstDataRow.getCell(headers["semester"]).value)
        );
      }

      const finalSemester = detectedSemester || normalizeSemester(bodySemester);

      if (!finalSemester || finalSemester < 1 || finalSemester > 10) {
        console.log(
          "_____invalid semester",
          finalSemester,
          "from:",
          bodySemester
        );
        return res.status(400).json({
          error:
            "Invalid semester. Must be 1-10 (Arabic) or I-X (Roman numerals)",
        });
      }

      // Create batch
      const batch = await ResultBatch.create({
        level: Level.toUpperCase(),
        title: ResultTitle,
        resultDate: new Date(ResultDate),
        type: "rv",
        semester: finalSemester,
        createdAt: new Date(),
      });

      const resultsToInsert = [];
      const uniqueKeys = new Set();

      // Iterate all rows starting from startRow
      for (let i = startRow; i <= sheet.rowCount; i++) {
        const row = sheet.getRow(i);

        // console.log(getCellText(row.getCell(headers["coursename"]).value));
        // Skip empty rows
        if (row.cellCount === 0 || row.values.every((v) => v == null)) continue;

        const baseData = {
          RegisterNumber: headers["registernumber"]
            ? getCellText(row.getCell(headers["registernumber"]).value)
            : null,
          CourseName: headers["coursename"]
            ? getCellText(row.getCell(headers["coursename"]).value)
            : null,
          Semester: headers["semester"]
            ? normalizeSemester(
                getCellText(row.getCell(headers["semester"]).value)
              ) || finalSemester
            : finalSemester,
          SubjectName: headers["subjectname"]
            ? getCellText(row.getCell(headers["subjectname"]).value)
            : null,
          Grade: headers["grade"]
            ? getCellText(row.getCell(headers["grade"]).value)
            : null,
          batchId: batch._id,
          createdAt: new Date(),
        };

        // Skip rows missing required fields
        if (
          !baseData.RegisterNumber ||
          !baseData.CourseName ||
          !baseData.SubjectName ||
          !baseData.Grade
        )
          continue;

        const uniqueKey = `${baseData.RegisterNumber}|${baseData.CourseName}|${baseData.Semester}|${baseData.SubjectName}`;
        if (uniqueKeys.has(uniqueKey)) continue;
        uniqueKeys.add(uniqueKey);

        resultsToInsert.push(baseData);
      }

      if (resultsToInsert.length === 0)
        return res.status(400).json({ error: "No valid RV rows to insert" });

      const insertedCount = await chunkedInsert(RVResult, resultsToInsert);

      res.status(200).json({
        message: "RV results uploaded successfully",
        batchId: batch._id,
        insertedCount,
      });
    } catch (err) {
      console.error("❌ RV upload failed:", err);
      res
        .status(500)
        .json({ error: "Server error during RV upload", details: err.message });
    }
  }
);

resultRouter.get("/all-batches", async (req, res) => {
  try {
    const batches = await ResultBatch.find({}, { __v: 0 });
    res.status(200).json({ data: batches });
  } catch (err) {
    console.error("Error fetching batches:", err);
    res.status(500).json({ error: "Server error" });
  }
});

resultRouter.get("/get-results", async (req, res) => {
  try {
    const { RegisterNumber, Semester, level, title, date } = req.query;

    if (!RegisterNumber || !level || !title || !date) {
      console.log("________");
      return res.status(400).json({
        error:
          "Missing required params: RegisterNumber, Semester, level, title, date",
      });
    }

    // Find the batch
    const batch = await ResultBatch.findOne({
      level: level.toUpperCase(),
      title,
      resultDate: new Date(date),
    });
    if (!batch) {
      return res
        .status(404)
        .json({ error: "Batch not found for the provided details" });
    }

    // Get results for that batch
    const registerNumberQuery = buildRegisterNumberQuery(RegisterNumber);
    const results = await Result.find({
      ...registerNumberQuery,
      // Semester,
      batchId: batch._id,
    }).populate("batchId", "-_id -__v");
    if (!results.length) {
      return res
        .status(404)
        .json({ error: "No results found for the provided details" });
    }

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (err) {
    console.error("GET /get-results error:", err);
    res.status(500).json({ error: "Server error fetching results" });
  }
});

// resultRouter.get("/batch/:batchId", async (req, res) => {
//   try {
//     const { batchId } = req.params;

//     if (!batchId) {
//       return res.status(400).json({
//         success: false,
//         error: "Batch ID is required",
//       });
//     }

//     const batch = await ResultBatch.findById(batchId).select(
//       "title level resultDate"
//     );

//     console.log("_____batch", batch);
//     if (!batch) {
//       return res.status(404).json({
//         success: false,
//         error: "Batch not found",
//       });
//     }

//     // Fetch from both collections
//     const [results, rvResults] = await Promise.all([
//       Result.find({ batchId })
//         .select("-__v -meta -_id")
//         .populate("batchId", "title level resultDate"),
//       RVResult.find({ batchId })
//         .select("-__v -meta -_id")
//         .populate("batchId", "title level resultDate"),
//     ]);

//     console.log("______rvResults", rvResults);
//     if (!results.length && !rvResults.length) {
//       return res.status(404).json({
//         success: false,
//         error: "No results found in either Result or RvResult for this batch",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: {
//         batch,
//         results,
//         rvResults,
//         totalResults: results.length,
//         totalRvResults: rvResults.length,
//         total: results.length + rvResults.length,
//       },
//     });
//   } catch (err) {
//     console.error("Error fetching batch results:", err);
//     res.status(500).json({
//       success: false,
//       error: "Server error fetching batch results",
//     });
//   }
// });

resultRouter.get("/batch/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        error: "Batch ID is required",
      });
    }

    // ✅ Check batch exists
    const batch = await ResultBatch.findById(batchId).select(
      "title level resultDate"
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: "Batch not found",
      });
    }

    // ✅ Fetch results from all collections
    const [results, rvResults, regularBacklogResults] = await Promise.all([
      Result.find({ batchId })
        .select("-__v -meta -_id")
        .populate("batchId", "title level resultDate"),
      RVResult.find({ batchId })
        .select("-__v -meta -_id")
        .populate("batchId", "title level resultDate"),
      RegularAndBacklogResult.find({ batchId })
        .select("-__v -meta -_id")
        .populate("batchId", "title level resultDate"),
    ]);

    // ✅ Combine all results into a single array for frontend compatibility
    // This ensures the frontend gets all results without needing code changes
    const allResults = [
      ...(Array.isArray(results) ? results : []),
      ...(Array.isArray(rvResults) ? rvResults : []),
      ...(Array.isArray(regularBacklogResults) ? regularBacklogResults : []),
    ];

    // ✅ If nothing found
    if (allResults.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No results found for this batch",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        batch,
        // Put all results in the 'results' array so frontend doesn't need changes
        results: allResults,
        // Also include separate arrays for backward compatibility
        rvResults,
        regularBacklogResults,
        totalResults: results.length,
        totalRvResults: rvResults.length,
        totalRegularBacklog: regularBacklogResults.length,
        total: allResults.length,
      },
    });
  } catch (err) {
    console.error("Error fetching batch results:", err);
    res.status(500).json({
      success: false,
      error: "Server error fetching batch results",
    });
  }
});

// Delete a batch and its results
resultRouter.delete("/batch/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;

    // Delete all results from ALL three collections
    const [regularDeleted, rvDeleted, rabDeleted] = await Promise.all([
      Result.deleteMany({ batchId }),
      RVResult.deleteMany({ batchId }),
      RegularAndBacklogResult.deleteMany({ batchId }),
    ]);

    // Then delete the batch
    const deletedBatch = await ResultBatch.findByIdAndDelete(batchId);

    if (!deletedBatch) {
      return res.status(404).json({
        success: false,
        error: "Batch not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Batch and all its results deleted successfully",
      deletedCounts: {
        regularResults: regularDeleted.deletedCount,
        rvResults: rvDeleted.deletedCount,
        regularAndBacklogResults: rabDeleted.deletedCount,
        total: regularDeleted.deletedCount + rvDeleted.deletedCount + rabDeleted.deletedCount,
      },
    });
  } catch (err) {
    console.error("Error deleting batch:", err);
    res.status(500).json({
      success: false,
      error: "Server error deleting batch",
    });
  }
});

// resultRouter.get("/latest-result", async (req, res) => {
//   try {
//     const { RegisterNumber } = req.query;
//     if (!RegisterNumber) {
//       return res.status(400).json({
//         success: false,
//         error: "RegisterNumber is required",
//       });
//     }

//     // Fetch latest result from all collections: Regular, RV, and RegularAndBacklog
//     const [latestRegular, latestRV, latestRegularAndBacklog] =
//       await Promise.all([
//         Result.findOne({ RegisterNumber })
//           .populate("batchId")
//           .sort({ "batchId.resultDate": -1 })
//           .lean(),
//         RVResult.findOne({ RegisterNumber })
//           .populate("batchId")
//           .sort({ "batchId.resultDate": -1 })
//           .lean(),
//         RegularAndBacklogResult.findOne({ RegisterNumber })
//           .populate("batchId")
//           .sort({ "batchId.resultDate": -1 })
//           .lean(),
//       ]);

//     console.log("latestRegular", latestRegular);
//     console.log("latestRV", latestRV);
//     console.log("latestRegularAndBacklog", latestRegularAndBacklog);

//     // Compare batch dates and determine which result to consider
//     let latestBatch = null;
//     let type = null;

//     // Determine which collection has the latest result
//     if (latestRegular && latestRV && latestRegularAndBacklog) {
//       const rDate = new Date(latestRegular.batchId?.resultDate || 0);
//       const rvDate = new Date(latestRV.batchId?.resultDate || 0);
//       const rabDate = new Date(
//         latestRegularAndBacklog.batchId?.resultDate || 0
//       );

//       if (rDate >= rvDate && rDate >= rabDate) {
//         latestBatch = latestRegular.batchId;
//         type = "regular";
//       } else if (rvDate >= rDate && rvDate >= rabDate) {
//         latestBatch = latestRV.batchId;
//         type = "rv";
//       } else {
//         latestBatch = latestRegularAndBacklog.batchId;
//         type = "regularAndBacklog";
//       }
//     } else if (latestRegular && latestRV) {
//       const rDate = new Date(latestRegular.batchId?.resultDate || 0);
//       const rvDate = new Date(latestRV.batchId?.resultDate || 0);
//       if (rDate >= rvDate) {
//         latestBatch = latestRegular.batchId;
//         type = "regular";
//       } else {
//         latestBatch = latestRV.batchId;
//         type = "rv";
//       }
//     } else if (latestRegular && latestRegularAndBacklog) {
//       const rDate = new Date(latestRegular.batchId?.resultDate || 0);
//       const rabDate = new Date(
//         latestRegularAndBacklog.batchId?.resultDate || 0
//       );
//       if (rDate >= rabDate) {
//         latestBatch = latestRegular.batchId;
//         type = "regular";
//       } else {
//         latestBatch = latestRegularAndBacklog.batchId;
//         type = "regularAndBacklog";
//       }
//     } else if (latestRV && latestRegularAndBacklog) {
//       const rvDate = new Date(latestRV.batchId?.resultDate || 0);
//       const rabDate = new Date(
//         latestRegularAndBacklog.batchId?.resultDate || 0
//       );
//       if (rvDate >= rabDate) {
//         latestBatch = latestRV.batchId;
//         type = "rv";
//       } else {
//         latestBatch = latestRegularAndBacklog.batchId;
//         type = "regularAndBacklog";
//       }
//     } else if (latestRegular) {
//       latestBatch = latestRegular.batchId;
//       type = "regular";
//     } else if (latestRV) {
//       latestBatch = latestRV.batchId;
//       type = "rv";
//     } else if (latestRegularAndBacklog) {
//       latestBatch = latestRegularAndBacklog.batchId;
//       type = "regularAndBacklog";
//     }

//     if (!latestBatch) {
//       return res.status(404).json({
//         success: false,
//         error: "No result found for this RegisterNumber",
//       });
//     }

//     // Fetch all records with the same RegisterNumber and batchId from all collections
//     const [allRegularResults, allRVResults, allRegularAndBacklogResults] =
//       await Promise.all([
//         Result.find({ RegisterNumber, batchId: latestBatch._id })
//           .populate("batchId")
//           .lean(),
//         RVResult.find({ RegisterNumber, batchId: latestBatch._id })
//           .populate("batchId")
//           .lean(),
//         RegularAndBacklogResult.find({
//           RegisterNumber,
//           batchId: latestBatch._id,
//         })
//           .populate("batchId")
//           .lean(),
//       ]);

//     res.status(200).json({
//       success: true,
//       data: {
//         type,
//         batchId: latestBatch._id,
//         batch: latestBatch,
//         regularResults: allRegularResults,
//         rvResults: allRVResults,
//         regularAndBacklogResults: allRegularAndBacklogResults,
//       },
//     });
//   } catch (err) {
//     console.error("Error fetching latest result batch:", err);
//     res.status(500).json({
//       success: false,
//       error: "Server error fetching latest result",
//     });
//   }
// });

resultRouter.get("/latest-result", async (req, res) => {
  try {
    const { RegisterNumber } = req.query;

    if (!RegisterNumber) {
      return res.status(400).json({
        success: false,
        error: "RegisterNumber is required",
      });
    }

    const registerNumberQuery = buildRegisterNumberQuery(RegisterNumber);

    // Step 1: Find all records across collections to determine the latest progress
    const [allRegular, allRV, allRAB] = await Promise.all([
      Result.find(registerNumberQuery).populate("batchId").lean(),
      RVResult.find(registerNumberQuery).populate("batchId").lean(),
      RegularAndBacklogResult.find(registerNumberQuery)
        .populate("batchId")
        .lean(),
    ]);

    const allRecords = [...allRegular, ...allRV, ...allRAB].filter(
      (r) => r.batchId && r.batchId._id
    );

    if (!allRecords.length) {
      return res.status(404).json({
        success: false,
        error: "No result found for this RegisterNumber",
      });
    }

    // Group records strictly by batchId so batches are NEVER mixed together
    const batchMap = new Map();

    const addToBatch = (record, key) => {
      if (!record.batchId?._id) return;
      const bId = record.batchId._id.toString();
      if (!batchMap.has(bId)) {
        // Resolve normalized semester dynamically from batch semester or title
        const normalizedSem = parseSemester(record.batchId.semester, record.batchId.title);
        if (normalizedSem) {
          record.batchId.semester = normalizedSem;
        }
        batchMap.set(bId, {
          batch: record.batchId,
          regularResults: [],
          rvResults: [],
          regularAndBacklogResults: [],
        });
      }
      batchMap.get(bId)[key].push(record);
    };

    allRegular.forEach((r) => addToBatch(r, "regularResults"));
    allRV.forEach((r) => addToBatch(r, "rvResults"));
    allRAB.forEach((r) => addToBatch(r, "regularAndBacklogResults"));

    // Sort batches to find the single most recently published / uploaded result batch
    const sortedBatches = Array.from(batchMap.values()).sort((a, b) => {
      return compareBatches(a.batch, b.batch);
    });

    const latestBatchEntry = sortedBatches[0];
    const latestBatchId = latestBatchEntry.batch._id.toString();

    res.json({
      success: true,
      data: {
        type: latestBatchEntry.batch.type,
        batch: latestBatchEntry.batch,
        regularResults: latestBatchEntry.regularResults,
        rvResults: latestBatchEntry.rvResults,
        regularAndBacklogResults: latestBatchEntry.regularAndBacklogResults,
        currentBatchId: latestBatchId,
        allCurrentBatchIds: [latestBatchId],
      },
    });
  } catch (err) {
    console.error("Server error fetching latest result:", err);
    res.status(500).json({
      success: false,
      error: "Server error fetching latest result",
    });
  }
});

const path = require("path");
const PDFDocument = require("pdfkit");
resultRouter.get("/latest-result-pdf", async (req, res) => {
  try {
    const { RegisterNumber } = req.query;
    if (!RegisterNumber)
      return res.status(400).send("RegisterNumber is required");

    const registerNumberQuery = buildRegisterNumberQuery(RegisterNumber);
    const [allRegular, allRV, allRAB] = await Promise.all([
      Result.find(registerNumberQuery).populate("batchId").lean(),
      RVResult.find(registerNumberQuery).populate("batchId").lean(),
      RegularAndBacklogResult.find(registerNumberQuery)
        .populate("batchId")
        .lean(),
    ]);

    const allRecords = [...allRegular, ...allRV, ...allRAB].filter(
      (r) => r.batchId && r.batchId._id
    );

    if (!allRecords.length) return res.status(404).send("No result found");

    const batchMap = new Map();
    const addToBatch = (record, key) => {
      if (!record.batchId?._id) return;
      const bId = record.batchId._id.toString();
      if (!batchMap.has(bId)) {
        const normalizedSem = parseSemester(record.batchId.semester, record.batchId.title);
        if (normalizedSem) {
          record.batchId.semester = normalizedSem;
        }
        batchMap.set(bId, {
          batch: record.batchId,
          regularResults: [],
          rvResults: [],
          regularAndBacklogResults: [],
        });
      }
      batchMap.get(bId)[key].push(record);
    };

    allRegular.forEach((r) => addToBatch(r, "regularResults"));
    allRV.forEach((r) => addToBatch(r, "rvResults"));
    allRAB.forEach((r) => addToBatch(r, "regularAndBacklogResults"));

    const sortedBatches = Array.from(batchMap.values()).sort((a, b) => {
      return compareBatches(a.batch, b.batch);
    });

    const latest = sortedBatches[0];
    const latestBatch = latest.batch;
    const allRegularResults = latest.regularResults;
    const allRVResults = latest.rvResults;
    const allRegularAndBacklogResults = latest.regularAndBacklogResults;
    const type = latestBatch.type;

    const doc = new PDFDocument({ size: "A4", margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=${RegisterNumber}_Result.pdf`
    );
    doc.pipe(res);

    const pageWidth = doc.page.width;
    let y = 20;
    const primaryColor = "#2B7870";
    const secondaryColor = "#21605A";
    const accentColor = "#F0F5F4";

    // --- HEADER ---
    const logoPathLeft = path.join(__dirname, "../assets/aknu-logo_new.png");
    const logoPathRight = path.join(__dirname, "../assets/aknu-adikavi.png");

    doc.image(logoPathLeft, 40, y, { width: 45, height: 45 });
    doc.image(logoPathRight, pageWidth - 40 - 45, y, { width: 45, height: 45 });

    doc
      .fillColor(primaryColor)
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("ADIKAVI NANNAYA UNIVERSITY", 0, y + 10, { align: "center" });

    doc
      .fillColor("black")
      .font("Helvetica")
      .fontSize(10)
      .text("RAJAMAHENDRAVARAM, ANDHRA PRADESH - 533296", 0, y + 28, {
        align: "center",
      });

    const extraSpaceAboveLine = 15;
    doc
      .moveTo(40, y + 45 + extraSpaceAboveLine)
      .lineTo(pageWidth - 40, y + 45 + extraSpaceAboveLine)
      .strokeColor(primaryColor)
      .lineWidth(1)
      .stroke();

    y += 60 + extraSpaceAboveLine;

    // --- TITLE ---
    const title = latestBatch.title || "Semester Results";
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor("black")
      .text(title, 40, y, { width: pageWidth - 80, align: "center" });
    y += 25;

    const semester =
      type === "rv"
        ? allRVResults[0]?.Semester || "N/A"
        : type === "regularAndBacklog"
        ? allRegularAndBacklogResults[0]?.Semester || "N/A"
        : allRegularResults[0]?.Semester || "N/A";

    const semesterText = `SEMESTER - ${semester}`;
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("black")
      .text(semesterText, 40, y, { width: pageWidth - 80, align: "center" });

    const resultDate = latestBatch.resultDate
      ? new Date(latestBatch.resultDate).toLocaleDateString()
      : "Not Available";
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("gray")
      .text(`(Result Published on: ${resultDate})`, 40, y + 16, {
        width: pageWidth - 80,
        align: "center",
      });
    y += 40;

    // --- STUDENT INFORMATION ---
    doc.rect(40, y, pageWidth - 80, 25).fill(accentColor);
    doc
      .fillColor(primaryColor)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("STUDENT INFORMATION", 45, y + 8);
    y += 35;

    const studentData = latest.doc;

    // Helper function to capitalize first letters
    const capitalizeWords = (str) => {
      if (!str) return "N/A";
      return str.replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const addInfoLine = (label, value) => {
      doc
        .font("Helvetica-Bold")
        .fillColor("gray")
        .fontSize(10)
        .text(`${label}:`, 40, y);
      doc
        .font("Helvetica")
        .fillColor("black")
        .text(capitalizeWords(value), 180, y); // increased spacing
      y += 20; // more spacing between lines
    };

    addInfoLine("Registration Number", studentData.RegisterNumber);
    addInfoLine("Student Name", studentData.StudentName);
    addInfoLine("Course", studentData.CourseName);
    addInfoLine("Semester", semester);

    const resultType =
      type === "rv"
        ? "Revaluation"
        : type === "regularAndBacklog"
        ? "Regular & Backlog"
        : "Regular";
    addInfoLine("Result Type", resultType);

    doc
      .moveTo(40, y)
      .lineTo(pageWidth - 40, y)
      .strokeColor("#CCCCCC")
      .lineWidth(0.5)
      .stroke();
    y += 20;

    // --- ACADEMIC PERFORMANCE ---
    doc.rect(40, y, pageWidth - 80, 25).fill(accentColor);
    doc
      .fillColor(primaryColor)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("ACADEMIC PERFORMANCE", 45, y + 8);
    y += 35;

    let subjects = [];
    if (type === "regular")
      allRegularResults.forEach((r) => subjects.push([r.SubjectName, r.Grade]));
    else if (type === "rv")
      allRVResults.forEach((r) => subjects.push([r.SubjectName, r.Grade]));
    else if (type === "regularAndBacklog")
      allRegularAndBacklogResults.forEach((r) =>
        subjects.push([r.SubjectName, r.Grade])
      );

    const tableX = 40;
    const tableWidth = pageWidth - 80;
    const col1Width = tableWidth - 60;
    const col2Width = 60;
    const rowHeight = 25;

    // Table header
    doc.rect(tableX, y, tableWidth, rowHeight).fill(primaryColor).stroke();
    doc
      .fillColor("white")
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("Subject", tableX + 5, y + 8)
      .text("Grade", tableX + col1Width + 5, y + 8, {
        width: col2Width,
        align: "center",
      });
    y += rowHeight;

    // Table rows with borders
    subjects.forEach((row, i) => {
      const fill = i % 2 === 0 ? "#F8FAF9" : "#FFFFFF";
      doc.rect(tableX, y, tableWidth, rowHeight).fill(fill).stroke();
      doc
        .fillColor("black")
        .text(capitalizeWords(row[0]), tableX + 5, y + 8)
        .text(row[1].toUpperCase(), tableX + col1Width + 5, y + 8, {
          width: col2Width,
          align: "center",
        });
      y += rowHeight;
    });

    const footerY = y + 20;
    doc
      .moveTo(40, footerY)
      .lineTo(pageWidth - 40, footerY)
      .strokeColor(primaryColor)
      .lineWidth(0.5)
      .stroke();

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error generating PDF");
  }
});

resultRouter.get("/previous-results", async (req, res) => {
  try {
    const { RegisterNumber, currentSemester, currentBatchId, excludeBatchIds } = req.query;

    if (!RegisterNumber) {
      return res.status(400).json({
        success: false,
        error: "RegisterNumber is required",
      });
    }

    // Fetch all results for this RegisterNumber
    const registerNumberQuery = buildRegisterNumberQuery(RegisterNumber);
    const [results, rvResults, rabResults] = await Promise.all([
      Result.find(registerNumberQuery).populate("batchId").lean(),
      RVResult.find(registerNumberQuery).populate("batchId").lean(),
      RegularAndBacklogResult.find(registerNumberQuery)
        .populate("batchId")
        .lean(),
    ]);

    // Group all results by batchId
    const batchMap = new Map();

    const addToBatch = (item, key) => {
      if (!item.batchId || !item.batchId._id) {
        return;
      }
      const id = item.batchId._id.toString();
      if (!batchMap.has(id)) {
        const normalizedSem = parseSemester(item.batchId.semester, item.batchId.title);
        if (normalizedSem) {
          item.batchId.semester = normalizedSem;
        }
        batchMap.set(id, {
          batchId: item.batchId,
          batch: item.batchId,
          results: [],
          rvResults: [],
          regularAndBacklogResults: [],
        });
      }
      batchMap.get(id)[key].push(item);
    };

    // Populate batchMap
    results.forEach((r) => addToBatch(r, "results"));
    rvResults.forEach((r) => addToBatch(r, "rvResults"));
    rabResults.forEach((r) => addToBatch(r, "regularAndBacklogResults"));

    // Exclude batches that are shown at the top (if specified)
    const excludeList = (excludeBatchIds || currentBatchId || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    let previousBatches = Array.from(batchMap.values());
    if (excludeList.length > 0) {
      previousBatches = previousBatches.filter(
        (b) => !excludeList.includes(b.batch?._id?.toString())
      );
    }

    // Sort previous batches:
    // First by semester (ascending 1, 2, 3, 4)
    // For same semester: newer resultDate / createdAt first
    previousBatches.sort((a, b) => {
      const semA = a.batch?.semester || 0;
      const semB = b.batch?.semester || 0;
      if (semA !== semB) return semA - semB; // Semester ASC

      const dateA = new Date(a.batch?.resultDate || 0);
      const dateB = new Date(b.batch?.resultDate || 0);
      if (dateB - dateA !== 0) return dateB - dateA;

      return new Date(b.batch?.createdAt || 0) - new Date(a.batch?.createdAt || 0);
    });

    res.status(200).json({
      success: true,
      data: previousBatches,
    });
  } catch (err) {
    console.error("Error fetching previous results:", err);
    res.status(500).json({
      success: false,
      error: "Server error fetching previous results",
    });
  }
});

module.exports = resultRouter;
