import React, { useState, useEffect } from "react";
import {
  FileText,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { collegeTypesBase } from "../siteData/affiliatedCollegesData";
import { allCollegesData } from "../siteData/affiliatedCollegesData";
const CollegeNavigator = () => {
  const themeColor = "#007367";
  const lightColor = "#f0f7f4";
  const cardHoverColor = "#e0f2f1";
  const [expandedCollege, setExpandedCollege] = useState(null);

  const toggleCollege = (collegeId) => {
    setExpandedCollege((prev) => (prev === collegeId ? null : collegeId));
  };

  return (
    <div className="min-h-screen mt-5">
      <header className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-teal-800 mb-4">
          Affiliated Colleges
        </h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collegeTypesBase.map((type, index) => {
          const id = type.id || index;

          return (
            <div
              key={id}
              onClick={() => toggleCollege(id)}
              className={`p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 cursor-pointer self-start ${
                expandedCollege === (type.id || index) ? "bg-gray-50" : ""
              }`}
              style={{ borderTopColor: themeColor }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold" style={{ color: themeColor }}>
                  {type.name}
                </h2>
                {expandedCollege === id ? (
                  <ChevronDown size={20} style={{ color: themeColor }} />
                ) : (
                  <ChevronRight size={20} style={{ color: themeColor }} />
                )}
              </div>

              <div
                className={`transition-all duration-300 overflow-hidden ${
                  expandedCollege === id
                    ? "max-h-[2000px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
                style={{
                  transition: "max-height 0.3s ease, opacity 0.2s ease",
                }}
              >
                {type.districts && type.districts.length > 0 && (
                  <div className="pt-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white overflow-hidden">
                        <thead>
                          <tr className="bg-teal-700 text-white">
                            <th className="px-4 py-2 text-left">
                              College List
                            </th>
                            <th className="px-4 py-2 text-left">
                              Contact Details
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {type.districts.map((district, index) => (
                            <tr
                              key={`${type.name}-${index}`}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-4 py-3 text-sm text-gray-700 border-b">
                                {district.CollegeList ? (
                                  <a
                                    href={district.CollegeList}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-blue-600 hover:text-blue-800"
                                  >
                                    {/* <FileText size={14} className="mr-1" /> */}
                                    {district.nameOfDistrict || district.name}
                                    {/* <ExternalLink size={12} className="ml-1" /> */}
                                  </a>
                                ) : (
                                  <span className="text-gray-400">
                                    Not available
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 border-b">
                                {district.CollegeContactDetails ? (
                                  <a
                                    href={district.CollegeContactDetails}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-blue-600 hover:text-blue-800"
                                  >
                                    {/* <FileText size={14} className="mr-1" /> */}
                                    View Details
                                    {/* <ExternalLink size={12} className="ml-1" /> */}
                                  </a>
                                ) : (
                                  <span className="text-gray-400">
                                    Not available
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {allCollegesData.map((type, index) => {
          const id = type.id || index;

          return (
            <div
              key={id}
              className="p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 cursor-pointer self-start bg-gray-50"
              style={{ borderTopColor: themeColor }}
            >
              <a
                href={type.collges}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <div className="flex items-center justify-between">
                  <h2
                    className="text-xl font-bold"
                    style={{ color: themeColor }}
                  >
                    {type.name}
                  </h2>
                  <ExternalLink size={20} style={{ color: themeColor }} />
                </div>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CollegeNavigator;

import {
  Trophy,
  BarChart2,
  Castle,
  Award,
  School,
  Star,
  BookOpen,
  Feather,
  ClipboardList,
  X,
  Download,
} from "lucide-react";
import { useFolderFiles } from "../utils/pdfLocation";
import { Undergraduate, resources } from "../utils/url";
import GuidelinesSection from "./ApplicationGuidelines";

export const LinkNavigator = () => {
  const themeColor = "#007367";
  const accentColor = "#00a896";
  const lightColor = "#f0f7f4";

  function getIconByName(name) {
    const lower = name.toLowerCase();
    if (lower.includes("autonomous")) return <Award size={24} />;
    if (lower.includes("naac")) return <Star size={24} />;
    if (lower.includes("women")) return <Feather size={24} />;
    if (lower.includes("government")) return <Castle size={24} />;
    if (lower.includes("permanent")) return <School size={24} />;
    if (lower.includes("cpe")) return <BarChart2 size={24} />;
    if (lower.includes("2(f)") || lower.includes("12(b)"))
      return <BookOpen size={24} />;
    if (lower.includes("total") || lower.includes("count"))
      return <BarChart2 size={24} />;
    return <Trophy size={24} />;
  }

  const [activeCategory, setActiveCategory] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [categories, setCategories] = useState([]);

  const openModal = (category) => {
    setActiveCategory(category);
  };

  const closeModal = () => {
    setActiveCategory(null);
  };

  useEffect(() => {
    // async function fetchResources() {
    //   try {
    //     const res = await fetch(resources);
    //     const data = await res.json();
    //     const mapped = data.map((item) => ({
    //       name: item.label || "Untitled",
    //       icon: getIconByName(item.label),
    //       link: item.href,
    //     }));
    //     setCategories(mapped);
    //   } catch (err) {
    //     console.error("❌ Failed to fetch AKNU Resources", err);
    //   }
    // }
    // fetchResources();
  }, []);

  return (
    <div className="min-h-screen mt-8">
      {/* Elegant Header */}
      {/* <div className="px-4 sm:px-16">
        <div className="max-w-full mx-auto text-center flex justify-center mb-6 md:mb-6">
          <h2 className="text-3xl font-bold flex text-center text-teal-800 mb-4">
            AKNU Resources
          </h2>
        </div>
      </div> */}

      {/* AKNU Resources Section with full-width background */}
      {/* <div>
        <div className="px-4 sm:px-16">
      
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className={`relative group overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 ${category.children ? "cursor-pointer" : ""}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => (category.children ? openModal(category) : null)}
              >
                {!category.children ? (
                  <a
                    href={category.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-6 md:p-8"
                  >
                    <CardContent
                      category={category}
                      index={index}
                      hoveredIndex={hoveredIndex}
                      themeColor={themeColor}
                      lightColor={lightColor}
                    />
                  </a>
                ) : (
                  <div className="p-6 md:p-8">
                    <CardContent
                      category={category}
                      index={index}
                      hoveredIndex={hoveredIndex}
                      themeColor={themeColor}
                      lightColor={lightColor}
                    />
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 overflow-hidden">
                  <div
                    className="h-full w-0 group-hover:w-full transition-all duration-500"
                    style={{ backgroundColor: themeColor }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      <GuidelinesSection />
      {/* Modal for Children */}
      {activeCategory && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-3xl font-semibold flex items-center">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                  style={{ backgroundColor: lightColor, color: themeColor }}
                >
                  {activeCategory.icon}
                </div>
                {activeCategory.name}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCategory.children.map((item, i) => (
                  <a
                    key={i}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-lg border border-gray-200 hover:border-teal-300 transition-colors group"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-800 group-hover:text-teal-700 transition-colors">
                          {item.name}
                        </h4>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CardContent = ({
  category,
  index,
  hoveredIndex,
  themeColor,
  lightColor,
}) => {
  return (
    <>
      <div className="flex items-start justify-between">
        <div
          className="w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-4 md:mb-6"
          style={{
            backgroundColor: hoveredIndex === index ? themeColor : lightColor,
            color: hoveredIndex === index ? "white" : themeColor,
          }}
        >
          {category.icon}
        </div>
        <span className="text-3xl md:text-3xl font-light text-gray-300 group-hover:text-gray-400 transition-colors">
          {index + 1}
        </span>
      </div>

      <h3 className="text-xl md:text-3xl font-semibold mb-2 text-gray-800 group-hover:text-teal-800 transition-colors">
        {category.name}
      </h3>

      <div className="flex items-center">
        <span className="text-sm font-medium" style={{ color: "#00a896" }}>
          {category.children ? "View Options" : "View PDF"}
        </span>
        <ChevronRight size={16} className="ml-1" style={{ color: "#00a896" }} />
      </div>
    </>
  );
};
