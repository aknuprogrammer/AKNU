import { vc } from "@/assets";
import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const AboutVC = () => {
  const [activeTab, setActiveTab] = useState("vision");

  return (
    <div className="px-4 sm:px-16 pt-10 md:pt-18" id="about-vc">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Image Section (Left on lg, second on mobile) */}
        <div className="lg:w-1/2 w-full">
          <div className="rounded-xl overflow-hidden shadow-md">
            <img
              src={vc}
              alt="VC image"
              className="w-full h-auto max-h-[400px] object-cover object-top"
            />
            <h1 className="py-3 px-4 text-xl">Prof. S. Prasanna Sree, Vice Chancellor</h1>
          </div>
        </div>

        {/* Text Section (Right on lg, first on mobile) */}
        <div className="lg:w-1/2 w-full mt-6 order-1 lg:order-2">
          <section>
            <h2 className="text-3xl font-bold text-teal-800 mb-4 ">
              VICE - CHANCELLOR'S MESSAGE
            </h2>

            <p className="text-gray-700 mb-4 text-[16px] text-justify">
              I am deeply honored and delighted to assume the role of Vice
              Chancellor of Adikavi Nannaya University, Rajamahendravaram. I
              express my sincere gratitude to the Government of Andhra Pradesh
              and our esteemed Chief Minister, Sri Nara Chandrababu Naidu garu,
              for entrusting me with this responsibility. Adikavi Nannaya
              University was established to cater to the educational aspirations
              of students from the East and West Godavari districts—a
              long-standing demand of the region's people, now fulfilled through
              this esteemed institution. It is both a privilege and a
              responsibility to contribute to the vision of shaping Adikavi
              Nannaya University into a center of academic excellence.
            </p>
            {/* <p className="text-gray-700 mb-4 text-[16px]">
              It is a great privilege and honor to contribute to the mission of
              establishing Andhra University as a distinguished name in the
              academic world—by fostering a knowledge-driven environment that
              emphasizes practical application and inspires youth holistically
              to become the leaders of tomorrow.
            </p> */}

            <div className="flex group relative">
              <Link
                to="/AboutVC"
                className="inline-flex items-center gap-1 text-[#004d40] font-medium text-xl transition-all duration-300 hover:text-[#00695c]"
              >
                Know More
                <ArrowUpRight
                  size={18}
                  className="transform transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>

              {/* Tooltip beside the link */}
              <div className=" absolute top-full left-0 mt-2 w-[300px] bg-[#004d40] text-white text-sm px-4 py-3 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-50">
                <div className="flex ">
                  <p>
                    Prof S Prasanna Sree, received the Nari Shakti Puraskar from
                    President of INDIA Ram Nath Kovind in New Delhi.
                  </p>
                  <img
                    src="./vcaward.png"
                    alt="vc image"
                    className="h-24 w-18"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutVC;
