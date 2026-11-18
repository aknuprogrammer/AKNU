import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { useEffect, useState } from "react";

/**
 * Converts a MongoDB buffer (or raw Uint8Array) into a Blob URL.
 * Supports images, PDFs, or any file type.
 *
 * @param {Object|Uint8Array} file - The file object from MongoDB, must contain `data` and `contentType`.
 * @returns {string|null} - A Blob URL that can be used as src for <img>, <iframe>, etc.
 */
export function useBufferUrl(file) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!file) return;

    try {
      // Extract the Uint8Array from MongoDB buffer
      const bufferArray = file.data?.data || file.data;

      if (!bufferArray) {
        console.error("Invalid buffer:", file);
        setUrl(null);
        return;
      }

      const uint8Array = new Uint8Array(bufferArray);
      const blob = new Blob([uint8Array], {
        type: file.contentType || "application/octet-stream",
      });
      const blobUrl = URL.createObjectURL(blob);

      setUrl(blobUrl);

      // Cleanup on unmount
      return () => {
        URL.revokeObjectURL(blobUrl);
      };
    } catch (err) {
      console.error("Error generating Blob URL:", err);
      setUrl(null);
    }
  }, [file]);

  return url;
}

/**
 * Stamps Ref No + Date on the first page (and repeats on multi-page PDFs) for approved downloads.
 * @param {Uint8Array|ArrayBuffer} pdfBuffer
 * @param {string} textToAdd - Ref / request id shown after "Ref No:"
 * @param {string} [campusCode] - RJY | KKD | TPG (reserved for future header use)
 * @param {string|null} [dateDisplayOverride] - Full date line text after "Date: " (e.g. "01 Apr 2026 | 12:30 pm") or null to use today in IST
 */
export const addTextToPDF = async (
  pdfBuffer,
  textToAdd,
  _campusCode,
  dateDisplayOverride = null,
) => {
  void _campusCode;

  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const dateSuffix =
      dateDisplayOverride && String(dateDisplayOverride).trim()
        ? String(dateDisplayOverride).trim()
        : new Date().toLocaleString("en-GB", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

    const refLabel = `Ref No: ${String(textToAdd || "N/A").trim()}`;
    const dateStr = `Date: ${dateSuffix}`;

    pages.forEach((page) => {
      const { width, height } = page.getSize();
      const marginLeft = 50;
      const rightMargin = 50;
      // Distance from top of page to ref/date baseline (PDF points). Keep just below
      // typical header (~80px ≈ 60pt) + small gap; increase if a template overlaps.
      const marginTop = 88;
      const lineSpacing = 16;
      let yPosition = height - marginTop;

      page.drawText(refLabel, {
        x: marginLeft,
        y: yPosition,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });

      const dateWidth = font.widthOfTextAtSize(dateStr, 10);
      page.drawText(dateStr, {
        x: Math.max(marginLeft, width - dateWidth - rightMargin),
        y: yPosition,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });

      yPosition -= lineSpacing;
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error("Error modifying PDF:", error);
    throw error;
  }
};
