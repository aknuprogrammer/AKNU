require("dotenv").config();
const mongoose = require("mongoose");
const Student = require("../models/admission/FromStudents");
const Course = require("../models/admission/selector/Course");
const College = require("../models/admission/selector/College");
const Stream = require("../models/examination/selector/Stream");
const Semester = require("../models/examination/selector/Semester");
const AcademicYear = require("../models/examination/selector/AcademicYear");
const CourseStreamMapping = require("../models/examination/selector/CourseStreamMapping");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Note: Batch/Academic Year will be fetched from API dynamically

// Helper function to convert semester number to semester year string
function getSemesterYearString(semesterNumber) {
  const year = Math.ceil(semesterNumber / 2);
  const semester = semesterNumber % 2 === 1 ? "1st Semester" : "2nd Semester";
  const yearOrdinal = 
    year === 1 ? "1st" : 
    year === 2 ? "2nd" : 
    year === 3 ? "3rd" : 
    `${year}th`;
  return `${yearOrdinal} Year - ${semester}`;
}

// Function to generate dummy students based on actual course-stream mappings
async function generateDummyStudents() {
  try {
    console.log("🔍 Fetching existing data from database...");

    // Fetch existing course-stream mappings (Active only) using the API logic
    // This is like calling: GET /api/examination/course-stream-mappings?includeInactive=false
    // Note: subjects are excluded as requested
    const mappings = await CourseStreamMapping.find({ status: "Active" })
      .populate("courseId", "code name comments")
      .populate("streamId", "code name status")
      .populate("semesterId", "numberOfSemesters description status")
      // .populate("subjects.subjectId", "code name syllabus status") // Excluded - subjects not needed
      .sort({ createdAt: -1 })
      .limit(100);

    if (mappings.length === 0) {
      console.error("❌ No active course-stream mappings found. Please create mappings first.");
      console.error("   You need to create Course-Stream mappings in the examination module.");
      process.exit(1);
    }
    console.log(`✅ Found ${mappings.length} course-stream mapping(s)`);

    // Fetch existing colleges
    const colleges = await College.find({ status: "Active" }).limit(10);
    if (colleges.length === 0) {
      console.error("❌ No active colleges found. Please create colleges first.");
      process.exit(1);
    }
    console.log(`✅ Found ${colleges.length} college(s)`);

    // Fetch academic years from API (for batch/batchYear) - Dynamic, not hardcoded
    // Same as: GET /api/examination/academic-years
    const academicYears = await AcademicYear.find().sort({ startDate: -1 }).limit(10);
    if (academicYears.length === 0) {
      console.warn("⚠️  No academic years found. Will use default batch format.");
    } else {
      console.log(`✅ Found ${academicYears.length} academic year(s) from API`);
    }

    // Display sample mappings for reference
    console.log("\n📋 Sample Course-Stream Mappings (from API - these will be used for students):");
    mappings.slice(0, 5).forEach((mapping, idx) => {
      console.log(`   ${idx + 1}. Course: ${mapping.courseId?.code || "N/A"} (${mapping.courseId?.name || "N/A"})`);
      console.log(`      → Stream: ${mapping.streamId?.code || "N/A"} (${mapping.streamId?.name || "N/A"})`);
      console.log(`      → Semester: ${mapping.semesterNumber} (${getSemesterYearString(mapping.semesterNumber)})`);
      console.log(`      → Time Period: ${mapping.timePeriod || "N/A"} | Status: ${mapping.status || "N/A"}`);
    });

    // Display sample academic years
    if (academicYears.length > 0) {
      console.log("\n📋 Sample Academic Years (from API - will be used for batch):");
      academicYears.slice(0, 3).forEach((ay, idx) => {
        const startYear = ay.startDate ? new Date(ay.startDate).getFullYear() : "N/A";
        const endYear = ay.endDate ? new Date(ay.endDate).getFullYear() : "N/A";
        console.log(`   ${idx + 1}. ${ay.code} (${startYear}-${endYear})`);
      });
    }

    // Get existing reference numbers to avoid duplicates
    const existingRefNumbers = await Student.find({}, { referenceNumber: 1 }).lean();
    const existingRefSet = new Set(existingRefNumbers.map(s => s.referenceNumber));
    console.log(`📋 Found ${existingRefSet.size} existing reference numbers`);

    // Generate dummy student data
    const dummyStudents = [];
    const firstNames = [
      "Rajesh", "Priya", "Amit", "Sneha", "Rahul", "Kavya", "Vikram", "Anjali",
      "Mohit", "Divya", "Arjun", "Meera", "Siddharth", "Pooja", "Rohan", "Neha",
      "Aditya", "Isha", "Karan", "Riya", "Varun", "Shreya", "Nikhil", "Tanvi",
      "Yashvardhan", "Aarav", "Ishita", "Rohan", "Sneha", "Karan"
    ];
    const lastNames = [
      "Kumar", "Sharma", "Patel", "Reddy", "Verma", "Nair", "Singh", "Desai",
      "Agarwal", "Iyer", "Menon", "Joshi", "Rao", "Gupta", "Kapoor", "Bhatt",
      "Malhotra", "Trivedi", "Shah", "Mehta", "Chawla", "Agarwal", "Dubey",
      "Nanda", "Singh", "Sharma", "Verma", "Mehta", "Iyer", "Patel"
    ];

    // ONE SHOT: Generate students dynamically from course-stream mappings
    // Distribute students across all mappings (not random selection)
    let studentCounter = 0;
    const totalStudents = 30;
    const studentsPerMapping = Math.ceil(totalStudents / mappings.length);

    // Loop through each mapping - ALL DATA COMES FROM MAPPING (ONE SHOT)
    for (const mapping of mappings) {
      // Extract ALL data dynamically from mapping (ONE SHOT - everything from mapping)
      const course = mapping.courseId; // Course ObjectId from mapping
      const stream = mapping.streamId; // Stream ObjectId from mapping
      const semester = mapping.semesterId; // Semester ObjectId from mapping
      const semesterNumber = mapping.semesterNumber; // Semester number from mapping (1, 2, 3, etc.)
      const semesterYear = getSemesterYearString(semesterNumber); // Convert to "1st Year - 1st Semester" format
      const timePeriod = mapping.timePeriod || ""; // Time period from mapping (e.g., "2024-25", "yearly")
      const mappingNotes = mapping.notes || ""; // Notes from mapping (optional)
      
      // Validate mapping data
      if (!course || !stream || !semester) {
        console.warn(`⚠️  Skipping mapping ${mapping._id} - Invalid mapping data (missing course, stream, or semester)`);
        continue;
      }

      // Get batch/academic year - Priority: timePeriod from mapping > Academic Year API > fallback
      let batchCode, batchYear, batchObjectId;
      if (timePeriod && timePeriod !== "yearly" && timePeriod !== "Yearly") {
        // Try to find matching AcademicYear by code from timePeriod
        const matchingAcademicYear = academicYears.find(ay => ay.code === timePeriod);
        if (matchingAcademicYear) {
          batchObjectId = matchingAcademicYear._id; // Use ObjectId
          batchCode = matchingAcademicYear.code;
          batchYear = matchingAcademicYear.code;
        } else if (academicYears.length > 0) {
          // Fallback to random Academic Year if timePeriod doesn't match
          const academicYear = academicYears[Math.floor(Math.random() * academicYears.length)];
          batchObjectId = academicYear._id; // Use ObjectId
          batchCode = academicYear.code;
          batchYear = academicYear.code;
        } else {
          // Final fallback if no academic years exist
          const currentYear = new Date().getFullYear();
          batchCode = `${currentYear}-${String(currentYear + 1).slice(-2)}`;
          batchYear = String(currentYear);
          batchObjectId = null; // Will need to create or skip
        }
      } else if (academicYears.length > 0) {
        // Use Academic Year API (ObjectId required)
        const academicYear = academicYears[Math.floor(Math.random() * academicYears.length)];
        batchObjectId = academicYear._id; // Use ObjectId
        batchCode = academicYear.code; // e.g., "2024-25"
        batchYear = academicYear.code; // Use code as batch year
      } else {
        // Final fallback if no academic years exist
        const currentYear = new Date().getFullYear();
        batchCode = `${currentYear}-${String(currentYear + 1).slice(-2)}`;
        batchYear = String(currentYear);
        batchObjectId = null; // Will need to create or skip
      }

      // Create students for this mapping (distributed across all mappings)
      for (let j = 0; j < studentsPerMapping && studentCounter < totalStudents; j++) {
        studentCounter++;
        const i = studentCounter;
        
        // Select random college (from API - dynamic)
        const college = colleges[Math.floor(Math.random() * colleges.length)];
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const middleName = i % 3 === 0 ? "Kumar" : "";

        // Generate unique reference number (check for duplicates)
        let referenceNumber;
        let attempts = 0;
        do {
          const timestamp = Date.now();
          const randomSuffix = Math.floor(Math.random() * 100000);
          referenceNumber = `REF${2025}${String(i).padStart(4, "0")}${String(randomSuffix).padStart(5, "0")}`;
          attempts++;
          if (attempts > 10) {
            // Fallback: use timestamp
            referenceNumber = `REF${timestamp}${i}`;
            break;
          }
        } while (existingRefSet.has(referenceNumber));
        
        // Add to set to avoid duplicates within this batch
        existingRefSet.add(referenceNumber);
        
        const randomSuffix = Math.floor(Math.random() * 10000);
        const batchYearForReg = batchCode.split('-')[0] || new Date().getFullYear(); // Extract year from code
        const registrationNumber = `REG${batchYearForReg}${String(i).padStart(3, "0")}${String(randomSuffix).slice(-2)}`;
        const hallTicketNo = `HT${batchYearForReg}${String(i).padStart(5, "0")}${String(randomSuffix).slice(-3)}`;

        // Generate academic records
        const academicRecords = [
          {
            id: `ACAD${i}_1`,
            collegeName: "ABC High School",
            qualification: "SSC",
            specialization: "",
            completionYear: String(parseInt(batchCode.split('-')[0] || new Date().getFullYear()) - 4),
            result: `${85 + Math.floor(Math.random() * 10)}%`,
            achievements: i % 5 === 0 ? "School Topper" : "",
          },
          {
            id: `ACAD${i}_2`,
            collegeName: "XYZ Intermediate College",
            qualification: "Intermediate",
            specialization: "MPC",
            completionYear: String(parseInt(batchCode.split('-')[0] || new Date().getFullYear()) - 2),
            result: `${80 + Math.floor(Math.random() * 15)}%`,
            achievements: i % 7 === 0 ? "Merit Scholarship" : "",
          },
        ];

        // Generate documents
        const documents = [
          {
            docId: `DOC${i}_1`,
            name: "SSC Certificate",
            fileType: "application/pdf",
            submitted: "true",
            verified: i % 3 === 0 ? "verified" : "not_verified",
            comment: i % 3 === 0 ? "Verified and approved" : "",
          },
          {
            docId: `DOC${i}_2`,
            name: "Intermediate Certificate",
            fileType: "application/pdf",
            submitted: "true",
            verified: i % 4 === 0 ? "verified" : "not_verified",
            comment: i % 4 === 0 ? "Verified" : "",
          },
        ];

        const student = {
          // Admission fields
          hallTicketNo: hallTicketNo,
          admitCardId: `AC${batchCode.split('-')[0] || new Date().getFullYear()}${String(i).padStart(5, "0")}`,
          rank: String(100 + i),
          seatCategory: i % 3 === 0 ? "General" : i % 3 === 1 ? "OBC" : "SC",
          phase: "Phase 1",
          seatCategorySPL: i % 10 === 0 ? "Sports" : "",

          // Personal information
          firstName: firstName,
          middleName: middleName,
          lastName: lastName,
          fatherName: `Mr. ${firstName} ${lastName} Senior`,
          motherName: `Mrs. ${firstName} ${lastName}`,
          fatherOccupation: ["Engineer", "Teacher", "Doctor", "Business", "Farmer"][
            Math.floor(Math.random() * 5)
          ],
          fatherIncome: String(300000 + Math.floor(Math.random() * 500000)),
          motherOccupation: ["Teacher", "Housewife", "Nurse", "Engineer"][
            Math.floor(Math.random() * 4)
          ],
          motherIncome: String(100000 + Math.floor(Math.random() * 300000)),
          dob: `${2000 + Math.floor(Math.random() * 5)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
          gender: i % 2 === 0 ? "Male" : "Female",
          nationality: "Indian",
          caste: ["General", "OBC", "SC", "ST"][Math.floor(Math.random() * 4)],
          religion: ["Hindu", "Muslim", "Christian", "Sikh"][
            Math.floor(Math.random() * 4)
          ],
          aadharNumber: `${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}`,
          aparId: `APAR${String(i).padStart(4, "0")}`,
          personalMark1: `Mark1_${i}`,
          personalMark2: `Mark2_${i}`,

          // Contact information
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
          phone: `9${Math.floor(Math.random() * 900000000) + 100000000}`,
          altPhone: `8${Math.floor(Math.random() * 900000000) + 100000000}`,

          // Address information
          addressLine1: `${Math.floor(Math.random() * 999) + 1} Main Street`,
          addressLine2: i % 2 === 0 ? "Near Park" : "Near School",
          city: ["Hyderabad", "Vijayawada", "Visakhapatnam", "Rajahmundry", "Guntur"][
            Math.floor(Math.random() * 5)
          ],
          state: "Telangana",
          pincode: `${500000 + Math.floor(Math.random() * 100000)}`,

          // Academic information - ALL DYNAMICALLY FROM MAPPING (ONE SHOT)
          academicRecords: academicRecords,
          campus: college._id, // College ObjectId (from College API - dynamic)
          course: course._id, // Course ObjectId from mapping (dynamic) - for backward compatibility
          stream: stream._id, // Stream ObjectId from mapping (dynamic - automatically related to course) - for backward compatibility
          semester: semester._id, // Semester ObjectId from mapping (dynamic) - for backward compatibility
          courseStreamMappingId: mapping._id, // Reference to CourseStreamMapping - REQUIRED for matching students

          // Documents
          documents: documents,

          // Additional information
          hasDisability: i % 10 === 0 ? "yes" : "no",
          hasScholarship: i % 5 === 0 ? "yes" : "no",
          requiresReimbursement: i % 8 === 0 ? "yes" : "no",
          requiresHostel: i % 3 === 0 ? "yes" : "no",
          requiresTransport: i % 4 === 0 ? "yes" : "no",

          // Required fields
          referenceNumber: referenceNumber,

          // Examination application fields - ALL DYNAMICALLY FROM MAPPING (ONE SHOT)
          registrationNumber: registrationNumber,
          semesterYear: semesterYear, // Generated from mapping's semesterNumber (dynamic from course-stream mapping)
          // stream is already set above as ObjectId (dynamic from course-stream mapping)
          // semester is already set above as ObjectId (dynamic from course-stream mapping)
          batch: batchObjectId, // AcademicYear ObjectId (required - from mapping's timePeriod OR Academic Year API)
          batchYear: batchCode, // String code for reference (e.g., "2024-25")

          // Status - Set to "Admitted" so students can be fetched for marks entry
          status: "Admitted", // All seeded students are "Admitted" to match Internal Exam Setup requirements
        };

        dummyStudents.push(student);
      } // End of students per mapping loop
    } // End of mappings loop

    return dummyStudents;
  } catch (error) {
    console.error("❌ Error generating dummy students:", error);
    throw error;
  }
}

// Function to seed the database
async function seedStudents() {
  try {
    console.log("🌱 Starting to seed students...");

    // Check for existing records
    const existingCount = await Student.countDocuments();
    console.log(`📊 Existing students in database: ${existingCount}`);

    // Generate dummy students based on actual course-stream mappings
    const dummyStudents = await generateDummyStudents();

    // Insert dummy data
    const inserted = await Student.insertMany(dummyStudents);
    console.log(`✅ Successfully inserted ${inserted.length} student records!`);

    // Display summary
    const totalCount = await Student.countDocuments();
    const admittedCount = await Student.countDocuments({ status: "Admitted" });
    const pendingCount = await Student.countDocuments({ status: "pending" });
    const notSelectedCount = await Student.countDocuments({ status: "not_selected" });

    console.log("\n📈 Summary:");
    console.log(`   Total Students: ${totalCount}`);
    console.log(`   Admitted: ${admittedCount}`);
    console.log(`   Pending: ${pendingCount}`);
    console.log(`   Not Selected: ${notSelectedCount}`);

    // Display sample students with populated data (only newly created ones with ObjectId streams)
    console.log("\n📋 Sample Students (Course → Stream → Semester from Mappings):");
    const sampleStudents = await Student.find({
      stream: { $exists: true, $ne: null, $type: "objectId" } // Only ObjectId streams
    })
      .populate("course", "code name")
      .populate("campus", "code name city")
      .populate("stream", "code name") // Populate stream ObjectId
      .populate("semester", "numberOfSemesters description") // Populate semester ObjectId
      .limit(5)
      .select("firstName lastName registrationNumber stream semester semesterYear batch course campus status")
      .sort({ createdAt: -1 });

    if (sampleStudents.length === 0) {
      console.log("   ⚠️  No students found with ObjectId stream references.");
      console.log("   New students created by this script will have ObjectId stream references.");
    } else {
      sampleStudents.forEach((student, index) => {
        console.log(`\n   ${index + 1}. ${student.firstName} ${student.lastName}`);
        console.log(`      Registration: ${student.registrationNumber}`);
        console.log(`      Course: ${student.course?.code || "N/A"} - ${student.course?.name || "N/A"}`);
        console.log(`      Stream: ${student.stream?.code || "N/A"} - ${student.stream?.name || "N/A"}`);
        console.log(`      Semester: ${student.semesterYear} (Semester ID: ${student.semester?._id || "N/A"})`);
        if (student.semester) {
          console.log(`      Semester Details: ${student.semester.numberOfSemesters} semesters - ${student.semester.description || "N/A"}`);
        }
        console.log(`      Batch: ${student.batch || "N/A"} (from mapping timePeriod or Academic Year API)`);
        console.log(`      College: ${student.campus?.code || "N/A"} - ${student.campus?.name || "N/A"}`);
        console.log(`      Status: ${student.status}`);
      });
    }

    // Display mapping-based statistics
    console.log("\n📊 Students by Course-Stream-Semester (from Mappings):");
    try {
      // Get all students with ObjectId streams
      const allStudents = await Student.find({
        stream: { $exists: true, $ne: null, $type: "objectId" }
      })
        .populate("course", "code")
        .populate("stream", "code")
        .select("course stream semesterYear")
        .lean();

      // Group by course-stream-semester combination
      const combinationMap = {};
      allStudents.forEach(student => {
        const courseCode = student.course?.code || "Unknown";
        const streamCode = student.stream?.code || "Unknown";
        const semester = student.semesterYear || "Unknown";
        const key = `${courseCode}-${streamCode}-${semester}`;
        
        if (!combinationMap[key]) {
          combinationMap[key] = {
            course: courseCode,
            stream: streamCode,
            semester: semester,
            count: 0
          };
        }
        combinationMap[key].count++;
      });

      // Display statistics
      const combinations = Object.values(combinationMap).sort((a, b) => b.count - a.count);
      combinations.slice(0, 10).forEach(combo => {
        console.log(`   ${combo.course} → ${combo.stream} → ${combo.semester}: ${combo.count} student(s)`);
      });

      if (combinations.length === 0) {
        console.log("   ⚠️  No students with ObjectId stream references found.");
      }
    } catch (error) {
      console.log(`   ⚠️  Could not fetch statistics: ${error.message}`);
    }

    console.log("\n✅ Seeding completed successfully!");
    console.log("\n💡 Note: Students are created using APIs (dynamic data, not hardcoded):");
    console.log("   📌 Course-Stream Mapping API:");
    console.log("      - Uses: GET /api/examination/course-stream-mappings?status=Active");
    console.log("      - Each student gets from mapping:");
    console.log("        ✓ courseStreamMappingId (ObjectId) - REQUIRED reference to mapping for matching students");
    console.log("        ✓ courseId (ObjectId) - from mapping (for backward compatibility)");
    console.log("        ✓ streamId (ObjectId) - from mapping (automatically related to course)");
    console.log("        ✓ semesterId (ObjectId) - from mapping");
    console.log("        ✓ semesterNumber - from mapping (1, 2, 3, etc.)");
    console.log("        ✓ semesterYear - converted from semesterNumber (e.g., '1st Year - 1st Semester')");
    console.log("        ✓ timePeriod - from mapping (e.g., '2024-25', 'yearly') → used for batch (PRIORITY)");
    console.log("        ✗ subjects (excluded as requested)");
    console.log("      - All students are created with status: 'Admitted' to match Internal Exam Setup requirements");
    console.log("   📌 Academic Year API (fallback for batch):");
    console.log("      - Uses: GET /api/examination/academic-years");
    console.log("      - Used only if mapping.timePeriod is 'yearly' or empty");
    console.log("      - Each student gets:");
    console.log("        ✓ batch (priority: mapping.timePeriod > academicYear.code)");
    console.log("        ✓ batchYear (same as batch)");
    console.log("   - All data is dynamic from APIs, not hardcoded!");
    console.log("   - Course → Stream → Semester relationships are from real database mappings");
    console.log("   - Only 'Active' mappings are used (Inactive mappings are ignored)");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding students:", error);
    if (error.code === 11000) {
      console.error("   Duplicate key error - some students may already exist");
    }
    process.exit(1);
  }
}

// Run the seed function
seedStudents();

