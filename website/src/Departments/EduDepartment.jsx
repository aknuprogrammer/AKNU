import React, { useState } from "react";
// import { subDepartsWithFullData } from "../siteData/STdepartmentsData";
import {
  artsANDScience,
  collegeEducation,
  K_Ramaneswari,
  satyanarayana,
  satyanarayana26,
  satyanarayanas,
} from "../assets";

import {
  hodUdhay,
  edubulding,
  ramakrishna,
  elishababu,
  subbaraos,
  gopalakrishna,
  sujatha,
  varahaladora,
  jrm,
  sambasivarao,
  rajarajeswari,
  kbsn,
  ramagopal,
  phanindra,
  subrahmanyam,
  narayanamurthy,
  solomandevanand,
  educationBEdPdf,
} from "../assets";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AiOutlineFilePdf } from "react-icons/ai";
import { BackButton } from "../components/BackButton";
import DepartmentSeminars from "../components/DepartmentSeminars.jsx";

const departments = [
  {
    title: "EDUCATION",
    image:
      "https://plus.unsplash.com/premium_photo-1681426558755-71090cebadff?q=80&w=1470&auto=format&fit=crop",
    programs: 10,
  },
  {
    title: "PHYSICAL EDUCATION",
    image:
      "https://plus.unsplash.com/premium_photo-1681426558755-71090cebadff?q=80&w=1470&auto=format&fit=crop",
    programs: 10,
  },
];

const subDepartsWithFullData = [
  {
    name: "Education",
    profile: {
      img: sambasivarao,
      name: "Dr. R Sambasiva Rao",
      designation: "Course Co-ordinator",
      phone: "+91 9912282676",
      email: "rssr.edu@aknu.edu.in",
      qualifications: "M.Sc, M.Ed, Ph.D",
    },
    about:
      "One of the most respectful professions chosen by the Graduates globally is Teaching Profession where they are responsible for catering knowledge among students and young learners in a strategic manner. It is teachers who alone can contribute and build a healthy academic system for a nation to grow.In order to become a teacher by profession, one has to qualify the graduation degree followed by a mandatory course called Bachelor of Education (B.Ed). B.Ed course is usually spanned for two years, split into four semesters which makes thea graduate eligible for getting employed as a teacher.The primary aim to take up a B.Ed course is, to learn the art of teaching. To transform knowledge from one individual teacher to a class of students is not easy. Hence, in the B.Ed course, would be teachers are taught how to gain attention from students so that they actively participate and learn in class and various Teaching Skills would be inculcated. The College of Education was established in the year 2014 with one well experienced Principal and 8 (Eight) senior faculty members who had vast experiences in Teacher Education.",
    // vision: `The College of Education seeks to graduate educators who inspire students, understand the significance of cultural diversity, and be agents of social transformation towards equity and excellence.`,
    // mission: [
    //   "College of Education is committed to prepare students as lifelong learners.",
    //   "Create and promote learning environments that are informed by an understanding of the context of culture, power, history, community and knowledge production",
    //   "Implement the pedagogical and content skills, knowledge and dispositions that prepare all students for 21st-century realities",
    //   "According to NEP-2020, educationally- sound, multidisciplinary, and integrated Teacher Education programmes to be made available by the end of 2023.",
    // ],
    programsOffered: [
      {
        sno: 1,
        name: "B.Ed",
        syllabus: educationBEdPdf,
        intake: 50,
      },
    ],
    faculty: [
      {
        name: "Prof. K Subba Rao",
        designation: "Professor & Principal",
        email: "ksr.edu@aknu.edu.in",
        img: subbaraos, // Replace with actual image path if available
        profileLink: "Profile", // Replace with actual profile link if available
        // qualifications: [
        //   { label: "Ph.D.", value: "Qualified" },
        //   { label: "MCA.", value: "Qualified" },
        //   { label: "B.Sc.", value: "Qualified" },
        // ],
        // // experience: "3 years of Industrial and 23 years of Academic Experience",
        // publications:
        //   "Journals published: National: 5, International - 31. Conferences presented: National - 3, International: 12, PhdsGuided: Awarded 1, Submitted 1, guided 4 under process, Books Authored: 2, Awards: 3: Mother Therissa, Bharat nari, Best faculty. Foreign Visits for Academic/Research purpose: 1, Workshops/Conferences/Seminars: Organized: 10, Attended: 10",
        // brief: [
        //   "1) Qualified APSET,TSSET, GATE-2023, GATE-2024, GATE-2025 in Mathematical Sciences.",
        //   "2) Presently, I am Pursuing Ph.D.in Mathematics at Andhra University.",
        //   "3) I have completed M.Phil. in Applied Mathematics from Andhra University in 2022.",
        //   "4) I have completed 2 NPTEL FDPs.",
        //   "5) I have completed 1 Online FDP.",
        //   "6) I am acting as Faculty Associate to Skill Development Center, AKNU.",
        //   "7) E-content development: 16 videos on the topic Theoretical Computer Science which are uploaded in LMS portal of the University website. https://aknu.edu.in/LMS/msc3.php",
        //   "8) Published 4 research articles and presented paper in 1 National Conference.",
        // ],
      },
      {
        name: "Dr. R Sambasiva Rao",
        designation: "Assistant Professor (Ad-hoc) & Course Co-ordinator",
        email: "rssr.edu@aknu.edu.in",
        img: sambasivarao, // Replace with actual image path if available
        profileLink: "Profile",
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "M.Ed.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
          { label: "B.Ed.", value: "Qualified" },
        ],
        experience:
          "He worked as a  Lecturer in Mathematics Methodology at G.B.R.College of Education from 2003 to 2009. He also worked as a  Principal of G.B.R.College of Education, Anaparthi from 2009 to 2014.",
        publications:
          "Journals published: National: 12, International - 9. Conferences presented: International: 5,Research/Consultancy Projects on hand: 1, Books Authored: 8, Awards: 1: Best TeacherAward, Research India Foundation, Odisha, 2023. Foreign Visits for Academic/Research purpose: 1, Workshops/Conferences/Seminars: Organized: 8, Attended: 33",
        brief: [
          "Dr. R.Samba Siva Rao is a dynamic teacher educator in Mathematics. He possesses M.Sc (Maths), M.Ed, Ph.D., qualified UGC NET and APSET in Education. He began his teaching career in 2000 as a Lecturer in Mathematics Methodology at Vikas College of Education, Vissannapeta.",
          "He worked as a  Lecturer in Mathematics Methodology at G.B.R.College of Education from 2003 to 2009. He also worked as a  Principal of G.B.R.College of Education, Anaparthi from 2009 to 2014. At present he is working as an Assistant Professor, University College of Education, Adikavi Nannaya University, Rajahmundry, East  Godavari District, Andhra Pradesh.",
          "He has participated in National and International Seminars and Workshops. She has presented Research Papers, Articles in various reputed National and International Journals, Periodicals.",
          "He had a Design Patent on AI Based Device for Student Education Learning. He is the Co-PI of ICSSR sponsored Tribal Project. He is the author of B.Ed., text Books published by Telugu and Sanskrit Academy, Andhra Pradesh.",
          "He is the paper setter for B.Ed, M.Ed., examinations of various universities. He is also a paper setter for competitive examinations.",
          "He has been a Life Member of Research India Foundation. He is the Review member of International Journals",
        ],
      },
      {
        name: "Dr. M Gopala Krishna",
        designation: "Assistant Professor (Ad-hoc)",
        email: "mgk.edu@aknu.edu.in",
        img: gopalakrishna,
        profileLink: "Profile",
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "M.Ed.", value: "Qualified" },
          { label: "M.A.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
          { label: "B.Ed.", value: "Qualified" },
        ],
        // experience: "3 years of Industrial and 23 years of Academic Experience",
        publications:
          "Journals published: National: 24, International - 12. Conferences presented: National - 7, International: 5, Books Authored: 23, Awards: 6: 1.Best Teacher Award, Lions Club, 2008. 2.Rastriya Vidya Saraswathi Purskar, IOM, New Delhi, 2010. 3.Bharath Vidya Sree NTA, 2018. 4.Bharath Vidya Bhushan, NTA, 2020. 5.Best Teacher Award , AKNU, 2022. 6.MoTher Teresa Service Award,NGOS, Collaborations with National/International Institutions: 1, Patents (Awarded/Published): 1, Workshops/Conferences/Seminars: Organized: 4, Attended: 65",
        brief: [
          "Dr.M.Gopalakrishna is a stalwart and a revolutionary visionary in the field of Teacher Education. He holds several Degrees in Various Universities and also man of divergent capabilities.",
          "He conducting motivational, psychological career programs in different levels of Govt & NGOS.",
          "I act successful member of several professional bodies and also Editorial Board member.",
          "As a author in Govt 15 books, private 16 books published, I acting as a Resource person in National & Inter national seminars, Conferences__etc.I organized  6 ICSSR National seminars as a Convener and Co convener, received 6 Awards,Question paper setter in various universities, our University  act as a NSS Program officer, programs coordinator. ",
        ],
      },
      {
        name: "Dr. G Elisha Babu",
        designation: "Assistant Professor (Ad-hoc)",
        email: "elisha.edu@aknu.edu.in",
        img: elishababu,
        profileLink: "Profile",
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "MA.", value: "Qualified" },
          { label: "M.Ed.", value: "Qualified" },
          { label: "M.Phil", value: "Qualified" },
          { label: "B.A", value: "Qualified" },
        ],
        experience:
          "I worked as a lexturer 5 years in st Mary's College of education,Worked as principal 2years in williams college of Education,worked as principal 4years in VVS College of education.",
        publications:
          "Journals published: National: 10, International - 8. Conferences presented: National - 25, International: 5, Books Authored: 2, Awards: 2: 1. Adarsh vidhya Saraswathi rastriya purskar. 2.Global Management,2022. Patents (Awarded/Published): 1, Workshops/Conferences/Seminars: Organized: 2, Attended: 30",
        brief: [
          "I Dr.Gubbala Elisha babu working as Assistant Professor in University college of Education,Adikavi nannaya university,Rajahmahendravaram.",

          "Auther the text books of B Ed Course to Andhra University and Dr.B.R.Ambedkar central University.",
        ],
      },
      {
        name: "Dr. V Ramakrishna",
        designation: "Assistant Professor (Ad-hoc)",
        email: "vrk.edu@aknu.edu.in",
        img: ramakrishna,
        profileLink: "Profile",
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "B.A.", value: "Qualified" },
          { label: "M.A.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
        ],
        // experience: "3 years of Industrial and 23 years of Academic Experience",
        publications:
          "Journals published: International: 15. Conferences presented: National - 11, International: 1, Books Authored: 1, Awards: 1: ADARSH VIDYA SARASWATI RASTRIYA PURASKAR- Glacier Journal of Scientific Research, GLOBAL MANAGEMENT COUNCIL, AHMEDABAD. 2022. Foreign Visits for Academic/Research purpose: 1, Workshops/Conferences/Seminars: Organized: 2 NATIONAL SEMINAR & WEBINAR, Attended: WORKSHOPS-10, CONFERENCES-4, SEMINARS-17, WEBINARS-21, FDPs-4",
        brief: [
          "I, Dr. Vinakoti Ramakrishna, am working as an Assistant Professor (Ad-hoc) in university college of education, Adikavi Nannaya universityam.",
          "I am an accomplished academician and researcher with a rich educational background and extensive experience in the field of education. I holds multiple degrees, including BA (1995) and MA (2001) from Andhra University, an MEd (2003) from Andhra University, an MSc (2012) from Dr. B.R. Ambedkar Open University, and an MPhil (2008) from Madurai Kamaraj University.",
          "I earned PhD from Krishna University in 2022, and cleard APSET (2012) and UGC NET (2013) in Education. And I have demonstrated strong leadership in organizing academic events, such as serving as the convener for an ICSSR National Seminar in 2018 and a National Webinar in 2022.",
          "And I received the prestigious award *Adarsh Vidya Saraswati Rashtriya Puraskar* from the Glacier Journal of Scientific Research, Ahmedabad, in 2022, recognizing my contributions to education.",
          "I have published 15 research papers in international journals and presented 11 papers at national seminars, in addition to one international conference.",
          "I have actively participated in various academic events, including 10 workshops, 4 conferences, 17 seminars, 21 webinars, and 4 Faculty Development Programs (FDPs).",
        ],
      },
      {
        name: "Dr. J Rajamani",
        designation: "Assistant Professor (Ad-hoc)",
        email: "rajamani.edu@aknu.edu.in",
        img: jrm,
        profileLink: "Profile",
        // qualifications: [
        //   { label: "Ph.D.", value: "Qualified" },
        //   { label: "MCA.", value: "Qualified" },
        //   { label: "B.Sc.", value: "Qualified" },
        // ],
        // // experience: "3 years of Industrial and 23 years of Academic Experience",
        // publications:
        //   "Journals published: National: 5, International - 31. Conferences presented: National - 3, International: 12, PhdsGuided: Awarded 1, Submitted 1, guided 4 under process, Books Authored: 2, Awards: 3: Mother Therissa, Bharat nari, Best faculty. Foreign Visits for Academic/Research purpose: 1, Workshops/Conferences/Seminars: Organized: 10, Attended: 10",
        // brief: [
        //   "1) Qualified APSET,TSSET, GATE-2023, GATE-2024, GATE-2025 in Mathematical Sciences.",
        //   "2) Presently, I am Pursuing Ph.D.in Mathematics at Andhra University.",
        //   "3) I have completed M.Phil. in Applied Mathematics from Andhra University in 2022.",
        //   "4) I have completed 2 NPTEL FDPs.",
        //   "5) I have completed 1 Online FDP.",
        //   "6) I am acting as Faculty Associate to Skill Development Center, AKNU.",
        //   "7) E-content development: 16 videos on the topic Theoretical Computer Science which are uploaded in LMS portal of the University website. https://aknu.edu.in/LMS/msc3.php",
        //   "8) Published 4 research articles and presented paper in 1 National Conference.",
        // ],
      },
      {
        name: "Dr. N Sujatha",
        designation: "Assistant Professor (Ad-hoc)",
        email: "sujatha.edu@aknu.edu.in",
        img: sujatha,
        profileLink: "Profile",
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "M.A.", value: "Qualified" },
          { label: "M.Ed.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
          { label: "B.Ed.", value: "Qualified" },
        ],
        experience:
          "Dr. N. Sujata, Ph.D. in Education from Andhra University, specializes in teacher educators’ attitudes toward Computer-Assisted Instruction. With a strong multidisciplinary background and extensive experience as an Assistant Professor in University College of Education and also held the position of Assistant Placement Officer at UCED",
        publications:
          "Journals published: International - 23. Conferences presented: National - 3, International: 1, Books Authored: Books-01/Book chapters Authored-02, Awards: 1: Adarsh Vidya Saraswathi Rashtriya Puraskar,Global Management Council., Patents (Awarded/Published): 1, Workshops/Conferences/Seminars: Organized: workshop-01/Seminars-02, Attended: workshop-13/conferences-04/seminars-44/FDP-09",
        brief: [
          "Dr. N. Sujata, Ph.D. in Education from Andhra University, specializes in teacher educators’ attitudes toward Computer-Assisted Instruction. With a strong multidisciplinary background and extensive experience as an Assistant Professor in University College of Education and also held the position of Assistant Placement Officer at UCED.",
          "She is now contributing her expertise as a Faculty Associate at the College Development Council. She has published research papers in reputed journals including CARE-listed and Scopus-indexed and has authored books on e-learning and educational technology.",
          "She has actively presented and published papers at various national, international seminars, conferences and FDPs. she has organized key academic events including   ICSSR sponsored National Seminar, APSSDC workshop and National webinar on NEP2020.",
          "Her participation in UGC-approved professional development programs, including NEP 2020 trained by IGNOU, reflects her commitment to continuous learning and academic excellence.",
          "She is a member in English Language Teachers’ Association of India (ELTAI), she worked as Research paper referee for international journals (IJES, JHE, JSS, S-HCS, JSSA).",
          "Additionally, she has served as an internal auditor for international organization for standardization (ISO), and has taken on academic responsibilities as co-convener, observer, subject expert, External examiner, inspection committee member for UG & PG courses.",
          "She is actively involved in promoting digital education, inclusive learning, and teacher training, reflecting her deep commitment to educational innovation and the integration of technology in teaching and learning.",
        ],
      },

      {
        name: "Smt. K S Raja Rajeswari Devi",
        designation: "Assistant Professor (Ad-hoc)",
        email: "devi.edu@aknu.edu.in",
        img: rajarajeswari,
        profileLink: "Profile",
        // qualifications: [
        //   { label: "Ph.D.", value: "Qualified" },
        //   { label: "MCA.", value: "Qualified" },
        //   { label: "B.Sc.", value: "Qualified" },
        // ],
        // // experience: "3 years of Industrial and 23 years of Academic Experience",
        // publications:
        //   "Journals published: National: 5, International - 31. Conferences presented: National - 3, International: 12, PhdsGuided: Awarded 1, Submitted 1, guided 4 under process, Books Authored: 2, Awards: 3: Mother Therissa, Bharat nari, Best faculty. Foreign Visits for Academic/Research purpose: 1, Workshops/Conferences/Seminars: Organized: 10, Attended: 10",
        // brief: [
        //   "1) Qualified APSET,TSSET, GATE-2023, GATE-2024, GATE-2025 in Mathematical Sciences.",
        //   "2) Presently, I am Pursuing Ph.D.in Mathematics at Andhra University.",
        //   "3) I have completed M.Phil. in Applied Mathematics from Andhra University in 2022.",
        //   "4) I have completed 2 NPTEL FDPs.",
        //   "5) I have completed 1 Online FDP.",
        //   "6) I am acting as Faculty Associate to Skill Development Center, AKNU.",
        //   "7) E-content development: 16 videos on the topic Theoretical Computer Science which are uploaded in LMS portal of the University website. https://aknu.edu.in/LMS/msc3.php",
        //   "8) Published 4 research articles and presented paper in 1 National Conference.",
        // ],
      },
    ],
  },

  //   {
  //     name: "Physical Education",
  //     profile: {
  //       img: phanindra,
  //       name: "Dr. VVMU Phaneendra",
  //       designation: "Course Co-ordinator",
  //       phone: "8297936888",
  //       email: "phyedu.uced@aknu.edu.in",
  //       qualifications: "M.A., Ph.D., UGC-NET",
  //     },
  //     about: `M.P.Ed course was established in the year 2017 because of great support and interest on Physical Education course by the present Vice-Chancellor Prof. MurruMutyalu Naidugaru. Under the Leadership of Dr.K.Subbarao, Principal, University College of Education, experienced faculty members are working for the course.

  // M.P.Ed. course focuses on Physical Education discipline. The course deals with subjects such as – sports science, sports medicine, sports psychology, exercise physiology, communication skills and practical training etc.`,
  //     vision: `To explore the abilities and enhance the physical fitness components of the students for healthful living and sports performance.`,
  //     mission: [
  //       "  To offer courses in Physical Education so that it will enable the students to have a better understanding of their Health and Fitness. To safeguard and promote the physical fitness and traditional culture, values and professionalism. To develop state of the infrastructure to facilitate high quality student centric physical education.",
  //     ],
  //     programsOffered: [
  //       {
  //         sno: 1,
  //         name: "M.P.Ed",
  //         syllabus: "https://www.aknu.edu.in/UCEDU/Syllabus/M.P.Ed.pdf",
  //         intake: 40,
  //       },
  //     ],
  //     faculty: [
  //       {
  //         name: "Dr. VVMU Phaneendra",
  //         designation: "Assistant Professor (Ad-hoc)",
  //         email: "phaneendra.phyedu@aknu.edu.in",
  //         img: phanindra, // Replace with actual image path if available
  //         profileLink: "Profile", // Replace with actual profile link if available
  //       },
  //       {
  //         name: "Dr. K Bala Satyanarayana",
  //         designation: "Assistant Professor (Ad-hoc)",
  //         email: "kbs.phyedu@aknu.edu.in",
  //         img: kbsn,

  //         profileLink: "Profile",
  //       },
  //       {
  //         name: "Dr. B Rama Gopal",
  //         designation: "Assistant Director (Ad-hoc)",
  //         email: "brg.phyedu@aknu.edu.in",
  //         img: ramagopal,
  //         profileLink: "Profile",
  //       },
  //       {
  //         name: "Mr. V Soloman Devanand",
  //         designation: "Coach (Ad-hoc)",
  //         email: "vsd.phyedu@aknu.edu.in",
  //         img: solomandevanand,
  //         profileLink: "Profile",
  //       },
  //       {
  //         name: "Dr. MVSS Narayanamurthy",
  //         designation: "Coach (Ad-hoc)",
  //         email: "mvssnm.phyedu@aknu.edu.in",
  //         img: narayanamurthy,
  //         profileLink: "Profile",
  //       },
  //       {
  //         name: "Mr. Ch. V Subrahmanyam",
  //         designation: "Coach (Ad-hoc)",
  //         email: "chvs.phyedu@aknu.edu.in",
  //         img: subrahmanyam, // Corrected the image name (it was mistakenly a duplicate in your input)
  //         profileLink: "Profile",
  //       },
  //     ],
  //   },
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

export default function EduDepartment() {
  const navigate = useNavigate();
  const [openDept, setOpenDept] = useState(null);
  const [innerOpen, setInnerOpen] = useState({});
  const [openProfile, setOpenProfile] = useState(null); // Track open faculty profile
  const [activeTab, setActiveTab] = useState("vision");
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
    <div className="">
      <div className="relative w-full h-56 sm:h-72 md:h-96">
        <img
          src={collegeEducation}
          alt="University College of Education"
          className="object-cover w-full h-full "
        />
      </div>








      <div className="px-4 sm:px-16 py-4">
        <BackButton />
      </div>

      <div className="px-4 sm:px-16 text-teal-700 text-left">
        <h2 className="text-3xl sm:text-3xl font-bold text-teal-800 mb-6">
          About the College of Education
        </h2>
        <p className=" text-[#303630] mt-4 text-justify text-[16px]">
          The University College of Education in Adikavi Nannaya University
          established in 2014 is recognized by the National Council for Teacher
          Education, Bangalore with an annual intake of 100 students. Now as per
          the new regulations of NCTE, annual intake is 50. The mode of
          admission is through the Education Common Entrance Test (APEDCET)
          conducted by government of Andhra Pradesh. This university college of
          education is focused on Teacher quality and the strength of educator’s
          leadership. The College of Education has established a good reputation
          for excellence and visionary thinking in its efforts to improve
          teaching and learning across the state of Andhra Pradesh, particularly
          within the context of importing conceptual knowledge. The faculty
          remains committed to addressing the educational, physical and
          Psychological needs of all learners across the life span, and to
          working closely with educators, leaders and policymakers in the field.
          The College of Education continues to improve education in our global
          society through a three-part mission: leadership, scholarship and
          service. Under the able guidance of the present Vice-Chancellor
          Prof.Murru Mutyalu Naidu garu, M.P.Ed course was established in the
          academic year 2017-18 in order to cater the needs of Physical
          Education very particularly the need of UG Physical Education
          Colleges. The faculty members were appointed as per NCTE norms.
          {/*  */}
          The College of Education is headed by Principal Prof. K Subba Rao and
          eight other faculty in different methodologies, majority of them are
          well experienced and also Ph.D degree holders. This University College
          strives for the Quality of Education in shaping young talented
          teachers under the stewardship of Prof. K Subba Rao who has 23 years
          of experience in the field of Education.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 sm:gap-4 border-b border-gray-200 mb-4 px-4 sm:px-16">
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
            The College of Education seeks to produce educators who inspire
            students, understand the significance of cultural diversity, and be
            the agents of social transformation toward equity and excellence.
          </p>
        )}
        {activeTab === "mission" && (
          <ul className="list-disc pl-6">
            <li>
              {" "}
              The College of Education is committed to prepare students as
              lifelong educators who create and promote learning environments
              that are based on the understanding of culture, power, history,
              community and knowledge generation.{" "}
            </li>
            <li>
              Disseminate pedagogical knowledge and dispositions that prepare
              students for 21st-century realities.
            </li>
            <li>
              Develop educationally- sound, multidisciplinary teachers that
              contribute to the development of society and nation.
            </li>
          </ul>
        )}
      </div>
      <h2 className="text-3xl sm:text-3xl font-bold text-teal-800 px-4 sm:px-16 text-left mb-6 mt-8">
        Principal
      </h2>
      <div className="flex flex-col md:flex-row mt-4 sm:mt-6 px-4 sm:px-16">
        <div className="bg-teal-700 flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-4 md:pb-6 lg:pt-6 lg:pb-4 px-4 sm:px-6 md:px-6 lg:px-8 w-full md:w-1/3 lg:w-1/4 shadow">
          <div className="relative w-50 h-55 sm:w-36 sm:h-50 md:w-40 md:h-50 lg:w-50 lg:h-57 overflow-hidden border-2 sm:border-[3px] md:border-4 border-white shadow-md">
            <img
              src={subbaraos}
              alt="Prof. K Subba Rao"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="text-white font-bold md:text-base lg:text-lg mt-2 text-center w-full px-2">
            Prof. K Subba Rao
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
            Principal
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
            +91 0883 2566059, 7093008473
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
            principal.uced@aknu.edu.in
          </div>
        </div>

        <div className="bg-[#f4e4c9] px-4 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-center py-4 sm:py-5 md:py-4 w-full md:w-2/3 lg:w-3/4 shadow">
          <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 text-center md:text-left">
            About Principal
          </h3>
          <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[#374151] text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] text-justify leading-5 sm:leading-6 md:leading-6">
            <p>
              Prof. KondruSubba Rao is a stalwartand a revolutionary visionary in
              the field of Teacher Education. He heads the University Colleges of
              Education as Principal, offering a platter of coursesin education
              ranging from diploma to masters level. He holds several prestigious
              portfolios like the Dean Faculty of Education, Chairman, Board of
              Studies in Education, Physical Education and also the Coordinator
              for Sports Board representing AdikaviNannaya University,
              Rajamahendravaram.
            </p>
            <p>
              Prof. Subba Rao holds several degrees in various
              disciplines proving to be a man of divergent capabilities. He has
              obtained his Ph.D. in Education from Andhra University and M.Phil.,
              from Madurai Kamraj University, Tamilnadu,.He studied M.Sc(Botany)
              from Bhopal University, M.A.(English) from Alagappa University,
              Tamil Nadu,M.Sc (Psychology) from M.S. University, Tamil Nadu
              andM.Ed from Andhra University, Visakhapatnam. His oratory skills
              along with wide range of interests, knowledge and skills make him an
              innovative teacher where he instills thoughts in his studentswhich
              he has been doing since the past 24 years.
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
                      {section === "Seminars/Workshops / Conference" && (
                        <DepartmentSeminars college="University College of Education" department={dept.name} />
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
