// import { nss1 } from "../assets";
import {
  nss1,
  nss2,
  nss3,
  nss4,
  nss5,
  nss6,
  nss7,
  nss8,
  nss9,
  nss10,
  nss11,
  nss12,
  nss13,
  nss14,
  instructions,
  manual,
  revisedGuidelines,
  // NSS Form PDFs
  applicationForm,
  villageAdoptionForm,
  unitInformationForm,
  enrolmentForm,
  specialCampProposalForm,
} from "../assets";

export const nssForms = [
  {
    title: "Application for NSS Unit",
    description: "Existing and New Unit Application Form",
    icon: "📝",
    pdfUrl: applicationForm,
  },
  {
    title: "Volunteer Enrollment",
    description: "NSS Volunteer Registration Form",
    icon: "👥",
    pdfUrl: new URL(
      "../assets/nss/Nss Form Links/NSS_YoungIndia_Volunteer_Enrollment_Form_DDMMYYYY_001.xls",
      import.meta.url,
    ).href, // .xls file path
  },
  {
    title: "Village Adoption",
    description: "Adopt Village Information Form",
    icon: "🏡",
    pdfUrl: villageAdoptionForm,
  },
  {
    title: "Unit Information",
    description: "Basic Information of NSS Unit",
    icon: "ℹ️",
    pdfUrl: unitInformationForm,
  },
  {
    title: "Volunteer Form",
    description: "NSS Volunteer Enrollment Form",
    icon: "📋",
    pdfUrl: enrolmentForm,
  },
  {
    title: "Special Camp Proposal",
    description: "Special Camp Application Form",
    icon: "⛺",
    pdfUrl: specialCampProposalForm,
  },
];

export const nssGallary = [
  {
    title: "",
    link: nss1,
  },
  {
    title: "",
    link: nss2,
  },
  {
    title: "",
    link: nss3,
  },

  {
    title: "",
    link: nss6,
  },
  {
    title: "",
    link: nss7,
  },
  {
    title: "",
    link: nss8,
  },
  {
    title: "",
    link: nss9,
  },
  {
    title: "",
    link: nss10,
  },
  {
    title: "",
    link: nss11,
  },
  {
    title: "",
    link: nss12,
  },

  {
    title: "",
    link: nss14,
  }
];

export const guidelineDocuments = [
  {
    title: "Revised Financial Guidelines for NSS Units",
    pdfUrl: revisedGuidelines,
  },
  {
    title: "NSS Revised Manual/Guidelines",

    pdfUrl: manual,
  },
  {
    title: "Instructions for New NSS Unit",

    pdfUrl: instructions,
  },
];
