import { aknuCollege } from "@/assets";
import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";

const AboutAKNU = () => {
  const [activeTab, setActiveTab] = useState("Key Highlights");
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="px-4 sm:px-16 pt-10 md:pt-16" id="about-aknu">
      <h2 className="text-3xl font-bold text-teal-800 mb-4">
        About Adikavi Nannaya University
      </h2>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Image Section */}
        <div className="lg:w-1/2 w-full">
          <div className="rounded-xl overflow-hidden shadow-md">
            <img
              src={aknuCollege}
              alt="VC image"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Text Section */}
        <div className="lg:w-1/2 w-full">
          <section>
            {/* Collapsible content (both paragraphs) to keep height aligned with image */}
            <div
              className={`relative ${expanded ? "" : "max-h-20 sm:max-h-24 lg:max-h-32 overflow-hidden"} transition-all duration-300`}
            >
              <p className="text-gray-700 mb-3 text-[16px] text-justify">
                Adikavi Nannaya University was established on April 22, 2006,
                through an Act of the Andhra Pradesh State Legislative Assembly,
                with the objective of addressing the higher education needs of
                the East Godavari, Kakinada, Dr. B. R. Ambedkar Konaseema,
                Alluri Sitharamaraju, West Godavari, and Eluru districts. It is
                a residential affiliating university with territorial
                jurisdiction over these six districts in Andhra Pradesh.
              </p>
              <p className="text-gray-700 mb-4 text-[16px] text-justify">
                The university is named in honor of Adikavi Nannaya, the first
                poet of Telugu literature and the 11th-century translator of the
                Mahabharata from Sanskrit to Telugu. He served as the court poet
                of King Rajaraja Narendra of the Eastern Chalukya dynasty.
                Located on the sacred banks of the River Godavari, the
                university was established as a fulfillment of the
                long-cherished aspirations of the people in this region.
              </p>
              {!expanded && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
              )}
            </div>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-[#004d40] font-medium underline mt-1 mb-4 cursor-pointer"
            >
              {expanded ? "Show less" : "Read more"}
            </button>

            {/* Tab Buttons */}
            <div className="flex flex-wrap gap-3 sm:gap-4 border-b border-gray-200 mb-4">
              {["Key Highlights", "vision", "mission"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative text-base sm:text-xl font-medium pb-2 px-3 transition-colors duration-300
        ${
          activeTab === tab
            ? "text-[#004d40] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#004d40] after:transition-all after:duration-300"
            : "text-gray-400 hover:text-[#004d40]"
        }
      `}
                  style={{ outline: "none" }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="text-gray-700 mb-6 text-[16px] leading-relaxed">
              {activeTab === "Key Highlights" && (
                <div className="gap-9">
                  <p className="mb-1">
                    📚<span className="mr-1"></span> 60+ UG & PG Programs
                  </p>
                  <p className="mb-1">
                    🧪 <span className="mr-1"></span> Research-driven Curriculum
                    with active PhD programs
                  </p>
                  <p className="mb-1">
                    🧑‍🏫 <span className="mr-1"></span> Experienced Faculty with
                    academic and industry expertise
                  </p>
                  <p className="mb-1">
                    🏫 <span className="mr-1"></span> Three Vibrant Campuses –
                    Rajamahendravaram, Kakinada and Tadepalligudem
                  </p>
                  <p className="mb-1">
                    🤝<span className="mr-1"></span> Collaborations & MoUs with
                    national and international institutions
                  </p>
                  <p className="mb-1">
                    📈<span className="mr-1"></span> Career Services with
                    placement training and industry tie-ups
                  </p>
                  <p className="mb-1">
                    🌱<span className="mr-1"></span> Student Life rich in NSS,
                    sports, and cultural activities
                  </p>
                </div>
              )}
              {activeTab === "vision" && (
                <p className="text-justify">
                  To achieve excellence in teaching, research and extension
                  services in the fields of Science, Arts, Commerce, Management,
                  Education and Engineering.
                </p>
              )}
              {activeTab === "mission" && (
                <p className="text-justify">
                  To be a center of excellence in higher education providing
                  quality education, skill development, and research.
                </p>
              )}
            </div>

            {/* <div className="mt-6">
              <a
                href="/about-us"
                className="inline-flex items-center gap-1 text-[#004d40] font-medium hover:underline text-xl group"
              >
                Know More
                <ArrowUpRight
                  size={18}
                  className="transform transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </a>
            </div> */}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutAKNU;
