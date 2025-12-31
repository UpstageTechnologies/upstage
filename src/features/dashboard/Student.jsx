import React, { useEffect, useState } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import "../dashboard_styles/Teacher.css";
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,query, where
} from "firebase/firestore";
import { auth, db } from "../../services/firebase";

const classes = Array.from({ length: 12 }, (_, i) => i + 1);
const sections = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

const Student = () => {
  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");

  const role = localStorage.getItem("role");

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
    class: "",
    section: ""
  });

  const fetchStudents = async () => {
    if (!adminUid) return;

    const snap = await getDocs(
      collection(db, "users", adminUid, "students")
    );

    setStudents(
      snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
      .sort((a, b) =>
      (a.studentName || "").toLowerCase().localeCompare((b.studentName || "").toLowerCase())
    )
    );
  };

  useEffect(() => {
    fetchStudents();
  }, [adminUid]);

  const handleSaveStudent = async () => {
    if (
      !form.studentName ||
      !form.studentId ||
      !form.parentId ||
      !form.parentName ||
      !form.class ||
      !form.section
    ) {
      alert("Required fields missing");
      return;
    }
    const idTrim = form.studentId.trim();

  // 🔎 CHECK DUPLICATE studentId
  const q = query(
    collection(db, "users", adminUid, "students"),
    where("studentId", "==", idTrim)
  );

  const snap = await getDocs(q);

  // ➤ ADD → must NOT exist
  if (!editId && !snap.empty) {
    alert("❌ Student ID already exists. Use another one.");
    return;
  }

  // ➤ EDIT → allow only if same student document
  if (editId && !snap.empty) {
    const found = snap.docs[0];
    if (found.id !== editId) {
      alert("❌ Another student already uses this Student ID.");
      return;
    }
  }

    if (role === "sub_admin") {
      await addDoc(
        collection(db, "users", adminUid, "approval_requests"),
        {
          module: "student",
          action: editId ? "update" : "create",
          targetId: editId || null,
          payload: { ...form },
          status: "pending",
          createdBy: localStorage.getItem("adminId"),
          createdAt: Timestamp.now()
        }
      );

      alert("⏳ Sent for admin approval");
      resetForm();
      return;
    }

    if (editId) {
      await updateDoc(
        doc(db, "users", adminUid, "students", editId),
        {
          ...form,
          updatedAt: Timestamp.now()
        }
      );
    } else {
      await addDoc(
        collection(db, "users", adminUid, "students"),
        {
          ...form,
          createdAt: Timestamp.now()
        }
      );
    }

    resetForm();
    fetchStudents();
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Delete student?")) return;

    if (role === "sub_admin") {
      await addDoc(
        collection(db, "users", adminUid, "approval_requests"),
        {
          module: "student",
          action: "delete",
          targetId: id,
          status: "pending",
          createdBy: localStorage.getItem("adminId"),
          createdAt: Timestamp.now()
        }
      );

      alert("⏳ Delete request sent");
      return;
    }

    await deleteDoc(doc(db, "users", adminUid, "students", id));
    fetchStudents();
  };

  const resetForm = () => {
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
      class: "",
      section: ""
    });
  };

  return (
    <div className="teacher-page">
      <div className="teacher-header">
        <h2>Students</h2>

        <div className="teacher-actions">
          <div className="search-box">
            <FaSearch />
            <input
              placeholder="Search student..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <button className="add-btn" onClick={() => setShowModal(true)}>
            <FaPlus />
          </button>
        </div>
      </div>

      <table className="teacher-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>ID</th>
            <th>Parent</th>
            <th>Class</th>
            <th>Section</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {students
            .filter(s =>
              JSON.stringify(s).toLowerCase().includes(search.toLowerCase())
            )
            .map(s => (
              <tr key={s.id} className="mobile-card">
                <td data-label="Name">{s.studentName}</td>
                <td data-label="Student ID">{s.studentId}</td>
                <td data-label="Parent">{s.parentName}</td>
                <td data-label="Class">{s.class}</td>
                <td data-label="Section">{s.section}</td>

                <td data-label="Action" className="action-cell">
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editId ? "Edit Student" : "Add Student"}</h3>

            <input
              placeholder="Student Name"
              value={form.studentName}
              onChange={e =>
                setForm({ ...form, studentName: e.target.value })
              }
            />

            <input
              placeholder="Student ID"
              value={form.studentId}
              onChange={e =>
                setForm({ ...form, studentId: e.target.value })
              }
            />

            <input
              placeholder="Parent ID"
              value={form.parentId}
              onChange={e =>
                setForm({ ...form, parentId: e.target.value })
              }
            />

            <input
              placeholder="Parent Name"
              value={form.parentName}
              onChange={e =>
                setForm({ ...form, parentName: e.target.value })
              }
            />

            <select
              value={form.class}
              onChange={e =>
                setForm({ ...form, class: e.target.value })
              }
            >
              <option value="">Class</option>
              {classes.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <select
              value={form.section}
              onChange={e =>
                setForm({ ...form, section: e.target.value })
              }
            >
              <option value="">Section</option>
              {sections.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <div className="modal-actions">
              <button className="save" onClick={handleSaveStudent}>
                Save
              </button>
              <button className="cancel" onClick={resetForm}>
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
