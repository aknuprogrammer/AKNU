import { useEffect, useMemo, useState } from "react";
import { showErrorMessage, showSuccessMessage } from "../../../config/Toast";
import { questionPapersApi, questionPaperReviewsApi, professorsApi } from "../../../services/apiService";

const QuestionPaperAdminView = ({ tabKey }) => {
  const [questionPapers, setQuestionPapers] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [selectedPaperReview, setSelectedPaperReview] = useState(null);
  const [paperReviews, setPaperReviews] = useState({}); // Store reviews by paper ID
  const [reviewData, setReviewData] = useState({
    reviewStatus: "Pending",
    reviewComments: "",
    reviewedProfessorId: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchQuestionPapers = async () => {
    try {
      // Fetch all papers (without status filter) to include both Submitted and Approved
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
      
      // Filter to show Submitted and Approved papers (both should be visible with their review info)
      const submittedPapers = questionPapersData.filter(qp => 
        qp.status === "Submitted" || qp.status === "Approved"
      );
      
      setQuestionPapers(submittedPapers);
      
      // Fetch reviews for all papers
      const reviewsMap = {};
      await Promise.all(
        submittedPapers.map(async (paper) => {
          const paperId = paper._id || paper.id;
          try {
            const reviewResponse = await questionPaperReviewsApi.getLatestReview(paperId);
            // Backend now returns 200 with data: null when no review exists
            if (reviewResponse && reviewResponse.success && reviewResponse.data !== null && reviewResponse.data !== undefined) {
              reviewsMap[paperId] = reviewResponse.data;
            }
          } catch (err) {
            // Only log actual errors (not 404s or "no review found" messages)
            if (err.status !== 404 && !err.message?.includes("No review found")) {
              console.error(`Error fetching review for paper ${paperId}:`, err);
            }
          }
        })
      );
      setPaperReviews(reviewsMap);
    } catch (err) {
      console.error("Error fetching question papers:", err);
      setQuestionPapers([]);
    }
  };

  const fetchProfessors = async () => {
    try {
      const response = await professorsApi.getAll();
      const professorsData = Array.isArray(response) 
        ? response 
        : (response?.data || []);
      setProfessors(professorsData.filter(p => p.status === "Active"));
    } catch (err) {
      console.error("Error fetching professors:", err);
      setProfessors([]);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchQuestionPapers(),
        fetchProfessors()
      ]);

      // Load subject-professor mappings from localStorage (if still using it)
      try {
        const storedMappings = localStorage.getItem("exam_subject_professor_mapping");
      setMappings(storedMappings ? JSON.parse(storedMappings) : []);
      } catch (err) {
        console.error("Error loading mappings:", err);
        setMappings([]);
      }

      setError(null);
    } catch (err) {
      setError("Failed to load data");
      showErrorMessage(err.message || "Failed to load question papers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Listen for question paper updates
    const handleQuestionPaperUpdate = () => {
      loadData();
    };
    
    window.addEventListener("questionPaperUpdated", handleQuestionPaperUpdate);
    
    return () => {
      window.removeEventListener("questionPaperUpdated", handleQuestionPaperUpdate);
    };
  }, []);

  const professorLookup = useMemo(() => {
    return professors.reduce((acc, prof) => {
      acc[prof._id] = prof;
      return acc;
    }, {});
  }, [professors]);

  // Group question papers by subject-professor mapping
  const groupedPapers = useMemo(() => {
    const grouped = {};
    const processedPaperIds = new Set();

    // Helper to get subject ID (handle both string and populated object)
    const getSubjectId = (qp) => {
      if (typeof qp.subjectId === 'string') return qp.subjectId;
      if (qp.subjectId?._id) return qp.subjectId._id;
      if (qp.subjectId?.id) return qp.subjectId.id;
      return qp.subjectId;
    };

    // First, group papers that have matching subject-professor mappings
    mappings.forEach((mapping) => {
      if (mapping.status === "Active") {
        const examType = mapping.examinationType || "Regular";
        const key = `${mapping.subjectId}_${mapping.paperType}_${examType}_${mapping.professorId}`;
        
        // Find question papers for this subject, paper type, and examination type
        const papers = questionPapers.filter((qp) => {
          const qpSubjectId = getSubjectId(qp);
          return (
            qpSubjectId === mapping.subjectId &&
            qp.paperType === mapping.paperType &&
            (qp.examinationType || "Regular") === examType &&
            (qp.status === "Submitted" || qp.status === "Approved")
        );
        });

        if (papers.length > 0) {
          papers.forEach((paper) => processedPaperIds.add(paper._id || paper.id));
          grouped[key] = {
            mapping,
            papers,
            professor: professorLookup[mapping.professorId],
          };
        }
      }
    });

    // Then, add papers without mappings (grouped by subject and paper type)
    const ungroupedPapers = questionPapers.filter(
      (qp) => (qp.status === "Submitted" || qp.status === "Approved") && !processedPaperIds.has(qp._id || qp.id)
    );

    ungroupedPapers.forEach((paper) => {
      const subjectId = getSubjectId(paper);
      const subjectName = paper.subjectName || paper.subjectId?.name || "";
      const subjectCode = paper.subjectCode || paper.subjectId?.code || "";
      const key = `unmapped_${subjectId}_${paper.paperType}_${paper.examinationType || "Regular"}`;
      if (!grouped[key]) {
        grouped[key] = {
          mapping: {
            subjectId: subjectId,
            subjectName: subjectName,
            subjectCode: subjectCode,
            paperType: paper.paperType,
            examinationType: paper.examinationType || "Regular",
            status: "Active",
          },
          papers: [],
          professor: null,
        };
      }
      grouped[key].papers.push(paper);
    });

    return grouped;
  }, [mappings, questionPapers, professorLookup]);

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

  const handlePreviewPDF = (entry) => {
    const paperId = entry._id || entry.id;
    if (!paperId) {
      showErrorMessage("Question paper ID not found");
      return;
    }
    
    // Use API endpoint for viewing PDF with cache-busting to ensure updated PDF is shown
    // Open in new window
    const pdfUrl = questionPapersApi.viewPdf(paperId, true);
    window.open(pdfUrl, '_blank');
  };

  const handleOpenReviewModal = async (paper) => {
    setSelectedPaper(paper);
    setReviewData({
      reviewStatus: "Pending",
      reviewComments: "",
    });
    setSelectedPaperReview(null);
    
    // Fetch existing review if any
    try {
      const paperId = paper._id || paper.id;
      const latestReview = await questionPaperReviewsApi.getLatestReview(paperId);
      if (latestReview && latestReview.success && latestReview.data) {
        setSelectedPaperReview(latestReview.data);
        setReviewData({
          reviewStatus: latestReview.data.reviewStatus || "Pending",
          reviewComments: latestReview.data.reviewComments || "",
          reviewedProfessorId: latestReview.data.reviewedProfessorId?._id || latestReview.data.reviewedProfessorId || "",
        });
      }
    } catch (err) {
      // 404 is expected when no review exists - don't log as error
      if (err.status !== 404 && !err.message?.includes("No review found")) {
        console.error("Error fetching review:", err);
      }
      // Continue without existing review
    }
    
    setReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedPaper(null);
    setSelectedPaperReview(null);
    setReviewData({
      reviewStatus: "Pending",
      reviewComments: "",
      reviewedProfessorId: "",
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPaper) return;

    if (!reviewData.reviewComments.trim()) {
      showErrorMessage("Please enter review comments");
      return;
    }

    setSubmittingReview(true);
    try {
      const paperId = selectedPaper._id || selectedPaper.id;
      const payload = {
        questionPaperId: paperId,
        reviewStatus: reviewData.reviewStatus,
        reviewComments: reviewData.reviewComments,
      };
      if (reviewData.reviewedProfessorId) {
        payload.reviewedProfessorId = reviewData.reviewedProfessorId;
      }
      const createResponse = await questionPaperReviewsApi.create(payload);
      
      // Use the created review data if available (with populated professor)
      if (createResponse && createResponse.success && createResponse.data) {
        setPaperReviews(prev => ({
          ...prev,
          [paperId]: createResponse.data
        }));
      }

      showSuccessMessage("Review submitted successfully");
      handleCloseReviewModal();
      
      // Refresh the reviews for the specific paper to ensure we have the latest populated data
      try {
        const reviewResponse = await questionPaperReviewsApi.getLatestReview(paperId);
        if (reviewResponse && reviewResponse.success && reviewResponse.data) {
          setPaperReviews(prev => ({
            ...prev,
            [paperId]: reviewResponse.data
          }));
        }
      } catch (err) {
        console.error("Error refreshing review:", err);
      }
      
      // Also refresh all question papers and reviews
      await fetchQuestionPapers();
    } catch (err) {
      console.error("Error submitting review:", err);
      showErrorMessage(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Flatten papers for table display
  const flattenedPapers = useMemo(() => {
    const allPapers = [];
    Object.values(groupedPapers).forEach((group) => {
      group.papers.forEach((paper) => {
        allPapers.push({
          ...paper,
          mappingSubjectName: group.mapping.subjectName,
          mappingSubjectCode: group.mapping.subjectCode,
          mappingProfessor: group.professor,
        });
      });
    });
    return allPapers;
  }, [groupedPapers]);

  const filteredPapers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return flattenedPapers;

    return flattenedPapers.filter((paper) => {
      const subjectName = (paper.subjectName || paper.subjectId?.name || paper.mappingSubjectName || "").toLowerCase();
      const subjectCode = (paper.subjectCode || paper.subjectId?.code || paper.mappingSubjectCode || "").toLowerCase();
      const paperType = (paper.paperType || "").toLowerCase();
      const examType = (paper.examinationType || "Regular").toLowerCase();
      const professorName = (paper.professorName || paper.mappingProfessor?.name || "").toLowerCase();
      const professorId = (paper.professorEmployeeId || paper.mappingProfessor?.professorId || paper.mappingProfessor?.employeeId || "").toLowerCase();
      const qpNumber = (paper.questionPaperNumber || "").toLowerCase();

      return (
        subjectName.includes(query) ||
        subjectCode.includes(query) ||
        paperType.includes(query) ||
        examType.includes(query) ||
        professorName.includes(query) ||
        professorId.includes(query) ||
        qpNumber.includes(query)
      );
    });
  }, [flattenedPapers, searchQuery]);

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
          <h3 className="text-xl font-semibold text-gray-800">Review Question Papers</h3>
          <p className="text-sm text-gray-500 mt-1">
            Review, approve, and manage submitted question papers organized by subject-professor assignments
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject, paper type, or professor"
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
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
                QP Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Exam Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Total Marks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Professor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Submitted Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Review Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPapers.length ? (
              filteredPapers.map((paper, index) => {
                const calculatedTotalMarks = (paper.questions || []).reduce(
                  (sum, q) => {
                    const marks = typeof q.marks === 'number' ? q.marks : parseInt(q.marks) || 0;
                    return sum + marks;
                  },
                  0
                );
                const totalMarks = paper.totalMarks || calculatedTotalMarks;
                const paperId = paper._id || paper.id;
                const review = paperReviews[paperId];
                const subjectName = paper.subjectName || paper.subjectId?.name || paper.mappingSubjectName || "-";
                const subjectCode = paper.subjectCode || paper.subjectId?.code || paper.mappingSubjectCode || "";
                
                return (
                  <tr key={paperId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="font-medium text-gray-900">
                        {subjectName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {subjectCode ? `${subjectCode} • ` : ""}
                        {paper.paperType || "Paper"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">
                      {paper.questionPaperNumber || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          paper.examinationType === "Regular"
                            ? "bg-blue-100 text-blue-800"
                            : paper.examinationType === "Supplementary"
                            ? "bg-orange-100 text-orange-800"
                            : paper.examinationType === "Revaluation"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {paper.examinationType || "Regular"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {totalMarks} marks
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {paper.professorName || paper.professorEmployeeId || paper.mappingProfessor ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {paper.professorName || paper.mappingProfessor?.name || "-"}
                          </div>
                          {(paper.professorEmployeeId || paper.mappingProfessor?.employeeId || paper.mappingProfessor?.professorId) && (
                            <div className="text-xs text-gray-500">
                              ID: {paper.professorEmployeeId || paper.mappingProfessor?.employeeId || paper.mappingProfessor?.professorId}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {paper.updatedAt
                        ? new Date(paper.updatedAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : paper.submittedAt
                        ? new Date(paper.submittedAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : paper.createdAt
                        ? new Date(paper.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {review ? (
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              review.reviewStatus === "Approved"
                                ? "bg-green-100 text-green-800"
                                : review.reviewStatus === "Rejected"
                                ? "bg-red-100 text-red-800"
                                : review.reviewStatus === "Needs Revision"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {review.reviewStatus}
                          </span>
                          {review.reviewedProfessorId && (
                            <div className="text-xs text-gray-500">
                              {typeof review.reviewedProfessorId === "object"
                                ? review.reviewedProfessorId.name || 
                                  review.reviewedProfessorId.professorId ||
                                  review.reviewedProfessorId.employeeId ||
                                  ""
                                : ""}
                              {typeof review.reviewedProfessorId === "object" && review.reviewedProfessorId.contactNumber && (
                                <div className="text-xs text-gray-400 mt-0.5">
                                  📞 {review.reviewedProfessorId.contactNumber}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {(paper.pdfBase64 || paper.pdfStorage || paperId) ? (
                          <>
                            <button
                              onClick={() => handlePreviewPDF(paper)}
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
                              onClick={() => handleDownloadPDF(paper)}
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
                            <button
                              onClick={() => handleOpenReviewModal(paper)}
                              className="text-green-600 hover:text-green-700 p-1.5 rounded hover:bg-green-50 transition-colors"
                              title="Review"
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
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">PDF not available</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <svg
                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
                  <p className="text-gray-600 text-lg mb-2">No submitted question papers found</p>
                  <p className="text-xs text-gray-400">
                    Question papers will appear here once professors submit them
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm bg-black/30">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Review Question Paper</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Question Paper Number: <span className="font-semibold text-emerald-600">{selectedPaper.questionPaperNumber || "-"}</span>
                </p>
              </div>
              <button
                onClick={handleCloseReviewModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Review Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reviewData.reviewStatus}
                    onChange={(e) =>
                      setReviewData({ ...reviewData, reviewStatus: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Needs Revision">Needs Revision</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reviewed By Professor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reviewData.reviewedProfessorId}
                    onChange={(e) =>
                      setReviewData({ ...reviewData, reviewedProfessorId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="">Select Professor</option>
                    {professors.map((prof) => (
                      <option key={prof._id || prof.id} value={prof._id || prof.id}>
                        {prof.name || prof.professorName || ""} 
                        {prof.professorId ? ` (${prof.professorId})` : ""}
                        {prof.employeeId ? ` - ${prof.employeeId}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Review Comments <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reviewData.reviewComments}
                    onChange={(e) =>
                      setReviewData({ ...reviewData, reviewComments: e.target.value })
                    }
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter your review comments here..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum 1000 characters
                  </p>
                </div>
                {selectedPaperReview && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Previous Review:</p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Status:</span> {selectedPaperReview.reviewStatus}
                    </p>
                    {selectedPaperReview.reviewComments && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Comments:</span> {selectedPaperReview.reviewComments}
                      </p>
                    )}
                    {selectedPaperReview.reviewedProfessorId && (
                      <div className="text-sm text-gray-600 mt-1">
                        <p>
                          <span className="font-medium">Reviewed By:</span>{" "}
                          {typeof selectedPaperReview.reviewedProfessorId === "object"
                            ? selectedPaperReview.reviewedProfessorId.name || 
                              selectedPaperReview.reviewedProfessorId.professorId ||
                              selectedPaperReview.reviewedProfessorId.employeeId ||
                              "-"
                            : "-"}
                        </p>
                        {typeof selectedPaperReview.reviewedProfessorId === "object" && selectedPaperReview.reviewedProfessorId.contactNumber && (
                          <p className="mt-1">
                            <span className="font-medium">Contact:</span> 📞 {selectedPaperReview.reviewedProfessorId.contactNumber}
                          </p>
                        )}
                      </div>
                    )}
                    {selectedPaperReview.reviewedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Reviewed on: {new Date(selectedPaperReview.reviewedAt).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseReviewModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionPaperAdminView;

