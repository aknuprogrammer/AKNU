import React, { useState, useEffect, useRef } from "react";

import { aknuAdikavi, aknuNewLogo } from "@/assets";
import {
  Menu,
  X,
  MessageSquareText,
  Phone,
  BookOpen,
  ChevronRight,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { infoLinks, menuItems } from "../../siteData/homeData";

import HoverExpandIcons from "../home/H";
import SongPlayerWithSocial from "../home/SongPlayerWithSocial";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { certificates } from "../../utils/url";
import { useFolderFiles } from "../../utils/pdfLocation";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isWideScreen, setIsWideScreen] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [hoveredSubmenu, setHoveredSubmenu] = useState(null);
  const [openMenus, setOpenMenus] = useState([]);
  const [mobileOpenMenus, setMobileOpenMenus] = useState([]);
  const menuRef = useRef();
  // useEffect(() => {
  //   const handleResize = () => {
  //     setIsWideScreen(window.innerWidth >= 1000);
  //   };
  //   handleResize();
  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1000px)");
    setIsWideScreen(mediaQuery.matches);

    const handler = (e) => setIsWideScreen(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // useEffect(() => {
  //   function handleClickOutside(event) {
  //     if (menuRef.current && !menuRef.current.contains(event.target)) {
  //       setOpenMenus([]);
  //     }
  //   }
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, []);

  // useEffect(() => {
  //   function handleClickOutside(event) {
  //     if (menuRef.current && !menuRef.current.contains(event.target)) {
  //       setOpenMenus([]);
  //     }
  //   }
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        // Close all menus when clicked outside
        setOpenMenus([]);
        setMobileOpenMenus([]);
        setHoveredId(null);
        setHoveredMenu(null);
        setHoveredSubmenu(null);
        setMenuOpen(false); // ✅ also close hamburger
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (label) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };
  const toggleMobileMenu = (label) => {
    setMobileOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const location = useLocation();
  const navigate = useNavigate();

  // Helper function to check if link is external
  const isExternalLink = (url) => {
    if (!url) return false;
    return (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("mailto:") ||
      url.startsWith("tel:")
    );
  };

  // Helper function to check if link is hash/anchor
  const isHashLink = (url) => {
    if (!url) return false;
    return url.startsWith("#") || url.startsWith("/#");
  };
  const pathname = location.pathname;
  // const certifications = useFolderFiles(certificates);
  // const navItems = menuItems.map((item) => {
  //   if (item.label === "Accreditation") {
  //     const updatedSubmenu = item.submenu.map((sub) =>
  //       sub.dynamicKey === "certifications"
  //         ? { ...sub, subsubmenu: certifications }
  //         : sub
  //     );
  //     return { ...item, submenu: updatedSubmenu };
  //   }
  //   return item;
  // });

  const isAlumni = pathname == "/alumni";
  const [openDirection, setOpenDirection] = useState("right"); // "right" or "left"
  const submenuRef = useRef(null);

  useEffect(() => {
    if (submenuRef.current) {
      const rect = submenuRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      if (openMenus.includes("Pay Fee") || openMenus.includes("Fee")) {
        setOpenDirection("left");
        return () => {};
      }
      if (rect.right > screenWidth) {
        setOpenDirection("left");
      } else {
        setOpenDirection("right");
      }
    }
  }, [openMenus]);

  return (
    <div className="relative overflow-visible">
      <header
        className="sticky top-0 z-[1000] bg-white shadow-md overflow-visible"
        ref={menuRef}
      >
        {pathname?.toLowerCase() != "/formupload" &&
          !isAlumni &&
          pathname?.toLowerCase() != "/admin" && (
            <>
              {isWideScreen && (
                <nav className="p-1.5 text-sm text-white bg-gray-600 w-full max-w-full overflow-visible">
                  <div className="flex flex-wrap items-center justify-between gap-5 pl-3 w-full max-w-full overflow-visible">
                    <div className="flex items-between gap-5 w-full justify-between">
                      <div className="flex items-center gap-2">
                        <ul className="flex flex-wrap items-center gap-1 sm:gap-2">
                          {infoLinks.map(
                            ({ label, link, external, icon: Icon }) => {
                              if (external || isExternalLink(link)) {
                                return (
                                  <li key={label}>
                                    <a
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 p-1 rounded-md hover:bg-white/10 hover:text-white/90 transition-colors duration-200"
                                    >
                                      <Icon className="w-4 h-4 opacity-80" />
                                      <span className="whitespace-nowrap">
                                        {label}
                                      </span>
                                    </a>
                                  </li>
                                );
                              } else if (isHashLink(link)) {
                                return (
                                  <li key={label} className="">
                                    <a
                                      href={link}
                                      className="flex items-center gap-1 p-1 rounded-md hover:bg-white/10 hover:text-white/90 transition-colors duration-200"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        const hash = link.startsWith("/#")
                                          ? link
                                          : link.startsWith("#")
                                            ? `/${link}`
                                            : `/#${link}`;

                                        if (location.pathname !== "/") {
                                          // Navigate to home page with hash
                                          navigate(hash);
                                        } else {
                                          const id = hash
                                            .replace("/#", "")
                                            .replace("#", "");
                                          const el =
                                            document.getElementById(id);
                                          if (el) {
                                            setTimeout(() => {
                                              el.scrollIntoView({
                                                behavior: "smooth",
                                                block: "start",
                                              });
                                            }, 100);
                                          }
                                        }
                                      }}
                                    >
                                      <Icon className="w-4 h-4 opacity-80" />
                                      <span className="whitespace-nowrap">
                                        {label}
                                      </span>
                                    </a>
                                  </li>
                                );
                              } else {
                                return (
                                  <li key={label} className="">
                                    <Link
                                      to={link}
                                      className="flex items-center gap-1 p-1 rounded-md hover:bg-white/10 hover:text-white/90 transition-colors duration-200"
                                    >
                                      <Icon className="w-4 h-4 opacity-80" />
                                      <span className="whitespace-nowrap">
                                        {label}
                                      </span>
                                    </Link>
                                  </li>
                                );
                              }
                            },
                          )}
                        </ul>
                      </div>
                      <div>
                        <SongPlayerWithSocial />
                      </div>
                    </div>
                  </div>
                </nav>
              )}
            </>
          )}

        <div className="bg-teal-700 md:bg-teal-700 pb-4 border-t text-white md:text-white w-full max-w-full overflow-visible">
          <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4 w-full lg:max-w-4xl mx-auto overflow-visible">
            <div>
              {" "}
              {!["/formupload", "/admin"].includes(pathname?.toLowerCase()) ? (
                <Link to="/">
                  <img
                    src={aknuNewLogo}
                    alt="AKNU"
                    className="w-20 h-20 md:w-24 md:h-24 object-contain"
                  />
                </Link>
              ) : (
                <img
                  src={aknuNewLogo}
                  alt="AKNU"
                  className="w-20 h-20 md:w-24 md:h-24 object-contain"
                />
              )}
            </div>
            <div className="text-center flex-1 min-w-0">
              <div className="py-3 text-center">
                <h1 className="text-xl sm:text-2xl md:text-3xl leading-tight text-[#fcc203] font-bold font-[cennerik] break-normal whitespace-normal mx-auto sm:mx-0 max-w-[18ch] sm:max-w-none">
                  ADIKAVI NANNAYA UNIVERSITY
                </h1>
                <h1 className="text-xl sm:text-2xl md:text-3xl leading-tight font-bold break-normal whitespace-normal mx-auto sm:mx-0 max-w-[18ch] sm:max-w-none">
                  ఆదికవి నన్నయ విశ్వవిద్యాలయం
                </h1>

                <p className="text-xs mt-2 font-bold text-[#fcc203]">
                  RAJAMAHENDRAVARAM, ANDHRA PRADESH INDIA - 533296
                </p>

              

                <div className="mt-2 flex flex-col items-center">
                  {/* Accreditation container with width control */}
                  <div className="w-fit px-4">
                    {/* Top line */}
                    <div className="h-px bg-gradient-to-r from-transparent via-[#fcc203] to-transparent mb-2"></div>

                    {/* Content */}
                    <div className="flex flex-wrap gap-4 justify-center items-center">
                      <p className="text-xs font-bold text-white">
                        Accredited by NAAC with 'B+' Grade
                      </p>
                      <div className="w-1 h-1 rounded-full bg-[#fcc203]"></div>
                      <p className="text-xs font-bold text-white">
                        ISO 9001:2025 Certified
                      </p>
                      <div className="w-1 h-1 rounded-full bg-[#fcc203]"></div>
                      <p className="text-xs font-bold text-white">
                        5 Star Rated
                      </p>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-[#fcc203] to-transparent mt-2 mb-2"></div>
                      <div className="text-[10px] sm:text-xs mt-2 font-bold text-white  tracking-wider">
                  Largest State University in Andhra Pradesh in terms of Affiliation
                </div>

                    {/* Bottom line */}
                    <div className="h-px bg-gradient-to-r from-transparent via-[#fcc203] to-transparent mt-2"></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {" "}
              <Link to="/" className="hidden sm:block -ml-2 md:-ml-4">
                <img
                  src={aknuAdikavi}
                  alt="AKNU"
                  className="w-20 h-20 md:w-24 md:h-24 object-contain"
                />
              </Link>
            </div>
          </div>
          <div className="container-wide flex justify-center items-center mt-2 gap-4 w-full max-w-full overflow-visible">
            {pathname?.toLowerCase() != "/formupload" &&
              !isAlumni &&
              pathname?.toLowerCase() != "/admin" && (
                <>
                  {/* __PENDING__ */}
                  {isWideScreen ? (
                    <ul className="flex justify-center gap-x-1 lg:gap-x-2 xl:gap-x-4 text-[11px] lg:text-xs xl:text-sm 2xl:text-base font-semibold relative z-10 flex-nowrap w-full">
                      {menuItems.map(({ label, icon: Icon, href, submenu }) => (
                        <li
                          key={label}
                          className="relative group whitespace-nowrap"
                          onClick={() =>
                            setOpenMenus((prev) =>
                              prev[0] === label ? [] : [label],
                            )
                          }
                        >
                          {submenu ? (
                            <a
                              href={href}
                              className="flex items-center gap-1 xl:gap-2 hover:text-blue-300 cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                              }}
                            >
                              <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                              <span>{label}</span>
                              {openMenus.includes(label) ? (
                                <ChevronUpIcon className="w-3 h-3 xl:w-4 xl:h-4" />
                              ) : (
                                <ChevronDownIcon className="w-3 h-3 xl:w-4 xl:h-4" />
                              )}
                            </a>
                          ) : isExternalLink(href) ? (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 xl:gap-2 hover:text-blue-300 cursor-pointer"
                            >
                              <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                              <span>{label}</span>
                            </a>
                          ) : (
                            <Link
                              to={href}
                              className="flex items-center gap-1 xl:gap-2 hover:text-blue-300 cursor-pointer"
                            >
                              <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                              <span>{label}</span>
                            </Link>
                          )}
                          {submenu && openMenus.includes(label) && (
                            <ul
                              className={`absolute top-full bg-white text-black min-w-[220px] mt-0 z-[1100] shadow-lg ${
                                label === "Support Facilities" ? "right-0 left-auto" : "left-0"
                              }`}
                              style={{
                                overflow: "visible",
                                maxHeight: "none",
                                height: "auto",
                              }}
                            >
                              <div
                                className={`absolute -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white ${
                                  label === "Support Facilities" ? "right-4" : "left-4"
                                }`}
                              ></div>
                              <div
                                className="p-3"
                                style={{ overflow: "visible" }}
                              >
                                {submenu.map(
                                  ({
                                    label: subLabel,
                                    href: subHref,
                                    subsubmenu,
                                    external: subExternal,
                                  }) => (
                                    <li
                                      key={subLabel}
                                      className="relative submenu-group text-left"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenus((prev) =>
                                          prev[1] === subLabel
                                            ? [label]
                                            : [label, subLabel],
                                        );
                                      }}
                                    >
                                      <div className="group relative">
                                        <div className="flex justify-between items-center hover:bg-[#f4e4c9]">
                                          {subsubmenu ? (
                                            <a
                                              href={subHref || "#"}
                                              className="block px-4 py-2 text-[16px] hover:bg-[#f4e4c9] whitespace-nowrap cursor-pointer"
                                              onClick={(e) => {
                                                e.preventDefault();
                                              }}
                                            >
                                              {subLabel}
                                            </a>
                                          ) : isExternalLink(subHref) ||
                                            (subHref &&
                                              subHref
                                                .toLowerCase()
                                                .endsWith(".pdf")) ||
                                            subExternal ? (
                                            <a
                                              href={subHref}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="block px-4 py-2 text-[16px] hover:bg-[#f4e4c9] whitespace-nowrap cursor-pointer"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenus([]);
                                                setHoveredMenu(null);
                                                setHoveredSubmenu(null);
                                                if (
                                                  subExternal ||
                                                  (subHref &&
                                                    subHref
                                                      .toLowerCase()
                                                      .endsWith(".pdf"))
                                                ) {
                                                  e.preventDefault();
                                                  window.open(
                                                    subHref,
                                                    "_blank",
                                                  );
                                                }
                                              }}
                                            >
                                              {subLabel}
                                            </a>
                                          ) : isHashLink(subHref) ? (
                                            <a
                                              href={subHref}
                                              className="block px-4 py-2 text-[16px] hover:bg-[#f4e4c9] whitespace-nowrap cursor-pointer"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setOpenMenus([]);
                                                setHoveredMenu(null);
                                                setHoveredSubmenu(null);

                                                const hash = subHref.startsWith(
                                                  "/#",
                                                )
                                                  ? subHref
                                                  : subHref.startsWith("#")
                                                    ? `/${subHref}`
                                                    : `/#${subHref}`;

                                                if (location.pathname !== "/") {
                                                  navigate(hash);
                                                } else {
                                                  const id = hash
                                                    .replace("/#", "")
                                                    .replace("#", "");
                                                  const el =
                                                    document.getElementById(id);
                                                  if (el) {
                                                    setTimeout(() => {
                                                      el.scrollIntoView({
                                                        behavior: "smooth",
                                                        block: "start",
                                                      });
                                                    }, 100);
                                                  }
                                                }
                                              }}
                                            >
                                              {subLabel}
                                            </a>
                                          ) : (
                                            <Link
                                              to={subHref || "#"}
                                              className="block px-4 py-2 text-[16px] hover:bg-[#f4e4c9] whitespace-nowrap cursor-pointer"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenus([]);
                                                setHoveredMenu(null);
                                                setHoveredSubmenu(null);
                                              }}
                                            >
                                              {subLabel}
                                            </Link>
                                          )}
                                          {subsubmenu && (
                                            <ChevronRight className="w-4 h-4" />
                                          )}
                                        </div>

                                        {subsubmenu &&
                                          openMenus[1] === subLabel && (
                                            <ul
                                              ref={submenuRef}
                                              className={`absolute top-0 ${
                                                openDirection === "right"
                                                  ? "left-full ml-4"
                                                  : "right-full mr-4"
                                              } bg-white text-black rounded shadow-lg min-w-[200px] z-[1200]`}
                                            >
                                              <div
                                                className={`absolute top-2 ${
                                                  openDirection === "right"
                                                    ? "-left-2 border-r-white border-r-8"
                                                    : "-right-2 border-l-white border-l-8"
                                                } w-0 h-0 border-t-8 border-b-8 border-transparent`}
                                              ></div>
                                              <div className="p-3">
                                                {(
                                                  subsubmenu.files ||
                                                  subsubmenu ||
                                                  []
                                                ).map(
                                                  ({
                                                    label: subSubLabel,
                                                    href: subSubHref,
                                                    subsubsubmenu: thirdLevel,
                                                  }) => (
                                                    <li
                                                      key={subSubLabel}
                                                      className="relative hover:bg-[#f4e4c9]"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenus((prev) =>
                                                          prev[0] === label &&
                                                          prev[1] ===
                                                            subLabel &&
                                                          prev[2] ===
                                                            subSubLabel
                                                            ? [label, subLabel]
                                                            : [
                                                                label,
                                                                subLabel,
                                                                subSubLabel,
                                                              ],
                                                        );
                                                      }}
                                                    >
                                                      <div className="flex justify-between items-center cursor-pointer">
                                                        {thirdLevel &&
                                                        thirdLevel.length >
                                                          0 ? (
                                                          <a
                                                            href={
                                                              subSubHref || "#"
                                                            }
                                                            className="block px-4 py-2 text-sm whitespace-nowrap"
                                                            onClick={(e) => {
                                                              e.preventDefault();
                                                            }}
                                                          >
                                                            {subSubLabel}
                                                          </a>
                                                        ) : isExternalLink(
                                                            subSubHref,
                                                          ) ||
                                                          (subSubHref &&
                                                            subSubHref
                                                              .toLowerCase()
                                                              .endsWith(
                                                                ".pdf",
                                                              )) ? (
                                                          <a
                                                            href={subSubHref}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block px-4 py-2 text-sm whitespace-nowrap"
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setOpenMenus([]);
                                                              setHoveredMenu(
                                                                null,
                                                              );
                                                              setHoveredSubmenu(
                                                                null,
                                                              );
                                                              if (
                                                                subSubHref &&
                                                                subSubHref
                                                                  .toLowerCase()
                                                                  .endsWith(
                                                                    ".pdf",
                                                                  )
                                                              ) {
                                                                e.preventDefault();
                                                                window.open(
                                                                  subSubHref,
                                                                  "_blank",
                                                                );
                                                              }
                                                            }}
                                                          >
                                                            {subSubLabel}
                                                          </a>
                                                        ) : (
                                                          <Link
                                                            to={
                                                              subSubHref || "#"
                                                            }
                                                            className="block px-4 py-2 text-sm whitespace-nowrap"
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setOpenMenus([]);
                                                              setHoveredMenu(
                                                                null,
                                                              );
                                                              setHoveredSubmenu(
                                                                null,
                                                              );
                                                            }}
                                                          >
                                                            {subSubLabel}
                                                          </Link>
                                                        )}
                                                        {thirdLevel &&
                                                          thirdLevel.length >
                                                            0 && (
                                                            <ChevronRight className="w-4 h-4 mr-2" />
                                                          )}
                                                      </div>
                                                      {thirdLevel &&
                                                        thirdLevel.length > 0 &&
                                                        openMenus[2] ===
                                                          subSubLabel && (
                                                          <ul className="absolute top-0 left-full ml-4 bg-white text-black rounded shadow-lg min-w-[240px] z-[1300]">
                                                            <div className="absolute top-2 -left-2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-white"></div>
                                                            <div className="p-3">
                                                              {thirdLevel.map(
                                                                ({
                                                                  label:
                                                                    leafLabel,
                                                                  href: leafHref,
                                                                }) => (
                                                                  <li
                                                                    key={
                                                                      leafLabel
                                                                    }
                                                                  >
                                                                    {isExternalLink(
                                                                      leafHref,
                                                                    ) ||
                                                                    (leafHref &&
                                                                      leafHref
                                                                        .toLowerCase()
                                                                        .endsWith(
                                                                          ".pdf",
                                                                        )) ? (
                                                                      <a
                                                                        href={
                                                                          leafHref
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="block px-4 py-2 text-sm hover:bg-[#f4e4c9] whitespace-nowrap"
                                                                        onClick={(
                                                                          e,
                                                                        ) => {
                                                                          e.stopPropagation();
                                                                          setOpenMenus(
                                                                            [],
                                                                          );
                                                                          setHoveredMenu(
                                                                            null,
                                                                          );
                                                                          setHoveredSubmenu(
                                                                            null,
                                                                          );
                                                                          if (
                                                                            leafHref &&
                                                                            leafHref
                                                                              .toLowerCase()
                                                                              .endsWith(
                                                                                ".pdf",
                                                                              )
                                                                          ) {
                                                                            e.preventDefault();
                                                                            window.open(
                                                                              leafHref,
                                                                              "_blank",
                                                                            );
                                                                          }
                                                                        }}
                                                                      >
                                                                        {
                                                                          leafLabel
                                                                        }
                                                                      </a>
                                                                    ) : (
                                                                      <Link
                                                                        to={
                                                                          leafHref ||
                                                                          "#"
                                                                        }
                                                                        className="block px-4 py-2 text-sm hover:bg-[#f4e4c9] whitespace-nowrap"
                                                                        onClick={(
                                                                          e,
                                                                        ) => {
                                                                          e.stopPropagation();
                                                                          setOpenMenus(
                                                                            [],
                                                                          );
                                                                          setHoveredMenu(
                                                                            null,
                                                                          );
                                                                          setHoveredSubmenu(
                                                                            null,
                                                                          );
                                                                        }}
                                                                      >
                                                                        {
                                                                          leafLabel
                                                                        }
                                                                      </Link>
                                                                    )}
                                                                  </li>
                                                                ),
                                                              )}
                                                            </div>
                                                          </ul>
                                                        )}
                                                    </li>
                                                  ),
                                                )}
                                              </div>
                                            </ul>
                                          )}
                                      </div>
                                    </li>
                                  ),
                                )}
                              </div>
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      aria-label="Toggle Menu"
                    >
                      {menuOpen ? (
                        <X className="w-6 h-6" />
                      ) : (
                        <Menu className="w-6 h-6" />
                      )}
                    </button>
                  )}
                </>
              )}
          </div>

          {!isWideScreen &&
            menuOpen &&
            pathname?.toLowerCase() != "/formupload" &&
            pathname?.toLowerCase() != "/admin" && (
              <div className="px-4 mt-2 bg-white ">
                <ul className="flex flex-col gap-4 text-sm sm:text-base font-medium rounded-lg">
                  {menuItems.map(({ label, icon: Icon, href, submenu }) => (
                    <li key={label}>
                      {submenu ? (
                        <>
                          <div
                            className="flex items-center gap-10 cursor-pointer text-[#303630] hover:text-teal-700"
                            onClick={() => toggleMobileMenu(label)}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {label}
                            </div>
                            <span className="flex items-center">
                              {mobileOpenMenus.includes(label) ? (
                                <ChevronRight
                                  className="w-4 h-4"
                                  style={{ transform: "rotate(90deg)" }}
                                />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </span>
                          </div>
                          {mobileOpenMenus.includes(label) && (
                            <ul className="mt-2 ml-6 space-y-2 text-[#303630]">
                              {submenu.map(
                                ({
                                  label: subLabel,
                                  href: subHref,
                                  subsubmenu,
                                  external: subExternal,
                                }) => (
                                  <li key={subLabel}>
                                    {subsubmenu ? (
                                      <>
                                        <div
                                          className="flex gap-2 items-center cursor-pointer px-8 py-2 hover:text-teal-700"
                                          onClick={() =>
                                            toggleMobileMenu(subLabel)
                                          }
                                        >
                                          {subLabel}
                                          <ChevronRight
                                            className="w-4 h-4"
                                            style={{
                                              transform:
                                                mobileOpenMenus.includes(
                                                  subLabel,
                                                )
                                                  ? "rotate(90deg)"
                                                  : "rotate(0deg)",
                                            }}
                                          />
                                        </div>
                                        {mobileOpenMenus.includes(subLabel) && (
                                          <ul className="ml-6 mt-1 space-y-1">
                                            {(
                                              subsubmenu.files ||
                                              subsubmenu ||
                                              []
                                            ).map(
                                              ({
                                                label: subSubLabel,
                                                href: subSubHref,
                                                subsubsubmenu: thirdLevel,
                                              }) => (
                                                <li key={subSubLabel}>
                                                  <div
                                                    className="flex items-center justify-between px-4 py-2"
                                                    onClick={() => {
                                                      if (
                                                        thirdLevel &&
                                                        thirdLevel.length > 0
                                                      ) {
                                                        toggleMobileMenu(
                                                          subSubLabel,
                                                        );
                                                      }
                                                    }}
                                                  >
                                                    {thirdLevel &&
                                                    thirdLevel.length > 0 ? (
                                                      <a
                                                        href={subSubHref}
                                                        className="text-sm"
                                                        onClick={(e) => {
                                                          e.preventDefault();
                                                        }}
                                                      >
                                                        {subSubLabel}
                                                      </a>
                                                    ) : isExternalLink(
                                                        subSubHref,
                                                      ) ||
                                                      (subSubHref &&
                                                        subSubHref
                                                          .toLowerCase()
                                                          .endsWith(".pdf")) ? (
                                                      <a
                                                        href={subSubHref}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setMenuOpen(false);
                                                          setOpenMenus([]);
                                                          setMobileOpenMenus(
                                                            [],
                                                          );
                                                          setHoveredMenu(null);
                                                          setHoveredSubmenu(
                                                            null,
                                                          );
                                                          if (
                                                            subSubHref &&
                                                            subSubHref
                                                              .toLowerCase()
                                                              .endsWith(".pdf")
                                                          ) {
                                                            e.preventDefault();
                                                            window.open(
                                                              subSubHref,
                                                              "_blank",
                                                            );
                                                          }
                                                        }}
                                                      >
                                                        {subSubLabel}
                                                      </a>
                                                    ) : (
                                                      <Link
                                                        to={subSubHref || "#"}
                                                        className="text-sm"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setMenuOpen(false);
                                                          setOpenMenus([]);
                                                          setMobileOpenMenus(
                                                            [],
                                                          );
                                                          setHoveredMenu(null);
                                                          setHoveredSubmenu(
                                                            null,
                                                          );
                                                        }}
                                                      >
                                                        {subSubLabel}
                                                      </Link>
                                                    )}
                                                    {thirdLevel &&
                                                      thirdLevel.length > 0 && (
                                                        <ChevronRight
                                                          className="w-4 h-4"
                                                          style={{
                                                            transform:
                                                              mobileOpenMenus.includes(
                                                                subSubLabel,
                                                              )
                                                                ? "rotate(90deg)"
                                                                : "rotate(0deg)",
                                                          }}
                                                        />
                                                      )}
                                                  </div>
                                                  {thirdLevel &&
                                                    thirdLevel.length > 0 &&
                                                    mobileOpenMenus.includes(
                                                      subSubLabel,
                                                    ) && (
                                                      <ul className="ml-4 mt-1 space-y-1">
                                                        {thirdLevel.map(
                                                          ({
                                                            label: leafLabel,
                                                            href: leafHref,
                                                          }) => (
                                                            <li key={leafLabel}>
                                                              {isExternalLink(
                                                                leafHref,
                                                              ) ||
                                                              (leafHref &&
                                                                leafHref
                                                                  .toLowerCase()
                                                                  .endsWith(
                                                                    ".pdf",
                                                                  )) ? (
                                                                <a
                                                                  href={
                                                                    leafHref
                                                                  }
                                                                  target="_blank"
                                                                  rel="noopener noreferrer"
                                                                  className="block px-4 py-2 text-sm hover:bg-[#f4e4c9] whitespace-nowrap"
                                                                  onClick={(
                                                                    e,
                                                                  ) => {
                                                                    e.stopPropagation();
                                                                    setMenuOpen(
                                                                      false,
                                                                    );
                                                                    setOpenMenus(
                                                                      [],
                                                                    );
                                                                    setMobileOpenMenus(
                                                                      [],
                                                                    );
                                                                    setHoveredMenu(
                                                                      null,
                                                                    );
                                                                    setHoveredSubmenu(
                                                                      null,
                                                                    );
                                                                    if (
                                                                      leafHref &&
                                                                      leafHref
                                                                        .toLowerCase()
                                                                        .endsWith(
                                                                          ".pdf",
                                                                        )
                                                                    ) {
                                                                      e.preventDefault();
                                                                      window.open(
                                                                        leafHref,
                                                                        "_blank",
                                                                      );
                                                                    }
                                                                  }}
                                                                >
                                                                  {leafLabel}
                                                                </a>
                                                              ) : (
                                                                <Link
                                                                  to={
                                                                    leafHref ||
                                                                    "#"
                                                                  }
                                                                  className="block px-4 py-2 text-sm hover:bg-[#f4e4c9] whitespace-nowrap"
                                                                  onClick={(
                                                                    e,
                                                                  ) => {
                                                                    e.stopPropagation();
                                                                    setMenuOpen(
                                                                      false,
                                                                    );
                                                                    setOpenMenus(
                                                                      [],
                                                                    );
                                                                    setMobileOpenMenus(
                                                                      [],
                                                                    );
                                                                    setHoveredMenu(
                                                                      null,
                                                                    );
                                                                    setHoveredSubmenu(
                                                                      null,
                                                                    );
                                                                  }}
                                                                >
                                                                  {leafLabel}
                                                                </Link>
                                                              )}
                                                            </li>
                                                          ),
                                                        )}
                                                      </ul>
                                                    )}
                                                </li>
                                              ),
                                            )}
                                          </ul>
                                        )}
                                      </>
                                    ) : isExternalLink(subHref) ||
                                      (subHref &&
                                        subHref
                                          .toLowerCase()
                                          .endsWith(".pdf")) ||
                                      subExternal ? (
                                      <a
                                        href={subHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block px-8 py-1 text-sm text-gray-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setMenuOpen(false);
                                          setOpenMenus([]);
                                          setMobileOpenMenus([]);
                                          setHoveredMenu(null);
                                          setHoveredSubmenu(null);
                                          if (
                                            subExternal ||
                                            (subHref &&
                                              subHref
                                                .toLowerCase()
                                                .endsWith(".pdf"))
                                          ) {
                                            e.preventDefault();
                                            window.open(subHref, "_blank");
                                          }
                                        }}
                                      >
                                        {subLabel}
                                      </a>
                                    ) : isHashLink(subHref) ? (
                                      <a
                                        href={subHref}
                                        className="block px-8 py-1 text-sm text-gray-700"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setMenuOpen(false);
                                          setOpenMenus([]);
                                          setMobileOpenMenus([]);
                                          setHoveredMenu(null);
                                          setHoveredSubmenu(null);

                                          const hash = subHref.startsWith("/#")
                                            ? subHref
                                            : subHref.startsWith("#")
                                              ? `/${subHref}`
                                              : `/#${subHref}`;

                                          if (location.pathname !== "/") {
                                            navigate(hash);
                                          } else {
                                            const id = hash
                                              .replace("/#", "")
                                              .replace("#", "");
                                            const el =
                                              document.getElementById(id);
                                            if (el) {
                                              setTimeout(() => {
                                                el.scrollIntoView({
                                                  behavior: "smooth",
                                                  block: "start",
                                                });
                                              }, 100);
                                            }
                                          }
                                        }}
                                      >
                                        {subLabel}
                                      </a>
                                    ) : (
                                      <Link
                                        to={subHref || "#"}
                                        className="block px-8 py-1 text-sm text-gray-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setMenuOpen(false);
                                          setOpenMenus([]);
                                          setMobileOpenMenus([]);
                                          setHoveredMenu(null);
                                          setHoveredSubmenu(null);
                                        }}
                                      >
                                        {subLabel}
                                      </Link>
                                    )}
                                  </li>
                                ),
                              )}
                            </ul>
                          )}
                        </>
                      ) : isExternalLink(href) ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 py-2 text-[#303630] hover:text-teal-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(false);
                            setOpenMenus([]);
                            setMobileOpenMenus([]);
                            setHoveredMenu(null);
                            setHoveredSubmenu(null);
                          }}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </a>
                      ) : (
                        <Link
                          to={href}
                          className="flex items-center gap-2 py-2 text-[#303630] hover:text-teal-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(false);
                            setOpenMenus([]);
                            setMobileOpenMenus([]);
                            setHoveredMenu(null);
                            setHoveredSubmenu(null);
                          }}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </Link>
                      )}
                    </li>
                  ))}
                  <div>
                    <SongPlayerWithSocial />
                  </div>
                </ul>

                <div className="border-t pt-4">
                  <span className="font-semibold text-gray-600 block mb-2">
                    Information For:
                  </span>
                  <ul className="flex flex-col gap-3">
                    {infoLinks.map(({ label, link, external, icon: Icon }) => {
                      if (external || isExternalLink(link)) {
                        return (
                          <li key={label}>
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-[#303630] hover:text-teal-700"
                            >
                              <Icon className="w-4 h-4" /> {label}
                            </a>
                          </li>
                        );
                      } else if (isHashLink(link)) {
                        return (
                          <li key={label}>
                            <a
                              href={link}
                              className="flex items-center gap-2 text-[#303630] hover:text-teal-700"
                              onClick={(e) => {
                                e.preventDefault();
                                const hash = link.startsWith("/#")
                                  ? link
                                  : link.startsWith("#")
                                    ? `/${link}`
                                    : `/#${link}`;

                                if (location.pathname !== "/") {
                                  // Navigate to home page with hash
                                  navigate(hash);
                                } else {
                                  const id = hash
                                    .replace("/#", "")
                                    .replace("#", "");
                                  const el = document.getElementById(id);
                                  if (el) {
                                    setTimeout(() => {
                                      el.scrollIntoView({
                                        behavior: "smooth",
                                        block: "start",
                                      });
                                    }, 100);
                                  }
                                }
                                setMenuOpen(false);
                              }}
                            >
                              <Icon className="w-4 h-4" /> {label}
                            </a>
                          </li>
                        );
                      } else {
                        return (
                          <li key={label}>
                            <Link
                              to={link}
                              className="flex items-center gap-2 text-[#303630] hover:text-teal-700"
                              onClick={() => setMenuOpen(false)}
                            >
                              <Icon className="w-4 h-4" /> {label}
                            </Link>
                          </li>
                        );
                      }
                    })}
                  </ul>
                </div>
              </div>
            )}
        </div>
      </header>
      {/* {!isAlumni && (
        <a
          href="https://old.aknu.edu.in"
          target="_blank"
          rel="noopener noreferrer"
          className={`fixed z-50 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 animate-bounce hover:animate-none font-semibold flex items-center group ${
            isWideScreen
              ? "top-16 right-4"
              : "top-8 right-4 text-sm px-4 py-2"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
              clipRule="evenodd"
            />
          </svg>
          Go to Old Site
        </a>
      )} */}
      {pathname?.toLowerCase() != "/formupload" &&
        pathname?.toLowerCase() != "/admin" && (
          <aside
            className={`hidden md:flex flex-col fixed right-0 top-1/2 -translate-y-1/2 z-[1050] pointer-events-none transition-opacity duration-200 ${
              isWideScreen && openMenus[0] === "Support Facilities"
                ? "opacity-0"
                : "opacity-100"
            }`}
          >
            <HoverExpandIcons />
          </aside>
        )}
    </div>
  );
}

export default Navbar;
