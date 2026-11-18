import { useState } from "react";
import { BackButton } from "../../BackButton";

const AKNULMS = () => {
  const sampleContent = {
    ba1: {
      title: "LMS - B.A I<sup>st</sup> Semester",
      type: "accordion",
      subjects: [
        {
          id: 1,
          name: "Sanskrit - Poetry,Prose and Grammar",
          content: [
            {
              unit: "UNIT - II",
              topics: [
                {
                  name: "Mevada Rajyastapanam Part 1",
                  link: "https://drive.google.com/file/d/1WfhHN8tauf8q3kjtnFgyYn4iHuw1QRAg/view?usp=sharing",
                },
                {
                  name: "Mevada Rajyastapanam Part 2",
                  link: "https://drive.google.com/file/d/1Vzcgz0p92TzOEcKE-qTk4lSZElZk5OHc/view?usp=sharing",
                },
              ],
            },
            {
              unit: "UNIT - III",
              topics: [
                {
                  name: "Atyutkataihi Papapunyairihaiva Phalamasnute",
                  link: "https://drive.google.com/file/d/1XR2WL8sw9L_6gRaNj6iJJW2FGI01m9gr/view?usp=sharing",
                },
                {
                  name: "Sudraka- Veeravarakatha",
                  link: "https://drive.google.com/file/d/1_79e4N6kBX54kat52QBWR-0QPMnfrocn/view?usp=sharing",
                },
              ],
            },
            {
              unit: "UNIT - IV",
              topics: [
                {
                  name: "Sabdah",
                  link: "https://drive.google.com/file/d/1b3F2TGtdqB6WZGt1hk4PkMMdd_wTDWYs/view?usp=sharing",
                },
              ],
            },
            {
              unit: "UNIT - V",
              topics: [
                {
                  name: "Sandhi",
                  link: "https://drive.google.com/file/d/1c5KHV095EkE8d5txs8jG2mRTG25GwphM/view?usp=sharing",
                },
              ],
            },
          ],
        },
        {
          id: 2,
          name: "Telugu - Old poetry",
          content: [
            {
              unit: "UNIT - III",
              topics: [
                {
                  name: "ధౌమ్య ధర్మోప దేశం",
                  link: "https://drive.google.com/file/d/1rg0htjKCvDSM7vzXo3s3BsbHr3zdFtas/view?usp=sharing",
                },
              ],
            },
            {
              unit: "UNIT - IV",
              topics: [
                {
                  name: "పలనాటి బెబ్బులి",
                  link: "https://drive.google.com/file/d/1tT3Te0CyvjvNe6jdX8Fm9SjEQKyWMg8K/view?usp=sharing",
                },
                {
                  name: "పలనాటి బెబ్బులి",
                  link: "https://drive.google.com/file/d/1tTt8R6hkWmIw_ZkEx4UVNOs0gmgT18Wj/view?usp=sharing",
                },
              ],
            },
            {
              unit: "UNIT - V",
              topics: [
                {
                  name: "సీతా రావణ సంవాదం - 1",
                  link: "https://drive.google.com/file/d/17BCbRjJzuGjuragW8aE_2b3v6eNOtSxL/view?usp=sharing",
                },
                {
                  name: "సీతా రావణ సంవాదం - 2",
                  link: "https://drive.google.com/file/d/12d2KGCDOIH_RIs3H5K_AfH2jbSVE47dL/view?usp=sharing",
                },
                {
                  name: "సీతా రావణ సంవాదం - 3",
                  link: "https://drive.google.com/file/d/105iZZvgCqznJ8FvxZTp_HMneQuc3gfe5/view?usp=sharing",
                },
              ],
            },
          ],
        },
        {
          id: 3,
          name: "History - Ancient Indian History & Culture",
          content: [
            {
              unit: "UNIT - III",
              topics: [
                {
                  name: "History Sources Part - I",
                  link: "https://youtu.be/5fxBIhL1Ksw",
                },
                {
                  name: "History Sources Part - II",
                  link: "https://youtu.be/c2SJZFqfnek",
                },
                {
                  name: "History Sources Part - III",
                  link: "https://youtu.be/FccelUMjzpU",
                },
                {
                  name: "History Sources Part - IV",
                  link: "https://youtu.be/eEfdonra200",
                },
                {
                  name: "Unity in Diversity",
                  link: "https://youtu.be/MFMxlrBadiQ",
                },
                {
                  name: "Yugas Part - I",
                  link: "https://youtu.be/J2Ke5ZKzoTI",
                },
                {
                  name: "Yugas Part - II",
                  link: "https://youtu.be/cH_dkywVMfI",
                },
                {
                  name: "Yugas Part - III",
                  link: "https://youtu.be/41U1N32HPDw",
                },
                {
                  name: "Yugas Part - IV",
                  link: "https://youtu.be/tJPDajCY4Dw",
                },
                {
                  name: "Satavahana Empire",
                  link: "https://drive.google.com/file/d/1DM6_IaS1snwgYjhAOtYpvr5jhoFzL_YG/view?usp=drive_web",
                },
                {
                  name: "Administration under Satavahanas",
                  link: "https://drive.google.com/file/d/11te7z4kI8Qfe_R_WPxZE6Pu2Byq5Ku3-/view?usp=drive_web",
                },
              ],
            },
            {
              unit: "UNIT - V",
              topics: [
                {
                  name: "Political history of Kakatiyas",
                  link: "https://drive.google.com/file/d/1iSpIONBtwAj-WJ6vYo2_dQMPPwTLN75u/view?usp=drivesdk",
                },
              ],
            },
          ],
        },
        {
          id: 4,
          name: "Political Science - Principles of Political Science",
          content: [
            {
              unit: "UNIT - I",
              topics: [
                {
                  name: "Political Science Meaning & Scope",
                  link: "https://youtu.be/d_fY0pHJlfI",
                },
                {
                  name: "Principles of Political Scence & History",
                  link: "https://youtu.be/JK1OdjErynU",
                },
              ],
            },
            {
              unit: "UNIT - II",
              topics: [
                {
                  name: "State - Elements of State & Definition",
                  link: "https://youtu.be/5sQjkyQnSL8",
                },
              ],
            },
          ],
        },
        {
          id: 5,
          name: "Political Science - Introduction to Political Science",
          content: [
            {
              unit: "UNIT - I",
              topics: [
                {
                  name: "Rousseau's Social Contract Theory",
                  link: "https://drive.google.com/file/d/1-3keTuFHRYczFuy2kuGWOJmmzpkcFbgq/view?usp=sharing",
                },
                {
                  name: "Historical or Evolutionary Theory of the Origin of State",
                  link: "https://drive.google.com/file/d/1tqmlKwjvPsBCFUAqRtqjs93klMirTInt/view?usp=sharing",
                },
                {
                  name: "Rights and Kinds of rights",
                  link: "https://drive.google.com/file/d/1u0Hf97A46A7gKKbphpAmUcW-Roed6AX1/view?usp=sharing",
                },
                {
                  name: "Theory of the Divine Origin of the State",
                  link: "https://drive.google.com/file/d/1uxl0y9OTvdxmrRrhh2zv0D52Mf1hiDGE/view?usp=drivesdk",
                },
                {
                  name: "Thomas Hobbes Social Contract Theory",
                  link: "https://drive.google.com/file/d/1wszrYV68uBC8CXBUCL611A-LsCPWXCSm/view?usp=drivesdk",
                },
              ],
            },
          ],
        },
        {
          id: 6,
          name: "Economics - Micro Economic Analysis",
          content: [
            {
              unit: "UNIT - I",
              topics: [
                {
                  name: "1.1 Micro - Macro Differences",
                  link: "https://drive.google.com/file/d/1qXAm6yegrjodJwP4YBBiKQtZAapgesbf/view?usp=sharing",
                },
                {
                  name: "1.2 Demand Analysis",
                  link: "https://drive.google.com/file/d/1iCFfUXfXd8kuCvVtcurshT861ht0sQ3T/view?usp=sharing",
                },
              ],
            },
            {
              unit: "UNIT - II",
              topics: [
                {
                  name: "2.4 Budget Line",
                  link: "https://drive.google.com/file/d/1RyHjgLfLddxF6O9T5_5dihGuf3fRula1/view?usp=sharing",
                },
              ],
            },
          ],
        },
      ],
    },
    ba2: {
      title: "LMS - B.A IIth Semester",
      type: "accordion",
      subjects: [
        {
          id: 1,
          name: "Telugu - Modern Poetry",
          content: [
            {
              unit: "Unit - I",
              topics: [
                {
                  name: "తాతకో నూలుపోగు",
                  link: "https://drive.google.com/file/d/1hfJbMiEEcyBWzetLM6_RaX7tay1sRabH/view",
                },
                {
                  name: "తెలుగు కవితా శాఖలు",
                  link: "https://drive.google.com/file/d/1DbuamTFNGaTgQq-OZthIt5HhvhozxOl_/view",
                },
              ],
            },
            {
              unit: "UNIT - II",
              topics: [
                {
                  name: "తెలుగు కథ, కథానిక ఆవిర్భావ వికాసము",
                  link: "https://drive.google.com/file/d/1S1Zqr_iPQUuXVWqAD3EJp0xQQHnUDDCM/view",
                },
                {
                  name: "భయం కథానిక పార్ట్ -1",
                  link: "https://drive.google.com/file/d/1GRoyeFK5VqjCKmjeuLX1xFcT-4Y75gBU/view",
                },
                {
                  name: "భయం కథానిక పార్ట్ -2",
                  link: "https://drive.google.com/file/d/1BLYol5QiufFGySnICdQk66sx-46-e6Zw/view",
                },
                {
                  name: "స్వేదం ఖరీదు కథానిక",
                  link: "https://drive.google.com/file/d/1CQJAz18V5CB7rIOqjpgPsjvyohVJdDIA/view",
                },
              ],
            },
            {
              unit: "UNIT - III",
              topics: [
                {
                  name: "సతెలుగు నవలా వికాసము",
                  link: "https://drive.google.com/file/d/1ic0BZ35im1a8cOaa2sCZhYdkcmggxLFt/view",
                },
              ],
            },
          ],
        },
      ],
    },
    ba3: {
      title: "LMS - B.A IIIrd Semester",
      type: "accordion",
      subjects: [
        {
          id: 1,
          name: "HISTORY",
          content: [
            {
              unit: "UNIT - I",
              topics: [
                {
                  name: "Mughal Empire - Babur Part - I",
                  link: "https://youtu.be/k8ZlJgsizN8",
                },
                {
                  name: "Mughal Empire - Panipattu War Part-II",
                  link: "https://youtu.be/BzfC6UpSBxM",
                },
                {
                  name: "Mughal Empire - Gogra War Part-III",
                  link: "https://youtu.be/cXTJlpu3-UI",
                },
                {
                  name: "Humayun Part - I",
                  link: "https://youtu.be/E3EowCQXoC8",
                },
                {
                  name: "Humayun Part - II",
                  link: "https://youtu.be/hjFh5wwQO6Y",
                },
              ],
            },
          ],
        },
        {
          id: 2,
          name: "HISTORY - MODERN INDIAN HISTORY & CULTURE",
          content: [
            {
              unit: "UNIT - I",
              topics: [
                {
                  name: "Warrenhastings-(Part-I)",
                  link: "https://youtu.be/4HjUNiIFLpk",
                },
                {
                  name: "Warrenhastings-(Part-II)",
                  link: "https://youtu.be/AkjugtV6Xl4",
                },
                {
                  name: "Cornwallis-(Part-I)",
                  link: "https://youtu.be/dP1wY1zKic8",
                },
                {
                  name: "Cornwallis-(Part-II)",
                  link: "https://youtu.be/29Ep3UqUO9c",
                },
              ],
            },
          ],
        },
        {
          id: 3,
          name: "TELUGU",
          content: [
            {
              unit: "UNIT - I,II,III&IV",
              topics: [
                {
                  name: "Part-I",
                  link: "https://youtu.be/DBPU4kbTpBI",
                },
                {
                  name: "Part-II",
                  link: "https://youtu.be/ZH2OT2dqDVI",
                },
                {
                  name: "Part-III",
                  link: "https://youtu.be/oRyj2HO19o4",
                },
                {
                  name: "Part-IV",
                  link: "https://youtu.be/3ZUpNzBYU3E",
                },
              ],
            },
            {
              unit: "UNIT - V & VI",
              topics: [
                {
                  name: "Part - I",
                  link: "https://youtu.be/hKD3Sh4xQ5g",
                },
                {
                  name: "Part - II",
                  link: "https://youtu.be/fnDo9RpSrAU",
                },
                {
                  name: "Part - III",
                  link: "https://youtu.be/4dmAtFEAZLU",
                },
                {
                  name: "Part - IV",
                  link: "https://youtu.be/zUIUw1P2F8U",
                },
              ],
            },
          ],
        },
        {
          id: 4,
          name: "ENGLISH",
          content: [
            {
              unit: "UNIT - I POETRY, STORY",
              topics: [
                {
                  name: "Part I",
                  link: "https://youtu.be/tmwrM2xV4QI",
                },
                {
                  name: "Part II",
                  link: "https://youtu.be/frjl6Dbk-lI",
                },
                {
                  name: "Part III",
                  link: "https://youtu.be/vU2SOimCvIY",
                },
                {
                  name: "Part IV",
                  link: "https://youtu.be/NT9PP8g42ZY",
                },
                {
                  name: "Part V",
                  link: "https://youtu.be/VHBPdw7waaA",
                },
                {
                  name: "Part VI",
                  link: "https://youtu.be/lUhhkqQpUqo",
                },
                {
                  name: "Part VII",
                  link: "https://youtu.be/ybMo0M6q1K8",
                },
                {
                  name: "Part VIII",
                  link: "https://youtu.be/rhFKJXABqeA",
                },
              ],
            },
            {
              unit: "UNIT - III,IV,V",
              topics: [
                {
                  name: "Part I",
                  link: "https://youtu.be/3_QyaD-QWUw",
                },
                {
                  name: "Part II",
                  link: "https://youtu.be/2db7IDvS2ug",
                },
                {
                  name: "Part III",
                  link: "https://youtu.be/laqYBPoT0EU",
                },
                {
                  name: "Part IV",
                  link: "https://youtu.be/Pxsg_nHo85A",
                },
                {
                  name: "Part V",
                  link: "https://youtu.be/-wHsp0jWSUA",
                },
                {
                  name: "Part VI",
                  link: "https://youtu.be/DX0ZW3NGo2s",
                },
                {
                  name: "Part VII",
                  link: "https://youtu.be/8v7_MPTDn7E",
                },
                {
                  name: "Part VIII",
                  link: "https://youtu.be/aexPmzg3wRw",
                },
                {
                  name: "Part IX",
                  link: "https://youtu.be/Mv9rDPMUMVQ",
                },
              ],
            },
          ],
        },
        {
          id: 5,
          name: "POLITICAL SCIENCE - INDIAN CONSTITUTION",
          content: [
            {
              unit: "UNIT - I",
              topics: [
                {
                  name: "Constitutional Development History EM",
                  link: "https://youtu.be/dRLaT_RJ9wU",
                },
                {
                  name: "Constitutional Development History TM",
                  link: "https://youtu.be/DNVjrBMARNs",
                },
                {
                  name: "Constituional Assemble EM",
                  link: "https://youtu.be/pCLImqqJ7L0",
                },
                {
                  name: "Constitutional Assembly (TM)",
                  link: "https://youtu.be/sVIjO61uksw",
                },
              ],
            },
            {
              unit: "UNIT - II",
              topics: [
                {
                  name: "Preamble of Indian Constitution(EM)",
                  link: "https://youtu.be/EidtCh62If0",
                },
                {
                  name: "Preamble of Indian Constitution (TM)",
                  link: "https://youtu.be/1oaX1ql51ZE",
                },
                {
                  name: "Salient Features of Indian Constitution (EM)",
                  link: "https://youtu.be/LSMEY3LK404",
                },
                {
                  name: "Salient Features of Indian Constitution (TM)",
                  link: "https://youtu.be/_JHvV3pA1W8",
                },
              ],
            },
            {
              unit: "UNIT - III Fundamental Rights and Directive Principles",
              topics: [
                {
                  name: "Fundamental Rights (EM)",
                  link: "https://youtu.be/YeXXr5L1ddw",
                },
                {
                  name: "Fundamental Rights (TM)",
                  link: "https://youtu.be/Xp6CGNAtRWM",
                },
                {
                  name: "Kasavanda bharathi case (EM)",
                  link: "https://youtu.be/eJUfZEDZB7Y",
                },
                {
                  name: "Kasavanda bharathi case (TM)",
                  link: "https://youtu.be/CEVR3c-_tE8",
                },
                {
                  name: "Directive Principles of state Policy(EM)",
                  link: "https://youtu.be/zWnEpCTV-1o",
                },
                {
                  name: "Directive Principles of state Policy(TM)",
                  link: "https://youtu.be/5IQldlbQBIw",
                },
              ],
            },
            {
              unit: "UNIT - IV Central and state relation",
              topics: [
                {
                  name: "Unitary and federal features (EM)",
                  link: "https://youtu.be/Vit4TRyJLqQ",
                },
                {
                  name: "Unitary and federal features ™",
                  link: "https://youtu.be/EyfG6gRRPZI",
                },
                {
                  name: "Certral and State Relations (EM)",
                  link: "https://youtu.be/VeVUleMWkm8",
                },
                {
                  name: "Central State relations ™",
                  link: "https://youtu.be/amkyn1_rvYY",
                },
              ],
            },
          ],
        },
        {
          id: 6,
          name: "ECONOMICS - MACRO ECONOMICS",
          content: [
            {
              unit: "UNIT - I Meaning, Definition and importance of Macro Economics",
              topics: [
                {
                  name: "Micro & Macro Economics, Macro Economic Paradox(EM)",
                  link: "https://youtu.be/gLPygTJebsI",
                },
                {
                  name: "Micro and Macro Economics(EM)",
                  link: "https://youtu.be/nMf1DNL1VE4",
                },
                {
                  name: "Macro Economics Paradox",
                  link: "https://youtu.be/5xzOYHsTRGs",
                },
              ],
            },
            {
              unit: "UNIT - II National Income– Measurement of National Income in India",
              topics: [
                {
                  name: "National Income -Concepts (EM)",
                  link: "https://youtu.be/hkzarAi2Lhg",
                },
                {
                  name: "National Income (EM)",
                  link: "https://youtu.be/Jkb9nKa6dMo",
                },
                {
                  name: "National Income (TM)",
                  link: "https://youtu.be/USjcJa8aNCE",
                },
              ],
            },
            {
              unit: "UNIT - III Classical theory of employment",
              topics: [
                {
                  name: "Classical Theory of Employment(EM)",
                  link: "https://youtu.be/j5Un4uIsW8A",
                },
                {
                  name: "Sampradaya Udyogita Sidhantam",
                  link: "https://youtu.be/Ha_yEeOlLPY",
                },
                {
                  name: "SAY's law of Markers(EM)",
                  link: "https://youtu.be/HtA3VHmE0_w",
                },
                {
                  name: "SAY's Market Sootram-PART-1",
                  link: "https://youtu.be/8Xv1w5R_4uo",
                },
                {
                  name: "SAY's Market Sootram -PART-2",
                  link: "https://youtu.be/p3XHFOGja9c",
                },
                {
                  name: "Keynesian Theory(EM)",
                  link: "https://youtu.be/aQ2d0XssAt8",
                },
                {
                  name: "Keynesian Theory(Tm)",
                  link: "https://youtu.be/68kEvwgZDMw",
                },
              ],
            },
            {
              unit: "UNIT - IV Consumption function",
              topics: [
                {
                  name: "Multiplier(EM)",
                  link: "https://youtu.be/E53XePZ4bDg",
                },
                {
                  name: "Gunakam",
                  link: "https://youtu.be/NphSP21jjkw",
                },
                {
                  name: "Accelerator(EM)",
                  link: "https://youtu.be/jlzWVsCsI-s",
                },
                {
                  name: "Vega Twaranam",
                  link: "https://youtu.be/c1PbwmKyhWw",
                },
              ],
            },
          ],
        },
      ],
    },

    ba5: {
      title: "LMS - B.A Vth Semester",
      type: "accordion",
      subjects: [
        {
          id: 1,
          name: "POLITICAL SCIENCE - INDIAN AND WESTERN THOUGHT",
          content: [
            {
              unit: "UNIT - I Ancient Indian political thought",
              topics: [
                {
                  name: "Sources of Ancient Indian political thought (TM)",
                  link: "https://youtu.be/EY8joHijyPg",
                },
                {
                  name: "Sources of Ancient Indian political thought (TM)",
                  link: "https://youtu.be/zg4_aUoyRUA",
                },
                {
                  name: "Kautilya : State and society",
                  link: "https://youtu.be/WMfiuuQKTKI",
                },
              ],
            },
            {
              unit: "UNIT - II Renaissance - Early and religious nationalism",
              topics: [
                {
                  name: "Rammohun Roy: Religious and social reform (EM)",
                  link: "https://youtu.be/5cyCykCwr8s",
                },
                {
                  name: "Rammohun Roy: Religious and social reform (TM)",
                  link: "https://youtu.be/GCAAMCH6U28",
                },
                {
                  name: "Dadabai Naoroji : Drain theory and poverty (EM)",
                  link: "https://youtu.be/0zpSU1KQtqU",
                },
                {
                  name: "Dadabai Naoroji : Drain theory and poverty (TM)",
                  link: "https://youtu.be/krt0P6o5gkI",
                },
                {
                  name: "Savarkar V D : Hindutva or Hindu cultural nationalism (EM)",
                  link: "https://youtu.be/CJZpfGvPvYo",
                },
                {
                  name: "Mohammed Iqbal : Islamic communitarian nationalism (EM)",
                  link: "https://youtu.be/Bm5M5FuZZmU",
                },
                {
                  name: "Mohammed Iqbal : Islamic communitarian nationalism (TM)",
                  link: "https://youtu.be/1ZzjJM6_hDs",
                },
              ],
            },
            {
              unit: "UNIT - III Modern Indian political thought",
              topics: [
                {
                  name: "Gandhi : Ahimsa and Satyagraha (EM)",
                  link: "https://youtu.be/JrBwPZy4Ets",
                },
                {
                  name: "Gandhi : Ahimsa and Satyagraha (TM)",
                  link: "https://youtu.be/S3scht485JM",
                },
                {
                  name: "Nehru : Democratic socialism (EM)",
                  link: "https://youtu.be/ZMTQ3bmDlwE",
                },
                {
                  name: "Nehru : Democratic socialism (TM)",
                  link: "https://youtu.be/nntPJopKI_Q",
                },
                {
                  name: "Ambedkar : Annihilation of caste (EM)",
                  link: "https://youtu.be/z_1kIisRtCM",
                },
                {
                  name: "Ambedkar : Annihilation of caste (TM)",
                  link: "https://youtu.be/W3d_Zbbk7AQ",
                },
                {
                  name: "M.N. Roy : Radical humanism (EM)",
                  link: "https://youtu.be/Xs52klj2xog",
                },
                {
                  name: "M.N. Roy : Radical humanism (TM)",
                  link: "https://youtu.be/YPt2-HsUTmI",
                },
              ],
            },
            {
              unit: "UNIT - IV Western Political thought",
              topics: [
                {
                  name: "Plato (EM)",
                  link: "https://youtu.be/rlBiahEyXEA",
                },
                {
                  name: "Plato (TM)",
                  link: "https://youtu.be/LXHbKwGVNKw",
                },
                {
                  name: "Aristotle (EM)",
                  link: "https://youtu.be/cxWOXLWmMKc",
                },
                {
                  name: "Aristotle (TM)",
                  link: "https://youtu.be/MKkSM2HPPdM",
                },
                {
                  name: "Machiavelli (EM)",
                  link: "https://youtu.be/2jLzqRBbf28",
                },
                {
                  name: "Machiavelli (TM)",
                  link: "https://youtu.be/n52Vj36AGgA",
                },
              ],
            },
          ],
        },
        {
          id: 2,
          name: "POLITICAL SCIENCE - PRINCIPLES OF PUBLIC ADMINSTRATION",
          content: [
            {
              unit: "UNIT - I Introduction of Public Adminisration",
              topics: [
                {
                  name: "Nature and scope of public administation (EM)",
                  link: "https://youtu.be/1SSIpdAOHl8",
                },
                {
                  name: "Nature and scope of public administation (TM)",
                  link: "https://youtu.be/IAu7JSNkgyc",
                },
                {
                  name: "Difference between public and private administration (EM)",
                  link: "https://youtu.be/pYmzv5sFmPc",
                },
              ],
            },
            {
              unit: "UNIT - II Administrative thinkers",
              topics: [
                {
                  name: "Henry Fayol - Management principles (EM)",
                  link: "https://youtu.be/DVoKmxoDTmg",
                },
                {
                  name: "Henry Fayol - Management principles (TM)",
                  link: "https://youtu.be/YINw77EFhRw",
                },
                {
                  name: "F.W Taylor & Elton Mayo (EM)",
                  link: "https://youtu.be/T_4I_J6Eh88",
                },
                {
                  name: "F.W Taylor & Elton Mayo (TM)",
                  link: "https://youtu.be/9TrWQGKxd-M",
                },
                {
                  name: "F.W Riggs - Ecological approach (EM)",
                  link: "https://youtu.be/6lzFJ4YZVuA",
                },
                {
                  name: "F.W Riggs - Ecological approach (TM)",
                  link: "https://youtu.be/jfiEYL0lJAE",
                },
                {
                  name: "Herbert Simon - Decision making theory (EM)",
                  link: "https://youtu.be/Pok0xtkRVD8",
                },
                {
                  name: "Herbert Simon - Decision making theory (TM)",
                  link: "https://youtu.be/VKvSlwi2mG8",
                },
              ],
            },
            {
              unit: "UNIT - IV Personnel Administration",
              topics: [
                {
                  name: "Recruitment (EM)",
                  link: "https://youtu.be/oA5k2kmwLA0",
                },
                {
                  name: "Recruitment (TM)",
                  link: "https://youtu.be/00H38TR5FyQ",
                },
                {
                  name: "Training (EM)",
                  link: "https://youtu.be/PQQ_XqXmes0",
                },
                {
                  name: "Training (TM)",
                  link: "https://youtu.be/ZY6WVjG5TiU",
                },
                {
                  name: "Promotion (EM)",
                  link: "https://youtu.be/ZHSlKftftkk",
                },
                {
                  name: "Promotion (TM)",
                  link: "https://youtu.be/bGGGZU__wwQ",
                },
                {
                  name: "Retirement (EM)",
                  link: "https://youtu.be/6_SfHeDG9is",
                },
                {
                  name: "Retirement (TM)",
                  link: "https://youtu.be/wKwWbyCIDas",
                },
              ],
            },
            {
              unit: "UNIT - V Motivational Theories",
              topics: [
                {
                  name: "Abraham Maslow - Needs of hierarchy theory (EM)",
                  link: "https://youtu.be/8Z8nrqq6tE0",
                },
                {
                  name: "Abraham Maslow - Needs of hierarchy theory (TM)",
                  link: "https://youtu.be/4fezW3H2hVQ",
                },
              ],
            },
          ],
        },
        {
          id: 3,
          name: "ECONOMICS - INDIAN ECONOMY",
          content: [
            {
              unit: "UNIT - I Meaning of Economic growth and development",
              topics: [
                {
                  name: "Measures of Economic development (EM)",
                  link: "https://youtu.be/sEQBFYg8wgE",
                },
                {
                  name: "Sustainable development (EM)",
                  link: "https://youtu.be/9IGzDla6Euc",
                },
                {
                  name: "Measures of Economic development (TM)",
                  link: "https://youtu.be/15KYozOQ33Q",
                },
                {
                  name: "Sustainable development (TM)",
                  link: "https://youtu.be/b-y2vvqNY3k",
                },
              ],
            },
            {
              unit: "UNIT - II",
              topics: [
                {
                  name: "Balanced & unbalanced growth (EM)",
                  link: "https://youtu.be/kc2yX4BFV5s",
                },
                {
                  name: "Santhulitha vruddhi",
                  link: "https://youtu.be/ru3rPH6PQuI",
                },
                {
                  name: "Utpatti paddhatula empika",
                  link: "https://youtu.be/9IGzDla6Euc",
                },
                {
                  name: "Choice of techniques",
                  link: "https://youtu.be/I9-pJEj-4vs",
                },
                {
                  name: "Asanthulitha vruddhi siddhantham",
                  link: "https://youtu.be/01E14JGRSX8",
                },
              ],
            },
            {
              unit: "UNIT - III",
              topics: [
                {
                  name: "Natural resources - (EM)",
                  link: "https://youtu.be/jxLmqTQPgPI",
                },
                {
                  name: "Bharata desa janabha lakshanalu",
                  link: "https://youtu.be/wd0m8Dn5c24",
                },
                {
                  name: "Basic demographic features",
                  link: "https://youtu.be/I-Z5xOLIvhM",
                },
                {
                  name: "Sahaja vanarulu",
                  link: "https://youtu.be/vsGvgU_ZLIE",
                },
                {
                  name: "Basic demographic features",
                  link: "https://youtu.be/I-Z5xOLIvhM",
                },
              ],
            },
            {
              unit: "UNIT - IV National income in India",
              topics: [
                {
                  name: "National income",
                  link: "https://youtu.be/tAV_pgTDEeU",
                },
                {
                  name: "Poverty",
                  link: "https://youtu.be/PL2f1zToJMY",
                },
                {
                  name: "Unemployment",
                  link: "https://youtu.be/vLTOn-Nm1T0",
                },
                {
                  name: "Jaateeya aadayam - 1",
                  link: "https://youtu.be/AkmKF-MzCRI",
                },
                {
                  name: "Pedarikam",
                  link: "https://youtu.be/Hq4jL-RCxZE",
                },
                {
                  name: "Jaateeya aadayam - 2",
                  link: "https://youtu.be/X1Y2t_wUDSM",
                },
              ],
            },
          ],
        },
        {
          id: 4,
          name: "ECONOMICS - INDIAN ECONOMY WITH SPECIAL REFERENCE TO ANDHRA PRADESH - II",
          content: [
            {
              unit: "UNIT - I Indian Agriculture",
              topics: [
                {
                  name: "Causes for low productivity of agriculture in India measures (EM)",
                  link: "https://youtu.be/W12LhrKnn2M",
                },
                {
                  name: "Importance of agriculture Sector in Indian economy (TM)",
                  link: "https://youtu.be/B-dspVRIw-U",
                },
                {
                  name: "Nature and Importance – Trends in agriculture production",
                  link: "https://youtu.be/KmoQ7Hi8f3c",
                },
                {
                  name: "Land Reforms in India (TM)",
                  link: "https://youtu.be/MvhjznnyCb0",
                },
                {
                  name: "Land Reforms in India (EM)",
                  link: "https://youtu.be/KmoQ7Hi8f3c",
                },
              ],
            },
            {
              unit: "UNIT - II Agricultural Marketing in India",
              topics: [
                {
                  name: "Agriculture marketing in India (EM)",
                  link: "https://youtu.be/lUwTwDhZULE",
                },
                {
                  name: "Food security in India (EM)",
                  link: "https://youtu.be/DWMpT3ZeJfI",
                },
                {
                  name: "Agriculture marketing in India (TM)",
                  link: "https://youtu.be/o2SqjAAV50U",
                },
                {
                  name: "Food security in India (TM)",
                  link: "https://youtu.be/zZDEL-Zz-5E",
                },
              ],
            },
            {
              unit: "UNIT - III Indian Industry & Services",
              topics: [
                {
                  name: "Industrial policy & FEMA (EM)",
                  link: "https://youtu.be/lJZTMGlRT-w",
                },
                {
                  name: "1948,1956 industrial policy act (TM)",
                  link: "https://youtu.be/fTprlvmUXM8",
                },
                {
                  name: "Small scale industries (EM)",
                  link: "https://youtu.be/1tzvztx4Shs",
                },
                {
                  name: "Small Scale industries (TM)",
                  link: "https://youtu.be/MucauMcst-A",
                },
              ],
            },
            {
              unit: "UNIT - V Andhra Pradesh state economy",
              topics: [
                {
                  name: "Andhra Pradesh state economy (EM)",
                  link: "https://youtu.be/0-7mj9tcfMo",
                },
                {
                  name: "Andhra Pradesh state economy (TM)",
                  link: "https://youtu.be/oIo0cgS_mAA",
                },
              ],
            },
          ],
        },
      ],
    },
    ba6: {
      title: "LMS - B.A VIth Semester",
      type: "accordion",
      subjects: [
        {
          id: 1,
          name: "History - Modern European History",
          content: [
            {
              unit: "UNIT - I",
              topics: [
                {
                  name: "The Industrial Revolution - Part - I",
                  link: "https://youtu.be/c7RR5UGduP4",
                },
                {
                  name: "The Industrial Revolution - Part - II",
                  link: "https://youtu.be/_PTy4QSdGJc",
                },
                {
                  name: "The Industrial Revolution - Part - III",
                  link: "https://youtu.be/7OJaoNyLIXs",
                },
                {
                  name: "Imperialism Part-I",
                  link: "https://youtu.be/CdH_7is7xgc",
                },
                {
                  name: "Imperialism Part-II",
                  link: "https://youtu.be/1HblSC_Bv-Q",
                },
                {
                  name: "Capitalism",
                  link: "https://youtu.be/YmhZ0x_fIf8",
                },
              ],
            },
            {
              unit: "UNIT - II",
              topics: [
                {
                  name: "Unification Movements Vienna Congress (1815)",
                  link: "https://youtu.be/kT8p8ybMbZU",
                },
                {
                  name: "Itly Unificatin Part-I",
                  link: "https://youtu.be/FIUhHzNX-Lo",
                },
                {
                  name: "Itly Unificatin Part-II",
                  link: "https://youtu.be/RoHkH2CVUMA",
                },
              ],
            },
          ],
        },
        {
          id: 2,
          name: "Political Science - Principles of Public Administration",
          content: [
            {
              unit: "UNIT - I",
              topics: [
                {
                  name: "Public Administration - Definition - Scope",
                  link: "https://youtu.be/_pKKA1iRnFQ",
                },
                {
                  name: "Difference between Public Administratin & Private Administration",
                  link: "https://youtu.be/-t8iSEyfSZY",
                },
              ],
            },
          ],
        },
        {
          id: 3,
          name: "Political Science - Local Self Government in Andhra Pradesh",
          content: [
            {
              unit: "UNIT - I",
              topics: [
                {
                  name: "Evolution of local self govt in India",
                  link: "https://drive.google.com/file/d/1-xUFwLK4zFwz8UQwENr9BDd5908TE8zl/view?usp=sharing",
                },
                {
                  name: "73rd Constitutional Amendment act",
                  link: "https://drive.google.com/file/d/1KZNnlU-1IHZaKA_FyyuFab6H-2pFXwKp/view?usp=sharing",
                },
              ],
            },
            {
              unit: "UNIT - II",
              topics: [
                {
                  name: "74th constitutional amendment act",
                  link: "https://drive.google.com/file/d/1ksVWjbESa7j_XoIr7D82xSUFGPrMGtsf/view?usp=sharing",
                },
              ],
            },
          ],
        },
      ],
    },
    bvoc1: {
      title: "B.Voc I<sup>st</sup> Semester",
      type: "youtube",
      subjects: [
        {
          id: 1,
          name: "WTM - Photoshop - Layers in Photoshop-1",
          link: "https://youtu.be/4DqOifLHuFc",
        },
        {
          id: 2,
          name: "WTM - Photoshop - Layers in Photoshop-2",
          link: "https://youtu.be/jWsN0-5rNMM",
        },
        {
          id: 3,
          name: "WTM - Photoshop - Layers in Photoshop-3",
          link: "https://youtu.be/oJ_qao8a2bE",
        },
      ],
    },
    msc1: {
      title: "M.Sc I<sup>st</sup> Semester",
      type: "drive",
      subjects: [
        {
          id: 1,
          name: "PHYSICS - MATHEMATICAL METHODS OF PHYSICS",
          content: [
            {
              unit: "UNIT - I (CSIR-NET/GATE syllabus)",
              topics: [
                {
                  name: "Vector Analysis",
                  link: "https://youtu.be/WCAuS3PkGkw",
                },
              ],
            },
          ],
        },
      ],
    },
  };

  const [activeContent, setActiveContent] = useState(sampleContent["ba1"]);
  const [activeProgram, setActiveProgram] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const handleItemClick = (programKey, programName) => {
    setActiveProgram(programName);
    console.log("__programKey", sampleContent["ba1"]);
    setActiveContent(sampleContent[programKey]);
  };

  const programs = {
    ug: {
      title: "UG VIDEO LECTURES",
      items: [
        {
          name: "B.A",
          key: "ba",
          semesters: [
            { num: "I Semester", link: "ba1", key: "ba1" },
            { num: "II Semester", link: "ba2", key: "ba2" },
            { num: "III Semester", link: "ba3", key: "ba3" },
            { num: "IV Semester", link: "ba4", key: "ba4" },
            { num: "V Semester", link: "ba5", key: "ba5" },
            { num: "VI Semester", link: "ba6", key: "ba6" },
          ],
        },
        {
          name: "B.Com",
          key: "bcom",
          semesters: [
            { num: "I Semester", link: "bcom1", key: "bcom1" },
            { num: "II Semester", link: "bcom2", key: "bcom2" },
            { num: "III Semester", link: "bcom3", key: "bcom3" },
            { num: "IV Semester", link: "bcom4", key: "bcom4" },
            { num: "V Semester", link: "bcom5", key: "bcom5" },
            { num: "VI Semester", link: "bcom6", key: "bcom6" },
          ],
        },
        {
          name: "B.Sc",
          key: "bsc",
          semesters: [
            { num: "I Semester", link: "bsc1", key: "bsc1" },
            { num: "II Semester", link: "bsc2", key: "bsc2" },
            { num: "III Semester", link: "bsc3", key: "bsc3" },
            { num: "IV Semester", link: "bsc4", key: "bsc4" },
            { num: "V Semester", link: "bsc5", key: "bsc5" },
            { num: "VI Semester", link: "bsc6", key: "bsc6" },
          ],
        },
        {
          name: "B.Voc",
          key: "bvoc",
          semesters: [
            { num: "I Semester", link: "bvoc1", key: "bvoc1" },
            { num: "II Semester", link: "bvoc2", key: "bvoc2" },
            { num: "III Semester", link: "bvoc3", key: "bvoc3" },
            { num: "IV Semester", link: "bvoc4", key: "bvoc4" },
            { num: "V Semester", link: "bvoc5", key: "bvoc5" },
            { num: "VI Semester", link: "bvoc6", key: "bvoc6" },
          ],
        },
      ],
    },
    pg: {
      title: "PG VIDEO LECTURES",
      items: [
        {
          name: "M.A.",
          key: "ma",
          semesters: [
            { num: "II Semester", link: "ma2", key: "ma2" },
            { num: "III Semester", link: "ma3", key: "ma3" },
          ],
        },
        {
          name: "M.Com",
          key: "mcom",
          semesters: [{ num: "IV Semester", link: "mcom4", key: "mcom4" }],
        },
        {
          name: "M.Sc",
          key: "msc",
          semesters: [
            { num: "I Semester", link: "msc1", key: "msc1" },
            { num: "II Semester", link: "msc2", key: "msc2" },
            { num: "III Semester", link: "msc3", key: "msc3" },
            { num: "IV Semester", link: "msc4", key: "msc4" },
          ],
        },
        {
          name: "MCA",
          key: "mca",
          semesters: [
            { num: "I Semester", link: "mca1", key: "mca1" },
            { num: "II Semester", link: "mca2", key: "mca2" },
          ],
        },
        {
          name: "MBA",
          key: "mba",
          semesters: [
            { num: "I Semester", link: "mba1", key: "mba1" },
            { num: "II Semester", link: "mba2", key: "mba2" },
          ],
        },
      ],
    },
    papers: {
      title: "UG PREVIOUS YEARS QUESTION PAPERS",
      items: [
        {
          name: "B.A",
          key: "ba_papers",
          semesters: [
            {
              num: "II Semester",
              link: "https://drive.google.com/drive/folders/1TLXLPHSkgmSrmjQx73P3WovIg-M8HwCx?usp=sharing",
              key: "ba2_papers",
            },
          ],
        },
        {
          name: "B.Com",
          key: "bcom_papers",
          semesters: [
            {
              num: "II Semester",
              link: "https://drive.google.com/drive/folders/1K8uRwrr5KUz_3neLuNpjqFLuBz8HUI3u?usp=sharing",
              key: "bcom2_papers",
            },
            {
              num: "VI Semester",
              link: "https://drive.google.com/drive/folders/1dd4KetcSF0yvHPjdZU3HKnG_AfiV0DQM?usp=sharing",
              key: "bcom6_papers",
            },
          ],
        },
        {
          name: "B.Sc",
          key: "bsc_papers",
          semesters: [
            {
              num: "VI Semester",
              link: "https://drive.google.com/drive/folders/1hLL6J7wjBNe0WZLaxAPf8EoXk6ZpT5wN?usp=sharing",
              key: "bsc6_papers",
            },
          ],
        },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 px-4 sm:px-16 py-8">
      <BackButton className="mb-4" />
      <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4 sm:p-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            AKNU - Learning Management System
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row p-4 sm:p-6">
          {/* Left Sidebar - Program Navigation */}
          <div className="w-full lg:w-1/3 pr-0 lg:pr-4 xl:pr-6 mb-6 lg:mb-0">
            {/* UG Programs */}
            <ProgramSection
              title={programs.ug.title}
              items={programs.ug.items}
              activeDropdown={activeDropdown}
              toggleDropdown={toggleDropdown}
              startIndex={0}
              onItemClick={handleItemClick}
            />

            {/* PG Programs */}
            <ProgramSection
              title={programs.pg.title}
              items={programs.pg.items}
              activeDropdown={activeDropdown}
              toggleDropdown={toggleDropdown}
              startIndex={programs.ug.items.length}
              onItemClick={handleItemClick}
            />

            {/* Question Papers */}
            <ProgramSection
              title={programs.papers.title}
              items={programs.papers.items}
              activeDropdown={activeDropdown}
              toggleDropdown={toggleDropdown}
              startIndex={programs.ug.items.length + programs.pg.items.length}
              onItemClick={handleItemClick}
            />
          </div>

          {/* Right Content Area */}
          <div className="w-full lg:w-2/3 bg-gray-50 rounded-lg p-4 sm:p-6">
            {activeContent ? (
              <ContentDisplay content={activeContent} program={activeProgram} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12">
                <div className="text-teal-500 mb-4">
                  <svg
                    className="w-12 h-12 sm:w-16 sm:h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-teal-800 mb-2">
                  Welcome to AKNU LMS
                </h3>
                <p className="text-sm sm:text-base text-gray-600 px-4">
                  Select a program and semester from the menu to view available
                  content
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProgramSection = ({
  title,
  items,
  activeDropdown,
  toggleDropdown,
  startIndex,
  onItemClick,
}) => {
  return (
    <div className="mb-4 sm:mb-6">
      <h2 className="text-base sm:text-lg font-semibold text-teal-900 border-b-2 border-teal-200 pb-2 mb-3">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-2 sm:gap-3">
        {items.map((item, index) => (
          <ProgramCard
            key={index}
            program={item}
            isOpen={activeDropdown === startIndex + index}
            toggle={() => toggleDropdown(startIndex + index)}
            onItemClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
};

const ProgramCard = ({ program, isOpen, toggle, onItemClick }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      <button
        onClick={toggle}
        className="w-full flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-medium text-xs sm:text-sm hover:from-teal-700 hover:to-teal-800 transition-colors duration-200"
      >
        <span className="truncate pr-2">{program.name}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        className={`transition-all duration-300 overflow-hidden ${isOpen ? "max-h-96" : "max-h-0"}`}
      >
        <div className="p-2 bg-teal-50">
          {program.semesters.map((semester, idx) => (
            <button
              key={idx}
              onClick={() =>
                onItemClick(semester.key, `${program.name} ${semester.num}`)
              }
              className="block w-full text-left py-2 px-2 sm:px-3 mb-1 rounded-md hover:bg-teal-100 transition-colors duration-200 text-teal-900 hover:text-teal-800 text-xs sm:text-sm"
            >
              {semester.num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ContentDisplay = ({ content, program }) => {
  return (
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-teal-900 mb-4 sm:mb-6 pb-2 border-b border-teal-200">
        <span dangerouslySetInnerHTML={{ __html: `LMS - ${content.title}` }} />
      </h2>

      {content.type === "youtube" ? (
        <YouTubeContent content={content} />
      ) : (
        <DriveContent content={content} />
      )}
    </div>
  );
};

const YouTubeContent = ({ content }) => {
  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-teal-50">
            <tr>
              <th
                scope="col"
                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider"
              >
                S.No
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider"
              >
                Subject
              </th>
              <th
                scope="col"
                className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-teal-700 uppercase tracking-wider"
              >
                Video
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {content.subjects.map((subject, index) => (
              <tr
                key={index}
                className="hover:bg-teal-50 transition-colors duration-150"
              >
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-teal-900">
                  {subject.id}.
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700">
                  {subject.name}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                  <a
                    href={subject.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2 sm:px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                    <span className="hidden sm:inline">Watch</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DriveContent = ({ content }) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      {content.subjects.map((subject, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          <div className="border-l-4 border-teal-500 p-3 sm:p-4 hover:bg-teal-50 transition-colors duration-150">
            <h3 className="text-base sm:text-lg font-semibold text-teal-800 mb-2">
              {subject.name}
            </h3>

            {subject.content.map((unit, unitIndex) => (
              <div key={unitIndex} className="mb-3 last:mb-0">
                <h4 className="text-sm sm:text-md font-medium text-teal-700 mb-2">
                  {unit.unit}
                </h4>

                <ul className="space-y-1">
                  {unit.topics.map((topic, topicIndex) => (
                    <li key={topicIndex}>
                      <a
                        href={topic.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs sm:text-sm text-teal-600 hover:text-teal-800 transition-colors duration-150 break-words"
                      >
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="break-words">{topic.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AKNULMS;
