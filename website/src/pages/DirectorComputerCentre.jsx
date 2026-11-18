import React from "react";
import { sreeramesh15, computer_lab_university, latha } from "../assets";
import { BackButton } from "../components/BackButton";

const DirectorComputerCentre = () => {
  return (
    <div className="px-4 sm:px-16 py-8">
      <BackButton />
      <h2 className="text-3xl font-bold text-teal-800 mb-4">
        Director, Computer Centre
      </h2>
      <div className="flex flex-col md:flex-row mt-4 sm:mt-6">
        <div className="bg-teal-700 flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-4 md:pb-6 lg:pt-6 lg:pb-4 px-4 sm:px-6 md:px-6 lg:px-8 w-full md:w-1/3 lg:w-1/4 shadow">
          <div className="relative w-50 h-55 sm:w-36 sm:h-50 md:w-40 md:h-50 lg:w-50 lg:h-57 overflow-hidden border-2 sm:border-[3px] md:border-4 border-white shadow-md">
            <img
              src={latha}
              alt="Director Computer Centre"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="text-white font-bold md:text-base lg:text-lg mt-2 text-center w-full px-2">
            Dr. D. Latha
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
           Director, Computer Centre
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
            8333832203
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
            {/* ccdirector@aknu.edu.in */}
          </div>
        </div>

        <div className="bg-[#f4e4c9] px-4 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-center py-4 sm:py-5 md:py-4 w-full md:w-2/3 lg:w-3/4 shadow">
          <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 text-center md:text-left">
            About Computer Centre
          </h3>
          <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[#374151] text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] text-justify leading-5 sm:leading-6 md:leading-6">
            <p className="text-justify">
              The University Computer Centre is the central technological hub of Adikavi Nannaya University, 
              providing essential IT infrastructure and support services. We manage the campus-wide network, 
              centralized computing facilities, and various enterprise software applications.
            </p>
            <p className="text-justify">
              Our mission is to empower the university community with advanced computing resources, 
              facilitating cutting-edge research, efficient administration, and high-quality 
              technology-enabled learning. We maintain high-speed internet connectivity and provide 
              technical expertise for university-wide digital initiatives.
            </p>
          </div>
        </div>
      </div>

   
    </div>
  );
};

export default DirectorComputerCentre;
