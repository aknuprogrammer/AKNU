import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Calendar, ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { BackButton } from "../components/BackButton";

const NewsDetailModal = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm bg-black/50 animate-fade-in overscroll-contain"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div className="bg-white shadow-2xl w-full max-w-2xl border border-gray-200 flex flex-col max-h-[90vh]">
        {/* Simple Light Header */}
        <div className="relative z-10 bg-white text-gray-800 p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">News Announcement</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-white flex-1 space-y-5 overscroll-contain">
          {/* Full-width Image Display */}
          <div className="relative w-full h-64 bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden flex-shrink-0">
            <img 
              src={item.img} 
              alt={item.title} 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 bg-teal-50 text-teal-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {item.date}
            </span>
          </div>

          <h3 className="text-2xl font-bold text-gray-800 leading-snug">
            {item.title}
          </h3>

          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {item.description}
          </p>
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}api/news/?limit=all`);
        const formattedNews = response.data.data.map((e) => ({
          id: e._id,
          title: e.title,
          description: e.description || "No description available.",
          date: new Date(e.date).toLocaleDateString("en-GB"),
          img: `${import.meta.env.VITE_API_URL}api/news/file/${e._id}`,
          timestamp: new Date(e.date).getTime(),
        })).sort((a, b) => b.timestamp - a.timestamp);
        
        setNews(formattedNews);
        setFilteredNews(formattedNews);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching news:", error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    const results = news.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNews(results);
    setCurrentPage(1); // Reset page to 1 on search
  }, [searchTerm, news]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (selectedNews) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [selectedNews]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helper to generate truncated pagination items
  const getPageNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        endPage = 4;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }

      if (startPage > 2) {
        pageNumbers.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div className="px-4 sm:px-16 py-8 min-h-screen bg-white">
      <BackButton />
      
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-teal-800 tracking-tight">University News</h1>
          <p className="text-gray-500 text-sm mt-1">Stay updated with the latest happenings at Adikavi Nannaya University.</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-10">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4.5 w-4.5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search news articles..."
            className="block w-full sm:w-[350px] pl-10 pr-3 py-2.5 border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 text-sm shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-800"></div>
          </div>
        ) : (
          <div>
            {paginatedNews.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedNews.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedNews(item)}
                      className="cursor-pointer bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 flex flex-col h-full group"
                    >
                      {/* Card Image */}
                      <div className="h-48 w-full bg-gray-50 border-b border-gray-100 overflow-hidden flex items-center justify-center">
                        <img
                          src={item.img}
                          alt={item.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>

                      {/* Card Content */}
                      <div className="p-5 flex flex-col flex-1 justify-between">
                        <div>
                          {/* Date Badge */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[11px] font-bold px-2.5 py-0.5 bg-teal-50 text-teal-700 flex items-center gap-1 w-fit">
                              <Calendar className="w-3.5 h-3.5" />
                              {item.date}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-md sm:text-lg font-bold text-gray-800 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug mb-2">
                            {item.title}
                          </h3>

                          {/* Description */}
                          <p className="text-xs sm:text-sm text-gray-500 line-clamp-3 mt-1 leading-relaxed mb-4">
                            {item.description}
                          </p>
                        </div>

                        {/* Footer Link */}
                        <div className="flex justify-end pt-3 border-t border-gray-50">
                          <span className="text-xs font-bold text-teal-700 flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read Article <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center sm:justify-end gap-3 sm:gap-4 mt-12 pb-8">
                    <span className="text-xs sm:text-sm text-gray-500 font-medium whitespace-nowrap">
                      Showing {filteredNews.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredNews.length)} of {filteredNews.length} items
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`p-2.5 border text-sm font-bold flex items-center justify-center transition-colors rounded-none cursor-pointer ${
                          currentPage === 1
                            ? "border-gray-100 text-gray-300 cursor-not-allowed"
                            : "border-gray-200 text-teal-700 hover:bg-gray-50"
                        }`}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>

                      {getPageNumbers().map((page, index) => {
                        if (page === "...") {
                          return (
                            <span
                              key={`ellipsis-${index}`}
                              className="w-10 h-10 border border-gray-200 flex items-center justify-center text-gray-400 text-sm font-bold bg-white rounded-none select-none"
                            >
                              ...
                            </span>
                          );
                        }

                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 border text-sm font-bold transition-colors cursor-pointer rounded-none ${
                              currentPage === page
                                ? "bg-teal-700 text-white border-teal-700 shadow-md"
                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`p-2.5 border text-sm font-bold flex items-center justify-center transition-colors rounded-none cursor-pointer ${
                          currentPage === totalPages
                            ? "border-gray-100 text-gray-300 cursor-not-allowed"
                            : "border-gray-200 text-teal-700 hover:bg-gray-50"
                        }`}
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">No news found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* NewsDetailModal */}
      <NewsDetailModal
        isOpen={!!selectedNews}
        onClose={() => setSelectedNews(null)}
        item={selectedNews}
      />
    </div>
  );
}
