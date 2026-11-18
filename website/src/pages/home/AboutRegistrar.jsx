import React from "react";
import { kvswamy } from "@/assets";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const AboutRegistrar = () => {
  return (
    <div className="px-4 sm:px-16 pt-10 md:pt-16" id="about-registrar">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Text Left */}
        <div className="lg:w-1/2 w-full mt-6">
          <section>
            <h2 className="text-3xl font-bold text-teal-800 mb-4">REGISTRAR</h2>
            <p className="text-gray-700 mb-4 text-[16px] text-justify">
              Prof. K. V. Swamy serves as the Dean (In-Charge) of Academic
              Affairs at Adikavi Nannaya University, bringing extensive
              experience in academic administration and governance. He plays a
              pivotal role in shaping the academic policies, curriculum
              development, and ensuring the highest standards of education
              across all programs offered by the university. With a
              distinguished academic career, Prof. Swamy has been instrumental
              in fostering an environment of academic excellence, research
              innovation, and student-centric learning. His leadership in
              Academic Affairs encompasses oversight of academic programs,
              faculty development, student academic services, and maintaining
              the quality benchmarks set by regulatory bodies. I take this
              opportunity to convey my sincere and heartfelt wishes to all
              faculty members, staff, and students of our esteemed institution.
            </p>
            <div className="flex group relative">
              <Link
                to="/AboutRegistrar"
                className="inline-flex items-center gap-1 text-[#004d40] font-medium text-xl transition-all duration-300 hover:text-[#00695c]"
              >
                Know More
                <ArrowUpRight
                  size={18}
                  className="transform transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>
            </div>
          </section>
        </div>
        {/* Image Right */}
        <div className="lg:w-1/2 w-full">
          <div className="rounded-xl overflow-hidden shadow-md">
            <img
              src={kvswamy}
              alt="Registrar"
              className="w-full h-auto max-h-[400px] object-cover object-center"
            />
            <h1 className="py-3 px-4 text-xl">Prof. K. V. Swamy</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutRegistrar;
