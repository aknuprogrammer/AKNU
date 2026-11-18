import {
  ChartBarIcon,
  UserGroupIcon,
  CreditCardIcon,
  DocumentTextIcon,
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  NewspaperIcon,
  SpeakerWaveIcon,
  PencilSquareIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  HomeIcon,
  DocumentPlusIcon,
  UserPlusIcon,
  MapIcon,
  PhotoIcon,
  AcademicCapIcon,
  IdentificationIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  TruckIcon,
  BuildingOfficeIcon,
  ArrowUpOnSquareIcon,
  CloudArrowUpIcon,
  ArrowDownOnSquareIcon,
  Cog6ToothIcon,
  BuildingOffice2Icon,
  InboxIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  ClockIcon,
  FileUp,
  Image,
  Newspaper,
  SparklesIcon,
  IdCardLanyard,
  //
  CircleGauge,
  School,
  Percent,
  RotateCw,
  Repeat2,
  ScrollText,
  ClipboardCheck,
  ShieldUser,
  BadgeIndianRupee,
  CalendarDays,
  CalendarMinus2,
  CalendarClock,
  NotebookTabs,
  TicketCheck,
  Banknote,
  Calendar1,
  FileText,
  Building,
  Server,
  Settings,
  ClipboardList,
  CheckSquare,
  BookOpen,
  BubblesIcon,
  Tv,
  MapPin,
  Route,
  FlaskConical,
  Wrench,
  AlertCircle,
  Package,
  Monitor,
  Calendar,
  Building2,
  UtensilsCrossed,
  FileStack,
  FileWarning,
} from "lucide-react";

const navItems = [
  {
    id: "home",
    label: "Home",
    icon: <HomeIcon className="h-5 w-5" />,
    href: "/",
    allowedRoles: ["admin", "super_admin", "vc", "councellor"], // Restricted
  },
  {
    id: "dashboard",
    label: "My Dashboard",
    icon: <ChartBarIcon className="h-5 w-5" />,
    href: "/dashboard",
    allowedRoles: ["admin", "super_admin"], // Restricted
  },

  {
    id: "myAdmin",
    label: "My Admin",
    icon: <CircleGauge className="h-5 w-5" />,
    allowedRoles: ["super_admin", "vc"],
    // subItems: [
    //   { label: "Adminssions", href: "/admission_selectors?type=admission" },
    //   { label: "Examinations", href: "/examination?type=examination" },
    // ],
    subItems: [
      {
        id: "Configuration",
        label: "Configuration",
        icon: <CogIcon className="h-5 w-5" />,
        // href: "/admission_selectors",
        allowedRoles: ["admin", "counsellor", "super_admin", "vc"],
        subItems: [
          // {
          //   label: "Configuration",
          //   href: "/admission_selectors?type=configuration",
          // },
          {
            label: "Admissions",
            href: "/admission_selectors?type=admission",
            icon: <BookOpen className="h-5 w-5" />,
          },
          {
            label: "Examinations",
            href: "/examination/master-data",
            icon: <AcademicCapIcon className="h-5 w-5" />,
          },
          {
            label: "Communication",
            href: "/admission-communication",
            icon: <ChatBubbleLeftIcon className="h-5 w-5" />,
          },
        ],
      },
      // {
      //   id: "Adminssions",
      //   label: "Adminssions",
      //   icon: <BookOpen className="h-5 w-5" />,
      //   // href: "/admission_selectors",
      //   allowedRoles: ["admin", "counsellor", "super_admin"],
      //   subItems: [
      //     // {
      //     //   label: "Administration",
      //     //   href: "/admission_selectors?type=admission",
      //     // },
      //     { label: "Admissions", href: "/admission" },
      //   ],
      // },
      {
        id: "letter-heads",
        label: "Letter Heads",
        icon: <DocumentTextIcon className="h-5 w-5" />,
        // href: "/admission_selectors",
        allowedRoles: ["admin", "super_admin", "vc"],
        subItems: [
          {
            label: "Upload / Create Template",
            href: "/letterhead-design",
            icon: <PencilSquareIcon className="h-5 w-5" />,
          },
          {
            label: "Write & Generate Letter",
            href: "/generate-letter",
            icon: <SparklesIcon className="h-5 w-5" />,
          },
          {
            label: "Tracker",
            href: "/request-letter-heads",
            icon: <ClipboardDocumentListIcon className="h-5 w-5" />
          },
        ],
      },
      {
        id: "liveTracking",
        label: "Field Visit Info",
        icon: <Tv />,
        href: "/faculty-tracking",
        allowedRoles: ["super_admin", "admin"],
      },
      {
        id: "/employee/onboarding",
        label: "Employee Onboarding",
        icon: <UserGroupIcon className="h-5 w-5" />,
        href: "/employee/onboarding",
        allowedRoles: ["super_admin", "admin", "employee"],
      },
      {
        id: "permissions",
        label: "Permissions",
        icon: <ShieldCheckIcon className="h-5 w-5" />,
        href: "/permissions",
        allowedRoles: ["super_admin", "admin", "employee"],
      },
      // {
      //   id: "examinations",
      //   label: "Examinations",
      //   icon: <ClipboardList className="h-5 w-5" />,
      //   href: "/examination?type=examination",
      //   allowedRoles: ["counsellor", "super_admin"],
      // },

      // {
      //   id: "/employee/upload-pay-slip",
      //   label: "Upload Pay Slip",
      //   icon: <CloudArrowUpIcon className="h-5 w-5" />,
      //   href: "/employee/upload-pay-slip",
      //   allowedRoles: ["super_admin", "admin"],
      // },
      {
        id: "holiday-calendar",
        label: "Holiday Calendar",
        icon: <CalendarDays className="h-5 w-5" />,
        href: "/holiday-calendar",
        allowedRoles: ["super_admin", "admin"],
      },
      {
        id: "attandance",
        label: "Attandance",
        icon: <ClipboardCheck className="h-5 w-5" />,
        href: "/employee-attandance",
        allowedRoles: ["super_admin", "admin"],
      },
      {
        id: "communication",
        label: "Communication",
        icon: <ChatBubbleLeftIcon className="h-5 w-5" />,
        href: "/communication",
        allowedRoles: ["super_admin", "admin"],
      },
      {
        id: "hiring-center",
        label: "Hiring Center",
        icon: <UserGroupIcon className="h-5 w-5" />,
        href: "/hiring-center",
        allowedRoles: ["super_admin", "admin"],
      },
      {
        id: "employee-reviews",
        label: "Employee Reviews",
        icon: <ChartBarIcon className="h-5 w-5" />,
        href: "/employee/reviews",
        allowedRoles: ["super_admin", "admin", "vc"],
      },
      // {
      //   id: "employee-leave",
      //   label: "Employee Leave",
      //   icon: <CalendarMinus2 className="h-5 w-5" />,
      //   href: "/employee-leave",
      //   allowedRoles: ["super_admin", "admin"],
      // },
    ],
  },


  {
    id: "employee",
    label: "Employee (EMS)",
    icon: <IdCardLanyard className="h-5 w-5" />,
    allowedRoles: ["super_admin", "employee", "vc", "user"],
    subItems: [
      // {
      //   id: "/employee/departments",
      //   label: "Departments",
      //   icon: <BubblesIcon className="h-5 w-5" />,
      //   href: "/employee/departments",
      // },
  {
        id: "/employee/letter-heads",
        label: "Letter Heads",
        icon: <DocumentTextIcon className="h-5 w-5" />,
        href: "/employee/letter-heads",
        allowedRoles: ["super_admin", "admin", "employee", "vc", "user"],
      },

      {
        id: "/employee/timesheet",
        label: "Time Sheet",
        icon: <ClockIcon className="h-5 w-5" />,
        href: "/employee/timesheet",
        allowedRoles: ["super_admin", "admin", "employee", "vc", "user"],
      },
    
      {
        id: "/employee/leave",
        label: "Leave",
        icon: <CalendarMinus2 className="h-5 w-5" />,
        href: "/employee/leave",
        allowedRoles: ["super_admin", "admin", "employee", "vc"],
      },
      {
        id: "/employee/resignation",
        label: "Resignation",
        icon: <DocumentTextIcon className="h-5 w-5" />,
        href: "/employee/resignation",
        allowedRoles: ["super_admin", "admin", "employee"],
      },
      // {
      //   id: "/employee/attendance",
      //   label: "Attendance",
      //   icon: <ClipboardCheck className="h-5 w-5" />,
      //   href: "/employee/attendance",
      //   allowedRoles: ["super_admin", "admin", "employee"],
      // },
      {
        id: "/employee/pay-slip",
        label: "Payslip",
        icon: <BadgeIndianRupee className="h-5 w-5" />,
        href: "/employee/pay-slip",
        allowedRoles: ["super_admin", "admin", "employee", "vc"],
      },

      {
        id: "performance-Tracker",
        label: "Performance Tracker",
        icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
        allowedRoles: ["admin", "super_admin"],
        subItems: [
          { label: "Ad-hoc Faculty", href: "/Ad-hoc-Faculty" },
          { label: "Ad-hoc Form Upload", href: "/adhocform" },
        ],
      },
      {
        id: "submit-request",
        label: "Submit Query",
        icon: <ClipboardDocumentCheckIcon className="h-5 w-5" />,
        href: "/submit-request",
        allowedRoles: ["super_admin", "admin", "employee", "vc"],
      },
      {
        id: "submit-bills",
        label: "Submit Bills",
        icon: <BadgeIndianRupee className="h-5 w-5" />,
        href: "/submit-bills",
        allowedRoles: ["super_admin", "admin", "employee", "vc"],
      },
      {
        id: "performance-employee",
        label: "Performance Form",
        icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
        href: "/performance/employee",
        allowedRoles: ["super_admin", "admin", "employee"],
      },
      // {
      //   id: "/employee/roles",
      //   label: "Roles",
      //   icon: <ShieldUser className="h-5 w-5" />,
      //   href: "/employee/roles",
      //   allowedRoles: ["super_admin", "admin", "employee"],
      // },

      // {
      //   id: "#employee/attandence",
      //   label: "Attandance",
      //   icon: <ClipboardCheck className="h-5 w-5" />,
      //   href: "#employee/attandance",
      // },

      // {
      //   id: "#employee/taskManegement",
      //   label: "Task Management",
      //   icon: <CheckSquare className="h-5 w-5" />,
      //   href: "#employee/taskManagement",
      // },
      // {
      //   id: "#employee/my-calender",
      //   label: "My Calender",
      //   icon: <CalendarDays className="h-5 w-5" />,
      //   href: "#employee/my-calender",
      // },
    ],
  },
  {
    id: "finance",
    label: "Finance (FMS)",
    href: "/finance",
    icon: <School className="h-5 w-5" />,
    allowedRoles: ["counsellor", "super_admin"],
    subItems: [
      {
        label: "Finance Dashboard",
        href: "/finance-dashboard",
        icon: <ChartBarIcon className="h-5 w-5" />,
      },
      {
        label: "Fee",
        icon: <CreditCardIcon className="h-5 w-5" />,
        subItems: [
          {
            label: "Application fee",
            href: "/application-fee",
            icon: <DocumentTextIcon className="h-5 w-5" />,
          },
          {
            label: "Examination fee",
            href: "/exam-fees",
            icon: <AcademicCapIcon className="h-5 w-5" />,
          },
          {
            label: "Certificates fee",
            href: "/Certification-Form-Data",
            icon: <TicketCheck className="h-5 w-5" />,
          },
          {
            label: "Revaluation fee",
            href: "/revaluation-fee",
            icon: <Repeat2 className="h-5 w-5" />,
          },
          {
            label: "Ratification fee",
            href: "/ratification-fee",
            icon: <RotateCw className="h-5 w-5" />,
          },
          {
            label: "Affiliation fee",
            href: "/Affiliation-Form-Data",
            icon: <Building className="h-5 w-5" />,
          },
          {
            label: "Hostel fee",
            href: "/Hostel-Form-Data",
            icon: <BuildingOfficeIcon className="h-5 w-5" />,
          },
          {
            label: "Sports fee",
            href: "/sports-Form-Data",
            icon: <TicketCheck className="h-5 w-5" />,
          },
          {
            label: "Condonation fee",
            href: "/condonation-fee",
            icon: <DocumentTextIcon className="h-5 w-5" />,
          },
          {
            label: "Admission Fees",
            href: "/admission-fees",
            icon: <BookOpen className="h-5 w-5" />,
          },
        ],
      },
      {
        label: "Employee Bills",
        href: "/employee-bills",
        icon: <DocumentTextIcon className="h-5 w-5" />,
      },
      {
        label: "Miscellaneous Bills",
        href: "/miscellaneous-bills",
        icon: <DocumentTextIcon className="h-5 w-5" />,
      },
      {
        label: "Employee Payroll",
        href: "/employee-payroll",
        icon: <CurrencyDollarIcon className="h-5 w-5" />,
      },
      {
        label: "Expenses Inventory",
        href: "/expenses-inventory",
        icon: <ClipboardList className="h-5 w-5" />,
      },
    ],
  },
  {
    id: "university",
    label: "Website (WMS)",
    icon: <AcademicCapIcon className="h-5 w-5" />,
    subItems: [
      {
        id: "carousel",
        label: "Carousel",
        icon: <PhotoIcon className="h-5 w-5" />,
        href: "/carousel",
        allowedRoles: ["admin", "super_admin", "vc"],
      },
      {
        id: "notifications",
        label: "Notification",
        icon: <BellIcon className="h-5 w-5" />,
        href: "/notifications",
        allowedRoles: ["admin", "super_admin", "vc"],
      },
      {
        id: "Imp Info",
        label: "Imp Info",
        icon: <DocumentTextIcon className="h-5 w-5" />,
        allowedRoles: ["admin", "super_admin", "vc"],
        subItems: [
          {
            label: "Results",
            href: "/info/results",
            icon: <Percent className="h-5 w-5" />,
          },
          {
            label: "Examination",
            href: "/info/examination",
            icon: <AcademicCapIcon className="h-5 w-5" />,
          },
          {
            label: "Circular",
            href: "/info/circular",
            icon: <DocumentTextIcon className="h-5 w-5" />,
          },
          {
            label: "Jobs",
            href: "/info/jobs",
            icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
          },
          {
            label: "Tenders",
            href: "/info/tenders",
            icon: <DocumentTextIcon className="h-5 w-5" />,
          },
          {
            label: "G.O's",
            href: "/info/gos",
            icon: <FileStack className="h-5 w-5" />,
          },
          
        ],
      },
      {
            label: "Syllabus",
            href: "/info/syllabus",
            icon: <DocumentTextIcon className="h-5 w-5" />,
          },
      // {
      //       label: "Seminars / Workshops",
      //       href: "/info/department-seminars",
      //       icon: <DocumentTextIcon className="h-5 w-5" />,
      //     },
      {
        id: "latest-news",
        label: "Latest News",
        icon: <NewspaperIcon className="h-5 w-5" />,
        href: "/latest-news",
        allowedRoles: ["admin", "super_admin", "vc"],
      },
      {
        id: "latest-events",
        label: "Latest Events",
        icon: <CalendarIcon className="h-5 w-5" />,
        href: "/latest-events",
        allowedRoles: ["admin", "super_admin", "vc"],
      },
      {
        id: "imp-dates",
        label: "Imp Dates",
        icon: <ClockIcon className="h-5 w-5" />,
        href: "/important-dates",
        allowedRoles: ["admin", "super_admin", "vc"],
      },
      {
        id: "voices-at-aknu",
        label: "Voices At AKNU",
        icon: <SpeakerWaveIcon className="h-5 w-5" />,
        href: "/voices-at-aknu",
        allowedRoles: ["admin", "super_admin", "vc"],
      },
      {
        id: "registration",
        label: "Registration",
        icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
        allowedRoles: ["admin", "super_admin", "vc"],
        subItems: [
          {
            label: "Event",
            href: "/Events-Form-Data",
            icon: <CalendarIcon className="h-5 w-5" />,
          },
          {
            label: "Admission",
            href: "/Admission-Form-Data",
            icon: <BookOpen className="h-5 w-5" />,
          },
          {
            label: "Alumni",
            href: "/Alumni-Form-Data",
            icon: <UserGroupIcon className="h-5 w-5" />,
          },
        ],
      },
      {
        id: "feedback",
        label: "Student Feedback",
        icon: <PencilSquareIcon className="h-5 w-5" />,
        href: "/Feedback-Form-Data",
        allowedRoles: ["super_admin", "vc"],
      },
      {
        id: "womenCell",
        label: "Women Cell",
        icon: <UserIcon className="h-5 w-5" />,
        href: "/Women_Cell",
        allowedRoles: ["admin", "super_admin", "vc"],
      },
      {
        id: "cdcComplaint",
        label: "CDC Complaint",
        icon: <FileWarning className="h-5 w-5" />,
        href: "/CDC_Complaint",
        allowedRoles: ["admin", "super_admin", "vc"],
      },
      {
        id: "nannayaVani",
        label: "Nannaya Vani",
        icon: <Newspaper className="h-5 w-5" />,
        href: "/NannayaVani",
        allowedRoles: ["admin", "super_admin", "vc"],
      },

      {
        id: "chat",
        label: "Chat",
        icon: <ChatBubbleLeftIcon className="h-5 w-5" />,
        href: "/chat-with-us",
        allowedRoles: ["super_admin", "vc"],
      },
      {
        id: "gallery",
        label: "Gallery",
        icon: <Image className="h-5 w-5" />,
        allowedRoles: ["admin", "super_admin", "vc"],
        href: "/gallery",
      },
      {
        id: "field-tracker",
        label: "Field Tracker",
        icon: <MapPin className="h-5 w-5" />,
        href: "/field-tracker",
        allowedRoles: ["super_admin", "vc"],
      },
    ],
  },

  {
    id: "#students-admissions-top",
    label: "Student (SMS)",
    href: "/admission",
    icon: <School className="h-5 w-5" />,
    allowedRoles: ["counsellor", "super_admin"],
    subItems: [
      {
        label: "Inquiries",
        href: "/student/inquiries",
        icon: <ChatBubbleLeftIcon className="h-5 w-5" />,
      },
      {
        label: "Complaints",
        href: "/student/complaints",
        icon: <DocumentTextIcon className="h-5 w-5" />,
      },
      {
        label: "Onboarding Exam",
        href: "/student/onboarding-exam",
        icon: <AcademicCapIcon className="h-5 w-5" />,
      },
      {
        label: "Admissions",
        href: "#",
        icon: <BookOpen className="h-5 w-5" />,
      },
      {
        label: "Attendance",
        href: "/student/attendance",
        icon: <ClipboardCheck className="h-5 w-5" />,
      },
      {
        label: "Outpass Application",
        href: "/student/outpass",
        icon: <ClockIcon className="h-5 w-5" />,
      },
      {
        label: "Maintenance Queries",
        href: "/student/maintenance",
        icon: <Wrench className="h-5 w-5" />,
      },
      {
        label: "Time Table",
        href: "/student/timetable",
        icon: <CalendarDays className="h-5 w-5" />,
      },
      {
        label: "Results",
        href: "/student/results",
        icon: <Percent className="h-5 w-5" />,
      },
      {
        label: "Practicles Submission",
        href: "/student/practicals-submission",
        icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
      },
      {
        label: "Certificate",
        href: "/student/certificate",
        icon: <TicketCheck className="h-5 w-5" />,
      },
      {
        label: "Students Performance",
        href: "/student/performance",
        icon: <ChartBarIcon className="h-5 w-5" />,
      },
      {
        label: "No-Due Certificate",
        href: "/student/no-due-form",
        icon: <DocumentTextIcon className="h-5 w-5" />,
      },
      {
        label: "Document Receipt",
        href: "/student/document-receipt",
        icon: <FileText className="h-5 w-5" />,
      },
      {
        label: "Acknowledged Documents",
        href: "/student/acknowledged-documents",
        icon: <CheckSquare className="h-5 w-5" />,
      },
    ],
  },

  {
    id: "examination",
    label: "Examination (EMS)",
    icon: <AcademicCapIcon className="h-5 w-5" />,
    // href: "/",
    allowedRoles: ["super_admin", "vc", "councellor"],
    subItems: [
      {
        id: "pre-examination",
        label: "Pre Examination",
        icon: <ScrollText className="h-5 w-5" />,
        href: "/pre-examination",
      },
      {
        id: "post-examination",
        label: "Post Examination",
        icon: <ScrollText className="h-5 w-5" />,
        href: "/post-examination",
      },
      {
        id: "results",
        label: "Results",
        icon: <Percent className="h-5 w-5" />,
        href: "/results",
      },
      {
        id: "re-valuation",
        label: "Re-evaluation",
        icon: <Repeat2 className="h-5 w-5" />,
        href: "/re-valuation",
      },
    ],
  },
  {
    id: "hostel-management",
    label: "Hostel (HMS)",
    icon: <BuildingOfficeIcon className="h-5 w-5" />,
    // href: "/",
    allowedRoles: ["super_admin"],
    subItems: [
      {
        label: "Dashboard",
        href: "/hostel/dashboard",
        icon: <ChartBarIcon className="h-5 w-5" />,
      },
      {
        label: "Hostels",
        href: "/hostel/master",
        icon: <BuildingOfficeIcon className="h-5 w-5" />,
      },
      {
        label: "Applications",
        href: "/hostel/applications",
        icon: <ClipboardList className="h-5 w-5" />,
      },
      // {
      //   label: "Room Allocations",
      //   href: "/hostel/allocations",
      //   icon: <HomeIcon className="h-5 w-5" />,
      // },
      {
        label: "Fee Management",
        href: "/hostel/fees",
        icon: <CurrencyDollarIcon className="h-5 w-5" />,
      },
      {
        label: "Attendance & Leave",
        href: "/hostel/attendance",
        icon: <CalendarDaysIcon className="h-5 w-5" />,
      },
      {
        label: "Maintenance",
        href: "/hostel/maintenance",
        icon: <Cog6ToothIcon className="h-5 w-5" />,
      },
      {
        label: "Mess Management",
        href: "/hostel/mess",
        icon: <UtensilsCrossed className="h-5 w-5" />,
      },
      // {
      //   label: "Complaints",
      //   href: "/hostel/complaints",
      //   icon: <AlertCircle className="h-5 w-5" />,
      // },
      {
        label: "Security & Access",
        href: "/hostel/security",
        icon: <ShieldCheckIcon className="h-5 w-5" />,
      },
      // {
      //   label: "Hostels",
      //   href: "/hostels",
      //   icon: <BuildingOfficeIcon className="h-5 w-5" />,
      // },
      {
        label: "Inventory",
        href: "/inventory",
        icon: <ClipboardList className="h-5 w-5" />,
      },
      {
        label: "Spend",
        href: "/spend",
        icon: <Banknote className="h-5 w-5" />,
      },
    ],
  },

  {
    id: "transport-management",
    label: "Transportation",
    icon: <TruckIcon className="h-5 w-5" />,
    href: "/transportation/console",
    allowedRoles: ["super_admin"],
  },

  // {
  //   id: "Fees",
  //   label: "Fees",
  //   icon: <CreditCardIcon className="h-5 w-5" />,
  //   allowedRoles: ["super_admin"],
  //   subItems: [
  //     { label: "Application fee", href: "#" },
  //     { label: "Examination fee", href: "/exam-fees" },
  //     { label: "Apply for Certificates fee", href: "/Certification-Form-Data" },
  //     { label: "Revaluation fee", href: "#" },
  //     { label: "Ratification fee", href: "#" },
  //     { label: "Affiliation fee", href: "/Affiliation-Form-Data" },
  //     { label: "Hostel fee", href: "/Hostel-Form-Data" },
  //     { label: "Sports fee", href: "/Sports-Form-Data" },
  //     { label: "Condonation fee", href: "#" },
  //     //
  //     { label: "Admission", href: "/admission-exam-fees" },
  //     { label: "Admission Fees", href: "/admission-fees" },
  //   ],
  // },

  // {
  //   id: "payroll",
  //   label: "Payroll",
  //   icon: <CurrencyDollarIcon className="h-5 w-5" />,
  //   // href: "/",
  //   allowedRoles: ["super_admin"],
  // },

  {
    id: "#lab-management",
    label: "Labs",
    icon: <FlaskConical className="h-5 w-5" />,
    allowedRoles: ["super_admin"],
    subItems: [
      {
        label: "Master Data",
        href: "/labs/master-data",
        icon: <Settings className="h-5 w-5" />,
      },
      {
        label: "Equipment & Inventory",
        icon: <Package className="h-5 w-5" />,
        subItems: [
          {
            label: "Equipment List",
            href: "/labs/equipment/list",
            icon: <Wrench className="h-4 w-4" />,
          },
          {
            label: "Consumables",
            href: "/labs/equipment/consumables",
            icon: <FlaskConical className="h-4 w-4" />,
          },
        ],
      },
      {
        label: "Schedule & Booking",
        icon: <CalendarDays className="h-5 w-5" />,
        subItems: [
          {
            label: "Lab Schedule",
            href: "/labs/schedule",
            icon: <Calendar className="h-4 w-4" />,
          },
          {
            label: "Lab Bookings",
            href: "/labs/bookings",
            icon: <CalendarClock className="h-4 w-4" />,
          },
        ],
      },
      {
        label: "Maintenance & Issues",
        icon: <Wrench className="h-5 w-5" />,
        subItems: [
          {
            label: "Issue Tracking",
            href: "/labs/maintenance/issues",
            icon: <AlertCircle className="h-4 w-4" />,
          },
          {
            label: "Maintenance Log",
            href: "/labs/maintenance/log",
            icon: <ClipboardCheck className="h-4 w-4" />,
          },
        ],
      },
      {
        label: "Reports",
        icon: <ChartBarIcon className="h-5 w-5" />,
        subItems: [
          {
            label: "Lab Usage Report",
            href: "/labs/reports/usage",
            icon: <ChartBarIcon className="h-4 w-4" />,
          },
          {
            label: "Equipment Report",
            href: "/labs/reports/equipment",
            icon: <Package className="h-4 w-4" />,
          },
          {
            label: "Maintenance Report",
            href: "/labs/reports/maintenance",
            icon: <Wrench className="h-4 w-4" />,
          },
        ],
      },
    ],
  },

  // {
  //   id: "attendance",
  //   label: "Attendance",
  //   icon: <CalendarDaysIcon className="h-5 w-5" />,
  //   // href: "/",
  //   allowedRoles: ["super_admin"],
  // },
  // {
  //   id: "leave-management",
  //   label: "Leave Management",
  //   icon: <ClipboardDocumentCheckIcon className="h-5 w-5" />,
  //   // href: "/",
  //   allowedRoles: ["super_admin"],
  // },

  // {
  //   id: "appointment",
  //   label: "My Appointments",
  //   icon: <CalendarClock className="h-5 w-5" />,
  //   // href: "/",
  //   allowedRoles: ["super_admin"],
  // },
  // {
  //   id: "courses",
  //   label: "Courses",
  //   icon: <NotebookTabs className="h-5 w-5" />,
  //   // href: "/",
  //   allowedRoles: ["super_admin"],
  // },
  // {
  //   id: "#certificate-generation",
  //   label: "Certificate Generation",
  //   icon: <TicketCheck className="h-5 w-5" />,
  //   // href: "/",
  //   allowedRoles: ["super_admin"],
  // },

  // {
  //   id: "#expences-tracker",
  //   label: "Expences Tracker",
  //   icon: <Banknote className="h-5 w-5" />,
  //   // href: "/",
  //   allowedRoles: ["super_admin"],
  // },
  // {
  //   id: "#event-tracker",
  //   label: "Event Tracker",
  //   icon: <Calendar1 className="h-5 w-5" />,
  //   // href: "/",
  //   allowedRoles: ["super_admin"],
  // },
  // {
  //   id: "#building-namagement",
  //   label: "Building Management",
  //   icon: <Building className="h-5 w-5" />,
  //   // href: "/",
  //   allowedRoles: ["super_admin"],
  // },
  {
    id: "#library-namagement",
    label: "Library",
    icon: <BookOpen className="h-5 w-5" />,
    allowedRoles: ["super_admin"],
    subItems: [
      {
        label: "Master Data",
        icon: <Settings className="h-5 w-5" />,
        subItems: [
          {
            label: "Book Categories",
            href: "/library/master-data/categories",
            icon: <ClipboardList className="h-4 w-4" />,
          },
          {
            label: "Authors",
            href: "/library/master-data/authors",
            icon: <UserGroupIcon className="h-4 w-4" />,
          },
          {
            label: "Publishers",
            href: "/library/master-data/publishers",
            icon: <BuildingOfficeIcon className="h-4 w-4" />,
          },
          {
            label: "Library Information",
            href: "/library/master-data/library-info",
            icon: <Building2 className="h-4 w-4" />,
          },
          {
            label: "Library Sections/Racks",
            href: "/library/master-data/racks",
            icon: <MapPin className="h-4 w-4" />,
          },

        ],
      },
      {
        label: "Book Management",
        href: "/library/books",
        icon: <BookOpen className="h-5 w-5" />,
      },
      {
        label: "Physical Inventory",
        href: "/library/physical-inventory",
        icon: <Package className="h-5 w-5" />,
      },
      {
        label: "Digital Library",
        href: "/library/digital-library",
        icon: <Monitor className="h-5 w-5" />,
      },
      {
        label: "My Books",
        href: "/library/my-books",
        icon: <BookOpen className="h-5 w-5" />,
        allowedRoles: ["user", "admin", "super_admin", "student", "faculty"],
      },
      {
        label: "User Management",
        icon: <UserGroupIcon className="h-5 w-5" />,
        subItems: [
          {
            label: "Students",
            href: "/library/users/students",
            icon: <AcademicCapIcon className="h-4 w-4" />,
          },
          {
            label: "Faculty",
            href: "/library/users/faculty",
            icon: <ShieldUser className="h-4 w-4" />,
          },
          // {
          //   label: "Issue Limits & Rules",
          //   href: "/library/users/rules",
          //   icon: <BadgeIndianRupee className="h-4 w-4" />,
          // },
        ],
      },
      {
        label: "Issue Limits & Rules",
        href: "/library/users/rules",
        icon: <BadgeIndianRupee className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "#server-administration",
    label: "Server Administration",
    icon: <Server className="h-5 w-5" />,
    // href: "/",
    allowedRoles: ["super_admin"],
  },
];

export default navItems;
