import {
  FandA,
  Section_Womens_Warden,
  Section_Womens_Space,
} from "./sections_hostel_men/Mens_Hostel_Sections";
import DropDownSection from "./components/DropDownSection";
import { useState } from "react";
import Section_FeeStructure from "./sections_hostel_men/Section_FeeStructure";
import Section_GirlsHostelHero from "./sections_hostel_men/Section_GirlsHostelHero";
// import { TheSpace } from "./sections_library/Section_Library_VisionMission";

export default function Page_GirlsHostel() {
  const [currentSectionName, setCurrentSectionName] = useState(null);

  return (
    <main className="flex flex-col overflow-x-hidden">
      <div className="px-4 sm:px-16 py-8">
        <h1 className="text-3xl font-bold text-teal-800 mb-6 text-center">
          Women's Hostel
        </h1>
      </div>
      <Section_GirlsHostelHero />
      <div className="px-4 sm:px-16 py-8">
        <DropDownSection
          sectionTitle="The Space"
          isSectionOpen={currentSectionName === "space"}
          onCloseClick={() => setCurrentSectionName("space")}
          onOpenClick={() => setCurrentSectionName(null)}
        >
          <Section_Womens_Space />
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
          sectionTitle="Chief Warden - Women's Hostel"
          isSectionOpen={currentSectionName === "warden"}
          onCloseClick={() => setCurrentSectionName("warden")}
          onOpenClick={() => setCurrentSectionName(null)}
        >
          <Section_Womens_Warden />
        </DropDownSection>
        <DropDownSection
          sectionTitle="Fee Structure"
          isSectionOpen={currentSectionName === "fee"}
          onCloseClick={() => setCurrentSectionName("fee")}
          onOpenClick={() => setCurrentSectionName(null)}
        >
          <Section_FeeStructure />
        </DropDownSection>
        {/* <h1 className="text-[35px] lg:text-[40px] text-center mt-8  text-teal-700">
          Gallary
        </h1> */}

        <Section_LibraryGallary />
      </div>
    </main>
  );
}

export function Section_LibraryGallary() {
  const womensHostelGallaryImageLinks = [
    {
      title: "Lounge Area",
      text: "A cozy and inviting space to connect and relax with friends.",
      link: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Hygienic Kitchen",
      text: "Modern facilities ensuring healthy and hygienic meal preparations.",
      link: "https://images.unsplash.com/photo-1593136573819-c3b57b8caf29?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Reading Room",
      text: "A serene environment designed to enhance focus and learning.",
      link: "https://media.gettyimages.com/id/509114480/photo/beautiful-young-woman-working-at-home.jpg?s=1024x1024&w=gi&k=20&c=a0JXjDNcMQuvOfYQeP6CeOVKzPf2z-0G-iNbr4U3i3s=",
    },
    {
      title: "Relaxation Space",
      text: "A tranquil spot for meditation and mental well-being.",
      link: "https://media.istockphoto.com/id/1421420537/photo/peace-relax-and-happy-mindset-of-a-woman-from-indonesia-taking-a-mind-and-meditation-home.jpg?s=1024x1024&w=is&k=20&c=RkED6EynXPa-gRYwo906T5J__Bx6NkH-F-9WIIABFRg=",
    },
  ];

  return (
    <section className="relative">
      {/* Interactive Background */}
      <div className="absolute -z-10" />

      {/* Gallery Grid */}
      <div className="text-center w-full py-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-teal-800 mb-4">
            Gallery
          </h2>
          <p className="text-lg text-gray-600 mx-auto">
            Discover a secure and nurturing environment at our Women’s Hostel,
            where every amenity is tailored to foster personal and academic
            excellence.
          </p>
        </div>

        {/* Dynamic Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {womensHostelGallaryImageLinks.map((item, index) => (
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
