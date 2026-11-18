import React, { useEffect, useState, useRef } from "react";

// A small, attractive Scroll-To-Top button shown after user scrolls down.
// Fixed at bottom-right, with smooth show/hide and smooth scrolling.
function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          setVisible(window.scrollY > 400);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (

    // polinaidu: 2/11/2025
    // Moved the scroll bar to somewhat above to make the social icons visible clearly
    <button
      type="button"
      onClick={handleClick}
      aria-label="Scroll to top"
      className={`fixed right-2 bottom-20 z-50 transition-opacity duration-300 cursor-pointer ${visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
    >
      <div className="relative">
        <div className="h-12 w-12 rounded-lg bg-teal-600 text-white hover:bg-teal-700 border border-teal-600 shadow-lg flex items-center justify-center">
          {/* Up Arrow */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
          >
            <path
              fillRule="evenodd"
              d="M12 3.75a.75.75 0 01.53.22l6 6a.75.75 0 11-1.06 1.06L12.75 6.56v12.69a.75.75 0 11-1.5 0V6.56L6.53 11.03a.75.75 0 01-1.06-1.06l6-6a.75.75 0 01.53-.22z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {/* Decorative ring */}
        <span className="absolute inset-0 rounded-lg ring-2 ring-teal-400/60 animate-ping"></span>
      </div>
    </button>
  );
}

export default ScrollToTop;


