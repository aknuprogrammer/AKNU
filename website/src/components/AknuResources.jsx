import React from "react";
import {
  Users,
  Mail,
  AlertCircle,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import VSMCollegeRTI from "../assets/Affiliated Colleges/RTI/VSM College RTI (1).pdf";
import VSMCollegeRTI2 from "../assets/Affiliated Colleges/RTI/VSM College RTI (2).pdf";

const AknuCdcResources = () => {
  const themeColor = "#007367";
  const lightColor = "#f0f7f4";

  // Static data for Associate Faculty
  const associateFaculty = [
    {
      sno: 1,
      name: "Dr. Y. Sushma Priya",
      designation: "Faculty Associate",
      contact: "ysp.phy@aknu.edu.in",
      //   profileUrl: "https://aknu.edu.in/CDC/faculty/venkata_rao.pdf"
    },
    {
      sno: 2,
      name: "Dr.Ammi Reddy Mallidi",
      designation: "Faculty Associate",
      contact: "mar.cms.@aknu.edu.in",
      //   profileUrl: "https://aknu.edu.in/CDC/faculty/suneetha_b.pdf"
    },
    {
      sno: 3,
      name: "Dr. N. Sujatha",
      designation: "Faculty Associate",
      contact: "sujatha.edu@aknu.edu.in",
      //   profileUrl: "https://aknu.edu.in/CDC/faculty/rajesh_c.pdf"
    },
    // {
    //   sno: 4,
    //   name: "Dr. D. Madhavi",
    //   designation: "Professor",
    //   contact: "madhavi.d@aknu.edu.in",
    //   profileUrl: "https://aknu.edu.in/CDC/faculty/madhavi_d.pdf"
    // },
    // {
    //   sno: 5,
    //   name: "Dr. E. Srinivas",
    //   designation: "Associate Professor",
    //   contact: "srinivas.e@aknu.edu.in",
    //   profileUrl: "https://aknu.edu.in/CDC/faculty/srinivas_e.pdf"
    // }
  ];

  // Static data for other sections (same as before)
  const circulars = [
    {
      title: "CDC Circular 01/2023",
      link: "https://aknu.edu.in/CDC/Circular_01_2023.pdf",
    },
    {
      title: "CDC Circular 02/2023",
      link: "https://aknu.edu.in/CDC/Circular_02_2023.pdf",
    },
  ];

  const rti = [
    {
      title: "21/03/2022 :: VSM College RTI - 1",
      link: VSMCollegeRTI,
    },
    {
      title: "21/03/2022 :: VSM College RTI - 2",
      link: VSMCollegeRTI2,
    },
  ];

  const importantAnnouncement = {
    title: "CIRCULAR - APSCHE - LMS Student Registration circular",
    link: "https://iic.apsche.ap.gov.in/", // Replace with actual link
  };
  return (
    <div className="mt-4 py-6 sm:py-8">
      {/* <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg flex items-start">
        <AlertTriangle className="text-yellow-600 mr-3 mt-1 flex-shrink-0" />
        <div className="overflow-hidden">
          <a
            href={importantAnnouncement.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-medium text-gray-800 hover:text-teal-700 block whitespace-nowrap animate-marquee"
          >
            {importantAnnouncement.title} - Click here to view/download →
          </a>
        </div>
      </div> */}
      <header className="mb-12 text-center">
        {/* <h2 className="text-3xl font-bold text-teal-800 mb-4">CDC Resources</h2> */}
        <p className="text-3xl font-bold text-teal-800 mb-4">
          Faculty Associates details, Circulars, and RTI information from AKNU
          CDC
        </p>
      </header>

      <div className="mb-8 w-full">
        <h3 className="text-teal-800 font-bold text-2xl">
          Faculty Associates
        </h3>
        <div className="overflow-x-auto mt-4 w-full">
          <table className="w-full text-left border border-[#ccc]">
            <thead className="bg-teal-700 text-white">
              <tr>
                <th className="px-4 py-2">S.No</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Designation</th>
                <th className="px-4 py-2">Contact</th>
              </tr>
            </thead>
            <tbody>
              {associateFaculty.map((faculty) => (
                <tr key={faculty.sno} className="border-t border-[#ccc]">
                  <td className="px-4 py-2">{faculty.sno}</td>
                  <td className="px-4 py-2">{faculty.name}</td>
                  <td className="px-4 py-2">{faculty.designation}</td>
                  <td className="px-4 py-2">
                    <a
                      href={`mailto:${faculty.contact}`}
                      className="text-teal-600 hover:text-teal-800"
                    >
                      {faculty.contact}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Circulars and RTI Sections */}
      {/* <div className="space-y-6"> */}
      {/* Circulars Section */}
      {/* <div className="p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-t-4"
            style={{ borderTopColor: themeColor }}>
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-md mr-3" style={{ backgroundColor: lightColor }}>
                <Mail size={20} style={{ color: themeColor }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: themeColor }}>
                Circulars
              </h2>
            </div>

            <div className="space-y-3">
              {circulars.map((circular, index) => (
                <a
                  key={`circular-${index}`}
                  href={circular.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  <span className="font-medium text-gray-800">{circular.title}</span>
                  <ChevronRight size={16} className="text-teal-600" />
                </a>
              ))}
            </div>
          </div> */}

      {/* RTI Section */}
      {/* <div
          className="p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-t-4"
          style={{ borderTopColor: themeColor }}
        >
          <div className="flex items-center mb-4">
            <div
              className="p-2 rounded-md mr-3"
              style={{ backgroundColor: lightColor }}
            >
              <AlertCircle size={20} style={{ color: themeColor }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: themeColor }}>
              RTI Information
            </h2>
          </div>

          <div className="space-y-3">
            {rti.map((item, index) => (
              <a
                key={`rti-${index}`}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                <span className="font-medium text-gray-800">{item.title}</span>
                <ChevronRight size={16} className="text-teal-600" />
              </a>
            ))}
          </div>
        </div> */}
    </div>
  );
};

export default AknuCdcResources;
