import React, { useMemo, useState } from "react";
import LetterHeadLibrary from "../../components/LetterHead/LetterHeadLibrary.jsx";
import GeneratedLetters from "../../components/LetterHead/GeneratedLetters.jsx";

export default function EmployeeLetterHeads() {
  const [activeTab, setActiveTab] = useState("letters"); // letters | templates

  const tabs = useMemo(
    () => [
      { id: "letters", label: "Letters" },
      { id: "templates", label: "Templates" },
    ],
    [],
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50/30 flex flex-col font-sans w-full">
      {/* Top Navigation Bar with Tabs (matches LetterHeadDesign) */}
      <div className="bg-white border-b border-gray-100 flex items-center px-4 h-16 shadow-sm overflow-x-auto">
        <div className="flex space-x-8 h-full whitespace-nowrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center h-full px-2 text-sm font-bold transition-all border-b-2 ${
                activeTab === t.id
                  ? "border-[#525B88] text-[#525B88]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        <div className="">
          <div className="max-w-[1400px] mx-auto space-y-3 px-2">
            {activeTab === "templates" ? (
              <LetterHeadLibrary showRequestActions showDownloadActions showWriteAction={false} />
            ) : (
              <GeneratedLetters onLoadLetter={null} hideActions showDownload hideDeptFilter={true} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

