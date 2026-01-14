import React, { useEffect, useState } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import "../dashboard_styles/Home.css";
import { FaUserCircle } from "react-icons/fa";

export default function TeacherHome({ adminUid, teacherId }) {
  const [profile, setProfile] = useState(null);

  const [monthStats, setMonthStats] = useState({
    totalDays: 0,
    present: 0,
    late: 0,
    absent: 0
  });

  const month = new Date().toISOString().slice(0, 7); // 2026-01

  /* ================= TEACHER PROFILE ================= */
  useEffect(() => {
    if (!adminUid || !teacherId) return;

    const ref = doc(db, "users", adminUid, "teachers", teacherId);

    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        setProfile(snap.data());
      }
    });

    return () => unsub();
  }, [adminUid, teacherId]);

  /* ================= MONTHLY ATTENDANCE (REAL FIX) ================= */
  useEffect(() => {
    if (!adminUid || !teacherId) return;

    const ref = collection(db, "users", adminUid, "teacherAttendance");

    const unsub = onSnapshot(ref, snap => {
      let present = 0;
      let late = 0;
      let absent = 0;
      let total = 0;

      snap.forEach(d => {
        const date = d.id; // 2026-01-14
        if (!date.startsWith(month)) return; // only this month

        const records = d.data().records || {};
        const status = records[teacherId];

        if (!status) return;

        total++;

        if (status === "present") present++;
        else if (status === "late") late++;
        else if (status === "absent") absent++;
      });

      setMonthStats({
        totalDays: total,
        present,
        late,
        absent
      });
    });

    return () => unsub();
  }, [adminUid, teacherId, month]);

  const percent = (v, t) =>
    t === 0 ? 0 : Math.round((v / t) * 100);

  return (
    <>
      {/* ================= PERSONAL HEADER ================= */}
      {profile && (
        <div className="student-header">
          <div className="student-top-row">
            <div className="student-left">
              <div className="student-avatar">
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt="profile" />
                ) : (
                  <FaUserCircle size={55} color="#ccc" />
                )}
              </div>

              <div className="name-role-row">
                <h3>{profile.name || profile.username}</h3>
                <span className="role-badge">TEACHER</span>
              </div>
            </div>

            <div className="student-info">
              <div><span>Email</span><b>{profile.email}</b></div>
              <div><span>Phone</span><b>{profile.phone || "—"}</b></div>
              <div><span>Address</span><b>{profile.address || "—"}</b></div>
            </div>
          </div>

          {/* ===== TOP SUMMARY ===== */}
          <div className="top-summary-row">
            <div className="top-card green">
              <i className="fa fa-calendar"></i>
              <div>
                <b>{monthStats.totalDays}</b>
                <small>Total Days</small>
              </div>
            </div>

            <div className="top-card blue">
              <i className="fa fa-user-check"></i>
              <div>
                <b>{monthStats.present}</b>
                <small>Present</small>
              </div>
            </div>

            <div className="top-card yellow">
              <i className="fa fa-clock"></i>
              <div>
                <b>{monthStats.late}</b>
                <small>Late</small>
              </div>
            </div>

            <div className="top-card red">
              <i className="fa fa-user-times"></i>
              <div>
                <b>{monthStats.absent}</b>
                <small>Absent</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MONTH SUMMARY ================= */}
      <div className="summary-layout">
        <div className="summary-left">
          <div className="attendance-panel">
            <div>
              <h4>Class Days</h4>
              <h2>{monthStats.totalDays}</h2>
            </div>

            <div>
              <h4>Attendance Rate</h4>
              <h1>{percent(monthStats.present, monthStats.totalDays)}%</h1>
            </div>
          </div>
        </div>

        <div className="summary2-wrapper">
          <div className="summary-title">This Month Attendance</div>

          <div className="summary2-cards">
            <div className="summary2-card total-card">
              <div className="summary2-top">{monthStats.totalDays}</div>
              <div className="summary2-fill fill-green" style={{ height: "100%" }} />
              <div className="summary2-content">
                <i className="fa fa-calendar"></i>
                <span>Total</span>
              </div>
            </div>

            <div className="summary2-card">
              <div className="summary2-top">{monthStats.present}</div>
              <div className="summary2-fill fill-blue"
                style={{ height: `${percent(monthStats.present, monthStats.totalDays)}%` }} />
              <div className="summary2-content">
                <i className="fa fa-user-check"></i>
                <span>Present</span>
              </div>
            </div>

            <div className="summary2-card">
              <div className="summary2-top">{monthStats.late}</div>
              <div className="summary2-fill fill-yellow"
                style={{ height: `${percent(monthStats.late, monthStats.totalDays)}%` }} />
              <div className="summary2-content">
                <i className="fa fa-clock"></i>
                <span>Late</span>
              </div>
            </div>

            <div className="summary2-card">
              <div className="summary2-top">{monthStats.absent}</div>
              <div className="summary2-fill fill-red"
                style={{ height: `${percent(monthStats.absent, monthStats.totalDays)}%` }} />
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