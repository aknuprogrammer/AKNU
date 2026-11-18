import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formFieldLabels } from "./Data";
import "../../assets/fonts/NotoSansTelugu-VariableFont_wdth,wght-normal";
// Just import it to register

const DisplayDownload_FormDetails = ({
  obj,
  files = [],
  labels = formFieldLabels,
}) => {
  const componentRef = useRef();

  const formatLabel = (key) => {
    if (formFieldLabels[key]) return formFieldLabels[key];

    return key
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
  };

  const fileName = obj?.name
    ? `${obj.name.trim().replace(/\s+/g, "_")}_details.pdf`
    : "submission-details.pdf";

  const isFileLike = (obj) => {
    return (
      obj &&
      typeof obj === "object" &&
      "data" in obj &&
      "fileName" in obj &&
      "contentType" in obj
    );
  };

  const renderValue = (value) => {
    if (!value) return <span style={{ color: "red" }}>NA</span>;

    if (Array.isArray(value)) {
      // If array contains file-like objects, skip
      if (value.some((item) => isFileLike(item))) {
        return null;
      }

      // If array contains objects with non-file content
      if (typeof value[0] === "object") {
        return (
          <ul className="list-disc pl-4">
            {value.map((v, i) => (
              <li key={i}>
                {Object.entries(v)
                  .filter(([k, val]) => !isFileLike(val) && k !== "_id")
                  .map(([k, val]) => `${formatLabel(k)}: ${val}`)
                  .join(", ")}
              </li>
            ))}
          </ul>
        );
      }

      return <span>{value.join(", ")}</span>;
    }

    // If value is a file-like object, skip rendering
    if (isFileLike(value)) return null;

    if (typeof value === "object") {
      return (
        <span>
          {Object.entries(value)
            .filter(([k, val]) => !isFileLike(val) && k !== "_id")
            .map(([k, val]) => `${formatLabel(k)}: ${val}`)
            .join(", ")}
        </span>
      );
    }

    return <span>{String(value)}</span>;
  };

  const handleDownloadPDF = () => {
    const pdf = new jsPDF();

    // Header section
    pdf.setFontSize(16);
    pdf.setTextColor("#2B7870");
    pdf.text("ADIKAVI NANNAYA UNIVERSITY", 105, 20, null, null, "center");

    // pdf.setFont("NotoSansTelugu", "normal");
    // pdf.setFontSize(14);
    // pdf.setTextColor(0, 0, 0); // optional: reset to black
    // pdf.text("ఆదికవి నన్నయ విశ్వవిద్యాలయం", 105, 28, null, null, "center");

    pdf.setFontSize(10);
    pdf.setTextColor("#2B7870");
    pdf.text(
      "RAJAMAHENDRAVARAM, ANDHRA PRADESH INDIA - 533296",
      105,
      34,
      null,
      null,
      "center"
    );

    pdf.setDrawColor(0);
    pdf.line(10, 38, 200, 38);

    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Appraisal Form for Adhoc Faculty", 105, 46, null, null, "center");

    // Initial Y position
    let y = 54;

    const isFileLike = (val) =>
      val &&
      typeof val === "object" &&
      "data" in val &&
      "fileName" in val &&
      "contentType" in val;

    const formatValueForPDF = (val) => {
      if (!val) return "NA";

      if (typeof val === "string" || typeof val === "number")
        return String(val);

      if (Array.isArray(val)) {
        if (val.length === 0) return "NA";
        if (val.every((v) => isFileLike(v))) return "";

        return val
          .map((item) => {
            if (typeof item === "string") return item;
            if (typeof item === "object") {
              return Object.entries(item)
                .filter(([k, v]) => !isFileLike(v) && k !== "_id")
                .map(([k, v]) => `${formatLabel(k)}: ${v}`) // ✅ FIXED
                .join(", ");
            }
            return String(item);
          })
          .join(" | ");
      }

      if (typeof val === "object") {
        if (isFileLike(val)) return "";
        return Object.entries(val)
          .filter(([k, v]) => !isFileLike(v) && k !== "_id")
          .map(([k, v]) => `${formatLabel(k)}: ${v}`) // ✅ FIXED
          .join(", ");
      }

      return String(val);
    };

    // Form fields table
    const rows = mykeys.map(([key, value]) => [
      labels[key] || formatLabel(key),
      formatValueForPDF(value),
    ]);

    autoTable(pdf, {
      startY: y,
      head: [["Field", "Value"]],
      body: rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [43, 120, 112] },
      theme: "grid",
    });

    const afterFormTableY = pdf.lastAutoTable.finalY + 10;

    // Files Table
    autoTable(pdf, {
      startY: afterFormTableY,
      head: [["S.No", "File Name", "Uploaded"]],
      body: files.map((fileKey, index) => [
        index + 1,
        labels[fileKey] || fileKey,
        "Yes",
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [43, 120, 112] },
      theme: "striped",
    });

    const afterFilesTableY = pdf.lastAutoTable.finalY + 20;

    pdf.setFontSize(12);
    pdf.text("Signature", 180, afterFilesTableY);

    pdf.save(fileName);
  };

  const fileKeys = Object.entries(obj)
    .filter(
      ([_, value]) =>
        value &&
        typeof value === "object" &&
        "data" in value &&
        "fileName" in value
    )
    .map(([key]) => key);

  const mykeys = Object.entries(obj).filter(
    ([key]) => key !== "adminPassword" && !fileKeys.includes(key)
  );

  const chunkSize = 22;
  const chunks = [];
  for (let i = 0; i < mykeys.length; i += chunkSize) {
    chunks.push(mykeys.slice(i, i + chunkSize));
  }

  return (
    <div className="px-[5%] flex flex-col items-center">
      <button
        className="cursor-pointer p-[5px_20px] bg-teal-400 rounded-md self-center text-black"
        onClick={handleDownloadPDF}
        style={{ marginTop: 20 }}
      >
        Download as PDF
      </button>

      <style>{`
        .page-break {
          page-break-before: always;
          break-before: always;
        }
        .break-inside-avoid,
        .page-break-inside-avoid {
          break-inside: avoid;
          page-break-inside: avoid;
        }
      `}</style>

      <br />

      <div
        ref={componentRef}
        style={{
          color: "black",
          borderRadius: "15px",
          background: "white",
          padding: "10px",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-3 pb-[10px] gap-4">
          <a href="/">
            <img
              src="./aknu-logo_new.png"
              alt="AKNU"
              className="w-24 h-24 object-contain"
            />
          </a>
          <div className="text-center">
            <div className="py-3">
              <h1
                className="text-2xl font-bold font-[cennerik]"
                style={{ color: "#2B7870" }}
              >
                ADIKAVI NANNAYA UNIVERSITY
              </h1>
              <h1 className="text-2xl font-bold">
                ఆదికవి నన్నయ విశ్వవిద్యాలయం
              </h1>
              <p
                className="text-xs mt-2 font-bold"
                style={{ color: "#2B7870" }}
              >
                RAJAMAHENDRAVARAM, ANDHRA PRADESH INDIA - 533296
              </p>
            </div>
          </div>
          <a href="/">
            <img
              src="./aknu-adikavi.png"
              alt="AKNU"
              className="w-24 h-24 object-contain"
            />
          </a>
        </div>

        <hr />
        <br />

        {/* Form Title */}
        <h2 className="text-[30px] font-semibold mb-4 text-center">
          Appraisal Form for Adhoc faculty
        </h2>
        <br />

        {/* Form Fields */}
        {chunks.map((elechunk, eleidx) => (
          <div key={`chunk-${eleidx}`} className="chunk-section">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 gap-y-1">
              {elechunk.map(([key, value]) => {
                const isFileLike = (val) =>
                  val &&
                  typeof val === "object" &&
                  "data" in val &&
                  "fileName" in val &&
                  "contentType" in val;

                // Skip if direct file-like field
                if (isFileLike(value)) return null;

                // Skip if array of file-like fields
                if (
                  Array.isArray(value) &&
                  value.length > 0 &&
                  value.every((item) => isFileLike(item))
                ) {
                  return null;
                }

                // Skip if object and all values are file-like
                if (
                  value &&
                  typeof value === "object" &&
                  !Array.isArray(value) &&
                  Object.values(value).length > 0 &&
                  Object.values(value).every((v) => isFileLike(v))
                ) {
                  return null;
                }

                return (
                  <div
                    key={key}
                    className="text-[18px] p-[6px] break-inside-avoid page-break-inside-avoid"
                  >
                    <strong>{formatLabel(key)}:</strong>
                    <div>{renderValue(value)}</div>
                  </div>
                );
              })}
            </div>

            {eleidx !== chunks.length - 1 && <div className="page-break"></div>}
          </div>
        ))}

        {/* Submitted Files Table */}
        <h3 className="font-bold text-[25px] mb-[10px]">Submitted Files</h3>
        <table className="list-decimal space-y-2 border w-full">
          <colgroup>
            <col style={{ width: "10%" }} />
            <col style={{ width: "70%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <thead>
            <tr>
              <th className="p-1">S.No</th>
              <th className="p-1">Name</th>
              <th className="p-1">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {files.map((ele, idx) => (
              <tr key={ele}>
                <td className="p-1 border">{idx + 1}</td>
                <td className="p-1 border flex-1">
                  {labels[ele] || ele}
                  <br />
                  <a
                    href={`data:${obj[ele]?.contentType};base64,${obj[ele]?.data}`}
                    download={obj[ele]?.fileName || "file"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    View
                  </a>
                </td>
                <td className="p-1 border">Yes</td>
              </tr>
            ))}
          </tbody>
        </table>

        <br />
        <br />
        <div className="text-right pr-[70px] text-[20px]">Signature</div>
        <br />
        <br />
      </div>

      <button
        className="cursor-pointer p-[5px_20px] bg-teal-400 rounded-md self-center text-black"
        onClick={handleDownloadPDF}
        style={{ marginTop: 20 }}
      >
        Download as PDF
      </button>
    </div>
  );
};

export default DisplayDownload_FormDetails;
