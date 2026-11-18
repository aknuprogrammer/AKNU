import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  Download,
  X,
} from "lucide-react";
import { apiRequest } from "../../services/apiService";
import { showSuccessMessage, showErrorMessage } from "../../config/Toast";
import { API } from "../../config/urls";

const AcknowledgedDocuments = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    verified: "",
    comment: "",
  });

  /**
   * Fetch all students with acknowledged documents
   */
  const fetchAcknowledgedStudents = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("students/documents/acknowledged");
      if (data && data.success) {
        setStudents(data.data || []);
      } else {
        showErrorMessage("Failed to fetch acknowledged students");
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching acknowledged students:", error);
      showErrorMessage(
        error.message || "Failed to fetch acknowledged students"
      );
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcknowledgedStudents();
  }, []);

  /**
   * View document
   */
  const handleViewDocument = async (document, studentId) => {
    try {
      let blob;
      let fileName = document.name || "document.pdf";

      // studentId here is the acknowledgment record's studentId (actual student ID if exists)
      if (!studentId) {
        showErrorMessage("Student ID not available. Document may not be accessible.");
        return;
      }

      // Fetch document from API
      const response = await API.get(`/students/${studentId}/document/${document.docId}`, {
        responseType: "blob",
      });
      blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/pdf",
      });

      // Create blob URL for viewing
      const url = URL.createObjectURL(blob);
      setDocumentUrl(url);
      setViewingDocument({ ...document, fileName, studentId });
    } catch (error) {
      console.error("Error viewing document:", error);
      showErrorMessage("Failed to load document. Student may have left the college.");
    }
  };

  /**
   * Download document
   */
  const handleDownloadDocument = async (document, studentId) => {
    try {
      const response = await API.get(`/students/${studentId}/document/${document.docId}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/pdf",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${document.name || "document"}.pdf`;
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
   * Edit document status
   */
  const handleEdit = (student, document) => {
    setEditingStudent({ student, document });
    setEditFormData({
      verified: document.verified || "not_verified",
      comment: document.comment || "",
    });
  };

  /**
   * Save document edit
   */
  const handleSaveEdit = async () => {
    if (!editingStudent) return;

    try {
      const { student, document } = editingStudent;
      
      // Update the acknowledgment record in the separate table
      // First, fetch the current acknowledgment record
      const acknowledgmentId = student._id; // This is the acknowledgment record ID
      
      // We need to update the DocumentAcknowledgment record
      // Since we don't have a direct update endpoint, we'll update via the student if they exist
      // Otherwise, we'll need to create an update endpoint for acknowledgments
      
      if (student.studentId) {
        // Student still exists - update both student and acknowledgment
        const fullStudent = await apiRequest(`students/${student.studentId}`);
        
        if (fullStudent && fullStudent.documents) {
          // Update student's document
          const updatedDocuments = fullStudent.documents.map((doc) => {
            if (
              (doc.docId && doc.docId === document.docId) ||
              (doc.name && doc.name === document.name)
            ) {
              return {
                ...doc,
                verified: editFormData.verified,
                comment: editFormData.comment,
              };
            }
            return doc;
          });

          await apiRequest(`students/${student.studentId}`, "PUT", {
            documents: updatedDocuments,
          });
        }
      }

      // Update the acknowledgment record in the separate table
      await apiRequest(
        `students/documents/acknowledgment/${acknowledgmentId}`,
        "PUT",
        {
          documentId: document.docId,
          verified: editFormData.verified,
          comment: editFormData.comment,
        }
      );

      showSuccessMessage("Document updated successfully");
      setEditingStudent(null);
      setEditFormData({ verified: "", comment: "" });
      fetchAcknowledgedStudents(); // Refresh the list
    } catch (error) {
      console.error("Error updating document:", error);
      showErrorMessage(error.message || "Failed to update document");
    }
  };

  /**
   * Delete acknowledgment (revoke acknowledgment)
   */
  const handleDelete = async (student, document) => {
    if (
      !window.confirm(
        `Are you sure you want to remove the acknowledgment for "${document.name}"? This will revoke the acknowledgment record.`
      )
    ) {
      return;
    }

    try {
      // Update the acknowledgment record status to "revoked"
      // We'll need an endpoint to update acknowledgments
      // For now, we can update the student's document if they exist
      
      if (student.studentId) {
        // Student still exists - update their document
        const fullStudent = await apiRequest(`students/${student.studentId}`);
        
        if (fullStudent && fullStudent.documents) {
          const updatedDocuments = fullStudent.documents.map((doc) => {
            if (
              (doc.docId && doc.docId === document.docId) ||
              (doc.name && doc.name === document.name)
            ) {
              return {
                ...doc,
                submitted: "no",
              };
            }
            return doc;
          });

          await apiRequest(`students/${student.studentId}`, "PUT", {
            documents: updatedDocuments,
          });
        }
      }

      // Update acknowledgment record (revoke it)
      await apiRequest(
        `students/documents/acknowledgment/${student._id}/revoke`,
        "PUT",
        {
          documentId: document.docId,
        }
      );

      showSuccessMessage("Acknowledgment removed successfully");
      fetchAcknowledgedStudents(); // Refresh the list
      if (selectedStudent?._id === student._id) {
        setSelectedStudent(null); // Close modal if open
      }
    } catch (error) {
      console.error("Error deleting acknowledgment:", error);
      showErrorMessage(error.message || "Failed to remove acknowledgment");
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

  /**
   * Filter students based on search query
   */
  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.registrationNumber.toLowerCase().includes(query) ||
      student.hallTicketNo.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.course.toLowerCase().includes(query) ||
      student.stream.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Acknowledged Documents
        </h1>
        <p className="text-gray-600 mt-1">
          View and manage all students who have acknowledged document receipt
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex gap-4 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, registration number, hall ticket, email, course, or stream..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#525b88] focus:border-transparent outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={fetchAcknowledgedStudents}
            disabled={loading}
            className="px-6 py-3 bg-[#525b88] text-white rounded-lg hover:bg-[#3a4166] transition-colors font-medium flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Refresh"
            )}
          </button>
        </div>
      </div>

      {/* Students Table */}
      {loading && students.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-[#525b88]" />
          <p className="text-gray-500">Loading acknowledged students...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-500">
            {searchQuery
              ? "No students found matching your search"
              : "No students have acknowledged documents yet"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#525b88]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Student Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Course/Stream/Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr
                    key={student._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {student.name}
                        </div>
                        <div className="text-gray-500">
                          Reg: {student.registrationNumber}
                        </div>
                        {student.hallTicketNo !== "N/A" && (
                          <div className="text-gray-500">
                            HT: {student.hallTicketNo}
                          </div>
                        )}
                        <div className="text-gray-500 text-xs mt-1">
                          {student.email} | {student.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{student.course}</div>
                      <div className="text-gray-500">{student.stream}</div>
                      <div className="text-gray-500">Batch: {student.batch}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {student.acknowledgedCount} document(s)
                        </div>
                        {student.acknowledgedAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(student.acknowledgedAt).toLocaleDateString()}
                          </div>
                        )}
                        <button
                          onClick={() => setSelectedStudent(
                            selectedStudent?._id === student._id ? null : student
                          )}
                          className="text-[#525b88] hover:text-[#3a4166] text-xs mt-1"
                        >
                          {selectedStudent?._id === student._id
                            ? "Hide Details"
                            : "Show Details"}
                        </button>
                      </div>
                      {selectedStudent?._id === student._id && (
                        <div className="mt-2 space-y-1">
                          {student.acknowledgedDocuments.map((doc, idx) => (
                            <div
                              key={idx}
                              className="text-xs bg-gray-50 p-2 rounded flex items-center justify-between"
                            >
                              <span className="text-gray-700">{doc.name}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${
                                  doc.verified === "verified"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {doc.verified === "verified"
                                  ? "Verified"
                                  : "Not Verified"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">
                            Acknowledged
                          </span>
                        </div>
                        {!student.studentExists && (
                          <span className="text-xs text-orange-600">
                            (Student Left)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedStudent(
                            selectedStudent?._id === student._id ? null : student
                          )}
                          className="text-[#525b88] hover:text-[#3a4166] p-1"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expanded Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedStudent.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedStudent.registrationNumber} | {selectedStudent.course}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Acknowledged Documents ({selectedStudent.acknowledgedCount})
                  </h4>
                  <div className="space-y-3">
                    {selectedStudent.acknowledgedDocuments.map((doc, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-gray-900">
                                {doc.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  doc.verified === "verified"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {doc.verified === "verified"
                                  ? "Verified"
                                  : "Not Verified"}
                              </span>
                              {doc.comment && (
                                <span className="text-gray-500">
                                  {doc.comment}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedStudent.studentExists ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleViewDocument(doc, selectedStudent.studentId)
                                  }
                                  className="text-[#525b88] hover:text-[#3a4166] p-1"
                                  title="View Document"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDownloadDocument(doc, selectedStudent.studentId)
                                  }
                                  className="text-green-600 hover:text-green-700 p-1"
                                  title="Download Document"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400">Document not accessible</span>
                            )}
                            <button
                              onClick={() => handleEdit(selectedStudent, doc)}
                              className="text-blue-600 hover:text-blue-700 p-1"
                              title="Edit Document"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(selectedStudent, doc)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="Remove Acknowledgment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Document Status
              </h3>
              <button
                onClick={() => {
                  setEditingStudent(null);
                  setEditFormData({ verified: "", comment: "" });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Name
                </label>
                <p className="text-gray-900 font-medium">
                  {editingStudent.document.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Status
                </label>
                <select
                  value={editFormData.verified}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, verified: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88] focus:border-transparent outline-none"
                >
                  <option value="not_verified">Not Verified</option>
                  <option value="verified">Verified</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment/Notes
                </label>
                <textarea
                  value={editFormData.comment}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, comment: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#525b88] focus:border-transparent outline-none"
                  placeholder="Add any comments or notes..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setEditingStudent(null);
                    setEditFormData({ verified: "", comment: "" });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-[#525b88] text-white rounded-lg hover:bg-[#3a4166] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDocument && documentUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {viewingDocument.name || "Document Viewer"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {viewingDocument.fileType === "application/pdf"
                    ? "PDF Document"
                    : viewingDocument.fileType || "Document"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleDownloadDocument(
                      viewingDocument,
                      viewingDocument.studentId
                    )
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

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
          </div>
        </div>
      )}
    </div>
  );
};

export default AcknowledgedDocuments;

