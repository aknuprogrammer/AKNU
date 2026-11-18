import React, { useEffect, useRef, useState } from "react";
import { Printer } from "lucide-react";
import { aknuadikavi, aknuLogoNew } from "../../../assets";
import { coursesApi } from "../../../services/apiService";
import { useReactToPrint } from "react-to-print";

export default function AcknowledgementModal({ student, onClose }) {
  const printRef = useRef();
  const [course, setCourse] = useState([]);

  const fetchData = async () => {
    const res = await coursesApi.getById(student.course);
    setCourse(res);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!student) return null;

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Admission Acknowledgement",
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden relative flex flex-col max-h-[90vh]">
        {/* 👇 Only this part will print */}
        <div ref={printRef} className="p-6 px-16 overflow-y-auto flex-1">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 mx-16 my-6">
            <img src={aknuLogoNew} alt="AKNU Logo" className="h-16 w-16" />
            <div className="text-center">
              <h2 className="text-xl font-bold">ADIKAVI NANNAYA UNIVERSITY</h2>
              <p>Rajamahendravaram, AP</p>
              {/* <h2 className="text-xl font-bold">
                DIRECTOR, DIRECTORATE OF ADMISSIONS{" "}
              </h2> */}
              {/* <h2 className="text-xl font-bold">ADIKAVI NANNAYA UNIVERSITY</h2> */}
              {/* <p className="text-sm">
                ADIKAVI NANNAYA UNIVERSITY :: RAJAMAHENDRAVARAM
              </p>
              <p className="text-md font-semibold mt-1">
                ADMISSION MEMO cum ACKNOWLEDGEMENT
              </p> */}
            </div>
            <img src={aknuadikavi} alt="Adikavi" className="h-16 w-16" />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <p>
                <strong>Hall Ticket No:</strong> {student.hallTicketNo}
              </p>
              <p>
                <strong>Date:</strong> {new Date().toLocaleDateString()}
              </p>
            </div>

            <p className="mt-6 text-justify indent-10">
              It is hereby informed that Mr/Ms/Mrs.{" "}
              <strong>
                {student.firstName} {student.lastName}
              </strong>{" "}
              is admitted in <strong>{student.course.name}</strong> course. The
              following Original Certificates are collected by the University
              along with fee:
            </p>

            <ul className="mt-6 ml-10 space-y-2">
              {student.documents.map((doc, index) => (
                <li key={index} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={doc.verified === "verified"}
                    disabled
                    className="mr-2 h-5 w-5"
                  />
                  <span>{doc.name}</span>
                </li>
              ))}
            </ul>

            <div>
              <h3 className="font-bold">Declaration by the Candidate:</h3>
              <p className="mt-2 text-justify indent-10">
                I hereby declare certify that the particulars given by me are
                true to my knowledge. if the above information is found to be
                false or untrue or misleading or misrepresenting. I am aware
                that I may be held liable for it. My candidature can be
                cancelled at any point of time without any notice.
              </p>
            </div>
            {/* <div className="mt-10 flex justify-between">
              <div>
                <p className="mb-1">Signature of the Scrutinizing Teachers:</p>
                <div className="mt-4 w-[100%] flex  justify-between items-center">
                  <div>
                    <p>1. </p>
                    <div className="w-56 ml-6 border-t border-black"></div>
                  </div>
                  <div className=" ml-24">
                    <p>2. </p>
                    <div className="w-56 ml-6 border-t border-black"></div>
                  </div>
                </div>
              </div>
            </div> */}

            <div className="mt-10 flex justify-between">
              <div>
                <p className="mb-1">Signature of the Student</p>
                <div className="mt-4 w-[100%] flex  justify-between items-center">
                  <div>
                    <p>1. </p>
                    <div className="w-56 ml-6 border-t border-black"></div>
                  </div>
                  {/* <div className=" ml-24">
                    <p>2. </p>
                    <div className="w-56 ml-6 border-t border-black"></div>
                  </div> */}
                </div>
              </div>
              <div>
                <p className="mb-1">Signature of Authorized Member</p>
                <div className="mt-4 w-[100%] flex  justify-between items-center">
                  <div>
                    <p>1. </p>
                    <div className="w-56 ml-6 border-t border-black"></div>
                  </div>
                  {/* <div className=" ml-24">
                    <p>2. </p>
                    <div className="w-56 ml-6 border-t border-black"></div>
                  </div> */}
                </div>
              </div>
            </div>
            {/* <div className="flex justify-end mt-10">
              <div className="text-center">
                <p className="font-semibold">DIRECTOR</p>
                <p className="font-semibold">DIRECTORATE OF ADMISSIONS</p>
              </div>
            </div> */}
          </div>
        </div>

        {/* 👇 These won’t print (outside ref) */}
        <div className="border-t border-gray-200 bg-gray-50 p-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" /> Print Acknowledgement
          </button>
        </div>
      </div>
    </div>
  );
}
