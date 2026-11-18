import React from "react";
import { BackButton } from "../BackButton";

export default function ResearchProjects() {
  const projects = [
    {
      id: 1,
      title:
        "Basement structure and tectonics of parts of EGMB in Krishna and Guntur districts of Andhra Pradesh through magnetic and remote sensing techniques",
      investigator: "Dr. K.V. Swamy",
      agency: "Ministry of Earth Science",
      agencyLink: "https://www.moes.gov.in/",
      type: "Government",
      department: "Geology",
      year: "2016-17",
      duration: "3 Years",
    },
    {
      id: 2,
      title:
        "Evaluation of service quality in Higher Education-A study of select Universities with reference to South India",
      investigator: "Dr. P. Uma Maheswari Devi",
      agency: "ICSSR",
      agencyLink: "https://icssr.org/",
      type: "Government",
      department: "Commerce & Management Studies",
      year: "2016-17",
      duration: "1 Year",
    },
    {
      id: 3,
      title: "Preparation of People Biodiversity Registers 2017",
      investigator: "Dr. T. Padmavathi",
      agency: "AP State Biodiversity Board",
      agencyLink: "http://apsbb.org//",
      type: "Government",
      department: "Botany",
      year: "2017-18",
      duration: "1 Year",
    },
    {
      id: 4,
      title:
        "A Study on Socio-Economic Conditions of Conventional Occupation Communities Dhobi (Laundrymen)/Nabi (Barber)/Matswar (Fishermen) in Andhra Pradesh",
      investigator: "Prof. S Teki",
      agency: "ICSSR (Southern Region Centre, Hyderabad)",
      agencyLink: "https://icssr.org/",
      type: "Government",
      department: "Commerce & Management Studies",
      year: "2017-18",
      duration: "1 Year",
    },
    {
      id: 5,
      title:
        "Economic Valuation of Ecological Services of Mangrove Ecosystems of EGRE Region",
      investigator: "Prof. S Teki",
      agency: "EGREE-UNDP-GEF",
      agencyLink: "https://www.in.undp.org/",
      type: "Non-Government",
      department: "Commerce & Management Studies",
      year: "2018-19",
      duration: "1 Month",
    },
    {
      id: 6,
      title:
        "Identification of Eco-friendly practices in the Industries of EGREE Region",
      investigator: "Prof. S Teki",
      agency: "EGREE-UNDP-GEF",
      agencyLink: "https://www.in.undp.org/",
      type: "Non-Government",
      department: "Commerce & Management Studies",
      year: "2018-19",
      duration: "1 Month",
    },
    {
      id: 7,
      title:
        "Conducting workshops for sector plans (Port & shipping, fertilizers and Salt pans) based on research findings",
      investigator: "Prof. S Teki",
      agency: "EGREE-UNDP-GEF",
      agencyLink: "https://www.in.undp.org/",
      type: "Non-Government",
      department: "Commerce & Management Studies",
      year: "2018-19",
      duration: "1 Year",
    },
    {
      id: 8,
      title: "Documentary film on Yerrakaluva river",
      investigator: "Prof. K Sree Ramesh",
      agency: "Meera Aziz Educational Society",
      agencyLink: "http://meeraazizsociety.org/",
      type: "Non-Government",
      department: "English",
      year: "2018-19",
      duration: "2 Months",
    },
    {
      id: 9,
      title:
        "Evaluation of service quality in secondary education - A study of select schools with reference to South India",
      investigator: "Dr. N. Udaya Bhaskar",
      agency: "ICSSR",
      agencyLink: "https://icssr.org/",
      type: "Government",
      department: "Commerce & Management Studies",
      year: "2019-20",
      duration: "2 Years",
    },
  ];

  return (
    <div className="px-4 sm:px-16 py-8">
      <BackButton />
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-3 text-teal-800">
          Research Projects
        </h1>
        <p className="mb-6 text-gray-700 text-[16px]">
          Explore the groundbreaking research projects led by our scholars and
          faculty.
        </p>
      </div>

      <div className="overflow-x-auto bg-white shadow">
        <table className="min-w-full text-left border border-[#ccc]">
          <thead className="bg-teal-700 text-white">
            <tr>
              <th className="px-4 py-2">S.No</th>
              <th className="px-4 py-2">Title of the Research Project</th>
              <th className="px-4 py-2">Principal Investigator</th>
              <th className="px-4 py-2">Funding Agency</th>
              <th className="px-4 py-2">Type of Funding Agency</th>
              <th className="px-4 py-2">Department</th>
              <th className="px-4 py-2">Year of Award</th>
              <th className="px-4 py-2">Duration</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-t border-[#ccc]">
                <td className="px-4 py-2">{project.id}</td>
                <td className="px-4 py-2">{project.title}</td>
                <td className="px-4 py-2">{project.investigator}</td>
                <td className="px-4 py-2">
                  <a
                    href={project.agencyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {project.agency}
                  </a>
                </td>
                <td className="px-4 py-2">{project.type}</td>
                <td className="px-4 py-2">{project.department}</td>
                <td className="px-4 py-2">{project.year}</td>
                <td className="px-4 py-2">{project.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
