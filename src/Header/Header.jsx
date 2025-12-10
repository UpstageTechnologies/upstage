import React from "react";
import "./Header.css";
import logo from "../logo.jpeg"; // <-- your logo path


const Header = () => {
  return (
    <header className="header">
      <img src={logo} alt="Company Logo" className="logo" />
    </header>
  );
};

export default Header;
