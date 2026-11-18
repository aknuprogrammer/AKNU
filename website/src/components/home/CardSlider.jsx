import React from "react";
import { Link } from "react-router-dom";
import { departments } from "../../siteData/departmentsData";

const Card = ({ title, image, programs, link }) => {
  return (
    <Link to={link}>
      <div
        className="relative w-[80vw] sm:w-64 h-80 sm:h-96 bg-cover bg-center rounded-lg overflow-hidden flex items-end flex-shrink-0 shadow-md"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-[#004d40] to-transparent z-10" />

        <div className="relative z-20 p-4 text-white">
          <h3 className="text-lg sm:text-xl font-bold">{title}</h3>
          <p className="text-xs sm:text-sm">{programs} Programmes</p>
        </div>
      </div>
    </Link>
  );
};

const CardSlider = () => {
  return (
    <div className="px-4 sm:px-16 pt-10 md:pt-16" id="departments">
      <div className=" ">
        <h2 className="text-3xl sm:text-3xl font-bold text-teal-800 mb-5">
          5 Knowledge Spheres. <br className="hidden sm:block" />
          <span className="ml-[27px]">Endless Opportunities.</span>
        </h2>

        <div className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar  active:cursor-grabbing scroll-smooth ">
          {departments.map((card, index) => (
            <Card
              key={index}
              title={card.title}
              image={card.img}
              programs={card.programs}
              link={card.link}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardSlider;
