import React, { useEffect, useState } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
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
import "../dashboard_styles/Teacher.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";


const handleViewParent = (p) => {
  localStorage.setItem("viewAs", "parent");
  localStorage.setItem("viewParentId", p.parentId);
  localStorage.setItem("parentName", p.parentName);

  window.open("/dashboard", "_blank");   // 👈 new tab
};


const Parent = ({requirePremium }) => {
  /* ================= BASIC ================= */
  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");

  const role = localStorage.getItem("role"); // admin | sub_admin

  const [parents, setParents] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [password, setPassword] = useState("");

  const [studentsCount, setStudentsCount] = useState(1);
  const [students, setStudents] = useState([
    { studentId: "", studentName: "", class: "", section: ""}
  ]);

  const [showPassword, setShowPassword] = useState(false);


  const [form, setForm] = useState({
    parentName: "",
    parentId: "",
    email: "",
    phone: "",
    address: "",
    photoURL: "" 
  });

  /* ================= FETCH ================= */
  const fetchParents = async () => {
    if (!adminUid) return;

    const snap = await getDocs(
      collection(db, "users", adminUid, "parents")
    );

    setParents(
      snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) =>
          (a.parentName || "").trim().toLowerCase()
            .localeCompare((b.parentName || "").trim().toLowerCase())
        )
    );
    
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
          copy.push({ studentId: "", studentName: "", class: "", section: ""});
        }
      } else {
        copy.length = count;
      }
      return copy;
    });
  };

  /* ================= SAVE (ADMIN / SUB ADMIN) ================= */
  const handleSave = async () => {
    if (
      !form.parentName ||
      !form.parentId ||
      !form.email ||
      !form.phone ||
      !form.address ||
      students.some(s => !s.studentId || !s.studentName || !s.class || !s.section) ||
      (!editId && !password)
    ) {
      alert("All fields required");
      return;
    }
    const parentIdTrim = form.parentId.trim();
    const phoneClean = form.phone.trim();

if (!/^\d{10}$/.test(phoneClean)) {
  alert("📞 Phone number must be exactly 10 digits");
  return;
}


      // =======================
  // 🔎 1️⃣ CLEAN + CHECK DUP STUDENT IDs
  // =======================
  const cleanStudents = students.map(s => ({
    ...s,
    studentId: s.studentId.trim().toLowerCase()
  }));

  const ids = cleanStudents.map(s => s.studentId);
  const hasDuplicate = ids.some((id, i) => ids.indexOf(id) !== i);

  if (hasDuplicate) {
    alert("❌ Duplicate Student ID — each student must be unique.");
    return;
  }
    // 🔎 CHECK DUPLICATE Parent ID
  const q = query(
    collection(db, "users", adminUid, "parents"),
    where("parentId", "==", parentIdTrim)
  );

  const snap = await getDocs(q);
  
  // =======================
// 🔎 2️⃣ GLOBAL duplicate check in Firestore
// =======================
for (const s of cleanStudents) {

  const q2 = query(
    collection(db, "users", adminUid, "students"),
    where("studentId", "==", s.studentId)
  );

  const snap2 = await getDocs(q2);

  // ➤ ADD -> block if exists
  if (!editId && !snap2.empty) {
    alert(`❌ Student ID "${s.studentId}" already exists in the school.`);
    return;
  }

  // ➤ EDIT -> allow only if student belongs to same parent
  if (editId && !snap2.empty) {
    const another = snap2.docs.find(
      d => d.data().parentId !== form.parentId
    );

    if (another) {
      alert(`❌ Student ID "${s.studentId}" is already used by another parent.`);
      return;
    }
  }
}


  // ➤ ADD → must NOT exist
  if (!editId && !snap.empty) {
    alert("❌ Parent ID already exists. Use another one.");
    return;
  }

  // ➤ EDIT → allow only if the same parent
  if (editId && !snap.empty) {
    const found = snap.docs[0];
    if (found.id !== editId) {
      alert("❌ Another parent already uses this Parent ID.");
      return;
    }
  }

    const payload = {
      ...form,
      parentId: parentIdTrim,
      studentsCount,
      students: cleanStudents
    };

    /* 🔴 SUB ADMIN → APPROVAL */
    if (role === "admin") {
      await addDoc(
        collection(db, "users", adminUid, "approval_requests"),
        {
          module: "parent",
          action: editId ? "update" : "create",
          targetId: editId || null,
          payload: {
            ...payload,
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
/* 🟢 MAIN ADMIN → DIRECT SAVE */
/* 🟢 MAIN ADMIN → DIRECT SAVE */
if (editId) {

  // 1️⃣ update parent document
  const updateData = {
    ...payload,
    updatedAt: Timestamp.now(),
  };
  
  // ⭐ Only if NEW password entered
  if (password && password.trim() !== "") {
    updateData.password = password;
  }
  
  await updateDoc(
    doc(db, "users", adminUid, "parents", editId),
    updateData
  );
  

  // 2️⃣ load students currently in DB for this parent
  const existingSnap = await getDocs(
    collection(db, "users", adminUid, "students")
  );

  const existingForParent = existingSnap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(s => s.parentId === payload.parentId);

  // 3️⃣ for each student in FORM
  for (const s of students) {

    const match = existingForParent.find(
      x => (x.studentId || "").toLowerCase() === s.studentId.toLowerCase()
    );

    // ➜ if NOT found → create again (re-create deleted student)
    if (!match) {
      await addDoc(
        collection(db, "users", adminUid, "students"),
        {
          studentName: s.studentName,
          studentId: s.studentId,
          parentId: payload.parentId,
          parentName: payload.parentName,
          class: s.class,
          section: s.section,
          createdAt: Timestamp.now()
        }
      );
    }
  }
}
 else {

  // ⭐ create parent
  const parentRef = await addDoc(
    collection(db, "users", adminUid, "parents"),
    {
      ...payload,
      password,
      role: "parent",
      createdAt: Timestamp.now()
    }
  );

  // ⭐ create ALL students (first time only)
  for (const s of students) {
    await addDoc(
      collection(db, "users", adminUid, "students"),
      {
        studentName: s.studentName || s.studentId,
        studentId: s.studentId || s.studentName,

        parentId: payload.parentId,
        parentName: payload.parentName,

        class: s.class,
        section: s.section,
        createdAt: Timestamp.now()
      }
    );
  }
}



    resetForm();
    fetchParents();
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete parent and all students?")) return;
  
    if (role === "admin") {
      // … your approval request logic (same)
      return;
    }
  
    // 1️⃣ get parent
    const parentDoc = parents.find(p => p.id === id);
    if (!parentDoc) return;
  
    // 2️⃣ delete students belonging to parent
    const snap = await getDocs(
      collection(db, "users", adminUid, "students")
    );
  
    for (const d of snap.docs) {
      if (d.data().parentId === parentDoc.parentId) {
        await deleteDoc(
          doc(db, "users", adminUid, "students", d.id)
        );
      }
    }
  
    // 3️⃣ delete parent
    await deleteDoc(doc(db, "users", adminUid, "parents", id));
  
    fetchParents();
  };
  

  /* ================= EDIT ================= */
  const handleEdit = async (p) => {
    setEditId(p.id);
  
    setForm({
      parentName: p.parentName,
      parentId: p.parentId,
      email: p.email,
      phone: p.phone,
      address: p.address,
      photoURL: p.photoURL || ""

    });
  
    // ⭐ load students REALLY in DB now
    const snap = await getDocs(
      collection(db, "users", adminUid, "students")
    );
  
    const list = snap.docs
      .map(d => d.data())
      .filter(s => s.parentId === p.parentId);
  
    setStudents(list.length ? list : [{ studentId: "", studentName: "", class: "", section: "" }]);
    setStudentsCount(list.length || 1);
  
    setPassword(p.password ||"");
    setShowModal(true);
  };
  

  /* ================= RESET ================= */
  const resetForm = () => {
    setShowModal(false);
    setEditId(null);
    setPassword("");
    setStudentsCount(1);
    setStudents([{ studentId: "", studentName: "", class: "", section: ""}]);
    setForm({
      parentName: "",
      parentId: "",
      email: "",
      phone: "",
      address: "",
      photoURL: ""
    });
  };

  /* ================= UI ================= */
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

      <table className="teacher-table">
        <thead>
          <tr>
          <th>Photo</th>
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
      <tr key={p.id} className="mobile-card">
       <td data-label="Photo">
  {p.photoURL ? (
    <img
      src={p.photoURL}
      alt=""
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        objectFit: "cover"
      }}
    />
  ) : (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "#e5e7eb",
        color: "#374151",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        textTransform: "uppercase"
      }}
    >
      {p.parentName?.charAt(0) || "P"}
    </div>
  )}
</td>


        <td data-label="Name">{p.parentName}</td>
        <td data-label="Parent ID">{p.parentId}</td>
        <td data-label="Students">{p.studentsCount}</td>
        <td data-label="Email">{p.email}</td>
        <td data-label="Phone">{p.phone}</td>
        <td data-label="Address">{p.address}</td>

        <td className="action-cell">

{/* 👁 VIEW AS PARENT */}
<button
  className="view-btn"
  onClick={() => handleViewParent(p)}
>
  <FaEye /> View
</button>

<button className="edit-btn" onClick={() => requirePremium(() => handleEdit(p))}>
  <FaEdit /> Edit
</button>

<button className="delete-btn" onClick={() => requirePremium(() => handleDelete(p.id))}>
  <FaTrash /> Delete
</button>
</td>

      </tr>
    ))}
</tbody>

      </table>

      {/* MODAL same as before */}
      {showModal && (
        <div className="modal-overlay ">
           
          <div className="modal">
            <h3>{editId ? "Edit Parent" : "Add Parent"}</h3>

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
    {form.photoURL ? (
      <img
        src={form.photoURL}
        alt="parent"
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
              placeholder="Parent Name"
              value={form.parentName}
              onChange={e => setForm({ ...form,parentName: e.target.value })}
            />
            <input
              placeholder="Parent ID"
              value={form.parentId}
              onChange={e =>
                setForm({ ...form, parentId: e.target.value })
              }
            />
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
            <input
              placeholder="Address"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
            />
            <div style={{ position: "relative" }}>
            <input
                 type={showPassword ? "text" : "password"}
                 placeholder= "Password"
                 value={password}
                 onChange={e => setPassword(e.target.value)}
                 style={{ width: "100%", paddingRight: 40 }}
             />

               {/* 👁️ toggle button */}
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
             {showPassword ?  <FaEyeSlash /> : <FaEye />}
             </span>
         </div>

            

            <p>Number of Students</p>
            {[1, 2, 3, 4, 5].map(n => (
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
            <React.Fragment key={i}>
               <div key={i} style={{ display: "flex", gap: 8 }}>
                 <input
                   placeholder={`Student ${i + 1} ID`}
                   value={s.studentId}
                   onChange={e =>
                    handleStudentChange(i, "studentId", e.target.value)
                  }
                  />

                 <input
                   placeholder={`Student ${i + 1} Name`}
                   value={s.studentName}
                   onChange={e =>
                    handleStudentChange(i, "studentName", e.target.value)
                  }
                  /></div> <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                   <input
                   placeholder={`Student ${i + 1} Class`}
                   value={s.class}
                   onChange={e =>
                    handleStudentChange(i, "class", e.target.value)
                  }
                  />
                   <input
                   placeholder={`Student ${i + 1} Section`}
                   value={s.section}
                   onChange={e =>
                    handleStudentChange(i, "section", e.target.value)
                  }
                  />
     
               </div>
               </React.Fragment>
             ))}


          

            <div className="modal-actions">
              <button className="save" onClick={() => requirePremium(handleSave)}>
                Save
              </button>
              <button className="cancel" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </div></div>
        
      )}
      
    </div>
  );
};

export default Parent;
