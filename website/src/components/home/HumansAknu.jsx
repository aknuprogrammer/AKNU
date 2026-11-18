import React, { useState, useEffect, useRef } from "react";
import { humansData } from "../../siteData/homeData";
import { Phone, Mail } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";

function HumansAknu() {
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [activeCard, setActiveCard] = useState(null);
  const scrollRef = useRef(null);

  // Duplicate data for seamless looping
  const chips = [...humansData, ...humansData];

  // Drag to scroll
  const handleMouseDown = (e) => {
    setDragging(true);
    setStartX(e.pageX - e.currentTarget.offsetLeft);
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    const x = e.pageX - e.currentTarget.offsetLeft;
    const walk = (x - startX) * 2;
    e.currentTarget.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setDragging(false);
  };

  // Smooth continuous auto-scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    let speed = 0.5; // px per frame
    let frame;

    function step() {
      if (!dragging && !hovering) {
        container.scrollLeft += speed;
        // If we've scrolled past the first set, reset to start
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }
      frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [dragging, hovering]);

  return (
    <section
      id="faculty-section"
      data-aos="fade-up"
      data-aos-duration="800"
      className="humans-of-aknu mt-16 pt-6 bg-gradient-to-b from-teal-600 to-teal-700 px-4 sm:px-16"
    >
      <div className="">
        <div className="mb-0">
          <h2 className="text-3xl font-bold text-white mb-4">
            We're Here to Help!
          </h2>
          <p className="text-teal-100 text-sm max-w-full">
            At the heart of our success lies a passionate and driven core team.
            Each member brings unique expertise, a shared vision, and an
            unwavering commitment to excellence.
          </p>
        </div>

        <div
          ref={scrollRef}
          className="flex space-x-6 overflow-x-auto mx-0  p-6 pb-10 -mx-6 scroll-smooth"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={() => {
            handleMouseUpOrLeave();
            setHovering(false);
          }}
          onMouseEnter={() => setHovering(true)}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style>
            {`
              .flex::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>

          {chips.map((human, index) => (
            <div
              key={`${index}-${human.id}`}
              className={`flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 snap-start group relative flex flex-col ${
                activeCard === human.id ? "ring-4 ring-teal-400" : ""
              }`}
              onMouseEnter={() => setActiveCard(human.id)}
              onMouseLeave={() => setActiveCard(null)}
            >
              {/* Profile Image */}
              <div className="relative flex justify-center items-center overflow-hidden pt-8">
                <img
                  className="w-28 h-28 object-cover rounded-full border-4 border-white shadow-md transition-transform duration-500 group-hover:scale-105"
                  src={human.mainImg}
                  alt={human.name}
                  loading="lazy"
                />
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 text-center">
                  {human.name}
                </h3>
                <p className="text-teal-600 font-small text-sm text-center mt-1">
                  {human.designation}
                </p>
                <p className="text-teal-600 text-xs font-semibold text-center mt-1">
                  {human.department}
                </p>

                <div className="w-12 h-px bg-gray-200 my-4 mx-auto"></div>

                {/* Description with Full View on Hover */}
                <div className="text-gray-600 text-sm relative group/desc mt-2 text-center">
                  <span>
                    {human.description.length > 100
                      ? `${human.description.slice(0, 100)}...`
                      : human.description}
                  </span>

                  {human.description.length > 100 && (
                    <span className="absolute top-1 left-1/2 -translate-x-1/2 -mt-11 z-10 w-72 p-3 bg-white text-gray-800 text-xs rounded shadow-lg border border-gray-200 opacity-0 group-hover/desc:opacity-100 transition-opacity duration-200 pointer-events-none">
                      {human.description}
                    </span>
                  )}
                </div>

                {/* Contact Links */}
                <div className="mt-auto p-4 bg-gray-50 flex justify-center space-x-6 rounded-b-2xl">
                  <a
                    href={human.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-800 transition-colors"
                    aria-label={`Connect with ${human.name} on LinkedIn`}
                  >
                    <FaLinkedin size={20} />
                  </a>
                  <a
                    href={`tel:${human.phone}`}
                    className="text-teal-600 hover:text-teal-800 transition-colors"
                    aria-label={`Call ${human.name}`}
                  >
                    <Phone size={20} />
                  </a>
                  <a
                    href={`mailto:${human.email}`}
                    className="text-teal-600 hover:text-teal-800 transition-colors"
                    aria-label={`Email ${human.name}`}
                  >
                    <Mail size={20} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HumansAknu;
