import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { data__latest_News } from "./Mock_Data";

export default function Section_LatestNews() {
  return (
    <section className="flex flex-col gap-[50px] px-[15%] py-[50px] sm:px-[5%] sm:py-[20px] mx-12">
      <h1 className="text-center text-[35px] sm:text-[30px]">
        Latest News & Events
      </h1>

      <div className="flex items-center justify-center w-full max-w-[3000px] h-[1000px] mx-auto sm:h-[600px]">
        <Swiper
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          loop={true}
          navigation
          pagination={{ clickable: true }}
          coverflowEffect={{
            rotate: 30,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
            scale: 0.8,
          }}
          modules={[EffectCoverflow, Navigation, Pagination]}
          className="w-full h-full"
        >
          {data__latest_News.map((url, index) => (
            <SwiperSlide
              key={index}
              className="bg-white flex items-center justify-center w-auto h-[500px] max-w-[90vw] rounded-[12px] overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out sm:h-[300px]"
            >
              
              <img
                src={url}
                alt={`Slide ${index}`}
                className="w-full h-full max-w-full object-contain rounded-[12px] p-5"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
