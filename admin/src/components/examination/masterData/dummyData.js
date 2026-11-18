// Dummy data initialization for Examination Master Data
// This file populates localStorage with sample data for testing

// Helper function to update question papers with new fields (called when data already exists)
function updateQuestionPapersData() {
  const questionPapers = [
    {
      _id: "qp_1",
      subjectId: "sub_1",
      subjectName: "Mathematics",
      subjectCode: "MATH101",
      academicYearId: "ay_1",
      academicYearCode: "2024-25",
      academicYearName: "Academic Year 2024-25",
      paperType: "Paper 1",
      questionPaperNumber: "202425MATH-101P1Q1",
      professorName: "Dr. Rajesh Kumar",
      professorEmployeeId: "EMP001",
      examinationType: "Regular",
      duration: "3 hours",
      totalMarks: "80",
      questions: [
        {
          id: "q1",
          questionType: "Descriptive",
          questionText: "Solve the following differential equation: dy/dx + 2y = e^(-2x)",
          marks: "10",
        },
        {
          id: "q2",
          questionType: "MCQ",
          questionText: "What is the value of ∫(x^2 + 3x + 2)dx?",
          marks: "5",
        },
        {
          id: "q3",
          questionType: "Short Answer",
          questionText: "Explain the concept of limits in calculus.",
          marks: "8",
        },
      ],
      status: "Submitted",
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      reviewedBy: "Dr. Suresh Reddy",
      reviewedByContactNumber: "+91 9876543210",
      reviewedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      pdfBase64: "",
      pdfFileName: "MATH101_Paper_1.pdf",
    },
    {
      _id: "qp_2",
      subjectId: "sub_2",
      subjectName: "Physics",
      subjectCode: "PHY101",
      academicYearId: "ay_1",
      academicYearCode: "2024-25",
      academicYearName: "Academic Year 2024-25",
      paperType: "Paper 1",
      questionPaperNumber: "202425PHY-101P1Q1",
      professorName: "Dr. Priya Sharma",
      professorEmployeeId: "EMP002",
      examinationType: "Regular",
      duration: "3 hours",
      totalMarks: "75",
      questions: [
        {
          id: "q4",
          questionType: "Descriptive",
          questionText: "Derive the equation of motion for a particle under constant acceleration.",
          marks: "15",
        },
        {
          id: "q5",
          questionType: "MCQ",
          questionText: "What is the unit of force in SI system?",
          marks: "2",
        },
      ],
      status: "Submitted",
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      reviewedBy: "Dr. Lakshmi Devi",
      reviewedByContactNumber: "+91 9876543211",
      reviewedDate: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
      pdfBase64: "",
      pdfFileName: "PHY101_Paper_1.pdf",
    },
    {
      _id: "qp_3",
      subjectId: "sub_4",
      subjectName: "Accountancy",
      subjectCode: "ACC101",
      academicYearId: "ay_1",
      academicYearCode: "2024-25",
      academicYearName: "Academic Year 2024-25",
      paperType: "Paper 1",
      questionPaperNumber: "202425ACC-101P1Q1",
      professorName: "Dr. Amit Patel",
      professorEmployeeId: "EMP003",
      examinationType: "Supplementary",
      duration: "3 hours",
      totalMarks: "70",
      questions: [
        {
          id: "q6",
          questionType: "Descriptive",
          questionText: "Explain the double-entry bookkeeping system with examples.",
          marks: "12",
        },
        {
          id: "q7",
          questionType: "Short Answer",
          questionText: "What is the difference between assets and liabilities?",
          marks: "8",
        },
      ],
      status: "Draft",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const existingPapers = JSON.parse(localStorage.getItem("exam_question_papers") || "[]");
  const existingIds = new Set(existingPapers.map(p => p._id));
  
  // Merge: update existing papers with new fields, add new ones
  const updatedPapers = existingPapers.map((paper) => {
    const matchingDummy = questionPapers.find(qp => qp._id === paper._id);
    if (matchingDummy) {
      return {
        ...paper,
        ...matchingDummy,
        // Preserve existing data that might have been modified
        pdfBase64: paper.pdfBase64 || matchingDummy.pdfBase64,
        questions: paper.questions || matchingDummy.questions,
      };
    }
    return paper;
  });
  
  // Add new papers that don't exist
  questionPapers.forEach((dummyPaper) => {
    if (!existingIds.has(dummyPaper._id)) {
      updatedPapers.push(dummyPaper);
    }
  });
  
  localStorage.setItem("exam_question_papers", JSON.stringify(updatedPapers));
}

// Ensure academic years exist and include required fields
function ensureAcademicYearsData() {
  const defaultYears = [
    { _id: "ay_1", code: "2024-25", startDate: "2024-04-01", endDate: "2025-03-31", status: "Active" },
    { _id: "ay_2", code: "2023-24", startDate: "2023-04-01", endDate: "2024-03-31", status: "Active" },
    { _id: "ay_3", code: "2022-23", startDate: "2022-04-01", endDate: "2023-03-31", status: "Inactive" },
  ];
  try {
    const existing = JSON.parse(localStorage.getItem("exam_academicYears") || "[]");
    if (!Array.isArray(existing) || existing.length === 0) {
      localStorage.setItem("exam_academicYears", JSON.stringify(defaultYears));
      return;
    }
    // Merge missing fields without overwriting existing values
    const byId = existing.reduce((acc, y) => { acc[y._id] = y; return acc; }, {});
    defaultYears.forEach((y) => {
      if (!byId[y._id]) {
        byId[y._id] = y;
      } else {
        byId[y._id] = {
          ...y,
          ...byId[y._id],
          startDate: byId[y._id].startDate || y.startDate,
          endDate: byId[y._id].endDate || y.endDate,
          code: byId[y._id].code || y.code,
          status: byId[y._id].status || y.status,
        };
      }
    });
    const merged = Object.values(byId);
    localStorage.setItem("exam_academicYears", JSON.stringify(merged));
  } catch (_) {
    localStorage.setItem("exam_academicYears", JSON.stringify(defaultYears));
  }
}

export const initializeDummyData = () => {
  // Check if data already exists
  if (localStorage.getItem("dummy_data_initialized")) {
    // Update question papers with new fields if needed
    updateQuestionPapersData();
    // Ensure academic years are present
    ensureAcademicYearsData();
    return; // Data already initialized
  }

  // 1. Streams
  const streams = [
    { _id: "stream_1", code: "SCI", name: "Science", definition: "Science stream includes subjects like Physics, Chemistry, Biology, and Mathematics", status: "Active" },
    { _id: "stream_2", code: "COM", name: "Commerce", definition: "Commerce stream includes subjects like Accountancy, Business Studies, Economics, and Mathematics", status: "Active" },
    { _id: "stream_3", code: "ARTS", name: "Arts", definition: "Arts stream includes subjects like History, Geography, Political Science, and Literature", status: "Active" },
  ];
  localStorage.setItem("exam_streams", JSON.stringify(streams));

  // 2. Courses
  const courses = [
    { _id: "course_1", code: "BSC", name: "Bachelor of Science", duration: 3, status: "Active" },
    { _id: "course_2", code: "BCOM", name: "Bachelor of Commerce", duration: 3, status: "Active" },
    { _id: "course_3", code: "BA", name: "Bachelor of Arts", duration: 3, status: "Active" },
    { _id: "course_4", code: "BBA", name: "Bachelor of Business Administration", duration: 3, status: "Active" },
  ];
  localStorage.setItem("exam_courses", JSON.stringify(courses));

  // 3. Academic Years
  const academicYears = [
    { _id: "ay_1", code: "2024-25", startDate: "2024-04-01", endDate: "2025-03-31", status: "Active" },
    { _id: "ay_2", code: "2023-24", startDate: "2023-04-01", endDate: "2024-03-31", status: "Active" },
    { _id: "ay_3", code: "2022-23", startDate: "2022-04-01", endDate: "2023-03-31", status: "Inactive" },
  ];
  localStorage.setItem("exam_academicYears", JSON.stringify(academicYears));

  // 4. Semesters
  const semesters = [
    {
      _id: "sem_1",
      courseId: "course_1",
      courseCode: "BSC",
      courseName: "Bachelor of Science",
      academicYearId: "ay_1",
      academicYearCode: "2024-25",
      // academicYearName: "Academic Year 2024-25",
      semestersOffered: ["SEM1", "SEM2"],
      timePeriod: "Yearly",
      status: "Active",
    },
    {
      _id: "sem_2",
      courseId: "course_2",
      courseCode: "BCOM",
      courseName: "Bachelor of Commerce",
      academicYearId: "ay_1",
      academicYearCode: "2024-25",
      // academicYearName: "Academic Year 2024-25",
      semestersOffered: ["SEM1", "SEM2", "SEM3"],
      timePeriod: "Yearly",
      status: "Active",
    },
  ];
  localStorage.setItem("exam_semesters", JSON.stringify(semesters));

  // 5. Subjects
  const subjects = [
    {
      _id: "sub_1",
      code: "MATH101",
      name: "Mathematics",
      syllabus: "1. Algebra\n2. Calculus\n3. Trigonometry\n4. Statistics\n5. Linear Algebra",
      status: "Active",
    },
    {
      _id: "sub_2",
      code: "PHY101",
      name: "Physics",
      syllabus: "1. Mechanics\n2. Thermodynamics\n3. Optics\n4. Electromagnetism\n5. Modern Physics",
      status: "Active",
    },
    {
      _id: "sub_3",
      code: "CHEM101",
      name: "Chemistry",
      syllabus: "1. Organic Chemistry\n2. Inorganic Chemistry\n3. Physical Chemistry\n4. Analytical Chemistry",
      status: "Active",
    },
    {
      _id: "sub_4",
      code: "ACC101",
      name: "Accountancy",
      syllabus: "1. Financial Accounting\n2. Cost Accounting\n3. Management Accounting\n4. Auditing",
      status: "Active",
    },
    {
      _id: "sub_5",
      code: "ECO101",
      name: "Economics",
      syllabus: "1. Microeconomics\n2. Macroeconomics\n3. International Economics\n4. Development Economics",
      status: "Active",
    },
    {
      _id: "sub_6",
      code: "CS101",
      name: "Computer Science",
      syllabus: "1. Programming Fundamentals\n2. Data Structures\n3. Algorithms\n4. Database Systems\n5. Software Engineering",
      status: "Active",
    },
  ];
  localStorage.setItem("exam_subjects", JSON.stringify(subjects));

  // 6. Examination Centers
  const examinationCenters = [
    {
      _id: "ec_1",
      code: "EC001",
      name: "Main Examination Center",
      collegeId: "col_1",
      address: "123 University Road, City Center",
      capacity: 500,
      rooms: 25,
      contactPerson: "Dr. John Smith",
      contactNumber: "+91 9876543210",
      status: "Active",
    },
    {
      _id: "ec_2",
      code: "EC002",
      name: "North Campus Center",
      collegeId: "col_2",
      address: "456 North Avenue, North Campus",
      capacity: 300,
      rooms: 15,
      contactPerson: "Dr. Jane Doe",
      contactNumber: "+91 9876543211",
      status: "Active",
    },
  ];
  localStorage.setItem("exam_examinationCenters", JSON.stringify(examinationCenters));

  // 7. Colleges (using mock API structure)
  // Note: This might be loaded from API, but we'll add dummy data
  const colleges = [
    { _id: "col_1", code: "COL001", name: "Main College Campus", status: "Active" },
    { _id: "col_2", code: "COL002", name: "North Campus", status: "Active" },
    { _id: "col_3", code: "COL003", name: "South Campus", status: "Active" },
  ];
  // Store in a way that matches API structure if needed
  localStorage.setItem("exam_colleges_dummy", JSON.stringify(colleges));

  // 8. Professors
  const professors = [
    {
      _id: "prof_1",
      name: "Dr. Rajesh Kumar",
      professorId: "EMP001",
      designation: "Professor",
      subjectIds: ["sub_1", "sub_6"],
      status: "Active",
    },
    {
      _id: "prof_2",
      name: "Dr. Priya Sharma",
      professorId: "EMP002",
      designation: "Associate Professor",
      subjectIds: ["sub_2", "sub_3"],
      status: "Active",
    },
    {
      _id: "prof_3",
      name: "Dr. Amit Patel",
      professorId: "EMP003",
      designation: "Assistant Professor",
      subjectIds: ["sub_4", "sub_5"],
      status: "Active",
    },
    {
      _id: "prof_4",
      name: "Dr. Sneha Reddy",
      professorId: "EMP004",
      designation: "Professor",
      subjectIds: ["sub_6"],
      status: "Active",
    },
  ];
  localStorage.setItem("exam_professors", JSON.stringify(professors));

  // 9. Students
  const students = [
    {
      _id: "stu_1",
      studentId: "STU001",
      name: "Rahul Verma",
      email: "rahul.verma@example.com",
      collegeId: "col_1",
      collegeCode: "COL001",
      collegeName: "Main College Campus",
      courseId: "course_1",
      courseCode: "BSC",
      courseName: "Bachelor of Science",
      streamId: "stream_1",
      streamCode: "SCI",
      streamName: "Science",
      status: "Active",
      notes: "",
    },
    {
      _id: "stu_2",
      studentId: "STU002",
      name: "Anjali Singh",
      email: "anjali.singh@example.com",
      collegeId: "col_1",
      collegeCode: "COL001",
      collegeName: "Main College Campus",
      courseId: "course_2",
      courseCode: "BCOM",
      courseName: "Bachelor of Commerce",
      streamId: "stream_2",
      streamCode: "COM",
      streamName: "Commerce",
      status: "Active",
      notes: "",
    },
    {
      _id: "stu_3",
      studentId: "STU003",
      name: "Vikram Mehta",
      email: "vikram.mehta@example.com",
      collegeId: "col_2",
      collegeCode: "COL002",
      collegeName: "North Campus",
      courseId: "course_1",
      courseCode: "BSC",
      courseName: "Bachelor of Science",
      streamId: "stream_1",
      streamCode: "SCI",
      streamName: "Science",
      status: "Active",
      notes: "",
    },
  ];
  localStorage.setItem("exam_students", JSON.stringify(students));

  // 10. Invigilators
  const invigilators = [
    {
      _id: "inv_1",
      name: "Dr. Ramesh Kumar",
      invigilatorCode: "INV-001",
      collegeId: "col_1",
      collegeCode: "COL001",
      collegeName: "Main College Campus",
      role: "Coordinator",
      date: "2024-01-15",
      year: "2024-25",
      status: "Active",
      notes: "Senior coordinator with 10 years experience",
    },
    {
      _id: "inv_2",
      name: "Prof. Sunita Sharma",
      invigilatorCode: "INV-002",
      collegeId: "col_1",
      collegeCode: "COL001",
      collegeName: "Main College Campus",
      role: "Invigilator",
      date: "2024-01-20",
      year: "2024-25",
      status: "Active",
      notes: "",
    },
    {
      _id: "inv_3",
      name: "Mr. Anil Patel",
      invigilatorCode: "INV-003",
      collegeId: "col_2",
      collegeCode: "COL002",
      collegeName: "North Campus",
      role: "Squad",
      date: "2024-02-01",
      year: "2024-25",
      status: "Active",
      notes: "Mobile squad member",
    },
    {
      _id: "inv_4",
      name: "Dr. Priya Reddy",
      invigilatorCode: "INV-004",
      collegeId: "col_2",
      collegeCode: "COL002",
      collegeName: "North Campus",
      role: "Invigilator",
      date: "2024-02-05",
      year: "2024-25",
      status: "Active",
      notes: "",
    },
  ];
  localStorage.setItem("exam_invigilators", JSON.stringify(invigilators));

  // 11. Timetable Entries
  const timetableEntries = [];
  localStorage.setItem("exam_timetable_entries", JSON.stringify(timetableEntries));

  // 11. Question Papers (with status and submitted date for admin view)
  const questionPapers = [
    {
      _id: "qp_1",
      subjectId: "sub_1",
      subjectName: "Mathematics",
      subjectCode: "MATH101",
      academicYearId: "ay_1",
      academicYearCode: "2024-25",
      academicYearName: "Academic Year 2024-25",
      paperType: "Paper 1",
      questionPaperNumber: "202425MATH-101P1Q1",
      professorName: "Dr. Rajesh Kumar",
      professorEmployeeId: "EMP001",
      examinationType: "Regular",
      duration: "3 hours",
      totalMarks: "80",
      questions: [
        {
          id: "q1",
          questionType: "Descriptive",
          questionText: "Solve the following differential equation: dy/dx + 2y = e^(-2x)",
          marks: "10",
        },
        {
          id: "q2",
          questionType: "MCQ",
          questionText: "What is the value of ∫(x^2 + 3x + 2)dx?",
          marks: "5",
        },
        {
          id: "q3",
          questionType: "Short Answer",
          questionText: "Explain the concept of limits in calculus.",
          marks: "8",
        },
      ],
      status: "Submitted",
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      reviewedBy: "Dr. Suresh Reddy",
      reviewedByContactNumber: "+91 9876543210",
      reviewedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      pdfBase64: "", // Will be generated when professor submits
      pdfFileName: "MATH101_Paper_1.pdf",
    },
    {
      _id: "qp_2",
      subjectId: "sub_2",
      subjectName: "Physics",
      subjectCode: "PHY101",
      academicYearId: "ay_1",
      academicYearCode: "2024-25",
      academicYearName: "Academic Year 2024-25",
      paperType: "Paper 1",
      questionPaperNumber: "202425PHY-101P1Q1",
      professorName: "Dr. Priya Sharma",
      professorEmployeeId: "EMP002",
      examinationType: "Regular",
      duration: "3 hours",
      totalMarks: "75",
      questions: [
        {
          id: "q4",
          questionType: "Descriptive",
          questionText: "Derive the equation of motion for a particle under constant acceleration.",
          marks: "15",
        },
        {
          id: "q5",
          questionType: "MCQ",
          questionText: "What is the unit of force in SI system?",
          marks: "2",
        },
      ],
      status: "Submitted",
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      reviewedBy: "Dr. Lakshmi Devi",
      reviewedByContactNumber: "+91 9876543211",
      reviewedDate: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      pdfBase64: "", // Will be generated when professor submits
      pdfFileName: "PHY101_Paper_1.pdf",
    },
    {
      _id: "qp_3",
      subjectId: "sub_4",
      subjectName: "Accountancy",
      subjectCode: "ACC101",
      academicYearId: "ay_1",
      academicYearCode: "2024-25",
      academicYearName: "Academic Year 2024-25",
      paperType: "Paper 1",
      questionPaperNumber: "202425ACC-101P1Q1",
      professorName: "Dr. Amit Patel",
      professorEmployeeId: "EMP003",
      examinationType: "Supplementary",
      duration: "3 hours",
      totalMarks: "70",
      questions: [
        {
          id: "q6",
          questionType: "Descriptive",
          questionText: "Explain the double-entry bookkeeping system with examples.",
          marks: "12",
        },
        {
          id: "q7",
          questionType: "Short Answer",
          questionText: "What is the difference between assets and liabilities?",
          marks: "8",
        },
      ],
      status: "Draft",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
  ];
  localStorage.setItem("exam_question_papers", JSON.stringify(questionPapers));

  // 12. Subject-Professor Mappings
  const subjectProfessorMappings = [
    {
      _id: "mapping_1",
      subjectId: "sub_1",
      subjectName: "Mathematics",
      subjectCode: "MATH101",
      paperType: "Paper 1",
      professorId: "prof_1",
      professorName: "Dr. Rajesh Kumar",
      professorCode: "EMP001",
      examinationType: "Regular",
      status: "Active",
      notes: "Deadline: 2024-12-10",
      assignedAt: new Date("2024-11-01").toISOString(),
    },
    {
      _id: "mapping_2",
      subjectId: "sub_2",
      subjectName: "Physics",
      subjectCode: "PHY101",
      paperType: "Paper 1",
      professorId: "prof_2",
      professorName: "Dr. Priya Sharma",
      professorCode: "EMP002",
      examinationType: "Regular",
      status: "Active",
      notes: "Deadline: 2024-12-11",
      assignedAt: new Date("2024-11-02").toISOString(),
    },
    {
      _id: "mapping_3",
      subjectId: "sub_4",
      subjectName: "Accountancy",
      subjectCode: "ACC101",
      paperType: "Paper 1",
      professorId: "prof_3",
      professorName: "Dr. Amit Patel",
      professorCode: "EMP003",
      examinationType: "Supplementary",
      status: "Active",
      notes: "Deadline: 2024-12-12",
      assignedAt: new Date("2024-11-03").toISOString(),
    },
  ];
  localStorage.setItem("exam_subject_professor_mapping", JSON.stringify(subjectProfessorMappings));

  // 13. Exam Center-College Mappings
  const examCenterCollegeMappings = [
    {
      _id: "eccm_1",
      examCenterId: "ec_1",
      examCenterName: "Main Examination Center",
      examCenterCode: "EC001",
      collegeId: "col_1",
      collegeName: "Main College Campus",
      collegeCode: "COL001",
      status: "Active",
      notes: "Primary examination center for main campus",
    },
    {
      _id: "eccm_2",
      examCenterId: "ec_2",
      examCenterName: "North Campus Center",
      examCenterCode: "EC002",
      collegeId: "col_2",
      collegeName: "North Campus",
      collegeCode: "COL002",
      status: "Active",
      notes: "",
    },
    {
      _id: "eccm_3",
      examCenterId: "ec_3",
      examCenterName: "South Campus Center",
      examCenterCode: "EC003",
      collegeId: "col_1",
      collegeName: "Main College Campus",
      collegeCode: "COL001",
      status: "Active",
      notes: "Secondary center for overflow students",
    },
  ];
  localStorage.setItem("exam_examCenterCollegeMappings", JSON.stringify(examCenterCollegeMappings));

  // 14. Exam Center-Student Mappings
  const examCenterStudentMappings = [
    {
      _id: "ecsm_1",
      examCenterId: "ec_1",
      examCenterName: "Main Examination Center",
      examCenterCode: "EC001",
      collegeId: "col_1",
      collegeName: "Main College Campus",
      collegeCode: "COL001",
      fromRoll: "STU001",
      toRoll: "STU050",
      invigilatorId: "inv_1",
      invigilatorName: "Dr. Ramesh Kumar",
      invigilatorCode: "INV-001",
      status: "Active",
      notes: "First batch of students",
    },
    {
      _id: "ecsm_2",
      examCenterId: "ec_2",
      examCenterName: "North Campus Center",
      examCenterCode: "EC002",
      collegeId: "col_2",
      collegeName: "North Campus",
      collegeCode: "COL002",
      fromRoll: "STU051",
      toRoll: "STU100",
      invigilatorId: "inv_3",
      invigilatorName: "Mr. Anil Patel",
      invigilatorCode: "INV-003",
      status: "Active",
      notes: "",
    },
    {
      _id: "ecsm_3",
      examCenterId: "ec_1",
      examCenterName: "Main Examination Center",
      examCenterCode: "EC001",
      collegeId: "col_1",
      collegeName: "Main College Campus",
      collegeCode: "COL001",
      fromRoll: "STU101",
      toRoll: "STU150",
      invigilatorId: "inv_2",
      invigilatorName: "Prof. Sunita Sharma",
      invigilatorCode: "INV-002",
      status: "Active",
      notes: "Second batch allocation",
    },
    {
      _id: "ecsm_4",
      examCenterId: "ec_3",
      examCenterName: "South Campus Center",
      examCenterCode: "EC003",
      collegeId: "col_1",
      collegeName: "Main College Campus",
      collegeCode: "COL001",
      fromRoll: "STU151",
      toRoll: "STU200",
      invigilatorId: "inv_1",
      invigilatorName: "Dr. Ramesh Kumar",
      invigilatorCode: "INV-001",
      status: "Active",
      notes: "Overflow students from main center",
    },
  ];
  localStorage.setItem("exam_examCenterStudentMappings", JSON.stringify(examCenterStudentMappings));

  // 15. Room-Student Mappings
  const roomStudentMappings = [
    {
      _id: "rsm_1",
      roomName: "Room 101",
      roomCode: "R101",
      examCenterId: "ec_1",
      examCenterName: "Main Examination Center",
      examCenterCode: "EC001",
      collegeId: "col_1",
      collegeName: "Main College Campus",
      collegeCode: "COL001",
      fromRoll: "STU001",
      toRoll: "STU025",
      invigilatorId: "inv_1",
      invigilatorName: "Dr. Ramesh Kumar",
      invigilatorCode: "INV-001",
      status: "Active",
      notes: "Ground floor, capacity: 25 students",
    },
    {
      _id: "rsm_2",
      roomName: "Room 102",
      roomCode: "R102",
      examCenterId: "ec_1",
      examCenterName: "Main Examination Center",
      examCenterCode: "EC001",
      collegeId: "col_1",
      collegeName: "Main College Campus",
      collegeCode: "COL001",
      fromRoll: "STU026",
      toRoll: "STU050",
      invigilatorId: "inv_2",
      invigilatorName: "Prof. Sunita Sharma",
      invigilatorCode: "INV-002",
      status: "Active",
      notes: "Ground floor, adjacent to Room 101",
    },
    {
      _id: "rsm_3",
      roomName: "Room 201",
      roomCode: "R201",
      examCenterId: "ec_1",
      examCenterName: "Main Examination Center",
      examCenterCode: "EC001",
      collegeId: "col_1",
      collegeName: "Main College Campus",
      collegeCode: "COL001",
      fromRoll: "STU051",
      toRoll: "STU075",
      invigilatorId: "inv_1",
      invigilatorName: "Dr. Ramesh Kumar",
      invigilatorCode: "INV-001",
      status: "Active",
      notes: "First floor, large hall",
    },
    {
      _id: "rsm_4",
      roomName: "Room 202",
      roomCode: "R202",
      examCenterId: "ec_2",
      examCenterName: "North Campus Center",
      examCenterCode: "EC002",
      collegeId: "col_2",
      collegeName: "North Campus",
      collegeCode: "COL002",
      fromRoll: "STU051",
      toRoll: "STU080",
      invigilatorId: "inv_3",
      invigilatorName: "Mr. Anil Patel",
      invigilatorCode: "INV-003",
      status: "Active",
      notes: "",
    },
    {
      _id: "rsm_5",
      roomName: "Room 301",
      roomCode: "R301",
      examCenterId: "ec_2",
      examCenterName: "North Campus Center",
      examCenterCode: "EC002",
      collegeId: "col_2",
      collegeName: "North Campus",
      collegeCode: "COL002",
      fromRoll: "STU081",
      toRoll: "STU100",
      invigilatorId: "inv_4",
      invigilatorName: "Dr. Priya Reddy",
      invigilatorCode: "INV-004",
      status: "Active",
      notes: "Third floor, air-conditioned",
    },
    {
      _id: "rsm_6",
      roomName: "Auditorium A",
      roomCode: "AUD-A",
      examCenterId: "ec_3",
      examCenterName: "South Campus Center",
      examCenterCode: "EC003",
      collegeId: "col_1",
      collegeName: "Main College Campus",
      collegeCode: "COL001",
      fromRoll: "STU151",
      toRoll: "STU200",
      invigilatorId: "inv_1",
      invigilatorName: "Dr. Ramesh Kumar",
      invigilatorCode: "INV-001",
      status: "Active",
      notes: "Large auditorium for major examinations",
    },
  ];
  localStorage.setItem("exam_roomStudentMapping", JSON.stringify(roomStudentMappings));

  // 16. Exam Center-Question Paper Mappings
  const examCenterQuestionPaperMappings = [
    {
      _id: "ecqpm_1",
      examCenterId: "ec_1",
      examCenterName: "Main Examination Center",
      examCenterCode: "EC001",
      questionPaperId: "qp_1",
      questionPaperNumber: "202425MATH-101P1Q1",
      subjectName: "Mathematics",
      subjectCode: "MATH101",
      paperType: "Paper 1",
      status: "Active",
      notes: "Regular examination",
    },
    {
      _id: "ecqpm_2",
      examCenterId: "ec_1",
      examCenterName: "Main Examination Center",
      examCenterCode: "EC001",
      questionPaperId: "qp_2",
      questionPaperNumber: "202425PHY-101P1Q1",
      subjectName: "Physics",
      subjectCode: "PHY101",
      paperType: "Paper 1",
      status: "Active",
      notes: "Regular examination",
    },
    {
      _id: "ecqpm_3",
      examCenterId: "ec_2",
      examCenterName: "North Campus Center",
      examCenterCode: "EC002",
      questionPaperId: "qp_1",
      questionPaperNumber: "202425MATH-101P1Q1",
      subjectName: "Mathematics",
      subjectCode: "MATH101",
      paperType: "Paper 1",
      status: "Active",
      notes: "Regular examination",
    },
  ];
  localStorage.setItem("exam_examCenterQuestionPaperMappings", JSON.stringify(examCenterQuestionPaperMappings));

  // 17. Course-Stream Mappings
  const courseStreamMappings = [
    {
      _id: "csm_1",
      courseId: "course_1",
      courseCode: "BSC",
      courseName: "Bachelor of Science",
      streamId: "stream_1",
      streamCode: "SCI",
      streamName: "Science",
      status: "Active",
    },
    {
      _id: "csm_2",
      courseId: "course_2",
      courseCode: "BCOM",
      courseName: "Bachelor of Commerce",
      streamId: "stream_2",
      streamCode: "COM",
      streamName: "Commerce",
      status: "Active",
    },
  ];
  localStorage.setItem("exam_courseStreamMapping", JSON.stringify(courseStreamMappings));

  // 17. Stream-Subject Mappings
  const streamSubjectMappings = [
    {
      _id: "ssm_1",
      streamId: "stream_1",
      streamCode: "SCI",
      streamName: "Science",
      subjectId: "sub_1",
      subjectCode: "MATH101",
      subjectName: "Mathematics",
      status: "Active",
    },
    {
      _id: "ssm_2",
      streamId: "stream_1",
      streamCode: "SCI",
      streamName: "Science",
      subjectId: "sub_2",
      subjectCode: "PHY101",
      subjectName: "Physics",
      status: "Active",
    },
    {
      _id: "ssm_3",
      streamId: "stream_1",
      streamCode: "SCI",
      streamName: "Science",
      subjectId: "sub_3",
      subjectCode: "CHEM101",
      subjectName: "Chemistry",
      status: "Active",
    },
    {
      _id: "ssm_4",
      streamId: "stream_2",
      streamCode: "COM",
      streamName: "Commerce",
      subjectId: "sub_4",
      subjectCode: "ACC101",
      subjectName: "Accountancy",
      status: "Active",
    },
    {
      _id: "ssm_5",
      streamId: "stream_2",
      streamCode: "COM",
      streamName: "Commerce",
      subjectId: "sub_5",
      subjectCode: "ECO101",
      subjectName: "Economics",
      status: "Active",
    },
  ];
  localStorage.setItem("exam_streamSubjectMapping", JSON.stringify(streamSubjectMappings));

  // 18. Examination Fees (if needed)
  const examinationFees = [
    {
      _id: "fee_1",
      campusId: "col_1",
      courseId: "course_1",
      streamId: "stream_1",
      academicYearId: "ay_1",
      semesterId: "sem_1",
      subjectId: "sub_1",
      mode: "Regular",
      years: [
        {
          year: 1,
          fees: [
            { feeType: "Examination Fee", feeAmount: 500, remarks: "" },
            { feeType: "Late Fee", feeAmount: 100, remarks: "" },
          ],
        },
      ],
    },
  ];
  localStorage.setItem("exam_examinationFees", JSON.stringify(examinationFees));

  // 19. Master Mapping
  const masterMappings = [
    {
      _id: "mm_1",
      courseId: "course_1",
      courseName: "Bachelor of Science",
      courseCode: "BSC",
      streamId: "stream_1",
      streamName: "Science",
      streamCode: "SCI",
      courseType: "Science",
      courseDuration: "3 years",
      semesters: "6sems",
      semesterSubjects: [
        { 
          semester: 1, 
          subjects: [
            { subjectId: "sub_1", syllabus: "Introduction to Mathematics, Algebra, Calculus basics" },
            { subjectId: "sub_2", syllabus: "Physics fundamentals, Mechanics, Thermodynamics" }
          ]
        },
        { 
          semester: 2, 
          subjects: [
            { subjectId: "sub_3", syllabus: "Chemistry basics, Organic Chemistry, Inorganic Chemistry" }
          ]
        },
        { 
          semester: 3, 
          subjects: [
            { subjectId: "sub_1", syllabus: "Advanced Mathematics, Differential Equations" },
            { subjectId: "sub_3", syllabus: "Physical Chemistry, Chemical Bonding" }
          ]
        },
        { 
          semester: 4, 
          subjects: [
            { subjectId: "sub_2", syllabus: "Electromagnetism, Optics, Modern Physics" }
          ]
        },
        { 
          semester: 5, 
          subjects: [
            { subjectId: "sub_1", syllabus: "Linear Algebra, Statistics" },
            { subjectId: "sub_2", syllabus: "Quantum Mechanics, Nuclear Physics" },
            { subjectId: "sub_3", syllabus: "Biochemistry, Analytical Chemistry" }
          ]
        },
        { 
          semester: 6, 
          subjects: [
            { subjectId: "sub_1", syllabus: "Mathematical Modeling, Numerical Methods" }
          ]
        },
      ],
      timePeriod: "Yearly",
      notes: "Core science subjects with practical components",
    },
    {
      _id: "mm_2",
      courseId: "course_2",
      courseName: "Bachelor of Commerce",
      courseCode: "BCOM",
      streamId: "stream_2",
      streamName: "Commerce",
      streamCode: "COM",
      courseType: "Commerce",
      courseDuration: "3 years",
      semesters: "6sems",
      semesterSubjects: [
        { 
          semester: 1, 
          subjects: [
            { subjectId: "sub_4", syllabus: "Financial Accounting, Book Keeping, Journal Entries" },
            { subjectId: "sub_5", syllabus: "Microeconomics, Market Structures, Demand and Supply" }
          ]
        },
        { 
          semester: 2, 
          subjects: [
            { subjectId: "sub_4", syllabus: "Cost Accounting, Management Accounting" }
          ]
        },
        { 
          semester: 3, 
          subjects: [
            { subjectId: "sub_5", syllabus: "Macroeconomics, National Income, Fiscal Policy" }
          ]
        },
        { 
          semester: 4, 
          subjects: [
            { subjectId: "sub_4", syllabus: "Auditing, Corporate Accounting" },
            { subjectId: "sub_5", syllabus: "International Economics, Trade Theory" }
          ]
        },
        { 
          semester: 5, 
          subjects: [
            { subjectId: "sub_4", syllabus: "Taxation, GST, Income Tax" }
          ]
        },
        { 
          semester: 6, 
          subjects: [
            { subjectId: "sub_5", syllabus: "Business Economics, Economic Planning" }
          ]
        },
      ],
      timePeriod: "Yearly",
      notes: "Commerce stream with business focus",
    },
    {
      _id: "mm_3",
      courseId: "course_3",
      courseName: "Bachelor of Engineering",
      courseCode: "B.Tech",
      streamId: "stream_1",
      streamName: "Science",
      streamCode: "SCI",
      courseType: "Engineering",
      courseDuration: "4 years",
      semesters: "8sems",
      semesterSubjects: [
        { 
          semester: 1, 
          subjects: [
            { subjectId: "sub_1", syllabus: "Engineering Mathematics I, Calculus, Linear Algebra" },
            { subjectId: "sub_2", syllabus: "Engineering Physics, Mechanics, Waves" }
          ]
        },
        { 
          semester: 2, 
          subjects: [
            { subjectId: "sub_3", syllabus: "Engineering Chemistry, Materials Science" }
          ]
        },
        { 
          semester: 3, 
          subjects: [
            { subjectId: "sub_1", syllabus: "Engineering Mathematics II, Differential Equations" },
            { subjectId: "sub_2", syllabus: "Electronics, Circuit Analysis" },
            { subjectId: "sub_3", syllabus: "Programming Fundamentals, C Programming" }
          ]
        },
        { 
          semester: 4, 
          subjects: [
            { subjectId: "sub_1", syllabus: "Discrete Mathematics, Graph Theory" }
          ]
        },
        { 
          semester: 5, 
          subjects: [
            { subjectId: "sub_2", syllabus: "Digital Electronics, Microprocessors" },
            { subjectId: "sub_3", syllabus: "Data Structures, Algorithms" }
          ]
        },
        { 
          semester: 6, 
          subjects: [
            { subjectId: "sub_1", syllabus: "Probability and Statistics" },
            { subjectId: "sub_3", syllabus: "Database Management Systems, SQL" }
          ]
        },
        { 
          semester: 7, 
          subjects: [
            { subjectId: "sub_2", syllabus: "Computer Networks, Network Protocols" }
          ]
        },
        { 
          semester: 8, 
          subjects: [
            { subjectId: "sub_1", syllabus: "Operations Research, Optimization" },
            { subjectId: "sub_2", syllabus: "Embedded Systems, IoT" },
            { subjectId: "sub_3", syllabus: "Software Engineering, Project Management" }
          ]
        },
      ],
      timePeriod: "Yearly",
      notes: "Engineering course with 8 semesters",
    },
  ];
  localStorage.setItem("exam_masterMappings", JSON.stringify(masterMappings));

  // Mark as initialized
  localStorage.setItem("dummy_data_initialized", "true");
  console.log("Dummy data initialization complete!");
};

// Helper function to get dummy colleges (for API fallback)
export const getDummyColleges = () => {
  const stored = localStorage.getItem("exam_colleges_dummy");
  return stored ? JSON.parse(stored) : [];
};

// Helper function to get dummy courses (for API fallback)
export const getDummyCourses = () => {
  const stored = localStorage.getItem("exam_courses");
  return stored ? JSON.parse(stored) : [];
};

// Function to clear all dummy data (useful for testing)
export const clearDummyData = () => {
  const keys = [
    "exam_streams",
    "exam_courses",
    "exam_academicYears",
    "exam_semesters",
    "exam_subjects",
    "exam_examinationCenters",
    "exam_colleges_dummy",
    "exam_professors",
    "exam_students",
    "exam_invigilators",
    "exam_timetable_entries",
    "exam_question_papers",
    "exam_subject_professor_mapping",
    "exam_examCenterCollegeMapping",
    "exam_examCenterStudentMapping",
    "exam_roomStudentMapping",
    "exam_courseStreamMapping",
    "exam_streamSubjectMapping",
    "exam_examinationFees",
    "exam_masterMappings",
    "dummy_data_initialized",
  ];
  keys.forEach((key) => localStorage.removeItem(key));
};

