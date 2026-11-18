import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLetterHeadHook } from "../../Hooks/LetterHeadHook";
import GeneratedLetters from "./GeneratedLetters";
import {
  Printer,
  Download,
  FileText,
  Settings,
  Save,
  ChevronLeft,
  Info,
  Plus,
  Minus,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Header from "./editor/Header";
import Footer from "./editor/Footer";
import { API, BASE_URL } from "../../config/urls";
import { showErrorMessage, showSuccessMessage } from "../../config/Toast";

// Helper component for a single page
const Page = ({
  template,
  content,
  subject,
  refNo,
  date,
  time,
  greetings,
  closingText,
  signatureName,
  isFirstPage = false,
  isLastPage = false,
  pageSize = "A4",
  margins = { top: 0, bottom: 0, left: 1, right: 1 },
  pageNumber,
  totalPages,
  isPreview = false,
}) => {
  if (!template) return null;

  const getRecipientLabel = (code) => {
    const roles = {
      1: "Admin",
      2: "VC",
      3: "Register",
      4: "Principal",
      5: "CDC",
      6: "COE",
      7: "Finance Officer",
      8: "Director",
      9: "Dean",
      10: "Others",
    };
    return roles[code] || "Staff";
  };

  const processLogo = (logoSrc) => {
    if (!logoSrc) return null;
    if (logoSrc.startsWith("data:") || logoSrc.startsWith("http"))
      return logoSrc;
    // Remove /api from BASE_URL for static assets
    const cleanBaseUrl = BASE_URL.split("/api")[0];
    return `${cleanBaseUrl}/${logoSrc}`;
  };

  const processArrayField = (fieldValue) => {
    if (!fieldValue) return [];
    if (Array.isArray(fieldValue)) return fieldValue;
    if (typeof fieldValue === "string" && fieldValue.includes(" | ")) {
      return fieldValue.split(" | ").map((s) => s.trim());
    }
    return [fieldValue];
  };

  const headerData = {
    logo: processLogo(template.logo),
    title: template.title,
    description: processArrayField(template.description || template.subTitle),
    email: template.email,
    phone: template.phone,
    layout: template.layout || "1",
    recipient: getRecipientLabel(template.letterCode),
    showRecipient: true,
  };

  const footerText = processArrayField(template.footerText) || [
    "Official Letterhead of Adikavi Nannaya University",
  ];
  const width = pageSize === "A4" ? "210mm" : "8.5in";
  const height = pageSize === "A4" ? "297mm" : "11in";

  return (
    <div
      className="bg-white border border-gray-100 shadow-sm relative mb-2 overflow-hidden print:border-none print:shadow-none print:m-0"
      style={{
        width: width,
        height: height,
        padding: `${margins.top}cm ${margins.right}cm ${margins.bottom}cm ${margins.left}cm`,
        fontFamily: "'Times New Roman', serif",
        overflow: "hidden",
        color: "#000000",
        boxSizing: "border-box",
      }}
    >
      <div className="flex flex-col h-full min-h-[inherit]">
        {isFirstPage && (
          <div className="mb-0">
            <Header {...headerData} />
          </div>
        )}

        <div className={`flex-1 flex flex-col pt-0 overflow-hidden`}>
          {isFirstPage && (
            <div className="mb-4 mt-4" style={{ fontFamily: "'Times New Roman', serif" }}>
              <div className="flex justify-between items-start w-full text-[10.5pt] text-black mb-4">
                <div>{!isPreview && (refNo ? `Ref No: ${refNo}` : "")}</div>
                <div>Date: {date}{time ? `, ${time}` : ""}</div>
              </div>

              {subject && (
                <div style={{ marginBottom: "24px", fontSize: "12pt", color: "#000000", display: "flex", gap: "8px", borderBottom: "0.5px solid #eee", pb: "4px" }}>
                  <span style={{ fontWeight: "700", whiteSpace: "nowrap" }}>Subject:</span>
                  <span style={{ flex: 1, fontWeight: "500" }}>{subject}</span>
                </div>
              )}

              <div style={{ marginBottom: "16px" }}>
                <p style={{ fontSize: "12pt", color: "#000000", fontWeight: "500" }}>
                  {greetings}
                </p>
              </div>
            </div>
          )}

          <div
            className="text-[12pt] leading-relaxed text-justify text-black ql-editor !p-0 !min-h-0"
            style={{ fontFamily: "'Times New Roman', serif", flex: 1 }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "25px", fontFamily: "'Times New Roman', serif" }}>
          <div style={{ marginLeft: "auto", width: "fit-content", textAlign: "right", paddingRight: "16px" }}>
            <p style={{ fontSize: "11.5pt", color: "#000000"}}>
              {closingText || "With Regards,"}
            </p>
          </div>
          
          <div style={{ marginLeft: "auto", width: "fit-content", textAlign: "right", paddingRight: "24px", paddingBottom: "12px" }}>
            <div style={{ paddingTop: "8px", minWidth: "220px", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <p style={{ fontSize: "12pt", color: "#000000", marginBottom: "4px"}}>
                {signatureName || "\u00A0"}
              </p>
              <div style={{ width: "100%", paddingTop: "6px" }}>
                <p style={{ fontSize: "8pt", fontWeight: "700", color: "#000000", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "sans-serif", textAlign: "right" }}>
                  Authorised Signature
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-1">
          <Footer footerText={footerText} />
        </div>
      </div>
    </div>
  );
};

const GenerateLetterContent = () => {
  const navigate = useNavigate();
  const { letters, userRequests, getUserRequests, getLetterDetails, getTemplateDetails, refreshCreatedLetters } = useLetterHeadHook();

  const [refreshKey, setRefreshKey] = useState(0);
  const previewViewportRef = useRef(null);
  const previewMeasureRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewViewportHeight, setPreviewViewportHeight] = useState(null);
  const previewZoomOutFactor = 0.8;
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [searchParams] = useSearchParams();
  const urlTemplateId = searchParams.get("templateId");
  const urlLetterId = searchParams.get("letterId");
  const urlOverrideRef = searchParams.get("overrideRef");
  const showRef = searchParams.get("showRef") === "true";
  const isPreview = searchParams.get("view") === "preview";
  const isSilentPDF = searchParams.get("view") === "pdf" && searchParams.get("silent") === "true";
  const viewMode = isPreview || isSilentPDF;

  const [letterId, setLetterId] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const isLoadingLetter = useRef(false);

  const [formData, setFormData] = useState({
    subject: "",
    pageSize: "A4",
    refNo: "",
    date: new Date().toLocaleDateString("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: new Date()
      .toLocaleTimeString("en-GB", {
        timeZone: "Asia/Kolkata",
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(/AM|PM/gi, (m) => m.toLowerCase()),
    greetings: "",
    contents: ["<p></p>"],
    pageMargins: {
      default: { top: 1, right: 1, bottom: 1, left: 1 },
      0: { top: 0, right: 1, bottom: 1, left: 1 },
    },
    closingText: "",
    signatureName: "",
    logo: "",
    title: "",
    description: "",
    email: "",
    phone: "",
    footerText: "",
    layout: "1",
  });
  const currentMargins =
    formData.pageMargins[currentPage] || formData.pageMargins.default;

  useEffect(() => {
    // Add tooltips to Quill toolbar icons
    const toolbar = document.querySelector(".ql-toolbar");
    if (toolbar) {
      const tooltips = {
        ".ql-bold": "Bold",
        ".ql-italic": "Italic",
        ".ql-underline": "Underline",
        '.ql-list[value="ordered"]': "Numbered",
        '.ql-list[value="bullet"]': "Bullet",
        ".ql-align": "Align",
        ".ql-color": "Color",
        ".ql-size": "Size",
        ".ql-font": "Font",
        ".ql-clean": "Clear",
      };
      Object.entries(tooltips).forEach(([selector, text]) => {
        const el = toolbar.querySelector(selector);
        if (el) el.setAttribute("title", text);
      });
    }
  }, [currentPage]); // Re-run when page changes to ensure toolbar is patched

  useEffect(() => {
    // Remove the app/page scrollbar while this screen is open
    const body = document.body;
    const html = document.documentElement;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    return () => {
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
    };
  }, []);

  const componentRef = useRef();
  const printRef = useRef();
  const [pages, setPages] = useState([]);

  useEffect(() => {
    setPages(formData.contents);
  }, [formData.contents]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Letter_${formData.refNo}`,
  });

  const downloadStarted = useRef(false);
  const handleDownloadPDF = async (silent = false) => {
    if (!printRef.current || isDownloading || downloadStarted.current) return;
    try {
      downloadStarted.current = true;
      setIsDownloading(true);
      if (!silent) {
        showSuccessMessage(
          "Initiating Export... Measuring institutional Layout.",
        );
      }

      // Ensure all styles, images, and fonts are fully painting
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const isA4 = formData.pageSize === "A4";
      const pWidth = isA4 ? 210 : 215.9;
      const pHeight = isA4 ? 297 : 279.4;

      // jsPDF setup
      const pdf = new jsPDF("p", "mm", formData.pageSize.toLowerCase());

      const pageElements =
        printRef.current.querySelectorAll("[data-page-index]");

      if (!pageElements || pageElements.length === 0) {
        throw new Error("Target document structure not found.");
      }

      for (let i = 0; i < pageElements.length; i++) {
        const element = pageElements[i];
        if (!element) continue;

        console.log(`[PDF] Capturing Page ${i + 1}...`);
        try {
          // Workaround: html2canvas can't parse modern CSS color functions (e.g. oklch()/oklab()).
          // We tag nodes in the original subtree, then in onclone we inline computed RGB(A)
          // colors onto the cloned nodes so html2canvas never sees oklch().
          const tagged = [];
          const tagSubtree = (root) => {
            const all = [root, ...root.querySelectorAll("*")];
            for (let k = 0; k < all.length; k++) {
              const n = all[k];
              const id = `h2c-${i}-${k}-${Math.random().toString(16).slice(2)}`;
              n.setAttribute("data-h2c-id", id);
              tagged.push(n);
            }
          };

          const cleanupTags = () => {
            for (let k = 0; k < tagged.length; k++) {
              try {
                tagged[k].removeAttribute("data-h2c-id");
              } catch {
                // ignore
              }
            }
          };

          tagSubtree(element);

          const canvas = await html2canvas(element, {
            scale: 2, // Stable quality for A4
            useCORS: true,
            allowTaint: false,
            logging: false,
            backgroundColor: "#ffffff",
            scrollX: 0,
            scrollY: 0,
            // (Removed fixed width/height to allow automatic detection from A4 page style)
            onclone: (clonedDoc) => {
              const el = clonedDoc.querySelector(`[data-page-index="${i}"]`);
              if (el) {
                // Ensure the cloned element fits the capture area exactly
                el.style.width = isA4 ? "794px" : "816px";
                el.style.height = isA4 ? "1123px" : "1056px";
                el.style.opacity = "1";
                el.style.visibility = "visible";
                el.style.position = "static";
                el.style.display = "block";
                el.style.margin = "0";
                el.style.padding = "0";
              }

              // Ensure container doesn't shift
              const container = clonedDoc.getElementById(
                "pdf-export-container",
              );
              if (container) {
                container.style.cssText = "opacity: 1 !important; visibility: visible !important; left: 0; top: 0; position: absolute; z-index: 9999 !important;";
              }

              // Inline computed colors from the *original* DOM onto the cloned DOM.
              // Computed styles are typically rgb()/rgba() even if authored in oklch().
              try {
                if (!el) return;

                const colorProps = [
                  "color",
                  "backgroundColor",
                  "borderTopColor",
                  "borderRightColor",
                  "borderBottomColor",
                  "borderLeftColor",
                  "outlineColor",
                  "textDecorationColor",
                  "caretColor",
                ];

                const originalNodes = element.querySelectorAll("[data-h2c-id]");
                for (let idx = 0; idx < originalNodes.length; idx++) {
                  const origNode = originalNodes[idx];
                  const id = origNode.getAttribute("data-h2c-id");
                  if (!id) continue;
                  const cloneNode = clonedDoc.querySelector(
                    `[data-h2c-id="${id}"]`,
                  );
                  if (!cloneNode) continue;

                  const cs = window.getComputedStyle(origNode);
                  for (let p = 0; p < colorProps.length; p++) {
                    const prop = colorProps[p];
                    const val = cs[prop];
                    if (val) cloneNode.style[prop] = val;
                  }
                }

                // As a last resort, strip literal oklch()/oklab() occurrences from <style> and inline styles.
                const styleElements = clonedDoc.getElementsByTagName("style");
                for (let j = 0; j < styleElements.length; j++) {
                  const inner = styleElements[j].innerHTML || "";
                  if (inner.includes("oklch") || inner.includes("oklab")) {
                    styleElements[j].innerHTML = styleElements[
                      j
                    ].innerHTML.replace(/okl(ch|ab)\([^)]+\)/g, "#000000");
                  }
                }
                const oklInline = clonedDoc.querySelectorAll(
                  '[style*="oklch"], [style*="oklab"]',
                );
                oklInline.forEach((n) => {
                  const s = n.getAttribute("style");
                  if (s)
                    n.setAttribute(
                      "style",
                      s.replace(/okl(ch|ab)\([^)]+\)/g, "#000000"),
                    );
                });
              } catch (patchErr) {
                console.warn("[PDF] Style patch failed:", patchErr);
              }
            },
          });

          cleanupTags();

          const imgData = canvas.toDataURL("image/jpeg", 1.0);
          if (i > 0) pdf.addPage();
          pdf.addImage(
            imgData,
            "JPEG",
            0,
            0,
            pWidth,
            pHeight,
            undefined,
            "FAST",
          );
        } catch (canvasErr) {
          console.error(`Page ${i} capture failed:`, canvasErr);
          // Ensure we don't leave tagging attributes behind if capture fails early
          try {
            const leaked = element.querySelectorAll("[data-h2c-id]");
            leaked.forEach((n) => n.removeAttribute("data-h2c-id"));
            element.removeAttribute("data-h2c-id");
          } catch {
            // ignore
          }
        }
      }

      if (silent) {
        const blob = pdf.output("blob");
        window.parent.postMessage(
          {
            type: "LETTER_PDF_GENERATED",
            blob,
            filename: `Letter_${formData.refNo}.pdf`,
          },
          "*",
        );
      } else {
        const filename = formData.refNo ? `Letter_${formData.refNo}.pdf` : `Letter_${formData.subject || "Document"}.pdf`;
        pdf.save(filename);
        showSuccessMessage("Institutional Archive Generated Successfully.");
      }
    } catch (error) {
      console.error("PDF Generate Error:", error);
      showErrorMessage("PDF Export Failed. Please ensure selection is valid.");
    } finally {
      setIsDownloading(false);
      downloadStarted.current = false;
    }
  };

  const handleSave = async () => {
    if (!formData.subject) return showErrorMessage("Subject is required");
    if (!selectedTemplate && !formData.logo) return showErrorMessage("Please select a template first");
    if (isSaving) return;
    try {
      setIsSaving(true);
      
      // Fast Thumbnail Gen
      let thumbData = "";
      try {
        if (printRef.current) {
          const firstPage = printRef.current.querySelector('[data-page-index="0"]');
          if (firstPage) {
            // WORKAROUND: html2canvas fails on oklch() colors. Tag and inline computed RGB colors.
            const tagged = [];
            const tagSubtree = (root) => {
              const all = [root, ...root.querySelectorAll("*")];
              for (let k = 0; k < all.length; k++) {
                const n = all[k];
                const id = `h2c-thumb-${k}-${Math.random().toString(16).slice(2)}`;
                n.setAttribute("data-h2c-id", id);
                tagged.push(n);
              }
            };
            const cleanupTags = () => {
              tagged.forEach(n => {
                try { n.removeAttribute("data-h2c-id"); } catch {}
              });
            };

            tagSubtree(firstPage);

            const canvas = await html2canvas(firstPage, { 
              scale: 0.5, 
              useCORS: true, 
              logging: false,
              onclone: (clonedDoc) => {
                try {
                  const colorProps = ["color", "backgroundColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "outlineColor"];
                  const originalNodes = firstPage.querySelectorAll("[data-h2c-id]");
                  for (let idx = 0; idx < originalNodes.length; idx++) {
                    const origNode = originalNodes[idx];
                    const id = origNode.getAttribute("data-h2c-id");
                    const cloneNode = clonedDoc.querySelector(`[data-h2c-id="${id}"]`);
                    if (!cloneNode) continue;
                    const cs = window.getComputedStyle(origNode);
                    colorProps.forEach(prop => {
                      const val = cs[prop];
                      if (val && (val.includes("oklch") || val.includes("oklab"))) {
                        cloneNode.style[prop] = val.replace(/okl(ch|ab)\([^)]+\)/g, "#000000");
                      } else if (val) {
                        cloneNode.style[prop] = val;
                      }
                    });
                  }
                  // Global style cleanup
                  const styleElements = clonedDoc.getElementsByTagName("style");
                  for (let j = 0; j < styleElements.length; j++) {
                    let inner = styleElements[j].innerHTML || "";
                    if (inner.includes("oklch") || inner.includes("oklab")) {
                      styleElements[j].innerHTML = inner.replace(/okl(ch|ab)\([^)]+\)/g, "#000000");
                    }
                  }
                } catch (err) { console.warn("Thumb patch failed", err); }
              }
            });
            
            cleanupTags();
            thumbData = canvas.toDataURL("image/jpeg", 0.5);
          }
        }
      } catch (err) {
        console.warn("Thumnail generation failed", err);
      }


      const payload = {
        ...formData,
        logo: selectedTemplate?.logo || formData.logo,
        title: selectedTemplate?.title || formData.title,
        description: selectedTemplate?.description || formData.description,
        email: selectedTemplate?.email || formData.email,
        phone: selectedTemplate?.phone || formData.phone,
        footerText: selectedTemplate?.footerText || formData.footerText,
        layout: selectedTemplate?.layout || formData.layout,
        letterContent: formData.contents.join("<!-- pagebreak -->"),
        letterText: formData.contents
          .map((c) => c.replace(/<[^>]*>/g, ""))
          .join("\n\n"),
        templateId: selectedTemplate?._id,
        department: selectedTemplate?.department || "",
        margins: formData.pageMargins,
        signatureName: formData.signatureName,
        letterCode: selectedTemplate?.letterCode || formData.letterCode || "10",
        thumbnail: thumbData,
        refNo: formData.refNo || `AKNU-GEN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      };

      // Ensure mandatory fields are not empty strings if backend requires them non-empty
      if (!payload.title) payload.title = "Institutional Letter";
      if (!payload.logo) payload.logo = "N/A"; 
      
      if (letterId) {
        console.log("[SAVE] Updating Letter:", letterId, payload);
        await API.patch(`/letters/created-letters/${letterId}`, payload);
        showSuccessMessage("Letter Updated Successfully");
      } else {
        console.log("[SAVE] Creating New Letter:", payload);
        const res = await API.post("/letters/created-letters", payload);
        if (res.data?.letter?._id) setLetterId(res.data.letter._id);
        showSuccessMessage("Letter Saved Successfully");
      }
      refreshCreatedLetters(true); // Forced Refresh
      setRefreshKey((prev) => prev + 1); // Refresh History

    } catch (err) {
      console.error("Save error:", err);
      if (err?.response?.data?.message) {
        showErrorMessage(err.response.data.message);
      } else {
        showErrorMessage(letterId ? "Update Failed" : "Save Failed");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ font: [] }, { size: [] }],
      ["bold", "italic", "underline"],
      [{ color: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["clean"],
    ],
  };

  // Intelligent Pagination Controller
  const checkAndPaginate = (pageIdx) => {
    // Only paginate during active editing, not view modes
    if (viewMode) return;
    
    // Find the content area in the preview measure (scale 1)
    const measure = previewMeasureRef.current;
    if (!measure) return;

    // The Page component renders content inside a flex:1 container.
    // We check if the content-area div (the one with dangerouslySetInnerHTML) has scrollHeight > offsetHeight
    const contentArea = measure.querySelector('.ql-editor');
    if (!contentArea) return;

    const scrollH = contentArea.scrollHeight;
    const clientH = contentArea.offsetHeight;

    if (scrollH > clientH + 2) { // 2px buffer for rounding
      console.log(`[PAGINATION] Overflow detected on page ${pageIdx + 1} (${scrollH}px > ${clientH}px).`);
      
      // Attempt to split content. We find the last top-level block node (e.g. <p>, <ul>)
      const container = document.createElement('div');
      container.innerHTML = formData.contents[pageIdx];
      
      if (container.childNodes.length > 1) {
        const lastNode = container.lastChild;
        const lastNodeHtml = lastNode.outerHTML || lastNode.textContent;
        container.removeChild(lastNode);
        
        setFormData(prev => {
          const newContents = [...prev.contents];
          newContents[pageIdx] = container.innerHTML;
          
          // Move overflow to next page
          const existingNext = newContents[pageIdx + 1] || "";
          newContents[pageIdx + 1] = lastNodeHtml + existingNext;
          
          // Carry over margins if needed
          const newMargins = { ...prev.pageMargins };
          if (!newMargins[pageIdx + 1]) {
            newMargins[pageIdx + 1] = { top: 1, bottom: 1, left: 1, right: 1 };
          }
          
          return { ...prev, contents: newContents, pageMargins: newMargins };
        });
        
        // Switch view to the page where content landed
        setCurrentPage(pageIdx + 1);
        showSuccessMessage("Moving overflow to next page...");
      }
    }
  };

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-[#525b88] focus:ring-1 focus:ring-[#525b88]";
  const labelClass =
    "block text-[11px] font-bold text-gray-500 uppercase tracking-tight mb-1";
  const sectionHeader =
    "text-xs font-bold text-[#525b88] mb-3 flex items-center gap-2 uppercase tracking-widest border-b border-gray-100 pb-1";
  const cardClass = "bg-white p-3 border border-gray-200 shadow-sm rounded-md";

  // Helper: find the MOST RECENT approved request for a given template/letter ID
  const getApprovedRefNo = (templateOrLetterId) => {
    if (!templateOrLetterId || !userRequests?.length) return null;
    const searchId = String(templateOrLetterId);
    const matching = userRequests.filter((r) => {
      if (r.status !== 'approved') return false;
      const ids = r?.letterIds || [];
      return ids.some((x) => {
        if (!x) return false;
        const idVal = typeof x === 'object' ? (x?._id || x?.id) : x;
        return String(idVal) === searchId;
      });
    });
    if (!matching.length) return null;
    // Return most recent approved request
    const latest = matching.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    return latest ? (latest.requestId || latest.refNo || null) : null;
  };

  const handleLoadLetter = async (letter) => {
    if (!letter) return;
    isLoadingLetter.current = true;
    setLetterId(letter._id);

    let foundTemplate = null;
    if (letter.templateId) {
      foundTemplate = letters?.find((t) => t._id === letter.templateId);
      if (!foundTemplate) {
        // Critical Fallback: fetch template if missing (handling direct site navigation)
        const detailedTemplate = await getTemplateDetails(letter.templateId);
        if (detailedTemplate) foundTemplate = detailedTemplate;
      }
      if (foundTemplate) setSelectedTemplate(foundTemplate);
    } 

    if (!foundTemplate) {
      foundTemplate = {
        logo: letter.logo || "",
        title: letter.title || "",
        description: letter.description || "",
        email: letter.email || "",
        phone: letter.phone || "",
        footerText: letter.footerText || "",
        layout: letter.layout || "1",
        letterCode: letter.letterCode,
      };
      setSelectedTemplate(foundTemplate);
    }

    const approvedRef = getApprovedRefNo(letter.templateId) || getApprovedRefNo(letter._id);

    const mergedData = {
      subject: letter.subject || "",
      pageSize: letter.pageSize || "A4",
      refNo: urlOverrideRef || approvedRef || letter.refNo,
      date: letter.date || new Date().toLocaleDateString("en-GB"),
      time:
        letter.time ||
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      greetings: letter.greetings || "",
      contents: letter.letterContent
        ? letter.letterContent.split("<!-- pagebreak -->")
        : [letter.letterText || ""],
      pageMargins: letter.margins || {
        default: { top: 0, right: 1, bottom: 0, left: 1 },
      },
      closingText: letter.closingText || "",
      signatureName: letter.signatureName || "",
      logo: letter.logo || foundTemplate?.logo || "",
      title: letter.title || foundTemplate?.title || "",
      description: letter.description || foundTemplate?.description || "",
      email: letter.email || foundTemplate?.email || "",
      phone: letter.phone || foundTemplate?.phone || "",
      footerText: letter.footerText || foundTemplate?.footerText || "",
      layout: letter.layout || foundTemplate?.layout || "1",
    };

    console.log("[DEBUG] Final Merged FormData:", mergedData);
    setFormData(mergedData);
    setCurrentPage(0);
    // Safety delay to allow React state to settle before unlocking the effect
    setTimeout(() => {
      isLoadingLetter.current = false;
      console.log("[DEBUG] Letter Loading Lock Released.");
    }, 800);
    
    showSuccessMessage(isSilentPDF ? "Downloading PDF..." : "Letter Loaded Successfully");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // (helper moved above handleLoadLetter)

  const silentPdfTriggered = useRef(false);
  useEffect(() => {
    // Only apply template defaults to formData if we are NOT currently restoring a saved letter.
    // This prevents empty library templates from stomping on manual overrides or saved branding.
    if (selectedTemplate) {
      if (isLoadingLetter.current) {
        console.log("[DEBUG] Template Sync SKIPPED (Loading Guard Active)");
        return;
      }
      console.log("[DEBUG] Syncing FormData with Template Defaults:", selectedTemplate.title);
      setFormData((prev) => ({
        ...prev,
        logo: selectedTemplate.logo || prev.logo || "",
        title: selectedTemplate.title || prev.title || "",
        description: selectedTemplate.description || prev.description || "",
        email: selectedTemplate.email || prev.email || "",
        phone: selectedTemplate.phone || prev.phone || "",
        footerText: selectedTemplate.footerText || prev.footerText || "",
        layout: selectedTemplate.layout || "1",
        department: selectedTemplate.department || "",
      }));
    }
  }, [selectedTemplate]);

  useEffect(() => {
    if (!isSilentPDF || silentPdfTriggered.current) return;
    if (!selectedTemplate) return;
    if (!formData.contents?.length) return;
    if (!printRef?.current) return;

    silentPdfTriggered.current = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        handleDownloadPDF(true);
      });
    });
  }, [isSilentPDF, selectedTemplate, formData.contents, printRef]);

  useEffect(() => {
    const fetchTemplateDetails = async () => {
      if (!urlTemplateId || !letters?.length) return;
      
      const found = letters.find((t) => t._id === urlTemplateId);
      if (found) {
        // Fetch full template details to get logo, address, etc.
        const fullData = await getTemplateDetails(urlTemplateId);
        if (fullData) {

          setSelectedTemplate(fullData);
          const approvedRef = getApprovedRefNo(fullData._id);
          const urlOverrideRef = searchParams.get("overrideRef");
          if (approvedRef || urlOverrideRef) {
            setFormData((prev) => ({
              ...prev,
              refNo: urlOverrideRef || approvedRef || prev.refNo,
            }));
          }
        }
      }
    };
    
    fetchTemplateDetails();
  }, [letters, urlTemplateId]);


  const lastLoadedLetterId = useRef(null);
  useEffect(() => {
    const fetchAndLoadLetter = async () => {
      if (!urlLetterId || lastLoadedLetterId.current === urlLetterId) return;

      // Guard: check if this ID is actually a template (from the Letter collection).
      // This happens when LetterHeadLibrary passes a template ID via ?letterId=
      // In that case, treat it as a templateId and load it via getTemplateDetails instead.
      const isKnownTemplate = letters?.some((t) => String(t._id) === String(urlLetterId));
      if (isKnownTemplate) {
        // Load as a template — the fetchTemplateDetails effect below handles urlTemplateId,
        // so we just set the selected template directly here.
        const fullData = await getTemplateDetails(urlLetterId);
        if (fullData) {
          lastLoadedLetterId.current = urlLetterId;
          setSelectedTemplate(fullData);
          const urlOverrideRef = searchParams.get("overrideRef");
          const approvedRef = getApprovedRefNo(fullData._id);
          if (urlOverrideRef || approvedRef) {
            setFormData((prev) => ({
              ...prev,
              refNo: urlOverrideRef || approvedRef || prev.refNo,
            }));
          }
        }
        return;
      }

      lastLoadedLetterId.current = urlLetterId; // Set eagerly to prevent duplicate fetches
      try {
        const resp = await API.get(`/letters/created-letters/${urlLetterId}`);
        if (resp.data) {
          handleLoadLetter(resp.data);
        }
      } catch (err) {
        console.error("Load letter error:", err);
        showErrorMessage("Failed to load letter data");
      }
    };
    
    if (letters?.length > 0) {
      fetchAndLoadLetter();
    }
  }, [urlLetterId, letters, viewMode]);

  useEffect(() => {
    const viewport = previewViewportRef.current;
    const measure = previewMeasureRef.current;
    if (!viewport || !measure) return;

    const update = () => {
      const viewportW = viewport.clientWidth || 0;
      const baseW = measure.offsetWidth || 0;
      const baseH = measure.offsetHeight || 0;
      if (!viewportW || !baseW || !baseH) return;

      // Fit by width only to avoid feedback loops (height depends on scale).
      const fitW = viewportW / baseW;
      const safeFit = Number.isFinite(fitW) && fitW > 0 ? fitW : 1;
      setPreviewScale(safeFit);
      setPreviewViewportHeight(baseH * safeFit * previewZoomOutFactor);
    };

    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(viewport);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [selectedTemplate, formData.pageSize, previewZoomOutFactor]);

  if (viewMode) {
    return (
      <div className={isPreview ? "min-h-screen bg-gray-100 py-8" : ""}>
        {isPreview && (
          <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center">
            <button 
              onClick={() => window.history.back()} 
              className="px-4 py-2 bg-white text-gray-700 font-bold border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2 text-sm transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button 
              onClick={() => handleDownloadPDF(false)} 
              disabled={isDownloading}
              className="px-4 py-2 bg-[#525B88] text-white font-bold rounded-lg shadow-sm hover:bg-[#3a4166] flex items-center gap-2 text-sm disabled:opacity-50 transition-all"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Rendering...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Download PDF
                </>
              )}
            </button>
          </div>
        )}
        <div
          ref={printRef}
          id="pdf-export-container"
          className={`bg-white ${isPreview ? "shadow-2xl ring-1 ring-gray-200" : ""}`}
          style={{ width: "210mm", minHeight: "297mm", margin: "0 auto" }}
        >
        {selectedTemplate &&
          formData.contents.map((pageContent, index) => (
            <div
              key={index}
              data-page-index={index}
              style={{
                width: formData.pageSize === "A4" ? "210mm" : "8.5in",
                height: formData.pageSize === "A4" ? "297mm" : "11in",
                backgroundColor: "white",
              }}
            >
              <Page
                template={{ ...(selectedTemplate || {}), ...formData }}
                content={pageContent}
                subject={formData.subject}
                refNo={(showRef && urlOverrideRef) || ""}
                date={formData.date}
                time={formData.time}
                greetings={formData.greetings}
                isPreview={isPreview}
                closingText={formData.closingText}
                signatureName={formData.signatureName}
                isFirstPage={index === 0}
                isLastPage={index === formData.contents.length - 1}
                pageSize={formData.pageSize}
                margins={
                  formData.pageMargins[index] || formData.pageMargins.default
                }
                pageNumber={index + 1}
                totalPages={formData.contents.length}
              />
            </div>
          ))}
      </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] px-3">
      <div className="max-w-[1500px] mx-auto">
      {/* Printable Area - Rendered off-screen for PDF generation */}
      <div
        ref={printRef}
        id="pdf-export-container"
        className="print-container"
        style={{ width: "210mm", margin: "0 auto" }} 
      >
        {selectedTemplate &&
          formData.contents.map((pageContent, index) => (
            <div
              key={index}
              data-page-index={index}
              className="mb-0"
              style={{
                width: formData.pageSize === "A4" ? "210mm" : "8.5in",
                height: formData.pageSize === "A4" ? "297mm" : "11in",
                backgroundColor: "white",
              }}
            >
              <Page
                template={{ ...(selectedTemplate || {}), ...formData }}
                content={pageContent}
                subject={formData.subject}
                refNo={(showRef && urlOverrideRef) || ""}
                date={formData.date}
                time={formData.time}
                greetings={formData.greetings}
                isPreview={false}
                closingText={formData.closingText}
                signatureName={formData.signatureName}
                isFirstPage={index === 0}
                isLastPage={index === formData.contents.length - 1}
                pageSize={formData.pageSize}
                margins={
                  formData.pageMargins[index] || formData.pageMargins.default
                }
                pageNumber={index + 1}
                totalPages={formData.contents.length}
              />
            </div>
          ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4 pt-4">
        <h2 className="text-xl font-bold text-[#525B88]">
          Generate Official Letter
        </h2>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-xs text-[#525b88] hover:underline"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        {/* Editor side */}
        <div className="w-full lg:w-[320px] xl:w-[340px] shrink-0 space-y-3">
          {/* Document Settings */}
          <div className={cardClass}>
            <h3 className={sectionHeader}>
              <Settings className="w-4 h-4" /> Document Settings
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Page Size</label>
                  <select
                    value={formData.pageSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, pageSize: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="A4">A4 Standard</option>
                    <option value="Letter">US Letter</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Date</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, date: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className={labelClass}>
                  Margins (cm) - Page {currentPage + 1}
                </label>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {["top", "bottom", "left", "right"].map((m) => (
                  <div key={m} className="flex flex-col">
                    <span className="text-[8px] text-center text-gray-400 font-bold uppercase">
                      {m}
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      value={currentMargins[m]}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setFormData(prev => ({
                          ...prev,
                          pageMargins: {
                            ...prev.pageMargins,
                            [currentPage]: { ...currentMargins, [m]: val },
                          },
                        }));
                      }}
                      className={`${inputClass} text-center !px-1`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Letter Details */}
          <div className={cardClass}>
            <h3 className={sectionHeader}>
              <FileText className="w-4 h-4" /> Letter Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Subject *</label>
                <input
                  className={inputClass}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Subject line"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Salutation</label>
                  <input
                    className={inputClass}
                    value={formData.greetings}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, greetings: e.target.value }))
                    }
                    placeholder="Respected Sir/Madam,"
                  />
                </div>
                <div>
                  <label className={labelClass}>Closing</label>
                  <input
                    className={inputClass}
                    value={formData.closingText}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, closingText: e.target.value }))
                    }
                    placeholder="Yours faithfully,"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`${cardClass} !p-0 overflow-hidden relative`}>
            <div className="p-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center sticky top-0 z-20 shadow-sm">
              <span className="font-bold text-[10px] uppercase tracking-wider text-gray-500 whitespace-nowrap">
                Page Content
              </span>

              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {formData.contents.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentPage(i)}
                      className={`w-5 h-5 flex items-center justify-center text-[9px] rounded-md border font-bold transition-all ${currentPage === i ? "bg-[#525B88] text-white border-[#525B88]" : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"}`}
                      title={`Page ${i + 1}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                {formData.contents.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newContents = formData.contents.filter(
                        (_, i) => i !== currentPage,
                      );

                      // Remap margins
                      const newMargins = {
                        default: formData.pageMargins.default,
                      };
                      newContents.forEach((_, i) => {
                        const oldIdx = i >= currentPage ? i + 1 : i;
                        newMargins[i] =
                          formData.pageMargins[oldIdx] ||
                          formData.pageMargins.default;
                      });

                      setFormData(prev => ({
                        ...prev,
                        contents: newContents,
                        pageMargins: newMargins,
                      }));
                      setCurrentPage(Math.max(0, currentPage - 1));
                    }}
                    className="p-1 text-red-500 bg-red-50 rounded hover:bg-red-100 transition-all border border-red-100"
                    title="Remove page"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const newContents = [...formData.contents];
                    const nextPageIndex = newContents.length;
                    newContents.push("");

                    // Enforce margins: Page 1 (0) stays at 0/0; Page 2+ (1+) defaults to 1/1
                    const newMargins = { ...formData.pageMargins };
                    if (nextPageIndex > 0) {
                      newMargins[nextPageIndex] = { top: 1, bottom: 1, left: 1, right: 1 };
                    } else {
                      newMargins[nextPageIndex] = { top: 0, bottom: 1, left: 1, right: 1 };
                    }

                    setFormData(prev => ({ 
                      ...prev, 
                      contents: newContents,
                      pageMargins: newMargins
                    }));
                    setCurrentPage(nextPageIndex);
                  }}
                  className="p-1 text-[#525B88] bg-[#525B88]/5 rounded hover:bg-[#525B88]/10 transition-all border border-[#525B88]/10"
                  title="Add page"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <ReactQuill
              key={`editor-${letterId || 'new'}-${currentPage}`}
              theme="snow"
              value={formData.contents[currentPage] || ""}
              onChange={(val) => {
                setFormData(prev => {
                  const newContents = [...prev.contents];
                  newContents[currentPage] = val;
                  return { ...prev, contents: newContents };
                });
                
                // --- AUTO PAGINATION TRIGGER ---
                // We use a small timeout to let the state settle and preview render
                if (window.paginationTimeout) clearTimeout(window.paginationTimeout);
                window.paginationTimeout = setTimeout(() => {
                  checkAndPaginate(currentPage);
                }, 800);
              }}
              modules={quillModules}
              className="h-[250px] border-none"
              placeholder="Write your letter content here..."
            />
          </div>

          {/* Signature */}
          <div className={cardClass}>
            <label className={labelClass}>Signature Name & Rank</label>
            <input
              className={inputClass}
              value={formData.signatureName}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, signatureName: e.target.value }))
              }
              placeholder="e.g. Dr. John Doe, Registrar"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex-1 bg-[#525B88] text-white py-2 rounded-md text-xs font-bold hover:bg-[#3a4166] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save
                </>
              )}
            </button>
            <button
              onClick={() => handleDownloadPDF(false)}
              disabled={isDownloading}
              className={`flex-1 bg-white border border-[#525B88] text-[#525B88] py-2 rounded-md text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isDownloading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#525B88]/20 border-t-[#525B88] rounded-full animate-spin"></div>
                  <span>...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> PDF
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview Side */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl p-0 flex flex-col relative group/preview-side shadow-sm">
          {selectedTemplate ? (
            <div
              ref={previewViewportRef}
              className="relative w-full bg-gray-50/60 border border-gray-100 flex items-start justify-start overflow-hidden"
              style={{
                height: previewViewportHeight ? `${previewViewportHeight}px` : "297mm",
              }}
            >
              {/* Measure at scale=1 (hidden, no layout impact) */}
              <div className="absolute -z-10 opacity-0 pointer-events-none">
                <div ref={previewMeasureRef} className="inline-block">
                  <Page
                    template={{ ...(selectedTemplate || {}), ...formData }}
                    content={formData.contents[currentPage]}
                    subject={formData.subject}
                    refNo={(showRef && urlOverrideRef) || ""}
                    date={formData.date}
                    time={formData.time}
                    greetings={formData.greetings}
                    isPreview={true}
                    closingText={formData.closingText}
                    signatureName={formData.signatureName}
                    isFirstPage={currentPage === 0}
                    isLastPage={currentPage === formData.contents.length - 1}
                    pageSize={formData.pageSize}
                    margins={
                      formData.pageMargins[currentPage] ||
                      formData.pageMargins.default
                    }
                    pageNumber={currentPage + 1}
                    totalPages={formData.contents.length}
                  />
                </div>
              </div>

              <div
                ref={componentRef}
                className="relative origin-top-left shadow-2xl transform-gpu"
                style={{ transform: `scale(${previewScale * previewZoomOutFactor})` }}
              >
                {/* Horizontal Navigation Arrows (centered on preview page) */}
                {formData.contents.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(0, prev - 1))
                      }
                      disabled={currentPage === 0}
                      className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/90 border border-gray-200 shadow-sm transition-all opacity-0 group-hover/preview-side:opacity-100 ${currentPage === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-[#525B88] hover:border-[#525B88]/30"}`}
                      title="Previous page"
                    >
                      <ChevronLeft className="w-10 h-10" />
                    </button>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(formData.contents.length - 1, prev + 1),
                        )
                      }
                      disabled={currentPage === formData.contents.length - 1}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/90 border border-gray-200 shadow-sm transition-all opacity-0 group-hover/preview-side:opacity-100 ${currentPage === formData.contents.length - 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-[#525B88] hover:border-[#525B88]/30"}`}
                      title="Next page"
                    >
                      <ChevronLeft className="w-10 h-10 rotate-180" />
                    </button>
                  </>
                )}

                <Page
                  template={{ ...(selectedTemplate || {}), ...formData }}
                  content={formData.contents[currentPage]}
                  subject={formData.subject}
                  refNo={(showRef && urlOverrideRef) || ""}
                  date={formData.date}
                  time={formData.time}
                  greetings={formData.greetings}
                  isPreview={true}
                  closingText={formData.closingText}
                  signatureName={formData.signatureName}
                  isFirstPage={currentPage === 0}
                  isLastPage={currentPage === formData.contents.length - 1}
                  pageSize={formData.pageSize}
                  margins={
                    formData.pageMargins[currentPage] ||
                    formData.pageMargins.default
                  }
                  pageNumber={currentPage + 1}
                  totalPages={formData.contents.length}
                />
              </div>
            </div>
          ) : (
            <div
              className="w-full bg-gray-50/60 border border-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-300 p-10 overflow-hidden"
              style={{
                height: previewViewportHeight ? `${previewViewportHeight}px` : "297mm",
              }}
            >
              <Info className="w-12 h-12 mb-2 opacity-20" />
              <p className="font-bold text-sm">Template selection required</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .ql-toolbar.ql-snow { 
          border: none !important; 
          border-bottom: 1px solid #f1f1f1 !important; 
          position: sticky !important; 
          top: 41px !important; 
          z-index: 10 !important; 
          background: white !important; 
        }
        .ql-container.ql-snow { border: none !important; }
        .ql-editor { font-family: 'Times New Roman', serif; font-size: 11pt; }
        .official-serif { font-family: 'Times New Roman', serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #aaa; }

        @media screen {
          .print-container {
            visibility: hidden !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            z-index: -1000 !important;
            pointer-events: none !important;
          }
        }
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          .print-container {
            visibility: visible !important;
            display: block !important;
            position: static !important;
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-container > div {
            page-break-after: always;
            page-break-inside: avoid;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      
      <div className="mt-8 bg-white">
        <GeneratedLetters 
          key={refreshKey} 
          onLoadLetter={handleLoadLetter} 
          isDownloading={isDownloading} 
          showDownload={true} 
          hideRequest={true}
        />
      </div>
      </div>
    </div>
  );
};

export default GenerateLetterContent;
