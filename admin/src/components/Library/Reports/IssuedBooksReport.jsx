import React, { useState, useMemo } from "react";
import { BookOpen, Download, Filter, Calendar } from "lucide-react";
import IssuedBooks from "../IssuedBooks";
import { showSuccessMessage } from "../../../config/Toast";

// This uses the existing IssuedBooks component for the report
const IssuedBooksReport = () => {
  return (
    <div>
      <div className="p-6 pb-0">
        <div className="flex flex-row justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
            Issued Books Report
          </h2>
          <button 
            className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
            onClick={() => {
              // Trigger export from IssuedBooks component
              showSuccessMessage("Please use the Export button in the issued books table");
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>
      <IssuedBooks />
    </div>
  );
};

export default IssuedBooksReport;

