import React, { useEffect, useState } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import "./Teacher.css";
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

/* 🔢 Class 1–12 */
const classes = Array.from({ length: 12 }, (_, i) => i + 1);

/* 🔤 Section A–Z */
const sections = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

const Student = () => {
  const [uid, setUid] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    studentName: "",
    studentId: "",
    parentId: "",
    parentName: "",
    gender: "",
    dob: "",
    phone: "",
    address: "",
    className: "",
    section: ""
  });

  /* 🔐 AUTH STATE */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
      else setUid(null);
    });
    return () => unsub();
  }, []);

  /* 🔄 FETCH STUDENTS */
  const fetchStudents = async () => {
    if (!uid) return;

    const snap = await getDocs(
      collection(db, "users", uid, "students")
    );

    const list = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    list.sort((a, b) =>
      a.studentName.toLowerCase().localeCompare(
        b.studentName.toLowerCase()
      )
    );

    setStudents(list);
  };

  useEffect(() => {
    fetchStudents();
  }, [uid]);

  /* ➕ ADD / ✏️ EDIT STUDENT */
  const handleSaveStudent = async () => {
    if (!uid) {
      alert("User not authenticated");
      return;
    }

    if (
      !form.studentName ||
      !form.studentId ||
      !form.parentId ||
      !form.parentName ||
      !form.className ||
      !form.section
    ) {
      alert("All required fields must be filled");
      return;
    }

    try {
      if (editId) {
        await updateDoc(
          doc(db, "users", uid, "students", editId),
          {
            ...form,
            updatedAt: Timestamp.now()
          }
        );
      } else {
        await addDoc(
          collection(db, "users", uid, "students"),
          {
            ...form,
            createdAt: Timestamp.now()
          }
        );
      }

      setShowModal(false);
      setEditId(null);
      setForm({
        studentName: "",
        studentId: "",
        parentId: "",
        parentName: "",
        gender: "",
        dob: "",
        phone: "",
        address: "",
        className: "",
        section: ""
      });

      fetchStudents();
    } catch (err) {
      console.error("SAVE ERROR 👉", err);
      alert("Save failed");
    }
  };

  /* 🗑 DELETE STUDENT */
  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    await deleteDoc(doc(db, "users", uid, "students", id));
    fetchStudents();
  };

  return (
    <div className="teacher-page">
      {/* HEADER */}
      <div className="teacher-header">
        <h2>All Students</h2>

        <div className="teacher-actions">
          <div className="search-box">
            <FaSearch />
            <input
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="add-btn" onClick={() => setShowModal(true)}>
            <FaPlus />
          </button>
        </div>
      </div>

      {/* TABLE */}
      <table className="teacher-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Student ID</th>
            <th>Parent</th>
            <th>Class</th>
            <th>Section</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {students
            .filter(s =>
              Object.values(s)
                .join(" ")
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .map(s => (
              <tr key={s.id}>
                <td>{s.studentName}</td>
                <td>{s.studentId}</td>
                <td>{s.parentName}</td>
                <td>{s.className}</td>
                <td>{s.section}</td>
                <td>{s.phone}</td>
                <td>{s.address}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setForm({ ...s });
                      setEditId(s.id);
                      setShowModal(true);
                    }}
                  >
                    <FaEdit /> Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteStudent(s.id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editId ? "Edit Student" : "Add Student"}</h3>

            <input
              placeholder="Student Name"
              value={form.studentName}
              onChange={(e) =>
                setForm({ ...form, studentName: e.target.value })
              }
            />

            <input
              placeholder="Student ID"
              value={form.studentId}
              onChange={(e) =>
                setForm({ ...form, studentId: e.target.value })
              }
            />

            <input
              placeholder="Parent ID"
              value={form.parentId}
              onChange={(e) =>
                setForm({ ...form, parentId: e.target.value })
              }
            />

            <input
              placeholder="Parent Name"
              value={form.parentName}
              onChange={(e) =>
                setForm({ ...form, parentName: e.target.value })
              }
            />

            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />

            <input
              placeholder="Address"
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
            />

            <select
              value={form.className}
              onChange={(e) =>
                setForm({ ...form, className: e.target.value })
              }
            >
              <option value="">Select Class</option>
              {classes.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={form.section}
              onChange={(e) =>
                setForm({ ...form, section: e.target.value })
              }
            >
              <option value="">Select Section</option>
              {sections.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <div className="modal-actions">
              <button className="save" onClick={handleSaveStudent}>
                Save
              </button>
              <button
                className="cancel"
                onClick={() => {
                  setShowModal(false);
                  setEditId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Student;
