import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import {
  BookOpen,
  GraduationCap,
  Building2,
  Landmark,
  Ban,
  Leaf,
  FileText,
  ShieldCheck,
  Cog,
  MessageCircle,
  MapPin,
  Book,
} from "lucide-react";

import {
  AcademicSenate,
  CodeOfConductForStudents,
  CodeOfConductForTeachers,
  doa,
} from "../../assets";

import { bannerDemo1, bannerDemo2, bannerDemo4 } from "../../assets";

const placeholderImages = [bannerDemo1, bannerDemo2, bannerDemo4];

// FIRST SLIDE MUST ALWAYS BE THIS VIDEO
const FIRST_VIDEO = "/video/AKNU_College_Drone_Shot.mp4";

export default function Carousel() {
  const videoRef = useRef(null);
  const preloadVideoRef = useRef(null);

  const [items, setItems] = useState([]); // Video + Images
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [videoReady, setVideoReady] = useState(false);

  /* ------------------ UTIL: Convert Buffer to Base64 ------------------ */
  const getBase64 = (img) => {
    if (!img?.buffer?.data) return null;
    const bin = img.buffer.data.map((b) => String.fromCharCode(b)).join("");
    return `data:${img.mimetype};base64,${btoa(bin)}`;
  };

  /* ------------------ DETECT VIDEO SRC ------------------ */
  const getVideoSrc = (item) => {
    if (!item) return null;
    if (typeof item === "string" && item.endsWith(".mp4")) return item;
    if (item?.src?.endsWith?.(".mp4")) return item.src;
    if (item?.video?.endsWith?.(".mp4")) return item.video;
    if (item?.videoSrc?.endsWith?.(".mp4")) return item.videoSrc;

    const apiVideo =
      item?.mimetype?.startsWith?.("video/") ||
      item?.contentType?.startsWith?.("video/") ||
      item?.img?.mimetype?.startsWith?.("video/");

    if (apiVideo && item?._id) {
      return `${import.meta.env.VITE_API_URL}api/carousel/image/${item._id}`;
    }
    return null;
  };

  /* ------------------ DETECT IMAGE SRC ------------------ */
  const getImageSrc = (item, idx) => {
    if (!item) return placeholderImages[idx % placeholderImages.length];

    if (typeof item === "string") return item;
    if (item?.img?.buffer?.data) return getBase64(item.img);
    if (typeof item?.img === "string") return item.img;
    if (item?._id)
      return `${import.meta.env.VITE_API_URL}api/carousel/image/${item._id}`;

    return placeholderImages[idx % placeholderImages.length];
  };

  /* ------------------ FETCH ITEMS ------------------ */
  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}api/carousel`,
      );
      const apiItems = res.data.data || [];
      console.log(apiItems, "API ITEMS");

      setItems([FIRST_VIDEO, ...apiItems?.slice(0, 7)]); // Video always first slide
    } catch (e) {
      console.error(e);
      setItems([FIRST_VIDEO]); // fallback
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  /* ------------------ PRELOAD VIDEO ------------------ */
  useEffect(() => {
    const preloadVideo = preloadVideoRef.current;
    if (preloadVideo && FIRST_VIDEO) {
      preloadVideo.src = FIRST_VIDEO;
      preloadVideo.load();

      const handleCanPlay = () => {
        setVideoReady(true);
      };

      preloadVideo.addEventListener("canplaythrough", handleCanPlay);
      preloadVideo.addEventListener("loadeddata", handleCanPlay);

      return () => {
        preloadVideo.removeEventListener("canplaythrough", handleCanPlay);
        preloadVideo.removeEventListener("loadeddata", handleCanPlay);
      };
    }
  }, []);

  /* ------------------ PRELOAD VIDEO WHEN APPROACHING END ------------------ */
  useEffect(() => {
    if (!items.length) return;

    const isVideo = getVideoSrc(items[current]);
    if (isVideo) return;

    // If we're on the last image, ensure video is preloaded for smooth transition
    if (current === items.length - 1) {
      const preloadVideo = preloadVideoRef.current;
      if (preloadVideo && FIRST_VIDEO) {
        // Reload the preload video to ensure it's ready
        preloadVideo.load();
      }
    }
  }, [current, items]);

  /* ------------------ AUTO SLIDE (ONLY FOR IMAGES) ------------------ */
  useEffect(() => {
    if (!items.length) return;

    const isVideo = getVideoSrc(items[current]);
    if (isVideo) return; // Do NOT auto slide video

    const t = setTimeout(() => {
      let next = current + 1;
      if (next >= items.length) next = 0; // LOOP back to video (index 0)
      setCurrent(next);
    }, 3000);

    return () => clearTimeout(t);
  }, [current, items]);

  /* ------------------ HANDLE VIDEO END ------------------ */
  const handleVideoEnd = () => {
    if (items.length > 1) {
      setCurrent(1); // jump to first image
    }
  };

  /* ------------------ HANDLE VIDEO SWITCH ------------------ */
  useEffect(() => {
    const video = videoRef.current;
    const videoSrc = getVideoSrc(items[current]);

    if (video && videoSrc) {
      // Ensure video plays when switching to it
      const playVideo = () => {
        if (video && video.paused) {
          video.currentTime = 0;
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.log("Video play failed:", error);
            });
          }
        }
      };

      // Try to play immediately
      if (video.readyState >= 2) {
        // HAVE_CURRENT_DATA or better
        playVideo();
      } else {
        // Wait for video to load
        const handleCanPlay = () => {
          playVideo();
          video.removeEventListener("canplay", handleCanPlay);
          video.removeEventListener("loadeddata", handleCanPlay);
        };

        video.addEventListener("canplay", handleCanPlay);
        video.addEventListener("loadeddata", handleCanPlay);

        // Also try after a short delay
        const timer = setTimeout(playVideo, 200);

        return () => {
          clearTimeout(timer);
          video.removeEventListener("canplay", handleCanPlay);
          video.removeEventListener("loadeddata", handleCanPlay);
        };
      }
    }
  }, [current, items]);

  const currentItem = items[current];
  const videoSrc = getVideoSrc(currentItem);
  const imgSrc = getImageSrc(currentItem, current);

  return (
    <div>
      {/* Hidden preload video */}
      <video
        ref={preloadVideoRef}
        preload="auto"
        muted
        playsInline
        style={{ display: "none" }}
        aria-hidden="true"
      />

      {/* ------------------ TOP CAROUSEL ------------------ */}
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        {loading ? (
          <div className="w-full h-full bg-gray-200 animate-pulse"></div>
        ) : (
          <>
            {videoSrc ? (
              <video
                key={`video-${current}`}
                ref={videoRef}
                src={videoSrc}
                autoPlay
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
                onEnded={handleVideoEnd}
                onLoadedData={() => {
                  const v = videoRef.current;
                  if (v && v.paused) {
                    v.currentTime = 0;
                    v.play().catch(() => {});
                  }
                }}
                onCanPlay={() => {
                  const v = videoRef.current;
                  if (v && v.paused) {
                    v.currentTime = 0;
                    v.play().catch(() => {});
                  }
                }}
                onError={handleVideoEnd}
              />
            ) : (
              <img
                src={imgSrc}
                alt=""
                className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
                onError={(e) =>
                  (e.target.src =
                    placeholderImages[current % placeholderImages.length])
                }
              />
            )}

            {/* Prev Button */}
            <button
              onClick={() =>
                setCurrent((prev) =>
                  prev === 0 ? 1 : (prev - 1 + items.length) % items.length,
                )
              }
              className="absolute top-1/2 left-4 cursor-pointer -translate-y-1/2 text-white p-2 rounded-full bg-opacity-50 hover:bg-opacity-75"
            >
              &#8249;
            </button>

            {/* Next Button */}
            <button
              onClick={() => {
                setCurrent((prev) => (prev + 1 >= items.length ? 0 : prev + 1));
              }}
              className="absolute cursor-pointer top-1/2 right-4 -translate-y-1/2 text-white p-2 rounded-full bg-opacity-50 hover:bg-opacity-75"
            >
              &#8250;
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrent(idx);
                  }}
                  className={`w-3 h-3 rounded-full cursor-pointer ${
                    idx === current ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ------------------ QUICK LINKS (UNCHANGED) ------------------ */}
      <div className="w-full text-teal-800 flex flex-col sm:flex-row justify-between bg-gray-600 sm:items-between sm:pl-16">
        <div className="hidden sm:flex flex-col h-12 text-white pl-4">
          <h2 className="text-lg font-semibold">Campus Quick Links</h2>
          <p className="text-sm">
            Explore academic tools, resources & essential student services —
            AKNU, Rajamahendravaram
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 bg-white p-4 sm:pr-16">
          <Link
            className="group relative flex items-center gap-2 sm:flex-col sm:items-center"
            to="/lms"
          >
            <BookOpen size={20} />
            <span className="text-[0.75rem] sm:absolute sm:top-8 sm:bg-white sm:px-2 sm:py-1 sm:rounded sm:shadow sm:opacity-0 group-hover:opacity-100">
              AKNU-LMS
            </span>
          </Link>

          <a
            className="group relative flex items-center gap-2 sm:flex-col sm:items-center"
            href={doa}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Book size={20} />
            <span className="text-[0.75rem] sm:absolute sm:top-8 sm:bg-white sm:px-2 sm:py-1 sm:rounded sm:shadow sm:opacity-0 group-hover:opacity-100">
              University Brochure
            </span>
          </a>

          <a
            className="group relative flex items-center gap-2 sm:flex-col sm:items-center"
            href="https://apsche.ap.gov.in"
            target="_blank"
          >
            <Landmark size={20} />
            <span className="text-[0.75rem] sm:absolute sm:top-8 sm:bg-white sm:px-2 sm:py-1 sm:rounded sm:shadow sm:opacity-0 group-hover:opacity-100">
              APSCHE
            </span>
          </a>

          <a
            className="group relative flex items-center gap-2 sm:flex-col sm:items-center"
            href="https://www.aicte-india.org"
            target="_blank"
          >
            <Cog size={20} />
            <span className="text-[0.75rem] sm:absolute sm:top-8 sm:bg-white sm:px-2 sm:py-1 sm:rounded sm:shadow sm:opacity-0 group-hover:opacity-100">
              AICTE
            </span>
          </a>

          <Link
            className="group relative flex items-center gap-2 sm:flex-col sm:items-center"
            to="/student-affairs"
          >
            <GraduationCap size={20} />
            <span className="text-[0.75rem] sm:absolute sm:top-8 sm:bg-white sm:px-2 sm:py-1 sm:rounded sm:shadow sm:opacity-0 group-hover:opacity-100">
              Student Affairs
            </span>
          </Link>

          {/* <Link
            className="group relative flex items-center gap-2 sm:flex-col sm:items-center"
            to="/iqac"
          >
            <Building2 size={20} />
            <span className="text-[0.75rem] sm:absolute sm:top-8 sm:bg-white sm:px-2 sm:py-1 sm:rounded sm:shadow sm:opacity-0 group-hover:opacity-100">
              IQAC
            </span>
          </Link> */}

          <a
            className="group relative flex items-center gap-2 sm:flex-col sm:items-center"
            href={AcademicSenate}
            target="_blank"
          >
            <Landmark size={20} />
            <span className="text-[0.75rem] sm:absolute sm:top-8 sm:bg-white sm:px-2 sm:py-1 sm:rounded sm:shadow sm:opacity-0 group-hover:opacity-100">
              Academic Senate
            </span>
          </a>

          <Link
            className="group relative flex items-center gap-2 sm:flex-col sm:items-center"
            to="/spruha"
          >
            <Leaf size={20} />
            <span className="text-[0.75rem] sm:absolute sm:top-8 sm:bg-white sm:px-2 sm:py-1 sm:rounded sm:shadow sm:opacity-0 group-hover:opacity-100">
              SPRUHA
            </span>
          </Link>

          <a
            className="group relative flex items-center gap-2 sm:flex-col sm:items-center"
            href={CodeOfConductForStudents}
            target="_blank"
          >
            <FileText size={20} />
            <span className="text-[0.75rem] sm:absolute sm:top-8 sm:bg-white sm:px-2 sm:py-1 sm:rounded sm:shadow sm:opacity-0 group-hover:opacity-100">
              Code of Conduct for Students
            </span>
          </a>

          <a
            className="group relative flex items-center gap-2 sm:flex-col sm:items-center"
            href={CodeOfConductForTeachers}
            target="_blank"
          >
            <ShieldCheck size={20} />
            <span className="text-[0.75rem] sm:absolute sm:top-8 sm:bg-white sm:px-2 sm:py-1 sm:rounded sm:shadow sm:opacity-0 group-hover:opacity-100">
              Code of Conduct for Teachers
            </span>
          </a>

          <a
            className="group relative flex items-center gap-2 sm:flex-col sm:items-center"
            href={CodeOfConductForStudents}
            target="_blank"
          >
            <Ban size={20} />
            <span className="text-[0.75rem] sm:absolute sm:top-8 sm:bg-white sm:px-2 sm:py-1 sm:rounded sm:shadow sm:opacity-0 group-hover:opacity-100">
              Anti Ragging
            </span>
          </a>

          <Link
            className="group relative flex items-center gap-2 sm:flex-col sm:items-center"
            to="/feedback"
          >
            <MessageCircle size={20} />
            <span className="text-[0.75rem] sm:absolute sm:top-8 sm:bg-white sm:px-2 sm:py-1 sm:rounded sm:shadow sm:opacity-0 group-hover:opacity-100">
              Feedback
            </span>
          </Link>

          <Link
            className="group relative flex items-center gap-2 sm:flex-col sm:items-center"
            to="/field-tracker"
          >
            <MapPin size={20} />
            <span className="text-[0.75rem] sm:absolute sm:top-8 sm:bg-white sm:px-2 sm:py-1 sm:rounded sm:shadow sm:opacity-0 group-hover:opacity-100">
              Field Tracker
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
