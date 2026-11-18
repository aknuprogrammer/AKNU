import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import BundleManagement from "../components/examination/postExamination/BundleManagement";
import ScriptRegistration from "../components/examination/postExamination/ScriptRegistration";
import EvaluatorAllocation from "../components/examination/postExamination/EvaluatorAllocation";
import ScriptEvaluation from "../components/examination/postExamination/ScriptEvaluation";
import Scrutiny from "../components/examination/postExamination/Scrutiny";
import ResultProcessing from "../components/examination/postExamination/ResultProcessing";

const PostExamination = () => {
  const location = useLocation();
  const tabs = [
    { path: "", label: "Bundle Management" },
    { path: "/script-registration", label: "Script Registration" },
    // { path: "/qr-code-generator", label: "QR Code Generator" },
    { path: "/evaluator-allocation", label: "Evaluator Allocation" },
    { path: "/evaluation", label: "Evaluation" },
    { path: "/scrutiny", label: "Scrutiny" },
    { path: "/results", label: "Result Processing" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Post-Examination</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="flex overflow-x-auto">
          {tabs.map((tab, index) => {
            const tabPath = `/post-examination${tab.path}`;
            const isActive =
              location.pathname === tabPath ||
              (tab.path === "" &&
                (location.pathname === "/post-examination" ||
                  location.pathname === "/post-examination/"));
            return (
              <Link
                key={index}
                to={tabPath}
                className={`flex-1 min-w-max px-6 py-4 text-center border-b-2 font-medium transition-colors ${isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <div className="p-6">
          <Routes>
            <Route path="/" element={<BundleManagement />} />
            <Route
              path="/script-registration"
              element={<ScriptRegistration />}
            />
            <Route
              path="/evaluator-allocation"
              element={<EvaluatorAllocation />}
            />
            <Route path="/evaluation" element={<ScriptEvaluation />} />
            <Route path="/scrutiny" element={<Scrutiny />} />
            <Route path="/results" element={<ResultProcessing />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default PostExamination;
