import React from "react";
import { ArrowUpRight } from "lucide-react";
import { sreeramesh15 } from "../assets";
import CollegeNavigator, {
  LinkNavigator,
} from "../components/CollegeNavigator";
import AknuCdcResources from "../components/AknuResources";
import { BackButton } from "../components/BackButton";
import CDCComplaintModal from "../components/CDCComplaintModal";
import { MessageSquare } from "lucide-react";

const AffiliatedColleges = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="px-4 sm:px-16 py-8">
      <BackButton />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-3xl font-bold text-teal-800">
          About College Development Council
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer flex items-center py-2 px-6 bg-teal-700 text-white font-bold rounded-lg shadow-lg hover:bg-teal-800 transition-all hover:shadow-xl"
        >
          <MessageSquare className="mr-2" size={20} />
          Raise Your Concern
        </button>
      </div>
      <div className="flex flex-col md:flex-row mt-4 sm:mt-6">
        <div className="bg-teal-700 flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-4 md:pb-6 lg:pt-6 lg:pb-4 px-4 sm:px-6 md:px-6 lg:px-8 w-full md:w-1/3 lg:w-1/4 shadow">
          <div className="relative w-50 h-55 sm:w-36 sm:h-50 md:w-40 md:h-50 lg:w-50 lg:h-57 overflow-hidden border-2 sm:border-[3px] md:border-4 border-white shadow-md">
            <img
              src={sreeramesh15}
              alt="Dr. A Matta Reddy"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="text-white font-bold md:text-base lg:text-lg mt-2 text-center w-full px-2">
            Prof. K. S Ramesh
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
            Dean
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1">
            +91 7093008474
          </div>
          <div className="text-white text-[14px] md:text-[14px] lg:text-[16px] text-center w-full px-2 mt-1 break-words">
            cdcanudata@aknu.edu.in / deancdc@aknu.edu.in
          </div>
        </div>

        <div className="bg-[#f4e4c9] px-4 sm:px-5 md:px-6 lg:px-8 flex flex-col justify-center py-4 sm:py-5 md:py-4 w-full md:w-2/3 lg:w-3/4 shadow">
          <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3 text-center md:text-left">
            About College Development Council
          </h3>
          <div className="space-y-2 sm:space-y-2.5 md:space-y-3 text-[#374151] text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] text-justify leading-5 sm:leading-6 md:leading-6">
            <p className="text-justify">
              College Development Council, CDC is a concept introduced by UGC in
              Universities with a vision to set up an effective interface
              between the UGC/APSCHE/NCTE/AICTE/BCI/PCI and the colleges
              affiliated to the respective University under it. CDC is one of
              the pillars of a University which brings all affiliated colleges
              under one roof in a formatted way and clear the ambiguities in a
              transparent way. CDC strengthens colleges in all aspects by
              enforcing to implement the norms and regulations prescribed by the
              UGC and other regulatory bodies.
            </p>
            <p className="text-justify">
              CDC at Adikavi Nannaya University(AKNU) was established in 2012
              with a vision to ensure proper planning and integrated development
              of affiliated colleges by providing necessary help and guidance.
              CDC tries to impart quality education to younger generations
              through educational institutions that are spread in East and West
              Godavari districts and is instrumental in promoting the quality of
              higher education. One of the objectives of CDC is to ensure
              standards of infrastructure of all Institutions with respect to
              the courses they run.
            </p>
          </div>
        </div>
      </div>
      <AknuCdcResources />
      <CollegeNavigator />

      <LinkNavigator />

      <CDCComplaintModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default AffiliatedColleges;
