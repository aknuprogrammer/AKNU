import React, { useState } from "react";
import { motion } from "framer-motion";
import { kakinadaCompusDepartments } from "../siteData/departmentsData";
import { kakinadaCampus, prasanthisri } from "../assets";
import { AiOutlineFilePdf } from "react-icons/ai";
import { BackButton } from "./BackButton";
import DepartmentSeminars from "./DepartmentSeminars.jsx";

const Card = ({ children, className }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>{children}</div>
);

const CardContent = ({ children }) => <div className="p-4">{children}</div>;

const AknuKkd = () => {
  const [activeTab, setActiveTab] = useState("");

  const visionContent = (
    <ul className="list-disc pl-6 text-gray-700">
      <li>
        MSN Campus was founded with a visionary purpose and the land donor’s
        commitment to fulfill society’s educational needs.
      </li>
      <li>
        Driven by strong determination, MSN Campus aims to impact the
        environment through continual innovation in education.
      </li>
      <li>
        Focuses on advancing research and creativity to foster holistic
        development.
      </li>
      <li>
        Strives to produce complete individuals equipped with knowledge and
        strong ethical values.
      </li>
    </ul>
  );

  const missionContent = (
    <ul className="list-disc pl-6 text-gray-700">
      <li>Empower students with a strong zeal to learn and grow.</li>
      <li>Enhance knowledge through groundbreaking research agendas.</li>
      <li>
        Instill human values alongside excellent teaching and innovative
        activities.
      </li>
      <li>
        Encourage ingenious thinking to enable firm and confident
        decision-making.
      </li>
    </ul>
  );

  function InnerDropdown({ title, isOpen, onClick, children }) {
    return (
      <div className="w-full my-2">
        <button
          type="button"
          className="w-full text-left py-3 px-4 bg-[#f5f5f5] border border-[#ddd] text-teal-700 font-semibold text-base flex justify-between items-center"
          onClick={onClick}
          aria-expanded={isOpen}
          aria-controls={`${title}-content`}
        >
          {title}
          <span className="text-base sm:text-lg md:text-xl font-bold">
            {isOpen ? "−" : "+"}
          </span>
        </button>
        {isOpen && (
          <div
            id={`${title}-content`}
            className="p-4 border border-t-0 border-[#ddd] bg-white"
          >
            {children}
          </div>
        )}
      </div>
    );
  }

  function CACDepartment() {
    const [openDept, setOpenDept] = useState(null);
    const [innerOpen, setInnerOpen] = useState({});
    const [openProfile, setOpenProfile] = useState(null);

    const handleProfileClick = (faculty) => {
      setOpenProfile(faculty);
    };

    const handleCloseProfile = () => {
      setOpenProfile(null);
    };

    const handleInnerDropdown = (deptIdx, sectionIdx) => {
      setInnerOpen((prev) => ({
        ...prev,
        [deptIdx]: prev[deptIdx] === sectionIdx ? null : sectionIdx,
      }));
    };

    return (
      <div className="max-w-screen-4xl  max-w-screen-2xl  mb-7 ">
        {/* Departments Section */}
        <h2 className="text-3xl font-bold text-left text-teal-800 mb-6">
          Departments
        </h2>
        <div className="space-y-6">
          {kakinadaCompusDepartments.map((dept, idx) => (
            <div
              key={dept.name}
              className="mb-4 border border-[#ddd] shadow-sm"
            >
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
                    <div className="bg-teal-700 flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-4 md:pb-6 lg:pt-6 lg:pb-4 px-4 sm:px-6 md:px-6 lg:px-8 w-full md:w-1/3 lg:w-1/4 shadow">
                      <div className="relative w-50 h-55 sm:w-36 sm:h-50 md:w-40 md:h-50 lg:w-50 lg:h-57 overflow-hidden border-2 sm:border-[3px] md:border-4 border-white shadow-md">
                        <img
                          src={dept.profile.img}
                          alt={dept.profile.name}
                          className="w-full h-full object-fill object-bottom"
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
                        {typeof dept.about === "string" ? (
                          <>
                            <p>{dept.about}</p>
                            {dept.about.length < 500 && (
                              <p>
                                The department continues to strive for
                                excellence in teaching, research, and community
                                engagement. Through innovative pedagogical
                                approaches, collaborative research initiatives,
                                and strong industry partnerships, the department
                                aims to produce well-rounded graduates who are
                                equipped to meet the challenges of the modern
                                world and contribute meaningfully to society.
                              </p>
                            )}
                          </>
                        ) : (
                          dept.about
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-white mt-4">
                    {[
                      ...(dept?.programsOffered?.length
                        ? ["Programs Offered"]
                        : []),
                      // "Vision",
                      // "Mission",
                      "Faculty",
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
                                  <tr
                                    key={idx}
                                    className="border border-[#ccc]"
                                  >
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
                                    <td className="px-4 py-2">
                                      {p_ele.intake}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : null}
                        {/* {section === "Vision" && <div>{dept.vision}</div>}
                        {section === "Mission" && (
                          <ul className="list-disc pl-2">
                            {dept?.mission?.map((m, mi) => (
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
                                {dept?.faculty?.map((f, fi) => (
                                  <tr
                                    key={f.email || f.name}
                                    className="border-t border-[#ccc]"
                                  >
                                    <td className="px-4 py-2">{fi + 1}</td>
                                    <td className="px-4 py-2">{f.name}</td>
                                    <td className="px-4 py-2">
                                      {f.designation}
                                    </td>
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
                        {section === "Seminars/Workshops / Conference" && (
                          <DepartmentSeminars college="Kakinada Campus" department={dept.name} />
                        )}
                      </InnerDropdown>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {openProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
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

              <img
                src={openProfile.img}
                alt={openProfile.name}
                className="w-32 h-32 object-cover rounded-full border-4 border-[#007367] mb-4"
              />
              <div className="text-lg font-bold text-[#007367] mb-1">
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
                    <div className="font-semibold text-[#007367] mb-1">
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
                  <div className="font-semibold text-[#007367]">Experience</div>
                  <div className="text-gray-700 text-sm mb-1">
                    {openProfile.experience}
                  </div>
                </div>
              )}

              {openProfile.publications && (
                <div className="w-full mb-2">
                  <div className="font-semibold text-[#007367]">
                    Publications & Projects
                  </div>
                  <div className="text-gray-700 text-sm mb-1">
                    {openProfile.publications}
                  </div>
                </div>
              )}

              {openProfile.brief && Array.isArray(openProfile.brief) && (
                <div className="w-full mb-2">
                  <div className="font-semibold text-[#007367]">Brief</div>
                  <ul className="list-disc pl-5 text-gray-700 text-[16px]">
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

  return (
    <section className="page-content pt-10 px-4 sm:px-16">
      <div className="college-page-content">
        <h2 className="text-3xl font-bold  text-center text-teal-800 mb-6">
          Kakinada Campus
        </h2>
        <div className="flex flex-col gap-8 mb-6">
          <div className="relative flex justify-center -mx-4 sm:-mx-16">
            <img
              src={kakinadaCampus}
              alt="College of Education"
              className="w-full h-[97vh] object-fill"
            />
            {/* <div className="absolute inset-x-0 bottom-0 flex items-center justify-center rounded-b-lg">
              <blockquote className="text-white text-center px-6 text-xl font-semibold italic max-w-3xl py-4">
                "Education is the passport to the future, for tomorrow belongs
                to those who prepare for it today."
              </blockquote>
            </div> */}
          </div>
        </div>
        <BackButton />
        <div className="college-page-content">
          <div className="flex flex-col">
            {/* About Section */}
            <div className="w-full mb-2 text-[#007367] text-left">
              <h2 className="text-3xl font-bold text-left text-teal-800 mb-6 mt-2">
                About the College
              </h2>
              <p className=" text-[#303630] text-[16px] mt-4 text-justify">
                The Adikavi Nannaya University MSN Campus, (Erstwhile Andhra
                University MSN Campus) Kakinada lies on the East coast in the
                East Godavari District, Andhra Pradesh, India. The campus has
                been carefully nurtured in academic and service activities since
                its establishment in November 1977. The Campus is ideally
                located in between 213 National Highway and Kakinada Port –
                Samalkot ADB Road in a 50.93 acres site at Thimmapuram village.
                The Campus is at a distance of nine kilometers from Kakinada
                Town Railway Station. The environment and facilities at the
                Campus are very conducive to learning. The administrative
                control of this campus has been transferred to Adikavi Nannaya
                University, Rajahmundry vide. G.O. Ms. No. 19 Dated 06.04.2017
              </p>
              <p className="mt-4 text-[16px] text-[#303630] text-justify">
                The Andhra University, Visakhapatnam started the Andhra
                University Post Graduate Courses, in November 1977 at the
                erstwhile Pithapur Rajah's Government College hostel buildings,
                Suryaraopet, Kakinada to cater to the educational needs of the
                people of the Godavari districts. At the beginning the
                University introduced three courses viz., M.A., in English, and
                M.A., in Politics and Public Administration. Sri.Malladi
                Satyalinga Naikar Charities donated an extent of Ac 40.38 cents
                of land to the Centre in Thimmapuram (village), Kakinada Rural
                Mandal. A Building with 22,053 sft was constructed in the said
                land in the year 1989. The A.U.P.G. Centre was shifted to its
                new building in June 1993 with a new caption as Andhra
                University M.S.Naicker P.G.Center. The Campus also has dedicated Hostels for Boys and Girls
              </p>
            </div>

            {/* Principal Section */}
            <h2 className="text-3xl sm:text-3xl font-bold text-teal-800 text-left mt-3">
              Principal
            </h2>
            <div className="flex flex-col md:flex-row mt-4 sm:mt-6">
              <div className="bg-teal-700 flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-4 md:pb-6 lg:pt-6 lg:pb-4 px-4 sm:px-6 md:px-6 lg:px-8 w-full md:w-1/3 lg:w-1/4 shadow">
                <div className="relative w-50 h-55 sm:w-36 sm:h-50 md:w-40 md:h-50 lg:w-50 lg:h-57 overflow-hidden border-2 sm:border-[3px] md:border-4 border-white shadow-md">
                  <img
                    src={prasanthisri}
                    alt="Prof. S Prasanthi Sri"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="text-white font-bold md:text-base lg:text-lg mt-2 text-center w-full px-2">
                  Prof. S Prasanthi Sri
                </div>
                <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
                  Principal
                </div>
                <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
                  principal.kkd@aknu.edu.in
                </div>
                {/* <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
                  ---
                </div> */}
              </div>

              <div className="bg-[#f4e4c9] px-4 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-center py-4 sm:py-5 md:py-4 w-full md:w-2/3 lg:w-3/4 shadow">
                <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 text-center md:text-left">
                  About Principal
                </h3>
                <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[#374151] text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] text-justify leading-5 sm:leading-6 md:leading-6">
                  <p>
                    It is a privilege to serve as Principal of the historic MSN
                    College in Kakinada, named after Malladi Satyalinga Naicker,
                    a visionary and benefactor whose legacy inspires us. This
                    responsibility motivates me to uphold his vision and
                    maintain the institution's reputation by delivering quality
                    education, meeting societal needs, and bridging the gap
                    between academia and industry.
                  </p>
                  <p>
                    At MSN, we aim to provide students with a memorable and
                    transformative experience. Through innovative teaching
                    methodologies, industry collaborations, and a focus on
                    holistic development, we ensure that graduates are
                    well-prepared to meet the challenges of the modern world and
                    contribute meaningfully to society. In today's competitive
                    world, thinking beyond the ordinary is essential. 

                  </p>
                </div>
              </div>
            </div>
            <div>{CACDepartment()}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AknuKkd;
