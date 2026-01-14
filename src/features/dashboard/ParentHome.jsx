import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import "../dashboard_styles/Home.css";
import { FaUserCircle } from "react-icons/fa";

export default function ParentHome({ adminUid, parentId }) {

  const [parent, setParent] = useState(null);

  // 🔥 DEMO STATS (later we will connect real student attendance)
  const [stats, setStats] = useState({
    totalDays: 10,
    present: 7,
    late: 1,
    absent: 2
  });

  /* ================= LOAD PARENT PROFILE ================= */
  useEffect(() => {
    if (!adminUid || !parentId) return;

    const ref = doc(db, "users", adminUid, "parents", parentId);

    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        setParent(snap.data());
      }
    });

    return () => unsub();
  }, [adminUid, parentId]);

  const percent = (v, t) =>
    t === 0 ? 0 : Math.round((v / t) * 100);

  return (
    <>
      {parent && (
        <div className="student-header">

          {/* ===== TOP ROW ===== */}
          <div className="student-top-row">
            <div className="student-left">

              <div className="student-avatar">
                {parent.photoURL ? (
                  <img src={parent.photoURL} alt="profile" />
                ) : (
                  <FaUserCircle size={55} color="#ccc" />
                )}
              </div>

              <div className="name-role-row">
                <h3>{parent.name}</h3>
                <span className="role-badge">PARENT</span>
              </div>

            </div>

            <div className="student-info">
              <div>
                <span>Email</span>
                <b>{parent.email}</b>
              </div>
              <div>
                <span>Phone</span>
                <b>{parent.phone || "—"}</b>
              </div>
              <div>
                <span>Address</span>
                <b>{parent.address || "—"}</b>
              </div>
            </div>
          </div>

          {/* ===== TOP SUMMARY CARDS ===== */}
          <div className="top-summary-row">
            <div className="top-card green">
              <i className="fa fa-calendar"></i>
              <div>
                <b>{stats.totalDays}</b>
                <small>Total Days</small>
              </div>
            </div>

            <div className="top-card blue">
              <i className="fa fa-user-check"></i>
              <div>
                <b>{stats.present}</b>
                <small>Present</small>
              </div>
            </div>

            <div className="top-card yellow">
              <i className="fa fa-clock"></i>
              <div>
                <b>{stats.late}</b>
                <small>Late</small>
              </div>
            </div>

            <div className="top-card red">
              <i className="fa fa-user-times"></i>
              <div>
                <b>{stats.absent}</b>
                <small>Absent</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUMMARY LAYOUT ================= */}
      <div className="summary-layout">

        <div className="summary-left">
          <div className="attendance-panel">
            <div>
              <h4>Class Days</h4>
              <h2>{stats.totalDays}</h2>
            </div>

            <div>
              <h4>Attendance Rate</h4>
              <h1>{percent(stats.present, stats.totalDays)}%</h1>
            </div>
          </div>
        </div>

        <div className="summary2-wrapper">
          <div className="summary-title">This Month Attendance</div>

          <div className="summary2-cards">

            <div className="summary2-card total-card">
              <div className="summary2-top">{stats.totalDays}</div>
              <div className="summary2-fill fill-green" style={{ height: "100%" }} />
              <div className="summary2-content">
                <i className="fa fa-calendar"></i>
                <span>Total</span>
              </div>
            </div>

            <div className="summary2-card">
              <div className="summary2-top">{stats.present}</div>
              <div
                className="summary2-fill fill-blue"
                style={{ height: `${percent(stats.present, stats.totalDays)}%` }}
              />
              <div className="summary2-content">
                <i className="fa fa-user-check"></i>
                <span>Present</span>
              </div>
            </div>

            <div className="summary2-card">
              <div className="summary2-top">{stats.late}</div>
              <div
                className="summary2-fill fill-yellow"
                style={{ height: `${percent(stats.late, stats.totalDays)}%` }}
              />
              <div className="summary2-content">
                <i className="fa fa-clock"></i>
                <span>Late</span>
              </div>
            </div>

            <div className="summary2-card">
              <div className="summary2-top">{stats.absent}</div>
              <div
                className="summary2-fill fill-red"
                style={{ height: `${percent(stats.absent, stats.totalDays)}%` }}
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