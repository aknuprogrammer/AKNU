import React from "react";
import { BackButton } from "../components/BackButton";

export default function GrievanceRedressalCell() {
  return (
    <div className="w-full min-h-screen bg-white">
      <div className="px-4 sm:px-16 pt-8">
        <BackButton />
      </div>

      <div className="px-4 sm:px-16">
        <h2 className="text-3xl font-bold text-teal-800 mb-6  tracking-wide">
          Grievance Redressal Cell
        </h2>
        
        <div className="mb-10">
          <div className="text-gray-700 leading-relaxed text-justify space-y-6">
            <p>
              The Grievance Redressal Cell of Adikavi Nannaya University has been established to address and resolve the grievances and concerns of students, faculty members, and non-teaching staff in a fair, transparent, and timely manner. The Cell functions as an institutional mechanism to promote accountability, harmony, and a supportive academic environment within the university.
            </p>
            <p>
              The primary objective of the Cell is to provide an accessible platform for individuals to present complaints or grievances related to academic matters, administration, examinations, facilities, student services, workplace issues, or other institutional concerns. The Cell ensures that complaints are examined with impartiality, confidentiality, and sensitivity in accordance with university regulations and established procedures.
            </p>
            <p>
              The Grievance Redressal Cell works to safeguard the rights and welfare of all stakeholders while promoting mutual respect, discipline, and ethical conduct across the campus. It also seeks to prevent discrimination, harassment, unfair practices, and administrative irregularities by encouraging constructive dialogue and appropriate corrective measures.
            </p>
            <p>
              In addition to grievance resolution, the Cell creates awareness regarding institutional policies, student rights, responsibilities, and grievance procedures through meetings, counselling, and awareness programmes. Through its effective functioning, the Cell contributes to maintaining a healthy academic atmosphere and strengthening trust between the university administration and the university community.
            </p>
          </div>
        </div>

        <div className="mb-20">
          <h3 className="text-xl font-bold text-teal-800 mb-4">
            Institutional Grievance Redressal Committee (IGRC)
          </h3>
          <ul className="space-y-3 text-gray-700 ml-4">
            <li className="flex items-start">
              <span className="font-semibold mr-2 text-gray-800">a.</span>
              <span>Vice-Chancellor – Chairperson</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2 text-gray-800">b.</span>
              <span>Dean of Student Affairs</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2 text-gray-800">c.</span>
              <span>Two Senior academicians</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
