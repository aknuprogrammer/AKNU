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
  languageEng2016,
  languagetelugu2017,
  languageEnglish,
  languageTelugu,
  languageSanskrit,
  languageHindi,
  languageUrdu,
  baEconomicsRevised,
  baHistoryHonours,
  baHumanResourceManagement,
  baPhilosophy,
  baPoliticalScience,
  baPublicAdministration,
  baSocialWork,
  baSpecialEnglish,
  baSpecialTeluguMajor,
  bcomBfsi12,
  bcomComputerApplications,
  bcomGeneral,
  multidisciplinarySemISocialWork,
  multidisiplinaryPsychology,
  multidisciplinarySemIHistory,
  multidisciplinarySemIBioSciences,
  multidisciplinarySemIChemicalSciences,
  multidisciplinarySemIPhysicalSciences,
  multidisciplinarySemIIIEntrepreneurship,
  multidisciplinarySemIIIMathematics,
  multidsciplinaryHealth,
  multididsciplinarySemIIIPublic,
  multidisciplinarySemIIIAccounts,
  multidisciplinarySemIIIManagement,
  multiDisSemIVStatistics,
  multiDisSemIVEconomics,
  multiDisSemIVPhilosophy,
  multiDisGeography,
  multiDisSemIVNanotech,
  multiDisSemIVArts,
  skillSemIAnalytics,
  skillSemICommunication,
  skillSemIEntrepreneurship,
  skillSemILeaderShip,
  skillSemIIBusinessWriting,
  skillSemIIDigitalLiteracy,
  skillSemIIInvestmentPlanning,
  skillSemIIMarketingSkills,
  skillSemIIStockMarketingOperations,
  skillSemIIIBusinessForecasting,
  skillSemIIIProjectManagement,
  skillSemIIIInformationAndCommunicationTechnology,
  skillSemIIIDataAnalysis,
  skillSemIVTourismGuidance,
  skillSemIVDesignThinking,
  skillSemIVDigitalMarketing,
  skillSemIVCyberSecurity,
  bbaBusinessAdministration,
  bbaBusinessAnalytics,
  bbaDigitalMarketing,
  bcaComputerApplications,
  bcaDataScience,
  bvocAgriculture,
  bvocHorticultureIToV,
  bvocCriticalCareManagement,
  bvocHealthCareAndNursing,
  bvocFoodTechnology,
  bvocMedicalImageTechnology,
  ugMinorSciAnimation,
  ugMinorSciAppliedMath,
  ugMinorSciBiochemistry,
  ugMinorSciBiotechnology,
  ugMinorSciBotany,
  ugMinorSciChemistry,
  ugMinorSciComputerScience,
  ugMinorSciCyberForensics,
  ugMinorSciDataScience,
  ugMinorSciElectronics,
  ugMinorSciFoodSciTech,
  ugMinorSciForensicScience,
  ugMinorSciGeology,
  ugMinorSciHumanGenetics,
  ugMinorSciMicrobiology,
  ugMinorSciMathematics,
  ugMinorSciPhysics,
  ugMinorSciStatistics,
  ugMinorSciZoology,
  ugMinorSciCloudCSMajor,
  ugMinorSciCloudNonCS,
  ugMinorArtsAccounting,
  ugMinorArtsCommerce,
  ugMinorArtsFinancialManagement,
  ugMinorArtsInsuranceManagement,
  ugMinorArtsEconomics,
  ugMinorArtsHistory,
  ugMinorArtsHRM,
  ugMinorArtsPoliticalScience,
  ugMinorArtsPublicAdministration,
  ugMinorArtsSocialWork,
  ugMinorArtsSpecialEnglish,
  ugMinorArtsTelugu,
  ugMinorArtsBusinessManagement,
  ugMinorArtsDigitalMarketing,
  ugMinorArtsFinance,
  ugMinorArtsMarketing,
  bscAgricultureAndRuralDevelopment,
  bscAnimation,
  bscAquaculture,
  bscArtificialIntelligence,
  bscBioChemistry,
  bscBioTechnology,
  bscBotany,
  bscChemistry,
  bscComputerScienceMajor,
  bscCyberForensics,
  bscDataScience,
  bscElectronics,
  bscFisheries,
  bscFoodScienceAndNutrition,
  bscFoodScienceAndTechnology,
  bscForensicScience,
  bscGeology,
  bscHumanGenetics,
  bscMicrobiology,
  bscPhysics,
  bscStatistics,
  bscZoology,
  bscMathematics,
  // W.E.F. 2020-21 AB
  ug202021LanguageEnglish,
  ug202021LanguageTelugu,
  ug202021LanguageSanskrit,
  ug202021LanguageHindi,
  ug202021LanguageUrdu,
  ug202021LifeSkill,
  ug202021BAComputerApplications,
  ug202021BAEconomics,
  ug202021BAEconomicsVSem,
  ug202021BAGeography,
  ug202021BAGeographyVSem,
  ug202021BAHistory,
  ug202021BAHistoryVSem,
  ug202021BAHumanResourceManagement,
  ug202021BAHumanResourceManagementVSem,
  ug202021BAJournalism,
  ug202021BAJournalismVSem,
  ug202021BAMathematics,
  ug202021BAMathematicsVSem,
  ug202021BAPoliticalScience,
  ug202021BAPoliticalScienceVSem,
  ug202021BAPsychology,
  ug202021BAPsychologyVSem,
  ug202021BAPublicAdministration,
  ug202021BAPublicAdministrationVSem,
  ug202021BASocialWork,
  ug202021BASocialWorkVSem,
  ug202021BASociology,
  ug202021BASociologyVSem,
  ug202021BASpecialEnglish,
  ug202021BASpecialEnglishVSem,
  ug202021BASpecialTelugu,
  ug202021BASpecialTeluguVSem,
  ug202021BATourismTravelManagement,
  ug202021BATourismTravelManagementVSem,
  ug202021BAEnglishForDigitalAge,
  ug202021BAPhilosophy,
  ug202021BAPhilosophyVSem,
  ug202021BAOLTelugu,
  ug202021BComComputerApplications,
  ug202021BComComputerApplicationsVSem,
  ug202021BComGeneral,
  ug202021BComGeneralVSem,
  ug202021BComTaxationAccounting,
  ug202021BComTaxationAccountingVSem,
  ug202021BScAnalyticalChemistry,
  ug202021BScAnimation,
  ug202021BScAquacultureTechnology,
  ug202021BScArtificialIntelligenceRobotics,
  ug202021BScBiochemistry,
  ug202021BScBiochemistryVSem,
  ug202021BScBiotechnology,
  ug202021BScBotany,
  ug202021BScChemistry,
  ug202021BScChemistryVSem,
  ug202021BScComputerApplications,
  ug202021BScComputerScience,
  ug202021BScCyberForensics,
  ug202021BScDataScience,
  ug202021BScEconomics,
  ug202021BScElectronics,
  ug202021BScFilmStudies,
  ug202021BScFisheries,
  ug202021BScFoodTechnology,
  ug202021BScForensicScience,
  ug202021BScForestry,
  ug202021BScGeography,
  ug202021BScHorticulture,
  ug202021BScHumanGenetics,
  ug202021BScHumanGeneticsVSem,
  ug202021BScIoT,
  ug202021BScMathematics,
  ug202021BScMathematicsVSem,
  ug202021BScMicrobiology,
  ug202021BScMicrobiologyVSem,
  ug202021BScPhysics,
  ug202021BScStatistics,
  ug202021BScZoology,
  ug202021BVocAgriculture,
  ug202021BVocAgricultureVSem,
  ug202021BVocAgricultureEntrepreneurship,
  ug202021BVocAgricultureEntrepreneurshipVSem,
  ug202021BVocCriticalCareManagement,
  ug202021BVocCriticalCareManagementVSem,
  ug202021BVocFisheries,
  ug202021BVocFisheriesVSem,
  ug202021BVocFoodScienceNutrition,
  ug202021BVocFoodScienceNutritionVSem,
  ug202021BVocFoodTechnology,
  ug202021BVocFoodTechnologyVSem,
  ug202021BVocHorticulture,
  ug202021BVocHorticultureVSem,
  ug202021BVocIndustrialAquacultureFisheries,
  ug202021BVocIndustrialAquacultureFisheriesVSem,
  ug202021BVocMedicalImageTechnology,
  ug202021BVocMedicalImageTechnologyVSem,
  ug202021BVocMedicalTechnology,
  ug202021BVocMedicalTechnologyVSem,
  ug202021BVocNSQFMushroom,
  ug202021BVocNSQFAquacultureFeed,
  ug202021BVocNSQFCounselling,
  ug202021BVocUGDMedicalLabTech,
  ug202021BBA,
  ug202021BBADigitalMarketing,
  ug202021BCA,
  languageSanskrit2017,
  languageHindi2017,
  languageUrdu2017,
  baComputerApp2017,
  baEconomics2016,
  bageography2016,
  baHistory2016,
  baHRM2016,
  baJournalism2016,
  baJournalism2017,
  baMaths2016,
  baPoliticalScience2016,
  baLocalSelfGovernment,
  baPsychology2016,
  baPublicAdministration2016,
  baSocialWork2016,
  baSociology2016,
  baSpecialEnglish2016,
  baSpecialTelugu2016,
  baOLTelugu2017,
  bcomCA2016,
  bcomCA2017,
  bcomGeneral2016,
  bca2016,
  bscAnimation2016,
  bscAnimation2017,
  bscAnimation2018,
  bscArtificialIntelligence2019,
  bscBiochemistry2016,
  bscBiotechnology2016,
  bscForestry2020IV,
  bscBotany2016,
  bscChemistry2016,
  bscComputerApplications2016,
  bscComputerScience2016,
  bscDataScience2019,
  bscEconomics2016,
  bscElectronics2016,
  bscFisheries2018,
  bscFoodTechnology2016,
  bscForensicScience2018,
  bscGeography2016,
  bscGeology2017,
  bscHorticulture2017,
  bscHumanGenetics2016,
  bscMathematics2016,
  bscMicrobiology2016,
  bscPhysics2016,
  bscStatistics2016,
  bscZoology2016,
  bvocAgriculture2019,
  bvocFoodTechnology2019,
  bvocHorticulture2019,
  bba2016,
  bbaDigitalMarketing2019,
  bpharmacy2019,
  law3YearLLB,
  law5YearBALLB,
  law5YearBBALLB,
} from "./ugPdfs";

const UgSyllabus = () => {
  const [dynamicSyllabuses, setDynamicSyllabuses] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dynamic syllabuses from the API
  useEffect(() => {
    const fetchSyllabuses = async () => {
      try {
        const apiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
        const response = await fetch(`${apiUrl}/api/syllabus/all/UG`);
        const data = await response.json();
        
        // Group flat data into: Year -> Category -> Dept -> Subject structure
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
        console.error("Failed to fetch dynamic syllabuses:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSyllabuses();
  }, []);

  // Complete data structure for UG courses
  const staticCourses = {
    "W.E.F. 2025-26 AB": {
      "Conventional UG": {
        "B.A": [
          {
            name: "B.A. Honours in Economics (Major)",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "B.A. Honours in History",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Human Resource Management",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Philosophy",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Political Science",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Public Administration",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Social Work",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Special English",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Special Telugu Major",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
        ],
        "B.Com": [
          {
            name: "B.Com BFSI",
            // semesters: [{ name: "Syllabus (1&2 sem)", syllabus: "" }],
          },
          {
            name: "B.Com. Computer Applications",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "B.Com. General",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
        ],
        "B.Sc": [
          {
            name: "Agriculture and Rural Development",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Animation",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Aquaculture",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Artificial Intelligence",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Bio Chemistry",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Bio Technology",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Botany",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Chemistry",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Computer Science Major",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Cyber Forensics",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Data Science",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Electronics",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Fisheries",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Food Science and Nutrition",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Food Science and Technology",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Forensic Science",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Geology",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Human Genetics",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Mathematics",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Microbiology",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Physics",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Statistics",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Zoology",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
        ],
        "B.Voc": [
          {
            name: "Agriculture",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Horticulture",
            // semesters: [{ name: "Syllabus (I to V SEM)", syllabus: "" }],
          },
          {
            name: "Critical Care Management",
            // semesters: [
            //   {
            //     name: "Syllabus (I-V Sem)",
            //     syllabus: "",
            //   },
            // ],
          },
          {
            name: "Health Care & Nursing",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Food Technology",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "Medical Image Technology",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
        ],
      },
      "Professional UG": {
        "B.B.A": [
          {
            name: "B.B.A. Business Administration",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "B.B.A. Business Analytics",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "BBA Digital Marketing",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
        ],
        BCA: [
          {
            name: "B.C.A. Computer Applications",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
          {
            name: "B.C.A. Data Science",
            // semesters: [{ name: "Syllabus", syllabus: "" }],
          },
        ],
        LAW: [],
        Engineering: [],
        Pharmacy: [],
        Education: [],
      },
      "Diploma Courses UG": {
        Yoga: [],
      },
    },
    "W.E.F. 2023-24 AB": {
      Languages: [
        {
          name: "English (Common for All Courses)",
          semesters: [
            {
              name: "Syllabus",
              syllabus: languageEnglish,
            },
          ],
        },
        {
          name: "Telugu",
          semesters: [
            {
              name: "Syllabus",
              syllabus: languageTelugu,
            },
          ],
        },
        {
          name: "Sanskrit",
          semesters: [
            {
              name: "Syllabus",
              syllabus: languageSanskrit,
            },
          ],
        },
        {
          name: "Hindi",
          semesters: [
            {
              name: "Syllabus",
              syllabus: languageHindi,
            },
          ],
        },
        {
          name: "Urdu",
          semesters: [
            {
              name: "Syllabus",
              syllabus: languageUrdu,
            },
          ],
        },
      ],
      "Multidisciplinary Courses": [
        {
          name: "I Semester Multidisciplinary Courses",
          semesters: [
            {
              name: "Introduction to Social Work",
              syllabus: multidisciplinarySemISocialWork,
            },
            {
              name: "Principles of Psychology",
              syllabus: multidisiplinaryPsychology,
            },
            {
              name: "Indian History",
              syllabus: multidisciplinarySemIHistory,
            },
            {
              name: "Principles of Biological Sciences",
              syllabus: multidisciplinarySemIBioSciences,
            },
            {
              name: "Principles of Chemical Sciences",
              syllabus: multidisciplinarySemIChemicalSciences,
            },
            {
              name: "Principles of Physical Sciences",
              syllabus: multidisciplinarySemIPhysicalSciences,
            },
          ],
        },
        {
          name: "III Semester Multidisciplinary Courses",
          semesters: [
            {
              name: "Introduction to Public Administration",
              syllabus: multididsciplinarySemIIIPublic,
            },
            {
              name: "Principles of Management",
              syllabus: multidisciplinarySemIIIManagement,
            },
            {
              name: "Principles of Accounting",
              syllabus: multidisciplinarySemIIIAccounts,
            },
            {
              name: "Basic Electronics",
              syllabus: multidisciplinarySemIIIEntrepreneurship,
            },
            {
              name: "Health and Hygiene",
              syllabus: multidsciplinaryHealth,
            },
            {
              name: "Basic Mathematics",
              syllabus: multidisciplinarySemIIIMathematics,
            },
          ],
        },
        {
          name: "IV Semester Multidisciplinary Courses",
          semesters: [
            {
              name: "Introduction to Nanotechnology",
              syllabus: multiDisSemIVNanotech,
            },
            {
              name: "Introduction to Geography",
              syllabus: multiDisGeography,
            },
            {
              name: "Indian Philosophy",
              syllabus: multiDisSemIVPhilosophy,
            },
            {
              name: "Fundamentals of Economics",
              syllabus: multiDisSemIVEconomics,
            },
            {
              name: "Performing Arts",
              syllabus: multiDisSemIVArts,
            },
            {
              name: "Basic Statistics",
              syllabus: multiDisSemIVStatistics,
            },
          ],
        },
      ],
      "Skill Courses": [
        {
          name: "I Semester Skill Courses",
          semesters: [
            {
              name: "Entrepreneurship Development",
              syllabus: skillSemIEntrepreneurship,
            },
            {
              name: "Leadership Skills",
              syllabus: skillSemILeaderShip,
            },
            {
              name: "Analytical Skills",
              syllabus: skillSemIAnalytics,
            },
            {
              name: "Communication Skills",
              syllabus: skillSemICommunication,
            },
          ],
        },
        {
          name: "II Semester Skill Enhancement Courses",
          semesters: [
            {
              name: "Business Writing",
              syllabus: skillSemIIBusinessWriting,
            },
            {
              name: "Marketing Skills",
              syllabus: skillSemIIMarketingSkills,
            },
            {
              name: "Stock Market Operations",
              syllabus: skillSemIIStockMarketingOperations,
            },
            {
              name: "Investment Planning",
              syllabus: skillSemIIInvestmentPlanning,
            },
            {
              name: "Digital Literacy",
              syllabus: skillSemIIDigitalLiteracy,
            },
          ],
        },
        {
          name: "III Semester Skill Courses",
          semesters: [
            {
              name: "Business Forecasting",
              syllabus: skillSemIIIBusinessForecasting,
            },
            {
              name: "Project Management",
              syllabus: skillSemIIIProjectManagement,
            },
            {
              name: "Information and Communication Technology",
              syllabus: skillSemIIIInformationAndCommunicationTechnology,
            },
            {
              name: "Data Analysis",
              syllabus: skillSemIIIDataAnalysis,
            },
          ],
        },
        {
          name: "IV Semester Skill Courses",
          semesters: [
            {
              name: "Tourism Guidance",
              syllabus: skillSemIVTourismGuidance,
            },
            {
              name: "Design Thinking",
              syllabus: skillSemIVDesignThinking,
            },
            {
              name: "Digital Marketing",
              syllabus: skillSemIVDigitalMarketing,
            },
            {
              name: "Cyber Security",
              syllabus: skillSemIVCyberSecurity,
            },
          ],
        },
      ],
      "B.Sc Subjects": [
        {
          name: "Animation",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bscAnimation,
            },
          ],
        },
        {
          name: "Aquaculture",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bscAquaculture,
            },
          ],
        },
        {
          name: "Artificial Intelligence",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bscArtificialIntelligence,
            },
          ],
        },
        {
          name: "Agriculture and Rural Development",
          semesters: [
            {
              name: "Syllabus (1 to 4 Semesters)",
              syllabus: bscAgricultureAndRuralDevelopment,
            },
          ],
        },
        {
          name: "Bio-Chemistry",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bscBioChemistry,
            },
          ],
        },
        {
          name: "Bio-Technology",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bscBioTechnology,
            },
          ],
        },
        {
          name: "Botany",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bscBotany,
            },
          ],
        },
        {
          name: "Chemistry",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bscChemistry,
            },
          ],
        },
        {
          name: "Computer Science",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bscComputerScienceMajor,
            },
          ],
        },
        {
          name: "Cyber Forensic",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bscCyberForensics,
            },
          ],
        },
        {
          name: "Data Science",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bscDataScience,
            },
          ],
        },
        {
          name: "Electronics",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bscElectronics,
            },
          ],
        },
        {
          name: "Fisheries",
          semesters: [
            {
              name: "Syllabus (1 to 4 Semesters)",
              syllabus: bscFisheries,
            },
          ],
        },
        {
          name: "Food Science and Nutrition",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bscFoodScienceAndNutrition,
            },
          ],
        },
        {
          name: "Food Science and Technology",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bscFoodScienceAndTechnology,
            },
          ],
        },
        {
          name: "Forensic Science",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bscForensicScience,
            },
          ],
        },
        {
          name: "Geology",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bscGeology,
            },
          ],
        },
        {
          name: "Human Genetics",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bscHumanGenetics,
            },
          ],
        },
        {
          name: "Mathematics",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bscMathematics,
            },
          ],
        },
        {
          name: "Micro-Biology",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bscMicrobiology,
            },
          ],
        },
        {
          name: "Physics",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bscPhysics,
            },
          ],
        },
        {
          name: "Statistics",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bscStatistics,
            },
          ],
        },
        {
          name: "Zoology",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bscZoology,
            },
          ],
        },
      ],
      "B.A Subjects": [
        {
          name: "Human Resource Management",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: baHumanResourceManagement,
            },
          ],
        },
        {
          name: "Special Telugu",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: baSpecialTeluguMajor,
            },
          ],
        },
        {
          name: "Special English",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: baSpecialEnglish,
            },
          ],
        },
        {
          name: "Social Work",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: baSocialWork,
            },
          ],
        },
        {
          name: "Public Administration",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: baPublicAdministration,
            },
          ],
        },
        {
          name: "Political Science",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: baPoliticalScience,
            },
          ],
        },
        {
          name: "Philosophy",
          semesters: [
            {
              name: "Syllabus (1 to 4 Semester)",
              syllabus: baPhilosophy,
            },
          ],
        },
        {
          name: "History",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: baHistoryHonours,
            },
          ],
        },
        {
          name: "Economics",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus:
                "https://aknu.edu.in/Academics/links/AAF/UG/2023-24/majorsemII/BA/Economics%20Major.pdf",
            },
            {
              name: "Revised Syllabus (2024-25)",
              syllabus: baEconomicsRevised,
            },
          ],
        },
      ],
      "B.Com Subjects": [
        {
          name: "General",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bcomGeneral,
            },
          ],
        },
        {
          name: "Computer Applications",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bcomComputerApplications,
            },
          ],
        },
        {
          name: "Banking Financial Services & Insurance (BFSI)",
          semesters: [
            {
              name: "I & II Semester Syllabus",
              syllabus: bcomBfsi12,
            },
          ],
        },
      ],
      "BBA Subjects": [
        {
          name: "Digital Marketing",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bbaDigitalMarketing,
            },
          ],
        },
        {
          name: "Business Administration",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bbaBusinessAdministration,
            },
          ],
        },
        {
          name: "Business Analytics",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bbaBusinessAnalytics,
            },
          ],
        },
      ],
      "BCA Subjects": [
        {
          name: "Data Science",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bcaDataScience,
            },
          ],
        },
        {
          name: "Computer Applications",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bcaComputerApplications,
            },
          ],
        },
      ],
      "B.Voc Subjects": [
        {
          name: "Medical Image Technology",
          semesters: [
            {
              name: "Syllabus (1 to 4 Semester)",
              syllabus: bvocMedicalImageTechnology,
            },
          ],
        },
        {
          name: "Horticulture",
          semesters: [
            {
              name: "Syllabus (1 to 4 Semesters)",
              syllabus: bvocHorticultureIToV,
            },
          ],
        },
        {
          name: "Food Technology",
          semesters: [
            {
              name: "Syllabus (2023-24)",
              syllabus: bvocFoodTechnology,
            },
          ],
        },
        {
          name: "Agriculture",
          semesters: [
            {
              name: "Syllabus (1 to 4 Semesters)",
              syllabus: bvocAgriculture,
            },
          ],
        },
        {
          name: "Critical Care Management",
          semesters: [
            {
              name: "Syllabus (1 to 4 Semesters)",
              syllabus: bvocCriticalCareManagement,
            },
          ],
        },
        {
          name: "Health Care & Nursing",
          semesters: [
            {
              name: "I Semester Syllabus",
              syllabus: bvocHealthCareAndNursing,
            },
          ],
        },
      ],
      "UG Minor Courses": [
        {
          name: "Science Minor Courses",
          semesters: [
            {
              name: "Animation",
              syllabus: ugMinorSciAnimation,
            },
            {
              name: "Applied Mathematics",
              syllabus: ugMinorSciAppliedMath,
            },
            {
              name: "Biochemistry",
              syllabus: ugMinorSciBiochemistry,
            },
            {
              name: "Biotechnology",
              syllabus: ugMinorSciBiotechnology,
            },
            {
              name: "Botany",
              syllabus: ugMinorSciBotany,
            },
            {
              name: "Chemistry",
              syllabus: ugMinorSciChemistry,
            },
            {
              name: "Computer Science",
              syllabus: ugMinorSciComputerScience,
            },
            {
              name: "Cyber Forensics",
              syllabus: ugMinorSciCyberForensics,
            },
            {
              name: "Data Science",
              syllabus: ugMinorSciDataScience,
            },
            {
              name: "Electronics",
              syllabus: ugMinorSciElectronics,
            },
            {
              name: "Food Science & Technology",
              syllabus: ugMinorSciFoodSciTech,
            },
            {
              name: "Forensic Science",
              syllabus: ugMinorSciForensicScience,
            },
            {
              name: "Geology",
              syllabus: ugMinorSciGeology,
            },
            {
              name: "Human Genetics",
              syllabus: ugMinorSciHumanGenetics,
            },
            {
              name: "Microbiology",
              syllabus: ugMinorSciMicrobiology,
            },
            {
              name: "Mathematics",
              syllabus: ugMinorSciMathematics,
            },
            {
              name: "Physics",
              syllabus: ugMinorSciPhysics,
            },
            {
              name: "Statistics",
              syllabus: ugMinorSciStatistics,
            },
            {
              name: "Zoology",
              syllabus: ugMinorSciZoology,
            },
            {
              name: "Cloud Computing (for Computer Science Major)",
              syllabus: ugMinorSciCloudCSMajor,
            },
            {
              name: "Cloud Computing (for Non Computer Science Major)",
              syllabus: ugMinorSciCloudNonCS,
            },
          ],
        },
        {
          name: "Arts Minor Courses",
          semesters: [
            {
              name: "Accounting",
              syllabus: ugMinorArtsAccounting,
            },
            {
              name: "Commerce",
              syllabus: ugMinorArtsCommerce,
            },
            {
              name: "Financial Management",
              syllabus: ugMinorArtsFinancialManagement,
            },
            {
              name: "Insurance Management",
              syllabus: ugMinorArtsInsuranceManagement,
            },
            {
              name: "Economics",
              syllabus: ugMinorArtsEconomics,
            },
            {
              name: "History",
              syllabus: ugMinorArtsHistory,
            },
            {
              name: "Human Resource Management",
              syllabus: ugMinorArtsHRM,
            },
            {
              name: "Political Science",
              syllabus: ugMinorArtsPoliticalScience,
            },
            {
              name: "Public Administration",
              syllabus: ugMinorArtsPublicAdministration,
            },
            {
              name: "Social Work",
              syllabus: ugMinorArtsSocialWork,
            },
            {
              name: "Special English",
              syllabus: ugMinorArtsSpecialEnglish,
            },
            {
              name: "Special Telugu",
              syllabus: ugMinorArtsTelugu,
            },
            {
              name: "Business Management",
              syllabus: ugMinorArtsBusinessManagement,
            },
            {
              name: "Digital Marketing",
              syllabus: ugMinorArtsDigitalMarketing,
            },
            {
              name: "Finance (For Commerce and other Majors)",
              syllabus: ugMinorArtsFinance,
            },
            {
              name: "Marketing",
              syllabus: ugMinorArtsMarketing,
            },
          ],
        },
      ],
    },
    "W.E.F. 2020-21 AB": {
      Languages: [
        {
          name: "English",
          semesters: [
            {
              name: "Syllabus (2016-17)",
              syllabus: languageEng2016,
            },
            {
              name: "Syllabus (2020-21)",
              syllabus: ug202021LanguageEnglish,
            },
          ],
        },
        {
          name: "Telugu",
          semesters: [
            {
              name: "Syllabus (2016-17)",
              syllabus: languagetelugu2017,
            },
            {
              name: "Syllabus (2020-21)",
              syllabus: ug202021LanguageTelugu,
            },
          ],
        },
        {
          name: "Sanskrit",
          semesters: [
            {
              name: "Syllabus (2016-17)",
              syllabus: languageSanskrit2017,
            },
            {
              name: "Syllabus (2020-21)",
              syllabus: ug202021LanguageSanskrit,
            },
          ],
        },
        {
          name: "Hindi",
          semesters: [
            {
              name: "Syllabus (2016-17)",
              syllabus: languageHindi2017,
            },
            {
              name: "Syllabus (2020-21)",
              syllabus: ug202021LanguageHindi,
            },
          ],
        },
        {
          name: "Urdu",
          semesters: [
            {
              name: "Syllabus (2016-17)",
              syllabus: languageUrdu2017,
            },
            {
              name: "Syllabus (2020-21)",
              syllabus: ug202021LanguageUrdu,
            },
          ],
        },
      ],
      "Foundation Courses": [
        {
          name: "Life Skill & Skill Development Courses",
          semesters: [
            {
              name: "Syllabus (2020-21)",
              syllabus: ug202021LifeSkill,
            },
          ],
        },
      ],
      "B.A Subjects": [
        {
          name: "Computer Applications",
          semesters: [
            {
              name: "Syllabus (2016-17)",
              syllabus: baComputerApp2017,
            },
            {
              name: "Syllabus (2020-21 I-V sem)",
              syllabus: ug202021BAComputerApplications,
            },
          ],
        },
        {
          name: "Economics",
          semesters: [
            {
              name: "Syllabus (2016-17)",
              syllabus: baEconomics2016,
            },
            {
              name: "Syllabus (2020-21)",
              syllabus: ug202021BAEconomics,
            },
            {
              name: "V Semester Syllabus",
              syllabus: ug202021BAEconomicsVSem,
            },
          ],
        },
        {
          name: "Geography",
          semesters: [
            {
              name: "2016-17",
              syllabus: bageography2016,
            },
            {
              name: "2020-21",
              syllabus: ug202021BAGeography,
            },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BAGeographyVSem,
            },
          ],
        },
        {
          name: "History",
          semesters: [
            {
              name: "2016-17",
              syllabus: baHistory2016,
            },
            {
              name: "2020-21",
              syllabus: ug202021BAHistory,
            },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BAHistoryVSem,
            },
          ],
        },
        {
          name: "Human Resource Management",
          semesters: [
            {
              name: "2016-17",
              syllabus: baHRM2016,
            },
            {
              name: "2020-21",
              syllabus: ug202021BAHumanResourceManagement,
            },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BAHumanResourceManagementVSem,
            },
          ],
        },
        {
          name: "Journalism & Mass Communication",
          semesters: [
            {
              name: "2016-17",
              syllabus: baJournalism2016,
            },
            {
              name: "2017-18",
              syllabus: baJournalism2017,
            },
            {
              name: "2020-21",
              syllabus: ug202021BAJournalism,
            },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BAJournalismVSem,
            },
          ],
        },
        {
          name: "Mathematics",
          semesters: [
            {
              name: "2016-17",
              syllabus: baMaths2016,
            },
            {
              name: "2020-21 (I-IV sem)",
              syllabus: ug202021BAMathematics,
            },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BAMathematicsVSem,
            },
          ],
        },
        {
          name: "Political Science",
          semesters: [
            {
              name: "2016-17",
              syllabus: baPoliticalScience2016,
            },
            {
              name: "2020-21",
              syllabus: ug202021BAPoliticalScience,
            },
            {
              name: "2020-21(I-V sem)",
              syllabus: baLocalSelfGovernment,
            },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BAPoliticalScienceVSem,
            },
          ],
        },
        {
          name: "Psychology",
          semesters: [
            {
              name: "2016-17",
              syllabus: baPsychology2016,
            },
            {
              name: "2020-21",
              syllabus: ug202021BAPsychology,
            },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BAPsychologyVSem,
            },
          ],
        },
        {
          name: "Public Administration",
          semesters: [
            {
              name: "2016-17",
              syllabus: baPublicAdministration2016,
            },
            {
              name: "2020-21",
              syllabus: ug202021BAPublicAdministration,
            },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BAPublicAdministrationVSem,
            },
          ],
        },
        {
          name: "Social Work",
          semesters: [
            {
              name: "2016-17",
              syllabus: baSocialWork2016,
            },
            {
              name: "2020-21",
              syllabus: ug202021BASocialWork,
            },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BASocialWorkVSem,
            },
          ],
        },
        {
          name: "Sociology",
          semesters: [
            {
              name: "2016-17",
              syllabus: baSociology2016,
            },
            {
              name: "2020-21",
              syllabus: ug202021BASociology,
            },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BASociologyVSem,
            },
          ],
        },
        {
          name: "Special English",
          semesters: [
            {
              name: "2016-17",
              syllabus: baSpecialEnglish2016,
            },
            {
              name: "2020-21",
              syllabus: ug202021BASpecialEnglish,
            },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BASpecialEnglishVSem,
            },
          ],
        },
        {
          name: "Special Telugu",
          semesters: [
            {
              name: "2016-17",
              syllabus: baSpecialTelugu2016,
            },
            {
              name: "2020-21",
              syllabus: ug202021BASpecialTelugu,
            },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BASpecialTeluguVSem,
            },
          ],
        },
        {
          name: "Tourism and Travel Management",
          semesters: [
            {
              name: "2020-21",
              syllabus: ug202021BATourismTravelManagement,
            },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BATourismTravelManagementVSem,
            },
          ],
        },
        {
          name: "English for Digital Age",
          semesters: [
            {
              name: "2020-21",
              syllabus: ug202021BAEnglishForDigitalAge,
            },
          ],
        },
        {
          name: "Philosophy",
          semesters: [
            {
              name: "2020-21",
              syllabus: ug202021BAPhilosophy,
            },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BAPhilosophyVSem,
            },
          ],
        },
        {
          name: "BA OL(Telugu)",
          semesters: [
            {
              name: "2017-18",
              syllabus: baOLTelugu2017,
            },
            {
              name: "2020-21",
              syllabus: ug202021BAOLTelugu,
            },
          ],
        },
      ],
      "B.Com": [
        {
          name: "B.Com(Computer Applications)",
          semesters: [
            { name: "2016-17", syllabus: bcomCA2016 },
            { name: "2017-18", syllabus: bcomCA2017 },
            { name: "2020-21", syllabus: ug202021BComComputerApplications },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BComComputerApplicationsVSem,
            },
          ],
        },
        {
          name: "B.Com (General)",
          semesters: [
            { name: "2016-17", syllabus: bcomGeneral2016 },
            { name: "2020-21", syllabus: ug202021BComGeneral },
            { name: "2020-21 (V sem)", syllabus: ug202021BComGeneralVSem },
          ],
        },
        {
          name: "B.Com - Taxation & Accounting",
          semesters: [
            { name: "2020-21", syllabus: ug202021BComTaxationAccounting },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BComTaxationAccountingVSem,
            },
          ],
        },
      ],
      "B.Sc": [
        {
          name: "Animation",
          semesters: [
            { name: "2016-17", syllabus: bscAnimation2016 },
            { name: "2017-18 (II,III)", syllabus: bscAnimation2017 },
            { name: "2018-19 (I)", syllabus: bscAnimation2018 },
            { name: "2020-21 (I-V sem)", syllabus: ug202021BScAnimation },
          ],
        },
        {
          name: "Artificial Intelligence and Robotics",
          semesters: [
            { name: "2019-20", syllabus: bscArtificialIntelligence2019 },
            {
              name: "2020-21 (I-V sem)",
              syllabus: ug202021BScArtificialIntelligenceRobotics,
            },
          ],
        },
        {
          name: "Analytical chemistry",
          semesters: [
            { name: "2020-21", syllabus: ug202021BScAnalyticalChemistry },
          ],
        },
        {
          name: "Aquaculture Technology",
          semesters: [
            {
              name: "2020-21 (I-V sem)",
              syllabus: ug202021BScAquacultureTechnology,
            },
          ],
        },
        {
          name: "Biochemistry",
          semesters: [
            { name: "2016-17", syllabus: bscBiochemistry2016 },
            { name: "2020-21 (I-IV sem)", syllabus: ug202021BScBiochemistry },
            { name: "2020-21 (V sem)", syllabus: ug202021BScBiochemistryVSem },
          ],
        },
        {
          name: "Biotechnology",
          semesters: [
            { name: "2016-17", syllabus: bscBiotechnology2016 },
            { name: "2020-21 (I-V sem)", syllabus: ug202021BScBiotechnology },
          ],
        },
        {
          name: "Forestry",
          semesters: [
            { name: "2020-21 (I-IV sem)", syllabus: bscForestry2020IV },
            { name: "2020-21 (I-V sem)", syllabus: ug202021BScForestry },
          ],
        },
        {
          name: "Botany",
          semesters: [
            { name: "2016-17", syllabus: bscBotany2016 },
            { name: "2020-21 (I-V sem)", syllabus: ug202021BScBotany },
          ],
        },
        {
          name: "Chemistry",
          semesters: [
            { name: "2016-17", syllabus: bscChemistry2016 },
            { name: "2020-21 (I-IV sem)", syllabus: ug202021BScChemistry },
            { name: "2020-21 (V sem)", syllabus: ug202021BScChemistryVSem },
          ],
        },
        {
          name: "Computer Applications",
          semesters: [
            { name: "2016-17", syllabus: bscComputerApplications2016 },
            {
              name: "2020-21 (I-V sem)",
              syllabus: ug202021BScComputerApplications,
            },
          ],
        },
        {
          name: "Computer Science",
          semesters: [
            { name: "2016-17", syllabus: bscComputerScience2016 },
            { name: "2020-21 (I-V sem)", syllabus: ug202021BScComputerScience },
          ],
        },
        {
          name: "Data Science",
          semesters: [
            { name: "2019-20", syllabus: bscDataScience2019 },
            { name: "2020-21 (I-V sem)", syllabus: ug202021BScDataScience },
          ],
        },
        {
          name: "Economics",
          semesters: [
            { name: "2016-17", syllabus: bscEconomics2016 },
            { name: "2020-21", syllabus: ug202021BScEconomics },
          ],
        },
        {
          name: "Internet of Things (IoT)",
          semesters: [{ name: "2020-21 (I-V sem)", syllabus: ug202021BScIoT }],
        },
        {
          name: "Electronics",
          semesters: [
            { name: "2016-17", syllabus: bscElectronics2016 },
            { name: "2020-21 (I-V sem)", syllabus: ug202021BScElectronics },
          ],
        },
        {
          name: "Film Studies",
          semesters: [
            { name: "2020-21 (I-V sem)", syllabus: ug202021BScFilmStudies },
          ],
        },
        {
          name: "Fisheries",
          semesters: [
            { name: "2018-19", syllabus: bscFisheries2018 },
            { name: "2020-21 (I-V sem)", syllabus: ug202021BScFisheries },
          ],
        },
        {
          name: "Food Technology",
          semesters: [
            { name: "2016-17", syllabus: bscFoodTechnology2016 },
            { name: "2020-21 (I-V sem)", syllabus: ug202021BScFoodTechnology },
          ],
        },
        {
          name: "Forensic Science",
          semesters: [
            { name: "2017-18", syllabus: "#" },
            { name: "2018-19", syllabus: bscForensicScience2018 },
            { name: "2020-21 (I-V sem)", syllabus: ug202021BScForensicScience },
          ],
        },
        {
          name: "Geography",
          semesters: [
            { name: "2016-17", syllabus: bscGeography2016 },
            { name: "2020-21", syllabus: ug202021BScGeography },
          ],
        },
        {
          name: "Geology",
          semesters: [{ name: "2017-18", syllabus: bscGeology2017 }],
        },
        {
          name: "Horticulture",
          semesters: [
            { name: "2017-18", syllabus: bscHorticulture2017 },
            { name: "2020-21 (I-V sem)", syllabus: ug202021BScHorticulture },
          ],
        },
        {
          name: "Human Genetics",
          semesters: [
            { name: "2016-17", syllabus: bscHumanGenetics2016 },
            { name: "2020-21 (I-IV sem)", syllabus: ug202021BScHumanGenetics },
            { name: "2020-21 (V sem)", syllabus: ug202021BScHumanGeneticsVSem },
          ],
        },
        {
          name: "Mathematics",
          semesters: [
            { name: "2016-17", syllabus: bscMathematics2016 },
            { name: "2020-21 (I-IV sem)", syllabus: ug202021BScMathematics },
            { name: "2020-21 (V sem)", syllabus: ug202021BScMathematicsVSem },
          ],
        },
        {
          name: "Microbiology",
          semesters: [
            { name: "2016-17", syllabus: bscMicrobiology2016 },
            { name: "2020-21 (I-IV sem)", syllabus: ug202021BScMicrobiology },
            { name: "2020-21 (V sem)", syllabus: ug202021BScMicrobiologyVSem },
          ],
        },
        {
          name: "Physics",
          semesters: [
            { name: "2016-17", syllabus: bscPhysics2016 },
            { name: "2020-21 (I-V sem)", syllabus: ug202021BScPhysics },
          ],
        },
        {
          name: "Statistics",
          semesters: [
            { name: "2016-17", syllabus: bscStatistics2016 },
            { name: "2020-21 (I-V sem)", syllabus: ug202021BScStatistics },
          ],
        },
        {
          name: "Zoology",
          semesters: [
            { name: "2016-17", syllabus: bscZoology2016 },
            { name: "2020-21 (I-V sem)", syllabus: ug202021BScZoology },
          ],
        },
        {
          name: "Cyber Forensics",
          semesters: [
            { name: "2020-21 (I-V sem)", syllabus: ug202021BScCyberForensics },
          ],
        },
      ],
      "B.Voc": [
        {
          name: "Agriculture",
          semesters: [
            { name: "2019-20", syllabus: bvocAgriculture2019 },
            { name: "2020-21", syllabus: ug202021BVocAgriculture },
            { name: "2020-21 (V sem)", syllabus: ug202021BVocAgricultureVSem },
          ],
        },
        {
          name: "Agriculture & Entrepreneurship",
          semesters: [
            {
              name: "2020-21",
              syllabus: ug202021BVocAgricultureEntrepreneurship,
            },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BVocAgricultureEntrepreneurshipVSem,
            },
          ],
        },
        {
          name: "Critical Care Management",
          semesters: [
            { name: "2020-21", syllabus: ug202021BVocCriticalCareManagement },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BVocCriticalCareManagementVSem,
            },
          ],
        },
        {
          name: "Fisheries",
          semesters: [
            { name: "2020-21", syllabus: ug202021BVocFisheries },
            { name: "2020-21 (V sem)", syllabus: ug202021BVocFisheriesVSem },
          ],
        },
        {
          name: "Food Science and Nutrition",
          semesters: [
            { name: "2020-21", syllabus: ug202021BVocFoodScienceNutrition },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BVocFoodScienceNutritionVSem,
            },
          ],
        },
        {
          name: "Food Technology",
          semesters: [
            { name: "2019-20", syllabus: bvocFoodTechnology2019 },
            { name: "2020-21", syllabus: ug202021BVocFoodTechnology },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BVocFoodTechnologyVSem,
            },
          ],
        },
        {
          name: "Horticulture",
          semesters: [
            { name: "2019-20", syllabus: bvocHorticulture2019 },
            { name: "2020-21", syllabus: ug202021BVocHorticulture },
            { name: "2020-21 (V sem)", syllabus: ug202021BVocHorticultureVSem },
          ],
        },
        {
          name: "Industrial Aquaculture & Fisheries",
          semesters: [
            {
              name: "2020-21",
              syllabus: ug202021BVocIndustrialAquacultureFisheries,
            },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BVocIndustrialAquacultureFisheriesVSem,
            },
          ],
        },
        {
          name: "Medical Image Technology",
          semesters: [
            { name: "2020-21", syllabus: ug202021BVocMedicalImageTechnology },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BVocMedicalImageTechnologyVSem,
            },
          ],
        },
        {
          name: "Medical Technology",
          semesters: [
            { name: "2020-21", syllabus: ug202021BVocMedicalTechnology },
            {
              name: "2020-21 (V sem)",
              syllabus: ug202021BVocMedicalTechnologyVSem,
            },
          ],
        },
        {
          name: "NSQF - Mushroom Cultivation",
          semesters: [{ name: "2020-21", syllabus: ug202021BVocNSQFMushroom }],
        },
        {
          name: "NSQF - Aquaculture Feed",
          semesters: [
            { name: "2020-21", syllabus: ug202021BVocNSQFAquacultureFeed },
          ],
        },
        {
          name: "NSQF - Counselling skills",
          semesters: [
            { name: "2020-21", syllabus: ug202021BVocNSQFCounselling },
          ],
        },
        {
          name: "UGD - Medical Lab Technology",
          semesters: [
            { name: "2020-21", syllabus: ug202021BVocUGDMedicalLabTech },
          ],
        },
      ],
      BBA: [
        {
          name: "BBA",
          semesters: [
            { name: "2016-17", syllabus: bba2016 },
            { name: "2020-21", syllabus: ug202021BBA },
            { name: "2020-21 (V sem)", syllabus: "#" },
          ],
        },
        {
          name: "BBA(Digital Marketing)",
          semesters: [
            { name: "2019-20", syllabus: bbaDigitalMarketing2019 },
            { name: "2020-21", syllabus: ug202021BBADigitalMarketing },
            { name: "2020-21 (V sem)", syllabus: "#" },
          ],
        },
      ],
      BCA: [
        {
          name: "BCA",
          semesters: [
            { name: "2016-17", syllabus: bca2016 },
            { name: "2020-21", syllabus: ug202021BCA },
            { name: "2020-21 (V sem)", syllabus: "#" },
          ],
        },
      ],
      "B.Pharmacy": [
        {
          name: "B.Pharmacy",
          semesters: [{ name: "2019-20", syllabus: bpharmacy2019 }],
        },
      ],
      Law: [
        {
          name: "3 Years Course(LLB)",
          semesters: [
            { name: "Course Structure & Syllabus", syllabus: law3YearLLB },
          ],
        },
        {
          name: "5 Years Course(B.A LLB)",
          semesters: [
            { name: "Course Structure & Syllabus", syllabus: law5YearBALLB },
          ],
        },
        {
          name: "5 Years Course(B.B.A LLB)",
          semesters: [
            { name: "Course Structure & Syllabus", syllabus: law5YearBBALLB },
          ],
        },
      ],
    },
    // Engineering: {
    //   "B.Tech": [
    //     {
    //       name: "Civil Engineering (2023-24)",
    //       semesters: [{ name: "I & II Year", syllabus: "#" }],
    //     },
    //     {
    //       name: "Computer Science Engineering (2023-24)",
    //       semesters: [{ name: "Syllabus", syllabus: "#" }],
    //     },
    //     {
    //       name: "Electronics & Communication Engineering (2023-24)",
    //       semesters: [{ name: "I & II Year", syllabus: "#" }],
    //     },
    //     {
    //       name: "Electronics & Instrumentation Engineering (2023-24)",
    //       semesters: [{ name: "Syllabus", syllabus: "#" }],
    //     },
    //     {
    //       name: "Mechanical Engineering (2023-24)",
    //       semesters: [{ name: "I & II Year", syllabus: "#" }],
    //     },
    //     {
    //       name: "Civil Engineering (2020-21)",
    //       semesters: [{ name: "Syllabus", syllabus: "#" }],
    //     },
    //     {
    //       name: "Computer Science Engineering (2020-21)",
    //       semesters: [{ name: "Syllabus", syllabus: "#" }],
    //     },
    //     {
    //       name: "Electronics & Communication Engineering (2020-21)",
    //       semesters: [{ name: "Syllabus", syllabus: "#" }],
    //     },
    //     {
    //       name: "Electronics & Instrumentation Engineering (2020-21)",
    //       semesters: [{ name: "Syllabus", syllabus: "#" }],
    //     },
    //     {
    //       name: "Mechanical Engineering (2020-21)",
    //       semesters: [{ name: "Syllabus", syllabus: "#" }],
    //     },
    //     {
    //       name: "Civil Engineering (2019-20)",
    //       semesters: [
    //         { name: "I-II Sem", syllabus: "#" },
    //         { name: "III-IV Sem", syllabus: "#" },
    //         { name: "V-VIII Sem", syllabus: "#" },
    //       ],
    //     },
    //     {
    //       name: "Computer Science Engineering (2019-20)",
    //       semesters: [
    //         { name: "I-II Sem", syllabus: "#" },
    //         { name: "III-VIII Sem", syllabus: "#" },
    //       ],
    //     },
    //     {
    //       name: "Electronics & Communication Engineering (2019-20)",
    //       semesters: [
    //         { name: "I-II Sem", syllabus: "#" },
    //         { name: "III-VIII Sem", syllabus: "#" },
    //       ],
    //     },
    //     {
    //       name: "Mechanical Engineering (2019-20)",
    //       semesters: [
    //         { name: "I-II Sem", syllabus: "#" },
    //         { name: "III-VIII Sem", syllabus: "#" },
    //       ],
    //     },
    //     {
    //       name: "Computer Science & Engineering (2017-18)",
    //       semesters: [
    //         { name: "I-I Syllabus", syllabus: "#" },
    //         { name: "I-I Model Papers", syllabus: "#" },
    //         { name: "I-II Syllabus", syllabus: "#" },
    //         { name: "I-II Model Papers", syllabus: "#" },
    //       ],
    //     },
    //     {
    //       name: "Information Technology (2017-18)",
    //       semesters: [
    //         { name: "II-I Syllabus", syllabus: "#" },
    //         { name: "II-II Syllabus", syllabus: "#" },
    //         { name: "III-I Syllabus", syllabus: "#" },
    //         { name: "III-II Syllabus", syllabus: "#" },
    //       ],
    //     },
    //     {
    //       name: "Electronics & Communication Engineering (2017-18)",
    //       semesters: [
    //         { name: "I-I Syllabus", syllabus: "#" },
    //         { name: "I-I Model Papers", syllabus: "#" },
    //         { name: "I-II Syllabus", syllabus: "#" },
    //         { name: "I-II Model Papers", syllabus: "#" },
    //       ],
    //     },
    //     {
    //       name: "Electronics & Instrumentation Engineering (2017-18)",
    //       semesters: [
    //         { name: "I-I Syllabus", syllabus: "#" },
    //         { name: "I-I Model Papers", syllabus: "#" },
    //         { name: "I-II Syllabus", syllabus: "#" },
    //         { name: "I-II Model Papers", syllabus: "#" },
    //       ],
    //     },
    //     {
    //       name: "Computer Science & Engineering (2016-17)",
    //       semesters: [
    //         { name: "II-I Syllabus", syllabus: "#" },
    //         { name: "II-I Model Papers", syllabus: "#" },
    //         { name: "II-II Syllabus", syllabus: "#" },
    //         { name: "II-II Model Papers", syllabus: "#" },
    //         { name: "III-I Syllabus", syllabus: "#" },
    //         { name: "III-II Syllabus", syllabus: "#" },
    //         { name: "IV-I & II Syllabus", syllabus: "#" },
    //       ],
    //     },
    //     {
    //       name: "Electronics & Instrumentation Engineering (2016-17)",
    //       semesters: [
    //         { name: "II-I Syllabus", syllabus: "#" },
    //         { name: "II-I Model Papers", syllabus: "#" },
    //         { name: "II-II Syllabus", syllabus: "#" },
    //         { name: "II-II Model Papers", syllabus: "#" },
    //         { name: "III-I Syllabus", syllabus: "#" },
    //         { name: "III-I Model Papers", syllabus: "#" },
    //         { name: "III-II Syllabus", syllabus: "#" },
    //         { name: "III-II Model Papers", syllabus: "#" },
    //         { name: "IV-I & II Syllabus", syllabus: "#" },
    //         { name: "IV-I Model Papers", syllabus: "#" },
    //         { name: "IV-II Model Papers", syllabus: "#" },
    //       ],
    //     },
    //   ],
    // },
    // "All Courses": {},
    // "Multidisciplinary Courses": {},
    // "Skill Courses": {},
    // "Minor Subjects": {},
    // "Major Subject": {},
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
      console.log("UGUG", year, dept, search);

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
    if (isLoading) return; // Don't update hash until initial data is loaded to prevent race conditions

    const params = new URLSearchParams();
    if (activeYear) params.set("year", activeYear);
    if (searchQuery) params.set("q", searchQuery);

    const newHash = params.toString();
    // Use replaceState to update hash without scrolling
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
          <h1 className="text-2xl md:text-3xl font-bold">
            Adikavi Nannaya University
          </h1>
          <p className="mt-2 text-teal-200">
            Undergraduate Syllabus Repository
          </p>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="">
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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeYear === year
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
            activeYear === "W.E.F. 2023-24 AB" ||
            activeYear === "W.E.F. 2020-21 AB" ||
            Object.keys(dynamicSyllabuses).includes(activeYear)) &&
            // Accordion rendering for 2025-26, 2023-24, and 2020-21 (and all dynamic years)
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
                      className={`transform transition-transform duration-300 ${
                        expandedCategory === category
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
                                                  (sem, semIdx) => (
                                                    <a
                                                      key={semIdx}
                                                      href={sem.syllabus}
                                                      className="flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200"
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                    >
                                                      <FiDownload className="text-teal-600" />
                                                      <span>{sem.name}</span>
                                                    </a>
                                                  )
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
                        : // For 2023-24 AB and 2020-21 AB: flat structure (category -> courses array)
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
                                            (sem, semIdx) => (
                                              <a
                                                key={semIdx}
                                                href={sem.syllabus}
                                                className="flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                              >
                                                <FiDownload className="text-teal-600" />
                                                <span>{sem.name}</span>
                                              </a>
                                            )
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
            activeYear !== "W.E.F. 2023-24 AB" &&
            activeYear !== "W.E.F. 2020-21 AB" &&
            !Object.keys(dynamicSyllabuses).includes(activeYear) &&
            // Regular rendering for other years
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
                                  return (
                                    <div key={index} className="mb-4">
                                      <a
                                        href={sem.syllabus}
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

export default UgSyllabus;
