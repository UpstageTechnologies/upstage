import { useState, useEffect } from "react";
import { db, auth } from "../../services/firebase";
import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  doc,
  Timestamp
} from "firebase/firestore";

// ⭐ reuse dashboard styles
import "../dashboard_styles/Attendance.css";

const CLASSES = [
  "LKG",
  "UKG",
  "Play Group",
  ...Array.from({ length: 12 }, (_, i) => i + 1)
];

export default function Courses() {

  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");

  const [selectedClass, setSelectedClass] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [examGroups, setExamGroups] = useState([]);

  /* ========= LOAD SUBJECTS ========= */
  const loadSubjects = async () => {
    if (!adminUid || !selectedClass) return;

    const snap = await getDocs(
      collection(
        db,
        "users",
        adminUid,
        "courses",
        String(selectedClass),
        "subjects"
      )
    );

    setSubjects(snap.docs.map((d) => d.id));
  };

  useEffect(() => {
    if (!adminUid || !selectedClass) return;
    loadSubjects();
  }, [adminUid, selectedClass]);

  /* ========= ADD SUBJECT ========= */
  const addSubject = async () => {
    const name = prompt("Enter Subject Name");
    if (!name) return;

    await setDoc(
      doc(
        db,
        "users",
        adminUid,
        "courses",
        String(selectedClass),
        "subjects",
        name
      ),
      { examGroups: [] }
    );

    loadSubjects();
  };

  /* ========= LOAD TOPICS FOR SUBJECT ========= */
  const loadTopics = async (sub) => {
    setSelectedSubject(sub);

    const ref = doc(
      db,
      "users",
      adminUid,
      "courses",
      String(selectedClass),
      "subjects",
      sub
    );

    const snap = await getDoc(ref);

    if (snap.exists()) {
      setExamGroups(snap.data().examGroups || []);
    } else {
      setExamGroups([]);
    }
  };

  /* ========= SAVE TOPICS ========= */
  const saveTopics = async () => {
    await setDoc(
      doc(
        db,
        "users",
        adminUid,
        "courses",
        String(selectedClass),
        "subjects",
        selectedSubject
      ),
      { examGroups, updatedAt: Timestamp.now() },
      { merge: true }
    );

    alert("Saved 👍");
  };

  return (
    <div className="tt-container">
           {/* ⬇️⬇️⬇️  👉 BACK BUTTON GOES HERE 👈  ⬇️⬇️⬇️ */}
      {(selectedClass || selectedSubject) && (
        <p
          className="back"
          onClick={() => {
            if (selectedSubject) setSelectedSubject(null);
            else setSelectedClass(null);
          }}
        >
          ← Back
        </p>
      )}

      {/* ========== CLASS SELECT ========== */}
      {!selectedClass && (
        <>
          <h2>Select Class</h2>

          <div className="class-grid">
            {CLASSES.map((c) => (
              <div
                key={c}
                className="class-card"
                onClick={() => setSelectedClass(c)}
              >
                {typeof c === "number" ? `${c} Std` : c}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ========== SUBJECT LIST ========== */}
      {selectedClass && !selectedSubject && (
        <>
          <h3>Class {selectedClass} — Subjects</h3>

          <button className="save-btn" onClick={addSubject} style={{ marginBottom: 16 }}        >
            + Add Subject
          </button>

          <div className="class-grid">
            {subjects.map((s) => (
              <div
                key={s}
                className="class-card"
                onClick={() => loadTopics(s)}
              >
                {s}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ========== TOPICS BUILDER ========== */}
      {selectedSubject && (
        <div className="topics-box">
          <h3>{selectedSubject} — Titles & Topics</h3>

          <button
            className="save-btn"
            onClick={() =>
              setExamGroups([
                ...examGroups,
                { title: "", topics: [""] }
              ])
            }
          >
            + Add Title
          </button>

          {examGroups.map((grp, gi) => (
            <div
            key={gi}
            className="exam-block"
            style={{ 
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 16 ,
              maxWidth: 520,          // 👈 limit width
            }}
          >
          

          <h4 style={{ marginBottom: 6 }}>
  {grp.title || `Title ${gi + 1}`}
</h4>

<input
  value={grp.title}
  onChange={(e) => {
    const copy = [...examGroups];
    copy[gi].title = e.target.value;
    setExamGroups(copy);
  }}
  style={{
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #ccc",
    marginBottom: 10
  }}
  placeholder="Enter title name"
/>


              {grp.topics.map((t, ti) => (
                <input
                  key={ti}
                  placeholder={`Topic ${ti + 1}`}
                  value={t}
                  onChange={(e) => {
                    const copy = [...examGroups];
                    copy[gi].topics[ti] = e.target.value;
                    setExamGroups(copy);
                  }}
                  style={{ marginTop: 6 }}
                />
              ))}

<button
  onClick={() => {
    const copy = [...examGroups];
    copy[gi].topics.push("");
    setExamGroups(copy);
  }}
>
  + Add Topic
</button>

            </div>
          ))}

          <button className="save-btn" onClick={saveTopics}>
            Save
          </button>
        </div>
      )}
    </div>
  );
}
