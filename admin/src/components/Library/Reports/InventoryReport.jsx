import React from "react";
import { Download, Package } from "lucide-react";
import LibraryInventory from "../LibraryInventory";
import { showSuccessMessage, showAxiosError } from "../../../config/Toast";

// This uses the existing LibraryInventory component for the report
const InventoryReport = () => {
  return (
    <div>
      <div className="p-6 pb-0">
        <div className="flex flex-row justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-[#2a3563] bg-gradient-to-r from-[#525b88] to-[#3a4377] bg-clip-text text-transparent">
            Inventory Report
          </h2>
          <button 
            className="flex items-center px-4 py-2 bg-[#525B88] text-white rounded-md hover:bg-[#3a4166] transition-colors"
            onClick={() => {
              // Trigger export from LibraryInventory component
              // Since LibraryInventory now has its own export button, this is just a placeholder
              // In a real scenario, you might want to use a ref or context to trigger the export
              showSuccessMessage("Please use the Export button in the inventory table");
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>
      <LibraryInventory />
    </div>
  );
};

export default InventoryReport;

