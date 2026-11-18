import React, { useEffect, useState } from "react";
import {
  artsANDScience,
  ashok,
  ashok28,
  jyothirmainew,
  tashok,
} from "../assets";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AiOutlineFilePdf } from "react-icons/ai";
import {
  samanthulalikitha,
  heerabattu,
  surendrababu,
  nithiyanandreddy,
  likhitha,
  aruna,
  pharmacyPdf,
} from "../assets";
import { BackButton } from "../components/BackButton";
import DepartmentSeminars from "../components/DepartmentSeminars.jsx";
// Import pharmacy faculty images (replace with actual imports)
// import heera_battu from "../assets/Dr_Heera_Battu.jpeg";
// import surendra_babu from "../assets/Mr_Lagu_Surendra_Babu.jpeg";
// import nithiyanand_reddy from "../assets/Mr_K_Nithiyanand_Reddy.jpeg";
// import s_likhitha from "../assets/Mrs_S_Likhitha.jpg";
// import p_aruna from "../assets/Mrs_P_Aruna.jpeg";
// import pharma_cc from "../assets/pharma_cc.jpg";

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

export default function PharmacyDepartment() {
  const navigate = useNavigate();

  const [openDept, setOpenDept] = useState(null);
  const [innerOpen, setInnerOpen] = useState({});
  const [openProfile, setOpenProfile] = useState(null);

  // Pharmacy department data
  const pharmacyDepartment = {
    name: "Pharmaceutical Sciences",
    profile: {
      img: samanthulalikitha,
      name: "Mrs. SAMANTHULA LIKHITHA",
      designation: "Course Co-ordinator",
      phone: "+91 95057 00254",
      email: "pharmacy.tpg@aknu.edu.in",
      qualifications: "",
    },
    about:
      "The Department of Pharmaceutical Sciences was established in 2019 recognized by the Govt. of Andhra Pradesh, which is the Govt Pharmacy University located in the area of Tadepalligudem, West Godavari Dist. which helps better to serve the needs of students, located in and around Coastal region especially for students living in rural areas. Profession of Pharmaceutical Sciences has been one of the most dynamic/interesting field in the healthcare system that has undergone many developments for the welfare of people. Pharmacy profession is responsible for the appropriate use of medications and services in order to achieve optimal therapeutic outcomes. As a Pharmacist there are professional opportunities in public and private sectors within Hospitals, Pharmaceutical industry, Community centres, Central and State government research centres. AKNU College of Pharmaceutical Sciences is dedicated to provide efficient infrastructure, laboratories and equipment's to develop the students as efficient and eminent pharmacists. The University has expanded with outstanding infrastructure of classrooms, labs, seminar halls, sprawling playground, and massive women's hostel with the extent of about 6 acres dedicated exclusively for the Pharmacy course makes the teaching learning process a pleasurable experience. The entire campus is Wi-Fi enabled with uninterrupted power and water supply.",
    vision:
      "To be recognized as a top-tier pharmacy institute for excellence in providing an effective educational experience, research activities, continuous professional development for pharmacists, and providing incredible patient care with new drug development technologies.",
    mission: [
      "To implement innovative teaching methodologies and provide enormous support to students for their best performance.",
      "To promote pharmaceutical research programs through the use of state-of-the-art scientific and computing equipment and research facilities.",
      "To educate patients and healthcare professionals on the safe use of medications.",
      "To create an environment eco-friendly campus and to promote the health and well-being of the public locally and globally.",
    ],
    programsOffered: [
      {
        sno: 1,
        name: "B.Pharmacy",
        syllabus: pharmacyPdf,
        intake: 60,
      },
    ],
    faculty: [
      {
        name: "Dr. Heera Battu",
        designation: "Assistant Professor(Ad-hoc)",
        email: "heera.pharmacy@aknu.edu.in",
        img: heerabattu,
        profileLink: "Profiles/Pharmacy/Faculty Profile Dr Heera Battu.pdf",
        qualifications: [
          { label: "Ph.D", value: "Pharmaceutical Sciences" },
          { label: "M.Pharm", value: "Pharmaceutics" },
        ],
        experience: "8 years of teaching and research experience",
        publications: "15 research papers in reputed journals",
        brief: [
          "Expert in novel drug delivery systems",
          "Guided 5 M.Pharm students",
        ],
      },
      {
        name: "Dr. Lagu Surendra Babu",
        designation: "Assistant Professor(Ad-hoc)",
        email: "lsb.pharmacy@aknu.edu.in",
        img: surendrababu,
        profileLink:
          "Profiles/Pharmacy/lagu Surendra babu-tpg Faculty Profile.pdf",
        qualifications: [
          { label: "Ph.D", value: "Pharmaceutical Chemistry" },
          { label: "M.Pharm", value: "Pharmaceutical Chemistry" },
        ],
        experience: "7 years of teaching experience",
        publications: "12 research papers, 1 patent",
        brief: [
          "Specialized in drug design and synthesis",
          "Worked on anticancer drug development",
        ],
      },
      {
        name: "Dr. K. Nithiyananthan",
        designation: "Assistant Professor(Ad-hoc) & Placement Officer",
        email: "knr.pharmacy@aknu.edu.in",
        img: nithiyanandreddy,
        profileLink: "Profiles/Pharmacy/Nithi profile 29.04.2025.pdf",
        qualifications: [
          { label: "Ph.D", value: "Pharmacology" },
          { label: "M.Pharm", value: "Pharmacology" },
        ],
        experience: "9 years in academia and industry",
        publications: "18 research papers, 3 conference presentations",
        brief: [
          "Expert in preclinical research",
          "Industry collaboration experience",
        ],
      },
      {
        name: "Mrs. S. Likhitha",
        designation: "Assistant Professor(Ad-hoc) & Course Coordinator",
        email: "likhitha.pharmacy@aknu.edu.in",
        img: likhitha,
        profileLink: "Profiles/Pharmacy/Faculty Profile-Dr S Likhitha.pdf",
        qualifications: [
          { label: "M.Pharm", value: "Pharmaceutics" },
          { label: "B.Pharm", value: "Pharmacy" },
        ],
        experience: "5 years of teaching experience",
        publications: "8 research papers, 1 book chapter",
        brief: [
          "Specialized in industrial pharmacy",
          "Quality assurance expert",
        ],
      },
      {
        name: "Mrs. P. Aruna",
        designation: "Assistant Professor(Ad-hoc)",
        email: "aruna.pharmacy@aknu.edu.in",
        img: aruna,
        profileLink: "Profiles/Pharmacy/Aruna faculty Profile.pdf",
        qualifications: [
          { label: "M.Pharm", value: "Pharmacognosy" },
          { label: "B.Pharm", value: "Pharmacy" },
        ],
        experience: "6 years of teaching and research experience",
        publications: "10 research papers in herbal medicine",
        brief: [
          "Expert in herbal drug technology",
          "Research on medicinal plants",
        ],
      },
    ],
  };

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

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [openProfile]);

  return (
    <div>
      <div className="relative w-full h-56 sm:h-72 md:h-96 overflow-hidden">
        <img
          src="https://images.shiksha.com/mediadata/images/1488864071php7VkyND.jpeg"
          alt="Pharmacy College"
          className="object-cover w-full h-full"
        />
      </div>

      <div className="px-4 sm:px-16 py-4">
        <BackButton />
      </div>

      <div className="px-4 sm:px-16 mb-2 text-teal-700 text-left">
        <h2 className="text-3xl sm:text-3xl font-bold text-teal-800 mb-6">
          About the College of Pharmaceutical Sciences
        </h2>
        <p className="text-[#303630] text-justify text-[16px]">
          The Department of Pharmaceutical Sciences was established in 2019
          recognized by the Govt. of Andhra Pradesh, which is the Govt Pharmacy
          University located in the area of Tadepalligudem, West Godavari Dist.
          which helps better to serve the needs of students, located in and
          around Coastal region especially for students living in rural areas.
          Profession of Pharmaceutical Sciences has been one of the most
          dynamic/interesting field in the healthcare system that has undergone
          many developments for the welfare of people. Pharmacy profession is
          responsible for the appropriate use of medications and services in
          order to achieve optimal therapeutic outcomes.
        </p>
      </div>

      <h2 className="text-3xl sm:text-3xl font-bold text-teal-800 px-4 sm:px-16 text-left mb-6 mt-8">
        Principal
      </h2>

      <div className="flex flex-col md:flex-row mt-4 sm:mt-6 px-4 sm:px-16">
        <div className="bg-teal-700 flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-4 md:pb-6 lg:pt-6 lg:pb-4 px-4 sm:px-6 md:px-6 lg:px-8 w-full md:w-1/3 lg:w-1/4 shadow">
          <div className="relative w-50 h-55 sm:w-36 sm:h-50 md:w-40 md:h-50 lg:w-50 lg:h-57 overflow-hidden border-2 sm:border-[3px] md:border-4 border-white shadow-md">
            <img
              src={tashok}
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
        </div>

        <div className="bg-[#f4e4c9] px-4 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-center py-4 sm:py-5 md:py-4 w-full md:w-2/3 lg:w-3/4 shadow">
          <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 text-center md:text-left">
            About Principal
          </h3>
          <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[#374151] text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] text-justify leading-5 sm:leading-6 md:leading-6">
            <p>
              Prof. T. Ashok is an experienced academic leader at Adikavi Nannaya
              University, currently serving as the Principal of the Tadepalligudem
              campus (also known as TPG Campus). His tenure in senior
              administrative roles—including multiple terms as Registrar—reflects
              his experience in university governance, academic planning, and
              institutional management.
            </p>
            <p>
              At the Tadepalligudem campus, he guides
              academic departments, supports faculty coordination, and fosters
              initiatives for academic excellence and student development. His
              leadership enhances the educational and operational standards of
              AKNU's regional campus.
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-3xl sm:text-3xl font-bold text-teal-800 px-4 sm:px-16 text-left mb-6 mt-10">
        Departments
      </h2>

      <div className="px-4 sm:px-16">
        <div className="mb-4 border border-[#ddd] shadow-sm">
          <button
            className="w-full text-left py-3 px-4 bg-teal-700 text-white font-semibold text-lg flex justify-between items-center"
            onClick={() => setOpenDept(openDept === 0 ? null : 0)}
          >
            {pharmacyDepartment.name}
            <span
              className={`transform transition-transform duration-300 ${
                openDept === 0 ? "rotate-180" : "rotate-0"
              }`}
            >
              ▼
            </span>
          </button>

          {openDept === 0 && (
            <div className="flex flex-col w-full">
              <div className="flex flex-col md:flex-row">
                <div className="bg-teal-700 flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-4 md:pb-6 lg:pt-6 lg:pb-4 px-4 sm:px-6 md:px-6 lg:px-8 w-full md:w-1/3 lg:w-1/4 shadow">
                  <div className="relative w-50 h-55 sm:w-36 sm:h-50 md:w-40 md:h-50 lg:w-50 lg:h-57 overflow-hidden border-2 sm:border-[3px] md:border-4 border-white shadow-md">
                    <img
                      src={pharmacyDepartment.profile.img}
                      alt={pharmacyDepartment.profile.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="text-white font-bold md:text-base lg:text-lg mt-2 text-center w-full px-2">
                    {pharmacyDepartment.profile.name}
                  </div>
                  {pharmacyDepartment.profile.designation && (
                    <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
                      {pharmacyDepartment.profile.designation}
                    </div>
                  )}
                  {pharmacyDepartment.profile.qualifications && (
                    <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
                      {pharmacyDepartment.profile.qualifications}
                    </div>
                  )}
                  {pharmacyDepartment.profile.phone && (
                    <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
                      {pharmacyDepartment.profile.phone}
                    </div>
                  )}
                  {pharmacyDepartment.profile.email && (
                    <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
                      {pharmacyDepartment.profile.email}
                    </div>
                  )}
                </div>

                <div className="px-4 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-center py-4 sm:py-5 md:py-4 w-full md:w-2/3 lg:w-3/4 shadow">
                  <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 text-center md:text-left">
                    About Department
                  </h3>
                  <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[#374151] text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] text-justify leading-5 sm:leading-6 md:leading-6">
                    {pharmacyDepartment.about}
                  </div>
                </div>
              </div>

              <div className="w-full bg-white">
                {[
                  ...(pharmacyDepartment?.programsOffered?.length
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
                    isOpen={innerOpen[0] === i}
                    onClick={() => handleInnerDropdown(0, i)}
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
                            {pharmacyDepartment.programsOffered.map(
                              (p_ele, idx) => (
                                <tr key={idx} className="border border-[#ccc]">
                                  <td className="px-4 py-2">{p_ele.sno}</td>
                                  <td className="px-4 py-2 whitespace-nowrap">
                                    {p_ele.name}
                                  </td>
                                  <td className="px-4 py-2 text-teal-800 pl-[20px]">
                                    {p_ele.syllabus ? (
                                      <a
                                        href={p_ele.syllabus}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <AiOutlineFilePdf size={30} />
                                      </a>
                                    ) : (
                                      "--"
                                    )}
                                  </td>
                                  <td className="px-4 py-2">{p_ele.intake}</td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : null}
                    {/* {section === "Vision" && (
                      <div>{pharmacyDepartment.vision}</div>
                    )}
                    {section === "Mission" && (
                      <ul className="list-disc pl-2">
                        {pharmacyDepartment.mission.map((m, mi) => (
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
                            {pharmacyDepartment.faculty.map((f, fi) => (
                              <tr
                                key={f.email || f.name}
                                className="border-t border-[#ccc]"
                              >
                                <td className="px-4 py-2">{fi + 1}</td>
                                <td className="px-4 py-2">{f.name}</td>
                                <td className="px-4 py-2">{f.designation}</td>
                                <td className="px-4 py-2">{f.email}</td>
                                <td className="px-4 py-2">
                                  <div className="w-16 h-16 bg-gray-300 rounded flex items-center justify-center text-gray-500 text-sm">
                                    <img src={f.img} className="object-fill" />
                                  </div>
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
                      <DepartmentSeminars college="Tadepalligudem Campus" department={pharmacyDepartment.name} />
                    )}
                  </InnerDropdown>
                ))}
              </div>
            </div>
          )}
        </div>
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
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <img src={openProfile.img} className="rounded-full" />
            </div>
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
