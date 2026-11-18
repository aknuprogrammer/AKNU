import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { campusData } from "../../siteData/homeData";
import { ArrowUpRight } from "lucide-react";

const VibrantCampuses = () => {
  return (
    <section
      className="px-4 sm:px-16 pt-10 md:pt-16 bg-white"
      data-aos="fade-up"
      data-aos-duration="800"
      id="campuses"
    >
      <div className="">
        <h2 className="text-2xl sm:text-3xl font-bold text-teal-800 mb-6 sm:mb-8 leading-snug">
          {/* 3 Vibrant Campuses,
          <span style={{ color: "oklch(0.656 0.241 354.308)" }}> own </span>
          <span style={{ color: "oklch(0.696 0.17 162.48)" }}>special </span>
          <span style={{ color: "#FCC203" }}>character</span> */}
          3 Dynamic Campuses
          <br />
          <span className="text-xl sm:text-3xl ml-0 sm:ml-7">
            Each reflecting a unique culture and{" "}
            <span className="sm:ml-[27px] ml-0 lg:ml-0">atmosphere.</span>
          </span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-15">
          {/* <Swiper
          spaceBetween={20}
          slidesPerView={1.2}
          breakpoints={{
            640: { slidesPerView: 1.5 },
            768: { slidesPerView: 2.5 },
            1024: { slidesPerView: 3.2 },
          }}
          navigation
          modules={[Navigation]}
          className="pb-8"
        > */}
          {campusData.map((campus, index) => (
            <div
              key={campus.name}
              className={`relative shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden w-full  mx-auto sm:mx-0 min-h-[450px] sm:min-h-[500px] flex flex-col justify-between ${
                index === 0
                  ? "ring-4 ring-yellow-500 transform"
                  : "ring-1 ring-gray-200"
              }`}
            >
              {/* Campus Image with Gradient Overlay */}
              <div className="relative h-48 sm:h-56">
                <img
                  src={campus.image}
                  alt={campus.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${
                    index === 0
                      ? "from-teal-900/70 to-teal-800/30"
                      : "from-gray-900/50 to-transparent"
                  }`}
                ></div>

                {/* Main Campus Badge */}
                {campus.name === "Rajamahendravaram" && (
                  <span className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-gradient-to-r from-teal-600 to-teal-800 text-white text-xs sm:text-sm font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Main Campus
                  </span>
                )}
              </div>

              {/* Content */}
              <div
                className={`p-3 sm:p-4 flex flex-col justify-between flex-grow ${
                  index === 0
                    ? "bg-gradient-to-br from-teal-700 to-teal-600"
                    : "bg-teal-700"
                }`}
              >
                <div>
                  <h4
                    className={`text-lg sm:text-2xl font-extrabold mb-2 ${
                      index === 0 ? "text-white" : "text-white"
                    }`}
                  >
                    {campus.name}
                  </h4>
                  <p
                    className={`text-sm sm:text-base text-justify ${
                      index === 0 ? "text-teal-100" : "text-teal-200"
                    }`}
                  >
                    {campus.description}
                  </p>
                </div>

                <Link
                  to={campus.link}
                  className={`mt-3 sm:mt-4 inline-flex items-center text-sm sm:text-base font-semibold ${
                    index === 0 ? "text-white group" : "text-teal-100 group"
                  }`}
                  title="Know More"
                  onClick={(e) => {
                    if (campus.name === "Rajamahendravaram") {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                >
                  <span className="mr-2">Explore Campus</span>
                  <div
                    className={`transition-all duration-300 ${
                      index === 0
                        ? "bg-teal-800 group-hover:bg-teal-500 p-2 rounded-full"
                        : "bg-teal-900 group-hover:bg-teal-600 p-1.5 rounded-full"
                    }`}
                  >
                    <ArrowUpRight
                      size={index === 0 ? 20 : 18}
                      className="transform transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </div>
                </Link>
              </div>

              {/* Special Ribbon for First Card */}
              {index === 0 && (
                <div className="absolute -top-2 -right-2 w-32 overflow-hidden">
                  <div className="absolute transform rotate-45 bg-yellow-400 text-teal-900 text-xs font-bold py-1 text-center w-48 top-10 right-0">
                    Featured
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* </Swiper> */}
        </div>
      </div>
    </section>
  );
};

export default VibrantCampuses;
