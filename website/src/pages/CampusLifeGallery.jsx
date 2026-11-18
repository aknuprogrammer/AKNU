import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  X, 
  Maximize2, 
  Image as ImageIcon, 
  Video as VideoIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  ArrowRight
} from "lucide-react";
import { BASE_URL } from "../utils/url";
import { BackButton } from "../components/BackButton";

const GALLERY_URL = `${BASE_URL}/gallery`;

export default function CampusLifeGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await axios.get(GALLERY_URL);
      const sorted = (response.data.data || []).sort((a, b) => 
        (parseInt(a.alignno) || 999) - (parseInt(b.alignno) || 999)
      );
      setItems(sorted);
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === "all" || item.mediatype === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
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

  const handleNext = (e) => {
    e.stopPropagation();
    const currentIndex = filteredItems.findIndex(i => i._id === selectedItem._id);
    const nextIndex = (currentIndex + 1) % filteredItems.length;
    setSelectedItem(filteredItems[nextIndex]);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    const currentIndex = filteredItems.findIndex(i => i._id === selectedItem._id);
    const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setSelectedItem(filteredItems[prevIndex]);
  };

  // Category data with specific generated images
  const categories = [
    { 
      title: "Student Activities", 
      tag: "Engagement", 
      image: "/campus_student_activities.png" 
    },
    { 
      title: "Sports & Athletics", 
      tag: "Vigor", 
      image: "/campus_sports_athletics.png" 
    },
    { 
      title: "Campus Infrastructure", 
      tag: "Lifestyle", 
      image: "/campus_infrastructure.png" 
    },
    { 
      title: "Events & Festivals", 
      tag: "Community", 
      image: "/campus_events.png" 
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      {/* 1. HERO SECTION - VIT-AP STYLE */}
      <div className="relative h-[60vh] md:h-[75vh] w-full overflow-hidden bg-teal-900">
        <div className="absolute inset-0">
          <img 
            src="/ASI_1839.jpg.jpeg" 
            alt="Campus Life" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60"></div>
        </div>

        {/* VIT-style Curved Bottom Overlay (Teal) */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20">
          <svg className="relative block w-full h-[80px] md:h-[120px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff"></path>
          </svg>
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <span className="text-teal-400 font-bold uppercase tracking-[0.3em] mb-6 block text-sm md:text-base">
              Explore the Vibrancy
            </span>
            <h1 className="text-6xl md:text-8xl font-serif font-bold text-white mb-8 tracking-tight drop-shadow-2xl">
              Campus Life
            </h1>
            <div className="w-32 h-1 bg-teal-500 mx-auto rounded-none"></div>
          </motion.div>
        </div>

        {/* Breadcrumb / Back button */}
        <div className="absolute top-10 left-10 z-30 hidden md:block">
           <BackButton className="!text-white hover:!text-teal-300 !mb-0" />
        </div>
      </div>

      {/* 2. OVERVIEW SECTION - HIGH WHITESPACE */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#003736] mb-8 leading-tight">
            A Journey Beyond Academics
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed  mb-16 max-w-4xl mx-auto">
            At <i>Adikavi Nannaya University</i>, life is about more than just lectures. It's about building lifelong friendships, exploring new passions, and growing as an individual through a rich tapestry of cultural, sporting, and social experiences.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] md:auto-rows-[250px] grid-flow-dense gap-4 md:gap-6">
            {[
              { src: "/image (11).png", size: "col-span-1 md:col-span-2 row-span-2" },
              { src: "/image (10).png", size: "col-span-1 row-span-1" },
              { src: "/AKNU[1].png", size: "col-span-1 row-span-1" },
              { src: "/image (9).png", size: "col-span-1 row-span-2" },
              { src: "/image (8).png", size: "col-span-1 md:col-span-2 row-span-1" },
              { src: "/image (7).png", size: "col-span-1 row-span-1" },
              { src: "/image (6).png", size: "col-span-1 row-span-1" },
              { src: "/image (4).png", size: "col-span-1 md:col-span-2 row-span-2" },
              { src: "/image (3).png", size: "col-span-1 row-span-1" },
              { src: "/journey_1.jpeg", size: "col-span-1 row-span-1" },
              { src: "/journey_2.jpeg", size: "col-span-1 row-span-2" },
              { src: "/journey_3.jpeg", size: "col-span-1 md:col-span-2 row-span-1" },
              { src: "/99599.jpg.jpeg", size: "col-span-1 row-span-1" },
              { src: "/arch.jpeg", size: "col-span-1 md:col-span-2 row-span-2" }
            ].map((img, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className={`group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer bg-gray-100 ${img.size}`}
              >
                <img 
                  src={img.src} 
                  alt={`Campus Life ${index + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                {/* Elegant overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-teal-900/80 via-teal-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-6 left-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                  <div className="w-8 h-1 bg-teal-400 mb-3"></div>
                  <span className="font-serif font-bold text-lg md:text-xl tracking-wide drop-shadow-md">View Moment</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. MAIN MEDIA GALLERY - CLEAN & SHARP */}
      <section className="py-24 px-6" id="gallery">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
            <div className="max-w-xl text-left">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#003736] mb-4">
                Visual Chronicles
              </h2>
              <p className="text-gray-500 font-light">
                Browse through our curated collection of photographs and videos capturing the essence of life on campus.
              </p>
            </div>

            {/* Filter Tabs - Sharp Rectangular */}
            <div className="flex bg-gray-100 p-1 rounded-none border border-gray-200">
              {["all", "image", "video"].map((id) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={`px-8 py-3 font-bold cursor-pointer text-xs  tracking-widest transition-all duration-300 rounded-none ${
                    filter === id
                      ? "bg-teal-700 text-white shadow-lg"
                      : "text-gray-500 hover:text-teal-700"
                  }`}
                >
                  {id === "all" ? "Every Moment" : id === "image" ? "Photos" : "Videos"}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar - Sharp */}
          <div className="relative mb-12 max-w-2xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search specific events or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-white border border-gray-200 rounded-none focus:outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-700/5 transition-all text-lg font-light"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-40">
              <div className="w-16 h-16 border-4 border-teal-700 border-t-transparent animate-spin rounded-none"></div>
            </div>
          ) : (
            <div>
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
                <AnimatePresence mode="popLayout">
                  {paginatedItems.map((item) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="break-inside-avoid group relative bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                    >
                      {/* Media Wrapper */}
                      <div className="relative overflow-hidden">
                        {item.mediatype === "video" ? (
                          <div className="relative w-full">
                            <video 
                              src={`${GALLERY_URL}/image/${item._id}`}
                              preload="none"
                              className="w-full h-auto object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-14 h-14 bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                                <Play fill="currentColor" size={20} />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={`${GALLERY_URL}/image/${item._id}`}
                            alt={item.title}
                            className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110"
                          />
                        )}
                        
                        {/* Media Type Label */}
                        <div className="absolute top-0 right-0 bg-teal-700 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                           {item.mediatype}
                        </div>
                      </div>

                      {/* Simple Footer Info */}
                      <div className="p-6">
                         <h3 className="text-lg font-serif font-bold text-gray-900 mb-2 leading-tight group-hover:text-teal-700 transition-colors">
                           {item.title}
                         </h3>
                         <div className="w-8 h-0.5 bg-gray-100 group-hover:w-full group-hover:bg-teal-600 transition-all duration-500"></div>
                         {item.description && (
                           <p className="mt-3 text-gray-400 text-sm line-clamp-2 font-light">
                             {item.description}
                           </p>
                         )}
                      </div>

                      {/* Hover Centered Overlay - Optional or Minimal */}
                      <div className="absolute inset-0 bg-teal-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center sm:justify-end gap-3 sm:gap-4 mt-16 pb-8">
                  <span className="text-xs sm:text-sm text-gray-500 font-medium whitespace-nowrap font-sans">
                    Showing {filteredItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`p-3.5 border font-bold flex items-center justify-center transition-colors rounded-none cursor-pointer ${
                        currentPage === 1
                          ? "border-gray-100 text-gray-300 cursor-not-allowed"
                          : "border-gray-200 text-teal-700 hover:bg-gray-50"
                      }`}
                    >
                      <ChevronLeft className="w-3 h-3" />
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
                      className={`p-3.5 border font-bold flex items-center justify-center transition-colors rounded-none cursor-pointer ${
                        currentPage === totalPages
                          ? "border-gray-100 text-gray-300 cursor-not-allowed"
                          : "border-gray-200 text-teal-700 hover:bg-gray-50"
                      }`}
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 5. LIGHTBOX MODAL - IMMERSIVE */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] bg-black/98 backdrop-blur-sm flex items-center justify-center p-4 md:p-12"
            onClick={() => setSelectedItem(null)}
          >
            <button 
              className="absolute top-10 right-10 text-white hover:text-teal-400 transition-all z-[60] p-4 bg-white/5 rounded-none"
              onClick={() => setSelectedItem(null)}
            >
              <X size={36} />
            </button>

            {/* Navigation Navigation */}
            <button 
              className="absolute left-10 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-all z-50 p-6 hidden md:block"
              onClick={handlePrev}
            >
              <ChevronLeft size={64} strokeWidth={1} />
            </button>
            <button 
              className="absolute right-10 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-all z-50 p-6 hidden md:block"
              onClick={handleNext}
            >
              <ChevronRight size={64} strokeWidth={1} />
            </button>

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-[60vh] md:h-[75vh] flex items-center justify-center">
                {selectedItem.mediatype === "video" ? (
                  <video
                    src={`${GALLERY_URL}/image/${selectedItem._id}`}
                    controls
                    autoPlay
                    className="max-w-full max-h-full rounded-none shadow-2xl"
                  />
                ) : (
                  <img
                    src={`${GALLERY_URL}/image/${selectedItem._id}`}
                    alt={selectedItem.title}
                    className="max-w-full max-h-full object-contain rounded-none shadow-2xl"
                  />
                )}
              </div>

              {/* Modal Metadata */}
              <div className="mt-12 text-center text-white w-full max-w-3xl px-4">
                <div className="inline-block px-5 py-1 bg-teal-600/30 text-teal-400 rounded-none text-xs font-bold uppercase tracking-[0.3em] mb-6 border border-teal-500/20">
                  {selectedItem.mediatype}
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 tracking-tight">
                  {selectedItem.title}
                </h2>
                {selectedItem.description && (
                  <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
                    {selectedItem.description}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Branding */}
      <div className="fixed bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-teal-500/5 blur-[150px] pointer-events-none z-0"></div>
    </div>
  );
}
