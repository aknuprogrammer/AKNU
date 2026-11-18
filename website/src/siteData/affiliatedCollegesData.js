// const collegeTypes = [
//     {
//       name: 'Undergraduate (UG) Colleges',
//       districts: [
//         { name: 'East Godavari District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/EAST%20GODAVARI%20CONTACT%20DETAILS.pdf' },
//         { name: 'Kakinada District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/KAKINADA%20DISTRICT%20CONTACT%20DETAILS.pdf' },
//         { name: 'Dr.B R Ambedkar Konaseema District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/DR%20B%20R%20AMBEDKAR%20KONASEEMA%20DISTRICT%20CONTACT%20DETAILS.pdf' },
//         { name: 'Alluri Sitharamaraju District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/ALLURI%20SITHARAMARAJU%20DISTRICT%20CONTACT%20DETAILS.pdf' },
//         { name: 'West Godavari District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/WEST%20GODAVARI%20DISTRICT%20CONTACT%20DETAILS.pdf' },
//         { name: 'Eluru District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/ELURU%20DISTRICT%20CONTACT%20DETAILS.pdf' },
//       ],
//     },
//     {
//       name: 'Post Graduate (PG) Colleges',
//       districts: [
//         { name: 'East Godavari District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/PG%20EAST%20GODAVARI%20DISTRICT.pdf' },
//         { name: 'Kakinada District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/PG%20KAKINADA%20DISTRICT%20CONTACT%20DETAILS.pdf' },
//         { name: 'Dr.B R Ambedkar Konaseema District', pdf: '/pdfs/pg-konaseema.pdf' },
//         { name: 'West Godavari District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/PG%20DR%20BR%20AMBEDKAR%20KONASEEMA%20DISTRICT%20CONTACT%20DETAILS.pdf' },
//         { name: 'Eluru District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/PG%20ELURU%20DISTRICT%20CONTACT%20DETAILS.pdf' },
//       ],
//     },
//     {
//       name: 'Education Colleges',
//       districts: [
//         { name: 'East Godavari District', pdf: '' },
//         { name: 'Kakinada District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/EDUCATION%20CONTACT%20DETAILS%20KAKINADA%20DISTRICT.pdf' },
//         { name: 'Dr.B R Ambedkar Konaseema District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/EDUCATION%20CONTACT%20DETAILS%20DR%20B%20R%20AMBEDKAR%20KONASEEMA%20DISTRICT.pdf' },
//         { name: 'Alluri Sitharamaraju District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/EDUCATION%20CONTACT%20DETAILS%20ASR%20DISTRICT.pdf' },
//         { name: 'West Godavari District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/EDUCATION%20CONTACT%20DETAILS%20WEST%20GODAVARI%20DISTRICT.pdf' },
//         { name: 'Eluru District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/EDUCATION%20CONTACT%20DETAILS%20ELERU%20DISTRICT.pdf' },
//       ],
//     },
//     {
//       name: 'MBA Colleges',
//       districts: [
//         { name: 'East Godavari District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/MBA%20CONTACT%20DETAILS%20EAST%20GODAVARI%20DISTRICT.pdf' },
//         { name: 'Kakinada District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/MBA%20KAKINADA%20CONTACT%20DETAILS%20KAKINADA%20DISTRICT.pdf' },
//         { name: 'Dr.B R Ambedkar Konaseema District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/MBA%20CONTACT%20DETAILS%20DR%20B%20R%20AMBEDKAR%20KONASEEMA%20DISTRICT.pdf' },
//         { name: 'West Godavari District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/MBA%20CONTACT%20DETAILS%20WEST%20GODAVARI%20DISTRICT.pdf' },
//         { name: 'Eluru District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/MBA%20CONTACT%20DETAILS%20ELURU%20DISTRICT.pdf' },
//       ],
//     },
//     {
//       name: 'MCA Colleges',
//       districts: [
//         { name: 'East Godavari District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/MCA%20CONTRACT%20DETAILS%20EAST%20GODAVARI%20DISTRICT.pdf' },
//         { name: 'Kakinada District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/MCA%20CONTRACT%20DETAILS%20KAKINADA%20DISTRICT.pdf' },
//         { name: 'Dr.B R Ambedkar Konaseema District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/MCA%20CONTACT%20DETAILS%20DR%20B%20R%20AMBEDKAR%20KONASEEMA%20DISTRICT.pdf' },
//         { name: 'West Godavari District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/MCA%20CONTACT%20DETAILS%20WEST%20GODAVARI%20DISTRICT.pdf' },
//         { name: 'Eluru District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/MCA%20CONTACT%20DETAILS%20ELURU%20DISTRICT.pdf' },
//       ],
//     },
//     {
//       name: 'LAW Colleges',
//       districts: [
//         { name: 'East Godavari District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/LAW%20CONTACT%20DETAILS%20EAST%20GODAVARI%20DISTRICT.pdf' },
//         { name: 'Kakinada District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/LAW%20CONTRACT%20DETAILS%20KAKINADA%20DISTRICT.pdf' },
//         { name: 'West Godavari District', pdf: 'https://www.aknu.edu.in/CDC/links/cdc/AFC%202021/LAW%20CONTACT%20DETAILS%20WEST%20GODAVARI%20DISTRICT.pdf' },
//       ],
//     },
//   ];

//   export default collegeTypes;

// utils/collegeTypes.js

import {
  mbaColleges,
  Post_Graduate,
  MCA,
  LAW,
  Education,
  Undergraduate,
} from "@/utils/url";
import { EastGodavari, Kakinada, Konaseema, ASR, WestGodavari, Eluru, EastGodavariContact, KakinadaContact, KonaseemaContact, ASRContact, WestGodavariContact, EluruContact, EduKakinadaDistrict, EduKonaseemaDistrict, EduASRDistrict, EduWestGodavariDistrict, EduEluruDistrict, EduKakinadaDistrictContact, EduKonaseemaDistrictContact, EduASRDistrictContact, EduWestGodavariDistrictContact, EduEluruDistrictContact, MBAEastGodavariDistrict, MBAEastGodavariDistrictContact, MBAKakinadaDistrict, MBAKakinadaDistrictContact, MBAKonaseemaDistrict, MBAKonaseemaDistrictContact, MBAWestGodavariDistrict, MBAWestGodavariDistrictContact, MBAEluruDistrict, MBAEluruDistrictContact, MCAEastGodavariDistrict, MCAEastGodavariDistrictContact, MCAKakinadaDistrict, MCAKakinadaDistrictContact, MCAKonaseemaDistrict, MCAKonaseemaDistrictContact, MCAWestGodavariDistrict, MCAWestGodavariDistrictContact, MCAEluruDistrict, MCAEluruDistrictContact, LAWEastGodavariDistrict, LAWEastGodavariDistrictContact, LAWKakinadaDistrict, LAWKakinadaDistrictContact, LAWWestGodavariDistrict, LAWWestGodavariDistrictContact, EduEastGodavariDistrict, PGEastGodavariDistrict, PGKakinadaDistrict, PGKonaseemaDistrict, PGWestGodavariDistrict, PGEluruDistrict, PGWestGodavariDistrictContact, PGEluruDistrictContact, PGKonaseemaDistrictContact,  PGKakinadaDistrictContact, PGEastGodavariDistrictContact, GovtColleges, AutonomousColleges, AffiliatedColleges, NAACColleges, A_B_Colleges, WomensColleges, CPEColleges } from "../assets";

// Base mapping of category names to URLs
 export const collegeTypesBase = [
  { 
    name: "Undergraduate (UG) Colleges",
    id:1,
    districts: [
      { nameOfDistrict: "East Godavari District", CollegeList:EastGodavari, CollegeContactDetails:EastGodavariContact },
      { nameOfDistrict: "Kakinada District", CollegeList:Kakinada, CollegeContactDetails:KakinadaContact },
      { nameOfDistrict: "Dr.B R Ambedkar Konaseema District", CollegeList:Konaseema, CollegeContactDetails:KonaseemaContact },
      { nameOfDistrict: "Alluri Sitharamaraju District", CollegeList:ASR, CollegeContactDetails:ASRContact },
      { nameOfDistrict: "West Godavari District", CollegeList:WestGodavari, CollegeContactDetails:WestGodavariContact },
      { nameOfDistrict: "Eluru District", CollegeList:Eluru, CollegeContactDetails:EluruContact }
    ]
  },
  { name: "Post Graduate (PG) Colleges",id:2, districts:[
    {nameOfDistrict:"East Godavari District", CollegeList:PGEastGodavariDistrict, CollegeContactDetails:PGEastGodavariDistrictContact},
    {nameOfDistrict:"Kakinada District", CollegeList:PGKakinadaDistrict, CollegeContactDetails:PGKakinadaDistrictContact},
    {nameOfDistrict:"Dr.B R Ambedkar Konaseema District", CollegeList:PGKonaseemaDistrict, CollegeContactDetails:PGKonaseemaDistrictContact},
    {nameOfDistrict:"West Godavari District", CollegeList:PGWestGodavariDistrict, CollegeContactDetails:PGWestGodavariDistrictContact},
    {nameOfDistrict:"Eluru District", CollegeList:PGEluruDistrict, CollegeContactDetails:PGEluruDistrictContact}
  ] },
  { name: "Education Colleges", id:3, districts: [
      { nameOfDistrict: "East Godavari District", CollegeList:EduEastGodavariDistrict, CollegeContactDetails:"" },
      { nameOfDistrict: "Kakinada District", CollegeList:EduKakinadaDistrict, CollegeContactDetails:EduKakinadaDistrictContact },
      { nameOfDistrict: "Dr.B R Ambedkar Konaseema District", CollegeList:EduKonaseemaDistrict, CollegeContactDetails:EduKonaseemaDistrictContact },
      { nameOfDistrict: "Alluri Sitharamaraju District", CollegeList:EduASRDistrict, CollegeContactDetails:EduASRDistrictContact },
      { nameOfDistrict: "West Godavari District", CollegeList:EduWestGodavariDistrict, CollegeContactDetails:EduWestGodavariDistrictContact },
      { nameOfDistrict: "Eluru District", CollegeList:EduEluruDistrict, CollegeContactDetails:EduEluruDistrictContact }
    ] },
  { name: "MBA Colleges", id:4, districts:[
    { nameOfDistrict: "East Godavari District", CollegeList:MBAEastGodavariDistrict, CollegeContactDetails:MBAEastGodavariDistrictContact },
    { nameOfDistrict: "Kakinada District", CollegeList:MBAKakinadaDistrict, CollegeContactDetails:MBAKakinadaDistrictContact },
    { nameOfDistrict: "Dr.B R Ambedkar Konaseema District", CollegeList:MBAKonaseemaDistrict, CollegeContactDetails:MBAKonaseemaDistrictContact },
    // { nameOfDistrict: "Alluri Sitharamaraju District", CollegeList:MBAASRDistrict, CollegeContactDetails:MBAASRDistrictContact },
    { nameOfDistrict: "West Godavari District", CollegeList:MBAWestGodavariDistrict, CollegeContactDetails:MBAWestGodavariDistrictContact },
    { nameOfDistrict: "Eluru District", CollegeList:MBAEluruDistrict, CollegeContactDetails:MBAEluruDistrictContact }
  ]},
  { name: "MCA Colleges", id:5, districts:[
    { nameOfDistrict: "East Godavari District", CollegeList:MCAEastGodavariDistrict, CollegeContactDetails:MCAEastGodavariDistrictContact },
    { nameOfDistrict: "Kakinada District", CollegeList:MCAKakinadaDistrict, CollegeContactDetails:MCAKakinadaDistrictContact },
    { nameOfDistrict: "Dr.B R Ambedkar Konaseema District", CollegeList:MCAKonaseemaDistrict, CollegeContactDetails:MCAKonaseemaDistrictContact },
    // { nameOfDistrict: "Alluri Sitharamaraju District", CollegeList:MCAASRDistrict, CollegeContactDetails:MCAASRDistrictContact },
    { nameOfDistrict: "West Godavari District", CollegeList:MCAWestGodavariDistrict, CollegeContactDetails:MCAWestGodavariDistrictContact },
    { nameOfDistrict: "Eluru District", CollegeList:MCAEluruDistrict, CollegeContactDetails:MCAEluruDistrictContact }
  ]},
  { name: "LAW Colleges", id:6, districts:[
    { nameOfDistrict: "East Godavari District", CollegeList:LAWEastGodavariDistrict, CollegeContactDetails:LAWEastGodavariDistrictContact },
    { nameOfDistrict: "Kakinada District", CollegeList:LAWKakinadaDistrict, CollegeContactDetails:LAWKakinadaDistrictContact },
    // { nameOfDistrict: "Dr.B R Ambedkar Konaseema District", CollegeList:LAWKonaseemaDistrict, CollegeContactDetails:LAWKonaseemaDistrictContact },
    // { nameOfDistrict: "Alluri Sitharamaraju District", CollegeList:LAWASRDistrict, CollegeContactDetails:LAWASRDistrictContact },
    { nameOfDistrict: "West Godavari District", CollegeList:LAWWestGodavariDistrict, CollegeContactDetails:LAWWestGodavariDistrictContact },
    // { nameOfDistrict: "Eluru District", CollegeList:LAWEluruDistrict, CollegeContactDetails:LAWEluruDistrictContact }
  ]},
];


export const allCollegesData = [{id:1,name:"Govt. Colleges", collges:GovtColleges}, {id:2,name:"Autonomous Colleges", collges:AutonomousColleges}, {id:3,name:"Permantent Affiliation Colleges", collges:AffiliatedColleges},{id:4,name:"NAAC Grade Colleges", collges:NAACColleges}, {id:5,name:"2(A) & 2(B) Colleges", collges:A_B_Colleges}, {id:6,name:"Womens Colleges", collges:WomensColleges}, {id:7,name:"CPE Colleges", collges:CPEColleges} ]

// export async function getCollegeTypes() {
//   const enrichedTypes = await Promise.all(
//     collegeTypesBase.map(async (college) => {
//       try {
//         const listUrl = `${college.url}/List_of_Colleges`;
//         const detailsUrl = `${college.url}/Details`;

//         const [listRes, detailsRes] = await Promise.all([
//           fetch(listUrl),
//           fetch(detailsUrl),
//         ]);

//         const listData = await listRes.json();
//         const detailsData = await detailsRes.json();

//         return {
//           name: college.name,
//           listOfColleges: listData,
//           details: detailsData,
//         };
//       } catch (err) {
//         console.error(`❌ Failed to fetch ${college.name}`, err);
//         return { name: college.name, listOfColleges: [], details: [] };
//       }
//     })
//   );

//   return enrichedTypes;
// }
