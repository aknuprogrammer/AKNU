const PDFDocument = require("pdfkit");
const path = require("path");

/**
 * Generate PDF from question paper data
 * @param {Object} questionPaper - The question paper document
 * @returns {Promise<Buffer>} - PDF buffer
 */
async function generateQuestionPaperPDF(questionPaper) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on("error", reject);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 40;
      let y = 20;
      const primaryColor = "#2B7870";
      const secondaryColor = "#21605A";
      const accentColor = "#F0F5F4";

      // --- HEADER ---
      try {
        const logoPathLeft = path.join(__dirname, "../../assets/aknu-logo_new.png");
        const logoPathRight = path.join(__dirname, "../../assets/aknu-adikavi.png");
        doc.image(logoPathLeft, 40, y, { width: 45, height: 45 });
        doc.image(logoPathRight, pageWidth - 40 - 45, y, { width: 45, height: 45 });
      } catch (e) {
        // Logos are optional, continue without them
        console.warn("Could not load logos:", e.message);
      }

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

      // --- QUESTION PAPER DETAILS ---
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .fillColor("black")
        .text("QUESTION PAPER", 40, y, { width: pageWidth - 80, align: "center" });
      y += 20;

      // Subject and Paper Type
      const subjectText = `${questionPaper.subjectName || "Subject"} - ${questionPaper.paperType || "Paper 1"}`;
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(subjectText, 40, y, { width: pageWidth - 80, align: "center" });
      y += 15;

      // Academic Year
      if (questionPaper.academicYearName) {
        doc
          .font("Helvetica")
          .fontSize(10)
          .text(`Academic Year: ${questionPaper.academicYearName}`, 40, y, {
            width: pageWidth - 80,
            align: "center",
          });
        y += 15;
      }

      // Examination Type and Duration
      const examInfo = [];
      if (questionPaper.examinationType) {
        examInfo.push(`Examination Type: ${questionPaper.examinationType}`);
      }
      if (questionPaper.duration) {
        examInfo.push(`Duration: ${questionPaper.duration}`);
      }
      if (questionPaper.totalMarks) {
        examInfo.push(`Total Marks: ${questionPaper.totalMarks}`);
      }

      if (examInfo.length > 0) {
        doc
          .font("Helvetica")
          .fontSize(10)
          .text(examInfo.join(" | "), 40, y, { width: pageWidth - 80, align: "center" });
        y += 20;
      }

      // Divider line
      doc
        .moveTo(40, y)
        .lineTo(pageWidth - 40, y)
        .strokeColor(primaryColor)
        .lineWidth(0.5)
        .stroke();
      y += 20;

      // --- INSTRUCTIONS ---
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(primaryColor)
        .text("INSTRUCTIONS:", 40, y);
      y += 15;

      const instructions = [
        "Answer all questions.",
        "Write clearly and legibly.",
        "Marks are indicated against each question.",
      ];

      instructions.forEach((instruction) => {
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor("black")
          .text(`• ${instruction}`, 50, y, { width: pageWidth - 100 });
        y += 12;
      });

      y += 10;

      // --- QUESTIONS ---
      if (questionPaper.questions && questionPaper.questions.length > 0) {
        // Group questions by section
        const questionsBySection = {};
        questionPaper.questions.forEach((q, index) => {
          const section = q.section || "No Section";
          if (!questionsBySection[section]) {
            questionsBySection[section] = [];
          }
          questionsBySection[section].push({ ...q, originalIndex: index + 1 });
        });

        // Render each section
        Object.keys(questionsBySection).forEach((sectionName) => {
          const sectionQuestions = questionsBySection[sectionName];

          // Check if we need a new page
          if (y > pageHeight - 150) {
            doc.addPage();
            y = 40;
          }

          // Section Header
          if (sectionName !== "No Section") {
            doc
              .font("Helvetica-Bold")
              .fontSize(11)
              .fillColor(primaryColor)
              .text(sectionName.toUpperCase(), 40, y);
            y += 12;

            // Section instruction if available
            const firstQuestion = sectionQuestions[0];
            if (firstQuestion.sectionInstruction) {
              doc
                .font("Helvetica-Italic")
                .fontSize(9)
                .fillColor("black")
                .text(firstQuestion.sectionInstruction, 50, y, {
                  width: pageWidth - 100,
                });
              y += 15;
            }
          }

          // Render questions in this section
          sectionQuestions.forEach((q, qIndex) => {
            // Check if we need a new page
            if (y > pageHeight - 100) {
              doc.addPage();
              y = 40;
            }

            const questionNumber = q.originalIndex || qIndex + 1;
            const questionWidth = pageWidth - 2 * margin;

            // Debug logging
            console.log("Generating PDF for question:", {
              questionNumber: questionNumber,
              questionText: q.questionText,
              hasQuestionText: !!q.questionText,
              questionType: q.questionType,
              hasSubQuestions: !!(q.subQuestions && q.subQuestions.length > 0),
              hasAlternative: !!(q.showOr === true && q.alternativeQuestion),
            });

            // Check if question has sub-questions or alternative
            const hasAlternative = q.showOr === true && q.alternativeQuestion;
            const hasSubQuestions = q.subQuestions && q.subQuestions.length > 0;

            // Display question text if: has sub-questions OR (no sub-questions AND no alternative)
            if (hasSubQuestions || (!hasSubQuestions && !hasAlternative)) {
              // ✅ THIS IS THE KEY LINE - Display questionText
              if (q.questionText) {
                doc
                  .font("Helvetica-Bold")
                  .fontSize(10)
                  .fillColor("black");
                
                const questionText = `${questionNumber}) ${q.questionText}`;
                const textHeight = doc.heightOfString(questionText, { width: questionWidth });
                doc.text(questionText, margin, y, { width: questionWidth });
                y += textHeight + 5;
              } else {
                // Fallback: just show question number if text is missing
                doc
                  .font("Helvetica-Bold")
                  .fontSize(10)
                  .fillColor("black")
                  .text(`${questionNumber})`, margin, y);
                y += 12;
              }
            } else {
              // Just show question number if question text will be shown as sub-question "a"
              doc
                .font("Helvetica-Bold")
                .fontSize(10)
                .fillColor("black")
                .text(`${questionNumber})`, margin, y);
              y += 12;
            }

            // Marks
            if (q.marks) {
              doc
                .font("Helvetica-Bold")
                .fontSize(9)
                .fillColor(secondaryColor)
                .text(`[${q.marks} Marks]`, margin + 10, y - 15, {
                  align: "right",
                  width: questionWidth - 20,
                });
            }

            // Sub-questions
            if (hasSubQuestions && q.subQuestions && q.subQuestions.length > 0) {
              q.subQuestions.forEach((subQ, subIndex) => {
                if (subQ.showOr && subIndex > 0) {
                  doc
                    .font("Helvetica-Bold")
                    .fontSize(9)
                    .text("OR", margin + 20, y, { width: questionWidth - 40, align: "center" });
                  y += 12;
                }
                
                const subQuestionLabel = String.fromCharCode(97 + subIndex); // a, b, c, d...
                const subQuestionText = `  ${subQuestionLabel}) ${subQ.text || ""}`;
                doc
                  .font("Helvetica")
                  .fontSize(9)
                  .text(subQuestionText, margin + 20, y, { width: questionWidth - 40 });
                y += doc.heightOfString(subQuestionText, { width: questionWidth - 40 }) + 3;
              });
            }

            // Question-specific content
            if (q.questionType === "MCQ" || q.questionType === "True/False") {
              if (q.options && q.options.length > 0) {
                q.options.forEach((option, optIndex) => {
                  const optionLabel = String.fromCharCode(97 + optIndex); // a, b, c, d...
                  doc
                    .font("Helvetica")
                    .fontSize(9)
                    .text(`  ${optionLabel}) ${option}`, margin + 20, y, {
                      width: questionWidth - 40,
                    });
                  y += 12;
                });
              }
            } else if (q.questionType === "Match the Following") {
              if (q.matchingPairs && q.matchingPairs.length > 0) {
                doc
                  .font("Helvetica")
                  .fontSize(9)
                  .text("Match the following:", margin + 20, y, {
                    width: questionWidth - 40,
                  });
                y += 12;

                q.matchingPairs.forEach((pair, pairIndex) => {
                  doc
                    .font("Helvetica")
                    .fontSize(9)
                    .text(
                      `  ${pairIndex + 1}. ${pair.left || ""} - ${pair.right || ""}`,
                      margin + 20,
                      y,
                      { width: questionWidth - 40 }
                    );
                  y += 12;
                });
              }
            } else if (q.questionType === "Fill in the Blanks") {
              // Just show the question text, which should contain blanks
              // No additional rendering needed
            }

            // Alternative question (for OR questions)
            if (hasAlternative && q.alternativeQuestion) {
              doc
                .font("Helvetica-Bold")
                .fontSize(9)
                .text("OR", margin + 20, y, { width: questionWidth - 40, align: "center" });
              y += 12;

              if (q.alternativeQuestion.questionText) {
                doc
                  .font("Helvetica")
                  .fontSize(10)
                  .text(q.alternativeQuestion.questionText, margin + 20, y, {
                    width: questionWidth - 40,
                  });
                y += doc.heightOfString(q.alternativeQuestion.questionText, {
                  width: questionWidth - 40,
                }) + 5;

                if (q.alternativeQuestion.marks) {
                  doc
                    .font("Helvetica-Bold")
                    .fontSize(9)
                    .fillColor(secondaryColor)
                    .text(`[${q.alternativeQuestion.marks} Marks]`, margin + 30, y - 15, {
                      align: "right",
                      width: questionWidth - 60,
                    });
                }
              }

              if (
                q.alternativeQuestion.subQuestions &&
                q.alternativeQuestion.subQuestions.length > 0
              ) {
                q.alternativeQuestion.subQuestions.forEach((subQ, subIndex) => {
                  if (subQ.showOr && subIndex > 0) {
                    doc
                      .font("Helvetica-Bold")
                      .fontSize(9)
                      .text("OR", margin + 20, y, {
                        width: questionWidth - 40,
                        align: "center",
                      });
                    y += 12;
                  }
                  
                  const subQuestionLabel = String.fromCharCode(97 + subIndex); // a, b, c, d...
                  doc
                    .font("Helvetica")
                    .fontSize(9)
                    .text(`  ${subQuestionLabel}) ${subQ.text || ""}`, margin + 20, y, {
                      width: questionWidth - 40,
                    });
                  y += doc.heightOfString(`  ${subQuestionLabel}) ${subQ.text || ""}`, {
                    width: questionWidth - 40,
                  }) + 3;
                });
              }
            }

            y += 10; // Space between questions
          });
        });
      }

      // Footer
      const footerY = pageHeight - 40;
      doc
        .moveTo(40, footerY)
        .lineTo(pageWidth - 40, footerY)
        .strokeColor(primaryColor)
        .lineWidth(0.5)
        .stroke();

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateQuestionPaperPDF };

