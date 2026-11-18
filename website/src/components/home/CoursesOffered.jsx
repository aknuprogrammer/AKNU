import React, { useState } from "react";

const courses = [
  {
    slNo: 1,
    name: "M. Sc. Mathematics",
    regular: 30,
    ews: 3,
    selfSupported: 6,
    total: 39,
  },
  {
    slNo: 2,
    name: "M.A. English",
    regular: 30,
    ews: 3,
    selfSupported: 6,
    total: 39,
  },
  {
    slNo: 3,
    name: "M.A. Political Science",
    regular: 30,
    ews: 3,
    selfSupported: 6,
    total: 39,
  },
  {
    slNo: 4,
    name: "M.A. Public Administration",
    regular: 30,
    ews: 3,
    selfSupported: 6,
    total: 39,
  },
  {
    slNo: 5,
    name: "M.A. Economics",
    regular: 30,
    ews: 3,
    selfSupported: 6,
    total: 39,
  },
  {
    slNo: 6,
    name: "M.Com.",
    regular: 30,
    ews: 3,
    selfSupported: 6,
    total: 39,
  },
  {
    slNo: 7,
    name: "MBA",
    regular: 60,
    ews: 6,
    selfSupported: 5,
    total: 71,
  },
  {
    slNo: 8,
    name: "M.C.A",
    regular: 60,
    ews: 6,
    selfSupported: 0,
    total: 66,
  },
];

const coursesTadepalligudem = [
  {
    slNo: 1,
    name: "M.Sc. Physics",
    regular: 30,
    ews: 3,
    selfSupported: 6,
    total: 39,
  },
  {
    slNo: 2,
    name: "M.Sc. Analytical Chemistry",
    regular: 15,
    ews: 2,
    selfSupported: 6,
    total: 23,
  },
  {
    slNo: 3,
    name: "M.Sc. Organic Chemistry",
    regular: 30,
    ews: 3,
    selfSupported: 6,
    total: 39,
  },
  {
    slNo: 4,
    name: "MBA",
    regular: 40,
    ews: 4,
    selfSupported: 5,
    total: 49,
  },
  {
    slNo: 5,
    name: "B.Pharmacy",
    regular: 60,
    ews: 6,
    selfSupported: 0,
    total: 66,
  },
];

export default function CoursesOffered() {
  const [open, setOpen] = useState(false);
  const [innerOpen, setInnerOpen] = useState(null);

  const collegeDropdowns = [
    {
      name: "University College of Science and Technology",
      content: (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full w-full border-collapse border border-gray-300 text-left text-sm">
            <thead className="bg-green-100 text-green-800 font-semibold">
              <tr>
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-3 py-2 align-middle"
                >
                  Sl. No.
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-3 py-2 align-middle"
                >
                  Course Name
                </th>
                <th
                  colSpan={3}
                  className="border border-gray-300 px-3 py-2 text-center"
                >
                  Sanctioned Intake
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-3 py-2 align-middle"
                >
                  Total Seats
                </th>
              </tr>
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-center">
                  Regular
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center">
                  EWS
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center">
                  Self Supported
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">1</td>
                <td className="border border-gray-300 px-3 py-2">
                  M. Sc. Aquaculture
                </td>
                <td className="border border-gray-300 px-3 py-2">16</td>
                <td className="border border-gray-300 px-3 py-2">2</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">28</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">2</td>
                <td className="border border-gray-300 px-3 py-2">
                  M. Sc. Biochemistry
                </td>
                <td className="border border-gray-300 px-3 py-2">15</td>
                <td className="border border-gray-300 px-3 py-2">2</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">23</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">3</td>
                <td className="border border-gray-300 px-3 py-2">
                  M. Sc. Biotechnology
                </td>
                <td className="border border-gray-300 px-3 py-2">15</td>
                <td className="border border-gray-300 px-3 py-2">2</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">23</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">4</td>
                <td className="border border-gray-300 px-3 py-2">
                  M. Sc. Botany
                </td>
                <td className="border border-gray-300 px-3 py-2">30</td>
                <td className="border border-gray-300 px-3 py-2">3</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">39</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">5</td>
                <td className="border border-gray-300 px-3 py-2">
                  M. Sc. Zoology
                </td>
                <td className="border border-gray-300 px-3 py-2">16</td>
                <td className="border border-gray-300 px-3 py-2">2</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">24</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">
                  M. Sc. Physics
                </td>
                <td className="border border-gray-300 px-3 py-2">30</td>
                <td className="border border-gray-300 px-3 py-2">3</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">39</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">7</td>
                <td className="border border-gray-300 px-3 py-2">
                  M. Sc. Applied Mathematics
                </td>
                <td className="border border-gray-300 px-3 py-2">45</td>
                <td className="border border-gray-300 px-3 py-2">5</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">56</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">8</td>
                <td className="border border-gray-300 px-3 py-2">
                  M. Sc. Mathematics
                </td>
                <td className="border border-gray-300 px-3 py-2">45</td>
                <td className="border border-gray-300 px-3 py-2">5</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">56</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">9</td>
                <td className="border border-gray-300 px-3 py-2">
                  M. Sc. Analytical Chemistry
                </td>
                <td className="border border-gray-300 px-3 py-2">15</td>
                <td className="border border-gray-300 px-3 py-2">2</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">23</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">10</td>
                <td className="border border-gray-300 px-3 py-2">
                  M. Sc. Organic Chemistry
                </td>
                <td className="border border-gray-300 px-3 py-2">30</td>
                <td className="border border-gray-300 px-3 py-2">3</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">39</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">11</td>
                <td className="border border-gray-300 px-3 py-2">
                  M. Sc. Geophysics
                </td>
                <td className="border border-gray-300 px-3 py-2">30</td>
                <td className="border border-gray-300 px-3 py-2">3</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">39</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">12</td>
                <td className="border border-gray-300 px-3 py-2">
                  M. Sc. Geology (Petroleum Exploration)
                </td>
                <td className="border border-gray-300 px-3 py-2">20</td>
                <td className="border border-gray-300 px-3 py-2">2</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">28</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">13</td>
                <td className="border border-gray-300 px-3 py-2">
                  M. Sc. Psychology
                </td>
                <td className="border border-gray-300 px-3 py-2">30</td>
                <td className="border border-gray-300 px-3 py-2">3</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">39</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">14</td>
                <td className="border border-gray-300 px-3 py-2">
                  M. Sc. Food Science & Technology
                </td>
                <td className="border border-gray-300 px-3 py-2">0</td>
                <td className="border border-gray-300 px-3 py-2">0</td>
                <td className="border border-gray-300 px-3 py-2">22</td>
                <td className="border border-gray-300 px-3 py-2">22</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">15</td>
                <td className="border border-gray-300 px-3 py-2">
                  M. Sc. Geoinformatics
                </td>
                <td className="border border-gray-300 px-3 py-2">20</td>
                <td className="border border-gray-300 px-3 py-2">2</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">28</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">16</td>
                <td className="border border-gray-300 px-3 py-2">
                  One Year PG Diploma in Child and Adolescent Guidance and
                  Counseling (Part Time)
                </td>
                <td className="border border-gray-300 px-3 py-2">40</td>
                <td className="border border-gray-300 px-3 py-2">4</td>
                <td className="border border-gray-300 px-3 py-2">0</td>
                <td className="border border-gray-300 px-3 py-2">44</td>
              </tr>
              <tr className="font-bold bg-green-200">
                <td className="border border-gray-300 px-3 py-2" colSpan={2}>
                  Total
                </td>
                <td className="border border-gray-300 px-3 py-2">397</td>
                <td className="border border-gray-300 px-3 py-2">43</td>
                <td className="border border-gray-300 px-3 py-2">106</td>
                <td className="border border-gray-300 px-3 py-2">550</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      name: "University College of Arts and Commerce",
      content: (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full w-full border-collapse border border-gray-300 text-left text-sm">
            <thead className="bg-green-100 text-green-800 font-semibold">
              <tr>
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-3 py-2 align-middle"
                >
                  Sl. No.
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-3 py-2 align-middle"
                >
                  Course Name
                </th>
                <th
                  colSpan={3}
                  className="border border-gray-300 px-3 py-2 text-center"
                >
                  Sanctioned Intake
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-3 py-2 align-middle"
                >
                  Total Seats
                </th>
              </tr>
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-center">
                  Regular
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center">
                  EWS
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center">
                  Self Supported
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">1</td>
                <td className="border border-gray-300 px-3 py-2">M.Com.</td>
                <td className="border border-gray-300 px-3 py-2">30</td>
                <td className="border border-gray-300 px-3 py-2">3</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">39</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">2</td>
                <td className="border border-gray-300 px-3 py-2">
                  M. A. Economics
                </td>
                <td className="border border-gray-300 px-3 py-2">30</td>
                <td className="border border-gray-300 px-3 py-2">3</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">39</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">3</td>
                <td className="border border-gray-300 px-3 py-2">
                  M. A. Political Science
                </td>
                <td className="border border-gray-300 px-3 py-2">30</td>
                <td className="border border-gray-300 px-3 py-2">3</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">39</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">4</td>
                <td className="border border-gray-300 px-3 py-2">
                  M. A. Social Work
                </td>
                <td className="border border-gray-300 px-3 py-2">30</td>
                <td className="border border-gray-300 px-3 py-2">3</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">39</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">5</td>
                <td className="border border-gray-300 px-3 py-2">
                  M.A. English
                </td>
                <td className="border border-gray-300 px-3 py-2">30</td>
                <td className="border border-gray-300 px-3 py-2">3</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">39</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">
                  M. A. Telugu
                </td>
                <td className="border border-gray-300 px-3 py-2">30</td>
                <td className="border border-gray-300 px-3 py-2">3</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">39</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">7</td>
                <td className="border border-gray-300 px-3 py-2">MBA</td>
                <td className="border border-gray-300 px-3 py-2">30</td>
                <td className="border border-gray-300 px-3 py-2">3</td>
                <td className="border border-gray-300 px-3 py-2">5</td>
                <td className="border border-gray-300 px-3 py-2">38</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">8</td>
                <td className="border border-gray-300 px-3 py-2">MBA (T&H)</td>
                <td className="border border-gray-300 px-3 py-2">30</td>
                <td className="border border-gray-300 px-3 py-2">3</td>
                <td className="border border-gray-300 px-3 py-2">5</td>
                <td className="border border-gray-300 px-3 py-2">38</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">9</td>
                <td className="border border-gray-300 px-3 py-2">
                  Diploma in Kuchipudi (1 year PT)
                </td>
                <td className="border border-gray-300 px-3 py-2">20</td>
                <td className="border border-gray-300 px-3 py-2">2</td>
                <td className="border border-gray-300 px-3 py-2">0</td>
                <td className="border border-gray-300 px-3 py-2">22</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">10</td>
                <td className="border border-gray-300 px-3 py-2">
                  P.G. Diploma in Yoga (1 year PT)
                </td>
                <td className="border border-gray-300 px-3 py-2">50</td>
                <td className="border border-gray-300 px-3 py-2">5</td>
                <td className="border border-gray-300 px-3 py-2">0</td>
                <td className="border border-gray-300 px-3 py-2">55</td>
              </tr>
              <tr className="font-bold bg-green-200">
                <td className="border border-gray-300 px-3 py-2" colSpan={2}>
                  Total
                </td>
                <td className="border border-gray-300 px-3 py-2">310</td>
                <td className="border border-gray-300 px-3 py-2">31</td>
                <td className="border border-gray-300 px-3 py-2">46</td>
                <td className="border border-gray-300 px-3 py-2">387</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      name: "University College of Education",
      content: (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full w-full border-collapse border border-gray-300 text-left text-sm">
            <thead className="bg-green-100 text-green-800 font-semibold">
              <tr>
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-3 py-2 align-middle"
                >
                  Sl. No.
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-3 py-2 align-middle"
                >
                  Course Name
                </th>
                <th
                  colSpan={3}
                  className="border border-gray-300 px-3 py-2 text-center"
                >
                  Sanctioned Intake
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-3 py-2 align-middle"
                >
                  Total Seats
                </th>
              </tr>
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-center">
                  Regular
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center">
                  EWS
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center">
                  Self Supported
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">1</td>
                <td className="border border-gray-300 px-3 py-2">M.P.Ed.</td>
                <td className="border border-gray-300 px-3 py-2">40</td>
                <td className="border border-gray-300 px-3 py-2">4</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">50</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">2</td>
                <td className="border border-gray-300 px-3 py-2">B.Ed</td>
                <td className="border border-gray-300 px-3 py-2">50</td>
                <td className="border border-gray-300 px-3 py-2">5</td>
                <td className="border border-gray-300 px-3 py-2">0</td>
                <td className="border border-gray-300 px-3 py-2">55</td>
              </tr>
              <tr className="font-bold bg-green-200">
                <td className="border border-gray-300 px-3 py-2" colSpan={2}>
                  Total
                </td>
                <td className="border border-gray-300 px-3 py-2">90</td>
                <td className="border border-gray-300 px-3 py-2">9</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">105</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      name: "University College of Engineering",
      content: (
        <div className="overflow-x-auto w-full">
          <table className="min-w-full w-full border-collapse border border-gray-300 text-left text-sm">
            <thead className="bg-green-100 text-green-800 font-semibold">
              <tr>
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-3 py-2 align-middle"
                >
                  Sl. No.
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-3 py-2 align-middle"
                >
                  Course Name
                </th>
                <th
                  colSpan={3}
                  className="border border-gray-300 px-3 py-2 text-center"
                >
                  Sanctioned Intake
                </th>
                <th
                  rowSpan={2}
                  className="border border-gray-300 px-3 py-2 align-middle"
                >
                  Total Seats
                </th>
              </tr>
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-center">
                  Regular
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center">
                  EWS
                </th>
                <th className="border border-gray-300 px-3 py-2 text-center">
                  Self Supported
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">1</td>
                <td className="border border-gray-300 px-3 py-2">MCA</td>
                <td className="border border-gray-300 px-3 py-2">60</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">0</td>
                <td className="border border-gray-300 px-3 py-2">66</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">2</td>
                <td className="border border-gray-300 px-3 py-2">B.Tech CSE</td>
                <td className="border border-gray-300 px-3 py-2">60</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">0</td>
                <td className="border border-gray-300 px-3 py-2">66</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">3</td>
                <td className="border border-gray-300 px-3 py-2">
                  B.Tech Mech.
                </td>
                <td className="border border-gray-300 px-3 py-2">60</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">0</td>
                <td className="border border-gray-300 px-3 py-2">66</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">4</td>
                <td className="border border-gray-300 px-3 py-2">B.Tech ECE</td>
                <td className="border border-gray-300 px-3 py-2">60</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">0</td>
                <td className="border border-gray-300 px-3 py-2">66</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">5</td>
                <td className="border border-gray-300 px-3 py-2">B.Tech EIE</td>
                <td className="border border-gray-300 px-3 py-2">60</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">0</td>
                <td className="border border-gray-300 px-3 py-2">66</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">
                  B.Tech CIVIL
                </td>
                <td className="border border-gray-300 px-3 py-2">60</td>
                <td className="border border-gray-300 px-3 py-2">6</td>
                <td className="border border-gray-300 px-3 py-2">0</td>
                <td className="border border-gray-300 px-3 py-2">66</td>
              </tr>
              <tr className="odd:bg-white even:bg-green-50">
                <td className="border border-gray-300 px-3 py-2">7</td>
                <td className="border border-gray-300 px-3 py-2">
                  M.Tech (CSE)
                </td>
                <td className="border border-gray-300 px-3 py-2">20</td>
                <td className="border border-gray-300 px-3 py-2">0</td>
                <td className="border border-gray-300 px-3 py-2">5</td>
                <td className="border border-gray-300 px-3 py-2">25</td>
              </tr>
              <tr className="font-bold bg-green-200">
                <td className="border border-gray-300 px-3 py-2" colSpan={2}>
                  Total
                </td>
                <td className="border border-gray-300 px-3 py-2">380</td>
                <td className="border border-gray-300 px-3 py-2">36</td>
                <td className="border border-gray-300 px-3 py-2">5</td>
                <td className="border border-gray-300 px-3 py-2">421</td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
  ];

  return (
    <div className="w-[96%] mx-auto mt-0 mb-8">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex justify-between items-center px-6 py-4 bg-green-100 hover:bg-green-200 transition font-semibold text-green-900 text-lg rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        aria-expanded={open}
        aria-controls="courses-table"
      >
        <span>Courses Offered</span>
        <svg
          className={`w-6 h-6 transform transition-transform duration-300 ${
            open ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div
          id="courses-table"
          className="bg-white p-6 border border-t-0 border-gray-300 rounded-b-lg shadow-inner animate-fade-in w-full"
        >
          <h3 className="text-xl font-bold text-teal-700 mb-4 text-center uppercase tracking-wide">
            AKNU Campus College, Kakinada
          </h3>
          <div className="overflow-x-auto w-full mb-8">
            <table className="min-w-full w-full border-collapse border border-gray-300 text-left text-sm">
              <thead className="bg-green-100 text-green-800 font-semibold">
                <tr>
                  <th className="border border-gray-300 px-3 py-2">Sl. No.</th>
                  <th className="border border-gray-300 px-3 py-2">
                    Course Name
                  </th>
                  <th className="border border-gray-300 px-3 py-2">Regular</th>
                  <th className="border border-gray-300 px-3 py-2">EWS</th>
                  <th className="border border-gray-300 px-3 py-2">
                    Self Supported
                  </th>
                  <th className="border border-gray-300 px-3 py-2">
                    Total Seat
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr
                    key={course.slNo}
                    className="odd:bg-white even:bg-green-50"
                  >
                    <td className="border border-gray-300 px-3 py-2">
                      {course.slNo}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {course.name}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {course.regular}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {course.ews}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {course.selfSupported}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {course.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-bold text-teal-700 mb-4 text-center uppercase tracking-wide">
            AKNU Campus College, Tadepalligudem
          </h3>
          <div className="overflow-x-auto w-full mb-8">
            <table className="min-w-full w-full border-collapse border border-gray-300 text-left text-sm">
              <thead className="bg-green-100 text-green-800 font-semibold">
                <tr>
                  <th className="border border-gray-300 px-3 py-2">Sl. No.</th>
                  <th className="border border-gray-300 px-3 py-2">
                    Course Name
                  </th>
                  <th className="border border-gray-300 px-3 py-2">Regular</th>
                  <th className="border border-gray-300 px-3 py-2">EWS</th>
                  <th className="border border-gray-300 px-3 py-2">
                    Self Supported
                  </th>
                  <th className="border border-gray-300 px-3 py-2">
                    Total Seat
                  </th>
                </tr>
              </thead>
              <tbody>
                {coursesTadepalligudem.map((course) => (
                  <tr
                    key={course.slNo}
                    className="odd:bg-white even:bg-green-50"
                  >
                    <td className="border border-gray-300 px-3 py-2">
                      {course.slNo}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {course.name}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {course.regular}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {course.ews}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {course.selfSupported}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {course.total}
                    </td>
                  </tr>
                ))}
                <tr className="font-bold bg-green-200">
                  <td className="border border-gray-300 px-3 py-2" colSpan={2}>
                    Total
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    {coursesTadepalligudem.reduce(
                      (acc, course) => acc + course.regular,
                      0
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    {coursesTadepalligudem.reduce(
                      (acc, course) => acc + course.ews,
                      0
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    {coursesTadepalligudem.reduce(
                      (acc, course) => acc + course.selfSupported,
                      0
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-2">
                    {coursesTadepalligudem.reduce(
                      (acc, course) => acc + course.total,
                      0
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Inner Dropdowns for Colleges - moved below tables and set to full width */}
          <div className="mb-0 w-full">
            {collegeDropdowns.map((college, idx) => (
              <div
                key={college.name}
                className="border border-gray-200 rounded-md mb-4 w-full"
              >
                <button
                  type="button"
                  className="w-full flex justify-between items-center px-4 py-3 text-left text-green-800 font-semibold hover:bg-green-100 transition"
                  onClick={() => setInnerOpen(innerOpen === idx ? null : idx)}
                  aria-expanded={innerOpen === idx}
                  aria-controls={`${college.name}-content`}
                >
                  {college.name}
                  <span className="ml-2 text-xl font-bold select-none">
                    {innerOpen === idx ? "−" : "+"}
                  </span>
                </button>
                {innerOpen === idx && (
                  <div
                    id={`${college.name}-content`}
                    className="px-6 py-4 text-gray-700 text-sm bg-green-50 w-full"
                  >
                    {college.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
