import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  getDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "../../services/firebase";
import "../dashboard_styles/Attendance.css";

export default function TeacherAttendance() {

  const adminUid   = localStorage.getItem("adminUid");
  const teacherId  = localStorage.getItem("teacherId");

  const [assigned, setAssigned] = useState(null);

  const [students, setStudents] = useState([]);
  const [records, setRecords]   = useState({});
  const [lateTimes, setLateTimes] = useState({});

  const [date, setDate] = useState(
    new Date().toISOString().substring(0, 10)
  );

  const [history, setHistory] = useState({});
  const [dayLabels, setDayLabels] = useState([]);

  /* 1️⃣ Load teacher assigned class */
  useEffect(() => {
    async function loadTeacher() {
      if (!adminUid || !teacherId) return;

      const q = collection(db, "users", adminUid, "teachers");
      const snap = await getDocs(q);

      snap.forEach(docSnap => {
        const t = docSnap.data();
        if (t.teacherId === teacherId) {
          setAssigned((t.assignedClasses || [])[0] || null);
        }
      });
    }

    loadTeacher();
  }, [adminUid, teacherId]);

  /* 2️⃣ Load students + attendance + history */
  useEffect(() => {
    async function load() {
      if (!assigned) return;

      const sSnap = await getDocs(
        collection(db, "users", adminUid, "students")
      );

      const list = sSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(
          s =>
            String(s.class) === String(assigned.class) &&
            String(s.section).toUpperCase() ===
              String(assigned.section).toUpperCase()
        )
        .sort((a, b) => a.studentName.localeCompare(b.studentName));

      setStudents(list);

      const classKey = `${assigned.class}_${assigned.section}`;

      /* today */
      const today = await getDoc(
        doc(db, "users", adminUid, "attendance", classKey, "dates", date)
      );

      if (today.exists()) {
        const data = today.data();
        setRecords(data.records || {});
        setLateTimes(data.lateTimes || {});
      } else {
        const init = {};
        list.forEach(s => (init[s.id] = ""));
        setRecords(init);
        setLateTimes({});
      }

      /* previous 7 days */
      const hist = {};
      const labels = [];

      for (let i = 1; i <= 7; i++) {
        const d = new Date(date);
        d.setDate(d.getDate() - i);

        const y = d.toISOString().substring(0, 10);
        const day = String(d.getDate()).padStart(2, "0");
        labels.push(day);

        const past = await getDoc(
          doc(db, "users", adminUid, "attendance", classKey, "dates", y)
        );

        if (past.exists()) {
          const rec = past.data().records || {};
          list.forEach(s => {
            if (!hist[s.id]) hist[s.id] = [];
            hist[s.id].push(rec[s.id] || null);
          });
        } else {
          list.forEach(s => {
            if (!hist[s.id]) hist[s.id] = [];
            hist[s.id].push(null);
          });
        }
      }

      Object.keys(hist).forEach(k => hist[k].reverse());
      setHistory(hist);
      setDayLabels(labels.reverse());
    }

    load();
  }, [assigned, date, adminUid]);

  /* 3️⃣ SAVE */
 async function saveAttendance() {
  if (!assigned) return;

  const classKey = `${assigned.class}_${assigned.section}`;

  try {

    // ⭐ ensure parent attendance document exists
    await setDoc(
      doc(db, "users", adminUid, "attendance", classKey),
      {
        class: assigned.class,
        section: assigned.section,
        createdAt: Timestamp.now()
      },
      { merge: true }
    );

    // 📅 save selected date
    await setDoc(
      doc(db, "users", adminUid, "attendance", classKey, "dates", date),
      {
        date,
        class: assigned.class,
        section: assigned.section,
        records,
        lateTimes,
        markedBy: teacherId,
        updatedAt: Timestamp.now()
      },
      { merge: true }
    );

    alert("✅ Attendance saved");
  } catch (err) {
    console.error("SAVE ERROR:", err);
    alert("❌ Failed to save attendance (check console).");
  }
}


  return (
    <div className="tt-container">
      <h2 className="tt-title">Teacher Attendance</h2>

      {assigned && (
        <>
          <h3 className="tt-sub">
            Class {assigned.class} — Section {assigned.section}
          </h3>

          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />

          {students.length > 0 && (
            <table className="attendance-table">
            <thead>
                <tr>
                  <th>Name</th>
                  <th>Student ID</th>
                  <th>Status</th>

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
                  < React.Fragment key={s.id}>
                  <tr>
                    <td data-label="Name ">{s.studentName}</td>
                    <td data-label="Student Id">{s.studentId}</td>

                    <td>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" ,width: "100%"}}>
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
                        <td key={i}  className="prev-cell" style={{ textAlign: "center", width: 40 , }}>
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
    <div className="prev-box"  style={{justifyContent: "center" ,width: "100%" , alignItems: "center"}}>

      {/* dates — SAME ORDER AS DESKTOP */}
      <div className="prev-dates">
        {dayLabels.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      {/* icons — SAME ORDER AS DESKTOP */}
      <div className="prev-row">
  {(history[s.id] || []).map((st, i) => (
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
