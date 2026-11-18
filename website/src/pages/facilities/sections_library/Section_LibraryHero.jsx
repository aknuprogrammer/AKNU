import { BackButton } from "../../../components/BackButton";
import { centralLibrary } from "../../../assets/index.js";
export default function Section_LibraryHero() {
  return (
    <section className="w-full bg-white overflow-hidden relative">
      {/* Full-width hero image with gradient overlay */}
      <div className="w-full h-48 sm:h-64 md:h-80 lg:h-[60vh] overflow-hidden relative">
        <img
          src={centralLibrary}
          className="w-full h-full object-fill"
          alt="Dr BR Ambedkar Central Library"
        />
        {/* <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-teal-700/30 to-white/10"></div> */}

        {/* Floating content box */}
        {/* <div className="absolute bottom-10 left-10 right-10 max-w-2xl bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-xl border border-teal-700/20">
          <h1 className="text-3xl font-bold text-teal-800 mb-4">
            Dr BR Ambedkar Central Library
          </h1>
          <p className="text-gray-700 mb-3 text-[16px]">
            The intellectual heart of Adikavi Nannaya University, fostering
            academic excellence since 2006.
          </p>
        </div> */}
      </div>
      <div className="px-4 sm:px-16 pt-4">
        <BackButton />
      </div>
      {/* Main content section */}
      <div className="px-4 sm:px-16 py-4">
        <div className="space-y-4 sm:space-y-10 md:space-y-12">
          {/* About Our Library */}
          <div className="space-y-2 sm:space-y-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-800 pb-2">
              About Our Library
            </h2>
            <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base md:text-[16px] leading-6">
              Established in 2006 with a modest collection of 100 books, Dr BR
              Ambedkar Central Library now proudly houses over 100,000 books and
              resources serving students and scholars across disciplines.
            </p>
            <div className="space-y-2 pl-5">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-teal-700 pb-2">
                Library Highlights
              </h3>
              <ul className="space-y-2 sm:space-y-3 list-disc pl-5 text-gray-700 text-base sm:text-[16px]">
                <li>100,000+ volume collection</li>
                <li>1,200+ academic journals</li>
                <li>24/7 access reading room</li>
                <li>Modern study spaces</li>
                <li>Interdisciplinary resources</li>
              </ul>
            </div>
          </div>

          {/* The Space */}
          {/* <div className="space-y-2">
            <h3 className="text-3xl font-bold text-teal-800 pb-2">The Space</h3>
            <p className="text-gray-700 mb-3 text-[16px]">
              Spanning three floors in the iconic central building, our library
              features multiple reading rooms with comfortable seating designed
              to encourage study and scholarly discussion, including a 24/7
              reading room for campus residents.
            </p>
          </div> */}

          {/* Collections */}
          {/* <div className="space-y-2">
            <h3 className="text-3xl font-bold text-teal-800 pb-2">
              Collections
            </h3>
            <p className="text-gray-700 mb-3 text-[16px]">
              Organized by domain with dedicated sections for Engineering,
              Sciences, Arts & Humanities, and Social Sciences. We maintain
              subscriptions to 1,200+ leading academic journals across all major
              disciplines.
            </p>
          </div> */}
        </div>
      </div>
    </section>
  );
}
