import React from "react";
import { FileText } from "lucide-react";
import { BackButton } from "../BackButton";

// ✅ Dynamically import all PDFs from the folder
const pdfModules = import.meta.glob("../../assets/RnD/Research Awards/*.pdf", {
  eager: true,
});

const ResearchAwards = () => {
  // Create a lookup of { filename: pdfURL }
  const pdfFiles = Object.keys(pdfModules).reduce((acc, path) => {
    const fileName = path.split("/").pop(); // e.g. "Dr.P.VijayaNirmala.pdf"
    acc[fileName] = pdfModules[path].default;
    return acc;
  }, {});

  // Your awardsData — just refer to file names, not URLs
  const awardsData = [
    {
      id: 1,
      name: "Dr P Vijaya Nirmala",
      year: "2016-17",
      awardName: "Associate Fellow",
      awardingAgency: "Andhra Pradesh Akademi of Sciences, Amaravati",
      pdfFile: "1. Dr. P.Vijaya Nirmala.pdf",
    },
    {
      id: 2,
      name: "Dr. V. Padmavathi",
      year: "2016-17",
      awardName: "Associate Fellow",
      awardingAgency: "Andhra Pradesh Akademi of Sciences, Amaravati",
      pdfFile: "2. Dr. V. Padmavathi.pdf",
    },
    {
      id: 3,
      name: "Dr. R. S. Varahala Dora",
      year: "2016-17",
      awardName: "Outstanding Accomplishment",
      awardingAgency: "Young Researchers Forum",
      pdfFile: "3. Dr. RS Varahala Dora.pdf",
    },
    {
      id: 4,
      name: "Dr. V. Padmavathi",
      year: "2016-17",
      awardName: "Inspire Award Scheme",
      awardingAgency: "Focus IAPT Anveshika GDC, Salur",
      pdfFile: "4. Dr. V.Padmavathi.pdf",
    },
    {
      id: 5,
      name: "Prof. S.Teki",
      year: "2016-17",
      awardName: "Best Paper",
      awardingAgency: "Siva Sivani Institute of management, Telangana",
      pdfFile: "5. Prof.S.Teki.pdf",
    },
    {
      id: 6,
      name: "Dr. V. Padmavathi",
      year: "2016-17",
      awardName: "Resource Person for State Level Camp",
      awardingAgency: "Vidyarthi Vigyan Manthan",
      pdfFile: "6. Dr. V. Padmavathi.pdf",
    },
    {
      id: 7,
      name: "Dr. S. Rajyalakshmi",
      year: "2016-17",
      awardName: "Best Crystal Display Award",
      awardingAgency:
        "National College (Autonomous), tiruchirapalli-620001, Tamilnadu",
      pdfFile: "7. Dr. S. Rajyalakshmi.pdf",
    },
    {
      id: 8,
      name: "Dr.N Kiran Chandra",
      year: "2016-17",
      awardName: "National Service Scheme Award",
      awardingAgency: "Ministry of Youth Affairs and Sports, Govt. of India",
      pdfFile: "8. Dr. N.Kiran Chandra.pdf",
    },
    {
      id: 9,
      name: "Dr.N Kiran Chandra",
      year: "2016-17",
      awardName: "Best Programme Coordinator Award",
      awardingAgency:
        "Higher Education Department, Government of Andhra Pradesh",
      pdfFile: "9. Dr. N.Kiran Chandra.pdf",
    },
    {
      id: 10,
      name: "Dr P Vijaya Nirmala",
      year: "2016-17",
      awardName: "National Yuva Seva Puraskaram",
      awardingAgency: "Telugu Rakshana Vedika",
      pdfFile: "10. Dr. P.Vijaya Nirmala.pdf",
    },
    {
      id: 11,
      name: "Dr P Vijaya Nirmala",
      year: "2016-17",
      awardName: "National Women Empowerment Award",
      awardingAgency: "Philanthropic Society",
      pdfFile: "11. Dr. P.Vijaya Nirmala.pdf",
    },
    {
      id: 12,
      name: "Dr.P Venkateswarlu",
      year: "2016-17",
      awardName: "Swami Vivekananda Humanitarian of India - 17",
      awardingAgency: "Philanthropic Society",
      pdfFile: "12. Dr. P.Venkateswarlu.pdf",
    },
    {
      id: 13,
      name: "Dr. R. S. Varahala Dora",
      year: "2016-17",
      awardName: "Best Programme Officer Award",
      awardingAgency: "Adikavi Nannaya University,Government of Andhra Pradesh",
      pdfFile: "13. Dr. R.S. Varahala Dora.pdf",
    },
    {
      id: 14,
      name: "Dr. P. Lakshmi Narayana",
      year: "2016-17",
      awardName: "Best Programme Officer Award",
      awardingAgency: "Adikavi Nannaya University,Government of Andhra Pradesh",
      pdfFile: "14. Dr. P. Lakshmi Narayana.pdf",
    },
    {
      id: 15,
      name: "Dr. S. Rajyalakshmi",
      year: "2017-18",
      awardName: "Resource Person",
      awardingAgency: "Focus IAPT Anveshika GDC, Salur",
      pdfFile: "15. Dr. S. Rajyalakshmi.pdf",
    },
    {
      id: 16,
      name: "Dr. S. Rajyalakshmi",
      year: "2017-18",
      awardName: "Associate Fellow",
      awardingAgency: "Andhra Pradesh Akademi of Sciencs, Amaravati",
      pdfFile: "16. Dr. S. Rajyalakshmi.pdf",
    },
    {
      id: 17,
      name: "Dr. V. Padmavathi",
      year: "2017-18",
      awardName: "Evaluator for State Level Camp",
      awardingAgency: "Vidyarthi Vigyan Manthan",
      pdfFile: "17. Dr. V. Padmavathi.pdf",
    },
    {
      id: 18,
      name: "Dr P Vijaya Nirmala",
      year: "2017-18",
      awardName: "Bharatha Mahila Siromani Award",
      awardingAgency: "Health Care International",
      pdfFile: "18. Dr. P.Vijaya Nirmala.pdf",
    },
    {
      id: 19,
      name: "Dr. V. Persis",
      year: "2018-19",
      awardName: "Outstanding Woman in Engineering",
      awardingAgency: "Venus International Foundation, Chennai, India",
      pdfFile: "19. Dr. V.Persis.pdf",
    },
    {
      id: 20,
      name: "Dr. B. Jagan Mohan Reddy",
      year: "2018-19",
      awardName: "Outstanding Faculty in Science",
      awardingAgency: "Venus International Foundation, Chennai, India",
      pdfFile: "20.Dr. B.Jagan Mohan Reddy.pdf",
    },
    {
      id: 21,
      name: "Prof P. Suresh Varma",
      year: "2018-19",
      awardName: "Best Researcher Award",
      awardingAgency: "Adikavi Nannaya University, Rajamahendravaram",
      pdfFile: "21. Prof. P. Suresh Varma.pdf",
    },
    {
      id: 22,
      name: "Prof S. Teki",
      year: "2018-19",
      awardName: "Best Researcher Award",
      awardingAgency: "Adikavi Nannaya University, Rajamahendravaram",
      pdfFile: "22. Prof.S.Teki.pdf",
    },
    {
      id: 23,
      name: "Dr. L. Mutyala Naidu",
      year: "2018-19",
      awardName: "Associate Fellow",
      awardingAgency: "A.P. Academy of Science, Guntur",
      pdfFile: "23. Dr. L.Mutyala Naidu.pdf",
    },
    {
      id: 24,
      name: "Dr. K. Deepthi",
      year: "2018-19",
      awardName: "Best Ph.D Thesis",
      awardingAgency: "Andhra University",
      pdfFile: "24. Dr. K.Deepthi.pdf",
    },
    {
      id: 25,
      name: "Dr.K.Revathi",
      year: "2018-19",
      awardName: "Research Ratna Award",
      awardingAgency: "RULA Awards & IJRULA",
      pdfFile: "25. Dr. K. Revathi.pdf",
    },
    {
      id: 26,
      name: "Dr. R. Janaki Rao",
      year: "2018-19",
      awardName: "Best Programme Officer Award",
      awardingAgency: "Government of Andhra Pradesh",
      pdfFile: "26. Dr. R. Janaki Rao.pdf",
    },
    {
      id: 27,
      name: "Dr. V. Persis",
      year: "2019-20",
      awardName: "Best Faculty of the Year- Contemporary Subjects",
      awardingAgency: "CSI Mumbai, Technext India",
      pdfFile: "27. Dr. V.Persis.pdf",
    },
    {
      id: 28,
      name: "Dr. K. Ramaneswari",
      year: "2019-20",
      awardName: "Most Powerful Woman in Higher Education",
      awardingAgency: "uLektz Wall of Fame",
      pdfFile: "28. Dr. K. Ramaneswari.pdf",
    },
    {
      id: 29,
      name: "Dr. B Kezia Rani",
      year: "2019-20",
      awardName: "Mother Teresa National fellowship Award",
      awardingAgency: "Philanthropic Society of India",
      pdfFile: "29. Dr. B Kezia Rani.pdf",
    },
    {
      id: 30,
      name: "Dr. B. Jagan Mohan Reddy",
      year: "2020-21",
      awardName: "Visiting Scientist Award",
      awardingAgency: "INDIAN NATIONAL SCIENCE ACADEMY, New Delhi",
      pdfFile: "30. Dr. B.Jagan Mohan Reddy.pdf",
    },
    {
      id: 31,
      name: "Dr. K.V.Swamy",
      year: "2020-21",
      awardName: "Resource Person",
      awardingAgency: "Andhra Pradesh State Council of Higher Education",
      pdfFile: "31. Dr. KV Swamy.pdf",
    },
    {
      id: 32,
      name: "Dr. R. S. Varahala Dora",
      year: "2020-21",
      awardName: "Adarsh Vidya Saraswathi Rashtriya Puraskar",
      awardingAgency: "Global Management Council",
      pdfFile: "32. Dr. R.S.Varahala Dora.pdf",
    },
    {
      id: 33,
      name: "Mr. BVA Swamy",
      year: "2020-21",
      awardName: "Best Presentation Award",
      awardingAgency: "AGAR and AIB,Tmilnadu",
      pdfFile: "33. Mr. BVA Swamy.pdf",
    },
    {
      id: 34,
      name: "Dr. S. Rajyalakshmi",
      year: "2020-21",
      awardName: "RMS Member",
      awardingAgency: "International Journal of Creative Research Thoughts",
      pdfFile: "34. Dr. S. Rajyalakshmi.pdf",
    },
    {
      id: 35,
      name: "Dr. S. Rajyalakshmi",
      year: "2020-21",
      awardName:
        "Fellow for The Society of Innovative Educationalist & Scientific Research Professional Chennai (FSIESRP)",
      awardingAgency:
        "The Society of Innovative Educationalist & Scientific Research Professional Chennai",
      pdfFile: "35. Dr. S. Rajyalakshmi.pdf",
    },
    {
      id: 36,
      name: "Dr. S. Rajyalakshmi",
      year: "2020-21",
      awardName: "Hon.Editorial Board Member-Consulting Editor",
      awardingAgency: "Innovative Scientific Research Professional Malaysia",
      pdfFile: "36. Dr. S. Rajyalakshmi.pdf",
    },
    {
      id: 37,
      name: "Dr. DSRS Prakash",
      year: "2020-21",
      awardName: "Outstanding Scientist Award",
      awardingAgency: "VD GOOD Technology Factory, India",
      pdfFile: "37. Dr. DSRS Prakash.pdf",
    },
    {
      id: 38,
      name: "Dr. S. Rajyalakshmi",
      year: "2020-21",
      awardName: "India Book of Records",
      awardingAgency: "ESN Publications",
      pdfFile: "38. Dr. S. Rajyalakshmi.pdf",
    },
    {
      id: 39,
      name: "Dr. S. Rajyalakshmi",
      year: "2020-21",
      awardName: "World Record-Thickest Book in the World",
      awardingAgency: "ESN Publications",
      pdfFile: "39. Dr. S. Rajyalakshmi.pdf",
    },
    {
      id: 40,
      name: "Dr. S. Rajyalakshmi",
      year: "2020-21",
      awardName: "Best Editor Award",
      awardingAgency: "ESN Publications",
      pdfFile: "40. Dr. S. Rajyalakshmi.pdf",
    },
    {
      id: 41,
      name: "Dr. S. Rajyalakshmi",
      year: "2020-21",
      awardName: "Asia Book of Records",
      awardingAgency: "ESN Publications",
      pdfFile: "41. Dr. S. Rajyalakshmi.pdf",
    },
    {
      id: 42,
      name: "Dr. S. Rajyalakshmi",
      year: "2020-21",
      awardName: "Award for Excellence",
      awardingAgency: "ESN publications, Tamilnadu",
      pdfFile: "42. Dr. S. Rajyalakshmi.pdf",
    },
    {
      id: 43,
      name: "Prof. S. Teki",
      year: "2020-21",
      awardName: "Certificate of Appreciation",
      awardingAgency: "SICBM 2021, SIBM Hyderabad",
      pdfFile: "43. Prof.S.Teki.pdf",
    },
    {
      id: 44,
      name: "Prof. K.S. Ramesh",
      year: "2020-21",
      awardName: "Editor",
      awardingAgency: "Orient BlackSwan",
      pdfFile: "44. Prof. K S Ramesh.pdf",
    },
    {
      id: 45,
      name: "Dr. S. Rajyalakshmi",
      year: "2020-21",
      awardName: "Women Researcher Award",
      awardingAgency: "Benevolent Trust, Puducherry",
      pdfFile: "45. Dr. S. Rajyalakshmi.pdf",
    },
    {
      id: 46,
      name: "Dr. Ch. N. Bhavani",
      year: "2020-21",
      awardName: "Excellence Performance in Poster presentation",
      awardingAgency: "Radhabai Kale Mahila Mahavidyalaya, Ahmednagar",
      pdfFile: "46. Dr. Ch.N.K. Bhavani.pdf",
    },
    {
      id: 47,
      name: "Dr. L. Sujatha",
      year: "2020-21",
      awardName: "Reviewer",
      awardingAgency:
        "Annals of Fuzzy Mathematics and Informatics (AFMI), Wonkwang University",
      pdfFile: "47. Dr. L. Sujatha.pdf",
    },
    {
      id: 48,
      name: "Dr P Vijaya Nirmala",
      year: "2020-21",
      awardName: "Corona Warrior National Award",
      awardingAgency: "Philanthropic Society",
      pdfFile: "48. Dr. P. Vijaya Nirmala.pdf",
    },
    {
      id: 49,
      name: "Dr. B Kezia Rani",
      year: "2020-21",
      awardName: "Bharathiya Naari Award",
      awardingAgency: "National Youth Council of India",
      pdfFile: "49. Dr. B Kezia Rani.pdf",
    },
  ];

  return (
    <div className="w-[95%] mx-10 px-4 py-8">
      <div className="container mx-auto">
        <div className="overflow-hidden">
          <div className="p-6">
            <BackButton />
            <h2 className="text-2xl sm:text-3xl font-bold text-teal-800 mb-4 text-center">
              Research Awards
            </h2>
            <p className="text-center mb-4 text-gray-600">
              Recognizing outstanding contributions and excellence in research.
            </p>

            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse border border-gray-200">
                <thead className="bg-teal-700 text-white">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 font-semibold">
                      S.No
                    </th>
                    <th className="border border-gray-300 px-4 py-2 font-semibold">
                      Name of the Faculty
                    </th>
                    <th className="border border-gray-300 px-4 py-2 font-semibold">
                      Year of Award
                    </th>
                    <th className="border border-gray-300 px-4 py-2 font-semibold">
                      Name of the Award/Fellowship
                    </th>
                    <th className="border border-gray-300 px-4 py-2 font-semibold">
                      Awarding Agency
                    </th>
                    <th className="border border-gray-300 px-4 py-2 font-semibold">
                      Link
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {awardsData.map((award) => {
                    const pdfUrl = pdfFiles[award.pdfFile];
                    console.log("507", pdfUrl);
                    return (
                      <tr key={award.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-4 text-center">
                          {award.id}
                        </td>
                        <td className="border border-gray-300 px-4 py-4">
                          {award.name}
                        </td>
                        <td className="border border-gray-300 px-4 py-4">
                          {award.year}
                        </td>
                        <td className="border border-gray-300 px-4 py-4">
                          {award.awardName}
                        </td>
                        <td className="border border-gray-300 px-4 py-4">
                          {award.awardingAgency}
                        </td>
                        <td className="border border-gray-300 px-4 py-4 text-center">
                          {pdfUrl ? (
                            <a
                              href={pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                              aria-label={`View document for ${award.name}`}
                            >
                              <FileText className="inline-block h-5 w-5" />
                            </a>
                          ) : (
                            <span className="text-gray-400">No PDF</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchAwards;
