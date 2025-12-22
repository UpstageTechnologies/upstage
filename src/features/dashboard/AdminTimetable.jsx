import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";
import { auth ,db } from "../../services/firebase";
import "../dashboard_styles/AdminTimetable.css";

const CLASSES = Array.from({ length: 12 }, (_, i) => i + 1);
const SECTIONS = ["A", "B", "C", "D"];
const PERIODS = [1, 2, 3, 4, 5, 6];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const AdminTimetable = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [table, setTable] = useState({});

  // ADMIN UID (from dashboard / login)
  const adminUid =
  auth.currentUser?.uid || localStorage.getItem("adminUid");

  /* ================= LOAD ================= */
  const loadTimetable = async () => {
    if (!selectedClass || !selectedSection || !adminUid) return;

    const ref = doc(
      db,
      "users",
      adminUid,
      "timetables",
      `${selectedClass}_${selectedSection}`
    );

    const snap = await getDoc(ref);

    if (snap.exists() && snap.data()?.[selectedDay]) {
      setTable(snap.data()[selectedDay]);
    } else {
      setTable({});
    }
  };

  useEffect(() => {
    loadTimetable();
  }, [selectedDay, selectedSection]);

  /* ================= SAVE ================= */
  const saveTimetable = async () => {
    try {
      const adminUid =
        auth.currentUser?.uid || localStorage.getItem("adminUid");
  
      const role = localStorage.getItem("role");
      const subAdminId = localStorage.getItem("adminId"); // admin01
  
      if (!adminUid) {
        alert("Admin not logged in. Please logout & login again.");
        return;
      }
  
      const ref = doc(
        db,
        "users",
        adminUid,
        "timetables",
        `${selectedClass}_${selectedSection}`
      );
  
      const payload = {
        [selectedDay]: table
      };
  
      // 🔥 ONLY FOR SUB ADMIN
      if (role === "sub_admin") {
        payload.createdBy = subAdminId;
      }
  
      await setDoc(ref, payload, { merge: true });
  
      alert("✅ Timetable saved successfully");
    } catch (err) {
      console.error("SAVE ERROR 👉", err);
      alert(err.message);
    }
  };
  

  const resetAll = () => {
    setSelectedClass(null);
    setSelectedSection(null);
    setTable({});
  };

  return (
    <div className="tt-container">
      <h2 className="tt-title">Admin Timetable</h2>

      {/* CLASS SELECT */}
      {!selectedClass && (
        <div className="class-grid">
          {CLASSES.map(c => (
            <div
              key={c}
              className="class-card"
              onClick={() => setSelectedClass(c)}
            >
              {c} Std
            </div>
          ))}
        </div>
      )}

      {/* SECTION SELECT */}
      {selectedClass && !selectedSection && (
        <>
          <h3 className="tt-sub">
            Class {selectedClass} – Select Section
          </h3>

          <div className="section-row">
            {SECTIONS.map(sec => (
              <div
                key={sec}
                className="section-btn"
                onClick={() => setSelectedSection(sec)}
              >
                {sec}
              </div>
            ))}
          </div>

          <p className="back" onClick={resetAll}>← Back</p>
        </>
      )}

      {/* TIMETABLE */}
      {selectedClass && selectedSection && (
        <>
          <h3 className="tt-sub">
            Class {selectedClass} – Section {selectedSection}
          </h3>

          <div className="day-row">
            {DAYS.map(d => (
              <button
                key={d}
                className={`day-btn ${selectedDay === d ? "active" : ""}`}
                onClick={() => setSelectedDay(d)}
              >
                {d}
              </button>
            ))}
          </div>

          {PERIODS.map(p => (
            <div key={p} className="period-row">
              <label>Period {p}</label>
              <input
                placeholder="Enter Subject"
                value={table[`p${p}`] || ""}
                onChange={e =>
                  setTable({ ...table, [`p${p}`]: e.target.value })
                }
              />
            </div>
          ))}

          <button className="save-btn" onClick={saveTimetable}>
            Save Timetable
          </button>

          <p className="back" onClick={resetAll}>
            ← Change Class / Section
          </p>
        </>
      )}
    </div>
  );
};

export default AdminTimetable;
