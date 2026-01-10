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
  getDoc,setDoc
} from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { FaEye, FaEyeSlash } from "react-icons/fa";




const role = localStorage.getItem("role");
const isAdmin = role === "master";

const Admin = ({ requirePremium }) => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [admins, setAdmins] = useState([]);
  const [editId, setEditId] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  /* ===== ADMIN FORM ===== */
  const [form, setForm] = useState({
    name: "",
    adminId: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    qualification: "",
    experience: "",
    photoURL: ""

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
      alert("Master not authenticated");
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
    const phoneClean = form.phone.trim();

if (!/^\d{10}$/.test(phoneClean)) {
  alert("📞 Phone number must be exactly 10 digits");
  return;
}

  
    if (editId) {
      // --- UPDATE (same as before) ---
      const updateData = {
        ...form,
        role: "admin",                 // 👈 force correct role always
        updatedAt: Timestamp.now()
        
      };
      
      if (password && password.trim() !== "") {
        updateData.password = password;
      }
      
    
      await updateDoc(
        doc(db, "users", superAdminUid, "admins", editId),
        updateData
      );
    } 
    else {
      // 🔎 1️⃣ CHECK DUPLICATE
      const existing = await getDoc(
        doc(db, "users", superAdminUid, "admins", form.adminId)
      );
    
      if (existing.exists()) {
        alert("❌ Admin ID already exists. Use a different ID.");
        return;
      }
    
      // 🆕 2️⃣ CREATE NEW
      await setDoc(
        doc(db, "users", superAdminUid, "admins", form.adminId),
        {
          ...form,
          password,
          role: "admin",
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
      experience: "",
      photoURL: ""
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
          <th>Photo</th>
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
         <td data-label="Photo">
    {a.photoURL ? (
      <img
        src={a.photoURL}
        alt="admin"
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          objectFit: "cover",
          border: "1px solid #ddd"
        }}
      />
    ) : (
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "#ddd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600
        }}
      >
        {a.name?.charAt(0).toUpperCase()}
      </div>
    )}
  </td>
        <td data-label="Name">{a.name}</td>
        <td data-label="Admin ID">{a.adminId}</td>
        <td data-label="Email">{a.email}</td>
        <td data-label="Phone">{a.phone}</td>
        <td data-label="Gender">{a.gender || "-"}</td>
        <td data-label="Qualification">{a.qualification || "-"}</td>
        <td data-label="Experience">{a.experience || "-"}</td>

        <td className="action-cell">
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
                experience: a.experience || "",
                photoURL: a.photoURL || "" 
              });
              localStorage.setItem("profilePhoto", a.photoURL || "");
              setEditId(a.id);
              setPassword(a.password || ""); 
              setShowModal(true);
            }}
          >
            <FaEdit /> Edit
          </button>

          <button
            className="delete-btn"
            onClick={() => requirePremium(() => handleDelete(a.id))}
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
            <div style={{ textAlign: "center", marginBottom: 10 }}>
  <label
    style={{
      width: 90,
      height: 90,
      borderRadius: "50%",
      background: "#f3f3f3",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
      border: "2px dashed #ccc"
    }}
  >
    {/* show image OR + sign */}
    {form.photoURL ? (
      <img
        src={form.photoURL}
        alt="admin"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    ) : (
      <span style={{ fontSize: 32, color: "#888" }}>+</span>
    )}

    <input
      type="file"
      accept="image/*"
      style={{ display: "none" }}
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () =>
          setForm(prev => ({ ...prev, photoURL: reader.result }));

        reader.readAsDataURL(file);
      }}
    />
  </label>

  <p style={{ fontSize: 12, color: "#777" }}>Select profile photo</p>
</div>


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

<div style={{ position: "relative" }}>
  <input
    type={showPassword ? "text" : "password"}
    placeholder={editId ? "New Password (optional)" : "Password"}
    value={password}
    onChange={e => setPassword(e.target.value)}
    style={{ width: "100%", paddingRight: 40 }}
  />

  <span
    onClick={() => setShowPassword(prev => !prev)}
    style={{
      position: "absolute",
      right: 10,
      top: 28,
      transform: "translateY(-50%)",
      cursor: "pointer",
      color: "#555"
    }}
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>


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
  maxLength={10}
  onChange={e => {
    const v = e.target.value.replace(/\D/g, "");   // remove non-digits
    setForm({ ...form, phone: v.slice(0, 10) });   // max 10 digits
  }}
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
              <button className="save" onClick={() => requirePremium(handleSaveAdmin)}>
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
