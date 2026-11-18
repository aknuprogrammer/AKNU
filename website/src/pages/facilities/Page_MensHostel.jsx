import {
  FandA,
  Section_Mens_Warden,
  Section_Space,
} from "./sections_hostel_men/Mens_Hostel_Sections";
import Section_MenHostelHero from "./sections_hostel_men/Section_MenHostelHero";
import DropDownSection from "./components/DropDownSection";
import { useState } from "react";
import Section_FeeStructure from "./sections_hostel_men/Section_FeeStructure";

export default function Page_MensHostel() {
  const [currentSectionName, setCurrentSectionName] = useState(null);

  return (
    <main className="flex flex-col overflow-x-hidden">
      <div className="px-4 sm:px-16 py-8">
        <h1 className="text-3xl font-bold text-teal-800 mb-6 text-center">
          Mens Hostel
        </h1>
      </div>
      <Section_MenHostelHero
        title={"Mens Hostel"}
        imgLink="https://aknu.edu.in/images/Mens%20hostel-1.jpg"
        description="The residential heart of campus life, fostering camaraderie and character"
      />
      <div className="px-4 sm:px-16 py-8">
        <DropDownSection
          sectionTitle="The Space"
          isSectionOpen={currentSectionName === "space"}
          onCloseClick={() => setCurrentSectionName("space")}
          onOpenClick={() => setCurrentSectionName(null)}
        >
          <Section_Space />
        </DropDownSection>

        <DropDownSection
          sectionTitle="Facilities & Amenities"
          isSectionOpen={currentSectionName === "fANDa"}
          onCloseClick={() => setCurrentSectionName("fANDa")}
          onOpenClick={() => setCurrentSectionName(null)}
        >
          <FandA />
        </DropDownSection>

        <DropDownSection
          sectionTitle="Chief Warden - Mens Hostel"
          isSectionOpen={currentSectionName === "warden"}
          onCloseClick={() => setCurrentSectionName("warden")}
          onOpenClick={() => setCurrentSectionName(null)}
        >
          <Section_Mens_Warden />
        </DropDownSection>
        <DropDownSection
          sectionTitle="Fee Structure"
          isSectionOpen={currentSectionName === "fee"}
          onCloseClick={() => setCurrentSectionName("fee")}
          onOpenClick={() => setCurrentSectionName(null)}
        >
          <Section_FeeStructure />
        </DropDownSection>
        {/* <h1 className="text-[35px] mt-16 lg:text-[40px] text-center  text-teal-700">
          Gallary
        </h1> */}

        <Section_LibraryGallary />
      </div>
    </main>
  );
}

export function Section_LibraryGallary() {
  const mensHostelGallaryImageLinks = [
    {
      title: "Common Room",
      text: "A comfortable space to unwind, interact, and build camaraderie.",
      link: "https://media.istockphoto.com/id/182498079/photo/youth-hostel-dorm-room.jpg?s=1024x1024&w=is&k=20&c=gd5XwYE8KZ5mqBVrX8IoGWsKCwdx53BcgYTB9tp5rnw=",
    },
    {
      title: "Dining Hall",
      text: "Spacious and hygienic dining area offering nutritious meals daily.",
      link: "https://media.gettyimages.com/id/929432194/photo/the-barn-sutton-bonington-campus-nottingham-united-kingdom-architect-make-ltd-2015.jpg?s=1024x1024&w=gi&k=20&c=W7GW71jnBV24VEBxfqU-hv2G5tfVdC72CDfzJ3XtK8I=",
    },
    {
      title: "Study Area",
      text: "A quiet and well-equipped zone dedicated to focused academic work.",
      link: "https://chennai.vit.ac.in/wp-content/uploads/2020/01/hostel-banner-1536x695.jpg",
    },
    {
      title: "Recreational Space",
      text: "Facilities for indoor games and leisure activities to recharge and relax.",
      link: "https://www.stanzaliving.com/_next/image?url=https%3A%2F%2Fasset-cdn.stanzaliving.com%2Fstanza-living%2Fimage%2Fupload%2Ff_auto%2Cq_auto%2Fe_improve%2Fe_sharpen%3A10%2Fe_saturation%3A10%2Ff_auto%2Cq_auto%2Fv1662989502%2FWebsite%2FCMS-Uploads%2Fnq3qxi2skq3tyuxcwh4x.jpg&w=1920&q=75",
    },
  ];

  return (
    <section className="relative">
      {/* Interactive Background */}
      <div className="absolute  -z-10" />

      {/* Gallery Grid */}
      <div className="text-center w-full py-8">
        {/* Section Header */}
        <div className=" mb-16">
          <h2 className="text-3xl font-bold text-teal-800 mb-4">Gallery</h2>
          <p className="text-lg text-gray-600 ">
            Experience the perfect blend of comfort, camaraderie, and
            convenience in our Men's Hostel, designed to support your academic
            and personal growth.
          </p>
        </div>

        {/* Dynamic Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {mensHostelGallaryImageLinks.map((item, index) => (
            <div
              key={index}
              className="break-inside-avoid relative group cursor-pointer transform hover:scale-[1.02] transition-all duration-500"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden rounded-2xl shadow-xl">
                <img
                  src={item.link}
                  alt={item.title}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 p-6 w-full transition-all duration-500 group-hover:pb-8">
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <div className="h-px w-16 bg-teal-300 mb-3 transition-all duration-500 group-hover:w-24" />
                  <p className="text-white/80 text-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    {item.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
