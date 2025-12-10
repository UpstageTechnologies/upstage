import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { FaUserCircle, FaHome, FaCog, FaSignOutAlt } from "react-icons/fa";
import schoolLogo from "./school-logo.png";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSchool(userData.school || "");
        }
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/logout",{ replace: true }); // LOGOUT → LOGIN PAGE
  };

  return (
    <div className="dashboard-container">
      
      {/* SIDEBAR */}
      <div className="sidebar">
        <ul>
          <li><FaHome /> Home</li>
          <li><FaCog /> Settings</li>
          <li onClick={handleLogout}><FaSignOutAlt /> Logout</li>
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">

        {/* NAVBAR */}
        <nav className="navbar">

          {/* LEFT SIDE — School logo + name */}
          <div className="nav-left">
            <img src={schoolLogo} alt="School Logo" className="nav-school-logo" />
            <span className="nav-school-name">{school || "School Name"}</span>
          </div>

          {/* RIGHT SIDE — User info */}
          <div className="user-info">
            <FaUserCircle className="user-icon" />
            <span className="username">
              {user?.displayName || user?.email.split("@")[0]}
            </span>
          </div>

        </nav>

        {/* DASHBOARD BODY */}
        <div className="dashboard-content">
          {/* Your content here */}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
