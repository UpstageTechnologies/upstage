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

import { FaUserCircle } from "react-icons/fa";



const today = new Date().toLocaleDateString("en-CA");

export default function Home({ adminUid, setActivePage,plan }) {
const [stats, setStats] = useState({
  studentPresent: 0,
  studentAbsent: 0,
  studentLate: 0,
  teacherPresent: 0,
  teacherAbsent: 0
});


  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);


  const [showUpgrade, setShowUpgrade] = useState(false);

  const userPlan = (plan || "basic").toLowerCase();
  const isPremium = userPlan === "premium" || userPlan === "lifetime";

  console.log("USER PLAN =", plan, "isPremium =", isPremium);


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

    setLoading(true);

    /* ================= STUDENTS — REALTIME ================= */
   const classRef = collection(db, "users", adminUid, "attendance");

const unsubStudents = onSnapshot(classRef, snap => {
  let present = 0;
  let absent = 0;
  let late = 0;

  const unsubList = [];

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

    const u = onSnapshot(dateRef, d => {
      if (!d.exists()) return;

      const rec = d.data().records || {};

      Object.values(rec).forEach(s => {
        if (s === "present") present++;
        else if (s === "absent") absent++;
        else if (s === "late") late++;
      });

      setStats(prev => ({
        ...prev,
        studentPresent: present,
        studentAbsent: absent,
        studentLate: late
      }));

      setLoading(false);
    });

    unsubList.push(u);
  });

  return () => unsubList.forEach(u => u());
});


    /* ================= TEACHERS — REALTIME ================= */
    const teacherRef = doc(
      db,
      "users",
      adminUid,
      "teacherAttendance",
      today
    );

    const unsubTeachers = onSnapshot(teacherRef, snap => {
      let teacherPresent = 0;
      let teacherAbsent = 0;

      if (snap.exists()) {
        const rec = snap.data().records || {};

        Object.values(rec).forEach(s => {
          if (s === "present") teacherPresent++;
          if (s === "absent") teacherAbsent++;
        });
      }

      setStats(prev => ({
        ...prev,
        teacherPresent,
        teacherAbsent
      }));
    });



    // cleanup listeners
    return () => {
      unsubStudents();
      unsubTeachers();
    };
  }, [adminUid]);

      const maxCount = Math.max(
  stats.studentPresent,
  stats.studentLate,
  stats.studentAbsent,
  1
);



  return (
<>



    {/* ================= PERSONAL DETAILS HEADER ================= */}
    {profile && (
      <div className="student-header">

        <div className="student-left">
          <div className="student-avatar">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt="profile" />
            ) : (
              <FaUserCircle size={55} color="#ccc" />
            )}
          </div>

          <div>
            <h3>{profile.name || profile.username}</h3>
            <small>{profile.role || localStorage.getItem("role")}</small>
          </div>
        </div>

        <div className="student-info">
          <div><br/>
            <span>Email</span>
            <b>{profile.email}</b>
          </div>

          <div><br/>
            <span>Phone</span>
            <b>{profile.phone || "—"}</b>
          </div>

          <div><br/>
            <span>Address</span>
            <b>{profile.address || "—"}</b>
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


       <div className="summary2-cards">

  {/* Attendance */}
  <div className="summary2-card">
    <div className="summary2-top">{stats.studentPresent}</div>
    <div
      className="summary2-fill fill-blue"
      style={{ height: `${(stats.studentPresent / maxCount) * 100}%` }}
    />
    <div className="summary2-content">
      <i className="fa fa-user-check"></i>
      <span>Attendance</span>
    </div>
  </div>

  {/* Late */}
  <div className="summary2-card">
    <div className="summary2-top">{stats.studentLate}</div>
    <div
      className="summary2-fill fill-yellow"
      style={{ height: `${(stats.studentLate / maxCount) * 100}%` }}
    />
    <div className="summary2-content">
      <i className="fa fa-clock"></i>
      <span>Late</span>
    </div>
  </div>

  {/* Absent */}
  <div className="summary2-card">
    <div className="summary2-top">{stats.studentAbsent}</div>
    <div
      className="summary2-fill fill-red"
      style={{ height: `${(stats.studentAbsent / maxCount) * 100}%` }}
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