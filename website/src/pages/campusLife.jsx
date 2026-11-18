import React, { useState } from "react";
import aknuPrograms from "../siteData/campuslifeData.js";
import { ChevronUp } from "lucide-react";
import PrestigiousPartnerships from "@/components/home/PrestigiousPartnerships.jsx";
import { Volleyball } from "lucide-react";
import { BackButton } from "../components/BackButton.jsx";
// import EventCard from "@/components/EventCard";

function ProgramCard({ heading, content, navigation }) {
  return (
    <div className="relative bg-[#8BCBB712] rounded-lg p-6 flex items-center justify-between shadow-md max-w-xl">
      <div>
        <h3 className="text-xl font-bold text-teal-700 mb-2">{heading}</h3>
        <p className="text-[#003736] text-base">{content}</p>
      </div>
      <div className="absolute top-4 right-4">
        <svg width="32" height="32" fill="#007367" viewBox="0 0 24 24">
          <path d="M10 17l5-5-5-5v10z" />
        </svg>
      </div>
    </div>
  );
}

function Infrastructure() {
  const [activeFacility, setActiveFacility] = useState("Classrooms");
  const facilityImages = {
    Classrooms: ["", "/class2.png", "/class3.png"],
    Labs: ["/lab1.png", "/lab2.png", "/lab3.png"],
    "Research Centre": ["/rc1.png", "/rc2.png", "/rc3.png"],
  };

  return (
    <div className="w-[90%] mt-auto">
      <h2 className="text-3xl font-bold text-teal-800 mb-4">
        Infrastructure and Facilities
      </h2>
      <div className="flex flex-row gap-6 mb-6">
        {["Classrooms", "Labs", "Research Centre"].map((item, idx) => (
          <button
            key={item}
            onClick={() => setActiveFacility(item)}
            className={`px-4 py-2 font-semibold border-b-4 ${
              activeFacility === item
                ? "border-teal-700 text-teal-700 bg-white"
                : "border-transparent text-[#4e554e]"
            } hover:text-teal-700 hover:border-b-4 hover:border-teal-700 transition-colors duration-200`}
            style={{
              borderRadius:
                idx === 0 ? "0.5rem 0 0 0" : idx === 2 ? "0 0 0.5rem 0" : "0",
              minWidth: "120px",
            }}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {facilityImages[activeFacility].map((img, idx) => (
          <div key={img} className="flex flex-col items-center">
            <img
              src={img}
              alt={activeFacility + " " + (idx + 1)}
              className="w-full h-56 object-cover shadow rounded-[1vh]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Sports({ campus }) {
  return (
    <div className="w-[95%] mt-12">
      <h2 className="text-3xl font-bold text-teal-800 mb-2">
        Sports at {campus}
      </h2>
      <p className="text-[#374151] text-base mb-6 max-w-2xl">
        In addition to providing state-of-the-art sporting facilities, we also
        extend Sports Scholarships to athletes who excel in their chosen sports.
      </p>
      <div className="flex flex-row flex-wrap gap-[5vh]">
        {/* Volleyball */}
        <div className="flex-1 min-w-[400px] max-w-xs  rounded-xl p-6 flex flex-col items-start shadow-md relative">
          <div className="bg-teal-700 rounded-full p-2 mb-4 flex items-center justify-center">
            {/* Volleyball Icon */}
            <Volleyball color="white" />
          </div>
          <h3 className="text-lg font-bold text-teal-700 mb-1">Volleyball</h3>
          <p className="text-[#003736] text-sm">
            Experience thrilling matches on our professional volleyball court,
            equipped with high-quality flooring and ample seating.
          </p>
        </div>
        {/* Gymnasium */}
        <div className="flex-1 min-w-[400px] max-w-xs  rounded-xl p-6 flex flex-col items-start shadow-md relative">
          <div className="bg-teal-700 rounded-full p-2 mb-4 flex items-center justify-center">
            <Volleyball color="white" />
          </div>
          <h3 className="text-lg font-bold text-teal-700 mb-1">Gymnasium</h3>
          <p className="text-[#003736] text-sm">
            State-of-the-art fitness center with modern equipment to meet all
            your fitness needs.
          </p>
        </div>
        {/* Cricket */}
        <div className="flex-1 min-w-[400px] max-w-xs rounded-xl p-6 flex flex-col items-start shadow-md relative">
          <div className="bg-teal-700 rounded-full p-2 mb-4 flex items-center justify-center">
            <Volleyball color="white" />
          </div>
          <h3 className="text-lg font-bold text-teal-700 mb-1">Cricket</h3>
          <p className="text-[#003736] text-sm">
            Experience our expansive cricket ground with lush outfields,
            well-prepared pitches, and practice nets.
          </p>
        </div>
        {/* Throwball */}
        <div className="flex-1 min-w-[400px] max-w-xs  rounded-xl p-6 flex flex-col items-start shadow-md relative">
          <div className="bg-teal-700 rounded-full p-2 mb-4 flex flex-row items-center justify-center">
            <Volleyball color="white" />
          </div>
          <h3 className="text-lg font-bold text-teal-700 mb-1">Throwball</h3>
          <p className="text-[#003736] text-sm">
            Dedicated court designed for both casual and competitive play.
          </p>
        </div>
      </div>
    </div>
  );
}
export default function CampusLife() {
  const [showAll, setShowAll] = useState(false);
  const [activeProg, setActiveProg] = useState("Undergraduate");
  const [activeCity, setActiveCity] = useState("Rajamahendravaram");
  const [activeFacility, setActiveFacility] = useState("Classrooms");
  const navCities = ["Rajamahendravaram", "Tadepalligudem", "Kakinada"];
  const progMap = { Undergraduate: "UG", Postgraduate: "PG", "Ph.D": "PhD" };
  const programList = aknuPrograms[activeCity]?.[progMap[activeProg]] || [];
  const visiblePrograms = showAll ? programList : programList.slice(0, 4);

  return (
    <div className="w-full min-h-screen flex flex-col items-center mt-6 overflow-x-hidden bg-white">
      {" "}
      <div className="w-[95%] pb-4">
      <BackButton />
      </div>
      <div className="relative w-[95%]">
        <img
          src="./lifegitam.png"
          alt="Life @AKNU"
          className="w-full object-cover shadow-md"
          style={{
            borderRadius: "1.2vh",
            borderTopLeftRadius: "3vh",
          }}
        />
        <h1
          className="absolute top-0 left-0 px-6 py-2 bg-white text-teal-700 font-bold text-3xl rounded-br-[1.5rem] "
          style={{
            letterSpacing: "0.05em",
            zIndex: 10,
            height: "56px",
            display: "flex",
            alignItems: "center",
          }}
        >
          Life @AKNU
        </h1>
      </div>
      <div className="flex flex-row gap-15 w-[95%] mt-6 justify-start">
        {navCities.map((city, idx) => (
          <button
            key={city}
            onClick={() => setActiveCity(city)}
            className={`px-4 py-2 font-semibold text-[#4e554e] ${
              activeCity === city
                ? "border-b-4 border-teal-700 bg-white text-teal-700"
                : "border-b-4 border-transparent"
            } hover:text-teal-700 hover:border-b-4 hover:border-teal-700 transition-colors duration-200`}
            style={{
              borderRadius:
                idx === 0
                  ? "0.5rem 0 0 0"
                  : idx === navCities.length - 1
                    ? "0 0 0.5rem 0"
                    : "0",
              minWidth: "120px",
            }}
          >
            {city}
          </button>
        ))}
      </div>
      {activeCity === "Rajamahendravaram" && (
        <div className="w-[95%]">
          <div className=" flex flex-col md:flex-row items-stretch mt-5 gap-6">
            <div className="flex-1 flex flex-col justify-start">
              <h1
                className="px-6 py-2 bg-white text-teal-700 font-bold text-3xl  "
                style={{ letterSpacing: "0.05em" }}
              >
                Experience Rajamahendravaram
              </h1>
              <p className="pl-6 text-[#374151] text-base leading-7 text-justify w-full mb-0">
                {" "}
                Adikavi Nannaya University was established on 22nd April 2006,
                by an Act of the Andhra Pradesh State Legislative Assembly to
                meet the higher education needs of East Godavari, Kakinada, Dr B
                R Ambedkar Konaseema, Alluri Sitharamaraju, West Godavari and
                Eluru districts. It is an affiliating residential university
                with territorial jurisdiction over East Godavari, Kakinada, Dr B
                R Ambedkar Konaseema, Alluri Sitharamaraju, West Godavari and
                Eluru districts of Andhra Pradesh. named after the first poet of
                Telugu culture, Nannaya (the eleventh century translator of
                Mahabharata from Sanskrit to Telugu), the court poet of Rajah
                RajahNarendra, (the Eastern Chalukya King). The University was
                established to fulfil the cherished dream of the people of this
                region, on the sacred banks of River Godavari.
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <img
                src="./life.jpg"
                alt="Campus Life"
                className="w-full max-w-md rounded-[1.2vh] shadow-md object-cover"
              />
            </div>
          </div>
          <div className="w-[95%] mt-10">
            <h2 className="text-3xl font-bold text-teal-800 mb-4">
              Top Programmes at {activeCity}
            </h2>
            <div className="flex flex-row gap-6 mb-6">
              {["Undergraduate", "Postgraduate", "Ph.D"].map((prog, idx) => (
                <button
                  key={prog}
                  onClick={() => setActiveProg(prog)}
                  className={`px-4 py-2 font-semibold ${
                    activeProg === prog
                      ? "border-b-4 border-teal-700 bg-white text-teal-700"
                      : "border-b-4 border-transparent text-[#4e554e]"
                  } hover:text-teal-700 hover:border-b-4 hover:border-teal-700 transition-colors duration-200`}
                  style={{
                    borderRadius:
                      idx === 0
                        ? "0.5rem 0 0 0"
                        : idx === 2
                          ? "0 0 0.5rem 0"
                          : "0",
                    minWidth: "120px",
                  }}
                >
                  {prog}
                </button>
              ))}
            </div>
            {/* Programme Card Example */}
            {programList.length === 0 ? (
              <div className="text-gray-500">No programmes available.</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {visiblePrograms.map((prog, i) => (
                    <ProgramCard
                      key={prog}
                      heading={prog}
                      content="Develop a solid foundation in economic theory and its applications in real-world scenarios."
                    />
                  ))}
                </div>
                {programList.length > 4 && (
                  <div className="flex justify-center mt-4">
                    <button
                      className={`px-6 py-2 bg-white text-teal-700 rounded font-semibold flex items-center gap-2 transition-colors duration-200`}
                      onClick={() => setShowAll(!showAll)}
                    >
                      {showAll ? "Show Less" : "View More"}
                      <span
                        className={`transform transition-transform duration-300 ${
                          showAll ? "rotate-180" : "rotate-0"
                        }`}
                        style={{ display: "inline-block" }}
                      >
                        <ChevronUp size={20} color="#007367" />
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          {/* Infrastructure and Facilities Section */}
          <Infrastructure />
          <Sports campus={activeCity} />
        </div>
      )}
      {activeCity === "Tadepalligudem" && (
        <div className="w-[95%]">
          <div className="flex flex-col md:flex-row items-stretch mt-8 gap-6">
            <div className="flex-1 flex flex-col justify-start">
              <h1
                className="px-6 py-2 bg-white text-teal-700 font-bold text-3xl"
                style={{ letterSpacing: "0.05em" }}
              >
                Experience {activeCity}
              </h1>
              <p className="pl-6 text-[#374151] text-base leading-7 text-justify w-full mb-0">
                {/* Replace this with actual content for {activeCity} */}
                {activeCity === "Tadepalligudem"
                  ? "Welcome to the Tadepalligudem campus of Adikavi Nannaya University. This campus offers a vibrant academic environment, modern facilities, and a supportive community for students to excel in their studies and extracurricular activities."
                  : "Discover the Kakinada campus of Adikavi Nannaya University, known for its academic excellence, innovative research, and a lively campus life that fosters holistic development."}
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <img
                src="./life.jpg"
                alt="Campus Life"
                className="w-full max-w-md rounded-[1.2vh] shadow-md object-cover"
              />
            </div>
          </div>
          <div className="w-[95%] mt-10">
            <h2 className="text-3xl font-bold text-teal-800 mb-4">
              Top Programmes at {activeCity}
            </h2>
            <div className="flex flex-row gap-6 mb-6">
              {["Undergraduate", "Postgraduate", "Ph.D"].map((prog, idx) => (
                <button
                  key={prog}
                  onClick={() => setActiveProg(prog)}
                  className={`px-4 py-2 font-semibold ${
                    activeProg === prog
                      ? "border-b-4 border-teal-700 bg-white text-teal-700"
                      : "border-b-4 border-transparent text-[#4e554e]"
                  } hover:text-teal-700 hover:border-b-4 hover:border-teal-700 transition-colors duration-200`}
                  style={{
                    borderRadius:
                      idx === 0
                        ? "0.5rem 0 0 0"
                        : idx === 2
                          ? "0 0 0.5rem 0"
                          : "0",
                    minWidth: "120px",
                  }}
                >
                  {prog}
                </button>
              ))}
            </div>
            {programList.length === 0 ? (
              <div className="text-gray-500">No programmes available.</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {visiblePrograms.map((prog, i) => (
                    <ProgramCard
                      key={prog}
                      heading={prog}
                      content="Develop a solid foundation in economic theory and its applications in real-world scenarios."
                    />
                  ))}
                </div>
                {programList.length > 4 && (
                  <div className="flex justify-center mt-4">
                    <button
                      className={`px-6 py-2 bg-white text-teal-700 rounded font-semibold  flex items-center gap-2 transition-colors duration-200`}
                      onClick={() => setShowAll(!showAll)}
                    >
                      {showAll ? "Show Less" : "View More"}
                      <span
                        className={`transform transition-transform duration-300 ${
                          showAll ? "rotate-180" : "rotate-0"
                        }`}
                        style={{ display: "inline-block" }}
                      >
                        <ChevronUp size={20} color="#007367" />
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <Infrastructure />
          <Sports campus={activeCity} />
        </div>
      )}
      {activeCity === "Kakinada" && (
        <div className="w-[95%]">
          <div className="flex flex-col md:flex-row items-stretch mt-8 gap-6">
            <div className="flex-1 flex flex-col justify-start">
              <h1
                className="px-6 py-2 bg-white text-teal-700 font-bold text-3xl"
                style={{ letterSpacing: "0.05em" }}
              >
                Experience {activeCity}
              </h1>
              <p className="pl-6 text-[#374151] text-base leading-7 text-justify w-full mb-0">
                {/* Replace this with actual content for {activeCity} */}
                {activeCity === "Tadepalligudem"
                  ? "Welcome to the Tadepalligudem campus of Adikavi Nannaya University. This campus offers a vibrant academic environment, modern facilities, and a supportive community for students to excel in their studies and extracurricular activities."
                  : "Discover the Kakinada campus of Adikavi Nannaya University, known for its academic excellence, innovative research, and a lively campus life that fosters holistic development."}
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <img
                src="./life.jpg"
                alt="Campus Life"
                className="w-full max-w-md rounded-[1.2vh] shadow-md object-cover"
              />
            </div>
          </div>
          <div className="w-[95%] mt-10">
            <h2 className="text-3xl font-bold text-teal-800 mb-4">
              Top Programmes at {activeCity}
            </h2>
            <div className="flex flex-row gap-6 mb-6">
              {["Undergraduate", "Postgraduate", "Ph.D"].map((prog, idx) => (
                <button
                  key={prog}
                  onClick={() => setActiveProg(prog)}
                  className={`px-4 py-2 font-semibold ${
                    activeProg === prog
                      ? "border-b-4 border-teal-700 bg-white text-teal-700"
                      : "border-b-4 border-transparent text-[#4e554e]"
                  } hover:text-teal-700 hover:border-b-4 hover:border-teal-700 transition-colors duration-200`}
                  style={{
                    borderRadius:
                      idx === 0
                        ? "0.5rem 0 0 0"
                        : idx === 2
                          ? "0 0 0.5rem 0"
                          : "0",
                    minWidth: "120px",
                  }}
                >
                  {prog}
                </button>
              ))}
            </div>
            {programList.length === 0 ? (
              <div className="text-gray-500">No programmes available.</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {visiblePrograms.map((prog, i) => (
                    <ProgramCard
                      key={prog}
                      heading={prog}
                      content="Develop a solid foundation in economic theory and its applications in real-world scenarios."
                    />
                  ))}
                </div>
                {programList.length > 4 && (
                  <div className="flex justify-center mt-4">
                    <button
                      className={`px-6 py-2 bg-white text-teal-700 rounded font-semibold   flex items-center gap-2 transition-colors duration-200`}
                      onClick={() => setShowAll(!showAll)}
                    >
                      {showAll ? "Show Less" : "View More"}
                      <span
                        className={`transform transition-transform duration-300 ${
                          showAll ? "rotate-180" : "rotate-0"
                        }`}
                        style={{ display: "inline-block" }}
                      >
                        <ChevronUp size={20} color="#007367" />
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <br />
          <div className="w-[95%] mt-12">
            <Infrastructure />
          </div>
          <Sports campus={activeCity} />
        </div>
      )}
      <div className="w-[97%]">
        <PrestigiousPartnerships />
      </div>
      <div className="w-[95%]">
        {" "}
        <h2 className="text-3xl font-bold text-teal-800 mb-4">
          Explore, Engage & Enjoy
        </h2>
        <p className="text-[#374151] w-[90%] text-base leading-7 text-justify mb-4">
          We believe in nurturing students to grow beyond academic and career
          goals by encouraging them to use their unique perspectives to shape
          important conversations and engage with the community. To support
          this, we provide a balanced mix of academics, sports, engagement, and
          recreation, creating a holistic learning experience.
        </p>
      </div>
      <div className="w-[95%]">
        <div className="flex flex-row flex-wrap gap-1">
          {" "}
          {/* Student Culture */}
          <div className="relative group overflow-hidden flex items-start">
            <img
              src="/club1.webp"
              alt="Student Culture"
              className="w-full h-64 object-cover transition-transform duration-500 group-hover:-translate-y-4 group-hover:scale-105 rounded-lg ml-0"
            />
            <div className="absolute bottom-0 left-0 bg-transparent bg-opacity-80 px-4 py-2 m-3 rounded text-[#ffff] font-bold text-lg shadow group-hover:translate-y-[-10px] transition-all duration-500">
              Clubs
            </div>
          </div>
          {/* Sports & Athletics */}
          <div className="relative group overflow-hidden flex items-start">
            {" "}
            <img
              src="/club3.webp"
              alt="Sports & Athletics"
              className="w-full h-64 object-cover transition-transform duration-500 group-hover:-translate-y-4 group-hover:scale-105 rounded-lg ml-0"
            />
            <div className="absolute bottom-0 left-0 px-4 py-2 m-3 rounded text-white font-bold text-lg shadow group-hover:translate-y-[-10px] transition-all duration-500">
              Student Culture
            </div>
          </div>
          <br />
          {/* Andover Effect */}
          <div className="relative group overflow-hidden flex items-start">
            <img
              src="/club4.webp"
              alt="Andover Effect"
              className="w-full h-64 object-cover transition-transform duration-500 group-hover:-translate-y-4 group-hover:scale-105 rounded-lg ml-0"
            />
            <div className="absolute bottom-0 left-0 bg-transparent bg-opacity-80 px-4 py-2 m-3 rounded text-[#ffff] font-bold text-lg shadow group-hover:translate-y-[-10px] transition-all duration-500">
              Sports & Athletics
            </div>
          </div>
        </div>
      </div>
      <br />
      {/* <div className=" w-[95%]">
        <h2 className="text-3xl font-bold text-teal-800 mb-4">
          Upcoming Events
        </h2>
        <div className="flex flex-row flex-wrap gap-5">
          <EventCard
            date="8th June"
            venue="Johns Hopkins Auditorium"
            title="REFRACTIVE CATARACT SURG"
            description="Department of Ophthalmology, GIMSR is planning to organize a CME in as…"
            onViewDetails={() => {}}
            onRegister={() => {
      
            }}
          />
          <EventCard
            date="8th June"
            venue="Johns Hopkins Auditorium"
            title="REFRACTIVE CATARACT SURG"
            description="Department of Ophthalmology, GIMSR is planning to organize a CME in as…"
            onViewDetails={() => {
             
            }}
            onRegister={() => {
            
            }}
          />
          <EventCard
            date="8th June"
            venue="Johns Hopkins Auditorium"
            title="REFRACTIVE CATARACT SURG"
            description="Department of Ophthalmology, GIMSR is planning to organize a CME in as…"
            onViewDetails={() => {
            
            }}
            onRegister={() => {
              
            }}
          />
        </div>
        <br />
        <br />
        <br />
        <br />
      </div> */}
    </div>
  );
}
