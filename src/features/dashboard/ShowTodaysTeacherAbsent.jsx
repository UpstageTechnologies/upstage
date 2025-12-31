import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import "../dashboard_styles/Teacher.css";

const ShowTodaysTeacherAbsent = () => {

  // 🔐 correct admin id always
  const adminUid =
    localStorage.getItem("adminUid") ||
    auth.currentUser?.uid;

  // 📅 always correct local date
  const [date, setDate] = useState(() =>
    new Date().toLocaleDateString("en-CA")
  );

  const [absents, setAbsents] = useState([]);
  const [search,   setSearch] = useState("");

  const loadAbsents = async () => {
    if (!adminUid) return;

    console.log("🔎 Teacher absent →", date);

    // 1️⃣ Load teachers
    const tSnap = await getDocs(
      collection(db, "users", adminUid, "teachers")
    );

    const teachers = {};
    tSnap.forEach(d => (teachers[d.id] = d.data()));

    const list = [];

    // 2️⃣ Load teacherAttendance for date
    const attDoc = await getDoc(
      doc(db, "users", adminUid, "teacherAttendance", date)
    );

    if (!attDoc.exists()) {
      setAbsents([]);
      return;
    }

    const rec = attDoc.data().records || {};

    // 3️⃣ Pick only ABSENT teachers
    Object.entries(rec).forEach(([tid, status]) => {
      if (status === "absent" && teachers[tid]) {
        const t = teachers[tid];

        list.push({
          name: t.name,
          teacherId: t.teacherId,
          class:   t.assignedClasses?.[0]?.class || "-",
          section: t.assignedClasses?.[0]?.section || "-"
        });
      }
    });

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
      <div className="teacher-header">
        <h2>Today’s Absent — Teachers</h2>

        <div className="teacher-actions">

          {/* 🔍 search */}
          <div className="search-box">
            <FaSearch />
            <input
              placeholder="Search teacher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* 📅 date picker */}
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
            <th>Teacher ID</th>
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
                <td data-label="Name">{a.name}</td>
                <td data-label="Teacher ID">{a.teacherId}</td>
                <td data-label="Class">{a.class}</td>
                <td data-label="Section">{a.section}</td>
              </tr>
            ))}

          {absents.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No absent teachers
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ShowTodaysTeacherAbsent;
