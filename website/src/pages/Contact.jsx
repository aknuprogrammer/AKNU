import React from "react";
import Cards from "../components/contact/ContactCard";
import Map from "../components/contact/ContactMap";
import { BackButton } from "../components/BackButton";

export default function Contact() {
  return (
    <div className="bg-[#f4f7f6] py-10 px-16">
      <BackButton />
      <header className="">
        <h1 className="text-left text-teal-700 text-3xl md:text-3xl font-semibold mb-10 relative inline-block">
          Contact Us
          <span className="absolute bottom-0 left-0 w-[60px] h-[3px] bg-[#388E3C] translate-y-[5px]"></span>
        </h1>
      </header>

      <div className="flex flex-col items-center space-y-6 justify-center">
        <Cards />
        {/* <h1 className="self-start text-teal-700 text-3xl font-semibold ml-6">
          Connect with Us
        </h1>
        <Map /> */}
      </div>
    </div>
  );
}
