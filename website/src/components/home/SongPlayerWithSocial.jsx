import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  PlayCircle,
  PauseCircle,
  TvMinimal,
  Radio,
  Share2,
  Brain,
} from "lucide-react";

const SongPlayerWithSocial = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef(null);
  const YOUTUBE_ID = "Xcfj6Hexj9A";

  // Preload iframe on component mount
  useEffect(() => {
    // Preload the iframe immediately so it's ready when user clicks
    const preloadIframe = document.createElement("iframe");
    preloadIframe.width = "0";
    preloadIframe.height = "0";
    preloadIframe.src = `https://www.youtube.com/embed/${YOUTUBE_ID}?enablejsapi=1&origin=${window.location.origin}`;
    preloadIframe.style.display = "none";
    preloadIframe.allow = "autoplay";
    preloadIframe.title = "YouTube audio preload";
    document.body.appendChild(preloadIframe);
    iframeRef.current = preloadIframe;

    return () => {
      // Cleanup on unmount
      if (preloadIframe && preloadIframe.parentNode) {
        preloadIframe.parentNode.removeChild(preloadIframe);
      }
    };
  }, []);

  const togglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      // Update iframe src to trigger autoplay
      if (iframeRef.current) {
        iframeRef.current.src = `https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&controls=0&loop=1&playlist=${YOUTUBE_ID}&enablejsapi=1&origin=${window.location.origin}`;
      }
    } else {
      setIsPlaying(false);
      // Pause by removing autoplay
      if (iframeRef.current) {
        iframeRef.current.src = `https://www.youtube.com/embed/${YOUTUBE_ID}?enablejsapi=1&origin=${window.location.origin}`;
      }
    }
  };

  const items = [
    {
      icon: isPlaying ? (
        <PauseCircle size={22} className="text-green-600 z-10 relative" />
      ) : (
        <PlayCircle size={22} className="text-green-600 z-10 relative" />
      ),
      name: "AKNU Song",
      onClick: togglePlay,
    },
    {
      icon: (
        <Radio
          size={22}
          className="text-yellow-500 transition-transform duration-300 hover:rotate-12"
        />
      ),
      name: "Nannaya Vani",
      href: "/NannayaVani",
    },
    {
      icon: (
        <TvMinimal
          size={22}
          className="text-yellow-500 transition-transform duration-300 hover:rotate-12"
        />
      ),
      name: "AKNU YouTube",
      href: "https://www.youtube.com/channel/UCWk6lIyf9JGKx84fZCWmDyQ",
    },
    {
      icon: (
        <Brain
          size={22}
          className="text-yellow-500 transition-transform duration-300 hover:rotate-12"
        />
      ),
      name: "Share An Idea",
      href: "/share-new-idea",
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="relative group flex sm:flex-col  sm:items-center cursor-pointer"
        >
          <div className="flex justify-center items-center flex-start pr-5">
            {item.href ? (
              item.href.startsWith("http") ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex"
                >
                  {item.icon}
                </a>
              ) : (
                <Link to={item.href} className="flex">
                  {item.icon}
                </Link>
              )
            ) : (
              <div onClick={item.onClick}>{item.icon}</div>
            )}

            {/* Mobile: show name beside icon */}
            <span className="mt-2 text-xs text-center text-black sm:hidden pl-2 mb-2">
              {item.name}
            </span>
          </div>

          {/* Desktop: tooltip hover */}
          <div className="hidden sm:block absolute top-full mt-2 right-0 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition duration-200 z-50 pointer-events-none">
            {item.name}
          </div>
        </div>
      ))}

      {/* Iframe is preloaded and controlled via ref, no need to conditionally render */}
    </div>
  );
};

export default SongPlayerWithSocial;
