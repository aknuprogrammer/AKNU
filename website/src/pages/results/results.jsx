import { useState, useRef, useMemo } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { RefreshCw } from "lucide-react";
import { aknuAdikavi, aknuLogo } from "../../assets";

const StudentResultViewer = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [foundStudent, setFoundStudent] = useState(null);
  const [currentBatchIds, setCurrentBatchIds] = useState([]);
  const [previousResults, setPreviousResults] = useState([]);
  const [showPreviousResults, setShowPreviousResults] = useState(false);

  const hasHistory = useMemo(() => {
    const currentBatchIdsList = (currentBatchIds || []).map(id => id.toString());
    return (previousResults || []).some(
      (res) => !currentBatchIdsList.includes(res.batch?._id?.toString())
    );
  }, [previousResults, currentBatchIds]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [prevResultsLoading, setPrevResultsLoading] = useState(false);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  const resultRef = useRef();

  // Generate alphanumeric CAPTCHA
  const generateCaptcha = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  const [captcha, setCaptcha] = useState(generateCaptcha());

  const params = new URLSearchParams(window.location.search);
  const level = params.get("level") || "";
  const semester = params.get("semester") || "";
  const title = params.get("title") || "";
  const date = params.get("date") || "";

  // Helper to safely extract component values (theory_pass, sessional_pass, practical_pass)
  const getComponentValue = (s, ...keys) => {
    for (const k of keys) {
      if (s[k] !== undefined && s[k] !== null && s[k] !== "") return s[k].toString().trim();
      if (s.meta?.[k] !== undefined && s.meta?.[k] !== null && s.meta?.[k] !== "") return s.meta[k].toString().trim();
      const norm = k.toLowerCase().replace(/[\s_-]+/g, "");
      if (s.meta) {
        for (const mk in s.meta) {
          if (mk.toLowerCase().replace(/[\s_-]+/g, "") === norm) {
            if (s.meta[mk] !== undefined && s.meta[mk] !== null && s.meta[mk] !== "") {
              return s.meta[mk].toString().trim();
            }
          }
        }
      }
    }
    return "-";
  };

  // Helper function to safely get student data
  const getStudentData = (result) => {
    let data = {
      RegisterNumber: "N/A",
      StudentName: "N/A",
      CourseName: "N/A",
      Semester: "N/A",
      regularResults: [],
      rvResults: [],
      rabResults: [],
      type: result.type || result.batch?.type || "regular",
    };

    if (!result) return data;

    // Helper to process a list of subjects
    const processSubjects = (list) => {
      if (!list || !Array.isArray(list)) return [];
      return list.map(s => ({
        ...s,
        SubjectName: s.SubjectName || s.Subject,
        Grade: s.Grade,
        SubjectOrder: s.meta?.SubjectOrder ?? s.SubjectOrder,
        Marks: s.Marks || s.meta?.Marks,
        theory_pass: getComponentValue(s, "theory_pass", "theory pass", "theorypass", "theory"),
        sessional_pass: getComponentValue(s, "sessional_pass", "sessional pass", "sessionalpass", "sessional"),
        practical_pass: getComponentValue(s, "practical_pass", "practical pass", "practicalpass", "practical"),
      })).sort((a, b) => (a.SubjectOrder || 0) - (b.SubjectOrder || 0));
    };

    data.regularResults = processSubjects(result.regularResults || result.results || result.Subjects);
    data.regularTitle = data.regularResults[0]?.batchId?.title || "Regular Results";

    data.rvResults = processSubjects(result.rvResults);
    data.rvTitle = data.rvResults[0]?.batchId?.title || "Revaluation Results";

    data.rabResults = processSubjects(result.regularAndBacklogResults);
    data.rabTitle = data.rabResults[0]?.batchId?.title || "Regular & Backlog Results";

    // Unified Student Info (from any available record)
    const allRecords = [...data.regularResults, ...data.rvResults, ...data.rabResults];
    if (allRecords.length > 0) {
      const recordWithName = allRecords.find(s => s.StudentName) || allRecords[0];
      data.RegisterNumber = recordWithName.RegisterNumber || allRecords[0].RegisterNumber || "N/A";
      data.StudentName = recordWithName.StudentName || "N/A";
      data.CourseName = recordWithName.CourseName || allRecords[0].CourseName || "N/A";
      data.Semester = recordWithName.Semester || allRecords[0].Semester || result.batch?.semester || "N/A";
    }

    // Group results and sort by publication date descending (latest on top)
    data.resultGroups = [
      { results: data.regularResults, title: data.regularTitle, color: "text-gray-900", date: data.regularResults[0]?.batchId?.resultDate },
      { results: data.rvResults, title: data.rvTitle, color: "text-gray-900", date: data.rvResults[0]?.batchId?.resultDate },
      { results: data.rabResults, title: data.rabTitle, color: "text-gray-900", date: data.rabResults[0]?.batchId?.resultDate },
    ].filter(g => g.results.length > 0)
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    return data;
  };

  const currentStudentInfo = foundStudent ? getStudentData(foundStudent) : null;

  // com
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a registration number");
      return;
    }

    if (!captchaInput.trim()) {
      setCaptchaError("Please enter the CAPTCHA code");
      // setError("Please enter the CAPTCHA code");
      return;
    }

    if (captchaInput !== captcha) {
      setCaptchaError("CAPTCHA code is incorrect. Please try again.");
      // setError("CAPTCHA code is incorrect. Please try again.");
      setCaptcha(generateCaptcha());
      setCaptchaInput("");
      return;
    }

    setLoading(true);
    setError("");
    setCaptchaError("");
    setFoundStudent(null);
    setPreviousResults([]);
    setShowPreviousResults(false);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}api/results/latest-result`,
        {
          params: {
            RegisterNumber: searchTerm,
          },
        }
      );
      console.log("_____Response", response.data);
      if (response.data.success && !!response.data.data) {
        const studentObj = response.data.data;
        setFoundStudent(studentObj);
        const activeBatchId = studentObj?.currentBatchId || studentObj?.batch?._id?.toString();
        setCurrentBatchIds(activeBatchId ? [activeBatchId] : (studentObj?.allCurrentBatchIds || []));
        setCurrentSemester(studentObj?.batch?.semester);

        // Fetch history immediately for complete PDF records
        try {
          const histRes = await axios.get(
            `${import.meta.env.VITE_API_URL}api/results/previous-results`,
            {
              params: {
                RegisterNumber: searchTerm,
                currentSemester: studentObj?.batch?.semester,
                currentBatchId: activeBatchId,
              },
            }
          );
          if (histRes.data.success) {
            setPreviousResults(histRes.data.data || []);
          }
        } catch (hErr) {
          console.error("Silent history fetch fail:", hErr);
        }
      } else {
        setFoundStudent(null);
        setError("Student results not found. Please check the registration number and try again.");
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("Student results not found. Please check the registration number and try again.");
      setFoundStudent(null);
    } finally {
      setLoading(false);
      // Refresh captcha after every search attempt (success or failure)
      setCaptcha(generateCaptcha());
      setCaptchaInput("");
    }
  };

  const fetchPreviousResults = async () => {
    if (!searchTerm.trim() || !foundStudent) return;

    setPrevResultsLoading(true);
    try {
      const activeBatchId = foundStudent?.currentBatchId || foundStudent?.batch?._id?.toString();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}api/results/previous-results`,
        {
          params: {
            RegisterNumber: searchTerm,
            currentSemester: currentSemester,
            currentBatchId: activeBatchId,
          },
        }
      );

      if (response.data.success) {
        setPreviousResults(response.data.data || []);
        setShowPreviousResults(true);
      }
    } catch (err) {
      console.error("Error fetching previous results:", err);
      setError("Failed to load previous results.");
    } finally {
      setPrevResultsLoading(false);
    }
  };
  console.log("_____CurrentSemester", currentSemester);
  console.log("_____FoundStudent", foundStudent);
  console.log("_____PreviousResults", previousResults);
  const togglePreviousResults = () => {
    if (showPreviousResults) {
      setShowPreviousResults(false);
    } else {
      // ALWAYS fetch when opening if student has changed or no data
      fetchPreviousResults();
    }
  };

  const handlePrint = useReactToPrint({
    content: () => resultRef.current,
    pageStyle: `
      @page { size: A4; margin: 20mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .no-print { display: none !important; }
        .print-header { display: block !important; }
        .previous-results { page-break-before: always; margin-top: 20px; }
      }
    `,
  });

  const capitalize = (str) => {
    if (typeof str !== "string" || !str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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
    pdf.text("RAJAMAHENDRAVARAM, ANDHRA PRADESH - 533296", pageWidth / 2, 26, {
      align: "center",
    });

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(60, 60, 60);
    pdf.text("Accredited by NAAC with 'B+' Grade, ISO 9001:2025 Certified", pageWidth / 2, 31, {
      align: "center",
    });

    // Decorative line
    pdf.setDrawColor(...primaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(marginX, 36, pageWidth - marginX, 36);

    let y = 36; // starting Y position after the line
    y += 10; // spacing before next section

    // Helper function to safely get student data
    // Get current student data
    const currentStudentData = getStudentData(foundStudent);

    // --- IMPROVED STUDENT INFORMATION SECTION ---
    const infoStartY = 42;

    // Section Header with background
    pdf.setFillColor(...accentColor);
    pdf.rect(marginX, infoStartY, pageWidth - marginX * 2, 8, "F");

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...primaryColor);
    pdf.text("STUDENT INFORMATION", marginX, infoStartY + 6);

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
      pdf.text(String(value || "N/A"), marginX + 45, yPosition);

      return yPosition + 6;
    };

    // Add student information lines
    currentY = addInfoLine(
      "Registration Number",
      currentStudentData.RegisterNumber,
      currentY
    );
    currentY = addInfoLine(
      "Student Name",
      capitalize(currentStudentData.StudentName),
      currentY
    );

    const courseName =
      typeof currentStudentData.CourseName === "object"
        ? (currentStudentData.CourseName?.name || "N/A").toUpperCase()
        : (currentStudentData.CourseName || "N/A").toUpperCase();
    currentY = addInfoLine("Course", courseName, currentY);

    currentY = addInfoLine("Semester", currentStudentData.Semester, currentY);

    // --- ACADEMIC PERFORMANCE SECTION ---
    let performanceStartY = currentY + 5;
    const resultTitleStr = (foundStudent.batch?.title || "RESULT").toUpperCase();
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");

    // Split and measure the title
    const maxTitleWidth = pageWidth - marginX * 2 - 10;
    const titleLines = pdf.splitTextToSize(resultTitleStr, maxTitleWidth);
    const titleHeight = (titleLines.length * 5);
    const rectHeight = Math.max(8, titleHeight + 3);

    // Section Header background
    pdf.setFillColor(...accentColor);
    pdf.rect(marginX, performanceStartY, pageWidth - marginX * 2, rectHeight, "F");

    pdf.setTextColor(...primaryColor);
    pdf.text(titleLines, marginX, performanceStartY + 5.5);

    performanceStartY += rectHeight + 2;

    // --- SEMESTER & PUBLISHED DATE ---
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(33, 96, 90); // University Green
    pdf.text(`Semester: ${currentStudentData.Semester}`, marginX, performanceStartY + 4);

    const currPublishDate = foundStudent.batch?.resultDate ? formatDate(foundStudent.batch.resultDate) : "N/A";

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(120, 120, 120);
    pdf.text(`Published: ${currPublishDate}`, pageWidth - marginX - 5, performanceStartY + 4, { align: "right" });

    performanceStartY += 10;

    // Helper to add a table to the PDF
    const addTableToPDF = (results, title, startY, showTitle = true, date = null, semester = null) => {
      if (!results || results.length === 0) return startY;

      let currentStartY = startY;
      if (showTitle) {
        // Title
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(33, 96, 90); // University Green
        pdf.text(title.toUpperCase(), marginX, startY + 5);
        currentStartY += 6;

        // Semester (if provided)
        if (semester) {
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(33, 96, 90); // University Green
          pdf.text(`Semester: ${semester}`, marginX, currentStartY + 4);

          if (date) {
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(120, 120, 120);
            pdf.text(`Published: ${formatDate(date)}`, pageWidth - marginX - 5, currentStartY + 4, { align: "right" });
          }
          currentStartY += 5;
        } else if (date) {
          // If no semester line, put date on the right of the title line (approx)
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(120, 120, 120);
          pdf.text(`Published: ${formatDate(date)}`, pageWidth - marginX - 5, currentStartY - 1, { align: "right" });
        }

        currentStartY += 2;
      } else {
        currentStartY += 2;
      }

      const is2012 =
        /\b2012\b/i.test(title || "") ||
        /\b2012\b/i.test(foundStudent?.batch?.title || "") ||
        /\b2012\b/i.test(currentStudentData?.title || "") ||
        (results || []).some(
          (s) =>
            s.meta?.year === "2012" ||
            s.meta?.year === 2012 ||
            s.year === "2012" ||
            s.year === 2012
        );

      const hasComponentData =
        (results || []).some(
          (s) =>
            (s.theory_pass && s.theory_pass !== "-") ||
            (s.sessional_pass && s.sessional_pass !== "-") ||
            (s.practical_pass && s.practical_pass !== "-")
        ) ||
        /\b(2012|2013|2014)\b/i.test(title || "") ||
        /\b(2012|2013|2014)\b/i.test(foundStudent?.batch?.title || "") ||
        (results || []).some(
          (s) =>
            ["2012", "2013", "2014"].includes(String(s.meta?.year || s.year || ""))
        );

      let headRow = ["Subject Name"];
      if (hasComponentData) {
        if (is2012) {
          headRow.push("Theory", "Sessional");
        } else {
          headRow.push("Theory", "Sessional", "Practical");
        }
      } else {
        headRow.push("Grade");
      }

      const tableHead = [headRow];

      const tableBody = results.map((s) => {
        const row = [capitalize(s.SubjectName)];
        if (hasComponentData) {
          row.push(s.theory_pass || "-");
          row.push(s.sessional_pass || "-");
          if (!is2012) {
            row.push(s.practical_pass || "-");
          }
        } else {
          row.push((s.Grade || "").toUpperCase());
        }
        return row;
      });

      const colCount = headRow.length;
      const columnStyles = {
        0: {
          cellWidth: colCount === 4 ? 75 : colCount === 3 ? 90 : 120,
          fontStyle: "bold",
          halign: "left",
        },
      };
      for (let c = 1; c < colCount; c++) {
        columnStyles[c] = {
          cellWidth: colCount === 4 ? 30 : colCount === 3 ? 35 : 30,
          halign: "center",
          fontStyle: "bold",
        };
      }

      autoTable(pdf, {
        startY: currentStartY,
        head: tableHead,
        body: tableBody,
        margin: { left: marginX, right: marginX },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          valign: "middle",
          textColor: [40, 40, 40],
          lineColor: [220, 220, 220],
          lineWidth: 0.3,
        },
        headStyles: {
          fillColor: secondaryColor,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "left",
          fontSize: 9,
        },
        columnStyles,
        alternateRowStyles: { fillColor: [248, 250, 249] },
        theme: "grid",
      });

      return pdf.lastAutoTable.finalY + 10;
    };

    (currentStudentData.resultGroups || []).forEach((group, index) => {
      // Skip title for the first group as it's already in the main header
      // For subsequent groups, show title, semester and date
      const showTitle = index > 0;
      const semToPass = showTitle ? currentStudentData.Semester : null;
      performanceStartY = addTableToPDF(group.results, group.title, performanceStartY, showTitle, group.date, semToPass);
    });

    const finalY = performanceStartY;

    // You can add a summary section here if needed
    // pdf.setFontSize(10);
    // pdf.setFont("helvetica", "bold");
    // pdf.text("Overall Performance: Good", marginX, finalY);

    // --- PREVIOUS RESULTS (HISTORY) ---
    if (previousResults && previousResults.length > 0) {
      const currentBatchIdsList = (currentBatchIds || []).map(id => id.toString());
      const filteredHistory = previousResults
        .filter((res) => !currentBatchIdsList.includes(res.batch?._id?.toString()))
        .sort((a, b) => {
          const semDiff = (a.batch?.semester || 0) - (b.batch?.semester || 0);
          if (semDiff !== 0) return semDiff;
          return new Date(b.batch?.resultDate || 0) - new Date(a.batch?.resultDate || 0);
        });

      if (filteredHistory.length > 0) {
        let currentY = pdf.lastAutoTable.finalY + 10;

        filteredHistory.forEach((batchItem) => {
          if (currentY > 240) {
            pdf.addPage();
            currentY = 25;
          }

          const studentData = getStudentData(batchItem);
          const headerTitleStr = (batchItem.batch?.title || "RESULT").toUpperCase();

          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");

          const maxW = pageWidth - marginX * 2 - 10;
          const lines = pdf.splitTextToSize(headerTitleStr, maxW);
          const linesH = (lines.length * 5);
          const rHeight = Math.max(8, linesH + 3);

          // Header Bar Back
          pdf.setFillColor(...accentColor);
          pdf.rect(marginX, currentY, pageWidth - marginX * 2, rHeight, "F");
          pdf.setTextColor(...primaryColor);
          pdf.text(lines, marginX, currentY + 5.5);

          currentY += rHeight + 2;

          // Grouped Semester & Date
          const histPubDateString = batchItem.batch?.resultDate ? formatDate(batchItem.batch.resultDate) : "N/A";
          // Grouped Semester & Date
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(33, 96, 90); // University Green
          const semNumVal = batchItem.batch?.semester || studentData.Semester;
          pdf.text(`Semester: ${semNumVal}`, marginX, currentY + 4);

          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(120, 120, 120);
          pdf.text(`Published: ${histPubDateString}`, pageWidth - marginX - 5, currentY + 4, { align: "right" });

          currentY += 12; // Add space after the Semester/Published line
          (studentData.resultGroups || []).forEach(group => {
            currentY = addTableToPDF(group.results, group.title, currentY, false);
          });
        });
      }
    }

    // Footer Section
    // const footerY = pdf.lastAutoTable ? pdf.lastAutoTable.finalY + 15 : 270;

    // pdf.setDrawColor(...primaryColor);
    // pdf.setLineWidth(0.3);
    // pdf.line(marginX, footerY, pageWidth - marginX, footerY);

    // pdf.setFontSize(8);
    // pdf.setTextColor(100, 100, 100);
    // pdf.text(
    //   `Document generated on ${new Date().toLocaleDateString()}`,
    //   pageWidth / 2,
    //   footerY + 8,
    //   { align: "center" }
    // );

    // Save the PDF
    pdf.save(
      `${currentStudentData.RegisterNumber}_Result_${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  const toTitleCase = (str) => {
    if (!str) return "N/A";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-teal-800 mb-2">
          Check Your Results
        </h2>
        <p className="text-gray-600 mb-4">
          Enter your registration number to view your result
        </p>

        <div className="flex flex-col gap-2 mb-4 no-print">
          <div className="flex flex-wrap gap-2 items-center justify-center">
            <input
              type="text"
              placeholder="Enter registration number..."
              className="w-60 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#21605A] focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />

            {/* CAPTCHA */}
            <div className="flex items-center gap-2">
              <span
                className="font-semibold tracking-widest px-4 py-2 border-2 border-gray-400 rounded-md bg-gray-100 text-lg text-gray-800 whitespace-nowrap select-none"
                style={{
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none",
                  msUserSelect: "none",
                }}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              >
                {captcha}
              </span>
              <button
                type="button"
                onClick={() => {
                  setCaptcha(generateCaptcha());
                  setCaptchaInput("");
                  setCaptchaError("");
                }}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Refresh Captcha"
              >
                <RefreshCw size={20} stroke="#21605A" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Enter CAPTCHA"
              value={captchaInput}
              onChange={(e) => {
                setCaptchaInput(e.target.value);
                setCaptchaError("");
                setError("");
              }}
              className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#21605A] focus:outline-none w-40"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />

            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-[#21605A] text-white rounded-md hover:bg-[#1a4a45] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
          {captchaError && (
            <p className="text-red-500 text-sm text-center">{captchaError}</p>
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
          <h1
            className="text-2xl md:text-3xl text-center font-bold text-gray-900 mb-2"
            aria-label="Batch title"
          >
            {foundStudent.batch?.title || "Untitled Batch"}
          </h1>

          <div className="flex flex-wrap gap-2 no-print">
            {/* <button
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
            </button> */}
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
            {previousResults && previousResults.length > 0 && hasHistory ? (
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
                      ? "Hide All Results"
                      : "Show All Results"}
                  </>
                )}
              </button>
            ) : (
              <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-md text-sm border border-gray-200">
                No previous results found
              </div>
            )}
          </div>

          <div
            ref={resultRef}
            className="border border-gray-200 rounded-lg p-6 bg-white"
          >
            <div className="hidden print-header mb-6 text-center border-b pb-4">
              <h1 className="text-2xl font-bold text-teal-800">
                {title || "Academic Results"}
              </h1>
              <p className="text-gray-600">
                {level} Semester {semester} - {date}
              </p>
              <p className="text-gray-600 mt-2">
                Official Result Document - {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                Student Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Register Number</p>
                  <p className="font-medium text-lg">
                    {currentStudentInfo.RegisterNumber}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-lg">
                    {capitalize(currentStudentInfo.StudentName)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="font-medium text-lg">
                    {(() => {
                      const course = currentStudentInfo.CourseName;
                      return typeof course === "object"
                        ? course?.name || "N/A"
                        : course || "N/A";
                    })()}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Semester</p>
                  <p className="font-medium text-lg">
                    {currentStudentInfo.Semester}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Result Type</p>
                  <p
                    className={`font-medium text-lg ${foundStudent.type === "rv"
                      ? "text-purple-600"
                      : foundStudent.type === "regularAndBacklog" || foundStudent.type === "rANDb"
                        ? "text-blue-600"
                        : "text-blue-600"
                      }`}
                  >
                    {foundStudent.type === "rv"
                      ? "Revaluation"
                      : foundStudent.type === "regularAndBacklog" || foundStudent.type === "rANDb"
                        ? "Regular and Backlog"
                        : "Regular"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                Current Semester
              </h3>

              {/* Helper to render a results table */}
              {(() => {
                const renderResultsTable = (results, title, colorClass, date) => {
                  const is2012 =
                    /\b2012\b/i.test(title || "") ||
                    /\b2012\b/i.test(foundStudent?.batch?.title || "") ||
                    /\b2012\b/i.test(currentStudentInfo?.title || "") ||
                    (results || []).some(
                      (s) =>
                        s.meta?.year === "2012" ||
                        s.meta?.year === 2012 ||
                        s.year === "2012" ||
                        s.year === 2012
                    );

                  const hasComponentData =
                    (results || []).some(
                      (s) =>
                        (s.theory_pass && s.theory_pass !== "-") ||
                        (s.sessional_pass && s.sessional_pass !== "-") ||
                        (s.practical_pass && s.practical_pass !== "-")
                    ) ||
                    /\b(2012|2013|2014)\b/i.test(title || "") ||
                    /\b(2012|2013|2014)\b/i.test(foundStudent?.batch?.title || "") ||
                    (results || []).some(
                      (s) =>
                        ["2012", "2013", "2014"].includes(String(s.meta?.year || s.year || ""))
                    );

                  const showTheory = hasComponentData;
                  const showSessional = hasComponentData;
                  const showPractical = hasComponentData && !is2012;
                  const showGrade = !hasComponentData;

                  const renderBadge = (val) => {
                    if (!val || val === "-" || val.toString().trim() === "") {
                      return <span className="text-gray-400 font-bold text-base">-</span>;
                    }
                    const upper = val.toString().trim().toUpperCase();
                    if (upper === "FAIL" || upper === "F") {
                      return (
                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-700">
                          {toTitleCase(val)}
                        </span>
                      );
                    }
                    if (upper === "PASS" || upper === "P") {
                      return (
                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-50 text-blue-700">
                          {toTitleCase(val)}
                        </span>
                      );
                    }
                    return (
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-gray-100 text-gray-800">
                        {toTitleCase(val)}
                      </span>
                    );
                  };

                  return (
                    <div className="mb-8 last:mb-0">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className={`text-lg font-semibold ${colorClass}`}>
                          {title}
                        </h4>
                        {date && (
                          <p className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                            Published: {formatDate(date)}
                          </p>
                        )}
                      </div>
                      <div className="overflow-x-auto border border-gray-200 shadow-sm rounded">
                        <table className="min-w-full divide-y divide-gray-200 text-left">
                          <thead className="bg-[#21605A] text-white">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                Subject
                              </th>
                              {showTheory && (
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-28">
                                  Theory
                                </th>
                              )}
                              {showSessional && (
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-28">
                                  Sessional
                                </th>
                              )}
                              {showPractical && (
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-28">
                                  Practical
                                </th>
                              )}
                              {showGrade && (
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider w-24">
                                  Grade
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-100">
                            {results.map((subject, index) => (
                              <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {subject.SubjectName}
                                </td>
                                {showTheory && (
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                                    {renderBadge(subject.theory_pass)}
                                  </td>
                                )}
                                {showSessional && (
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                                    {renderBadge(subject.sessional_pass)}
                                  </td>
                                )}
                                {showPractical && (
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                                    {renderBadge(subject.practical_pass)}
                                  </td>
                                )}
                                {showGrade && (
                                  <td className="px-6 py-4 whitespace-nowrap text-sm w-24 text-left">
                                    {renderBadge(subject.Grade)}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                };

                return (
                  <>
                    {(currentStudentInfo.resultGroups || []).map((group, idx) => (
                      <div key={idx}>
                        {renderResultsTable(group.results, group.title, group.color, group.date)}
                      </div>
                    ))}

                    {(currentStudentInfo.resultGroups || []).length === 0 && (
                      <p className="text-center py-8 text-gray-500 italic">No results found for this selection.</p>
                    )}
                  </>
                );
              })()}
            </div>

            {showPreviousResults && (
              <div className="previous-results mt-10 no-print">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b">
                  Previous Results
                </h3>
                <div className="space-y-6">
                  {(() => {
                    const currentBatchIdsList = (currentBatchIds || []).map(id => id.toString());
                    const otherBatches = (previousResults || []).filter(
                      (res) => !currentBatchIdsList.includes(res.batch?._id?.toString())
                    ).sort((a, b) => {
                      const semA = a.batch?.semester || 0;
                      const semB = b.batch?.semester || 0;
                      if (semA !== semB) return semA - semB;
                      return new Date(b.batch?.resultDate || 0) - new Date(a.batch?.resultDate || 0);
                    });

                    if (otherBatches.length === 0) {
                      return (
                        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          <p className="text-gray-500 italic">No previous results found for this student.</p>
                        </div>
                      );
                    }

                    return otherBatches.map((result, index) => {
                      const allBatchRecords = [
                        ...(result.results || []),
                        ...(result.rvResults || []),
                        ...(result.regularAndBacklogResults || []),
                      ];
                      const sName = allBatchRecords.find((r) => r.StudentName)?.StudentName || "N/A";
                      const rNum = allBatchRecords.find((r) => r.RegisterNumber)?.RegisterNumber || "N/A";
                      const semDisplay = result.batch?.semester
                        ? `Semester ${result.batch.semester}`
                        : allBatchRecords[0]?.Semester
                          ? `Semester ${allBatchRecords[0].Semester}`
                          : "";

                      return (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-6 bg-gray-50 shadow-sm"
                        >
                          {/* Batch Info */}
                          <div className="mb-4 pb-2 border-b border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-700">
                              {result.batch?.title?.charAt(0).toUpperCase() +
                                result.batch?.title?.slice(1) || "N/A"}{" "}
                              {semDisplay ? `- ${semDisplay}` : ""}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Result Date: {formatDate(result.batch?.resultDate)}
                            </p>
                          </div>

                          {/* Student Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">Student Name</p>
                              <p className="font-medium">{capitalize(sName)}</p>
                            </div>

                            <div>
                              <p className="text-sm text-gray-500">
                                Registration Number
                              </p>
                              <p className="font-medium">{rNum}</p>
                            </div>
                          </div>

                          {/* Subjects */}
                          <div className="space-y-3">
                            <h5 className="text-md font-medium text-gray-700">
                              Subjects
                            </h5>
                            {(() => {
                              let subjects =
                                result.batch.type === "rv"
                                  ? result.rvResults
                                  : result.batch.type === "regularAndBacklog"
                                    ? result.regularAndBacklogResults
                                    : result.batch.type === "rANDb"
                                      ? result.regularAndBacklogResults
                                      : result.results;

                              // Handle if subjects is a single object instead of an array
                              if (!Array.isArray(subjects)) {
                                subjects = subjects ? [subjects] : [];
                              }

                              // Sort by SubjectOrder if available (from meta.SubjectOrder)
                              if (Array.isArray(subjects)) {
                                subjects.sort((a, b) => {
                                  const orderA =
                                    a.meta?.SubjectOrder ?? a.SubjectOrder;
                                  const orderB =
                                    b.meta?.SubjectOrder ?? b.SubjectOrder;
                                  if (orderA != null && orderB != null) {
                                    return orderA - orderB;
                                  }
                                  return 0; // leave unsorted if no order
                                });
                              }

                              const isHist2012 =
                                /\b2012\b/i.test(result.batch?.title || "") ||
                                (subjects || []).some(
                                  (s) =>
                                    s.meta?.year === "2012" ||
                                    s.meta?.year === 2012 ||
                                    s.year === "2012" ||
                                    s.year === 2012
                                );

                              return subjects?.map((subject, subIndex) => {
                                const th = getComponentValue(subject, "theory_pass", "theory pass", "theorypass", "theory");
                                const se = getComponentValue(subject, "sessional_pass", "sessional pass", "sessionalpass", "sessional");
                                const pr = getComponentValue(subject, "practical_pass", "practical pass", "practicalpass", "practical");
                                const hasComps = th !== "-" || se !== "-" || pr !== "-";

                                return (
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
                                      {hasComps && (
                                        <div className="hidden sm:flex items-center space-x-3 text-xs text-gray-600">
                                          <span>
                                            Theory:{" "}
                                            <strong className={th.toUpperCase() === "FAIL" ? "text-red-600" : th.toUpperCase() === "PASS" ? "text-blue-600" : "text-gray-400"}>
                                              {th}
                                            </strong>
                                          </span>
                                          <span>
                                            Sessional:{" "}
                                            <strong className={se.toUpperCase() === "FAIL" ? "text-red-600" : se.toUpperCase() === "PASS" ? "text-blue-600" : "text-gray-400"}>
                                              {se}
                                            </strong>
                                          </span>
                                          {!isHist2012 && (
                                            <span>
                                              Practical:{" "}
                                              <strong className={pr.toUpperCase() === "FAIL" ? "text-red-600" : pr.toUpperCase() === "PASS" ? "text-blue-600" : "text-gray-400"}>
                                                {pr}
                                              </strong>
                                            </span>
                                          )}
                                        </div>
                                      )}
                                      {!hasComps && (
                                        <div>
                                          <p className="text-sm text-gray-500">Grade</p>
                                          <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${subject.Grade === "A+"
                                              ? "bg-green-100 text-green-800"
                                              : subject.Grade === "F" || subject.Grade?.toUpperCase() === "FAIL"
                                                ? "bg-red-100 text-red-800"
                                                : "bg-blue-100 text-blue-800"
                                              }`}
                                          >
                                            {toTitleCase(subject.Grade) || "N/A"}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      );
                    });
                  })()}
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
              Please enter your registration number to search your results.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentResultViewer;
