import React from "react";

export default function CustomButton({
  type = "submit",
  title,
  icon,
  className,
  onClick,
}) {
  return (
    <button
      type={type}
      onClick={type === "button" ? onClick : undefined}
      className={`px-5 cursor-pointer py-1.5 bg-[#525B88] text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm flex items-center gap-4 justify-center ${className}`}
    >
      <span>{title}</span>
      {icon && icon}
    </button>
  );
}
