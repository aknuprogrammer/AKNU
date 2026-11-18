import { BackButton } from "../../../components/BackButton";

export default function Section_GirlsHostelHero() {
  return (
    <section className="w-full overflow-hidden relative p-0 m-0 leading-none bg-transparent">
      {/* Full-width hero image with gradient overlay */}
      <div className="w-full h-48 sm:h-64 md:h-80 lg:h-[60vh] overflow-hidden relative">
        <img
          src="https://old.aknu.edu.in/images/Womens%20Hostel.jpg"
          className="block w-full h-full object-cover"
          style={{ objectPosition: 'center 75%' }}
          alt="Womens Hostel"
        />
        {/* <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-teal-700/30 to-white/10"></div> */}
        {/* Floating content box */}
        {/* <div className="absolute bottom-10 left-10 right-10 max-w-2xl bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-xl border border-teal-700/20">
          <h1 className="text-3xl font-bold text-teal-800 mb-4">
            Womens Hostel
          </h1>
          <p className="text-gray-700 mb-3 text-[16px]">
            The residential heart of campus life, fostering camaraderie and
            character
          </p>
        </div> */}
      </div>
      <div className="px-4 sm:px-16 pt-4">
        <BackButton />
      </div>
      {/* Main content section */}
      <div className="px-4 sm:px-16 py-4">
        <div className="space-y-12">
          {/* About the Women's Hostel */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-teal-800 pb-2">
              About the Women's Hostel
            </h2>
            <p className="text-gray-700 text-base sm:text-[16px] leading-6 text-justify">
              Designed to offer a safe, supportive, and enriching residential
              experience, the Women’s Hostel at Adikavi Nannaya University serves
              as a vibrant hub for students from diverse backgrounds. It fosters
              personal growth, academic focus, and lasting friendships in a
              disciplined yet welcoming environment.
            </p>
            <div className="space-y-2 pl-5">
              <h3 className="text-xl sm:text-2xl font-semibold text-teal-700 pb-2">
                Hostel Highlights
              </h3>
              <ul className="space-y-2 sm:space-y-3 list-disc pl-5 text-gray-700 text-base sm:text-[16px]">
                <li>Supportive and inclusive student community</li>
                <li>Focus on discipline, well-being, and academics</li>
                <li>Proximity to classrooms and campus facilities</li>
                <li>Regular health check-ups and emergency care access</li>
                <li>Safe and structured living environment</li>
              </ul>
            </div>
          </div>

          {/* The Space */}
          {/* <div className="space-y-4">
            <h3 className="text-xl md:text-3xl  font-medium text-teal-700 border-b border-teal-700/30 pb-2">
              The Space
            </h3>
            <p className="text-gray-700 text-base text-[16px] leading-relaxed">
              Located within easy reach of the academic blocks, the hostel
              comprises well-ventilated rooms, spacious common areas, and
              dedicated study zones. It is equipped with essential amenities
              including a hygienic dining hall, recreational facilities, and
              24/7 security to ensure the well-being and comfort of all
              residents.
            </p>
          </div> */}

          {/* Facilities & Amenities */}
          {/* <div className="space-y-4">
            <h3 className="text-xl md:text-3xl  font-medium text-teal-700 border-b border-teal-700/30 pb-2">
              Facilities & Amenities
            </h3>
            <ul className="list-disc pl-5 text-gray-700 text-base text-[16px] space-y-2">
              <li>Fully furnished rooms (single & shared occupancy)</li>
              <li>Nutritious meals served daily in the dining hall</li>
              <li>Wi-Fi-enabled study areas and reading rooms</li>
              <li>Common room with TV, newspapers, and indoor games</li>
              <li>Round-the-clock security and resident wardens</li>
              <li>Clean drinking water and regular housekeeping</li>
            </ul>
          </div> */}

          {/* Hostel Highlights */}
          {/* <div className="space-y-4">
            <h3 className="text-xl md:text-3xl  font-medium text-teal-700 border-b border-teal-700/30 pb-2">
              Hostel Highlights
            </h3>
            <ul className="list-disc pl-5 text-gray-700 text-base text-[16px] space-y-2">
              <li>Supportive and inclusive student community</li>
              <li>Focus on discipline, well-being, and academics</li>
              <li>Proximity to classrooms and campus facilities</li>
              <li>Regular health check-ups and emergency care access</li>
              <li>Safe and structured living environment</li>
            </ul>
          </div> */}
        </div>
      </div>
    </section>
  );
}
