import React, { useState, useEffect } from "react";
import { API } from "../../../config/urls";
import {
    showSuccessMessage,
    showErrorMessage,
    showAxiosError,
} from "../../../config/Toast";
import { seatingArrangementsApi, questionPapersApi } from "../../../services/apiService";

const ScriptEvaluation = () => {
    // State management
    const [evaluators, setEvaluators] = useState([]);
    const [selectedEvaluator, setSelectedEvaluator] = useState("");
    const [allocations, setAllocations] = useState([]);
    const [selectedAllocation, setSelectedAllocation] = useState(null);
    const [scripts, setScripts] = useState([]);
    const [selectedScript, setSelectedScript] = useState(null);
    const [questionPaper, setQuestionPaper] = useState(null);
    const [marks, setMarks] = useState({});  // {questionId: marks}
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Fetch evaluators on mount
    useEffect(() => {
        fetchEvaluators();
    }, []);

    // Fetch allocations when evaluator is selected
    useEffect(() => {
        if (selectedEvaluator) {
            fetchAllocations();
        } else {
            setAllocations([]);
            setSelectedAllocation(null);
        }
    }, [selectedEvaluator]);

    // Fetch scripts when allocation is selected
    useEffect(() => {
        if (selectedAllocation) {
            fetchScripts();
        } else {
            setScripts([]);
            setSelectedScript(null);
            setQuestionPaper(null);
        }
    }, [selectedAllocation]);

    const fetchEvaluators = async () => {
        try {
            setInitialLoading(true);
            const response = await API.get("/examination/evaluators", {
                params: { status: "Active" },
            });
            const evaluatorsData = response.data?.data || [];
            setEvaluators(evaluatorsData);
        } catch (error) {
            console.error("Error fetching evaluators:", error);
            showAxiosError(error);
        } finally {
            setInitialLoading(false);
        }
    };

    const fetchAllocations = async () => {
        try {
            setLoading(true);
            const response = await API.get("/examination/evaluator-allocations", {
                params: {
                    evaluatorId: selectedEvaluator,
                    status: "Active",
                },
            });
            const allocationsData = response.data?.data || [];
            setAllocations(allocationsData);
        } catch (error) {
            console.error("Error fetching allocations:", error);
            showAxiosError(error);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to fetch student details from seating arrangements
    const fetchStudentDetailsFromSeating = async (scriptCode) => {
        if (!scriptCode) return null;
        
        try {
            const response = await seatingArrangementsApi.getAll({
                search: scriptCode.toUpperCase(),
                status: "Active",
            });
            
            if (response.success && response.data && response.data.length > 0) {
                // Find exact match by scriptCode
                const arrangement = response.data.find(
                    (arr) => arr.scriptCode?.toUpperCase() === scriptCode.toUpperCase()
                );
                
                if (arrangement) {
                    return {
                        hallTicketNumber: arrangement.registrationNumber || arrangement.rollNumber || null,
                        studentName: arrangement.studentName || null,
                        rollNumber: arrangement.rollNumber || arrangement.registrationNumber || null,
                    };
                }
            }
        } catch (error) {
            console.error("Error fetching seating arrangement:", error);
        }
        return null;
    };

    const fetchScripts = async () => {
        try {
            setLoading(true);
            const response = await API.get(
                `/examination/scripts/bundle/${selectedAllocation.bundleId._id}`
            );
            const scriptsData = response.data?.data || [];
            
            // Fetch student details for each script from seating arrangements
            const scriptsWithDetails = await Promise.all(
                scriptsData.map(async (script) => {
                    // Fetch student details if not already present
                    if ((!script.studentName || !script.hallTicketNumber) && script.originalScriptNumber) {
                        const studentDetails = await fetchStudentDetailsFromSeating(script.originalScriptNumber);
                        if (studentDetails) {
                            return {
                                ...script,
                                studentName: script.studentName || studentDetails.studentName || "Not Registered",
                                hallTicketNumber: script.hallTicketNumber || studentDetails.hallTicketNumber || "Not Registered",
                                rollNumber: script.rollNumber || studentDetails.rollNumber || "N/A",
                            };
                        }
                    }
                    return {
                        ...script,
                        studentName: script.studentName || "Not Registered",
                        hallTicketNumber: script.hallTicketNumber || "Not Registered",
                        rollNumber: script.rollNumber || "N/A",
                    };
                })
            );
            
            setScripts(scriptsWithDetails);
        } catch (error) {
            console.error("Error fetching scripts:", error);
            showAxiosError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleScriptSelect = async (scriptId) => {
        const script = scripts.find((s) => s._id === scriptId);
        if (!script) return;

        // Fetch student details from seating arrangements if not already present
        let updatedScript = { ...script };
        if ((!script.studentName || !script.hallTicketNumber) && script.originalScriptNumber) {
            const studentDetails = await fetchStudentDetailsFromSeating(script.originalScriptNumber);
            if (studentDetails) {
                updatedScript = {
                    ...script,
                    studentName: script.studentName || studentDetails.studentName || "Not Registered",
                    hallTicketNumber: script.hallTicketNumber || studentDetails.hallTicketNumber || "Not Registered",
                    rollNumber: script.rollNumber || studentDetails.rollNumber || "N/A",
                };
            }
        }

        setSelectedScript(updatedScript);

        // Fetch question paper for this subject using subjectId
        try {
            setLoading(true);
            // Use subjectId from allocation (MongoDB ObjectId)
            const subjectId = selectedAllocation.subjectId?._id || selectedAllocation.subjectId;
            
            if (!subjectId) {
                showErrorMessage("Subject ID not found in allocation");
                return;
            }
            
            // Use the correct API endpoint - getBySubject accepts subjectId (MongoDB ObjectId)
            // Get all papers for the subject (no status filter) so we can filter client-side
            const response = await questionPapersApi.getBySubject(subjectId);
            
            // Handle different response structures and extract papers array
            let papers = [];
            if (Array.isArray(response)) {
                papers = response;
            } else if (response?.data) {
                papers = Array.isArray(response.data) ? response.data : [response.data];
            } else if (response?.success && response?.data) {
                papers = Array.isArray(response.data) ? response.data : [response.data];
            }
            
            // Filter for approved/submitted papers only, prefer Approved over Submitted
            const approvedPapers = papers.filter(qp => qp.status === "Approved");
            const submittedPapers = papers.filter(qp => qp.status === "Submitted");
            const qpData = approvedPapers[0] || submittedPapers[0] || papers[0];
            
            if (!qpData) {
                showErrorMessage("No approved question paper found for this subject");
                return;
            }
            
            setQuestionPaper(qpData);

            // Debug: Log question paper structure (only in development)
            if (process.env.NODE_ENV === 'development') {
                console.log("📄 Question Paper Data:", {
                    subjectName: qpData.subjectName,
                    totalMarks: qpData.totalMarks,
                    questionsCount: qpData?.questions?.length || 0
                });
            }
            
            if (qpData?.questions && qpData.questions.length > 0) {
                // Only log detailed marks in development mode
                if (process.env.NODE_ENV === 'development') {
                    console.log("📋 All Questions Marks:", qpData.questions.map((q, idx) => ({ 
                        index: idx + 1,
                        questionId: q.questionId || q.id, 
                        questionText: q.questionText?.substring(0, 30) + "...",
                        marks: q.marks,
                        section: q.section,
                        sectionMarks: q.sectionMarks
                    })));
                }
                
                // Check if all marks are 1, but only warn if sectionMarks are not available
                const allMarksAreOne = qpData.questions.every(q => {
                    const m = q.marks;
                    if (typeof m === 'number') return m === 1;
                    if (typeof m === 'string') return parseFloat(m) === 1;
                    return false;
                });
                
                // Check if any questions have sectionMarks (which would override individual marks)
                const hasSectionMarks = qpData.questions.some(q => {
                    const sm = q.sectionMarks;
                    return sm !== undefined && sm !== null && sm !== "" && (typeof sm === 'number' ? sm > 0 : parseFloat(sm) > 0);
                });
                
                // Only warn if all marks are 1 AND there are no sectionMarks to use instead
                if (allMarksAreOne && !hasSectionMarks) {
                    console.warn("⚠️ All questions have marks = 1. If this is incorrect, please update the question paper with proper marks.");
                } else if (allMarksAreOne && hasSectionMarks) {
                    // This is fine - sectionMarks will be used instead
                    console.log("ℹ️ Questions have marks = 1, but sectionMarks are available and will be used for evaluation.");
                }
            }

            // Initialize marks from existing evaluation if any
            const existingMarks = updatedScript.marks?.firstEvaluation?.marks || {};
            const marksObj = {};
            if (existingMarks && typeof existingMarks === "object") {
                // Convert Map to object if needed
                for (const [key, value] of Object.entries(existingMarks)) {
                    marksObj[key] = value;
                }
            }
            setMarks(marksObj);
            setRemarks(updatedScript.marks?.firstEvaluation?.remarks || "");
        } catch (error) {
            console.error("Error fetching question paper:", error);
            showAxiosError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarksChange = (questionId, value, maxMarks) => {
        // Ensure maxMarks is a number
        const maxMarksNum = typeof maxMarks === 'string' ? parseFloat(maxMarks) : (typeof maxMarks === 'number' ? maxMarks : 0);
        
        if (value === "" || value === null || value === undefined) {
            setMarks({ ...marks, [questionId]: "" });
            return;
        }

        const numValue = parseFloat(value);

        if (isNaN(numValue)) {
            showErrorMessage("Please enter a valid number");
            return;
        }

        if (numValue < 0) {
            showErrorMessage("Marks cannot be negative");
            return;
        }

        if (maxMarksNum > 0 && numValue > maxMarksNum) {
            showErrorMessage(`Marks cannot exceed ${maxMarksNum} (max marks for this question)`);
            return;
        }

        setMarks({ ...marks, [questionId]: numValue });
    };

    const calculateTotal = () => {
        return Object.values(marks).reduce((sum, mark) => {
            const num = parseFloat(mark);
            return sum + (isNaN(num) ? 0 : num);
        }, 0);
    };

    const handleSaveEvaluation = async () => {
        if (!selectedScript) return;

        // Validate at least one question has marks
        const hasMarks = Object.values(marks).some((m) => m !== "" && m !== null && !isNaN(parseFloat(m)));
        if (!hasMarks) {
            showErrorMessage("Please enter marks for at least one question");
            return;
        }

        try {
            setLoading(true);

            const total = calculateTotal();

            const response = await API.put(
                `/examination/scripts/${selectedScript._id}/evaluate`,
                {
                    evaluationType: "first",
                    marks: marks,
                    total: total,
                    remarks: remarks,
                    evaluatorId: selectedEvaluator,
                }
            );

            if (response.data.success) {
                showSuccessMessage("Evaluation saved successfully!");

                // Reset form
                setMarks({});
                setRemarks("");

                // Refresh scripts to show updated status
                await fetchScripts();

                // Clear selected script to allow selecting another
                setSelectedScript(null);
                setQuestionPaper(null);
            }
        } catch (error) {
            console.error("Error saving evaluation:", error);
            showAxiosError(error);
        } finally {
            setLoading(false);
        }
    };

    // Group questions by section
    const groupQuestionsBySection = () => {
        if (!questionPaper || !questionPaper.questions) return {};

        const grouped = {};
        questionPaper.questions.forEach((q) => {
            const section = q.section || "No Section";
            if (!grouped[section]) {
                grouped[section] = [];
            }
            grouped[section].push(q);
        });
        return grouped;
    };

    // Helper to get max marks for a question (ensure it's a number)
    const getQuestionMaxMarks = (question) => {
        if (!question) {
            return 0;
        }
        
        // Direct access to marks field - this is the primary field
        let marks = question.marks;
        
        // If marks is not found or is 0/empty, try alternative field names
        if (marks === undefined || marks === null || marks === '' || marks === 0) {
            marks = question.maxMarks || question.totalMarks || question.mark || question.marksValue;
        }
        
        // If still not found, return 0
        if (marks === undefined || marks === null || marks === '') {
            // Only log warning for first few questions to avoid console spam
            const questionId = question.questionId || question.id;
            if (!window._marksWarningLogged) {
                window._marksWarningLogged = new Set();
            }
            if (!window._marksWarningLogged.has(questionId)) {
                window._marksWarningLogged.add(questionId);
                console.warn("getQuestionMaxMarks: marks not found in question:", {
                    questionId: questionId,
                    questionText: question.questionText?.substring(0, 50),
                    availableFields: Object.keys(question)
                });
            }
            return 0;
        }
        
        // Parse the marks value
        let result = 0;
        if (typeof marks === 'number') {
            result = marks;
        } else if (typeof marks === 'string') {
            const trimmed = marks.trim();
            if (trimmed !== '') {
                const parsed = parseFloat(trimmed);
                result = isNaN(parsed) ? 0 : parsed;
            }
        } else {
            return 0;
        }
        
        // Only warn if marks is 1 AND there's no sectionMarks to use instead
        if (result === 1) {
            const questionId = question.questionId || question.id;
            const hasSectionMarks = question.sectionMarks !== undefined && 
                                   question.sectionMarks !== null && 
                                   question.sectionMarks !== "" && 
                                   (typeof question.sectionMarks === 'number' ? question.sectionMarks > 0 : parseFloat(question.sectionMarks) > 0);
            
            // Only warn if there's no sectionMarks to fall back to
            if (!hasSectionMarks) {
                if (!window._marksOneWarningLogged) {
                    window._marksOneWarningLogged = new Set();
                }
                if (!window._marksOneWarningLogged.has(questionId) && window._marksOneWarningLogged.size < 3) {
                    window._marksOneWarningLogged.add(questionId);
                    console.warn("⚠️ Question has marks = 1 (no sectionMarks available). Please verify this is correct:", {
                        questionId: questionId,
                        questionText: question.questionText?.substring(0, 50),
                        originalMarks: question.marks,
                    });
                }
            }
        }
        
        return result;
    };

    // Helper to get section marks (if available)
    const getSectionMarks = (questions) => {
        if (!questions || questions.length === 0) return null;
        const firstQuestion = questions[0];
        if (firstQuestion?.sectionMarks !== undefined && firstQuestion?.sectionMarks !== null && firstQuestion?.sectionMarks !== "") {
            const sectionMarks = typeof firstQuestion.sectionMarks === 'string' 
                ? parseFloat(firstQuestion.sectionMarks) 
                : firstQuestion.sectionMarks;
            return isNaN(sectionMarks) ? null : sectionMarks;
        }
        // Calculate from individual question marks if sectionMarks not set
        const total = questions.reduce((sum, q) => sum + getQuestionMaxMarks(q), 0);
        return total > 0 ? total : null;
    };

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                    Script Evaluation
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                    Evaluate scripts allocated to evaluators
                </p>
            </div>

            {/* Dropdowns */}
            <div className="bg-white rounded-lg shadow-md border p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Evaluator Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Evaluator <span className="text-red-500">*</span>
                        </label>
                        {initialLoading ? (
                            <div className="w-full px-3 py-2 border rounded-lg text-gray-500">
                                Loading evaluators...
                            </div>
                        ) : (
                            <select
                                value={selectedEvaluator}
                                onChange={(e) => {
                                    setSelectedEvaluator(e.target.value);
                                    setSelectedAllocation(null);
                                    setSelectedScript(null);
                                    setQuestionPaper(null);
                                }}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Evaluator</option>
                                {evaluators.map((evaluator) => (
                                    <option key={evaluator.evaluatorId} value={evaluator.evaluatorId}>
                                        {evaluator.name} ({evaluator.evaluatorId})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Bundle Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Bundle <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedAllocation?._id || ""}
                            onChange={(e) => {
                                const alloc = allocations.find((a) => a._id === e.target.value);
                                setSelectedAllocation(alloc);
                                setSelectedScript(null);
                                setQuestionPaper(null);
                            }}
                            disabled={!selectedEvaluator}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                            <option value="">Select Bundle</option>
                            {allocations.map((allocation) => (
                                <option key={allocation._id} value={allocation._id}>
                                    {allocation.bundleBarcode} - {allocation.subjectId?.name || allocation.subjectCode} ({allocation.allocatedScripts} scripts)
                                </option>
                            ))}
                        </select>
                        {selectedEvaluator && allocations.length === 0 && !loading && (
                            <p className="text-xs text-gray-500 mt-1">
                                No allocated bundles found for this evaluator
                            </p>
                        )}
                    </div>

                    {/* Script Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Script <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedScript?._id || ""}
                            onChange={(e) => handleScriptSelect(e.target.value)}
                            disabled={!selectedAllocation}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                            <option value="">Select Script</option>
                            {scripts.map((script) => (
                                <option key={script._id} value={script._id}>
                                    {script.originalScriptNumber || script.scriptBarcode.split('-').pop()} - HT: {script.hallTicketNumber || "N/A"} ({script.status})
                                </option>
                            ))}
                        </select>
                        {selectedAllocation && scripts.length === 0 && !loading && (
                            <p className="text-xs text-gray-500 mt-1">
                                No scripts found in this bundle
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Evaluation Form - In Page */}
            {questionPaper && selectedScript && (
                <div className="bg-white rounded-lg shadow-md border">
                    {/* Header */}
                    <div className="p-6 border-b bg-blue-50">
                        <h3 className="text-lg font-semibold text-blue-900">Evaluate Script</h3>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Script:</span>
                                <span className="ml-2 font-medium">{selectedScript.originalScriptNumber || selectedScript.scriptBarcode.split('-').pop()}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Hall Ticket:</span>
                                <span className="ml-2 font-medium">{selectedScript.hallTicketNumber || "Not Registered"}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Student:</span>
                                <span className="ml-2 font-medium">{selectedScript.studentName || "Not Registered"}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Subject:</span>
                                <span className="ml-2 font-medium">{questionPaper.subjectName}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Questions grouped by sections */}
                        {Object.entries(groupQuestionsBySection()).map(([sectionName, questions]) => {
                            const sectionMarks = getSectionMarks(questions);
                            return (
                            <div key={sectionName} className="mb-6">
                                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-blue-900">{sectionName}</h4>
                                            {questions[0]?.sectionInstruction && (
                                                <p className="text-sm text-blue-700 mt-1">
                                                    {questions[0].sectionInstruction}
                                                </p>
                                            )}
                                        </div>
                                        {sectionMarks !== null && (
                                            <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded">
                                                Section Total: {sectionMarks} marks
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {questions.map((question, index) => {
                                        // Calculate max marks once per question to avoid multiple calls
                                        let maxMarks = getQuestionMaxMarks(question);

                                        // If backend stored marks = 1 (or 0) but the section has its own total marks,
                                        // distribute the section marks equally across all questions in that section.
                                        // This matches how marks are shown in the question paper builder.
                                        if ((maxMarks === 1 || maxMarks === 0) && sectionMarks && questions.length > 0) {
                                            const perQuestion = Math.round(sectionMarks / questions.length);
                                            if (perQuestion > 0) {
                                                maxMarks = perQuestion;
                                            }
                                        }

                                        // Debug: Log question structure for first question in first section only (only in development)
                                        if (process.env.NODE_ENV === 'development' && index === 0 && !window._firstQuestionLogged) {
                                            window._firstQuestionLogged = true;
                                            console.log("🔍 First question structure:", {
                                                sectionName: sectionName,
                                                questionId: question.questionId || question.id,
                                                questionText: question.questionText?.substring(0, 50),
                                                marks: question.marks,
                                                sectionMarks: question.sectionMarks,
                                                calculatedMaxMarks: maxMarks,
                                            });
                                        }
                                        
                                        return (
                                        <div key={question.questionId || question.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">
                                                        Q{index + 1}. {question.questionText}
                                                    </p>
                                                    {question.subQuestions && question.subQuestions.length > 0 && (
                                                        <ul className="mt-2 ml-4 space-y-1">
                                                            {question.subQuestions.map((sq, sqIndex) => (
                                                                <li key={sqIndex} className="text-sm text-gray-700">
                                                                    {sq.showOr && <span className="font-medium">OR </span>}
                                                                    {sq.text}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-blue-600 ml-4 whitespace-nowrap">
                                                    Max: {maxMarks} marks
                                                </span>
                                            </div>

                                            <div className="mt-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Marks Obtained
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        step="0.5"
                                                        min="0"
                                                        max={maxMarks > 0 ? maxMarks : undefined}
                                                        value={marks[question.questionId || question.id] || ""}
                                                        onChange={(e) =>
                                                            handleMarksChange(question.questionId || question.id, e.target.value, maxMarks)
                                                        }
                                                        className="w-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="0"
                                                        disabled={!maxMarks || maxMarks === 0}
                                                    />
                                                    <span className="text-xs text-gray-500">
                                                        / {maxMarks > 0 ? maxMarks : "N/A"}
                                                    </span>
                                                    {(!maxMarks || maxMarks === 0) && (
                                                        <span className="text-xs text-red-500">
                                                            (Marks not set in question paper)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>
                            );
                        })}

                        {/* Remarks */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Remarks (Optional)
                            </label>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter any remarks or comments..."
                            />
                        </div>

                        {/* Total */}
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-gray-900">
                                    Total Marks:
                                </span>
                                <span className="text-2xl font-bold text-blue-600">
                                    {calculateTotal().toFixed(2)} / {questionPaper.totalMarks}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t flex justify-end space-x-3 bg-gray-50">
                        <button
                            onClick={() => {
                                setSelectedScript(null);
                                setQuestionPaper(null);
                                setMarks({});
                                setRemarks("");
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveEvaluation}
                            disabled={loading}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? "Saving..." : "Save Evaluation"}
                        </button>
                    </div>
                </div>
            )}

            {/* Empty state when no script selected */}
            {selectedAllocation && !selectedScript && !loading && (
                <div className="bg-white rounded-lg shadow-md border p-12 text-center">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No script selected</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Select a script from the dropdown above to start evaluation
                    </p>
                </div>
            )}
        </div>
    );
};

export default ScriptEvaluation;
