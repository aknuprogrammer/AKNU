import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import CreateFile from "./editor/Index";
import UploadLetterHead from "./components/UploadLetterHead";
import LetterTracker from "./LetterTracker";
import { useLetterHeadHook } from "../../Hooks/LetterHeadHook";
import DisplayLetterHeads from "./components/DisplayLetterHeads";
import GeneratedLetters from "./GeneratedLetters";

export default function LetterHeadDesign() {
  const [searchParams] = useSearchParams();
  const [activeMode, setActiveMode] = useState(searchParams.get("mode") || "upload"); 
  const { letters, depts, getLetterHeads, deleteLetterhead } = useLetterHeadHook();

  useEffect(() => {
    getLetterHeads(true);
    const mode = searchParams.get("mode");
    if (mode) setActiveMode(mode);
  }, [searchParams]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50/30 flex flex-col font-sans">
      {/* Top Navigation Bar with Tabs */}
      <div className="bg-white border-b border-gray-100 flex items-center px-4 h-16 shadow-sm overflow-x-auto">
        <div className="flex space-x-8 h-full whitespace-nowrap">
          {[
            { id: "upload", label: "Upload Template" },
            { id: "create", label: "Create Template" },
            // { id: "generated", label: "Generated Letters History" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMode(tab.id)}
              className={`flex items-center h-full px-2 text-sm font-bold transition-all border-b-2 ${
                activeMode === tab.id
                  ? "border-[#525B88] text-[#525B88]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto flex flex-col">

        {/* Content Container */}
        <div className="">
          <div className="max-w-[1400px] mx-auto space-y-3">
            {activeMode === "upload" && (
              <>
                <UploadLetterHead showHeading={false} className="space-y-6" onSuccess={getLetterHeads} />
                <div>
                  <DisplayLetterHeads 
                    letters={letters}
                    depts={depts}
                    deleteFn={deleteLetterhead} 
                    defaultFilter="all"
                  />
                </div>
              </>
            )}

            {activeMode === "create" && (
              <>
                <CreateFile onSuccess={getLetterHeads} />
                <div className="">
                  <DisplayLetterHeads 
                    letters={letters} 
                    depts={depts}
                    deleteFn={deleteLetterhead} 
                    defaultFilter="all"
                  />
                </div>
              </>
            )}

            {activeMode === "generated" && (
                <div className="bg-white p-6 border rounded-xl shadow-sm">
                   <GeneratedLetters showAll={true} />
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
