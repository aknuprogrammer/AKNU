import React, { useEffect, useState } from "react";

import { artsANDScience, jyothirmai, jyothirmainew } from "../assets";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AiOutlineFilePdf } from "react-icons/ai";
import { subDepartsWithFullData } from "../siteData/departmentsData";
import { BackButton } from "../components/BackButton";
import DepartmentSeminars from "../components/DepartmentSeminars.jsx";

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

export default function CACDepartment() {
  const navigate = useNavigate();

  const [openDept, setOpenDept] = useState(null);
  const [innerOpen, setInnerOpen] = useState({});
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
  useEffect(() => {
    if (openProfile) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Clean up when component unmounts
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [openProfile]);

  return (
    <div>
      <div className="relative w-full h-56 sm:h-72 md:h-96 overflow-hidden">
        <img
          src={artsANDScience}
          alt="Arts College"
          className="object-cover w-full h-full"
        />

        {/* <div className="absolute top-0 left-0 w-full h-full bg-opacity-50 flex items-center justify-center">
          <blockquote className="text-white text-xl md:text-3xl lg:text-3xl font-semibold text-center max-w-3xl px-4">
            "Education is the passport to the future, for tomorrow belongs to
            those who prepare for it today."
          </blockquote>
        </div> */}
      </div>

      {/* Polinaidu: 2/11/205:   
      Fixed the back button functionality when the page opened in a new tab
  */}
      <div className="px-4 sm:px-16 py-4">
        {/* <button
          onClick={() => navigate(-1)}
          className="flex items-center text-teal-700 hover:text-[#005f53] font-semibold text-base mb-2"
        > */}
        {/* <ChevronLeft className="w-5 h-5 mr-1" /> Or replace with ← */}
        {/* </button> */}

        {/* Polinaidu: 2/11/2025
            Replaced the back text with with BackButton component to make it work even when the page is opened in new tab
          */}

        <BackButton />
      </div>

      <div className="px-4 sm:px-16 text-teal-700 text-left">
        <h2 className="text-3xl sm:text-3xl font-bold text-teal-800 sm:mb-4">
          About the College of Arts and Commerce
        </h2>
        <p className="text-[#303630] text-justify text-[16px]">
      An integrated college of Arts, Science and Commerce was established in 2006. Later the University
College of Arts & Commerce was carved out of the same in the year 2012. The College has 6
departments organizing 08 PG programs covering disciplines like Management Studies, Humanities,
social and Behavioural Sciences. Further the college has been offering PG diploma in Kuchipudi,
Functional English, PG Diploma in Fine Arts – Music/Painting/Theatre Arts, PG Diploma in Tourism
& Hospitality, PG Diploma in Management(PGDM), PG Diploma in Hospital Management, PG
Diploma in Gandhian Ideology, PG Diploma in International Trade Program, Certificate Course in
Functional English, Certificate Course in International Economy & Finance & Certificate Course in
Foreign Languages (Japanese, French, German) many faculty members of the Arts and Commerce
College have made significant academic contributions both at the National and International levels.
The University College of Arts and Commerce is committed to foster creativity, critical thinking, and
leadership among its students. Since its establishment, the college has grown into a vibrant centre for
academic excellence in the fields of arts, humanities, management studies, social and behavioural
sciences. With a diverse range of programs and a dedicated faculty, the college provides a dynamic
learning environment that encourages intellectual exploration and personal growth.
Through innovative teaching methods, industry collaborations, and a focus on holistic development,
students are equipped with the knowledge and skills needed to excel in their chosen careers. The college
actively promotes cultural, academic, and professional opportunities, ensuring that graduates are wellprepared to contribute meaningfully to the society and global community.
        </p>
      </div>
      <h2 className="text-3xl sm:text-3xl font-bold text-teal-800 px-4 sm:px-16 text-left mb-6 mt-8">
        Principal
      </h2>
      <div className="flex flex-col md:flex-row mt-4 sm:mt-6 px-4 sm:px-16">
        <div className="bg-teal-700 flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-4 md:pb-6 lg:pt-6 lg:pb-4 px-4 sm:px-6 md:px-6 lg:px-8 w-full md:w-1/3 lg:w-1/4 shadow">
          <div className="relative w-50 h-55 sm:w-36 sm:h-50 md:w-40 md:h-50 lg:w-50 lg:h-57 overflow-hidden border-2 sm:border-[3px] md:border-4 border-white shadow-md">
            <img
              src={jyothirmai}
              alt="Prof. D Jyothirmai"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="text-white font-bold md:text-base lg:text-lg mt-2 text-center w-full px-2">
            Prof. Dakkumalla. Jyothirmai
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
            Principal(I/C)
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
            jyothirmaiaknu@aknu.edu.in
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
            +91 9440787333
          </div>
        </div>

        <div className="bg-[#f4e4c9] px-4 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-center py-4 sm:py-5 md:py-4 w-full md:w-2/3 lg:w-3/4 shadow">
          <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 text-center md:text-left">
            About the Principal
          </h3>
          <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[#374151] text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] text-justify leading-5 sm:leading-6 md:leading-6">
            <p>
              Dr. D. Jyothirmai, is a Professor of English with an overall teaching experience of 26 years at
intermediate, graduate and post graduate levels. Besides her academic experience she covered in various
administrative positions as Coordinator, University Library, AKNU; Assistant Dean o/o Dean,
Academic Affairs, AKNU; Director, Directorate of Admissions AKNU; Head, Dept. of English,
UCAC, AKNU and Chief Warden, Halls of Residence for Women, AKNU.
            </p>
        
          </div>
        </div>
      </div>

      <h2 className="text-3xl sm:text-3xl font-bold text-teal-800 px-4 sm:px-16 text-left mb-6 mt-10">
        Departments
      </h2>

      <div className="px-4 sm:px-16">
        {subDepartsWithFullData.map((dept, idx) => (
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
                <div className="flex flex-col md:flex-row">
                  <div className="bg-teal-700 flex flex-col items-center pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-4 md:pb-6 lg:pt-6 lg:pb-4 px-4 sm:px-6 md:px-6 lg:px-8 w-full md:w-1/3 lg:w-1/4 shadow">
                    <div className="relative w-50 h-55 sm:w-36 sm:h-50 md:w-40 md:h-50 lg:w-50 lg:h-57 overflow-hidden border-2 sm:border-[3px] md:border-4 border-white shadow-md">
                      <img
                        src={dept.profile.img}
                        alt={dept.profile.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="text-white font-bold md:text-base lg:text-lg mt-2 text-center w-full px-2">
                      {dept.profile.name}
                    </div>
                    <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
                      {dept.profile.designation}
                    </div>
                    <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
                      {dept.profile.phone}
                    </div>
                    <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
                      {dept.profile.email}
                    </div>
                  </div>

                  <div className="px-4 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-center py-4 sm:py-5 md:py-4 w-full md:w-2/3 lg:w-3/4 shadow">
                    <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 text-center md:text-left">
                      About Department
                    </h3>
                    <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[#374151] text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] text-justify leading-5 sm:leading-6 md:leading-6">
                      {typeof dept.about === "string" ? (
                        <>
                          <p>{dept.about}</p>
                          {dept.about.length < 500 && (
                            <p>
                              The department continues to strive for excellence
                              in teaching, research, and community engagement.
                              Through innovative pedagogical approaches,
                              collaborative research initiatives, and strong
                              industry partnerships, the department aims to
                              produce well-rounded graduates who are equipped to
                              meet the challenges of the modern world and
                              contribute meaningfully to society.
                            </p>
                          )}
                        </>
                      ) : (
                        dept.about
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full bg-white">
                  {[
                    ...(dept?.programsOffered?.length
                      ? ["Programs Offered"]
                      : []),
                    // "Vision",
                    // "Mission",
                    "Faculty",
                    ...(dept?.researchProjects ? ["Research Projects"] : []),
                    "Seminars/Workshops / Conference",
                  ].map((section, i) => (
                    <InnerDropdown
                      key={section}
                      title={section}
                      isOpen={innerOpen[idx] === i}
                      onClick={() => handleInnerDropdown(idx, i)}
                    >
                      {section === "Programs Offered" ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-left border border-[#ccc]">
                            <thead>
                              <tr className="bg-teal-700 text-white">
                                <th className="px-4 py-2">S.No</th>
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Syllabus</th>
                                <th className="px-4 py-2">Intake</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dept?.programsOffered?.map((p_ele, idx) => (
                                <tr key={idx} className="border border-[#ccc]">
                                  <td className="px-4 py-2">{p_ele.sno}</td>
                                  <td className="px-4 py-2 whitespace-nowrap">
                                    {p_ele?.name}
                                  </td>
                                  <td className="px-4 py-2 text-teal-800 pl-[20px]">
                                    {" "}
                                    {p_ele?.syllabus ? (
                                      p_ele?.syllabus?.title ? (
                                        <a
                                          href={p_ele?.syllabus?.link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {p_ele?.syllabus?.title}
                                        </a>
                                      ) : (
                                        <a
                                          href={p_ele.syllabus}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <AiOutlineFilePdf size={30} />
                                        </a>
                                      )
                                    ) : (
                                      "--"
                                    )}
                                  </td>
                                  <td className="px-4 py-2">{p_ele.intake}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                      {/* {section === "Vision" && <div>{dept.vision}</div>}
                      {section === "Mission" && (
                        <ul className="list-disc pl-2">
                          {dept.mission.map((m, mi) => (
                            <li key={mi}>{m}</li>
                          ))}
                        </ul>
                      )} */}
                      {section === "Faculty" && (
                        <div className="overflow-x-auto mt-4">
                          <table className="min-w-full text-left border border-[#ccc]">
                            <thead className="bg-teal-700 text-white">
                              <tr>
                                <th className="px-4 py-2">S.No</th>
                                <th className="px-4 py-2">Staff Member</th>
                                <th className="px-4 py-2">Designation</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">Image</th>
                                <th className="px-4 py-2">Profile</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dept.faculty.map((f, fi) => (
                                <tr
                                  key={f.email || f.name}
                                  className="border-t border-[#ccc]"
                                >
                                  <td className="px-4 py-2">{fi + 1}</td>
                                  <td className="px-4 py-2">{f.name}</td>
                                  <td className="px-4 py-2">{f.designation}</td>
                                  <td className="px-4 py-2">{f.email}</td>
                                  <td className="px-4 py-2">
                                    {f.img ? (
                                      <img
                                        src={f.img}
                                        alt={f.name}
                                        className="w-16 h-16 object-fill rounded"
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
                      {section === "Research Projects" && dept.researchProjects && Array.isArray(dept.researchProjects) && (
                        <div className="overflow-x-auto w-full max-w-full">
                          <table className="min-w-full text-left border border-[#ccc]">
                            <thead className="bg-[#487b75] text-white">
                              <tr>
                                <th className="px-4 py-2 border border-gray-300">S.No</th>
                                <th className="px-4 py-2 border border-gray-300">Title of the Research Project</th>
                                <th className="px-4 py-2 border border-gray-300">Principal Investigator</th>
                                <th className="px-4 py-2 border border-gray-300">Funding Agency</th>
                                <th className="px-4 py-2 border border-gray-300">Type of Funding Agency</th>
                                <th className="px-4 py-2 border border-gray-300">Year of Award</th>
                                <th className="px-4 py-2 border border-gray-300">Duration</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dept.researchProjects.map((project, pi) => (
                                <tr key={pi} className="border-t border-[#ccc]">
                                  <td className="px-4 py-2 border border-gray-300">{pi + 1}</td>
                                  <td className="px-4 py-2 border border-gray-300">{project.title}</td>
                                  <td className="px-4 py-2 border border-gray-300">{project.investigator}</td>
                                  <td className="px-4 py-2 border border-gray-300">
                                    <a
                                      href={project.agencyLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      {project.agency}
                                    </a>
                                  </td>
                                  <td className="px-4 py-2 border border-gray-300">{project.type}</td>
                                  <td className="px-4 py-2 border border-gray-300">{project.year}</td>
                                  <td className="px-4 py-2 border border-gray-300">{project.duration}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {section === "Seminars/Workshops / Conference" && (
                        <DepartmentSeminars college="University College of Arts & Commerce" department={dept.name} />
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
            // onClick={handleCloseProfile}
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
}
