import React, { useEffect, useState } from "react";
import { auth } from "../../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import "../dashboard_styles/Dashboard.css";
import Approvals from "./Approvals";
import Courses from "./Courses";


import {
  FaUserCircle,
  FaUserGraduate,
  FaHome,
  FaCog,FaUserCheck,
  FaSignOutAlt,
  FaChevronDown,FaBookOpen,
  FaChevronUp,FaCalendarAlt,FaClipboardCheck,FaWpforms
} from "react-icons/fa";

import schoolLogo from "../../assets/school-logo.png";
import Teacher from "./Teacher";
import Parent from "./Parent";
import Student from "./Student";
import Admin from "./Admin";
import StudentDetails from "./StudentDetails";
import AdminTimetable from "./AdminTimetable";
import TeacherTimetable from "./TeacherTimetable";
import BackConfirm from "../../components/BackConfirm";
import Attendance from "./Attendance";
import ShowTodaysAbsent from "./ShowTodaysAbsent";
import TeacherAttendance from "./TeacherAttendance";
import ShowTodaysTeacherAbsent from "./ShowTodaysTeacherAbsent";
import Home from "./Home";
import ApplicationList from "./ApplicationList";


/* ================= SLIDER ================= */
const sliderImages = [
  "/slider/slide1.jpg",
  "/slider/slide2.jpg",
  "/slider/slide3.jpg",
  "/slider/slide4.jpg",
  "/slider/slide6.jpg"
];

/* ================= END SLIDER ================= */

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [school, setSchool] = useState("");
  const [plan, setPlan] = useState("basic");
  const [planExpiry, setPlanExpiry] = useState(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [homeStats, setHomeStats] = useState(null);

  



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
    const confirmLogout = window.confirm("Do you want to logout?");
  
    if (!confirmLogout) return; // ❌ NO → stay same page
  
    localStorage.clear();
    await signOut(auth);
    navigate("/logout", { replace: true }); // ✅ YES → home page
  };
  

  const adminUid = user?.uid || localStorage.getItem("adminUid");

  return (
    <><BackConfirm />
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
                  <li onClick={() => {setActivePage("admin");setAccountMenuOpen(false);}}>Admin</li>)}
                  <li onClick={() => {setActivePage("teacher");setAccountMenuOpen(false);}}>Teacher</li>
                  <li onClick={() => {setActivePage("parent");setAccountMenuOpen(false);}}>Parent</li>
                  <li onClick={() => {setActivePage("student");setAccountMenuOpen(false);}}>Student</li>
                </ul>
              )}

              <li onClick={() => setActivePage("timetable")}>
              <FaCalendarAlt />Timetable
              </li>
             
        
         {role === "sub_admin" && (
         <li onClick={() => setActivePage("attendance")}>
           <FaUserCheck/> Teacher's Attendance
          </li>
         )}
             
            </>
          )}

          {(role === "teacher" || role === "parent") && (
            <>
            <li onClick={() => setActivePage("studentDetails")}>
              <FaUserGraduate /> Student Details
            </li>
             <li onClick={() => setActivePage("teacher-timetable")}>
             <FaCalendarAlt/> Teacher Timetable
           </li>
           <li onClick={() => setActivePage("teacher-attendance")}>
           <FaUserCheck/>Teacher Timetable
           </li>
           </>
          )}
          
            {role === "admin" && (
           <li onClick={() => setActivePage("approvals")}>
           <FaClipboardCheck/>Approvals
           </li>
           
          )}
          <li onClick={() => setActivePage("courses")}>
          <FaBookOpen /> Courses
          </li>
          {role === "admin" && (
            <li onClick={() => setActivePage("applications")}>
              <FaWpforms /> Applications
              </li>
          )}


       



        
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

       <div
  className="user-info"
  onClick={() => setUserMenuOpen(!userMenuOpen)}
>
  <FaUserCircle />
  <span className="username">
    {localStorage.getItem("adminName") ||
      localStorage.getItem("teacherName") ||
      localStorage.getItem("parentName") ||
      user?.displayName ||
      user?.email ||
      "User"}
  </span>
  <FaChevronDown />

  {userMenuOpen && (
    <div className="user-dropdown simple">
      <div
        className="dropdown-item"
        onClick={() => {
          setActivePage("settings");
          setUserMenuOpen(false);
          setAccountMenuOpen(false);
        }}
      >
        <FaCog /> Settings
        
      </div>

      <div
        className="dropdown-item logout"
        onClick={handleLogout}
        
      >
        <FaSignOutAlt /> Logout
      </div>
    </div>
  )}
</div>

        </nav>

        <div className="dashboard-content">
       {activePage === "home" &&
  <Home
    adminUid={adminUid}
    setActivePage={setActivePage}
    setHomeStats={setHomeStats}
    homeStats={homeStats}
  />
}

   




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
         {isAdminOrSubAdmin && activePage === "attendance" && (
            <Attendance adminUid={adminUid} />
            )}
          {isAdminOrSubAdmin && activePage === "todays-absent" && (
            <ShowTodaysAbsent adminUid={adminUid} setActivePage={setActivePage} />
          )}
          {isAdminOrSubAdmin && activePage === "courses" && (
           <Courses />
           )}
           {role === "teacher" && activePage === "teacher-attendance" && (
           <TeacherAttendance />
           )}
           {isAdminOrSubAdmin && activePage === "teacher-absents" && (
             <ShowTodaysTeacherAbsent adminUid={adminUid} setActivePage={setActivePage} />
           )}
           {role === "admin" && activePage === "applications" && (
            <ApplicationList />
            )}


        </div>
      </div>
    </div>
    </>
  );
};

export default Dashboard;