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


const today = new Date().toLocaleDateString("en-CA");

export default function Home({ adminUid, setActivePage,plan }) {
  const [stats, setStats] = useState({
    studentPresent: 0,
    studentAbsent: 0,
    teacherPresent: 0,
    teacherAbsent: 0
  });

  const [loading, setLoading] = useState(true);

  const [showUpgrade, setShowUpgrade] = useState(false);

  const userPlan = (plan || "basic").toLowerCase();
  const isPremium = userPlan === "premium" || userPlan === "lifetime";

  console.log("USER PLAN =", plan, "isPremium =", isPremium);



  useEffect(() => {
    if (!adminUid) return;

    setLoading(true);

    /* ================= STUDENTS — REALTIME ================= */
    const classRef = collection(db, "users", adminUid, "attendance");

    const unsubStudents = onSnapshot(classRef, snap => {
      let studentPresent = 0;
      let studentAbsent = 0;

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

        onSnapshot(dateRef, d => {
          if (!d.exists()) return;

          const rec = d.data().records || {};

          Object.values(rec).forEach(s => {
            if (s === "present") studentPresent++;
            if (s === "absent") studentAbsent++;
          });

          setStats(prev => ({
            ...prev,
            studentPresent,
            studentAbsent
          }));
        });
      });

      setLoading(false);
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

  return (
    <div className="home-wrapper">
      <div className="cards-row">
        {/* STUDENTS */}
        <div className="home-card green">
          <h4>
            Students Present <FaUserGraduate />
          </h4>

          <h1>{loading ? "…" : stats.studentPresent}</h1>

          <p>____________________________</p>

          <h4>
            Students Absent <FaUserTimes />
          </h4>

          <h1>{loading ? "…" : stats.studentAbsent}</h1>

          <br />

          <button
  onClick={e => {
    e.stopPropagation();

    if (!isPremium) {
      setShowUpgrade(true);
      return;
    }

    setActivePage("todays-absent");
  }}
>
  Absent list
</button>

        </div>

        {/* TEACHERS */}
        <div className="home-card blue">
          <h4>
            Teachers Present <FaUserCheck />
          </h4>

          <h1>{loading ? "…" : stats.teacherPresent}</h1>

          <p>____________________________</p>

          <h4>
            Teachers Absent <FaChalkboardTeacher />
          </h4>

          <h1>{loading ? "…" : stats.teacherAbsent}</h1>

          <br />

          <button
  onClick={e => {
    e.stopPropagation();

    if (!isPremium) {
      setShowUpgrade(true);
      return;
    }

    setActivePage("teacher-absents");
  }}
>
  Absent list
</button>

        </div>
      </div>
      {showUpgrade && (
  <UpgradePopup
    onClose={() => setShowUpgrade(false)}
    onUpgrade={() => {
      window.location.href = "/payment";
    }}
  />
)}

    </div>
  );
}
