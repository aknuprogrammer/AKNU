import {
  Menu,
  X,
  Info,
  BadgeCheck,
  BookOpen,
  FlaskConical,
  Wallet,
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  Users,
  Landmark,
  UserRound,
  Rocket,
  HelpCircle,
  Briefcase,
  Sheet,
  FileText,
  User,
  MessageCircle,
  Clipboard,
  BookOpenCheck,
  Layers,
  Building2,
  Users2,
  UserCog,
  Newspaper,
  ScrollText,
  Microscope,
  Home,
  ShieldCheck,
  BookmarkCheck,
  FileTextIcon,
  HeartHandshake,
  School,
  Headset,
  BadgeHelp,
  LucideHeadset,
  HeadsetIcon,
} from "lucide-react";
import {
  AMR,
  ashok,
  jagan,
  jyothirmai,
  nooka,
  persis,
  pochayam,
  prasanthi,
  Nirmala,
  psv,
  ps,
  tashok,
  sudhakar,
  udhay,
  vijaya,
  venkateswaraRao,
  subbarao,
  kvswamy,
  keziarani,
  signifiCantDay,
  kakinadaCampus,
  accolades,
  tadepalligudemCampus,
  TPGCampus,
} from "../assets";
import { useFolderFiles } from "../utils/pdfLocation";
import { certificates } from "../utils/url";

// changed the menut items
const menuItems = [
  {
    label: "Home",
    icon: Home,
    href: "/",
  },
  // {
  //   label: "About Us",
  //   icon: Info,
  //   href: "#",
  //   submenu: [
  //     { label: "About AKNU", href: "/#about-aknu" },
  //     // { label: "Affiliated Colleges", href: "/CampusLife" },
  //     // { label: "Universities on", href: "#" },
  //     { label: "Executive Council", href: "/executive-council" },
  //     { label: "Vice Chancellor", href: "/AboutVC" },
  //     // { label: "Registrar", href: "#" },
  //     // { label: "Faculty", href: "/faculty-section" },
  //     // { label: "Admin Roles", href: "#" },

  //     { label: "Why Choose Us", href: "/#why-choose-us" },
  //     // { label: "Programs for you", href: "/#programme-for-you" },
  //     { label: "Glance @ AKNU", href: "/#glance-aknu" },
  //     { label: "Campuses", href: "/#campuses" },
  //     { label: "Our Collaboration", href: "/#partnerships" },
  //     { label: "Key Members @ AKNU", href: "/#faculty-section" },
  //     { label: "Finance", href: "/FinancePage" },
  //   ],
  // },
  {
    label: "About Us",
    icon: Info,
    href: "#",
    submenu: [
      { label: "About Us", href: "/#about-aknu" },
      { label: "AKNU Campuses", href: "/#campuses" },
      {
        label: "Accreditation",
        icon: BadgeCheck,
        // href: "#",
        subsubmenu: [
          {
            label: "Certifications",
            // href: "#",
            dynamicKey: "certifications",
            // subsubmenu: [],
            subsubsubmenu: [
              {
                label: "QS RANK-AKNU",
                href: "/certificatepdf/QS RANK-AKNU.pdf"
              },
              {
                label: "2(F) - certificate",
                href: "/certificatepdf/AKNU-2F.pdf",
              },
              {
                label: "12(B) - certificate",
                href: "/certificatepdf/AKNU-University Establishment Act.pdf",
              },
              {
                label: "NAAC - certificate",
                href: "/certificatepdf/AKNU -NAAC Certificate.pdf",
              },
              {
                label: "AISHE - certificate",
                href: "/certificatepdf/AKNU-AISHE.pdf",
              },
              {
                label: "AICTE - certificate",
                href: "/certificatepdf/LoA AICTE 2022-23 04-11-2022.pdf",
              },
              {
                label: "NCTE - certificate",
                href: "/certificatepdf/AKNU-NCTE.pdf",
              },
              {
                label: "Academic Administrative Audit",
                href: "/certificatepdf/academic_administrative_audit.pdf",
              },
              {
                label: "Gender Sensitization Audit",
                href: "/certificatepdf/gender_sensitization_audit.pdf",
              },
              {
                label: "ISO 90012015",
                href: "/certificatepdf/ISO_90012015.pdf",
              },
              {
                label: "ISO 140012015",
                href: "/certificatepdf/ISO_140012015.pdf",
              },
              {
                label: "ISO 500012018",
                href: "/certificatepdf/ISO_500012018.pdf",
              },
            ],
          },
        ],
      },
      { label: "Accolades", href: "/accolades" },
      // { label: "Universities on", href: "#" },
      { label: "Development Plan", href: "/development-plan" },
      { label: "Glance @ AKNU", href: "/#glance-aknu" },
      // { label: "Faculty", href: "/faculty-section" },
      // { label: "Admin Roles", href: "#" },
      // { label: "Programs for you", href: "/#programme-for-you" },
      // { label: "Recognition", href: "/#glance-aknu" },
      { label: "Annual Reports", href: "/annual-reports" },
      // {
      //   label: "Why choose us",
      //   href: "/#why-choose-us",
      // },
      { label: "Statutes", href: "/statutes" },
      // { label: "Campus Experience", href: "/campus-experience" },
      { label: "Campus Life", href: "/campusLife" },
    ],
  },
  {
    label: "Administration",
    icon: ShieldCheck,
    href: "#",
    submenu: [
      // {
      // label: "Certifications",
      // href: "#",
      // dynamicKey: "certifications",
      // subsubmenu: [],
      // subsubmenu: [
      //   {
      //     label: "2(F) - certificate",
      //     href: "https://www.aknu.edu.in/links/Certificates/AKNU-2F.pdf",
      //   },
      //   {
      //     label: "12(B) - certificate",
      //     href: "https://www.aknu.edu.in/links/Certificates/AKNU-12%20B.pdf",
      //   },
      //   {
      //     label: "NAAC - certificate",
      //     href: "https://www.aknu.edu.in/links/Certificates/AKNU%20-NAAC%20Certificate.pdf",
      //   },
      //   {
      //     label: "AISHE - certificate",
      //     href: "https://www.aknu.edu.in/links/Certificates/AKNU-AISHE.pdf",
      //   },
      //   {
      //     label: "AICTE - certificate",
      //     href: "https://www.aknu.edu.in/links/Certificates/LoA%20AICTE%202022-23%2004-11-2022.pdf",
      //   },
      //   {
      //     label: "NCTE - certificate",
      //     href: "https://www.aknu.edu.in/links/Certificates/AKNU-NCTE.pdf",
      //   },
      //   {
      //     label: "Green and Environment Award",
      //     href: "https://www.aknu.edu.in/links/Certificates/GEE-award.pdf",
      //   },
      //   {
      //     label: "Gender Sensitization Audit",
      //     href: "https://www.aknu.edu.in/links/Certificates/Gender%20Sensitization%20Audit.pdf",
      //   },
      //   {
      //     label: "ISO 14001:2015",
      //     href: "https://www.aknu.edu.in/links/Certificates/Environmental%20Managemment%20System.pdf",
      //   },
      //   {
      //     label: "ISO 50001:2018",
      //     href: "https://www.aknu.edu.in/links/Certificates/Energy%20Management%20System.pdf",
      //   },
      //   {
      //     label: "ISO 9001:2015",
      //     href: "https://www.aknu.edu.in/links/Certificates/9001:2015.pdf",
      //   },
      // ],
      // },
      { label: "Chancellor", href: "/#about-chancellor" },
      { label: "Vice-Chancellor", href: "/#about-vc" },
      { label: "Executive Council", href: "/executive-council" },
      { label: "Registrar", href: "/#about-registrar" },
      { label: "Finance Officer", href: "/FinancePage" },
      { label: "Academic Leadership", href: "/#faculty-section" },

      // { label: "Committee", href: "/committee_cells" },
      // { label: "Sustainable Development", href: "/sustainabledevelopment" },
      // { label: "Policies", href: "#" },
      // { label: "Women Cell", href: "/womencell" },
      // { label: "Feedback", href: "/feedback" },
    ],
  },
  {
    label: "Academics",
    icon: GraduationCap,
    href: "#",
    submenu: [
      { label: "Academic Affairs", href: "/academic_affairs" },
      // { label: "Regulations", href: "#" },
      // { label: "Academic Programs", href: "/#departments" }, ///sub menu need to be added
      // { label: "Academic Calendar", href: "/academic-calendar" }, ///sub menu need to be added
      // { label: "Statutes", href: "/statutes" }, ///sub menu need to be added
      {
        label: "Colleges",
        subsubmenu: [
          { label: "College of Arts & Commerce", href: "/CACdepartment" }, ///sub menu need to be added
          { label: "College of Science & Technology", href: "/STdepartment" }, ///sub menu need to be added
          { label: "College of Engineering", href: "/Engdepartment" }, ///sub menu need to be added
          { label: "College of Education", href: "/Edudepartment" }, ///sub menu need to be added
          // { label: "College of Pharmacy ", href: "/EduPharmacy" },
          {
            label: "AKNU Tadepalligudem Campus",
            href: "/tadepalligudem/campus-life",
          },
          { label: "AKNU MSN Campus Kakinada", href: "/kakinada/campus-life" },
        ],
      }, ///sub menu need to be added
      // { label: "Online Programs", href: "/coming-soon" },
      { label: "Academic Collaborations", href: "/#partnerships" },
      // { label: "Research", href: "#" }, ///sub menu need to be added
    ],
  },
  {
    label: "Admissions",
    icon: BookOpen,
    href: "#",
    submenu: [
      {
        label: "Directorate of Admissions",
        href: "/directorate-of-admissions",
      },
      { label: "Undergraduate", href: "/AdmissionPage?type=ug" },
      { label: "Postgraduate", href: "/AdmissionPage?type=pg" },
      { label: "Ph.D", href: "/coming-soon" },
      // { label: "UG Syllabus", href: "/ug-syllabus" },
      // { label: "PG Syllabus", href: "/pg-syllabus" },
      {
        label: "How to Apply",
        href: "/AdmissionPage?register=true",
      },
    ],
  },
  {
    label: "CDC",
    icon: School,
    href: "/affiliatedColleges",
  },
  {
    label: "Examination",
    icon: BookmarkCheck,
    href: "#",
    submenu: [
      {
        label: "Examination Cell",
        href: "/controller-of-examinations",
      },
      {
        label: "Circulars",
        href: "/?item=Circular&sub=CDC%20Circulars#important-links",
      },
      {
        label: "Notification",
        href: "/?item=Examination&sub=Notifications#important-links",
      },
      {
        label: "Application",
        href: "/examination-application",
      },
      {
        label: "Time Table",
        href: "/?item=Examination&sub=Time Table#important-links",
      },
      {
        label: "Jumbling Centres",
        href: "/?item=Examination&sub=Jumbling Centres#important-links",
      },
      {
        label: "Results",
        href: "/?item=Examination&sub=Results#important-links",
      },
    ],
  },
  {
    label: "R&D",
    icon: Microscope,
    href: "#",
    submenu: [
      { label: "Board of Research Studies", href: "/board-research-studies" },
      {
        label: "Research Guides",
        href: "/recognized-research-guides",
      },
      { label: "Research Opportunities", href: "/roi" },
      // { label: "Thesis Section", href: "/thesis-section" },
      { label: "Ph.D Awardees", href: "/phd-awardees" },
      { label: "Research Projects", href: "/research-projects" },
      { label: "Research Awards", href: "/research-awards" },
      { label: "MoU's", href: "/mou" },
      { label: "Patents", href: "/patents" },

      { label: "Circulars & Applications", href: "/circularsAndApplications" },
    ],
  },
  {
    label: "Central Facilities",
    icon: Building2,
    href: "#",
    submenu: [
      { label: "Central Library", href: "/facilities/library" },
      { label: "Boys Hostel", href: "/facilities/hostel/boys" },
      { label: "Girls Hostel", href: "/facilities/hostel/girls" },
      { label: "Sports Board", href: "/sportboard" },
      {
        label: "NSS",
        href: "#",
        subsubmenu: [
          {
            label: "About NSS",
            href: "/AboutNss",
          },
          {
            label: "Major Activities NSS",
            href: "/MajorActivitiesNss",
          },
          {
            label: "Regular Activities NSS",
            href: "/RegularActivitiesNss",
          },
          {
            label: "Significant Day NSS",
            href: signifiCantDay,
          },
          {
            label: "Special Camps NSS",
            href: "/SpecialCampNss",
          },
        ],
      },
      { label: "University Health Centre", href: "/university-health-centre" },
      { label: "Media Cell", href: "/media-cell" },
      { label: "Computer Centre", href: "/director-computer-centre" },
    ],
  },
  {
    label: "Support Facilities",
    icon: HeadsetIcon,
    href: "#",
    submenu: [
      {
        label: "UGC Cell",
        href: "/ugc",
      },
      {
        label: "IQAC",
        href: "/iqac",
      },
      {
        label: "SC/ST Cell",
        href: "/sc-st-cell",
      },
      {
        label: "Equal Opportunity Cell",
        href: "/equal-opportunity-cell",
      },
      {
        label: "Women's Cell",
        href: "/womencell",
      },
      {
        label: "Grievance Redressal Cell",
        href: "/grievance-redressal-cell",
      },
      // {
      //   label:"Anti Ragging Committee", href:"/antiraggingcell"
      // },
    ],
  },

  // {
  //   label: "Fee",
  //   icon: Wallet,
  //   href: "#",
  //   submenu: [
  //     { label: "Fee Structure", href: "/fee-structure" },
  //     // { label: "Scholarships", href: "#" },
  //     {
  //       label: "Pay Fee",
  //       // href: "/fee-pay",
  //       subsubmenu: [
  //         {
  //           label: "Application fee",
  //           href: "/coming-soon",
  //         },
  //         {
  //           label: "Examination fee",
  //           href: "/exam-fee",
  //         },
  //         {
  //           label: "Apply For Certificate Fee",
  //           href: "/redirection",
  //         },
  //         {
  //           label: "Revalution fee",
  //           href: "/coming-soon",
  //         },
  //         {
  //           label: "Ratification fee",
  //           href: "/coming-soon",
  //         },
  //         {
  //           label: "Affiliation fee",
  //           href: "/affiliation-fee",
  //         },
  //         {
  //           label: "Hostel fee",
  //           href: "/hostel-fee",
  //         },
  //         {
  //           label: "Sports fee",
  //           href: "/sports-fee",
  //         },
  //         {
  //           label: "Condonation fee",
  //           href: "/coming-soon",
  //         },
  //         // =========================================
  //         // {
  //         //   label: "Exam Fee",
  //         //   href: "/exam-fee",
  //         // },
  //         // {
  //         //   label: "Apply Certificates",
  //         //   // href: "/fee-pay",
  //         //   href: "/redirection",
  //         // },
  //         // {
  //         //   label: "Affliation Fee",
  //         //   href: "/affiliation-fee",
  //         // },
  //         // {
  //         //   label: "Ratification fee/late",
  //         //   href: "/",
  //         // },
  //         // {
  //         //   label: "Department/colleges condonation fee",
  //         //   href: "/",
  //         // },

  //         // {
  //         //   label: "Re-valuation fee",
  //         //   href: "/",
  //         // },
  //         // {
  //         //   label: "Admission fee",
  //         //   href: "/admission-fee",
  //         // },

  //         // {
  //         //   label: "Inspection fee",
  //         //   href: "/",
  //         // },

  //         // {
  //         //   label: "ICGS & Sports fee",
  //         //   href: "/sports-fee",
  //         // },
  //         // {
  //         //   label: "Hostel fee",
  //         //   href: "/hostel-fee",
  //         // },
  //       ],
  //     },
  //     { label: "Fee Refund Policy", href: "/fee-refund-policy" },
  //   ],
  // },
];

const infoLinks = [
  {
    label: "Placements",
    link: "/Placement",
    icon: UserCog,
  },
  // {
  //   label: "CDC",
  //   link: "/affiliatedColleges",
  //   icon: Users,
  // },
  // {
  //   label: "Examination",
  //   link: "/?item=Examination#important-links",
  //   icon: BookOpen,
  // },
  {
    label: "Alumni",
    link: "/alumni",
    external: true,
    icon: Landmark,
  },
  { label: "Faculty", link: "/faculty-section", icon: UserRound },
  // {
  //   label: "Results",
  //   link: "/?item=Results#important-links",
  //   icon: ScrollText,
  // },
  {
    label: "Circulars",
    link: "/?item=Circular&sub=CDC%20Circulars#important-links",
    icon: FileText,
  },
  // {
  //   label: "Entrepreneurship",
  //   link: "https://vdc.AKNU.edu/",
  //   external: true,
  //   icon: Rocket,
  // },
  {
    label: "News",
    link: "/#latest-news",
    // external: true,
    icon: Newspaper,
  },

  {
    label: "Events",
    link: "/#latest-news",
    // external: true,
    icon: CalendarDays,
  },
  {
    label: "Current Openings",
    link: "/?item=Jobs#important-links",
    icon: Briefcase,
  },
  {
    label: "Tenders",
    link: "/?item=Tenders#important-links",
    icon: FileTextIcon,
  },

  // {
  //   label: "Women Cell",
  //   link: "/womencell",
  //   // external: true,
  //   icon: ShieldCheck,
  // },
];

const whyChooseUs = [
  {
    icon: GraduationCap,
    title: "Top-ranked Academics",
    description:
      "AKNU offers UGC-recognized programs led by expert faculty and global partnerships.",
  },
  {
    icon: Building2,
    title: "State-of-the-art Campus",
    description:
      "Modern labs, digital classrooms, and eco-friendly infrastructure across all campuses.",
  },
  {
    icon: Users2,
    title: "Holistic Student Support",
    description:
      "Academic and career mentoring, Sports activities, and Placement services.",
  },
  {
    icon: Users2,
    title: "Women Friendly Campus",
    description:
      "safe and supportive campus environment for female students and staff, promoting their well-being and success.",
  },
];

const glanceData = [
  { value: "100K+", label: "Active Students", color: "text-yellow-500" },
  {
    value: "90K+",
    label: "Alumni across India",
    color: "text-green-600",
  },
  {
    value: "200+",
    label: "Teaching Staff",
    color: "text-red-500",
    description: "Regular Faculty 26+ And Adhoc Faculty 186",
  },
  {
    value: "95% +",
    label: "Faculty with PhDs in most disciplines",
    color: "text-blue-500",
  },
  { value: "800+", label: "Publications", color: "text-purple-600" },
  { value: "392", label: "Affiliated Colleges", color: "text-pink-500" },
  { value: "10+", label: "Research Projects", color: "text-indigo-600" },
  { value: "100+", label: "Patents", color: "text-emerald-500" },
];

const humansData = [
  {
    id: "1",
    name: "Prof. K. V. Swamy",
    designation: "Registrar",
    department: "",
    description:
      "An esteemed leader, spearheading initiatives to uplift the socio-economic status of tribal populations. Recently awarded a ₹3.65 Cr funding by the Department of Science and Technology.",
    mainImg: kvswamy,
    alt: "Prof K Swamy",
  },
  {
    id: "2",
    name: "Prof. D. Jyothirmai",
    designation: "Principal, UCAC - Professor",
    department: "COLLEGE OF ARTS & COMMERCE",
    description: `A professor of English literature with 16 years of PG and 25 years of over all teaching experience. Have been teaching Poetry, literary criticism and theory since 2008 for the students of M.A. English. `,
    mainImg: jyothirmai,
    alt: "Prof. D Jyothirmai",
  },
  // {
  //   id: "3",
  //   name: "Prof. N Udaya Bhaskar",
  //   designation: "Head of the Department & Chairman, Board of Studies",
  //   description:
  //     "A passionate academician and social influencer, inspired by projects like the Guinness World Record lighting initiative, impacting over 900 homes.",
  //   mainImg:
  //     "https://aknu.edu.in/UCAC/Images/Departments/DCMS/uday%2009-12-2022.jpg",
  //   alt: "Prof. N Udaya Bhaskar",
  // },
  // {
  //   id: "3",
  //   name: "Dr. P Suresh Varma",
  //   designation: "Professor",
  //   description:
  //     "A pioneer in sustainability, known for her innovative and eco-friendly startup ventures, making a lasting impact on the environment.",
  //   mainImg: psv,
  //   alt: "Dr. D Lakshmi Narasamma",
  // },
  // {
  //   id: "4",
  //   name: "Dr. B. Jagan Mohan Reddy",
  //   designation: "Professor, Placement Officer",
  //   description:
  //     "Award-winning innovator, recently honored with 'Asia's Young Achiever' award for groundbreaking contributions to design and creativity.",
  //   mainImg: jagan,
  //   alt: "Dr. A Lavanya Kumari",
  // },
  {
    id: "5",
    name: "Prof. S. Prasanthi Sri",
    designation: "Professor - Principal",
    department: "AKNU KAKINADA Campus",
    description:
      "Prof.S.Prasanthi Sri is the Principal of the MSN CAMPUS KAKINADA AP.She has been serving in this role for several years also Professor in the Department of English at the same campus.",
    mainImg: prasanthi,
    alt: "Dr. D Lakshmi Narasamma",
  },
  // {
  //   id: "6",
  //   name: "PERSIS VOOLA",
  //   designation: "ASSOCIATE PROFESSOR - DIRECTOR IQAC",
  //   description:
  //     "My objective is to pursue a versatile and goal-oriented career in Computer Science and Engineering thereby enhancing my skills for the holistic development of the organization and grow myself along with the organization.",
  //   mainImg: persis,
  //   alt: "Dr. N Sajna Raj",
  // },

  // {
  //   id: "7",
  //   name: "Alavala Matta Reddy",
  //   designation:
  //     "Associate Professor in Zoology - Dean, CDC, & Head, Biotechnology",
  //   description: "Joined in Adikavi Nannaya University on 5th Nov 2008.",
  //   mainImg: AMR,
  //   alt: "Dr. D Lakshmi Narasamma",
  // },
  // {
  //   id: "8",
  //   name: "Prof. K. S Ramesh",
  //   designation: "Professor",
  //   description:
  //     "A pioneer in sustainability, known for her innovative and eco-friendly startup ventures, making a lasting impact on the environment.",
  //   mainImg: "",
  //   alt: "Dr. D Lakshmi Narasamma",
  // },
  // {
  //   id: "9",
  //   name: "MANDAPATI POCHAYYA ",
  //   designation:
  //     "Assistant Professor - Head of the department and chief Warden ",
  //   description:
  //     "My educational qualifications are M.A., B.ED., APSET, UGCNET. I teach the study of language, communication skills and criticism.",
  //   mainImg: pochayam,
  //   alt: "Dr. D Lakshmi Narasamma",
  // },
  // {
  //   id: "10",
  //   name: "Nooka Ratnam Kinthada",
  //   designation: "Associate Professor - Member of Executive Council",
  //   description:
  //     "Dr. K. Nooka Ratnam holds a Ph.D. in Remote Sensing and GIS Applications to Water Resource Management and brings over 23 years of experience spanning both industry and academia. Her expertise lies in Geospatial Information Technology and Civil & Environmental Engineering. She has successfully managed diverse projects and has been recognized with prestigious awards, including the Senior Research Fellowship (SRF) from the Council of Scientific and Industrial Research (CSIR), India. ",
  //   mainImg: nooka,
  //   alt: "Dr. D Lakshmi Narasamma",
  // },
  // {
  //   id: "11",
  //   name: "Dr. N Udaya Bhaskar",
  //   designation:
  //     "Professor - HoD, Department of Commerce and Management Studies, Dean I/c, Students Affairs",
  //   description: "Enthusiastic to Learn and Adoptable ",
  //   mainImg: udhay,
  //   alt: "Dr. D Lakshmi Narasamma",
  // },
  // {
  //   id: "12",
  //   name: "Dr P Vijaya Nirmala",
  //   designation:
  //     "Assc Professor in zoology - Principal University College of science & Technology, Dean Research & Development ",
  //   description: "Joined in May 2007 , hardworking , overall good human being ",
  //   mainImg: vijaya,
  //   alt: "Dr. D Lakshmi Narasamma",
  // },
  // {
  //   id: "13",
  //   name: "Prof. K. Subbarao",
  //   designation: "Professor",
  //   description:
  //     "A pioneer in sustainability, known for her innovative and eco-friendly startup ventures, making a lasting impact on the environment.",
  //   mainImg: "",
  //   alt: "Dr. D Lakshmi Narasamma",
  // },
  {
    id: "14",
    name: "Prof. T. Ashok",
    designation: "Professor - Principal",
    department: "AKNU TADEPALLIGUDEM Campus",
    description: "Committed to academic excellence and leadership.",
    mainImg: tashok,
    alt: "Dr. D Lakshmi Narasamma",
  },
  {
    id: "15",
    name: "Dr. P. Vijaya Nirmala",
    designation: "Professor - Principal",
    department: "COLLEGE OF SCIENCE & TECHNOLOGY",
    description: "Driven by passion and a pursuit of innovation.",
    mainImg: Nirmala,
    alt: "Dr. D Lakshmi Narasamma",
  },
  {
    id: "15",
    name: "Dr. B. Kezia Rani",
    designation: "Principal",
    department: "UNIVERSITY COLLEGE OF ENGINEERING",
    description: "Empowering students through knowledge and guidance.",
    mainImg: keziarani,
    alt: "Dr. B Kezia Rani",
  },
  {
    id: "15",
    name: "Dr. K. Subba Rao",
    designation: "Principal",
    department: "COLLEGE OF EDUCATION",
    description: "A beacon of learning and educational leadership.",
    mainImg: subbarao,
    alt: "Prof. K Subba Rao",
  },

  //venkateswaraRao
  // {
  //   id: "15",
  //   name: " Prof. S Prasanthi Sri",
  //   designation: "Principal",
  //   description:
  //     "It is my privilege to act as a Principal for a Historical College in Kakinada. The Institute was named after Malladi Satyalinga Naicker, a great visionary, land donor and the man behind many lives. The power in the name of the Campus makes me alert and much more responsible to sustain his vision and maintain the fame of this esteemed Institution. ",
  //   mainImg: ps,
  //   alt: "Dr. D Lakshmi Narasamma",
  // },
  // {
  //   id: "15",
  //   name: "Prof. S. Prasanthi Sri",
  //   designation: "Professor",
  //   description:
  //     "A pioneer in sustainability, known for her innovative and eco-friendly startup ventures, making a lasting impact on the environment.",
  //   mainImg: prasanthi,
  //   alt: "Dr. D Lakshmi Narasamma",
  // },
];

const testimonials = [
  {
    text: "The students here are incredibly friendly, and the faculty is highly professional and supportive. The entire environment—people, campus, and city—is truly beautiful.",
    author: "Raju T, M.Tech(CST), Rajamoundry, India",
  },
  {
    text: "For me, AKNU feels like a second home—a place full of warmth, support, and inspiration. The teachers are incredibly encouraging, the students are welcoming, and even the peaceful vibe of the campus adds to the experience. I’m proud to be part of this amazing journey.",
    author: "Muhammad Ali, MCA, Vijayawada, india",
  },
  {
    text: "AKNU has been a place of incredible growth for me—I’ve learned and experienced so much in such a short time. Every class has been engaging",
    author: "Manoj Kumar, Mechanical Engineering, Eluru India",
  },
  {
    text: "AKNU is one of those rare universities where opportunities are everywhere. Over the past two years, I’ve had the chance to engage with industry leaders and even host several major events",
    author: "Neeharika Duvvuri, B Tech, kakinada, India",
  },
  {
    text: "I had the privilege of pursuing my master’s degree at AKNU. The university didn’t just provide strong theoretical foundations—it also helped me understand the real-world applications of my subject.",
    author: "Shruthi Dantuluri, B Tech Tadepalligudem, India",
  },
  {
    text: "Studying at AKNU was a truly memorable experience—one I’ll cherish for a lifetime. The faculty and department went above and beyond to guide and shape my future, support every step of the way",
    author: "Sneha, Vizag, India",
  },
];

const campusData = [
  {
    name: "Rajamahendravaram",
    image: "https://farm4.static.flickr.com/3304/4588463757_a6c914deb3_b.jpg",
    description:
      "Located on the banks of the Godavari River, the Rajamahendravaram campus offers a serene academic environment infused with cultural heritage and modern facilities.",
    link: "/",
  },
  {
    name: "Tadepalligudem",
    image: TPGCampus,
    description:
      "The Tadepalligudem campus stands out with its focus on agricultural innovation, sustainable practices, and a close-knit academic community.",
    link: "/tadepalligudem/campus-life",
  },
  {
    name: "Kakinada",
    image: kakinadaCampus,
    description:
      "Strategically located near the coast, the Kakinada campus is known for its strong engineering and maritime education, supported by excellent research facilities.",
    link: "/kakinada/campus-life",
  },
];

const ContactPageData = [
  {
    title: "VC's OFFICE",
    bgGradient: "bg-gradient-to-br from-[#2b5876] to-[#4e4376]",
    Icon: User, // lucide-react icon component
    details: [
      "Rajamahendravaram-533296, Andhrapradesh State, India.",
      "vc@aknu.edu.in",
      "0883-2566030",
    ],
  },
  {
    title: "REGISTRAR's OFFICE",
    bgGradient: "bg-gradient-to-br from-[#3a7bd5] to-[#00d2ff]",
    Icon: Clipboard,
    details: [
      "Rajamahendravaram-533296, Andhrapradesh State, India.",
      "registrar@aknu.edu.in",
      "0883-2566030",
    ],
  },
  {
    title: "PG EXAMINATIONS",
    bgGradient: "bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]",
    Icon: BookOpenCheck,
    details: [
      "Rajamahendravaram-533296, Andhrapradesh State, India.",
      "registrar@aknu.edu.in",
      "0883-2566030",
    ],
  },
  {
    title: "UG EXAMINATIONS",
    bgGradient: "bg-gradient-to-br from-[#614385] to-[#516395]",
    Icon: Layers,
    details: [
      "Rajamahendravaram-533296, Andhrapradesh State, India.",
      "registrar@aknu.edu.in",
      "0883-2566013",
    ],
  },
  {
    title: "Tadepalligudem",
    bgGradient: "bg-gradient-to-br from-[#2b5876] to-[#4e4376]",
    Icon: User, // lucide-react icon component
    details: [
      "Tadepalligudem, Andhra Pradesh 534101, India.",
      "principal.tpg@aknu.edu.in",
      "9848490422",
    ],
  },
  {
    title: "Kakinada",
    bgGradient: "bg-gradient-to-br from-[#3a7bd5] to-[#00d2ff]",
    Icon: Clipboard,
    details: [
      "Thimmapuram, Kakinada, Andhra Pradesh 533005, India.",
      "principal.kkd@aknu.edu.in",
      "0883-2566030",
    ],
  },
  {
    title: "Admissions",
    bgGradient: "bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]",
    Icon: BookOpenCheck,
    details: [
      "Rajamahendravaram-533296, Andhrapradesh State, India.",
      "admissions@aknu.edu.in",
      "0883-2566030",
    ],
  },
  {
    title: "Hostels",
    bgGradient: "bg-gradient-to-br from-[#614385] to-[#516395]",
    Icon: Layers,
    details: [
      "Rajamahendravaram-533296, Andhrapradesh State, India.",
      "hostels@aknu.edu.in",
      "0883-2566013",
    ],
  },
];

export {
  menuItems,
  infoLinks,
  glanceData,
  humansData,
  testimonials,
  campusData,
  ContactPageData,
  whyChooseUs,
};
