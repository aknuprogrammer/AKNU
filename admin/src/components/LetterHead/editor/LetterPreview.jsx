import React, { forwardRef } from "react";
import Header from "./Header";
import Footer from "./Footer";

const LetterPreview = forwardRef(({ data, isDownload = false }, ref) => {
  return (
    <div
      id="letter-preview-container"
      ref={ref}
      style={{
        width: isDownload ? "210mm" : "100%",
        height: isDownload ? "297mm" : "100%",
        boxSizing: "border-box",
        backgroundColor: '#ffffff',
        color: '#000000',
        borderColor: '#e5e7eb',
        borderWidth: !isDownload ? '1px' : '0px',
        borderStyle: 'solid',
        fontFamily: "'Times New Roman', serif",
      }}
      className={
        isDownload
          ? "flex flex-col overflow-hidden print:shadow-none"
          : "rounded-xl p-8 flex flex-col shadow-lg w-full"
      }
    >
      <Header {...data} />

      <div className="flex-1 overflow-hidden border-x border-gray-100 flex flex-col px-10 py-8">
        <div className="flex-1 flex items-center justify-center">
          {/* <p className="text-gray-300 font-medium tracking-widest uppercase text-2xl rotate-45 opacity-20 select-none">
            Letterhead Template
          </p> */}
        </div>
      </div>

      <Footer footerText={data.footerText} />
    </div>
  );
});

export default LetterPreview;
