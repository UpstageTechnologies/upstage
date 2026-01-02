import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "../../services/firebase";
import "../dashboard_styles/Attendance.css";

export default function TeacherAttendance() {

  const adminUid = localStorage.getItem("adminUid");

  const userId =
    localStorage.getItem("teacherId") ||
    localStorage.getItem("subAdminId") ||
    localStorage.getItem("adminUid");

  const [teachers, setTeachers] = useState([]);
  const [records, setRecords] = useState({});
  const [lateTimes, setLateTimes] = useState({});
  const [history, setHistory] = useState({});
  const [dayLabels, setDayLabels] = useState([]);

  const [date, setDate] = useState(
    new Date().toISOString().substring(0, 10)
  );

  /* 1️⃣ LOAD TEACHERS */
  useEffect(() => {
    async function loadTeachers() {
      if (!adminUid) return;

      const snap = await getDocs(
        collection(db, "users", adminUid, "teachers")
      );

      setTeachers(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
      );
    }

    loadTeachers();
  }, [adminUid]);

  /* 2️⃣ LOAD ATTENDANCE + HISTORY */
  useEffect(() => {
    async function loadAttendance() {

      if (!adminUid || teachers.length === 0) return;

      // ⭐ Today
      const todayDoc = await getDoc(
        doc(db, "users", adminUid, "teacherAttendance", date)
      );

      if (todayDoc.exists()) {
        setRecords(todayDoc.data().records || {});
        setLateTimes(todayDoc.data().lateTimes || {});
      } else {
        const init = {};
        teachers.forEach(t => (init[t.id] = ""));
        setRecords(init);
        setLateTimes({});
      }

      // ⭐ Previous 7 days
      const hist = {};
      const labels = [];

      for (let i = 1; i <= 7; i++) {
        const d = new Date(date);
        d.setDate(d.getDate() - i);

        const y = d.toISOString().substring(0, 10);
        labels.push(String(d.getDate()).padStart(2, "0"));

        const past = await getDoc(
          doc(db, "users", adminUid, "teacherAttendance", y)
        );

        if (past.exists()) {
          const rec = past.data().records || {};
          teachers.forEach(t => {
            if (!hist[t.id]) hist[t.id] = [];
            hist[t.id].push(rec[t.id] || null);
          });
        } else {
          teachers.forEach(t => {
            if (!hist[t.id]) hist[t.id] = [];
            hist[t.id].push(null);
          });
        }
      }

      Object.keys(hist).forEach(k => hist[k].reverse());
      setHistory(hist);
      setDayLabels(labels.reverse());
    }

    loadAttendance();
  }, [teachers, date, adminUid]);

  /* 3️⃣ SAVE ATTENDANCE */
  async function saveAttendance() {
    try {
      await setDoc(
        doc(db, "users", adminUid, "teacherAttendance", date),
        {
          records,
          lateTimes,
          updatedAt: Timestamp.now(),
          markedBy: userId,
          date
        },
        { merge: true }
      );

      alert("✅ Teacher attendance saved");
    } catch (e) {
      console.error(e);
      alert("❌ Save failed — check console");
    }
  }

  return (
    <div className="tt-container">
      <h2 className="tt-title">Teacher Attendance</h2>

      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
      />

      {teachers.length > 0 && (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Teacher ID</th>
              <th>Class</th>
              <th>Section</th>
              <th>Status</th>

              <th colSpan={dayLabels.length} style={{ textAlign: "center" }}>
                Previous 7 Days
              </th>
            </tr>

            <tr>
              <th></th><th></th><th></th><th></th><th></th>

              {dayLabels.map((d, i) => (
                <th key={i} style={{ textAlign: "center", width: 32 }}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {teachers.map(t => (
              <React.Fragment key={t.id}>
                <tr>
                  <td data-label="Name">{t.name}</td>
                  <td data-label="Teacher Id">{t.teacherId}</td>
                  <td data-label="Class"> {t.assignedClasses?.[0]?.class || "-"}</td>
                  <td data-label="Section">{t.assignedClasses?.[0]?.section || "-"}</td>

                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["present","absent","late"].map(st => (
                        <button
                          key={st}
                          onClick={() => {
                            setRecords(prev => ({ ...prev, [t.id]: st }));

                            if (st === "late") {
                              const time = prompt("Late time HH:MM", "00:00");
                              if (time) {
                                setLateTimes(prev => ({
                                  ...prev,
                                  [t.id]: time
                                }));
                              }
                            }
                          }}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 6,
                            border: "1px solid #ccc",
                            background:
                              records[t.id] === st
                                ? st === "present"
                                  ? "#4caf50"
                                  : st === "absent"
                                  ? "#e74c3c"
                                  : "#f1c40f"
                                : "#fff",
                            color: records[t.id] === st ? "#fff" : "#333",
                            fontWeight: 600
                          }}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </td>

                  {/* ⭐ Previous 7 days (same color as students) */}
                  {dayLabels.map((_, i) => {
                    const st = (history[t.id] || [])[i];
                    return (
                      <td key={i} className="prev-cell" style={{ textAlign:"center" }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color:
                              st === "present"
                                ? "green"
                                : st === "absent"
                                ? "red"
                                : "#c9a000"
                          }}
                        >
                          {st === "present"
                            ? "✔"
                            : st === "absent"
                            ? "✖"
                            : st
                            ? "L"
                            : "—"}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* 📱 Mobile row */}
                <tr className="mobile-prev-row">
                  <td colSpan={dayLabels.length + 5}>
                    <div className="prev-box">
                      <div className="prev-dates">
                        {dayLabels.map((d, i) => (
                          <span key={i}>{d}</span>
                        ))}
                      </div>

                      <div className="prev-row">
                        {(history[t.id] || []).map((st, i) => (
                          <span
                            key={i}
                            className="prev-icon"
                            style={{
                              fontWeight: 700,
                              color:
                                st === "present"
                                  ? "green"
                                  : st === "absent"
                                  ? "red"
                                  : "#c9a000"
                            }}
                          >
                            {st === "present"
                              ? "✔"
                              : st === "absent"
                              ? "✖"
                              : st
                              ? "L"
                              : "—"}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}

      {teachers.length > 0 && (
        <button className="save-btn" onClick={saveAttendance}>
          Save Attendance
        </button>
      )}
    </div>
  );
}
