import React, { useEffect, useState } from "react";
import axios from "axios";
import { FileText } from "lucide-react";
import { BackButton } from "./BackButton";

function CircularsApplications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const BASE_URL = import.meta.env.VITE_API_URL;
        const endpoint = `${BASE_URL}api/info/circulars_applications/all`;

        const cached = localStorage.getItem("circulars_applications");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (isMounted) setItems(parsed);
          setLoading(false);
        }

        const res = await axios.get(endpoint);
        const data = res?.data?.data || res?.data || [];

        const processed = (Array.isArray(data) ? data : [])
          .map((ele) => {
            const dateStr = (ele?.date || ele?.createdAt || "").toString();
            const date = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;

            let url = ele?.url || "#";
            if (!url) url = "#";

            if ((!ele?.url || ele?.file) && ele?._id) {
              url = `${BASE_URL}api/info/circulars_applications/file/view/${ele._id}`;
            }

            return {
              date,
              title: ele?.title || "Untitled",
              url,
              timestamp: date ? new Date(date).getTime() : 0,
            };
          })
          .sort((a, b) => b.timestamp - a.timestamp);

        if (isMounted) {
          setItems(processed);
          localStorage.setItem("circulars_applications", JSON.stringify(processed));
        }
      } catch (err) {
        console.error("Failed to load circulars_applications:", err);
        if (isMounted) setError("Failed to load data. Please try again later.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return (
    <section className="w-full px-4 sm:px-8 md:px-16 pt-10 sm:pt-12">
      <BackButton />
      <div className="mb-6 border rounded-lg border-rose-100">
        <div className="flex items-center gap-2 px-4 py-3 border-b bg-[#21605A] text-white">
          <FileText className="w-5 h-5 text-white" />
          <h2 className="text-lg sm:text-xl font-semibold text-white">Circulars / Applications</h2>
        </div>

        <div className="px-4 py-4">
          {loading && <div className="text-sm text-gray-600">Loading...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
          {!loading && !error && (
            <ul className="space-y-4">
              {items.map((item, idx) => {
                const itemDate = item.date ? new Date(item.date) : null;
                const isNew = itemDate && itemDate >= sevenDaysAgo;
                return (
                  <li key={idx} className="text-sm sm:text-base">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#21605A] hover:underline flex items-center gap-2"
                    >
                      {item.date && (
                        <span className="text-xs sm:text-sm mr-2">[{item.date}]</span>
                      )}
                      <span className="text-[15px] sm:text-[16px]">{item.title}</span>
                      {isNew && (
                        <span className="ml-1 px-2 py-[2px] text-[10px] sm:text-xs font-semibold text-white bg-red-500 rounded-full animate-pulse shadow">new</span>
                      )}
                    </a>
                  </li>
                );
              })}
              {items.length === 0 && (
                <li className="text-sm text-gray-600">No records found.</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default CircularsApplications;
