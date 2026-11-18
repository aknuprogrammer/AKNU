import React from "react";
import { CheckCircle } from "lucide-react";

export default function AlertDialog({ open, onClose, title }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-sm p-6 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
        <h2 className="mt-4 text-lg font-semibold text-black">
          {title || "Upload successful!"}
        </h2>

        <button
          onClick={onClose}
          className="mt-6 px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Okay
        </button>
      </div>
    </div>
  );
}
