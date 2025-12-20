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

/* 🔢 Class 1–12 */
const classes = Array.from({ length: 12 }, (_, i) => i + 1);

/* 🔤 Section A–Z */
const sections = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

const Teacher = () => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [password, setPassword] = useState("");

  /* ===== MAIN FORM ===== */
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

  /* ===== ASSIGNED CLASS FORM ===== */
  const [classForm, setClassForm] = useState({
    className: "",
    section: "",
    subject: ""
  });

  const adminUid = auth.currentUser?.uid;

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

    setForm({
      ...form,
      assignedClasses: [...form.assignedClasses, classForm]
    });

    setClassForm({ className: "", section: "", subject: "" });
  };

  /* ================= ADD / EDIT TEACHER ================= */
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
      await addDoc(collection(db, "users", adminUid, "teachers"), {
        ...form,
        adminUid: adminUid,  
        password, // 🔐 used for teacher login
        role: "teacher",
        createdAt: Timestamp.now()
      });
    }

    resetForm();
    fetchTeachers();
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete teacher?")) return;
    await deleteDoc(doc(db, "users", adminUid, "teachers", id));
    fetchTeachers();
  };

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
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="add-btn" onClick={() => setShowModal(true)}>
            <FaPlus />
          </button>
        </div>
      </div>

      {/* ===== TABLE ===== */}
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
                 {t.assignedClasses && t.assignedClasses.length > 0
                   ? t.assignedClasses
                   .map(c => `${c.className}-${c.section}`)
                   .join(", ")
                   : "-"}
              </td>

                <td>
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setForm({
                        name: t.name || "",
                        teacherId: t.teacherId || "",
                        email: t.email || "",
                        phone: t.phone || "",
                        address: t.address || "",
                        gender: t.gender || "",
                        qualification: t.qualification || "",
                        experience: t.experience || "",
                        assignedClasses: t.assignedClasses || []
                      });
                    
                      setEditId(t.id);
                      setPassword(""); // new password optional
                      setClassForm({ className: "", section: "", subject: "" });
                      setShowModal(true);
                    }}
                    
                  >
                    <FaEdit />Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(t.id)}
                  >
                    <FaTrash />Detele
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* ===== MODAL ===== */}
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
              onChange={e => setForm({ ...form, teacherId: e.target.value })}
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

            <input
              placeholder="Address"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
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

            <input
              placeholder="Qualification"
              value={form.qualification}
              onChange={e =>
                setForm({ ...form, qualification: e.target.value })
              }
            />

            <input
              placeholder="Experience"
              value={form.experience}
              onChange={e =>
                setForm({ ...form, experience: e.target.value })
              }
            />

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

            <button type="button" onClick={addAssignedClass}>
              + Add Class
            </button>

            <ul>
              {form.assignedClasses.map((c, i) => (
                <li key={i}>
                  {c.className}-{c.section} ({c.subject})
                </li>
              ))}
            </ul>
            <div className="modal-actions">

            <button className="save" onClick={handleSaveTeacher}>Save</button>
            <button className="cancel" onClick={resetForm}>Cancel</button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teacher;
