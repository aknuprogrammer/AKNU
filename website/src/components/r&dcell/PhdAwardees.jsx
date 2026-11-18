import React, { useState } from "react";
import { BackButton } from "../BackButton";

export default function PhdAwardees() {
  const [selectedAwardee, setSelectedAwardee] = useState(null);

  const handleAwardeeClick = (awardee) => {
    setSelectedAwardee(awardee);
  };

  const handleCloseModal = () => {
    setSelectedAwardee(null);
  };

  // Drag-and-scroll handlers for table
  const handleDragStart = (e) => {
    e.currentTarget.style.cursor = "grabbing";
    e.currentTarget.dataset.dragging = true;
    e.currentTarget.dataset.scrollStart = e.currentTarget.scrollLeft;
    e.currentTarget.dataset.mouseStart = e.clientX;
  };

  const handleDragMove = (e) => {
    const container = e.currentTarget;
    if (container.dataset.dragging === "true") {
      const scrollDelta =
        parseInt(container.dataset.mouseStart, 10) - e.clientX;
      container.scrollLeft =
        parseInt(container.dataset.scrollStart, 10) + scrollDelta;
    }
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.cursor = "grab";
    e.currentTarget.dataset.dragging = false;
  };

  // Ph.D Awardees data
  const awardees = [
    {
      id: 1,
      name: "Dr.N.Thrimurthulu",
      department: "Chemistry",
      guides: "Dr.J S Yadav, Dr.B Jagan Mohan Reddy",
      date: "27.08.2012",
      thesis: "Application of prins cyclisation to stereoselective total synthesis of natural product: Aculeatin A and B, Xetodecalactone C and EPI-Sporostatin (1oS, 20S) 10-Hydroxy-12-Methl-1-1-Oxacyclododecance-2, 5-Dione"
    },
    {
      id: 2,
      name: "Dr.G.Jose Moses",
      department: "ComputerScience & Engineering",
      guides: "Prof.P.Suresh Varma",
      date: "21.12.2013",
      thesis: "Some investigations on implimenting multicast routing protocols with quality of service (QoS) to improve performance of mobile adhoc networks."
    },
    {
      id: 3,
      name: "Dr.M.Kamala Kumari",
      department: "ComputerScience & Engineering",
      guides: "Prof.P.Suresh Varma",
      date: "27.09.2014",
      thesis: "A study on redescriptive mining techniques on various domains."
    },
    {
      id: 4,
      name: "Dr.M.Durga Bharathi",
      department: "Zoology",
      guides: "Dr. V V S S Sarma, Dr. K Ramaneswari",
      date: "05.05.2015",
      thesis: "Variability in composition and diversity of Phytoplankton in the Indian Estuaries and Coastal Bay of Bengal."
    },
    {
      id: 5,
      name: "Dr.B.Krishna Veni",
      department: "Mathematics",
      guides: "Dr.G.Ganesan",
      date: "20.05.2015",
      thesis: "Algebra of Rough Fuzzy & Instuitionistic Rough Fuzzy sets and Characterizations in Information Systems."
    },
    {
      id: 6,
      name: "Dr.N Siva Sankar Reddy",
      department: "Chemistry",
      guides: "Dr B V Subba Reddy, Dr.B Jagan Mohan Reddy",
      date: "26.06.2015",
      thesis: "Total synthesis of Tetrahydroisoquinoline and β-Carboline alkaloids using elleman's chiral auxiliary."
    },
    {
      id: 7,
      name: "Dr.S.Appala Naidu",
      department: "Zoology",
      guides: "Dr.V V S S Sarma, Dr.K Ramaneswari",
      date: "30.07.2015",
      thesis: "Variability in composition and distribution of Macrobenthos in the Indian Estuaries and Coastal Bay of Bengal."
    },
    {
      id: 8,
      name: "Dr.B N V Satish",
      department: "Mathematics",
      guides: "Dr.G.Ganesan",
      date: "18.08.2015",
      thesis: "A study on rough fuzzy predicate calculus"
    },
    {
      id: 9,
      name: "Dr.P Vijaya Kumar",
      department: "Mathematics",
      guides: "Dr.T.Hymavathi",
      date: "04.02.2016",
      thesis: "A study on heat and mass transfer of viscous fluids using homotopy analysis method"
    },
    {
      id: 10,
      name: "Dr.V Venkata Ramana",
      department: "Zoology",
      guides: "Dr.V V S S Sarma, Dr.A Matta Reddy",
      date: "25.02.2016",
      thesis: "Variability and distribution of Zooplankton biomass, aundance and community structure in the Indian Estuaries and Coastal Bay of Bengal."
    },
    {
      id: 11,
      name: "Dr.B Surya Prakash",
      department: "Management Studies",
      guides: "Prof.S.Teki",
      date: "25.02.2016",
      thesis: "Scope and marketability of E-learning products in Hither Educational Institutions with respect to Andhra Pradesh state."
    },
    {
      id: 12,
      name: "Dr.G.Naga Satish",
      department: "Computer Science & Engineering",
      guides: "Prof.P Suresh Varma",
      date: "31.03.2016",
      thesis: "Three node communication network models with feedback having feedback having Homogeneous and Non-homogeneous poisson arrivals and dynamic bandwidth allocation"
    },
    {
      id: 13,
      name: "Dr.Ch V Raghavendran",
      department: "Computer Science & Engineering",
      guides: "Prof.P Suresh Varma",
      date: "31.03.2016",
      thesis: "Study on two node tandem communication network models with feedback under dynamic bandwidth allocation having homogeneous and non homogeneous poisson arrivals."
    },
    {
      id: 14,
      name: "Dr. P Subba Rao",
      department: "Management Studies",
      guides: "Prof S Teki",
      date: "03.06.2016",
      thesis: "Factors Affecting Investors' Perception Of Mutual Fund Investment W.R.T Select Mutual Fund Schemes"
    },
    {
      id: 15,
      name: "Dr. M Madan Mohan",
      department: "Life Sciences",
      guides: "Dr. A Matta Reddy, Dr. Aparna B Srkantham",
      date: "15.06.2016",
      thesis: "Primary And Secondary Drug Resistance In Leprosy: A Community Based Study"
    },
    {
      id: 16,
      name: "Dr.Ch Santhosh",
      department: "Life Sciences",
      guides: "Dr.D Kalyani",
      date: "21.07.2016",
      thesis: "Strain typing and strain differentiation of mycobacterium leprae by variable number tandem repeats (VNTR)."
    },
    {
      id: 17,
      name: "Dr. D Jyothirmai",
      department: "English",
      guides: "Prof. K Sree Ramesh",
      date: "07.10.2016",
      thesis: "No Women, No Nation. Rewriting The Incomplete Story: A Womanist Study Of Sefi Atta's Fiction"
    },
    {
      id: 18,
      name: "Dr. T Srinivas Rao",
      department: "Management Studies",
      guides: "Prof. S Teki",
      date: "21.10.2016",
      thesis: "Motivation Of Employees In Higher Educational Institutions With Reference To Select Technical And Professional Colleges In Andhra Pradesh State"
    },
    {
      id: 19,
      name: "Dr. R Krishnam Raju Indukuri",
      department: "Computer Science & Engineering",
      guides: "Prof.P Suresh Varma",
      date: "23.11.2016",
      thesis: "Novel Scheduling Models For Resource Allocation In Cloud Computing"
    },
    {
      id: 20,
      name: "Dr.A Anupama",
      department: "Computer Science & Engineering",
      guides: "Prof.P Suresh Varma",
      date: "14.12.2016",
      thesis: "Temporal Analysis Of Social Networks: Identification Of Disjoint, Overlapped And Evolutions Of Community Structures"
    },
    {
      id: 21,
      name: "Dr.N Prudhvi Raju",
      department: "Chemistry",
      guides: "Dr.B Jagan Mohan Reddy",
      date: "28.12.2016",
      thesis: "Prins type cascade cyclizations for the synthesis of fused, bridged and spiro tetrahydopyran/tetrahydrofuran derivatives"
    },
    {
      id: 22,
      name: "Dr. R Anji Babu",
      department: "Chemistry",
      guides: "Dr.B Jagan Mohan Reddy",
      date: "28.12.2016",
      thesis: "Stereoselective Synthesis Of Solifenacin, Sitagliptin Using Tertbutanesulfinamide And Development Of Novel Methodologies For The Synthesis Of Benzoxazines, Benzothiazines And Rutaecarpine Derivatives"
    },
    {
      id: 23,
      name: "Dr. V Malli Priya",
      department: "Mathematics",
      guides: "Dr.T Hymavathi",
      date: "22.04.2017",
      thesis: "Homotopy Analysis To Heat And Mass Transfer Of Mhd Viscous Fluids"
    },
    {
      id: 24,
      name: "Dr. A S Padmavalli",
      department: "Management Studies",
      guides: "Prof. S Teki",
      date: "19.09.2017",
      thesis: "Job Satisfaction Among Employees Working In Commercial Banks With Reference To Select Districts Of Andhra Pradesh"
    },
    {
      id: 25,
      name: "Dr. A Kavitha",
      department: "Chemistry",
      guides: "Dr. J S Yadav, Dr.B Jagan Mohan Reddy",
      date: "22.09.2017",
      thesis: "Towards The Synthesis Of Narbonolide,Muamvatin And (S)-5-((S)-6-Hydroxyoctyl)Furan-2(5h)-One"
    },
    {
      id: 26,
      name: "Dr.Volety V S Ramachandram",
      department: "Mathematics",
      guides: "Dr. B Sankara Rao",
      date: "27.11.2017",
      thesis: "A Study On Some New Types Of Closed Sets And Separation Axioms In Topological Ordered Spaces"
    },
    {
      id: 27,
      name: "Dr.Sajna Raj N.",
      department: "Englidh",
      guides: "Prof.K Sree Ramesh",
      date: "30.12.2017",
      thesis: "The Body Speaks: A Study Of Deformity In Select Victorian Novels"
    },
    {
      id: 28,
      name: "Dr.Angalakuduru Aravind",
      department: "Englidh",
      guides: "Prof.K Sree Ramesh",
      date: "06.02.2018",
      thesis: "A Critical Study Of The Select Novels Of Amitav Ghosh"
    },
    {
      id: 29,
      name: "Dr.Satya Kamal Chirauri",
      department: "Physics",
      guides: "Dr.K Rama Chandra Rao",
      date: "19.02.2018",
      thesis: "Photo and electroluminesence studies on gallium based oxide nanophospors."
    },
    {
      id: 30,
      name: "Dr.D Satish Kumar",
      department: "Life Sciences",
      guides: "Dr.D Kalyani",
      date: "28.04.2018",
      thesis: "Assessment Of Genetic Purity Through Grow Out Test (Got) And Rapd Markers For F1 Hybrid Seeds In Tobacco (Nicotlana Tabacum)"
    },
    {
      id: 31,
      name: "Dr.B Someswarao",
      department: "Chemistry",
      guides: "Dr.B Jagan Mohan Reddy",
      date: "28.04.2018",
      thesis: "Design And Synthesis Of Fused And Bridged Tetrahydropyran / Tetrahydrofuran Systems Throughy Prins Type Cascade Cyclization"
    },
    {
      id: 32,
      name: "Dr.Nelima Priyanka N",
      department: "Computer Science & Engineering",
      guides: "Prof.P Suresh Varma",
      date: "11.05.2018",
      thesis: "Novel Earliest Deadline First Scheduling Modeles For Resource Allocation In Cloud Computing"
    },
    {
      id: 33,
      name: "Dr. Wuriti Sridhar",
      department: "Mathematics",
      guides: "Dr. T Hymavathi",
      date: "15.06.2018",
      thesis: "Numerical Study Of Heat And Mass Transfer Of Casson Fluids"
    },
    {
      id: 34,
      name: "Dr.D Sasi Raja Sekhar",
      department: "Computer Science & Engineering",
      guides: "Prof.P Suresh Varma",
      date: "22.06.2018",
      thesis: "A Simple Surface Realization Engine For Telugu"
    },
    {
      id: 35,
      name: "Dr. A Satyanarayana",
      department: "Computer Science & Engineering",
      guides: "Prof.P Suresh Varma",
      date: "18.07.2018",
      thesis: "Novel Cloud Computing Models With Dynamic Allocation Of Virtual Machines Under Homogeneous And Non-Homogeneous Conditions"
    },
    {
      id: 36,
      name: "Dr. Simhachalam Boddana",
      department: "Mathematics",
      guides: "Dr. T Hymavathi",
      date: "15.08.2018",
      thesis: "K-Means Algorithm With A Covariance Matrix Compared To Partition - Based Clustering Algorithms"
    },
    {
      id: 37,
      name: "Dr.Bonu Akkayya",
      department: "Mathematics",
      guides: "Dr. T Hymavathi",
      date: "16.08.2018",
      thesis: "Homotopy Analysis Method To Heat And Mass Transfer Of Visco-Elastic Fluid Flows Over An Exponentially Stretching Sheet Through Porous Medium Using"
    },
    {
      id: 38,
      name: "Dr.Rajendra Prasad G",
      department: "Management Studies",
      guides: "Prof. S Teki",
      date: "20.08.2018",
      thesis: "A Study On Assessing Training And Development Requirements Of Micro Enterpreneurs And Its Impact On Their Livelihoods - W.R.T. Ntfp's Value Addition Erstwhile Andhra Pradesh State"
    },
    {
      id: 39,
      name: "Dr.Malladi Sreerama Raju",
      department: "Management Studies",
      guides: "Dr.N Udaya Bhaskar",
      date: "20.09.2018",
      thesis: "Assessment Of Services Quality In Higher Education: A Study Of Select Universities In Andhra Pradesh"
    },
    {
      id: 40,
      name: "Dr.Bothsa Srinivas",
      department: "Mathematics",
      guides: "Dr. B Sankara Rao",
      date: "27.09.2018",
      thesis: "An Analytical Study On Different Methods For Solving Transportation And Assignment Problems In Fuzzy Environment"
    },
    {
      id: 41,
      name: "Mr.Y Vikram Reddy",
      department: "Chemistry",
      guides: "Dr. B Jagan Mohan Reddy",
      date: "02.01.2019",
      thesis: "Total Synthesis Of Tetrahydroisoquinoline Alkaloids And Novel Synthetic Methodologies"
    },
    {
      id: 42,
      name: "Dr.N N V Sakunthala",
      department: "Mathematics",
      guides: "Dr. T Hymavathi",
      date: "15.04.2019",
      thesis: "Analtytical Solution To Study Of Mhd Visco-Elastic Fluid Flow Through Porous Medium Over An Exponential Stretching Sheet"
    },
    {
      id: 43,
      name: "Dr. Mortha Kiran Deedi",
      department: "Life Sciences",
      guides: "Dr.A Matta Reddy",
      date: "01.05.2019",
      thesis: "Evaluation Of Biomarkers For Primary Prevention Of Cardiovascular Diseases And Stroke Among Type 2 Diabetes Mellitus In East Godavari District, Andhra Pradesh."
    },
    {
      id: 44,
      name: "Dr. Suresh Reddy Nallamilli",
      department: "Life Sciences",
      guides: "Dr.K Ramaneswari",
      date: "01.05.2019",
      thesis: "Fish Diversity Of Dowleswaram Reservoir Of Godavari River At Rajamahendravaram, A.P. India"
    },
    {
      id: 45,
      name: "Dr.Anumula Pavana Kumari",
      department: "Mathematics",
      guides: "Dr. T hymavathi",
      date: "25.06.2019",
      thesis: "Numerical Study Of Some Magneto Hydro Dynamic Flow Problems Of Casson Fluid"
    },
    {
      id: 46,
      name: "Dr.Alekya",
      department: "English",
      guides: "Prof. T Ashok",
      date: "04.09.2019",
      thesis: "The Attitude And Perception Towards Blended Learning Approach Among English Language Teachers In Secondary Schools Of North Coastal Districts Of Andhra Pradesh"
    },
    {
      id: 47,
      name: "Dr.K B V Brahma Rao",
      department: "Computer Science & Engineering",
      guides: "Prof.P Suresh Varma",
      date: "13.03.2020",
      thesis: "Dimensionality And Knowledge Reduction Techniques For Massive Patient Datasets"
    },
    {
      id: 48,
      name: "Dr P. S. Abhiram",
      department: "Management Studies",
      guides: "Dr.N.Udaya Bhaskar",
      date: "16.09.2020",
      thesis: "Big Data Analytics An Intelligent Interface in Micro Finance Sector in Andhra Pradesh"
    },
    {
      id: 49,
      name: "Dr. D. Bindu Madhavi",
      department: "Management Studies",
      guides: "Prof. S. Teki",
      date: "04.01.2021",
      thesis: "A Study on Financial Performance of Coir Industry - with Reference to East Godavari District, Andhra Pradesh"
    },
    {
      id: 50,
      name: "Dr.Neetha Raj",
      department: "Geophysics",
      guides: "Dr. K V Swamy",
      date: "30.12.2020",
      thesis: "Interpretation of Gravity Anomalies of Parts of Deccan Trap Regions of Peninsular India."
    },
    {
      id: 51,
      name: "Dr. Vinayak Mishra",
      department: "Management Studies",
      guides: "Prof. S. Teki",
      date: "25.03.2021",
      thesis: "BPO In India: Growth and Challenges with Reference to Attrition In Select Indian Companies"
    },
    {
      id: 52,
      name: "Dr. M. V. Ramana Murthy",
      department: "Geology",
      guides: "Dr. K.MruthyunjayaReddy, Dr. K. V. Swamy",
      date: "13.05.2021",
      thesis: "Flood vulnerability analysis in Krishna River delta, Andhra Pradesh, India, using geospatial tools."
    },
    {
      id: 53,
      name: "Dr. B. Madhavi Latha",
      department: "Chemistry",
      guides: "Dr. BV Subba Reddy, Dr. B. Jagan Mohan Reddy",
      date: "06.09.2021",
      thesis: "Synthesis Of Pyrazole, Oxadiazole, Thiazole-Triazole/ Isoxaxole Hybrids Via Click Reaction And Evaluation Of Their Cytotoxic Activity"
    },
    {
      id: 54,
      name: "Dr. Kandregual Raj Sunil",
      department: "Geology",
      guides: "Dr. Girish Ch Kothyari, Dr. K. V. Swamy",
      date: "06.01.2022",
      thesis: "Neotectonics and Paleoseismic Investigations along the Kachchh Main land Fault Zone, Western India: Implications for Seismic Hazard Assessment."
    },
    {
      id: 55,
      name: "Mrs. G. Chandrakala",
      department: "Management Studies",
      guides: "Prof. S. Teki",
      date: "13.03.2023",
      thesis: "Role of Micro Finance in Women Empowerment with respect to East Godavari District"
    },
    {
      id: 56,
      name: "Mrs.Naina",
      department: "Management Studies",
      guides: "Prof. M. Mutyala Naidu",
      date: "16.03.2023",
      thesis: "A study on Role of Micro - Finance in Women Empowerment with reference to Mahabubnagar District"
    },
    {
      id: 57,
      name: "Mrs. Gunda. Swathi",
      department: "Geo-Physics",
      guides: "Dr. K. V. Swamy",
      date: "20.03.2023",
      thesis: "Geohydrological characteristics of the watersheds of the Eastern Ghats of Visakhapatnam and Vizianagaram districts and quality and over exploitation of the Groundwater Ranasthalam, Laveru and Etcherla mandals of Srikakulam District, Andhra Pradesh, India"
    },
    {
      id: 58,
      name: "Dr. Kovvuri Jayasri Naga Venkata Narasa Reddy",
      department: "Management Studies",
      guides: "Prof. S. Teki",
      date: "21.03.2023",
      thesis: "A Study on Investor's perception towards selected Financial and Investment Avenues with respect to Godavari Districts of Andhra Pradesh"
    },
    {
      id: 59,
      name: "Dr. Venkata Ramana Karri",
      department: "Management Studies",
      guides: "Dr. R. Pardhasaradhi, Dr. N. Udaya Bhaskar",
      date: "03.05.2023",
      thesis: "A Study on Marketing Challenges of Medical Representatives in Select Cities of Andhra Pradesh"
    },
    {
      id: 60,
      name: "Dr. Rachagundla Raja",
      department: "Management Studies",
      guides: "Dr. P. Uma Maheswari",
      date: "07.06.2023",
      thesis: "The impact of Visual Merchandise Elements on Apparel Customer's Impulse buying Behavior a Study w.r.t. Tier - 1 cities in South India"
    },
    {
      id: 61,
      name: "Dr. Ravi Sankar Jetti",
      department: "Management Studies",
      guides: "Dr. N. Udaya Bhaskar",
      date: "07.07.2023",
      thesis: "A Study on Investors' Behaviour in Investment Decision Making Towards Capital Markets w.r.t Select Cities of Andhra Pradesh"
    },
    {
      id: 62,
      name: "Dr. Diddi Srinivasa Rao",
      department: "Mathematics",
      guides: "Dr. R David Kumar, Dr M. Kamala Kumari",
      date: "07.07.2023",
      thesis: "Study of Heat and Mass Transfer of Some Non Newtonian Fluids"
    },
    {
      id: 63,
      name: "Mrs. Kondru Mounika",
      department: "Computer Science and Engineering",
      guides: "Dr. P. Venkateswara Rao",
      date: "27.09.2023",
      thesis: "Evaluation of Hybrid Extreme Learning Machine Models for Intrusion Detection System"
    },
    {
      id: 64,
      name: "Mrs. Kandadai Sowjanya",
      department: "Department of Physics",
      guides: "Dr. PSR Prasad, Dr. K.V Swamy",
      date: "07.10.2023",
      thesis: "Gas Hydrate Formation Under Simulated Natural Conditions for Sustainable Gas Storage"
    },
    {
      id: 65,
      name: "Mr. Tatapudi Ashok",
      department: "Computer Science and Engineering",
      guides: "Prof P. Suresh Varma",
      date: "20.11.2023",
      thesis: "A Novel Model To Predict the Suitable Crop Based on Environmental Factors and Soil Nutrients Using Iot Augmented With Machine Learning Techniques"
    },
    {
      id: 66,
      name: "Mr. Suri Babu Donipudi",
      department: "Geo-Physics",
      guides: "Dr. Rejesh K Dumka",
      date: "08.12.2023",
      thesis: "Crustal Deformation study along Katrol Hill Fault (KHF) Using GPS, PS- InSAR in Kachchh, Gujarat"
    },
    {
      id: 67,
      name: "Mrs. S. Jaya Sai Rajitha",
      department: "Commerce and Management Studies",
      guides: "Dr. K. Ratna Manikyam",
      date: "30.12.2023",
      thesis: "Impact of Climate Change Adaptation on Employment w.r.t Select Industries in Godavari Districts of Andhra Pradesh"
    },
    {
      id: 68,
      name: "Mr. Duggirala V N S R Murty",
      department: "Mathematics",
      guides: "Dr. Ch. Srinivasulu",
      date: "04.04.2024",
      thesis: "A Numerical Analysis on some Non-Newtonian Fluids With Chemical Reaction Using Novel Keller Box Scheme"
    },
    {
      id: 69,
      name: "Mrs. Aregela Sai Santhishi Devi",
      department: "Computer Science and Engineering",
      guides: "Dr. V. Persis",
      date: "18.05.2024",
      thesis: "A Blockchain Technology Solution for Validation of Student Transfers at College and University Levels"
    },
    {
      id: 70,
      name: "Mrs. Sindhu B",
      department: "Computer Science and Engineering",
      guides: "Dr. B. Kezia Rani",
      date: "24.05.2024",
      thesis: "A Blockchain Technology Solution for Validation of Student Transfers at College and University Levels"
    },
    {
      id: 71,
      name: "Mr. Dakara Venakata Ramana",
      department: "Telugu",
      guides: "Dr. M. Sudhamayi",
      date: "29.07.2024",
      thesis: "P.V Sunil Kumar Saahityam - Samalochana"
    },
    {
      id: 72,
      name: "Mrs. P. Madhuri Santhoshi",
      department: "Physics",
      guides: "Dr. K. Ramachandra Rao",
      date: "29.08.2024",
      thesis: "Rare Earth Metal (Eu, Tb) Doped Inorganic Crystals (ZnSO4 CUSO4) for Optical and Antimicrobial Investigations"
    },
    {
      id: 73,
      name: "Mr. Thota Ramakrishna",
      department: "Telugu",
      guides: "Dr. M. Sudhamayi",
      date: "31.08.2024",
      thesis: "Anandarao Patnaik Kathalu- Pariseelana"
    },
    {
      id: 74,
      name: "Mrs Aluri Lakshmi",
      department: "Computer Science and Engineering",
      guides: "Dr. D. Latha",
      date: "11.09.2024",
      thesis: "Quality Evaluation of Hybrid Latent Semantic Analysis with Text Rank Extractive Text Summarization and Hunter Sail Fish Optimizer enabled Deep Learning Abstractive Text Summarization on Telugu E- News Articles"
    },
    {
      id: 75,
      name: "Mr. Pothuraju RGNV Prasad",
      department: "Zoology",
      guides: "Dr. P. Vijaya Nirmala",
      date: "01.10.2024",
      thesis: "Study of In Vitro Antioxidant and Anti Diabetic Properties of Carbon Dots Derived from Acetosa Sagittata ( Polygonaceae family)"
    },
    {
      id: 76,
      name: "Vaddi Venkata Ramanamma",
      department: "Telugu",
      guides: "Dr. M. Sudhamayi",
      date: "01.10.2024",
      thesis: "Katthula Krishnabhagavatar Amudrita Harikatha Sahityam - Pariseelana"
    },
    {
      id: 77,
      name: "Mr. Kandi Sai Kiran",
      department: "Geo-Sciences",
      guides: "Dr. K. Nooka Ratnam",
      date: "09.12.2024",
      thesis: "Evaluation of Saltwater Intrusion and Ground Water Quality in Coastal Aquifers-An Integrated Study Using Remote Sensing and GIS in Srikakulam District, Andhra Pradesh, India"
    },
    {
      id: 78,
      name: "Mr. Y. Ayyanna",
      department: "Zoology",
      guides: "Dr. A, Matta Reddy, Dr. P. Vijaya Nirmala",
      date: "09.12.2024",
      thesis: "Water Quality and Biology of Kakinada Bay and Mangroves Area"
    },
    {
      id: 79,
      name: "Mr. N. Venkateswara Rao",
      department: "Computer Science and Engineering",
      guides: "Dr. P. Venkateswara Rao",
      date: "30.12.2024",
      thesis: "Melanoma Detection from the Dermoscopic Images Using Binary Spiking Neural Networks"
    },
    {
      id: 80,
      name: "Sri S. Linga Reddy",
      department: "Management Studies",
      guides: "Prof. N. Udaya Bhaskar & Dr. D. Chitti Babu",
      date: "13.03.2025",
      thesis: "A Study on Human Resource Analytics and Teachers Performance w.r.t Higher Education Institutions in select Districts of Andhra Pradesh"
    },
    {
      id: 81,
      name: "Ms Gubbala Ramadevi",
      department: "Department of Zoology",
      guides: "Dr. P. Vijaya Nirmala",
      date: "24.05.2025",
      thesis: "Diversity Distribution and DNA Barcoding of Significant Molluscan of Kakinada Bay and Coringa Mangroves, Andhra Pradesh, India"
    },
    {
      id: 82,
      name: "Ms Buddupu Draupati",
      department: "Management Studies",
      guides: "Prof P. Umamaheswari Devi",
      date: "03.07.2025",
      thesis: "A Study on Performance Assessment of Agri Digital Supply Chain w.r.t Selected Districts of Andhra Pradesh"
    },
    {
      id: 83,
      name: "Ms. Pilli Vijaya Durga Devi",
      department: "Management Studies",
      guides: "Prof P. Umamaheswari Devi",
      date: "03.07.2025",
      thesis: "A Study on Service Quality in Commercial Banks w.r.t Select Districts of Andhra Pradesh"
    },
    {
      id: 84,
      name: "Mr. Suresh Parla",
      department: "Department of Commerce and Management Studies",
      guides: "Dr. Gandham Sri Rama Krishna& Prof P. Umamaheswari Devi",
      date: "07.07.2025",
      thesis: "A Study on Financing Challenges of Micro, Small and Medium Enterprises- With reference to Select Districts of Andhra Pradesh"
    },
     {
    id: 85,
    name: "Mr. Genji Sukumar",
    department: "Chemistry",
    guides: "Internal Guide: Dr. S. Chandrasekhar | External Guide: Prof. B Jaganmohan Reddy",
    date: "28.07.2025",
    thesis: "New Synthetic Methodologies for Benzimidazo-isoquinolines & Azaflavanones and camphor based beta-amino acid as new turn inducing template",
  },
  {
    id: 86,
    name: "Mrs Dake Parnavi",
    department: "CMS",
    guides: "Prof. N. Udaya Bhaskar",
    date: "28.07.2025",
    thesis: "Evaluating the Impact of Welfare Schemes on the Socio-Economic Status of Forest Dwellers in Select Integrated Tribal Development Agency (ITDA) Areas of Andhra Pradesh.",
  },
  {
    id: 87,
    name: "Mr. Vundavalli Balasankar",
    department: "CSE",
    guides: "Prof. P. Suresh Varma",
    date: "29.08.2025",
    thesis: "Unveiling Socio-Economic Patterns: A Fusion of Statistical Analysis and Deep Machine Learning On Ses Data.",
  },
  {
    id: 88,
    name: "Mr. Krishna Babu Sambaru",
    department: "CMS",
    guides: "Prof. N. Udaya Bhaskar",
    date: "01.09.2025",
    thesis: "Impact of Social Media Marketing on Purchase Intension in Consumer Electronic Goods with reference to Smart Cities of Andhra Pradesh",
  },
  {
    id: 89,
    name: "Mrs Darapu Uma",
    department: "CSE",
    guides: "Prof. M. Kamala Kumari",
    date: "16.09.2025",
    thesis: "Novel Approaches for Story Telling Through Mean Shift Vision Transformer (MSVIT) and Redescription of Images Using Morphological Open Vision Transformer (MOVIT).",
  },
  {
    id: 90,
    name: "Mr. Kandrakunta Babu",
    department: "Zoology",
    guides: "Dr P. Vijaya Nirmala",
    date: "22.09.2025",
    thesis: "Evaluation of Pesticide Residues and Heavy Metal Contamination in Agricultural Soils of East Godavari District, Andhra Pradesh, India",
  },
  {
    id: 91,
    name: "Tatapudi Venkateswara Rao",
    department: "Zoology",
    guides: "Dr. N. Sreenivas",
    date: "24.05.2025",
    thesis: "Analysis of Stable Carbon (δ13C) and Nitrogen (δ15N) Isotopic Signatures of Particulate Organic Matter (POM) and Zooplankton of Kakinada Bay, Andhra Pradesh, India.",
  },
  {
    id: 92,
    name: "Dr. N Hari Prasad",
    department: "Hindi",
    guides: "Dr. P. Hariram Prasad",
    date: "03.01.2026",
    thesis: "मन्नू भंडारी की कहानियों में नारी संघर्ष",
  },
  {
    id: 93,
    name: "Dr. Nilla BNV Ganapathi",
    department: "Hindi",
    guides: "Dr. P. Hariram Prasad",
    date: "23.01.2026",
    thesis: "ओमप्रकाश वाल्मीकि की कहानियों में दलित चेतना",
  },
  {
    id: 94,
    name: "Dr. Adapa Durga Prasad",
    department: "Geo-Sciences",
    guides: `Internal Guide: Dr. Falguni Bhattacharya, Scientist, ISR, Gujarat. \nExternal Guide: Prof. Y. Srinivasa Rao, Professor, Adikavi Nannaya University, Rajamahendravaram`,
    date: "28.02.2026",
    thesis: "Late Quaternary Paleo-environmental Implications from the Miliolite Deposits of Kachchh, Western India.",
  },
  {
    id: 95,
    name: "Dr. Rapolu Bhavana Rushi",
    department: "Management Studies",
    guides: "Guide: Prof. Murru Mutyalu Naidu | Co-Guide: Prof. P. Umamaheswari Devi",
    date: "20.03.2026",
    thesis: "The Impact of HRM Department's Role in Training Process on Employee Performance: A Study on Select Public Sector Undertakings in India",
  },
  ];

  return (
    <div className="w-full max-w-[95vw] mx-auto px-4 sm:px-8 py-6">
      <BackButton />
      <h1 className="text-3xl sm:text-3xl font-bold text-teal-800 mb-6 text-center">
        Ph.D Awardees List
      </h1>
      <p className="text-center mb-4 text-gray-600">
        Explore the innovative research projects led by our scholars and
        faculty.
      </p>

      <div className="">
        <div
          className="overflow-x-auto "
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          <table className="min-w-full text-left border border-[#ccc]">
            <thead className="bg-teal-700 text-white">
              <tr>
                <th className="px-4 py-2">S.No</th>
                <th className="px-4 py-2">Name of the Ph.D Scholar</th>
                <th className="px-4 py-2">Department/Subject</th>
                <th className="px-4 py-2">Name(s) of the Guide(s)</th>
                <th className="px-4 py-2">Date of Award</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {awardees.map((awardee) => (
                <tr
                  key={awardee.id}
                  className="border-t border-[#ccc] hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{awardee.id}</td>
                  <td className="px-4 py-2 font-medium">{awardee.name}</td>
                  <td className="px-4 py-2">{awardee.department}</td>
                  <td className="px-4 py-2  whitespace-pre-wrap">{awardee.guides}</td>
                  <td className="px-4 py-2">{awardee.date}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-blue-600 hover:text-blue-800  cursor-pointer"
                      onClick={() => handleAwardeeClick(awardee)}
                    >
                      View Thesis
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for thesis details */}
      {selectedAwardee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-white/30 backdrop-blur-md transition-all duration-200"
            onClick={handleCloseModal}
          />
          <div className="relative bg-white rounded-lg shadow-lg p-6 sm:p-8 w-[90vw] sm:w-[700px] mx-auto z-10 max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl font-bold"
              onClick={handleCloseModal}
              aria-label="Close"
              type="button"
            >
              ×
            </button>
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl sm:text-3xl font-bold text-teal-800 mb-2">
                  Thesis Details
                </h2>
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedAwardee.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedAwardee.department}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="font-medium">Guides:</p>
                    <p>{selectedAwardee.guides}</p>
                  </div>
                  <div>
                    <p className="font-medium">Date of Award:</p>
                    <p>{selectedAwardee.date}</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium">Title of Thesis:</p>
                  <p className="mt-2 text-gray-700 italic">
                    "{selectedAwardee.thesis}"
                  </p>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  className="px-4 py-2 bg-teal-700 hover:bg-[#005a4f] text-white rounded-lg"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
