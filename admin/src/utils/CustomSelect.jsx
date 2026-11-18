import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";

export default function CustomSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  errors,
  name,
  register, // Supports RHF
  setValue,  // Supports RHF
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const error = errors?.[name];

  // If using RHF, get value from what's passed in or maintain local state
  // But usually RHF components are controlled via Controller
  // For simplicity, we'll make this work as a controlled component OR RHF-aware

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedValue = value;
  const selected = options.find(o => o.value === selectedValue);

  return (
    <div className="flex flex-col relative w-full" ref={containerRef}>
      {label && <label className="text-sm text-gray-700 mb-1.5 ml-0.5">{label}</label>}
      
      {/* Visual Dropdown */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center justify-between gap-2 px-3.5 py-2 bg-white border rounded-lg text-sm font-medium transition-all w-full text-left ${
          open ? 'border-[#525B88] ring-2 ring-[#525B88]/10' : error ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <span className={selected ? "text-black" : "text-gray-500"}>
          {selected?.label || placeholder}
        </span>
        <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Actual Hidden input for RHF */}
      {register && (
        <input 
          type="hidden" 
          {...register(name)} 
          value={selectedValue || ""} 
        />
      )}

      {/* Options Menu */}
      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-50 bg-white border border-gray-100 rounded-xl shadow-2xl w-full">
          <div className="py-1 max-h-60 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { 
                  if (onChange) onChange(opt.value);
                  if (setValue && name) setValue(name, opt.value, { shouldValidate: true });
                  setOpen(false); 
                }}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-all duration-150 text-left ${
                  opt.value === selectedValue
                    ? 'bg-[#525B88] text-white font-semibold'
                    : 'text-gray-700 hover:bg-[#525B88]/10 hover:text-[#525B88]'
                }`}
              >
                <span>{opt.label}</span>
                {opt.value === selectedValue && <CheckIcon className="h-4 w-4 text-white shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-[10px] sm:text-xs text-red-500 font-medium">*{error.message}</p>}
    </div>
  );
}
