import {
  Collections,
  MissionSection,
  TheSpace,
  VisionSection,
} from "./sections_library/Section_Library_VisionMission";
import Section_LibraryHero from "./sections_library/Section_LibraryHero";
import DropDownSection from "./components/DropDownSection";
import { useState } from "react";
import Section_Librarian, {
  Section_LibraryGallary,
  Section_LibraryStaff,
} from "./sections_library/Section_Librarian";

export default function Page_CentralLibrary() {
  const [currentSectionName, setCurrentSectionName] = useState(null);
  return (
    <main className="flex flex-col overflow-x-hidden">
      <div className="px-4 sm:px-16 py-8">
        <h1 className="text-3xl font-bold text-teal-800 mb-6 text-center">
          Dr BR Ambedkar Central Library
        </h1>
      </div>
      <Section_LibraryHero />
      <div className="px-4 sm:px-16 py-8">
        <DropDownSection
          sectionTitle="The Space"
          isSectionOpen={currentSectionName === "space"}
          onCloseClick={() => setCurrentSectionName("space")}
          onOpenClick={() => setCurrentSectionName(null)}
        >
          <TheSpace />
        </DropDownSection>
        <DropDownSection
          sectionTitle="Collections"
          isSectionOpen={currentSectionName === "collections"}
          onCloseClick={() => setCurrentSectionName("collections")}
          onOpenClick={() => setCurrentSectionName(null)}
        >
          <Collections />
        </DropDownSection>

        <DropDownSection
          sectionTitle="Librarian"
          isSectionOpen={currentSectionName === "lib"}
          onCloseClick={() => setCurrentSectionName("lib")}
          onOpenClick={() => setCurrentSectionName(null)}
        >
          <Section_Librarian />
        </DropDownSection>
        <DropDownSection
          sectionTitle="Vision"
          isSectionOpen={currentSectionName === "vision"}
          onCloseClick={() => setCurrentSectionName("vision")}
          onOpenClick={() => setCurrentSectionName(null)}
        >
          <VisionSection />
        </DropDownSection>
        <DropDownSection
          sectionTitle="Mission"
          isSectionOpen={currentSectionName === "mission"}
          onCloseClick={() => setCurrentSectionName("mission")}
          onOpenClick={() => setCurrentSectionName(null)}
        >
          <MissionSection />
        </DropDownSection>

        <DropDownSection
          sectionTitle="Library Staff"
          isSectionOpen={currentSectionName === "staff"}
          onCloseClick={() => setCurrentSectionName("staff")}
          onOpenClick={() => setCurrentSectionName(null)}
        >
          <Section_LibraryStaff />
        </DropDownSection>

        {/* <h1 className="text-[35px] lg:text-[40px] text-center  text-teal-700">
          Gallary
        </h1> */}
        <Section_LibraryGallary />
      </div>
    </main>
  );
}
