import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./useTheme/pages/Landing";
import Login from "./useTheme/pages/Login";
import Register from "./useTheme/pages/Register";
import Dashboard from "./features/dashboard/Dashboard";
import PaymentSelection from "./features/payment/PaymentSelection";
import Logout from "./useTheme/pages/Logout";
import ChooseLogin from "./useTheme/pages/ChooseLogin";
import TeacherLogin from "./useTheme/pages/TeacherLogin";
import ParentLogin from "./useTheme/pages/ParentLogin";
import OfficeStaffLogin from "./useTheme/pages/OfficeStaffLogin";

import AdminLogin from "./useTheme/pages/AdminLogin";
import CalendarPage from "./useTheme/pages/CalendarPage";
import Attendance from "./features/dashboard/Attendance";
import ShowTodaysAbsent from "./features/dashboard/ShowTodaysAbsent";
import Courses from "./features/dashboard/Courses";
import TeacherAttendance from "./features/dashboard/TeacherAttendance";
import ShowTodaysTeacherAbsent from "./features/dashboard/ShowTodaysTeacherAbsent";
import ApplicationForm from "./useTheme/pages/ApplicationForm";
import ApplicationList from "./features/dashboard/ApplicationList";
import  Accounts from "./features/dashboard/Accounts"
import FeesPage from "./features/dashboard/accounts/FeesPage";
import UserViewDashboard from "./features/dashboard/UserViewDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/payment" element={<PaymentSelection />} /> 
        <Route path="/logout" element={<Logout />} />
        <Route path="/choose-login" element={<ChooseLogin />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/parent-login" element={<ParentLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/office-staff-login" element={<OfficeStaffLogin />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="/todays-absent" element={<ShowTodaysAbsent />} />
        <Route path="courses" element={<Courses />} />
        <Route path="/teacher-attendance" element={<TeacherAttendance />} />
        <Route path="/teacher-absents" element={<ShowTodaysTeacherAbsent />} />
        <Route path="/application" element={<ApplicationForm />} />
        <Route path="/admin/applications" element={<ApplicationList />} />
        <Route path="Accounts" element={<Accounts/>}/>
        <Route path="FeesPage" element={<FeesPage />} />
        <Route path="/dashboard/view"element={<UserViewDashboard />}/>


      </Routes>
    </Router>
  );
}

export default App;
