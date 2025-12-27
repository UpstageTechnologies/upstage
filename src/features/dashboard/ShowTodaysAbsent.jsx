import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import "../dashboard_styles/Teacher.css";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

const ShowTodaysAbsent = ({ adminUid }) => {

  /* ---------- ROLE + UID ---------- */
  const role = (localStorage.getItem("role") || "").toLowerCase();

  const [uid, setUid] = useState(
    adminUid ||
    localStorage.getItem("ownerUid") ||
    localStorage.getItem("adminUid")
  );

  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [absents, setAbsents] = useState([]);
  const [search, setSearch] = useState("");

  /* ---------- RESOLVE OWNER (SUB ADMIN) ---------- */
  useEffect(() => {
    async function resolveOwner() {
      if (role !== "sub_admin") return;

      const snap = await getDoc(
        doc(db, "users", localStorage.getItem("adminUid"))
      );

      if (snap.exists()) {
        const data = snap.data();
        const main = data.ownerUid || data.createdBy || data.adminUid;

        if (main) {
          localStorage.setItem("ownerUid", main);
          setUid(main);
        }
      }
    }

    resolveOwner();
  }, [role]);


  /* ---------- LOAD ABSENT LIST ---------- */
  const loadAbsents = async () => {
    if (!uid) return;

    // students list
    const sSnap = await getDocs(collection(db, "users", uid, "students"));
    const studentMap = {};
    sSnap.forEach(d => (studentMap[d.id] = d.data()));

    // attendance for date
    const q = query(
      collection(db, "users", uid, "attendance"),
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
  }, [date, uid]);

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
              JSON.stringify(a).toLowerCase().includes(search.toLowerCase())
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
