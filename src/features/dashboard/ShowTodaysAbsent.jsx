import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import "../dashboard_styles/Teacher.css";
import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { auth, db } from "../../services/firebase";

const ShowTodaysAbsent = () => {

  /* ---------- SAME METHOD AS TEACHER.jsx ---------- */
  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");

  const [date, setDate] = useState(
    new Date().toISOString().substring(0, 10)
  );

  const [absents, setAbsents] = useState([]);
  const [search, setSearch] = useState("");

  /* ---------- LOAD ABSENT LIST ---------- */
  const loadAbsents = async () => {
    if (!adminUid) return;

    // students
    const sSnap = await getDocs(
      collection(db, "users", adminUid, "students")
    );

    const studentMap = {};
    sSnap.forEach(d => (studentMap[d.id] = d.data()));

    // attendance (same path)
    const q = query(
      collection(db, "users", adminUid, "attendance"),
      where("date", "==", date)
    );

    const aSnap = await getDocs(q);

    const list = [];

    aSnap.forEach(docSnap => {
      const data = docSnap.data();
      const records = data.records || {};

      Object.entries(records).forEach(([sid, status]) => {
        if (status === "absent") {
          const s = studentMap[sid];
          if (s) {
            list.push({
              name: s.studentName,
              studentId: s.studentId,
              class: s.class,
              section: s.section
            });
          }
        }
      });
    });

    setAbsents(list);
  };

  useEffect(() => {
    loadAbsents();
  }, [date, adminUid]);

  /* ---------- UI ---------- */
  return (
    <div className="teacher-page">
      <div className="teacher-header">
        <h2>Today’s Absent</h2>

        <div className="teacher-actions">
          <div className="search-box">
            <FaSearch />
            <input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ padding: "6px 10px" }}
          />
        </div>
      </div>

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
              JSON.stringify(a)
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .map((a, i) => (
              <tr key={i}>
                <td data-label="Name">{a.name}</td>
                <td data-label="Student ID">{a.studentId}</td>
                <td data-label="Class">{a.class}</td>
                <td data-label="Section">{a.section}</td>
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
