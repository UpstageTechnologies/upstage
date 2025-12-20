import React from "react";
import { Link } from "react-router-dom";
import "./ChooseLogin.css";
import logo from "../logo.jpeg";

const ChooseLogin = () => {
  return (
    <div className="landing-container">
        <nav className="nnav">
        <img src={logo} alt="Logo" className="role-logo" /></nav>
      <div className="wrapper role-page">
        

        <div className="role-box role-fade">
          <h2>Choose Login</h2>
          <p>Select login type</p>

          <Link to="/admin-login" className="role-card admin">
            Admin
            <span>School management</span>
          </Link>

          <Link to="/teacher-login" className="role-card teacher">
            Teacher
            <span>Class & students</span>
          </Link>

          <Link to="/parent-login" className="role-card parent">
            Parent
            <span>Student progress</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChooseLogin;
