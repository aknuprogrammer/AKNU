import React from "react";

function Card({ title, description }) {
  return (
    <div className="card bg-gray-100 p-4 m-4 rounded shadow-lg">
      <h3 className="text-xl font-bold">{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default Card;
