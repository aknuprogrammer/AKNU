import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { 
  ChevronDown, 
  ChevronUp, 
  Menu, 
  X, 
  ChevronRight,
  Home,
  Info,
  GraduationCap,
  Users,
  Award,
  History,
  HandHeart,
  Calendar,
  Images,
  Mail,
  Network
} from "lucide-react";
import { aknuAdikavi, aknuNewLogo } from "../../assets";
import { infoLinks } from "../../siteData/homeData";
import SongPlayerWithSocial from "../home/SongPlayerWithSocial";

const AlumniNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);
  const [isWideScreen, setIsWideScreen] = useState(true);
  const [openMenus, setOpenMenus] = useState([]);
  const menuRef = useRef();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    {
      name: "About",
      icon: Info,
      submenu: [
        { name: "Alma Mater", path: "#alma-mater", icon: GraduationCap },
        { name: "Association", path: "#association", icon: Network },
        { name: "Ambassadors", path: "#ambassadors", icon: Award },
      ],
    },
    { name: "Legacy", path: "#legacy", icon: History },
    { name: "Volunteer", path: "#volunteer", icon: HandHeart },
    { name: "Host Event", path: "#host-event", icon: Calendar },
    { name: "Memories", path: "#memories", icon: Images },
    { name: "Connect", path: "#connect", icon: Mail },
  ];

  // Check screen width
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1000px)");
    setIsWideScreen(mediaQuery.matches);

    const handler = (e) => setIsWideScreen(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
        setOpenMenus([]);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (name) => {
    setOpenMenus((prev) =>
      prev.includes(name) ? prev.filter((l) => l !== name) : [...prev, name]
    );
  };

  return (
    <div className="relative">
      <header className="sticky top-0 z-50 bg-white shadow-md" ref={menuRef}>
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
                                const hash = link.replace("/#", "#");
                                if (location.pathname !== "/") {
                                  navigate(`/${hash}`);
                                } else {
                                  const id = hash.replace("#", "");
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
      <div
        className="bg-teal-700 pb-4 border-t text-white scroll-smooth font-sans"
      >
        {/* Header */}
        <div className="flex justify-evenly items-center px-6 gap-4">
          <Link to="/">
            <img
              src={aknuNewLogo}
              alt="AKNU"
              className="w-24 h-24 object-contain"
            />
          </Link>

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

        {/* Navigation */}
        <div className="flex justify-center items-center px-6 mt-2 gap-4">
          {/* Mobile menu button */}
          {!isWideScreen && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Menu"
              className="text-white"
            >
              {menuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          )}

          {/* Desktop Navigation */}
          {isWideScreen && (
            <ul className="flex gap-4 text-sm sm:text-base font-medium relative z-10">
                  {navItems.map((item, index) => (
                    <li key={index} className="relative group">
                      {item.submenu ? (
                        <>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleMenu(item.name);
                            }}
                            className="flex items-center gap-2 hover:text-blue-300 cursor-pointer"
                          >
                            {item.icon && <item.icon className="w-4 h-4" />}
                            <span>{item.name}</span>
                            <span className="ml-1 text-xs transform transition-transform duration-300">
                              {openMenus.includes(item.name) ? (
                                <ChevronUp className="w-4 h-4 inline" />
                              ) : (
                                <ChevronDown className="w-4 h-4 inline" />
                              )}
                            </span>
                          </a>

                          {/* Submenu overlay */}
                          {openMenus.includes(item.name) && (
                            <ul className="absolute left-0 top-full bg-white text-black min-w-[200px] mt-1 z-20">
                              <div className="absolute -top-2 left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white"></div>
                              <div className="p-3">
                                {item.submenu.map((sub, subIndex) => (
                                  <li key={subIndex} className="relative submenu-group text-left">
                                    <a
                                      href={sub.path}
                                      className="flex items-center gap-2 px-4 py-2 text-[16px] hover:bg-[#f4e4c9] whitespace-nowrap cursor-pointer"
                                      onClick={(e) => {
                                        if (sub.path?.startsWith("#")) {
                                          e.preventDefault();
                                          const id = sub.path.replace("#", "");
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
                                      }}
                                    >
                                      {sub.icon && <sub.icon className="w-4 h-4" />}
                                      {sub.name}
                                    </a>
                                  </li>
                                ))}
                              </div>
                            </ul>
                          )}
                        </>
                      ) : (
                        <a
                          href={item.path}
                          className="flex items-center gap-2 hover:text-blue-300 cursor-pointer"
                          onClick={(e) => {
                            if (item.path?.startsWith("#")) {
                              e.preventDefault();
                              const id = item.path.replace("#", "");
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
                          }}
                        >
                          {item.icon && <item.icon className="w-4 h-4" />}
                          {item.name}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
          )}

          {/* Mobile Navigation */}
          {!isWideScreen && menuOpen && (
            <div className="px-4 mt-2 space-y-4 bg-white absolute left-0 right-0 top-full z-50">
              <ul className="flex flex-col gap-4 text-sm sm:text-base font-medium p-4 rounded-lg">
                  {navItems.map((item, index) => (
                    <li key={index}>
                      {item.submenu ? (
                        <>
                          <div
                            className="flex items-center justify-between py-2 px-4 font-medium cursor-pointer bg-gray-100 rounded-md"
                            onClick={() => toggleMenu(item.name)}
                          >
                            <div className="flex items-center gap-2">
                              {item.icon && <item.icon className="w-4 h-4" />}
                              <span>{item.name}</span>
                            </div>
                            <span className="ml-1 text-xs transform transition-transform duration-300">
                              {openMenus.includes(item.name) ? (
                                <ChevronUp className="w-4 h-4 inline" />
                              ) : (
                                <ChevronDown className="w-4 h-4 inline" />
                              )}
                            </span>
                          </div>

                          {openMenus.includes(item.name) && (
                            <ul className="ml-6 mt-2 space-y-2 bg-gray-50 p-2 rounded-md">
                              {item.submenu.map((sub, subIndex) => (
                                <li key={subIndex}>
                                  <a
                                    href={sub.path}
                                    className="flex items-center gap-2 px-4 py-2 text-[16px] hover:bg-[#f4e4c9] rounded-md"
                                    onClick={(e) => {
                                      setMenuOpen(false);
                                      setOpenMenus([]);
                                      if (sub.path?.startsWith("#")) {
                                        e.preventDefault();
                                        const id = sub.path.replace("#", "");
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
                                    }}
                                  >
                                    {sub.icon && <sub.icon className="w-4 h-4" />}
                                    {sub.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      ) : (
                        <a
                          href={item.path}
                          className="flex items-center justify-center gap-2 py-2 px-4 text-center transition-all duration-300 hover:bg-gray-100 rounded-md"
                          onClick={(e) => {
                            setMenuOpen(false);
                            if (item.path?.startsWith("#")) {
                              e.preventDefault();
                              const id = item.path.replace("#", "");
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
                          }}
                        >
                          {item.icon && <item.icon className="w-4 h-4" />}
                          {item.name}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
            </div>
          )}
        </div>
      </div>
      </header>
    </div>
  );
};

export default AlumniNavbar;
