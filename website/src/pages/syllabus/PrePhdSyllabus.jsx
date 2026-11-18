import { useEffect, useState } from "react";
import {
  FiDownload,
  FiChevronDown,
  FiSearch,
} from "react-icons/fi";

const PrePhdSyllabus = ({ legacyData = [] }) => {
  const [dynamicSyllabuses, setDynamicSyllabuses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeYear, setActiveYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedNestedCategory, setExpandedNestedCategory] = useState(null);

  // Fetch dynamic syllabuses from the API
  useEffect(() => {
    const fetchSyllabuses = async () => {
      try {
        const apiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
        const response = await fetch(`${apiUrl}/api/syllabus/all/Pre-PhD`);
        const data = await response.json();
        
        // Group flat data into: Year -> Category -> Dept -> Subject structure
        const grouped = data.reduce((acc, item) => {
          let rawYear = item.effectiveYear ? item.effectiveYear.trim() : "";
          let year = rawYear;
          if (year && !year.startsWith("W.E.F.") && !year.includes("AB")) {
            year = `W.E.F. ${year} AB`;
          } else if (year && !year.startsWith("W.E.F.")) {
            year = `W.E.F. ${year}`;
          }
          if (!year) year = "W.E.F. 2026-27 AB";

          if (!acc[year]) acc[year] = {};
          if (!acc[year][item.category]) acc[year][item.category] = {};
          if (!acc[year][item.category][item.department]) acc[year][item.category][item.department] = [];
          
          acc[year][item.category][item.department].push({
            name: item.title,
            semesters: (item.files || []).map(file => ({ 
              name: file.title, 
              syllabus: `${apiUrl}/api/syllabus/file/view/${item._id}/${file._id}` 
            }))
          });
          return acc;
        }, {});

        setDynamicSyllabuses(grouped);
      } catch (err) {
        console.error("Failed to fetch dynamic syllabuses:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSyllabuses();
  }, []);

  // Combine dynamic years and "Legacy Syllabus"
  const dynamicYears = Object.keys(dynamicSyllabuses).sort((a, b) => {
    const yearA = parseInt(a.match(/\d{4}/)?.[0] || 0);
    const yearB = parseInt(b.match(/\d{4}/)?.[0] || 0);
    return yearB - yearA;
  });

  const allYears = legacyData.length > 0 ? [...dynamicYears, "Legacy Syllabus"] : dynamicYears;

  useEffect(() => {
    if (isLoading || allYears.length === 0) return;
    // Set initial active year (prefer dynamic years first, fallback to legacy)
    if (!activeYear) {
      setActiveYear(allYears[0]);
    }
  }, [isLoading, allYears, activeYear]);

  return (
    <div className="space-y-6">
      {/* 1. Year Selection Tabs (Same as UG/PG) */}
      {allYears.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-teal-900 mb-4">
            Select Academic Year
          </h3>
          <div className="flex flex-wrap gap-2">
            {allYears.map((year) => (
              <button
                key={year}
                onClick={() => {
                  setActiveYear(year);
                  setSearchQuery(""); // Reset search on tab change
                  setExpandedCategory(null);
                  setExpandedNestedCategory(null);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeYear === year
                    ? "bg-teal-600 text-white shadow-md"
                    : "bg-white text-teal-800 hover:bg-teal-100 border border-teal-200"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Content Display based on active tab */}
      {activeYear === "Legacy Syllabus" ? (
        // Legacy Syllabus - Simple list as earlier
        <div className="bg-white py-2">
          <ul className="list-disc pl-6 space-y-2">
            {legacyData.map((item, idx) => (
              <li key={idx}>
                <a 
                  href={item.href} 
                  className="text-blue-600 hover:underline text-sm sm:text-base" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        // Dynamic Syllabus (UG/PG Accordion format)
        activeYear && (
          <div className="space-y-4">
            {/* Search Filter for dynamic data */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-teal-600" />
                </div>
                <input
                  type="text"
                  placeholder="Search research syllabuses..."
                  className="w-full pl-10 pr-4 py-3 border border-teal-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Accordions */}
            <div className="space-y-3">
              {Object.keys(dynamicSyllabuses[activeYear] || {}).map((category) => {
                const categoryData = dynamicSyllabuses[activeYear]?.[category];
                
                // Filtering logic
                let displayCategory = false;
                const filteredCategoryData = {};

                Object.keys(categoryData || {}).forEach(courseName => {
                  const courses = categoryData[courseName] || [];
                  const filteredCourses = courses.filter(course => 
                    course.name.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  if (filteredCourses.length > 0 || courseName.toLowerCase().includes(searchQuery.toLowerCase())) {
                    filteredCategoryData[courseName] = filteredCourses.length > 0 ? filteredCourses : courses;
                    displayCategory = true;
                  }
                });

                if (!displayCategory && searchQuery !== "") return null;

                return (
                  <div key={category} className="border border-[#ddd] shadow-sm">
                    <button
                      className="w-full text-left py-3 px-4 bg-teal-700 text-white font-semibold text-lg flex justify-between items-center"
                      onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                      type="button"
                    >
                      {category}
                      <span className={`transform transition-transform duration-300 ${expandedCategory === category ? "rotate-180" : "rotate-0"}`}>
                        ▼
                      </span>
                    </button>
                    {expandedCategory === category && (
                      <div className="bg-white p-5 space-y-2">
                        {Object.keys(filteredCategoryData).map((courseName) => {
                          const courses = filteredCategoryData[courseName];
                          const nestedKey = `${category}-${courseName}`;
                          return (
                            <div key={courseName} className="border border-[#ddd] shadow-sm">
                              <button
                                className="w-full text-left py-2 px-4 bg-[#f5f5f5] border border-[#ddd] text-teal-700 font-semibold text-base flex justify-between items-center"
                                onClick={() => setExpandedNestedCategory(expandedNestedCategory === nestedKey ? null : nestedKey)}
                                type="button"
                              >
                                {courseName}
                                <span className="float-right font-bold">{expandedNestedCategory === nestedKey ? "-" : "+"}</span>
                              </button>
                              {expandedNestedCategory === nestedKey && (
                                <div className="p-4 border border-t-0 border-[#ddd] bg-white">
                                  <div className="space-y-3">
                                    {courses.map((course, idx) => (
                                      <div key={idx} className="pl-2 border-l-2 border-teal-200">
                                        <h4 className="text-sm font-semibold text-teal-800 mb-2">{course.name}</h4>
                                        <div className="space-y-2">
                                          {course.semesters.map((sem, sIdx) => (
                                            <a key={sIdx} href={sem.syllabus} className="flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200" target="_blank" rel="noopener noreferrer">
                                              <FiDownload className="text-teal-600" />
                                              <span>{sem.name}</span>
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default PrePhdSyllabus;
