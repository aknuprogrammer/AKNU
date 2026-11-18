import React from "react";

export default function IconButton({
  onClick,
  Icon,
  size = 16,
  iconColor,
  className = "rounded-full p-2 cursor-pointer bg-white",
}) {
  return (
    <button className={className} onClick={onClick}>
      <Icon size={size} color={iconColor} />
    </button>
  );
}
