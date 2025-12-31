  import { useState, useEffect } from "react";
  import { db, auth } from "../../services/firebase";
  import {
    collection,
    getDocs,
    getDoc,
    setDoc,
    doc,
    Timestamp,deleteDoc
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
    
      // ⭐ Create / ensure CLASS document (field name = class)
      await setDoc(
        doc(db, "users", adminUid, "courses", String(selectedClass)),
        {
          class: selectedClass,          // <<< CHANGE HERE
          createdAt: Timestamp.now()
        },
        { merge: true }
      );
    
      // ⭐ Add subject
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
    const deleteSubject = async (name) => {
      if (!window.confirm(`Delete subject "${name}"?`)) return;
    
      await deleteDoc(
        doc(
          db,
          "users",
          adminUid,
          "courses",
          String(selectedClass),
          "subjects",
          name
        )
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

{selectedClass && !selectedSubject && (
  <>
    <h3>Class {selectedClass} — Subjects</h3>

    <button
      className="save-btn"
      onClick={addSubject}
      style={{ marginBottom: 16 }}
    >
      + Add Subject
    </button>

    <div className="class-grid">
      {subjects.map((s) => (
        <div
          key={s}
          className="class-card"
          style={{ position: "relative" }}
          onClick={() => loadTopics(s)}
        >
          {s}

          {/* DELETE BUTTON */}
          <button
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "#ff4d4d",
              color: "#fff",
              border: "none",
              padding: "4px 8px",
              borderRadius: 6,
              cursor: "pointer"
            }}
            onClick={(e) => {
              e.stopPropagation();   // don't open subject
              deleteSubject(s);
            }}
          >
            ✖
          </button>
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
                maxWidth: 520,          
              }}
            >
            

            <div
       style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
      >
       {/* TITLE — editable */}
       <input
         style={{
          border: "1px solid #ccc",
          padding: "6px 10px",
          borderRadius: 6,
          width: "70%",
          fontWeight: 600,
          marginTop:20
        }}
        value={grp.title}
        placeholder={`Title ${gi + 1}`}
        onChange={(e) => {
          const copy = [...examGroups];
          copy[gi].title = e.target.value;
          setExamGroups(copy);
        }}
        />

       {/* DELETE BUTTON */}
       <button 
         style={{  
          background: "#ff4d4d",
          border: "none",
          padding: "6px 10px",
          borderRadius: 6,
          color: "#fff",
          cursor: "pointer",
          marginTop:20
        }}
        onClick={() => {
          const copy = [...examGroups];
          copy.splice(gi, 1);
          setExamGroups(copy);
        }}
        >
         Delete
         </button>
         </div>

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
                    style={{
                      border: "1px solid #ccc",
                      padding: "6px 10px",
                      borderRadius: 6,
                      width: "70%",
                      fontWeight: 600
                    }}
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
