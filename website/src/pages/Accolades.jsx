import React, { useState } from "react";
import { BackButton } from "../components/BackButton";
import { accolades } from "../assets";

export default function Accolades() {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const accoladesData = [
    { year: "2025", event: "Yogandhra 2025 – International Yoga Day Celebrations", award: "Telugu Book of Records Recognition" },
    { year: "2025", event: "Yogandhra 2025 – Mass Yoga Participation Event", award: "Miracles World Records Recognition" },
    { year: "2026", event: "Institutional Excellence and Governance Standards", award: "Five-Star Quality Rating Certificate" },
    { year: "2026", event: "150 Years of Vande Mataram Celebrations", award: "Telugu Book of Records Recognition" },
  ];

  return (
    <div className="px-4 sm:px-16 py-8">
      {/* <div className="px-4 sm:px-16 pt-8"> */}
        <BackButton />
      {/* </div> */}

      <div className="">
        <h2 className="text-3xl font-bold text-teal-800 mb-6">Accolades & Recognitions</h2>
        
        <div className="mb-10">
          <div className="text-gray-700 leading-relaxed text-justify space-y-4 mb-6">
            <p>
              Adikavi Nannaya University has earned recognition for its commitment to academic excellence, research advancement, quality education, and holistic institutional development. The university has received several accolades, appreciations, and certifications from academic bodies and professional organizations for its contributions to higher education and community engagement.
            </p>
            <p>
              The certificates and recognitions secured by the university reflect its dedication to institutional growth, accreditation standards, environmental awareness, sports and cultural achievements, and promotion of inclusive education. Through sustained efforts toward academic quality and social responsibility, the university continues to strengthen its reputation as an emerging centre of higher learning.
            </p>
          </div>

          {/* <div className="flex items-center gap-2 text-teal-700 font-semibold hover:text-teal-900 transition-colors">
            <a 
              href={accolades} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-teal-700 rounded-md px-4 py-2 hover:bg-teal-50"
            >
              View Document / Certificate
            </a>
          </div> */}
        </div>

        {/* Achievements Accordion Section */}
        {/* <div className=""> */}
          <div className="border border-gray-200 overflow-hidden shadow-sm">
            <button
              className="w-full text-left py-3 px-4 bg-teal-700 text-white font-semibold text-lg flex justify-between items-center"
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              type="button"
            >
              Major Achievements & Records
              <span
                className={`transform transition-transform duration-300 ${
                  isAccordionOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                ▼
              </span>
            </button>
            
            {isAccordionOpen && (
              <div className="p-6 bg-white overflow-x-auto transition-all duration-300">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-teal-700 text-white">
                      <th className="px-6 py-2 text-left font-semibold border border-teal-600 w-24">Year</th>
                      <th className="px-6 py-2 text-left font-semibold border border-teal-600">Event / Achievement</th>
                      <th className="px-6 py-2 text-left font-semibold border border-teal-600">Award / Recognition / Record</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {accoladesData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors text-sm md:text-base">
                        <td className="px-6 py-2 border border-gray-200 font-medium text-gray-700 text-center">
                          {item.year}
                        </td>
                        <td className="px-6 py-2 border border-gray-200 text-gray-700">
                          {item.event}
                        </td>
                        <td className="px-6 py-2 border border-gray-200 text-gray-700">
                          {item.award}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
      </div>
    </div>
  );
}
