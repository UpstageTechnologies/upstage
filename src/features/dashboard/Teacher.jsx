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
  updateDoc
} from "firebase/firestore";
import { auth, db } from "../../services/firebase";

/* 🔢 Class 1–12 */
const classes = Array.from({ length: 12 }, (_, i) => i + 1);

/* 🔤 Section A–Z */
const sections = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

const Teacher = () => {
  /* ================= BASIC ================= */
  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");

  const role = localStorage.getItem("role"); // admin | sub_admin

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [password, setPassword] = useState("");

  /* ================= FORM ================= */
  const [form, setForm] = useState({
    name: "",
    teacherId: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    qualification: "",
    experience: "",
    assignedClasses: []
  });

  const [classForm, setClassForm] = useState({
    className: "",
    section: "",
    subject: ""
  });

  /* ================= FETCH TEACHERS ================= */
  const fetchTeachers = async () => {
    if (!adminUid) return;

    const snap = await getDocs(
      collection(db, "users", adminUid, "teachers")
    );

    setTeachers(
      snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
    );
  };

  useEffect(() => {
    fetchTeachers();
  }, [adminUid]);

  /* ================= ADD CLASS ================= */
  const addAssignedClass = () => {
    if (!classForm.className || !classForm.section || !classForm.subject) {
      alert("Fill class, section & subject");
      return;
    }

    setForm(prev => ({
      ...prev,
      assignedClasses: [...prev.assignedClasses, classForm]
    }));

    setClassForm({ className: "", section: "", subject: "" });
  };

  /* ================= SAVE ================= */
  const handleSaveTeacher = async () => {
    if (
      !form.name ||
      !form.teacherId ||
      !form.email ||
      !form.phone ||
      (!editId && !password)
    ) {
      alert("Required fields missing");
      return;
    }

    /* 🔴 SUB ADMIN → APPROVAL */
    if (role === "sub_admin") {
      await addDoc(
        collection(db, "users", adminUid, "approval_requests"),
        {
          module: "teacher",
          action: editId ? "update" : "create",
          targetId: editId || null,
          payload: {
            ...form,
            password: password || null
          },
          status: "pending",
          createdBy: localStorage.getItem("adminId"),
          createdAt: Timestamp.now()
        }
      );

      alert("⏳ Sent for admin approval");
      resetForm();
      return;
    }

    /* 🟢 MAIN ADMIN → DIRECT SAVE */
    if (editId) {
      const updateData = {
        ...form,
        updatedAt: Timestamp.now()
      };
      if (password) updateData.password = password;

      await updateDoc(
        doc(db, "users", adminUid, "teachers", editId),
        updateData
      );
    } else {
      await addDoc(
        collection(db, "users", adminUid, "teachers"),
        {
          ...form,
          password,
          role: "teacher",
          createdAt: Timestamp.now()
        }
      );
    }

    resetForm();
    fetchTeachers();
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete teacher?")) return;

    /* 🔴 SUB ADMIN → APPROVAL */
    if (role === "sub_admin") {
      await addDoc(
        collection(db, "users", adminUid, "approval_requests"),
        {
          module: "teacher",
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

    /* 🟢 MAIN ADMIN */
    await deleteDoc(doc(db, "users", adminUid, "teachers", id));
    fetchTeachers();
  };

  /* ================= RESET ================= */
  const resetForm = () => {
    setShowModal(false);
    setEditId(null);
    setPassword("");
    setForm({
      name: "",
      teacherId: "",
      email: "",
      phone: "",
      address: "",
      gender: "",
      qualification: "",
      experience: "",
      assignedClasses: []
    });
    setClassForm({ className: "", section: "", subject: "" });
  };

  /* ================= UI ================= */
  return (
    <div className="teacher-page">
      <div className="teacher-header">
        <h2>Teachers</h2>

        <div className="teacher-actions">
          <div className="search-box">
            <FaSearch />
            <input
              placeholder="Search teacher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
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
            <th>Name</th>
            <th>Teacher ID</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Classes</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {teachers
            .filter(t =>
              t.name?.toLowerCase().includes(search.toLowerCase())
            )
            .map(t => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.teacherId}</td>
                <td>{t.email}</td>
                <td>{t.phone}</td>
                <td>
                  {t.assignedClasses?.length
                    ? t.assignedClasses
                        .map(c => `${c.className}-${c.section}`)
                        .join(", ")
                    : "-"}
                </td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setForm({ ...t });
                      setEditId(t.id);
                      setPassword("");
                      setShowModal(true);
                    }}
                  >
                    <FaEdit /> Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(t.id)}
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
            <h3>{editId ? "Edit Teacher" : "Add Teacher"}</h3>

            <input
              placeholder="Teacher Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />

            <input
              placeholder="Teacher ID"
              value={form.teacherId}
              onChange={e =>
                setForm({ ...form, teacherId: e.target.value })
              }
            />

            <input
              type="password"
              placeholder={editId ? "New Password (optional)" : "Password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <input
              placeholder="Email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />

            <input
              placeholder="Phone"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />

            <select
              value={form.gender}
              onChange={e => setForm({ ...form, gender: e.target.value })}
            >
              <option value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <h4>Assigned Classes</h4>

            <select
              value={classForm.className}
              onChange={e =>
                setClassForm({ ...classForm, className: e.target.value })
              }
            >
              <option value="">Class</option>
              {classes.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <select
              value={classForm.section}
              onChange={e =>
                setClassForm({ ...classForm, section: e.target.value })
              }
            >
              <option value="">Section</option>
              {sections.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <input
              placeholder="Subject"
              value={classForm.subject}
              onChange={e =>
                setClassForm({ ...classForm, subject: e.target.value })
              }
            />

            <button onClick={addAssignedClass}>+ Add Class</button>

            <ul>
              {form.assignedClasses.map((c, i) => (
                <li key={i}>
                  {c.className}-{c.section} ({c.subject})
                </li>
              ))}
            </ul>

            <div className="modal-actions">
              <button className="save" onClick={handleSaveTeacher}>
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

export default Teacher;
