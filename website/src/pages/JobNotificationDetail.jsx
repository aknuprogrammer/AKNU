import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Briefcase,
  MapPin,
  Calendar,
  Users,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  BadgeCheck,
  Send,
} from "lucide-react";
import HiringApplicationForm from "../forms/HiringApplicationForm";

const JobNotificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const BACKEND_DOMAIN = import.meta.env.VITE_API_URL;
      let response;
      let jobData = null;

      // Try to find by Model_Jobs ID first (most common case when coming from Section_Information)
      try {
        response = await axios.get(`${BACKEND_DOMAIN}api/hiring/by-job/${id}`, {
          validateStatus: (status) => status < 500, // Don't throw on 404
        });
        if (response.status === 200 && response.data.success) {
          jobData = response.data.data;
        }
      } catch (firstError) {
        // If that fails, try direct hiring notification ID lookup
        console.log(
          "By-job lookup failed, trying direct hiring notification lookup..."
        );
      }

      // If by-job lookup didn't work, try direct hiring notification ID
      if (!jobData) {
        try {
          response = await axios.get(`${BACKEND_DOMAIN}api/hiring/${id}`, {
            validateStatus: (status) => status < 500, // Don't throw on 404
          });
          if (response.status === 200 && response.data.success) {
            jobData = response.data.data;
          }
        } catch (secondError) {
          // Both lookups failed
          console.log("Both lookups failed");
        }
      }

      // Show detail page - PDF opening is handled by Section_Information when clicking the job link
      if (jobData) {
        setJob(jobData);
      } else {
        console.error("Job notification not found");
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6] text-teal-800">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-800"></div>
          <p className="font-semibold text-teal-800 animate-pulse">
            Loading job details...
          </p>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-[#f4f7f6] pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-16 py-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-[#21605A] hover:text-teal-700 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold cursor-pointer">
              Back to Openings
            </span>
          </button>

          <div className="flex flex-col gap-4">
            <div>
              <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold mb-3">
                {job.departmentId?.title || "University Selection"}
              </span>
              <h1 className="text-3xl sm:text-3xl font-bold text-teal-700 mb-4">
                {job.jobTitle}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-gray-700">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-teal-700" />
                <span className="text-sm font-medium">
                  Main Campus, Rajamahendravaram
                </span>
              </div>
              <div className="flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-teal-700" />
                <span className="text-sm font-medium">
                  {job.requiredExperience}Years Experience
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-16 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Job Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Deadline
                  </p>
                  <p className="font-bold text-gray-800 text-sm">
                    {job.applicationDeadline
                      ? new Date(job.applicationDeadline).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )
                      : "Open"}
                  </p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Openings
                  </p>
                  <p className="font-bold text-gray-800 text-sm">
                    {job.openings} Positions
                  </p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center gap-2 text-center col-span-2 md:col-span-1">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                    Published
                  </p>
                  <p className="font-bold text-gray-800 text-sm">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-teal-800 mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-teal-700" />
                Job Description
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Required Skills */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-teal-800 mb-4 flex items-center">
                <BadgeCheck className="w-6 h-6 mr-3 text-teal-700" />
                Required Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills?.split(",").map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-teal-50 text-teal-800 rounded-lg border border-teal-200 text-sm font-semibold"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: CTA card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center sticky top-24">
              <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700 mx-auto mb-4">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-teal-700 mb-3">
                Ready to Apply?
              </h3>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Join our prestigious faculty and contribute to the academic
                excellence of Adikavi Nannaya University.
              </p>
              <button
                onClick={() => setShowApplyModal(true)}
                className="w-full py-3 px-6 bg-[#21605A] cursor-pointer text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 group"
              >
                Apply Now
                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="mt-6 bg-teal-50 rounded-lg p-5 border border-teal-200 flex items-start gap-3">
              <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-teal-800 text-sm mb-1">
                  University Verified
                </p>
                <p className="text-xs text-teal-700 leading-relaxed">
                  This is an official recruitment portal of Adikavi Nannaya
                  University. Your data is secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {showApplyModal && (
        <HiringApplicationForm
          job={job}
          onClose={() => setShowApplyModal(false)}
          isEmbedded={false}
          isOpen={showApplyModal}
        />
      )}
    </div>
  );
};

export default JobNotificationDetail;
