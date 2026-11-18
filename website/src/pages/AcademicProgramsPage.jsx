import React from "react";
import AcademicPrograms from "@/components/AcademicPrograms";

export default function AcademicProgramsPage() {
  const ug = [
    { name: "B.A." },
    { name: "B.Sc" },
    { name: "B.Com" },
    { name: "B.Tech" },
    { name: "B.Ed" },
    { name: "B.B.A" },
    { name: "B.C.A" }
  ];

  const pg = [
    { name: "M.A." },
    { name: "M.Sc" },
    { name: "M.Com" },
    { name: "M.Tech" },
    { name: "M.Ed" },
    { name: "M.B.A" },
    { name: "M.C.A" }
  ];

  const prePhd = [
    { name: "Arts & Commerce" },
    { name: "Science & Technology" },
    { name: "Engineering/Education" },
  ];

  return (
    <div className="min-h-[60vh] py-8 bg-gray-50">
      <div className="w-[95vw] max-w-[95vw] mx-auto px-4 sm:px-8 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-teal-800">Academic Programs</h1>
      </div>
      <AcademicPrograms ugPrograms={ug} pgPrograms={pg} prePhdPrograms={prePhd} />
    </div>
  );
}
