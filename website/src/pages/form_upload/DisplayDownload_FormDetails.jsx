import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
import { formFieldLabels } from "./Data";
import { aknuAdikavi, aknuNewLogo } from "@/assets";

const DisplayDownload_FormDetails = ({
  obj,
  files = [],
  labels = formFieldLabels,
}) => {
  const componentRef = useRef();
  const formid = localStorage.getItem("formId")?.replace(/^"|"$/g, "");

  console.log("______formid", formid);
  const handleDownloadPDF = async () => {
    console.log("download started ✅");
    const element = componentRef.current;

    if (!element) {
      console.error("Element not found for PDF generation.");
      alert("Error: PDF content not ready.");
      return;
    }

    console.log("Element to print:", element);
    console.log("InnerHTML:", element.innerHTML);

    const opt = {
      margin: 10,
      filename: "submission-details.pdf",
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: {
        scale: 2,
        ignoreElements: (el) => el.classList?.contains("html2canvas-ignore"),
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    await html2pdf()
      .set(opt)
      .from(element)
      .save()
      .catch((err) => console.log("Download Error", err));
    // setTimeout(() => {
    // }, 500); // Delay ensures proper rendering
  };

  const handleClick = () => {
    alert("Button clicked ✅");
    handleDownloadPDF();
  };

  const sections = [
    {
      title: "Personal Information",
      fields: [
        "department",
        "hasFIR",
        "firDescription",
        "specialization",
        "name",
        "fatherName",
        "motherName",
        "gender",
        "dob",
        "mobileNumber",
        "alternateMobileNumber",
        "email",
        "address",
        "nationality",
        "religion",
        "caste",
        "subCaste",
        "phCategory",
      ],
    },
    {
      title: "Contact Information",
      fields: [
        "mobileNumber",
        "alternateMobileNumber",
        "email",
        "address",
        "aadharNumber",
        "panNumber",
      ],
    },
    {
      title: "Educational Qualifications",
      fields: [
        "sscBoard",
        "sscPercentage",
        "sscYearOfPassing",
        "intermediateBoard",
        "intermediatePercentage",
        "intermediateYearOfPassing",
        "graduationDegree",
        "graduationPercentage",
        "graduationYearOfPassing",
        "graduationUniversity",
        "postGraduationDegree",
        "postGraduationPercentage",
        "postGraduationYearOfPassing",
        // "postGraduationUniversity",
        "graduationDegrees",
        "postGraduationDegrees",
        "additionalDegrees",
        "bEd",
        "mEd",
        "mphil",
        "phdPassedYear",
        "phdTopic",
        "net",
        "set",
        "slet",
      ],
    },
    {
      title: "Proffessional Information",
      fields: ["workExperience", "totalTeachingExperience"],
    },
    // {
    //   title: "Other Experience",
    //   fields: [
    //     "experience",
    //     "totalTeachingExperience",
    //     "experienceDetails",
    //     "experienceInHOD",
    //     "workExperience",
    //   ],
    // },
    {
      title: "Research and Publications",
      fields: [
        "phdTopicPapers",
        "phdTopicPapersInternational",
        // "ResearchPublications",
        "PublicationsNational",
        "PublicationsInternational",
        // "publications",
        'patents',
        // "PatentsAndPublications242025",
        "PatentsAndPublicationsInter242025",
        "conferencesAndSeminarsNational",
        "conferencesAndSeminarsNationalPresented",
        "conferencesAndSeminarsNationalOrganized",
        "conferencesAndSeminarsInterNationalAttended",
        "conferencesAndSeminarsInterNationalPresented",
        "conferencesAndSeminarsInterNationalOrganized",
        "membersNational",
        "membersInternational",
        "nptelORswayamORmoocs",
        "best3Articles",
        "awardsIfAny",
        "Contribution",
        "anyOtherConsideration",
        "publication",
      ],
    },
    // {
    //   title: "Certifications & Memberships",
    //   fields: [
    //     // "net",
    //     // "set",
    //     // "slet",
    //     // "netQualified",
    //     // "netSubject",
    //     // "netYear",
    //     // "netORSetORSLET",
    //     // "netORsetORslet",
    //     // "setQualified",
    //     // "setSubject",
    //     // "setYear",
    //     // "set",
    //     "membersNational",
    //     "membersInternational",
    //     "nptelORswayamORmoocs",
    //   ],
    // },
    // {
    //   title: "Documents",
    //   fields: [
    //     "aadhaar",
    //     "pan",
    //     "ssc",
    //     "intermediate",
    //     "graduation",
    //     "postGraduation",
    //     "photo",
    //     "signature",
    //     "mphilCertificate",
    //     "med",
    //     "phdGraduation",
    //     "patentsProof",
    //   ],
    // },
    // {
    //   title: "Others",
    //   fields: [
    //     "Contribution",
    //     "awardsIfAny",
    //     "anyOtherConsideration",
    //     "createdAt",
    //     "_id",
    //   ],
    // },
  ];

  const renderFieldValue = (value) => {
    if (!value || value === "")
      return <span className="text-[#fb2c36]">NA</span>;

    try {
      const parsed = typeof value === "string" ? JSON.parse(value) : value;
      if (Array.isArray(parsed)) {
        if (
          parsed.length === 0 ||
          parsed.every((item) => JSON.stringify(item) === "{}" || item === "")
        ) {
          return <span className="text-[#fb2c36]">NA</span>;
        }
        return (
          <ul className="list-disc ml-4">
            {parsed.map((item, idx) => (
              <li key={idx}>
                {typeof item === "object"
                  ? Object.entries(item)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ")
                  : item}
              </li>
            ))}
          </ul>
        );
      }
      if (typeof parsed === "object") {
        return Object.entries(parsed).map(([k, v]) => (
          <div key={k}>
            <strong>{k}: </strong> {String(v)}
          </div>
        ));
      }
    } catch {
      return value;
    }

    return String(value);
  };

  return (
    <div>
      {/* Download Button */}
      <div className="text-center mb-4">
        <button
          id="downloadBtn"
          onClick={handleClick}
          className="html2canvas-ignore"
          style={{
            background: "#2dd4bf",
            color: "black",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: "bold",
            zIndex: 9999,
            position: "relative",
            pointerEvents: "auto",
          }}
        >
          Download as PDF
        </button>
      </div>

      {/* PDF content */}
      <div
        ref={componentRef}
        style={{
          color: "black",
          borderRadius: "10px",
          background: "white",
          padding: "20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4 text-center md:text-left space-y-4 md:space-y-0">
          <img
            src={aknuNewLogo}
            alt="AKNU Logo"
            className="w-20 h-20 object-contain"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#2B7870]">
              ADIKAVI NANNAYA UNIVERSITY
            </h1>
            <h2 className="text-base sm:text-xl font-semibold">
              ఆదికవి నన్నయ విశ్వవిద్యాలయం
            </h2>
            <p className="text-xs sm:text-sm font-medium text-[#2B7870]">
              RAJAMAHENDRAVARAM, ANDHRA PRADESH, INDIA - 533296
            </p>
          </div>
          <img
            src={aknuAdikavi}
            alt="Adikavi"
            className="w-20 h-20 object-contain"
          />
        </div>

        {/* Form Title */}
        <h2 className="text-lg sm:text-xl font-bold text-center mb-6 underline">
          Appraisal Form for Adhoc Faculty
        </h2>
        <h2 className="text-lg sm:text-xl  text-center mb-6 ">
          Submission Id: {formid}
        </h2>

        {/* Sections */}
        {sections.map((section, secIdx) => {
          const validFields = section.fields.filter((f) => f in obj);
          if (validFields.length === 0) return null;

          return (
            <div key={secIdx} className="mb-7 page-break-inside-avoid">
              <h3 className="text-sm sm:text-base font-semibold bg-[#f3f4f6] px-3 py-2 border rounded-t">
                {section.title}
              </h3>
              <table className="w-full border border-[#d1d5dc] text-[17px]">
                <thead className="bg-[#f3f4f6]">
                  <tr>
                    <th className="border p-2 text-left">Field</th>
                    <th className="border p-2 text-left">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {validFields.map((key) => (
                    <tr key={key}>
                      <td className="border p-2 font-medium">
                        {labels[key] || key}
                      </td>
                      <td className="border p-2">
                        {obj[key] && obj[key] !== "" ? (
                          renderFieldValue(obj[key])
                        ) : (
                          // String(obj[key])
                          <span className="text-[#fb2c36]">NA</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm border border-[#d1d5dc]">
                  <tbody>
                    {validFields.map((key) => (
                      <tr key={key} className="odd:bg-[#f9fafb] align-top">
                        <td className="border p-2 font-medium w-1/3">
                          {labels[key] || key}
                        </td>
                        <td className="border p-2">{renderFieldValue(obj[key])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div> */}
            </div>
          );
        })}

        {/* Submitted Files */}
        <h3 className="text-sm sm:text-base font-semibold mb-2 mt-6">
          Submitted Files
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm border border-[#d1d5dc]">
            <thead className="bg-[#f3f4f6]">
              <tr>
                <th className="border p-2">S.No</th>
                <th className="border p-2">File</th>
                <th className="border p-2">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {files.map((ele, idx) => (
                <tr key={idx} className="odd:bg-[#f9fafb]">
                  <td className="border p-2 text-center">{idx + 1}</td>
                  <td className="border p-2">{labels[ele] || ele}</td>
                  <td className="border p-2 text-[#00a63e] font-medium text-center">
                    Yes
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Signature */}
        <div className="text-right text-sm sm:text-base mt-10 pr-6">
          Signature
        </div>
      </div>

      <button
        className="cursor-pointer p-[5px_20px] bg-[#00d5be] rounded-md self-center text-[#000000]"
        onClick={handleDownloadPDF}
        style={{ marginTop: 20 }}
      >
        Download as PDF
      </button>
    </div>
  );
};

export default DisplayDownload_FormDetails;
