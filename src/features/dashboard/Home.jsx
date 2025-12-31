import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import "../dashboard_styles/Home.css";
import { FaUserGraduate, FaUserTimes, FaChalkboardTeacher, FaUserCheck } from "react-icons/fa";


const today = new Date().toLocaleDateString("en-CA");

export default function Home({ adminUid }) {
  const [stats, setStats] = useState({
    studentPresent: 0,
    studentAbsent: 0,
    teacherPresent: 0,
    teacherAbsent: 0
  });

  const loadData = async () => {
    if (!adminUid) return;

    let studentPresent = 0,
      studentAbsent = 0,
      teacherPresent = 0,
      teacherAbsent = 0;

    // STUDENT ATTENDANCE
    const classesSnap = await getDocs(
      collection(db, "users", adminUid, "attendance")
    );

    for (const c of classesSnap.docs) {
      const dateDoc = await getDoc(
        doc(db, "users", adminUid, "attendance", c.id, "dates", today)
      );

      if (!dateDoc.exists()) continue;

      const rec = dateDoc.data().records || {};

      Object.values(rec).forEach((status) => {
        if (status === "present") studentPresent++;
        if (status === "absent") studentAbsent++;
      });
    }

    // TEACHER ATTENDANCE
    const tDoc = await getDoc(
      doc(db, "users", adminUid, "teacherAttendance", today)
    );

    if (tDoc.exists()) {
      const r = tDoc.data().records || {};

      Object.values(r).forEach((status) => {
        if (status === "present") teacherPresent++;
        if (status === "absent") teacherAbsent++;
      });
    }

    setStats({
      studentPresent,
      studentAbsent,
      teacherPresent,
      teacherAbsent
    });
  };

  useEffect(() => {
    loadData();
  }, [adminUid]);

  return (
    <div className="home-wrapper">
      <div className="cards-row">

        <div className="home-card green">
          <h4>Students Present  <FaUserGraduate/></h4>
          <h1>{stats.studentPresent}</h1>
          <p>Today</p>
        </div>

        <div className="home-card red">
          <h4>Students Absent  <FaUserTimes/></h4>
          <h1>{stats.studentAbsent}</h1>
          <p>Today</p>
        </div>

        <div className="home-card blue">
          <h4>Teachers Present  < FaUserCheck/></h4>
          <h1>{stats.teacherPresent}</h1>
          <p>Today</p>
        </div>

        <div className="home-card purple">
          <h4>Teachers Absent  <FaChalkboardTeacher/></h4>
          <h1>{stats.teacherAbsent}</h1>
          <p>Today</p>
        </div>

      </div>
    </div>
  );
}
