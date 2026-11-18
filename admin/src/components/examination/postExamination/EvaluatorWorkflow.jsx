import React, { useState, useEffect } from "react";
import { API } from "../../../config/urls";
import { seatingArrangementsApi } from "../../../services/apiService";

const EvaluatorWorkflow = () => {
  const [currentScript, setCurrentScript] = useState(null);
  const [scripts, setScripts] = useState([
    {
      id: "S001",
      scriptBarcode: "SCRIPT-21CS1401-0001",
      subjectCode: "21CS1401",
      subject: "Database Management Systems",
      studentName: "Rajesh Kumar",
      rollNumber: "AKNU2024001",
      hallTicketNumber: "HT-2024-001",
      status: "Allocated",
      evaluationStatus: "Pending",
      firstEvaluation: null,
      secondEvaluation: null,
      thirdEvaluation: null,
      finalMarks: null,
    },
    {
      id: "S002",
      scriptBarcode: "SCRIPT-21CS1401-0002",
      subjectCode: "21CS1401",
      subject: "Database Management Systems",
      studentName: "Priya Sharma",
      rollNumber: "AKNU2024002",
      hallTicketNumber: "HT-2024-002",
      status: "Allocated",
      evaluationStatus: "Evaluated",
      firstEvaluation: {
        marks: {
          q1: 15,
          q2: 18,
          q3: 20,
          q4: 16,
          q5: 19,
        },
        total: 88,
        remarks: "",
        evaluatedAt: "2024-01-15 14:30",
        evaluatorId: "E001",
      },
      secondEvaluation: null,
      thirdEvaluation: null,
      finalMarks: 88,
    },
    {
      id: "S003",
      scriptBarcode: "SCRIPT-21CS1401-0003",
      subjectCode: "21CS1401",
      subject: "Database Management Systems",
      studentName: "Amit Patel",
      rollNumber: "AKNU2024003",
      hallTicketNumber: "HT-2024-003",
      status: "Allocated",
      evaluationStatus: "Requires Third Evaluation",
      firstEvaluation: {
        marks: {
          q1: 12,
          q2: 15,
          q3: 18,
          q4: 14,
          q5: 16,
        },
        total: 75,
        remarks: "Good understanding of concepts",
        evaluatedAt: "2024-01-16 10:15",
        evaluatorId: "E001",
      },
      secondEvaluation: {
        marks: {
          q1: 18,
          q2: 16,
          q3: 17,
          q4: 19,
          q5: 15,
        },
        total: 85,
        remarks: "Well written answers",
        evaluatedAt: "2024-01-16 11:30",
        evaluatorId: "E002",
      },
      thirdEvaluation: null,
      finalMarks: null,
    },
    {
      id: "S004",
      scriptBarcode: "SCRIPT-21CS1401-0004",
      subjectCode: "21CS1401",
      subject: "Database Management Systems",
      studentName: "Sneha Reddy",
      rollNumber: "AKNU2024004",
      hallTicketNumber: "HT-2024-004",
      status: "Allocated",
      evaluationStatus: "Evaluated",
      firstEvaluation: {
        marks: {
          q1: 16,
          q2: 17,
          q3: 19,
          q4: 15,
          q5: 18,
        },
        total: 85,
        remarks: "Excellent presentation",
        evaluatedAt: "2024-01-16 09:20",
        evaluatorId: "E001",
      },
      secondEvaluation: {
        marks: {
          q1: 15,
          q2: 18,
          q3: 18,
          q4: 16,
          q5: 17,
        },
        total: 84,
        remarks: "Good attempt",
        evaluatedAt: "2024-01-16 10:45",
        evaluatorId: "E002",
      },
      thirdEvaluation: null,
      finalMarks: 84.5,
    },
    {
      id: "S005",
      scriptBarcode: "SCRIPT-21CS1401-0005",
      subjectCode: "21CS1401",
      subject: "Database Management Systems",
      studentName: "Vijay Kumar",
      rollNumber: "AKNU2024005",
      hallTicketNumber: "HT-2024-005",
      status: "Allocated",
      evaluationStatus: "Evaluated",
      firstEvaluation: {
        marks: {
          q1: 0,
          q2: 0,
          q3: 0,
          q4: 0,
          q5: 0,
        },
        total: 0,
        remarks: "ABSENT",
        evaluatedAt: "2024-01-16 14:00",
        evaluatorId: "E001",
        isAbsent: true,
      },
      secondEvaluation: null,
      thirdEvaluation: null,
      finalMarks: 0,
    },
    {
      id: "S006",
      scriptBarcode: "SCRIPT-21CS1402-0001",
      subjectCode: "21CS1402",
      subject: "Design and Analysis of Algorithms",
      studentName: "Kiran Rao",
      rollNumber: "AKNU2024006",
      hallTicketNumber: "HT-2024-006",
      status: "Allocated",
      evaluationStatus: "Evaluated",
      firstEvaluation: {
        marks: {
          q1: 8,
          q2: 12,
          q3: 10,
          q4: 9,
          q5: 11,
        },
        total: 50,
        remarks: "Average performance",
        evaluatedAt: "2024-01-17 08:30",
        evaluatorId: "E003",
      },
      secondEvaluation: null,
      thirdEvaluation: null,
      finalMarks: 50,
    },
    {
      id: "S007",
      scriptBarcode: "SCRIPT-21CS1402-0002",
      subjectCode: "21CS1402",
      subject: "Design and Analysis of Algorithms",
      studentName: "Arjun Mehta",
      rollNumber: "AKNU2024007",
      hallTicketNumber: "HT-2024-007",
      status: "Allocated",
      evaluationStatus: "Requires Third Evaluation",
      firstEvaluation: {
        marks: {
          q1: 19,
          q2: 18,
          q3: 20,
          q4: 19,
          q5: 18,
        },
        total: 94,
        remarks: "Outstanding work",
        evaluatedAt: "2024-01-17 09:15",
        evaluatorId: "E003",
      },
      secondEvaluation: {
        marks: {
          q1: 15,
          q2: 16,
          q3: 17,
          q4: 16,
          q5: 15,
        },
        total: 79,
        remarks: "Good attempt but some errors",
        evaluatedAt: "2024-01-17 10:20",
        evaluatorId: "E004",
      },
      thirdEvaluation: {
        marks: {
          q1: 17,
          q2: 17,
          q3: 19,
          q4: 18,
          q5: 17,
        },
        total: 88,
        remarks: "Well structured answers",
        evaluatedAt: "2024-01-17 11:45",
        evaluatorId: "E005",
      },
      finalMarks: 88,
    },
    {
      id: "S008",
      scriptBarcode: "SCRIPT-21CS1401-0006",
      subjectCode: "21CS1401",
      subject: "Database Management Systems",
      studentName: "Divya Singh",
      rollNumber: "AKNU2024008",
      hallTicketNumber: "HT-2024-008",
      status: "Allocated",
      evaluationStatus: "Evaluated",
      firstEvaluation: {
        marks: {
          q1: 0,
          q2: 0,
          q3: 0,
          q4: 0,
          q5: 0,
        },
        total: 0,
        remarks: "INVALID",
        evaluatedAt: "2024-01-17 13:30",
        evaluatorId: "E001",
        isInvalid: true,
      },
      secondEvaluation: null,
      thirdEvaluation: null,
      finalMarks: 0,
    },
    {
      id: "S009",
      scriptBarcode: "SCRIPT-21CS1402-0003",
      subjectCode: "21CS1402",
      subject: "Design and Analysis of Algorithms",
      studentName: "Ravi Verma",
      rollNumber: "AKNU2024009",
      hallTicketNumber: "HT-2024-009",
      status: "Allocated",
      evaluationStatus: "Pending",
      firstEvaluation: null,
      secondEvaluation: null,
      thirdEvaluation: null,
      finalMarks: null,
    },
    {
      id: "S010",
      scriptBarcode: "SCRIPT-21CS1401-0007",
      subjectCode: "21CS1401",
      subject: "Database Management Systems",
      studentName: "Anjali Patel",
      rollNumber: "AKNU2024010",
      hallTicketNumber: "HT-2024-010",
      status: "Allocated",
      evaluationStatus: "Evaluated",
      firstEvaluation: {
        marks: {
          q1: 14,
          q2: 16,
          q3: 15,
          q4: 17,
          q5: 16,
        },
        total: 78,
        remarks: "Satisfactory performance",
        evaluatedAt: "2024-01-17 15:00",
        evaluatorId: "E001",
      },
      secondEvaluation: {
        marks: {
          q1: 13,
          q2: 15,
          q3: 16,
          q4: 16,
          q5: 15,
        },
        total: 75,
        remarks: "Acceptable answers",
        evaluatedAt: "2024-01-17 16:20",
        evaluatorId: "E002",
      },
      thirdEvaluation: null,
      finalMarks: 76.5,
    },
  ]);

  const [marks, setMarks] = useState({
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
    q5: 0,
  });

  const [remarks, setRemarks] = useState("");
  const [scriptBarcodeInput, setScriptBarcodeInput] = useState("");
  const [isAbsent, setIsAbsent] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [evaluationType, setEvaluationType] = useState("first"); // first, second, third
  const [currentEvaluatorId, setCurrentEvaluatorId] = useState("E001"); // TODO: Get from authentication
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Helper function to fetch student details from seating arrangements
  const fetchStudentDetailsFromSeating = async (originalScriptNumber) => {
    if (!originalScriptNumber) return null;
    
    try {
      const response = await seatingArrangementsApi.getAll({
        search: originalScriptNumber.toUpperCase(),
        status: "Active",
      });
      
      if (response.success && response.data && response.data.length > 0) {
        // Find exact match by scriptCode
        const arrangement = response.data.find(
          (arr) => arr.scriptCode?.toUpperCase() === originalScriptNumber.toUpperCase()
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

  // Fetch scripts allocated to current evaluator
  useEffect(() => {
    const fetchMyScripts = async () => {
      try {
        // Only show loader on initial load
        if (scripts.length === 0) {
          setInitialLoading(true);
        }
        const response = await API.get("/examination/scripts", {
          params: {
            evaluatorId: currentEvaluatorId,
            status: "Allocated",
          },
        });
        const scriptsData = response.data?.data || response.data || [];
        if (scriptsData.length > 0 || response.data?.success) {
          // Transform API data to match component format and fetch student details
          const transformedScripts = await Promise.all(
            scriptsData.map(async (script) => {
              // Fetch student details from seating arrangements if not already in script
              let studentDetails = null;
              if ((!script.studentName || !script.hallTicketNumber) && script.originalScriptNumber) {
                studentDetails = await fetchStudentDetailsFromSeating(script.originalScriptNumber);
              }
              
              return {
                id: script._id,
                _id: script._id,
                scriptBarcode: script.scriptBarcode,
                originalScriptNumber: script.originalScriptNumber,
                subjectCode: script.subjectCode,
                subject: script.subjectId?.name || "N/A",
                studentName: script.studentName || studentDetails?.studentName || "Not Registered",
                rollNumber: script.rollNumber || studentDetails?.rollNumber || "N/A",
                hallTicketNumber: script.hallTicketNumber || studentDetails?.hallTicketNumber || "Not Registered",
                status: script.status,
                evaluationStatus:
                  script.status === "Evaluated" ? "Evaluated" : "Pending",
                firstEvaluation:
                  script.marks?.firstEvaluation?.total > 0
                    ? {
                        marks: Object.fromEntries(
                          script.marks.firstEvaluation.marks || []
                        ),
                        total: script.marks.firstEvaluation.total,
                        remarks: script.marks.firstEvaluation.remarks || "",
                        evaluatedAt: script.marks.firstEvaluation.evaluatedAt,
                        evaluatorId: script.marks.firstEvaluation.evaluatorId,
                      }
                    : null,
                secondEvaluation:
                  script.marks?.secondEvaluation?.total > 0
                    ? {
                        marks: Object.fromEntries(
                          script.marks.secondEvaluation.marks || []
                        ),
                        total: script.marks.secondEvaluation.total,
                        remarks: script.marks.secondEvaluation.remarks || "",
                        evaluatedAt: script.marks.secondEvaluation.evaluatedAt,
                        evaluatorId: script.marks.secondEvaluation.evaluatorId,
                      }
                    : null,
                thirdEvaluation:
                  script.marks?.thirdEvaluation?.total > 0
                    ? {
                        marks: Object.fromEntries(
                          script.marks.thirdEvaluation.marks || []
                        ),
                        total: script.marks.thirdEvaluation.total,
                        remarks: script.marks.thirdEvaluation.remarks || "",
                        evaluatedAt: script.marks.thirdEvaluation.evaluatedAt,
                        evaluatorId: script.marks.thirdEvaluation.evaluatorId,
                      }
                    : null,
                finalMarks: script.marks?.finalMarks || null,
              };
            })
          );
          setScripts(transformedScripts);
        }
      } catch (error) {
        console.error("Error fetching scripts:", error);
      } finally {
        if (initialLoading) {
          setInitialLoading(false);
        }
      }
    };
    fetchMyScripts();
  }, [currentEvaluatorId]);

  const questionStructure = {
    q1: { maxMarks: 20, label: "Question 1" },
    q2: { maxMarks: 20, label: "Question 2" },
    q3: { maxMarks: 20, label: "Question 3" },
    q4: { maxMarks: 20, label: "Question 4" },
    q5: { maxMarks: 20, label: "Question 5" },
  };

  const totalMarks = Object.values(marks).reduce((sum, mark) => sum + mark, 0);
  const maxTotalMarks = Object.values(questionStructure).reduce(
    (sum, q) => sum + q.maxMarks,
    0
  );

  const handleScriptScan = async () => {
    if (!scriptBarcodeInput) {
      alert("Please scan script barcode");
      return;
    }

    try {
      setLoading(true);
      // Fetch script by barcode
      const response = await API.get(`/examination/scripts/barcode/${scriptBarcodeInput.toUpperCase()}`);
      if (!response.data.success || !response.data.data) {
        alert("Script not found");
        setScriptBarcodeInput("");
        return;
      }

      const scriptData = response.data.data;

      // Check if script is allocated to current evaluator
      if (scriptData.evaluatorId !== currentEvaluatorId) {
        alert("Script not allocated to you");
        setScriptBarcodeInput("");
        return;
      }

      // Fetch student details from seating arrangements if not already in script
      let studentDetails = null;
      if ((!scriptData.studentName || !scriptData.hallTicketNumber) && scriptData.originalScriptNumber) {
        studentDetails = await fetchStudentDetailsFromSeating(scriptData.originalScriptNumber);
      }

      // Transform API data to match component format
      const script = {
        id: scriptData._id,
        _id: scriptData._id,
        scriptBarcode: scriptData.scriptBarcode,
        originalScriptNumber: scriptData.originalScriptNumber,
        subjectCode: scriptData.subjectCode,
        subject: scriptData.subjectId?.name || "N/A",
        studentName: scriptData.studentName || studentDetails?.studentName || "Not Registered",
        rollNumber: scriptData.rollNumber || studentDetails?.rollNumber || "N/A",
        hallTicketNumber: scriptData.hallTicketNumber || studentDetails?.hallTicketNumber || "Not Registered",
        status: scriptData.status,
        evaluationStatus:
          scriptData.status === "Evaluated" ? "Evaluated" : "Pending",
        firstEvaluation:
          scriptData.marks?.firstEvaluation?.total > 0
            ? {
                marks: Object.fromEntries(
                  scriptData.marks.firstEvaluation.marks || []
                ),
                total: scriptData.marks.firstEvaluation.total,
                remarks: scriptData.marks.firstEvaluation.remarks || "",
                evaluatedAt: scriptData.marks.firstEvaluation.evaluatedAt,
                evaluatorId: scriptData.marks.firstEvaluation.evaluatorId,
              }
            : null,
        secondEvaluation:
          scriptData.marks?.secondEvaluation?.total > 0
            ? {
                marks: Object.fromEntries(
                  scriptData.marks.secondEvaluation.marks || []
                ),
                total: scriptData.marks.secondEvaluation.total,
                remarks: scriptData.marks.secondEvaluation.remarks || "",
                evaluatedAt: scriptData.marks.secondEvaluation.evaluatedAt,
                evaluatorId: scriptData.marks.secondEvaluation.evaluatorId,
              }
            : null,
        thirdEvaluation:
          scriptData.marks?.thirdEvaluation?.total > 0
            ? {
                marks: Object.fromEntries(
                  scriptData.marks.thirdEvaluation.marks || []
                ),
                total: scriptData.marks.thirdEvaluation.total,
                remarks: scriptData.marks.thirdEvaluation.remarks || "",
                evaluatedAt: scriptData.marks.thirdEvaluation.evaluatedAt,
                evaluatorId: scriptData.marks.thirdEvaluation.evaluatorId,
              }
            : null,
        finalMarks: scriptData.marks?.finalMarks || null,
      };

      setCurrentScript(script);
      setScriptBarcodeInput("");

      // Load existing marks if script was partially evaluated
      if (script.firstEvaluation && evaluationType === "first") {
        setMarks(script.firstEvaluation.marks);
        setRemarks(script.firstEvaluation.remarks);
      } else if (script.secondEvaluation && evaluationType === "second") {
        setMarks(script.secondEvaluation.marks);
        setRemarks(script.secondEvaluation.remarks);
      } else if (script.thirdEvaluation && evaluationType === "third") {
        setMarks(script.thirdEvaluation.marks);
        setRemarks(script.thirdEvaluation.remarks);
      } else {
        setMarks({
          q1: 0,
          q2: 0,
          q3: 0,
          q4: 0,
          q5: 0,
        });
        setRemarks("");
      }
    } catch (error) {
      console.error("Error fetching script:", error);
      alert("Error fetching script. Please try again.");
      setScriptBarcodeInput("");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (question, value) => {
    const maxMark = questionStructure[question].maxMarks;
    const numValue = parseInt(value) || 0;
    if (numValue < 0 || numValue > maxMark) {
      alert(`Marks should be between 0 and ${maxMark}`);
      return;
    }
    setMarks({ ...marks, [question]: numValue });
  };

  const handleSaveEvaluation = async () => {
    if (!currentScript) {
      alert("Please scan a script first");
      return;
    }

    try {
      setLoading(true);

      let evaluationData = {
        evaluationType,
        evaluatorId: currentEvaluatorId,
      };

      if (isAbsent) {
        evaluationData.marks = {};
        evaluationData.total = 0;
        evaluationData.remarks = "ABSENT";
      } else if (isInvalid) {
        evaluationData.marks = {};
        evaluationData.total = 0;
        evaluationData.remarks = "INVALID";
      } else {
        // Validate marks
        if (totalMarks === 0) {
          alert("Please enter marks or mark as absent/invalid");
          return;
        }
        evaluationData.marks = marks;
        evaluationData.total = totalMarks;
        evaluationData.remarks = remarks;
      }

      // Save evaluation to API
      const response = await API.put(
        `/examination/scripts/${currentScript._id}/evaluate`,
        evaluationData
      );

      if (response.data.success) {
        // Refresh scripts list
        const scriptsResponse = await API.get("/examination/scripts", {
          params: {
            evaluatorId: currentEvaluatorId,
            status: "Allocated",
          },
        });
        const scriptsData = scriptsResponse.data?.data || scriptsResponse.data || [];
        if (scriptsData.length > 0 || scriptsResponse.data?.success) {
          // Transform and fetch student details for each script
          const transformedScripts = await Promise.all(
            scriptsData.map(async (script) => {
              // Fetch student details from seating arrangements if not already in script
              let studentDetails = null;
              if ((!script.studentName || !script.hallTicketNumber) && script.originalScriptNumber) {
                studentDetails = await fetchStudentDetailsFromSeating(script.originalScriptNumber);
              }
              
              return {
                id: script._id,
                _id: script._id,
                scriptBarcode: script.scriptBarcode,
                originalScriptNumber: script.originalScriptNumber,
                subjectCode: script.subjectCode,
                subject: script.subjectId?.name || "N/A",
                studentName: script.studentName || studentDetails?.studentName || "Not Registered",
                rollNumber: script.rollNumber || studentDetails?.rollNumber || "N/A",
                hallTicketNumber: script.hallTicketNumber || studentDetails?.hallTicketNumber || "Not Registered",
                status: script.status,
                evaluationStatus:
                  script.status === "Evaluated" ? "Evaluated" : "Pending",
                firstEvaluation:
                  script.marks?.firstEvaluation?.total > 0
                    ? {
                        marks: Object.fromEntries(
                          script.marks.firstEvaluation.marks || []
                        ),
                        total: script.marks.firstEvaluation.total,
                        remarks: script.marks.firstEvaluation.remarks || "",
                        evaluatedAt: script.marks.firstEvaluation.evaluatedAt,
                        evaluatorId: script.marks.firstEvaluation.evaluatorId,
                      }
                    : null,
                secondEvaluation:
                  script.marks?.secondEvaluation?.total > 0
                    ? {
                        marks: Object.fromEntries(
                          script.marks.secondEvaluation.marks || []
                        ),
                        total: script.marks.secondEvaluation.total,
                        remarks: script.marks.secondEvaluation.remarks || "",
                        evaluatedAt: script.marks.secondEvaluation.evaluatedAt,
                        evaluatorId: script.marks.secondEvaluation.evaluatorId,
                      }
                    : null,
                thirdEvaluation:
                  script.marks?.thirdEvaluation?.total > 0
                    ? {
                        marks: Object.fromEntries(
                          script.marks.thirdEvaluation.marks || []
                        ),
                        total: script.marks.thirdEvaluation.total,
                        remarks: script.marks.thirdEvaluation.remarks || "",
                        evaluatedAt: script.marks.thirdEvaluation.evaluatedAt,
                        evaluatorId: script.marks.thirdEvaluation.evaluatorId,
                      }
                    : null,
                finalMarks: script.marks?.finalMarks || null,
              };
            })
          );
          setScripts(transformedScripts);
        }

        // Update allocation counts - find allocation and update it
        const allocationsResponse = await API.get(`/examination/evaluator-allocations/evaluator/${currentEvaluatorId}`);
        const allocations = allocationsResponse.data?.data || allocationsResponse.data || [];
        if (allocations.length > 0) {
          for (const allocation of allocations) {
            if (
              allocation.scriptIds.some(
                (id) => id.toString() === currentScript._id.toString()
              )
            ) {
              await API.put(`/examination/evaluator-allocations/${allocation._id}`, {});
              break;
            }
          }
        }

        alert(
          isAbsent
            ? "Script marked as ABSENT"
            : isInvalid
            ? "Script marked as INVALID"
            : "Evaluation saved successfully!"
        );
        setCurrentScript(null);
        setIsAbsent(false);
        setIsInvalid(false);
        setMarks({
          q1: 0,
          q2: 0,
          q3: 0,
          q4: 0,
          q5: 0,
        });
        setRemarks("");
      } else {
        alert(response.message || "Failed to save evaluation");
      }
    } catch (error) {
      console.error("Error saving evaluation:", error);
      alert(error.message || "Failed to save evaluation");
    } finally {
      setLoading(false);
    }
  };

  const myAllocatedScripts = scripts.filter(
    (s) => s.status === "Allocated" && s.evaluationStatus !== "Completed"
  );

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Evaluation Workflow
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Scan scripts and enter marks question-wise
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={evaluationType}
            onChange={(e) => setEvaluationType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="first">First Evaluation</option>
            <option value="second">Second Evaluation</option>
            <option value="third">Third Evaluation</option>
          </select>
        </div>
      </div>

      {/* Script Scan Section */}
      <div className="bg-white rounded-lg shadow-md border p-6 mb-4">
        <h4 className="text-lg font-semibold mb-4">Scan Script Barcode</h4>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={scriptBarcodeInput}
              onChange={(e) => setScriptBarcodeInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleScriptScan();
                }
              }}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              placeholder="Scan script barcode..."
              disabled={!!currentScript}
            />
          </div>
          {!currentScript && (
            <button
              onClick={handleScriptScan}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Load Script
            </button>
          )}
        </div>
      </div>

      {/* Current Script Info and Marks Entry */}
      {currentScript && (
        <div className="bg-white rounded-lg shadow-md border p-6 mb-4">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="text-xl font-semibold mb-2">Script Details</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Barcode:</span>{" "}
                  {currentScript.scriptBarcode}
                </p>
                <p>
                  <span className="font-medium">Subject:</span>{" "}
                  {currentScript.subject} ({currentScript.subjectCode})
                </p>
                <p>
                  <span className="font-medium">Student:</span>{" "}
                  {currentScript.studentName}
                </p>
                <p>
                  <span className="font-medium">Roll Number:</span>{" "}
                  {currentScript.rollNumber}
                </p>
                <p>
                  <span className="font-medium">Hall Ticket:</span>{" "}
                  {currentScript.hallTicketNumber}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setCurrentScript(null);
                setScriptBarcodeInput("");
              }}
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

          {/* Quick Actions */}
          <div className="flex gap-4 mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isAbsent}
                onChange={(e) => {
                  setIsAbsent(e.target.checked);
                  if (e.target.checked) setIsInvalid(false);
                }}
                className="mr-2"
              />
              <span className="text-sm font-medium text-red-600">ABSENT</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isInvalid}
                onChange={(e) => {
                  setIsInvalid(e.target.checked);
                  if (e.target.checked) setIsAbsent(false);
                }}
                className="mr-2"
              />
              <span className="text-sm font-medium text-red-600">INVALID</span>
            </label>
          </div>

          {!isAbsent && !isInvalid && (
            <>
              {/* Previous Evaluations */}
              {(currentScript.firstEvaluation ||
                currentScript.secondEvaluation ||
                currentScript.thirdEvaluation) && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h5 className="font-semibold mb-2">Previous Evaluations</h5>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {currentScript.firstEvaluation && (
                      <div>
                        <span className="font-medium">1st Eval:</span>{" "}
                        {currentScript.firstEvaluation.total} / {maxTotalMarks}
                      </div>
                    )}
                    {currentScript.secondEvaluation && (
                      <div>
                        <span className="font-medium">2nd Eval:</span>{" "}
                        {currentScript.secondEvaluation.total} / {maxTotalMarks}
                      </div>
                    )}
                    {currentScript.thirdEvaluation && (
                      <div>
                        <span className="font-medium">3rd Eval:</span>{" "}
                        {currentScript.thirdEvaluation.total} / {maxTotalMarks}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Marks Entry */}
              <div className="space-y-4">
                <h5 className="font-semibold">
                  Enter Marks (Maximum: {maxTotalMarks})
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(questionStructure).map(([key, question]) => (
                    <div key={key} className="flex items-center gap-4">
                      <label className="w-32 text-sm font-medium">
                        {question.label}:
                      </label>
                      <input
                        type="number"
                        value={marks[key]}
                        onChange={(e) => handleMarkChange(key, e.target.value)}
                        min="0"
                        max={question.maxMarks}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`0-${question.maxMarks}`}
                      />
                      <span className="text-xs text-gray-500">
                        /{question.maxMarks}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-4 border-t">
                  <label className="w-32 text-sm font-medium">
                    Total Marks:
                  </label>
                  <div className="flex-1">
                    <span className="text-2xl font-bold text-blue-600">
                      {totalMarks}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      / {maxTotalMarks}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Remarks (Optional)
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter any remarks..."
                  />
                </div>
              </div>
            </>
          )}

          {/* Save Button */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => {
                setCurrentScript(null);
                setScriptBarcodeInput("");
                setMarks({
                  q1: 0,
                  q2: 0,
                  q3: 0,
                  q4: 0,
                  q5: 0,
                });
                setRemarks("");
                setIsAbsent(false);
                setIsInvalid(false);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEvaluation}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Save Evaluation
            </button>
          </div>
        </div>
      )}

      {/* Allocated Scripts Table */}
      <div className="bg-white rounded-lg shadow-md border overflow-x-auto mt-6">
        <div className="overflow-y-auto max-h-[500px] thin-scrollbar">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Script Barcode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Student Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Subject
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Evaluations
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Final Marks
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap bg-gray-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {myAllocatedScripts.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No scripts allocated to you
                  </td>
                </tr>
              ) : (
                myAllocatedScripts.map((script) => (
                  <tr key={script.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {script.scriptBarcode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {script.studentName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {script.rollNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {script.hallTicketNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {script.subject}
                      </div>
                      <div className="text-xs text-gray-500">
                        {script.subjectCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-xs space-y-1">
                        {script.firstEvaluation && (
                          <div>
                            1st:{" "}
                            <span className="font-medium">
                              {script.firstEvaluation.total}
                            </span>
                          </div>
                        )}
                        {script.secondEvaluation && (
                          <div>
                            2nd:{" "}
                            <span className="font-medium">
                              {script.secondEvaluation.total}
                            </span>
                          </div>
                        )}
                        {script.thirdEvaluation && (
                          <div>
                            3rd:{" "}
                            <span className="font-medium">
                              {script.thirdEvaluation.total}
                            </span>
                          </div>
                        )}
                        {!script.firstEvaluation &&
                          !script.secondEvaluation &&
                          !script.thirdEvaluation && (
                            <span className="text-gray-400">-</span>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {script.finalMarks !== null ? (
                        <span className="text-sm font-bold text-blue-600">
                          {script.finalMarks}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          script.evaluationStatus === "Evaluated"
                            ? "bg-green-100 text-green-800"
                            : script.evaluationStatus ===
                              "Requires Third Evaluation"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {script.evaluationStatus}
                      </span>
                      {script.firstEvaluation?.isAbsent && (
                        <div className="text-xs text-red-600 mt-1">ABSENT</div>
                      )}
                      {script.firstEvaluation?.isInvalid && (
                        <div className="text-xs text-red-600 mt-1">INVALID</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          const scriptFound = scripts.find(
                            (s) => s.scriptBarcode === script.scriptBarcode
                          );
                          if (scriptFound) {
                            setCurrentScript(scriptFound);
                            if (
                              scriptFound.firstEvaluation &&
                              evaluationType === "first"
                            ) {
                              setMarks(scriptFound.firstEvaluation.marks);
                              setRemarks(scriptFound.firstEvaluation.remarks);
                            } else if (
                              scriptFound.secondEvaluation &&
                              evaluationType === "second"
                            ) {
                              setMarks(scriptFound.secondEvaluation.marks);
                              setRemarks(scriptFound.secondEvaluation.remarks);
                            } else if (
                              scriptFound.thirdEvaluation &&
                              evaluationType === "third"
                            ) {
                              setMarks(scriptFound.thirdEvaluation.marks);
                              setRemarks(scriptFound.thirdEvaluation.remarks);
                            } else {
                              setMarks({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 });
                              setRemarks("");
                            }
                          }
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                        title="Load Script"
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EvaluatorWorkflow;
