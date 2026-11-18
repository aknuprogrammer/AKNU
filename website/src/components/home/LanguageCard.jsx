import React, { useState } from "react";
import { ChevronDown, ChevronUp, Languages } from "lucide-react";
import { FaLanguage } from "react-icons/fa";

const LanguageCard = () => {
  const [visibleCount, setVisibleCount] = useState(8);
  const [isExpanded, setIsExpanded] = useState(false);

  const languages = [
    { name: "English", speak: "Well", write: "Well" },
    { name: "Telugu", speak: "Well", write: "Well" },
    { name: "Hindi", speak: "Well", write: "Well" },
    { name: "Tamil", speak: "Manageable", write: "Reasonable" },
    { name: "Yerukula", speak: "Speak", write: "Manageable" },
    { name: "Kotiya", speak: "Manageable", write: "Manageable" },
    { name: "Bagatha", speak: "Manageable", write: "Manageable" },
    { name: "Gadaba", speak: "Manageable", write: "Manageable" },
    { name: "Jhatapu", speak: "Manageable", write: "Manageable" },
    { name: "Kupia", speak: "Manageable", write: "Manageable" },
    { name: "Koya", speak: "Manageable", write: "Manageable" },
    { name: "Konda dhora", speak: "Manageable", write: "Manageable" },
    { name: "Kolam", speak: "Manageable", write: "Manageable" },
    { name: "Sugali", speak: "Manageable", write: "Manageable" },
    { name: "Porja", speak: "Manageable", write: "Manageable" },
    { name: "Gond", speak: "Manageable", write: "Manageable" },
    { name: "Goudu", speak: "Manageable", write: "Manageable" },
    { name: "Mukha dora", speak: "Manageable", write: "Manageable" },
    { name: "Savara", speak: "Manageable", write: "Manageable" },
    { name: "Mali", speak: "Manageable", write: "Manageable" },
    { name: "Rana", speak: "Manageable", write: "Manageable" },
    { name: "Kammara", speak: "Manageable", write: "Manageable" },
    { name: "Dhruva", speak: "Manageable", write: "Manageable" },
  ];

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    setVisibleCount(isExpanded ? 8 : languages.length);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 p-2 rounded-full mr-3 text-indigo-600">
          <FaLanguage className="[color:#007367]" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-teal-800 leading-tight">
          Languages Known :{" "}
          <span className="text-[color:#007367]">{languages.length}</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {languages.slice(0, visibleCount).map((language, index) => (
          <div
            key={index}
            className={`border rounded-xl p-4 sm:p-5 transition-all duration-300 cursor-default shadow-sm border-[color:#007367] hover:shadow-md group relative overflow-hidden bg-[color:#b2e0d7]/20`}
          >
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg text-gray-800 group-hover:text-[color:#007367] transition-colors">
                {language.name}
              </h3>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center">
                <span className="w-16 sm:w-20 text-gray-500 text-sm">Speak:</span>
                <div className="flex-1">
                  <div
                    className={`h-2 rounded-full bg-[color:#41b3a3]`}
                    style={{
                      width: `${language.speak === "Well" ? "100%" : "60%"}`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center">
                <span className="w-16 sm:w-20 text-gray-500 text-sm">Write:</span>
                <div className="flex-1">
                  <div
                    className={`h-2 rounded-full ${
                      language.write === "Well"
                        ? "bg-[color:#41b3a3]"
                        : language.write === "Reasonable"
                          ? "bg-[color:#7bcfc0]"
                          : "bg-[color:#b2e0d7]"
                    }`}
                    style={{
                      width: `${
                        language.write === "Well"
                          ? "100%"
                          : language.write === "Reasonable"
                            ? "75%"
                            : "60%"
                      }`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {languages.length > 8 && (
        <div className="mt-8 text-center">
          <button
            onClick={toggleExpand}
            className="inline-flex items-center px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-[color:#007367] text-white font-medium text-sm sm:text-base hover:bg-[color:#00574e] transition-colors shadow-sm"
          >
            {isExpanded ? (
              <>
                <span>Show Less</span>
                <ChevronUp className="ml-2" />
              </>
            ) : (
              <>
                <span>View More Languages</span>
                <ChevronDown className="ml-2" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageCard;
