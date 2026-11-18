import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { aknuAdikavi, aknuLogo } from "../../assets";
import {
  initiateEasebuzzPayment,
  generateTransactionId,
  redirectToPayment,
} from "../../utils/easebuzzPayment";

// Dummy data for regular subjects
const DUMMY_REGULAR_SUBJECTS = [
  { SubjectName: "Mathematics", Grade: "A+", Marks: 95, SubjectOrder: 1 },
  { SubjectName: "Physics", Grade: "A", Marks: 88, SubjectOrder: 2 },
  { SubjectName: "Chemistry", Grade: "B+", Marks: 82, SubjectOrder: 3 },
  { SubjectName: "English", Grade: "A", Marks: 90, SubjectOrder: 4 },
  { SubjectName: "Computer Science", Grade: "A+", Marks: 96, SubjectOrder: 5 },
  { SubjectName: "Data Structures", Grade: "A", Marks: 87, SubjectOrder: 6 },
  {
    SubjectName: "Database Management",
    Grade: "B+",
    Marks: 85,
    SubjectOrder: 7,
  },
];

// Dummy data for supplementary/backlog subjects
const DUMMY_BACKLOG_SUBJECTS = [
  { SubjectName: "Operating Systems", Grade: "F", Marks: 35, SubjectOrder: 1 },
  {
    SubjectName: "Software Engineering",
    Grade: "F",
    Marks: 38,
    SubjectOrder: 2,
  },
  { SubjectName: "Computer Networks", Grade: "F", Marks: 32, SubjectOrder: 3 },
];

// Fee rates (per subject)
const REGULAR_FEE_PER_SUBJECT = 500; // ₹500 per regular subject
const SUPPLEMENTARY_FEE_PER_SUBJECT = 1000; // ₹1000 per supplementary subject

const ExaminationApplication = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [foundStudent, setFoundStudent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [selectedRegularSubjects, setSelectedRegularSubjects] = useState([]);
  const [selectedBacklogSubjects, setSelectedBacklogSubjects] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [captchaValue, setCaptchaValue] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [regularSubjectsData, setRegularSubjectsData] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [previousResults, setPreviousResults] = useState([]);
  const [showPreviousResults, setShowPreviousResults] = useState(false);

  const resultRef = useRef();
  const previewRef = useRef();

  const params = new URLSearchParams(window.location.search);
  const level = params.get("level") || "";
  const semester = params.get("semester") || "";
  const title = params.get("title") || "";
  const date = params.get("date") || "";

  // Generate CAPTCHA
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaValue(result);
    setCaptchaInput("");
    setCaptchaError("");
  };

  // Initialize CAPTCHA on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  // com
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a registration number");
      return;
    }

    // Validate CAPTCHA
    if (!captchaInput.trim()) {
      setCaptchaError("Please enter the CAPTCHA code");
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captchaValue.toUpperCase()) {
      setCaptchaError("CAPTCHA code is incorrect. Please try again.");
      generateCaptcha();
      return;
    }

    setCaptchaError("");

    setLoading(true);
    setError("");

    try {
      // Fetch from Student collection instead of FeesForm
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}api/students/registration/${searchTerm}`
      );
      console.log("API Response:", response.data);

      // Handle API response structure: response.data.data is now a single object from Student collection
      if (response.data.success && response.data.data) {
        const studentData = response.data.data;

        if (studentData) {
          // Extract data from courseStreamMapping (new schema)
          const mapping =
            studentData.courseStreamMappingId ||
            studentData.courseStreamMapping;
          const courseName =
            studentData.selectCourse || mapping?.courseId?.name || "";
          const streamName =
            studentData.stream || mapping?.streamId?.name || "";
          const semesterYear = studentData.semesterYear || "";

          // Extract batch code - handle both object and string cases
          let batchCode = "";
          if (studentData.batch) {
            // If batch is an object (populated AcademicYear), extract the code
            if (
              typeof studentData.batch === "object" &&
              studentData.batch.code
            ) {
              batchCode = studentData.batch.code;
            } else if (typeof studentData.batch === "string") {
              batchCode = studentData.batch;
            }
          }
          // Fallback to batchYear or timePeriod
          if (!batchCode) {
            batchCode = studentData.batchYear || mapping?.timePeriod || "";
          }

          // Map API fields to payload - ensure all required fields are present
          const payload = {
            registrationNumber: studentData.registrationNumber || "",
            nameSSC:
              studentData.nameSSC ||
              `${studentData.firstName || ""} ${studentData.middleName || ""} ${studentData.lastName || ""}`.trim() ||
              studentData.firstName ||
              "",
            selectCourse: courseName,
            courseCode: studentData.courseCode || mapping?.courseId?.code || "",
            selectCollege:
              studentData.selectCollege || studentData.campus?.name || "",
            collegeCode:
              studentData.collegeCode || studentData.campus?.code || "",
            stream: streamName,
            streamCode: studentData.streamCode || mapping?.streamId?.code || "",
            semesterYear: semesterYear,
            semesterNumber:
              studentData.semesterNumber || mapping?.semesterNumber || null,
            semesterDescription:
              studentData.semesterDescription ||
              mapping?.semesterId?.description ||
              "",
            batch: batchCode, // Always use string code, not object
            batchYear: batchCode,
            email: studentData.email || "",
            phone: studentData.phone || "",
            feeType: studentData.feeType || "",
            totalFee: studentData.totalFee || "",
            // Keep all original data (but batch will be overwritten by our string value above)
            ...studentData,
            // Override batch with string code to prevent object rendering
            batch: batchCode,
            batchYear: batchCode,
          };

          setFoundStudent(payload);
          setCurrentSemester(payload.semesterYear);
          console.log("✅ Student data loaded:", {
            registrationNumber: payload.registrationNumber,
            course: payload.selectCourse,
            stream: payload.stream,
            semester: payload.semesterYear,
            batch: payload.batch,
          });
          console.log("📋 Full payload:", payload);

          // Subjects are now included in the student response from backend
          if (studentData.subjects && Array.isArray(studentData.subjects)) {
            console.log(
              "📚 Subjects received from backend:",
              studentData.subjects
            );
            setRegularSubjectsData(studentData.subjects);

            // Auto-select all regular subjects (students write all regular exams)
            // Store subject IDs instead of names for backend compatibility
            const allSubjectIds = studentData.subjects
              .map((s) => s._id || s.id || s.SubjectId)
              .filter(Boolean);
            if (allSubjectIds.length > 0) {
              setSelectedRegularSubjects(allSubjectIds);
              console.log("📚 Auto-selected subject IDs:", allSubjectIds);
            } else {
              console.warn("📚 No subject IDs found in subjects array");
            }

            // Show warning if there was an error fetching subjects
            if (studentData.subjectsError) {
              console.warn(
                "⚠️ Subjects error from backend:",
                studentData.subjectsError
              );
              // Don't set error state, just log it - subjects array might be empty but that's okay
            }
          } else {
            console.warn("📚 No subjects found in student response");
            setRegularSubjectsData([]);
            setSelectedRegularSubjects([]);

            // Only show error if subjects were expected but not found
            if (payload.selectCourse && payload.semesterYear) {
              if (studentData.subjectsError) {
                setError(
                  `Failed to load subjects: ${studentData.subjectsError}`
                );
              } else {
                setError(
                  "No subjects found for this course, stream, and semester combination."
                );
              }
            }
          }
        } else {
          setFoundStudent(null);
          setError(
            "No student data found for the provided registration number."
          );
        }
      } else {
        setFoundStudent(null);
        setError("No student found for the provided registration number.");
      }
    } catch (err) {
      console.error("Error fetching student:", err);
      setError("Server error. Please try again later.");
      setFoundStudent(null);
    } finally {
      setLoading(false);
      // Regenerate CAPTCHA after search attempt
      generateCaptcha();
    }
  };

  // Fetch subjects dynamically from API
  const fetchSubjects = async (courseName, streamName, semesterYear) => {
    // Note: streamName can be empty for courses without streams (like MCA)
    if (!courseName || !semesterYear) {
      console.warn("Missing required fields to fetch subjects:", {
        courseName,
        streamName,
        semesterYear,
      });
      setError("Missing course or semester information to fetch subjects.");
      return;
    }

    console.log("📚 Fetching subjects with params:", {
      courseName,
      streamName,
      semesterYear,
    });

    setLoadingSubjects(true);
    setError(""); // Clear previous errors
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}api/fees/subjects`;
      console.log("📚 API URL:", apiUrl);
      console.log("📚 Request params:", {
        courseName,
        streamName,
        semesterYear,
      });

      const response = await axios.get(apiUrl, {
        params: {
          courseName: courseName,
          streamName: streamName,
          semesterYear: semesterYear,
        },
      });

      console.log("📚 Subjects API Response:", response.data);

      if (response.data.success && response.data.data) {
        const subjects = response.data.data.subjects || [];
        console.log("📚 Found subjects:", subjects);
        setRegularSubjectsData(subjects);

        // Auto-select all regular subjects (students write all regular exams)
        // Store subject IDs instead of names for backend compatibility
        const allSubjectIds = subjects
          .map((s) => s._id || s.id || s.SubjectId)
          .filter(Boolean);
        if (allSubjectIds.length > 0) {
          setSelectedRegularSubjects(allSubjectIds);
          console.log("📚 Auto-selected subject IDs:", allSubjectIds);
        } else {
          console.warn("📚 No subject IDs found in subjects array");
        }
      } else {
        console.warn("📚 No subjects found in response:", response.data);
        setRegularSubjectsData([]);
        setSelectedRegularSubjects([]);
        if (response.data.error) {
          setError(`Failed to fetch subjects: ${response.data.error}`);
        }
      }
    } catch (err) {
      console.error("📚 Error fetching subjects:", err);
      console.error("📚 Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      // Fallback to empty array if API fails
      setRegularSubjectsData([]);
      setSelectedRegularSubjects([]);

      // Show user-friendly error message
      if (err.response?.data?.error) {
        setError(`Failed to load subjects: ${err.response.data.error}`);
      } else if (err.response?.status === 404) {
        setError(
          "Subjects endpoint not found. Please check if the backend server is running."
        );
      } else {
        setError("Failed to load subjects. Please try again later.");
      }
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Note: Subjects are now fetched dynamically via fetchSubjects function
  // This useEffect is kept for backward compatibility but may not be needed
  useEffect(() => {
    // Subjects are fetched when student data is loaded in handleSearch
    // No need to auto-select here as it's done in fetchSubjects
  }, [foundStudent]);

  const printStyle = `
    @page { size: A4; margin: 20mm; }
    @media print {
      body { -webkit-print-color-adjust: exact; }
      .no-print { display: none !important; }
      .print-header { display: block !important; }
      .previous-results { page-break-before: always; margin-top: 20px; }
      .bg-green-50 { background-color: #f0fdf4 !important; }
      .text-green-600 { color: #16a34a !important; }
      .border-green-600 { border-color: #16a34a !important; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #e5e7eb; padding: 8px; }
      th { background-color: #21605A !important; color: white !important; }
    }
  `;

  const handlePrint = useReactToPrint({
    content: () => {
      if (!resultRef.current) {
        console.error("Print content not available");
        return null;
      }
      return resultRef.current;
    },
    pageStyle: printStyle,
    documentTitle: `Examination_Application_${foundStudent?.registrationNumber || "Form"}_${new Date().toISOString().slice(0, 10)}`,
  });

  const handlePrintFromPreview = useReactToPrint({
    content: () => {
      if (!previewRef.current) {
        console.error("Preview content not available");
        return null;
      }
      return previewRef.current;
    },
    pageStyle: printStyle,
    documentTitle: `Examination_Application_${foundStudent?.registrationNumber || "Form"}_${new Date().toISOString().slice(0, 10)}`,
  });

  const capitalize = (str) => {
    if (typeof str !== "string" || !str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Convert number to words (Indian format)
  const numberToWords = (num) => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    if (num === 0) return "Zero";
    if (num < 20) return ones[num];
    if (num < 100) {
      return (
        tens[Math.floor(num / 10)] +
        (num % 10 !== 0 ? " " + ones[num % 10] : "")
      );
    }
    if (num < 1000) {
      return (
        ones[Math.floor(num / 100)] +
        " Hundred" +
        (num % 100 !== 0 ? " " + numberToWords(num % 100) : "")
      );
    }
    if (num < 100000) {
      return (
        numberToWords(Math.floor(num / 1000)) +
        " Thousand" +
        (num % 1000 !== 0 ? " " + numberToWords(num % 1000) : "")
      );
    }
    if (num < 10000000) {
      return (
        numberToWords(Math.floor(num / 100000)) +
        " Lakh" +
        (num % 100000 !== 0 ? " " + numberToWords(num % 100000) : "")
      );
    }
    return (
      numberToWords(Math.floor(num / 10000000)) +
      " Crore" +
      (num % 10000000 !== 0 ? " " + numberToWords(num % 10000000) : "")
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { day: "2-digit", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const handleDownloadPDF = () => {
    if (!foundStudent) return;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Set university colors
    const primaryColor = [43, 120, 112]; // #2B7870
    const secondaryColor = [33, 96, 90]; // #21605A
    const accentColor = [240, 245, 244]; // Light background

    // Helper function to check if we need a new page
    const checkPageBreak = (currentY, requiredSpace = 20) => {
      const pageHeight = pdf.internal.pageSize.getHeight();
      const bottomMargin = 20;
      if (currentY + requiredSpace > pageHeight - bottomMargin) {
        pdf.addPage();
        return 20; // Return new Y position after page break
      }
      return currentY;
    };

    // --- HEADER WITH LOGOS ---
    const marginX = 15;
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Left Logo
    const leftLogo = aknuLogo;
    pdf.addImage(leftLogo, "PNG", marginX, 10, 20, 20);

    // Right Logo
    const rightLogo = aknuAdikavi;
    pdf.addImage(rightLogo, "PNG", pageWidth - marginX - 20, 10, 20, 20);

    // Centered Text
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...primaryColor);
    pdf.text("ADIKAVI NANNAYA UNIVERSITY", pageWidth / 2, 20, {
      align: "center",
    });

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text("RAJAMAHENDRAVARAM, ANDHRA PRADESH - 533296", 105, 26, {
      align: "center",
    });

    // Decorative line
    pdf.setDrawColor(...primaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(marginX, 32, pageWidth - marginX, 32);

    // Add examination application title
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "bold");

    const titleWidth = 150;
    const title = "Examination Application Form";

    // Split title into lines if it exceeds the fixed width
    const lines = pdf.splitTextToSize(title, titleWidth);
    let y = 42; // starting Y position

    lines.forEach((line) => {
      pdf.text(line, pageWidth / 2, y, { align: "center" });
      y += 8; // adjust line height if needed
    });

    // Add semester number
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    const semesterText = foundStudent.semesterNumber
      ? `Semester ${foundStudent.semesterNumber}`
      : "N/A";
    pdf.text(semesterText, pageWidth / 2, y, { align: "center" });

    y += 12; // spacing before next section

    // --- STUDENT INFORMATION SECTION ---
    const infoStartY = y + 5;

    // Section Header with background
    pdf.setFillColor(...accentColor);
    pdf.rect(marginX, infoStartY, pageWidth - marginX * 2, 8, "F");

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...primaryColor);
    pdf.text("STUDENT INFORMATION", marginX + 5, infoStartY + 6);

    // Student Information in a clean, aligned layout
    const infoContentStartY = infoStartY + 15;
    let currentY = infoContentStartY;

    // Helper function to add labeled information
    const addInfoLine = (label, value, yPosition) => {
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(60, 60, 60);
      pdf.text(`${label}:`, marginX, yPosition);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);
      pdf.text(value, marginX + 45, yPosition);

      return yPosition + 6;
    };

    // Add student information lines
    currentY = addInfoLine(
      "Registration Number",
      foundStudent.registrationNumber || "N/A",
      currentY
    );
    currentY = addInfoLine(
      "Student Name",
      capitalize(foundStudent.nameSSC || "N/A"),
      currentY
    );
    currentY = addInfoLine(
      "College",
      capitalize(foundStudent.selectCollege || "N/A"),
      currentY
    );
    currentY = addInfoLine(
      "Course",
      capitalize(foundStudent.selectCourse || "N/A"),
      currentY
    );
    currentY = addInfoLine(
      "Stream",
      capitalize(foundStudent.stream || foundStudent.selectStream || "N/A"),
      currentY
    );
    currentY = addInfoLine(
      "Semester",
      foundStudent.semesterNumber
        ? `Semester ${foundStudent.semesterNumber}`
        : "N/A",
      currentY
    );
    currentY = addInfoLine(
      "Batch",
      typeof foundStudent.batch === "object" && foundStudent.batch?.code
        ? foundStudent.batch.code
        : foundStudent.batch || foundStudent.batchYear || "N/A",
      currentY
    );

    // Add a subtle separator line
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.2);
    pdf.line(marginX, currentY + 3, pageWidth - marginX, currentY + 3);

    // --- REGULAR SUBJECTS SECTION ---
    let tableY = checkPageBreak(currentY + 10, 30);

    if (selectedRegularSubjects.length > 0) {
      // Check if we need a new page before adding the section header
      tableY = checkPageBreak(tableY, 30);

      pdf.setFillColor(...accentColor);
      pdf.rect(marginX, tableY, pageWidth - marginX * 2, 8, "F");

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...primaryColor);
      pdf.text("REGULAR EXAMINATION SUBJECTS", marginX + 5, tableY + 6);

      // Map subject IDs to subject names for PDF display
      const regularSubjectsForPDF = selectedRegularSubjects.map((subjectId) => {
        const subject = regularSubjectsData.find(
          (s) => (s._id || s.id || s.SubjectId) === subjectId
        );
        return [capitalize(subject?.SubjectName || "N/A")];
      });

      autoTable(pdf, {
        startY: tableY + 15,
        head: [["Subject Name"]],
        body: regularSubjectsForPDF,
        margin: { left: marginX, right: marginX, top: 10, bottom: 20 },
        styles: {
          fontSize: 10,
          cellPadding: 4,
          valign: "middle",
          textColor: [40, 40, 40],
        },
        headStyles: {
          fillColor: primaryColor,
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 170, halign: "left" },
        },
        theme: "grid",
        showHead: "everyPage",
        didDrawPage: function (data) {
          // Ensure header is redrawn on new pages
        },
      });

      tableY = pdf.lastAutoTable.finalY + 10;
    }

    // --- SUPPLEMENTARY SUBJECTS SECTION ---
    if (selectedBacklogSubjects.length > 0) {
      // Check if we need a new page before adding the section header
      tableY = checkPageBreak(tableY, 30);

      pdf.setFillColor(...accentColor);
      pdf.rect(marginX, tableY, pageWidth - marginX * 2, 8, "F");

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...primaryColor);
      pdf.text("SUPPLEMENTARY EXAMINATION SUBJECTS", marginX + 5, tableY + 6);

      // Get backlog subjects with semester info
      const backlogSubjectsData = [];
      // We need to extract subject names and semesters from selectedBacklogSubjects
      // Since selectedBacklogSubjects contains keys like "SubjectName_SemesterYear"
      selectedBacklogSubjects.forEach((key) => {
        const [subjectName, ...semesterParts] = key.split("_");
        const semesterYear = semesterParts.join("_") || "N/A";
        backlogSubjectsData.push([capitalize(subjectName), semesterYear]);
      });

      autoTable(pdf, {
        startY: tableY + 15,
        head: [["Subject Name", "Semester/Year"]],
        body: backlogSubjectsData,
        margin: { left: marginX, right: marginX, top: 10, bottom: 20 },
        styles: {
          fontSize: 10,
          cellPadding: 4,
          valign: "middle",
          textColor: [40, 40, 40],
        },
        headStyles: {
          fillColor: primaryColor,
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 120, halign: "left" },
          1: { cellWidth: 50, halign: "left" },
        },
        theme: "grid",
        showHead: "everyPage",
        didDrawPage: function (data) {
          // Ensure header is redrawn on new pages
        },
      });

      tableY = pdf.lastAutoTable.finalY + 10;
    }

    // --- FEES SUMMARY SECTION ---
    // Check if we need a new page for fees summary
    let feesStartY = checkPageBreak(tableY + 5, 60);

    // Section Header
    pdf.setFillColor(...accentColor);
    pdf.rect(marginX, feesStartY, pageWidth - marginX * 2, 8, "F");

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...primaryColor);
    pdf.text("FEES SUMMARY", marginX + 5, feesStartY + 6);

    let feesY = feesStartY + 18;

    const regularFee = selectedRegularSubjects.length * REGULAR_FEE_PER_SUBJECT;
    const supplementaryFee =
      selectedBacklogSubjects.length * SUPPLEMENTARY_FEE_PER_SUBJECT;
    const totalFee = regularFee + supplementaryFee;

    // Helper function to add fee line with proper spacing
    const addFeeLine = (label, value, yPosition) => {
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(60, 60, 60);
      pdf.text(`${label}:`, marginX, yPosition);

      // Add spacing before the value (approximately 64mm from left margin)
      // Use "Rs." instead of ₹ symbol to avoid rendering issues
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);
      const valueText = value.replace("₹", "Rs. ");
      pdf.text(valueText, marginX + 64, yPosition);

      return yPosition + 7;
    };

    // Regular Examination Fees
    feesY = addFeeLine(
      "Regular Examination Fees",
      `₹${regularFee.toLocaleString("en-IN")}`,
      feesY
    );

    // Supplementary Examination Fees
    feesY = addFeeLine(
      "Supplementary Examination Fees",
      `₹${supplementaryFee.toLocaleString("en-IN")}`,
      feesY
    );

    // Number of Subjects
    // feesY = addFeeLine("Number of Subjects", `${selectedRegularSubjects.length + selectedBacklogSubjects.length}`, feesY);

    // Separator line
    feesY += 3;
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(marginX, feesY, pageWidth - marginX, feesY);

    // Total Fee
    feesY += 8;
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("Total Fee:", marginX, feesY);

    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 128, 0); // Green color
    const totalFeeText = `Rs. ${totalFee.toLocaleString("en-IN")}`;
    pdf.text(totalFeeText, marginX + 64, feesY);

    // Amount in words
    feesY += 6;
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(100, 100, 100);
    pdf.text(`${numberToWords(totalFee)} Rupees Only`, marginX + 64, feesY);

    // Generation timestamp separator
    feesY += 8;
    pdf.setDrawColor(0, 128, 0); // Green color
    pdf.setLineWidth(0.5);
    pdf.line(marginX, feesY, pageWidth - marginX, feesY);

    // Generation timestamp
    feesY += 6;
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 100, 100);
    const timestamp = `Generated on: ${new Date().toLocaleDateString("en-GB")} at ${new Date().toLocaleTimeString("en-GB")}`;
    pdf.text(timestamp, pageWidth / 2, feesY, { align: "center" });

    // Save the PDF
    const fileName = `${foundStudent.registrationNumber || "Examination"}_Application_${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(fileName);
  };

  /**
   * Handle Payment Initiation
   * This function initiates the Easebuzz payment gateway when user clicks "Proceed to Payment"
   *
   * Flow:
   * 1. Validate student data and selected subjects
   * 2. Calculate total fee
   * 3. Generate unique transaction ID
   * 4. Prepare payment data
   * 5. Call Easebuzz Initiate Payment API
   * 6. Redirect user to payment page
   */
  const handlePaymentInitiation = async () => {
    try {
      // Validation checks
      if (!foundStudent) {
        alert("Please search for a student first.");
        return;
      }

      if (
        selectedRegularSubjects.length === 0 &&
        selectedBacklogSubjects.length === 0
      ) {
        alert("Please select at least one subject for examination.");
        return;
      }

      // Calculate total fee
      const regularFee =
        selectedRegularSubjects.length * REGULAR_FEE_PER_SUBJECT;
      const supplementaryFee =
        selectedBacklogSubjects.length * SUPPLEMENTARY_FEE_PER_SUBJECT;
      const totalAmount = regularFee + supplementaryFee;

      if (totalAmount <= 0) {
        alert("Invalid payment amount. Please check your subject selections.");
        return;
      }

      // Set processing state
      setPaymentProcessing(true);
      setPaymentError("");

      // Generate unique transaction ID
      const transactionId = generateTransactionId();

      // Prepare success and failure URLs
      // These URLs will handle the payment response from Easebuzz
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/examination-application/payment-success?txnid=${transactionId}`;
      const failureUrl = `${baseUrl}/examination-application/payment-failure?txnid=${transactionId}`;

      // Format phone number - ensure it's in valid format for Easebuzz
      // Easebuzz accepts: ^(\+\d{1,4}[-]?)?\d{5,20}$
      // Examples: "+91-9876543210", "+919876543210", "9876543210"
      let phoneNumber = foundStudent.phone || foundStudent.mobile || "";
      // Remove any spaces, dashes, or special characters except +
      phoneNumber = phoneNumber.replace(/[\s-]/g, "");
      // If it doesn't start with + and is 10 digits, add +91 prefix for Indian numbers
      if (phoneNumber.length === 10 && !phoneNumber.startsWith("+")) {
        phoneNumber = `+91${phoneNumber}`;
      } else if (phoneNumber.length < 5) {
        // Fallback if phone is too short
        phoneNumber = "+919999999999";
      }

      // Prepare payment data matching backend API structure
      const paymentData = {
        amount: totalAmount, // Number, not string
        firstname:
          capitalize(foundStudent.nameSSC || "").split(" ")[0] || "Student",
        email: foundStudent.email || "student@example.com",
        phone: phoneNumber,
        registration_number: foundStudent.registrationNumber || "",
        course: foundStudent.selectCourse || "",
        semester: foundStudent.semesterYear || "",
        regular_subjects: selectedRegularSubjects, // Already contains ObjectIds
        // For supplementary/backlog subjects: since they use dummy data without backend IDs,
        // we'll send an empty array for now. The backend should handle backlog subjects separately
        // or we need to fetch backlog subjects from the backend with proper IDs.
        supplementary_subjects: selectedBacklogSubjects
          .map((sub) => {
            // Extract subject name from the key format "SubjectName_SemesterYear"
            if (typeof sub === "string" && sub.includes("_")) {
              const [subjectName] = sub.split("_");
              // Try to find the subject in regularSubjectsData by name (backlog might be a regular subject from previous semester)
              const foundSubject = regularSubjectsData.find(
                (s) => s.SubjectName === subjectName
              );
              if (
                foundSubject &&
                (foundSubject._id || foundSubject.id || foundSubject.SubjectId)
              ) {
                return (
                  foundSubject._id || foundSubject.id || foundSubject.SubjectId
                );
              }
            }
            // If it's already an ID, return it
            if (
              typeof sub === "string" &&
              sub.length === 24 &&
              /^[a-f0-9]{24}$/i.test(sub)
            ) {
              return sub; // Looks like a MongoDB ObjectId
            }
            return null;
          })
          .filter(Boolean), // Filter out null values - only send valid ObjectIds
        productinfo: `Examination Application - ${foundStudent.semesterYear || "Current Semester"}`,
        surl: successUrl,
        furl: failureUrl,
      };

      console.log("Initiating payment with data:", paymentData);

      // Call backend API to initiate payment
      const paymentResponse = await initiateEasebuzzPayment(paymentData);

      if (paymentResponse.success && paymentResponse.paymentUrl) {
        // Store transaction details in localStorage for reference
        const storedData = {
          transactionId: paymentResponse.transactionId || transactionId,
          amount: totalAmount,
          studentData: {
            registrationNumber: foundStudent.registrationNumber,
            name: foundStudent.nameSSC,
            course: foundStudent.selectCourse,
            semester: foundStudent.semesterNumber
              ? `Semester ${foundStudent.semesterNumber}`
              : "",
            email: foundStudent.email,
            phone: phoneNumber,
          },
          subjects: {
            regular: selectedRegularSubjects,
            supplementary: selectedBacklogSubjects,
            regularCount: selectedRegularSubjects.length,
            supplementaryCount: selectedBacklogSubjects.length,
          },
          timestamp: new Date().toISOString(),
        };

        localStorage.setItem(
          `payment_${paymentResponse.transactionId || transactionId}`,
          JSON.stringify(storedData)
        );

        // Redirect to Easebuzz payment page
        redirectToPayment(paymentResponse.paymentUrl);
      } else {
        // Payment initiation failed
        const errorMessage =
          paymentResponse.message ||
          "Failed to initiate payment. Please try again.";
        setPaymentError(errorMessage);
        alert(errorMessage);
        setPaymentProcessing(false);
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      const errorMessage =
        error.message ||
        "An error occurred while processing payment. Please try again.";
      setPaymentError(errorMessage);
      alert(errorMessage);
      setPaymentProcessing(false);
    }
  };

  const toTitleCase = (str) => {
    if (!str) return "N/A";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Format ordinal numbers as JSX with superscript (1st, 2nd, 3rd, etc.)
  const formatOrdinalJSX = (text) => {
    if (!text) return "N/A";

    // Split by spaces and process each word
    const parts = text.split(/(\s+)/);
    return parts.map((part, index) => {
      const ordinalMatch = part.match(/(\d+)(st|nd|rd|th)/i);
      if (ordinalMatch) {
        const [, number, suffix] = ordinalMatch;
        return (
          <span key={index}>
            {number}
            <sup className="text-xs leading-none">{suffix}</sup>
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-teal-800 mb-2">
          Examination Application
        </h2>
        <p className="text-gray-600 mb-4">
          Enter your registration number to view your examination application
        </p>

        <div className="flex flex-col gap-4 mb-4 no-print">
          <div className="flex gap-2 items-center justify-center flex-wrap">
            {/* Registration Number Input */}
            <input
              type="text"
              placeholder="Enter registration number..."
              className="flex-1 min-w-[200px] max-w-[300px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#21605A] focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />

            {/* CAPTCHA Section - Inline */}
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <div className="bg-gray-50 border-2 border-gray-300 rounded-md px-3 py-2 flex items-center justify-center min-w-[110px] h-[42px]">
                  <span className="text-lg font-bold text-gray-800 tracking-wider select-none">
                    {captchaValue}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={generateCaptcha}
                className="p-2.5 text-[#21605A] hover:text-[#1a4a45] hover:bg-gray-100 rounded-md transition-colors border border-gray-200"
                title="Refresh CAPTCHA"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Enter CAPTCHA"
                className="w-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#21605A] focus:outline-none uppercase"
                value={captchaInput}
                onChange={(e) => {
                  setCaptchaInput(e.target.value);
                  setCaptchaError("");
                }}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                maxLength={5}
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-[#21605A] text-white rounded-md hover:bg-[#1a4a45] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Searching...
                </span>
              ) : (
                "Search"
              )}
            </button>
          </div>

          {/* CAPTCHA Error Message */}
          {captchaError && (
            <p className="text-red-500 text-sm flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {captchaError}
            </p>
          )}
        </div>

        {error && (
          <p className="mt-2 text-red-500 no-print flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>

      {foundStudent && (
        <div className="space-y-6">
          {/* <h1
            className="text-2xl md:text-3xl text-center font-bold text-gray-900 mb-2"
            aria-label="Batch title"
          >
            Examination Application
          </h1> */}

          {/* <div className="flex flex-wrap gap-2 no-print">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                  clipRule="evenodd"
                />
              </svg>
              Print Result
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-[#21605A] text-white rounded-md hover:bg-[#1a4a45] transition-colors flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Download PDF
            </button>
            <button
              onClick={togglePreviousResults}
              disabled={prevResultsLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
            >
              {prevResultsLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                  </>
                ) : (
                  <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {showPreviousResults
                    ? "Hide Previous Results"
                    : "Show Previous Results"}
                  </>
                )}
              </button>
            </div> */}

          <div
            ref={resultRef}
            className="border border-gray-200 rounded-lg p-6 bg-white"
          >
            <div className="hidden print-header mb-6 text-center border-b pb-4">
              <h1 className="text-2xl font-bold text-teal-800">
                Examination Application Form
              </h1>
              <p className="text-gray-600">
                Semester {foundStudent?.semesterNumber || "N/A"}
              </p>
              <p className="text-gray-600 mt-2">
                Official Document - {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b flex justify-between">
                <p>Student Information</p>
                <p>{}</p>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Registration Number</p>
                  <p className="font-medium text-lg">
                    {foundStudent.registrationNumber || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-lg">
                    {capitalize(foundStudent.nameSSC) || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">College</p>
                  <p className="font-medium text-lg">
                    {capitalize(foundStudent.selectCollege) || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="font-medium text-lg">
                    {capitalize(foundStudent.selectCourse) || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Stream</p>
                  <p className="font-medium text-lg">
                    {capitalize(
                      foundStudent.stream || foundStudent.selectStream
                    ) || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Semester</p>
                  <p className="font-medium text-lg">
                    {foundStudent.semesterNumber || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Batch</p>
                  <p className="font-medium text-lg">
                    {typeof foundStudent.batch === "object" &&
                    foundStudent.batch?.code
                      ? foundStudent.batch.code
                      : foundStudent.batch || foundStudent.batchYear || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                Semester Exams -Regular
              </h3>
              <div className="overflow-x-auto">
                {/* Add result date header above the table */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Semester {foundStudent.semesterNumber || "N/A"}
                  </h3>
                </div>

                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#21605A]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                        Select
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loadingSubjects ? (
                      <tr>
                        <td
                          colSpan="2"
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          <div className="flex items-center justify-center">
                            <svg
                              className="animate-spin h-5 w-5 mr-2 text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Loading subjects...
                          </div>
                        </td>
                      </tr>
                    ) : regularSubjectsData.length > 0 ? (
                      regularSubjectsData.map((subject, index) => {
                        const subjectName = subject.SubjectName || "";
                        const subjectId =
                          subject._id || subject.id || subject.SubjectId;
                        const isSelected =
                          selectedRegularSubjects.includes(subjectId);

                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">
                                {capitalize(subjectName) || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    checked={true}
                                    disabled={true}
                                    readOnly={true}
                                    className="w-5 h-5 rounded border-2 border-green-600 bg-green-600 text-green-600 focus:ring-green-500 focus:ring-2 cursor-not-allowed appearance-none checked:bg-green-600 checked:border-green-600"
                                    style={{
                                      accentColor: "#16a34a",
                                      WebkitAppearance: "none",
                                      appearance: "none",
                                      backgroundColor: "#16a34a",
                                      borderColor: "#16a34a",
                                    }}
                                  />
                                  {true && (
                                    <svg
                                      className="absolute top-0 left-0 w-5 h-5 pointer-events-none"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="white"
                                      strokeWidth="3"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="2"
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          {foundStudent
                            ? "No subjects found for this semester"
                            : "Please search for a student first"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Supplementary/Backlog Section */}
            {/* <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                Backlog Exams
              </h3>
              <div className="overflow-x-auto">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Backlog Subjects
                  </h3>
                </div>

                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#21605A]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Semester/Year
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                        Select
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(() => {
                      // Use dummy data for backlog subjects
                      let backlogResults = DUMMY_BACKLOG_SUBJECTS.map(
                        (subject) => ({
                          ...subject,
                          semesterYear: "1st Year - 1st Semester",
                        })
                      );

                      // Sort by SubjectOrder if available
                      backlogResults.sort((a, b) => {
                        if (a.SubjectOrder != null && b.SubjectOrder != null) {
                          return a.SubjectOrder - b.SubjectOrder;
                        }
                        return 0;
                      });

                      return backlogResults.length > 0 ? (
                        backlogResults.map((subject, index) => {
                          const subjectName =
                            subject.SubjectName || subject.subjectName || "";
                          const semesterYear =
                            subject.semesterYear || subject.Semester || "N/A";
                          // Use subject name + semester as unique key for selection
                          const subjectKey = `${subjectName}_${semesterYear}`;
                          const isSelected =
                            selectedBacklogSubjects.includes(subjectKey);

                          return (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">
                                  {capitalize(subjectName) || "N/A"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-600">
                                  {formatOrdinalJSX(semesterYear || "N/A")}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                      setSelectedBacklogSubjects(
                                        selectedBacklogSubjects.filter(
                                          (s) => s !== subjectKey
                                        )
                                      );
                                    } else {
                                      setSelectedBacklogSubjects([
                                        ...selectedBacklogSubjects,
                                        subjectKey,
                                      ]);
                                    }
                                  }}
                                  className={`w-5 h-5 border-gray-300 rounded focus:ring-2 cursor-pointer ${
                                    isSelected
                                      ? "text-green-600 bg-green-600 border-green-600 focus:ring-green-500"
                                      : "text-gray-300 border-gray-300 focus:ring-[#21605A]"
                                  }`}
                                  style={
                                    isSelected ? { accentColor: "#16a34a" } : {}
                                  }
                                />
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="3"
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No backlog subjects found
                          </td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
                </div>
            </div> */}

            {/* Fees Summary Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-gray-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
                Fee Summary
              </h3>
              <div className="bg-green-50/50 rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="space-y-4">
                  {/* Regular Examination Fees */}
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-gray-700 font-medium text-base">
                      Regular Examination Fees:
                    </span>
                    <span className="text-gray-900 font-semibold text-base ml-16">
                      ₹
                      {(
                        selectedRegularSubjects.length * REGULAR_FEE_PER_SUBJECT
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Supplementary Examination Fees */}
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-gray-700 font-medium text-base">
                      Backlog Examination Fees:
                    </span>
                    <span className="text-gray-900 font-semibold text-base ml-16">
                      ₹
                      {(
                        selectedBacklogSubjects.length *
                        SUPPLEMENTARY_FEE_PER_SUBJECT
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Number of Subjects */}
                  {/* <div className="flex justify-between items-center py-2.5">
                    <span className="text-gray-700 font-medium text-base">Number of Subjects:</span>
                    <span className="text-gray-900 font-semibold text-base ml-16">
                      {selectedRegularSubjects.length + selectedBacklogSubjects.length}
                    </span>
                  </div> */}

                  {/* Separator Line */}
                  <div className="border-t border-gray-300 my-3"></div>

                  {/* Total Fee */}
                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-semibold text-gray-800">
                        Total Fee:
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        ₹
                        {(
                          selectedRegularSubjects.length *
                            REGULAR_FEE_PER_SUBJECT +
                          selectedBacklogSubjects.length *
                            SUPPLEMENTARY_FEE_PER_SUBJECT
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-500 italic">
                        {numberToWords(
                          selectedRegularSubjects.length *
                            REGULAR_FEE_PER_SUBJECT +
                            selectedBacklogSubjects.length *
                              SUPPLEMENTARY_FEE_PER_SUBJECT
                        )}{" "}
                        Rupees Only
                      </p>
                    </div>
                  </div>

                  {/* Generation Timestamp */}
                  <div className="border-t border-green-600 mt-4 pt-4">
                    <p className="text-xs text-gray-500 text-center">
                      Generated on: {new Date().toLocaleDateString("en-GB")} at{" "}
                      {new Date().toLocaleTimeString("en-GB")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Section */}
            <div className="mb-8 flex flex-wrap gap-4 justify-end no-print">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (!foundStudent) {
                    alert(
                      "Please search for a student first to preview the application."
                    );
                    return;
                  }
                  setShowPreview(true);
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center font-medium"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Preview
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center font-medium"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Download PDF
              </button>
              <button
                onClick={handlePaymentInitiation}
                disabled={
                  paymentProcessing ||
                  !foundStudent ||
                  (selectedRegularSubjects.length === 0 &&
                    selectedBacklogSubjects.length === 0)
                }
                className={`px-6 py-3 bg-[#21605A] text-white rounded-md hover:bg-[#1a4a45] transition-colors flex items-center font-medium ${
                  paymentProcessing ||
                  !foundStudent ||
                  (selectedRegularSubjects.length === 0 &&
                    selectedBacklogSubjects.length === 0)
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {paymentProcessing ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </>
                )}
              </button>
              {paymentError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 text-sm">{paymentError}</p>
                </div>
              )}
            </div>

            {showPreviousResults && previousResults.length > 0 && (
              <div className="previous-results mt-10">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">
                  Previous Results
                </h3>
                <div className="space-y-6">
                  {previousResults.map((result, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-6 bg-gray-50"
                    >
                      {/* Batch Info */}
                      <div className="mb-4 pb-2 border-b border-gray-200">
                        {console.log("____result", result)}
                        <h4 className="text-lg font-semibold text-gray-700">
                          {result.batch?.title?.charAt(0).toUpperCase() +
                            result.batch?.title?.slice(1) || "N/A"}{" "}
                          - Semester{" "}
                          {result.batch?.type === "rv"
                            ? result.rvResults?.[0]?.Semester || "N/A"
                            : result.type === "regularAndBacklog"
                              ? result.regularAndBacklogResults?.[0]
                                  ?.Semester || "N/A"
                              : result.results?.[0]?.Semester || "N/A"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Result Date: {formatDate(result.batch?.resultDate)}
                        </p>
                      </div>

                      {/* Student Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Student Name</p>

                          <p className="font-medium">
                            {capitalize(
                              result.batch.type === "rv"
                                ? result.rvResults?.[0]?.StudentName
                                : result.batch.type === "regularAndBacklog"
                                  ? result.rvResults?.[0]?.StudentName
                                  : result.batch.type === "rANDb"
                                    ? result.regularAndBacklogResults?.[0]
                                        ?.StudentName
                                    : result.results?.[0]?.StudentName
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">
                            Registration Number
                          </p>
                          <p className="font-medium">
                            {result.batch.type === "rv"
                              ? result.rvResults?.[0]?.RegisterNumber
                              : result.batch.type === "regularAndBacklog"
                                ? result.rvResults?.[0]?.StudentName
                                : result.batch.type === "rANDb"
                                  ? result.regularAndBacklogResults?.[0]
                                      ?.RegisterNumber
                                  : result.results?.[0]?.RegisterNumber}
                          </p>
                        </div>
                      </div>

                      {/* Subjects */}
                      <div className="space-y-3">
                        <h5 className="text-md font-medium text-gray-700">
                          Subjects
                        </h5>
                        {(() => {
                          const subjects =
                            result.batch.type === "rv"
                              ? result.rvResults
                              : result.batch.type === "regularAndBacklog"
                                ? result.regularAndBacklogResults
                                : result.batch.type === "rANDb"
                                  ? result.regularAndBacklogResults
                                  : result.results;

                          return subjects?.map((subject, subIndex) => (
                            <div
                              key={subIndex}
                              className="flex justify-between items-center p-3 bg-white rounded border border-gray-100"
                            >
                              <div>
                                <p className="font-medium">
                                  {capitalize(subject.SubjectName) || "N/A"}
                                </p>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">Grade</p>
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      subject.Grade === "A+"
                                        ? "bg-green-100 text-green-800"
                                        : subject.Grade === "F"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {toTitleCase(subject.Grade) || "N/A"}
                                  </span>
                                </div>
                                {/* <div>
                                  <p className="text-sm text-gray-500">Type</p>
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      result.batch.type === "rv"
                                        ? "bg-purple-100 text-purple-800"
                                        : result.batch.type ===
                                            "regularAndBacklog"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {result.batch.type === "rv"
                                      ? "Revaluation"
                                      : result.batch.type ===
                                          "regularAndBacklog"
                                        ? "Regular & Backlog"
                                        : "Regular"}
                                  </span>
                                </div> */}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-8 pt-4 border-t text-sm text-gray-500 print-only">
              <p>This is an official document issued by the institution.</p>
              <p className="mt-2">
                Generated on: {new Date().toLocaleDateString()} at{" "}
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {!foundStudent && !loading && (
        <div className="mt-8 text-center text-gray-500 no-print">
          <div className="bg-gray-50 p-8 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-4 text-lg">
              Please enter your registration number to search for examination
              application.
            </p>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Preview - Examination Application
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePrintFromPreview}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Print
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div
                className="bg-white rounded-lg shadow-sm p-6"
                ref={previewRef}
              >
                <div className="print-header mb-6 text-center border-b pb-4">
                  <h1 className="text-2xl font-bold text-teal-800">
                    Examination Application Form
                  </h1>
                  <p className="text-gray-600">
                    Semester {foundStudent?.semesterNumber || "N/A"}
                  </p>
                  <p className="text-gray-600 mt-2">
                    Official Document - {new Date().toLocaleDateString()}
                  </p>
                </div>

                {/* Student Information */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                    Student Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-500">
                        Registration Number
                      </p>
                      <p className="font-medium text-lg">
                        {foundStudent?.registrationNumber || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium text-lg">
                        {capitalize(foundStudent?.nameSSC) || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-500">College</p>
                      <p className="font-medium text-lg">
                        {capitalize(foundStudent?.selectCollege) || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-500">Course</p>
                      <p className="font-medium text-lg">
                        {capitalize(foundStudent?.selectCourse) || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-500">Stream</p>
                      <p className="font-medium text-lg">
                        {capitalize(
                          foundStudent?.stream || foundStudent?.selectStream
                        ) || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-500">Semester</p>
                      <p className="font-medium text-lg">
                        {foundStudent?.semesterNumber || "N/A"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-500">Batch</p>
                      <p className="font-medium text-lg">
                        {typeof foundStudent?.batch === "object" &&
                        foundStudent?.batch?.code
                          ? foundStudent.batch.code
                          : foundStudent?.batch ||
                            foundStudent?.batchYear ||
                            "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Regular Subjects */}
                {selectedRegularSubjects.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                      Semester Exams - Regular
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#21605A]">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Subject Name
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                              Select
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedRegularSubjects.map((subjectId, index) => {
                            const subject = regularSubjectsData.find(
                              (s) =>
                                (s._id || s.id || s.SubjectId) === subjectId
                            );
                            const subjectName = subject?.SubjectName || "N/A";
                            return (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-medium text-gray-900">
                                    {capitalize(subjectName)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <div className="flex items-center justify-center">
                                    <div className="relative">
                                      <input
                                        type="checkbox"
                                        checked={true}
                                        disabled={true}
                                        readOnly={true}
                                        className="w-5 h-5 rounded border-2 border-green-600 bg-green-600 text-green-600"
                                        style={{
                                          accentColor: "#16a34a",
                                          backgroundColor: "#16a34a",
                                          borderColor: "#16a34a",
                                        }}
                                      />
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Supplementary Subjects */}
                {selectedBacklogSubjects.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                      Supplementary/Backlog Subjects
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#21605A]">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Subject Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                              Semester/Year
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                              Select
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedBacklogSubjects.map((key, index) => {
                            const [subjectName, ...semesterParts] =
                              key.split("_");
                            const semesterYear =
                              semesterParts.join("_") || "N/A";
                            return (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-medium text-gray-900">
                                    {capitalize(subjectName) || "N/A"}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-600">
                                    {formatOrdinalJSX(semesterYear)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <input
                                    type="checkbox"
                                    checked={true}
                                    disabled={true}
                                    readOnly={true}
                                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                    style={{ accentColor: "#16a34a" }}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Fees Summary */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b flex items-center">
                    Fee Summary
                  </h3>
                  <div className="bg-green-50/50 rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2.5">
                        <span className="text-gray-700 font-medium text-base">
                          Regular Examination Fees:
                        </span>
                        <span className="text-gray-900 font-semibold text-base ml-16">
                          ₹
                          {(
                            selectedRegularSubjects.length *
                            REGULAR_FEE_PER_SUBJECT
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2.5">
                        <span className="text-gray-700 font-medium text-base">
                          Backlog Examination Fees:
                        </span>
                        <span className="text-gray-900 font-semibold text-base ml-16">
                          ₹
                          {(
                            selectedBacklogSubjects.length *
                            SUPPLEMENTARY_FEE_PER_SUBJECT
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="border-t border-gray-300 my-3"></div>
                      <div className="pt-2">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-lg font-semibold text-gray-800">
                            Total Fee:
                          </span>
                          <span className="text-2xl font-bold text-green-600">
                            ₹
                            {(
                              selectedRegularSubjects.length *
                                REGULAR_FEE_PER_SUBJECT +
                              selectedBacklogSubjects.length *
                                SUPPLEMENTARY_FEE_PER_SUBJECT
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-500 italic">
                            {numberToWords(
                              selectedRegularSubjects.length *
                                REGULAR_FEE_PER_SUBJECT +
                                selectedBacklogSubjects.length *
                                  SUPPLEMENTARY_FEE_PER_SUBJECT
                            )}{" "}
                            Rupees Only
                          </p>
                        </div>
                      </div>
                      <div className="border-t border-green-600 mt-4 pt-4">
                        <p className="text-xs text-gray-500 text-center">
                          Generated on: {new Date().toLocaleDateString("en-GB")}{" "}
                          at {new Date().toLocaleTimeString("en-GB")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExaminationApplication;
