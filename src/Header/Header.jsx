import React from "react";
import "./Header.css";
import logo from "../logo.jpeg";

const ebi = () => {
  return (
    <header className="header">
      <img src={logo} alt="Company Logo" className="logo" />
    </header>
  );
};

export default ebi;
