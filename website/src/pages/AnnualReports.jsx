import React from "react";
import { BackButton } from "../components/BackButton";
import { FileText } from "lucide-react";
import {AnnualReport2016,AnnualReport2017,AnnualReport2020} from "../assets/index.js";
const rows = [
  { year: 2016, name: "Annual Report 2016", url: AnnualReport2016 },
  { year: 2017, name: "Annual Report 2017", url: AnnualReport2017 },
  { year: 2020, name: "Annual Report 2020", url: AnnualReport2020 },
];

const AnnualReports = () => {
  const handleOpen = (url) => {
    if (!url || url === "#") return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
    <div className="px-4 sm:px-16 py-8">
      <BackButton />
      <h1 className="text-3xl font-bold mb-6 text-teal-800">
        Annual Reports
      </h1>

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full text-left border border-[#ccc]">
          <thead className="bg-teal-700 text-white">
            <tr>
              <th className="px-4 py-2">S.No</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">PDF</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.year} className="border-t border-[#ccc]">
                <td className="px-4 py-2">{idx + 1}</td>
                <td className="px-4 py-2">{r.name}</td>
                <td className="px-4 py-2">
                  <button
                    type="button"
                    onClick={() => handleOpen(r.url)}
                    className={`inline-flex items-center p-2 rounded hover:bg-teal-50 ${
                      !r.url || r.url === "#" ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                    }`}
                    aria-label={`Open ${r.name}`}
                  >
                    <FileText className="w-5 h-5 text-teal-700" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500 mt-4">
        Note: PDF links will be enabled once files are available.
      </p>
    </div>
    </>
  );
};

export default AnnualReports;
