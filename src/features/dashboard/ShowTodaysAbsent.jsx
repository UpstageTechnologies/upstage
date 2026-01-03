import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import "../dashboard_styles/Teacher.css";
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import { auth, db } from "../../services/firebase";

const ShowTodaysAbsent = ({ setActivePage }) => {

  // 🔐 make sure admin uid is always correct
  const adminUid =
    localStorage.getItem("adminUid") ||
    auth.currentUser?.uid;

  // 📅 use LOCAL date (correct — avoids timezone shift)
  const [date, setDate] = useState(() => {
    return new Date().toLocaleDateString("en-CA");   // yyyy-mm-dd
  });

  const [absents, setAbsents] = useState([]);
  const [search, setSearch] = useState("");

  const loadAbsents = async () => {
    if (!adminUid) return;

    console.log("🔎 Searching date:", date);

    // 1️⃣ load all students (map by document id)
    const sSnap = await getDocs(
      collection(db, "users", adminUid, "students")
    );

    const students = {};
    sSnap.forEach(d => (students[d.id] = d.data()));

    const list = [];

    // 2️⃣ loop all class folders under attendance
    const classSnap = await getDocs(
      collection(db, "users", adminUid, "attendance")
    );

    for (const cDoc of classSnap.docs) {

      // Allow only class folders: 1_A, 3_B, 10_C etc
      if (!/^\d+_[A-Z]$/i.test(cDoc.id)) continue;
    
      console.log("📁 REAL class checked:", cDoc.id);
    

      // 3️⃣ read attendance document for selected date
      const dateDoc = await getDoc(
        doc(
          db,
          "users",
          adminUid,
          "attendance",
          cDoc.id,
          "dates",
          date
        )
      );

      console.log(
        "➡️ Path:",
        `users/${adminUid}/attendance/${cDoc.id}/dates/${date}`,
        "| exists:", dateDoc.exists()
      );

      if (!dateDoc.exists()) continue;

      const rec = dateDoc.data().records || {};

      // 4️⃣ collect absentees
      Object.entries(rec).forEach(([sid, status]) => {
        if (status === "absent" && students[sid]) {
          const s = students[sid];

          list.push({
            name: s.studentName,
            studentId: s.studentId,
            class: s.class,
            section: s.section
          });
        }
      });
    }

    setAbsents(
  list.sort((a, b) =>
    (a.name || "").toLowerCase()
      .localeCompare((b.name || "").toLowerCase())
  )
);

  };

  useEffect(() => {
    loadAbsents();
  }, [date, adminUid]);

  return (
    <div className="teacher-page">
       <span
        style={{ color: "#2140df", cursor: "pointer", fontWeight: 600 }}
        onClick={() => setActivePage("home")}
      >
        ← Back
      </span>
      <div className="teacher-header">
        <h2>Today’s Absent - Students</h2>

        <div className="teacher-actions">

          {/* search */}
          <div className="search-box">
            <FaSearch />
            <input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* calendar */}
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ padding: "6px 10px" }}
          />
        </div>
      </div>

      {/* TABLE */}
      <table className="teacher-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Student ID</th>
            <th>Class</th>
            <th>Section</th>
          </tr>
        </thead>

        <tbody>
          {absents
            .filter(a =>
              JSON.stringify(a ?? {})
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .map((a, i) => (
              <tr key={i}>
                <td data-label = "Name">{a.name}</td>
                <td data-label = "Student Id">{a.studentId}</td>
                <td data-label = "Class">{a.class}</td>
                <td data-label = "Section">{a.section}</td> 
              </tr>
            ))}

          {absents.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No absent students
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ShowTodaysAbsent;
