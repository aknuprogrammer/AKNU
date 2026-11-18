import React from "react";

export default function Header({
  logo,
  title,
  description,
  email,
  phone,
  layout,
}) {
  const orderClasses = {
    1: ["order-1", "order-2", "order-3"],
    2: ["order-2", "order-1", "order-3"],
    3: ["order-2", "order-3", "order-1"],
  };
  const order = orderClasses[layout] || orderClasses[1];

  return (
    <header
      style={{
        borderBottom: "1px solid #9CA3AF",
        minHeight: "80px",
        maxHeight: "80px",
        backgroundColor: "#ffffff",
        color: "#000000",
      }}
      className="flex justify-around items-center p-3"
    >
      {logo && (
        <img
          src={logo}
          alt="Logo"
          className={`h-16 w-16 object-contain ${order[0]}`}
        />
      )}
      <div className={`text-center ${order[1]}`}>
        <h1 className="text-xl font-bold mb-1">{title || "Letter Title"}</h1>
        <div style={{ color: "#4B5563" }} className="text-[10px] leading-tight flex flex-col items-center">
          {Array.isArray(description) ? (
            description.map((desc, i) => (
              <p key={i}>{desc || (i === 0 ? "Short description" : "")}</p>
            ))
          ) : (
            <p>{description || "Short description"}</p>
          )}
        </div>
      </div>
      <div className={`text-right text-xs ${order[2]}`}>
        <p className="mb-1">{email || "email@example.com"}</p>
        <p>{phone || "+91 00000 00000"}</p>
      </div>
    </header>
  );
}
