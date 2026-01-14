import React, { useEffect, useState } from "react";
  import {
    collection,
    doc,
    onSnapshot
  } from "firebase/firestore";
  import { db } from "../../services/firebase";
  import "../dashboard_styles/Home.css";

  import {
    FaUserGraduate,
    FaUserTimes,
    FaChalkboardTeacher,
    FaUserCheck
  } from "react-icons/fa";
  import UpgradePopup from "../../components/UpgradePopup";
  import "@fortawesome/fontawesome-free/css/all.min.css";
  import TeacherHome from "./TeacherHome";
  import ParentHome from "./ParentHome";

  import { FaUserCircle } from "react-icons/fa";



  const today = new Date().toLocaleDateString("en-CA");

  export default function Home({ adminUid, setActivePage,plan }) {
  const [stats, setStats] = useState({
    studentPresent: 0,
    studentAbsent: 0,
    studentLate: 0,
    teacherPresent: 0,
    teacherAbsent: 0,
      teacherLate: 0
  });


    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
  const [viewMode, setViewMode] = useState("student");

  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);


    const [showUpgrade, setShowUpgrade] = useState(false);

    const userPlan = (plan || "basic").toLowerCase();
    const isPremium = userPlan === "premium" || userPlan === "lifetime";

    const getPercent = (value, total) => {
  if (!total || total <= 0) return 0;
  return Math.min((value / total) * 100, 100);
};

const role = localStorage.getItem("role");
const teacherId = localStorage.getItem("teacherDocId");
const parentId = localStorage.getItem("parentDocId"); 

if (role === "teacher") {
  return (
    <TeacherHome
      adminUid={adminUid}
      teacherId={teacherId}
    />
  );
}
if (role === "parent") {
  return (
    <ParentHome
      adminUid={adminUid}
      parentId={parentId}
    />
  );
}

    console.log("USER PLAN =", plan, "isPremium =", isPremium);


    useEffect(() => {
    if (!adminUid) return;

    const studentsRef = collection(db, "users", adminUid, "students");

    const unsub = onSnapshot(studentsRef, snap => {
      setTotalStudents(snap.size);
    });

    return () => unsub();
  }, [adminUid]);

  useEffect(() => {
    if (!adminUid) return;

    const teachersRef = collection(db, "users", adminUid, "teachers");

    const unsub = onSnapshot(teachersRef, snap => {
      setTotalTeachers(snap.size);
    });

    return () => unsub();
  }, [adminUid]);


    useEffect(() => {
    if (!adminUid) return;

    const role = localStorage.getItem("role");

    let ref = doc(db, "users", adminUid);

    if (role === "admin")
      ref = doc(db, "users", adminUid, "admins", localStorage.getItem("adminId"));
    if (role === "teacher")
      ref = doc(db, "users", adminUid, "teachers", localStorage.getItem("teacherDocId"));
    if (role === "parent")
      ref = doc(db, "users", adminUid, "parents", localStorage.getItem("parentDocId"));

    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        setProfile(snap.data());
      }
    });

    return () => unsub();
  }, [adminUid]);


  useEffect(() => {
    if (!adminUid) return;

    let unsubDateListeners = [];

    const classRef = collection(db, "users", adminUid, "attendance");

    const unsubClasses = onSnapshot(classRef, snap => {
      // remove old listeners
      unsubDateListeners.forEach(u => u());
      unsubDateListeners = [];

      snap.docs.forEach(c => {
        const dateRef = doc(
          db,
          "users",
          adminUid,
          "attendance",
          c.id,
          "dates",
          today
        );

        const unsub = onSnapshot(dateRef, d => {
          let totalPresent = 0;
          let totalAbsent = 0;
          let totalLate = 0;

          // 🔥 Recalculate ALL classes every time
          snap.docs.forEach(cls => {
            const ref = doc(
              db,
              "users",
              adminUid,
              "attendance",
              cls.id,
              "dates",
              today
            );

            onSnapshot(ref, snap2 => {
              if (snap2.exists()) {
                const rec = snap2.data().records || {};
                Object.values(rec).forEach(s => {
                  if (s === "present") totalPresent++;
                  else if (s === "absent") totalAbsent++;
                  else if (s === "late") totalLate++;
                });
              }

              setStats(prev => ({
                ...prev,
                studentPresent: totalPresent,
                studentAbsent: totalAbsent,
                studentLate: totalLate
              }));
            });
          });
        });

        unsubDateListeners.push(unsub);
      });
    });

    return () => {
      unsubClasses();
      unsubDateListeners.forEach(u => u());
    };
  }, [adminUid]);

  useEffect(() => {
    if (!adminUid) return;

    const teacherRef = doc(
      db,
      "users",
      adminUid,
      "teacherAttendance",
      today
    );



    const unsub = onSnapshot(teacherRef, snap => {
      let teacherPresent = 0;
      let teacherAbsent = 0;
      let teacherLate = 0;

      if (snap.exists()) {
        const rec = snap.data().records || {};

        Object.values(rec).forEach(s => {
          if (s === "present") teacherPresent++;
          else if (s === "absent") teacherAbsent++;
          else if (s === "late") teacherLate++;
        });
      }

      setStats(prev => ({
        ...prev,
        teacherPresent,
        teacherAbsent,
        teacherLate
      }));
    });

    return () => unsub();
  }, [adminUid]);



    const activeStats =
    viewMode === "student"
      ? {
          present: stats.studentPresent,
          late: stats.studentLate,
          absent: stats.studentAbsent
        }
      : {
          present: stats.teacherPresent,
          late: stats.teacherLate,
          absent: stats.teacherAbsent
        };
  
          const totalBase =
    viewMode === "student"
      ? (totalStudents > 0 ? totalStudents : 1)
      : (totalTeachers > 0 ? totalTeachers : 1);


    return (
  <>



      {/* ================= PERSONAL DETAILS HEADER ================= */}
      {profile && (
        <div className="student-header">

  {/* ===== TOP ROW ===== */}
  <div className="student-top-row">
    <div className="student-left">
      <div className="student-avatar">
        {profile.photoURL ? (
          <img src={profile.photoURL} alt="profile" />
        ) : (
          <FaUserCircle size={55} color="#ccc" />
        )}
      </div>

      <div  className="name-role-row">
        <h3>{profile.name || profile.username}</h3>
        <span className="role-badge">
  {profile.role || localStorage.getItem("role")}
</span>

      </div>
    </div>

    <div className="student-info">
      <div>
        <span>Email</span>
        <b>{profile.email}</b>
      </div>
      <div>
        <span>Phone</span>
        <b>{profile.phone || "—"}</b>
      </div>
      <div>
        <span>Address</span>
        <b>{profile.address || "—"}</b>
      </div>
    </div>
  </div>

  {/* ===== SECOND ROW (CARDS) ===== */}
  <div className="top-summary-row">
    <div className="top-card green">
      <i className="fa fa-users"></i>
      <div>
        <b>{viewMode === "student" ? totalStudents : totalTeachers}</b>
        <small>Total</small>
      </div>
    </div>

    <div className="top-card blue">
      <i className="fa fa-user-check"></i>
      <div>
        <b>{activeStats.present}</b>
        <small>Attendance</small>
      </div>
    </div>

    <div className="top-card yellow">
      <i className="fa fa-clock"></i>
      <div>
        <b>{activeStats.late}</b>
        <small>Late</small>
      </div>
    </div>

    <div className="top-card red">
      <i className="fa fa-user-times"></i>
      <div>
        <b>{activeStats.absent}</b>
        <small>Absent</small>
      </div>
    </div>
  </div>

</div>

      )}

      {/* ================= SUMMARY LAYOUT ================= */}
      <div className="summary-layout">

        {/* -------- LEFT SIDE -------- */} 
        <div className="summary-left">

          {/* Class Days + Attendance Rate */}
          <div className="attendance-panel">
            <div>
              <h4>Class Days</h4>
              <h2>23 Days</h2>
            </div>

            <div>
              <h4>Attendance Rate</h4>
              <h1>56%</h1>
            </div>
          </div>

  <div className="monthly-flow2">

    {/* SVG trend line */}
    <svg className="trend-line" viewBox="0 0 600 120" preserveAspectRatio="none">
      <path
        d="M 0 80 L 200 40 L 400 70 L 600 30"
        fill="none"
        stroke="#8ab6f9"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>

    <div className="flow-item blue" style={{ top: "60px" }}>
      <small>January</small>
      <b>57%</b>
    </div>

    <div className="flow-item orange" style={{ top: "10px" }}>
      <small>February</small>
      <b>55%</b>
    </div>

    <div className="flow-item green" style={{ top: "40px" }}>
      <small>March</small>
      <b>—</b>
    </div>

  </div>



        </div>

        {/* -------- RIGHT SIDE (SUMMARY PILLS) -------- */}
        <div className="summary2-wrapper">
          <div className="summary-title">
    Today’s Attendance
  </div>
<div className="oval-toggle">
  <div
    className={`oval-slider ${viewMode === "teacher" ? "right" : "left"}`}
  />

  <button
    className={viewMode === "student" ? "active" : ""}
    onClick={() => setViewMode("student")}
  >
    Students
  </button>

  <button
    className={viewMode === "teacher" ? "active" : ""}
    onClick={() => setViewMode("teacher")}
  >
    Teachers
  </button>
</div>



        <div className="summary2-cards">

          {/* TOTAL */}
  <div className="summary2-card total-card">
    <div className="summary2-top">
      {viewMode === "student" ? totalStudents : totalTeachers}
    </div>

    <div
      className="summary2-fill fill-green"
      style={{ height: "100%" }}
    />

    <div className="summary2-content">
      <i className="fa fa-users"></i>
      <span>Total</span>
    </div>
  </div>


    {/* Attendance */}
    <div className="summary2-card">
      
      <div className="summary2-top">{activeStats.present}</div>
<div
  className="summary2-fill fill-blue"
  style={{ height: `${getPercent(activeStats.present, totalBase)}%` }}
/>

      <div className="summary2-content">
        <i className="fa fa-user-check"></i>
        <span>Prasent</span>
      </div>
    </div>

    {/* Late */}
    <div className="summary2-card">
      <div className="summary2-top">{activeStats.late}</div>
<div
  className="summary2-fill fill-yellow"
  style={{ height: `${getPercent(activeStats.late, totalBase)}%` }}
/>

      <div className="summary2-content">
        <i className="fa fa-clock"></i>
        <span>Late</span>
      </div>
    </div>

    {/* Absent */}
<div
  className="summary2-card clickable"
  onClick={() => {
    if (viewMode === "student") {
      setActivePage("todays-absent");
    } else {
      setActivePage("teacher-absents");
    }
  }}

>
  <div className="summary2-top">{activeStats.absent}</div>
  <div
    className="summary2-fill fill-red"
    style={{ height: `${getPercent(activeStats.absent, totalBase)}%` }}
  />
  <div className="summary2-content">
    <i className="fa fa-user-times"></i>
    <span>Absent</span>
  </div>
</div>


  </div>


        </div>

      </div>

    
      </>
    );
  }