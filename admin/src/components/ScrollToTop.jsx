import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Small delay to ensure DOM is ready and route has rendered
    const timer = setTimeout(() => {
      // Find the scrollable container (the div with overflow-y-auto in the main content area)
      // Look for the container that's a direct child of the flex container
      const mainContentArea = document.querySelector(".flex-1.flex.flex-col.min-w-0");
      const scrollableContainer = mainContentArea?.querySelector(".overflow-y-auto");
      
      if (scrollableContainer) {
        // Smooth scroll to top of the container
        scrollableContainer.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      } else {
        // Fallback: try to find any overflow-y-auto container
        const fallbackContainer = document.querySelector(".overflow-y-auto");
        if (fallbackContainer) {
          fallbackContainer.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
          });
        } else {
          // Final fallback to window scroll
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
          });
        }
      }
    }, 100); // Slightly longer delay to ensure route content is rendered

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}

