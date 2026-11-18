import React, { useState } from "react";
import { ArrowUpRight, Check, ChevronRight } from "lucide-react";
import { sportsGallary } from "../../siteData/sports";
import { BackButton } from "../../components/BackButton";
import { vswamy23 } from "../../assets";
import {
  // 2024-2025 Activities
  sports2024_25_AGBMeeting,
  sports2024_25_Circular1,
  sports2024_25_IntercollegiateColleges,
  sports2024_25_Circular2,
  sports2024_25_YogasanaSyllabus,
  sports2024_25_StudentParticulars,
  sports2024_25_Circular3,
  sports2024_25_Circular4,
  sports2024_25_YogaPostponed,
  sports2024_25_Circular5,
  sports2024_25_Circular6,
  sports2024_25_Circular7,
  sports2024_25_Circular8,
  sports2024_25_Circular9,
  sports2024_25_Circular10,
  sports2024_25_Circular11,
  // 2023-2024 Activities
  sports2023_24_Circular8,
  sports2023_24_SoftballPostponed,
  sports2023_24_Circular1,
  sports2023_24_Circular2,
  sports2023_24_Circular3,
  sports2023_24_Circular4,
  sports2023_24_Circular5,
  sports2023_24_Circular6,
  sports2023_24_Circular7,
  sports2023_24_Circular9_1,
  sports2023_24_TennisPreponed,
  sports2023_24_Circular10,
  sports2023_24_Circular11,
  sports2023_24_Circular12,
  sports2023_24_Circular13,
  sports2023_24_Circular14,
  sports2023_24_Circular15,
  sports2023_24_PowerliftingPostponed,
  sports2023_24_KheloIndiaWeightLifting,
  sports2023_24_HandballMen,
  sports2023_24_KickBoxingBronze,
  sports2023_24_Appreciation1,
  sports2023_24_Appreciation2,
  sports2023_24_Appreciation3,
  sports2023_24_WomensSelectedList,
  sports2023_24_MensSelectedList,
  sports2023_24_ShootingPreponed,
  // 2022-2023 Activities
  sports2022_23_Circular5,
  sports2022_23_Circular6,
  sports2022_23_Circular7,
  sports2022_23_Circular8,
  sports2022_23_Circular9,
  sports2022_23_Aquatics,
  sports2022_23_Archery,
  sports2022_23_AthleticsWomen,
  sports2022_23_BallBadmintonMen,
  sports2022_23_BasketballMen,
  sports2022_23_BasketballWomen,
  sports2022_23_CrossCountry,
  sports2022_23_HandballMen,
  sports2022_23_HandballWomen,
  sports2022_23_KabaddiWomen,
  sports2022_23_Karate,
  sports2022_23_KhoKhoMen,
  sports2022_23_KhoKhoWomen,
  sports2022_23_VolleyballMen,
  sports2022_23_WeightLiftingWomen,
  sports2022_23_WrestlingFreeStyle,
  sports2022_23_WrestlingGrecoRoman,
  sports2022_23_Yoga,
  sports2022_23_CricketMenSelection,
  sports2022_23_CricketMenSelected,
  sports2022_23_CricketWomenSelected,
  sports2022_23_Circular1,
  sports2022_23_36thNationalGames,
  sports2022_23_BadmintonMen,
  sports2022_23_Circular2,
  sports2022_23_Circular3,
  sports2022_23_Circular4,
  sports2022_23_Circular5_12Dec,
  sports2022_23_Circular6_15Dec,
  sports2022_23_Circular7_28Dec,
  // 2021-2022 Activities
  sports2021_22_AGBMeeting,
  sports2021_22_StudentParticulars,
  sports2021_22_Circular1,
  sports2021_22_YogaSyllabus,
  sports2021_22_Circular2,
  sports2021_22_Circular3,
  sports2021_22_ParentUndertaking,
  sports2021_22_BadmintonMenSelected,
  sports2021_22_VolleyballWomen,
  sports2021_22_BadmintonWomen,
  sports2021_22_Circular4,
  sports2021_22_TableTennisMen,
  sports2021_22_AthleticsMen,
  sports2021_22_FootballMen,
  // 2020-2021 Activities
  sports2020_21_Circular8,
  sports2020_21_Circular9,
  // 2019-2020 Activities
  sports2019_20_Circular17,
  sports2019_20_Circular17CricketWomen,
  sports2019_20_Circular18,
  sports2019_20_Circular08July19,
  sports2019_20_BoardResolutions,
  sports2019_20_StudentParticulars,
  sports2019_20_Circular1,
  sports2019_20_Circular2,
  sports2019_20_AthleticsProforma,
  sports2019_20_KhoKhoWomenRevised,
  sports2019_20_Circular4,
  sports2019_20_Circular4Revised,
  sports2019_20_Circular5,
  sports2019_20_RopeSkipping,
  sports2019_20_Circular6,
  sports2019_20_JudoMenRevised,
  sports2019_20_Circular7,
  sports2019_20_YogaSyllabus,
  sports2019_20_BasketballMenRevised,
  sports2019_20_HandballMenRevised,
  sports2019_20_SepakTakrawRevised,
  // 2018-2019 Activities
  sports2018_19_Circular1,
  sports2018_19_EligibilityProforma,
  sports2018_19_Circular2,
  sports2018_19_Circular3,
  sports2018_19_VolleyballMen,
  sports2018_19_VolleyballWomenPreponed,
  sports2018_19_CricketMenPostponed,
  sports2018_19_Circular7,
  sports2018_19_CrossCountrySelected,
  sports2018_19_KhoKhoWSelected,
  sports2018_19_ChessPostponed,
  sports2018_19_Circular9,
  sports2018_19_Circular10,
  sports2018_19_Circular11,
  sports2018_19_GymnasticsPreponed,
  sports2018_19_AthleticsPostponed,
  sports2018_19_InterCollegiateTournaments1,
  sports2018_19_InterCollegiateTournaments,
  sports2018_19_SelectedPlayersList,
  sports2018_19_BallBadmintonPreponed,
  sports2018_19_Circular15,
  sports2018_19_Circular16,
  sports2018_19_WGDistrictJnanabheri,
  sports2018_19_BallBadminton3rdPlace,
} from "../../assets";

const SportsMenu = () => {
  const [activeSection, setActiveSection] = useState("About");
  const [showAll, setShowAll] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);

  // Sports data
  const sportsData = {
    activities: [
      {
        year: "2024-25",
        items: [
          {
            label: "27-03-2025 ANUR-SPORTS BOARD - Circular- 11",
            href: sports2024_25_Circular11,
          },
          {
            label: "03-01-2025 ANUR-SPORTS BOARD - Circular- 10",
            href: sports2024_25_Circular10,
          },
          {
            label: "11-12-2024 ANUR-SPORTS BOARD - Circular- 9",
            href: sports2024_25_Circular9,
          },
          {
            label: "06-12-2024 ANUR-SPORTS BOARD - Circular- 8",
            href: sports2024_25_Circular8,
          },
          {
            label: "29-11-2024 ANUR-SPORTS BOARD - Circular- 7",
            href: sports2024_25_Circular7,
          },
          {
            label: "20-11-2024 ANUR-SPORTS BOARD - Circular- 6",
            href: sports2024_25_Circular6,
          },
          {
            label: "20-11-2024 ANUR-SPORTS BOARD - Circular- 5",
            href: sports2024_25_Circular5,
          },
          {
            label:
              "18-11-2024 ANUR-SPORTS BOARD - Intercollegiate Yoga (Men & Women) Postponed",
            href: sports2024_25_YogaPostponed,
          },
          {
            label: "05-11-2024 ANUR-SPORTS BOARD - Circular- 4",
            href: sports2024_25_Circular4,
          },
          {
            label: "24-10-2024 ANUR-SPORTS BOARD - Circular- 3",
            href: sports2024_25_Circular3,
          },
          {
            label: "19-10-2024 ANUR-SPORTS BOARD - Student Eligibility",
            href: sports2024_25_StudentParticulars,
          },
          {
            label:
              "19-10-2024 ANUR-SPORTS BOARD - Syllabus, Rules & Regulations for All India Inter University Yogasana (M & W) Championship.",
            href: sports2024_25_YogasanaSyllabus,
          },
          {
            label: "19-10-2024 ANUR-SPORTS BOARD - Circular- 2",
            href: sports2024_25_Circular2,
          },
          {
            label:
              "18-10-2024 ANUR-SPORTS BOARD - Intercollegiate Tournaments and University Team Selections - Hosting Colleges",
            href: sports2024_25_IntercollegiateColleges,
          },
          { label: "15-10-2024 ANUR-SPORTS BOARD - Yearly Report", href: "#" },
          {
            label: "07-10-2024 ANUR-SPORTS BOARD - Circular- 1",
            href: sports2024_25_Circular1,
          },
          {
            label:
              "23-09-2024 ANUR-SPORTS BOARD - Circular- General Body meeting of Sports Board of Adikavi Nannaya University",
            href: sports2024_25_AGBMeeting,
          },
        ],
      },
      {
        year: "2023-24",
        items: [
          {
            label: "03-04-2024 ANUR-SPORTS BOARD - Men's Selected Players list",
            href: sports2023_24_MensSelectedList,
          },
          {
            label:
              "03-04-2024 ANUR-SPORTS BOARD - Women's Selected Players list",
            href: sports2023_24_WomensSelectedList,
          },
          {
            label:
              "01-04-2024 ANUR-SPORTS BOARD -All India Best Physique Appreciation",
            href: sports2023_24_Appreciation1,
          },
          {
            label:
              "01-04-2024 ANUR-SPORTS BOARD -All India Weight Lifting (Men) Appreciation",
            href: sports2023_24_Appreciation2,
          },
          {
            label:
              "01-04-2024 ANUR-SPORTS BOARD -All India Weight Lifting (Women) Appreciation",
            href: sports2023_24_Appreciation3,
          },
          {
            label:
              "15-03-2024 ANUR-SPORTS BOARD -Kick Boxing Bronze Medalist Appreciation",
            href: sports2023_24_KickBoxingBronze,
          },
          {
            label: "01-03-2024 ANUR-SPORTS BOARD -SPORTS CIRCULAR -16",
            href: sports2023_24_Circular15,
          },
          {
            label:
              "10-02-2024 ANUR-SPORTS BOARD - Khelo India Weight Lifting Selected Players list",
            href: sports2023_24_KheloIndiaWeightLifting,
          },
          {
            label:
              "30-01-2024 ANUR-SPORTS BOARD - SPORTS CIRCULAR -14 (Powerlifting event postponed)",
            href: sports2023_24_PowerliftingPostponed,
          },
          {
            label: "10-01-2024 ANUR-SPORTS BOARD - SPORTS CIRCULAR -15",
            href: sports2023_24_Circular15,
          },
          {
            label: "04-01-2024 ANUR-SPORTS BOARD - SPORTS CIRCULAR -14",
            href: sports2023_24_Circular14,
          },
          {
            label: "29-12-2023 ANUR-SPORTS BOARD - SPORTS CIRCULAR -13",
            href: sports2023_24_Circular13,
          },
          {
            label: "26-12-2023 ANUR-SPORTS BOARD - SPORTS CIRCULAR -12",
            href: sports2023_24_Circular12,
          },
          {
            label: "20-12-2023 ANUR-SPORTS BOARD - SPORTS CIRCULAR -11",
            href: sports2023_24_Circular11,
          },
          {
            label: "19-12-2023 ANUR-SPORTS BOARD - SPORTS CIRCULAR -10",
            href: sports2023_24_Circular10,
          },
          {
            label: "14-12-2023 Tennis Men's Selections Prephoned circular",
            href: sports2023_24_TennisPreponed,
          },
          {
            label: "14-12-2023 ANUR-SPORTS BOARD - SPORTS CIRCULAR -9-1",
            href: sports2023_24_Circular9_1,
          },
          {
            label: "01-12-2023 ANUR-SPORTS BOARD - SPORTS CIRCULAR -7",
            href: sports2023_24_Circular7,
          },
          {
            label: "18-11-2023 ANUR-SPORTS BOARD - SPORTS CIRCULAR -6",
            href: sports2023_24_Circular6,
          },
          {
            label: "15-11-2023 ANUR-SPORTS BOARD - SPORTS CIRCULAR -5",
            href: sports2023_24_Circular5,
          },
          {
            label: "07-11-2023 ANUR-SPORTS BOARD - SPORTS CIRCULAR -4",
            href: sports2023_24_Circular4,
          },
          {
            label: "31-10-2023 ANUR-SPORTS BOARD - SPORTS CIRCULAR -3",
            href: sports2023_24_Circular3,
          },
          {
            label: "31-10-2023 ANUR-SPORTS BOARD - SPORTS CIRCULAR -2",
            href: sports2023_24_Circular2,
          },
          {
            label: "11-10-2023 ANUR-SPORTS BOARD - SPORTS CIRCULAR -1",
            href: sports2023_24_Circular1,
          },
          {
            label: "28-03-2023 ANUR-SPORTS BOARD - Men's Selected Players List",
            href: sports2023_24_MensSelectedList,
          },
          {
            label:
              "28-03-2023 ANUR-SPORTS BOARD - Women's Selected Players List",
            href: sports2023_24_WomensSelectedList,
          },
          {
            label: "31-01-2023 Softball Men Postponed Schedule",
            href: sports2023_24_SoftballPostponed,
          },
          {
            label: "12-01-2023 Preponed Shooting (Men & Women) 23rd Jan 2023",
            href: sports2023_24_ShootingPreponed,
          },
          {
            label: "03-01-2023 ANUR-SPORTS BOARD - SPORTS CIRCULAR -8",
            href: sports2023_24_Circular8,
          },
        ],
      },
      {
        year: "2022-23",
        items: [
          {
            label: "28-12-2022 ANUR-SPORTS BOARD - SPORTS CIRCULAR -7",
            href: sports2022_23_Circular7_28Dec,
          },
          {
            label: "15-12-2022 ANUR-SPORTS BOARD - SPORTS CIRCULAR -6",
            href: sports2022_23_Circular6_15Dec,
          },
          {
            label: "12-12-2022 ANUR-SPORTS BOARD - SPORTS CIRCULAR -5",
            href: sports2022_23_Circular5_12Dec,
          },
          {
            label: "07-12-2022 ANUR-SPORTS BOARD - SPORTS CIRCULAR -4",
            href: sports2022_23_Circular4,
          },
          {
            label: "02-12-2022 ANUR-SPORTS BOARD - SPORTS CIRCULAR -3",
            href: sports2022_23_Circular3,
          },
          {
            label: "28-11-2022 ANUR-SPORTS BOARD - SPORTS CIRCULAR -2",
            href: sports2022_23_Circular2,
          },
          {
            label: "21-11-2022 ANUR-SPORTS BOARD - SPORTS CIRCULAR -1",
            href: sports2022_23_Circular1,
          },
          {
            label:
              "11-10-2022 36th National Games Gujarath 2022 Gymnastics (Women) Appriciation",
            href: sports2022_23_36thNationalGames,
          },
          {
            label:
              "15-07-2022 ANUR- Sports Board - Proceedings - Academic year 2021-2022 - Incentives given to Medal winners in the All India Competitions / Tournaments",
            href: "#",
          },
          {
            label: "15-06-2022 Cricket Women Selected Players List",
            href: sports2022_23_CricketWomenSelected,
          },
          {
            label: "15-06-2022 Cricket Men Selected Players List",
            href: sports2022_23_CricketMenSelected,
          },
          {
            label: "27-05-2022 Cricket Men University Team Selections 2021-22",
            href: sports2022_23_CricketMenSelection,
          },
          {
            label: "16-03-2022 Selected Players List - Yoga (Men & Women)",
            href: sports2022_23_Yoga,
          },
          {
            label:
              "16-03-2022 Selected Players List - Wrestling Greco Roman (Men)",
            href: sports2022_23_WrestlingGrecoRoman,
          },
          {
            label:
              "16-03-2022 Selected Players List - Wrestling Free Style (Men)",
            href: sports2022_23_WrestlingFreeStyle,
          },
          {
            label: "16-03-2022 Selected Players List - Weight Lifting ( Women)",
            href: sports2022_23_WeightLiftingWomen,
          },
          {
            label:
              "16-03-2022 Selected Players List - Weight Lifting & Best Physique ( Men)",
            href: "#",
          },
          {
            label: "16-03-2022 Selected Players List - Volleyball (Men)",
            href: sports2022_23_VolleyballMen,
          },
          {
            label: "16-03-2022 Selected Players List - Kho-Kho (Women)",
            href: sports2022_23_KhoKhoWomen,
          },
          {
            label: "16-03-2022 Selected Players List - Kho-Kho (Men)",
            href: sports2022_23_KhoKhoMen,
          },
          {
            label: "16-03-2022 Selected Players List - Karate (Men & Women)",
            href: sports2022_23_Karate,
          },
          {
            label: "16-03-2022 Selected Players List - Kabaddi (Women)",
            href: sports2022_23_KabaddiWomen,
          },
          {
            label: "16-03-2022 Selected Players List - Kabaddi (Men)",
            href: "#",
          },
          {
            label: "16-03-2022 Selected Players List - Handball (Women)",
            href: sports2022_23_HandballWomen,
          },
          {
            label: "16-03-2022 Selected Players List - Handball (Men)",
            href: sports2022_23_HandballMen,
          },
          {
            label:
              "16-03-2022 Selected Players List - Cross Country (Men & Women)",
            href: sports2022_23_CrossCountry,
          },
          {
            label: "16-03-2022 Selected Players List - Basketball (Women)",
            href: sports2022_23_BasketballWomen,
          },
          {
            label: "16-03-2022 Selected Players List - Basketball (Men)",
            href: sports2022_23_BasketballMen,
          },
          {
            label: "16-03-2022 Selected Players List - Ball Badminton (Men)",
            href: sports2022_23_BallBadmintonMen,
          },
          {
            label: "16-03-2022 Selected Players List - Athletics (Women)",
            href: sports2022_23_AthleticsWomen,
          },
          {
            label: "16-03-2022 Selected Players List - Archery (Men & Women)",
            href: sports2022_23_Archery,
          },
          {
            label: "16-03-2022 Selected Players List - Aquatics (Men & Women)",
            href: sports2022_23_Aquatics,
          },
          {
            label: "09-03-2022 Sports Circular - 9",
            href: sports2022_23_Circular9,
          },
          {
            label: "26-02-2022 Sports Circular - 8",
            href: sports2022_23_Circular8,
          },
          {
            label: "22-02-2022 Sports Circular - 7",
            href: sports2022_23_Circular7,
          },
          {
            label: "19-02-2022 Sports Circular - 6",
            href: sports2022_23_Circular6,
          },
          {
            label: "03-01-2022 Sports Circular - 5",
            href: sports2022_23_Circular5,
          },
        ],
      },
      {
        year: "2021-22",
        items: [
          {
            label: "31-12-2021 Sports - Selected Players List(Football (Men))",
            href: sports2021_22_FootballMen,
          },
          {
            label: "31-12-2021 Sports - Selected Players List(Athletics (Men)",
            href: sports2021_22_AthleticsMen,
          },
          {
            label:
              "31-12-2021 Sports - Selected Players List(Table Tennis (Men)",
            href: sports2021_22_TableTennisMen,
          },
          {
            label: "20-12-2021 Sports Circular - 4",
            href: sports2021_22_Circular4,
          },
          {
            label: "13-12-2021 Sports - Selected Players List(Badminton(Women)",
            href: sports2021_22_BadmintonWomen,
          },
          {
            label:
              "13-12-2021 Sports - Selected Players List(Volleyball(Women)",
            href: sports2021_22_VolleyballWomen,
          },
          {
            label: "10-12-2021 Sports - Selected Players List(Badminton(Men)",
            href: sports2021_22_BadmintonMenSelected,
          },
          {
            label: "09-12-2021 Parent Undertaking Letter",
            href: sports2021_22_ParentUndertaking,
          },
          {
            label: "09-12-2021 Sports Circular - 3",
            href: sports2021_22_Circular3,
          },
          {
            label: "03-12-2021 Sports Circular - 2",
            href: sports2021_22_Circular2,
          },
          {
            label:
              "03-12-2021 Syllabus Rules and Regulations for All India Inter University Championship in yoga-22Nov19",
            href: sports2021_22_YogaSyllabus,
          },
          {
            label: "03-12-2021 Sports Circular - 1",
            href: sports2021_22_Circular1,
          },
          { label: "03-12-2021 Inter Collegiate Eligibility Form", href: "#" },
          {
            label: "03-12-2021 Student Particulars",
            href: sports2021_22_StudentParticulars,
          },
          {
            label:
              "26-11-2021 ANUR Sports Board Annual General Body Meeting to be held on 1st Dec 2021",
            href: sports2021_22_AGBMeeting,
          },
        ],
      },
      {
        year: "2020-21",
        items: [
          {
            label:
              "22-01-2020 Sports Circular -9 Inter Collegiate Cricket(Men) Tournament",
            href: sports2020_21_Circular9,
          },
          {
            label:
              "22-01-2020 Sports Circular -8 Inter Collegiate cum University Baseball(Men) Taekwondo(Women) Team Selections",
            href: sports2020_21_Circular8,
          },
        ],
      },
      {
        year: "2019-20",
        items: [
          {
            label:
              "04-12-2019 Sports Circular - Revised Schedule for Sepak Takraw (Men and Women)",
            href: sports2019_20_SepakTakrawRevised,
          },
          {
            label:
              "25-11-2019 Sports Circular - Revised Schedule for Handball(Men)",
            href: sports2019_20_HandballMenRevised,
          },
          {
            label:
              "25-11-2019 Sports Circular - Revised Schedule for Basketball(Men)",
            href: sports2019_20_BasketballMenRevised,
          },
          {
            label:
              "22-11-2019 Syllabus Rules and Regulations for All India Inter University Championship in yoga",
            href: sports2019_20_YogaSyllabus,
          },
          {
            label:
              "21-11-2019 Sports Circular -7 Inter Collegiate Tournament - 2019- 20",
            href: sports2019_20_Circular7,
          },
          {
            label:
              "21-11-2019 Sports Circular - Revised Schedule for Judo(Men)",
            href: sports2019_20_JudoMenRevised,
          },
          {
            label:
              "14-11-2019 Sports Circular -6 Inter Collegiate Tournament - 2019- 20",
            href: sports2019_20_Circular6,
          },
          {
            label:
              "30-10-2019 All India Inter University Rope Skipping Tournament(Men & Women) - 2019-20",
            href: sports2019_20_RopeSkipping,
          },
          {
            label:
              "30-10-2019 Sports Circular -5 Inter Collegiate Tournament - 2019- 20",
            href: sports2019_20_Circular5,
          },
          {
            label:
              "30-10-2019 Revised Sports Circular -4 Inter Collegiate Tournament - 2019- 20",
            href: sports2019_20_Circular4Revised,
          },
          {
            label:
              "21-10-2019 Sports Circular -4 Inter Collegiate Tournament - 2019- 20",
            href: sports2019_20_Circular4,
          },
          {
            label:
              "25-09-2019 Sports Circular - Revised Schedule for Kho - Kho (Women)",
            href: sports2019_20_KhoKhoWomenRevised,
          },
          {
            label: "18-09-2019 Athletics(Men & Women) Detailed Entry Proforma",
            href: sports2019_20_AthleticsProforma,
          },
          {
            label:
              "18-09-2019 Sports Circular -3 Inter Collegiate Tournament - 2019- 20",
            href: "#",
          },
          {
            label:
              "16-09-2019 Sports Circular -2 Inter Collegiate Tournament - 2019- 20",
            href: sports2019_20_Circular2,
          },
          {
            label:
              "09-09-2019 Sports Circular -1 Inter Collegiate Tournament - 2019- 20",
            href: sports2019_20_Circular1,
          },
          {
            label: "09-09-2019 Student Particulars",
            href: sports2019_20_StudentParticulars,
          },
          { label: "09-09-2019 Eligibility Proforma", href: "#" },
          {
            label: "09-09-2019 Sports Board Resolutions",
            href: sports2019_20_BoardResolutions,
          },
          {
            label:
              "08-07-2019 Sports - Annual General Body Meeting scheduled to be held on 16-07-2019",
            href: sports2019_20_Circular08July19,
          },
          {
            label:
              "08-02-2019 Sports Circular -18 Inter Collegiate Tournament - 2018- 19",
            href: sports2019_20_Circular18,
          },
          {
            label:
              "21-01-2019 Sports Circular - Cricket(women) Postponed to 29th & 30th January-2019",
            href: sports2019_20_Circular17CricketWomen,
          },
          {
            label:
              "11-01-2019 Sports Circular -17 Inter Collegiate Tournament - 2018- 19",
            href: sports2019_20_Circular17,
          },
        ],
      },
      {
        year: "2018-19",
        items: [
          {
            label:
              "18-12-2018 Ball badminton(Men) Team Wining 3rd Place in All India Inter University Championship at SRM University",
            href: sports2018_19_BallBadminton3rdPlace,
          },
          {
            label:
              "06-12-2018 Sports Circular - West Godavari District Jnanabheri Inter Collegiate Tournaments - 2018",
            href: sports2018_19_WGDistrictJnanabheri,
          },
          {
            label:
              "06-12-2018 Sports Circular -16 Inter Collegiate Tournament - 2018- 19",
            href: sports2018_19_Circular16,
          },
          {
            label:
              "29-11-2018 Sports Circular -15 Inter Collegiate Tournament - 2018- 19",
            href: sports2018_19_Circular15,
          },
          {
            label:
              "17-11-2018 Sports Circular -14 Inter Collegiate Tournament - 2018- 19",
            href: "#",
          },
          {
            label:
              "17-11-2018 Ball Badminton (Men) Preponed to 22nd and 23rd November-2018",
            href: sports2018_19_BallBadmintonPreponed,
          },
          {
            label:
              "15-11-2018 Sports - Selected Players List (Athletic(Men & Women), Badminton(Men), Basketball(Men), Weightlifting & Bestphysique(Men), Hockey (Men), Volleyball(Men))",
            href: sports2018_19_SelectedPlayersList,
          },
          {
            label:
              "09-11-2018 Sports Circular-13 - Inter Collegiate cum University team Selections 2018-19",
            href: "#",
          },
          {
            label:
              "31-10-2018 Athletics (Men & Women) Postponed to 5th & 6th November-2018",
            href: sports2018_19_AthleticsPostponed,
          },
          {
            label:
              "31-10-2018 Gymnastics (Men & Women) Preponed to 3rd November-2018",
            href: sports2018_19_GymnasticsPreponed,
          },
          {
            label:
              "22-10-2018 Sports Circular-11 - Inter Collegiate cum University team Selections 2018-19",
            href: sports2018_19_Circular11,
          },
          {
            label:
              "20-10-2018 Sports Circular-10 - Inter Collegiate cum University team Selections 2018-19",
            href: sports2018_19_Circular10,
          },
          {
            label:
              "06-10-2018 Sports Circular-9 - Inter Collegiate cum University team Selections 2018-19",
            href: sports2018_19_Circular9,
          },
          {
            label:
              "06-10-2018 Sports Circular-8 Chess(M) Team Selection Trails Postponed",
            href: sports2018_19_ChessPostponed,
          },
          {
            label: "06-10-2018 Kho - Kho(Women) Selected Players List",
            href: sports2018_19_KhoKhoWSelected,
          },
          {
            label: "06-10-2018 Cross Country Selected Players List",
            href: sports2018_19_CrossCountrySelected,
          },
          {
            label:
              "25-09-2018 Sports Circular-7 - Inter Collegiate cum University team Selections 2018-19",
            href: sports2018_19_Circular7,
          },
          {
            label:
              "25-09-2018 Sports Circular-6 - ANUR - Inter Collegiate cum University team selections for Cricket(Men) Postponed to 6th to 8th October-2018",
            href: sports2018_19_CricketMenPostponed,
          },
          {
            label:
              "25-09-2018 Sports Circular-5 - ANUR - Inter Collegiate cum University team selections for Volley Ball(Women) Preponed to 4th and 5th October-2018",
            href: sports2018_19_VolleyballWomenPreponed,
          },
          {
            label:
              "25-09-2018 Sports Circular-4 - Revised schedule for Volley Ball(Men)",
            href: sports2018_19_VolleyballMen,
          },
          {
            label:
              "24-09-2018 Sports Circular-3 - Inter Collegiate cum University team Selections 2018-19",
            href: sports2018_19_Circular3,
          },
          {
            label:
              "14-09-2018 Sports Circular-2 - Inter Collegiate cum University team Selections 2018-19",
            href: sports2018_19_Circular2,
          },
          {
            label:
              "12-09-2018 Sports Circular-1 - Inter Collegiate cum University team Selections 2018-19",
            href: sports2018_19_Circular1,
          },
          {
            label:
              "12-09-2018 Eligibility Pro-forma for Inter Collegiate cum University team Selections 2018-19",
            href: sports2018_19_EligibilityProforma,
          },
        ],
      },
    ],
    circulars: [
      { label: "27-03-2025 ANUR-SPORTS BOARD - Circular- 11", href: "#" },
      { label: "03-01-2025 ANUR-SPORTS BOARD - Circular- 10", href: "#" },
    ],
  };

  const handleActivitiesClick = () => {
    setActiveSection("Activities");
    // Set the first year as selected by default when Activities is clicked
    if (!selectedYear && sportsData.activities.length > 0) {
      setSelectedYear(sportsData.activities[0].year);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 overflow-x-hidden w-full gap-4 md:gap-4 lg:gap-6 xl:gap-8">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-56 lg:w-64 xl:w-72 bg-teal-800 text-white p-3 sm:p-4 md:p-4 lg:p-5 rounded-lg md:rounded-lg lg:rounded-xl">
        <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold mb-4 sm:mb-5 md:mb-6 pt-2 md:pt-3 lg:pt-4">
          Sports Menu
        </h3>
        <ul className="space-y-2">
          {["About", "Activities", "Circulars", "Gallery"].map((item) => (
            <li key={item}>
              <button
                onClick={() => {
                  if (item === "Activities") {
                    handleActivitiesClick();
                  } else {
                    setActiveSection(item);
                    setShowAll(false);
                  }
                }}
                className={`w-full text-left px-3 sm:px-4 md:px-3 lg:px-4 py-2 md:py-2.5 rounded-lg flex items-center justify-between text-sm sm:text-base md:text-sm lg:text-base ${
                  activeSection === item
                    ? "bg-teal-700 font-medium"
                    : "hover:bg-teal-700/50"
                }`}
              >
                <span>{item}</span>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </button>

              {/* Year submenu for Activities */}
              {item === "Activities" && activeSection === "Activities" && (
                <ul className="ml-3 sm:ml-4 mt-2 space-y-1">
                  {sportsData.activities.map((yearData) => (
                    <li key={yearData.year}>
                      <button
                        onClick={() => setSelectedYear(yearData.year)}
                        className={`w-full text-left px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm flex items-center ${
                          selectedYear === yearData.year
                            ? "bg-teal-600 font-medium"
                            : "hover:bg-teal-600/50"
                        }`}
                      >
                        {yearData.year}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* Main Content */}
      <div className="flex-1 min-w-0 w-full md:w-auto md:max-w-[calc(100%-240px)] lg:max-w-[calc(100%-280px)] xl:max-w-none">
        {activeSection === "About" && <AboutSection />}
        {activeSection === "Activities" && (
          <DocumentSection
            title={`${selectedYear || ""} Sports Activities`}
            documents={
              selectedYear
                ? sportsData.activities.find((y) => y.year === selectedYear)
                    ?.items || []
                : []
            }
            showAll={showAll}
            setShowAll={setShowAll}
          />
        )}
        {activeSection === "Circulars" && (
          <DocumentSection
            title="Sports Circulars"
            documents={sportsData.circulars}
            showAll={showAll}
            setShowAll={setShowAll}
          />
        )}
        {activeSection === "Gallery" && <SportsGallary />}
      </div>
    </div>
  );
};

const AboutSection = () => {
  const objectives = [
    "Organize and supervise various sports and games events amongst students of university constituent colleges.",
    "Organize, control, manage and supervise inter collegiate sports and games events amongst students of university constituent colleges and affiliated colleges.",
    "Select and train the teams to participate in South Zone and All India Inter University Tournaments.",
    "Conduct Inter University / South Zone Tournaments",
    "Encouraging the students in sports and games by giving incentives, awards and medals to the participants and medal winners of various events in south zone and inter university tournaments.",
    "Conduct sports and games competitions to university students on various occasions and celebrations with the help of department of physical education.",
    "Establishing and managing sports furniture and material.",
    "Conducting budget meetings for allocation of funds to various events.",
    "Circulating the AIU sports calendar among affiliated colleges.",
  ];

  return (
    <div className="w-full">
      <div className="bg-[#f4e4c9] w-full min-h-[220px] overflow-hidden shadow-md rounded-lg md:rounded-xl lg:rounded-2xl flex flex-col md:grid md:grid-cols-[35%_65%] lg:grid-cols-3">
        <div className="bg-teal-700 md:col-span-1 flex flex-col items-center justify-start px-4 sm:px-5 md:px-4 lg:px-6 pt-5 pb-5 md:py-5 lg:p-6 text-center md:text-left w-full">
          <img
            src={vswamy23}
            alt="Prof. K.V. Swamy"
            className="w-60 h-65 object-cover bg-white border-2 sm:border-3 md:border-4 border-white rounded-md mb-3 shadow"
          />
          <p className="text-white font-bold text-center text-sm sm:text-base md:text-sm lg:text-base mt-1 mb-0.5 w-full max-w-xs break-words">
            Prof. K.V. Swamy
          </p>
          <p className="text-white text-center text-xs sm:text-sm md:text-xs lg:text-sm w-full max-w-xs leading-5 break-words">
            Secretary(i/c), Sports Board
          </p>
          <p className="text-white text-center text-xs sm:text-sm md:text-xs lg:text-sm w-full max-w-xs leading-5 break-words">
            +91 9581145333
          </p>
          <p className="text-white text-center text-xs sm:text-sm md:text-xs lg:text-sm w-full max-w-xs leading-5 break-words">
            anursports@gmail.com
          </p>
        </div>

        <div className="bg-[#f4e4c9] md:col-span-1 lg:col-span-2 p-4 sm:p-5 md:p-5 lg:p-8 flex flex-col justify-center md:border-l md:border-teal-700/20">
          <h1 className="text-xl sm:text-2xl md:text-2xl lg:text-2xl font-bold text-teal-800 mb-3 sm:mb-4">
            About Sports Board
          </h1>
          <p className="text-gray-700 mb-4 sm:mb-5 text-sm sm:text-base md:text-sm lg:text-[16px] leading-5 md:leading-6 text-justify">
            Adikavi Nannaya University was established in the year 2006 to cater
            the educational need of the public of both East and West Godavari
            districts. Sports board of the university was established in the
            year 2010 with an objective of bringing all round development in the
            students of university constituent colleges and affiliated colleges
            through promoting sportsmanship and team spirit. Moreover Sports is
            a means of physical and mental development besides creating harmony
            in the country. The university Sports Board is an important and key
            unit of Adikavi Nannaya University which coordinates different
            sports activities among the university constituent colleges and
            affiliated colleges.
          </p>

          <div className="mt-4 sm:mt-5 md:mt-6">
            <h2 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-teal-800 mb-2 sm:mb-3">
              Objectives
            </h2>
            <ul className="space-y-1.5 sm:space-y-2">
              {objectives.map((objective, index) => (
                <li key={index} className="flex items-start">
                  <span
                    className="flex-shrink-0 h-5 w-5 sm:h-5 sm:w-5 md:h-5 md:w-5 lg:h-6 lg:w-6 rounded-full flex items-center justify-center mr-2 sm:mr-2.5 md:mr-3 mt-0.5 sm:mt-1"
                    style={{ backgroundColor: "#007367" }}
                  >
                    <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4 text-white" />
                  </span>
                  <span className="text-gray-700 text-xs sm:text-sm md:text-sm lg:text-[16px] leading-5 sm:leading-5 md:leading-5 lg:leading-6">
                    {objective}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const DocumentSection = ({ title, documents, showAll, setShowAll }) => {
  // For circulars (flat structure)
  if (title === "Sports Circulars") {
    const displayedDocs = showAll ? documents : documents.slice(0, 10);
    return (
      <div className="w-full">
        <h2 className="text-xl sm:text-2xl md:text-2xl lg:text-2xl font-bold text-teal-800 mb-4 sm:mb-5 md:mb-6">
          {title}
        </h2>
        <div className="bg-white rounded-lg md:rounded-xl lg:rounded-2xl shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {displayedDocs.map((doc, index) => (
              <li key={index} className="hover:bg-gray-50 transition-colors">
                <a
                  href={doc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 sm:px-4 md:px-4 lg:px-6 py-3 sm:py-3.5 md:py-4 text-gray-700 hover:text-teal-700"
                >
                  <div className="flex items-start sm:items-center">
                    <span className="flex-shrink-0 h-2 w-2 rounded-full bg-teal-600 mr-2 sm:mr-2.5 md:mr-3 mt-2 sm:mt-0"></span>
                    <span className="text-sm sm:text-base md:text-sm lg:text-base break-words">
                      {doc.label}
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
          {documents.length > 10 && (
            <div className="px-3 sm:px-4 md:px-4 lg:px-6 py-3 sm:py-3.5 md:py-4 bg-gray-50 text-center rounded-b-lg md:rounded-b-xl lg:rounded-b-2xl">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-sm sm:text-base md:text-sm lg:text-base text-teal-700 font-medium hover:underline"
              >
                {showAll ? "Show Less" : `Show All (${documents.length})`}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // For activities (single year)
  return (
    <div className="w-full">
      <h2 className="text-xl sm:text-2xl md:text-2xl lg:text-2xl font-bold text-teal-800 mb-4 sm:mb-5 md:mb-6 break-words">
        {title}
      </h2>
      {documents.length > 0 ? (
        <div className="bg-white rounded-lg md:rounded-xl lg:rounded-2xl shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {documents.map((doc, index) => (
              <li key={index} className="hover:bg-gray-50 transition-colors">
                <a
                  href={doc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 sm:px-4 md:px-4 lg:px-6 py-3 sm:py-3.5 md:py-4 text-gray-700 hover:text-teal-700"
                >
                  <div className="flex items-start sm:items-center">
                    <span className="flex-shrink-0 h-2 w-2 rounded-full bg-teal-600 mr-2 sm:mr-2.5 md:mr-3 mt-2 sm:mt-0"></span>
                    <span className="text-sm sm:text-base md:text-sm lg:text-base break-words">
                      {doc.label}
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white rounded-lg md:rounded-xl lg:rounded-2xl shadow-md p-4 sm:p-5 md:p-6 text-center text-gray-500 text-sm sm:text-base md:text-sm lg:text-base">
          No activities found for the selected year.
        </div>
      )}
    </div>
  );
};

function SportsGallary() {
  return (
    <div className="w-full">
      <h2 className="text-xl sm:text-2xl md:text-2xl font-bold text-teal-800 mb-5 sm:mb-6 md:mb-8">
        Sports Gallery
      </h2>
      <div className="columns-1 sm:columns-2 md:columns-2 lg:columns-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 space-y-3 sm:space-y-4 md:space-y-6">
        {sportsGallary.map((item, index) => (
          <div
            key={index}
            className="break-inside-avoid relative group cursor-pointer transform hover:scale-[1.02] transition-all duration-300"
          >
            <div className="relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-xl lg:rounded-2xl shadow-lg">
              <img
                src={item.link}
                alt={item.title}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 p-3 sm:p-5 w-full transition-all duration-300 group-hover:pb-5 sm:group-hover:pb-7">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2 break-words">
                  {item.title}
                </h3>
                <div className="h-px w-12 sm:w-16 bg-teal-300 mb-2 sm:mb-3 transition-all duration-300 group-hover:w-16 sm:group-hover:w-24" />
                <p className="text-white/80 text-xs sm:text-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  {item.description ||
                    "Sports event at Adikavi Nannaya University"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SportsBoard() {
  return (
    <div className="px-4 sm:px-16 py-8">
      <div className="">
        <BackButton />
        <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-3xl font-bold text-teal-800 mb-2">
          Sports Board
        </h1>
        <p className="text-sm sm:text-base md:text-base text-gray-600 mb-4 sm:mb-5 md:mb-6 lg:mb-8">
          Promoting sportsmanship and team spirit across the university
        </p>
        <SportsMenu />
      </div>
    </div>
  );
}
