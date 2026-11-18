import {
  hodUdhay,
  aquaculture1,
  sridhar2,

  // Biochemistry
  kalyani3,
  padmavathi4,
  kamalakarrao5,

  // Biotechnology
  mattareddy6,
  prakash7,
  muralimohan8,

  // Botany
  samuelkumar9,
  mutyalunaidu10,
  padmavathi11,

  // Chemistry
  muralikrishna12,
  padmarao13,
  deepthi14,
  jaganmohanreddy15,
  vidyasagar16,
  ramakrishna17,

  // FST
  kalyani18,

  // Geo Sciences
  apparrao19,
  nookaratnam20,
  samulepeter21,
  sudharani22,
  vswamy23,
  srinivasarao24,
  venkatateja25,

  // Mathematics
  sujatha26,
  srinivasaraomath27,
  ashok28,
  varakumar29,
  revathi30,

  // Physics
  vamsikrishna31,
  rajasekhar32,
  sushmapriya33,
  rajyalakshmi34,

  // Psychology
  narayana35,
  rajasekharpsy36,
  bhavani37,

  // Zoology
  mattareddyzoo38,
  satishkumar39,
  vijayanirmala40,
  lakshmi,
  MM_Krishnaveni,
  K_Ramaneswari,
  img_T_Hymavathi,
  img_V_Mallipriya,
  img_K_Geetha_Lakshmi,
  img_gallary_Sedimentology_Lab,
  img_gallary_Geological_Museum,
  img_gallary_Geo_Chemistry_Lab,
  img_gallary_Remote_Sensing_and_GIS_Lab,
  phanindra,
  kbsn,
  ramagopal,
  solomandevanand,
  narayanamurthy,
  subrahmanyam,
  // ST Department PDFs
  // Aquaculture
  aquaculturePdf,
  pgDiplomaMudLoggingAquaPdf,
  // Biochemistry
  mscBiochemistryPdf,
  researchAdmissionGuidelinesPdf,
  // Biotechnology
  mscBiotechnologyPdf,
  // Botany
  mscBotanyPdf,
  certificateMushroomCultivationPdf,
  // Chemistry
  mscAnalyticalChemistryPdf,
  mscOrganicChemistryPdf,
  // Geo Sciences
  mscGeologyPdf,
  mscGeophysicsPdf,
  mscGeoinformaticsPdf,
  pgDiplomaMudLoggingGeoPdf,
  // Mathematics
  mscAppliedMathematicsPdf,
  mscMathematicsPdf,
  // Physics
  mscPhysicsPdf,
  // Psychology
  mscPsychologyPdf,
  pgdacgcPdf,
  CertificateCourceOnCouncellingPdf,
  // Zoology
  mscZoologyPdf,
} from "../assets";

const departments = [
  {
    title: " ARTS & COMMERCE",
    image:
      "https://media.istockphoto.com/id/1998218884/photo/happy-medical-students-talking-in-class.jpg?s=612x612&w=is&k=20&c=9bDndior9V7U4TezuAdDVRIeF0xUsG_yVH9WGzJtzxQ=",
    programs: 15,
  },
  {
    title: "SCIENCE & TECHNOLOGY",
    image:
      "https://media.istockphoto.com/id/1402700291/photo/group-of-children-coloring-in-art-class-with-the-supervision-of-their-teacher.jpg",
    programs: 2,
  },
  {
    title: "ENGINEERING",
    image:
      "https://as1.ftcdn.net/jpg/11/15/70/58/1000_F_1115705801_9x33ejbc8pI3krsWWjDynmLws1QsSUJF.jpg",
    programs: 6,
  },
  {
    title: "EDUCATION",
    image:
      "https://plus.unsplash.com/premium_photo-1681426558755-71090cebadff?q=80&w=1470&auto=format&fit=crop",
    programs: 10,
  },
];
// MAIN
const subDepartsWithFullData = [
  {
    name: "Aquaculture",
    profile: {
      img: vijayanirmala40,
      name: "Dr. P Vijaya Nirmala",
      designation: "Head of the Department",
      phone: "9491520547",
      email: "aqua.ucst@aknu.edu.in",
      qualifications: "B.Sc, M.Sc, Ph.D",
    },
    about:
      "The aquaculture program is initiated in the university in 2016, with a vision of giving importance to the sustainable aquaculture practices, where the students are open to the innovations and developments related to aquaculture. To encourage the students in perception, thinking and knowledge, in view of research and development studies. It will make contributions to universal knowledge, to meet the requirements of the current aquaculture sector where regional needs have privilege. The curriculum is designed as per the requirements of global placements following current trends in scientific developments and research in the field of aquaculture.",
    // vision: `To become a leading center for sustainable aquaculture education and research, fostering innovation and global competence while addressing regional and industry-specific needs through advanced scientific knowledge and practical skills.`,
    // mission: [
    //   "To provide students with a comprehensive understanding of sustainable aquaculture practices aligned with global and regional industry demands.",
    //   "To promote research and development by cultivating critical thinking, innovation, and scientific inquiry among students.",
    //   "To design and deliver an industry-relevant curriculum that equips students for global placements and contributes to the advancement of aquaculture science.",
    // ],
    programsOffered: [
      {
        sno: 1,
        name: "M.Sc Aquaculture",
        syllabus: aquaculturePdf,
        intake: 16,
      },
      {
        sno: 2,
        name: `Certificate Course in "Aquaculture Feed Preparation, Analysis and Management"`,
        syllabus: pgDiplomaMudLoggingAquaPdf,
        intake: 12,
      },
    ],
    faculty: [
      {
        name: "Prof. K Ramaneswari",
        designation: "Professor",
        email: "ramaneswari.zoo@aknu.edu.in",
        img: K_Ramaneswari, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],

        experience:
          "I have over 24 years of teaching experience in Zoology and allied subjects, including Biosystematics, Taxonomy, Genetics, Ecology, Fisheries, Aquaculture, Animal Behaviour, and Environmental Studies. With 21 years of research experience, I have worked extensively in ecology, fish biology, fisheries sciences, fish biodiversity, eco-toxicology, heavy metal and pesticide bioaccumulation, biomarkers, and aquatic ecosystem health. I have served in academic positions such as Associate Professor, Assistant Professor, PDF Research Associate, Senior Lecturer, and Lecturer. I have also held several administrative and leadership roles, including Principal, Head of Departments, Dean (Research & Development), Chief Warden, Additional Director of Admissions, and University Coordinator for PM-USHA and APHEPB.",

        publications:
          "I have published over 58 research works, including peer-reviewed journal articles, books, book chapters, and conference proceedings in fisheries, aquatic ecology, environmental toxicology, biodiversity, and aquaculture. I hold two patents related to IoT-enabled fish and freshwater protection systems and sustainable agriculture with pesticide management (2023). I have authored two books in microbiology and pharmaceutical microbiology and guided four Ph.D. scholars to completion, while six scholars are currently pursuing research under my supervision.",

        brief: [
          "I am an Associate Professor in the Department of Zoology, Adikavi Nannaya University, with expertise in fish biology, fisheries science, aquatic ecology, biodiversity, eco-toxicology, and aquaculture.",
          "My academic and research contributions focus on fish biodiversity, water quality, environmental sustainability, toxicology, and aquaculture innovations, alongside active involvement in teaching, research, academic administration, and institutional development.",
        ],
      },
      // {
      //   name: "Dr. D Sridhar",
      //   designation: "Assistant Professor(Ad-hoc)",
      //   email: "sridhar.aqua@aknu.edu.in",
      //   img: sridhar2,
      //   profileLink: "#",
      //   qualifications: [
      //     { label: "Ph.D.", value: "Commerce/Management" },
      //     { label: "M.Sc", value: "Statistics" },
      //     { label: "M.B.A", value: "Business Administration" },
      //   ],
      //   experience:
      //     "Professional/Teaching: 17.9 Years. Administrative: Team Member in AQAR.",
      //   publications:
      //     "Journals: National - 3, International - 1. Conferences: National - 2. Books Authored: 1. Workshops/Conferences/Seminars Attended: 18. Invited Talks/Resource Person: 1.",
      //   brief: [
      //     "Department: Commerce & Management Studies, University College of Arts & Commerce.",
      //     "Date of Birth: 10-09-1982. Email: jrs.cms@aknu.edu.in. Phone: 7416151577.",
      //     "No. of PhDs Guided: Nil. No. of Patents: Nil. No. of Awards: Nil. Collaborations/Foreign Visits: Nil.",
      //     "Specializations: Business Administration, Statistics, Commerce.",
      //   ],
      // },
    ],
  },

  {
    name: "Biochemistry",
    profile: {
      img: vijayanirmala40,
      name: "Dr. P Vijaya Nirmala",
      designation: "Head of The Department(I/C)",
      phone: "+91 9849419160",
      email: "biochem.ucst@aknu.edu.in",
      qualifications: "B.Sc, M.Sc,Ph.D UGC-NET",
    },
    about: `The Department of Biochemistry was established in the year 2016 under University College of Science and Technology, Adikavi Nannaya University. The Department offers a 2 - year M.Sc. program and Ph.D. program in Biochemistry. Since its inception the department strives for holistic development of the student in curricular, co-curricular and extracurricular activities and aims at developing logical thinking, analytical skills, mastering in their fundamentals, leadership and collaborative skills among students. This makes the students build their confidence and boldly face the competitive world to grab different opportunities in Biochemical, Pharma, Medicine, Agriculture, Biotech related laboratories/industries, research institutes.`,
    // vision: `To develop the department as centre for excellence in academics and research with detailed understanding of living system in the field of Biochemistry.`,
    // mission: [
    //   "To impart knowledge on the biochemical aspects of living organisms",
    //   "To inculcate interest in studying Biochemistry as it has enormous contributions towards the development of agriculture, medical and health sciences.",
    //   "To strengthen the students of this region especially East and West Godavari districts of Andhra Pradesh.",
    // ],
    programsOffered: [
      {
        sno: 1,
        name: "M.Sc Biochemistry",
        syllabus: mscBiochemistryPdf,
        intake: 15,
      },
      {
        sno: 2,
        name: "Ph.D. Biochemsitry",
        syllabus: {
          title: "Research Admission Guidelines",
          link: researchAdmissionGuidelinesPdf,
        },
        intake: "",
      },
    ],
    faculty: [
      {
        name: "Prof. D. Kalyani",
        designation: "Professor",
        email: "dk.zoo@aknu.edu.in",
        img: kalyani3, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        experience:
          "Teaching Eperience: 18+ years.Taught about 12 papers. Taught both PG and 5yr Integrated courses. Research Experience: 14+ years.",
        publications:
          "Journals published: National - 2, International - 14. Conferences presented: National - 4, International - 6, Research / Consultancy Projects: 1, PhDs Guided: 2. Books Authored: 1, Awards: 1. Professional bodies membership: 1. workshops/Conferences/Seminars: Organized - 3, Attended - 8",
        brief: [
          "Teaching Eperience: 18+ years.Taught about 12 papers. Taught both PG and 5yr Integrated courses. Research Experience: 14+ years.",
          "Research areas: Neurophysiology, Developmental Biology, Molecular Cell biology & Biomaterials. Guiding research scholars for their doctoral degree.",
          "Mentor of M.Sc. students in their project work. Published papers in both national and international journals.",
          "Organized & attended several conferences, seminars, training programs and workshops. Delivered invited talks and guest lectures.",
        ],
      },
      {
        name: "Dr. I J N Padmavathi",
        designation: "Assistant Professor (Ad-hoc)",
        email: "ijnp.biochem@aknu.edu.in",
        img: padmavathi4, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        experience:
          "14 years of teaching experience and 9 years of research experience",
        publications:
          "Journals published: National - 1, International - 12. Conferences presented: National - 2, International - 4,Books Authored: 1, Awards: 1. Young Scientist Award, National Akademii of Science s, Andhra Pradesh, 2010: Workshops/Conferences/Seminars: Organized - 0, Attended - 7",
        brief: [
          "14 years of teaching experience and 9 years of research experience. I carried out Doctoral and post doctoral work in DBT funded projects in the area of fetal programming for the development of adult diseases at National Institute of Nutrition, ICMR, Hyderabad (2004 - 2012) with papers published in peer reviewed international journals.l DST sponsored International conference presentation (2007) at Boston, NewYork, USA. I JRF and SRF funded by ICMR fellowship (2004-2009), Young Scientist Award from APAS (2010). Currently working as Assistant Professor (Adhoc) in the Department of Biochemistry, Adikavi Nannaya University, Rajamahendravaram, Andhra Pradesh.",
        ],
      },
      {
        name: "Dr. K. Kamalakara Rao",
        designation: "Assistant Professor (Ad-hoc)",
        email: "kamalakar.kkr@gmail.com",
        img: kamalakarrao5, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          
  { label: "Ph.D.", value: "Qualified" },
  { label: "M.Sc.", value: "Qualified" },
  { label: "B.Sc.", value: "Qualified" },
  // { label: "SET", value: "Qualified" },
],
experience:
  "I have been serving as an Assistant Professor in the Department of Biochemistry at Adikavi Nannaya University, Andhra Pradesh, since August 2017. Prior to this, I worked as an Assistant Professor in the Department of Biochemistry at Aditya Degree and P.G. Courses affiliated to Adikavi Nannaya University from July 2015. My academic and research experience includes extensive work in molecular biology, immunology, analytical techniques, bioinformatics, animal studies, and phytochemical research.",
publications:
  "I have published more than 25 research papers in national and international journals in the fields of Biochemistry, Molecular Biology, Immunology, Phytochemistry, Anti-inflammatory studies, Antioxidant research, and Cancer Biology. I also hold 8 patents related to analytical devices, AI-enabled spectrophotometric systems, HPLC systems, and biomedical diagnostic technologies. In addition, I have guided numerous postgraduate student research projects and actively participated in workshops, conferences, seminars, and faculty development programmes at national and international levels.",
brief: [
  "I am working as an Assistant Professor in the Department of Biochemistry at Adikavi Nannaya University, Andhra Pradesh, with specialization in Molecular Biology, Immunology, Phytochemistry, Bioinformatics, and Anti-inflammatory research.",
  "My research focuses on the isolation of novel PLA2 inhibitors and dual COX-2 & 5-LOX inhibitors from ethnomedicinal plants of North Coastal Andhra Pradesh for their clinical applications in inflammatory conditions.",
  "I have hands-on expertise in PCR, RT-PCR, Real-Time PCR, ELISA, Immunoblotting, FACS analysis, HPLC, HPTLC, FT-IR, NMR, chromatography techniques, bioinformatics docking tools, and biostatistical software such as GraphPad Prism and IBM SPSS.",
  "I am a life member of the Indian Immunology Society (IIS) and the Society of Biological Chemists, India, and serve as a member of Boards of Studies for various autonomous colleges and universities in Andhra Pradesh.",
],
      },
    ],
  },
  {
    name: "Biotechnology",
    profile: {
      img: K_Ramaneswari,
      name: "Prof. K Ramaneswari",
      designation: "Head of The Department",
      phone: "+91 9492510010",
      email: "ramaneswari.zoo@aknu.edu.in",
      qualifications: "B.Sc, M.Sc, Ph.D",
    },
    about: `The department of Biotechnology was established in the year 2008. The department offered a 5 year-integrated M.S Biotechnology program initially in the year 2008. Later it was converted to a 2 year-M.Sc Biotechnology program in 2016. The curriculum is designed as per the requirements of global placements following current trends in scientific developments and research in the field of modern biotechnology. The department has advanced laboratories for conducting laboratory experiments and research for the students, scholars and faculty. These laboratories contain latest equipment such as sterile zone with biosafety cabinet (BSL-II), UV visible spectrophotometer, PCR etc. Thus, at the end of the program, students are able to acquire skills in advanced recent techniques and successfully placed in various government, research organizations, biotech and pharma industries as researchers, scientists and academicians.`,
    // vision:
    //   "To develop the department into a Center of excellence (Coe) and a knowledge hub for Biotechnology. To encourage the students and scholars to achieve academic goals in the field of Biotechnology and also to promote the Institute to Industry (I to I) interaction",
    // mission: [],
    programsOffered: [
      {
        sno: 1,
        name: "M.Sc Biotechnology",
        syllabus: mscBiotechnologyPdf,
        intake: 15,
      },
    ],
    faculty: [
      {
        name: "Dr.A Matta Reddy",
        designation: "Associate Professor",
        email: "amr.zoo@aknu.edu.in",
        img: mattareddy6,
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Pursuing" },
        ],
        // experience: "3 years of Industrial and 23 years of Academic Experience",
        publications:
          "Journals published: National - 10, International - 22. Conferences presented: National - 20, International - 25, Research/Consultancy Projects handled - 1 Research/Consultancy Projects on hand - 1PhDs Guided: 5, Books Authored: 4, Awards: 1. PDF in Korea and USA, Excellent presentation award in Korea. Workshops/Conferences/Seminars: Organized - 1, Attended -45",
        brief: ["Working in AKNU Since Nov 2008"],
      },
      {
        name: "Dr. D S R S Prakash",
        designation: "Assistant Professor(Ad-hoc)",
        email: "dssp.biotech@aknu.edu.in",
        img: prakash7,
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
      },
      {
        name: "Dr. S Murali Mohan",
        designation: "Assistant Professor(Ad-hoc)",
        email: "smm.biotech@aknu.edu.in	",
        img: muralimohan8,
        profileLink: "--",
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        experience:
          "12 years of research experience in development of novel molecular markers, genome mapping, and their application in molecular breeding of crop plants",
        publications:
          "Journals published: National - 10, International - 14. Conferences presented: National - 2, International - 1, Research/Consultancy Projects handled - 1 Research/Consultancy Projects on hand - 1PhDs Guided: 5, Books Authored: 3, Workshops/Conferences/Seminars: Organized - 3, Attended - 12",
        brief: [
          "Dr. S. Murali Mohan had obtained his Ph.D. in the area of molecular markers and QTL mapping from Indian Institute of Millets Research (IIMR), Rajendranagar in 2009.",
          "He worked as Postdoctoral/Visiting Scientist in Applied Genomics Laboratory at International Crops Research Institute for the Semi-Arid Tropics (ICRISAT), Hyderabad and contributed to development of crop varieties for resistant to fungal diseases in chickpea.",
          "He had more than 12 years of research experience in development of novel molecular markers, genome mapping, and their application in molecular breeding of crop plants.",
          "Presently he is working as Assistant Professor in Department of Biotechnology, Adikavi Nannaya University, Rajamahendravaram, Andhra Pradesh, India from 2017.",
        ],
      },
    ],
  },
  {
    name: "Botany",
    profile: {
      img: padmavathi11, // Replace with actual image if available
      name: "Dr. T Padmavathi",
      designation: " Course Coordinator (I/C)",
      phone: "+91 9989662947",
      email: "padmavathi.bot@aknu.edu.in",
      qualifications: "B.Sc, M.Sc, Ph.D",
    },
    about: (
      <>
        Ever since its inceptions in 2015, the Department of Botany had been
        growing by the day. With well qualified and experienced Faculty, the
        challenges of establishing the Department for fully equipped
        Laboratories have been efficiently achieved. The faculty members are
        experts in their respective fields of research, evidenced through their
        high quality research publications in reputed National and International
        Journals.
        <br />
        <br />
        The students of Final year of 2016-18 batch have worked on Government
        projects for Agriculture Department to document the Study of ZBNF model
        of farming in agency area of Rampachodavaram – as part of their Project
        Dissertation. The Department is working on a Project in preparation of
        PBR for the AP State Biodiversity Board for different BMCs of AP. The
        Department has conducted Two Workshops earlier and envisions: to procure
        funding through Research Projects; collaborative curriculum for
        students; and establishing a state of the art Botanical Garden – the
        foundation stone for which was laid by the present Vice President of
        India, His Excellency M. Venkaiah Naidu
      </>
    ),
    researchProjects: [
      {
        title: "Preparation of People Biodiversity Registers 2017",
        investigator: "Dr. T. Padmavathi",
        agency: "AP State Biodiversity Board",
        agencyLink: "http://apsbb.org//",
        type: "Government",
        year: "2017-18",
        duration: "1 Year",
      },
    ],
    // vision:
    //   "To emerge as a center of excellence in botanical sciences by nurturing curiosity-driven learning, fostering cutting-edge research, and promoting environmental sustainability through education and innovation.",
    // mission: [
    //   "Marching towards academic excellence.",
    //   "To shape the students useful to the society and the nation.",
    //   "To impact value based education besides bookish knowledge.",
    //   "To prepare students to take various competitive examinations.",
    //   "To mould the students face the future challenges.",
    //   "To enable the students to analyise and evaluate various facets of current political issues.",
    // ],
    programsOffered: [
      {
        sno: 1,
        name: "M.Sc Botany",
        syllabus: mscBotanyPdf,
        intake: 30,
      },
      {
        sno: 2,
        name: `Certificate Course in "Mushroom Cultivation and Establishment of Training Unit"`,
        syllabus: certificateMushroomCultivationPdf,
        intake: 30,
      },
    ],
    faculty: [
      {
        name: "Dr. T Padmavathi",
        designation: "Assistant Professor (Ad-hoc)",
        email: "padmavathi.bot@aknu.edu.in",
        img: padmavathi11, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        experience:
          "Course Coordinator, UGC NSQF Certificate Course in Mushroom Cultivation and Establishment of Training Unit - 2021 Governing Council Member, Bharatiya Vijnana Mandali (AP Chapter of Vijnana Bharati-VIBHA: an NGO for Swadeshi Science Movement)-2022 National Secretary of Shakti, A National Movement for Women (the women entity of Vijnana Bharati) (since 2002 to date) & State Coordinator, Andhra Shakti, AP Unit of Shakti –– 2018 to dateVice President, Bharatiya Vijnana Mandali (AP Chapter of Vijnana Bharati-VIBHA: an NGO for Swadeshi Science Movement)-2021-22 Joint Secretary Bharatiya Vijnana Mandali (AP Chapter of Vijnana Bharati-VIBHA: an NGO for Swadeshi Science Movement)-2019-21 Principal Investigator: AP State Biodiversity Board Project on ‘Preparation of PBR – 2017’ in five BMCs of Andhra Pradesh Organizing Committee Member and Coordinating Team in World Ocean Science Congress -19, held during 25-27 Feb.2019, conducted by Bharatiya Vijnana Mandali, in association with Andhra University, Visakhapatnam",
        publications:
          "Journals published: National - 7, International - 14. Conferences presented: National - 2, International - 2, Research/Consultancy Projects handled - 1 PhDs Guided: 5, Books Authored: 1 Book, 1 Book chapter, Awards: 1 , Meritorius Service in Education, National Solidarity Committee, 2012. Workshops/Conferences/Seminars: Organized - 4 workshops, 5 Webinars",
        brief: [
          "Course Coordinator, UGC NSQF Certificate Course in Mushroom Cultivation and Establishment of Training Unit - 2021 Governing Council Member, Bharatiya Vijnana Mandali (AP Chapter of Vijnana Bharati-VIBHA: an NGO for Swadeshi Science Movement) - 2022 National Secretary of Shakti, A National Movement for Women (the women entity of Vijnana Bharati) (since 2002 to date) & State Coordinator, Andhra Shakti, AP Unit of Shakti –– 2018 to dateVice President, Bharatiya Vijnana Mandali (AP Chapter of Vijnana Bharati-VIBHA: an NGO for Swadeshi Science Movement)-2021-22 Joint Secretary Bharatiya Vijnana Mandali (AP Chapter of Vijnana Bharati-VIBHA: an NGO for Swadeshi Science Movement)-2019-21 Principal Investigator: AP State Biodiversity Board Project on ‘Preparation of PBR – 2017’ in five BMCs of Andhra Pradesh Organizing Committee Member and Coordinating Team in World Ocean Science Congress -19, held during 25-27 Feb.2019, conducted by Bharatiya Vijnana Mandali, in association with Andhra University, Visakhapatnam. Organizing Team Member, Coordinator and Jury in Avishkaar -2022, Student Innovations Competitions at State Level, conducted by BVM in association with Adikavi Nannaya University during 4-5 March, 2022 Trainer Associate for Manual on ‘Women and Research’ of UGC Workshops on Capacity Building for Women Managers in Higher Education, organised by G. Pulla Reddy Engineering College, Kurnool, 24th & 25th Sept. 2012. Resource Person and Subject Expert at the Teleconference for Ambedkar Open University distance education live session in Doordarshan, November, 2010.Radio Talk on Importance of Biodiversity, broadcast on 9.11.2010 in AIR, Hyderabad. Programme committee member in The First International Scientific Conference on Bio-Resource and Stress Management, jointly organised by Bose Institute and Ratikanta Maiti Foundation, during 6-9 Feb. 2013, at Kolkata.",
          "Managing Editor, International Journal of Agriculture, Environment and Biotechnology, New Delhi Publishers, New Delhi. ISSN: 0974-1712. Rated 3.9 by NAAS. www.ndpublisher.com. Executive Editor, International Journal of Bioresource and Stress Management, Puspa Publishing House, Calcutta. ISSN: 0976-3988; ONLINE ISSN: 0976-4036. www.pphouse.org. Course Coordinator for Add-On Courses: Instrumental in introducing paramedicial courses as add-on courses from academic year 2009-11 for the Intermediate and Degree Students of SN Vanita Mahavidyalaya, in collaboration with Medwin Institute of Medical Sciences, Hyderabad.",
        ],
      },
      {
        name: "Dr. L Mutyalu Naidu",
        designation: "Assistant Professor (Ad-hoc)",
        email: "lmn.bot@aknu.edu.in",
        img: mutyalunaidu10, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Phil.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
        ],
        experience: "19 years of Experience",
        publications:
          "Journals published: National - 11, International - 22. Conferences presented: National - 9, International - 7, Books Authored: 7,Awards: 2, Workshops/Conferences/Seminars: Organized - 5, Attended - 80",
        brief: [
          " Serving as Assistant Professor in the Department of Botany, Adikavi Nannaya University, Rajamahendravaram, Andhra Pradesh, India from 2016.  Has more than 19 years of experience in teaching and research. Published more than 30 research papers in peer reviewed national and international journals and presented more than 15 papers in national and international conferences. Authored 7 books and received 2 awards for his contributions to the field of plant sciences. Organized several workshops and conferences to promote scientific knowledge and research in the field of botany.",
        ],
      },
      // {
      //   name: "Dr. Samuel Kumar Kolli",
      //   designation: "Assistant Professor (Ad-hoc)",
      //   email: "ksk.bot@aknu.edu.in",
      //   img: samuelkumar9, // Replace with actual image path if available
      //   profileLink: "#", // Replace with actual profile link if available
      // },
    ],
  },
  {
    name: "Chemistry",
    profile: {
      img: jaganmohanreddy15,
      name: "Prof. B Jagan Mohan Reddy",
      designation: "Professor & Head, Dept. of Chemistry, Board Of Studies Chairman",
      phone: "",
      email: "bjr.chem@aknu.edu.in",
      qualifications: "",
    },
    about: `The Department of chemistry was established initially as 2 year Post Graduation program in the year 2006. Currently the department has six faculty members. They are well qualified with Ph. D degrees in different specializations to cater the educational needs of the students. All the faculty members of the department are competent, experienced who are having various specializations in the fields of Chemistry. The department is committed to holistic development of the students reshaping their carriers and also enabling them as future leaders of the society. This department is committed to provide knowledge; various skills and value based education that enables to the students actively integrate these attributes into their professional careers. Our students were qualified in various examinations like UGC NET, JRF, AP SET and also secured jobs in various public sector as well as private sector.`,
    // vision: `The vision of chemistry department is to become a significant role in leading Social Work education in the State of Andhra Pradesh. Further, the department has been toiling to equip the students with emerging social wisdom, which in turn make the students to face real life and career challenges effectively and efficiently.`,
    // mission: [
    //   "The mission of the department is to impart quality education with high values and standards with human ethics.",
    //   "This department is committed to provide knowledge, skills and value based education that enables the students to actively integrate these attributes into their professional careers.",
    //   "Balanced mix of basic and applied research that would enrich the advancement of knowledge and provide creative solutions from problems that exist in society both government and private sectors.",
    // ],
    programsOffered: [
      {
        sno: 1,
        name: "M.Sc Analytical Chemistry",
        syllabus: mscAnalyticalChemistryPdf,
        intake: 15,
      },
      {
        sno: 2,
        name: "M.Sc Organic Chemistry",
        syllabus: mscOrganicChemistryPdf,
        intake: 30,
      },
      { sno: 3, name: "Ph.D in Chemistry", syllabus: "", intake: "" },
    ],
    faculty: [
      {
        name: "Prof. B Jagan Mohan Reddy",
        designation: "Professor & Head, Dept. of Chemistry, Board Of Studies Chairman",
        email: "bjr.chem@aknu.edu.in",
        img: jaganmohanreddy15, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        // qualifications: [
        //   { label: "Ph.D.", value: "" },
        //   { label: "M.Sc.", value: "" },
        //   { label: "B.Sc.", value: "" },
        // ],
        // experience: "3 years of Industrial and 23 years of Academic Experience",
        // publications:
        //   "48 papers/articles in national and international journals and conference proceedings. Organized 5 National Workshops, 6 National Seminars, 1 International Seminar. Completed 3 research projects. Currently working on an ICSSR sponsored project.",
        // brief: [
        //   "Senior Faculty Member, Head and Chairman, Board of Studies for the Department of Management Studies, Adikavi Nannaya University, Rajahmundry, India.",
        //   "Visited USA and Malaysia to present research findings. Research interests: service quality, customer satisfaction, customer loyalty, and retailing.",
        //   "BRITISHCOUNCIL certified Master Trainer in Communication Skills. Served as executive trainee for GATILTD at Hyderabad.",
        //   "Email: nudaybhaskar@gmail.com, nub.cms@aknu.edu.in | Ph NO: 9490450510, 9182301625.",
        // ],
      },
      {
        name: "Dr. K Deepthi",
        designation: "Assistant Professor",
        email: "deepthi.chem@aknu.edu.in",
        img: deepthi14, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],

        experience:
          "Dedicated chemistry faculty with extensive experience in teaching, research, and mentoring students at postgraduate level.",

        publications:
          "Journals published: National - 1, International - 11. Conferences presented: National - 2, International - 4. Workshops/Conferences/Seminars: Organized - 10, Attended - 20.",

        brief: [
          "Dedicated chemistry faculty with extensive experience in teaching, research, and mentoring students at postgraduate level.",
          "Specializes in Inorganic Chemistry, with a strong record of publications in reputed journals.",
          "Skilled in designing and delivering lectures, recognized for contributions to curriculum development, and integrating modern teaching methodologies including digital tools and laboratory innovations.",
        ],
      },
      {
        name: "Dr. S Ramakrishna",
        designation: "Assistant Professor (Ad-hoc)",
        email: "srk.chem@aknu.edu.in",
        img: ramakrishna17, // Replace with actual image path if available
        profileLink: "--", // Profile link not provided
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],

        experience:
          "Dedicated chemistry faculty with extensive experience in teaching, research, and mentoring students at postgraduate level.",

        publications:
          "Journals published: National - 3, International - 2. Workshops/Conferences/Seminars: Organized - 1, Attended - 20.",

        brief: [
          "Dedicated chemistry faculty with extensive experience in teaching, research, and mentoring students at postgraduate level.",
          "Specializes in Physical Chemistry, with a strong record of publications in reputed journals.",
          "Skilled in designing and delivering lectures, recognized for contributions to curriculum development, and integrating modern teaching methodologies including digital tools and laboratory innovations.",
        ],
      },
      {
        name: "Dr. Ch Murali Krishna",
        designation: "Assistant Professor (Ad-hoc)",
        email: "cmk.chem@aknu.edu.in",
        img: muralikrishna12, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        experience:
          "Dedicated chemistry faculty with extensive experience in teaching, research, and mentoring students at postgraduate level.",
        publications:
          "Journals published: National - 9, International - 13. Conferences presented: National - 6, International - 3, PhDs Guided: 5, Books Authored: 1, Awards: 3. PDF in Korea and USA, Excellent presentation award in Korea. Workshops/Conferences/Seminars: Organized - 6, Attended -24",
        brief: [
          "Dedicated chemistry faculty with extensive experience in teaching, research, and mentoring students at postgraduate level.",
          "Specializes in Organic Chemistry, with a strong record of publications in reputed journals.",
          "Skilled in designing and delivering lectures, recognized  for contributions to curriculum development, and integrating modern teaching methodologies including digital tools and laboratory innovations.  ",
        ],
      },

      {
        name: "Dr. Ch V Padma Rao",
        designation: "Assistant Professor (Ad-hoc)",
        email: "cvpr.chem@aknu.edu.in",
        img: padmarao13, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
          //  { label: "JRF.", value: "Qualified" },
        ],
        experience:
          "10 years of experience in academia and a strong background in organic chemistry.",
        publications:
          "Journals published: National - 6, International - 20. Conferences presented: National - 2, International - 3, Awards: 3. PDF in Korea and USA, Excellent presentation award in Korea. Workshops/Conferences/Seminars: Attended -18",
        brief: [
          "Dedicated Assistant Professor of Organic Chemistry with over 10 years of experience in academia and a strong background in organic chemistry.",
          "Committed to fostering student engagement and advancing research in the field, with numerous publications in peer-reviewed journals.",
        ],
      },
      {
        name: "Dr. P S R Vidya Sagar",
        designation: "Assistant Professor (Ad-hoc)",
        email: "sagar.chem@aknu.edu.in",
        img: vidyasagar16, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "" },
          { label: "M.Sc.", value: "" },
          { label: "B.Sc.", value: "" },
        ],
        experience:
          "20 years of teaching experience including 8 years of experience in the university and have research experience in the field of Nano technology, published five research papers in reputed journals and got gold medals in the p.g.course and in S.S.C.",
        publications:
          "Journals published: National - 5. Workshops/Conferences/Seminars: Attended - 18",
        brief: [
          "Dr.P.S.R.Vidyasagar have completed 20 years of teaching experience including 8 years of experience in the university and have research experience in the field of Nano technology, published five research papers in reputed journals and got gold medals in the p.g.course and in S.S.C.",
        ],
      },
    ],
  },
  {
    name: "Food Science and Technology",
    profile: {
      img: kalyani3, // Replace with actual image if available
      name: " Prof. D Kalyani",
      designation: "Head-in-charge of the Department",
      phone: "+91 9849419160",
      email: "hod.fst@aknu.edu.in",
      qualifications: "M.Sc, Ph.D",
    },
    about: (
      <>
        Food is one of the most essential commodities of every living organism
        and same for humans. Food is required starting from the birth till
        death. Understanding its importance, people started inventing various
        food processing methods to preserve, extend the shelf-life, reduce the
        waste etc. since ancient times. Over the years, food processing has
        become one of the important industries in India and especially in Andhra
        Pradesh. Food processing sector significantly contributes to Indian
        economy accounting for 13% of exports and 6% of industrial investment.
        This sector is expected to generate 9 million jobs in India by 2024.
        <br />
        <br />
        Several new food industries are emerging with the support from Ministry
        of Food Processing Industries (MoFPI) and other organizations in the
        respective districts to process and export the agriculture and other
        allied food produce. There is a demand for trained professionals in food
        processing industries, government / private sectors like Food
        Corporation of India (FCI), Food Safety & Standard Authority of India
        (FSSAI), Agricultural and Processed Food products Export Development
        Authority (APEDA), Bureau of Indian Standards (BIS), Ministry of Health
        and Family Welfare (MoHFW), Ministry of Food processing Industries
        (MoFPI) Central Food Technological Research Institute (CFTRI), Defense
        Food Research Laboratories (DFRLs), state and regional Food Testing
        Laboratories (FTLs), Quality Council of India (QCI) and other
        agriculture allied food processing Industries.
        <br />
        <br />
        Since inception, Adikavi Nannaya University has been aiming at catering
        the needs of local people, take up programs of societal relevance,
        meeting the requirements of nearby cottage and small-scale industries of
        food sector and promote the demand for trained professionals in this
        sector. Thus, the university has established the Department of Food
        Science &Technology (FST) in the year 2023 under the umbrella of
        University College of Science and Technology (UCST). This department
        offers a 2-year M.Sc. program in Food Science and Technology. Soon after
        the establishment, in order to strengthen M.Sc. program, the university
        entered into Memorandum of Understanding (MoU) with CSIR-CFTRI for
        supporting, learning and training aspects of students under the guidance
        and expertise of Prof. P. Ramakrishna, Professor of Practice, FST.
        <br />
        <br />
        <ul className="list-disc">
          <li>
            INDUSTRIAL VISIT ( SRI SARAVARAYA COCO-COLA BOTTLING UNIT-KESAVARAM)
          </li>
          <li>
            MoU with CFTRI (CENTRAL FOOD TECHNOLOGICAL RESEARCH INSTITUTE)
          </li>
        </ul>
      </>
    ),
    // vision:
    //   "To be a state of art resource center and offer technical support in research & development (R&D), Quality control (QC), Testing and Training to cater to the needs of food industry especially cottage industries of this region.",
    // mission: [
    //   "To equip students with the practical skills and knowledge required to address current and future challenges in the food industry, preparing them for successful careers in various career paths in the food industry, including food production, quality control, research and development, regulatory affairs and academia.",
    //   "To support students through mentorship by faculty members, with their expertise in their respective fields to guide students towards academic and professional success.",
    //   "To nurture future leaders and innovators in the realm of food science and technology, empowering students to drive positive transformation and make meaningful contributions to society.",
    // ],
    programsOffered: [
      {
        sno: 1,
        name: "M.Sc. Food science and Technology",
        syllabus: "https://www.aknu.edu.in/UCST/fst.php#",
        intake: 22,
      },
    ],
    faculty: [
      {
        name: "Prof. D. Kalyani",
        designation: "Professor, Head-in-charge of the Department",
        email: "hod.fst@aknu.edu.in",
        phone: "9849419160",
        img: kalyani18, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        experience:
          "Teaching Eperience: 18+ years.Taught about 12 papers. Taught both PG and 5yr Integrated courses. Research Experience: 14+ years.",
        publications:
          "Journals published: National - 2, International - 14. Conferences presented: National - 4, International - 6, Research / Consultancy Projects: 1, PhDs Guided: 2. Books Authored: 1, Awards: 1. Professional bodies membership: 1. workshops/Conferences/Seminars: Organized - 3, Attended - 8",
        brief: [
          "Teaching Eperience: 18+ years.Taught about 12 papers. Taught both PG and 5yr Integrated courses. Research Experience: 14+ years.",
          "Research areas: Neurophysiology, Developmental Biology, Molecular Cell biology & Biomaterials. Guiding research scholars for their doctoral degree.",
          "Mentor of M.Sc. students in their project work. Published papers in both national and international journals.",
          "Organized & attended several conferences, seminars, training programs and workshops. Delivered invited talks and guest lectures.",
        ],
      },
      // {
      //   name: "Prof. P. Ramakrishna",
      //   designation: "Professor of Practice",
      //   email: "ramakrishna.p@hotmail.com",
      //   phone: "7702653444",
      //   img: ramakrishna17, // Replace with actual image path if available
      //   profileLink: "#", // Replace with actual profile link if available
      // },
      // {
      //   name: "Ms. M. Lakshmi Lavanya",
      //   designation: "Assistant Professor (Ad-hoc)",
      //   email: "lavanya.fst@aknu.edu.in",
      //   phone: "9492330415",
      //   img: lakshmi, // Replace with actual image path if available
      //   profileLink: "#", // Replace with actual profile link if available
      // },
      // {
      //   name: "Ms. M. Madhulatha Krishnaveni",
      //   designation: "Assistant Professor (Ad-hoc)",
      //   email: "madhulatha.fst@aknu.edu.in",
      //   phone: "9491191679",
      //   img: MM_Krishnaveni, // Replace with actual image path if available
      //   profileLink: "#", // Replace with actual profile link if available
      //   // qualifications: [
      //   //   { label: "Ph.D.", value: "" },
      //   //   { label: "M.Sc.", value: "" },
      //   //   { label: "B.Sc.", value: "" },
      //   // ],
      //   // experience: "3 years of Industrial and 23 years of Academic Experience",
      //   // publications:
      //   //   "48 papers/articles in national and international journals and conference proceedings. Organized 5 National Workshops, 6 National Seminars, 1 International Seminar. Completed 3 research projects. Currently working on an ICSSR sponsored project.",
      //   // brief: [
      //   //   "Senior Faculty Member, Head and Chairman, Board of Studies for the Department of Management Studies, Adikavi Nannaya University, Rajahmundry, India.",
      //   //   "Visited USA and Malaysia to present research findings. Research interests: service quality, customer satisfaction, customer loyalty, and retailing.",
      //   //   "BRITISHCOUNCIL certified Master Trainer in Communication Skills. Served as executive trainee for GATILTD at Hyderabad.",
      //   //   "Email: nudaybhaskar@gmail.com, nub.cms@aknu.edu.in | Ph NO: 9490450510, 9182301625.",
      //   // ],
      // },
    ],
  },
  {
    name: "Geo Sciences",
    profile: {
      img: vswamy23,
      name: "Prof. K.V. Swamy",
      designation: "Head of The Department(I/C)",
      phone: "9440801165",
      email: "kvs.geo@aknu.edu.in",
      qualifications: "B.Sc, M.Sc, Ph.D",
    },
    about: `The Department of Geosciences at Adikavi Nannaya University is a leading centre for education and research in Earth sciences. Established through programmes in Geoinformatics, Geology, and Geophysics introduced between 2006 and 2024, the department offers postgraduate and doctoral studies in Geology, Geophysics, and Remote Sensing and GIS applications.

The department is supported by well-equipped laboratories in Sedimentology, Geochemistry, Petrology, Micro Palaeontology, and Remote Sensing & GIS, along with a Geological Museum developed with support from ONGC. Academic activities include field visits, practical training, expert lectures, and student chapters of professional bodies such as the Society of Petroleum Geophysicists of India and the Indian Geophysical Union.

Supported by agencies including DST, RUSA, ONGC, APSCHE, and the Ministry of Earth Sciences, the department actively undertakes research, workshops, and collaborative projects with national institutions. Its alumni have secured positions in organizations such as the Geological Survey of India, Central Groundwater Board, NRSA, and leading oil, gas, and GIS industries, reflecting the department’s strong academic and professional foundation.`,
    researchProjects: [
      {
        title:
          "Basement structure and tectonics of parts of EGMB in Krishna and Guntur districts of Andhra Pradesh through magnetic and remote sensing techniques",
        investigator: "Dr. K.V. Swamy",
        agency: "Ministry of Earth Science",
        agencyLink: "https://www.moes.gov.in/",
        type: "Government",
        year: "2016-17",
        duration: "3 Years",
      },
    ],
    // vision:
    //   "The department has qualified faculty members having different specializations like Geophysics, Hydrogeology, Petrology, Remote Sensing etc.",
    // mission: [],
    gallary: [
      { src: img_gallary_Sedimentology_Lab, title: "Sedimentology Lab" },
      { src: img_gallary_Geological_Museum, title: "Geological Museum" },
      { src: img_gallary_Geo_Chemistry_Lab, title: "Geo Chemistry Lab" },
      {
        src: img_gallary_Remote_Sensing_and_GIS_Lab,
        title: "Remote Sensing and GIS lab",
      },
    ],
    // awardees: [
    //   {
    //     title: "Dr. VINAYA SUNKARA MEMORIAL GOLD MEDAL in MSc Geology",
    //     description:
    //       "On the name of Late Dr. Vinaya Sunkara, a gold medal for MSc Geology Topper has been initiated funded by his father Dr. Sunkara Venkateswara Rao, a faculty in geology and a Founder of social organization: Vinaya Sunkara foundation.",
    //     eligibility: "Topper in MSc Geology, Department of Geosciences",
    //     list_of_awardees: [
    //       { year: 2015, name: "Korada Tulasi Rao" },
    //       { year: 2016, name: "Avugaddi Lakshmi Venkatesh" },
    //       { year: 2017, name: "Manallapalli Oniel" },
    //       { year: 2018, name: "Meleti Phaneendra Kumar" },
    //       { year: 2019, name: "Kantamreddy Swamy" },
    //     ],
    //   },
    //   {
    //     title: "Dr. DATLA SURYANARAYANA RAJU ENDOWMENT AWARD",
    //     description:
    //       "On the name of renowned micro-paleontologist and bio-stratigrapher Late. Dr. DSN Raju, Annual Endowment Award and merit certificate will be given to the first and second merit students in the subject of Stratigraphy and Paleontology in MSc Geology, Dept of Geosciences, UCST, AKNU",
    //     eligibility:
    //       "First and Second toppers in Stratigraphy and Paleontology subject in MSc Geology, Department of Geosciences",
    //     list_of_awardees: [
    //       { year: 2020, name: "First topper: Kunja Saritha (2082930007)" },
    //       { year: 2020, name: "Second topper: Eeti Kalyani (2082930001)" },
    //     ],
    //   },
    //   {
    //     title: "MASAA FELLOWSHIP",
    //     description:
    //       "On the name of founder member and geosciences promoter, Late Sri MVG Subramanyam, MASAA (Prof. C Mahadevan’s admirers and students association) Fellowship and merit certificate will be given to the class topper in 1st year MSc Geology.",
    //     eligibility:
    //       "Topper in 1st year MSc Geology, Department of Geosciences. Fellowship & Merit Certificate",
    //     list_of_awardees: [
    //       { year: 2020, name: "Vemana Chaitanya (2082930011)" },
    //     ],
    //   },
    // ],
    programsOffered: [
      {
        sno: 1,
        name: "M.Sc Geology",
        syllabus: mscGeologyPdf,
        intake: 20,
      },
      {
        sno: 2,
        name: "M.Sc Geophysics",
        syllabus: mscGeophysicsPdf,
        intake: 30,
      },
      {
        sno: 3,
        name: "M. Sc. Geoinformatics",
        syllabus: mscGeoinformaticsPdf,
        intake: "",
      },
      { sno: 4, name: "Ph.D in Geology", syllabus: "", intake: "" },
      { sno: 5, name: "Ph.D in Geophysics", syllabus: "", intake: "" },
      {
        sno: 6,
        name: "PG Diploma in Mud Logging",
        syllabus: pgDiplomaMudLoggingGeoPdf,
        intake: 15,
      },
    ],
    faculty: [
      {
        name: "Prof. Y Srinivasa Rao",
        designation: "Professor",
        email: "ysr.geo@aknu.edu.in",
        img: srinivasarao24, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Phil", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        experience:
          "35 years of Research experience in the fields of Groundwater, Geomorphology, Environmental pollution and applications of Remote sensing and GIS and published significant research papers in peer reviewed National and International Journals and conferences and also serving as a reviewer for international journals.",
        publications:
          "Journals published: National - 6, International - 16. Conferences presented: National - 10, International - 2, Research / Consultancy Projects handled: 5, Research / Consultancy Projects on hand : 1 PhDs Guided: 1., Awards: 7: 1. Fellow of AP Akademi of Sciences, Hyderabad, 2014, 2.Associate Fellow of AP Akademy of Sciences, Hyderabad, 2010, 3. Senior Foreign Researcher Award from Politechnico di Torino, Italy, 2008, 4. CSIR-SRA (Pool Scientist), Govt. of India, New Delhi, 2004, 5. DST-Young Scientist’s Project award, Govt. of India, 2001, 6. UGC-Research Associateship, Govt. of India, 1995, 7. University Merit Fellowship (For PhD Research), SV Univ., Tirupati, India, 1992. Professional bodies membership: 1. workshops/Conferences/Seminars: Organized - 10, Attended - 14",
        brief: [
          "Prof. Y. Srinivasa Rao has 35 years of Research experience in the fields of Groundwater, Geomorphology, Environmental pollution and applications of Remote sensing and GIS and published significant research papers in peer reviewed National and International Journals and conferences and also serving as a reviewer for international journals.",
          "Prof. Rao is presently working as Head of the Department and Dean Faculty of Science, Adikavi Nannaya University, Rajahmundry. He served the university at various capacities starting from Coordinator/Head of the department, Principal of University college of Science & Technology, Dean for CDC and Academic affairs and Vice chancellor (I/C) of the University.",
        ],
      },
      {
        name: "Prof. K V Swamy",
        designation: "Professor & Head of the Department(I/C)",
        email: "kvs.geo@aknu.edu.in",
        img: vswamy23, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        // qualifications: [
        //   { label: "Ph.D.", value: "" },
        //   { label: "M.Sc.", value: "" },
        //   { label: "B.Sc.", value: "" },
        // ],
        // // experience:
        // //   "35 years of Research experience in the fields of Groundwater, Geomorphology, Environmental pollution and applications of Remote sensing and GIS and published significant research papers in peer reviewed National and International Journals and conferences and also serving as a reviewer for international journals.",
        // // publications:
        // //   "Journals published: National - 6, International - 16. Conferences presented: National - 10, International - 2, Research / Consultancy Projects handled: 5, Research / Consultancy Projects on hand : 1 PhDs Guided: 1., Awards: 7: 1. Fellow of AP Akademi of Sciences, Hyderabad, 2014, 2.Associate Fellow of AP Akademy of Sciences, Hyderabad, 2010, 3. Senior Foreign Researcher Award from Politechnico di Torino, Italy, 2008, 4. CSIR-SRA (Pool Scientist), Govt. of India, New Delhi, 2004, 5. DST-Young Scientist’s Project award, Govt. of India, 2001, 6. UGC-Research Associateship, Govt. of India, 1995, 7. University Merit Fellowship (For PhD Research), SV Univ., Tirupati, India, 1992. Professional bodies membership: 1. workshops/Conferences/Seminars: Organized - 10, Attended - 14",
        // // brief: [
        // //   "Prof. Y. Srinivasa Rao has 35 years of Research experience in the fields of Groundwater, Geomorphology, Environmental pollution and applications of Remote sensing and GIS and published significant research papers in peer reviewed National and International Journals and conferences and also serving as a reviewer for international journals.",
        // //   "Prof. Rao is presently working as Head of the Department and Dean Faculty of Science, Adikavi Nannaya University, Rajahmundry. He served the university at various capacities starting from Coordinator/Head of the department, Principal of University college of Science & Technology, Dean for CDC and Academic affairs and Vice chancellor (I/C) of the University.",
        // // ],
      },
      {
        name: "Dr. K Nooka Ratnam",
        designation: "Associate Professor",
        email: "knr.geo@aknu.edu.in",
        img: nookaratnam20, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        experience:
          "I began my career in 2009 as an Assistant Professor in Geoinformatics after serving as a CSIR Senior Research Fellow. Before joining academia, I worked in industry with organizations such as Reliance Digital, Mumbai, and Roulac India Investment Advisory Pvt. Ltd., Hyderabad, contributing to geospatial and infrastructure-based projects. I hold a B.E., M.Tech., and Ph.D. from Andhra University, along with additional qualifications including M.Sc. (IT), MBA (Information Systems), and Diploma in Management Studies. ",
        publications:
          "I have published more than 45 research papers in national and international journals and authored 5 academic books along with 4 book chapters in Geoinformatics, GIS, Remote Sensing, and sustainable resource management.",
        brief: [
          "I am an Associate Professor in the Department of GeoSciences, University College of Science & Technology (UCST), Adikavi Nannaya University, Rajamahendravaram, with over 26 years of professional experience in academia, industry, research, and administration. ",
          "My areas of expertise include GIS, Remote Sensing, Spatial Analytics, GeoAI, Natural Resource Management, Urban and Infrastructure Planning, and Geospatial Information Technology.",
        ],
      },
      // {
      //   name: "Dr. K Samule Peter",
      //   designation: "Assistant Professor (Ad-hoc)",
      //   email: "ksp.geo@aknu.edu.in",
      //   img: samulepeter21, // Replace with actual image path if available
      //   profileLink: "--", // Profile link not provided
      // },
      {
        name: "Dr. K Sudha Rani",
        designation: "Assistant Professor (Ad-hoc)",
        email: "ksr.geo@aknu.edu.in",
        img: sudharani22, // Replace with actual image path if available
        profileLink: "--", // Profile link not provided
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc. (Tech)", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],

        experience:
          "Assistant Professor (Contract), Department of Geosciences, Adikavi Nannaya University, since 05 December 2011. Previously worked as Project Assistant Grade II at NGRI, Hyderabad, on Magnetotelluric and geothermal investigation projects.",

        brief: [
          "Geophysicist and academic with expertise in Magnetotelluric studies, geothermal investigations, geophysical exploration, and seismic data processing.",
          "Presented papers at national and international conferences.",
          "Contributed to major Himalayan geo-engineering projects.",
        ],
      },
      {
        name: "Dr. G Appa Rao",
        designation: "Assistant Professor (Ad-hoc)",
        email: "gar.geo@aknu.edu.in",
        img: apparrao19, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Tech", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        // experience: "3 years of Industrial and 23 years of Academic Experience",
        publications:
          "Journals published: 04, Books Authored: 01, Workshops/Conferences/Seminars: Attended -03",
        brief: [
          "Since 2018, Dr. Rao has been serving as an Assistant Professor in the Department of Geosciences at Adikavi Nannaya University, Rajamahendravaram. His teaching subjects include Formation Evaluation, Wellsite Geology, Sedimentary Basins of India, Geomorphology, and Geochemistry.",
        ],
      },
      {
        name: "Ms. D Venkata Teja",
        designation: "Assistant Professor (Ad-hoc)",
        email: "teja.geo@aknu.edu.in",
        img: venkatateja25, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          // { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Geophysics" },
          { label: "B.Sc.", value: "MPC" },
        ],
        // experience: "3 years of Industrial and 23 years of Academic Experience",
        // publications:
        //   "Journals published: National - 9, International - 13. Conferences presented: National - 6, International - 3, PhDs Guided: 5, Books Authored: 1, Awards: 3. PDF in Korea and USA, Excellent presentation award in Korea. Workshops/Conferences/Seminars: Organized - 6, Attended -24",
        brief: ["Teaching academic in geosciences department "],
      },
    ],
  },
  {
    name: "Zoology",
    profile: {
      img: kalyani3,
      name: "Prof. D Kalyani",
      designation: "Head of the Department",
      phone: "",
      email: "zoology.ucst@aknu.edu.in",
    },
    about:
      "The Department of Zoology at Adikavi Nannaya University was established in the year 2012 with a 2-year Postgraduate (PG) program in M.Sc. Zoology. Since its inception, the department has been committed to imparting quality education and promoting advanced research in various branches of Animal Science. Over the years, the department has expanded its academic horizon by introducing Ph.D. and research programs to encourage innovation and exploration in emerging areas of Zoology. The department aims to provide students with a comprehensive understanding of animal structure, function, evolution, ecology, and behavior. To strengthen the practical and research components, the department has developed well-equipped laboratories such as the Molecular Biology Laboratory, Animal Physiology Laboratory, Entomology and Taxonomy Laboratory, and Aquatic Biology Laboratory. A Zoological Museum has also been established to provide hands-on experience in animal identification and biodiversity studies. The Department of Zoology has a team of highly qualified and experienced faculty members with specializations in fields such as Animal Physiology, Molecular Biology, Environmental Biology, Entomology, Fisheries, and Wildlife Ecology. Faculty members are actively involved in research projects funded by national and state-level agencies, contributing significantly to the understanding and conservation of fauna in the region. In addition, the department regularly invites experts from universities, research institutes, and industries to deliver guest lectures, organize workshops, and conduct training programs for students and research scholars. The department also encourages student participation in academic societies and outreach programs to promote awareness of environmental and wildlife conservation.",
    // vision: "The department has qualified faculty members having different specializations like Zoology, Marine Biology, Conservation Biology etc.",
    // mission: [],
    programsOffered: [
      {
        sno: 1,
        name: "M.Sc Zoology",
        syllabus: mscZoologyPdf,
        intake: 16,
      },
      { sno: 2, name: "Ph.D in Zology", syllabus: "", intake: "" },
    ],
    faculty: [
      {
        name: "Dr. A Matta Reddy",
        designation: "Associate Professor",
        email: "amr.zoo@aknu.edu.in",
        img: mattareddy6, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if availabl
        // experience: "3 years of Industrial and 23 years of Academic Experience",
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          // { label: "B.Sc.", value: "Qualified" },
        ],
        // experience: "3 years of Industrial and 23 years of Academic Experience",
        publications:
          "Journals published: National - 10, International - 22. Conferences presented: National - 20, International - 25, Research/Consultancy Projects handled - 1 Research/Consultancy Projects on hand - 1PhDs Guided: 5, Books Authored: 4, Awards: 1. PDF in Korea and USA, Excellent presentation award in Korea. Workshops/Conferences/Seminars: Organized - 1, Attended -45",
        brief: ["Working in AKNU Since Nov 2008"],
      },
      {
        name: "Prof. K Ramaneswari",
        designation: "Professor",
        email: "ramaneswari.zoo@aknu.edu.in",
        img: K_Ramaneswari, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],

        experience:
          "I have over 24 years of teaching experience in Zoology and allied subjects, including Biosystematics, Taxonomy, Genetics, Ecology, Fisheries, Aquaculture, Animal Behaviour, and Environmental Studies. With 21 years of research experience, I have worked extensively in ecology, fish biology, fisheries sciences, fish biodiversity, eco-toxicology, heavy metal and pesticide bioaccumulation, biomarkers, and aquatic ecosystem health. I have served in academic positions such as Associate Professor, Assistant Professor, PDF Research Associate, Senior Lecturer, and Lecturer. I have also held several administrative and leadership roles, including Principal, Head of Departments, Dean (Research & Development), Chief Warden, Additional Director of Admissions, and University Coordinator for PM-USHA and APHEPB.",

        publications:
          "I have published over 58 research works, including peer-reviewed journal articles, books, book chapters, and conference proceedings in fisheries, aquatic ecology, environmental toxicology, biodiversity, and aquaculture. I hold two patents related to IoT-enabled fish and freshwater protection systems and sustainable agriculture with pesticide management (2023). I have authored two books in microbiology and pharmaceutical microbiology and guided four Ph.D. scholars to completion, while six scholars are currently pursuing research under my supervision.",

        brief: [
          "I am an Associate Professor in the Department of Zoology, Adikavi Nannaya University, with expertise in fish biology, fisheries science, aquatic ecology, biodiversity, eco-toxicology, and aquaculture.",
          "My academic and research contributions focus on fish biodiversity, water quality, environmental sustainability, toxicology, and aquaculture innovations, alongside active involvement in teaching, research, academic administration, and institutional development.",
        ],
      },
      {
        name: "Dr. P Vijaya Nirmala",
        designation: "Associate Professor",
        email: "pvn.zoo@aknu.edu.in",
        img: vijayanirmala40, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Phil.", value: "Qualified" },
          { label: "M.B.A.", value: "Qualified" },
        ],
        experience: "3 years of Industrial and 23 years of Academic Experience",
        publications:
          "Journals published: National - 9, International - 13. Conferences presented: National - 6, International - 3, PhDs Guided: 5, Books Authored: 1, Awards: 3. PDF in Korea and USA, Excellent presentation award in Korea. Workshops/Conferences/Seminars: Organized - 6, Attended -24",
        brief: [
          "Senior Faculty Member, Head and Chairman, Board of Studies for the Department of Management Studies, Adikavi Nannaya University, Rajahmundry, India.",
          "Visited USA and Malaysia to present research findings. Research interests: service quality, customer satisfaction, customer loyalty, and retailing.",
          "BRITISHCOUNCIL certified Master Trainer in Communication Skills. Served as executive trainee for GATILTD at Hyderabad.",
          "Email: nudaybhaskar@gmail.com, nub.cms@aknu.edu.in | Ph NO: 9490450510, 9182301625.",
        ],
      },
      {
        name: "Prof. D Kalyani",
        designation: "Professor",
        email: "dk.zoo@aknu.edu.in",
        img: kalyani3, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        experience:
          "Teaching Eperience: 18+ years.Taught about 12 papers. Taught both PG and 5yr Integrated courses. Research Experience: 14+ years.",
        publications:
          "Journals published: National - 2, International - 14. Conferences presented: National - 4, International - 6, Research / Consultancy Projects: 1, PhDs Guided: 2. Books Authored: 1, Awards: 1. Professional bodies membership: 1. workshops/Conferences/Seminars: Organized - 3, Attended - 8",
        brief: [
          "Teaching Eperience: 18+ years.Taught about 12 papers. Taught both PG and 5yr Integrated courses. Research Experience: 14+ years.",
          "Research areas: Neurophysiology, Developmental Biology, Molecular Cell biology & Biomaterials. Guiding research scholars for their doctoral degree.",
          "Mentor of M.Sc. students in their project work. Published papers in both national and international journals.",
          "Organized & attended several conferences, seminars, training programs and workshops. Delivered invited talks and guest lectures.",
        ],
      },
      {
        name: "Dr. K Satish Kumar",
        designation: "Assistant Professor (Ad-hoc)",
        email: "ksk.zoo@aknu.edu.in",
        img: satishkumar39, // Replace with actual image path if available
        profileLink: "--", // Profile link not provided
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        experience:
          "A dedicated and experienced teacher & researcher, I have been working as an Assistant Professor in the AKNU for 15 years. Previously I worked in various positions; Viz., in the industry, as a research fellow, as a senior lecturer and in a Govt. organization for  14 years.",
        publications:
          "Journals published: National - 4, International - 1. Conferences presented: National - 10, International - 3, Books Authored: 5, Awards: 5. PDF in Korea and USA, Excellent presentation award in Korea. Workshops/Conferences/Seminars: Organized - 4, Attended -23",
        brief: [
          "A dedicated and experienced teacher & researcher, I have been working as an Assistant Professor in the AKNU for 15 years.",
          "Previously I worked in various positions; Viz., in the industry, as a research fellow, as a senior lecturer and in a Govt. organization for  14 years.",
          "My education and professional experience has directly contributed to the betterment of academic and research arenas.",
        ],
      },
    ],
  },
  {
    name: "Mathematics",
    profile: {
      img: img_T_Hymavathi,
      name: "Dr. T Hymavathi",
      designation: "Head of the Department & Chairman, BOS",
      phone: "+91 9849426579",
      email: "drhymavathi.math@gmail.com",
      qualifications: "B.Sc, M.Sc, CSIR NET, Ph.d",
    },
    about:
      "The Department of Mathematics was established in 2007 with the launch of the five years Integrated M.S. Mathematics and Computing program. In 2012, M.Sc Mathematics and in 2016, M.Sc. Applied Mathematics were introduced. Located at the University College of Science & Technology campus of Adikavi Nannaya University, the department offers Ph.D. program in Mathematics, and a PG Diploma in Computational Mathematics. The department emphasizes rigorous teaching, research, and skill development through well-qualified faculty engaged in pure and applied mathematics. Supported by modern computing facilities, it has produced successful graduates, including APSET and CSIR-NET qualifiers, while many alumni have secured positions in reputed institutions.",
    // mission: [
    //   "To provide rigorous academic training in mathematics through innovative teaching and continuous skill development",
    //   "To foster research culture among faculty and students by encouraging exploration in diverse areas of pure and applied mathematics",
    //   "To create opportunities for academic and professional growth by equipping students with knowledge and competencies needed for global careers and higher research",
    // ],
    // vision: [
    //   "To evolve as a Centre of Excellence in Mathematical Sciences by nurturing analytical thinking, advancing research in pure and applied mathematics, and preparing students to contribute meaningfully to academia, industry, and society at large.",
    // ],
    programsOffered: [
      {
        sno: 1,
        name: "M.Sc Applied Mathematics",
        syllabus: mscAppliedMathematicsPdf,
        intake: 45,
      },
      {
        sno: 2,
        name: "M.Sc Mathematics",
        syllabus: mscMathematicsPdf,
        intake: 45,
      },
      { sno: 3, name: "Ph.D in Mathematics", syllabus: "", intake: "" },
      {
        sno: 4,
        name: "PG Diploma in Computational Mathematics",
        syllabus: "",
        intake: "",
      },
    ],
    faculty: [
      {
        name: "Dr. T Hymavathi",
        designation: "Associate Professor",
        email: "drhymavathi.math@aknu.edu.in", // Email not provided
        img: img_T_Hymavathi, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        // experience: "3 years of Industrial and 23 years of Academic Experience",
        publications:
          "My scholarly contributions include 67 national and international publications, 01 patent, 02 authored books, and 02 book chapters, reflecting sustained engagement in research and knowledge dissemination. In recognition of academic excellence, teaching, and research contributions, I have received several prestigious awards, including the Bharat Jyoti Award (2012), Prof. N. Ch. Pattabhi Ramacharyulu Endowment Award by REC Warangal (for securing University First Rank), Shahedh SamaJagan Pratibha Puraskar Award (for securing University Second Rank in B.Sc.), Best Researcher Award (2018) from Adikavi Nannaya University, Outstanding Women in Science Award (2020), Global Teacher Award (2021), Women Researcher Award (2021), and the Niyukti Acharya Award (2024).",
        brief: [
          "CSIR-NET qualified, with 27 years of teaching experience, I have actively contributed to academics, research, and higher education development.",
          "I have participated in 79 workshops, conferences, and seminars, and presented 38 research papers at national and international conferences.",
          "My academic contributions extend to research mentorship, having successfully guided 08 Ph.D. scholars and 02 M.Phil. scholars.",
        ],
      },
      {
        name: "Dr. K Revathi",
        designation: "Assistant Professor (Ad-hoc)",
        email: "revathi.math@aknu.edu.in",
        img: revathi30, // Replace with actual image path if available
        profileLink: "#",
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        // experience: "3 years of Industrial and 23 years of Academic Experience",
        publications:
          "Journals published: International - 15. Conferences presented: National - 3, International - 2, Published: 4,  Awards: 1:  Research Ratna Award of the year 2019 for International Innovation and Betterment Excellence in Technical Research . Workshops/Conferences/Seminars: Organized - 3, Attended -38, Patents: 4",
        brief: [
          "1)Acted as Course Co-Ordinator,Department of Mathematics 2) Acted as UG- BOS  Co-Ordinator",
        ],
      },
      {
        name: "Mr. T Srinivasa Rao",
        designation: "Assistant Professor (Ad-hoc)",
        email: "tsr.math@aknu.edu.in",
        img: srinivasaraomath27, // Replace with actual image path if available
        profileLink: "#",
        qualifications: [
          { label: "M.Phil", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        experience:
          "UG lecturer for 18 years and PG Lecturer/Asst.Professor for 15 years including 3 years of Contract lecturer at Govt.College(A), Rajahmundry from 2000 to 2003. Worked in the Text book solution company Chegg,com for 5.5 years ",
        publications:
          "Journals published: National - 15, International - 18. Conferences presented: National - 6, International - 3,  Workshops/Conferences/Seminars: Attended -24",
        brief: [
          "I started teaching career as UG Lecturer in Mahatma Gandhi Degree College, Atreyapuram, East Godavari District on 23rd Dec'1993",
          "Worked as UG lecturer for 18 years and PG Lecturer/Asst.Professor for 15 years including 3 years of Contract lecturer at Govt.College(A), Rajahmundry from 2000 to 2003",
          "worked in the Text book solution company Chegg,com for 5.5 years ",
        ],
      },
      {
        name: "Dr. V Malli Priya",
        designation: "Assistant Professor (Ad-hoc)",
        email: "vm.math@aknu.edu.in",
        img: img_V_Mallipriya, // Replace with actual image path if available
        profileLink: "#",
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        // experience: "3 years of Industrial and 23 years of Academic Experience",
        publications:
          "Journals published: International - 15. Conferences presented: National - 3, International - 3,  Workshops/Conferences/Seminars: Organized - Seminars 02, Attended -17, Patents:2",
        brief: [
          "Ratified by JNTUK in 2012, GIET ",
          "Acted as  NSS P.O UNIT-I, UCST, AKNU ",
          "Acted as B.O.S Convenor in Applied Mathematics",
          "Presently writing articles in my research area and also doing collaborative work ",
        ],
      },
      {
        name: "Mr. K V M Vara Kumar",
        designation: "Assistant Professor (Ad-hoc)",
        email: "kumar.math@aknu.edu.in",
        img: varakumar29, // Replace with actual image path if available
        profileLink: "#",
        qualifications: [
          { label: "Ph.D.", value: "Pursuing" },
          { label: "M.Phil.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        // experience: "3 years of Industrial and 23 years of Academic Experience",
        publications:
          "Journals published: International - 4. Conferences presented: National - 1, Awards: 3. . Workshops/Conferences/Seminars: Organized - 1 (Act as Co-convenor for 1 International Seminar)nar), Attended -25",
        brief: [
          "Qualified APSET,TSSET, GATE-2023, GATE-2024, GATE-2025 in Mathematical Sciences.",
          "Presently, I am Pursuing Ph.D.in Mathematics at Andhra University.",
          "I have completed M.Phil. in Applied Mathematics from Andhra University in 2022.",
          "I have completed 2 NPTEL FDPs.",
          "I have completed 1 Online FDP.",
          "I am acting as Faculty Associate to Skill Development Center, AKNU.",
          "E-content development: 16 videos on the topic Theoretical Computer Science which are uploaded in LMS portal of the University website. https://aknu.edu.in/LMS/msc3.php",
          "Published 4 research articles and presented paper in 1 National Conference.",
        ],
      },
      {
        name: "Mr. G Ashok",
        designation: "Assistant Professor (Ad-hoc)",
        email: "ashok.math@aknu.edu.in",
        img: ashok28, // Replace with actual image path if available
        profileLink: "#",
        qualifications: [
          { label: "Ph.D.", value: "Pursuing" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        // experience: "3 years of Industrial and 23 years of Academic Experience",
        publications:
          "Journals published: International - 11. Conferences presented: National - 2, International - 4, Workshops/Conferences/Seminars: Organized - I have served as a member of the organizing committee for three seminars., Attended -24",
        brief: [
          "Qualified APSLET on September 11, 2016.",
          "Qualified GATE 2024 (Mathematics).",
          "Pursuing Ph.D. in Mathematics (Cryptography) at Andhra University, Andhra Pradesh, India (2020 – Present).",
          "Life Member of Andhra Pradesh and Telangana Society for Mathematical Sciences (APTSMS), Membership No. 1377.",
          "Life Member, Andhra University Alumni Association.",
          "Serving as Faculty Associate for Examination Automation and Digitalization at Adikavi Nannaya University.",
          "Published 6 Scopus-indexed, 1 Web of Science, and 4 International Peer-Reviewed journal papers.",
          "Successfully filed and published two patents related to Mathematics.",
        ],
      },
      {
        name: "Ms. K Geetha Lakshmi",
        designation: "Assistant Professor (Ad-hoc)",
        email: "geetha.math@aknu.edu.in",
        img: img_K_Geetha_Lakshmi, // Replace with actual image path if available
        profileLink: "#",
        qualifications: [
          { label: "Ph.D", value: "Pursuing" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        experience:
          "I have teaching experience in subjects such as Numerical Methods, C Programming, Graph Theory, Classical Mechanics, and Complex Analysis.",
        publications:
          "Journals published: International - 4. Workshops/Conferences/Seminars: Attended -10",
        brief: [
          "I qualified APSET in 2016 and am currently pursuing a Part-Time Ph.D. in Mathematics at Andhra University.",
          "I have teaching experience in subjects such as Numerical Methods, C Programming, Graph Theory, Classical Mechanics, and Complex Analysis.",
          "My academic interests include applied mathematics and computational techniques, and I am committed to delivering quality teaching while nurturing analytical and problem-solving skills among students.",
        ],
      },
      {
        name: "Dr. L Sujatha",
        designation: "Assistant Professor (Ad-hoc)",
        email: "sujatha9966@gmail.com",
        img: sujatha26, // Replace with actual image path if available
        profileLink: "#",
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "M.S.Cs.", value: "Qualified" },
        ],
        experience:
          "Also have an teaching experience in Engineering Computers and MCA",
        publications:
          "Journals published: National - 2, International - 5. Conferences presented: National - 2, International - 2, Reviewer in ANNALS FUZZY MATHEMATICS. Workshops/Conferences/Seminars: Attended -7",
        brief: [
          // "Also have an teaching experience in Engineering Computers and MCA",
        ],
      },
    ],
  },
  {
    name: "Physics",
    profile: {
      img: rajyalakshmi34,
      name: "Dr. S Rajya Lakshmi",
      designation: "Course Co-ordinator",
      phone: "9290402635",
      email: "srl.phy@aknu.edu.in",
      qualifications: "Ph.D, M.Sc, B.Sc, MEd",
    },
    about:
      " The Department of Physics started with M.Sc., Physics program in 2014. The department is successfully flourishing with 30 students every year. The Department has well-established and well-equipped laboratories to support the students in creative thinking, hands-on experiments, and activity-based learning. The Department has well-qualified faculty from pioneer institutions and the faculty are highly involved in various research disciplines such as Spectroscopic studies, Crystal Growth, and Nanoscience. Many seminars and special lectures by eminent scientists have been arranged for the students. The students are encouraged to present papers in National and International seminars and conferences. The department offers a special course for the PG students to facilitate them to competition in SET/NET/GATE/JEST examinations.",
    // vision: [
    //   " To build a foundation for excellence and encourage the development of the institution as a premier institution through teaching, academic activities, and active research in physics.",
    // ],
    // mission: [
    //   "      To awaken the young minds through theory and practical in physics, as well as conduction of academic activities by the department which reflects the development of the institution",
    // ],
    programsOffered: [
      {
        sno: 1,
        name: "M.Sc Physics",
        syllabus: mscPhysicsPdf,
        intake: 30,
      },
    ],
    faculty: [
      {
        name: "Dr. S Rajya Lakshmi",
        designation: "Assistant Professor (Ad-hoc)",
        email: "srl.phy@aknu.edu.in",
        img: rajyalakshmi34, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "M.Ed.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        // experience: "3 years of Industrial and 23 years of Academic Experience",
        publications:
          "Journals published: International - 21. Conferences presented: National - 8, International - 5, PhDs Guided: 5, Books Authored: 63, Records-06;   Awards-16;  Fellow-3; Executive Member-1; Life Member-7;   Editorial Board Member-6;; Reviewer Member-9. Workshops/Conferences/Seminars: Organized - 15, Attended -25",
        brief: [
          "Dr. Seelam Rajyalakshmi, Guinness World Record achiever, currently working as Assistant Professor, Course Coordinator of the Department of Physics – UCST, Adikavi Nannaya University, Rajamahendravaram.",
          "Elected as Executive Council member in Indian Association of Physics Teachers (IAPT). She contributed her Research in the field of Luminescence Applications on single crystals, Nanophosphors.",
          "Published 13 Books with ISBN and 75 research articles, in International/Nationaljournals. Published 6 patents (5 in (IPR) & 1 in Germany Utility patent). Published 75 Publications, 13 Books, Fellow Membership for Indian Acadmic Rsearchrs Association.",
          "Received Asian Admirable Achievers -2025 Volume-XIII. Certificate of Excellence for SEVA RATNA AWARD by Indian Acts Awareness Voluntary Organization - 2025.",
          "Received 20 Eminent Researchers of 2023 by I2OR. Top 50 Eminent Teachers of the Year 2023 for remarkable contribution in the field of Education I2OR, India.",
          "National Teaching Excellence Award, Received World book of Records London and Certificate of Excellence for editing the book entitled Kavana Godavari 1111 POEM 1111 POET in 2021. Received Pillars of India award -2021. Achieved Thickest Book in the World Record.",
          "Asia Book of Records and India Book of Records, Best Editor Award for Covid 19 and its impact in 2021, ESN publications. Received Inspirational Super Women “Young Woman Researcher Award”-2021. Received Education Excellence Award-2021.",
          "Women Researcher Award-2021, Best Crystal Display Award in 2017 by Indian Association for Crystal Growth (IACG), Tamilnadu. Elected as Fellow for The Society of Innovative Educationalist & Scientific Research Professional (FSIESRP) in August 2020.",
          "Awarded as Associate Fellow in A.P. Academi of Sciences. Internal Auditor for International Organization for Standardization (ISO). Life Member for various Organizations.",
          "Hon. Editorial Board Member-Consulting Editor of Journal of Engineering Technological Research ISSN: 2229-9262. Editorial board member of Social Sciences: Science Publishing Group.",
          "Editor in Journal of Research in Physics and applied Sciences, in Mantech Publications Pvt Ltd., Reviewer of SciEdTech platform. Reviewer of Optoelectronics and Advanced Materials – Rapid Communication (OAM-RC), an International Journal, Scopus Index with ISSN 1842-6573.",
          "Executive Member and Regional Coordinator for Indian Association of Physics teachers (IAPT). Organised Webinars/Conferences and presented papers for several National/International conferences.    ",
        ],
      },
      {
        name: "Dr. Y Sushma Priya",
        designation: "Assistant Professor (Ad-hoc)",
        email: "ysp.phy@aknu.edu.in",
        img: sushmapriya33, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        experience:
          "she is an academician and researcher with 15 years of Teaching experience",
        publications:
          "Journals published: National - 2, International - 7. Conferences presented: National - 2, International - 1, Books Authored: 1, Awards: 3.  Workshops/Conferences/Seminars: Organized - 5, Attended -30",
        brief: [
          "Dr.Y.Sushma Priya completed her MSc in physics from Andhra University and Ph.D. degree in Physics from Jawaharlal Nehru Technological University Kakinada.",
          "She is working as an Assistant Professor in the Department of Physics, University College of Science and Technology at Adikavi Nannaya University, Rajamahendravarm, India.",
          "She is an academician and researcher with 15 years of Teaching experience. She published 07 research papers in reputed international journals.",
          "The main focus of her Doctoral degree is on Vibrational and UV-visible spectroscopic studies of some Heterocyclic Compounds.",
        ],
      },

      {
        name: "Mr. V Rajasekhar",
        designation: "Assistant Professor (Ad-hoc)",
        email: "vrs.phy@aknu.edu.in",
        img: rajasekhar32, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Pursuing" },
          { label: "M.Sc.", value: "Qualified" },
          // { label: "B.Sc.", value: "Qualified" },
        ],
        experience: "9 years of Experience",
        publications:
          "Journals published:  International - 2. Conferences presented: National - 3, International - 1, Workshops/Conferences/Seminars:  Attended -15",
        // brief: [
        //   "",
        // ],
      },
      {
        name: "Dr. B. Veera Vamsi Krishna",
        designation: "Assistant Professor (Ad-hoc)",
        email: "bvk.phy@aknu.edu.in",
        img: vamsikrishna31, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "I.M. Sc.", value: "Qualified" },
          // { label: "I.M. Sc.", value: "" },
        ],
        experience:
          "I am an academic professional with over 7 years of teaching experience, specializing in delivering engaging and effective instruction in physics and materials science. ",
        publications:
          "Journals published: National - 2, International - 3. Conferences presented: International - 2, PhDs Guided: 5, Books Authored: 2, Awards: 2. Workshops/Conferences/Seminars: Attended -2",
        brief: [
          "I am an academic professional with over 7 years of teaching experience, specializing in delivering engaging and effective instruction in physics and materials science.",
          "Alongside my teaching career, I have established a strong research profile with several high-quality publications in reputed international journals, focusing on areas such as Green synthesis of Nanomaterials, perovskite nanomaterials, biopolymers, and their electrical and electrochemical applications.",
          "I am committed to fostering student learning, advancing innovative research, and contributing to the academic community through both education and scholarship.",
        ],
      },
    ],
  },

  {
    name: "Physical Education",
    profile: {
      img: kbsn,
      name: "Dr. K Bala Satyanarayana",
      designation: "Course Co-ordinator",
      phone: "8297936888",
      email: "kbs.phyedu@aknu.edu.in",
      qualifications: "M.Sc., M.Phil., Ph.D.",
    },
    about: `The Department of Physical Education introduced the M.P.Ed. programme in the year 2017 in response to the growing interest and demand for professional education in the field of Physical Education. The department is supported by experienced and dedicated faculty members committed to academic excellence and professional training in Physical Education. The M.P.Ed. programme is designed to provide advanced knowledge and practical expertise in various dimensions of sports and physical education.
The curriculum encompasses diverse areas such as Sports Science, Sports Medicine, Sports Psychology, Exercise Physiology, Communication Skills, and Practical Training. The programme aims to equip students with theoretical understanding, research orientation, professional ethics, and practical competencies required for careers in teaching, coaching, fitness training, sports administration, and allied fields.`,
    // vision: `To explore the abilities and enhance the physical fitness components of the students for healthful living and sports performance.`,
    // mission: [
    //   "  To offer courses in Physical Education so that it will enable the students to have a better understanding of their Health and Fitness. To safeguard and promote the physical fitness and traditional culture, values and professionalism. To develop state of the infrastructure to facilitate high quality student centric physical education.",
    // ],
    programsOffered: [
      {
        sno: 1,
        name: "M.P.Ed",
        syllabus: "https://www.aknu.edu.in/UCEDU/Syllabus/M.P.Ed.pdf",
        intake: 40,
      },
    ],
    faculty: [
      {
        name: "Dr. VVMU Phaneendra",
        designation: "Assistant Professor (Ad-hoc)",
        email: "phaneendra.phyedu@aknu.edu.in",
        img: phanindra, // Replace with actual image path if available
        profileLink: "Profile", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D", value: "Qualified" },
          { label: "M.Phil", value: "Qualified" },
          { label: "M.Ed.", value: "Qualified" },
          { label: "B.Ed.", value: "Qualified" },
        ],
        experience: "19 years of experience",
        publications:
          "Journals published: National - 7, International - 12. Conferences presented: National - 3, International - 5, Books Authored: 1, Workshops/Conferences/Seminars: Attended -12",
        brief: [
          "Working as assistant professor/ Course Co-Ordinatore of physical education . Published widely in international and national journals and have attended overtime workshops and conferences.",
        ],
      },
      {
        name: "Dr. K Bala Satyanarayana",
        designation: "Assistant Professor (Ad-hoc) & Course Co-ordinator",
        email: "kbs.phyedu@aknu.edu.in",
        img: kbsn,

        profileLink: "Profile",
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Phil.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        // experience: "3 years of Industrial and 23 years of Academic Experience",
        publications:
          "Journals published: National - 13, International - 6. Conferences presented: National - 6, International - 3, Books Authored: 1, Awards: 3. Workshops/Conferences/Seminars: Attended -13",
        brief: ["Working assistant warden. Working course coordinator "],
      },
      {
        name: "Dr. B Rama Gopal",
        designation: "Assistant Director (Ad-hoc)",
        email: "brg.phyedu@aknu.edu.in",
        img: ramagopal,
        profileLink: "Profile",
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.PEd.", value: "Qualified" },
          { label: "B.PEd.", value: "Qualified" },
        ],
        // experience: "3 years of Industrial and 23 years of Academic Experience",
        publications:
          "Journals published: National - 6, Conferences presented: National - 5, International - 3, Workshops/Conferences/Seminars: Attended -10",
        brief: [
          "From 2018 to 2024 , Secretary sports Board, Adikavi Nannaya University, Rjy",
        ],
      },
      {
        name: "Mr. V Soloman Devanand",
        designation: "Coach (Ad-hoc)",
        email: "vsd.phyedu@aknu.edu.in",
        img: solomandevanand,
        profileLink: "Profile",
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.P.Ed.", value: "Qualied" },
          // { label: "B.Sc.", value: "" },
        ],
        experience: "9 years of experience",
        publications:
          "Journals published: National - 5, International - 4. Conferences presented: National - 3, International - 3, Books Authored: 1, Workshops/Conferences/Seminars: Attended -10",
        // brief: [""],
      },
      {
        name: "Dr. MVSS Narayanamurthy",
        designation: "Coach (Guest)",
        email: "mvssnm.phyedu@aknu.edu.in",
        img: narayanamurthy,
        profileLink: "Profile",
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.P.Ed.", value: "Qualified" },
          { label: "M.Com.", value: "Qualified" },
        ],
        experience: "33 years of experience",
        publications:
          "Journals published: National - 6, International - 2. Conferences presented: National - 4, International - 2, PhDs Guided: 5, Awards: 1. Workshops/Conferences/Seminars: Attended -8",
        // brief: [
        //   "",
        // ],
      },
      {
        name: "Mr. Ch. V Subrahmanyam",
        designation: "Coach (Ad-hoc)",
        email: "chvs.phyedu@aknu.edu.in",
        img: subrahmanyam, // Corrected the image name (it was mistakenly a duplicate in your input)
        profileLink: "Profile",
        qualifications: [
          { label: "Ph.D.", value: "Pursuing" },
          { label: "M.P.Ed.", value: "Qualified" },
          { label: "M.A.", value: "Qualified" },
        ],
        experience: "8 years of Experience",
        publications:
          "Journals published: National - 6, International - 1. Conferences presented: National - 1, , , Books Authored: 1",
        brief: [
          "Facukty in the Department of Physical Education, University College of Science and Technology, Adikavi Nannaya University, Rajamahendravaram. I am currently pursuing a Ph.D. in Physical Education, specializing in the area of sports psychology.",
        ],
      },
    ],
  },
  {
    name: "Psychology",
    profile: {
      img: bhavani37,
      name: "Dr. Ch. N K Bhavani",
      designation: "Assistant Professor(Ad-hoc) & Course Co-ordinator",
      phone: "8297936888",
      email: "psychology.ucst@aknu.edu.in",
      qualifications: "M.A., Ph.D., UGC-NET",
    },
    about: `The Department of Psychology was established in the year 2010 with two Assistant Professors. Currently, the Department is running with four highly qualified faculty. The Department was set up to develop an awareness of the importance of studying human behaviour and the societal relevance of psychology. The Department offers M.A. Psychology with an intake of 30 students, which is of four semesters and the curriculum is so designed as to provide strong theoretical, methodological and contemporary knowledge of various areas of Psychology to the students. The purpose is to equip the students with knowledge, skills and values to become an effective and competent professional psychologists. During the course, the students are taken for field visits at mental health centers and counselling cells besides interactive classroom teaching and laboratory training. From time to time, the Department organizes Conferences, Seminars, Workshops and extended lectures from experts in relevant fields are also conducted for the benefit of the faculty and students. This academic training enables the students to work in a broad range of settings such as medical, organizations, counselling centers, NGOs, educational institutions, government and semi-government organizations. We have been offering PG diploma Post Graduate Diploma In Child
And Adolescent Guidance And Counselling (Pgdcagc) course since 2021 which is giving an edge to the
students in getting placements in various academic and health organisations
80% of our students are working as District career and mental health counsellor ( EDCEL_INDIA),Behaviour
therapists, freelance counsellors and are working in various prestigious organisations all over INDIA .`,
    // vision: `To explore the abilities and enhance the physical fitness components of the students for healthful living and sports performance.`,
    // mission: [
    //   "  To offer courses in Physical Education so that it will enable the students to have a better understanding of their Health and Fitness. To safeguard and promote the physical fitness and traditional culture, values and professionalism. To develop state of the infrastructure to facilitate high quality student centric physical education.",
    // ],
    programsOffered: [
      {
        sno: 1,
        name: "M.Sc Psychology",
        syllabus: mscPsychologyPdf,
        intake: 30,
      },
      {
        sno: 2,
        name: "POST GRADUATE DIPLOMA IN CHILD AND ADOLESCENT GUIDANCE AND COUNSELLING (PGDACGC)",
        syllabus: pgdacgcPdf,
        intake: 40,
      },
      // {
      //   sno: 3,
      //   name: "Ph.D in Psychology",
      //   syllabus: "",
      //   intake: "-",
      // },
      // {
      //   sno: 4,
      //   name: `Certificate Course in "Counselling Skills"`,
      //   syllabus: CertificateCourceOnCouncellingPdf,
      // },
    ],
    faculty: [
      {
        name: "Dr. P Raja Sekhar",
        designation: "Assistant Professor (Ad-hoc)",
        email: "prs.psy@aknu.edu.in",
        img: rajasekharpsy36,
        profileLink: "Profile",
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "M.A.", value: "Qualified" },
          { label: "B.A.", value: "Qualified" },
        ],
        experience: "3 years of Industrial and 24 years of Academic Experience",
        publications:
          "Journals published: National - 6, International - 6. Conferences presented: National - 11, International - 7,Collaborations with National/International Institutions: 4, Books Authored: 01/05, Workshops/Conferences/Seminars: Organized - 20, Attended 36, ",
        brief: [
          "I am a dedicated and learner-centered educator with a strong belief that effective teaching inspires curiosity, critical inquiry, and personal transformation.",
          "My teaching philosophy emphasizes active engagement, experiential learning, collaboration, and student autonomy, fostering environments where learners connect theory, research, and practice.",
          "I design my courses to promote reflection, discussion, and peer learning, helping students become independent thinkers and responsible learners.",
          "With a background in psychology and over four years of experience as a Course Coordinator, I have extensive expertise in student counseling, academic administration, and institutional development.",
          "I established and currently lead the Centre for Psychological Assessment and Counselling (CPAC), supporting students facing behavioral and emotional challenges.",
          "I have also contributed to key institutional processes, including UGC 12(B) status, NAAC accreditation, and confidential examination work involving result processing and verification.",
          "As an adaptable and extroverted professional, I approach my role with empathy, precision, and passion.",
          "My goal is to continue creating a dynamic learning environment that cultivates intellectual growth, emotional well-being, and a lasting love for learning.",
        ],
      },
      {
        name: "Ms. Ch. N K Bhavani",
        designation: "Assistant Professor (Ad-hoc) & Course Co-ordinator",
        email: "bhavani.psy@aknu.edu.in",
        img: bhavani37,

        profileLink: "Profile",
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.A.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        experience:
          "Currently working as an Assistant Professor in the Department of Psychology, Adikavi Nannaya University with 15 years of teaching experience and one year experience in Psychocology Counselling .",
        publications:
          "Journals published: National - 3, International - 3. Conferences presented: National - 4, International - 2,Collaborations with National/International Institutions: 2, Workshops/Conferences/Seminars: Organized – 12 , Attended 16,FDPs attended -3, TOT conducted -1",
        brief: [
          "I am a passionate educator committed to creating a dynamic learning environment that fosters resilience, emotional intelligence, and academic excellence among students. I am currently working as an Assistant Professor in the Department of Psychology at Adikavi Nannaya University and qualified UGC-NET in Psychology in June 2011.",

          "I am a Member of the Indian Academy of Applied Psychology (IAAP) and a BECK Certified Cognitive Behaviour Therapist specializing in Anxiety Disorders.",

          "I have actively contributed to academic and administrative activities through various responsibilities, including serving as Course Coordinator of the Department of Psychology since 23 December, 2024, Core Committee Member for ISO 9001:2005 implementation in AKNU, Member of the PG Board of Studies, NSS Programme Officer, and Assistant Warden of the AKNU Women’s Hostel.",

          "I have also participated extensively in examination-related duties such as evaluation, verification, coding, decoding, tabulation, squad, and observer responsibilities.",

          "I received First Prize in the National Poster Presentation Competition conducted by Radhabai Kale Mahila Mahavidyalaya, Pune, for the model titled 'Hand Fan Model for Mental Health and Mental Illness'.",
        ],
      },
      {
        name: "Dr. NVVS Narayana",
        designation: "Assistant Professor (Ad-hoc)",
        email: "narayana.psy@aknu.edu.in",
        img: narayana35,
        profileLink: "Profile",
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Phil", value: "Qualified" },
          { label: "M.A.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],
        experience:
          "Currently working as an Assistant Professor of Psychology, Department of Psychology, Adikavi Nannaya University, cleared APSET in Psychology in July 2012",
        publications:
          "Journals published: National - 11, International - 9. Conferences presented: International - 17, Research/Consultancy Projects on hand: 2, Collaborations with National/International Institutions: 2, Foreign Visits for Academic/Research purpose : 2 Books Authored: 6, Awards: 01(Copy Right). PDF in Korea and USA, Excellent presentation award in Korea. Workshops/Conferences/Seminars: Organized - 2, Attended -71",
        brief: [
          "Currently working as an Assistant Professor of Psychology, Department of Psychology, Adikavi Nannaya University, cleared APSET in Psychology in July 2012. few memberships and administartives works were mentioned below.: Member of the National Academy of Psychology (NAOP). Life Member of the International Association of Holistic Psychology (IAHP). Life Member of the Indian Academy of Applied Psychology (IAAP). Life member of the Indian Academy of Life Skills (IALS).",
          "Course Coordinator, Department of Psychology, University College of Science and Technology, Adikavi Nannaya University, Rajahmundry, from 02nd Nov 2021 to 27th December 2024.",
          "NAAC Core Committee Member for Criteria 3, Adikavi Nannaya University, Rajahmundry, from 30th June 2020.",
          "Involved in Examination duties such as verification of scripts, coding, decoding, results processing, tabulation of results, verification of checklists et., 2017-2022. ",
          "Member, PG- Board of Studies, Adikavi Nannaya University from 2017 to 2023.",
          "Subject Expert and Member, UG Board of Studies, Govt. Arts College, Rajahmundry and Vignan University, Vijayawada.",
          "Assistant Training & Placement Officer, University College of Arts & Commerce, Adikavi Nannaya University, Rajahmundry from 17th August 2019 to 16th August 2022.",
          "Squad, Observer, evaluation and verification duties have been performed on university orders.",
        ],
      },
    ],
  },
];

const subDepartsWithFullDataEdu = [
  {
    name: "Aquaculture",
    profile: {
      img: "./images/ArtsImages/ramaneswari.jpg",
      name: "Prof. K Ramaneswari",
      designation: "Head",
      phone: "9491520547",
      email: "aqua.ucst@aknu.edu.in",
      qualifications: "M.A., Ph.D., UGC-NET",
    },
    about:
      "The aquaculture program is initiated in the university in 2016, with a vision of giving importance to the sustainable aquaculture practices, where the students are open to the innovations and developments related to aquaculture. To encourage the students in perception, thinking and knowledge, in view of research and development studies. It will make contributions to universal knowledge, to meet the requirements of the current aquaculture sector where regional needs have privilege. The curriculum is designed as per the requirements of global placements following current trends in scientific developments and research in the field of aquaculture.",
    // vision: `Vision for Commerce & Management Studies...`,
    // mission: [
    //   "Mission point 1 for Commerce & Management Studies...",
    //   "Mission point 2...",
    //   "Mission point 3...",
    // ],
    faculty: [
      {
        name: "Prof. K Ramaneswari",
        designation: "Professor",
        email: "ramaneswari.zoo@aknu.edu.in",
        img: K_Ramaneswari, // Replace with actual image path if available
        profileLink: "#", // Replace with actual profile link if available
        qualifications: [
          { label: "Ph.D.", value: "Qualified" },
          { label: "M.Sc.", value: "Qualified" },
          { label: "B.Sc.", value: "Qualified" },
        ],

        experience:
          "I have over 24 years of teaching experience in Zoology and allied subjects, including Biosystematics, Taxonomy, Genetics, Ecology, Fisheries, Aquaculture, Animal Behaviour, and Environmental Studies. With 21 years of research experience, I have worked extensively in ecology, fish biology, fisheries sciences, fish biodiversity, eco-toxicology, heavy metal and pesticide bioaccumulation, biomarkers, and aquatic ecosystem health. I have served in academic positions such as Associate Professor, Assistant Professor, PDF Research Associate, Senior Lecturer, and Lecturer. I have also held several administrative and leadership roles, including Principal, Head of Departments, Dean (Research & Development), Chief Warden, Additional Director of Admissions, and University Coordinator for PM-USHA and APHEPB.",

        publications:
          "I have published over 58 research works, including peer-reviewed journal articles, books, book chapters, and conference proceedings in fisheries, aquatic ecology, environmental toxicology, biodiversity, and aquaculture. I hold two patents related to IoT-enabled fish and freshwater protection systems and sustainable agriculture with pesticide management (2023). I have authored two books in microbiology and pharmaceutical microbiology and guided four Ph.D. scholars to completion, while six scholars are currently pursuing research under my supervision.",

        brief: [
          "I am an Associate Professor in the Department of Zoology, Adikavi Nannaya University, with expertise in fish biology, fisheries science, aquatic ecology, biodiversity, eco-toxicology, and aquaculture.",
          "My academic and research contributions focus on fish biodiversity, water quality, environmental sustainability, toxicology, and aquaculture innovations, alongside active involvement in teaching, research, academic administration, and institutional development.",
        ],
      },
      {
        name: "Dr. D Sridhar",
        designation: "Assistant Professor(Ad-hoc)",
        email: "sridhar.aqua@aknu.edu.in",
        img: "./images/ArtsImages/sridhar.jpg",
        profileLink: "#",
        qualifications: [
          { label: "Ph.D.", value: "Commerce/Management" },
          { label: "MBA", value: "Business Administration" },
          { label: "M.Sc", value: "Statistics" },
        ],
        experience:
          "Professional/Teaching: 17.9 Years. Administrative: Team Member in AQAR.",
        publications:
          "Journals: National - 3, International - 1. Conferences: National - 2. Books Authored: 1. Workshops/Conferences/Seminars Attended: 18. Invited Talks/Resource Person: 1.",
        brief: [
          "Department: Commerce & Management Studies, University College of Arts & Commerce.",
          "Date of Birth: 10-09-1982. Email: jrs.cms@aknu.edu.in. Phone: 7416151577.",
          "No. of PhDs Guided: Nil. No. of Patents: Nil. No. of Awards: Nil. Collaborations/Foreign Visits: Nil.",
          "Specializations: Business Administration, Statistics, Commerce.",
        ],
      },
    ],
  },

  {
    name: "Biochemistry",
    profile: {
      img: "./images/ArtsImages/Lavanya.jpg",
      name: "Dr. A Lavanya Kumari",
      designation: "Course Co-ordinator",
      phone: "9391773029",
      email: "economics.ucac@aknu.edu.in",
      qualifications: "M.A., Ph.D., UGC-NET",
    },
    about: `The Department of Economics has been commenced initially as five years integrated MS Economics in 2010. Later in 2013 the MS Economics programme has been transformed into two year MA economics course. In the beginning department was headed (I/c) by Prof.S.Teki, Principal, College of Arts and Commerce and at present Dr. T. Anitha Kumari serving as course coordinator. Currently, the department has four faculty members; all are with UGC-NET, AP- SET, and Ph.D. degrees, with different specializations to cater the educational needs of the students. The faculty members are highly competent, experienced and are having specialization in the areas including Agricultural Economics and Industrial Economics. 
    
    The Department has been toiling to equip the students with emerging economic wisdom, which in turn make the students to face real life and career challenges effectively and efficiently. The department motivates the students towards preparing for the national and the state level competitive examinations and enables them for further educational pursuits. Our students were qualified in UGC- NET, JRF, AP SET and secured different government jobs in public sector and private sector as well. So far, the department organized number of National Seminars and Workshops. Research is taken up in various aspects related to economics besides theoretical and Empirical.`,
    // vision: `The department is the desirable place for quality education in Economics; eventually emerge as centre of excellence with excellent faculty, facilities, qualitative research and to serve the community with competitive spirit.`,
    // mission: [
    //   "To provide with a set of quantitative skills and knowledge that will permit the students to succeed as economists",
    //   "Inculcate healthy competitive spirit towards the successful career in the field of economics to serve the nation.",
    //   "To improve the professional potentiality of students and staff through education programmes.",
    // ],
    programsOffered: [
      {
        sno: 1,
        name: "M.A Economics",
        syllabus: "",
        intake: 30,
      },
    ],
    faculty: [
      {
        name: "Dr. A Lavanya Kumari",
        designation: "Assistant Professor(Ad-hoc)",
        email: "alk.eco@aknu.edu.in",
        img: "./images/ArtsImages/Lavanya.jpg",
        profileLink: "#",
      },
      {
        name: "Dr. P Lakshmi Narayana",
        designation: "Assistant Professor(Ad-hoc)",
        email: "pln.eco@aknu.edu.in",
        img: "././images/ArtsImages/Narayana.jpg",
        profileLink: "#",
      },
      {
        name: "Dr. T Anitha Kumari",
        designation: "Assistant Professor(Ad-hoc)",
        email: "anitha.eco@aknu.edu.in",
        img: "./images/ArtsImages/Anitha.jpg",
        profileLink: "#",
      },
    ],
  },
];

export { departments, subDepartsWithFullData, subDepartsWithFullDataEdu };
