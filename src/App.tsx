import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "@/pages/login";
// import ForgetPassword from "@/pages/forgetPassword";
import { Providers } from "@/providers/Provider";
import Dashboard from "@/pages/dashboard";
import AddInternshipPage from "@/pages/student/addInternship";
import Navbar from "@/components/Navbar";
import ViewProfilePage from "@/pages/viewProfile";
import StudentSignIn from "./components/StudentSignIn";
import FacultySignIn from "./components/FacultySignIn";
import ViewInternshipPage from "./pages/viewInternship";
import ViewIdProfilePage from "./pages/viewIdProfile";
import ViewFaculties from "./pages/faculty/viewFaculties";
import ViewStudents from "./pages/faculty/viewStudents";
import ViewInternships from "./pages/viewInternships";
import ForgotPassword from "./pages/forgetPassword";
import ViewMentees from "./pages/faculty/viewMentees";
import ModifySkills from "./pages/faculty/updateSkills";
import ChangeMentees from "./pages/faculty/changeMentees";
import ResetPassword from "./pages/resetPassword";
import DownloadInternship from "./pages/faculty/downloadInternship";
import ExpiredPage from "./pages/expired";

function App() {
  return (
    <Router>
      <Providers>
        <div className="grid place-items-center w-screen h-screen">
          <Navbar />
          <div className="md:min-h-[80%] md:min-w-[85%] md:max-h-[80%] md:max-w-[85%] w-screen h-full grid place-items-center justify-center items-center pt-5 md:pt-0">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/expired" element={<ExpiredPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/forgetpass" element={<ForgotPassword />} />
              <Route path="/addInternship" element={<AddInternshipPage />} />
              <Route
                path="/addInternship/:id"
                element={<AddInternshipPage />}
              />

              <Route path="/profile" element={<ViewProfilePage />} />
              <Route
                path="/profile/:type/:id"
                element={<ViewIdProfilePage />}
              />
              <Route path="/internship/:id" element={<ViewInternshipPage />} />
              <Route path="/mentees/:id" element={<ViewMentees />} />
              <Route path="/student/signin" element={<StudentSignIn />} />
              <Route path="/faculty/signin" element={<FacultySignIn />} />
              <Route path="/faculties" element={<ViewFaculties />} />
              <Route path="/students" element={<ViewStudents />} />
              <Route path="/studentInternships" element={<ViewInternships />} />
              <Route path="/skills" element={<ModifySkills />} />
              <Route path="/changeMentee" element={<ChangeMentees />} />
              <Route path="/resetPassword" element={<ResetPassword />} />
              <Route path="/download" element={<DownloadInternship />} />
            </Routes>
          </div>
        </div>
      </Providers>
    </Router>
  );
}

export default App;
