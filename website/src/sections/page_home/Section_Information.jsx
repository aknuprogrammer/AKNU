import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import {
  data__circulars,
  data__jobs,
  data__results,
  data__tenders,
  examinations_Data,
  examination_Applications_data,
  examination_TimeTable_data,
  examination_jumbling_center,
} from "./Mock_Data";
import {
  BadgeCheck,
  Briefcase,
  FileText,
  Megaphone,
  ClipboardList,
  ScrollText,
  FileStack,
  ArrowRight,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";



const TabButton = ({ label, icon, active, onClick }) => {
  const colorClass = active
    ? "text-[#21605A] text-xl"
    : "text-gray-600 hover:text-[#21605A] text-xl";

  return (
    <button
      onClick={onClick}
      className={`text-xs sm:text-sm font-medium px-2 sm:px-4 py-2 border-b-2 flex flex-col sm:flex-row items-center gap-1 ${
        active ? "border-[#21605A]" : "border-transparent"
      }`}
    >
      <span className={`${colorClass}`}>{icon}</span>
      <span className={`${colorClass}`}>{label}</span>
    </button>
  );
};

const SidebarTab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`block text-left px-3 sm:px-4 py-2 w-full text-xs sm:text-sm font-medium ${
      active
        ? "bg-[#21605A] text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    {label}
  </button>
);

function isExcelContentType(contentType) {
  if (!contentType) return false;

  const excelTypes = [
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel.sheet.macroEnabled.12", // .xlsm
    "application/vnd.openxmlformats-officedocument.spreadsheetml.template", // .xltx
  ];

  return excelTypes.includes(contentType.toLowerCase());
}

const NewsList = ({ resrc_name }) => {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [resrc_name]);
  // useEffect(() => {
  //   (async () => {
  //     if (resrc_name) {
  //       const BACKEND_DOMAIN = import.meta.env.VITE_API_URL;
  //       // const GET_PATH = BACKEND_DOMAIN + "api/info/" + resrc_name + "/all";

  //       let GET_PATH;
  //       if (resrc_name === "results") {
  //         // 👇 Different API for "results"    const apiUrl = `${BASE_URL}/pdfUpload`;
  //         GET_PATH = `${BACKEND_DOMAIN}api/pdfUpload`;
  //       } else {
  //         GET_PATH = `${BACKEND_DOMAIN}api/info/${resrc_name}/all`;
  //       }
  //       console.log("GET_PATH", GET_PATH);
  //       const results = await axios.get(GET_PATH);
  //       console.log("___sdfads", results);
  //       if (results?.data?.length) {
  //         // Process the data to sort by date (newest first) and mark recent items
  //         const processedItems = results.data
  //           .map((ele) => ({
  //             date: ele.date.split("T")[0],
  //             title: ele.title,
  //             ...(resrc_name === "results"
  //               ? (isExcelContentType(ele?.file?.contentType) ? {url:"/results"}:  {
  //                   url: `${BACKEND_DOMAIN}api/pdfUpload/file/view/${ele._id}`, // ✅ use your file route
  //                 })
  //               : ele?.file
  //                 ? {
  //                     url: `${BACKEND_DOMAIN}api/info/${resrc_name}/file/view/${ele._id}`,
  //                   }
  //                 : {}),
  //             timestamp: new Date(ele.date).getTime(),
  //           }))
  //           .sort((a, b) => b.timestamp - a.timestamp);
  //         console.log("AAAAA", processedItems)
  //         setItems(processedItems);
  //       }
  //     }
  //   })();
  // }, [resrc_name]);

  useEffect(() => {
    (async () => {
      if (!resrc_name) return;
      const BACKEND_DOMAIN = import.meta.env.VITE_API_URL;
      let GET_PATH = `${BACKEND_DOMAIN}api/info/${resrc_name}/all`;

      let GET_PATH_2 = null;

      if (resrc_name === "results") {
        GET_PATH = `${BACKEND_DOMAIN}api/pdfUpload`;
        GET_PATH_2 = `${BACKEND_DOMAIN}api/results/all-batches`;
      }
      try {
        // 1️⃣ Try localStorage first
        // const cached = localStorage.getItem(`items_${resrc_name}`);
        // if (cached) {
        //   setItems(JSON.parse(cached));
        //   return;
        // }

        // 2️⃣ Fetch APIs
        let results_2_data = [];
        if (GET_PATH_2) {
          const results_2 = await axios.get(GET_PATH_2);
          if (results_2?.data?.data?.length) {
            results_2_data = results_2.data.data.map((ele) => ({
              date: ele.resultDate.split("T")[0],
              title: ele.title,
              url: "/results",
              timestamp: new Date(ele.resultDate).getTime(),
            }));
          }
        }
        // console.log(143, results_2_data);
        const results = await axios.get(GET_PATH);
        // console.log("146___results", results);
        let processedItems = [];
        if (results?.data?.length > 0) {
          // Debug: Log raw data for jobs
          if (resrc_name === "jobs") {
            console.log("Raw jobs data from API:", results.data);
          }
          processedItems = results.data.map((ele) => {
            let itemUrl = ele.link;
            
            // For jobs, check if PDF file exists first, then use hiringId/link/fallback
            if (resrc_name === "jobs") {
              // If job has a PDF file (check for file.originalname), directly link to it
              if (ele?.file && (ele.file.originalname || ele.file.buffer)) {
                itemUrl = `${BACKEND_DOMAIN}api/info/jobs/file/view/${ele._id}`;
              } else if (ele.hiringId) {
                // Use the extracted hiring notification ID
                itemUrl = `/jobs/notification/${ele.hiringId}`;
              } else if (ele.link && ele.link.trim() !== "") {
                // Use the link field directly if it's not empty
                itemUrl = ele.link;
              } else {
                // Fallback: use Model_Jobs ID (backend will look up the hiring notification)
                console.log('Job without hiringId or link, using Model_Jobs ID:', ele._id);
                itemUrl = `/jobs/notification/${ele._id}`;
              }
            } else if (!itemUrl) {
              if (resrc_name === "results") {
                itemUrl = isExcelContentType(ele?.file?.contentType)
                  ? "/results"
                  : `${BACKEND_DOMAIN}api/pdfUpload/file/view/${ele._id}`;
              } else if (ele?.file) {
                itemUrl = `${BACKEND_DOMAIN}api/info/${resrc_name}/file/view/${ele._id}`;
              }
            }
            // Debug: Log final URL for jobs
            if (resrc_name === "jobs") {
              console.log(`Job "${ele.title}" -> URL: ${itemUrl}`);
            }
            return {
              date: ele.date ? ele.date.split("T")[0] : "",
              title: ele.title,
              url: itemUrl,
              timestamp: ele.date ? new Date(ele.date).getTime() : 0,
            };
          });
        }
        console.log("processed items________________", processedItems);
        // 3️⃣ Merge results if "results"
        const finalItems = [...processedItems, ...results_2_data].sort(
          (a, b) => b.timestamp - a.timestamp
        );
        // const finalItems = [...processedItems,].sort(
        //   (a, b) => b.timestamp - a.timestamp
        // );
        setItems(finalItems);
        console.log("173_______________________", finalItems);
        // 4️⃣ Save to localStorage
        localStorage.setItem(`items_${resrc_name}`, JSON.stringify(finalItems));
      } catch (err) {
        console.error("Error fetching resource:", err);
      }
    })();
  }, [resrc_name]);

  // Calculate date 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const currentItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const delta = 1; // number of pages to show around active page
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <>
      <ul className="space-y-3 mt-4">
        {currentItems.map((item, idx) => {
          const itemDate = new Date(item.date);
          const isNew = itemDate >= sevenDaysAgo;
          return (
            <li key={idx} className="text-xs sm:text-sm">
              {item.url?.startsWith("/") ? (
                <Link
                  to={item.url}
                  className="text-[#21605A] hover:underline flex flex-col sm:flex-row gap-1 sm:gap-2 items-start sm:items-center"
                >
                  <span className="whitespace-nowrap font-semibold">
                    {item.date} ::
                  </span>
                  <span className="flex-1 text-[16px]">
                    {item.title}
                    {isNew && (
                      <span className="ml-2 px-2 py-[2px] text-[10px] sm:text-xs font-semibold text-white bg-red-400 rounded-full animate-pulse shadow-md">
                        New
                      </span>
                    )}
                  </span>
                </Link>
              ) : (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#21605A] hover:underline flex flex-col sm:flex-row gap-1 sm:gap-2 items-start sm:items-center"
                >
                  <span className="whitespace-nowrap font-semibold">
                    {item.date} ::
                  </span>
                  <span className="flex-1 text-[16px]">
                    {item.title}
                    {isNew && (
                      <span className="ml-2 px-2 py-[2px] text-[10px] sm:text-xs font-semibold text-white bg-red-400 rounded-full animate-pulse shadow-md">
                        New
                      </span>
                    )}
                  </span>
                </a>
              )}
            </li>
          );
        })}
      </ul>

      {/* Dynamic Pagination Controls */}
      {items.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row items-center sm:justify-end gap-3 sm:gap-4 mt-6 pb-2">
          <span className="text-xs sm:text-sm text-gray-500 font-medium whitespace-nowrap">
            Showing {items.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, items.length)} of {items.length} items
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-2.5 py-1.5 cursor-pointer rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              title="Previous Page"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers().map((p, index) =>
              p === "..." ? (
                <span key={`ell-${index}`} className="px-2 py-1.5 text-xs sm:text-sm text-gray-500 select-none">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-1.5 cursor-pointer rounded border text-xs sm:text-sm font-medium transition-all ${
                    currentPage === p
                      ? "bg-[#21605A] border-[#21605A] text-white shadow-sm"
                      : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-2.5 py-1.5 cursor-pointer rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              title="Next Page"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
const getApiPath = () => {
  const BACKEND_DOMAIN = import.meta.env.VITE_API_URL;

  if (activeTab === "Results") {
    return `${BACKEND_DOMAIN}/api/results/all`; // Custom endpoint for Results
  }

  // Default structure for other tabs
  let endpoint = "";
  if (activeTab === "Circular") endpoint = "circular";
  if (activeTab === "Jobs") endpoint = "jobs";
  if (activeTab === "Tenders") endpoint = "tenders";
  if (activeTab === "Examination") {
    if (activeSubTab === "Notifications") endpoint = "exam_notifications";
    if (activeSubTab === "Applications") endpoint = "exam_applications";
    if (activeSubTab === "Time Table") endpoint = "exam_timetable";
    if (activeSubTab === "Jumbling Centres") endpoint = "exam_jumblingcenters";
    if (activeSubTab === "Circulars/Proceedings")
      endpoint = "curcular_proceedings";
  }

  return endpoint ? `${BACKEND_DOMAIN}/api/info/${endpoint}/all` : "";
};

export default function AKNUStyleTabs() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Examination");
  const [activeSubTab, setActiveSubTab] = useState("Notifications");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [goItems, setGoItems] = useState([]);
  const [goCurrentPage, setGoCurrentPage] = useState(1);
  const goItemsPerPage = 10;

  useEffect(() => {
    setGoCurrentPage(1);
  }, [activeTab]);

  const tabs = [
    // { label: "Results", icon: ScrollText },
    { label: "Examination", icon: ClipboardList },
    { label: "Circular", icon: FileText },
    { label: "Jobs", icon: Briefcase },
    { label: "G.O's", icon: FileStack },
    { label: "Tenders", icon: Megaphone },
  ];

  // useEffect(() => {
  //   const params = new URLSearchParams(location.search);
  //   const item = params.get("item");
  //   if (item) {
  //     setActiveTab(item);
  //   }
  // }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const item = params.get("item");
    const sub = params.get("sub");

    if (item) {
      setActiveTab(item);
      // If no sub parameter is provided but item is Circular, set default sub tab
      if (item === "Circular" && !sub) {
        setActiveSubTab("CDC Circulars");
      }
    } else {
      // Default to Examination tab if no item parameter
      setActiveTab("Examination");
      setActiveSubTab("Notifications");
    }

    if (sub) {
      setActiveSubTab(sub);
    }

    // Scroll to section if hash is present
    if (location.hash === "#important-links") {
      const el = document.getElementById("important-links");
      if (el) {
        // Small timeout to ensure the DOM is updated with the new tab content
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location.search, location.hash]);

  useEffect(() => {
    if (activeTab === "G.O's") {
      (async () => {
        try {
          const BACKEND_DOMAIN = import.meta.env.VITE_API_URL;
          const res = await axios.get(`${BACKEND_DOMAIN}api/info/gos/all`);
          if (res.data) {
            const sortedData = res.data
              .map(item => ({
                title: item.title,
                date: item.date ? item.date.split("T")[0] : "",
                url: `${BACKEND_DOMAIN}api/info/gos/file/view/${item._id}`,
                timestamp: item.date ? new Date(item.date).getTime() : 0
              }))
              .sort((a, b) => b.timestamp - a.timestamp);
            setGoItems(sortedData);
          }
        } catch (err) {
          console.error("Error fetching GOs:", err);
        }
      })();
    }
  }, [activeTab]);

  const getResourceName = () => {
    let resrc_name = "";

    if (activeTab === "Circular") resrc_name = "circular";
    if (activeTab === "Jobs") resrc_name = "jobs";
    if (activeTab === "Results") resrc_name = "results";
    if (activeTab === "G.O's" || activeTab === "G.O's") resrc_name = "gos";
    if (activeTab === "Tenders") resrc_name = "tenders";
    if (activeTab === "Examination") {
      if (activeSubTab === "Notifications") resrc_name = "exam_notifications";
      if (activeSubTab === "Applications") resrc_name = "exam_applications";
      if (activeSubTab === "Time Table") resrc_name = "exam_timetable";
      if (activeSubTab === "Jumbling Centres")
        resrc_name = "exam_jumblingcenters";

      if (activeSubTab === "Circular/Proceedings")
        resrc_name = "curcular_proceedings";

      if (activeSubTab === "Results") resrc_name = "results";
    }
    if (activeTab === "Circular") {
      if (activeSubTab === "CDC Circulars") resrc_name = "cdc_circulars";
      if (activeSubTab === "Other Circulars") resrc_name = "all_circulars";
      if (activeSubTab === "Academic Circulars")
        resrc_name = "academic_circulars";
      if (activeSubTab === "DOA Circulars") resrc_name = "doa_circulars";
    }

    return resrc_name;
  };

  // Removed scroll ticker effect for GOs because they are now cleanly paginated by 10 items per page

  return (
    <section className="w-full px-4 sm:px-16 pt-10 md:pt-16" id="important-links">
      <div className="mb-6">
        <h1 className="text-3xl sm:text-3xl font-bold text-teal-800 mb-6 sm:mb-6">
          Important Information
        </h1>

        <div className="flex overflow-x-auto pb-2 gap-2 sm:gap-6 border-b hide-scrollbar">
          {tabs.map(({ label, icon }) => (
            <TabButton
              key={label}
              label={label}
              icon={React.createElement(icon, {
                className: "w-4 h-4 sm:w-6 sm:h-6",
              })}
              active={activeTab === label}
              // onClick={() => {
              //   setActiveTab(label);
              //   setActiveSubTab("Notifications");
              // }}
              onClick={() => {
                setActiveTab(label);

                if (label === "Examination") setActiveSubTab("Notifications");
                else if (label === "Circular") setActiveSubTab("CDC Circulars");
                else setActiveSubTab("");
              }}
            />
          ))}
        </div>
      </div>

      <div className="px-2 sm:px-6 shadow-md pb-4">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {activeTab === "Examination" && (
            <>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden w-full bg-[#21605A] text-white px-4 py-2 flex items-center justify-between"
              >
                <span>{activeSubTab}</span>
                <span>{mobileMenuOpen ? "▲" : "▼"}</span>
              </button>

              <aside
                className={`${mobileMenuOpen ? "block" : "hidden"} sm:block w-full sm:w-40 space-y-2`}
              >
                {[
                  "Notifications",
                  "Applications",
                  "Time Table",
                  "Jumbling Centres",
                  "Circular/Proceedings",
                  "Results",
                ].map((name) => (
                  <SidebarTab
                    key={name}
                    label={name}
                    active={activeSubTab === name}
                    onClick={() => {
                      setActiveSubTab(name);
                      setMobileMenuOpen(false);
                    }}
                  />
                ))}
              </aside>
            </>
          )}
          {activeTab === "Circular" && (
            <>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden w-full bg-[#21605A] text-white px-4 py-2 flex items-center justify-between"
              >
                <span>{activeSubTab}</span>
                <span>{mobileMenuOpen ? "▲" : "▼"}</span>
              </button>

              <aside
                id="circulars"
                className={`${mobileMenuOpen ? "block" : "hidden"} sm:block w-full sm:w-40 space-y-2`}
              >
                {[
                  "CDC Circulars",
                  "Other Circulars",
                  "Academic Circulars",
                  "DOA Circulars",
                ].map((name) => (
                  <SidebarTab
                    key={name}
                    label={name}
                    active={activeSubTab === name}
                    onClick={() => {
                      setActiveSubTab(name);
                      setMobileMenuOpen(false);
                    }}
                  />
                ))}
              </aside>
            </>
          )}

          <div className="flex-1 w-full pb-6">
            {activeTab === "Examination" && (
              <h2 className="text-lg font-semibold text-[#21605A] mb-4 hidden sm:block">
                {activeSubTab}
              </h2>
            )}

            {(activeTab === "Results" || activeSubTab === "Results") && (
              <a
                href="/results"
                className="text-lg font-semibold text-[#21605A] mb-4  sm:block  transition-colors border rounded-md w-min text-nowrap px-2 py-1 hover:bg-[#21605A] hover:text-white"
              >
                {/* hover:text-[#1a4a45] hover:underline */}▶ Check Your
                Results ◀
              </a>
            )}

            {activeTab === "G.O's" ? (
              <div className="px-4 sm:p-3 w-full relative overflow-hidden">
                <div className="space-y-3 transition-all duration-500">
                  <p className="text-teal-700">Following are the latest G.O's:</p>
                  {goItems.length > 0 ? (
                    goItems.slice((goCurrentPage - 1) * goItemsPerPage, goCurrentPage * goItemsPerPage).map((item, idx) => (
                      <a 
                        key={idx} 
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white p-3 w-[55%] shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all animate-in fade-in slide-in-from-right-4 duration-300"
                      >
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                          <ArrowRight className="w-4 h-4 flex-shrink-0 text-[#005398] group-hover:translate-x-1 transition-transform" />
                          <span className="text-gray-500 text-xs font-medium whitespace-nowrap">{item.date} -</span>
                          <span className="text-gray-800 font-semibold sm:text-base text-sm truncate">{item.title}</span>
                        </div>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-gray-50 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-5 h-5 text-[#005398]" />
                        </a>
                      </a>
                    ))
                  ) : (
                    <div className="bg-white p-4 text-center text-gray-500 italic">
                      No G.O's available at the moment.
                    </div>
                  )}
                </div>

                {/* G.O's Pagination Controls */}
                {goItems.length > goItemsPerPage && (
                  <div className="flex flex-col sm:flex-row items-center sm:justify-end gap-3 sm:gap-4 mt-6 pb-2">
                    <span className="text-xs sm:text-sm text-gray-500 font-medium whitespace-nowrap">
                      Showing {goItems.length > 0 ? (goCurrentPage - 1) * goItemsPerPage + 1 : 0}-{Math.min(goCurrentPage * goItemsPerPage, goItems.length)} of {goItems.length} items
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={goCurrentPage === 1}
                        onClick={() => setGoCurrentPage(goCurrentPage - 1)}
                        className="px-2.5 py-1.5 cursor-pointer rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                        title="Previous Page"
                        aria-label="Previous Page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {(() => {
                        const totalGoPages = Math.ceil(goItems.length / goItemsPerPage);
                        const pages = [];
                        const delta = 1;
                        for (let i = 1; i <= totalGoPages; i++) {
                          if (
                            i === 1 ||
                            i === totalGoPages ||
                            (i >= goCurrentPage - delta && i <= goCurrentPage + delta)
                          ) {
                            pages.push(i);
                          } else if (pages[pages.length - 1] !== "...") {
                            pages.push("...");
                          }
                        }
                        return pages.map((p, index) =>
                          p === "..." ? (
                            <span key={`go-ell-${index}`} className="px-2 py-1.5 text-xs sm:text-sm text-gray-500 select-none">
                              ...
                            </span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => setGoCurrentPage(p)}
                              className={`px-3 py-1.5 cursor-pointer rounded border text-xs sm:text-sm font-medium transition-all ${
                                goCurrentPage === p
                                  ? "bg-[#21605A] border-[#21605A] text-white shadow-sm"
                                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                              }`}
                            >
                              {p}
                            </button>
                          )
                        );
                      })()}

                      <button
                        disabled={goCurrentPage === Math.ceil(goItems.length / goItemsPerPage)}
                        onClick={() => setGoCurrentPage(goCurrentPage + 1)}
                        className="px-2.5 py-1.5 cursor-pointer rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                        title="Next Page"
                        aria-label="Next Page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <NewsList resrc_name={getResourceName()} key={getResourceName()} />
            )}
          </div>
        </div>
      </div>
      <div className="w-fit bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg p-4 mb-6 shadow-sm hover:shadow-md transition-shadow duration-200 mr-auto mt-3">
        <div className="flex items-center">
          <p className="text-emerald-800 font-medium mr-2 italic">
            For previous information please visit old website
          </p>
          <a
            href="https://old.aknu.edu.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 text-emerald-600 hover:text-emerald-800 transition-colors duration-200"
            aria-label="Visit old website"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
