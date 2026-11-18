import { useState } from "react";
import {
    main_collegeList,
    main_courseList,
    main_examFeeTypeList,
} from "./Data";
import { BackButton } from "../../components/BackButton";
import { Link } from "react-router-dom";

const Page_FeeStatus = () => {
    const [formData, setFormData] = useState({
        termsAccepted: false,
    });

    const [formErrors, setFormErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let val = type === "checkbox" ? checked : value;
        if (name === "mobileNumber")
            val = val.replace(/[^0-9]/g, "").slice(0, 10);
        setFormData({ ...formData, [name]: val });
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.registrationNumber.trim())
            errors.registrationNumber = "Required";
        if (!formData.nameSSC.trim()) errors.nameSSC = "Required";
        if (!formData.selectCourse) errors.selectCourse = "Required";
        if (!formData.selectCollege) errors.selectCollege = "Required";
        if (!formData.semesterYear) errors.semesterYear = "Required";
        if (!formData.feeType) errors.feeType = "Required";
        if (!formData.totalFee.trim()) errors.totalFee = "Required";
        if (!formData.mobileNumber || formData.mobileNumber.length !== 10)
            errors.mobileNumber = "Enter 10-digit number";
        if (!formData.eMail.trim() || !/^\S+@\S+\.\S+$/.test(formData.eMail))
            errors.eMail = "Valid email required";
        if (!formData.termsAccepted)
            errors.termsAccepted = "You must accept terms";
        return errors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = validateForm();
        setFormErrors(errors);
        if (Object.keys(errors).length === 0) {
            alert("Form submitted successfully!");
        }
    };

    return (
        <main className="p-[100px_20%] bg-gray-50 min-h-screen pt-10">
            <BackButton className="mb-10" />
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-teal-700 p-6 text-white">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Payment Status Verification/Print Receipt
                    </h2>
                </div>
                <div className="px-8 py-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <input
                                type="text"
                                name="registrationNumber"
                                placeholder="Enter Registration Number"
                                value={formData.registrationNumber}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-md"
                            />
                        </div>
                    </div>

                    <div className="text-center mt-6">
                        <button
                            onClick={handleSubmit}
                            className="bg-[#2B7870] text-white px-6 py-2 rounded-md transition"
                        >
                            Check Status
                        </button>
                    </div>
                </div>
            </div>
            <br />
            <br />
            <br />
            <br />
            <br />
            <div className="flex gap-[20px]">
                <Link
                    to="/fee-pay/exam"
                    className="bg-teal-700 text-white p-[15px_30px] font-bold rounded-md"
                >
                    Exam fee Payment
                </Link>
                <Link
                    to="/fee-pay"
                    className="bg-teal-700 text-white p-[15px_30px] font-bold rounded-md"
                >
                    Certificate Fee Payment
                </Link>
            </div>
        </main>
    );
};

export default Page_FeeStatus;
