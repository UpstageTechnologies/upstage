import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./Landing/Landing";
import Login from "./Login/Login";
import Register from "./Register/Register";
import Dashboard from "./Dashboard/Dashboard";
import PaymentSelection from "./Payment/PaymentSelection";
import Logout from "./Logout/Logout";
import ChooseLogin from "./Landing/ChooseLogin";
import TeacherLogin from "./Landing/TeacherLogin";
import ParentLogin from "./Landing/ParentLogin";
import AdminLogin from "./Landing/AdminLogin";





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
