import React, { useState } from "react";
import { sreeramesh15, admissions_office, uma10, doaimg, doa } from "../assets";
import { BackButton } from "../components/BackButton";
import { AiOutlineFilePdf } from "react-icons/ai";

const admissionData = [
  {
    name: "Directorate of Admissions",
    profile: {
      img: uma10,
      name: "Prof. P Uma Maheswari Devi",
      designation: "Director, Directorate of Admissions",
      email: "director.doa@aknu.edu.in",
      phone: "7093008477",
    },
    about: "The Directorate of Admissions of Adikavi Nannaya University functions as the central body responsible for coordinating and administering admissions into various undergraduate, postgraduate, integrated, diploma, and research programmes offered by the university and its affiliated colleges. The Directorate oversees the entire admission process, including the release of notifications, application procedures, entrance examinations, counselling schedules, seat allotment, verification of certificates, and admission guidelines in accordance with the policies of the Government of Andhra Pradesh and the University Grants Commission (UGC).",
    faculty: [
      {
        sno: 1,
        name: "Prof. P Uma Maheswari Devi",
        designation: "Director",
        contact: "7093008477",
        email: "director.doa@aknu.edu.in",
        img: uma10,
      },
    ],
  },
];

function InnerDropdown({ title, isOpen, onClick, children }) {
  return (
    <div className="w-full my-2">
      <button
        className="w-full text-left py-3 px-4 bg-[#f5f5f5] border border-[#ddd] text-teal-700 font-semibold text-base flex justify-between items-center"
        onClick={onClick}
        type="button"
      >
        {title}
        <span className="text-base sm:text-lg md:text-xl font-bold">
          {isOpen ? "−" : "+"}
        </span>
      </button>
      {isOpen && (
        <div className="p-4 border border-t-0 border-[#ddd] bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

const DirectorateOfAdmissions = () => {
  const [openDept, setOpenDept] = useState(0);
  const [innerOpen, setInnerOpen] = useState({ 0: 0 });
  const [openProfile, setOpenProfile] = useState(null);

  const handleInnerDropdown = (deptIdx, sectionIdx) => {
    setInnerOpen((prev) => ({
      ...prev,
      [deptIdx]: prev[deptIdx] === sectionIdx ? null : sectionIdx,
    }));
  };

  const handleProfileClick = (faculty) => {
    setOpenProfile(faculty);
  };

  const handleCloseProfile = () => {
    setOpenProfile(null);
  };

  return (
    <div className="pb-12">
      {/* Hero Image */}
      <div className="relative w-full h-56 sm:h-72 md:h-96">
        <img
          src={doaimg}
          alt="Directorate of Admissions"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Back Button */}
      <div className="px-4 sm:px-16 py-4">
        <BackButton />
      </div>

      {/* About Section */}
      <div className="px-4 sm:px-16 text-teal-700 text-left">
        <h2 className="text-3xl sm:text-3xl font-bold text-teal-800 mb-6">
          About Directorate of Admissions
        </h2>
        <p className="text-[#303630] mt-4 text-justify text-[16px]">
          The Directorate of Admissions of Adikavi Nannaya University functions as the central body responsible for coordinating and administering admissions into various undergraduate, postgraduate, integrated, diploma, and research programmes offered by the university and its affiliated colleges. 
          The Directorate oversees the entire admission process, including the release of notifications, application procedures, entrance examinations, counselling schedules, seat allotment, verification of certificates, and admission guidelines in accordance with the policies of the Government of Andhra Pradesh and the University Grants Commission (UGC).
        </p>
        <p className="text-[#303630] mt-4 text-justify text-[16px]">
          The Directorate aims to ensure transparency, efficiency, and accessibility in admissions while facilitating equal opportunities for students from diverse academic and social backgrounds. It also provides guidance and support to applicants regarding eligibility criteria, reservation policies, fee structures, and academic regulations. In addition to admission administration, the Directorate coordinates with academic departments, affiliated colleges, examination branches, and student support services to streamline the enrolment process and maintain academic standards across programmes.
        </p>
      </div>

      {/* Director Profile */}
      <h2 className="text-3xl sm:text-3xl font-bold text-teal-800 px-4 sm:px-16 text-left mb-6 mt-8">
        Director
      </h2>
      <div className="flex flex-col md:flex-row mt-4 sm:mt-6 px-4 sm:px-16">
        <div className="bg-teal-700 flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-4 md:pb-6 lg:pt-6 lg:pb-4 px-4 sm:px-6 md:px-6 lg:px-8 w-full md:w-1/3 lg:w-1/4 shadow">
          <div className="relative w-50 h-55 sm:w-36 sm:h-50 md:w-40 md:h-50 lg:w-50 lg:h-57 overflow-hidden border-2 sm:border-[3px] md:border-4 border-white shadow-md">
            <img
              src={uma10}
              alt="Prof. P Uma Maheswari Devi"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="text-white font-bold md:text-base lg:text-lg mt-2 text-center w-full px-2">
            Prof. P Uma Maheswari Devi
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
            Director, Directorate of Admissions
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
            7093008477
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
            director.doa@aknu.edu.in
          </div>
        </div>

        <div className="bg-[#f4e4c9] px-4 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-center py-4 sm:py-5 md:py-4 w-full md:w-2/3 lg:w-3/4 shadow">
          <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 text-center md:text-left">
            About Director
          </h3>
          <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[#374151] text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] text-justify leading-5 sm:leading-6 md:leading-6">
            <p>
              Prof. P Uma Maheswari Devi is a distinguished academician and administrator serving as the Director of the Directorate of Admissions at Adikavi Nannaya University. 
            </p>
            <p>
              Under her leadership, the Directorate ensures a seamless and transparent admission process for thousands of students each year. She is committed to upholding the academic standards of the university while ensuring that the admission policies are inclusive and accessible to all sections of society.
            </p>
          </div>
        </div>
      </div>

       <div className="w-full flex flex-wrap gap-6 justify-center my-10 px-4 sm:px-6 md:px-8">
        <a
          href={doa}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-72 rounded-xl shadow-lg bg-white transition-colors duration-200 p-6 text-teal-700 text-center cursor-pointer group"
          style={{ textDecoration: "none" }}
        >
          <div className="text-3xl mb-2">📘</div>
          <div className="text-xl font-bold mb-1">Information Brochure</div>
          <div className="text-sm mb-4 opacity-80">
            Download the latest admission information brochure.
          </div>
          <div className="inline-block px-4 py-2 rounded bg-white text-teal-700 font-semibold group-hover:bg-teal-50 transition">
            View Brochure
          </div>
        </a>
      </div>

      {/* Composition Section */}
      <div className="px-4 sm:px-16 mt-10">
        <h3 className="text-2xl font-bold mb-4 text-teal-700">
          Composition
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border border-[#ccc]">
            <thead className="bg-teal-700 text-white">
              <tr>
                <th className="px-4 py-2">S.No</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Position</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[#ccc]">
                <td className="px-4 py-2">1</td>
                <td className="px-4 py-2">Prof. P. Uma Maheswari</td>
                <td className="px-4 py-2">Director</td>
              </tr>
              <tr className="border-t border-[#ccc]">
                <td className="px-4 py-2">2</td>
                <td className="px-4 py-2">Dr. Sajna Raj N</td>
                <td className="px-4 py-2">Associate Director</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Accordion Section */}
      {/* <h2 className="text-3xl sm:text-3xl font-bold text-teal-800 px-4 sm:px-16 text-left mb-6 mt-10">
        Departments
      </h2>
      <div className="px-4 sm:px-16">
        {admissionData.map((dept, idx) => (
          <div key={dept.name} className="mb-4 border border-[#ddd] shadow-sm">
            <button
              className="w-full text-left py-3 px-4 bg-teal-700 text-white font-semibold text-lg flex justify-between items-center"
              onClick={() => setOpenDept(openDept === idx ? null : idx)}
            >
              {dept.name}
              <span
                className={`transform transition-transform duration-300 ${
                  openDept === idx ? "rotate-180" : "rotate-0"
                }`}
              >
                ▼
              </span>
            </button>

            {openDept === idx && (
              <div className="flex flex-col w-full">
                <div className="w-full bg-white">
                  {["Admission Team"].map((section, i) => (
                    <InnerDropdown
                      key={section}
                      title={section}
                      isOpen={innerOpen[idx] === i}
                      onClick={() => handleInnerDropdown(idx, i)}
                    >
                      {section === "Admission Team" && (
                        <div className="overflow-x-auto mt-4">
                          <table className="min-w-full text-left border border-[#ccc]">
                            <thead className="bg-teal-700 text-white">
                              <tr>
                                <th className="px-4 py-2">S.No</th>
                                <th className="px-4 py-2">Staff Member</th>
                                <th className="px-4 py-2">Designation</th>
                                <th className="px-4 py-2">Contact</th>
                                <th className="px-4 py-2">Image</th>
                                <th className="px-4 py-2">Profile</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dept.faculty.map((f, fi) => (
                                <tr
                                  key={fi}
                                  className="border-t border-[#ccc]"
                                >
                                  <td className="px-4 py-2">{fi + 1}</td>
                                  <td className="px-4 py-2">{f.name}</td>
                                  <td className="px-4 py-2">{f.designation}</td>
                                  <td className="px-4 py-2">{f.contact}</td>
                                  <td className="px-4 py-2">
                                    {f.img ? (
                                      <img
                                        src={f.img}
                                        alt={f.name}
                                        className="w-16 h-16 object-cover rounded shadow-sm border border-gray-100"
                                      />
                                    ) : (
                                      <div className="w-16 h-16 bg-gray-300 rounded flex items-center justify-center text-gray-500 text-sm">
                                        No Image
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-2">
                                    <button
                                      className="text-blue-600 underline hover:text-blue-800"
                                      onClick={() => handleProfileClick(f)}
                                      type="button"
                                    >
                                      Profile
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </InnerDropdown>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div> */}

      {/* Brochure Section */}
     

      {/* Modal for faculty profile */}
      {openProfile && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-white/30 backdrop-blur-md transition-all duration-200"
            onClick={handleCloseProfile}
          />
          <div className="relative bg-white rounded-lg shadow-lg p-8 w-[700px] mx-auto z-10 flex flex-col items-center max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-3xl font-bold"
              onClick={handleCloseProfile}
              aria-label="Close"
              type="button"
            >
              ×
            </button>
            <div className="text-3xl font-bold text-teal-800 mb-4">Profile</div>
            <img
              src={openProfile.img}
              alt={openProfile.name}
              className="w-32 h-32 object-cover rounded-full border-4 border-teal-700 mb-4"
            />
            <div className="text-lg font-bold text-teal-700 mb-1">
              {openProfile.name}
            </div>
            <div className="text-base text-gray-700 mb-1">
              {openProfile.designation}
            </div>
            <div className="text-base text-gray-700 mb-1">
              {openProfile.email}
            </div>

            {openProfile.qualifications &&
              Array.isArray(openProfile.qualifications) && (
                <div className="w-full mt-3 mb-2">
                  <div className="font-semibold text-teal-700 mb-1">
                    Qualifications
                  </div>
                  <table className="min-w-full text-left border border-[#ccc] mb-2">
                    <thead className="bg-[#f5f5f5]">
                      <tr>
                        <th className="px-3 py-1 border">Degree</th>
                        <th className="px-3 py-1 border">Specialization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openProfile.qualifications.map((q, i) => (
                        <tr key={i}>
                          <td className="px-3 py-1 border">{q.label}</td>
                          <td className="px-3 py-1 border">{q.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            {openProfile.experience && (
              <div className="w-full mb-2">
                <div className="font-semibold text-teal-700">Experience</div>
                <div className="text-gray-700 text-sm mb-1">
                  {openProfile.experience}
                </div>
              </div>
            )}

            {openProfile.publications && (
              <div className="w-full mb-2">
                <div className="font-semibold text-teal-700">
                  Publications & Projects
                </div>
                <div className="text-gray-700 text-sm mb-1">
                  {openProfile.publications}
                </div>
              </div>
            )}

            {openProfile.brief && Array.isArray(openProfile.brief) && (
              <div className="w-full mb-2">
                <div className="font-semibold text-teal-700">Brief</div>
                <ul className="list-disc pl-5 text-gray-700 text-sm">
                  {openProfile.brief.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectorateOfAdmissions;
