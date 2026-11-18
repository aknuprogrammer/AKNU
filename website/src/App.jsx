import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Navbar from "./components/Navbar";
import Carousel from "./components/home/Carousel";
import CardSlider from "./components/home/CardSlider";
import CourseFinder from "./components/home/CourseFinder";
import Glance from "./components/home/Glance";
import VibrantCampuses from "./components/home/VibrantCampuses";
import PrestigiousPartnerships from "./components/home/PrestigiousPartnerships";
import StudentsSay from "./components/home/StudentsSay";
import HumansAknu from "./components/home/HumansAknu";
import UpcomingEvents from "./components/home/UpcomingEvents";
import Footer from "./components/Footer";
import AknuAlumni from "./components/AknuAlumni";

import "./styles.css";
import AboutVC from "./pages/home/AboutVC";
import AboutChancellor from "./pages/home/AboutChancellor";
import AboutRegistrar from "./pages/home/AboutRegistrar";
import AboutAKNU from "./pages/home/AboutAKNU";
import Home from "./pages/Home";
// import About from "./pages/AboutUs";

import Contact from "./pages/Contact";
import CACDepartment from "./Departments/CACDepartment";
import AdmissionPage from "./components/AdmissionPage";
import AknuKkd from "./components/AknuKkd";
import AknuTpg from "./components/AknuTpg";
import AknuMain from "./components/AknuMain";
import STDepartment from "./Departments/STDepartment";
import EDepartment from "./Departments/EDepartment";
import EduDepartment from "./Departments/EduDepartment";
import Section_LatestNews from "./sections/page_home/Section_LatestNews";
import Section_Announcements from "./sections/page_home/Section_Announcements";
import Section_Information from "./sections/page_home/Section_Information";
import Courses from "./pages/home/Courses";
import ChatWithUs from "./pages/chat";
import ChatWithUsPage from "./pages/chat_with_us/ChatWithUs";
import Page_CentralLibrary from "./pages/facilities/Page_CentralLibrary";
import Page_GirlsHostel from "./pages/facilities/Page_GirlsHostel";
import Page_SportsBoard from "./pages/facilities/Page_SportsBoard";
import Page_MensHostel from "./pages/facilities/Page_MensHostel";
import NotificationBar from "./components/NotificationBar";
import ProgramFinder from "./components/ProgramFinder";
import CampusLife from "./pages/campusLife";
import CampusLifeGallery from "./pages/CampusLifeGallery";
import LatestNews from "./components/home/LatestNews";
import LanguageCard from "./components/home/LanguageCard";
import PlacementDashboard from "./pages/PlacementDashboard";
import AcademicCV from "./pages/KnowMoreVc";
import AcademicCVChancellor from "./pages/KnowMoreChancellor";
import AcadamicAffairs from "./pages/AcademicAffairs";
import AdmissionPageLogin from "./components/AdmissionPageLogin";

import Admission from "./pages/Admission";
import AcademicProgramsPage from "./pages/AcademicProgramsPage";
import WhyChooseUs from "./components/home/WhyChooseUs";
import AknuFaculty from "./components/AknuFaculty";
import BoardResearchStudies from "./components/r&dcell/BoardResearchStudies";
import RecognizedResearchGuides from "./components/r&dcell/RecognizedResearchGuides";
import ROI from "./components/r&dcell/ROI";
import ThesisSection from "./components/r&dcell/ThesisSection";
import PhdAwardees from "./components/r&dcell/PhdAwardees";
import ResearchProjects from "./components/r&dcell/ResearchProjects";
import ResearchAwards from "./components/r&dcell/ResearchAwards";
import Mou from "./components/r&dcell/Mou";
import Patents from "./components/r&dcell/Patents";
import Collaborations from "./components/r&dcell/Collaborations";
import SustainableDevelopment from "./pages/SustainableDevelopment";
import WomenCell from "./pages/WomenCell";
import FeedbackForm from "./pages/FeedbackForm";
import AffiliatedColleges from "./pages/AffiliatedColleges";
import SportsBoard from "./pages/facilities/SportsBoard";
import AboutNss from "./pages/facilities/NSS/AboutNss";
import MajorActivities from "./pages/facilities/NSS/MajorActivities";

import SpecialCamp from "./pages/facilities/NSS/SpecialCamp";
import RegularActivities from "./pages/facilities/NSS/RegularActivities";
import ExecutiveCouncil from "./components/ExecutiveCoucil";
import AdministrativeRoles from "./components/AdministrativeRoles";
import Page_FeeStructrure from "./pages/fee/Page_FeeStructure";
import Page_ExamFee from "./pages/fee/Page_ExamFee";
import Page_CertificateFee from "./pages/fee/Page_CertificateFee";
import Page_FeeStatus from "./pages/fee/Page_FeeStatus";
import FormUpload from "./pages/FormData";
import MultiPageForm from "./pages/formdata/MultiPageForm";
import AdminDashboard from "./pages/FormUploadAdmin";
import DynamicSection from "./components/home/dynamicSection";
import NotFound from "./components/NotFound";
import Studentaffairs from "./components/home/Studentaffairs";
import Spruha from "./components/home/Spruha";
import VideoGallery from "./components/home/InternationalStudents";
import STCell from "./components/home/STCell";
import EqualOpportunityCell from "./components/home/EqualOpportunityCell";
import Iqac from "./components/home/Iqac";

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import StudentResultViewer from "./pages/results/results";
import EduPharmacy from "./Departments/pharmacyDepartment";
import NannayaVani from "./components/home/nannayaVani/NannayaVani";
import PgSyllabus from "./pages/syllabus/PgSyllabus";
import UgSyllabus from "./pages/syllabus/UgSyllabus";
import RTIPage from "./pages/RTIPage";
import FinancePage from "./pages/Financepage";
import ReviewPage from "./pages/fee/CertPreview";
import FeePaymentSuccess from "./pages/fee/PaymentSuccess";
import ExamFeeForm from "./pages/fee/ExamFee";
import AffiliationFeeForm from "./pages/fee/AfffilitiedForm";
import SportsFeeForm from "./pages/fee/SportsFee";
import HostelFeeForm from "./pages/fee/HostelFee";
import AdmissionFeeForm from "./pages/fee/AdmissionFee";
import UnderDevelopment from "./components/underDevelopment/UnderDevelopment";
import AKNULMS from "./components/home/quickLinks/AknuLms";
import UGCCell from "./pages/committe/UgcCell";
import CommitteeCell from "./pages/committe";
import ChatBot_Thinkstack from "./components/Chatbot";
import Admission_ApplyNowForm from "./forms/Admission_ApplyNowForm";
import AlumniProfilePage from "./pages/AlumniProfilePage";
// import NavBar from "./components/navbars";
import MainNavBar from "./components/navbars";
import AdmissionModule from "./pages/admission/Admission";
// import ScrollToTopButton from "./import ControllerExaminations from ./pages/ControllerExaminations";
import Statutes from "./pages/statutes/Statutes";
import ControllerExaminations from "./pages/exams/ControllerExaminations";
import ExaminationApplication from "./pages/exams/ExaminationApplication";
import ExamPaymentSuccess from "./pages/exams/PaymentSuccess";
import PaymentFailure from "./pages/exams/PaymentFailure";
import RevaluationApplication from "./pages/exams/RevaluationApplication";
import RevaluationPaymentSuccess from "./pages/exams/RevaluationPaymentSuccess";
import RevaluationPaymentFailure from "./pages/exams/RevaluationPaymentFailure";
// import ComingSoon from "../../AKNU-Website/src/pages/ComingSoon.jsx";
// import ScrollToTopButton from "../src/components/ScrollToTop.jsx";
import AnnualReports from "./pages/AnnualReports.jsx";
import ScrollToTopButton from "./components/ScrollToTop";
import ComingSoon from "./pages/ComingSoon";
import NewStudentResultViewer from "./pages/results/newresult";
import CircularsApplications from "./components/CircularsApplications";
import AcademicCalendar from "./components/AcademicCalendar";
import KnowMoreRegistrar from "./pages/KnowMoreRegistrar";
import FeeRefundPolicy from "./components/FeeRefundPolicy.jsx";
import FieldTracker from "./pages/FieldTracker";
import ShareIdeaScreen from "./pages/ShareIdeaScreen.jsx";
import JobNotificationDetail from "./pages/JobNotificationDetail";
import UniversityHealthCentre from "./pages/UniversityHealthCentre";
import MediaCell from "./pages/MediaCell";
import DirectorComputerCentre from "./pages/DirectorComputerCentre";
import DirectorateOfAdmissions from "./pages/DirectorateOfAdmissions";
import DevelopmentPlan from "./pages/DevelopmentPlan";
import Accolades from "./pages/Accolades";
import GrievanceRedressalCell from "./pages/GrievanceRedressalCell";
import NewsPage from "./pages/NewsPage";




const ScrollToHashElement = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      
      // Function to scroll to element with retry logic
      const scrollToElement = (retries = 10, delay = 200) => {
        const el = document.getElementById(id);
        
        if (el) {
          // Small delay to ensure layout is complete
          setTimeout(() => {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        } else if (retries > 0) {
          // Retry if element not found (DOM might still be rendering)
          setTimeout(() => {
            scrollToElement(retries - 1, delay);
          }, delay);
        }
      };

      // Start scrolling attempt
      scrollToElement();
    }
  }, [location]);

  return null;
};

function App() {
  useEffect(() => {
    const now = Date.now();
    const lastReset = localStorage.getItem("lastReset");
    const oneDay = 24 * 60 * 60 * 1000;

    if (!lastReset || now - parseInt(lastReset, 10) > oneDay) {
      localStorage.clear();
      localStorage.setItem("lastReset", now);
      console.log("All localStorage keys cleared after 24h");
    }
  }, []);

  return (
    <Router>
      {/* <Navbar /> */}
      <MainNavBar />
      <Routes>
        {/* Home route */}
        <Route
          path="/"
          element={
            <>
              <ScrollToHashElement />
              <NotificationBar />
              <Carousel />
              <AboutAKNU />
              <AboutChancellor />
              <AboutVC />
              <AboutRegistrar />
              <WhyChooseUs />
              <VibrantCampuses />

              <CardSlider />

              <Glance />
              <HumansAknu />
              <LatestNews />
              <Section_Information />
              <StudentsSay />
              <PrestigiousPartnerships />
              <DynamicSection />
              {/* <VideoGallery/> */}
            </>
          }
        />

        <Route path="/courses" element={<Courses />} />
        <Route path="/jobs/notification/:id" element={<JobNotificationDetail />} />
        <Route
          path="/alumni"
          element={
            <>
              <AknuAlumni />
            </>
          }
        />
        <Route path="/alumni/profile" element={<AlumniProfilePage />} />
        <Route path="/chatWithUs" element={<ChatWithUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/AdmissionPage" element={<AdmissionPage />} />
        <Route path="/formupload" element={<MultiPageForm />} />

        <Route path="/admissionPageAuth" element={<AdmissionPageLogin />} />

        <Route path="/kakinada/campus-life" element={<AknuKkd />} />
        <Route path="/tadepalligudem/campus-life" element={<AknuTpg />} />
        <Route path="/CACdepartment" element={<CACDepartment />} />
        <Route path="/STdepartment" element={<STDepartment />} />
        <Route path="/Engdepartment" element={<EDepartment />} />
        <Route path="/EduPharmacy" element={<EduPharmacy />} />
        <Route path="/Edudepartment" element={<EduDepartment />} />
        <Route path="/chat-with-us" element={<ChatWithUsPage />} />
        <Route path="/statutes" element={<Statutes />} />

        {/* FACILITIES */}
        <Route path="/facilities/library" element={<Page_CentralLibrary />} />
        <Route path="/facilities/hostel/boys" element={<Page_MensHostel />} />
        <Route path="/facilities/hostel/girls" element={<Page_GirlsHostel />} />
        <Route path="/facilities/sports" element={<Page_SportsBoard />} />

        {/* Affiliated Colleges */}
        <Route path="/affiliatedColleges" element={<AffiliatedColleges />} />
        <Route path="/university-health-centre" element={<UniversityHealthCentre />} />
        <Route path="/media-cell" element={<MediaCell />} />
        <Route path="/director-computer-centre" element={<DirectorComputerCentre />} />
        <Route path="/directorate-of-admissions" element={<DirectorateOfAdmissions />} />


        <Route path="/ProgramFinder" element={<ProgramFinder />} />
        <Route path="/campus-experience" element={<CampusLife />} />
        <Route path="/CampusLife" element={<CampusLifeGallery />} />
        <Route path="/AboutVC" element={<AcademicCV />} />
        <Route path="/AboutChancellor" element={<AcademicCVChancellor />} />
        <Route path="/AboutRegistrar" element={<KnowMoreRegistrar />} />
        <Route path="/Placement" element={<PlacementDashboard />} />
        <Route path="/academic_affairs" element={<AcadamicAffairs />} />
        <Route path="/academic-programs" element={<AcademicProgramsPage />} />
        <Route path="/academic-calendar" element={<AcademicCalendar />} />
        <Route path="/annual-reports" element={<AnnualReports />} />
        {/* Anku Faculty */}
        <Route path="/faculty-section" element={<AknuFaculty />} />
        <Route path="/executive-council" element={<ExecutiveCouncil />} />
        <Route path="/administrative-roles" element={<AdministrativeRoles />} />

        <Route path="/review" element={<ReviewPage />} />
        <Route path="/application-status" element={<FeePaymentSuccess />} />
        <Route path="/exam-fee" element={<ExamFeeForm />} />
        <Route path="/affiliation-fee" element={<AffiliationFeeForm />} />
        <Route path="/sports-fee" element={<SportsFeeForm />} />
        <Route path="/hostel-fee" element={<HostelFeeForm />} />
        <Route path="/admission-fee" element={<AdmissionFeeForm />} />

        {/* AdministrativeRoles */}
        <Route
          path="/sustainabledevelopment"
          element={<SustainableDevelopment />}
        />

        <Route path="/womencell" element={<WomenCell />} />
        <Route path="/results" element={<StudentResultViewer />} />
        <Route path="/new-results" element={<NewStudentResultViewer />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/share-new-idea" element={<ShareIdeaScreen />} />

        <Route
          path="/sustainabledevelopment"
          element={<SustainableDevelopment />}
        />

        <Route path="/womencell" element={<WomenCell />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/sc-st-cell" element={<STCell />} />
        <Route path="/ugc" element={<UGCCell />} />
        <Route path="/iqac" element={<Iqac />} />
        {/* <Route path="wowen-cell" element={<WomenCell} /> */}
        {/* R&D Cell */}
        <Route
          path="/board-research-studies"
          element={<BoardResearchStudies />}
        />
        <Route
          path="/recognized-research-guides"
          element={<RecognizedResearchGuides />}
        />
        <Route path="/roi" element={<ROI />} />
        <Route path="/thesis-section" element={<ThesisSection />} />
        <Route path="/phd-awardees" element={<PhdAwardees />} />
        <Route path="/research-projects" element={<ResearchProjects />} />
        <Route path="/research-projects" element={<ResearchProjects />} />
        <Route path="/research-awards" element={<ResearchAwards />} />
        <Route path="/mou" element={<Mou />} />
        <Route path="/patents" element={<Patents />} />
        <Route path="/collaborations" element={<Collaborations />} />
        {/* CampusLife */}
        {/* <ProgramFinder/> */}
        <Route path="/sportboard" element={<SportsBoard />} />

        {/* nss router */}
        <Route path="/AboutNss" element={<AboutNss />} />
        <Route path="/MajorActivitiesNss" element={<MajorActivities />} />
        <Route path="/RegularActivitiesNss" element={<RegularActivities />} />

        <Route path="/SpecialCampNss" element={<SpecialCamp />} />
        <Route path="/fee-pay" element={<Page_CertificateFee />} />
        <Route path="/redirection" element={<UnderDevelopment />} />
        <Route path="/fee-pay/exam" element={<Page_ExamFee />} />
        <Route path="/fee-pay/status" element={<Page_FeeStatus />} />
        <Route path="/fee-structure" element={<Page_FeeStructrure />} />
        <Route path="/student-affairs" element={<Studentaffairs />} />
        <Route path="/fee-refund-policy" element={<FeeRefundPolicy />} />
        <Route path="/spruha" element={<Spruha />} />
        <Route path="/international-student" element={<VideoGallery />} />

        <Route path="/SC-ST-CELL" element={<STCell />} />
        <Route path="/NannayaVani" element={<NannayaVani />} />
        <Route path="/pg-syllabus" element={<PgSyllabus />} />
        <Route path="/ug-syllabus" element={<UgSyllabus />} />
        <Route path="/RTIPage" element={<RTIPage />} />
        <Route path="/FinancePage" element={<FinancePage />} />
        <Route path="/lms" element={<AKNULMS />} />
        <Route path="/committee_cells" element={<CommitteeCell />} />
        <Route
          path="/controller-of-examinations"
          element={<ControllerExaminations />}
        />
        <Route
          path="/examination-application/payment-success"
          element={<ExamPaymentSuccess />}
        />
        <Route
          path="/examination-application/payment-failure"
          element={<PaymentFailure />}
        />
        <Route
          path="/examination-application"
          element={<ExaminationApplication />}
        />
        <Route
          path="/revaluation-application/payment-success"
          element={<RevaluationPaymentSuccess />}
        />
        <Route
          path="/revaluation-application/payment-failure"
          element={<RevaluationPaymentFailure />}
        />
        <Route
          path="/revaluation-application"
          element={<RevaluationApplication />}
        />
        <Route path="/admission" element={<AdmissionModule />} />
        {/* t={<CommitteeCell />} /> */}
        <Route
          path="/controller-of-examinations"
          element={<ControllerExaminations />}
        />
        <Route path="/admission" element={<AdmissionModule />} />
        <Route
          path="/circularsAndApplications"
          element={<CircularsApplications />}
        />
        {/* Generic Coming Soon page for under-construction routes */}
        <Route path="/coming-soon" element={<ComingSoon />} />

        <Route
          path="/equal-opportunity-cell"
          element={<EqualOpportunityCell />}
        />
        <Route path="/development-plan" element={<DevelopmentPlan />} />
        <Route path="/accolades" element={<Accolades />} />
        <Route path="/grievance-redressal-cell" element={<GrievanceRedressalCell />} />
        <Route path="/field-tracker" element={<FieldTracker />} />
        <Route path="/news" element={<NewsPage />} />

        {/* <Route path="/admin" element={<AdminDashboard />} /> */}

        <Route path="*" element={<NotFound />} />
      </Routes>
      <ScrollToTopButton />
      <Footer />
      {/* <ChatBot_Thinkstack /> */}
      {/* Modal Forms */}
      <Admission_ApplyNowForm />
    </Router>
  );
}

export default App;
