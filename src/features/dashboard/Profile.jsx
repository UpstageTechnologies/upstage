import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "../dashboard_styles/Profile.css";
import { FaUserCircle,FaPlusCircle, FaTrashAlt } from "react-icons/fa";
import { updateEmail } from "firebase/auth";
import { verifyBeforeUpdateEmail } from "firebase/auth";


export default function Profile() {
  const [data, setData] = useState(null);
  const [adminUid, setAdminUid] = useState(null);

  const role = localStorage.getItem("role");

  // editing state
  const [editing, setEditing] = useState(false);

  // school fields
  const [schoolName, setSchoolName] = useState("");
  const [schoolLogo, setSchoolLogo] = useState("");
  const [editName, setEditName] = useState("");
const [editEmail, setEditEmail] = useState("");


async function saveProfile() {
  try {
    const user = auth.currentUser;

    if (!user) {
      alert("User not logged in");
      return;
    }

    // 🔐 If email changed → send verification link
    if (editEmail !== user.email) {
      await verifyBeforeUpdateEmail(user, editEmail);
      alert("Verification email sent to " + editEmail + ". Open mail and confirm.");
      return; // do NOT update Firestore until verified
    }

    // 🔥 After email verified → update Firestore
    let ref;
    if (role === "master") {
      ref = doc(db, "users", adminUid);
    } else if (role === "admin") {
      ref = doc(db, "users", adminUid, "admins", localStorage.getItem("adminId"));
    } else if (role === "teacher") {
      ref = doc(db, "users", adminUid, "teachers", localStorage.getItem("teacherDocId"));
    } else if (role === "parent") {
      ref = doc(db, "users", adminUid, "parents", localStorage.getItem("parentDocId"));
    }

    await updateDoc(ref, {
      name: editName,
      username: editName,
      email: editEmail,
      photoURL: data.photoURL || "",
      ...(role === "master" && { schoolName, schoolLogo })
    });

    localStorage.setItem("username", editName);
    localStorage.setItem("email", editEmail);

    alert("Profile updated 🎉");
    setEditing(false);

  } catch (err) {
    console.error(err);

    if (err.code === "auth/requires-recent-login") {
      alert("Logout & login again, then change email.");
    } else {
      alert(err.message);
    }
  }
}


  /* -------- GET MASTER UID -------- */
  useEffect(() => {
    let uid = null;

    if (role === "master") uid = auth.currentUser?.uid;
    else uid = localStorage.getItem("adminUid");

    if (uid) setAdminUid(uid);
  }, [role]);

  /* -------- LOAD SCHOOL INFO -------- */
  useEffect(() => {
    async function loadSchool() {
      const masterUid =
        localStorage.getItem("adminUid") || auth.currentUser?.uid;

      if (!masterUid) return;

      const snap = await getDoc(doc(db, "users", masterUid));

      if (snap.exists()) {
        const d = snap.data();
        setSchoolName(d.schoolName || "");
        setSchoolLogo(d.schoolLogo || "");
      }
    }

    loadSchool();
  }, []);

  /* -------- LOAD USER PROFILE -------- */
  useEffect(() => {
    async function load() {
      if (!adminUid || !role) return;

      let ref;

      if (role === "master") {
        ref = doc(db, "users", adminUid);
      } 
      else if (role === "admin") {
        ref = doc(
          db,
          "users",
          adminUid,
          "admins",
          localStorage.getItem("adminId")
        );
      } 
      else if (role === "teacher") {
        ref = doc(
          db,
          "users",
          adminUid,
          "teachers",
          localStorage.getItem("teacherDocId")   // ⭐ real doc id
        );
      } 
      else if (role === "parent") {
        ref = doc(
          db,
          "users",
          adminUid,
          "parents",
          localStorage.getItem("parentDocId")   // ⭐ real doc id
        );
      }

      const snap = await getDoc(ref);
      const d = snap.exists() ? snap.data() : {};

      setData(d);
      setEditName(d.username || d.name || "");
setEditEmail(d.email || "");

    }

    load();
  }, [adminUid, role]);

  /* -------- SAVE -------- */
  


  if (!data) return <p>Loading…</p>;

  /* -------- TEACHER CLASS + SECTION -------- */
  const firstClass =
    data?.assignedClasses?.length
      ? data.assignedClasses[0].class
      : "—";

  const firstSection =
    data?.assignedClasses?.length
      ? data.assignedClasses[0].section
      : "—";

  return (
    <div className="profile-page">
      <div className="profile-card">

        {/* PROFILE / SCHOOL IMAGE */}
        <div className="profile-avatar">
  {data.photoURL ? (
    <img
      src={data.photoURL}
      alt="Profile"
      className="profile-logo"
    />
  ) : (
    <FaUserCircle className="default-user-icon" />
  )}
</div>


        <h2>{schoolName || "School Name"}</h2>

        <hr />

        <div className="profile-details">

        <div className="row">
  <span className="label">Name</span>
  <span className="value">
    {editing ? (
      <input
        value={editName}
        onChange={e => setEditName(e.target.value)}
        placeholder="Enter name"
      />
    ) : (
      editName || "—"
    )}
  </span>
</div>

<div className="row">
  <span className="label">Email</span>
  <span className="value">
    {editing ? (
      <input
        value={editEmail}
        onChange={e => setEditEmail(e.target.value)}
        placeholder="Enter email"
      />
    ) : (
      editEmail || "—"
    )}
  </span>
</div>


{role === "teacher" && (
  <>
    <div className="row">
      <span className="label">Class</span>
      <span className="value">{firstClass}</span>
    </div>

    <div className="row">
      <span className="label">Section</span>
      <span className="value">{firstSection}</span>
    </div>
  </>
)}

</div>
<br/>

        {/* EDIT MODE */}
        
        {role === "master" && (
  !editing ? (
    <button className="edit-btn" onClick={() => setEditing(true)}>
      Edit Profile
    </button>
  ) : (
    <div className="edit-box">
      {/* PROFILE PHOTO PICKER */}
      <div className="edit-row">
        <span>Profile Photo ≤ 300 KB</span>

        <div className="icon-actions">
          <label className="icon-btn add">
            <FaPlusCircle />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onloadend = () =>
                  setData(prev => ({ ...prev, photoURL: reader.result }));
                reader.readAsDataURL(file);
              }}
            />
          </label>

          {data.photoURL && (
            <button onClick={() => setData(prev => ({ ...prev, photoURL: "" }))}>
              <FaTrashAlt />
            </button>
          )}
        </div>
      </div>

      {/* MASTER SETTINGS */}
      <>
        <input
          placeholder="School Name"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
        />

        <div className="edit-row">
          <span>School Logo ≤ 500 KB</span>

          <div className="icon-actions">
            <label className="icon-btn add">
              <FaPlusCircle />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onloadend = () => setSchoolLogo(reader.result);
                  reader.readAsDataURL(file);
                }}
              />
            </label>

            {schoolLogo && (
              <button onClick={() => setSchoolLogo("")}>
                <FaTrashAlt />
              </button>
            )}
          </div>
        </div>
      </>

      <div className="btn-row">
        <button className="save-btn" onClick={saveProfile}>
          Save
        </button>

        <button  onClick={() => setEditing(false)} >
          Cancel
        </button>
      </div>
    </div>
  )
)}

      </div>
    </div>
  );
}
