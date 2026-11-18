import React, { useState } from "react";
import { subDepartsWithFullData } from "../siteData/edepartmentsData";
import { artsANDScience, edubulding, venkateswaraRao, keziarani } from "../assets";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { AiOutlineFilePdf } from "react-icons/ai";
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

export default function EDepartment() {
  const navigate = useNavigate();
  const [openDept, setOpenDept] = useState(null);
  const [innerOpen, setInnerOpen] = useState({});
  const [openProfile, setOpenProfile] = useState(null); // Track open faculty profile

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

  const [activeTab, setActiveTab] = useState("vision");

  return (
    <div>
      <div className="relative w-full h-56 sm:h-72 md:h-96 overflow-hidden">
        <img
          src={edubulding}
          alt="Engineering College"
          className="object-cover w-full h-full"
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

      <div className="px-4 sm:px-16 text-teal-700 text-left">
        <h2 className="text-3xl sm:text-3xl font-bold text-teal-800 mb-6">
          About the College of Engineering
        </h2>
        <p className="text-[#303630] mt-4 text-justify text-[16px]">
          The University College of Engineering (UCE), established in the
          academic year 2017-2018, is a constituent college of Adikavi Nannaya
          University. It is approved by the All India Council for Technical
          Education (AICTE) and operates from its dedicated campus in
          Rajahmundry, Andhra Pradesh. The college was established with a vision
          to impart high-quality technical education and to cultivate innovation,
          research, and professional ethics among engineering aspirants. UCE
          offers four undergraduate programmes (B.Tech) in Civil Engineering,
          Computer Science and Engineering (CSE), Electronics and Communication
          Engineering (ECE), and Electronics and Instrumentation Engineering
          (EIE), along with an M.Tech programme in Computer Science and
          Technology. The curriculum is meticulously crafted to integrate
          foundational theory with practical, industry-aligned training,
          fostering critical thinking and technical acumen. The institution
          houses well-equipped laboratories, modern computing facilities, and a
          rich digital and physical library to support experiential learning. The
          faculty comprises seasoned academicians and researchers actively
          engaged in cutting-edge research, consultancy, and industry
          collaborations. Students are consistently encouraged to take up
          innovative projects, participate in national technical symposia, and
          publish research work.
        </p>
      </div>
      <div className="flex gap-4 border-b border-gray-200 mt-6 px-4 sm:px-16 mb-4">
        {["vision", "mission"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative text-base sm:text-xl font-medium pb-2 px-3 transition-colors duration-300
        ${
          activeTab === tab
            ? "text-[#004d40] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#004d40] after:transition-all after:duration-300"
            : "text-gray-400 hover:text-[#004d40]"
        }
      `}
            style={{ outline: "none" }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div className="px-4 sm:px-16">
        {activeTab === "vision" && (
          <p>
            To emerge as a leading institute in research and technological
            innovations across disciplines of engineering for progress of the
            nation.
          </p>
        )}
        {activeTab === "mission" && (
          <p>
            To ignite passion for engineering through nurturing the novelty of
            thought with the objective of creating technically competent,
            skilled and socially responsible engineers.
          </p>
        )}
      </div>
      <h2 className="text-3xl sm:text-3xl font-bold text-teal-800 px-4 sm:px-16 text-left mb-6 mt-8">
        Principal
      </h2>
      <div className="flex flex-col md:flex-row mt-4 sm:mt-6 px-4 sm:px-16">
        <div className="bg-teal-700 flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-4 md:pb-6 lg:pt-6 lg:pb-4 px-4 sm:px-6 md:px-6 lg:px-8 w-full md:w-1/3 lg:w-1/4 shadow">
          <div className="relative w-50 h-55 sm:w-36 sm:h-50 md:w-40 md:h-50 lg:w-50 lg:h-57 overflow-hidden border-2 sm:border-[3px] md:border-4 border-white shadow-md">
            <img
              src={keziarani}
              alt="Dr. B Kezia Rani"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="text-white font-bold md:text-base lg:text-lg mt-2 text-center w-full px-2">
            Dr. B Kezia Rani
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
            Principal
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
            principal.ucoe@aknu.edu.in
          </div>
        </div>

        <div className="bg-[#f4e4c9] px-4 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-center py-4 sm:py-5 md:py-4 w-full md:w-2/3 lg:w-3/4 shadow">
          <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 text-center md:text-left">
            About Principal
          </h3>
          <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[#374151] text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] text-justify leading-5 sm:leading-6 md:leading-6">
            <p>
              Dr. B. Kezia Rani is currently serving as the Principal of the
              University College of Engineering and Associate Professor in the
              Department of Computer Science and Engineering at Adikavi Nannaya
              University, Rajamahendravaram. She holds a Ph.D., MCA, and B.Tech.
              in Computer Science and Engineering, bringing extensive academic,
              research, and administrative experience to the institution.
            </p>
            <p>
              She has published more than 35 research papers in esteemed
              national and international journals and presented over 15 papers at
              national and international conferences. Under her research
              supervision, multiple Ph.D. scholars have been awarded and several
              scholars are actively pursuing their research. She has authored two
              books and has been honored with distinguished awards including the
              Mother Teresa Award, Bharat Nari Award, and Best Faculty Award in
              recognition of her contributions to technical education and
              research.
            </p>
          </div>
        </div>
      </div>
      {/* Quick Links Section: Information Brochure & AICTE */}
      {/* <div className="w-full flex flex-wrap gap-6 justify-center my-10 px-4 sm:px-6 md:px-8">
       
        <a
          href="https://www.aknu.edu.in/UCE/links/UCE%20BROCHURE%202021.pdf" // Update this URL as needed
          target="_blank"
          rel="noopener noreferrer"
          className="block w-72 rounded-xl shadow-lg bg-white transition-colors duration-200 p-6 text-teal-700 text-center cursor-pointer group"
          style={{ textDecoration: "none" }}
        >
          <div className="text-3xl mb-2">📘</div>
          <div className="text-xl font-bold mb-1">Information Brochure</div>
          <div className="text-sm mb-4 opacity-80">
            Download the latest college information brochure.
          </div>
          <div className="inline-block px-4 py-2 rounded bg-white text-teal-700 font-semibold group-hover:bg-teal-50 transition">
            View Brochure
          </div>
        </a>
        <a
          href="https://www.aicte-india.org/" // Update this URL as needed
          target="_blank"
          rel="noopener noreferrer"
          className="block w-72 rounded-xl shadow-lg bg-white  transition-colors duration-200 p-6  border-teal-700  text-teal-700 text-center cursor-pointer group"
          style={{ textDecoration: "none" }}
        >
          <div className="text-3xl mb-2">🏛️</div>
          <div className="text-xl font-bold mb-1">AICTE</div>
          <div className="text-sm mb-4 opacity-80">
            Visit the official AICTE website for more details.
          </div>
          <div className="inline-block px-4 py-2 rounded bg-white text-teal-700 font-semibold border-teal-700 transition">
            Go to AICTE
          </div>
        </a>
      </div> */}
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
                    ...(dept.name !== "Science and Humanities"
                      ? ["Placements"]
                      : []),
                    "Department Activities",
                    dept.name === "Science and Humanities"
                      ? "Gallery"
                      : "Infrastructure",
                    "Seminars/Workshops / Conference",
                  ].map((section, i) => (
                    <InnerDropdown
                      key={section}
                      title={section}
                      isOpen={innerOpen[idx] === i}
                      onClick={() => handleInnerDropdown(idx, i)}
                    >
                      {section === "Programs Offered" ? (
                        <div className=" overflow-x-auto">
                          <table className="min-w-full text-left border border-[#ccc]">
                            <thead>
                              <tr className="bg-teal-700 text-white">
                                <th className="px-4 py-2">S.No</th>
                                <th className="px-4 py-2">
                                  Name of the Program
                                </th>
                                {dept?.programsOffered &&
                                dept?.programsOffered[0].year ? (
                                  <th className="px-4 py-2">Year</th>
                                ) : null}
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
                                  {p_ele && p_ele?.year ? (
                                    <td className="px-4 py-2">{p_ele?.year}</td>
                                  ) : null}
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

                      {section === "Placements" && (
                        <div className="flex flex items-center gap-6 py-6">
                          {/* Recruiters Images Section */}
                          <div className="flex flex-col items-center gap-4 w-full">
                            {dept.placements?.img1?.ourrecruters && (
                              <img
                                src={dept.placements.img1.ourrecruters}
                                alt="Our Recruiters"
                                className="w-full max-w-[400px] object-fill rounded shadow"
                              />
                            )}

                            {dept.placements?.img2 && (
                              <img
                                src={dept.placements.img2}
                                alt="Placements"
                                className="w-full max-w-[400px] object-fill rounded shadow"
                              />
                            )}
                          </div>

                          {/* Placement Reports Section */}
                          {dept.placements?.report?.length > 0 ? (
                            <div className="w-full max-w-[500px] bg-white p-4 rounded-lg shadow">
                              <h3 className="font-semibold text-teal-700 mb-3 text-lg flex items-center gap-2">
                                <AiOutlineFilePdf
                                  className="text-red-600"
                                  size={24}
                                />
                                Placement Reports
                              </h3>
                              <ul className="space-y-3">
                                {dept.placements.report.map((r, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2"
                                  >
                                    <AiOutlineFilePdf
                                      className="text-red-600 mt-0.5 flex-shrink-0"
                                      size={20}
                                    />
                                    <a
                                      href={r.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-700 hover:text-blue-900 transition-colors underline hover:underline-offset-2"
                                    >
                                      {r.title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            !dept.placements?.img1 &&
                            !dept.placements?.img2 && (
                              <div className="text-gray-500 bg-white p-4 rounded-lg shadow text-center w-full max-w-md">
                                No placement data available
                              </div>
                            )
                          )}
                        </div>
                      )}

                      {section === "Department Activities" && (
                        <div className="w-full  max-w-full bg-white p-4 rounded-lg mx-auto">
                          <h3 className="font-semibold text-teal-700 mb-3 text-lg flex  gap-2">
                            <AiOutlineFilePdf
                              className="text-red-600"
                              size={24}
                            />
                            Department Activities
                          </h3>
                          {dept.DepartmentActivities &&
                          dept.DepartmentActivities.length > 0 ? (
                            <ul className="space-y-3">
                              {dept.DepartmentActivities.map((activity, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <AiOutlineFilePdf
                                    className="text-red-600 mt-0.5 flex-shrink-0"
                                    size={20}
                                  />
                                  <a
                                    href={activity.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-700 hover:text-blue-900 transition-colors underline hover:underline-offset-2"
                                  >
                                    {activity.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-gray-500">
                              No department activities available.
                            </div>
                          )}
                        </div>
                      )}

                      {(section === "Infrastructure" ||
                        section === "Gallery") && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
                          {dept.Infrastructur?.map((img, i) => (
                            <div
                              key={i}
                              className="flex flex-col items-center bg-white rounded shadow p-4"
                            >
                              {img.pdf ? (
                                <a
                                  href={img.pdf}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-700 hover:text-blue-900 transition-colors   hover:underline-offset-2"
                                >
                                  <div className="flex items-center gap-2text-sm text-teal-700 align-start font-medium">
                                    <AiOutlineFilePdf className="text-rose-500" />{" "}
                                    <span>Infrastructure</span>
                                  </div>
                                </a>
                              ) : (
                                <div className="text-sm text-teal-700 mt-2 font-medium">
                                  <img
                                    src={img.img}
                                    className="h-[200px]"
                                    alt={`Infrastructure ${i + 1}`}
                                  />
                                  {/* Infrastructure Image {i + 1} */}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {section === "Seminars/Workshops / Conference" && (
                        <DepartmentSeminars
                          college="University College of Engineering"
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
                {Array.isArray(openProfile.publications) ? (
                  <ul className="list-disc pl-5 text-gray-700 text-sm mb-1">
                    {openProfile.publications.map((pub, i) => (
                      <li key={i}>{pub}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-700 text-sm mb-1">
                    {openProfile.publications}
                  </div>
                )}
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
