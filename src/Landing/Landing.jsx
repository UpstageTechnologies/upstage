import React from "react";
import { Link } from "react-router-dom";
import "./Landing.css";
import logo from "../logo.jpeg";


export default function Landing() {
  return (
    <div className="landing-container">
      
      
        
      <nav className="nav-bar">
        
          <img src={logo} alt="Company Logo" className="logo" />
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <Link to="/login" className="start-btn">Login</Link>
          </div>
        </nav>

      <div className="wrapper">
        {/* HERO SECTION */}
        <section className="hero">
          <h1>
            Welcome to <span>SchoolTrain</span>
          </h1>
          <p>Your smart school management assistant.</p>
          <div className="hero-buttons">
            <Link to="/" className="btn-primary">Get Started</Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <p>© 2025 SchoolTrain. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
