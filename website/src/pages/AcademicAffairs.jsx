import React, { useState, useEffect } from "react";
import { BASE_URL } from "../utils/url";
import { BackButton } from "../components/BackButton";
import { AiOutlineFilePdf } from "react-icons/ai";
import { img_P_Suresh_Varma, keziarani, vswamy23, K_Ramaneswari } from "../assets";
import casApplication from "../assets/Academic Affairs/CAS/AKNU - CAS application 03-03-2023.docx";
import casGoMs14 from "../assets/Academic Affairs/CAS/GO MS 14 03-03-2023.pdf";
import casCircular from "../assets/Academic Affairs/CAS/circular cas 03-03-2023.pdf";
import appPhdSubmission from "../assets/Academic Affairs/Applications/AKNU - PhD Submission Application & Checklist.pdf";
import appGuideChange from "../assets/Academic Affairs/Applications/APPLICATION FOR GUIDE CHANGE.pdf";
import appGuideRecognition from "../assets/Academic Affairs/Applications/GUIDE RECOGNITION FORM.pdf";
import appOD from "../assets/Academic Affairs/Applications/O D Application.pdf";
import appResearchCentre from "../assets/Academic Affairs/Applications/RECOGNITION OF RESEARCH CENTRE APPLICATION FORM17-10-22.pdf";
import UgSyllabus from "./syllabus/UgSyllabus";
import PgSyllabus from "./syllabus/PgSyllabus";
import PrePhdSyllabus from "./syllabus/PrePhdSyllabus";
import axios from "axios";

const AcadamicAffairs = () => {
  const [applicationsData, setApplicationsData] = useState([]);
  const [ugSyllabus, setUgSyllabus] = useState([]);
  const [pgSyllabus, setPgSyllabus] = useState([]);
  const [circulars, setCirculars] = useState([]);
  const [casData, setCasData] = useState([]);
  const [openIdx, setOpenIdx] = useState(null);
  const [openSyllabusIdx, setOpenSyllabusIdx] = useState(null);
  const [openAcademicCalendarIdx, setOpenAcademicCalendarIdx] = useState(null);

  const [academicCalendars, setAcademicCalendars] = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  // Helper to categorize calendar items by program type
  const categorizeCalendar = (calendarList) => {
    const defaultPrograms = [
      "UG Programs",
      "PG Programs",
      "Professional Programs",
      "Diploma Programs",
      "Certificate Programs",
    ];

    const grouped = {};
    const customPrograms = [];

    defaultPrograms.forEach((prog) => {
      grouped[prog] = [];
    });

    (calendarList || []).forEach((item) => {
      const title = (item.title || "").toLowerCase();
      const rawNote = (item.note || "").trim();

      // If program type is explicitly chosen in note
      if (rawNote) {
        if (!grouped[rawNote]) {
          grouped[rawNote] = [];
          customPrograms.push(rawNote);
        }
        grouped[rawNote].push(item);
        return;
      }

      // Keyword based categorization fallback
      if (
        title.includes("ug") ||
        title.includes("undergraduate") ||
        title.includes("b.a") ||
        title.includes("b.sc") ||
        title.includes("b.com")
      ) {
        grouped["UG Programs"].push(item);
      } else if (
        title.includes("pg") ||
        title.includes("postgraduate") ||
        title.includes("m.a") ||
        title.includes("m.sc") ||
        title.includes("m.com")
      ) {
        grouped["PG Programs"].push(item);
      } else if (
        title.includes("b.tech") ||
        title.includes("m.tech") ||
        title.includes("b.ed") ||
        title.includes("m.ed") ||
        title.includes("mba") ||
        title.includes("mca") ||
        title.includes("law") ||
        title.includes("b.p.ed") ||
        title.includes("professional")
      ) {
        grouped["Professional Programs"].push(item);
      } else if (title.includes("diploma") || title.includes("polytechnic")) {
        grouped["Diploma Programs"].push(item);
      } else if (title.includes("certificate") || title.includes("skill")) {
        grouped["Certificate Programs"].push(item);
      } else {
        if (!grouped["General"]) {
          grouped["General"] = [];
          customPrograms.push("General");
        }
        grouped["General"].push(item);
      }
    });

    // Custom programs created newly are placed on top as requested
    const allProgramKeys = [...customPrograms, ...defaultPrograms];
    return { allProgramKeys, grouped };
  };


  // Directly include Pre Ph.D Corner data
  const prePhdData = [
    {
      label: "19-03-2024 Pre-Ph.D ExaminationChemistry Proceeding",
      href: "https://old.aknu.edu.in/Academics/links/AAF/PHD/APPLICATION%20FOR%20GUIDE%20CHANGE.pdf",
    },
    {
      label: "19-03-2024 Pre-PhD Chemistry Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus2022/Pre-PhD%20%20Chemistry%20Syllabus%20&%20Model%20Question%20Papers.pdf",
    },
    {
      label: "13-03-2024 Pre-Ph.D Examination Proceedings - 2024",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus2022/Pre-Ph.D%20Examination%20Proceedings%20-%202024.pdf",
    },
    {
      label: "13-03-2024 Pre-PhD CSE Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus2022/Pre-PhD%20%20CSE%20Syllabus%20&%20Model%20Question%20Papers.pdf",
    },
    {
      label: "13-03-2024 Pre-Ph.D Zoology Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus2022/Pre-Ph.D%20Zoology%20Syllabus%20&%20Model%20Question%20Papers.pdf",
    },
    {
      label:
        "13-03-2024 Pre-Ph.D Commerce & Management Studies Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus2022/Pre-Ph.D%20%20Commerce%20&%20Management%20Studies%20Syllabus%20&%20Model%20Question%20Papers.pdf",
    },
    {
      label: "13-03-2024 Pre-Ph.D English Syllabus & Model Question Paper",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus2022/Pre-Ph.D%20English%20Syllabus%20&%20Model%20Question%20Paper.pdf",
    },
    {
      label:
        "13-03-2024 Pre-Ph.D Geo Sciences Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus2022/Pre-Ph.D%20Geo%20Sciences%20Syllabus%20&%20Model%20Question%20Papers.pdf",
    },
    {
      label:
        "13-03-2024 Pre-Ph.D Bio Technology Syllabus & Model Question Paper",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus2022/Pre-Ph.D%20Bio%20Technology%20Syllabus%20&%20Model%20Question%20Paper.pdf",
    },
    {
      label: "08-12-2022 Pre-Ph.D - CSE Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus2022/CSE%20PRE-PHD%20SYLLABUS%20-%202022.pdf",
    },
    {
      label: "08-12-2022 Pre-Ph.D - CHEMISTRY Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus2022/CHEMISTRY%20PRE-PHD%202022.pdf",
    },
    {
      label:
        "08-12-2022 Pre-Ph.D - GEOSCIENCES Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus2022/GEOSCIENCES%20PRE-PHD-2022.pdf",
    },
    {
      label: "08-12-2022 Pre-Ph.D - ZOOLOGY Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus2022/ZOOLOGY%20-%20PRE-PHD%20SYLLABUS%202022.pdf",
    },
    {
      label: "08-12-2022 Pre-Ph.D - BOTANY Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus2022/BOTANY%20PRE-PHD%20SYLLABUS%20-%202022.pdf",
    },
    {
      label: "08-12-2022 Pre-Ph.D - PHYSICS Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus2022/PHYSICS%20-%20PRE-PHD%20SYLLABUS%202022.pdf",
    },
    {
      label: "08-12-2022 Pre-Ph.D - ENGLISH Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus2022/ENGLISH%20PRE-PHD%20SYLLABUS-2022.pdf",
    },
    {
      label: "08-12-2022 Pre-Ph.D - HINDI Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus2022/HINDI%20PRE-PHD%20SYLLABUS%20-%202022.pdf",
    },
    {
      label:
        "08-12-2022 Pre-Ph.D - COMMERCE & MANAGEMENT STUDIES Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus2022/COMMERCE%20&%20MANAGEMENT%20STUDIES%20-%20PRE-PHD%20SYLLABUS%202022.pdf",
    },
    {
      label: "23-05-2022 Pre-Ph.D - CHEMISTRY Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus/CHEMISTRY%20PRE-PHD%202022.pdf",
    },
    {
      label:
        "23-05-2022 Pre-Ph.D - COMMERCE & MANAGEMENT STUDIES Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus/COMMERCE%20&%20MANAGEMENT%20STUDIES%20PRE-PHD%202022.pdf",
    },
    {
      label: "23-05-2022 Pre-Ph.D - CSE Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus/CSE%20PRE-PHD%202022.pdf",
    },
    {
      label: "23-05-2022 Pre-Ph.D - ENGLISH Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus/ENGLISH%20SYLLABI%20&%20MODEL%20PAPER%20-%20PRE-PHD%20-2022.pdf",
    },
    {
      label:
        "23-05-2022 Pre-Ph.D - GEOSCIENCES Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus/GEOSCIENCES%20PRE-PHD%202022.pdf",
    },
    {
      label: "23-05-2022 Pre-Ph.D - PHYSICS Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus/PHYSICS%20PRE-PHD%202022.pdf",
    },
    {
      label: "23-05-2022 Pre-Ph.D - TELUGU Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus/TELUGU%20PRE-PHD%202022.pdf",
    },
    {
      label: "23-05-2022 Pre-Ph.D - ZOOLOGY Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/PHD_syllabus/ZOOLOGY%20PRE-PHD%202022.pdf",
    },
    {
      label: "24-12-2020 Proforma - Panel of examiners for P.hd evaluation",
      href: "https://aknu.edu.in/Academics/links/AAF/Circulars/Proforma%20-%20panel%20of%20experts%20-evaluation%20of%20PhD%20-%2024dec20.pdf",
    },
    {
      label: "08-10-2020 Proforma - Panel of examiners for Pre-P.hd evaluation",
      href: "https://aknu.edu.in/Academics/links/AAF/Circulars/Panel%20of%20examiners%20for%20Pre-Phd%20evaluation%20-%2024dec20.pdf",
    },
    {
      label: "19-09-2020 Pre-Ph.D Zoology Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/Circulars/Pre-Ph.D%20Zoology%20Syllabus%20and%20MQP-Sep2020.pdf",
    },
    {
      label:
        "19-09-2020 Pre-Ph.D Commerce & Management Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/Circulars/Pre-Ph.D%20Commerce%20and%20Management%20Studies%20Syllabus%20and%20MQP-Sep2020.pdf",
    },
    {
      label: "19-09-2020 Pre-Ph.D Telugu Syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/Circulars/Pre-Ph.D%20Telugu%20Syllabus%20and%20MQP%20-Sep2020.pdf",
    },
    {
      label:
        "17-06-2020 CSIR Guidelines for ethics in Research and in Governance",
      href: "https://aknu.edu.in/Academics/links/AAF/Circulars/CSIR%20Guidelines%20for%20ethics%20in%20Research%20and%20in%20Governance.pdf",
    },
    {
      label: "2019- Pre-Ph.D Structure for Syllabus and Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/Circulars/2019-%20Pre-PhD%20structure%20for%20syllabus%20and%20QP.pdf",
    },
    {
      label:
        "2019 - Pre-Ph.D- Geology- Paper-1 syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/Circulars/2019-%20Pre-PhD-%20Geology-%20Paper-1%20syllabus%20-Model%20qp.pdf",
    },
    {
      label:
        "2019 - Pre-Ph.D- Geology- Paper-2 syllabus & Model Question Papers",
      href: "https://aknu.edu.in/Academics/links/AAF/Circulars/2019-Pre-PhD%20-Geology-%20Paper-2%20syllabi%20-%20model%20qp.pdf",
    },
    {
      label:
        "School of Life and Health Sciences -Pre-Ph.d - Syllabus and Question Paper",
      href: "https://aknu.edu.in/Academics/links/AAF/Circulars/School%20of%20Life%20and%20Health%20Sciences%20-Pre-Phd%20-%20syllabus%20and%20QP-18March2020.pdf",
    },
    {
      label: "Botany -Pre-Ph.d - Syllabus and Question Paper",
      href: "https://aknu.edu.in/Academics/links/AAF/Circulars/Botany%20-Pre-Phd%20-%20syllabus%20and%20QP-18March2020.pdf",
    },
    {
      label:
        "Circular - Review of syllabus completion - details of feedback of students on class work and syllabus",
      href: "https://aknu.edu.in/Academics/links/AAF/Circulars/Review%20of%20syllabus%20completion%20-%20details%20of%20feedback%20of%20students%20on%20class%20work%20and%20syllabus%20-%2005March2020.pdf",
    },
    {
      label:
        "Circular - Ph.D Thesis submission - documents to be enclosed and verifies before submission",
      href: "https://aknu.edu.in/Academics/links/AAF/Circulars/Ph.D%20Thesis%20submission%20-%20documents%20to%20be%20enclosed%20and%20verifies%20before%20submission%20-05March2020.pdf",
    },
    {
      label: "Circular - Ph.D Scholars - Revies of research activities",
      href: "https://aknu.edu.in/Academics/links/AAF/Circulars/Ph.D%20Scholars%20-%20Revies%20of%20research%20activities%20-05March2020.pdf",
    },
  ];

  useEffect(() => {
    fetch(`${BASE_URL}/info/curcular_proceedings/all`)
      .then((r) => r.json())
      .then((data) => {
        setCirculars((data && (data.data || data)) || []);
      });
  }, []);

  // Fetch Academic Calendar data from API
  useEffect(() => {
    setLoadingCalendar(true);
    fetch(`${BASE_URL}/info/academic_calendar/all`)
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data) ? data : data?.data || [];
        setAcademicCalendars(items);
      })
      .catch((err) => console.error("Error loading academic calendars:", err))
      .finally(() => setLoadingCalendar(false));
  }, []);

  console.log("79", circulars);
  // Applications from local assets
  useEffect(() => {
    setApplicationsData([
      {
        label: "AKNU - PhD Submission Application & Checklist",
        href: appPhdSubmission,
      },
      { label: "APPLICATION FOR GUIDE CHANGE", href: appGuideChange },
      { label: "GUIDE RECOGNITION FORM", href: appGuideRecognition },
      { label: "O D Application", href: appOD },
      {
        label: "RECOGNITION OF RESEARCH CENTRE APPLICATION FORM",
        href: appResearchCentre,
      },
    ]);
  }, []);
  const handleViewFile = async (letterId) => {
    try {
      const href = `${BASE_URL}/info/curcular_proceedings/file/view/${letterId}`;
      const response = await axios.get(href, {
        responseType: "arraybuffer",
      });

      // Create a blob from the response
      const blob = new Blob([response.data], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      // Open the PDF in a new tab
      window.open(url, "_blank");

      // Optional: Revoke the object URL later to free memory
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error("Error viewing file:", error);
      // showErrorMessage("Failed to open file");
    }
  };

  const handleViewCalendarFile = async (calendarId) => {
    try {
      const href = `${BASE_URL}/info/academic_calendar/file/view/${calendarId}`;
      const response = await axios.get(href, {
        responseType: "arraybuffer",
      });

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error("Error viewing calendar file:", error);
    }
  };
  useEffect(() => {
    setCasData([
      { label: "AKNU - CAS application 03-03-2023", href: casApplication },
      { label: "GO MS 14 03-03-2023", href: casGoMs14 },
      { label: "circular cas 03-03-2023", href: casCircular },
    ]);
  }, []);

  return (
    <div className="px-4 sm:px-16 py-8">
      <BackButton />
      <h1 className="text-3xl font-bold mb-6 text-teal-800">
        Academic Affairs
      </h1>
      <div>
        <div className="flex flex-col md:flex-row mt-4 sm:mt-6">
          <div className="bg-teal-700 flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-4 md:pb-6 lg:pt-6 lg:pb-4 px-4 sm:px-6 md:px-6 lg:px-8 w-full md:w-1/3 lg:w-1/4 shadow">
            <div className="relative w-50 h-55 sm:w-36 sm:h-50 md:w-40 md:h-50 lg:w-50 lg:h-57 overflow-hidden border-2 sm:border-[3px] md:border-4 border-white shadow-md">
              <img
                src={K_Ramaneswari}
                alt="Prof. K Ramaneswari"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="text-white font-bold  md:text-base lg:text-lg mt-2 text-center w-full px-2">
             Prof. K Ramaneswari
            </div>
            <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
              Dean
            </div>
            <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
              dean.aa@aknu.edu.in
            </div>
            <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
              +91 8074112754
            </div>
          </div>

          <div className="bg-[#f4e4c9] px-4 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-center py-4 sm:py-5 md:py-4 w-full md:w-2/3 lg:w-3/4 shadow">
            <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 text-center md:text-left">
              About Academic Affairs
            </h3>
            <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[#374151] text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] text-justify leading-5 sm:leading-6 md:leading-6">
              <p>
              The office of Dean Academic Affair is headed by the Dean Academic Affairs. The Dean Academic Affairs office looks after the academic audit works of the entire university which include preparation of academic calendar, constitution of board of studies in various disciplines, conduct of BOS meetings, revision of curriculum syllabi and academic regulations from time to time for UG, PG and Professional programmes.
              </p>
              {/* <p>
                With a distinguished academic career, Prof. Swamy has been
                instrumental in fostering an environment of academic excellence,
                research innovation, and student-centric learning. His
                leadership in Academic Affairs encompasses oversight of academic
                programs, faculty development, student academic services, and
                maintaining the quality benchmarks set by regulatory bodies.
              </p> */}
              {/* <p>
                I take this opportunity to convey my sincere and heartfelt
                wishes to all faculty members, staff, and students of our
                esteemed institution. As we continue our journey toward academic
                excellence, it is heartening to witness the unwavering
                dedication, intellectual curiosity, and collaborative spirit
                that define our academic community.
              </p> */}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="">
            <h3 className="text-2xl font-bold mb-4 text-teal-700">
              Faculty Associates
            </h3>
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full text-left border border-[#ccc]">
                <thead className="bg-teal-700 text-white">
                  <tr>
                    <th className="px-4 py-2">S.No</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Designation</th>
                    <th className="px-4 py-2">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[#ccc]">
                    <td className="px-4 py-2">1</td>
                    <td className="px-4 py-2">Dr. P Lakshmi Narayana</td>
                    <td className="px-4 py-2">Faculty Associate</td>
                    <td className="px-4 py-2">pln.eco@aknu.edu.in</td>
                  </tr>
                  {/* <tr className="border-t border-[#ccc]">
                    <td className="px-4 py-2">2</td>
                    <td className="px-4 py-2">Dr. D Sridhar</td>
                    <td className="px-4 py-2">
                      Academic coordinator/Associate
                    </td>
                    <td className="px-4 py-2">sridhar.aqua@aknu.edu.in</td>
                  </tr> */}
                  <tr className="border-t border-[#ccc]">
                    <td className="px-4 py-2">2</td>
                    <td className="px-4 py-2">Mr. B Krishna</td>
                    <td className="px-4 py-2">
                      Academic coordinator/Associate
                    </td>
                    <td className="px-4 py-2">krishna.ece@aknu.edu.in</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 mb-10">
            <div>
              <div className="space-y-3">
                {[
                  "Academic Calendar",
                  "Syllabus",
                  "Circulars/Proceedings",
                  "CAS",
                ].map((title, idx) => (
                  <div key={title} className="border border-[#ddd] shadow-sm">
                    <button
                      className="w-full text-left py-3 px-4 bg-teal-700 text-white font-semibold text-lg flex justify-between items-center"
                      onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                      type="button"
                    >
                      {title}
                      <span
                        className={`transform transition-transform duration-300 ${openIdx === idx ? "rotate-180" : "rotate-0"}`}
                      >
                        ▼
                      </span>
                    </button>
                    {openIdx === idx && (
                      <div className="bg-white p-5">
                        {title === "Academic Calendar" && (() => {
                          const { allProgramKeys, grouped } = categorizeCalendar(academicCalendars);
                          return (
                            <div>
                              {loadingCalendar && (
                                <div className="p-4 text-center text-teal-700 font-medium">
                                  Loading Academic Calendars...
                                </div>
                              )}
                              {!loadingCalendar && allProgramKeys.map((programType, pidx) => {
                                const items = grouped[programType] || [];
                                return (
                                  <div key={programType} className="w-full my-2">
                                    <button
                                      className="w-full text-left py-3 px-4 bg-[#f5f5f5] border border-[#ddd] text-teal-700 font-semibold text-base flex justify-between items-center"
                                      onClick={() =>
                                        setOpenAcademicCalendarIdx(
                                          openAcademicCalendarIdx === pidx
                                            ? null
                                            : pidx
                                        )
                                      }
                                      type="button"
                                    >
                                      <span>
                                        {programType}
                                      </span>
                                      <span className="font-bold">
                                        {openAcademicCalendarIdx === pidx
                                          ? "-"
                                          : "+"}
                                      </span>
                                    </button>
                                    {openAcademicCalendarIdx === pidx && (
                                      <div className="p-4 border border-t-0 border-[#ddd] bg-white">
                                        <div className="overflow-x-auto mt-4">
                                          <table className="min-w-full text-left border border-[#ccc]">
                                            <thead className="bg-teal-700 text-white">
                                              <tr>
                                                <th className="px-4 py-2">S.No</th>
                                                <th className="px-4 py-2">Name</th>
                                                <th className="px-4 py-2 w-32">Date</th>
                                                <th className="px-4 py-2 w-24 text-center">PDF</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {items.length > 0 ? (
                                                items.map((item, idx) => {
                                                  const dateStr = item.date
                                                    ? new Date(item.date).toLocaleDateString()
                                                    : "--";
                                                  return (
                                                    <tr
                                                      key={item._id || idx}
                                                      className="border-t border-[#ccc] hover:bg-gray-50"
                                                    >
                                                      <td className="px-4 py-2">
                                                        {idx + 1}
                                                      </td>
                                                      <td className="px-4 py-2 font-medium text-gray-800">
                                                        {item.title || item.name || "Academic Calendar"}
                                                      </td>
                                                      <td className="px-4 py-2 text-sm text-gray-600">
                                                        {dateStr}
                                                      </td>
                                                      <td className="px-4 py-2 text-center">
                                                        {item._id ? (
                                                          <button
                                                            onClick={() => handleViewCalendarFile(item._id)}
                                                            className="cursor-pointer text-teal-700 hover:text-teal-900 inline-flex items-center justify-center"
                                                            title="View Academic Calendar PDF"
                                                          >
                                                            <AiOutlineFilePdf size={28} />
                                                          </button>
                                                        ) : item.pdf && item.pdf !== "#" ? (
                                                          <a
                                                            href={item.pdf}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-teal-700 hover:text-teal-900 inline-flex items-center justify-center"
                                                          >
                                                            <AiOutlineFilePdf size={28} />
                                                          </a>
                                                        ) : (
                                                          <span className="text-gray-400">--</span>
                                                        )}
                                                      </td>
                                                    </tr>
                                                  );
                                                })
                                              ) : (
                                                <tr>
                                                  <td
                                                    colSpan="4"
                                                    className="px-4 py-6 text-center text-gray-500 italic text-sm"
                                                  >
                                                    No academic calendar uploaded for {programType} yet.
                                                  </td>
                                                </tr>
                                              )}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}

                        {title === "Syllabus" && (
                          <div>
                            {[
                              { label: "UG Syllabus", data: ugSyllabus },
                              { label: "PG Syllabus", data: pgSyllabus },
                              { label: "Pre Ph.D Syllabus", data: [] },
                            ].map((grp, sidx) => (
                              <div key={grp.label} className="w-full my-2">
                                <button
                                  className="w-full text-left py-3 px-4 bg-[#f5f5f5] border border-[#ddd] text-teal-700 font-semibold text-base"
                                  onClick={() =>
                                    setOpenSyllabusIdx(
                                      openSyllabusIdx === sidx ? null : sidx
                                    )
                                  }
                                  type="button"
                                >
                                  {grp.label}
                                  <span className="float-right font-bold">
                                    {openSyllabusIdx === sidx ? "-" : "+"}
                                  </span>
                                </button>
                                {openSyllabusIdx === sidx && (
                                  <div className="p-4 border border-t-0 border-[#ddd] bg-white">
                                    {grp.label === "UG Syllabus" ? (
                                      <UgSyllabus />
                                    ) : grp.label === "PG Syllabus" ? (
                                      <PgSyllabus />
                                    ) : (
                                      <PrePhdSyllabus legacyData={prePhdData} />
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {title === "Circulars/Proceedings" && (
                          <ul className="pl-0 space-y-2">
                            {[...(circulars || [])]
                              .sort(
                                (a, b) =>
                                  new Date(b?.date || 0) -
                                  new Date(a?.date || 0)
                              )
                              .map((item, i) => {
                                const name =
                                  item?.file?.originalname ||
                                  item.title ||
                                  item.label ||
                                  item.name ||
                                  `Item ${i + 1}`;
                                const dateStr = item.date
                                  ? new Date(item.date)
                                      .toISOString()
                                      .slice(0, 10)
                                  : "";
                                const isNew = item.date
                                  ? (Date.now() -
                                      new Date(item.date).getTime()) /
                                      (1000 * 60 * 60 * 24) <=
                                    7
                                  : false;

                                return (
                                  <li
                                    key={i}
                                    className="flex items-center flex-wrap gap-2"
                                  >
                                    {dateStr && (
                                      <span className="text-teal-700 font-semibold">
                                        {dateStr}
                                      </span>
                                    )}
                                    {dateStr && (
                                      <span className="text-teal-700">::</span>
                                    )}
                                    <button
                                      onClick={() => handleViewFile(item._id)}
                                      className="text-teal-700 hover:underline"
                                    >
                                      {name}
                                    </button>
                                    {isNew && (
                                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-rose-100 text-rose-600 font-medium">
                                        New
                                      </span>
                                    )}
                                  </li>
                                );
                              })}
                          </ul>
                        )}

                        {title === "CAS" && (
                          <ul className="list-disc pl-6 space-y-2">
                            {(casData || []).map((item, i) => (
                              <li key={i}>
                                <a
                                  href={
                                    item.href || item.link || item.url || "#"
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {item.label ||
                                    item.name ||
                                    item.title ||
                                    `Item ${i + 1}`}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcadamicAffairs;
