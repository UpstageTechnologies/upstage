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
  updateDoc,
  query,
  where
} from "firebase/firestore";

import { auth, db } from "../../services/firebase";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const handleViewTeacher = (t) => {
  localStorage.setItem("viewAs", "teacher");
  localStorage.setItem("viewTeacherId", t.teacherId);
  localStorage.setItem("teacherName", t.teacherName);

  window.open("/dashboard", "_blank");   // 👈 new tab
};




/* 🔢 Class 1–12 */
const classes = Array.from({ length: 12 }, (_, i) => i + 1);

/* 🔤 Section A–Z */
const sections = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

const Teacher = ({requirePremium}) => {
  /* ================= BASIC ================= */
  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");

  const role = localStorage.getItem("role"); // admin | sub_admin

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    assignedClasses: [],
    photoURL: ""
  });

  const [classForm, setClassForm] = useState({
    class: "",
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
      .sort((a, b) =>
      (a.name || "").toLowerCase().localeCompare((b.name || "").toLowerCase())
    )
    );
  };

  useEffect(() => {
    fetchTeachers();
  }, [adminUid]);
  const removeAssignedClass = (index) => {
    setForm(prev => ({
      ...prev,
      assignedClasses: prev.assignedClasses.filter((_, i) => i !== index)
    }));
  };
  

  /* ================= ADD CLASS ================= */
  const addAssignedClass = () => {
    if (!classForm.class || !classForm.section || !classForm.subject) {
      alert("Fill class, section & subject");
      return;
    }

    setForm(prev => ({
      ...prev,
      assignedClasses: [...prev.assignedClasses, classForm]
    }));

    setClassForm({ class: "", section: "", subject: "" });
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
    // 📞 Validate 10-digit phone
const phoneClean = form.phone.trim();

if (!/^\d{10}$/.test(phoneClean)) {
  alert("📞 Phone number must be exactly 10 digits");
  return;
}


  // ⭐ trim spaces
  const teacherIdTrimmed = form.teacherId.trim();

  // 🔎 CHECK DUPLICATE teacherId
  const q = query(
    collection(db, "users", adminUid, "teachers"),
    where("teacherId", "==", teacherIdTrimmed)
  );

  const snap = await getDocs(q);

  // ➤ ADD mode: must NOT exist
  if (!editId && !snap.empty) {
    alert("❌ Teacher ID already exists. Use another one.");
    return;
  }

  // ➤ EDIT mode: allow only if belongs to the SAME teacher
  if (editId && !snap.empty) {
    const found = snap.docs[0];
    if (found.id !== editId) {
      alert("❌ Another teacher already uses this Teacher ID.");
      return;
    }
  } 

    /* 🔴 SUB ADMIN → APPROVAL */
    if (role === "admin") {
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
        teacherId: teacherIdTrimmed,
        updatedAt: Timestamp.now(),
        password: form.password || password  
      };
      if (password && password.trim() !== "") {
        updateData.password = password;   // only when NEW entered
      }

      await updateDoc(
        doc(db, "users", adminUid, "teachers", editId),
        updateData
      );
    } else {
      await addDoc(
        collection(db, "users", adminUid, "teachers"),
        {
          ...form,
          teacherId: teacherIdTrimmed,
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
    if (role === "admin") {
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
      assignedClasses: [],
      photoURL: ""   
    });
    setClassForm({ class: "", section: "", subject: "" });
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
          <th>Photo</th>
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
                 <td data-label="Photo">
    {t.photoURL ? (
      <img
        src={t.photoURL}
        alt="teacher"
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
        {t.name?.charAt(0).toUpperCase()}
      </div>
    )}
  </td>
                <td data-label="Name">{t.name}</td>

                <td data-label="Teacher ID">{t.teacherId}</td>

                <td data-label="Email">{t.email}</td>

                <td data-label="Phone">{t.phone}</td>

                <td data-label="Classes">
                {t.assignedClasses?.length
                    ? t.assignedClasses
                    .map(c => `${c.class}-${c.section}`)
                    .join(", ")
                    : "-"}
                </td>

                <td>
  <button
    className="edit-btn"
    onClick={() =>
      requirePremium(() => {
      setForm({ ...t });
      setEditId(t.id);
      setPassword(t.password || "");
      setShowModal(true); // ✅ FIXED
    })
  }
  >
    <FaEdit /> Edit
  </button>

  <button
    className="delete-btn"
    onClick={() => requirePremium(() => handleDelete(t.id))}
  >
    <FaTrash /> Delete
  </button>
  <button
  className="view-btn"
  onClick={() => {
    localStorage.setItem("viewAs", "teacher");
    localStorage.setItem("viewTeacherId", t.id);
    localStorage.setItem("viewTeacherName", t.name);

    // 🔥 dashboard page switch
    window.dispatchEvent(
      new CustomEvent("open-teacher-dashboard")
    );
  }}
>
  👁 View
</button>

</td>


              </tr>
            ))}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay " >
          <div className="form-scroll">
          <div className="modal popup-box"  >
            <h3>{editId ? "Edit Teacher" : "Add Teacher"}</h3>
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
      overflow: "hidden",
      border: "2px dashed #ccc"
    }}
  >
    {form.photoURL ? (
      <img
        src={form.photoURL}
        alt="teacher"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    ) : (
      <span style={{ fontSize: 32, color: "#888" }}>+</span>
    )}

    <input
      type="file"
      accept="image/*"
      style={{ display: "none" }}
      onChange={e => {
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

<div style={{ position: "relative" }}>
  <input
    type={showPassword ? "text" : "password"}
    placeholder= "Password"
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
              onChange={e => setForm({ ...form, email: e.target.value })}
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
              value={classForm.class}
              onChange={e =>
                setClassForm({ ...classForm, class: e.target.value })
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
    <li
      key={i}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "6px"
      }}
    >
      <span>
        {c.class}-{c.section} ({c.subject})
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          removeAssignedClass(i);
        }}
        style={{
          color: "red",
          cursor: "pointer",
          background: "none",
          border: "none",
          fontWeight: "bold"
        }}
      >
        ❌ Remove
      </button>
    </li>
  ))}
</ul>



            <div className="modal-actions">
              <button className="save" onClick={() => requirePremium(handleSaveTeacher)}>
                Save
              </button>
              <button className="cancel" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teacher;
