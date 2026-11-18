import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Squares2X2Icon as SquaresIcon, 
  ListBulletIcon as ListIcon, 
  MagnifyingGlassIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  UserIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  EyeIcon,
  CheckIcon,
  DocumentPlusIcon
} from "@heroicons/react/24/outline";
import { useLetterHeadHook } from "../../Hooks/LetterHeadHook";
import RequestLetterForm from "./components/RequestLetterForm";
import { API, BASE_URL } from "../../config/urls";
import { showErrorMessage, showSuccessMessage } from "../../config/Toast";

// Modern custom dropdown
const CustomSelect = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const selected = options.find(o => o.value === value);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center justify-between gap-2 pl-3 pr-2.5 py-2 bg-white border rounded-lg text-sm font-medium text-gray-700 transition-all min-w-[150px] ${
          open ? 'border-[#525B88] ring-2 ring-[#525B88]/10' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <span>{selected?.label || 'Select'}</span>
        <ChevronDownIcon className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-50 bg-white border border-gray-100 rounded-xl shadow-xl min-w-full" style={{minWidth: '190px'}}>
          <div className="py-1 max-h-56 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm transition-all duration-150 text-left ${
                  opt.value === value
                    ? 'bg-[#525B88] text-white font-semibold'
                    : 'text-gray-700 hover:bg-[#525B88]/10 hover:text-[#525B88]'
                }`}
              >
                <span>{opt.label}</span>
                {opt.value === value && <CheckIcon className="h-3.5 w-3.5 text-white shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const getRecipientLabel = (code) => {
  const roles = {
    "1": "Admin", "2": "Vice Chancellor", "3": "Registrar", "4": "Principal", 
    "5": "CDC", "6": "Controller of Examinations", "7": "Finance Officer", "8": "Director", 
    "9": "Dean", "10": "Others"
  };
  return roles[code] || "Staff";
};

const LazyPreview = ({ letter, BASE_URL }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-white overflow-hidden shadow-sm shadow-black/5 relative">
      {letter.status === 'disabled' && (
        <div className="absolute inset-0 z-20 bg-gray-50/20 backdrop-blur-sm flex items-center justify-center">
          <span className="bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-[0.2em] shadow-lg shadow-red-500/20">Disabled</span>
        </div>
      )}
      
      {!isLoaded && isVisible && (
        <div className="absolute inset-0 z-10 bg-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
             <div className="w-6 h-6 border-2 border-[#525B88]/20 border-t-[#525B88] rounded-full animate-spin"></div>
             <span className="text-[8px] font-black text-[#525B88]/40 uppercase tracking-widest">Loading...</span>
          </div>
        </div>
      )}
      
      {isVisible ? (
        letter.thumbnail ? (
          <img
            src={letter.thumbnail}
            alt={letter.title}
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover object-top transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
          />
        ) : letter.file?.contentType?.includes("image") ? (
          <img
            src={`${BASE_URL}/letters/${letter._id}/file`}
            alt={letter.title}
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover object-top transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
          />
        ) : (
          <iframe
            src={`${BASE_URL}/letters/${letter._id}/file#view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
            title={letter.title}
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full border-0 pointer-events-none scale-[1.02] origin-top overflow-hidden transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            scrolling="no"
            loading="lazy"
            style={{
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              border: 'none',
            }}
          />
        )
      ) : (
        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
           <DocumentTextIcon className="h-8 w-8 text-gray-200" />
        </div>
      )}
    </div>
  );
};

export default function AvailableTemplates({ showRequestActions = true, showDownloadActions = true, showWriteAction = true, showAll = false }) {
  const navigate = useNavigate();
  const { letters, userRequests, handleDownloadApproved, isProcessing, getUserRequests, getLetterHeads, isInitialLoading, downloadGeneratedLetterPdf } = useLetterHeadHook();
  const role = localStorage.getItem("role")?.toLowerCase();
  const isPrivileged = ["admin", "super_admin", "vc", "registrar"].includes(role);
  const loading = isInitialLoading;
  const [viewMode, setViewMode] = useState("list"); // "grid" | "list"
  const [actionLoading, setActionLoading] = useState({ id: null, type: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all" | "created" | "uploaded"
  const [statusFilter, setStatusFilter] = useState("all");
  const [displayStatus, setDisplayStatus] = useState("active"); // Fixed default to hide disabled by default
  const [selectedCards, setSelectedCards] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const filteredLetters = letters?.filter(letter => {
    const searchStr = `${letter.title} ${getRecipientLabel(letter.letterCode)} ${letter.uploadedBy}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
    
    const type = letter.type || "uploaded";
    const matchesTab = activeTab === "all" || type === activeTab;
    const matchesStatus = statusFilter === "all" || String(letter.letterCode) === statusFilter;
    
    let matchesDisplay = true;
    if (displayStatus === "active") matchesDisplay = letter.status !== "disabled";
    else if (displayStatus === "disabled") matchesDisplay = letter.status === "disabled";

    return matchesSearch && matchesTab && matchesStatus && matchesDisplay;
  });

  const counts = {
    all: letters?.filter(l => l.status !== "disabled").length || 0,
    created: letters?.filter(l => l.type === "created" && l.status !== "disabled").length || 0,
    uploaded: letters?.filter(l => (l.type || "uploaded") === "uploaded" && l.status !== "disabled").length || 0
  };

  const paginatedLetters = filteredLetters?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil((filteredLetters?.length || 0) / itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, activeTab, statusFilter]);
  // --- AUTOMATIC REFRESHES REMOVED BY USER REQUEST ---
  /*
  useEffect(() => { 
    if(getUserRequests) getUserRequests(true); // Force refresh on mount for approvals
    if(getLetterHeads) getLetterHeads(showAll);
  }, [showAll]);
  */


  const handleViewFile = async (letter) => {
    const letterId = letter?._id;
    if (!letterId) return;
    const req = getRequestForLetter(letterId);
    if (!isPrivileged && req?.status !== "approved") {
      showErrorMessage("View requires administrative approval.");
      return;
    }
    const newWin = window.open("", "_blank");
    if (!newWin) {
      showErrorMessage("Pop-up blocked! Please allow pop-ups for this site.");
      return;
    }

    newWin.document.write(`
      <html>
        <head><title>Loading Document...</title></head>
        <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; color:#525B88; background:#f8fafc;">
          <div style="width:50px; height:50px; border:4px solid #f3f3f3; border-top:4px solid #525B88; border-radius:50%; animation:spin 1s linear infinite; margin-bottom:20px;"></div>
          <p style="font-weight:bold; letter-spacing:0.05em; text-transform:uppercase; font-size:12px; margin:0;">Institutional Portal</p>
          <p style="font-size:14px; color:#64748b; margin-top:8px;">Generating PDF Preview...</p>
          <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        </body>
      </html>
    `);

    try {
      setActionLoading({ id: letterId, type: "view" });
      const letterType = letter.type || "uploaded";
      if (letterType === "created") {
        const ref = req?.requestId || req?.refNo || "";
        const { blob } = await downloadGeneratedLetterPdf(letterId, ref, false);
        const url = URL.createObjectURL(blob);
        newWin.location.href = url;
        return;
      }
      
      const response = await API.get(`/letters/${letterId}/file`, {
        responseType: "arraybuffer",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      newWin.location.href = url;
    } catch (error) {
      if (newWin) newWin.close();
      console.error("Error viewing file:", error);
      showErrorMessage("Failed to load document");
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  const handleDownloadClick = (letter) => {
    if (!showRequestActions) return;
    setSelectedCards([letter]);
    setShowRequestModal(true);
  };

  const getRequestForLetter = (letterId) => {
    if (!letterId || !userRequests?.length) return null;
    const searchId = String(letterId);
    
    // Normalize and filter requests
    const matching = userRequests.filter((r) => {
      const ids = r?.letterIds || [];
      return ids.some((x) => {
        if (!x) return false;
        // x can be a populated object {_id: ...} or a raw string ID
        const idVal = String(typeof x === "object" ? (x?._id || x?.id || x) : x);
        return idVal === searchId;
      });
    });
    
    if (!matching.length) return null;
    
    const sorted = [...matching].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // ALGORITHM: Prioritize the 'Approved' and 'Unused' request if multiple exist
    const bestRequest = sorted.find(r => r.status === "approved" && !r.isUsed) 
                    || sorted.find(r => r.status === "approved")
                    || sorted[0];
    
    return bestRequest;
  };

  const handleApprovedDownload = async (letterId) => {
    const req = getRequestForLetter(letterId);
    if (!req || req.status !== "approved") return;
    await handleDownloadApproved(req);
    // Requests may update after download in some setups; refresh quietly.
    try { await getUserRequests(); } catch {}
  };

  return (
    <div className="w-full space-y-3">
      {/* Header Section */}
      {/* <div className="mb-5 border-[#525B88]">
        <h2 className="text-xl font-bold text-[#525B88]">Available Templates</h2>
        <p className="text-gray-600">Browse and request official institutional letterhead designs from the university library.</p>
      </div> */}

      {/* Filtering Section */}
      <div className="bg-white border border-gray-300 shadow-sm p-1.5 rounded-lg flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="w-full md:w-72 relative">
          <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#525B88] focus:ring-2 focus:ring-[#525B88]/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters right-aligned */}
        <div className="flex-1 flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={() => {
              getLetterHeads(true);
              getUserRequests(true);
              showSuccessMessage("Refreshing template library...");
            }}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:text-[#525B88] hover:border-[#525B88]/30"
            }`}
            title="Refresh Library"
          >
            <ArrowPathIcon className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <CustomSelect
            value={activeTab}
            onChange={setActiveTab}
            options={[
              { label: `All (${counts.all})`, value: 'all' },
              { label: `Created (${counts.created})`, value: 'created' },
              { label: `Uploaded (${counts.uploaded})`, value: 'uploaded' },
            ]}
          />
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'All Recipients', value: 'all' },
              ...Object.entries({
                "1": "Admin", "2": "Vice Chancellor", "3": "Registrar", "4": "Principal",
                "5": "CDC", "6": "Controller of Examinations", "7": "Finance Officer", "8": "Director",
                "9": "Dean", "10": "Others"
              }).map(([code, label]) => ({ label, value: code }))
            ]}
          />
          {/* View Toggle */}
          <div className="flex border border-slate-200 rounded-lg overflow-hidden shrink-0 shadow-sm bg-white">
            <button
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`px-3 md:px-4 py-2 text-[10px] md:text-xs font-medium transition-colors border-r border-[#525B88]/20 ${
                viewMode === "grid" ? "bg-[#525B88] text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <SquaresIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              title="List View"
              className={`px-3 md:px-4 py-2 text-[10px] md:text-xs font-medium transition-colors border-l border-[#525B88]/20 ${
                viewMode === "list" ? "bg-[#525B88] text-white" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedLetters?.map((letter) => (
            <div 
              key={letter._id} 
              className={`group bg-white rounded-lg border border-gray-200 p-3 flex flex-col transition-all duration-300 hover:shadow-lg hover:border-[#525B88]/20 hover:translate-y-[-2px] ${letter.status === 'disabled' ? 'opacity-60 grayscale-[0.5]' : ''}`}
            >
              {/* Header with title and date */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 line-clamp-1 text-sm group-hover:text-[#525B88] transition-colors">{letter.title}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <UserIcon className="h-3 w-3 text-gray-400" />
                    <span className="text-[10px] text-gray-500 font-medium">By {(letter.uploadedBy && letter.uploadedBy !== "undefined") ? letter.uploadedBy : "Admin"}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                    {new Date(letter.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>

              {/* Preview Area */}
              <div className="h-28 rounded-lg overflow-hidden mb-3 bg-white relative group/preview">
                <LazyPreview letter={letter} BASE_URL={BASE_URL} />
              </div>

              {/* Footer Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-auto">
                <div className="flex items-center gap-2 ml-auto">
                  {showDownloadActions && (() => {
                    const req = getRequestForLetter(letter._id);
                    const canDownload = req?.status === "approved" && letter.status !== "disabled" && !req.isUsed;
                    return (
                        <button
                          onClick={() => handleApprovedDownload(letter._id)}
                          className={`p-1.5 rounded transition-all ${
                            canDownload
                              ? "text-[#525B88] hover:bg-gray-100"
                              : "text-gray-300 cursor-not-allowed"
                          }`}
                          title={req?.isUsed ? "Already Downloaded" : (canDownload ? "Download" : "Download (Approved only)")}
                          disabled={!canDownload || isProcessing}
                        >
                          { (isProcessing === letter._id) && req?.status === "approved" ? (
                            <div className="w-4 h-4 border-2 border-[#525B88]/20 border-t-[#525B88] rounded-full animate-spin" />
                          ) : (
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          )}
                        </button>


                    );
                  })()}
                  {showRequestActions && (
                    <button
                      onClick={() => { if(letter.status !== 'disabled') handleDownloadClick(letter); }}
                      className={`p-1.5 rounded transition-all ${
                        letter.status === 'disabled' ? 'text-gray-300 cursor-not-allowed' : 'text-[#525B88] hover:bg-gray-100'
                      }`}
                      title="Request Approval"
                      disabled={letter.status === 'disabled'}
                    >
                      <ClockIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-auto max-h-[500px] w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="min-w-[1050px] min-w-full divide-y divide-gray-200">
              <thead className="bg-[#525b88] sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">Template Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">Whome to create</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">Created Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">Uploader</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">System IP</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedLetters?.map((letter) => (
                  <tr key={letter._id} className={`hover:bg-gray-50 transition-colors ${letter.status === 'disabled' ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <DocumentTextIcon className="h-5 w-5 text-[#525b88]/40 shrink-0" />
                        <span className="whitespace-nowrap">{letter.title || "Untitled"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{getRecipientLabel(letter.letterCode)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap uppercase tracking-tight">{new Date(letter.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{(letter.uploadedBy && letter.uploadedBy !== "undefined") ? letter.uploadedBy : "Admin"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap font-mono text-[11px]">{letter.systemIp || "-"}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                          {showWriteAction && (
                            <button 
                              onClick={() => { if(letter.status !== 'disabled') navigate(`/generate-letter?templateId=${letter._id}`); }}
                              className={`p-1.5 rounded transition-all ${
                                letter.status === 'disabled' ? 'text-gray-300 cursor-not-allowed' : 'text-orange-600 hover:bg-orange-50'
                              }`}
                              title="Write Letter"
                              disabled={letter.status === 'disabled'}
                            >
                              <DocumentPlusIcon className="h-5 w-5" />
                            </button>
                          )}
                          
                          <button 
                            onClick={() => handleViewFile(letter)} 
                            className={`p-1.5 rounded transition-colors ${(actionLoading.id === letter._id && actionLoading.type === 'view') ? 'text-blue-400 animate-pulse' : 'text-blue-600 hover:bg-blue-50'}`} 
                            title="View"
                            disabled={actionLoading.id === letter._id}
                          >
                            {(actionLoading.id === letter._id && actionLoading.type === 'view') ? (
                              <div className="w-5 h-5 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                            ) : (
                              <EyeIcon className="w-5 h-5" />
                            )}
                          </button>
                        
                        {showDownloadActions && (() => {
                          const req = getRequestForLetter(letter._id);
                          const canDownload = req?.status === "approved" && letter.status !== "disabled" && !req.isUsed;
                          return (
                            <button
                              onClick={() => handleApprovedDownload(letter._id)}
                              className={`p-1.5 rounded transition-colors ${
                                canDownload
                                  ? "text-[#525B88] hover:bg-gray-100"
                                  : "text-gray-300 cursor-not-allowed"
                              }`}
                              title={req?.isUsed ? "Already Downloaded" : (canDownload ? "Download" : "Download (Approved only)")}
                              disabled={!canDownload || isProcessing}
                            >
                              {(isProcessing === letter._id) && req?.status === "approved" ? (
                                <div className="w-5 h-5 border-2 border-[#525B88]/20 border-t-[#525B88] rounded-full animate-spin" />
                              ) : (
                                <ArrowDownTrayIcon className="w-5 h-5" />
                              )}
                            </button>


                          );
                        })()}
                        {showRequestActions && (
                          <button 
                            onClick={() => { if(letter.status !== 'disabled') handleDownloadClick(letter); }} 
                            className={`p-1.5 rounded transition-colors ${letter.status === 'disabled' ? 'text-gray-300 cursor-not-allowed' : 'text-[#525B88] hover:text-[#3a4166]'}`}
                            title="Request Approval"
                            disabled={letter.status === 'disabled'}
                          >
                            <ClockIcon className="w-5 h-5" />
                          </button>
                        )}
                        
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-gray-900">{Math.min(currentPage * itemsPerPage, filteredLetters?.length || 0)}</span> of <span className="text-gray-900">{filteredLetters?.length}</span> results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 disabled:opacity-30 transition-all font-sans"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === i + 1 ? "bg-[#525B88] text-white shadow-md shadow-[#525B88]/20" : "text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 disabled:opacity-30 transition-all font-sans"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showRequestActions && showRequestModal && (
        <RequestLetterForm
          selectedCards={selectedCards}
          setSelectedCards={setSelectedCards}
          setShowRequestModal={setShowRequestModal}
          onRequestSuccess={() => getUserRequests()}
        />
      )}
    </div>
  );
}

