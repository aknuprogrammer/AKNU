import React from "react";
import { chancellor } from "@/assets";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const AboutChancellor = () => {
  return (
    <div className="px-4 sm:px-16 pt-10 md:pt-16" id="about-chancellor">
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
        <div className="lg:w-1/2 w-full sm:mt-6 md:mt-0 lg:mt-0">
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-teal-800 mb-3 sm:mb-4">
              CHANCELLOR
            </h2>
            <p className="text-gray-700 mb-4 text-base sm:text-[16px] leading-relaxed text-justify">
              His Excellency S. Abdul Nazeer, the 24th Governor of Andhra
              Pradesh, serves as the Chancellor of Adikavi Nannaya University.
              With a distinguished judicial career spanning 1983–January 2023,
              he served as a judge of the Karnataka High Court before being
              elevated to the Supreme Court of India in February 2017. He was
              part of landmark constitutional benches that adjudicated
              significant cases including the Triple Talaq case and the Ayodhya
              dispute. His appointment as Governor of Andhra Pradesh in February
              2023 brings exceptional legal acumen and leadership to guide the
              university's vision for academic excellence and institutional
              growth.
            </p>
            <div className="flex group relative">
              <Link
                to="/AboutChancellor"
                className="inline-flex items-center gap-1 text-[#004d40] font-medium text-lg sm:text-xl transition-all duration-300 hover:text-[#00695c]"
              >
                Know More
                <ArrowUpRight
                  size={18}
                  className="transform transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>
            </div>
          </section>
        </div>
        {/* Polinaidu: 2/11/2025
  Decreases the image size
*/}
        <div className="lg:w-1/2 w-full">
          <div className="rounded-xl overflow-hidden shadow-md">
            <img
              src={chancellor}
              alt="Chancellor"
              className="w-full h-auto max-h-[400px] object-cover object-top"
            />
            <h1 className="py-3 px-4 text-lg sm:text-xl">Sri. S. Abdul Nazeer, Hon'ble Governor, AP & Hon'ble Chancellor, AKNU</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutChancellor;
