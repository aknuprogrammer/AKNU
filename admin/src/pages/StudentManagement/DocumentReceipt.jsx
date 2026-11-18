/**
 * Document Receipt Component
 * Allows students to mark which documents they have received using checkboxes
 * On submit, generates PDF and optionally sends email
 */
import React, { useState, useRef } from "react";
import { Search, CheckCircle2, FileText, Loader2, Download, Printer, Mail } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { apiRequest } from "../../services/apiService";
import { showSuccessMessage, showErrorMessage } from "../../config/Toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import iumsLogo from "../../assets/iumsLogo/iumsLogo.png";

const DocumentReceipt = () => {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]); // Track received documents
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const printRef = useRef();

  /**
   * Fetch student details and documents by Registration Number
   */
  const fetchStudentDocuments = async () => {
    if (!registrationNumber.trim()) {
      showErrorMessage("Please enter a valid Registration Number or Hall Ticket Number");
      return;
    }

    setLoading(true);
    setStudentInfo(null);
    setDocuments([]);
    setSelectedDocuments([]);
    setSubmitted(false);

    try {
      // Fetch student by registration number (same pattern as NoDueForm)
      const data = await apiRequest(`student/no-due/${registrationNumber.trim()}`);
      
      if (data) {
        setStudentInfo(data);
        
        // Get documents from the response (now included in no-due API)
        let studentDocuments = [];
        
        // Check if documents are in the student data
        if (data.documents && Array.isArray(data.documents) && data.documents.length > 0) {
          studentDocuments = data.documents;
        } else {
          // Try to fetch documents separately if available
          try {
            const docData = await apiRequest(`students/${data._id || data.id}/documents`);
            studentDocuments = docData?.documents || docData?.data || docData || [];
          } catch (docError) {
            console.log("No separate documents endpoint, using default certificates");
            // Generate default certificates if none exist
            const currentDate = new Date();
            studentDocuments = [
              {
                _id: `cert-${data._id || data.id}-1`,
                name: "Admission Certificate",
                documentName: "Admission Certificate",
                type: "certificate",
                description: "Certificate of admission to the university",
                receivedDate: new Date(currentDate.getFullYear(), 0, 15).toISOString(),
              },
              {
                _id: `cert-${data._id || data.id}-2`,
                name: "Identity Card",
                documentName: "Identity Card",
                type: "id_card",
                description: "Student identity card",
                receivedDate: new Date(currentDate.getFullYear(), 0, 20).toISOString(),
              },
              {
                _id: `cert-${data._id || data.id}-3`,
                name: "Library Card",
                documentName: "Library Card",
                type: "library_card",
                description: "Library membership card",
                receivedDate: new Date(currentDate.getFullYear(), 1, 1).toISOString(),
              },
            ];
          }
        }

        setDocuments(studentDocuments);

        // Pre-select documents that are marked as received
        if (studentDocuments.length > 0) {
          const receivedIndices = studentDocuments
            .map((doc, index) => (doc.received === true || doc.received === "yes" ? index : null))
            .filter((idx) => idx !== null);
          setSelectedDocuments(receivedIndices);
        }
      } else {
        showErrorMessage("Student not found with this Registration Number");
        setStudentInfo(null);
        setDocuments([]);
      }
    } catch (error) {
      console.error("Error fetching student:", error);
      const errorMsg = error.message || 
                      "Failed to fetch student details. Please check the Registration Number or Hall Ticket Number.";
      showErrorMessage(errorMsg);
      setStudentInfo(null);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle document selection
   */
  const handleDocumentToggle = (index) => {
    setSelectedDocuments((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  /**
   * Handle select all documents
   */
  const handleSelectAll = () => {
    if (selectedDocuments.length === documents.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(documents.map((_, index) => index));
    }
  };

  /**
   * Submit document receipt - update received status and generate PDF/email
   */
  const handleSubmit = async () => {
    if (selectedDocuments.length === 0) {
      showErrorMessage("Please select at least one document that you have received");
      return;
    }

    setSubmitting(true);

    try {
      const selectedDocs = selectedDocuments.map((index) => documents[index]);
      
      // Prepare documents with received status
      const documentsToUpdate = documents.map((doc, index) => ({
        docId: doc._id || doc.id || doc.docId || `doc-${index}`,
        name: doc.name || doc.documentName || doc.type || "Document",
        received: selectedDocuments.includes(index),
        receivedAt: selectedDocuments.includes(index) ? new Date().toISOString() : null,
      }));

      const payload = {
        registrationNumber: registrationNumber.trim(),
        studentId: studentInfo._id || studentInfo.id,
        documents: documentsToUpdate,
        sendEmail: sendEmail,
      };

      const response = await apiRequest("students/documents/update-received", "POST", payload);

      if (response && (response.success || response.status === 200)) {
        showSuccessMessage("Document receipt updated successfully!");
        setSubmitted(true);
        
        // Generate and download PDF
        setTimeout(() => {
          handleDownloadPDF();
          
          // Clear the form after PDF download
          setTimeout(() => {
            setRegistrationNumber("");
            setStudentInfo(null);
            setDocuments([]);
            setSelectedDocuments([]);
            setSubmitted(false);
            setSendEmail(false);
          }, 2000);
        }, 500);
      } else {
        showErrorMessage("Failed to update document receipt");
      }
    } catch (error) {
      console.error("Error submitting document receipt:", error);
      const errorMsg = error.message || 
                      "Failed to update document receipt. Please try again.";
      showErrorMessage(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle Enter key press in registration number input
   */
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      e.preventDefault();
      fetchStudentDocuments();
    }
  };

  /**
   * Handle Print
   */
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Document_Receipt_Certificate_${studentInfo?.regNo || registrationNumber || 'Student'}`,
  });

  /**
   * Handle Download PDF
   */
  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          const element = clonedDoc.body.querySelector('[data-print-container]');
          if (element) {
            element.style.color = '#000000';
          }
        }
      });
      const imgData = canvas.toDataURL("image/png");

      // A4 size: 210mm x 297mm
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Document_Receipt_Certificate_${studentInfo?.regNo || registrationNumber || 'Student'}.pdf`);
      showSuccessMessage("PDF certificate downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showErrorMessage("Failed to generate PDF. Please use the Print option.");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Document Receipt Acknowledgment
        </h2>

        {/* Registration Number Input Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Student Registration Number / Hall Ticket Number
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Registration Number or Hall Ticket Number"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={loading || submitting}
            />
            <button
              onClick={fetchStudentDocuments}
              disabled={loading || submitting || !registrationNumber.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Student Information */}
        {studentInfo && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Student Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-medium text-gray-800">
                  {studentInfo.name || 
                   `${studentInfo.firstName || ""} ${studentInfo.middleName || ""} ${studentInfo.lastName || ""}`.trim() ||
                   "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Registration Number:</span>
                <span className="ml-2 font-medium text-gray-800">
                  {studentInfo.regNo || registrationNumber}
                </span>
              </div>
              {studentInfo.course && (
                <div>
                  <span className="text-gray-600">Course:</span>
                  <span className="ml-2 font-medium text-gray-800">
                    {studentInfo.course}
                  </span>
                </div>
              )}
              {studentInfo.batch && (
                <div>
                  <span className="text-gray-600">Batch:</span>
                  <span className="ml-2 font-medium text-gray-800">
                    {studentInfo.batch}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents List */}
        {documents.length > 0 && !submitted && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Select Documents You Have Received
              </h3>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectedDocuments.length === documents.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="space-y-3">
              {documents.map((document, index) => {
                const isSelected = selectedDocuments.includes(index);
                return (
                  <div
                    key={index}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    onClick={() => handleDocumentToggle(index)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {isSelected ? (
                          <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-800">
                            {document.name ||
                             document.documentName ||
                             document.type ||
                             `Document ${index + 1}`}
                          </span>
                        </div>
                        {document.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {document.description.split("|")[0].trim()}
                          </p>
                        )}
                        {document.receivedDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Received on:{" "}
                            {new Date(document.receivedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit Button and Email Option */}
        {documents.length > 0 && !submitted && (
          <div className="space-y-4">
            {/* Email Option */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sendEmail"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label htmlFor="sendEmail" className="text-sm text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Send receipt certificate to student's email
              </label>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={submitting || selectedDocuments.length === 0}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors font-medium"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Submit & Generate PDF
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {submitted && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 mb-4">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">
                Document receipt updated successfully! PDF is being downloaded.
                {sendEmail && " Email has been sent to the student."}
              </span>
            </div>
            
            {/* Download PDF Button */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleDownloadPDF}
                className="px-6 py-2 bg-[#525b88] text-white rounded-lg hover:bg-[#3a4166] transition-colors flex items-center gap-2 font-medium"
              >
                <Download className="h-4 w-4" />
                Download Certificate PDF
              </button>
              <button
                onClick={handlePrint}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Printer className="h-4 w-4" />
                Print Certificate
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !studentInfo && registrationNumber && (
          <div className="text-center py-8 text-gray-500">
            <p>No student found with this Registration Number or Hall Ticket Number.</p>
            <p className="text-sm mt-2">Please verify the number and try again.</p>
          </div>
        )}

        {!loading && studentInfo && documents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No documents found for this student.</p>
          </div>
        )}
      </div>

      {/* Hidden Print Component - positioned off-screen for html2canvas */}
      {submitted && selectedDocuments.length > 0 && (
        <div style={{ position: "absolute", top: "-10000px", left: "-10000px" }}>
          <PrintableDocumentReceiptCertificate
            ref={printRef}
            student={studentInfo}
            documents={selectedDocuments.map((index) => documents[index])}
            registrationNumber={registrationNumber}
          />
        </div>
      )}
    </div>
  );
};

// Component to be printed
const PrintableDocumentReceiptCertificate = React.forwardRef(
  ({ student, documents, registrationNumber }, ref) => {
    const styles = {
      container: {
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        color: "#000000",
        padding: "40px",
        fontFamily: "serif",
        boxSizing: "border-box",
      },
      header: {
        textAlign: "center",
        borderBottom: "2px solid #000000",
        paddingBottom: "16px",
        marginBottom: "24px",
      },
      logoContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "16px",
        marginBottom: "8px",
      },
      logo: {
        height: "80px",
        width: "auto",
      },
      universityName: {
        fontSize: "24px",
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        margin: 0,
      },
      address: {
        fontSize: "14px",
        fontWeight: "600",
        margin: 0,
      },
      title: {
        fontSize: "20px",
        fontWeight: "bold",
        marginTop: "24px",
        textDecoration: "underline",
        textAlign: "center",
        margin: "24px 0",
      },
      date: {
        textAlign: "right",
        fontSize: "14px",
        marginTop: "16px",
        fontWeight: "600",
        margin: "16px 0 0 0",
      },
      studentInfo: {
        marginBottom: "24px",
        lineHeight: "2",
        fontSize: "16px",
        marginTop: "24px",
      },
      boldDashed: {
        fontWeight: "bold",
        borderBottom: "1px dashed #000000",
        padding: "0 8px",
        display: "inline-block",
      },
      tableContainer: {
        marginBottom: "32px",
        marginTop: "24px",
      },
      table: {
        width: "100%",
        borderCollapse: "collapse",
        border: "1px solid #000000",
      },
      th: {
        border: "1px solid #000000",
        padding: "12px",
        textAlign: "left",
        backgroundColor: "#f3f4f6",
        color: "#000000",
        fontWeight: "bold",
      },
      td: {
        border: "1px solid #000000",
        padding: "12px",
        color: "#000000",
      },
      signatureSection: {
        marginTop: "48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
      },
      signatureBox: {
        textAlign: "center",
        width: "45%",
      },
      signatureLine: {
        borderTop: "1px solid #000000",
        marginTop: "60px",
        paddingTop: "8px",
        fontSize: "14px",
        fontWeight: "600",
      },
      paragraph: {
        fontSize: "16px",
        lineHeight: "1.8",
        marginBottom: "16px",
        textAlign: "justify",
      },
    };

    const currentDate = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const studentName =
      student?.name ||
      `${student?.firstName || ""} ${student?.middleName || ""} ${student?.lastName || ""}`.trim() ||
      "N/A";
    const regNo = student?.regNo || registrationNumber || "N/A";
    const course = student?.course || "N/A";
    const stream = student?.stream || "";
    const batch = student?.batch || "N/A";

    return (
      <div ref={ref} data-print-container style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <img src={iumsLogo} alt="University Logo" style={styles.logo} />
          </div>
          <h1 style={styles.universityName}>
            Adikavi Nannaya University
          </h1>
          <p style={styles.address}>
            Rajahmundry, East Godavari District, Andhra Pradesh
          </p>
        </div>

        {/* Title */}
        <h2 style={styles.title}>DOCUMENT RECEIPT CERTIFICATE</h2>

        {/* Date */}
        <p style={styles.date}>Date: {currentDate}</p>

        {/* Student Information */}
        <div style={styles.studentInfo}>
          <p>
            This is to certify that{" "}
            <span style={styles.boldDashed}>{studentName}</span>, Registration
            Number{" "}
            <span style={styles.boldDashed}>{regNo}</span>, enrolled in{" "}
            <span style={styles.boldDashed}>
              {course} {stream ? `- ${stream}` : ""}
            </span>
            , Batch{" "}
            <span style={styles.boldDashed}>{batch}</span>, has received the
            following documents from the university:
          </p>
        </div>

        {/* Documents Table */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>S.No</th>
                <th style={styles.th}>Document Name</th>
                <th style={styles.th}>Date Received</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr key={index}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>
                    {doc.name || doc.documentName || `Document ${index + 1}`}
                  </td>
                  <td style={styles.td}>
                    {doc.receivedAt
                      ? new Date(doc.receivedAt).toLocaleDateString("en-GB")
                      : doc.receivedDate
                      ? new Date(doc.receivedDate).toLocaleDateString("en-GB")
                      : currentDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        {/* Additional Paragraph */}
        <div style={styles.paragraph}>
          <p>
            The above-mentioned documents have been duly received and
            acknowledged by the student. This certificate is issued for the
            student's record and reference.
          </p>
        </div>

        {/* Signature Section */}
        <div style={styles.signatureSection}>
          <div style={styles.signatureBox}>
            <div style={styles.signatureLine}>Student Signature</div>
          </div>
          <div style={styles.signatureBox}>
            <div style={styles.signatureLine}>
              Authorized Signatory
              <br />
              Adikavi Nannaya University
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PrintableDocumentReceiptCertificate.displayName = "PrintableDocumentReceiptCertificate";

export default DocumentReceipt;

