import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

import axios from "axios";

const StudentsSay = () => {
  const containerRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [voice, setVoices] = useState([]);

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async (force = false) => {
    try {
      // 1. Try localStorage first (skip if force = true)
      if (!force) {
        const cached = localStorage.getItem("voices");
        if (cached) {
          setVoices(JSON.parse(cached));
          return;
        }
      }

      // 2. Otherwise fetch from API
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}api/voices-at-aknu/`
      );

      const rawData = response.data.data || [];

      const formattedVoices = rawData.map((item) => ({
        text: item.description,
        author: `${item.Name}, ${item.branch}, ${item.city}`,
      }));

      setVoices(formattedVoices);

      // ✅ Save to localStorage
      localStorage.setItem("voices", JSON.stringify(formattedVoices));
    } catch (error) {
      console.error("Error fetching voices:", error);
      setVoices([]);
    }
  };

  // Helper to repeat array to ensure seamless scroller regardless of item count
  const getRepeatedCards = () => {
    if (voice.length === 0) return [];
    let repeated = [...voice];
    // Keep duplicating until we have at least 8 items, so it covers wide screens
    while (repeated.length < 8) {
      repeated = [...repeated, ...voice];
    }
    // Then duplicate the final result once for the perfect infinite loop
    return [...repeated, ...repeated];
  };

  const cards = getRepeatedCards();

  // Smooth continuous auto-scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let speed = 0.55; // px per frame
    let frame;

    function step() {
      if (!hovering) {
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
  }, [hovering, voice]);

  // Handle seamless loops even during manual user scrolling (horizontal mouse wheel / trackpad / touch swipe)
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const half = container.scrollWidth / 2;
    if (container.scrollLeft >= half) {
      // Loop forward
      container.scrollLeft = container.scrollLeft - half;
    } else if (container.scrollLeft <= 0) {
      // Loop backward
      container.scrollLeft = half + container.scrollLeft;
    }
  };

  return (
    <section className="bg-white w-full px-4 sm:px-16 pt-10 md:pt-16">
      <div className="max-w-8xl mx-auto">
        <h2 className="text-3xl md:text-3xl font-bold text-teal-800 mb-4 px-6">
          Voices of AKNU
        </h2>
        <div className="w-full relative px-6">
          <div
            ref={containerRef}
            className="flex gap-6 overflow-x-auto overflow-y-hidden scrollbar-none p-6 cursor-grab active:cursor-grabbing"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onScroll={handleScroll}
            style={{ scrollBehavior: "auto" }}
          >
            {cards.map((testimonial, index) => (
              <motion.div
                key={index}
                className="min-w-[285px] max-w-[300px] p-6 bg-[#f0f9f8] rounded-2xl shadow-md transition-transform hover:scale-105"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-gray-700 mb-6">{testimonial.text}</p>
                <p className="text-[#014737] font-semibold">
                  {testimonial.author}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentsSay;
