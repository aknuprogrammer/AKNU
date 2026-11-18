// Consolidated PG syllabus PDFs loader
// Exports a prebuilt list of local PG syllabus PDFs with their URLs, similar to the prior IIFE.

// 2023-24 Onwards
import pg202324FoodScienceTech from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2023-24 AB/science/FOOD SCIENCE AND TECHNOLOGY - I SEMESTER SYLLABUS - 2023-24.pdf";
import pg202324Psychology from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2023-24 AB/science/MSc Psychology Syllabus_2023.pdf";

// 2021-22 Onwards
import pg202122ForensicChemTox from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2021-22 AB/science/M.Sc. FSc Chem & Tox.pdf";
import pg202122ForensicQDE from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2021-22 AB/science/M.Sc. FSc QDE & FP.pdf";
import pg202122ForensicDNA from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2021-22 AB/science/M.Sc. FSc DNA.pdf";
import pg202122DigitalForensics from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2021-22 AB/science/M.Sc. Digital Forencis and Information Security.pdf";
import pg202122Cybersecurity from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2021-22 AB/science/M.Sc. Cybersecurity.pdf";

// 2020-21 AB
import pg202021Mudlogging from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2020-21 AB/Pg-Diploma- Mudlogging syllabi - 2mar21.pdf";

// 2019-20 AB - Science
import pg201920Analytical from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/science/Analytical_2019-20.pdf";
import pg201920Aquaculture from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/science/M Sc Aquaculture Syllabus - 2019 - 2020.pdf";
import pg201920Biochemistry from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/science/M.Sc Biochemistry Syllabus 2019-2020.pdf";
import pg201920Biotechnology from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/science/M.Sc Biotechnology Syllabus - 2019 - 2020.pdf";
import pg201920Botany from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/science/M Sc Botany syllabus 2019-2020.pdf";
import pg201920ClinicalNutrition from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/science/M.Sc Clinical Nutrition Syllabus 2019-2020.pdf";
import pg201920Geology from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/science/MSc Geo-PE -19-20 - 18june19.pdf";
import pg201920Geophysics from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/science/M. Sc. Geophysics  2019-20ab.pdf";
import pg201920Microbiology from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/science/MSc Microbiology Syllabus 2019-2020.pdf";
import pg201920AppliedMath from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/science/Msc Applied Mathematics.pdf";
import pg201920Mathematics from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/science/Mathematics_2019-20AB.pdf";
import pg201920Organic from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/science/Organic_2019-20.pdf";
import pg201920Physical from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/science/Physical_2019-20.pdf";
import pg201920Physics from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/science/PG-Physics -19-20 - 4nov19.pdf";
import pg201920Zoology from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/science/M.Sc. Zoology Syllabus - 2019-2020.pdf";

// 2019-20 AB - Arts
import pg201920MAEconomics from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/Arts/MA Economics.pdf";
import pg201920MAEnglish from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/Arts/M.A. English.pdf";
import pg201920MAPoliticalScience from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/Arts/MA  Political Science  2019-20.pdf";
import pg201920MAPsychology from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/Arts/Psychology PG  Syllabus Complete 2019-2020.pdf";
import pg201920MAPublicAdmin from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/Arts/MA Publci Adm Syllabus 2019-20.pdf";
import pg201920MASocialWork from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/Arts/M.A Social Work.pdf";
import pg201920MATelugu from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/Arts/Telugu-Syllabus 2019-20.pdf";
import pg201920MCom from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2019-20 AB/Arts/M. Com course structue New (2019-20 AB).pdf";

// 2016-17 AB - Arts
import pg201617MAEconomics from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/ARTS/M.A. Economics ANUR 2016-17.pdf";
import pg201617MAPublicAdmin from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/ARTS/Publicad2016-17ab.pdf";
import pg201617MAPsychology from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/ARTS/M.A Psychology.pdf";
import pg201617MASocialWork from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/ARTS/PG_SW_2016-17AB.pdf";
import pg201617MATelugu from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/ARTS/M.A. Telugu.pdf";
import pg201617MCom from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/ARTS/M. Com Course Structure 2016-2018.pdf";

// 2016-17 AB - Science
import pg201617ComputerScience from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/SCIENCE/M.Sc.CS_Syllabus_AKNU_2016-17_Final_23July2016.pdf";
import pg201617Aquaculture from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/SCIENCE/M.Sc. Aquaculture Syllabus 08-07-2016.pdf";
import pg201617ChemistryCommon from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/SCIENCE/Chemistry for 2016-17AB (common for Analyticla_Physical_Organic)_i_iiSEM.pdf";
import pg201617AppliedMath from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/SCIENCE/M.Sc. Applied Mathematics(2016 A.B) Modified on 22-11-23.pdf";
import pg201617Biochemistry from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/SCIENCE/M.Sc Biochemistry Syllabus 2016.pdf";
import pg201617Biotechnology from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/SCIENCE/M.Sc Biotechnology Syllabus 2016.pdf";
import pg201617Botany from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/SCIENCE/M.Sc Botany Syllabus Model Papers  wef 2016-17ab.pdf";
import pg201617ClinicalNutrition from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/SCIENCE/MSc Clinical Nutrition Syllabus 2016-17-2.pdf";
import pg201617Geology from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/SCIENCE/2016MScGeo_PE syllabus.pdf";
import pg201617Geophysics from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/SCIENCE/M.Sc Geophysics Syllabus.pdf";
import pg201617Mathematics from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/SCIENCE/MscMathematics_Final.pdf";
import pg201617Microbiology from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/SCIENCE/M.Sc Microbiology Syllabus 2016.pdf";
import pg201617Physics from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/SCIENCE/Physics syllabus_2016-17ab.pdf";
import pg201617PolymerScience from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/SCIENCE/First semester-CHEMISTRY- SYLLABUS-ANUR.pdf";
import pg201617Zoology from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/SCIENCE/M.Sc Zoology Syllabus 2016-17.pdf";

// 2016-17 AB - Law
import pg201617LLMCS from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/LAW COURSES/LLM_CS.pdf";

// 2016-17 AB - Professional
import pg201617BEd from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/PROFESSIONAL COURSES/BOS approved B.Ed Curriculuam.pdf";
import pg201617BPEd from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/PROFESSIONAL COURSES/BPED SYLLABUS.pdf";
import pg201617DPEd from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/PROFESSIONAL COURSES/DPED SYLLABUS.pdf";
import pg201617MEd from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/PROFESSIONAL COURSES/ANUR_M.Ed._Regulations_Curriculum_2015-17.pdf";
import pg201617MPEd from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/PROFESSIONAL COURSES/ANUR_M.P.Ed._Regulations_Curriculum_2015-17 final.pdf";
import pg201617MBASem1 from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/PROFESSIONAL COURSES/MBA SYLLABUS -Isem.pdf";
import pg201617MBASem2 from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/PROFESSIONAL COURSES/ANUR_MBA_ II sem _2016-17 AB.pdf";
import pg201617MBASem34 from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/PROFESSIONAL COURSES/mba syllabus latest 050717_final_2016-17ab1.pdf";
import pg201617MCASem1 from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/PROFESSIONAL COURSES/mca-final-I sem-2016.pdf";
import pg201617MCASem2 from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/PROFESSIONAL COURSES/MCA_IISEM_2016-17AB.pdf";
import pg201617MCASem36 from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/PROFESSIONAL COURSES/MCA_III-VI_2016-17AB.pdf";
import pg201617MCAProject from "../../assets/Academic Affairs/Syllabus/Pg Syllabus/W.E.F.2016-17 AB/PROFESSIONAL COURSES/MCA Project Guidelines and Formats.pdf";

export const pgLocalPdfs = (() => {
  try {
    const modules = import.meta.glob(
      "../../assets/Academic Affairs/Syllabus/Pg Syllabus/**/*.pdf",
      { eager: true, query: "?url", import: "default" }
    );
    return Object.entries(modules).map(([path, url]) => ({ path, url }));
  } catch (e) {
    return [];
  }
})();

// Export explicit imports for direct use
export {
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
};
