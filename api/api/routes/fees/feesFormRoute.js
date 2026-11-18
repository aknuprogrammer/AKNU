const express = require("express");
const mongoose = require("mongoose");
const FeesForm = require("../../models/fees/feesForm");
const CourseStreamMapping = require("../../models/examination/selector/CourseStreamMapping");
const Stream = require("../../models/examination/selector/Stream");
const authenticationMiddleware = require("../../middlewares/authentication");

// Import Course model (it's registered as "Course_data")
// Ensure the model is loaded
require("../../models/admission/selector/Course");
const Course = mongoose.model("Course_data");

const feesRouter = express.Router();

// Helper function to parse semester text to numeric semester number
// Examples: "1st Year - 1st Semester" -> 1, "2nd Year - 2nd Semester" -> 4, etc.
const parseSemesterToNumber = (semesterText) => {
  if (!semesterText) return null;

  const text = semesterText.toString().trim();

  // Try to extract numbers from patterns like "1st Year - 1st Semester"
  // Pattern 1: "Xst Year - Yst Semester" -> semester = (X-1)*2 + Y
  const pattern1 = text.match(
    /(\d+)(?:st|nd|rd|th)\s+Year\s*-\s*(\d+)(?:st|nd|rd|th)\s+Semester/i
  );
  if (pattern1) {
    const year = parseInt(pattern1[1]);
    const semesterInYear = parseInt(pattern1[2]);
    // For 4-year courses: Year 1 has semesters 1-2, Year 2 has 3-4, etc.
    return (year - 1) * 2 + semesterInYear;
  }

  // Pattern 2: Just extract first number found
  const numMatch = text.match(/\d+/);
  if (numMatch) {
    const num = parseInt(numMatch[0]);
    // Assume it's a semester number if between 1-8
    if (num >= 1 && num <= 8) {
      return num;
    }
  }

  // Pattern 3: Roman numerals (I, II, III, etc.)
  const romanMap = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
    VIII: 8,
  };
  const romanMatch = text.match(/\b([IVX]+)\b/i);
  if (romanMatch && romanMap[romanMatch[1].toUpperCase()]) {
    return romanMap[romanMatch[1].toUpperCase()];
  }

  return null;
};

// POST route to create a new fees form entry
feesRouter.post("/", async (req, res) => {
  try {
    const newForm = new FeesForm(req.body);
    const savedForm = await newForm.save();
    res.status(201).json({ success: true, data: savedForm });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET route to fetch all fees form entries
feesRouter.get("/", authenticationMiddleware, async (req, res) => {
  try {
    const forms = await FeesForm.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: forms });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Test route to verify router is working
feesRouter.get("/test", (req, res) => {
  res.json({ success: true, message: "Fees router is working!" });
});

// GET route to fetch subjects for a student based on course, stream, and semester
// Uses CourseStreamMapping table directly - the primary source for course-stream-subject relationships
// IMPORTANT: This route must come BEFORE /student/:registrationNumber to avoid route conflicts
feesRouter.get("/subjects", async (req, res) => {
  try {
    console.log("=".repeat(50));
    console.log("📚 /api/fees/subjects endpoint hit");
    console.log("📚 Full URL:", req.originalUrl);
    console.log("📚 Query params:", req.query);
    console.log("=".repeat(50));
    const { courseName, streamName, semesterYear } = req.query;

    // Note: streamName is optional for courses without streams (like MCA)
    if (!courseName || !semesterYear) {
      return res.status(400).json({
        success: false,
        error:
          "courseName and semesterYear are required. streamName is optional for courses without streams.",
      });
    }

    // Parse semester to get numeric semester number
    const semesterNumber = parseSemesterToNumber(semesterYear);
    if (!semesterNumber) {
      return res.status(400).json({
        success: false,
        error:
          "Could not parse semester. Please provide semester in format like '1st Year - 1st Semester'",
      });
    }

    // Step 1: Find Course by name (with flexible matching)
    let course = await Course.findOne({
      name: { $regex: new RegExp(courseName.trim(), "i") },
      status: "Active",
    });

    // If not found, try keyword matching
    if (!course) {
      const courseNameLower = courseName.toLowerCase();
      if (
        courseNameLower.includes("mca") ||
        (courseNameLower.includes("master") &&
          courseNameLower.includes("computer"))
      ) {
        course = await Course.findOne({
          name: { $regex: /master.*computer|mca|m\.c\.a/i },
          status: "Active",
        });
      } else if (
        courseNameLower.includes("b.tech") ||
        courseNameLower.includes("btech") ||
        (courseNameLower.includes("computer") &&
          courseNameLower.includes("science"))
      ) {
        course = await Course.findOne({
          name: { $regex: /b\.tech|btech|computer.*science/i },
          status: "Active",
        });
      }
    }

    if (!course) {
      console.error(`❌ Course not found: "${courseName}"`);
      const availableCourses = await Course.find({ status: "Active" })
        .select("name code")
        .limit(10);
      return res.status(404).json({
        success: false,
        error: `Course '${courseName}' not found.`,
        availableCourses: availableCourses.map((c) => ({
          name: c.name,
          code: c.code,
        })),
      });
    }

    console.log(`✅ Found course: ${course.name} (${course.code})`);

    // Step 2: Find Stream by name and courseId (streamName is optional for courses without streams)
    let stream = null;

    if (streamName && streamName.trim()) {
      const streamNameTrimmed = streamName.trim();
      
      // Try exact match first (case insensitive)
      stream = await Stream.findOne({
        name: { $regex: new RegExp(`^${streamNameTrimmed}$`, "i") },
        courseId: course._id,
        status: "Active",
      });

      // If not found, try partial match
      if (!stream) {
        stream = await Stream.findOne({
          name: { $regex: new RegExp(streamNameTrimmed, "i") },
          courseId: course._id,
          status: "Active",
        });
      }

      // If still not found, try matching by code
      if (!stream) {
        stream = await Stream.findOne({
          code: { $regex: new RegExp(`^${streamNameTrimmed}$`, "i") },
          courseId: course._id,
          status: "Active",
        });
      }

      // If still not found, try common stream name variations
      if (!stream) {
        const streamVariations = {
          "ECE": ["Electronics and Communication", "Electronics Communication", "ECE Engineering"],
          "CSE": ["Computer Science", "Computer Science Engineering", "CSE Engineering"],
          "EEE": ["Electrical and Electronics", "Electrical Electronics", "EEE Engineering"],
          "ME": ["Mechanical Engineering", "Mechanical"],
          "CE": ["Civil Engineering", "Civil"],
          "IT": ["Information Technology", "IT Engineering"],
        };

        const upperStreamName = streamNameTrimmed.toUpperCase();
        if (streamVariations[upperStreamName]) {
          for (const variation of streamVariations[upperStreamName]) {
            stream = await Stream.findOne({
              name: { $regex: new RegExp(variation, "i") },
              courseId: course._id,
              status: "Active",
            });
            if (stream) {
              console.log(`✅ Found stream using variation: ${variation}`);
              break;
            }
          }
        }
      }

      // If stream still not found, try to find any stream for this course
      if (!stream) {
        console.log(
          `⚠️ Stream '${streamName}' not found for course '${courseName}', trying to find any stream for this course...`
        );
        const availableStreams = await Stream.find({
          courseId: course._id,
          status: "Active",
        }).select("name code");

        if (availableStreams.length > 0) {
          console.log(
            `⚠️ Found ${availableStreams.length} stream(s) for this course, using first one:`,
            availableStreams[0].name
          );
          stream = availableStreams[0];
        } else {
          console.log(
            `⚠️ No streams found for course '${courseName}'. This course may not have streams.`
          );
        }
      }
    }

    // If no stream found or streamName not provided, try to find CourseStreamMapping without streamId
    // This handles courses like MCA that don't have streams
    if (!stream) {
      console.log(
        `⚠️ No stream found or streamName not provided. Trying to find CourseStreamMapping without stream for course '${courseName}'...`
      );

      const mappingWithoutStream = await CourseStreamMapping.findOne({
        courseId: course._id,
        semesterNumber: semesterNumber,
        status: "Active",
      }).populate({
        path: "subjects.subjectId",
        select: "name code",
      });

      if (mappingWithoutStream) {
        console.log(
          `✅ Found mapping without stream for course '${courseName}'`
        );

        if (
          !mappingWithoutStream.subjects ||
          mappingWithoutStream.subjects.length === 0
        ) {
          return res.status(404).json({
            success: false,
            error: `No subjects found in CourseStreamMapping for ${courseName} - Semester ${semesterNumber}`,
            data: [],
          });
        }

        const subjects = mappingWithoutStream.subjects.map((sub, index) => ({
          SubjectName: sub.subjectId?.name || "N/A",
          SubjectCode: sub.subjectId?.code || "N/A",
          SubjectOrder: index + 1,
          maxMarks: sub.maxMarks || 100,
          passMarks: sub.passMarks || 40,
        }));

        return res.status(200).json({
          success: true,
          message: `Found ${subjects.length} subject(s)`,
          data: {
            course: course.name,
            stream: null,
            semesterYear: semesterYear,
            semesterNumber: semesterNumber,
            subjects: subjects,
          },
        });
      }

      // If still no mapping found, try to find ANY CourseStreamMapping for this course and semester (with any stream)
      console.log(
        `⚠️ No mapping without stream found. Trying to find ANY mapping for course '${courseName}' and semester ${semesterNumber}...`
      );
      
      const anyMapping = await CourseStreamMapping.findOne({
        courseId: course._id,
        semesterNumber: semesterNumber,
        status: "Active",
      })
        .populate({
          path: "streamId",
          select: "name code",
        })
        .populate({
          path: "subjects.subjectId",
          select: "name code",
        });

      if (anyMapping) {
        console.log(
          `✅ Found mapping for course '${courseName}' and semester ${semesterNumber} with stream '${anyMapping.streamId?.name || "N/A"}' (ignoring requested stream '${streamName || "N/A"}')`
        );

        if (
          !anyMapping.subjects ||
          anyMapping.subjects.length === 0
        ) {
          return res.status(404).json({
            success: false,
            error: `No subjects found in CourseStreamMapping for ${courseName} - Semester ${semesterNumber}`,
            data: [],
          });
        }

        const subjects = anyMapping.subjects.map((sub, index) => ({
          SubjectName: sub.subjectId?.name || "N/A",
          SubjectCode: sub.subjectId?.code || "N/A",
          SubjectOrder: index + 1,
          maxMarks: sub.maxMarks || 100,
          passMarks: sub.passMarks || 40,
        }));

        return res.status(200).json({
          success: true,
          message: `Found ${subjects.length} subject(s) for course '${courseName}' and semester ${semesterNumber}`,
          data: {
            course: course.name,
            stream: anyMapping.streamId?.name || null,
            semesterYear: semesterYear,
            semesterNumber: semesterNumber,
            subjects: subjects,
            note: streamName && anyMapping.streamId?.name !== streamName
              ? `Note: Requested stream '${streamName}' was not found. Showing subjects for stream '${anyMapping.streamId?.name || "N/A"}' instead.`
              : undefined,
          },
        });
      }

      // If still no mapping found, return error with available streams
      const allStreamsForCourse = await Stream.find({
        courseId: course._id,
        status: "Active",
      }).select("name code");

      const allMappingsForCourse = await CourseStreamMapping.find({
        courseId: course._id,
        status: "Active",
      })
        .populate({
          path: "streamId",
          select: "name code",
        })
        .select("semesterNumber streamId");

      const availableSemesters = [
        ...new Set(allMappingsForCourse.map((m) => m.semesterNumber)),
      ].sort();

      return res.status(404).json({
        success: false,
        error: streamName
          ? `Stream '${streamName}' not found for course '${courseName}', and no CourseStreamMapping found for semester ${semesterNumber}.`
          : `No CourseStreamMapping found for course '${courseName}' and semester ${semesterNumber}.`,
        availableStreams: allStreamsForCourse.map((s) => ({
          name: s.name,
          code: s.code,
        })),
        availableSemesters: availableSemesters,
        suggestion:
          allStreamsForCourse.length === 0
            ? "This course may not have streams (like MCA). Please ensure CourseStreamMapping exists without a streamId."
            : `Available streams for this course: ${allStreamsForCourse
                .map((s) => s.name)
                .join(", ")}. Available semesters: ${availableSemesters.join(", ") || "None"}`,
      });
    }

    console.log(`✅ Found stream: ${stream.name}`);

    // Step 3: Query CourseStreamMapping directly - this is the primary table for course-stream-subject relationships
    let mapping = await CourseStreamMapping.findOne({
      courseId: course._id,
      streamId: stream._id,
      semesterNumber: semesterNumber,
      status: "Active",
    }).populate({
      path: "subjects.subjectId",
      select: "name code",
    });

    // If mapping not found with the specific stream, try to find any mapping for this course and semester
    if (!mapping) {
      console.log(
        `⚠️ No mapping found for ${courseName} - ${streamName} - Semester ${semesterNumber}. Trying to find any mapping for this course and semester...`
      );
      
      // Try to find any CourseStreamMapping for this course and semester (with any stream)
      mapping = await CourseStreamMapping.findOne({
        courseId: course._id,
        semesterNumber: semesterNumber,
        status: "Active",
      })
        .populate({
          path: "streamId",
          select: "name code",
        })
        .populate({
          path: "subjects.subjectId",
          select: "name code",
        });

      if (mapping) {
        console.log(
          `✅ Found mapping for course '${courseName}' and semester ${semesterNumber} with stream '${mapping.streamId?.name || "N/A"}' (different from requested '${streamName}')`
        );
        // Update stream to the one found in mapping
        stream = mapping.streamId;
      }
    }

    if (!mapping) {
      // Get all available streams and mappings for this course to provide helpful error message
      const allStreamsForCourse = await Stream.find({
        courseId: course._id,
        status: "Active",
      }).select("name code");

      const allMappingsForCourse = await CourseStreamMapping.find({
        courseId: course._id,
        status: "Active",
      })
        .populate({
          path: "streamId",
          select: "name code",
        })
        .select("semesterNumber streamId");

      const availableSemesters = [
        ...new Set(allMappingsForCourse.map((m) => m.semesterNumber)),
      ].sort();

      return res.status(404).json({
        success: false,
        error: `No mapping found for ${courseName} - ${streamName || "N/A"} - Semester ${semesterNumber}. Please ensure CourseStreamMapping exists.`,
        data: [],
        availableStreams: allStreamsForCourse.map((s) => ({
          name: s.name,
          code: s.code,
        })),
        availableSemesters: availableSemesters,
        suggestion: `Available streams for this course: ${allStreamsForCourse.map((s) => s.name).join(", ") || "None"}. Available semesters: ${availableSemesters.join(", ") || "None"}`,
      });
    }

    if (!mapping.subjects || mapping.subjects.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No subjects found in CourseStreamMapping for ${courseName} - ${streamName} - Semester ${semesterNumber}`,
        data: [],
      });
    }

    console.log(
      `✅ Found ${mapping.subjects.length} subject(s) in CourseStreamMapping`
    );

    // Format subjects for response
    const subjects = mapping.subjects.map((sub, index) => ({
      SubjectName: sub.subjectId?.name || "N/A",
      SubjectCode: sub.subjectId?.code || "N/A",
      SubjectOrder: index + 1,
      maxMarks: sub.maxMarks || 100,
      passMarks: sub.passMarks || 40,
    }));

    res.status(200).json({
      success: true,
      message: `Found ${subjects.length} subject(s)`,
      data: {
        course: course.name,
        stream: stream.name,
        semesterYear: semesterYear,
        semesterNumber: semesterNumber,
        subjects: subjects,
      },
    });
  } catch (err) {
    console.error("Error fetching subjects:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET route to fetch fees for a specific student by registration number
feesRouter.get("/student/:registrationNumber", async (req, res) => {
  try {
    const { registrationNumber } = req.params;
    console.log(33, registrationNumber);
    if (!registrationNumber) {
      return res.status(400).json({
        success: false,
        error: "Registration number is required",
      });
    }

    const fees = await FeesForm.find({ registrationNumber }).sort({
      createdAt: -1,
    });

    if (fees.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No fees found for this registration number",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: `Found ${fees.length} fee record(s)`,
      count: fees.length,
      data: fees,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = feesRouter;
