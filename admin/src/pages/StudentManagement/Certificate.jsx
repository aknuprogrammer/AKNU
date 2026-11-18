import { useState, useEffect } from "react";
import { Search, FileText, Download, Eye, Loader2, CheckCircle2, XCircle, X } from "lucide-react";
import { apiRequest } from "../../services/apiService";
import { showSuccessMessage, showErrorMessage } from "../../config/Toast";
import { API } from "../../config/urls";

const Certificate = () => {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [loadingDocument, setLoadingDocument] = useState(false);

  /**
   * Fetch student and their documents by registration number
   */
  const fetchStudentCertificates = async () => {
    if (!registrationNumber.trim()) {
      showErrorMessage("Please enter a valid Registration Number or Hall Ticket Number");
      return;
    }

    setLoading(true);
    setStudentInfo(null);
    setDocuments([]);
    setViewingDocument(null);

    try {
      // Fetch student by registration number
      const data = await apiRequest(`student/no-due/${registrationNumber.trim()}`);
      
      if (data) {
        setStudentInfo(data);
        
        // Get documents from the response
        let studentDocuments = [];
        
        if (data.documents && Array.isArray(data.documents) && data.documents.length > 0) {
          studentDocuments = data.documents;
        } else {
          // Try to fetch documents separately
          try {
            const docData = await apiRequest(`students/${data._id || data.id}/documents`);
            studentDocuments = docData?.documents || docData?.data || docData || [];
          } catch (docError) {
            console.log("No separate documents endpoint");
            studentDocuments = [];
          }
        }

        setDocuments(studentDocuments);
      } else {
        showErrorMessage("Student not found with this Registration Number");
        setStudentInfo(null);
        setDocuments([]);
      }
    } catch (error) {
      console.error("Error fetching student:", error);
      const errorMsg = error.message || 
                      "Failed to fetch student details. Please check the Registration Number.";
      showErrorMessage(errorMsg);
      setStudentInfo(null);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * View document in modal
   */
  const handleViewDocument = async (document, studentId) => {
    try {
      setLoadingDocument(true);
      const studentIdToUse = studentId || studentInfo?._id || studentInfo?.id;
      
      if (!studentIdToUse && !document.file) {
        showErrorMessage("Student ID or document file not available");
        setLoadingDocument(false);
        return;
      }

      let blob;
      let fileName = document.name || document.documentName || "document.pdf";

      if (document.file) {
        // If file is already in the document object (as Buffer/Uint8Array)
        let fileData = document.file;
        
        // Handle different buffer formats
        if (fileData.data) {
          fileData = fileData.data; // MongoDB buffer format
        }
        if (Array.isArray(fileData)) {
          fileData = new Uint8Array(fileData);
        }
        
        blob = new Blob([fileData], { type: document.fileType || "application/pdf" });
      } else if (document.docId && studentIdToUse) {
        // Fetch document from API
        const response = await API.get(`/students/${studentIdToUse}/document/${document.docId}`, {
          responseType: "blob"
        });
        blob = new Blob([response.data], { type: response.headers["content-type"] || "application/pdf" });
      } else {
        showErrorMessage("Document file not available");
        setLoadingDocument(false);
        return;
      }

      // Create blob URL for viewing
      const url = URL.createObjectURL(blob);
      setDocumentUrl(url);
      setViewingDocument({ ...document, fileName });
      setLoadingDocument(false);
    } catch (error) {
      console.error("Error viewing document:", error);
      showErrorMessage("Failed to load document");
      setLoadingDocument(false);
    }
  };

  /**
   * Download document
   */
  const handleDownloadDocument = async (document, studentId) => {
    try {
      const studentIdToUse = studentId || studentInfo?._id || studentInfo?.id;
      
      if (!studentIdToUse && !document.file) {
        showErrorMessage("Student ID or document file not available");
        return;
      }

      let blob;
      let fileName = document.name || document.documentName || "document.pdf";

      if (document.file) {
        let fileData = document.file;
        if (fileData.data) {
          fileData = fileData.data;
        }
        if (Array.isArray(fileData)) {
          fileData = new Uint8Array(fileData);
        }
        blob = new Blob([fileData], { type: document.fileType || "application/pdf" });
      } else if (document.docId && studentIdToUse) {
        const response = await API.get(`/students/${studentIdToUse}/document/${document.docId}`, {
          responseType: "blob"
        });
        blob = new Blob([response.data], { type: response.headers["content-type"] || "application/pdf" });
      } else {
        showErrorMessage("Document file not available");
        return;
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showSuccessMessage("Document downloaded successfully");
    } catch (error) {
      console.error("Error downloading document:", error);
      showErrorMessage("Failed to download document");
    }
  };

  /**
   * Close document viewer modal
   */
  const handleCloseModal = () => {
    if (documentUrl) {
      URL.revokeObjectURL(documentUrl);
    }
    setViewingDocument(null);
    setDocumentUrl(null);
  };

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [documentUrl]);

  /**
   * Handle Enter key press
   */
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      e.preventDefault();
      fetchStudentCertificates();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Certificates</h1>
        <p className="text-gray-600 mt-1">View and manage student certificates and documents</p>
      </div>

      {/* Search Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={(e) => { e.preventDefault(); fetchStudentCertificates(); }} className="flex gap-4 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Enter Student Registration Number / Hall Ticket No"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#525b88] focus:border-transparent outline-none transition-all"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#525b88] text-white rounded-lg hover:bg-[#3a4166] transition-colors font-medium flex items-center gap-2 disabled:opacity-70"
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
        </form>
      </div>

      {/* Student Information */}
      {studentInfo && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-[#525b88] mb-4">Student Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Student Name</p>
              <p className="text-base font-semibold text-gray-900">{studentInfo.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Registration Number</p>
              <p className="text-base font-semibold text-gray-900">{studentInfo.regNo || registrationNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Course</p>
              <p className="text-base font-semibold text-gray-900">{studentInfo.course || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Batch</p>
              <p className="text-base font-semibold text-gray-900">{studentInfo.batch || "N/A"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Certificates/Documents Table */}
      {documents.length > 0 && (
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-[#525b88]">Certificates & Documents</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#525b88]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Document Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {documents.map((document, index) => (
                  <tr key={document.docId || document._id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        {document.name || document.documentName || `Document ${index + 1}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {document.fileType === "application/pdf" ? "PDF" : 
                       document.fileType || document.type || "Certificate"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          document.submitted === "true"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {document.submitted === "true" ? "Submitted" : "Not Submitted"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {document.verified === "verified" ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-500">
                          <XCircle className="h-4 w-4" />
                          Not Verified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {document.comment || document.description || "-"}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewDocument(document, studentInfo._id || studentInfo.id)}
                        disabled={loadingDocument}
                        className="text-[#525b88] hover:text-[#3a4166] flex items-center gap-1 disabled:opacity-50"
                        title="View Document"
                      >
                        {loadingDocument && viewingDocument?.docId === document.docId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(document, studentInfo._id || studentInfo.id)}
                        className="text-green-600 hover:text-green-700 flex items-center gap-1"
                        title="Download Document"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !studentInfo && registrationNumber && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-500">No student found with this Registration Number.</p>
          <p className="text-sm text-gray-400 mt-2">Please verify the number and try again.</p>
        </div>
      )}

      {!loading && studentInfo && documents.length === 0 && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-500">No certificates or documents found for this student.</p>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDocument && documentUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {viewingDocument.name || viewingDocument.documentName || "Document Viewer"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {viewingDocument.fileType === "application/pdf" ? "PDF Document" : viewingDocument.fileType || "Document"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadDocument(viewingDocument, studentInfo?._id || studentInfo?.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
                  title="Download Document"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden bg-gray-100">
              {documentUrl ? (
                <iframe
                  src={documentUrl}
                  className="w-full h-full min-h-[70vh] border-none"
                  title={viewingDocument.name || "Document Preview"}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  <span className={viewingDocument.verified === "verified" ? "text-green-600" : "text-yellow-600"}>
                    {viewingDocument.verified === "verified" ? "Verified" : "Not Verified"}
                  </span>
                </div>
                {viewingDocument.comment && (
                  <div>
                    <span className="font-medium">Note:</span> {viewingDocument.comment}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificate;

