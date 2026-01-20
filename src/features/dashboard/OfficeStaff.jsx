import React, { useEffect, useState } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";
import "../dashboard_styles/Teacher.css"; // same CSS reuse
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where
} from "firebase/firestore";
import { auth, db } from "../../services/firebase";

/* 🏢 Departments */
const departments = [
  "Office",
  "Accounts",
  "Admin",
  "Transport",
  "Library",
  "Reception",
  "Maintenance"
];

/* 👔 Staff Roles */
const roles = [
  "Clerk",
  "Accountant",
  "Receptionist",
  "Office Assistant",
  "Manager",
  "Supervisor"
];

const OfficeStaff = () => {
  /* ================= BASIC ================= */
  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");

  const roleType = localStorage.getItem("role"); // admin | sub_admin

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [staffs, setStaffs] = useState([]);
  const [editId, setEditId] = useState(null);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  /* ================= FORM ================= */
  const [form, setForm] = useState({
    name: "",
    staffId: "",
    email: "",
    phone: "",
    department: "",
    role: "",
    address: "",
    photoURL: ""
  });

  /* ================= FETCH STAFF ================= */
  const fetchStaffs = async () => {
    if (!adminUid) return;

    const snap = await getDocs(
      collection(db, "users", adminUid, "office_staffs")
    );

    setStaffs(
      snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) =>
          (a.name || "").toLowerCase().localeCompare((b.name || "").toLowerCase())
        )
    );
  };

  useEffect(() => {
    fetchStaffs();
  }, [adminUid]);

  /* ================= SAVE ================= */
  const handleSaveStaff = async () => {
    if (
      !form.name ||
      !form.staffId ||
      !form.phone ||
      !form.department ||
      !form.role ||
      (!editId && !password)
    ) {
      alert("❌ Required fields missing");
      return;
    }

    // 📞 phone validation
    if (!/^\d{10}$/.test(form.phone)) {
      alert("📞 Phone must be 10 digits");
      return;
    }

    const staffIdTrimmed = form.staffId.trim();

    // 🔎 duplicate staffId check
    const q = query(
      collection(db, "users", adminUid, "office_staffs"),
      where("staffId", "==", staffIdTrimmed)
    );
    const snap = await getDocs(q);

    if (!editId && !snap.empty) {
      alert("❌ Staff ID already exists");
      return;
    }

    if (editId && !snap.empty && snap.docs[0].id !== editId) {
      alert("❌ Another staff uses this ID");
      return;
    }

    /* 🔴 SUB ADMIN → APPROVAL */
    if (roleType === "admin") {
      await addDoc(
        collection(db, "users", adminUid, "approval_requests"),
        {
          module: "office_staff",
          action: editId ? "update" : "create",
          targetId: editId || null,
          payload: { ...form, password },
          status: "pending",
          createdBy: localStorage.getItem("adminId"),
          createdAt: Timestamp.now()
        }
      );

      alert("⏳ Sent for approval");
      resetForm();
      return;
    }

    /* 🟢 MAIN ADMIN */
    if (editId) {
      const updateData = {
        ...form,
        staffId: staffIdTrimmed,
        updatedAt: Timestamp.now()
      };

      if (password.trim()) updateData.password = password;

      await updateDoc(
        doc(db, "users", adminUid, "office_staffs", editId),
        updateData
      );
    } else {
      await addDoc(
        collection(db, "users", adminUid, "office_staffs"),
        {
          ...form,
          staffId: staffIdTrimmed,
          password,
          role: "office_staff",
          createdAt: Timestamp.now()
        }
      );
    }

    resetForm();
    fetchStaffs();
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete staff?")) return;

    if (roleType === "admin") {
      await addDoc(
        collection(db, "users", adminUid, "approval_requests"),
        {
          module: "office_staff",
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

    await deleteDoc(doc(db, "users", adminUid, "office_staffs", id));
    fetchStaffs();
  };

  /* ================= RESET ================= */
  const resetForm = () => {
    setShowModal(false);
    setEditId(null);
    setPassword("");
    setForm({
      name: "",
      staffId: "",
      email: "",
      phone: "",
      department: "",
      role: "",
      address: "",
      photoURL: ""
    });
  };

  /* ================= UI ================= */
  return (
    <div className="teacher-page">
      <div className="teacher-header">
        <h2>Office Staff</h2>

        <div className="teacher-actions">
          <div className="search-box">
            <FaSearch />
            <input
              placeholder="Search staff..."
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
            <th>Photo</th>
            <th>Name</th>
            <th>Staff ID</th>
            <th>Department</th>
            <th>Role</th>
            <th>Phone</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {staffs
            .filter(s =>
              s.name?.toLowerCase().includes(search.toLowerCase())
            )
            .map(s => (
              <tr key={s.id}>
                <td>
                  {s.photoURL ? (
                    <img src={s.photoURL} alt="" style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      objectFit: "cover"
                    }} />
                  ) : (
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "#ddd",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {s.name?.charAt(0)}
                    </div>
                  )}
                </td>

                <td>{s.name}</td>
                <td>{s.staffId}</td>
                <td>{s.department}</td>
                <td>{s.role}</td>
                <td>{s.phone}</td>

                <td>
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setForm({ ...s });
                      setEditId(s.id);
                      setPassword(s.password || "");
                      setShowModal(true);
                    }}
                  >
                    <FaEdit /> Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(s.id)}
                  >
                    <FaTrash /> Delete
                  </button>

                  <button
                    className="view-btn"
                    onClick={() => {
                      localStorage.setItem("viewAs", "office_staff");
                      localStorage.setItem("viewStaffId", s.id);
                      window.dispatchEvent(
                        new CustomEvent("open-office-staff-dashboard")
                      );
                    }}
                  >
                    <FaEye /> View
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal popup-box">
            <h3>{editId ? "Edit Staff" : "Add Staff"}</h3>

            <input
              placeholder="Staff Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />

            <input
              placeholder="Staff ID"
              value={form.staffId}
              onChange={e => setForm({ ...form, staffId: e.target.value })}
            />

            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <span
                onClick={() => setShowPassword(p => !p)}
                style={{ position: "absolute", right: 10, top: 14, cursor: "pointer" }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <input
              placeholder="Phone"
              value={form.phone}
              maxLength={10}
              onChange={e =>
                setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })
              }
            />

            <select
              value={form.department}
              onChange={e => setForm({ ...form, department: e.target.value })}
            >
              <option value="">Department</option>
              {departments.map(d => <option key={d}>{d}</option>)}
            </select>

            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
            >
              <option value="">Role</option>
              {roles.map(r => <option key={r}>{r}</option>)}
            </select>

            <div className="modal-actions">
              <button className="save" onClick={handleSaveStaff}>Save</button>
              <button className="cancel" onClick={resetForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeStaff;
