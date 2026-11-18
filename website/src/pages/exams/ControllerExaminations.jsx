import React from "react";
import { img_T_Hymavathi, lingaReddy } from "../../assets/index.js";
import { BackButton } from "../../components/BackButton.jsx";
const ControllerExaminations = () => {
  return (
    <div className="w-full px-4 sm:px-16 py-8">
      <BackButton />
      <h2 className="text-3xl font-bold text-left text-teal-800 mt-2">
         Examination Cell
      </h2>
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col md:flex-row mt-4 sm:mt-6">
          <div className="bg-teal-700 flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-4 md:pb-6 lg:pt-6 lg:pb-4 px-4 sm:px-6 md:px-6 lg:px-8 w-full md:w-1/3 lg:w-1/4 shadow">
            <div className="relative w-50 h-55 sm:w-36 sm:h-50 md:w-40 md:h-50 lg:w-50 lg:h-57 overflow-hidden border-2 sm:border-[3px] md:border-4 border-white shadow-md">
              <img
                src={img_T_Hymavathi}
                alt="Dr. T Hymavathi"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="text-white font-bold md:text-base lg:text-lg mt-2 text-center w-full px-2">
              Dr. T Hymavathi
            </div>
            <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
              Dean Examinations
            </div>
            <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
              dean.examinations@aknu.edu.in
            </div>
          </div>

          <div className="bg-[#f4e4c9] px-4 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-center py-4 sm:py-5 md:py-4 w-full md:w-2/3 lg:w-3/4 shadow">
            <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 text-center md:text-left">
              Dean of Examinations
            </h3>
            <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[#374151] text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] text-justify leading-5 sm:leading-6 md:leading-6">
              <p>
                The Dean of Examinations provides strategic leadership, administrative oversight, and direction to all examination services, policies, and systems at Adikavi Nannaya University. The Dean plays a vital role in formulating guidelines for continuous evaluation, implementing reforms in the assessment framework, and ensuring the timely declaration of results.
              </p>
              <p>
                Under her guidance, the university maintains high levels of transparency, integrity, and confidentiality in confidential printing, answer booklet evaluation, and merit processing. She works in close collaboration with the Controller of Examinations and heads of various institutions to establish a student-friendly, efficient, and robust examination system that aligns with UGC standards and state education regulations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row mt-4 sm:mt-6">
          <div className="bg-teal-700 flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-4 md:pb-6 lg:pt-6 lg:pb-4 px-4 sm:px-6 md:px-6 lg:px-8 w-full md:w-1/3 lg:w-1/4 shadow">
            <div className="relative w-50 h-55 sm:w-36 sm:h-50 md:w-40 md:h-50 lg:w-50 lg:h-57 overflow-hidden border-2 sm:border-[3px] md:border-4 border-white shadow-md">
              <img
                src={lingaReddy}
                alt="Sri. S Linga Reddy"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="text-white font-bold md:text-base lg:text-lg mt-2 text-center w-full px-2">
              Sri. S Linga Reddy
            </div>
            <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
              Controller of Examinations
            </div>
            <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
              +91 7093008479
            </div>
            <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
              ce@aknu.edu.in
            </div>
          </div>

          <div className="bg-[#f4e4c9] px-4 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-center py-4 sm:py-5 md:py-4 w-full md:w-2/3 lg:w-3/4 shadow">
            <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 text-center md:text-left">
              About Examination Cell
            </h3>
            <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[#374151] text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] text-justify leading-5 sm:leading-6 md:leading-6">
              <p>
                The Examination Cell of Adikavi Nannaya University functions as one of the most vital administrative and academic wings of the University. Operating under the supervision of the Controller of Examinations, the Cell is entrusted with the responsibility of conducting semester, annual, supplementary, and special examinations for University colleges and affiliated institutions. It ensures that all examination-related activities are carried out systematically, transparently, and in accordance with the academic regulations and ordinances prescribed by the University.
              </p>
              <p>
                The Cell undertakes a wide range of responsibilities that include preparation and publication of examination notifications and timetables, issue of hall tickets, coordination of valuation processes, declaration of results, and issuance of marks memoranda, provisional certificates, transcripts, and degree certificates. It also supervises confidential examination work such as question paper preparation, moderation, coding, and secure handling of examination materials. In addition, the Examination Cell processes applications related to revaluation, recounting, challenge valuation, and student grievances pertaining to examinations and results.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-bold text-teal-800 mb-4">
            Examinations Section Staff
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border border-[#ccc]">
              <thead className="bg-teal-700 text-white">
                <tr>
                  <th className="px-4 py-2">S.No</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Designation</th>
                  <th className="px-4 py-2">Contact</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[#ccc]">
                  <td className="px-4 py-2">1</td>
                  <td className="px-4 py-2">Mrs. B. Vijaya Kumari</td>
                  <td className="px-4 py-2">Asst. Registrar</td>
                  <td className="px-4 py-2">0883 - 2566013</td>
                </tr>
                <tr className="border-t border-[#ccc]">
                  <td className="px-4 py-2">2</td>
                  <td className="px-4 py-2">Mr. D Dasu</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    Asst.Professor, Dept of CSE
                    {/* <br /> */}
                    Faculty Associate
                    {/* <br /> */}
                    (Automation of Exam section)
                  </td>
                  <td className="px-4 py-2">--</td>
                </tr>
                <tr className="border-t border-[#ccc]">
                  <td className="px-4 py-2">3</td>
                  <td className="px-4 py-2">Mr A. Vijaya Durga</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    Asst.Professor Dept of ECE
                    {/* <br /> */}
                    Faculty Associate
                    {/* <br /> */}
                    (Automation of Exam section)
                  </td>
                  <td className="px-4 py-2">0883 - 2566030</td>
                </tr>
                <tr className="border-t border-[#ccc]">
                  <td className="px-4 py-2">4</td>
                  <td className="px-4 py-2">Mr. G Ashok</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    Asst.Professor Dept of Mathematics
                    {/* <br /> */}
                    Faculty Associate
                    {/* <br /> */}
                    (Automation of Exam section)
                  </td>
                  <td className="px-4 py-2">0883 - 2566030</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControllerExaminations;
