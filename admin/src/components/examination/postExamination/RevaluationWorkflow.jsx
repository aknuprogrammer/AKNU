import React from "react";

const RevaluationWorkflow = ({ request }) => {
  // Define workflow stages
  const stages = [
    {
      id: 1,
      name: "Student Request",
      key: "request",
      status: request?.requestDate ? "completed" : "pending",
      date: request?.requestDate,
    },
    {
      id: 2,
      name: "Payment",
      key: "payment",
      status: request?.paymentTransactionId?.payment_status === "SUCCESS" || request?.paymentStatus === "Paid" 
        ? "completed" 
        : request?.paymentStatus === "Failed" 
        ? "failed" 
        : "pending",
      date: request?.paymentTransactionId?.payment_completed_at,
    },
    {
      id: 3,
      name: "Admin Review",
      key: "review",
      status: request?.status === "Approved" 
        ? "completed" 
        : request?.status === "Rejected" 
        ? "failed" 
        : request?.status === "Pending" 
        ? "pending" 
        : "completed",
      date: request?.approvedAt || request?.rejectedAt,
    },
    {
      id: 4,
      name: "Script Retrieval",
      key: "script",
      status: request?.scriptRetrieved 
        ? "completed" 
        : request?.status === "Approved" 
        ? "in_progress" 
        : "pending",
      date: request?.scriptRetrievedAt,
    },
    {
      id: 5,
      name: "Evaluator Assignment",
      key: "evaluator",
      status: request?.assignedEvaluatorId 
        ? "completed" 
        : request?.scriptRetrieved 
        ? "in_progress" 
        : "pending",
      date: request?.assignedAt,
    },
    {
      id: 6,
      name: "Re-evaluation",
      key: "reevaluation",
      status: request?.revaluationMarks !== null && request?.revaluationMarks !== undefined 
        ? "completed" 
        : request?.assignedEvaluatorId 
        ? "in_progress" 
        : "pending",
      date: request?.revaluationCompletedAt,
    },
    {
      id: 7,
      name: "Marks Update",
      key: "marks",
      status: request?.revaluationMarks !== null && request?.revaluationMarks !== undefined 
        ? "completed" 
        : "pending",
      date: request?.revaluationCompletedAt,
    },
    {
      id: 8,
      name: "Result Processing",
      key: "result",
      status: request?.status === "Completed" 
        ? "completed" 
        : request?.revaluationMarks !== null 
        ? "in_progress" 
        : "pending",
      date: request?.revaluationCompletedAt,
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500 text-white";
      case "in_progress":
        return "bg-blue-500 text-white";
      case "failed":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-300 text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case "in_progress":
        return (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case "failed":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V7z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h4 className="text-sm font-semibold text-gray-700 mb-4">Revaluation Workflow</h4>
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{
              width: `${(stages.filter(s => s.status === "completed").length / stages.length) * 100}%`,
            }}
          />
        </div>

        {/* Stages */}
        <div className="relative flex justify-between">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-md z-10 ${getStatusColor(stage.status)}`}
                title={stage.name}
              >
                {getStatusIcon(stage.status)}
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-gray-700">{stage.name}</p>
                {stage.date && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(stage.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Stage Info */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Current Stage:</p>
            <p className="text-sm text-gray-600">
              {stages.find(s => s.status === "in_progress")?.name || 
               stages.find(s => s.status === "pending" && stages.findIndex(st => st.id === s.id) === stages.findIndex(st => st.status === "completed") + 1)?.name ||
               stages[stages.length - 1].name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">Progress:</p>
            <p className="text-sm text-gray-600">
              {stages.filter(s => s.status === "completed").length} / {stages.length} stages
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevaluationWorkflow;

