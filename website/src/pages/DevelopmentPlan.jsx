import React, { useState } from "react";
import { BackButton } from "../components/BackButton";
import { img_P_Suresh_Varma } from "../assets";

export default function DevelopmentPlan() {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const compositionMembers = [
    { sno: 1, name: "Prof. P. Suresh Varma, Dept. of CSE, UCOE", designation: "Director" },
    { sno: 2, name: "Prof. Y. Srinivasa Rao, Dept. of Geoscience, UCST", designation: "Member" },
    { sno: 3, name: "Prof. D. Jyothirmai, Dept. of English, UCAC", designation: "Member" },
    { sno: 4, name: "Prof. K. Ramaneswari, Dept. of Zoology, UCST", designation: "Member" },
    { sno: 5, name: "Prof. B. Jagan Mohan Reddy, Dept. of Chemistry, UCST", designation: "Member" },
    { sno: 6, name: "Dr. T. Hymavathi, Assoc. Prof, Dept. of Mathematics", designation: "Member" },
    { sno: 7, name: "Dr. S. Linga Reddy, Controller of Examinations", designation: "Member" },
    { sno: 8, name: "Sri. N. Nagendra Rao, Legal Officer", designation: "Member" },
  ];

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Header Section - No image as requested */}
      {/* <div className="bg-gradient-to-r from-teal-800 to-teal-900 py-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wider">
          University Development Plan
        </h1>
      </div> */}

      <div className="px-4 sm:px-16 pt-8">
        <BackButton />
      </div>

      {/* Profile Section (Inspired by EduDepartment.jsx) */}
      <div className="px-4 sm:px-16 mb-12">
        <h2 className="text-3xl font-bold text-teal-800 mb-6">Institutional Development Plan</h2>
        <div className="flex flex-col md:flex-row shadow-lg  overflow-hidden border border-gray-100">
          {/* Profile Card */}
          <div className="bg-teal-700 flex flex-col items-center justify-center p-6 w-full md:w-1/3 lg:w-1/4">
            <div className="relative w-40 h-48 overflow-hidden border-4 border-white shadow-md mb-4 bg-gray-200 flex items-center justify-center">
              <img src={img_P_Suresh_Varma} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="text-white font-bold text-lg text-center">
              Prof. P. Suresh Varma
            </div>
            <div className="font-bold text-md text-white text-center mt-1">
              Director
            </div>
            <div className="text-teal-100 text-sm text-center mt-2 italic">
              {/* contact@aknu.edu.in */}
            </div>
          </div>

          {/* About Section */}
          <div className="bg-[#f4e4c9] p-8 flex flex-col justify-center w-full md:w-2/3 lg:w-3/4">
            <h3 className="text-2xl font-bold text-teal-800 mb-4">About Institutional Development Plan</h3>
            <div className="text-gray-700 leading-relaxed text-justify space-y-4">
              <p className="text-justify">
                The Institutional Development Plan (IDP) of Adikavi Nannaya University serves as a strategic framework for the systematic growth and long-term advancement of the university. The plan is designed to strengthen academic excellence, research innovation, administrative efficiency, infrastructure development, and community engagement in alignment with national higher education policies and emerging global standards.
The Institutional Development Plan focuses on enhancing the quality of teaching and learning through curriculum modernization, outcome-based education, digital learning resources, faculty development programmes, and student-centred pedagogical practices. It also emphasizes the promotion of interdisciplinary research, consultancy activities, innovation ecosystems, and collaborations with academic institutions, industries, and research organizations.The plan aims to improve institutional infrastructure by expanding laboratories, libraries, smart classrooms, research facilities, hostels, sports amenities, and green campus initiatives. Special attention is given to the integration of information and communication technology in governance, academics, and student services to ensure transparency, efficiency, and accessibility.
The IDP also prioritizes inclusive education, skill development, employability enhancement, women empowerment, environmental sustainability, social outreach, and support for marginalized sections of society. Through continuous quality assessment and strategic planning, the university seeks to strengthen its academic reputation, accreditation standards, and contribution to regional and national development. The Institutional Development Plan reflects the university’s commitment to holistic growth, academic innovation, and the creation of a dynamic and inclusive learning environment.
              </p>
             
            </div>
          </div>
        </div>
      </div>

      {/* Composition Accordion Section */}
      <div className="px-4 sm:px-16 pb-20">
        <div className="border border-gray-200 overflow-hidden shadow-sm">
          <button
            className="w-full text-left py-3 px-4 bg-teal-700 text-white font-semibold text-lg flex justify-between items-center"
            onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            type="button"
          >
            Composition
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
                    <th className="px-6 py-2 text-left font-semibold border border-teal-600 w-20">S.No.</th>
                    <th className="px-6 py-2 text-left font-semibold border border-teal-600">Name of the Member</th>
                    <th className="px-6 py-2 text-left font-semibold border border-teal-600">Designation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {compositionMembers.map((member) => (
                    <tr key={member.sno} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-2 border border-gray-200 font-medium text-gray-700 text-center">
                        {member.sno}
                      </td>
                      <td className="px-6 py-2 border border-gray-200 text-gray-700">
                        {member.name}
                      </td>
                      <td className="px-6 py-2 border border-gray-200 text-gray-700">
                        {member.designation}
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
