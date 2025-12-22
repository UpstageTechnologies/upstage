import React, { useEffect, useState } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
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
import "../dashboard_styles/Teacher.css";



const Parent = () => {
  const adminUid =
  auth.currentUser?.uid || localStorage.getItem("adminUid");


  const [parents, setParents] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [password, setPassword] = useState("");

  const [studentsCount, setStudentsCount] = useState(1);
  const [students, setStudents] = useState([{ studentId: "", studentName: "" }]);

  const [form, setForm] = useState({
    name: "",
    parentId: "",
    email: "",
    phone: "",
    address: ""
  });

  /* ================= FETCH ================= */
  const fetchParents = async () => {
    if (!adminUid) return;

    const snap = await getDocs(
      collection(db, "users", adminUid, "parents")
    );

    const list = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    setParents(list);
  };

  useEffect(() => {
    fetchParents();
  }, [adminUid]);

  /* ================= STUDENT HANDLERS ================= */
  const handleStudentChange = (index, field, value) => {
    const updated = [...students];
    updated[index][field] = value;
    setStudents(updated);
  };

  const handleStudentCountChange = (count) => {
    setStudentsCount(count);

    setStudents(prev => {
      const copy = [...prev];
      if (count > copy.length) {
        while (copy.length < count) {
          copy.push({ studentId: "", studentName: "" });
        }
      } else {
        copy.length = count;
      }
      return copy;
    });
  };

  /* ================= ADD / UPDATE ================= */
  const handleSave = async () => {
    if (
      !form.name ||
      !form.parentId ||
      !form.email ||
      !form.phone ||
      !form.address ||
      students.some(s => !s.studentId || !s.studentName) ||
      (!editId && !password)
    ) {
      alert("All fields required");
      return;
    }

    const payload = {
      ...form,
      studentsCount,
      students,
      updatedAt: Timestamp.now()
    };

    if (!editId) {
      payload.password = password;
      payload.createdAt = Timestamp.now();
    }

    if (editId) {
      await updateDoc(
        doc(db, "users", adminUid, "parents", editId),
        payload
      );
    } else {
      await addDoc(
        collection(db, "users", adminUid, "parents"),
        payload
      );
    }

    resetForm();
    fetchParents();
  };

  /* ================= EDIT ================= */
  const handleEdit = (p) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      parentId: p.parentId,
      email: p.email,
      phone: p.phone,
      address: p.address
    });
    setStudentsCount(p.studentsCount || 1);
    setStudents(p.students || [{ studentId: "", studentName: "" }]);
    setPassword("");
    setShowModal(true);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete parent?")) return;
    await deleteDoc(doc(db, "users", adminUid, "parents", id));
    fetchParents();
  };

  const resetForm = () => {
    setShowModal(false);
    setEditId(null);
    setPassword("");
    setStudentsCount(1);
    setStudents([{ studentId: "", studentName: "" }]);
    setForm({
      name: "",
      parentId: "",
      email: "",
      phone: "",
      address: ""
    });
  };

  return (
    <div className="teacher-page">
      <div className="teacher-header">
        <h2>Parents</h2>

        <div className="teacher-actions">
          <div className="search-box">
            <FaSearch />
            <input
              placeholder="Search parent..."
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
            <th>Parent</th>
            <th>Parent ID</th>
            <th>Students</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {parents
            .filter(p =>
              JSON.stringify(p).toLowerCase().includes(search.toLowerCase())
            )
            .map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.parentId}</td>
                <td>{p.studentsCount}</td>
                <td>{p.email}</td>
                <td>{p.phone}</td>
                <td>{p.address}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(p)}>
                    <FaEdit /> Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(p.id)}>
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
            <h3>{editId ? "Edit Parent" : "Add Parent"}</h3>

            <input placeholder="Parent Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <input placeholder="Parent ID"
              value={form.parentId}
              onChange={e => setForm({ ...form, parentId: e.target.value })}
            />
            <input placeholder="Email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
            <input placeholder="Phone"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
            <input placeholder="Address"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
            />

            <p>Number of Students</p>
            {[1,2,3].map(n => (
              <button
                key={n}
                onClick={() => handleStudentCountChange(n)}
                style={{
                  margin: 5,
                  background: studentsCount === n ? "#2140df" : "#ccc",
                  color: "#fff"
                }}
              >
                {n}
              </button>
            ))}

            {students.map((s, i) => (
              <div key={i}>
                <input
                  placeholder={`Student ${i+1} ID`}
                  value={s.studentId}
                  onChange={e =>
                    handleStudentChange(i, "studentId", e.target.value)
                  }
                />
                <input
                  placeholder={`Student ${i+1} Name`}
                  value={s.studentName}
                  onChange={e =>
                    handleStudentChange(i, "studentName", e.target.value)
                  }
                />
              </div>
            ))}

            <input
              type="password"
              placeholder={editId ? "New Password (optional)" : "Password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <div className="modal-actions">
              <button className="save" onClick={handleSave}>Save</button>
              <button className="cancel" onClick={resetForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parent;
