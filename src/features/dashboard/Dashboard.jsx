import React, { useEffect, useState } from "react";
  import { auth } from "../../services/firebase";
  import { onAuthStateChanged, signOut } from "firebase/auth";
  import { doc, getDoc } from "firebase/firestore";
  import { db } from "../../services/firebase";
  import { useNavigate } from "react-router-dom";
  import "../dashboard_styles/Dashboard.css";
  import Approvals from "./Approvals";
  import Courses from "./Courses";
  import Profile from "./Profile";
  import {
    FaUserCircle,
    FaUserGraduate,
    FaHome,
    FaCog,FaUserCheck,
    FaSignOutAlt,
    FaChevronDown,FaBookOpen,FaSchool,
    FaChevronUp,FaCalendarAlt,FaClipboardCheck,FaWpforms,FaMoneyBillWave
  } from "react-icons/fa";

  import schoolLogo from "../../assets/sch.jpg";
  import Teacher from "./Teacher";
  import Parent from "./Parent";
  import Student from "./Student";
  import Admin from "./Admin";
  import OfficeStaff from "./OfficeStaff";
  import { onSnapshot } from "firebase/firestore";

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
  
import FeesPage from "./accounts/FeesPage";
import ExpensesPage from "./accounts/ExpensesPage";
import ProfitPage from "./accounts/ProfitPage";
import Inventory from "./accounts/Inventory";
import UpgradePopup from "../../components/UpgradePopup";






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
    const [upgradeDisabled, setUpgradeDisabled] = useState(false);


    const [menuOpen, setMenuOpen] = useState(true);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [activePage, setActivePage] = useState("home");
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [homeStats, setHomeStats] = useState(null);
    const [logo, setLogo] = useState(""); 
    const [accountsSubMenuOpen, setAccountsSubMenuOpen] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);


    const isPremium = plan === "premium" || plan === "lifetime"; 

    const viewParentId = localStorage.getItem("viewParentId");

      


    const navigate = useNavigate();

    const isAdminOrSubAdmin = role === "master" || role === "admin";
    const isOfficeStaff = role === "office_staff"; 
    

    const formatDate = (timestamp) => {
      if (!timestamp) return "No Expiry";
      return timestamp.toDate().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    };

    const requirePremium = (callback) => {
      if (plan === "premium" || plan === "lifetime") {
        callback();
      } else {
        setShowUpgrade(true);
      }
    };
    
    
    /* ================= AUTH + ROLE ================= */
    useEffect(() => {
      const off = () => setUpgradeDisabled(true);
      const on = () => setUpgradeDisabled(false);
    
      window.addEventListener("disable-upgrade-popup", off);
      window.addEventListener("enable-upgrade-popup", on);
    
      return () => {
        window.removeEventListener("disable-upgrade-popup", off);
        window.removeEventListener("enable-upgrade-popup", on);
      };
    }, []);
    
    useEffect(() => {
      const storedRole = localStorage.getItem("role");

      // 🔐 TEACHER / PARENT /  ADMIN
      if (
        storedRole === "teacher" ||
        storedRole === "parent" ||
        storedRole === "admin" ||
        storedRole === "office_staff" 
      ) 
       {
        setRole(storedRole);
        setUser({
          displayName:
            localStorage.getItem("staffName") ||
            localStorage.getItem("adminName") ||
            localStorage.getItem("teacherName") ||
            localStorage.getItem("parentName") ||
            "User",
          email: localStorage.getItem("email") || ""
        });
        
        return;
      }

      const isPremium = plan === "premium" || plan === "lifetime";

const requirePremium = (page) => {
  if (!isPremium) {
    navigate("/payment");
    return false;
  }
  setActivePage(page);
  return true;
};

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

        setRole("master");
        
        // ⭐ read school name + logo
        setSchool(data.schoolName || "School Name");
        localStorage.setItem("schoolName", data.schoolName || "");
        
        // ⭐ optional — future use
        localStorage.setItem("schoolLogo", data.schoolLogo || "");
        
        setPlan((data.plan || "basic").toLowerCase());
        localStorage.setItem("plan", (data.plan || "basic").toLowerCase());


        setPlanExpiry(data.planExpiry || null);
        
        localStorage.setItem("adminName", data.username || "Admin");
        

        localStorage.setItem("adminName", data.username || "Admin");
      });

      return () => unsubscribe && unsubscribe();
    }, [navigate]);

    

useEffect(() => {
  const masterUid =
    localStorage.getItem("adminUid") || auth.currentUser?.uid;

  if (!masterUid) return;

  const ref = doc(db, "users", masterUid);

  const unsub = onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const d = snap.data();

      setLogo(d.schoolLogo || "");
      setSchool(d.schoolName || "School");

      localStorage.setItem("schoolLogo", d.schoolLogo || "");
      localStorage.setItem("schoolName", d.schoolName || "");
    }
  });

  return () => unsub();
}, []);

    useEffect(() => {
      const handler = () => {
        setSchool(localStorage.getItem("schoolName") || "School");
        setLogo(localStorage.getItem("schoolLogo") || "");
      };
    
      window.addEventListener("profile-updated", handler);
    
      return () => window.removeEventListener("profile-updated", handler);
    }, []);
    

    

    useEffect(() => {
      async function loadSchool() {
    

        
        // ⭐ ALWAYS read from localStorage first
        const masterUid =
          localStorage.getItem("adminUid") || auth.currentUser?.uid;
    
        if (!masterUid) return;
    
        const snap = await getDoc(doc(db, "users", masterUid));
    
        if (snap.exists()) {
          const d = snap.data();
    
          const name = d.schoolName || d.school || "School";
          const logo = d.schoolLogo || "";
    
          setSchool(name);
    
          // ⭐ store once for everyone
          localStorage.setItem("schoolName", name);
          localStorage.setItem("schoolLogo", logo);
        }
      }
    
      loadSchool();
    }, [role]);

    useEffect(() => {
  const handler = () => {
    setActivePage("teacher-dashboard");
  };

  window.addEventListener("open-teacher-dashboard", handler);

  return () =>
    window.removeEventListener("open-teacher-dashboard", handler);
}, []);
const viewAs = localStorage.getItem("viewAs"); // "teacher" | null
const viewTeacherId = localStorage.getItem("viewTeacherId");

    
    

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
  {/* ================= OFFICE STAFF ================= */}
  {isOfficeStaff && (
    <li className={activePage === "accounts" ? "active" : ""} onClick={() => setActivePage("accounts")}>
      <FaMoneyBillWave /> Accounts
    </li>
  )}

  {/* ================= MASTER / ADMIN ================= */}
  {!isOfficeStaff && (
    <>
      <li className={activePage === "home" ? "active" : ""} onClick={() => setActivePage("home")}>
        <FaHome /> Home
      </li>

      {role === "master" && (
        <li className={activePage === "payment" ? "active" : ""}onClick={() => navigate("/payment")}>
          <FaSignOutAlt /> Upgrade
        </li>
      )}

      {role === "master" && (
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

      {(
        (role === "master" &&
          (plan === "premium" || plan === "lifetime" || plan === "basic")) ||
        role === "admin"
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
              {role === "master" && (
                <li onClick={() => { setActivePage("admin"); setAccountMenuOpen(false); }} className={activePage === "admin" ? "active" : ""}>
                  Admin
                </li>
              )}
              <li onClick={() => { setActivePage("teacher"); setAccountMenuOpen(false); }}className={activePage === "teacher" ? "active" : ""}>
                Teacher
              </li>
              <li onClick={() => { setActivePage("parent"); setAccountMenuOpen(false); }}className={activePage === "parent" ? "active" : ""}>
                Parent
              </li>
              <li onClick={() => { setActivePage("student"); setAccountMenuOpen(false); }}className={activePage === "student" ? "active" : ""}>
                Student
              </li>
              <li onClick={() => { setActivePage("office_staff"); setAccountMenuOpen(false); }}className={activePage === "office_staff" ? "active" : ""}>
                Staff
              </li>
            </ul>
          )}

          <li className={activePage === "accounts" ? "active" : ""} onClick={() => setActivePage("accounts")}>
            <FaMoneyBillWave /> Accounts
          </li>

          <li className={activePage === "timetable" ? "active" : ""}onClick={() => setActivePage("timetable")}>
            <FaCalendarAlt /> Timetable
          </li>

          {role === "admin" && (
            <li className={activePage === "attendance" ? "active" : ""} onClick={() => setActivePage("attendance")}>
              <FaUserCheck /> Teacher Attendance
            </li>
          )}
        </>
      )}
                {(role === "teacher" || role === "parent" || viewAs === "parent") && (

              <>
              <li className={activePage === "studentDetails" ? "active" : ""}onClick={() => setActivePage("studentDetails")}>
                <FaUserGraduate /> Student Details
              </li>
              <li className={activePage === "teacher-timetable" ? "active" : ""} onClick={() => setActivePage("teacher-timetable")}>
              <FaCalendarAlt/> Teacher Timetable
            </li>
            <li className={activePage === "teacher-attendance" ? "active" : ""}onClick={() => setActivePage("teacher-attendance")}>
            <FaUserCheck/>Teacher Timetable
            </li>
            </>
            )}
            {viewAs === "teacher" && (
  <button
    onClick={() => {
      localStorage.removeItem("viewAs");
      localStorage.removeItem("viewTeacherId");
      localStorage.removeItem("teacherName");
      window.location.reload();
    }}
    style={{
      background: "#2563eb",
      color: "#fff",
      padding: "6px 12px",
      borderRadius: 6,
      border: "none",
      marginRight: 10,
      cursor: "pointer"
    }}
  >
    Exit Teacher View
  </button>
)}


      {role === "master" && (
        <li className={activePage === "approvals" ? "active" : ""} onClick={() => setActivePage("approvals")}>
          <FaClipboardCheck /> Approvals
        </li>
      )}

      <li className={activePage === "courses" ? "active" : ""}onClick={() => setActivePage("courses")}>
        <FaBookOpen /> Courses
      </li>

      {role === "master" && (
        <li className={activePage === "applications" ? "active" : ""}onClick={() => setActivePage("applications")}>
          <FaWpforms /> Applications
        </li>
      )}
    </>
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
              {(logo || localStorage.getItem("schoolLogo")) ? (
  <img
    src={logo || localStorage.getItem("schoolLogo")}
    alt="School"
    className="nav-school-logo"
  />
) : (
  <div className="default-school-icon">
    <FaSchool />
  </div>
)}



  <span className="nav-school-name">
    {school || localStorage.getItem("schoolName") || "School Name"}
  </span>


            </div>
            {/* 🔴 EXIT PARENT VIEW BUTTON */}
{viewAs === "parent" && (
  <button
    onClick={() => {
      localStorage.removeItem("viewAs");
      localStorage.removeItem("viewParentId");
      localStorage.removeItem("parentName");
      window.location.reload();
    }}
    style={{
      background: "#ef4444",
      color: "#fff",
      padding: "6px 12px",
      borderRadius: 6,
      border: "none",
      marginRight: 10,
      cursor: "pointer"
    }}
  >
    Exit Parent View
  </button>
)}




        <div
    className="user-info"
    onClick={() => setUserMenuOpen(!userMenuOpen)}
  >
     {localStorage.getItem("profilePhoto") ? (
    <img
      src={localStorage.getItem("profilePhoto")}
      alt="user"
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        objectFit: "cover",
        marginRight: 8
      }}
    />
  ) : (
    <FaUserCircle size={28} />
  )}

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
            {/* ⭐ PROFILE */}
      <div
        className="dropdown-item"
        onClick={() => {
          setActivePage("profile");
          setUserMenuOpen(false);
          setAccountMenuOpen(false);
        }}
      >
        <FaUserCircle /> Profile
      </div>
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

{activePage === "home" && (
  <Home
  adminUid={adminUid}
  setActivePage={setActivePage}
  plan={plan}
/>

)}

{isAdminOrSubAdmin && activePage === "fees" && (
  <FeesPage adminUid={adminUid} setActivePage={setActivePage}/>
)}
{activePage === "income" && (
  <FeesPage adminUid={adminUid} mode="income" setActivePage={setActivePage}/>
)}

{activePage === "expenses" && (
  <FeesPage adminUid={adminUid} mode="expenses" setActivePage={setActivePage}/>
)}

{(isAdminOrSubAdmin || isOfficeStaff) && activePage === "accounts" && (
  <ExpensesPage
    adminUid={adminUid}
    setActivePage={setActivePage}
  />
)}



{(isAdminOrSubAdmin || isOfficeStaff) &&
 (activePage === "profit" || activePage.startsWith("bill_")) && (
<ProfitPage
  adminUid={adminUid}
  setActivePage={setActivePage}
  activePage={activePage}
  plan={plan}
  showUpgrade={() => setShowUpgrade(true)}
/>

)}


{isAdminOrSubAdmin && activePage === "inventory" && (
 <Inventory
 adminUid={adminUid}
 setActivePage={setActivePage}
 plan={plan}
 showUpgrade={() => setShowUpgrade(true)}
/>

)}


{/* rest of the pages go here… */}


    




            {isAdminOrSubAdmin && activePage === "teacher" && (
              <Teacher adminUid={adminUid} requirePremium={requirePremium} />
            )}

{(isAdminOrSubAdmin || viewAs === "parent") && activePage === "parent" && (
  <Parent adminUid={adminUid} requirePremium={requirePremium} />
)}


            {isAdminOrSubAdmin && activePage === "student" && (
              <Student adminUid={adminUid} requirePremium={requirePremium} />
            )}
              {isAdminOrSubAdmin && activePage === "office_staff" && (
  <OfficeStaff adminUid={adminUid} requirePremium={requirePremium}/>
)}


            {(role === "teacher" || role === "parent") &&
              activePage === "studentDetails" && <StudentDetails />}

            {isAdminOrSubAdmin && activePage === "timetable" && (
              <AdminTimetable />
            )}

{(role === "master") && activePage === "admin" && (
  <Admin requirePremium={requirePremium} />
)}


            {activePage === "approvals" && role === "master" && <Approvals requirePremium={requirePremium} />}
            {(role === "teacher" || viewAs === "teacher") &&
  activePage === "teacher-timetable" && (
    <TeacherTimetable teacherId={viewTeacherId} />
)}

            
          {isAdminOrSubAdmin && activePage === "attendance" && (
              <Attendance adminUid={adminUid} />
              )}
{isAdminOrSubAdmin && activePage === "todays-absent" && (
  isPremium ? (
    <ShowTodaysAbsent adminUid={adminUid} setActivePage={setActivePage} />
  ) : (
    <UpgradePopup onClose={() => setActivePage("home")} />
  )
)}


            {isAdminOrSubAdmin && activePage === "courses" && (
            <Courses />
            )}
           {(role === "teacher" || viewAs === "teacher") &&
  activePage === "teacher-attendance" && (
    <TeacherAttendance teacherId={viewTeacherId} />
)}

            
{isAdminOrSubAdmin && activePage === "teacher-absents" && (
  isPremium ? (
    <ShowTodaysTeacherAbsent adminUid={adminUid} setActivePage={setActivePage} />
  ) : (
    <UpgradePopup onClose={() => setActivePage("home")} />
  )
)}

            {role === "master" && activePage === "applications" && (
              <ApplicationList requirePremium={requirePremium} />
              )}
              {activePage === "profile" && (
    <Profile />
  )}
  

  


          </div>
        </div>
        {showUpgrade && !upgradeDisabled && (
  <UpgradePopup
    onClose={() => setShowUpgrade(false)}
    onUpgrade={() => navigate("/payment")}
  />
)}


      </div>
      </>
    );
  };

  export default Dashboard;