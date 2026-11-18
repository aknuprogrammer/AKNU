import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const NotificationBar = () => {
  const [notifications, setNotifications] = useState([]);
  const scrollRef = useRef(null);
  const speedFactor = 100; // pixels per second

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      let rawData = [];
      const cached = localStorage.getItem("notifications");
      
      if (cached) {
        rawData = JSON.parse(cached);
      } else {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}api/notifications/`
        );

        rawData = response.data.data.map((event) => ({
          title: event.title,
          date: event.date,
          link: `${import.meta.env.VITE_API_URL}api/notifications/file/${event._id}`,
        }));

        localStorage.setItem("notifications", JSON.stringify(rawData));
      }

      // Filter: Show only last 30 days notifications from current day
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      // Future limit of 1 day to handle potential timezone shifts
      const futureLimit = new Date();
      futureLimit.setDate(today.getDate() + 1);

      const filtered = rawData.filter((note) => {
        const noteDate = new Date(note.date);
        return noteDate >= thirtyDaysAgo && noteDate <= futureLimit;
      });

      setNotifications(filtered);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Helper to check if date is within last 3 days from current day
  const isNew = (date) => {
    const today = new Date();
    const notificationDate = new Date(date);
    const diffTime = today - notificationDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    // Allow minor timezone buffer, up to 3 days
    return diffDays >= -1 && diffDays <= 3;
  };

  // Dynamic animation duration based on scroll width
  const [duration, setDuration] = useState(20);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollWidth = scrollRef.current.scrollWidth / 2; // only the original list width
      const containerWidth = scrollRef.current.offsetWidth;
      const distance = scrollWidth + containerWidth;
      const durationSeconds = distance / speedFactor;
      setDuration(durationSeconds);
    }
  }, [notifications]);

  return (
    <div className="bg-gray-600 text-white flex items-center overflow-hidden shadow-md">
      {/* Notifications Label */}
      <div
        className="relative flex items-center px-8 py-3 text-white font-bold text-base flex-shrink-0"
        style={{
          backgroundColor: "#fcc203",
          clipPath:
            "polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%, 20px 50%)",
          width: "180px",
          marginLeft: "10px",
          marginRight: "10px",
        }}
      >
        Notifications
      </div>

      {/* Scrolling Notifications */}
      <div className="relative flex overflow-hidden w-full pl-30">
        <div
          ref={scrollRef}
          className="flex whitespace-nowrap animate-scroll"
          style={{
            animationDuration: `${duration}s`,
          }}
        >
          {/* Single loop of notifications */}
          {notifications.length > 0 &&
            notifications.map((note, idx) => (
              <a
                href={note.link}
                key={idx}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 text-sm font-medium hover:underline relative"
              >
                <span className="mr-2 text-yellow-300">•</span>
                <span className="flex items-center gap-2 relative">
                  <span>
                    {new Date(note.date).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })} :: {note.title}
                  </span>
                  {isNew(note.date) && (
                    <span className="absolute -top-2.5 -right-6 px-1 py-[0.6px] text-[9px] sm:text-[11px] bg-red-400 animate-pulse rounded-sm text-yellow-300 font-bold">
                      New
                    </span>
                  )}
                </span>
              </a>
            ))}
        </div>
      </div>

      {/* Tailwind CSS Styles */}
      <style>
        {`
          @keyframes scroll {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-scroll {
            animation-name: scroll;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
          }
        `}
      </style>
    </div>
  );
};

export default NotificationBar;

