import React from "react";
import "./Logout.css";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login",{ replace: true });
  };

  return (
    <div className="wrapper">
    <div className="logout-container">
      <div className="logout-box">
        <h2>Your user ID logged out</h2>
        <p>You want to login again?</p>

        <button className="login-btn" onClick={goToLogin}>
          Login
        </button>
      </div>
    </div>
    </div>
  );
};

export default Logout;
