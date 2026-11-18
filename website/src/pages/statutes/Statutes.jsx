import React, { useState } from "react";
import { BackButton } from "../../components/BackButton";
import CodeVolumeIndex from "../../assets/Code Volume/Code Volume INDEX.pdf";
import CodeVolumeCover from "../../assets/Code Volume/Code Volume Cover Page.pdf";
import CodeVolumePartI from "../../assets/Code Volume/Code Volume -  Part I.pdf";
import CodeVolumePartII from "../../assets/Code Volume/Code Volume - Part II.pdf";

const Statutes = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (sectionName) => {
    setOpenSection(openSection === sectionName ? null : sectionName);
  };

  return (
    <div className="px-4 sm:px-16 py-8">
      <BackButton />
      <h1 className="text-3xl font-bold mb-6 text-teal-800">Statutes</h1>

      <p className="text-gray-700 mb-8 text-justify text-[16px]">
        Adikavi Nannaya University operates under a comprehensive framework of
        statutes that govern academic programs, administrative procedures, and
        institutional policies. These statutes ensure transparency, fairness,
        and consistency in all university operations.
      </p>

      <div className="space-y-4">
        {/* Admission Statutes */}
        <div className="border border-none overflow-hidden shadow-sm">
          <div
            className="flex justify-between items-center bg-teal-700 p-3 sm:p-4 cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-[#005a50]"
            onClick={() => toggleSection("Code Volume Index")}
          >
            Code Volume Index
            <span
              className={`transform transition-transform duration-300 text-base sm:text-lg md:text-xl ${
                openSection === "Code Volume Index" ? "rotate-180" : "rotate-0"
              }`}
            >
              ▼
            </span>
          </div>
          {openSection === "Code Volume Index" && (
            <div className="p-4 sm:p-6 bg-white border-t border-[#e0f2f1] text-[#555]">
              <div className="space-y-4">
                <div>
                  <ul className="list-disc ml-5 sm:ml-6 space-y-1 text-sm sm:text-base">
                    <li>
                      <a
                        href={CodeVolumeIndex}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#007367] hover:underline break-words"
                      >
                        Code Volume INDEX (PDF)
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Academic Statutes */}
        <div className="border border-none overflow-hidden shadow-sm">
          <div
            className="flex justify-between items-center bg-teal-700 p-3 sm:p-4 cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-[#005a50]"
            onClick={() => toggleSection("Code Volume Cover Page")}
          >
            Code Volume Cover Page
            <span
              className={`transform transition-transform duration-300 text-base sm:text-lg md:text-xl ${
                openSection === "Code Volume Cover Page"
                  ? "rotate-180"
                  : "rotate-0"
              }`}
            >
              ▼
            </span>
          </div>
          {openSection === "Code Volume Cover Page" && (
            <div className="p-4 sm:p-6 bg-white border-t border-[#e0f2f1] text-[#555]">
              <div className="space-y-4">
                <div>
                  <ul className="list-disc ml-5 sm:ml-6 space-y-1 text-sm sm:text-base">
                    <li>
                      <a
                        href={CodeVolumeCover}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#007367] hover:underline break-words"
                      >
                        Code Volume Cover Page (PDF)
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Examination Statutes */}
        <div className="border border-none overflow-hidden shadow-sm">
          <div
            className="flex justify-between items-center bg-teal-700 p-3 sm:p-4 cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-[#005a50]"
            onClick={() => toggleSection("Code Volume Part - I")}
          >
            Code Volume Part - I
            <span
              className={`transform transition-transform duration-300 text-base sm:text-lg md:text-xl ${
                openSection === "Code Volume Part - I"
                  ? "rotate-180"
                  : "rotate-0"
              }`}
            >
              ▼
            </span>
          </div>
          {openSection === "Code Volume Part - I" && (
            <div className="p-4 sm:p-6 bg-white border-t border-[#e0f2f1] text-[#555]">
              <div className="space-y-4">
                <div>
                  <ul className="list-disc ml-5 sm:ml-6 space-y-1 text-sm sm:text-base">
                    <li>
                      <a
                        href={CodeVolumePartI}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#007367] hover:underline break-words"
                      >
                        Code Volume - Part I (PDF)
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Administrative Statutes */}
        <div className="border border-none overflow-hidden shadow-sm">
          <div
            className="flex justify-between items-center bg-teal-700 p-3 sm:p-4 cursor-pointer text-white font-semibold transition-colors duration-300 hover:bg-[#005a50]"
            onClick={() => toggleSection("Code Volume Part - II")}
          >
            Code Volume Part - II
            <span
              className={`transform transition-transform duration-300 text-base sm:text-lg md:text-xl ${
                openSection === "Code Volume Part - II"
                  ? "rotate-180"
                  : "rotate-0"
              }`}
            >
              ▼
            </span>
          </div>
          {openSection === "Code Volume Part - II" && (
            <div className="p-4 sm:p-6 bg-white border-t border-[#e0f2f1] text-[#555]">
              <div className="space-y-4">
                <div>
                  <ul className="list-disc ml-5 sm:ml-6 space-y-1 text-sm sm:text-base">
                    <li>
                      <a
                        href={CodeVolumePartII}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#007367] hover:underline break-words"
                      >
                        Code Volume - Part II (PDF)
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statutes;
