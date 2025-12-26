import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  getDoc,
  Timestamp,
  addDoc
} from "firebase/firestore";
import { db } from "../../services/firebase";
import "../dashboard_styles/attendance.css";

const CLASSES = ["LKG", "UKG", "Play Group", ...Array.from({ length: 12 }, (_, i) => i + 1)];
const SECTIONS = ["A", "B", "C", "D"];

export default function Attendance({ adminUid }) {

  const uid = adminUid || localStorage.getItem("adminUid");
  const role = (localStorage.getItem("role") || "").toLowerCase();

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});

  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));

  const [history, setHistory] = useState({});
  const [dayLabels, setDayLabels] = useState([]);

  // 👇 store late time for each student
  const [lateTimes, setLateTimes] = useState({});

  /* ================= LOAD STUDENTS & HISTORY ================= */
  const loadStudents = async () => {
    if (!uid || !selectedClass || !selectedSection) return;

    const snap = await getDocs(collection(db, "users", uid, "students"));
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const filtered = all
      .filter(
        s =>
          String(s.className) === String(selectedClass) &&
          String(s.section).toUpperCase() === String(selectedSection).toUpperCase()
      )
      .sort((a, b) => a.studentName.localeCompare(b.studentName));

    setStudents(filtered);

    const docId = `${date}_${selectedClass}_${selectedSection}`;
    const attendSnap = await getDoc(doc(db, "users", uid, "attendance", docId));

    if (attendSnap.exists()) {
      const data = attendSnap.data();
      setRecords(data.records || {});
      setLateTimes(data.lateTimes || {});   // 👈 restore saved late times
    } else {
      const init = {};
      filtered.forEach(s => (init[s.id] = "present"));
      setRecords(init);
    }

    const historyData = {};
    const labels = [];

    for (let i = 1; i <= 7; i++) {
      const d = new Date(date);
      d.setDate(d.getDate() - i);

      const y = d.toISOString().substring(0, 10);
      const day = String(d.getDate()).padStart(2, "0");

      labels.push(day);

      const pastId = `${y}_${selectedClass}_${selectedSection}`;
      const pastSnap = await getDoc(doc(db, "users", uid, "attendance", pastId));

      if (pastSnap.exists()) {
        const rec = pastSnap.data().records || {};

        filtered.forEach(s => {
          if (!historyData[s.id]) historyData[s.id] = [];
          historyData[s.id].push(rec[s.id] || null);
        });

      } else {
        filtered.forEach(s => {
          if (!historyData[s.id]) historyData[s.id] = [];
          historyData[s.id].push(null);
        });
      }
    }

    Object.keys(historyData).forEach(sid => historyData[sid].reverse());
    setHistory(historyData);
    setDayLabels(labels.reverse());
  };

  useEffect(() => {
    loadStudents();
  }, [selectedClass, selectedSection, date]);

  /* ================= SAVE ================= */
  const saveAttendance = async () => {
    if (!uid || !students.length) return;

    const docId = `${date}_${selectedClass}_${selectedSection}`;

    if (role === "sub_admin") {
      await addDoc(collection(db, "users", uid, "approval_requests"), {
        module: "attendance",
        action: "save",
        docId,
        payload: { date, class: selectedClass, section: selectedSection, records, lateTimes },
        status: "pending",
        createdBy: localStorage.getItem("adminId"),
        createdAt: Timestamp.now()
      });

      alert("⏳ Attendance request sent to Admin");
      return;
    }

    await setDoc(
      doc(db, "users", uid, "attendance", docId),
      {
        date,
        class: selectedClass,
        section: selectedSection,
        records,
        lateTimes,        // 👈 save late times
        createdAt: Timestamp.now()
      },
      { merge: true }
    );

    alert("✅ Attendance saved");
  };

  return (
    <div className="tt-container">

      {(selectedClass || selectedSection) && (
        <p className="back" onClick={() => {
          setSelectedClass("");
          setSelectedSection("");
        }}>
          ← Back
        </p>
      )}

      <h2 className="tt-title">Attendance</h2>

      {!selectedClass && (
        <div className="class-grid">
          {CLASSES.map(c => (
            <div key={c} className="class-card" onClick={() => setSelectedClass(c)}>
              {typeof c === "number" ? `${c} Std` : c}
            </div>
          ))}
        </div>
      )}

      {selectedClass && !selectedSection && (
        <>
          <h3 className="tt-sub">Class {selectedClass} — Select Section</h3>

          <div className="section-row">
            {SECTIONS.map(sec => (
              <div key={sec} className="section-btn" onClick={() => setSelectedSection(sec)}>
                {sec}
              </div>
            ))}
          </div>
        </>
      )}

      {selectedClass && selectedSection && (
        <>
          <h3 className="tt-sub">
            Class {selectedClass} — Section {selectedSection}
          </h3>

          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ marginBottom: 10 }}
          />

          {students.length > 0 && (
            <table className="teacher-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Student ID</th>
                  <th style={{ width: "400px" }}>Status</th>

                  <th colSpan={dayLabels.length} style={{ textAlign: "center" }}>
                    Previous 7 Days
                  </th>
                </tr>

                <tr>
                  <th></th>
                  <th></th>
                  <th></th>

                  {dayLabels.map((d, i) => (
                    <th key={i} style={{ textAlign: "center", width: 32 }}>
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {students.map(s => (
                  <>
                  <tr key={s.id}>
                    <td data-label="Name">{s.studentName}</td>
                    <td data-label="Student Id">{s.studentId}</td>

                    <td>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {["present", "absent", "late"].map(st => (
                          <button
                            key={st}
                            onClick={() => {
                              setRecords({ ...records, [s.id]: st });

                              if (st === "late") {
                                const t = prompt("Enter late time (HH:MM)", "00:00");
                                if (t) {
                                  setLateTimes(prev => ({ ...prev, [s.id]: t }));
                                }
                              }
                            }}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 6,
                              border: "1px solid #ccc",
                              background:
                                records[s.id] === st
                                  ? st === "present"
                                    ? "#4caf50"
                                    : st === "absent"
                                    ? "#e74c3c"
                                    : "#f1c40f"
                                  : "#fff",
                              color: records[s.id] === st ? "#fff" : "#333",
                              fontWeight: 600
                            }}
                          >
                            {st[0].toUpperCase() + st.slice(1)}
                          </button>
                        ))}

                        {records[s.id] === "late" && lateTimes[s.id] && (
                          <span style={{ fontSize: 12, color: "#555" }}>
                            ⏰ {lateTimes[s.id]}
                          </span>
                        )}
                      </div>
                    </td>

                    {dayLabels.map((_, i) => {
                      const st = (history[s.id] || [])[i];

                      return (
                        <td key={i} style={{ textAlign: "center", width: 40 }}>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color:
                                st === "present" ? "green" :
                                st === "absent" ? "red" :
                                "#c9a000"
                            }}
                          >
                            {st === "present" ? "✔"
                              : st === "absent" ? "✖"
                              : st ? "L" : "—"}
                          </span>
                        </td>
                      );
                    })}
                    
                  </tr>
                 
                  <tr className="mobile-prev-row">
  <td colSpan={dayLabels.length + 3}>
    <div className="prev-box">

      {/* dates — SAME ORDER AS DESKTOP */}
      <div className="prev-dates">
        {dayLabels.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      {/* icons — SAME ORDER AS DESKTOP */}
      <div className="prev-row">
        {(history[s.id] || []).map((st, i) => (
          <span key={i} className="prev-icon">
            {st === "present" ? "✔"
            : st === "absent" ? "✖"
            : st ? "L" : "—"}
          </span>
        ))}
      </div>

    </div>
  </td>
</tr>

</>

                  
                ))}
              </tbody>
            </table>
          )}

          {students.length > 0 && (
            <button className="save-btn" onClick={saveAttendance}>
              Save Attendance
            </button>
          )}
        </>
      )}
    </div>
  );
}
