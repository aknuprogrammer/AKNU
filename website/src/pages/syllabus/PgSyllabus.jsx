import { useEffect, useState } from "react";

import {

  FiDownload,

  FiChevronDown,

  FiChevronUp,

  FiSearch,

  FiCalendar,

  FiBook,

  FiFilter,

  FiX,

} from "react-icons/fi";

import {

  pgLocalPdfs,

  // 2023-24 Onwards

  pg202324FoodScienceTech,

  pg202324Psychology,

  // 2021-22 Onwards

  pg202122ForensicChemTox,

  pg202122ForensicQDE,

  pg202122ForensicDNA,

  pg202122DigitalForensics,

  pg202122Cybersecurity,

  // 2020-21 AB

  pg202021Mudlogging,

  // 2019-20 AB - Science

  pg201920Analytical,

  pg201920Aquaculture,

  pg201920Biochemistry,

  pg201920Biotechnology,

  pg201920Botany,

  pg201920ClinicalNutrition,

  pg201920Geology,

  pg201920Geophysics,

  pg201920Microbiology,

  pg201920AppliedMath,

  pg201920Mathematics,

  pg201920Organic,

  pg201920Physical,

  pg201920Physics,

  pg201920Zoology,

  // 2019-20 AB - Arts

  pg201920MAEconomics,

  pg201920MAEnglish,

  pg201920MAPoliticalScience,

  pg201920MAPsychology,

  pg201920MAPublicAdmin,

  pg201920MASocialWork,

  pg201920MATelugu,

  pg201920MCom,

  // 2016-17 AB - Arts

  pg201617MAEconomics,

  pg201617MAPublicAdmin,

  pg201617MAPsychology,

  pg201617MASocialWork,

  pg201617MATelugu,

  pg201617MCom,

  // 2016-17 AB - Science

  pg201617ComputerScience,

  pg201617Aquaculture,

  pg201617ChemistryCommon,

  pg201617AppliedMath,

  pg201617Biochemistry,

  pg201617Biotechnology,

  pg201617Botany,

  pg201617ClinicalNutrition,

  pg201617Geology,

  pg201617Geophysics,

  pg201617Mathematics,

  pg201617Microbiology,

  pg201617Physics,

  pg201617PolymerScience,

  pg201617Zoology,

  // 2016-17 AB - Law

  pg201617LLMCS,

  // 2016-17 AB - Professional

  pg201617BEd,

  pg201617BPEd,

  pg201617DPEd,

  pg201617MEd,

  pg201617MPEd,

  pg201617MBASem1,

  pg201617MBASem2,

  pg201617MBASem34,

  pg201617MCASem1,

  pg201617MCASem2,

  pg201617MCASem36,

  pg201617MCAProject,

} from "./pgPdfs";



const PgSyllabus = () => {

  const [dynamicSyllabuses, setDynamicSyllabuses] = useState({});

  const [isLoading, setIsLoading] = useState(true);



  // Fetch dynamic syllabuses for PG

  useEffect(() => {

    const fetchSyllabuses = async () => {

      try {

        const apiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

        const response = await fetch(`${apiUrl}/api/syllabus/all/PG`);

        const data = await response.json();



        const grouped = data.reduce((acc, item) => {

          let rawYear = item.effectiveYear ? item.effectiveYear.trim() : "";

          let year = rawYear;

          if (year && !year.startsWith("W.E.F.") && !year.includes("AB")) {

            year = `W.E.F. ${year} AB`;

          } else if (year && !year.startsWith("W.E.F.")) {

            year = `W.E.F. ${year}`;

          }

          if (!year) year = "W.E.F. 2026-27 AB";



          if (!acc[year]) acc[year] = {};

          if (!acc[year][item.category]) acc[year][item.category] = {};

          if (!acc[year][item.category][item.department]) acc[year][item.category][item.department] = [];



          acc[year][item.category][item.department].push({

            name: item.title,

            semesters: (item.files || []).map(file => ({

              name: file.title,

              syllabus: `${apiUrl}/api/syllabus/file/view/${item._id}/${file._id}`

            }))

          });

          return acc;

        }, {});



        setDynamicSyllabuses(grouped);

      } catch (err) {

        console.error("Failed to fetch dynamic PG syllabuses:", err);

      } finally {

        setIsLoading(false);

      }

    };

    fetchSyllabuses();

  }, []);



  const normalize = (s = "") =>

    s

      .toLowerCase()

      .replace(/[^a-z0-9]+/g, " ")

      .trim();

  const findLocalPdf = (hintA = "", hintB = "") => {

    const a = normalize(hintA);

    const b = normalize(hintB);

    const score = (path) => {

      const n = normalize(path);

      let sc = 0;

      if (a)

        a.split(" ")

          .filter(Boolean)

          .forEach((w) => {

            if (n.includes(w)) sc += 2;

          });

      if (b)

        b.split(" ")

          .filter(Boolean)

          .forEach((w) => {

            if (n.includes(w)) sc += 1;

          });

      return sc;

    };

    let best = null;

    for (const f of pgLocalPdfs) {

      const s = score(f.path);

      if (s > 0 && (!best || s > best.score)) best = { ...f, score: s };

    }

    return best?.url || null;

  };

  // Complete data structure matching AKNU website exactly

  const staticCourses = {

    "W.E.F. 2025-26 AB": {

      "Conventional PG": {

        "M.A": [

          {

            name: "M.A Economics",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/MA%20Economics.pdf",

              // },

            ],

          },

          {

            name: "M.A English",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/M.A.%20English.pdf",

              // },

            ],

          },

          {

            name: "M.A Political Science",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/MA%20%20Political%20Science%20%202019-20.pdf",

              // },

            ],

          },

          {

            name: "M.A Psychology",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/Psychology%20PG%20%20Syllabus%20Complete%202019-2020.pdf",

              // },

            ],

          },

          {

            name: "M.A Public Administration",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/MA%20Publci%20Adm%20Syllabus%202019-20.pdf",

              // },

            ],

          },

          {

            name: "M.A Social Work",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/M.A%20Social%20Work.pdf",

              // },

            ],

          },

          {

            name: "M.A Telugu",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/Telugu-Syllabus%202019-20.pdf",

              // },

            ],

          },

        ],

        "M.Com.": [

          {

            name: "M.Com",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/M.%20Com%20course%20structue%20New%20(2019-20%20AB).pdf",

              // },

            ],

          },

        ],

        "M.Sc.": [

          {

            name: "M. Sc. Geoinformatics",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/Syllabus/PG/SCIENCE/Semester1%20Syllabus%20of%20M.%20Sc.%20Geoinformatics%20for%202024-25%20A.%20B..pdf",

              // },

            ],

          },

          {

            name: "M.Sc. Analytical Chemistry",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/Analytical_2019-20.pdf",

              // },

            ],

          },

          {

            name: "M.Sc. Aquaculture",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/M%20Sc%20Aquaculture%20Syllabus%20-%202019%20-%202020.pdf",

              // },

            ],

          },

          {

            name: "M.Sc. Biochemistry",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/M.Sc%20Biochemistry%20Syllabus%202019-2020.pdf",

              // },

            ],

          },

          {

            name: "M.Sc. Biotechnology",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/M.Sc%20Biotechnology%20Syllabus%20-%202019%20-%202020.pdf",

              // },

            ],

          },

          {

            name: "M.Sc. Botany",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/M%20Sc%20Botany%20syllabus%202019-2020.pdf",

              // },

            ],

          },

          {

            name: "M.Sc. Clinical Nutrition",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/M.Sc%20Clinical%20Nutrition%20Syllabus%202019-2020.pdf",

              // },

            ],

          },

          {

            name: "M.Sc. Geology",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/MSc%20Geo-PE%20-19-20%20-%2018june19.pdf",

              // },

            ],

          },

          {

            name: "M.Sc. Geophysics",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/M.%20Sc.%20Geophysics%20%202019-20ab.pdf",

              // },

            ],

          },

          {

            name: "M.Sc. Microbiology",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/MSc%20Microbiology%20Syllabus%202019-2020.pdf",

              // },

            ],

          },

          {

            name: "M.Sc. Applied Mathematics",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/Msc%20Applied%20Mathematics.pdf",

              // },

            ],

          },

          {

            name: "M.Sc. Mathematics",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/Mathematics_2019-20AB.pdf",

              // },

            ],

          },

          {

            name: "M.Sc. Organic Chemistry",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/Organic_2019-20.pdf",

              // },

            ],

          },

          {

            name: "M.Sc. Physical Chemistry",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/Physical_2019-20.pdf",

              // },

            ],

          },

          {

            name: "M.Sc. Physics",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/PG-Physics%20-19-20%20-%204nov19.pdf",

              // },

            ],

          },

          {

            name: "M.Sc. Zoology",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2019/M.Sc.%20Zoology%20Syllabus%20-%202019-2020.pdf",

              // },

            ],

          },

        ],

      },

      "Professional PG": {

        MBA: [

          {

            name: "MBA (w.e.f 2019-20 AB)",

            semesters: [

              // {

              //   name: "Syllabus & Model Papers",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/Syllabus/PG/PROFESSIONAL/MBA%20Syllabus%202019-20%20AB.pdf",

              // },

            ],

          },

          {

            name: "MBA(Tourism & Hospitality)",

            semesters: [

              // {

              //   name: "Syllabus & Model Papers",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/Syllabus/PG/PROFESSIONAL/MBT%20Syllabus%202019-20%20AB%20-06March2021.pdf",

              // },

            ],

          },

        ],

        MCA: [

          {

            name: "MCA (w.e.f 2020-21 AB)",

            semesters: [

              // {

              //   name: "Syllabus & Model Papers",

              //   syllabus: "https://www.aknu.edu.in/UCE/Syllabus/MCA.pdf",

              // },

            ],

          },

        ],

        "M.Tech.": [

          {

            name: "M.TECH (CSE)",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/Syllabus/M.Tech/M.TECH%20(CSE).pdf",

              // },

            ],

          },

        ],

        "M.Ed.": [

          {

            name: "M.Ed",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/Syllabus/PG/PROFESSIONAL/EDU/ANUR_M.Ed._Regulations_Curriculum_2015-17.pdf",

              // },

            ],

          },

        ],

        LAW: [

          {

            name: "LLM Course(2 Years)",

            semesters: [

              // {

              //   name: "Course Structure",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/Syllabus/PG/LAW/1.%20BRANCH%20I%20-%20LLM-CONSTITUTIOAL%20LAW%20&%20LEGAL%20ORDER%202024-2025.pdf",

              // },

            ],

          },

          {

            name: "BRANCH I - LLM-CONSTITUTIONAL LAW & LEGAL ORDER",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/Syllabus/PG/LAW/1.%20BRANCH%20I%20-%20LLM-CONSTITUTIOAL%20LAW%20&%20LEGAL%20ORDER%202024-2025.pdf",

              // },

            ],

          },

          {

            name: "BRANCH IV- LABOUR CAPITAL AND LAW",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/Syllabus/PG/LAW/2.%20BRANCH%20IV-%20LABOUR%20CAPITAL%20AND%20LAW%202024-2025.pdf",

              // },

            ],

          },

          {

            name: "BRANCH VIII - LL.M CORPORATE LAW",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/Syllabus/PG/LAW/3.%20BRANCH%20VIII%20-%20LL.M%20%20CORPORATE%20LAW%202024-2025.pdf",

              // },

            ],

          },

        ],

      },

      "Diploma Courses PG": {

        Yoga: [

          {

            name: "PG Diploma in Yoga",

            semesters: [

              // {

              //   name: "Syllabus",

              //   syllabus:

              //     "https://aknu.edu.in/Academics/links/AAF/PG2023-24/PG%20DIPLOMA%20IN%20YOGA%20SYLLABUS_W.E.F%202024-2025.pdf",

              // },

            ],

          },

        ],

      },

    },

    "2024-25 Onwards": {

      Engineering: [

        {

          name: "M.TECH (CSE)",

          semesters: [

            {

              name: "Syllabus",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/M.Tech/M.TECH%20(CSE).pdf",

            },

          ],

        },

      ],

      Science: [

        {

          name: "M. Sc. Geoinformatics",

          semesters: [

            {

              name: "Syllabus",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/SCIENCE/Semester1%20Syllabus%20of%20M.%20Sc.%20Geoinformatics%20for%202024-25%20A.%20B..pdf",

            },

          ],

        },

      ],

      Law: [

        // {

        //   name: "LLM Course(2 Years)",

        //   semesters: [

        //     // {

        //     //   name: "Course Structure",

        //     //   syllabus:

        //     //     "https://aknu.edu.in/Academics/links/Syllabus/PG/LAW/1.%20BRANCH%20I%20-%20LLM-CONSTITUTIOAL%20LAW%20&%20LEGAL%20ORDER%202024-2025.pdf",

        //     // },

        //   ],

        // },

        {

          name: "BRANCH I - LLM-CONSTITUTIONAL LAW & LEGAL ORDER",

          semesters: [

            {

              name: "Syllabus",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/LAW/1.%20BRANCH%20I%20-%20LLM-CONSTITUTIOAL%20LAW%20&%20LEGAL%20ORDER%202024-2025.pdf",

            },

          ],

        },

        {

          name: "BRANCH IV- LABOUR CAPITAL AND LAW",

          semesters: [

            {

              name: "Syllabus",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/LAW/2.%20BRANCH%20IV-%20LABOUR%20CAPITAL%20AND%20LAW%202024-2025.pdf",

            },

          ],

        },

        {

          name: "BRANCH VIII - LL.M CORPORATE LAW",

          semesters: [

            {

              name: "Syllabus",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/LAW/3.%20BRANCH%20VIII%20-%20LL.M%20%20CORPORATE%20LAW%202024-2025.pdf",

            },

          ],

        },

      ],

      Diploma: [

        {

          name: "PG Diploma in Yoga",

          semesters: [

            {

              name: "Syllabus",

              syllabus:

                "https://aknu.edu.in/Academics/links/AAF/PG2023-24/PG%20DIPLOMA%20IN%20YOGA%20SYLLABUS_W.E.F%202024-2025.pdf",

            },

          ],

        },

      ],

    },

    "2023-24 Onwards": {

      Science: [

        {

          name: "M.Sc Food Science and Technology (I Sem)",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg202324FoodScienceTech,

            },

          ],

        },

        {

          name: "M.Sc Psychology",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg202324Psychology,

            },

          ],

        },

      ],

    },

    "2021-22 Onwards": {

      Science: [

        {

          name: "M.Sc. Forensic Science Chemistry and Toxicology",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg202122ForensicChemTox,

            },

          ],

        },

        {

          name: "M.Sc. Forensic Science Questioned Documents and Fingerprints",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg202122ForensicQDE,

            },

          ],

        },

        {

          name: "M.Sc. Forensic Science DNA Fingerprinting",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg202122ForensicDNA,

            },

          ],

        },

        {

          name: "M.Sc. Digital Forensics and Information Security",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg202122DigitalForensics,

            },

          ],

        },

        {

          name: "M.Sc. Cybersecurity",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg202122Cybersecurity,

            },

          ],

        },

      ],

    },



    "2020-21 AB": {

      Diploma: [

        {

          name: "PG Diploma Mudlogging",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg202021Mudlogging,

            },

          ],

        },

      ],

    },

    "2019-20 AB": {

      Science: [

        {

          name: "M.Sc. Analytical Chemistry",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920Analytical,

            },

          ],

        },

        {

          name: "M.Sc. Aquaculture",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920Aquaculture,

            },

          ],

        },

        {

          name: "M.Sc. Biochemistry",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920Biochemistry,

            },

          ],

        },

        {

          name: "M.Sc. Biotechnology",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920Biotechnology,

            },

          ],

        },

        {

          name: "M.Sc. Botany",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920Botany,

            },

          ],

        },

        {

          name: "M.Sc. Clinical Nutrition",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920ClinicalNutrition,

            },

          ],

        },

        { name: "M.Sc. Forensic Science", semesters: [] },

        {

          name: "M.Sc. Geology",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920Geology,

            },

          ],

        },

        {

          name: "M.Sc. Geophysics",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920Geophysics,

            },

          ],

        },

        {

          name: "M.Sc. Microbiology",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920Microbiology,

            },

          ],

        },

        {

          name: "M.Sc. Applied Mathematics",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920AppliedMath,

            },

          ],

        },

        {

          name: "M.Sc. Mathematics",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920Mathematics,

            },

          ],

        },

        {

          name: "M.Sc. Organic Chemistry",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920Organic,

            },

          ],

        },

        {

          name: "M.Sc. Physical Chemistry",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920Physical,

            },

          ],

        },

        {

          name: "M.Sc. Physics",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920Physics,

            },

          ],

        },

        {

          name: "M.Sc. Zoology",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920Zoology,

            },

          ],

        },

        {

          name: "PG Diploma Mudlogging(2020-21 AB)",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg202021Mudlogging,

            },

          ],

        },

      ],

      Arts: [

        {

          name: "M.A Economics",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920MAEconomics,

            },

          ],

        },

        {

          name: "M.A English",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920MAEnglish,

            },

          ],

        },

        {

          name: "M.A Political Science",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920MAPoliticalScience,

            },

          ],

        },

        {

          name: "M.A Psychology",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920MAPsychology,

            },

          ],

        },

        {

          name: "M.A Public Administration",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920MAPublicAdmin,

            },

          ],

        },

        {

          name: "M.A Social Work",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920MASocialWork,

            },

          ],

        },

        {

          name: "M.A Telugu",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920MATelugu,

            },

          ],

        },

        {

          name: "M.Com",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201920MCom,

            },

          ],

        },

      ],

      Professional: [

        {

          name: "B.Ed",

          semesters: [

            {

              name: "Syllabus",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/PROFESSIONAL/EDU/BOS%20approved%20B.Ed%20Curriculuam.pdf",

            },

          ],

        },

        {

          name: "B.P.Ed",

          semesters: [

            {

              name: "Syllabus",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/PROFESSIONAL/EDU/BPED%20SYLLABUS.PDF",

            },

          ],

        },

        {

          name: "D.P.Ed",

          semesters: [

            {

              name: "Syllabus",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/PROFESSIONAL/EDU/DPED%20SYLLABUS.PDF",

            },

          ],

        },

        {

          name: "M.Ed",

          semesters: [

            {

              name: "Syllabus",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/PROFESSIONAL/EDU/ANUR_M.Ed._Regulations_Curriculum_2015-17.pdf",

            },

          ],

        },

        {

          name: "M.P.Ed",

          semesters: [

            {

              name: "Syllabus",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/PROFESSIONAL/EDU/ANUR_M.P.Ed._Regulations_Curriculum_2015-17%20final.pdf",

            },

          ],

        },

        {

          name: "MCA (w.e.f 2020-21 AB)",

          semesters: [

            {

              name: "Syllabus & Model Papers",

              syllabus: "https://www.aknu.edu.in/UCE/Syllabus/MCA.pdf",

            },

          ],

        },

        {

          name: "MBA (w.e.f 2019-20 AB)",

          semesters: [

            {

              name: "Syllabus & Model Papers",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/PROFESSIONAL/MBA%20Syllabus%202019-20%20AB.pdf",

            },

          ],

        },

        {

          name: "MBA(Tourism & Hospitality)",

          semesters: [

            {

              name: "Syllabus & Model Papers",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/PROFESSIONAL/MBT%20Syllabus%202019-20%20AB%20-06March2021.pdf",

            },

          ],

        },

      ],

    },

    "2016-17 AB": {

      Arts: [

        {

          name: "M.A Economics",

          semesters: [

            {

              name: "Syllabus (All Semesters)",

              syllabus: pg201617MAEconomics,

            },

          ],

        },

        {

          name: "M.A Public Administration",

          semesters: [

            {

              name: "Syllabus (All Semesters)",

              syllabus: pg201617MAPublicAdmin,

            },

          ],

        },

        {

          name: "M.A Psychology",

          semesters: [

            {

              name: "Syllabus (All Semesters)",

              syllabus: pg201617MAPsychology,

            },

          ],

        },

        {

          name: "M.A Social Work",

          semesters: [

            {

              name: "Syllabus (All Semesters)",

              syllabus: pg201617MASocialWork,

            },

          ],

        },

        {

          name: "M.A Telugu",

          semesters: [

            {

              name: "Syllabus (All Semesters)",

              syllabus: pg201617MATelugu,

            },

          ],

        },

        {

          name: "M.Com",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201617MCom,

            },

          ],

        },

      ],

      Science: [

        {

          name: "M.Sc. Computer Science",

          semesters: [

            {

              name: "Course Structure",

              syllabus: pg201617ComputerScience,

            },

            {

              name: "2nd Sem Model Papers",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/SCIENCE/M.Sc%20Computers%201st%20Year%202nd%20Semester%20MQP.pdf",

            },

            {

              name: "3rd Sem Model Papers",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/SCIENCE/MSC-THIRDSEM-MQP.pdf",

            },

          ],

        },

        {

          name: "M.Sc. Aquaculture",

          semesters: [

            {

              name: "Syllabus (All Semesters)",

              syllabus: pg201617Aquaculture,

            },

          ],

        },

        {

          name: "M.Sc. Analytical Chemistry",

          semesters: [

            {

              name: "I & II Semesters",

              syllabus: pg201617ChemistryCommon,

            },

            {

              name: "III Sem Syllabus",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/SCIENCE/analytical%20chem%20syllabus%202016-17ab.pdf",

            },

            {

              name: "III Sem Model Papers",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/SCIENCE/analytical%20chem%20modelpapers%202016-17ab.pdf",

            },

          ],

        },

        {

          name: "M.Sc. Applied Mathematics",

          semesters: [

            {

              name: "Syllabus (All Semesters)",

              syllabus: pg201617AppliedMath,

            },

            {

              name: "Model Papers",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/SCIENCE/Applied%20Mathematics%20MQP.PDF",

            },

            {

              name: "IV Sem Model Papers",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/SCIENCE/IV%20Sem%20Applied%20Mathematics%20MQP.pdf",

            },

          ],

        },

        {

          name: "M.Sc. Biochemistry",

          semesters: [

            {

              name: "Syllabus (All Semesters)",

              syllabus: pg201617Biochemistry,

            },

          ],

        },

        {

          name: "M.Sc. Biotechnology",

          semesters: [

            {

              name: "Syllabus (All Semesters)",

              syllabus: pg201617Biotechnology,

            },

          ],

        },

        {

          name: "M.Sc. Botany",

          semesters: [

            {

              name: "Syllabus (All Semesters)",

              syllabus: pg201617Botany,

            },

          ],

        },

        {

          name: "M.Sc. Clinical Nutrition",

          semesters: [

            {

              name: "Syllabus (All Semesters)",

              syllabus: pg201617ClinicalNutrition,

            },

          ],

        },

        {

          name: "M.Sc. Geology",

          semesters: [

            {

              name: "Syllabus (All Semesters)",

              syllabus: pg201617Geology,

            },

          ],

        },

        {

          name: "M.Sc. Geophysics",

          semesters: [

            {

              name: "Syllabus (All Semesters)",

              syllabus: pg201617Geophysics,

            },

          ],

        },

        {

          name: "M.Sc. Mathematics",

          semesters: [

            {

              name: "Syllabus (All Semesters)",

              syllabus: pg201617Mathematics,

            },

            {

              name: "IV Sem Model Papers",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/SCIENCE/IV%20Semester%20Mathematics%20MQP.pdf",

            },

          ],

        },

        {

          name: "M.Sc. Microbiology",

          semesters: [

            {

              name: "Syllabus (All Semesters)",

              syllabus: pg201617Microbiology,

            },

          ],

        },

        {

          name: "M.Sc. Organic Chemistry",

          semesters: [

            {

              name: "I & II Semesters",

              syllabus: pg201617ChemistryCommon,

            },

            {

              name: "III & IV Semesters",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/SCIENCE/THIRD_and_FOURTH_SEMESTER_syllabus.PDF",

            },

            {

              name: "III Sem Model Papers",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/SCIENCE/M.Sc%20Organic%20Chemistry%203rd%20Semester%20MQP.pdf",

            },

          ],

        },

        {

          name: "M.Sc. Physical Chemistry",

          semesters: [

            {

              name: "I & II Semesters",

              syllabus: pg201617ChemistryCommon,

            },

            {

              name: "III Semester",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/SCIENCE/M.Sc%20PHYSICAL%20CHEMISTRY%20SYLLABUS_iiisem_2016-17ab.pdf",

            },

            {

              name: "III Sem Model Papers",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/SCIENCE/Physical%20Chemistry%203rd%20Semester%20MQP.pdf",

            },

          ],

        },

        {

          name: "M.Sc. Physics",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201617Physics,

            },

          ],

        },

        {

          name: "M.Sc. Polymer Science",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201617PolymerScience,

            },

          ],

        },

        {

          name: "M.Sc. Zoology",

          semesters: [

            {

              name: "Syllabus (All Semesters)",

              syllabus: pg201617Zoology,

            },

          ],

        },

      ],

      Law: [

        {

          name: "LLM Course(2 Years)",

          semesters: [

            {

              name: "Course Structure",

              syllabus: pg201617LLMCS,

            },

            {

              name: "Syllabus",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/LAW/Revised%20LL.M%20Syllabus.pdf",

            },

          ],

        },

      ],

      Professional: [

        {

          name: "B.Ed",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201617BEd,

            },

          ],

        },

        {

          name: "B.P.Ed",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201617BPEd,

            },

          ],

        },

        {

          name: "D.P.Ed",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201617DPEd,

            },

          ],

        },

        {

          name: "M.Ed",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201617MEd,

            },

          ],

        },

        {

          name: "M.P.Ed",

          semesters: [

            {

              name: "Syllabus",

              syllabus: pg201617MPEd,

            },

          ],

        },

        {

          name: "MBA",

          semesters: [

            {

              name: "1st Semester Syllabus",

              syllabus: pg201617MBASem1,

            },

            {

              name: "1st Semester Model Papers",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/PROFESSIONAL/MBA%20I%20Semester%20Mqp.pdf",

            },

            {

              name: "2nd Semester Syllabus",

              syllabus: pg201617MBASem2,

            },

            {

              name: "2nd Semester Model Papers",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/PROFESSIONAL/mba%20II%20sem%20model%20papers.pdf",

            },

            {

              name: "3rd & 4th Semesters Syllabus",

              syllabus: pg201617MBASem34,

            },

            {

              name: "3rd Semester Model Papers",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/PROFESSIONAL/MBA%20III%20Semester%20mqp%20wef%202016-17.pdf",

            },

            {

              name: "Modified syllabus in IV Semester",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/PROFESSIONAL/behavioral%20finance.pdf",

            },

          ],

        },

        {

          name: "MCA",

          semesters: [

            {

              name: "1st Semester Syllabus",

              syllabus: pg201617MCASem1,

            },

            {

              name: "1st Semester Model Papers",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/PROFESSIONAL/MCA-Final-Model%20QP-17Sep2016.pdf",

            },

            {

              name: "2nd Semester Syllabus",

              syllabus: pg201617MCASem2,

            },

            {

              name: "2nd Semester Model Papers",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/PROFESSIONAL/MCA%202nd%20Semester%20MQP.pdf",

            },

            {

              name: "III, IV, V & VI Semester Syllabus",

              syllabus: pg201617MCASem36,

            },

            {

              name: "III Sem Model Papers",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/PROFESSIONAL/THIRDSEM-MCA-MQP.pdf",

            },

            {

              name: "IV Sem Model Papers",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/PROFESSIONAL/MCA%20IV%20Sem%20MQP.pdf",

            },

            {

              name: "V Sem Model Papers",

              syllabus:

                "https://aknu.edu.in/Academics/links/Syllabus/PG/PROFESSIONAL/MCA%20V%20Semester%20MQP.pdf",

            },

            {

              name: "Project Guidelines and Formats",

              syllabus: pg201617MCAProject,

            },

          ],

        },

      ],

    },

  };



  // Merge dynamic and static courses safely, showing dynamic syllabuses first

  const coursesByYear = {};
  Object.keys(dynamicSyllabuses).forEach(year => {
    coursesByYear[year] = JSON.parse(JSON.stringify(dynamicSyllabuses[year]));
  });
  Object.keys(staticCourses).forEach(year => {
    if (!coursesByYear[year]) {
      coursesByYear[year] = JSON.parse(JSON.stringify(staticCourses[year]));
    } else {
      Object.keys(staticCourses[year]).forEach(category => {
        if (!coursesByYear[year][category]) {
          coursesByYear[year][category] = JSON.parse(JSON.stringify(staticCourses[year][category]));
        } else {
          if (Array.isArray(staticCourses[year][category])) {
            if (!coursesByYear[year][category]["General"]) {
              coursesByYear[year][category]["General"] = JSON.parse(JSON.stringify(staticCourses[year][category]));
            } else {
              if (Array.isArray(coursesByYear[year][category]["General"])) {
                const dynamicList = coursesByYear[year][category]["General"];
                const dynamicNames = new Set(dynamicList.map(c => (c.name || "").trim().toLowerCase()));
                const filteredStatic = staticCourses[year][category].filter(
                  sc => !dynamicNames.has((sc.name || "").trim().toLowerCase())
                );
                coursesByYear[year][category]["General"] = [
                  ...dynamicList,
                  ...filteredStatic
                ];
              }
            }
          } else {
            Object.keys(staticCourses[year][category]).forEach(department => {
              if (!coursesByYear[year][category][department]) {
                coursesByYear[year][category][department] = JSON.parse(JSON.stringify(staticCourses[year][category][department]));
              } else {
                if (Array.isArray(coursesByYear[year][category][department]) && Array.isArray(staticCourses[year][category][department])) {
                  // Deduplicate: Dynamic courses take precedence over static entries with the same course name
                  const dynamicList = coursesByYear[year][category][department];
                  const dynamicNames = new Set(dynamicList.map(c => (c.name || "").trim().toLowerCase()));
                  const filteredStatic = staticCourses[year][category][department].filter(
                    sc => !dynamicNames.has((sc.name || "").trim().toLowerCase())
                  );
                  coursesByYear[year][category][department] = [
                    ...dynamicList,
                    ...filteredStatic
                  ];
                }
              }
            });
          }
        }
      });
    }
  });

  const [activeYear, setActiveYear] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [expandedCourses, setExpandedCourses] = useState({});

  const [expandedCategory, setExpandedCategory] = useState(null);

  const [expandedNestedCategory, setExpandedNestedCategory] = useState(null);



  // Get sorted years descending

  const allYears = Object.keys(coursesByYear).sort((a, b) => {

    const yearA = parseInt(a.match(/\d{4}/)?.[0] || 0);

    const yearB = parseInt(b.match(/\d{4}/)?.[0] || 0);

    return yearB - yearA;

  });



  // Update activeYear based on hash or latest available

  useEffect(() => {

    if (isLoading || allYears.length === 0) return;



    const hash = window.location.hash.slice(1);

    if (hash) {

      const params = new URLSearchParams(hash);

      const year = params.get("year");

      if (year && coursesByYear[year]) {

        setActiveYear(year);

        return;

      }

    }



    // Default to the latest year if no valid hash is present

    setActiveYear(allYears[0]);

  }, [isLoading, allYears[0]]);



  // Toggle course expansion

  const toggleCourse = (courseName) => {

    setExpandedCourses((prev) => ({

      ...prev,

      [courseName]: !prev[courseName],

    }));

  };



  // ===================== Link After Hash

  useEffect(() => {

    const hash = window.location.hash.slice(1); // remove "#"

    if (hash) {

      const params = new URLSearchParams(hash);

      const year = params.get("year");

      const dept = params.get("dept");

      const search = params.get("q");

      console.log("PGPG", year, dept, search);



      if (year && coursesByYear[year]) {

        setActiveYear(year);

      }

      if (search) setSearchQuery(search);

    }



    // Clear hash when component unmounts (navigating away) without scrolling

    return () => {

      if (window.location.hash) {

        window.history.replaceState(

          null,

          "",

          window.location.pathname + window.location.search

        );

      }

    };

  }, []);



  useEffect(() => {

    if (isLoading) return;



    const params = new URLSearchParams();

    if (activeYear) params.set("year", activeYear);

    if (searchQuery) params.set("q", searchQuery);



    const newHash = params.toString();

    if (window.location.hash.slice(1) !== newHash) {

      window.history.replaceState(

        null,

        "",

        window.location.pathname + window.location.search + (newHash ? `#${newHash}` : "")

      );

    }

  }, [activeYear, searchQuery, isLoading]);

  // ======================



  return (

    <div className="">

      {/* Header */}

      {/* <header className="bg-teal-800 text-white py-6 shadow-lg">

        <div className="container text-center mx-auto px-4">

          <h1 className="text-2xl md:text-3xl font-bold">Adikavi Nannaya University</h1>

          <p className="mt-2 text-teal-200">Post Graduate Syllabus Repository</p>

        </div>

      </header> */}



      {/* Main Content */}

      <main className="container mx-auto px-4 py-8">

        {/* Year Selection */}

        <div className="mb-8">

          <h2 className="text-xl font-semibold text-teal-900 mb-4">

            Select Academic Year

          </h2>

          <div className="flex flex-wrap gap-2">

            {allYears.map((year) => (

              <button

                key={year}

                onClick={() => {

                  setActiveYear(year);

                }}

                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeYear === year

                    ? "bg-teal-600 text-white shadow-md"

                    : "bg-white text-teal-800 hover:bg-teal-100"

                  }`}

              >

                {year}

              </button>

            ))}

          </div>

        </div>



        {/* Search Filter */}

        <div className="mb-8">

          <div className="relative">

            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">

              <FiSearch className="text-teal-600" />

            </div>

            <input

              type="text"

              placeholder="Search courses by name..."

              className="w-full pl-10 pr-4 py-3 border border-teal-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"

              value={searchQuery}

              onChange={(e) => setSearchQuery(e.target.value)}

            />

          </div>

          {isLoading && (

            <div className="flex items-center justify-center mt-4">

              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600"></div>

              <span className="ml-2 text-teal-800 text-sm">Loading syllabus data...</span>

            </div>

          )}

        </div>



        {/* Courses List */}

        <div className="space-y-3">

          {(activeYear === "W.E.F. 2025-26 AB" ||

            activeYear === "2024-25 Onwards" ||

            activeYear === "2023-24 Onwards" ||

            activeYear === "2021-22 Onwards" ||

            activeYear === "2019-20 AB" ||

            activeYear === "2020-21 AB" ||

            activeYear === "2016-17 AB" ||

            Object.keys(dynamicSyllabuses).includes(activeYear)) &&

            // Accordion rendering for specified years (and all dynamic years)

            Object.keys(coursesByYear[activeYear] || {}).map((category) => {

              const categoryData = coursesByYear[activeYear]?.[category];

              const isNestedStructure = !Array.isArray(categoryData);



              // Filtering logic for the category content

              let displayCategory = false;

              const filteredCategoryData = {};



              if (isNestedStructure) {

                Object.keys(categoryData || {}).forEach(courseName => {

                  const courses = categoryData[courseName] || [];

                  const filteredCourses = courses.filter(course =>

                    course.name.toLowerCase().includes(searchQuery.toLowerCase())

                  );

                  if (filteredCourses.length > 0 || courseName.toLowerCase().includes(searchQuery.toLowerCase())) {

                    filteredCategoryData[courseName] = filteredCourses.length > 0 ? filteredCourses : courses;

                    displayCategory = true;

                  }

                });

              } else {

                const filteredCourses = (categoryData || []).filter(course =>

                  course.name.toLowerCase().includes(searchQuery.toLowerCase())

                );

                if (filteredCourses.length > 0) {

                  displayCategory = true;

                }

              }



              if (!displayCategory && searchQuery !== "") return null;



              return (

                <div key={category} className="border border-[#ddd] shadow-sm">

                  <button

                    className="w-full text-left py-3 px-4 bg-teal-700 text-white font-semibold text-lg flex justify-between items-center"

                    onClick={() => {

                      setExpandedCategory(

                        expandedCategory === category ? null : category

                      );

                      setExpandedNestedCategory(null); // Close nested when main category changes

                    }}

                    type="button"

                  >

                    {category}

                    <span

                      className={`transform transition-transform duration-300 ${expandedCategory === category

                          ? "rotate-180"

                          : "rotate-0"

                        }`}

                    >

                      ▼

                    </span>

                  </button>

                  {expandedCategory === category && (

                    <div className="bg-white p-5 space-y-2">

                      {isNestedStructure

                        ? // For nested structure: (category -> courseName -> courses array)

                        Object.keys(filteredCategoryData).map((courseName) => {

                          const courses = filteredCategoryData[courseName];

                          const nestedKey = `${category}-${courseName}`;

                          return (

                            <div

                              key={courseName}

                              className="border border-[#ddd] shadow-sm"

                            >

                              <button

                                className="w-full text-left py-2 px-4 bg-[#f5f5f5] border border-[#ddd] text-teal-700 font-semibold text-base flex justify-between items-center"

                                onClick={() =>

                                  setExpandedNestedCategory(

                                    expandedNestedCategory === nestedKey

                                      ? null

                                      : nestedKey

                                  )

                                }

                                type="button"

                              >

                                {courseName}

                                <span className="float-right font-bold">

                                  {expandedNestedCategory === nestedKey

                                    ? "-"

                                    : "+"}

                                </span>

                              </button>

                              {expandedNestedCategory === nestedKey && (

                                <div className="p-4 border border-t-0 border-[#ddd] bg-white">

                                  {courses.length === 0 ? (

                                    <p className="text-sm text-gray-500 italic">

                                      Syllabus not available

                                    </p>

                                  ) : (

                                    <div className="space-y-3">

                                      {courses.map((course, courseIdx) => (

                                        <div

                                          key={courseIdx}

                                          className="pl-2 border-l-2 border-teal-200"

                                        >

                                          <h4 className="text-sm font-semibold text-teal-800 mb-2">

                                            {course.name}

                                          </h4>

                                          {course.semesters &&

                                            course.semesters.length > 0 ? (

                                            <div className="space-y-2">

                                              {course.semesters.map(

                                                (sem, semIdx) => {

                                                  const localUrl =

                                                    findLocalPdf(

                                                      sem.name,

                                                      course.name

                                                    );

                                                  const href =

                                                    sem.syllabus || localUrl;

                                                  return (

                                                    <a

                                                      key={semIdx}

                                                      href={href}

                                                      className="flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200"

                                                      target="_blank"

                                                      rel="noopener noreferrer"

                                                    >

                                                      <FiDownload className="text-teal-600" />

                                                      <span>{sem.name}</span>

                                                    </a>

                                                  );

                                                }

                                              )}

                                            </div>

                                          ) : (

                                            <p className="text-sm text-gray-500 italic">

                                              Syllabus not available

                                            </p>

                                          )}

                                        </div>

                                      ))}

                                    </div>

                                  )}

                                </div>

                              )}

                            </div>

                          );

                        })

                        : // For other years: flat structure (category -> courses array)

                        Array.isArray(categoryData) &&

                        categoryData

                          .filter(

                            (course) =>

                              searchQuery === "" ||

                              course.name

                                .toLowerCase()

                                .includes(searchQuery.toLowerCase())

                          )

                          .map((course) => {

                            const nestedKey = `${category}-${course.name}`;

                            return (

                              <div

                                key={course.name}

                                className="border border-[#ddd] shadow-sm"

                              >

                                <button

                                  className="w-full text-left py-2 px-4 bg-[#f5f5f5] border border-[#ddd] text-teal-700 font-semibold text-base flex justify-between items-center"

                                  onClick={() =>

                                    setExpandedNestedCategory(

                                      expandedNestedCategory === nestedKey

                                        ? null

                                        : nestedKey

                                    )

                                  }

                                  type="button"

                                >

                                  {course.name}

                                  <span className="float-right font-bold">

                                    {expandedNestedCategory === nestedKey

                                      ? "-"

                                      : "+"}

                                  </span>

                                </button>

                                {expandedNestedCategory === nestedKey && (

                                  <div className="p-4 border border-t-0 border-[#ddd] bg-white">

                                    {course.semesters &&

                                      course.semesters.length > 0 ? (

                                      <div className="space-y-2">

                                        {course.semesters.map(

                                          (sem, semIdx) => {

                                            const localUrl = findLocalPdf(

                                              sem.name,

                                              course.name

                                            );

                                            const href =

                                              sem.syllabus || localUrl;

                                            return (

                                              <a

                                                key={semIdx}

                                                href={href}

                                                className="flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200"

                                                target="_blank"

                                                rel="noopener noreferrer"

                                              >

                                                <FiDownload className="text-teal-600" />

                                                <span>{sem.name}</span>

                                              </a>

                                            );

                                          }

                                        )}

                                      </div>

                                    ) : (

                                      <p className="text-sm text-gray-500 italic">

                                        Syllabus not available

                                      </p>

                                    )}

                                  </div>

                                )}

                              </div>

                            );

                          })}

                    </div>

                  )}

                </div>

              );

            })}

          {activeYear !== "W.E.F. 2025-26 AB" &&

            activeYear !== "2024-25 Onwards" &&

            activeYear !== "2023-24 Onwards" &&

            activeYear !== "2021-22 Onwards" &&

            activeYear !== "2019-20 AB" &&

            activeYear !== "2020-21 AB" &&

            activeYear !== "2016-17 AB" &&

            !Object.keys(dynamicSyllabuses).includes(activeYear) &&

            Object.keys(coursesByYear[activeYear] || {}).map((department) => {

              const courses = (coursesByYear[activeYear]?.[department] || []).filter(

                (course) =>

                  searchQuery === "" ||

                  course.name.toLowerCase().includes(searchQuery.toLowerCase())

              );



              if (courses.length === 0 && searchQuery !== "") return null;



              return (

                <div

                  key={department}

                  className="bg-white shadow-sm overflow-hidden"

                >

                  <div className="bg-teal-700 text-white px-6 py-4">

                    <h2 className="text-xl font-semibold">{department}</h2>

                  </div>

                  <div className="divide-y divide-teal-100">

                    {courses.map((course) => (

                      <div key={course.name} className="p-6">

                        <div

                          className="flex justify-between items-center cursor-pointer"

                          onClick={() => toggleCourse(course.name)}

                        >

                          <h3 className="text-lg font-medium text-teal-900">

                            {course.name}

                          </h3>

                          <button className="text-teal-600">

                            {expandedCourses[course.name] ? (

                              <FiChevronUp />

                            ) : (

                              <FiChevronDown />

                            )}

                          </button>

                        </div>



                        {expandedCourses[course.name] && (

                          <div className="mt-4 pl-2 border-l-2 border-teal-200">

                            {course.semesters.length === 0 ? (

                              <p className="text-gray-500 italic">

                                Syllabus not available

                              </p>

                            ) : (

                              <div className="space-y-4">

                                {course.semesters.map((sem, index) => {

                                  const localUrl = findLocalPdf(

                                    sem.name,

                                    course.name

                                  );

                                  const href = sem.syllabus || localUrl;

                                  return (

                                    <div key={index} className="mb-4">

                                      <a

                                        href={href}

                                        className="flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200"

                                        target="_blank"

                                        rel="noopener noreferrer"

                                      >

                                        <FiDownload className="text-teal-600" />

                                        <span>{sem.name}</span>

                                      </a>

                                    </div>

                                  );

                                })}

                              </div>

                            )}

                          </div>

                        )}

                      </div>

                    ))}

                  </div>

                </div>

              );

            })}

        </div>



        {/* Empty State */}

        {Object.keys(coursesByYear[activeYear] || {}).length === 0 ? (

          <div className="bg-white p-8 rounded-xl shadow-sm text-center">

            <p className="text-gray-500">No categories available for this year.</p>

          </div>

        ) : (

          searchQuery !== "" &&

          Object.keys(coursesByYear[activeYear] || {}).every(cat => {

            const catData = coursesByYear[activeYear][cat];

            const isNested = !Array.isArray(catData);

            if (isNested) {

              return Object.keys(catData).every(courseName => {

                const courses = catData[courseName] || [];

                return !courseName.toLowerCase().includes(searchQuery.toLowerCase()) &&

                  courses.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0;

              });

            } else {

              return (catData || []).filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0;

            }

          }) && (

            <div className="bg-white p-8 rounded-xl shadow-sm text-center">

              <div className="text-teal-500 mb-4">

                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />

                </svg>

              </div>

              <h3 className="text-lg font-medium text-teal-900 mb-2">No courses found</h3>

              <p className="text-teal-700 mb-4">Try adjusting your search query</p>

              <button

                onClick={() => setSearchQuery("")}

                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"

              >

                Reset Search

              </button>

            </div>

          )

        )}

      </main>

    </div>

  );

};



export default PgSyllabus;



