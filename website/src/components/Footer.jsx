import React, { useEffect } from "react";
import { Youtube, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { aknuLogo, Pinkmoontech } from "@/assets";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { tANDc } from "../assets";
import "bootstrap-icons/font/bootstrap-icons.css";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  const handleImportantLinksClick = (e) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/#important-links");
    } else {
      const el = document.getElementById("important-links");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLinkClick = (to) => (e) => {
    // For links with #important-links, let React Router handle navigation
    // The scroll will be handled by the Section_Information component
    if (to.includes("#important-links")) {
      // Don't prevent default, let Link handle it
      // The destination component will handle scrolling and tab activation
      return;
    }
    // If clicking the same route, just scroll to top
    const pathOnly = to.split("?")[0].split("#")[0];
    if (location.pathname === pathOnly) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Update URL if there are query params
      if (to.includes("?") || to.includes("#")) {
        navigate(to);
      }
    }
    // For different routes, the useEffect will handle scrolling
  };
  const icons = [
    {
      name: "YouTube",
      color: "white",
      icon: "bi-youtube",
      link: "https://www.youtube.com/channel/UCWk6lIyf9JGKx84fZCWmDyQ",
    },
    {
      name: "Instagram",
      color: "white",
      icon: "bi-instagram",
      link: "https://www.instagram.com/aknu_rjy/",
    },
    {
      name: "Facebook",
      color: "white",
      icon: "bi-facebook",
      link: "https://www.facebook.com/people/Adikavi-Nannaya-University/100064032637610/",
    },
    {
      name: "LinkedIn",
      color: "white",
      icon: "bi-linkedin",
      link: "https://www.linkedin.com/school/s.k.v.t.degree-college/",
    },
  ];
  return (
    <div>
      {pathname?.toLowerCase() != "/formupload" &&
        pathname?.toLowerCase() != "/admin" && (
          <footer className="bg-teal-700 text-white py-12">
            <div className="container-wide">
              {/* Logo Section */}
              {/* <div className="mb-10 text-center">
                    <a href="/" className="inline-block mb-4">
                      <img
                        src={aknuLogo}
                        alt="AKNU"
                        title="AKNU"
                        loading="lazy"
                        className="mx-auto w-10"
                      />
                    </a>
                    <p className="text-sm opacity-80">Nurturing Valuable Futures</p>
                  </div> */}

              {/* Links Section */}
              <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 text-sm">
                {/* Column 1 */}
                <div className="mb-6 lg:mb-0">
                  <h4 className="font-semibold mb-4 text-white text-xl">
                    Important Links
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        to="/?item=Examination&sub=Results#important-links"
                        className="hover:text-gray-300"
                        onClick={handleLinkClick("/?item=Examination&sub=Results#important-links")}
                      >
                        Results
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/?item=Examination&sub=Notifications#important-links"
                        className="hover:text-gray-300"
                        onClick={handleLinkClick("/?item=Examination&sub=Notifications#important-links")}
                      >
                        Examination
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/?item=Circular&sub=CDC Circulars#important-links"
                        className="hover:text-gray-300"
                        onClick={handleLinkClick("/?item=Circular&sub=CDC Circulars#important-links")}
                      >
                        Circular
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/?item=Jobs#important-links"
                        className="hover:text-gray-300"
                        onClick={handleLinkClick("/?item=Jobs#important-links")}
                      >
                        Jobs
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/?item=Tenders#important-links"
                        className="hover:text-gray-300"
                        onClick={handleLinkClick("/?item=Tenders#important-links")}
                      >
                        Tenders
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 2 */}
                <div className=" mb-6 lg:mb-0">
                  <h4 className="font-semibold mb-4 text-white text-xl">
                    Admissions
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        to="/AdmissionPage"
                        className="hover:text-gray-300"
                        onClick={handleLinkClick("/AdmissionPage")}
                      >
                        UG Admissions
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/AdmissionPage"
                        className="hover:text-gray-300"
                        onClick={handleLinkClick("/AdmissionPage")}
                      >
                        PG Admissions
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/AdmissionPage?register=true"
                        className="hover:text-gray-300"
                        onClick={handleLinkClick("/AdmissionPage?register=true")}
                      >
                        Apply Now
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 3 */}
                <div className=" mb-6 lg:mb-0">
                  <h4 className="font-semibold mb-4 text-white text-xl">
                    Academics
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        to="/academic_affairs"
                        className="hover:text-gray-300"
                        onClick={handleLinkClick("/academic_affairs")}
                      >
                        Academic Affairs
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/faculty-section"
                        className="hover:text-gray-300"
                        onClick={handleLinkClick("/faculty-section")}
                      >
                        Faculty
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/executive-council"
                        className="hover:text-gray-300"
                        onClick={handleLinkClick("/executive-council")}
                      >
                        Executive Council
                      </Link>
                    </li>
                    {/* <li>
                      <a
                        href="#upcoming-events"
                        className="hover:text-gray-300"
                      >
                        Events
                      </a>
                    </li> */}
                  </ul>
                </div>

                {/* Column 4 */}
                <div className="mb-6 lg:mb-0">
                  <h4 className="font-semibold mb-4 text-white text-xl">
                    Research
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        to="/mou"
                        className="hover:text-gray-300"
                        onClick={handleLinkClick("/mou")}
                      >
                        MoU's
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/patents"
                        className="hover:text-gray-300"
                        onClick={handleLinkClick("/patents")}
                      >
                        Patents
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/collaborations"
                        className="hover:text-gray-300"
                        onClick={handleLinkClick("/collaborations")}
                      >
                        Collaborations
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 5 */}

                <div className="">
                  <h4 className="font-semibold mb-4 text-white text-xl">
                    Policies
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="hover:text-gray-300 cursor-not-allowed"
                      >
                        Cookie Policy
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="hover:text-gray-300 cursor-not-allowed"
                      >
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <Link
                        to="/RTIPage"
                        className="hover:text-gray-300"
                        onClick={handleLinkClick("/RTIPage")}
                      >
                        RTI Information
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {pathname?.toLowerCase() !== "/formupload" &&
              pathname?.toLowerCase() !== "/admin" && (
                <div className="w-full flex justify-center sm:hidden mt-4">
                  {/* <div className="flex items-center justify-center space-x-4">
                    <a
                      href="https://www.youtube.com/channel/UCWk6lIyf9JGKx84fZCWmDyQ"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Youtube className="w-6 h-6 text-white hover:text-gray-300 transition-colors duration-200" />
                    </a>
                    <a
                      href="https://www.facebook.com/people/Adikavi-Nannaya-University/100064032637610/#"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Facebook className="w-6 h-6 text-white hover:text-gray-300 transition-colors duration-200" />
                    </a>
                    <a
                      href="https://www.instagram.com/aknu_rjy/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Instagram className="w-6 h-6 text-white hover:text-gray-300 transition-colors duration-200" />
                    </a>
                    <a
                      href="https://www.linkedin.com/school/s.k.v.t.degree-college/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Linkedin className="w-6 h-6 text-white hover:text-gray-300 transition-colors duration-200" />
                    </a>
                  </div> */}
                </div>
              )}
          </footer>
        )}

      <div
        className={`border-t border-gray-500 py-3 bg-gray-600 flex flex-col md:flex-row items-center gap-3 flex-wrap px-4 sm:px-6 ${pathname?.toLowerCase() == "/formupload" || pathname?.toLowerCase() == "/admin" ? " justify-center" : " justify-between"}`}
      >
        <div
          className={`flex items-center space-x-2 mb-3 md:mb-0 justify-between ${
            pathname?.toLowerCase() === "/formupload" ||
            pathname?.toLowerCase() === "/admin"
              ? "absolute left-2"
              : "relative"
          }`}
        >
          <div className="relative group flex items-center">
            <img
              src={Pinkmoontech}
              alt="QR Code"
              className="w-8 h-8 ml-2 rounded cursor-pointer "
              loading="lazy"
              onMouseEnter={(e) =>
                (e.currentTarget.nextSibling.style.opacity = 1)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.nextSibling.style.opacity = 0)
              }
              onClick={() => window.open("https://pinkmoontech.com/", "_blank")}
            />
            <span
              style={{
                opacity: 0,
                pointerEvents: "none",
                transition: "opacity 0.2s",
              }}
              className="absolute left-10 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded shadow text-teal-700 font-semibold whitespace-nowrap bg-white z-10"
            >
              <a
                href="https://pinkmoontech.com/"
                target="_blank"
                className="text-teal-800 font-semibold"
              >
                Designed & Developed by PINKMOON Technologies Pvt Ltd
              </a>
            </span>
          </div>
        </div>

        <div className="flex justify-center items-center mt-0 sm:mt-0">
          <p className="text-sm font-medium text-white text-center">
            ©{new Date().getFullYear()} AKNU. All rights reserved.
          </p>
        </div>

        {pathname?.toLowerCase() != "/formupload" &&
          pathname?.toLowerCase() != "/admin" && (
            // <div className="hidden sm:flex justify-start space-x-4">
            //   {icons.map(({ name, color, icon, link }) => (
            //     <div key={name} className="relative group">
            //       <a
            //         href={link}
            //         target="_blank"
            //         rel="noopener noreferrer"
            //         className="transition-transform duration-200 hover:scale-125"
            //       >
            //         <i
            //           className={`bi ${icon} transition-all text-xl duration-200 group-hover:scale-125`}
            //           style={{ color }}
            //         ></i>
            //       </a>

            //       {/* Tooltip */}
            //       <span
            //         className="
            //   absolute bottom-8 left-1/2 -translate-x-1/2
            //   bg-gray-800 text-white text-xs rounded-md
            //   px-2 py-1 opacity-0 scale-0
            //   group-hover:opacity-100 group-hover:scale-100
            //   transition-all duration-200
            //   pointer-events-none
            //   whitespace-nowrap
            // "
            //       >
            //         {name}
            //       </span>
            //     </div>
            //   ))}
            // </div>

            <div className="flex justify-center gap-2.5">
              <a
                href="https://www.youtube.com/channel/UCWk6lIyf9JGKx84fZCWmDyQ"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5  bg-white hover:bg-gray-100 shadow-md transition transform hover:scale-105"
              >
                <Youtube className="w-5 h-5 text-red-600" />
              </a>
              <a
                href="https://www.facebook.com/people/Adikavi-Nannaya-University/100064032637610/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5  bg-white hover:bg-gray-100 shadow-md transition transform hover:scale-105"
              >
                <Facebook className="w-4 h-4 text-sky-600" />
              </a>
              <a
                href="https://www.instagram.com/aknu_rjy/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5  bg-white hover:bg-gray-100 shadow-md transition transform hover:scale-105"
              >
                <Instagram className="w-4 h-4 text-pink-600" />
              </a>
              <a
                href="https://www.linkedin.com/school/s.k.v.t.degree-college/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5  bg-white hover:bg-gray-100 shadow-md transition transform hover:scale-105"
              >
                <Linkedin className="w-4 h-4 text-blue-700" />
              </a>
            </div>
          )}
      </div>
    </div>
  );
};

export default Footer;
