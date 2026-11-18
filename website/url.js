const phpApi = "https://new.aknu.edu.in/api/list_certs.php";
const vpsApi = import.meta.env.VITE_API_URL;
// for Certifications
const certificates = `${phpApi}?path=navbar/bottom_navbar/Accreditation/Certifications`;

// for affiliated colleges
const mbaColleges = `${phpApi}?path=navbar/top_navbar/affiliated_colleges/colleges/MBA`;
const Undergraduate = `${phpApi}?path=navbar/top_navbar/affiliated_colleges/colleges/Under_Graduate`;
const Education = `${phpApi}?path=navbar/top_navbar/affiliated_colleges/colleges/Education`;
const LAW = `${phpApi}?path=navbar/top_navbar/affiliated_colleges/colleges/LAW`;
const MCA = `${phpApi}?path=navbar/top_navbar/affiliated_colleges/colleges/MCA`;
const Post_Graduate = `${phpApi}?path=navbar/top_navbar/affiliated_colleges/colleges/Post_Graduate`;

const resources = `${phpApi}?path=navbar/top_navbar/affiliated_colleges/resources`;

// for academic calendar
const academic_calendar = `${phpApi}?path=navbar/bottom_navbar/academics/academic_affairs/academic_calendar`;
const applications = `${phpApi}?path=navbar/bottom_navbar/academics/academic_affairs/applications`;
const cas = `${phpApi}?path=navbar/bottom_navbar/academics/academic_affairs/cas`;
const PG_Syllabus = `${phpApi}?path=navbar/bottom_navbar/academics/academic_affairs/syllabus/PG_Syllabus`;
const UG_Syllabus = `${phpApi}?path=navbar/bottom_navbar/academics/academic_affairs/syllabus/UG_Syllabus`;
const thesis_section = `${phpApi}?path=navbar/bottom_navbar/academics/academic_affairs/thesis_section`;

// api url

const BASE_URL = `${import.meta.env.VITE_API_URL}api`;

export {
  BASE_URL,
  certificates,
  mbaColleges,
  Post_Graduate,
  MCA,
  LAW,
  Education,
  Undergraduate,
  resources,
  academic_calendar,
  applications,
  cas,
  PG_Syllabus,
  UG_Syllabus,
  thesis_section,
  vpsApi,
};
