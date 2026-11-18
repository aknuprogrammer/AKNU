import React from "react";
import { Link } from "react-router-dom";
import { sreeramesh15, media_cell_studio, mediacell } from "../assets";
import { BackButton } from "../components/BackButton";

const MediaCell = () => {
  return (
    <div className="px-4 sm:px-16 py-8">
      <BackButton />
      <h2 className="text-3xl font-bold text-teal-800 mb-4">
        Media Cell
      </h2>
      <div className="flex flex-col md:flex-row mt-4 sm:mt-6">
        <div className="bg-teal-700 flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-4 md:pb-6 lg:pt-6 lg:pb-4 px-4 sm:px-6 md:px-6 lg:px-8 w-full md:w-1/3 lg:w-1/4 shadow">
          <div className="relative w-50 h-55 sm:w-36 sm:h-50 md:w-40 md:h-50 lg:w-50 lg:h-57 overflow-hidden border-2 sm:border-[3px] md:border-4 border-white shadow-md">
            <img
              src={mediacell}
              alt="Media Coordinator"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="text-white font-bold md:text-base lg:text-lg mt-2 text-center w-full px-2">
           Mr. P. Anand
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
           Media Cell Incharge
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
            9701293231
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
            {/* mediacell@aknu.edu.in */}
          </div>
        </div>

        <div className="bg-[#f4e4c9] px-4 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-center py-4 sm:py-5 md:py-4 w-full md:w-2/3 lg:w-3/4 shadow">
          <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 text-center md:text-left">
            About Media Cell
          </h3>
          <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[#374151] text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] text-justify leading-5 sm:leading-6 md:leading-6">
            <p className="text-justify">
              The Media Cell of Adikavi Nannaya University functions as the official communication and public relations wing of the university. It disseminates information regarding academic activities, seminars, conferences, convocations, cultural programmes, research initiatives, student achievements, extension activities, and institutional developments through press releases, social media platforms, and interactions with print and electronic media. The Media Cell also handles the weekly online magazine of the University, <i>Nannayavani</i>. 
            </p>
            <p className="text-justify">
              The Media Cell also plays a significant role in documenting university events, maintaining public outreach, strengthening institutional visibility, and coordinating communication between the university administration and the public. Important announcements relating to admissions, examinations, notifications, and university achievements are generally circulated through official channels managed or coordinated by the Media Cell.
            </p>
            
            <div className="mt-4 pt-2 flex justify-center md:justify-start">
              <Link
                to="/NannayaVani"
                className="bg-teal-700 text-white px-8 py-2.5 italic rounded-sm shadow-md hover:bg-teal-800 transition-all duration-300 font-semibold text-lg flex items-center gap-2 border-2 border-transparent hover:border-teal-600"
              >
                Visit Nannaya Vani
              </Link>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default MediaCell;
