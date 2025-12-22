import React, { useEffect, useState } from "react";
import { auth } from "../../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import "../dashboard_styles/Dashboard.css";
import Approvals from "../../useTheme/pages/Approvals";

import {
  FaUserCircle,
  FaUserGraduate,
  FaHome,
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";

import schoolLogo from "../../assets/school-logo.png";
import Teacher from "./Teacher";
import Parent from "./Parent";
import Student from "./Student";
import Admin from "./Admin";
import StudentDetails from "./StudentDetails";
import AdminTimetable from "./AdminTimetable";
import TeacherTimetable from "./TeacherTimetable";



/* ================= SLIDER ================= */
const sliderImages = [
  "/slider/slide1.jpg",
  "/slider/slide2.jpg",
  "/slider/slide3.jpg",
  "/slider/slide4.jpg",
  "/slider/slide5.jpg",
  "/slider/slide6.jpg"
];

const SPECIAL_USER_UID = "vd8GKjbWrgfpO3FnokO5qHe2o1s2";

const DashboardSlider = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % sliderImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="slider-container">
      <div
        className="slider-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {sliderImages.map((img, i) => (
          <div className="slide" key={i}>
            <img src={img} alt={`slide-${i}`} />
          </div>
        ))}
      </div>

      <div className="slider-dots">
        {sliderImages.map((_, i) => (
          <span
            key={i}
            className={i === index ? "dot active" : "dot"}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
};
/* ================= END SLIDER ================= */

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [school, setSchool] = useState("");
  const [plan, setPlan] = useState("basic");
  const [planExpiry, setPlanExpiry] = useState(null);

  const [menuOpen, setMenuOpen] = useState(true);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState("home");

  const navigate = useNavigate();

  const isAdminOrSubAdmin = role === "admin" || role === "sub_admin";

  const formatDate = (timestamp) => {
    if (!timestamp) return "No Expiry";
    return timestamp.toDate().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  /* ================= AUTH + ROLE ================= */
  useEffect(() => {
    const storedRole = localStorage.getItem("role");

    // 🔐 TEACHER / PARENT / SUB ADMIN
    if (
      storedRole === "teacher" ||
      storedRole === "parent" ||
      storedRole === "sub_admin"
    ) {
      setRole(storedRole);
      setUser({
        displayName:
          localStorage.getItem("adminName") ||
          localStorage.getItem("teacherName") ||
          localStorage.getItem("parentName") ||
          "User",
        email: localStorage.getItem("email") || ""
      });
      return;
    }

    // 🔐 MASTER ADMIN
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login", { replace: true });
        return;
      }

      setUser(currentUser);

      const adminSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (!adminSnap.exists()) {
        navigate("/login");
        return;
      }

      const data = adminSnap.data();
      setRole("admin");
      setSchool(data.school || "");
      setPlan(data.plan || "basic");
      setPlanExpiry(data.planExpiry || null);

      localStorage.setItem("adminName", data.username || "Admin");
    });

    return () => unsubscribe && unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    localStorage.clear();
    await signOut(auth);
    navigate("/logout");
  };

  const adminUid = user?.uid || localStorage.getItem("adminUid");

  return (
    <div className="dashboard-container">
      {/* ================= SIDEBAR ================= */}
      <div className={`sidebar ${menuOpen ? "sidebar-open" : "sidebar-close"}`}>
        <ul>
          <li onClick={() => setActivePage("home")}>
            <FaHome /> Home
          </li>

          {role === "admin" && (
            <li onClick={() => navigate("/payment")}>
              <FaSignOutAlt /> Upgrade
            </li>
          )}

          {role === "admin" && (
            <li className={`plan-info ${plan}`}>
              <div className="plan-row">
                Plan: <strong>{plan.toUpperCase()}</strong>
              </div>
              {plan !== "basic" && (
                <div className="plan-row">
                  Expiry: <strong>{formatDate(planExpiry)}</strong>
                </div>
              )}
            </li>
          )}

          {/* 🔑 ADMIN + SUB_ADMIN */}
          {(
            (role === "admin" &&
              (plan === "premium" || plan === "lifetime")) ||
            role === "sub_admin"
          ) && (
            <>
              <li
                className="account-main"
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              >
                <FaUserCircle /> Account Creation
                {accountMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
              </li>

              {accountMenuOpen && (
                <ul className="account-submenu">
                  {role === "admin" && (
                  <li onClick={() => setActivePage("admin")}>Admin</li>)}
                  <li onClick={() => setActivePage("teacher")}>Teacher</li>
                  <li onClick={() => setActivePage("parent")}>Parent</li>
                  <li onClick={() => setActivePage("student")}>Student</li>
                </ul>
              )}

              <li onClick={() => setActivePage("timetable")}>
                📅 Timetable
              </li>
             
            </>
          )}

          {(role === "teacher" || role === "parent") && (
            <>
            <li onClick={() => setActivePage("studentDetails")}>
              <FaUserGraduate /> Student Details
            </li>
             <li onClick={() => setActivePage("teacher-timetable")}>
             📅 Teacher Timetable
           </li>
           </>
          )}
          
            {role === "admin" && (
           <li onClick={() => setActivePage("approvals")}>
           Approvals
           </li>
          )}

          <li>
            <FaCog /> Settings
          </li>

          <li onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </li>
        </ul>
      </div>

      {/* ================= MAIN ================= */}
      <div className="main-content">
        <nav className="navbar">
          <div className="nav-left">
            <div
              className="menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ☰
            </div>
            <img src={schoolLogo} alt="School" className="nav-school-logo" />
            <span className="nav-school-name">
              {school || "School Name"}
            </span>
          </div>

          <div className="user-info">
            <FaUserCircle />
            <span className="username">
              {localStorage.getItem("adminName") ||
                localStorage.getItem("teacherName") ||
                localStorage.getItem("parentName") ||
                user?.displayName ||
                user?.email ||
                "User"}
            </span>
          </div>
        </nav>

        <div className="dashboard-content">
        {activePage === "home" && (
        <>
            <DashboardSlider />

          {/* 🔒 ONLY FOR SPECIFIC USER DOCUMENT */}
          {user?.uid === SPECIAL_USER_UID && (
           <h2 style={{ marginTop: "20px" }}>
           Hello Riyaz 👋 Welcome Dashboard
           </h2>
          )}
         </>
       )}


          {isAdminOrSubAdmin && activePage === "teacher" && (
            <Teacher adminUid={adminUid} />
          )}

          {isAdminOrSubAdmin && activePage === "parent" && (
            <Parent adminUid={adminUid} />
          )}

          {isAdminOrSubAdmin && activePage === "student" && (
            <Student adminUid={adminUid} />
          )}

          {(role === "teacher" || role === "parent") &&
            activePage === "studentDetails" && <StudentDetails />}

          {isAdminOrSubAdmin && activePage === "timetable" && (
            <AdminTimetable />
          )}

          {(role === "admin") && activePage === "admin" && <Admin />}

          {activePage === "approvals" && role === "admin" && <Approvals />}
          {role === "teacher" && activePage === "teacher-timetable" && (
           <TeacherTimetable />
          )}


        </div>
      </div>
    </div>
  );
};

export default Dashboard;
