import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  yodandra1,
  yodandra2,
  yodandra3,
  yodandra4,
  yodandra5,
  yodandra6,
} from "../../assets";

const BACKEND_DOMAIN = import.meta.env.VITE_API_URL;

const checkIsVideo = (g_item) => {
  // ✅ If mediatype exists, trust it directly
  if (g_item.mediatype) return g_item.mediatype === "video";

  // ✅ Otherwise fall back to URL extension check
  if (typeof g_item?.src === "string") {
    const ext = g_item.src.split(".").pop().toLowerCase();
    return ["mp4", "mov", "avi", "webm"].includes(ext);
  }

  return false;
};

const DynamicSection = ({
  galleryData = {
    sectionTitle: "Gallery",
    sectionDescription:
      "A vibrant showcase of campus life, culture, and achievements at Adikavi Nannaya University.",
    projects: [
      // Default static data
      {
        id: 1,
        imageSrc: yodandra1,
        title: "Web Design Project",
        description: "Modern responsive website design",
      },
      {
        id: 2,
        imageSrc: yodandra2,
        title: "Mobile App",
        description: "Cross-platform mobile application",
      },
      {
        id: 3,
        imageSrc: yodandra3,
        title: "Brand Identity",
        description: "Complete brand redesign",
      },
      {
        id: 4,
        imageSrc: yodandra4,
        title: "E-commerce Solution",
        description: "Online store with payment integration",
      },
      {
        id: 5,
        imageSrc: yodandra5,
        title: "Marketing Campaign",
        description: "Social media marketing strategy",
      },
      {
        id: 6,
        imageSrc: yodandra6,
        title: "UI/UX Redesign",
        description: "User experience improvement",
      },
      // {
      //   id: 7,
      //   title: "Orientation Program 2023",
      //   src: "https://aknu.edu.in/links/INS/images/Convocation%20New.mp4",
      //   description: "Welcome session for new psychology students",
      // },
      // {
      //   id: 8,
      //   title: "Research Methodology Workshop",
      //   src: "https://aknu.edu.in/links/INS/images/MoU%20Ceremonies.mp4",
      //   description: "Hands-on training for postgraduate students",
      // },
      // {
      //   id: 9,
      //   title: "Alumni Interaction Session",
      //   src: "https://aknu.edu.in/links/INS/images/SWZ%20Inter%20university%20weightlifting%20championship.mp4",
      //   description: "Career guidance from successful graduates",
      // },
      // {
      //   id: 10,
      //   title: "Mental Health Awareness",
      //   src: "https://aknu.edu.in/links/INS/images/SWZ%20Inter%20university%20weightlifting%20championship.mp4",
      //   description: "Panel discussion with faculty experts",
      // },
    ],
  },
}) => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLatest_S, setIsLatest_S] = useState(false);

  useEffect(() => {
    const fetchGalleryData = async (force = false) => {
      try {
        // 1. Check localStorage first
        if (!force) {
          const cached = localStorage.getItem("gallery");
          if (cached) {
            setGalleryItems(JSON.parse(cached));
            setLoading(false);
            return;
          }
        }

        // 2. Otherwise fetch fresh data
        const response = await axios.get(`${BACKEND_DOMAIN}api/gallery`);
        let apiItems = [];
        if (response.data.success && response.data.data.length > 0) {
          console.log("116", response.data.data);
          apiItems = response.data.data
            .map((item) => {
              const baseUrl = `${BACKEND_DOMAIN}api/gallery`;
              if (item.mediatype === "image") {
                return {
                  id: item._id,
                  title: item.title,
                  description: item.description,
                  imageSrc: `${baseUrl}/image/${item._id}`, // add extension for UI clarity
                  mediatype: item.mediatype,
                  alignno: item.alignno,
                };
              } else if (item.mediatype === "video") {
                return {
                  id: item._id,
                  title: item.title,
                  description: item.description,
                  src: `${baseUrl}/video/${item._id}`, // add extension for UI clarity
                  mediatype: item.mediatype,
                  alignno: item.alignno,
                };
              } else {
                return null;
              }
            })
            .filter(Boolean);
        }
        const combined = [...apiItems, ...galleryData.projects];
        setGalleryItems(combined);
        // ✅ Save to localStorage
        localStorage.setItem("gallery", JSON.stringify(combined));
      } catch (err) {
        console.error("Error fetching gallery data:", err);
        setError(err.message);
        // Fallback to static data only
        setGalleryItems(galleryData.projects);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryData();
  }, []);

  const { sectionTitle, sectionDescription } = galleryData;
  // Combine API items and default items if needed
  const displayItems = [...galleryItems];
  return (
    <section className="pt-16 mt-8 pb-8 bg-gray-50 overflow-hidden">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .scrolling-track {
          display: flex;
          width: max-content;
          animation: scroll 60s linear infinite;
        }
        .scrolling-paused {
          animation-play-state: paused;
        }
      `}</style>

      <div className="mx-auto px-4 sm:px-16">
        <h2 className="text-3xl font-bold text-teal-800 mb-2">
          {sectionTitle}
        </h2>
        <p className="text-gray-600 mx-auto mb-5">{sectionDescription}</p>

        <div className="flex space-x-3 mb-5">
          <button
            onClick={() => setIsLatest_S(true)}
            className={`px-4 py-2 rounded-lg font-medium transition 
              ${
                isLatest_S
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Latest
          </button>

          <button
            onClick={() => setIsLatest_S(false)}
            className={`px-4 py-2 rounded-lg font-medium transition 
              ${
                !isLatest_S
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            All
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading gallery...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            Error loading gallery: {error}
          </div>
        ) : (
          <div className="relative w-full overflow-hidden">
            <div
              className={`scrolling-track ${displayItems && displayItems?.length < 3 ? "scrolling-paused" : ""}`}
              onMouseEnter={(e) =>
                e.currentTarget.classList.add("scrolling-paused")
              }
              onMouseLeave={(e) =>
                e.currentTarget.classList.remove("scrolling-paused")
              }
            >
              {[...displayItems]
                .filter((ele) => !checkIsVideo(ele))
                .slice(0, isLatest_S ? 30 : 2 * displayItems.length)
                .map((project, idx) => (
                  <div
                    key={`${project.id}-${idx}`}
                    className="min-w-[300px] max-w-[300px] mx-2 rounded-lg overflow-hidden shadow-lg bg-white flex flex-col items-center justify-center"
                  >
                    {project.imageSrc ? (
                      <img
                        src={project.imageSrc}
                        alt={project.title}
                        className="w-full h-[200px] object-cover"
                        loading="lazy"
                      />
                    ) : project.src ? (
                      <video
                        src={project.src}
                        controls
                        className="w-full h-[200px] object-cover bg-black"
                        poster={project.poster || undefined}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : null}
                  </div>
                ))}
            </div>
            <br />
            <br />
            <div
              className="scrolling-track"
              onMouseEnter={(e) =>
                e.currentTarget.classList.add("scrolling-paused")
              }
              onMouseLeave={(e) =>
                e.currentTarget.classList.remove("scrolling-paused")
              }
            >
              {[...displayItems]
                .filter((ele) => checkIsVideo(ele))
                .map((project, idx) => (
                  <div
                    key={`${project.id}-${idx}`}
                    className="min-w-[300px] max-w-[300px] mx-2 rounded-lg overflow-hidden shadow-lg bg-white flex flex-col items-center justify-center"
                  >
                    {project.imageSrc ? (
                      <img
                        src={project.imageSrc}
                        alt={project.title}
                        className="w-full h-[200px] object-cover"
                        loading="lazy"
                      />
                    ) : project.src ? (
                      <video
                        src={project.src}
                        controls
                        className="w-full h-[200px] object-cover bg-black"
                        poster={project.poster || undefined}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : null}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DynamicSection;
