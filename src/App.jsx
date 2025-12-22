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
import AdminLogin from "./useTheme/pages/AdminLogin";



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
        
      </Routes>
    </Router>
  );
}

export default App;
