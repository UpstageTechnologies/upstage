import React, { useEffect, useState } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import "../dashboard_styles/Teacher.css"; // reuse same CSS
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
  setDoc  
} from "firebase/firestore";
import { auth, db } from "../../services/firebase";

const role = localStorage.getItem("role");
const isAdmin = role === "admin";

const Admin = () => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [admins, setAdmins] = useState([]);
  const [editId, setEditId] = useState(null);
  const [password, setPassword] = useState("");

  /* ===== ADMIN FORM ===== */
  const [form, setForm] = useState({
    name: "",
    adminId: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    qualification: "",
    experience: ""
  });

  const superAdminUid =
  auth.currentUser?.uid || localStorage.getItem("adminUid");


  /* ================= FETCH ADMINS ================= */
  const fetchAdmins = async () => {
    if (!superAdminUid) return;

    const snap = await getDocs(
      collection(db, "users", superAdminUid, "admins")
    );

    setAdmins(
      snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
    );
  };

  useEffect(() => {
    fetchAdmins();
  }, [superAdminUid]);

  /* ================= ADD / EDIT ADMIN ================= */
  const handleSaveAdmin = async () => {
    if (!superAdminUid) {
      alert("Admin not authenticated");
      return;
    }
  
    if (
      !form.name ||
      !form.adminId ||
      !form.email ||
      !form.phone ||
      (!editId && !password)
    ) {
      alert("Required fields missing");
      return;
    }
  
    if (editId) {
      await updateDoc(
        doc(db, "users", superAdminUid, "admins", editId),
        {
          ...form,
          updatedAt: Timestamp.now()
        }
      );
    } else {
      await setDoc(
        doc(db, "users", superAdminUid, "admins", form.adminId),
        {
          ...form,
          password,
          role: "sub_admin",
          createdAt: Timestamp.now()
        }
      );
      
    }
  
    resetForm();
    fetchAdmins();
  };
  

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete admin?")) return;

    await deleteDoc(
      doc(db, "users", superAdminUid, "admins", id)
    );
    fetchAdmins();
  };

  const resetForm = () => {
    setShowModal(false);
    setEditId(null);
    setPassword("");
    setForm({
      name: "",
      adminId: "",
      email: "",
      phone: "",
      address: "",
      gender: "",
      qualification: "",
      experience: ""
    });
  };

  return (
    <div className="teacher-page">
      {/* ===== HEADER ===== */}
      <div className="teacher-header">
        <h2>Admins</h2>

        <div className="teacher-actions">
          <div className="search-box">
            <FaSearch />
            <input
              placeholder="Search admin..."
              value={search}
              onChange={e => setSearch(e.target.value)}
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
            <th>Admin ID</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Gender</th>
            <th>Qualification</th>
            <th>Experience</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
  {admins
    .filter(a =>
      a.name?.toLowerCase().includes(search.toLowerCase())
    )
    .map(a => (
      <tr key={a.id} className="mobile-card">
        <td data-label="Name">{a.name}</td>
        <td data-label="Admin ID">{a.adminId}</td>
        <td data-label="Email">{a.email}</td>
        <td data-label="Phone">{a.phone}</td>
        <td data-label="Gender">{a.gender || "-"}</td>
        <td data-label="Qualification">{a.qualification || "-"}</td>
        <td data-label="Experience">{a.experience || "-"}</td>

        <td data-label="Action" className="action-cell">
          <button
            className="edit-btn"
            onClick={() => {
              setForm({
                name: a.name || "",
                adminId: a.adminId || "",
                email: a.email || "",
                phone: a.phone || "",
                address: a.address || "",
                gender: a.gender || "",
                qualification: a.qualification || "",
                experience: a.experience || ""
              });
              setEditId(a.id);
              setPassword("");
              setShowModal(true);
            }}
          >
            <FaEdit /> Edit
          </button>

          <button
            className="delete-btn"
            onClick={() => handleDelete(a.id)}
          >
            <FaTrash /> Delete
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
            <h3>{editId ? "Edit Admin" : "Add Admin"}</h3>

            <input
              placeholder="Admin Name"
              value={form.name}
              onChange={e =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              placeholder="Admin ID"
              value={form.adminId}
              onChange={e =>
                setForm({ ...form, adminId: e.target.value })
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
              onChange={e =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <input
              placeholder="Phone"
              value={form.phone}
              onChange={e =>
                setForm({ ...form, phone: e.target.value })
              }
            />

            <input
              placeholder="Address"
              value={form.address}
              onChange={e =>
                setForm({ ...form, address: e.target.value })
              }
            />

            <select
              value={form.gender}
              onChange={e =>
                setForm({ ...form, gender: e.target.value })
              }
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
                setForm({
                  ...form,
                  qualification: e.target.value
                })
              }
            />

            <input
              placeholder="Experience (years)"
              value={form.experience}
              onChange={e =>
                setForm({
                  ...form,
                  experience: e.target.value
                })
              }
            />

            <div className="modal-actions">
              <button className="save" onClick={handleSaveAdmin}>
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

export default Admin;
