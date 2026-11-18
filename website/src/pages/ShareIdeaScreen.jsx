import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import ReCAPTCHA from "react-google-recaptcha";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { BackButton } from "../components/BackButton";
import { useNavigate } from "react-router-dom";

// ⭐ ZOD VALIDATION SCHEMA
const FormSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  mobile: z
    .string()
    .min(10, "Mobile number must be 10 digits")
    .max(10, "Mobile number must be 10 digits")
    .regex(/^[0-9]+$/, "Only digits allowed"),
  college: z.string().min(1, "College is required").max(120),
  addr: z.string().min(1, "Address is required").max(200),
  idea: z
    .any()
    .refine(
      (files) => files && files.length > 0,
      "Ideation document is required"
    )
    .refine(
      (files) => files[0]?.size <= 10 * 1024 * 1024,
      "File size must be less than 10MB"
    )
    .refine((files) => {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      return files[0] && allowedTypes.includes(files[0]?.type);
    }, "Only PDF and Word documents are allowed"),

  // ⭐ STRICT CHECKBOX VALIDATION
  agree: z.boolean().refine((val) => val === true, {
    message: "You must agree before submitting",
  }),
});

const FeedbackForm = () => {
  const navigate = useNavigate();
  const recaptchaRef = useRef();
  const formRef = useRef(null);
  const imageContainerRef = useRef(null);
  const [showAlert, setShowAlert] = useState(false);
  const [textareaLength, setTextareaLength] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      college: "",
      addr: "",
      idea: undefined,
      agree: false,
    },
  });

  // ⭐ SUBMIT HANDLER
  const onSubmit = async (data) => {
    const token = recaptchaRef.current?.getValue();
    if (!token) {
      alert("Please complete the captcha");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("mobile", data.mobile);
      formData.append("college", data.college);
      formData.append("addr", data.addr);
      formData.append("idea", data.idea[0]);
      formData.append("agree", data.agree);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}api/submit-idea`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Failed");

      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);

      reset();
      setTextareaLength(0);
      recaptchaRef.current.reset();
      // navigate("/");
    } catch (err) {
      console.error(err);
      alert("Submission failed");
    }
  };

  // Match image height to form height
  useEffect(() => {
    const updateImageHeight = () => {
      if (formRef.current && imageContainerRef.current) {
        // Use offsetHeight for more accurate height calculation
        const formHeight = formRef.current.offsetHeight;

        if (formHeight > 0) {
          // Set height and max-height to prevent exceeding form height
          imageContainerRef.current.style.height = `${formHeight}px`;
          imageContainerRef.current.style.maxHeight = `${formHeight}px`;
          imageContainerRef.current.style.overflow = "hidden";
        }
      }
    };

    // Initial update with multiple attempts to ensure DOM is ready
    const timer1 = setTimeout(updateImageHeight, 50);
    const timer2 = setTimeout(updateImageHeight, 200);
    const timer3 = setTimeout(updateImageHeight, 500);
    const timer4 = setTimeout(updateImageHeight, 1000);

    // Use ResizeObserver if available for better performance
    let resizeObserver = null;
    if (window.ResizeObserver && formRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateImageHeight();
      });
      resizeObserver.observe(formRef.current);
    }

    window.addEventListener("resize", updateImageHeight);

    // Update when form content changes (observing mutations)
    const observer = new MutationObserver(() => {
      setTimeout(updateImageHeight, 50);
    });

    if (formRef.current) {
      observer.observe(formRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "style"],
        characterData: true,
      });
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      window.removeEventListener("resize", updateImageHeight);
      if (observer) {
        observer.disconnect();
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [showAlert, errors]);

  return (
    <div className="bg-gray-50 min-h-screen px-4 sm:px-16 pt-10 md:pt-8 mb-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-2">
          <BackButton />
        </div>

        <h1 className="text-3xl font-bold text-teal-800 mb-2 text-center">
          Share Your Ideas/Concept
        </h1>
        <p className="text-gray-600 mb-6 md:mb-8 text-center text-xl">
          Help us build better initiatives for the University
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 items-start">
          {/* LEFT IMAGE */}
          <div
            ref={imageContainerRef}
            className="md:col-span-2 overflow-hidden rounded-lg shadow-md"
            style={{ display: "flex", alignItems: "stretch" }}
          >
            <img
              src="https://images.pexels.com/photos/5922680/pexels-photo-5922680.jpeg?_gl=1*bz5t0i*_ga*MTA0MDQyMTg1Mi4xNzYzNDgzOTgx*_ga_8JE65Q40S6*czE3NjM0ODM5ODEkbzEkZzEkdDE3NjM0ODM5OTUkajQ2JGwwJGgw"
              alt="University Idea"
              className="w-full h-full rounded-lg object-cover"
              style={{ objectPosition: "center", display: "block", flex: "1" }}
            />
          </div>

          {/* SUCCESS POPUP */}
          {showAlert && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-green-300 text-green-700 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <span className="font-semibold">Submitted successfully!</span>
            </div>
          )}

          {/* RIGHT SIDE FORM */}
          <div
            ref={formRef}
            className="md:col-span-3 bg-white rounded-xl shadow-lg p-6 md:p-5"
          >
            {/* <h2 className="text-3xl md:text-4xl font-extrabold text-teal-800 mb-2">
              Submit Your Idea
            </h2> */}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 md:space-y-4"
            >
              {/* NAME AND EMAIL IN ONE LINE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* NAME */}
                <div>
                  <label className="block font-semibold text-gray-700 text-sm mb-1.5">
                    Full Name *
                  </label>
                  <input
                    {...register("name")}
                    type="text"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block font-semibold text-gray-700 text-sm mb-1">
                    Email Address *
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* MOBILE AND COLLEGE IN ONE LINE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* MOBILE */}
                <div>
                  <label className="block font-semibold text-gray-700 text-sm mb-1.5">
                    Mobile Number *
                  </label>
                  <input
                    {...register("mobile")}
                    type="tel"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    placeholder="10-digit mobile"
                  />
                  {errors.mobile && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.mobile.message}
                    </p>
                  )}
                </div>

                {/* COLLEGE */}
                <div>
                  <label className="block font-semibold text-gray-700 text-sm mb-1.5">
                    College *
                  </label>
                  <input
                    {...register("college")}
                    type="text"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    placeholder="Enter your college name"
                  />
                  {errors.college && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.college.message}
                    </p>
                  )}
                </div>
              </div>

              {/* ADDRESS */}
              <div>
                <label className="block font-semibold text-gray-700 text-sm mb-1.5">
                  Submit your Idea *
                </label>
                <div className="relative">
                  <textarea
                    {...register("addr")}
                    rows={2}
                    maxLength={500}
                    onChange={(e) => setTextareaLength(e.target.value.length)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition resize-none"
                    placeholder="Enter your idea..."
                  ></textarea>
                  <span className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {textareaLength}/500
                  </span>
                </div>
                {errors.addr && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.addr.message}
                  </p>
                )}
              </div>

              {/* IDEA DOCUMENT */}
              <div>
                <label className="block font-semibold text-gray-700 text-sm mb-1.5">
                  Submit your ideation document *
                </label>
                <input
                  {...register("idea")}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: PDF, DOC, DOCX (Max size: 10MB)
                </p>
                {errors.idea && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.idea.message}
                  </p>
                )}
              </div>

              {/* CHECKBOX */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  {...register("agree")}
                  className="mt-0.5 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <label className="text-sm text-gray-700">
                  I confirm and agree the above information is correct, the idea
                  can be implemented and utilized by the university.
                </label>
              </div>
              {errors.agree && (
                <p className="text-red-500 text-sm">{errors.agree.message}</p>
              )}

              {/* CAPTCHA */}
              <div className="flex items-center justify-between">
                <div className="transform scale-75 origin-left">
                  <ReCAPTCHA
                    sitekey="6Lfba08rAAAAAB0Da_06llux8k6EOOtHizO7Z_GZ"
                    ref={recaptchaRef}
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-700 text-white text-md font-semibold rounded-md hover:bg-teal-800 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Submit Now
                </button>
              </div>

              {/* SUBMIT */}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
