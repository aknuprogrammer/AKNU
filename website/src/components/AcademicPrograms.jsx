import React, { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  BarChart2,
  BookText,
  Gavel,
  Scale,
  Users,
  Pill,
  FlaskConical,
  Leaf,
  Globe,
  Microscope,
  Computer,
  Ruler,
  Calculator,
  GraduationCap,
} from "lucide-react";

function TabButton({ label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
        isActive ? "text-teal-700 border-teal-700" : "text-gray-600 border-transparent hover:text-teal-700"
      }`}
    >
      {label}
    </button>
  );
}
function ProgramCard({ name, icon }) {
  return (
    <div className="bg-white border-none rounded-lg p-4 text-center shadow-sm transition-all duration-300 ease-in-out cursor-default hover:-translate-y-1 hover:shadow-md">
      <div className="flex justify-center mb-3 text-teal-700 text-3xl">
        {icon || "📘"}
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-[#333]">{name}</h3>
    </div>
  );
}

export default function AcademicPrograms({ ugPrograms = [], pgPrograms = [], prePhdPrograms = [] }) {
  const [activeTab, setActiveTab] = useState("UG");

  const getIconFor = (nameRaw = "") => {
    const name = String(nameRaw).toLowerCase();
    if (/(commerce|management|mba|business)/.test(name)) return <BriefcaseBusiness size={30} className="text-teal-700" />;
    if (/(economics|economy|statistics)/.test(name)) return <BarChart2 size={30} className="text-teal-700" />;
    if (/(english|telugu|hindi|language|arts|literature)/.test(name)) return <BookText size={30} className="text-teal-700" />;
    if (/(law|llb|llm)/.test(name)) return <Gavel size={30} className="text-teal-700" />;
    if (/(political)/.test(name)) return <Scale size={30} className="text-teal-700" />;
    if (/(social work|sociology)/.test(name)) return <Users size={30} className="text-teal-700" />;
    if (/(pharm|pharmacy)/.test(name)) return <Pill size={30} className="text-teal-700" />;
    if (/(aqua|aquaculture)/.test(name)) return <FlaskConical size={30} className="text-teal-700" />;
    if (/(biochem|chemistry)/.test(name)) return <FlaskConical size={30} className="text-teal-700" />;
    if (/(biotech|zoology|biology|life science)/.test(name)) return <Microscope size={30} className="text-teal-700" />;
    if (/(botany|plant)/.test(name)) return <Leaf size={30} className="text-teal-700" />;
    if (/(geo|geology|earth)/.test(name)) return <Globe size={30} className="text-teal-700" />;
    if (/(computer|cse|it|software|cs)/.test(name)) return <Computer size={30} className="text-teal-700" />;
    if (/(civil)/.test(name)) return <Ruler size={30} className="text-teal-700" />;
    if (/(math|mathematics)/.test(name)) return <Calculator size={30} className="text-teal-700" />;
    if (/(pre-?phd|pre phd|phd)/.test(name)) return <GraduationCap size={30} className="text-teal-700" />;
    // default
    return <GraduationCap size={30} className="text-teal-700" />;
  };

  const tabs = [
    { key: "UG", label: "UG Programs" },
    { key: "PG", label: "PG Programs" },
    { key: "PrePhD", label: "PrePhD Programs" },
  ];

  const dataMap = useMemo(
    () => ({ UG: ugPrograms, PG: pgPrograms, PrePhD: prePhdPrograms }),
    [ugPrograms, pgPrograms, prePhdPrograms]
  );

  const programs = dataMap[activeTab] || [];

  return (
    <div className="w-[95vw] max-w-[95vw] mx-auto px-4 sm:px-8">
      <div className="flex gap-6 border-b mb-6">
        {tabs.map((t) => (
          <TabButton key={t.key} label={t.label} isActive={activeTab === t.key} onClick={() => setActiveTab(t.key)} />
        ))}
      </div>

      {programs.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No programs available.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {programs.map((p, idx) => {
            const name = p?.name || String(p);
            const iconEl = p?.icon || getIconFor(name);
            return <ProgramCard key={name || idx} name={name} icon={iconEl} />;
          })}
        </div>
      )}
    </div>
  );
}
