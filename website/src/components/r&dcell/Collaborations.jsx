import React from "react";
import { BackButton } from "../BackButton";

const Collaborations = () => {
  const collaborations = [
    { id: 1, name: "ITC Paper Mills LTD, Badrachalam, Telangana" },
    {
      id: 2,
      name: "Sudha Agro Oil and Chemicals limited, Samalkota, Andhra Pradesh",
    },
    { id: 3, name: "HDFC Limited, Hyderabad, Telangana" },
    { id: 4, name: "Agricultural College, Rajamahendravaram, Andhra Pradesh" },
    {
      id: 5,
      name: "Institute of Public Enterprise (IPE), Hyderabad, Andhra Pradesh",
    },
    {
      id: 6,
      name: "Translational Research Institute of Molecular Sciences (MICGENE LAB), Visakhapatnam, Andhra Pradesh",
    },
    { id: 7, name: "StarTech Labs PVT. LTD., Hyderabad, Telangana" },
    { id: 8, name: "GSL Medical College, Rajamahendravaram, Andhra Pradesh" },
    { id: 9, name: "Reddy Drugs Laboratories, Ravulapalem, Andhra Pradesh" },
    { id: 10, name: "Biological E Limited, Hyderabad, Telangana" },
    {
      id: 11,
      name: "Research Institute of Biological Sciences, Vizianagaram, Andhra Pradesh",
    },
    { id: 12, name: "Sandhya Marines Limited, Palakol, Andhra Pradesh" },
    { id: 13, name: "Sri Srinivasa Hatchery, Mummidivaram, Andhra Pradesh" },
    { id: 14, name: "Egree Foundation Ltd., Kakinada, Andhra Pradesh" },
    {
      id: 15,
      name: "Sapthagiri Hatcheries, Sriramapuram, Kothapalli, Andhra Pradesh",
    },
    {
      id: 16,
      name: "Society of Petrolium Geophysicists, Dehradun, Uttarakhand, India",
    },
    {
      id: 17,
      name: "Visakhapatnam Steel Plant, Visakhapatnam, Andhra Pradesh",
    },
    { id: 18, name: "Big Bazaar, Hyderabad, Telangana" },
    {
      id: 19,
      name: "Oil and Natural Gas Corpororation, Rajahmundry, Andhra Pradesh",
    },
    {
      id: 20,
      name: "Dredging Corporation of India Limited, Visakhapatnam, Andhra Pradesh",
    },
    {
      id: 21,
      name: "GlaxoSmithKline Customer Health Care Ltd., Rajahmundry, Andhra Pradesh",
    },
    { id: 22, name: "Laxmi Propylene Limited, Eluru, Andhra Pradesh" },
    {
      id: 23,
      name: "Ruchi Soya Industries Limited, Ampapuram, Krishna Dist, Andhra Pradesh",
    },
    {
      id: 24,
      name: "HDFC Standard Life Insurance Company Limited, Hyderabad, Telangana",
    },
    {
      id: 25,
      name: "Edlogix Software Solutions Private Limited, Hyderabad, Telangana",
    },
    {
      id: 26,
      name: "Aditya Birla Retail Limited, Rajahmundry, Andhra Pradesh",
    },
    { id: 27, name: "Metro Cash and Carry India, Mumbai, India" },
    { id: 28, name: "Heritage Foods Limited, Hyderabad, Telangana" },
    { id: 29, name: "ITC Limited, Rajahmundry, Andhra Pradesh" },
    { id: 30, name: "Sree Chandra IT Solutions, Hyderabad, Andhra Pradesh" },
    { id: 31, name: "Karvy Stock Broking Limited, Hyderabad, Andhra Pradesh" },
    {
      id: 32,
      name: "Fullerton Securities Limited, Vijayawada, Andhra Pradesh",
    },
    { id: 33, name: "Zen Money Securities Limited, Eluru, Andhra Pradesh" },
    {
      id: 34,
      name: "G.B.R.Hatcheries Private Limited, Vijayawada, Andhra Pradesh",
    },
    {
      id: 35,
      name: "ShareKhan Securities Limited, Vijayawada, Andhra Pradesh",
    },
    { id: 36, name: "Metalika Industries Limited, Hyderabad, Telangana" },
    { id: 37, name: "Jayanti Boards Limited, Tanuku, Andhra Pradesh" },
    { id: 38, name: "AGI Glasspac, Hyderabad, Telangana" },
    {
      id: 39,
      name: "KCP Sugar and Industries Corporation Limited, Lakshmipuram, Krishna Dist, Andhra Pradesh",
    },
    { id: 40, name: "Sree Akkamamba Textiles Limited, Tanuku, Andhra Pradesh" },
    {
      id: 41,
      name: "Andhra Ferro Alloys Limited, Vizianagaram, Andhra Pradesh",
    },
    { id: 42, name: "The Andhra Sugars Limited, Kovvuru, Andhra Pradesh" },
    { id: 43, name: "SKR Womens College, Rajahmundry, Andhra Pradesh" },
    {
      id: 44,
      name: "Institute of Seismological Research (ISR), Gandhinagar, Gujarat",
    },
    {
      id: 45,
      name: "Andhra Pradesh StateBiodiversity Board, Guntur, Andhra Pradesh",
    },
    { id: 46, name: "Milk Products Factory, Vijayawada, Andhra Pradesh" },
    { id: 47, name: "Sujay Biotech Pvt.Ltd., Vijayawada, Andhra Pradesh" },
    { id: 48, name: "Saveer Biotech Linmited, New Delhi, India" },
    {
      id: 49,
      name: "Horticulture College, Venkataramannagudem, West Godavari, Andhra Pradesh",
    },
    {
      id: 50,
      name: "Devi Sea Foods Limited, Singarayakonda, Prakasam, Andhra Pradesh",
    },
    {
      id: 51,
      name: "Jayalakshmi Sea Foods Pvt. Ltd, Bhimavaram, Andhra Pradesh",
    },
    {
      id: 52,
      name: "State Institute of Fisheries Technology, Kakinada, Andhra Pradesh",
    },
    { id: 53, name: "Avanti Aqua PCR Lab, Kakinada, Andhra Pradesh" },
    { id: 54, name: "Fresh Pond of Ac.3-00, Bhimavaram, Andhra Pradesh" },
    {
      id: 55,
      name: "National Institute of Fisheries Post Harvest Technology and Training",
    },
    {
      id: 56,
      name: "Vamshadhara Paper Mills Ltd., Srikakulam, Andhra Pradesh",
    },
    { id: 57, name: "Amaravati TVS, Kakinada, Andhra Pradesh" },
    {
      id: 58,
      name: "Delta Paper Mills Limited, Vendra, West Godavari, Andhra Pradesh",
    },
    { id: 59, name: "N M D C Limited, Hyderabad, Andhra Pradesh" },
    {
      id: 60,
      name: "GlaxoSmithKline Consumer Healthware Ltd., Rajahmundry, Andhra Pradesh",
    },
    {
      id: 61,
      name: "sri lalitha enterprises industries (p) Ltd. Peddapuram, Andhra Pradesh",
    },
    {
      id: 62,
      name: "Andhra Pradesh Tourism Development Corporation Limited, Visakhapatnam, Andhra Pradesh",
    },
    { id: 63, name: "Future Retail Ltd, Hyderabad, Telangana" },
    {
      id: 64,
      name: "Invest Leaf Management Solutions Private Limited, Hyderabad, Andhra Pradesh",
    },
    {
      id: 65,
      name: "K.P.R. Agrochem Limited, Balabadrapuram, East Godavari, Andhra Pradesh",
    },
    {
      id: 66,
      name: "HDFC Standard Life Insurance Company Limited, Hyderabad, Telangana",
    },
    { id: 67, name: "S R Vessels Private Limited, Kakinada, Andhra Pradesh" },
    { id: 68, name: "IIFL India Infoline Ltd, Hyderabad, Andhra Pradesh" },
    { id: 69, name: "Zuari Cement Limited, Rajahmundry, Andhra Pradesh" },
    {
      id: 70,
      name: "Rashtriya Ispat Nigam Limited, Visakhapatnam, Andhra Pradesh",
    },
    { id: 71, name: "NGRI, Hyderabad, Telangana" },
    {
      id: 72,
      name: "Sudha Agro Oil and Chemical Industries Limited, Samalkot, Andhra Pradesh",
    },
    {
      id: 73,
      name: "Andhra Pradesh Government Soil Testing Laboratory, Samalkot, Andhra Pradesh",
    },
    { id: 74, name: "Nava Bharat Ventures Limited, Samalkot, Andhra Pradesh" },
    {
      id: 75,
      name: "CSIR-National Geophysical Research Institute, Hyderabad, Andhra Pradesh",
    },
    {
      id: 76,
      name: "Institute of Seismological Research, Gandinagar, Gujarat, India",
    },
    {
      id: 77,
      name: "Veterinary Dispensary, Relangi, West Godavari, Andhra Pradesh",
    },
    {
      id: 78,
      name: "AR Raju and Bros, ARTOS, Ramachandrapuram, Andhra Pradesh",
    },
    {
      id: 79,
      name: "Makore Laboratories Private Limited, Hyderabad, Telangana",
    },
    {
      id: 80,
      name: "Staff Training Institute, ONGC, Rajahmundry, Andhra Pradesh",
    },
    {
      id: 81,
      name: "UGC-Networking Resource Centre, UOH, Hyderabad, Telangana",
    },
    { id: 82, name: "Hetero Drugs Limited, Hyderabad, Telangana" },
    {
      id: 83,
      name: "Ramky Pharma City (India) Limited, Visakhapatnam, Andhra Pradesh",
    },
    { id: 84, name: "Granules and OmniChem, Visakhapatnam, Andhra Pradesh" },
    { id: 85, name: "MICGENE Lab, Visakhapatnam, Andhra Pradesh" },
    { id: 86, name: "MS Projects, Rajamahendravaram, Andhra Pradesh" },
    { id: 87, name: "Ranga Raya Medical College, Kakinada, Andhra Pradesh" },
    { id: 88, name: "ATP Sciences, Visakhapatnam, Andhra Pradesh" },
    {
      id: 89,
      name: "Andhra Pradesh State Ground Water and Water Audit Department, Dowlaiswaram, Andhra Pradesh",
    },
    {
      id: 90,
      name: "Andhra Pradesh Space Applications Centre, Vijayawada, Andhra Pradesh",
    },
    { id: 91, name: "CSIR - National Institute of Oceanography, Goa, India" },
    {
      id: 92,
      name: "National Geophysical Research Institute, Hyderabad, Andhra Pradesh",
    },
    {
      id: 93,
      name: "Centre for Cellular and Molecular Biology (CCMB), Hyderabad, Telangana",
    },
    {
      id: 94,
      name: "Ramakrishna Raju Poultry Farm, Chinnapulleru, West Godavari, Andhra Pradesh",
    },
    {
      id: 95,
      name: "SVR Hatcheries, Addaripeta, East Godavari, Andhra Pradesh",
    },
    { id: 96, name: "Himalaya Aqua Lab, Gollaprollu, Andhra Pradesh" },
    { id: 97, name: "District Hospital, Eluru Laboratory, Andhra Pradesh" },
    {
      id: 98,
      name: "Bhavya Sri Aqua Lab, Bhuvanapalli, West Godavari, Andhra Pradesh",
    },
    { id: 99, name: "3F Industries Limited, Tadepalligudem, Andhra Pradesh" },
    { id: 100, name: "Soil Testing Laboratory, Samalkot, Andhra Pradesh" },
    { id: 101, name: "Krify Software Technologies, Kakinada, Andhra Pradesh" },
    {
      id: 102,
      name: "Pangean Global Services Pvt. Ltd., Hyderabad, Andhra Pradesh",
    },
    {
      id: 103,
      name: "Imaginarsy Illusions Pvt.Ltd., Visakhapatnam, Andhra Pradesh",
    },
    { id: 104, name: "nFolks data Solutions, Hyderabad, Andhra Pradesh" },
    {
      id: 105,
      name: "Airports Authority of India, Rajahmundry, Andhra Pradesh",
    },
    { id: 106, name: "India Infoline Limited, Hyderabad, Telangana" },
    {
      id: 107,
      name: "Sree Ramachandra Paper Boards Private Limited, Yeditha, Esat Godavari, Andhra Pradesh",
    },
    {
      id: 108,
      name: "Phoenix Motors (M/C) Pvt. Limited, Hyderabad, Telangana",
    },
    { id: 109, name: "Jollyday Tours, Rajahmundry, Andhra Pradesh" },
    {
      id: 110,
      name: "Shelton Hospitality (P) Limited, Rajjahmundry, Andhra Pradesh",
    },
    {
      id: 111,
      name: "Sri Kalahasthi Pipes Limited, Srikalahasthi, Andhra Pradesh",
    },
    { id: 112, name: "Arka Holidays, Rajahmundry, Andhra Pradesh" },
    {
      id: 113,
      name: "KEI - Rajamahendri Resorts Pvt. Ltd., Rajahmundry, Andhra Pradesh",
    },
    { id: 114, name: "Avanti Feeds Limited, Kovvuru, Andhra Pradesh" },
    { id: 115, name: "Saradhi Hospitals, Rajahumndry, Andhra Pradesh" },
    {
      id: 116,
      name: "Shipmile (Swift Analytic Solutions Pvt. Ltd.), Hyderabad, Telangana",
    },
    {
      id: 117,
      name: "ONGC (Oil & Natural Gas Corporation Limited), Rajahmundry, Andhra Pradesh",
    },
    { id: 118, name: "Tata Motors Limited, Hyderabad, Andhra Pradesh" },
    {
      id: 119,
      name: "The Chodavaram Co-Operative Sugars Limited, Govada, Andhra Pradesh",
    },
    {
      id: 120,
      name: "Hero Motocorp Limited (Reddy Babu Hero), Rajahmundry, Andhra Pradesh",
    },
    {
      id: 121,
      name: "Sri Venkata Rama Oil Industries Pvt. Ltd., Samalkot, Andhra Pradesh",
    },
    { id: 122, name: "Delta Sugars Limited, Vijayawada, Andhra Pradesh" },
    { id: 123, name: "Agarwal Industries Pvt. Ltd., Kakinada, Andhra Pradesh" },
    {
      id: 124,
      name: "The Aryapuram Co-Operative Urban Bank Ltd., Rajahmundry, Andhra Pradesh",
    },
    {
      id: 125,
      name: "Andhra Bank, Adikavi Nannaya University Campus Branch, Rajahmundry, Andhra Pradesh",
    },
    {
      id: 126,
      name: "The JAMPETA co-operative urban bank LTD., Rajahmundry, Andhra Pradesh",
    },
    { id: 127, name: "APSGW & WAD, Dowleswaram, Andhra Pradesh" },
    {
      id: 128,
      name: "AP Space Application Center, Vijayawada, Andhra Pradesh",
    },
    {
      id: 129,
      name: "Central Mine Planning and Design Institute Limited, Ranchi, India",
    },
    { id: 130, name: "Kuvempu University, Shimoga, Karnataka" },
    {
      id: 131,
      name: "Sri Ramalingeswara Paper Products Limited, Dwarapudi, Andhra Pradesh",
    },
    { id: 132, name: "BHEL, Hyderabad, Telangana" },
    { id: 133, name: "Sri Krishna Jute Mills, Eluru, Andhra Pradesh" },
    { id: 134, name: "Angel Broking Limited, Hyderabad, Telangana" },
    {
      id: 135,
      name: "Hindustan Petroleum Corporation Limited, Visakhapatnam, Andhra Pradesh",
    },
    { id: 136, name: "Asian Paints Limited, Hyderabad, Telangana" },
    { id: 137, name: "Aparna Enterprises Limited, Hyderabad, Telangana" },
    { id: 138, name: "Hyderabad Batteries Limited, Hyderabad, Telangana" },
    {
      id: 139,
      name: "Sri Luxmi Tulasi Agro Paper Limited, AswaraoPeta, Telangana",
    },
    { id: 140, name: "Elite Honda, Rajahmundry, Andhra Pradesh" },
    { id: 141, name: "Avanti Feeds Ltd, Kovuru, Andhra Pradesh" },
    { id: 142, name: "Balaji Equities Limited, Vijayawada, Andhra Pradesh" },
    { id: 143, name: "Ravali Spinners Pvt. Ltd., Tanuku, Andhra Pradesh" },
    { id: 144, name: "Coast To Coast Holidays, Rajahmundry, Andhra Pradesh" },
    { id: 145, name: "Thomas Cook, Hyderabad, Telangana" },
    { id: 146, name: "DOTT Holidays Pvt. Ltd., Rajahmundry, Andhra Pradesh" },
    {
      id: 147,
      name: "Punnami Tourism and Travels, Rajahmundry, Andhra Pradesh",
    },
    { id: 148, name: "State Bank of India, Rajahmundry, Andhra Pradesh" },
    { id: 149, name: "Status Walas, Rajahmundry, Andhra Pradesh" },
    { id: 150, name: "CP Reddy Automobiles, Rajahmundry, Andhra Pradesh" },
    {
      id: 151,
      name: "Landmark Group, MAX Retail Division, Rajahmundry, Andhra Pradesh",
    },
    { id: 152, name: "Hindustan Unilever Ltd., Dowalaiswaram, Andhra Pradesh" },
    {
      id: 153,
      name: "Pavitra Motors, Koyyalagudem, West Godavari, Andhra Pradesh",
    },
    { id: 154, name: "Andhra paper Ltd, Rajahmundry, Andhra Pradesh" },
    { id: 155, name: "HDFC Ergo Health, Rajahmundry, Andhra Pradesh" },
    { id: 156, name: "GAIL (India) Limited, Rajahmundry, Andhra Pradesh" },
    { id: 157, name: "Sri Satyadeva Nursery, Kadiyam, Andhra Pradesh" },
    { id: 158, name: "Azure Skynet, Hyderabad, Telangana" },
    {
      id: 159,
      name: "ICAR-Central Tobacco Research Institute, Rajahmundry, Andhra Pradesh",
    },
    {
      id: 160,
      name: "AP State Skill Corporation Development Corporation, Vijayawada, Andhra Pradesh",
    },
    { id: 161, name: "Techern, Rajahmundry, Andhra Pradesh" },
    {
      id: 162,
      name: "Department of Fisheries, Govt. of Andhra Pradesh, Kakinada, Andhra Pradesh",
    },
    {
      id: 163,
      name: "ICAR-Central Institute of Fisheries Education, Mumbai Maharashtra",
    },
    {
      id: 164,
      name: "Arun Jaitley National Institute of Financial Management, Faridabad, Haryana",
    },
    { id: 165, name: "Govt. College (A), Rajahmundry, Andhra Pradesh" },
    {
      id: 166,
      name: "Institute of Seismological Research, Gandhinagar, Gujarat",
    },
    { id: 167, name: "AP Forest Department, Rajahmundry, Andhra Pradesh" },
    {
      id: 168,
      name: "Council Of Scientific And Industrial Research (CSIR), New Delhi, Delhi",
    },
    {
      id: 169,
      name: "Apex Biotechnology Training and Research Institute , Chennai, Tamilnadu",
    },
  ];

  return (
    <div className="px-4 sm:px-16 py-8">
      <BackButton />
      <h1 className="text-3xl font-bold mb-6 text-teal-800">
        Collaborations
      </h1>

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full text-left border border-[#ccc]">
          <thead className="bg-teal-700 text-white">
            <tr>
              <th className="px-4 py-2">S.No</th>
              <th className="px-4 py-2">Name of the Collaborating Agency</th>
            </tr>
          </thead>
          <tbody>
            {collaborations.map(({ id, name }) => (
              <tr key={id} className="border-t border-[#ccc]">
                <td className="px-4 py-2">{id}</td>
                <td className="px-4 py-2">{name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Collaborations;
