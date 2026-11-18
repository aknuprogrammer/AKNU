// Mou.jsx
import React from "react";
import { BackButton } from "../BackButton";

const mouData = [
  {
    id: 1,
    organisation: "University of Virgin Islands,Virgin Islands",
    year: "2015-16",
    duration: "5 Years",
  },
  {
    id: 2,
    organisation:
      "Association of Lady Entreprenuers of Inida ( formerly known as ALEAP)",
    year: "2016-17",
    duration: "5 Years",
  },
  {
    id: 3,
    organisation: "GSL Medical College, Rajahmundry",
    year: "2016-17",
    duration: "5 Years",
  },
  {
    id: 4,
    organisation: "Institute of Company Secretaries of India, New Delhi",
    year: "2016-17",
    duration: "No Time Period",
  },
  {
    id: 5,
    organisation: "Skill Development Centre",
    year: "2016-17",
    duration: "3 Years",
  },
  {
    id: 6,
    organisation: "IACG Multimedia Pvt Ltd, Hyderabad",
    year: "2015-16",
    duration: "2 Years",
  },
  {
    id: 7,
    organisation: "CSIR-Indian Institute of Chemical Technology, Hyderabad",
    year: "2016-17",
    duration: "5 Years",
  },
  {
    id: 8,
    organisation: "ELICO Ltd, Hyderabad",
    year: "2016-17",
    duration: "3 Years",
  },
  {
    id: 9,
    organisation: "CTRI-Indian Council for Agriculture Research, New Delhi",
    year: "--",
    duration: "3 Years",
  },
  {
    id: 10,
    organisation: "Infoplus Technologies Pvt Ltd, Chennai",
    year: "2017-18",
    duration: "5 Years",
  },
  {
    id: 11,
    organisation: "Institute of Seismological Research, Gujarat",
    year: "2017-18",
    duration: "5 Years",
  },
  {
    id: 12,
    organisation: "Spoken Tutorial Project - IIT Bombay",
    year: "2016-17",
    duration: "No Time Period",
  },
  {
    id: 13,
    organisation: "KRRG Technologies Pvt Ltd, Visakhapatnam",
    year: "2017-18",
    duration: "3 Years",
  },
  {
    id: 14,
    organisation: "Reliance Jio Infocom Ltd, Mumbai",
    year: "2017-18",
    duration: "3 Years",
  },
  {
    id: 15,
    organisation: "National Research Development Corporation (NRDC), New Delhi",
    year: "2018-19",
    duration: "5 Years",
  },
  {
    id: 16,
    organisation: "Dr. Lakshmaiah IAS Study Circle",
    year: "2018-19",
    duration: "2 Years",
  },
  {
    id: 17,
    organisation: "GSL-Wellness Center",
    year: "2018-19",
    duration: "1 Year",
  },
  {
    id: 18,
    organisation:
      "Swami Vivekananda Yoga Anusandhana Samsthana (SVYASA), Bengaluru",
    year: "2018-19",
    duration: "3 Years",
  },
  {
    id: 19,
    organisation: "Institute of Public Enterprises, Hyderabad",
    year: "2019-20",
    duration: "3 Years",
  },
  {
    id: 20,
    organisation: "Lincoln State University, Malaysia",
    year: "2019-20",
    duration: "5 Years",
  },
  { id: 21, organisation: "Paramarsh", year: "2019-20", duration: "3 Years" },
  {
    id: 22,
    organisation: "Chembridge Laboratories",
    year: "2020-21",
    duration: "5 Years",
  },
  {
    id: 23,
    organisation: "MAKORE Laboratories Pvt Ltd, Hyderabad",
    year: "2020-21",
    duration: "5 Years",
  },
  {
    id: 24,
    organisation: "SVAK Life Sciences",
    year: "2020-21",
    duration: "5 Years",
  },
  { id: 25, organisation: "CPF", year: "2020-21", duration: "4 Years" },
  {
    id: 26,
    organisation: "Spruha Pschology Alumni Association",
    year: "2020-21",
    duration: "2 Years",
  },
  {
    id: 27,
    organisation: "Lakshmi Mushrooms",
    year: "2020-21",
    duration: "2 Years",
  },
  {
    id: 28,
    organisation: "MGMCRE, Hyderabad",
    year: "2020-21",
    duration: "3 Years",
  },
  { id: 29, organisation: "Manas", year: "2020-21", duration: "3 Years" },
];

export default function Mou() {
  return (
    <div className="px-4 sm:px-16 py-8">
      <BackButton />
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-3 text-teal-800">MoU Details</h1>
        <p className="text-gray-700 text-[16px mb-6 text-justify">
          Memorandums of Understanding (MoUs) are formal agreements between the
          university and various organizations, institutions, or industries.
          These collaborations aim to promote academic exchange, research,
          training, and other mutually beneficial activities, enhancing
          opportunities for students and faculty.
        </p>
      </div>

      <div className="overflow-x-auto bg-white shadow">
        <table className="min-w-full text-left border border-[#ccc]">
          <thead className="bg-teal-700 text-white">
            <tr>
              <th className="px-4 py-2">S.No</th>
              <th className="px-4 py-2">
                Name of the Organisation/ Institution/ Industry with whom MoU is
                signed
              </th>
              <th className="px-4 py-2">Year of signing MoU</th>
              <th className="px-4 py-2">Duration of MoU</th>
            </tr>
          </thead>
          <tbody>
            {mouData.map(({ id, organisation, year, duration }) => (
              <tr key={id} className="border-t border-[#ccc]">
                <td className="px-4 py-2">{id}</td>
                <td className="px-4 py-2">{organisation}</td>
                <td className="px-4 py-2">{year}</td>
                <td className="px-4 py-2">{duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
