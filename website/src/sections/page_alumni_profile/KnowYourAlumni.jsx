// KnowYourAlmamater.jsx
import React, { useState, useEffect, useRef } from "react";
import { YOUTUBE_ID } from "../../utils/config";

export default function KnowYourAlmamater() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef(null);

  // Preload iframe on component mount
  useEffect(() => {
    // Preload the iframe immediately so it's ready when user clicks
    const preloadIframe = document.createElement("iframe");
    preloadIframe.width = "0";
    preloadIframe.height = "0";
    preloadIframe.src = `https://www.youtube.com/embed/${YOUTUBE_ID}?enablejsapi=1&origin=${window.location.origin}`;
    preloadIframe.style.display = "none";
    preloadIframe.allow = "autoplay";
    preloadIframe.title = "AKNU Anthem Preload";
    document.body.appendChild(preloadIframe);
    iframeRef.current = preloadIframe;

    return () => {
      // Cleanup on unmount
      if (preloadIframe && preloadIframe.parentNode) {
        preloadIframe.parentNode.removeChild(preloadIframe);
      }
    };
  }, []);

  const handleToggleAnthem = () => {
    if (!isPlaying) {
      setIsLoading(true);
      // Small delay to show loading state, then play
      setTimeout(() => {
        setIsPlaying(true);
        setIsLoading(false);
        // Update iframe src to trigger autoplay
        if (iframeRef.current) {
          iframeRef.current.src = `https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`;
        }
      }, 100);
    } else {
      setIsPlaying(false);
      // Pause by removing autoplay
      if (iframeRef.current) {
        iframeRef.current.src = `https://www.youtube.com/embed/${YOUTUBE_ID}?enablejsapi=1&origin=${window.location.origin}`;
      }
    }
  };

  return (
    <section
      className="relative text-gray-800 bg-white px-4 sm:px-16 py-4"
      id="alma-mater"
    >
      <div className="mx-auto">
        {/* Heading */}
        <h2 className="text-3xl font-bold text-teal-800 sm:text-3xl text-center mb-10">
          Know Your Almamater
        </h2>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Section */}
          <div className="">
            <h3 className="text-xl font-semibold mb-4 text-[#00786F]">
              A Century of Academic Excellence
            </h3>
            <p className="text-gray-600 mb-4 leading-relaxed text-[16px] text-justify">
              Founded in 2006, Adikavi Nannaya University has rapidly grown into
              one of Andhra Pradesh's leading institutions of higher learning,
              carrying forward a legacy of excellence in education and research.
            </p>
            <p className="text-gray-600 leading-relaxed text-[16px] text-justify">
              As we continue our journey, we celebrate our commitment to
              academic brilliance, innovation, and the countless alumni who have
              contributed to society.
            </p>
            <br />
            <a
              className="bg-[#00786F] text-white font-semibold px-7 py-3 shadow-lg hover:bg-teal-900 transition-all duration-300 inline-block text-center hover:shadow-xl transform hover:-translate-y-1"
              href="#past-events"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("past-events");
                if (element) {
                  setTimeout(() => {
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }, 100);
                }
              }}
            >
              View Past Events
            </a>
          </div>

          {/* Right Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-[#00786F]">
              Alumni Association
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6 text-[16px] text-justify">
              The Adikavi Nannaya University Alumni Association connects
              graduates across generations, fostering lifelong relationships and
              supporting the university's growth and development through various
              initiatives.
            </p>

            {/* Anthem Button */}
            <div className="flex gap-4 items-center">
              <button
                onClick={handleToggleAnthem}
                disabled={isLoading}
                className="bg-[#00786F] text-white font-semibold px-7 py-3 shadow-lg hover:bg-teal-900 transition-all duration-300 inline-block text-center hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </>
                ) : isPlaying ? (
                  "Pause Anthem"
                ) : (
                  "Aknu Anthem"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
