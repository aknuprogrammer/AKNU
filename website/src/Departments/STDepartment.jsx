import React, { useState } from "react";
import { subDepartsWithFullData } from "../siteData/STdepartmentsData.jsx";
import {
  scienceAndTechnology,
  vijaya,
  vijayanirmala40,
  kalyani3,
} from "../assets/index.js";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AiOutlineFilePdf } from "react-icons/ai";
import { BackButton } from "../components/BackButton.jsx";
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

export default function STDepartment() {
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

  return (
    <div>
      <div className="relative w-full h-56 sm:h-72 md:h-96 overflow-hidden">
        <img
          src={scienceAndTechnology}
          alt="Science and technology"
          className="object-fill w-full h-full"
        />

        {/* <div className="absolute top-0 left-0 w-full h-full bg-opacity-50 flex items-center justify-center">
          <blockquote className="text-white text-xl md:text-3xl lg:text-3xl font-semibold text-center max-w-3xl px-4">
            "Education is the passport to the future, for tomorrow belongs to
            those who prepare for it today."
          </blockquote>
        </div> */}
      </div>

      <div className="px-4 sm:px-16 py-4">
        <BackButton />
      </div>

      <div className="px-4 sm:px-16 mb-2 text-teal-700 text-left">
        <h2 className="text-3xl sm:text-3xl font-bold text-teal-800 mb-6">
          About the College of Science and Technology
        </h2>
        <p className=" text-[#303630] mt-4 text-justify text-[16px]">
          Adikavi Nannaya University was founded in the year 2006 by an Act
          (No.28 of 2006) of Andhra Pradesh State Legislature on 22nd April 2006
          and has started its functioning with six academic programs. By 2008
          five more academic programs were added and all these programs were
          brought under a common umbrella i.e., University college. Later in the
          year 2012 the University College has been split into four individual
          colleges namely University College of Arts and Commerce, University
          College of Science and Technology, University College of Education and
          University College of Engineering. Since then the University College
          of Science and Technology has started to grow and introduced several
          academic programs both at post graduate and doctoral levels in
          response to the needs of the surrounding industries in diverse fields
          like aquatics, hydrocarbon exploration, paper, fertilizers,
          agriculture and horticulture etc. The college has developed good
          infrastructure facilities and well equipped with laboratories and
          audio visual teaching facilities for the smooth running of the
          academic program. At present the college offers twelve PG Programs,
          six Ph.d programs, two certificate programs and one PG Diploma
          program.
        </p>
      </div>
      <h2 className="text-3xl sm:text-3xl font-bold text-teal-800 px-4 sm:px-16 text-left mb-6 mt-8">
        Principal
      </h2>
      <div className="flex flex-col md:flex-row mt-4 sm:mt-6 px-4 sm:px-16">
        <div className="bg-teal-700 flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-4 md:pb-6 lg:pt-6 lg:pb-4 px-4 sm:px-6 md:px-6 lg:px-8 w-full md:w-1/3 lg:w-1/4 shadow">
          <div className="relative w-50 h-55 sm:w-36 sm:h-50 md:w-40 md:h-50 lg:w-50 lg:h-57 overflow-hidden border-2 sm:border-[3px] md:border-4 border-white shadow-md">
            <img
              src={kalyani3}
              alt="Prof. D Kalyani"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="text-white font-bold md:text-base lg:text-lg mt-2 text-center w-full px-2">
            Prof. D Kalyani
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
            Principal
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
            +91 7093 008 471
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
            principal.ucst@aknu.edu.in
          </div>
        </div>

        <div className="bg-[#f4e4c9] px-4 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-center py-4 sm:py-5 md:py-4 w-full md:w-2/3 lg:w-3/4 shadow">
          <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 text-center md:text-left">
            About Principal
          </h3>
          <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[#374151] text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] text-justify leading-5 sm:leading-6 md:leading-6">
            <p>
              The University College of Science and Technology is dedicated to
              nurturing innovative minds and advancing scientific knowledge for
              national progress. Since its inception, the college has rapidly
              evolved into a leading center for science and technology
              education, serving the diverse academic needs of students in the
              region. With AICTE-approved programs, the college continually
              expands academic opportunities and maintains a strong focus on
              holistic learning.
            </p>
            <p>
              Through state-of-the-art laboratories, industry collaborations,
              and hands-on experiences, students are empowered to develop
              practical skills and research capabilities. The college actively
              fosters partnerships with industry and research organizations,
              ensuring that graduates are well-prepared for successful careers
              and seamless transitions into the scientific and technological
              workforce.
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
                    {dept.profile.designation && (
                      <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
                        {dept.profile.designation}
                      </div>
                    )}
                    {dept.profile.qualifications && (
                      <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
                        {dept.profile.qualifications}
                      </div>
                    )}
                    {dept.profile.phone && (
                      <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
                        {dept.profile.phone}
                      </div>
                    )}
                    {dept.profile.email && (
                      <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
                        {dept.profile.email}
                      </div>
                    )}
                  </div>

                  <div className="px-4 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-center py-4 sm:py-5 md:py-4 w-full md:w-2/3 lg:w-3/4 shadow">
                    <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 text-center md:text-left">
                      About Department
                    </h3>
                    <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[#374151] text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] text-justify leading-5 sm:leading-6 md:leading-6">
                      {dept.about}
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
                    ...(dept?.awardees?.length ? ["Awardees"] : []),
                    ...(dept?.gallary?.length ? ["Gallary"] : []),
                    ...(dept?.researchProjects ? ["Research Projects"] : []),
                    "Seminars/Workshops / Conference",
                  ].map((section, i) => (
                    <InnerDropdown
                      key={section}
                      title={section}
                      isOpen={innerOpen[idx] === i}
                      onClick={() => handleInnerDropdown(idx, i)}
                    >
                      {section === "Gallary" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                          {dept?.gallary?.map((item, index) => (
                            <div
                              key={index}
                              className="break-inside-avoid relative group cursor-pointer transform hover:scale-[1.02] transition-all duration-500"
                            >
                              {/* Image Container */}
                              <div className="relative overflow-hidden rounded-2xl shadow-xl">
                                <img
                                  src={item.src}
                                  alt={item.title}
                                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                                  loading="lazy"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 p-6 w-full transition-all duration-500 group-hover:pb-8">
                                  <h3 className="text-3xl font-bold text-white mb-2">
                                    {item.title}
                                  </h3>
                                  <div className="h-px w-16 bg-teal-300 mb-3 transition-all duration-500 group-hover:w-24" />
                                  {/* <p className="text-white/80 text-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    {item.text}
                  </p> */}
                                </div>

                                {/* Interactive Button */}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {section === "Awardees" ? (
                        <div className="px-[15%] overflow-x-auto">
                          <table>
                            <tbody>
                              <tr>
                                {dept?.awardees?.map((a_ele, idx) => (
                                  <td className="border border-[#bbb] p-[15px] align-top min-w-[250px]">
                                    <h1 className="font-bold text-teal-700 text-lg mb-2.5">
                                      {a_ele?.title}
                                    </h1>
                                    <p>{a_ele?.description}</p>
                                    <p>Eligibility: {a_ele?.eligibility}</p>
                                    <br />
                                    <h3 className="font-bold text-teal-700 text-lg mb-2.5">
                                      List of Awardees :
                                    </h3>
                                    <ul className="list-disc pl-[20px]">
                                      {a_ele?.list_of_awardees?.map(
                                        (aa_ele, idx) => (
                                          <li>
                                            {aa_ele.year}: {aa_ele.name}
                                          </li>
                                        ),
                                      )}
                                    </ul>
                                  </td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                      {section === "Programs Offered" ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-left border border-[#ccc]">
                            <thead>
                              <tr className="bg-teal-700 text-white">
                                <th className="px-4 py-2">S.No</th>
                                <th className="px-4 py-2">
                                  Name of the Program
                                </th>
                                <th className="px-4 py-2">Syllabus</th>
                                <th className="px-4 py-2">Intake</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dept?.programsOffered?.map((p_ele, idx) => (
                                <tr key={idx} className="border border-[#ccc]">
                                  <td className="px-4 py-2">{p_ele.sno}</td>
                                  <td className="px-4 py-2 w-50% max-w-[100px]">
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
                        <ul className="list-disc pl-4">
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
                                        className="w-16 h-16 object-contain rounded"
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
                      {section === "Research Projects" &&
                        dept.researchProjects &&
                        Array.isArray(dept.researchProjects) && (
                          <div className="overflow-x-auto w-full max-w-full">
                            <table className="min-w-full text-left border border-[#ccc]">
                              <thead className="bg-[#487b75] text-white">
                                <tr>
                                  <th className="px-4 py-2 border border-gray-300">
                                    S.No
                                  </th>
                                  <th className="px-4 py-2 border border-gray-300">
                                    Title of the Research Project
                                  </th>
                                  <th className="px-4 py-2 border border-gray-300">
                                    Principal Investigator
                                  </th>
                                  <th className="px-4 py-2 border border-gray-300">
                                    Funding Agency
                                  </th>
                                  <th className="px-4 py-2 border border-gray-300">
                                    Type of Funding Agency
                                  </th>
                                  <th className="px-4 py-2 border border-gray-300">
                                    Year of Award
                                  </th>
                                  <th className="px-4 py-2 border border-gray-300">
                                    Duration
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {dept.researchProjects.map((project, pi) => (
                                  <tr
                                    key={pi}
                                    className="border-t border-[#ccc]"
                                  >
                                    <td className="px-4 py-2 border border-gray-300">
                                      {pi + 1}
                                    </td>
                                    <td className="px-4 py-2 border border-gray-300">
                                      {project.title}
                                    </td>
                                    <td className="px-4 py-2 border border-gray-300">
                                      {project.investigator}
                                    </td>
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
                                    <td className="px-4 py-2 border border-gray-300">
                                      {project.type}
                                    </td>
                                    <td className="px-4 py-2 border border-gray-300">
                                      {project.year}
                                    </td>
                                    <td className="px-4 py-2 border border-gray-300">
                                      {project.duration}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      {section === "Seminars/Workshops / Conference" && (
                        <DepartmentSeminars
                          college="University College of Science & Technology"
                          department={dept.name}
                        />
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
