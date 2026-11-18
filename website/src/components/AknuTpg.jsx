import React, { useState } from "react";
import { motion } from "framer-motion";
import { TPGCampus } from "@/assets";
import { tadigadapaCompusDepartments } from "../siteData/departmentsData";
import DepartmentSeminars from "./DepartmentSeminars.jsx";
import { AiOutlineFilePdf } from "react-icons/ai";
import { BackButton } from "./BackButton";
import { ashok, ashok16 } from "../assets";

const Card = ({ children, className }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>{children}</div>
);

const CardContent = ({ children }) => <div className="p-4">{children}</div>;

const AknuTpg = () => {
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
      <div className="mb-6 ">
        {/* Departments Section */}

        <h2 className="text-3xl font-bold text-left text-teal-800 mb-6 mt-12">
          Departments
        </h2>
        <div className="space-y-6">
          {tadigadapaCompusDepartments.map((dept, idx) => (
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
                        {/* {section === "Vision" && <div>{dept.vision}</div>} */}
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
                        {/* {section === "Mission" && (
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
                          <DepartmentSeminars college="Tadepalligudem Campus" department={dept.name} />
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
              <div className="text-3xl font-bold text-teal-800 mb-4">
                Profile
              </div>
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
      <h2 className="text-3xl font-bold  text-center text-teal-800 mb-6">
        Tadepalligudem Campus
      </h2>
      <div className="flex flex-col gap-8 mb-6">
        <div className="relative flex justify-center -mx-4 sm:-mx-16">
          <img
            src={TPGCampus}
            alt="College of Education"
            className="h-120 w-full object-fill"
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
        <div className="flex flex-col gap-8">
          {/* About Section */}
          <div className="w-full mb-2 text-[#007367] text-left">
            <h2 className="text-3xl font-bold text-left text-teal-800 mb-6 mt-2">
              About the Campus
            </h2>
            <p className=" text-[#303630] text-[16px] mt-4 text-justify">
              Adikavi Nannaya University Campus, Tadepalligudem was established
              in the year 2004. Prior to 06-04-2017, this Campus was under the
              administrative control of Andhra University, Visakhapatnam. The
              Government of A.P. through G.O.Ms. 19, dated 06-04-2017 has
              transferred the affiliation of Tadepalligudem campus from Andhra
              University, Visakhapatnam to Adikavi Nannaya University,
              Rajamahendravaram.
            </p>
            <p className="mt-4 text-[16px] text-[#303630] text-justify">
              The main aim of the Campus is to spread and cater to the
              educational needs of the sons and daughters of the local
              community. With this sacred aim Post Graduate Courses have been
              introduced. This academic institution is situated in a sprawling
              campus which is two kilometers away from the town. The current
              campus is made up of three lovely buildings. The first building is
              all about the Post Graduate Courses with nine classrooms, three
              department staff rooms, a computer lab, an office room, and a
              seminar hall. Then, we have the second building that's dedicated
              to Pharmaceutical Sciences. Lastly, the third building is home to
              the Women's Hostel. Each part of the campus has its unique charm
              and purpose!
            </p>
            <div>
              <p className="mt-4 text-[16px] text-teal-700">Contact US</p>
              <p className=" text-[14px] text-[#303630]">
                Office :: 9848490422
              </p>
            </div>
          </div>

          {/* Principal Section */}
          <h2 className="text-3xl sm:text-3xl font-bold text-teal-800 text-left">
            Principal
          </h2>
          <div className="flex flex-col md:flex-row">
            <div className="bg-teal-700 flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-3 md:pb-3 lg:pt-6 lg:pb-4 px-4 sm:px-6 md:px-6 lg:px-8 w-full md:w-1/3 lg:w-1/4 shadow">
              <div className="relative w-50 h-55 sm:w-36 sm:h-50 md:w-40 md:h-50 lg:w-50 lg:h-57 overflow-hidden border-2 sm:border-[3px] md:border-4 border-white shadow-md">
                <img
                  src={ashok16}
                  alt="Prof. T. Ashok"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="text-white font-bold md:text-base lg:text-lg mt-2 text-center w-full px-2">
                Prof. T. Ashok
              </div>
              <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
                Principal
              </div>
              <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
                principal.tpg@aknu.edu.in
              </div>
              <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
                +91 9441046449
              </div>
            </div>

            <div className="bg-[#f4e4c9] px-4 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-center py-4 sm:py-5 md:py-4 w-full md:w-2/3 lg:w-3/4 shadow">
              <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 text-center md:text-left">
                About Principal
              </h3>
              <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[#374151] text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] text-justify leading-5 sm:leading-6 md:leading-6">
                <p>
                  It is an honor to serve as Principal of the Tadepalligudem
                  Campus of Adikavi Nannaya University. Our campus is committed
                  to providing quality higher education to students from the
                  region, fostering academic excellence, and nurturing holistic
                  development. We strive to create an environment that
                  encourages critical thinking, innovation, and research while
                  maintaining strong ethical values.
                </p>
                <p>
                  Through dedicated faculty, modern infrastructure, and
                  student-centric approaches, we aim to empower our students to
                  become confident leaders and responsible citizens. Our mission
                  is to bridge the gap between theoretical knowledge and
                  practical application, ensuring that graduates are
                  well-equipped to meet the challenges of the modern world and
                  contribute meaningfully to society.
                </p>
              </div>
            </div>
          </div>

          <div>{CACDepartment()}</div>

          {/* Department Section */}

          {/* Know AKNU Section */}
          {/* <div className="flex flex-col md:flex-row items-start gap-8 bg-blue-50 p-6 rounded-lg">
           
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4 text-teal-800">Know AKNU</h2>
              <p className="mb-4 text-gray-700">
                Founded in 1980, AKNU Deemed to be University stands at the intersection of multidisciplinary
                applied education and translational research. With 12 schools across Bengaluru, Hyderabad, and
                Visakhapatnam, AKNU empowers students to discover their ikigai through global perspectives,
                industry collaborations, and holistic development.
              </p>
              <p className="mb-4 text-gray-700">
                Guided by integrity and the pursuit of knowledge and moral values, AKNU shapes future-ready
                citizens who drive entrepreneurship, innovation, and create meaningful societal impact.
              </p>
              <div className="flex gap-4">
                <button
                  className={`px-4 py-2 ${activeTab === 'vision' ? 'text-blue-800 border-b-2 border-blue-800' : 'text-gray-600'} hover:text-blue-800`}
                  onClick={() => setActiveTab('vision')}
                >
                  Vision
                </button>
                <button
                  className={`px-4 py-2 ${activeTab === 'mission' ? 'text-blue-800 border-b-2 border-blue-800' : 'text-gray-600'} hover:text-blue-800`}
                  onClick={() => setActiveTab('mission')}
                >
                  Mission
                </button>
              </div>
              <div className="mt-4">
                {activeTab === 'vision' && visionContent}
                {activeTab === 'mission' && missionContent}
              </div>
            </div>

           
            <div className="flex-1">
              <img
                src="https://www.gitam.edu/sites/default/files/banners/know-gitam_0.jpg"
                alt="Know AKNU"
                className="rounded-lg shadow-lg object-cover w-full"
              />
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default AknuTpg;
