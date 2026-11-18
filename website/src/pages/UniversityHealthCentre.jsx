import React, { useState } from "react";
import { healthcare, health1, health2, health_centre_building } from "../assets";
import { BackButton } from "../components/BackButton";
import { AiOutlineFilePdf } from "react-icons/ai";

const healthCentreData = [
  {
    name: "University Health Centre",
    profile: {
      img: healthcare,
      name: "Dr. M. Ramakrishna",
      designation: "Medical Officer",
      email: "healthcentre@aknu.edu.in",
      // phone: "+91 ",
    },
    about: "The Health Centre at Adikavi Nannaya University was established on 14 April, 2015 with the support of Sri Sunkara Venkateswara Rao. The centre provides primary healthcare, first aid, and emergency medical services to students, faculty, and staff on campus. The Health Centre is equipped with two special rooms, one doctor’s room, and one outpatient (OP) room to facilitate medical consultations and emergency care. It offers basic outpatient services, first aid, routine health check-ups, and emergency triage for immediate medical attention. The centre is staffed by a full-time a nurse to attend to regular health concerns and unforeseen medical contingencies. Dr. M. Ramakrishna serves as the on-call doctor for additional medical support whenever required. The Health Centre is also equipped to handle immediate on-campus emergencies and arrange rapid transportation to advanced hospitals for specialized treatment when necessary. In addition, homeopathy services are provided every Tuesday from 10:00 AM to 5:00 PM.",
    faculty: [
      {
        sno: 1,
        name: "Mrs. R. Kalpana",
        designation: "Staff Nurse",
        contact: "7981853061",
        email: "--",
        img: health2,
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

const UniversityHealthCentre = () => {
  const [openDept, setOpenDept] = useState(1); // Default open first dept
  const [innerOpen, setInnerOpen] = useState({ 0: 1 }); // Default open faculty in first dept
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
          src={health1}
          alt="University Health Centre"
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
          About University Health Centre
        </h2>
        <p className="text-[#303630] mt-4 text-justify text-[16px]">
          The Health Centre at Adikavi Nannaya University was established on 14 April, 2015 with the support of Sri Sunkara Venkateswara Rao. The centre provides primary healthcare, first aid, and emergency medical services to students, faculty, and staff on campus.
          The Health Centre is equipped with two special rooms, one doctor’s room, and one outpatient (OP) room to facilitate medical consultations and emergency care. It offers basic outpatient services, first aid, routine health check-ups, and emergency triage for immediate medical attention.
          The centre is staffed by a full-time a nurse to attend to regular health concerns and unforeseen medical contingencies. Dr. M. Ramakrishna serves as the on-call doctor for additional medical support whenever required.
        </p>
        <p className="text-[#303630] mt-4 text-justify text-[16px]">
          The Health Centre is also equipped to handle immediate on-campus emergencies and arrange rapid transportation to advanced hospitals for specialized treatment when necessary. In addition, homeopathy services are provided every Tuesday from 10:00 AM to 5:00 PM.
        </p>
      </div>

      {/* Medical Officer Profile */}
      <h2 className="text-3xl sm:text-3xl font-bold text-teal-800 px-4 sm:px-16 text-left mb-6 mt-8">
        Medical Officer
      </h2>
      <div className="flex flex-col md:flex-row mt-4 sm:mt-6 px-4 sm:px-16">
        <div className="bg-teal-700 flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-4 md:pb-6 lg:pt-6 lg:pb-4 px-4 sm:px-6 md:px-6 lg:px-8 w-full md:w-1/3 lg:w-1/4 shadow">
          <div className="relative w-50 h-55 sm:w-36 sm:h-50 md:w-40 md:h-50 lg:w-50 lg:h-57 overflow-hidden border-2 sm:border-[3px] md:border-4 border-white shadow-md">
            <img
              src={healthcare}
              alt="Dr. M. Ramakrishna"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="text-white font-bold md:text-base lg:text-lg mt-2 text-center w-full px-2">
            Dr. M. Ramakrishna
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
            Medical Officer
          </div>
          {/* <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
            +91 
          </div> */}
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
            healthcentre@aknu.edu.in
          </div>
        </div>

        <div className="bg-[#f4e4c9] px-4 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-center py-4 sm:py-5 md:py-4 w-full md:w-2/3 lg:w-3/4 shadow">
          <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 text-center md:text-left">
            About Medical Officer
          </h3>
          <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[#374151] text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] text-justify leading-5 sm:leading-6 md:leading-6">
            <p>
              Dr. M. Ramakrishna is a dedicated medical professional serving as the Medical Officer at Adikavi Nannaya University. He is responsible for overseeing the primary healthcare services provided at the University Health Centre.
            </p>
            <p>
              With his expertise, he ensures that students, faculty, and staff receive timely medical attention and care. He also manages emergency triage and coordinates with advanced medical facilities for specialized treatments when required.
            </p>
          </div>
        </div>
      </div>

      {/* Departments Accordion Section */}
      <h2 className="text-3xl sm:text-3xl font-bold text-teal-800 px-4 sm:px-16 text-left mb-6 mt-10">
        Departments
      </h2>
      <div className="px-4 sm:px-16">
        {healthCentreData.map((dept, idx) => (
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
                {/* Optional: Inner about section if needed, matching EduDepartment */}
                {/* <div className="flex flex-col md:flex-row">
                  <div className="px-4 py-6 w-full shadow-inner bg-gray-50">
                    <h3 className="text-lg font-bold text-teal-800 mb-2">About Department</h3>
                    <p className="text-sm text-gray-700">{dept.about}</p>
                  </div>
                </div> */}

                <div className="w-full bg-white">
                  {["Health Care Team"].map((section, i) => (
                    <InnerDropdown
                      key={section}
                      title={section}
                      isOpen={innerOpen[idx] === i}
                      onClick={() => handleInnerDropdown(idx, i)}
                    >
                      {section === "Health Care Team" && (
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
      </div>

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

export default UniversityHealthCentre;

