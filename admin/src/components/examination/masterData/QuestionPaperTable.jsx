import { useEffect, useMemo, useState } from "react";
import AddFormModal from "./AddFormModal";
import { showErrorMessage, showSuccessMessage } from "../../../config/Toast";
import { questionPapersApi } from "../../../services/apiService";

const QuestionPaperTable = ({ tabKey }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewPaper, setPreviewPaper] = useState(null);

  const fetchQuestionPapers = async () => {
    try {
      setLoading(true);
      const response = await questionPapersApi.getAll();
      
      // Handle API response structure: { success: true, count: 4, data: [...] }
      let questionPapersData = [];
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          questionPapersData = response;
        } else if (response.data && Array.isArray(response.data)) {
          questionPapersData = response.data;
        } else if (response.success && response.data && Array.isArray(response.data)) {
          questionPapersData = response.data;
        }
      }
      
      // Filter out archived papers for display (optional - can show all with includeInactive)
      const activePapers = questionPapersData.filter(qp => 
        qp.status !== 'Archived' || qp.status === undefined
      );
      
      setEntries(activePapers);
      setError(null);
    } catch (err) {
      setError("Failed to load question papers");
      showErrorMessage(err.message || "Failed to load question papers");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionPapers();
    
    // Listen for question paper updates from other components
    const handleQuestionPaperUpdate = () => {
      fetchQuestionPapers();
    };
    
    window.addEventListener("questionPaperUpdated", handleQuestionPaperUpdate);
    
    return () => {
      window.removeEventListener("questionPaperUpdated", handleQuestionPaperUpdate);
    };
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this question paper? This will archive it.")) {
      try {
        await questionPapersApi.delete(id, false); // Soft delete (archive)
        showSuccessMessage("Question paper deleted successfully (archived)");
        await fetchQuestionPapers(); // Refresh from API
        // Dispatch event for admin view refresh
        window.dispatchEvent(new CustomEvent("questionPaperUpdated"));
      } catch (err) {
        showErrorMessage(err.message || "Failed to delete question paper");
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Normalize questions: map 'id' to 'questionId' if needed
      const normalizedQuestions = (formData.questions || []).map((q, index) => {
        const question = { ...q };
        // Map 'id' to 'questionId' if 'questionId' doesn't exist
        if (question.id && !question.questionId) {
          question.questionId = question.id;
        }
        // Ensure questionId exists
        if (!question.questionId) {
          question.questionId = `q_${Date.now()}_${index}_${Math.random()}`;
        }
        // Normalize marks (convert string to number if needed)
        if (typeof question.marks === 'string') {
          question.marks = parseInt(question.marks) || 0;
        }
        // Ensure marks is at least 1 (validation requirement)
        if (!question.marks || question.marks < 1) {
          question.marks = 1;
        }
        if (typeof question.sectionMarks === 'string') {
          question.sectionMarks = parseInt(question.sectionMarks) || 0;
        }
        // Set order if not provided
        if (question.order === undefined) {
          question.order = index + 1;
        }
        // Ensure questionText is preserved (don't lose it during normalization)
        if (!question.questionText && question.text) {
          question.questionText = question.text;
        }
        // Log for debugging
        if (!question.questionText) {
          console.warn(`Question ${index + 1} has no questionText:`, question);
        }
        return question;
      });
      
      // Log normalized questions for debugging
      console.log("Normalized questions being sent to API:", normalizedQuestions);

      // Prepare payload according to API structure
      // Extract IDs from populated objects if they exist
      const getObjectId = (field) => {
        if (!field) return field;
        if (typeof field === 'string') return field;
        if (field._id) return field._id;
        if (field.id) return field.id;
        return field;
      };

      // Extract subject name and code from formData or populated object
      const getSubjectInfo = () => {
        // Priority 1: Use formData if it has subjectName and subjectCode
        if (formData.subjectName && formData.subjectCode) {
          return { name: formData.subjectName, code: formData.subjectCode };
        }
        
        // Priority 2: Extract from populated subjectId object in formData
        const subjectIdObj = formData.subjectId;
        if (subjectIdObj && typeof subjectIdObj === 'object' && !Array.isArray(subjectIdObj)) {
          if (subjectIdObj.name && subjectIdObj.code) {
            return { name: subjectIdObj.name, code: subjectIdObj.code };
          }
        }
        
        // Priority 3: Get from editingItem (when updating)
        if (editingItem) {
          // Check if editingItem has subject info directly
          if (editingItem.subjectName && editingItem.subjectCode) {
            return { name: editingItem.subjectName, code: editingItem.subjectCode };
          }
          // Check if editingItem has populated subjectId
          if (editingItem.subjectId && typeof editingItem.subjectId === 'object' && !Array.isArray(editingItem.subjectId)) {
            if (editingItem.subjectId.name && editingItem.subjectId.code) {
              return { name: editingItem.subjectId.name, code: editingItem.subjectId.code };
            }
          }
        }
        
        // Priority 4: Fallback to formData values (might be empty)
        return { name: formData.subjectName || "", code: formData.subjectCode || "" };
      };
      
      const subjectInfo = getSubjectInfo();
      
      // Validate that we have subject info - if not, this might cause 400 error
      if (!subjectInfo.name || !subjectInfo.code) {
        const subjectId = getObjectId(formData.subjectId);
        console.error("ERROR: Missing subject name or code. SubjectId:", subjectId);
        console.error("formData:", formData);
        console.error("editingItem:", editingItem);
        throw new Error("Subject name and code are required. Please ensure the subject is properly selected.");
      }

      // Build payload, ensuring no undefined values
      const payload = {
        subjectId: getObjectId(formData.subjectId) || null,
        // Include subjectName and subjectCode (required by backend validation)
        subjectName: subjectInfo.name || "",
        subjectCode: subjectInfo.code || "",
        academicYearId: getObjectId(formData.academicYearId) || null,
        courseId: getObjectId(formData.courseId) || null,
        streamId: getObjectId(formData.streamId) || null,
        semesterId: getObjectId(formData.semesterId) || null,
        paperType: formData.paperType || "Paper 1",
        questionPaperNumber: formData.questionPaperNumber || "",
        professorName: formData.professorName || "",
        professorEmployeeId: formData.professorEmployeeId || "",
        examinationType: formData.examinationType || "Regular",
        duration: formData.duration || "3 hours",
        totalMarks: formData.totalMarks ? (typeof formData.totalMarks === 'string' ? parseInt(formData.totalMarks) : formData.totalMarks) : undefined,
        status: formData.status || "Draft",
        questions: normalizedQuestions,
        // CRITICAL: Always include the PDF that was generated in AddFormModal
        // This ensures the updated PDF with latest changes is saved
        pdfBase64: formData.pdfBase64 || "",
        pdfFileName: formData.pdfFileName || "",
        notes: formData.notes || "",
      };
      
      // Remove undefined values to avoid issues with API
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });
      
      // Log to verify PDF is included
      if (payload.pdfBase64) {
        console.log("PDF included in payload, size:", payload.pdfBase64.length, "characters");
      } else {
        console.warn("WARNING: No PDF in payload! PDF may not be saved.");
      }

      if (editingItem) {
        // Update existing question paper
        const paperId = editingItem._id || editingItem.id;
        console.log("Updating question paper:", paperId, "with PDF:", payload.pdfBase64 ? "Yes" : "No");
        console.log("Payload being sent:", JSON.stringify(payload, null, 2));
        try {
          await questionPapersApi.update(paperId, payload);
          showSuccessMessage("Question paper updated successfully");
        } catch (err) {
          console.error("Update error details:", err);
          console.error("Error response:", err.response || err.message);
          throw err; // Re-throw to be caught by outer try-catch
        }
      } else {
        // Create new question paper
        console.log("Creating new question paper with PDF:", payload.pdfBase64 ? "Yes" : "No");
        await questionPapersApi.create(payload);
        showSuccessMessage("Question paper created successfully");
      }
      
      await fetchQuestionPapers(); // Refresh from API
      setShowAddForm(false);
      setEditingItem(null);
      // Clear preview if it was showing the updated paper
      if (previewPaper && (previewPaper._id === editingItem?._id || previewPaper.id === editingItem?.id)) {
        setPreviewPaper(null);
      }
      // Dispatch event for admin view refresh
      window.dispatchEvent(new CustomEvent("questionPaperUpdated"));
    } catch (err) {
      showErrorMessage(err.message || "Failed to save question paper");
    }
  };

  const calculateTotalMarks = (questions) => {
    if (!Array.isArray(questions)) return 0;
    return questions.reduce((sum, q) => {
      const marks = typeof q.marks === 'number' ? q.marks : parseInt(q.marks) || 0;
      return sum + marks;
    }, 0);
  };

  const handlePreviewPDF = async (entry) => {
    const paperId = entry._id || entry.id;
    if (!paperId) {
      showErrorMessage("Question paper ID not found");
      return;
    }
    
    try {
      // Fetch PDF as blob to avoid X-Frame-Options issue
      const blob = await questionPapersApi.downloadPdf(paperId);
      
      // Convert blob to data URL for iframe display
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        // Extract base64 string (remove data:application/pdf;base64, prefix)
        const base64String = base64data.split(',')[1];
        setPreviewPaper({ ...entry, pdfBase64: base64String, pdfUrl: null });
      };
      reader.onerror = () => {
        showErrorMessage("Failed to load PDF for preview");
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Error loading PDF for preview:", err);
      if (err.message && err.message.includes('404')) {
        showErrorMessage("PDF not found. Please upload the PDF first.");
      } else {
        showErrorMessage(err.message || "Failed to load PDF for preview");
      }
    }
  };

  const handleDownloadPDF = async (entry) => {
    const paperId = entry._id || entry.id;
    if (!paperId) {
      showErrorMessage("Question paper ID not found");
      return;
    }

    try {
      // Use API endpoint for download
      const blob = await questionPapersApi.downloadPdf(paperId);
      
      // Create download link with simple filename
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      // Simple filename without question paper number or professor info
      link.setAttribute('download', `question_paper_${paperId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSuccessMessage("Question paper PDF downloaded successfully");
    } catch (err) {
      console.error("Error downloading PDF:", err);
      if (err.message && err.message.includes('404')) {
        showErrorMessage("PDF not found. Please upload the PDF first.");
      } else {
        showErrorMessage(err.message || "Download failed");
      }
    }
  };


  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return entries;
    return entries.filter((entry) => {
      const subjectName = entry.subjectName ? entry.subjectName.toLowerCase() : "";
      const subjectCode = entry.subjectCode ? entry.subjectCode.toLowerCase() : "";
      const paperType = entry.paperType ? entry.paperType.toLowerCase() : "";
      const examinationType = entry.examinationType ? entry.examinationType.toLowerCase() : "";
      const questionPaperNumber = entry.questionPaperNumber ? entry.questionPaperNumber.toLowerCase() : "";
      const professorName = entry.professorName ? entry.professorName.toLowerCase() : "";
      const professorEmployeeId = entry.professorEmployeeId ? entry.professorEmployeeId.toLowerCase() : "";
      return (
        subjectName.includes(query) ||
        subjectCode.includes(query) ||
        paperType.includes(query) ||
        examinationType.includes(query) ||
        questionPaperNumber.includes(query) ||
        professorName.includes(query) ||
        professorEmployeeId.includes(query)
      );
    });
  }, [entries, searchQuery]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Question Papers</h3>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage question papers for examinations
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject or paper type"
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <button
            onClick={() => {
              setEditingItem(null);
              setShowAddForm(true);
            }}
            className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
            </svg>
            Add Question Paper
          </button>
        </div>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                SN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Subject / Paper
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Exam Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Questions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Total Marks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Professor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Submitted Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEntries.length ? (
              filteredEntries.map((entry, index) => (
                <tr key={entry._id || entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="font-medium text-gray-900">
                      {entry.subjectName || (entry.subjectId?.name) || entry.subjectCode || (entry.subjectId?.code) || "-"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(() => {
                        const code = entry.subjectCode || entry.subjectId?.code;
                        return code ? `${code} • ` : "";
                      })()}
                      {entry.paperType || "Paper"}
                    </div>
                    {entry.questionPaperNumber && (
                      <div className="text-xs font-semibold text-emerald-600 mt-1">
                        QP No: <span className="font-bold">{entry.questionPaperNumber}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        entry.examinationType === "Regular"
                          ? "bg-blue-100 text-blue-800"
                          : entry.examinationType === "Supplementary"
                          ? "bg-orange-100 text-orange-800"
                          : entry.examinationType === "Revaluation"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {entry.examinationType || "Regular"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Array.isArray(entry.questions) ? entry.questions.length : 0} question(s)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.totalMarks || calculateTotalMarks(entry.questions)} marks
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.professorName || entry.professorEmployeeId ? (
                      <div>
                        <div className="font-medium text-gray-900">
                          {entry.professorName || "-"}
                        </div>
                        {entry.professorEmployeeId && (
                          <div className="text-xs text-gray-500">
                            ID: {entry.professorEmployeeId}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        entry.status === "Submitted"
                          ? "bg-green-100 text-green-800"
                          : entry.status === "Approved"
                          ? "bg-blue-100 text-blue-800"
                          : entry.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : entry.status === "Draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : entry.status === "Archived"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {entry.status || "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.updatedAt
                      ? new Date(entry.updatedAt).toLocaleDateString()
                      : entry.createdAt
                      ? new Date(entry.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {/* Preview and Download PDF Buttons */}
                      {(entry.pdfBase64 || entry.pdfStorage || entry._id || entry.id) && (entry.status === "Submitted" || entry.status === "Approved") && (
                        <>
                          <button
                            onClick={() => handlePreviewPDF(entry)}
                            className="text-emerald-600 hover:text-emerald-900 p-1.5 rounded hover:bg-emerald-50 transition-colors"
                            title="Preview PDF"
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
                          <button
                            onClick={() => handleDownloadPDF(entry)}
                            className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                            title="Download PDF"
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
                        </>
                      )}
                      {entry.status === "Draft" && (
                        <button
                          onClick={async () => {
                            if (window.confirm("Submit this question paper for approval?")) {
                              try {
                                await questionPapersApi.submit(entry._id || entry.id);
                                showSuccessMessage("Question paper submitted successfully");
                                await fetchQuestionPapers();
                                window.dispatchEvent(new CustomEvent("questionPaperUpdated"));
                              } catch (err) {
                                showErrorMessage(err.message || "Failed to submit question paper");
                              }
                            }
                          }}
                          className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 transition-colors"
                          title="Submit"
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
                      <button
                        onClick={() => {
                          setEditingItem(entry);
                          setShowAddForm(true);
                        }}
                        className="text-emerald-600 hover:text-emerald-900 p-1.5 rounded hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit"
                        disabled={entry.status === "Approved" || entry.status === "Archived"}
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                        onClick={() => handleDelete(entry._id || entry.id)}
                        className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete"
                        disabled={entry.status === "Approved"}
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 text-gray-300 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-600">No question papers found</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Add Question Paper" to create one</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <AddFormModal
          tabKey={"questionPaper"}
          initialData={editingItem}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowAddForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Preview Modal */}
      {previewPaper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="sticky top-0 bg-emerald-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h2 className="text-xl font-semibold">Question Paper Preview</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownloadPDF(previewPaper)}
                  className="px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </button>
                <button
                  onClick={() => setPreviewPaper(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {previewPaper.pdfUrl ? (
                <iframe
                  key={previewPaper.pdfUrl} // Force re-render when URL changes
                  src={previewPaper.pdfUrl}
                  className="w-full h-full min-h-[600px] border border-gray-300 rounded"
                  title="Question Paper Preview"
                />
              ) : previewPaper.pdfBase64 ? (
                <iframe
                  key={previewPaper._id || previewPaper.id} // Force re-render when paper changes
                  src={`data:application/pdf;base64,${previewPaper.pdfBase64}`}
                  className="w-full h-full min-h-[600px] border border-gray-300 rounded"
                  title="Question Paper Preview"
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">PDF not available for preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionPaperTable;
