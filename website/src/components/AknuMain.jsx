import React, { useState } from "react";
import { motion } from "framer-motion";
import CoursesOffered from "./home/CoursesOffered";

const Card = ({ children, className }) => (
  <div className={`bg-white rounded-lg shadow-md ${className}`}>{children}</div>
);

const CardContent = ({ children }) => <div className="p-4">{children}</div>;

const AknuMain = () => {
  const [activeTab, setActiveTab] = useState("");

  const visionContent = (
    <ul className="list-disc pl-6 text-gray-700">
      <li>
        The College of Education seeks to produce educators who inspire
        students, understand the significance of cultural diversity, and be the
        agents of social transformation toward equity and excellence.
      </li>
    </ul>
  );

  const missionContent = (
    <ul className="list-disc pl-6 text-gray-700">
      <li>
        The College of Education is committed to prepare students as lifelong
        educators who create and promote learning environments that are based on
        the understanding of culture, power, history, community, and knowledge
        generation.
      </li>
      <li>
        Disseminate pedagogical knowledge and dispositions that prepare students
        for 21st-century realities.
      </li>
      <li>
        Develop educationally-sound, multidisciplinary teachers that contribute
        to the development of society and nation.
      </li>
    </ul>
  );

  function InnerDropdown({ title, isOpen, onClick, children }) {
    return (
      <div className="border border-gray-200 rounded-md mb-4">
        <button
          type="button"
          className="w-full flex justify-between items-center px-4 py-3 text-left text-green-800 font-semibold hover:bg-green-100 transition"
          onClick={onClick}
          aria-expanded={isOpen}
          aria-controls={`${title}-content`}
        >
          {title}
          <span className="ml-2 text-xl font-bold select-none">
            {isOpen ? "−" : "+"}
          </span>
        </button>
        {isOpen && (
          <div
            id={`${title}-content`}
            className="px-6 py-4 text-gray-700 text-sm bg-green-50"
          >
            {children}
          </div>
        )}
      </div>
    );
  }

  function CACDepartment() {
    const departments = [
      {
        name: "Education",
        profile: {
          img: "https://aknu.edu.in/UCEDU/Images/Departments/Education/Mr.%20R%20Sambasiva%20Rao.jfif",
          name: "Dr. R Sambasiva Rao",
          designation: "Course Co-ordinator",
          phone: "9912282676",
          email: "rssr.edu@aknu.edu.in",
          qualifications: "",
        },
        about: `One of the most respectful professions chosen by the Graduates globally is Teaching Profession where they are responsible for catering knowledge among students and young learners in a strategic manner. It is teachers who alone can contribute and build a healthy academic system for a nation to grow.In order to become a teacher by profession, one has to qualify the graduation degree followed by a mandatory course called Bachelor of Education (B.Ed). B.Ed course is usually spanned for two years, split into four semesters which makes thea graduate eligible for getting employed as a teacher.The primary aim to take up a B.Ed course is, to learn the art of teaching.`,
        vision: `The College of Education seeks to graduate educators who inspire students, understand the significance of cultural diversity, and be agents of social transformation towards equity and excellence.`,
        mission: [
          "College of Education is committed to prepare students as lifelong learners.",
          "Create and promote learning environments that are informed by an understanding of the context of culture, power, history, community and knowledge production.",
          "Implement the pedagogical and content skills, knowledge and dispositions that prepare all students for 21st-century realities.",
          "According to NEP-2020, educationally- sound, multidisciplinary, and integrated Teacher Education programmes to be made available by the end of 2023.",
        ],
        faculty: [
          {
            name: "Prof. K Subba Rao",
            designation: "Professor & Principal",
            email: "ksr.edu@aknu.edu.in",
            img: "https://aknu.edu.in/UCEDU/Images/Departments/Education/Dr.%20K%20Subba%20Rao.jpg",
            profileLink: "#",
          },
          {
            name: "Dr. R Sambasiva Rao",
            designation: "Assistant Professor(Ad-hoc) & Course Co-ordinator",
            email: "rssr.edu@aknu.edu.in",
            img: "https://aknu.edu.in/UCEDU/Images/Departments/Education/Mr.%20R%20Sambasiva%20Rao.jfif",
            profileLink: "#",
          },
          {
            name: "Dr. M Gopala Krishna",
            designation: "Assistant Professor(Ad-hoc)",
            email: "mgk.edu@aknu.edu.in",
            img: "https://aknu.edu.in/UCEDU/Images/Departments/Education/Dr.%20M%20Gopala%20Krishna.jfif",
            profileLink: "#",
          },
          {
            name: "Dr. G Elisha Babu",
            designation: "Assistant Professor(Ad-hoc)",
            email: "elisha.edu@aknu.edu.in",
            img: "https://aknu.edu.in/UCEDU/Images/Departments/Education/Dr.%20G%20Elisha%20Babu.jpg",
            profileLink: "#",
          },
          {
            name: "Dr. V Ramakrishna",
            designation: "Assistant Professor(Ad-hoc)",
            email: "vrk.edu@aknu.edu.in",
            img: "https://aknu.edu.in/UCEDU/Images/Departments/Education/Mr.%20V%20Ramakrishna.jpg",
            profileLink: "#",
          },
          {
            name: "Dr.J Rajamani",
            designation: "Assistant Professor(Ad-hoc)",
            email: "rajamani.edu@aknu.edu.in",
            img: "https://aknu.edu.in/UCEDU/Images/Departments/Education/JRM%20.jpg",
            profileLink: "#",
          },
          {
            name: "Dr. N Sujatha",
            designation: "Assistant Professor(Ad-hoc)",
            email: "sujatha.edu@aknu.edu.in",
            img: "https://aknu.edu.in/UCEDU/Images/Departments/Education/Dr.%20N%20Sujatha.jfif",
            profileLink: "#",
          },

          {
            name: "Smt. K S Raja Rajeswari Devi",
            designation: "Assistant Professor(Ad-hoc)",
            email: "devi.edu@aknu.edu.in",
            img: "https://aknu.edu.in/UCEDU/Images/Departments/Education/Smt.%20K%20S%20Raja%20Rajeswari%20D.jfif",
            profileLink: "#",
          },
        ],
      },
      {
        name: "Physical Education",
        profile: {
          img: "https://aknu.edu.in/UCEDU/Images/Departments/Physical%20Education/Dr%20KBSN.JPG",
          name: "Dr. K Bala Satyanarayana",
          designation: "Course Co-ordinator",
          phone: "8297936888",
          email: "phyedu.uced@aknu.edu.in",
          qualifications: "",
        },
        about: `The M.P.Ed course was established in 2017 with the support of Vice-Chancellor Prof. MurruMutyalu Naidugaru and the leadership of Dr. K. Subbarao, Principal of the University College of Education. The course is taught by experienced faculty members.

This program focuses on Physical Education, covering topics like sports science, sports medicine, sports psychology, exercise physiology, communication skills, and practical training.

The M.P.Ed course is a two-year program divided into four semesters. It combines classroom theory and hands-on practical sessions to provide a holistic learning experience.

The primary objective of the course is to prepare world-class sports instructors, coaches, and physical education teachers. Graduates are equipped to contribute to the field of sports and physical education, serving the nation with excellence and dedication.`,
        vision: `To explore the abilities and enhance the physical fitness components of the students for healthful living and sports performance.`,
        mission: [
          "To offer courses in Physical Education so that it will enable the students to have a better understanding of their Health and Fitness.",
          "To safeguard and promote the physical fitness and traditional culture, values and professionalism.",
          "To develop state of the infrastructure to facilitate high quality student centric physical education.",
        ],
        faculty: [
          {
            name: "Dr. VVMU Phaneendra",
            designation: "Assistant Professor(Ad-hoc)",
            email: "phaneendra.phyedu@aknu.edu.in",
            img: "https://aknu.edu.in/UCEDU/Images/Departments/Physical%20Education/Dr.%20VVMU%20Phanindra.jpg",
            profileLink: "#",
          },
          {
            name: "Dr. K Bala Satyanarayana",
            designation: "Assistant Professor(Ad-hoc) & Course Co-ordinator",
            email: "kbs.phyedu@aknu.edu.in",
            img: "https://aknu.edu.in/UCEDU/Images/Departments/Physical%20Education/Dr%20KBSN.JPG",
            profileLink: "#",
          },
          {
            name: "Dr. B Rama Gopal",
            designation: "Assistant Director & Secretary Sports Board (Ad-hoc)",
            email: "brg.phyedu@aknu.edu.in",
            img: "https://aknu.edu.in/UCEDU/Images/Departments/Physical%20Education/Dr.%20B%20Rama%20Gopal1.jpeg",
            profileLink: "#",
          },
          {
            name: "Mr. V Soloman Devanand",
            designation: "Coach(Ad-hoc)",
            email: "vsd.phyedu@aknu.edu.in",
            img: "https://aknu.edu.in/UCEDU/Images/Departments/Physical%20Education/Mr.%20V%20Soloman%20Devanand.jpg",
            profileLink: "#",
          },
          {
            name: "Dr. MVSS Narayanamurthy",
            designation: "Coach(Ad-hoc)",
            email: "mvssnm.phyedu@aknu.edu.in",
            img: "https://aknu.edu.in/UCEDU/Images/Departments/Physical%20Education/Mr.%20MVSS%20Narayanamurthy.jfif",
            profileLink: "#",
          },
          {
            name: "Mr. Ch. V Subrahmanyam",
            designation: "Coach(Ad-hoc)",
            email: "chvs.phyedu@aknu.edu.in",
            img: "https://aknu.edu.in/UCEDU/Images/Departments/Physical%20Education/Mr.%20Ch.%20V%20Subrahmanyam(1).jpg",
            profileLink: "#",
          },
        ],
      },
      // Other departments omitted for brevity, same structure
    ];

    const [openDept, setOpenDept] = useState(null);
    const [innerOpen, setInnerOpen] = useState({});

    const handleInnerDropdown = (deptIdx, sectionIdx) => {
      setInnerOpen((prev) => ({
        ...prev,
        [deptIdx]: prev[deptIdx] === sectionIdx ? null : sectionIdx,
      }));
    };

    return (
      <div className="max-w-screen-lg  max-w-screen-xl  px-6">
        {/* Departments Section */}
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-wide capitalize mb-6 ">
          Departments
        </h2>
        <div className="space-y-6">
          {departments.map((dept, idx) => (
            <div
              key={dept.name}
              className="border border-gray-300 rounded-lg shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenDept(openDept === idx ? null : idx)}
                className="w-full flex justify-between items-center px-6 py-4 bg-green-100 hover:bg-green-200 transition font-semibold text-green-900 text-lg"
                aria-expanded={openDept === idx}
                aria-controls={`${dept.name}-details`}
              >
                {dept.name}
                <svg
                  className={`w-6 h-6 transform transition-transform duration-300 ${
                    openDept === idx ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {openDept === idx && (
                <div
                  id={`${dept.name}-details`}
                  className="bg-white p-6 space-y-6"
                >
                  {/* Profile and About Section */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="col-span-1 flex flex-col items-center bg-green-700 rounded-lg p-6 text-white shadow-lg">
                      <img
                        src={dept.profile.img}
                        alt={dept.profile.name}
                        className="w-48 h-48 object-cover rounded-md border-4 border-white shadow-md mb-6"
                      />
                      <div className="font-bold text-lg text-left w-full">
                        {dept.profile.name}
                      </div>
                      <div className="text-sm mt-1 w-full">
                        {dept.profile.designation}
                      </div>
                      <div className="text-sm w-full mt-1">
                        {dept.profile.phone}
                      </div>
                      <div className="text-sm w-full mt-1 break-words">
                        {dept.profile.email}
                      </div>
                      <div className="text-sm w-full mt-3">
                        {dept.profile.qualifications}
                      </div>
                    </div>

                    <div className="col-span-3 bg-white rounded-lg p-6 shadow-inner">
                      <h3 className="text-green-700 font-semibold text-xl mb-3">
                        About Department
                      </h3>
                      <p className="text-gray-700 text-justify leading-relaxed">
                        {dept.about}
                      </p>
                    </div>
                  </div>

                  {/* Inner Dropdowns Section */}
                  <div className="space-y-6">
                    {[/* "Vision", "Mission", */ "Faculty"].map((section, i) => (
                      <InnerDropdown
                        key={section}
                        title={section}
                        isOpen={innerOpen[idx] === i}
                        onClick={() => handleInnerDropdown(idx, i)}
                      >
                        {/* {section === "Vision" && <div>{dept.vision}</div>}
                        {section === "Mission" && (
                          <ul className="list-disc list-inside space-y-1 text-gray-700">
                            {dept.mission.map((m, mi) => (
                              <li key={mi}>{m}</li>
                            ))}
                          </ul>
                        )} */}
                        {section === "Faculty" && (
                          <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse border border-gray-300 text-left text-sm">
                              <thead className="bg-green-100 text-green-800 font-semibold">
                                <tr>
                                  <th className="border border-gray-300 px-3 py-2">
                                    S.No
                                  </th>
                                  <th className="border border-gray-300 px-3 py-2">
                                    Name of the Teacher
                                  </th>
                                  <th className="border border-gray-300 px-3 py-2">
                                    Designation
                                  </th>
                                  <th className="border border-gray-300 px-3 py-2">
                                    Email
                                  </th>
                                  <th className="border border-gray-300 px-3 py-2">
                                    Image
                                  </th>
                                  <th className="border border-gray-300 px-3 py-2">
                                    Profile
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {dept.faculty.map((f, fi) => (
                                  <tr
                                    key={f.email}
                                    className="odd:bg-white even:bg-green-50"
                                  >
                                    <td className="border border-gray-300 px-3 py-2">
                                      {fi + 1}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2">
                                      {f.name}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2">
                                      {f.designation}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 break-words">
                                      {f.email}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2">
                                      <img
                                        src={f.img}
                                        alt={f.name}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2">
                                      <a
                                        href={f.profileLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-green-700 underline hover:text-green-900"
                                      >
                                        View Profile
                                      </a>
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
      </div>
    );
  }
  return (
    <section className="page-content pt-16 px-4">
      <div className="college-page-content">
        <div className="flex flex-col gap-8">
          {/* Top Image */}
          <div className="relative flex justify-center">
            <img
              src="https://aknu.edu.in/UCEDU/Images/Education.jfif"
              alt="College of Education"
              className="rounded-lg w-full max-w-7xl object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center rounded-b-lg">
              <blockquote className="text-white text-center px-6 text-xl font-semibold italic max-w-3xl py-4">
                "Education is the passport to the future, for tomorrow belongs
                to those who prepare for it today."
              </blockquote>
            </div>
          </div>

          {/* About Section */}
          <div className="w-[95vw] px-12 max-w-[95vw] mx-auto mt-8 mb-2 text-teal-700 text-left">
            <h2 className="text-3xl  text-left text-green-800 mb-6 mt-12">
              About the College
            </h2>
            <p className=" text-[#303630] mt-4 text-justify text-[16px]">
              The University College of Education in Adikavi Nannaya University
              established in 2014 is recognized by the National Council for
              Teacher Education, Bangalore with an annual intake of 100
              students. Now as per the new regulations of NCTE, annual intake is
              50. The mode of admission is through the Education Common Entrance
              Test (APEDCET) conducted by government of Andhra Pradesh.
            </p>
            <p className="mt-4 text-[16px]">
              This university college of education is focused on Teacher quality
              and the strength of educator’s leadership. The College of
              Education has established a good reputation for excellence and
              visionary thinking in its efforts to improve teaching and learning
              across the state of Andhra Pradesh, particularly within the
              context of importing conceptual knowledge.
            </p>
          </div>

          {/* Principal Section */}
          <div className="flex flex-col md:flex-row items-start gap-8 bg-gray-100 p-6 rounded-lg">
            <img
              src="https://aknu.edu.in/UCEDU/Images/Dr%20kondru%20subba%20rao.jpg"
              alt="Principal"
              className="w-60 h-60 md:w-80 md:h-80 rounded-lg shadow-lg object-cover"
            />
            <div className="text-left">
              <h5 className="text-xl font-bold mb-4">Principal</h5>
              <p>
                <strong>Name:</strong> Prof. K Subba Rao
              </p>
              <p>
                <strong>Designation:</strong> Principal
              </p>
              <p>
                <strong>Phone:</strong> +91 0883 2566059, 7093008473
              </p>
              <p>
                <strong>Email:</strong> principal.uced@aknu.edu.in
              </p>
              <p className="mt-4">
                Principal's Message Prof. Kondru Subba Rao is a visionary leader
                in Teacher Education with over 24 years of experience. As
                Principal of the University College of Education, he oversees a
                range of programs from diploma to master's levels. He holds
                prestigious positions such as Dean of Faculty of Education and
                Chairman of the Board of Studies in Education and Physical
                Education. With multiple degrees, including a Ph.D. in Education
                and qualifications in Botany, English, Psychology, and
                Education, Prof. Rao exemplifies multidisciplinary expertise.
                His innovative teaching methods and oratory skills inspire
                students to think critically. He has guided 14 M.Phil. scholars,
                contributed to NCTE's curriculum framework, and actively
                participates in professional bodies, seminars, and journals.
                Prof. Rao's commitment to enhancing the quality of Teacher
                Education continues to shape future educators and leaders.
              </p>
            </div>
          </div>
          {/* Department Section */}
          {CACDepartment()}
          <CoursesOffered />

          {/* Know AKNU Section */}
          <div className="flex flex-col md:flex-row items-start gap-8 bg-blue-50 p-6 rounded-lg">
            {/* Text Content */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-4 text-teal-800">
                Know AKNU
              </h2>
              <p className="mb-4 text-gray-700">
                Founded in 1980, AKNU Deemed to be University stands at the
                intersection of multidisciplinary applied education and
                translational research. With 12 schools across Bengaluru,
                Hyderabad, and Visakhapatnam, AKNU empowers students to discover
                their ikigai through global perspectives, industry
                collaborations, and holistic development.
              </p>
              <p className="mb-4 text-gray-700">
                Guided by integrity and the pursuit of knowledge and moral
                values, AKNU shapes future-ready citizens who drive
                entrepreneurship, innovation, and create meaningful societal
                impact.
              </p>
              <div className="flex gap-4">
                <button
                  className={`px-4 py-2 ${
                    activeTab === "vision"
                      ? "text-blue-800 border-b-2 border-blue-800"
                      : "text-gray-600"
                  } hover:text-blue-800`}
                  onClick={() => setActiveTab("vision")}
                >
                  Vision
                </button>
                <button
                  className={`px-4 py-2 ${
                    activeTab === "mission"
                      ? "text-blue-800 border-b-2 border-blue-800"
                      : "text-gray-600"
                  } hover:text-blue-800`}
                  onClick={() => setActiveTab("mission")}
                >
                  Mission
                </button>
              </div>
              <div className="mt-4">
                {activeTab === "vision" && visionContent}
                {activeTab === "mission" && missionContent}
              </div>
            </div>

            {/* Image Content */}
            <div className="flex-1">
              <img
                src="https://www.gitam.edu/sites/default/files/banners/know-gitam_0.jpg"
                alt="Know AKNU"
                className="rounded-lg shadow-lg object-cover w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AknuMain;
