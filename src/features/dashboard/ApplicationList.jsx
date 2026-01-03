import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  addDoc,
  Timestamp
} from "firebase/firestore";

import { auth, db } from "../../services/firebase";
import "../dashboard_styles/ApplicationList.css";
import { FaSearch } from "react-icons/fa";


export default function ApplicationList() {

  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");

  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");


  /* ================= LOAD ================= */
  const loadApps = async () => {
    const q = query(
      collection(db, "applications"),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    setApps(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    loadApps();
  }, []);

  /* ================= ACTIONS ================= */

  const handleReject = async (app) => {
    if (!window.confirm("Reject this application?")) return;

    await updateDoc(doc(db, "applications", app.id), {
      status: "rejected"
    });

    loadApps();
  };


  const handleSelect = async (app) => {
    if (!adminUid) return alert("Admin not found");

    if (!window.confirm("Approve & create Parent + Student?")) return;

    // 1️⃣ parent
    await addDoc(
      collection(db, "users", adminUid, "parents"),
      {
        parentName: app.parentName,
        phone: app.phone,
        address: app.address || "",
        role: "parent",
        studentsCount: 1,
        password: app.phone,
        createdAt: Timestamp.now()
      }
    );

    // 2️⃣ student
    await addDoc(
      collection(db, "users", adminUid, "students"),
      {
        studentName: app.studentName,
        parentName: app.parentName,
        class: app.class,
        section: "",
        createdAt: Timestamp.now()
      }
    );

    // 3️⃣ update application
    await updateDoc(doc(db, "applications", app.id), {
      status: "selected"
    });

    loadApps();
  };

  /* ================= SPLIT LISTS ================= */

  const pending = apps.filter(a => !a.status || a.status === "pending");
  const selected = apps.filter(a => a.status === "selected");
  const rejected = apps.filter(a => a.status === "rejected");

  if (loading) return <p className="appList-wrapper">Loading...</p>;

  return (
    <div className="appList-wrapper">

      <h2 className="appList-title">Application Submissions</h2>
   


      {/* ============ PENDING LIST ============ */}
      <div className="appList-grid">
        {pending.length === 0 && (
          <p style={{ opacity: 0.6 }}>No pending applications</p>
        )}

        {pending.map(app => (
          <div key={app.id} className="appCard">

            <div className="appCard-header">
              {app.studentName} — {app.class}
            </div>

            <div className="appCard-row">Parent: {app.parentName}</div>
            <div className="appCard-row">Phone: {app.phone}</div>

            <div className="appCard-row">
              Status:
              <span className={`status-badge status-${app.status || "pending"}`}>
                {app.status || "pending"}
              </span>
            </div>

            <div className="appCard-footer">
              {app.createdAt?.toDate
                ? app.createdAt.toDate().toLocaleString()
                : ""}
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
              <button className="approve-btn" onClick={() => handleSelect(app)}>
                Selected
              </button>

              <button className="reject-btn" onClick={() => handleReject(app)}>
                Rejected
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* ============ SELECTED LIST ============ */}
      <h3 style={{ marginTop: 30 }}>✅ Selected Applications</h3>

      <table className="appTable">
        <thead>
          <tr>
            <th>Student</th>
            <th>Parent</th>
            <th>Class</th>
            <th>Phone</th>
          </tr>
        </thead>

        <tbody>
          {selected.map(a => (
            <tr key={a.id}>
              <td data-label="StudentName">{a.studentName}</td>
              <td data-label="ParentName">{a.parentName}</td>
              <td data-label="Class">{a.class}</td>
              <td data-label="Phone">{a.phone}</td>
            </tr>
          ))}

          {selected.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", opacity: .6 }}>
                No selected applications
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ============ REJECTED LIST ============ */}
      <h3 style={{ marginTop: 30 }}>❌ Rejected Applications</h3>

      <table className="appTable reject">
        <thead>
          <tr>
            <th>Student</th>
            <th>Parent</th>
            <th>Class</th>
            <th>Phone</th>
          </tr>
        </thead>

        <tbody>
          {rejected.map(a => (
            <tr key={a.id}>
              <td data-label="StudentName">{a.studentName}</td>
              <td data-label="ParentName">{a.parentName}</td>
              <td data-label="Class">{a.class}</td>
              <td data-label="Phone">{a.phone}</td>
            </tr>
          ))}

          {rejected.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", opacity: .6 }}>
                No rejected applications
              </td>
            </tr>
          )}
        </tbody>
      </table>

    </div>
  );
}
