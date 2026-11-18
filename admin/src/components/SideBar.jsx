import { useState, useEffect } from "react";
import navItems from "../site data/sidebarData";
import { useLocation } from "react-router-dom";
import iumsLogo from "../assets/iumsLogo/iumsLogo.png";
import {
  AcademicCapIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
  Bars3Icon,
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/outline";
import { HomeIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { getNameFromToken, getRoleFromToken } from "../ProtectedRoute";
import { BASE_URL } from "../config/urls";

const SideBar = ({ isOpen, onClose, onToggle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const userRole = getRoleFromToken(); // ✅ Get the current user's role
  // const userRole = "user"
  const location = useLocation();
  const userName = getNameFromToken();
  // console.log("userRole", userRole);

  // Sync with parent state if props are provided
  useEffect(() => {
    if (isOpen !== undefined) {
      setMobileSidebarOpen(isOpen);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = (menuId) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const isSidebarFullyOpen = sidebarOpen || mobileSidebarOpen;

  // Helper function to check if a route is active
  const isActiveRoute = (href) => {
    if (!href) return false;
    // Remove query parameters for comparison
    const currentPath = location.pathname.split("?")[0];
    const currentSearch = location.search;
    const itemPath = href.split("?")[0];
    const itemSearch = href.includes("?") ? href.split("?")[1] : "";

    // Exact match including query params
    if (location.pathname + location.search === href) return true;

    // Match pathname and check if query params match (if item has query params)
    if (currentPath === itemPath) {
      if (itemSearch && currentSearch) {
        // Check if all query params in item are present in current
        const itemParams = new URLSearchParams(itemSearch);
        const currentParams = new URLSearchParams(currentSearch);
        let allMatch = true;
        for (const [key, value] of itemParams.entries()) {
          if (currentParams.get(key) !== value) {
            allMatch = false;
            break;
          }
        }
        if (allMatch) return true;
      } else if (!itemSearch) {
        // Item has no query params, so pathname match is enough
        return true;
      }
    }

    // Check if current path starts with item path (for nested routes)
    if (itemPath !== "/" && currentPath.startsWith(itemPath)) return true;

    return false;
  };

  // Helper function to check if any child route is active
  const hasActiveChild = (item) => {
    if (!item.subItems) return false;
    return item.subItems.some((subItem) => {
      if (subItem.href && isActiveRoute(subItem.href)) return true;
      if (subItem.subItems) return hasActiveChild(subItem);
      return false;
    });
  };

  // Note: Auto-expand functionality removed - all dropdowns start closed on initial render
  // Users can manually expand dropdowns by clicking on them

  // 🔥 Modified Recursive Menu Renderer with Role Check
  const renderMenu = (items, level = 0) => {
    return items
      .filter((item) => {
        // Hide home icon from regular menu when sidebar is collapsed (we show it separately at top)
        if (!isSidebarFullyOpen && item.id === "home") {
          return false;
        }
        // Hide if allowedRoles exists and userRole is not included
        if (Array.isArray(item.allowedRoles)) {
          return item.allowedRoles.includes(userRole);
        }
        // If no allowedRoles, check subItems recursively
        if (Array.isArray(item.subItems)) {
          // Only show parent if at least one subItem is visible
          return item.subItems.some(
            (sub) =>
              (Array.isArray(sub.allowedRoles) &&
                sub.allowedRoles.includes(userRole)) ||
              (!sub.allowedRoles &&
                (!sub.subItems || renderMenu([sub], level + 1).length > 0))
          );
        }
        // Show if neither allowedRoles nor subItems
        return true;
      })
      .map((item) => (
        <div key={item.id || item.label} className="mb-1">
          {item.subItems ? (
            <>
              {/* Only render if at least one subItem is visible */}
              {renderMenu(item.subItems, level + 1).length > 0 && (
                <>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
                      isSidebarFullyOpen ? "justify-between" : "justify-center"
                    }`}
                    style={
                      isSidebarFullyOpen
                        ? { paddingLeft: `${level * 16 + 12}px` }
                        : {}
                    }
                    title={!isSidebarFullyOpen ? item.label : ""}
                  >
                    <div className="flex items-center">
                      {item.icon && (
                        <span
                          className={`text-gray-500 ${
                            isSidebarFullyOpen ? "mr-3" : ""
                          }`}
                        >
                          {item.icon}
                        </span>
                      )}
                      <div
                        className={`transition-all duration-300 ${
                          isSidebarFullyOpen
                            ? "opacity-100 w-auto"
                            : "opacity-0 w-0"
                        } overflow-hidden`}
                      >
                        {item.label}
                      </div>
                    </div>

                    {isSidebarFullyOpen &&
                      (expandedMenus[item.id] ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      ))}
                  </button>
                  {expandedMenus[item.id] && (
                    <div className="space-y-1">
                      {renderMenu(item.subItems, level + 1)}
                    </div>
                  )}
                </>
              )}
            </>
          ) : item.id === "adhoc-form-upload" ? (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                setMobileSidebarOpen(false);
                if (onClose) onClose();
              }}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isSidebarFullyOpen ? "justify-start" : "justify-center"
              } ${
                isActiveRoute(item.href)
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
              style={
                isSidebarFullyOpen
                  ? { paddingLeft: `${level * 16 + 12}px` }
                  : {}
              }
              title={!isSidebarFullyOpen ? item.label : ""}
            >
              {item.icon && (
                <span
                  className={`text-gray-500 ${
                    isSidebarFullyOpen ? "mr-3" : ""
                  }`}
                >
                  {item.icon}
                </span>
              )}
              {isSidebarFullyOpen && <span>{item.label}</span>}
            </a>
          ) : (
            <Link
              to={item.href}
              onClick={() => {
                setMobileSidebarOpen(false);
                if (onClose) onClose();
              }}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isSidebarFullyOpen ? "justify-start" : "justify-center"
              } ${
                isActiveRoute(item.href)
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
              style={
                isSidebarFullyOpen
                  ? { paddingLeft: `${level * 16 + 12}px` }
                  : {}
              }
              title={!isSidebarFullyOpen ? item.label : ""}
            >
              {item.icon && (
                <span
                  className={`text-gray-500 ${
                    isSidebarFullyOpen ? "mr-3" : ""
                  }`}
                >
                  {item.icon}
                </span>
              )}
              {isSidebarFullyOpen && <span>{item.label}</span>}
            </Link>
          )}
        </div>
      ));
  };

  return (
    <div className="flex bg-gray-50 relative min-h-screen overflow-hidden">
      {/* Mobile/Tablet Menu Button - Always visible when sidebar is closed */}
      {!mobileSidebarOpen && (
        <button
          onClick={() => {
            setMobileSidebarOpen(true);
            setSidebarOpen(false);
            if (onToggle) onToggle(true);
          }}
          className="fixed left-3 sm:left-4 z-40 p-2 text-gray-700 hover:text-gray-900 lg:hidden bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          aria-label="Open menu"
          style={{ top: "18px" }}
        >
          <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}

      {/* Desktop Toggle Button */}
      <button
        onClick={() => {
          const newState = !sidebarOpen;
          setSidebarOpen(newState);
          if (onToggle) onToggle(newState);
        }}
        className="hidden lg:flex items-center justify-center p-2 text-gray-700 hover:text-gray-900 absolute top-3 left-2 z-40 bg-white rounded-full shadow"
      >
        {sidebarOpen ? (
          <ArrowLeftCircleIcon className="h-6 w-6" />
        ) : (
          <ArrowRightCircleIcon className="h-6 w-6" />
        )}
      </button>

      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-transparent bg-opacity-50 lg:hidden"
          onClick={() => {
            setMobileSidebarOpen(false);
            if (onClose) onClose();
          }}
        ></div>
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 z-30 transform bg-white shadow-lg transition-all duration-300 ease-in-out overflow-x-hidden
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          w-full max-w-xs
          lg:static lg:translate-x-0 lg:relative lg:flex-shrink-0
          ${sidebarOpen ? "lg:w-64" : "lg:w-16"}
        `}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between border-b px-4 py-4 min-h-[64px]">
            {/* Mobile/Tablet Close Button - X icon (only visible when sidebar is open) */}
            {mobileSidebarOpen && (
              <button
                onClick={() => {
                  setMobileSidebarOpen(false);
                  if (onClose) onClose();
                }}
                className="lg:hidden text-gray-700 hover:text-gray-900 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow p-2 z-50"
                aria-label="Close menu"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}

            {/* iUMS Logo - Right side */}
            <div className="flex items-center justify-end flex-1">
              {isSidebarFullyOpen && (
                <img
                  src={iumsLogo}
                  className="w-[90%] h-[51px] object-contain"
                />
              )}
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav>
              {/* Show Home icon at top when sidebar is collapsed */}
              {!isSidebarFullyOpen && (
                <div className="mb-4 flex justify-center">
                  <Link
                    to="/"
                    onClick={() => {
                      setMobileSidebarOpen(false);
                      if (onClose) onClose();
                    }}
                    className={`flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActiveRoute("/")
                        ? ""
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                    title="Home"
                  >
                    <HomeIcon className="h-5 w-5 text-gray-500" />
                  </Link>
                </div>
              )}
              {renderMenu(navItems)}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="border-t p-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-[#525B88] font-medium">AD</span>
              </div>
              {isSidebarFullyOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500">{userRole}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
