import React from "react";
import { glanceData } from "../../siteData/homeData";

const Glance = () => {
  return (
    <section className="px-4 sm:px-16 pt-10 md:pt-16" id="glance-aknu">
      <div className="container">
        <h2 className="text-3xl font-bold text-teal-800 mb-4">Glance @ AKNU</h2>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
          {glanceData.map((item, index) => (
          <div
  key={index}
  className="group bg-white relative border border-gray-200 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 w-full aspect-square flex flex-col justify-center items-center text-center"
>
  <p
    className={`text-[36px] sm:text-[48px] font-extrabold mb-1 ${item.color}`}
  >
    {item.value}
  </p>

  <p className="text-gray-700 text-lg text-[10px] sm:text-[18px] font-medium px-3">
    {item.label}
  </p>

  {item.description && (
    <div
      className="absolute left-1/2 top-[20%] mt-2 -translate-x-1/2
      opacity-0 group-hover:opacity-100 transition-opacity duration-300
       text-sm  px-3 py-2
      w-max max-w-xs z-1000 "
    >
      {item.description}
    </div>
  )}
</div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Glance;
