import React, { useState } from "react";
import { sajanaraj17 } from "../../../assets";
const libraryStaff = [
  { name: "Dr.Simhachalam Terli", designation: "Assistant Librarian" },
  { name: "Mr.Vijaya Kumar Balla", designation: "Library Assistant" },
  { name: "Mr.Sateesh Sunkara", designation: "Junior Assistant" },
  { name: "Mr.Durga Prasad Setti", designation: "Record Assistant" },
  { name: "Mrs.G.Surya Kumari", designation: "Sweeper" },
];
const gallaryImageLinks = [
  {
    title: "Digital Library",
    text: "Access a vast collection of e-resources and digital archives.",
    link: "https://old.aknu.edu.in/images/Central%20FC%20Images/1%20(1).jpg",
  },
  {
    title: "Reading Room",
    text: "A peaceful space dedicated to focused study and research.",
    link: "https://old.aknu.edu.in/images/Central%20FC%20Images/1%20(15).jpg",
  },
  {
    title: "Magazines",
    text: "Stay updated with the latest publications and periodicals.",
    link: "https://old.aknu.edu.in/images/Central%20FC%20Images/1%20(8.).jpg",
  },
  {
    title: "Library",
    text: "Explore our extensive collection of books and resources.",
    link: "https://old.aknu.edu.in/images/Central%20FC%20Images/1%20(3).jpg",
  },
];

const LibraryStaffCard = ({ name, designation }) => (
  <div className="border-2 border-teal-600 rounded-lg p-[20px]">
    <div className="text-[26px] text-black font-bold">{name}</div>
    <div className="text-gray-700">
      <p className="text-[15px]">Designation</p>
      <div className="text-[16px]">{designation}</div>
    </div>
  </div>
);

export default function Section_Librarian() {
  return (
    <div className="flex flex-col md:flex-row w-full min-h-[260px]">
      <div className="bg-teal-700 md:w-1/4 flex flex-col items-center justify-start pt-6 sm:pt-8 md:pt-10 pb-4 sm:pb-5 md:pb-6 px-4">
        <img
          src={sajanaraj17}
          alt="Dr. N Sajna Raj"
          className="w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] md:w-[210px] md:h-[210px] object-cover bg-white border-2 sm:border-3 md:border-4 border-white mb-3 sm:mb-4 shadow-md rounded-md"
        />
        <div className="text-white font-bold text-base sm:text-lg md:text-xl mt-3 sm:mt-4 mb-1 text-center w-full break-words">
          Dr. N Sajna Raj
        </div>
        <div className="text-white text-sm sm:text-base md:text-lg text-center w-full mt-2 sm:mt-2.5">
          Coordinator, Library Affairs
        </div>
        <div className="text-white text-xs sm:text-sm md:text-base mb-1 text-center w-full mt-3 sm:mt-4 break-words">
          Phone: +91 1234567890
        </div>
        <div className="text-white text-xs sm:text-sm md:text-base text-center w-full break-words">
          Email: librarian@university.edu
        </div>
      </div>

      <div className="bg-white md:w-3/4 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-center">
        <div className="font-bold text-teal-700 text-base sm:text-lg mb-3 sm:mb-4">
          About The Librarian
        </div>
        <div className="text-[#374151] text-sm sm:text-base leading-relaxed text-justify">
          Dr. N Sajna Raj serves as the Coordinator of Library Affairs at
          Adikavi Nannaya University. With extensive experience in library
          sciences, Dr. Raj oversees the operations of the Dr BR Ambedkar
          Central Library, ensuring it meets the academic needs of students and
          faculty. The library under Dr. Raj's guidance has grown to house over
          100,000 volumes and maintains subscriptions to 1,200+ academic
          journals across various disciplines.
        </div>
      </div>
    </div>
  );
}
export function Section_LibraryStaff() {
  const [selectedStaff, setSelectedStaff] = useState(null);
  return (
    <section className="overflow-x-auto -mx-2 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow-md">
          <table className="min-w-full text-left border border-[#ccc] bg-white">
            <thead className="bg-teal-700 text-white">
              <tr>
                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base">S.No</th>
                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base min-w-[120px] sm:min-w-[150px]">Staff Member</th>
                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base min-w-[120px] sm:min-w-[150px]">Designation</th>
                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base min-w-[150px] sm:min-w-[180px]">Email</th>
                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base">Image</th>
                <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base">Profile</th>
              </tr>
            </thead>
            <tbody>
              {libraryStaff.map((staff, index) => (
                <tr key={index} className="border-t border-[#ccc] hover:bg-gray-50 transition-colors">
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base">{index + 1}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 font-medium text-xs sm:text-sm md:text-base break-words">{staff.name}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base break-words">{staff.designation}</td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base break-words">
                    {staff.email || "library@aknu.edu.in"}
                  </td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 text-sm sm:text-base md:text-lg">
                        {staff.name.charAt(0)}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3">
                    <button
                      className="text-teal-700 underline hover:text-[#005a50] text-xs sm:text-sm md:text-base"
                      onClick={() => setSelectedStaff(staff)}
                      type="button"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedStaff(null)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-4 sm:p-5 md:p-6">
            <button
              className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-500 hover:text-gray-700 text-xl sm:text-2xl"
              onClick={() => setSelectedStaff(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-teal-700 text-white flex items-center justify-center text-lg sm:text-xl font-semibold flex-shrink-0">
                {selectedStaff.name?.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base sm:text-lg font-semibold text-gray-900 break-words">{selectedStaff.name}</div>
                <div className="text-xs sm:text-sm text-gray-600 break-words">{selectedStaff.designation}</div>
                <div className="text-xs sm:text-sm text-gray-600 break-words">{selectedStaff.email || "library@aknu.edu.in"}</div>
              </div>
            </div>
            <div className="text-gray-700 text-xs sm:text-sm leading-relaxed">
              Profile details will be updated soon. For queries, please contact the library office.
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export function Section_LibraryGallary() {
  return (
    <section className="relative mt-4 sm:mt-5 md:mt-6">
      {/* Interactive Background */}
      <div className="absolute-z-10" />

      {/* Gallery Grid */}
      <div className="container mx-auto px-2 sm:px-4 py-1">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-teal-800 mb-3 sm:mb-4">
            Library Spaces
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2 sm:px-4">
            Explore our world-class facilities through these immersive visuals
          </p>
        </div>

        {/* Dynamic Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6 md:gap-8 space-y-4 sm:space-y-6 md:space-y-8">
          {gallaryImageLinks.map((item, index) => (
            <div
              key={index}
              className="break-inside-avoid relative group cursor-pointer transform hover:scale-[1.02] transition-all duration-500"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl">
                <img
                  src={item.link}
                  alt={item.title}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 p-3 sm:p-4 md:p-6 w-full transition-all duration-500 group-hover:pb-4 sm:group-hover:pb-6 md:group-hover:pb-8">
                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">
                    {item.title}
                  </h3>
                  <div className="h-px w-12 sm:w-16 bg-teal-300 mb-2 sm:mb-3 transition-all duration-500 group-hover:w-16 sm:group-hover:w-24" />
                  <p className="text-white/80 text-xs sm:text-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    {item.text}
                  </p>
                </div>

                {/* Interactive Button */}
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-8 sm:mt-12 md:mt-16"></div>
      </div>
    </section>
  );
}
