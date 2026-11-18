import React, { useState } from "react";
import { ContactPageData } from "../../siteData/homeData";
import { BsChatSquareFill } from "react-icons/bs";
import { AiOutlineClose } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

export default function ContactCard() {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    aadhar: "",
    message: "",
  });
  return (
    <section
      id="cards"
      className="flex flex-wrap justify-center gap-8 p-8 bg-gray-100 "
    >
      {ContactPageData.map(({ title, bgGradient, Icon, details }, i) => (
        <div
          key={i}
          className={`relative w-64 rounded-xl p-6 shadow-md border border-black/5 transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg overflow-hidden ${bgGradient}`}
        >
          <div className="relative z-20 flex flex-col h-full">
            <div className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center mb-5 shadow-md">
              {Icon ? (
                <Icon className="w-6 h-6 text-white" />
              ) : (
                <svg
                  className="w-6 h-6 fill-white"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                ></svg>
              )}
            </div>

            <h3 className="text-white text-xl font-semibold mb-4 relative inline-block after:absolute after:content-[''] after:left-0 after:-bottom-2 after:w-10 after:h-[2px] after:bg-white/60 after:rounded-sm">
              {title}
            </h3>

            <ul className="text-white text-sm flex flex-col gap-2 list-none">
              {details.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start leading-relaxed before:content-['•'] before:mr-2 before:text-white before:font-bold"
                >
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-auto flex justify-end">
              <button
                aria-label="Message"
                className="bg-transparent border-none cursor-pointer p-0"
                // onClick={() => setShowModal(true)}
              >
                <BsChatSquareFill className="bg-white rounded-2xl p-2 w-10 h-8 text-teal-500" />
              </button>
            </div>
          </div>
          {showModal && (
            <div className="fixed inset-0 px-2 z-50 flex items-center justify-center p-4  backdrop-blur-sm bg-white/30">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden">
                {/* Close Button */}
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-teal-700 transition-colors text-3xl"
                  onClick={() => setShowModal(false)}
                  aria-label="Close modal"
                >
                  <AiOutlineClose />
                </button>

                {/* Header */}
                <div className="bg-teal-700 p-6">
                  <h2 className="text-3xl font-bold text-white">Contact Us</h2>
                  <p className="text-[#a8d8d3] mt-1">
                    We'll get back to you shortly
                  </p>
                </div>

                {/* Form */}
                <form
                  className="p-6 space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    // handle send here
                    setShowModal(false);
                    navigate("/")
                  }}
                >
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-teal-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition-all"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-teal-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition-all"
                      value={form.phone}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only numbers and limit to 10 digits
                        if (/^\d{0,10}$/.test(value)) {
                          setForm((f) => ({ ...f, phone: value }));
                        }
                      }}
                      maxLength={10}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-teal-700">
                      Aadhar Number
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Aadhar number"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition-all"
                      value={form.aadhar}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only numbers and limit to 10 digits
                        if (/^\d{0,12}$/.test(value)) {
                          setForm((f) => ({ ...f, phone: value }));
                        }
                      }}
                      maxLength={12}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-teal-700">
                      Message
                    </label>
                    <textarea
                      placeholder="Your message here..."
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition-all min-h-[100px]"
                      value={form.message}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, message: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-teal-700 hover:bg-[#005a50] text-white font-medium py-3 rounded-lg shadow-md transition-all duration-200 transform hover:scale-[1.01]"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-xl"></div>
        </div>
      ))}
    </section>
  );
}
