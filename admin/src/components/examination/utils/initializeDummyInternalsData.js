// Utility to initialize dummy internal marks data for demo purposes

export const initializeDummyInternalsData = () => {
  // Check if already initialized
  if (localStorage.getItem("dummy_internals_initialized")) {
    return;
  }

  const studentNames = [
    "Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sneha Reddy", "Vikram Singh",
    "Anjali Mehta", "Rahul Gupta", "Kavya Nair", "Suresh Rao", "Divya Iyer",
    "Mohan Das", "Lakshmi Menon", "Karthik Pillai", "Swati Joshi", "Rohan Malhotra",
  ];

  // Helper function to calculate attendance marks
  const getAttendanceMarks = (percentage) => {
    if (percentage >= 90) return 5;
    if (percentage >= 80) return 4;
    if (percentage >= 70) return 3;
    if (percentage >= 60) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  // Generate student marks data
  const generateTheoryMarks = () => {
    const marksData = {};
    studentNames.forEach((name, idx) => {
      const studentId = `stu-${idx + 1}`;
      
      // Last 2 students absent
      if (idx >= studentNames.length - 2) {
        marksData[studentId] = {
          test1: "",
          test2: "",
          assignment: "",
          attendancePercentage: "",
          absent: true,
        };
      } else {
        // Generate realistic marks based on performance tier
        const performanceRatio = idx < 5 ? 0.85 : idx < 10 ? 0.75 : 0.65;
        const variation = (Math.random() - 0.5) * 0.15;
        const ratio = Math.max(0.60, Math.min(0.98, performanceRatio + variation));

        const test1 = Math.round(15 * ratio * 10) / 10;
        const test2 = Math.round(15 * (ratio + (Math.random() - 0.5) * 0.1) * 10) / 10;
        const assignment = Math.round(5 * (0.80 + Math.random() * 0.15) * 10) / 10;
        const attendancePercentage = Math.round((75 + Math.random() * 20) * 10) / 10;

        marksData[studentId] = {
          test1: Math.max(0, Math.min(15, test1)).toString(),
          test2: Math.max(0, Math.min(15, test2)).toString(),
          assignment: Math.max(0, Math.min(5, assignment)).toString(),
          attendancePercentage: Math.max(0, Math.min(100, attendancePercentage)).toString(),
          attendanceMarks: getAttendanceMarks(attendancePercentage).toString(),
          absent: false,
        };
      }
    });
    return marksData;
  };

  const generateLabMarks = () => {
    const marksData = {};
    studentNames.forEach((name, idx) => {
      const studentId = `stu-${idx + 1}`;
      
      if (idx >= studentNames.length - 2) {
        marksData[studentId] = {
          record: "",
          performance: "",
          internalTest: "",
          viva: "",
          absent: true,
        };
      } else {
        const performanceRatio = idx < 5 ? 0.85 : idx < 10 ? 0.75 : 0.65;
        const variation = (Math.random() - 0.5) * 0.15;
        const ratio = Math.max(0.60, Math.min(0.98, performanceRatio + variation));

        const record = Math.round(10 * ratio * 10) / 10;
        const performance = Math.round(10 * ratio * 10) / 10;
        const internalTest = Math.round(15 * ratio * 10) / 10;
        const viva = Math.round(15 * (ratio + (Math.random() - 0.5) * 0.1) * 10) / 10;

        marksData[studentId] = {
          record: Math.max(0, Math.min(10, record)).toString(),
          performance: Math.max(0, Math.min(10, performance)).toString(),
          internalTest: Math.max(0, Math.min(15, internalTest)).toString(),
          viva: Math.max(0, Math.min(15, viva)).toString(),
          absent: false,
        };
      }
    });
    return marksData;
  };

  // 1. THEORY INTERNALS - DRAFT STATUS (Data Structures - Section A)
  const theoryDraft = {
    marksData: generateTheoryMarks(),
    status: "draft",
    hodStatus: "PENDING",
    type: "THEORY",
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem("theory_internals_sub-1_A_2024-25_Semester 3", JSON.stringify(theoryDraft));

  // 2. THEORY INTERNALS - SUBMITTED STATUS (Data Structures - Section B)
  const theorySubmitted = {
    marksData: generateTheoryMarks(),
    status: "submitted",
    hodStatus: "PENDING",
    type: "THEORY",
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  };
  localStorage.setItem("theory_internals_sub-1_B_2024-25_Semester 3", JSON.stringify(theorySubmitted));

  // 3. THEORY INTERNALS - APPROVED STATUS (Database Systems - Section A)
  const theoryApproved = {
    marksData: generateTheoryMarks(),
    status: "submitted",
    hodStatus: "APPROVED",
    type: "THEORY",
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  };
  localStorage.setItem("theory_internals_sub-2_A_2024-25_Semester 4", JSON.stringify(theoryApproved));

  // 4. LAB INTERNALS - DRAFT STATUS (Data Structures Lab - Section A)
  const labDraft = {
    marksData: generateLabMarks(),
    status: "draft",
    hodStatus: "PENDING",
    type: "LAB",
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem("lab_internals_lab-1_A_2024-25_Semester 3", JSON.stringify(labDraft));

  // 5. LAB INTERNALS - SUBMITTED STATUS (Data Structures Lab - Section B)
  const labSubmitted = {
    marksData: generateLabMarks(),
    status: "submitted",
    hodStatus: "PENDING",
    type: "LAB",
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  };
  localStorage.setItem("lab_internals_lab-1_B_2024-25_Semester 3", JSON.stringify(labSubmitted));

  // 6. LAB INTERNALS - APPROVED STATUS (Database Systems Lab - Section A)
  const labApproved = {
    marksData: generateLabMarks(),
    status: "submitted",
    hodStatus: "APPROVED",
    type: "LAB",
    submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  };
  localStorage.setItem("lab_internals_lab-2_A_2024-25_Semester 4", JSON.stringify(labApproved));

  // Additional entries for HOD Review - More subjects and sections

  // 7. THEORY INTERNALS - SUBMITTED (Computer Networks - Section A - Semester 3)
  const theoryCNSubmitted = {
    marksData: generateTheoryMarks(),
    status: "submitted",
    hodStatus: "PENDING",
    type: "THEORY",
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  };
  localStorage.setItem("theory_internals_sub-3_A_2024-25_Semester 3", JSON.stringify(theoryCNSubmitted));

  // 8. THEORY INTERNALS - SUBMITTED (Computer Networks - Section B - Semester 3)
  const theoryCNSubmittedB = {
    marksData: generateTheoryMarks(),
    status: "submitted",
    hodStatus: "PENDING",
    type: "THEORY",
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  };
  localStorage.setItem("theory_internals_sub-3_B_2024-25_Semester 3", JSON.stringify(theoryCNSubmittedB));

  // 9. THEORY INTERNALS - APPROVED (Database Systems - Section B - Semester 4)
  const theoryDBMSApprovedB = {
    marksData: generateTheoryMarks(),
    status: "submitted",
    hodStatus: "APPROVED",
    type: "THEORY",
    submittedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
  };
  localStorage.setItem("theory_internals_sub-2_B_2024-25_Semester 4", JSON.stringify(theoryDBMSApprovedB));

  // 10. THEORY INTERNALS - SUBMITTED (Data Structures - Section C - Semester 3)
  const theoryDSASubmittedC = {
    marksData: generateTheoryMarks(),
    status: "submitted",
    hodStatus: "PENDING",
    type: "THEORY",
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  };
  localStorage.setItem("theory_internals_sub-1_C_2024-25_Semester 3", JSON.stringify(theoryDSASubmittedC));

  // 11. LAB INTERNALS - SUBMITTED (Database Systems Lab - Section B - Semester 4)
  const labDBMSSubmittedB = {
    marksData: generateLabMarks(),
    status: "submitted",
    hodStatus: "PENDING",
    type: "LAB",
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  };
  localStorage.setItem("lab_internals_lab-2_B_2024-25_Semester 4", JSON.stringify(labDBMSSubmittedB));

  // 12. LAB INTERNALS - APPROVED (Database Systems Lab - Section C - Semester 4)
  const labDBMSApprovedC = {
    marksData: generateLabMarks(),
    status: "submitted",
    hodStatus: "APPROVED",
    type: "LAB",
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  };
  localStorage.setItem("lab_internals_lab-2_C_2024-25_Semester 4", JSON.stringify(labDBMSApprovedC));

  // 13. LAB INTERNALS - SUBMITTED (Computer Networks Lab - Section A - Semester 3)
  const labCNSubmitted = {
    marksData: generateLabMarks(),
    status: "submitted",
    hodStatus: "PENDING",
    type: "LAB",
    submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
  };
  localStorage.setItem("lab_internals_lab-3_A_2024-25_Semester 3", JSON.stringify(labCNSubmitted));

  // 14. THEORY INTERNALS - DRAFT (Computer Networks - Section C - Semester 3)
  const theoryCNDraftC = {
    marksData: generateTheoryMarks(),
    status: "draft",
    hodStatus: "PENDING",
    type: "THEORY",
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem("theory_internals_sub-3_C_2024-25_Semester 3", JSON.stringify(theoryCNDraftC));

  // 15. THEORY INTERNALS - APPROVED (Data Structures - Section D - Semester 3)
  const theoryDSAApprovedD = {
    marksData: generateTheoryMarks(),
    status: "submitted",
    hodStatus: "APPROVED",
    type: "THEORY",
    submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  };
  localStorage.setItem("theory_internals_sub-1_D_2024-25_Semester 3", JSON.stringify(theoryDSAApprovedD));

  // 16. LAB INTERNALS - DRAFT (Computer Networks Lab - Section B - Semester 3)
  const labCNDraftB = {
    marksData: generateLabMarks(),
    status: "draft",
    hodStatus: "PENDING",
    type: "LAB",
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem("lab_internals_lab-3_B_2024-25_Semester 3", JSON.stringify(labCNDraftB));

  // 17. Internal Exam Setup Configurations
  const examConfigs = [
    {
      id: "config_mids_1",
      academicYear: "2024-25",
      semester: "Semester 3",
      examType: "Mids",
      maxMarks: "30",
      passMarks: "12",
      totalInternalMarks: "30",
      test1Max: "15",
      test2Max: "15",
      assignmentMax: "5",
      attendanceMax: "5",
      freezeDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "config_labs_1",
      academicYear: "2024-25",
      semester: "Semester 3",
      examType: "Labs",
      maxMarks: "50",
      passMarks: "20",
      totalInternalMarks: "50",
      recordMax: "10",
      performanceMax: "10",
      internalTestMax: "15",
      vivaMax: "15",
      freezeDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  localStorage.setItem("internal_exam_setup", JSON.stringify(examConfigs));

  // 8. Faculty Subject Mappings (Legacy - kept for backward compatibility)
  const facultyMappings = [
    {
      id: "mapping_1",
      courseId: "course-1",
      semester: "3",
      subjectId: "sub-1",
      subjectName: "Data Structures",
      subjectCode: "DSA",
      facultyId: "fac-1",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mapping_2",
      courseId: "course-1",
      semester: "3",
      subjectId: "lab-1",
      subjectName: "Data Structures Lab",
      subjectCode: "DSA-LAB",
      facultyId: "fac-1",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "mapping_3",
      courseId: "course-1",
      semester: "4",
      subjectId: "sub-2",
      subjectName: "Database Systems",
      subjectCode: "DBMS",
      facultyId: "fac-2",
      updatedAt: new Date().toISOString(),
    },
  ];
  localStorage.setItem("faculty_subject_mappings", JSON.stringify(facultyMappings));

  // 9. Faculty Subject Assignments (New structure - matches backend table)
  // This is the primary source for faculty-subject assignments
  const professors = JSON.parse(localStorage.getItem("exam_professors") || "[]");
  const defaultFacultyId = professors.length > 0 ? (professors[0]._id || professors[0].professorId || "prof_1") : "prof_1";
  
  const facultySubjectAssignments = [
    {
      _id: "assignment_1",
      facultyId: defaultFacultyId, // Assign to first professor
      professorId: defaultFacultyId,
      subjectId: "sub-1",
      subjectCode: "DSA",
      subjectName: "Data Structures",
      subjectType: "THEORY", // THEORY or LAB
      academicYear: "2024-25",
      semester: "Semester 3",
      branch: "CSE", // Branch/Stream
      sections: ["A", "B"], // Multiple sections
      subjectCategory: "Core", // Core / Lab / Elective
      courseId: "course-1",
      streamId: "stream-1",
      assignedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      status: "Active",
    },
    {
      _id: "assignment_2",
      facultyId: defaultFacultyId,
      professorId: defaultFacultyId,
      subjectId: "lab-1",
      subjectCode: "DSA-LAB",
      subjectName: "Data Structures Lab",
      subjectType: "LAB",
      academicYear: "2024-25",
      semester: "Semester 3",
      branch: "CSE",
      sections: ["A", "B"],
      subjectCategory: "Lab",
      courseId: "course-1",
      streamId: "stream-1",
      assignedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Active",
    },
    {
      _id: "assignment_3",
      facultyId: defaultFacultyId,
      professorId: defaultFacultyId,
      subjectId: "sub-2",
      subjectCode: "DBMS",
      subjectName: "Database Systems",
      subjectType: "THEORY",
      academicYear: "2024-25",
      semester: "Semester 4",
      branch: "CSE",
      sections: ["A"],
      subjectCategory: "Core",
      courseId: "course-1",
      streamId: "stream-1",
      assignedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
      status: "Active",
    },
  ];
  localStorage.setItem("faculty_subject_assignments", JSON.stringify(facultySubjectAssignments));

  // Mark as initialized
  localStorage.setItem("dummy_internals_initialized", "true");

  console.log("✅ Dummy internal marks data initialized successfully!");
  console.log(`
📊 Demo Data Created:
  Theory Internals:
    - Draft: Data Structures (Section A), Computer Networks (Section C)
    - Submitted: Data Structures (Section B, C), Computer Networks (Section A, B)
    - Approved: Database Systems (Section A, B), Data Structures (Section D)
  
  Lab Internals:
    - Draft: Data Structures Lab (Section A), Computer Networks Lab (Section B)
    - Submitted: Data Structures Lab (Section B), Database Systems Lab (Section B), Computer Networks Lab (Section A)
    - Approved: Database Systems Lab (Section A, C)
  
🎯 How to Test:
  1. Go to "Faculty Subjects" → You'll see subjects listed
  2. Select a subject → Enter marks or view existing
  3. Go to "HOD Review" → Filter by Course (B.Tech CSE) & Semester (3 or 4) → See multiple subjects with different statuses
  4. Go to "Freeze Marks" → See approved entries ready to freeze
  `);
};

// Auto-initialize on import (optional - can be called manually)
// initializeDummyInternalsData();

