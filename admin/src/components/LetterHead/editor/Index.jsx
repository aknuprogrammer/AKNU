import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import LetterPreview from "./LetterPreview";
import FormPanel from "./FormPanel";
import { API, BASE_URL } from "../../../config/urls";
import { useNavigate, useSearchParams } from "react-router-dom";
import { showAxiosError, showSuccessMessage } from "../../../config/Toast";
import { useLetterHeadHook } from "../../../Hooks/LetterHeadHook";

export default function CreateFile({ onSuccess }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("editId");
  const { letters, depts, getLetterDetails, getTemplateDetails } = useLetterHeadHook();
  const loadedIdRef = useRef(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [data, setData] = useState({
      logo: "",
      title: "",
      description: [""],
      email: "",
      phone: "",
      footerText: [""],
      layout: "",
      letterCode: "",
  });

  useEffect(() => {
    if (editId && loadedIdRef.current !== editId) {
      const fetchFullDetails = async () => {
        setIsLoadingDetails(true);
        // Try getting from state first (determines if it is institutional or personal history)
        const isInstitutional = letters.some(l => String(l._id) === String(editId));
        
        // Fetch full details using the appropriate method.
        // History items have details via getLetterDetails; institutional ones via getTemplateDetails
        const fullData = isInstitutional 
          ? await getTemplateDetails(editId) 
          : await getLetterDetails(editId);
        
        if (fullData) {
          console.log("[DEBUG] Template FULL Details Loaded for Editing:", fullData);
          setData({
            logo: fullData.logo || "",
            title: fullData.title || "",
            description: fullData.description ? (fullData.description.includes(" | ") ? fullData.description.split(" | ") : [fullData.description]) : [""],
            email: fullData.email || "",
            phone: fullData.phone || "",
            footerText: fullData.footerText ? (fullData.footerText.includes(" | ") ? fullData.footerText.split(" | ") : [fullData.footerText]) : [""],
            layout: String(fullData.layout || ""),
            letterCode: String(fullData.letterCode || ""),
            hrText: fullData.hrText || "",
            faithfulText: fullData.faithfulText || "",
            greetings: fullData.greetings || "",
          });
          loadedIdRef.current = editId;
          showSuccessMessage("Template loaded for editing");
        }
        setIsLoadingDetails(false);
      };
      
      fetchFullDetails();
    }
  }, [editId, getLetterDetails]); // Removed letters from deps as we now fetch full data anyway.

  const previewRef = useRef();
  const [isDownload, setIsDownload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    // console.log("data", data);
    // Removed localStorage auto-save to ensure form stays clean on reload unless explicitly saved
  }, [data]);

  const handleUpload = async () => {
    const token = localStorage.getItem("token");
    const rawName = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    
    const name = (rawName && rawName !== "undefined" && rawName !== "null") 
      ? rawName 
      : (role || "Admin");

    if (!token) return navigate("/login-lage");

    setIsSubmitting(true);
    // Allow React to re-render the 'Creating template...' button state before thread-blocking html2canvas starts
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const element = document.getElementById("letter-preview-container");
      if (!element) throw new Error("Preview element not found");

      // WORKAROUND: html2canvas fails on oklch() colors. Tag and inline computed RGB colors.
      const tagged = [];
      const tagSubtree = (root) => {
        const all = [root, ...root.querySelectorAll("*")];
        for (let k = 0; k < all.length; k++) {
          const n = all[k];
          const id = `h2c-temp-${k}-${Math.random().toString(16).slice(2)}`;
          n.setAttribute("data-h2c-id", id);
          tagged.push(n);
        }
      };
      const cleanupTags = () => {
        tagged.forEach(n => {
          try { n.removeAttribute("data-h2c-id"); } catch {}
        });
      };

      tagSubtree(element);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          try {
            const previewEl = clonedDoc.getElementById("letter-preview-container");
            if (previewEl) {
              previewEl.style.width = "210mm";
              previewEl.style.height = "297mm";
              previewEl.style.padding = "0";
              previewEl.style.margin = "0";
              previewEl.style.boxSizing = "border-box";
              // Remove rounded corners and shadows for pristine A4 export
              previewEl.classList.remove("shadow-lg", "rounded-xl");
            }
            
            // Inline computed colors
            const colorProps = ["color", "backgroundColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "outlineColor"];
            const originalNodes = element.querySelectorAll("[data-h2c-id]");
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

            const styleElements = clonedDoc.getElementsByTagName('style');
            for (let i = 0; i < styleElements.length; i++) {
              let inner = styleElements[i].innerHTML || "";
              if (inner.includes('oklch') || inner.includes('oklab')) {
                styleElements[i].innerHTML = inner.replace(/okl(ch|ab)\([^)]+\)/g, '#000000');
              }
            }
          } catch (e) {
            console.warn('Could not patch oklch colors or target node:', e);
          }
        }
      });

      cleanupTags();

      const imgData = canvas.toDataURL("image/png");

      // Optimization: Create a lightweight thumbnail (20% scale, JPEG) to prevent massive DB/Network payloads
      const thumbCanvas = document.createElement("canvas");
      const ctx = thumbCanvas.getContext("2d");
      thumbCanvas.width = canvas.width * 0.2;
      thumbCanvas.height = canvas.height * 0.2;
      ctx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
      const thumbData = thumbCanvas.toDataURL("image/jpeg", 0.5);

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      const blob = pdf.output("blob");

      const formData = new FormData();
      formData.append("title", data.title || "Generated Letterhead");
      formData.append("file", blob, "letter.pdf");
      formData.append("uploadedBy", name);
      formData.append("letterCode", data.letterCode);
      formData.append("type", "created");
      formData.append("thumbnail", thumbData);

      formData.append("logo", data.logo || "");
      formData.append("description", Array.isArray(data.description) ? data.description.filter(d => d.trim()).join(" | ") : (data.description || ""));
      formData.append("email", data.email || "");
      formData.append("phone", data.phone || "");
      formData.append("footerText", Array.isArray(data.footerText) ? data.footerText.filter(f => f.trim()).join(" | ") : (data.footerText || ""));
      formData.append("layout", data.layout || "");
      formData.append("faithfulText", data.faithfulText || "");
      formData.append("hrText", data.hrText || "");
      formData.append("greetings", data.greetings || "");

      await API.post("/letters", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setData({
        logo: "",
        title: "",
        description: [""],
        email: "",
        phone: "",
        footerText: [""],
        layout: "",
        letterCode: "",
      });

      showSuccessMessage("Uploaded Successfully");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.log("Upload error:", error);
      showAxiosError(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="">
      <div className="flex flex-col lg:flex-row gap-6 bg-gray-50/20 rounded-xl">
        <div className="w-full lg:w-[300px] shrink-0">
          <FormPanel data={data} setData={setData} onDownload={handleUpload} depts={depts} isSubmitting={isSubmitting} />
        </div>

        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Live Preview</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-300"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-300"></div>
              <div className="w-2 h-2 rounded-full bg-green-300"></div>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-gray-50/50">
            <LetterPreview data={data} ref={previewRef} isDownload={isDownload} />
          </div>
        </div>
      </div>
    </div>
  );
}
