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
import { useLocation, Link } from "react-router-dom";
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
        // Close all menus when clicked outside
        setOpenMenus([]);
        setMobileOpenMenus([]);
        setHoveredId(null);
        setHoveredMenu(null);
        setHoveredSubmenu(null);
        setMenuOpen(false); // ✅ also close hamburger
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
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };
  const toggleMobileMenu = (label) => {
    setMobileOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const location = useLocation();
  const pathname = location.pathname;

  // polinaidu:  24/10/2025: replacing the certifications with static data
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
    <div className="relative">
      <header className="sticky top-0 z-50 bg-white shadow-md" ref={menuRef}>
        {pathname?.toLowerCase() != "/formupload" &&
          !isAlumni &&
          pathname?.toLowerCase() != "/admin" && (
            <>
              {isWideScreen && (
                <nav className="py-2 text-sm text-white bg-gray-600">
                  <div className="container mx-auto px-4 flex flex-wrap items-center justify-between gap-5">
                    <div className="flex items-between gap-5 w-full justify-between">
                      <div className="flex items-center  gap-2">
                        <ul className="flex flex-wrap items-center gap-2">
                          {infoLinks.map(
                            ({ label, link, external, icon: Icon }) => (
                              <li key={label} className="ml-3">
                                <a
                                  href={link}
                                  target={external ? "_blank" : "_self"}
                                  rel={
                                    external ? "noopener noreferrer" : undefined
                                  }
                                  className="flex items-center gap-1 hover:text-blue-300 transition"
                                  onClick={(e) => {
                                    if (
                                      link.startsWith("/#") ||
                                      link.startsWith("#")
                                    ) {
                                      e.preventDefault();
                                      if (location.pathname !== "/") {
                                        // Navigate to homepage + hash
                                        window.location.href = link;
                                      } else {
                                        const el = document.getElementById(
                                          link
                                            .replace("/#", "")
                                            .replace("#", "")
                                        );
                                        if (el) {
                                          el.scrollIntoView({
                                            behavior: "smooth",
                                          });
                                        }
                                      }
                                    }
                                  }}
                                >
                                  <Icon className="w-4 h-4" /> {label}
                                </a>
                              </li>
                            )
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

        <div className="bg-teal-700 md:bg-teal-700 pb-4 border-t text-white md:text-white">
          <div className="flex justify-evenly items-center px-6 gap-4">
            <a
              href={
                ["/formupload", "/admin"].includes(pathname?.toLowerCase())
                  ? undefined
                  : "/"
              }
            >
              <img
                src={aknuNewLogo}
                alt="AKNU"
                className="w-24 h-24 object-contain"
              />
            </a>

            <div className="text-center">
              <div className="py-3 text-center">
                <h1 className="text-3xl text-[#fcc203] font-bold font-[cennerik]">
                  ADIKAVI NANNAYA UNIVERSITY
                </h1>
                <h1 className="text-3xl font-bold">
                  ఆదికవి నన్నయ విశ్వవిద్యాలయం
                </h1>

                <p className="text-xs mt-2 font-bold text-[#fcc203]">
                  RAJAMAHENDRAVARAM, ANDHRA PRADESH INDIA - 533296
                </p>

                <div className="mt-3 flex flex-col items-center">
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
                    </div>

                    {/* Bottom line */}
                    <div className="h-px bg-gradient-to-r from-transparent via-[#fcc203] to-transparent mt-2"></div>
                  </div>
                </div>
              </div>
            </div>

            <Link to="/">
              <img
                src={aknuAdikavi}
                alt="AKNU"
                className="w-24 h-24 object-contain"
              />
            </Link>
          </div>
          <div className="flex justify-center items-center px-6 mt-2 gap-4">
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
                              prev[0] === label ? [] : [label]
                            )
                          }
                        >
                          <a
                            href={href}
                            className="flex items-center gap-1 xl:gap-2 hover:text-blue-300 cursor-pointer"
                          >
                            <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                            <span>{label}</span>
                            {submenu &&
                              (openMenus.includes(label) ? (
                                <ChevronUpIcon className="w-3 h-3 xl:w-4 xl:h-4" />
                              ) : (
                                <ChevronDownIcon className="w-3 h-3 xl:w-4 xl:h-4" />
                              ))}
                          </a>
                          {submenu && openMenus.includes(label) && (
                            <ul className={`absolute bg-white text-black min-w-[220px] mb-1 z-20 shadow-lg ${
                              label === "Support Facilities" ? "right-0 bottom-full left-auto" : "left-0 bottom-full"
                            }`}>
                              <div className={`absolute -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white ${
                                label === "Support Facilities" ? "right-4" : "left-4"
                              }`}></div>
                              <div className="p-3">
                                {submenu.map(
                                  ({
                                    label: subLabel,
                                    href: subHref,
                                    subsubmenu,
                                  }) => (
                                    <li
                                      key={subLabel}
                                      className="relative submenu-group text-left"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenus((prev) =>
                                          prev[1] === subLabel
                                            ? [label]
                                            : [label, subLabel]
                                        );
                                      }}
                                    >
                                      <div className="group relative">
                                        <div className="flex justify-between items-center hover:bg-[#f4e4c9]">
                                          <a
                                            href={subHref}
                                            className="block px-4 py-2 text-[16px] hover:bg-[#f4e4c9] whitespace-nowrap cursor-pointer"
                                          >
                                            {subLabel}
                                          </a>
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
                                              } bg-white text-black rounded shadow-lg min-w-[200px] z-30`}
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
                                                  }) => (
                                                    <li key={subSubLabel}>
                                                      <a
                                                        href={subSubHref}
                                                        target="_blank"
                                                        className="block px-4 py-2 text-sm hover:bg-[#f4e4c9] whitespace-nowrap"
                                                        rel="noopener noreferrer"
                                                      >
                                                        {subSubLabel}
                                                      </a>
                                                    </li>
                                                  )
                                                )}
                                              </div>
                                            </ul>
                                          )}
                                      </div>
                                    </li>
                                  )
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
              <div className="px-4 mt-2 space-y-4 bg-white ">
                <ul className="flex flex-col gap-4 text-sm sm:text-base font-medium p-4 rounded-lg">
                  {navItems.map(({ label, icon: Icon, href, submenu }) => (
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
                                                  subLabel
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
                                              }) => (
                                                <li key={subSubLabel}>
                                                  <a
                                                    href={subSubHref}
                                                    target="_blank"
                                                    className="block px-4 py-2 text-sm hover:bg-[#f4e4c9] whitespace-nowrap"
                                                    rel="noopener noreferrer"
                                                  >
                                                    {subSubLabel}
                                                  </a>
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        )}
                                      </>
                                    ) : (
                                      <a
                                        href={subHref}
                                        className="block px-8 py-1 text-sm text-gray-700"
                                        onClick={() => setMenuOpen(false)}
                                      >
                                        {subLabel}
                                      </a>
                                    )}
                                  </li>
                                )
                              )}
                            </ul>
                          )}
                        </>
                      ) : (
                        <a
                          href={href}
                          className="flex items-center gap-2 px-4 py-2 text-[#303630] hover:text-teal-700"
                          onClick={() => setMenuOpen(false)}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </a>
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
                    {infoLinks.map(({ label, link, external, icon: Icon }) => (
                      <li key={label}>
                        <a
                          href={link}
                          target={external ? "_blank" : "_self"}
                          rel={external ? "noopener noreferrer" : undefined}
                          className="flex items-center gap-2 text-[#303630] hover:text-teal-700"
                        >
                          <Icon className="w-4 h-4" /> {label}
                        </a>
                      </li>
                    ))}
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
          <aside className="hidden md:flex flex-col fixed right-0 top-56 z-40">
            <HoverExpandIcons />
          </aside>
        )}
    </div>
  );
}

export default Navbar;
