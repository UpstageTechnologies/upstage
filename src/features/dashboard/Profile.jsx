import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "../dashboard_styles/Profile.css";

export default function Profile() {
  const [data, setData] = useState(null);
  const [adminUid, setAdminUid] = useState(null);

  const role = localStorage.getItem("role");

  // editing state
  const [editing, setEditing] = useState(false);

  // school fields
  const [schoolName, setSchoolName] = useState("");
  const [schoolLogo, setSchoolLogo] = useState("");

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
    }

    load();
  }, [adminUid, role]);

  /* -------- SAVE -------- */
  async function saveProfile() {
    try {
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
          localStorage.getItem("teacherDocId")
        );
      } 
      else if (role === "parent") {
        ref = doc(
          db,
          "users",
          adminUid,
          "parents",
          localStorage.getItem("parentDocId")
        );
      }

      await updateDoc(ref, {
        photoURL: data.photoURL || "",
        ...(role === "master" && {
          schoolName,
          schoolLogo
        })
      });

      localStorage.setItem("profilePhoto", data.photoURL || "");
      localStorage.setItem("schoolName", schoolName);
      localStorage.setItem("schoolLogo", schoolLogo);

      alert("Profile updated 🎉");
      setEditing(false);
    } catch (err) {
      console.log(err);
      alert("Failed to save");
    }
  }

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
        <img
          src={data.photoURL || schoolLogo || "/default-logo.png"}
          className="profile-logo"
          alt="Profile"
        />

        <h2>{schoolName || "School Name"}</h2>

        <hr />

        <p>
  <b>Name:</b>{" "}
  {role === "parent"
    ? data.parentName || "—"
    : data.username || data.name || "—"}
</p>

        <p><b>Email:</b> {data.email || "—"}</p>
        <p><b>Role:</b> {role}</p>

        {role === "admin" && (
          <p><b>Admin ID:</b> {data.adminId}</p>
        )}

        {role === "teacher" && (
          <>
            <p><b>Class:</b> {firstClass}</p>
            <p><b>Section:</b> {firstSection}</p>
          </>
        )}

        {/* EDIT MODE */}
        {!editing ? (
          <button className="edit-btn" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        ) : (
          <div className="edit-box">

            {/* PROFILE PHOTO PICKER */}
            <div className="logo-picker">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onloadend = () =>
                    setData(prev => ({
                      ...prev,
                      photoURL: reader.result
                    }));

                  reader.readAsDataURL(file);
                }}
              />

              {data.photoURL && (
                <img
                  src={data.photoURL}
                  alt="preview"
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: "50%",
                    marginTop: 10
                  }}
                />
              )}
            </div>

            {/* MASTER SETTINGS */}
            {role === "master" && (
              <>
                <input
                  placeholder="School Name"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />

                <div className="logo-picker">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const reader = new FileReader();
                      reader.onloadend = () =>
                        setSchoolLogo(reader.result);

                      reader.readAsDataURL(file);
                    }}
                  />

                  {schoolLogo && (
                    <img
                      src={schoolLogo}
                      alt="preview"
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: "50%",
                        marginTop: 10
                      }}
                    />
                  )}
                </div>
              </>
            )}

            <div className="btn-row">
              <button className="save-btn" onClick={saveProfile}>
                Save
              </button>

              <button
                className="cancel-btn"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
