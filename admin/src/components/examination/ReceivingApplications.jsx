import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import {
  loadLogoAsBase64,
  loadNannayaLogoAsBase64,
} from "./masterData/utils/loadLogoAsBase64";
import {
  examinationPaymentApi,
  seatingArrangementsApi,
} from "../../services/apiService";
import { showErrorMessage, showSuccessMessage } from "../../config/Toast";

const ReceivingApplications = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentTransactions, setPaymentTransactions] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showHallTicketModal, setShowHallTicketModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch payment transactions on component mount
  useEffect(() => {
    fetchPaymentTransactions();
  }, []);

  // Fetch payment transactions from API
  const fetchPaymentTransactions = async () => {
    try {
      setLoading(true);
      const response = await examinationPaymentApi.getAllPayments({
        status: "SUCCESS", // Only fetch successful payments
        limit: 1000, // Fetch more records
      });

      const payments = response?.data?.payments || response?.data || [];
      setPaymentTransactions(payments);

      // Transform payment transactions to student format
      const transformedStudents = await Promise.all(
        payments.map(async (payment, index) => {
          // Generate hall ticket ID from registration number (only if not already saved)
          const regNum = payment.registration_number || "";
          const generatedHallTicketId = regNum
            ? `HT-${regNum.slice(-6)}`
            : `HT-${String(index + 1).padStart(3, "0")}`;

          // Fetch seating arrangement for this student
          let seatingInfo = null;
          if (regNum) {
            try {
              const seatingResponse = await seatingArrangementsApi.getAll({
                registrationNumber: regNum,
                status: "Active",
                limit: 1,
              });
              const seatingData =
                seatingResponse?.data?.data || seatingResponse?.data || [];
              if (Array.isArray(seatingData) && seatingData.length > 0) {
                seatingInfo = seatingData[0];
              }
            } catch (error) {
              console.error(
                `Error fetching seating arrangement for ${regNum}:`,
                error
              );
            }
          }

          // Extract center information from seating arrangement
          const centerInfo = seatingInfo
            ? {
                centerId: seatingInfo.centerId?._id || seatingInfo.centerId,
                centerName:
                  seatingInfo.centerId?.name ||
                  seatingInfo.centerName ||
                  "Not Assigned",
                centerCode:
                  seatingInfo.centerId?.code || seatingInfo.centerCode || "N/A",
                centerAddress:
                  seatingInfo.centerId?.address || "Address not available",
                roomNumber: seatingInfo.roomNumber || "N/A",
                seatNumber: seatingInfo.seatNumber || "N/A",
                // scriptCode: seatingInfo.scriptCode || "N/A",
              }
            : {
                centerId: null,
                centerName: "Not Assigned",
                centerCode: "N/A",
                centerAddress: "Address not available",
                roomNumber: "N/A",
                seatNumber: "N/A",
                scriptCode: "N/A",
              };

          return {
            id: index + 1,
            name: payment.student_name || "N/A",
            rollNumber: payment.registration_number || "N/A",
            registrationNumber: payment.registration_number || "N/A",
            college: seatingInfo?.collegeName || "AKNU College",
            course: payment.course || "N/A",
            semester: payment.semester || "N/A",
            year: payment.semester || "N/A",
            email: payment.email || "",
            phone: payment.phone || "",
            paymentStatus:
              payment.payment_status === "SUCCESS" ? "Paid" : "Pending",
            paymentDate: payment.payment_completed_at
              ? new Date(payment.payment_completed_at)
                  .toISOString()
                  .split("T")[0]
              : payment.createdAt
              ? new Date(payment.createdAt).toISOString().split("T")[0]
              : null,
            hallTicketGenerated: payment.hall_ticket_generated || false,
            hallTicketId: payment.hall_ticket_id || generatedHallTicketId,
            transactionId: payment.transaction_id || "",
            amount: payment.amount || 0,
            regularSubjects: payment.regular_subjects_names || [],
            supplementarySubjects: payment.supplementary_subjects_names || [],
            // Debug: log if subjects are missing
            _debug: {
              hasRegularSubjectsNames: !!payment.regular_subjects_names,
              hasSupplementarySubjectsNames:
                !!payment.supplementary_subjects_names,
              regularSubjectsNamesLength:
                payment.regular_subjects_names?.length || 0,
              supplementarySubjectsNamesLength:
                payment.supplementary_subjects_names?.length || 0,
            },
            regularSubjectCount: payment.regular_subject_count || 0,
            supplementarySubjectCount: payment.supplementary_subject_count || 0,
            bankReferenceNumber: payment.bank_reference_number || "",
            paymentGateway: payment.payment_gateway || "Easebuzz",
            // Add center information from seating arrangement
            ...centerInfo,
          };
        })
      );

      setStudents(transformedStudents);

      // Debug: Check if any student has subjects
      const studentsWithSubjects = transformedStudents.filter(
        (s) =>
          s.regularSubjects?.length > 0 || s.supplementarySubjects?.length > 0
      );
      if (studentsWithSubjects.length > 0) {
        console.log(
          "✅ Students with subjects found:",
          studentsWithSubjects.length
        );
        console.log("Sample student subjects:", {
          regular: studentsWithSubjects[0].regularSubjects,
          supplementary: studentsWithSubjects[0].supplementarySubjects,
        });
      } else {
        console.warn("⚠️ No students with subjects found");
        if (transformedStudents.length > 0) {
          console.log("Sample student data:", {
            regularSubjects: transformedStudents[0].regularSubjects,
            supplementarySubjects: transformedStudents[0].supplementarySubjects,
            _debug: transformedStudents[0]._debug,
          });
        }
        // Log the raw payment data to see what we're getting from the API
        if (payments.length > 0) {
          console.log("🔍 Raw payment data from API:", {
            transactionId: payments[0].transaction_id,
            regular_subjects: payments[0].regular_subjects,
            regular_subjects_names: payments[0].regular_subjects_names,
            supplementary_subjects: payments[0].supplementary_subjects,
            supplementary_subjects_names:
              payments[0].supplementary_subjects_names,
            regular_subjects_type: typeof payments[0].regular_subjects,
            regular_subjects_isArray: Array.isArray(
              payments[0].regular_subjects
            ),
            regular_subjects_length: payments[0].regular_subjects?.length,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching payment transactions:", error);
      showErrorMessage("Failed to fetch payment transactions");
    } finally {
      setLoading(false);
    }
  };

  // Refresh payment transactions
  const handleRefresh = () => {
    fetchPaymentTransactions();
  };

  // Mock examination center and schedule data
  const examinationCenters = {
    "AKNU College of Engineering": {
      centerName: "AKNU Main Campus - Engineering Block",
      centerCode: "AKNU-ENG-001",
      address: "AKNU Main Campus, Engineering Block, Room 101-105",
    },
    "AKNU College of Commerce": {
      centerName: "AKNU Main Campus - Commerce Block",
      centerCode: "AKNU-COM-001",
      address: "AKNU Main Campus, Commerce Block, Room 201-205",
    },
    "AKNU College of Arts": {
      centerName: "AKNU Main Campus - Arts Block",
      centerCode: "AKNU-ARTS-001",
      address: "AKNU Main Campus, Arts Block, Room 301-305",
    },
  };

  const examSchedule = {
    "B.Tech": [
      {
        semNo: "04",
        subjectCode: "21CS1401",
        subject: "Database Management Systems",
        date: "2024-03-15",
        time: "09:00 AM",
      },
      {
        semNo: "04",
        subjectCode: "21CS1402",
        subject: "Design and Analysis of Algorithms",
        date: "2024-03-16",
        time: "09:00 AM",
      },
      {
        semNo: "04",
        subjectCode: "21CS1403",
        subject: "Computer Networks",
        date: "2024-03-17",
        time: "09:00 AM",
      },
      {
        semNo: "04",
        subjectCode: "21CS1411",
        subject: "Database Management Systems Laboratory",
        date: "",
        time: "",
      },
      {
        semNo: "04",
        subjectCode: "21CS1412",
        subject: "Networks Laboratory",
        date: "",
        time: "",
      },
    ],
    "B.Com": [
      {
        semNo: "04",
        subjectCode: "21BA1401",
        subject: "Financial Accounting",
        date: "2024-03-15",
        time: "09:00 AM",
      },
      {
        semNo: "04",
        subjectCode: "21BA1402",
        subject: "Business Law",
        date: "2024-03-16",
        time: "09:00 AM",
      },
      {
        semNo: "04",
        subjectCode: "21BA1403",
        subject: "Economics",
        date: "2024-03-17",
        time: "09:00 AM",
      },
    ],
    "B.A": [
      {
        semNo: "04",
        subjectCode: "21AR1401",
        subject: "English Literature",
        date: "2024-03-15",
        time: "09:00 AM",
      },
      {
        semNo: "04",
        subjectCode: "21AR1402",
        subject: "History",
        date: "2024-03-16",
        time: "09:00 AM",
      },
      {
        semNo: "04",
        subjectCode: "21AR1403",
        subject: "Political Science",
        date: "2024-03-17",
        time: "09:00 AM",
      },
    ],
  };

  const instructions = [
    "Students must report to the examination center 30 minutes before the exam time.",
    "Carry a valid ID card and hall ticket to the examination center.",
    "Electronic devices, mobile phones, and calculators are not allowed unless specified.",
    "Follow all COVID-19 safety protocols as per university guidelines.",
    "Any form of malpractice will result in immediate disqualification.",
    "Students must maintain silence and discipline during the examination.",
  ];

  const handleVerifyPayment = (studentId) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              paymentStatus: "Paid",
              paymentDate: new Date().toISOString().split("T")[0],
            }
          : s
      )
    );
  };

  const handleGenerateHallTicket = async (student) => {
    if (student.paymentStatus !== "Paid") {
      showErrorMessage("Cannot generate hall ticket. Payment not verified.");
      return;
    }

    try {
      // Generate hall ticket ID from registration number
      const regNum = student.registrationNumber || student.rollNumber || "";
      const hallTicketId = regNum
        ? `HT-${regNum.slice(-6)}`
        : `HT-2024-${String(student.id).padStart(3, "0")}`;

      // Save to backend
      await examinationPaymentApi.updateHallTicketStatus(
        student.transactionId,
        {
          hallTicketId,
          hallTicketGenerated: true,
        }
      );

      // Update local state
      setStudents((prev) =>
        prev.map((s) =>
          s.id === student.id
            ? { ...s, hallTicketGenerated: true, hallTicketId }
            : s
        )
      );
      setSelectedStudent({
        ...student,
        hallTicketId,
        hallTicketGenerated: true,
      });
      setShowHallTicketModal(true);
      showSuccessMessage("Hall ticket generated successfully");
    } catch (error) {
      console.error("Error generating hall ticket:", error);
      showErrorMessage("Failed to generate hall ticket. Please try again.");
    }
  };

  const handleViewHallTicket = (student) => {
    setSelectedStudent(student);
    setShowHallTicketModal(true);
  };

  const handleBulkGenerate = async () => {
    const eligibleStudents = students.filter(
      (s) => s.paymentStatus === "Paid" && !s.hallTicketGenerated
    );

    if (eligibleStudents.length === 0) {
      showErrorMessage(
        "No eligible students found for hall ticket generation."
      );
      return;
    }

    if (
      window.confirm(
        `Generate hall tickets for ${eligibleStudents.length} eligible students?`
      )
    ) {
      try {
        // Generate hall tickets for all eligible students
        const promises = eligibleStudents.map(async (s) => {
          const regNum = s.registrationNumber || s.rollNumber || "";
          const hallTicketId = regNum
            ? `HT-${regNum.slice(-6)}`
            : `HT-2024-${String(s.id).padStart(3, "0")}`;

          // Save to backend
          await examinationPaymentApi.updateHallTicketStatus(s.transactionId, {
            hallTicketId,
            hallTicketGenerated: true,
          });

          return { id: s.id, hallTicketId };
        });

        await Promise.all(promises);

        // Update local state
        setStudents((prev) =>
          prev.map((s) => {
            if (s.paymentStatus === "Paid" && !s.hallTicketGenerated) {
              const regNum = s.registrationNumber || s.rollNumber || "";
              const hallTicketId = regNum
                ? `HT-${regNum.slice(-6)}`
                : `HT-2024-${String(s.id).padStart(3, "0")}`;
              return {
                ...s,
                hallTicketGenerated: true,
                hallTicketId,
              };
            }
            return s;
          })
        );
        showSuccessMessage(
          `Hall tickets generated for ${eligibleStudents.length} students.`
        );
      } catch (error) {
        console.error("Error generating hall tickets:", error);
        showErrorMessage(
          "Failed to generate some hall tickets. Please try again."
        );
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateForSubject = (dateString, timeString) => {
    if (!dateString) return "";
    const formattedDate = formatDate(dateString); // Returns DD-MM-YYYY
    const period =
      timeString && timeString.includes("AM")
        ? "FN"
        : timeString && timeString.includes("PM")
        ? "AN"
        : "";
    return period ? `${formattedDate} ${period}` : "";
  };

  const handleDownloadPDF = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      let yPos = margin;

      // Load logos
      let logoData = null;
      let nannayaLogoData = null;
      try {
        logoData = await loadLogoAsBase64();
      } catch (error) {
        console.warn("Could not load logo:", error);
      }
      try {
        nannayaLogoData = await loadNannayaLogoAsBase64();
      } catch (error) {
        console.warn("Could not load Nannaya logo:", error);
      }

      // Header Section - Matching reference design
      const logoSize = 20;
      const logoX = margin;
      const logoY = yPos;

      // Left logo
      if (logoData) {
        pdf.addImage(logoData, "PNG", logoX, logoY, logoSize, logoSize);
      }

      // Candidate Photo Box on right (placeholder)
      const photoBoxSize = 25;
      const photoBoxX = pageWidth - margin - photoBoxSize;
      const photoBoxY = yPos;

      // Right logo (Nannaya) - smaller, inside or near photo box
      if (nannayaLogoData) {
        pdf.addImage(
          nannayaLogoData,
          "PNG",
          photoBoxX,
          photoBoxY,
          photoBoxSize * 0.8,
          photoBoxSize * 0.8
        );
      }

      // University/College Name (centered)
      const leftLogoWidth = logoData ? logoSize + 5 : 0;
      const rightLogoWidth = photoBoxSize + 5;
      const textStartX = margin + leftLogoWidth;
      const textWidth = pageWidth - textStartX - rightLogoWidth - margin;
      const textCenterX = textStartX + textWidth / 2;

      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.text("ADIKAVI NANNAYA UNIVERSITY", textCenterX, yPos + 6, {
        align: "center",
      });

      // Affiliation text
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        "RAJAMAHENDRAVARAM, ANDHRA PRADESH INDIA - 533296",
        textCenterX,
        yPos + 11,
        {
          align: "center",
        }
      );

      yPos += 18;

      // Examination Details
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("END SEMESTER EXAMINATIONS - 2024", textCenterX, yPos, {
        align: "center",
      });
      yPos += 6;

      // Hall Ticket Title
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("HALL TICKET", textCenterX, yPos, {
        align: "center",
      });
      yPos += 10;

      // Student Details Section - Matching reference (3 rows, 4 columns table)
      const sectionWidth = pageWidth - 2 * margin;
      const rowHeight = 10; // Increased to accommodate wrapped text
      const tableStartY = yPos;
      const numRows = 3;
      const tableHeight = rowHeight * numRows;

      // Column widths - 4 equal columns
      const colWidth = sectionWidth / 4;

      // Table border
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.rect(margin, tableStartY, sectionWidth, tableHeight);

      // Row 1: Register Number | Value | Hall Ticket ID | Value
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      let xPos = margin + 2;
      pdf.text("Register Number", xPos, tableStartY + 4);
      xPos += colWidth;
      pdf.setFont("helvetica", "normal");
      pdf.text(
        selectedStudent.rollNumber ||
          selectedStudent.registrationNumber ||
          "N/A",
        xPos,
        tableStartY + 4
      );
      xPos += colWidth;
      pdf.setFont("helvetica", "bold");
      pdf.text("Hall Ticket ID", xPos, tableStartY + 4);
      xPos += colWidth;
      pdf.setFont("helvetica", "normal");
      const hallTicketId = selectedStudent.hallTicketId || "N/A";
      pdf.text(hallTicketId, xPos, tableStartY + 4);

      // Horizontal line after row 1
      pdf.line(
        margin,
        tableStartY + rowHeight,
        margin + sectionWidth,
        tableStartY + rowHeight
      );

      // Vertical lines for row 1 (all 4 columns)
      xPos = margin + colWidth;
      pdf.line(xPos, tableStartY, xPos, tableStartY + rowHeight);
      xPos += colWidth;
      pdf.line(xPos, tableStartY, xPos, tableStartY + rowHeight);
      xPos += colWidth;
      pdf.line(xPos, tableStartY, xPos, tableStartY + rowHeight);

      // Row 2: Name | Value | Email | Value
      const row2Y = tableStartY + rowHeight;
      xPos = margin + 2;
      pdf.setFont("helvetica", "bold");
      pdf.text("Name", xPos, row2Y + 4);
      xPos += colWidth;
      pdf.setFont("helvetica", "normal");
      const nameText = selectedStudent.name || "N/A";
      const nameSplit = pdf.splitTextToSize(nameText, colWidth - 4);
      pdf.text(nameSplit, xPos, row2Y + 4);
      xPos += colWidth;
      pdf.setFont("helvetica", "bold");
      pdf.text("Email", xPos, row2Y + 4);
      xPos += colWidth;
      pdf.setFont("helvetica", "normal");
      const emailText = selectedStudent.email || "N/A";
      const emailSplit = pdf.splitTextToSize(emailText, colWidth - 4);
      pdf.text(emailSplit, xPos, row2Y + 4);

      // Horizontal line after row 2
      pdf.line(
        margin,
        row2Y + rowHeight,
        margin + sectionWidth,
        row2Y + rowHeight
      );

      // Vertical line between col1 and col2 for row 2
      xPos = margin + colWidth;
      pdf.line(xPos, row2Y, xPos, row2Y + rowHeight);

      // Row 3: Course & Semester | Value | Phone | Value
      const row3Y = tableStartY + rowHeight * 2;
      xPos = margin + 2;
      pdf.setFont("helvetica", "bold");
      pdf.text("Course & Semester", xPos, row3Y + 4);
      xPos += colWidth;
      pdf.setFont("helvetica", "normal");
      const degreeBranch = `${selectedStudent.course || "N/A"} - ${
        selectedStudent.semester || selectedStudent.year || "N/A"
      }`;
      const courseSplit = pdf.splitTextToSize(degreeBranch, colWidth - 4);
      pdf.text(courseSplit, xPos, row3Y + 4);
      xPos += colWidth;
      pdf.setFont("helvetica", "bold");
      pdf.text("Phone", xPos, row3Y + 4);
      xPos += colWidth;
      pdf.setFont("helvetica", "normal");
      pdf.text(selectedStudent.phone || "N/A", xPos, row3Y + 4);

      // Vertical line between col1 and col2 for row 3
      xPos = margin + colWidth;
      pdf.line(xPos, row3Y, xPos, row3Y + rowHeight);

      yPos = tableStartY + tableHeight + 8;

      // Examination Center Details Section
      if (
        selectedStudent.centerName &&
        selectedStudent.centerName !== "Not Assigned"
      ) {
        yPos += 5;
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.text("Examination Center Details", margin, yPos);
        yPos += 6;

        const centerTableWidth = pageWidth - 2 * margin;
        const centerTableHeight = 20;
        const centerTableStartY = yPos;

        // Draw border
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.rect(
          margin,
          centerTableStartY,
          centerTableWidth,
          centerTableHeight
        );

        // Center details
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        let centerY = centerTableStartY + 5;

        pdf.setFont("helvetica", "bold");
        pdf.text("Center Name:", margin + 2, centerY);
        pdf.setFont("helvetica", "normal");
        pdf.text(selectedStudent.centerName || "N/A", margin + 35, centerY);
        centerY += 5;

        pdf.setFont("helvetica", "bold");
        pdf.text("Center Code:", margin + 2, centerY);
        pdf.setFont("helvetica", "normal");
        pdf.text(selectedStudent.centerCode || "N/A", margin + 35, centerY);
        pdf.setFont("helvetica", "bold");
        pdf.text("Room:", margin + 100, centerY);
        pdf.setFont("helvetica", "normal");
        pdf.text(selectedStudent.roomNumber || "N/A", margin + 115, centerY);
        pdf.setFont("helvetica", "bold");
        pdf.text("Seat:", margin + 150, centerY);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          selectedStudent.seatNumber?.toString() || "N/A",
          margin + 165,
          centerY
        );
        centerY += 5;

        pdf.setFont("helvetica", "bold");
        pdf.text("Address:", margin + 2, centerY);
        pdf.setFont("helvetica", "normal");
        const addressText =
          selectedStudent.centerAddress || "Address not available";
        const addressSplit = pdf.splitTextToSize(
          addressText,
          centerTableWidth - 40
        );
        pdf.text(addressSplit, margin + 35, centerY);
        centerY += addressSplit.length * 4 + 2;

        pdf.setFont("helvetica", "bold");
        // pdf.text("Script Code:", margin + 2, centerY);
        pdf.setFont("helvetica", "normal");
        // pdf.text(selectedStudent.scriptCode || "N/A", margin + 35, centerY);

        yPos = centerTableStartY + centerTableHeight + 5;
      }

      // Declare variables outside if blocks so they're accessible everywhere
      const sigY = pageHeight - 25; // Signature Y position - used for Notes calculation
      const spacingBeforeNotes = 8; // Spacing before Notes section
      let subjectTableStartY = yPos;
      let subjectRowHeight = 12; // Increased height to match reference
      let notesStartY = sigY - spacingBeforeNotes; // Will be calculated properly below

      // Calculate Notes section height first (needed for table height calculation)
      pdf.setFontSize(8);
      const notes = [
        "In case of candidates who have been Readmitted/Transferred, this Hall Ticket is valid only if the candidate's admission is approved by the Commissioner of Technical Education, Government of Andhra Pradesh and the Registrar, AKNU. If any candidate appears for the examination without the approval, the examination written by the candidate will be invalidated.",
        "Correction in the Name / Date of Birth, if any is to be updated in the Web Portal when it is opened for correction. The date and time for the correction will be informed to all the Head of the departments.",
        "Instructions printed overleaf are to be followed strictly.",
      ];
      let notesHeight = 5; // "Note:" header height
      notes.forEach((note) => {
        const noteText = `1. ${note}`;
        const splitText = pdf.splitTextToSize(
          noteText,
          pageWidth - 2 * margin - 5
        );
        notesHeight += splitText.length * 4 + 2;
      });
      notesStartY = sigY - spacingBeforeNotes - notesHeight;

      // Subject Details Table - Using subjects from payment transactions
      // Ensure subjects are strings/names, not objects
      const regularSubs = Array.isArray(selectedStudent.regularSubjects)
        ? selectedStudent.regularSubjects.map((subj) =>
            typeof subj === "string"
              ? subj
              : subj?.name || subj?.SubjectName || String(subj)
          )
        : [];
      const suppSubs = Array.isArray(selectedStudent.supplementarySubjects)
        ? selectedStudent.supplementarySubjects.map((subj) =>
            typeof subj === "string"
              ? subj
              : subj?.name || subj?.SubjectName || String(subj)
          )
        : [];

      const allSubjects = [
        ...regularSubs.map((subj) => ({
          name: subj,
          type: "Regular",
        })),
        ...suppSubs.map((subj) => ({
          name: subj,
          type: "Supplementary",
        })),
      ];

      if (allSubjects.length > 0) {
        const subjectTableWidth = pageWidth - 2 * margin;
        const semColWidth = 20; // Sem. No. (can be left empty or use index)
        const codeColWidth = 35; // Subject Code (can be left empty or use abbreviation)
        const dateColWidth = 35; // Date of Exam
        const titleColWidth =
          subjectTableWidth - semColWidth - codeColWidth - dateColWidth - 6; // Subject Title

        const numSubjects = allSubjects.length;
        subjectTableStartY = yPos;

        // notesStartY already calculated above

        // Calculate table height to extend up to Notes section (includes summary box)
        const subjectTableDataHeight = subjectRowHeight * (numSubjects + 1);
        const summaryBoxHeight = 8;
        const spacingBeforeNotes = 8; // Space before Notes section
        // Table height extends from table start to just before Notes section
        // This includes: table data + summary box + spacing before Notes
        const tableHeight =
          notesStartY - subjectTableStartY - spacingBeforeNotes;

        // Add transparent watermark/background image behind the table
        if (logoData) {
          try {
            // Create a canvas to make the logo semi-transparent
            const createWatermark = () => {
              return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                  const canvas = document.createElement("canvas");
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext("2d");

                  // Set global alpha for transparency (0.15 = 15% opacity, very faint)
                  ctx.globalAlpha = 0.15;
                  ctx.drawImage(img, 0, 0);

                  // Convert to base64
                  const transparentLogo = canvas.toDataURL("image/png");
                  resolve(transparentLogo);
                };
                img.onerror = reject;
                img.src = logoData;
              });
            };

            const transparentLogo = await createWatermark();

            // Calculate center position for watermark
            const watermarkSize = 80; // Large watermark size
            const watermarkX = (pageWidth - watermarkSize) / 2;
            const watermarkY =
              subjectTableStartY + (tableHeight - watermarkSize) / 2;

            // Add transparent logo as watermark in the center of the table area
            pdf.addImage(
              transparentLogo,
              "PNG",
              watermarkX,
              watermarkY,
              watermarkSize,
              watermarkSize
            );
          } catch (error) {
            console.warn("Could not create watermark:", error);
          }
        }

        // Outer table border only (parent border)
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.rect(margin, subjectTableStartY, subjectTableWidth, tableHeight);

        // Header row
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        let xPos = margin + 2;
        pdf.text("Sem. No.", xPos, subjectTableStartY + 8);
        xPos += semColWidth;
        pdf.text("Subject Code", xPos, subjectTableStartY + 8);
        xPos += codeColWidth;
        pdf.text("Subject Title", xPos, subjectTableStartY + 8);
        xPos += titleColWidth;
        pdf.text("Date of Exam", xPos, subjectTableStartY + 8);

        // Header border - horizontal line below header row
        const headerBottomY = subjectTableStartY + subjectRowHeight;
        pdf.line(
          margin,
          headerBottomY,
          margin + subjectTableWidth,
          headerBottomY
        );

        // No other horizontal or vertical lines - borderless table matching reference

        // Data rows - using subjects from payment transactions
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        allSubjects.forEach((subject, idx) => {
          const rowY = subjectTableStartY + subjectRowHeight * (idx + 1);

          xPos = margin + 2;
          // Sem. No. (use index + 1 or leave empty)
          pdf.text(String(idx + 1), xPos, rowY + 8);
          xPos += semColWidth;

          // Subject Code (use abbreviation or leave empty)
          const subjectCode =
            subject.name.substring(0, 10).toUpperCase() || "-";
          pdf.text(subjectCode, xPos, rowY + 8);
          xPos += codeColWidth;

          // Subject Title with type indicator
          const subjectTitle = `${subject.name}${
            subject.type === "Supplementary" ? " (Supp)" : ""
          }`;
          const titleSplit = pdf.splitTextToSize(
            subjectTitle,
            titleColWidth - 4
          );
          pdf.text(titleSplit, xPos, rowY + 8);
          xPos += titleColWidth;

          // Date of Exam (to be announced)
          pdf.text("To be announced", xPos, rowY + 8);

          // No horizontal lines between rows - borderless table
        });

        // Update yPos after table
        yPos = subjectTableStartY + tableHeight + 5; // Space after table
      }

      // Number of Subjects - In bordered box matching reference (below table, just above Notes)
      if (allSubjects.length > 0) {
        const numSubjects = allSubjects.length;
        const regularCount =
          selectedStudent.regularSubjectCount ||
          selectedStudent.regularSubjects?.length ||
          0;
        const suppCount =
          selectedStudent.supplementarySubjectCount ||
          selectedStudent.supplementarySubjects?.length ||
          0;
        const summaryBoxHeight = 10;
        const spacingBeforeNotes = 8; // Space before Notes section
        // Position summary box just above Notes section (outside table border)
        const summaryBoxY = notesStartY - spacingBeforeNotes - summaryBoxHeight;

        // Draw border around summary
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.rect(margin, summaryBoxY, sectionWidth, summaryBoxHeight);

        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          `Number of Subjects Registered: ${numSubjects} (Regular: ${regularCount}, Supplementary: ${suppCount})`,
          margin + 2,
          summaryBoxY + 5
        );

        pdf.setFontSize(7);
        pdf.text(
          "(Page 1/1 Hall Ticket contain per Page Maximum 20 Subjects only)",
          margin + sectionWidth - 2,
          summaryBoxY + 7,
          { align: "right" }
        );

        // Update yPos after summary box
        yPos = notesStartY; // Notes section starts right after summary box
      }

      // Notes Section - Just above Signature Section
      // notes, notesStartY, sigY and spacingBeforeNotes already declared above

      // Draw Notes section (notesStartY already calculated above)
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("Note:", margin, notesStartY);
      let notesY = notesStartY + 5;

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      notes.forEach((note, idx) => {
        const noteText = `${idx + 1}. ${note}`;
        const splitText = pdf.splitTextToSize(
          noteText,
          pageWidth - 2 * margin - 5
        );
        pdf.text(splitText, margin + 5, notesY);
        notesY += splitText.length * 4 + 2;
      });

      // Signature Section - Matching reference (three boxes)
      // sigY already declared above
      if (yPos > pageHeight - 30) {
        pdf.addPage();
        yPos = margin;
      }

      const sigColWidth = (pageWidth - 2 * margin) / 3;
      const sigBoxHeight = 12;

      // Draw signature boxes - attached together (no gaps)
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.rect(margin, sigY, sigColWidth, sigBoxHeight);
      pdf.rect(margin + sigColWidth, sigY, sigColWidth, sigBoxHeight);
      pdf.rect(margin + sigColWidth * 2, sigY, sigColWidth, sigBoxHeight);

      // Text at bottom of each box (so users can sign above)
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      const textY = sigY + sigBoxHeight - 2; // Text at bottom of box
      pdf.text(
        "Signature of the Candidate with Date",
        margin + sigColWidth / 2,
        textY,
        {
          align: "center",
        }
      );
      pdf.text(
        "Signature of the Principal with Seal",
        margin + sigColWidth + sigColWidth / 2,
        textY,
        { align: "center" }
      );
      pdf.text(
        "Controller of the Examinations",
        margin + sigColWidth * 2 + sigColWidth / 2,
        textY,
        { align: "center" }
      );

      // Page number
      pdf.setFontSize(8);
      pdf.text("Page 1/1", pageWidth / 2, pageHeight - 5, { align: "center" });

      // Save PDF
      pdf.save(
        `Hall_Ticket_${selectedStudent.rollNumber}_${selectedStudent.hallTicketId}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.college.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "paid" && student.paymentStatus === "Paid") ||
      (filterStatus === "pending" && student.paymentStatus === "Pending") ||
      (filterStatus === "with-ticket" && student.hallTicketGenerated) ||
      (filterStatus === "without-ticket" &&
        student.paymentStatus === "Paid" &&
        !student.hallTicketGenerated);

    return matchesSearch && matchesFilter;
  });

  // Calculate eligible students for ticket generation
  const eligibleForTicket = students.filter(
    (s) => s.paymentStatus === "Paid" && !s.hallTicketGenerated
  ).length;

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Receiving Applications & Hall Ticket Management
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Verify payment status and generate hall tickets for eligible
            students
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Refresh payment data"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {loading ? "Loading..." : "Refresh"}
          </button>
          {eligibleForTicket > 0 && (
            <button
              onClick={handleBulkGenerate}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Generate All ({eligibleForTicket})
            </button>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-md border overflow-x-auto">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h3 className="text-lg font-semibold">Student Applications</h3>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="flex-1 md:w-64">
                <input
                  type="text"
                  placeholder="Search by name, roll number, or college..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Students</option>
                  <option value="paid">Payment Verified</option>
                  <option value="pending">Pending Payment</option>
                  <option value="with-ticket">With Hall Ticket</option>
                  <option value="without-ticket">Eligible (No Ticket)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        {filteredStudents.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            No students found matching your criteria.
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[450px] thin-scrollbar">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Student Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Course & Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Hall Ticket
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {student.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.rollNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.college}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.course}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.year}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          student.paymentStatus === "Paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {student.paymentStatus}
                      </span>
                      {student.paymentDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          {student.paymentDate}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.hallTicketGenerated ? (
                        <div>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Generated
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {student.hallTicketId}
                          </div>
                        </div>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          Not Generated
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {student.paymentStatus === "Pending" && (
                          <button
                            onClick={() => handleVerifyPayment(student.id)}
                            className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 transition-colors"
                            title="Verify Payment"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                        )}
                        {student.hallTicketGenerated ? (
                          <button
                            onClick={() => handleViewHallTicket(student)}
                            className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                            title="View Hall Ticket"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                        ) : (
                          student.paymentStatus === "Paid" && (
                            <button
                              onClick={() => handleGenerateHallTicket(student)}
                              className="text-emerald-600 hover:text-emerald-900 p-1.5 rounded hover:bg-emerald-50 transition-colors"
                              title="Generate Hall Ticket"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hall Ticket View Modal */}
      {showHallTicketModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="flex flex-col w-full max-w-4xl border border-gray-100 rounded-xl shadow-2xl bg-white max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-5 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <h3 className="text-lg font-semibold text-white">Hall Ticket</h3>
              <button
                onClick={() => {
                  setShowHallTicketModal(false);
                  setSelectedStudent(null);
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Hall Ticket Header */}
                <div className="text-center border-b pb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    AKNU Examination Hall Ticket
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Hall Ticket ID: {selectedStudent.hallTicketId}
                  </p>
                </div>

                {/* Student Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Student Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Name:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedStudent.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Roll Number:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedStudent.rollNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        University/College:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedStudent.college}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Course:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedStudent.course}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Semester:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedStudent.semester || selectedStudent.year}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Email:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedStudent.email || "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Phone:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedStudent.phone || "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Payment Status:
                      </label>
                      <p className="text-sm text-green-600 font-medium">
                        {selectedStudent.paymentStatus}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Transaction ID:
                      </label>
                      <p className="text-sm text-gray-900 font-mono text-xs">
                        {selectedStudent.transactionId || "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Amount Paid:
                      </label>
                      <p className="text-sm text-gray-900 font-semibold">
                        ₹
                        {selectedStudent.amount?.toLocaleString("en-IN") || "0"}
                      </p>
                    </div>
                    {selectedStudent.bankReferenceNumber && (
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                          Bank Reference:
                        </label>
                        <p className="text-sm text-gray-900 font-mono text-xs">
                          {selectedStudent.bankReferenceNumber}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Examination Center Details - From Seating Arrangement */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Examination Center Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Center Name:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedStudent.centerName || "Not Assigned"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Center Code:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedStudent.centerCode || "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 col-span-2">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Address:
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedStudent.centerAddress ||
                          "Address not available"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Room Number:
                      </label>
                      <p className="text-sm text-gray-900 font-semibold">
                        {selectedStudent.roomNumber || "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Seat Number:
                      </label>
                      <p className="text-sm text-gray-900 font-semibold">
                        {selectedStudent.seatNumber || "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 min-w-[140px]">
                        Script Code:
                      </label>
                      <p className="text-sm text-gray-900 font-mono">
                        {selectedStudent.scriptCode || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subject-wise Exam Schedule - From Payment Transactions */}
                {(selectedStudent.regularSubjects?.length > 0 ||
                  selectedStudent.supplementarySubjects?.length > 0) && (
                  <div className="bg-white border p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Subject-wise Exam Schedule
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Subject Type
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Subject Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Time
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {/* Regular Subjects */}
                          {selectedStudent.regularSubjects?.map(
                            (subject, idx) => (
                              <tr key={`regular-${idx}`}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    Regular
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {subject}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  To be announced
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  To be announced
                                </td>
                              </tr>
                            )
                          )}
                          {/* Supplementary Subjects */}
                          {selectedStudent.supplementarySubjects?.map(
                            (subject, idx) => (
                              <tr key={`supplementary-${idx}`}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                                    Supplementary
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {subject}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  To be announced
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  To be announced
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      <p>
                        <strong>Regular Subjects:</strong>{" "}
                        {selectedStudent.regularSubjectCount ||
                          selectedStudent.regularSubjects?.length ||
                          0}
                      </p>
                      <p>
                        <strong>Supplementary Subjects:</strong>{" "}
                        {selectedStudent.supplementarySubjectCount ||
                          selectedStudent.supplementarySubjects?.length ||
                          0}
                      </p>
                    </div>
                  </div>
                )}

                {/* Instructions and Rules */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Instructions and Rules for Students
                  </h3>
                  <ul className="list-disc list-inside space-y-2">
                    {instructions.map((instruction, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        {instruction}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-6 border-t border-gray-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowHallTicketModal(false);
                  setSelectedStudent(null);
                }}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceivingApplications;
