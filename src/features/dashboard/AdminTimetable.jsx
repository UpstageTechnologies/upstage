import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import "../dashboard_styles/AdminTimetable.css";
import SchoolCalendar from "../../components/SchoolCalendar";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import UpgradePopup from "../../components/UpgradePopup";


// 👉 Classes BEFORE class-1 added here
const CLASSES = [
  "LKG",
  "UKG", "Play Group",
  ...Array.from({ length: 12 }, (_, i) => i + 1)
];

const SECTIONS = ["A", "B", "C", "D"];
const PERIODS = [1, 2, 3, 4, 5, 6];
const DAYS = ["Sunday","Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday"];

const AdminTimetable = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [table, setTable] = useState({});
  const [showUpgrade, setShowUpgrade] = useState(false);

  
  const adminUid =
  auth.currentUser?.uid || localStorage.getItem("adminUid");

const role = localStorage.getItem("role");

const plan = localStorage.getItem("plan") || "basic";

const isPremiumPlan = plan === "premium" || plan === "lifetime";
const hasPremiumAccess = isPremiumPlan;







  /* ================= LOAD ================= */
  const loadTimetable = async () => {
    if (!selectedClass || !selectedSection || !adminUid) return;

    const ref = doc(
      db,
      "users",
      adminUid,
      "timetables",
      `${selectedClass}_${selectedSection}`
    );

    const snap = await getDoc(ref);

    if (snap.exists() && snap.data()?.[selectedDay]) {
      setTable(snap.data()[selectedDay]);
    } else {
      setTable({});
    }
  };

  useEffect(() => {
    loadTimetable();
  }, [selectedDay, selectedSection,selectedClass]);

  const handleCalendarDateSelect = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    const dayName = date.toLocaleDateString("en-US", {
      weekday: "long"
    });

    const allowed = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    if (allowed.includes(dayName)) setSelectedDay(dayName);
  };

  /* ================= SAVE (ADMIN) ================= */
  const saveTimetable = async () => {
    try {
      if (!adminUid) return;

      const ref = doc(
        db,
        "users",
        adminUid,
        "timetables",
        `${selectedClass}_${selectedSection}`
      );

      await setDoc(
        ref,
        { [selectedDay]: table },
        { merge: true }
      );

      alert("✅ Timetable saved");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  /* ADDED — SUB ADMIN APPROVAL REQUEST  */
  const requestTimetableApproval = async () => {
    await addDoc(
      collection(db, "users", adminUid, "approval_requests"),
      {
        module: "timetable",
        action: "update",
        classKey: `${selectedClass}_${selectedSection}`,
        day: selectedDay,
        payload: table,
        status: "pending",
        createdBy: localStorage.getItem("adminId"),
        createdAt: Timestamp.now()
      }
    );

    alert("⏳ Sent to main admin for approval");
  };

  const resetAll = () => {
    setSelectedClass(null);
    setSelectedSection(null);
    setTable({});
  };



  return (
    <div className="tt-container">
           {(selectedClass || selectedSection) && (
    <p className="back" onClick={() => {
      setSelectedClass("");
      setSelectedSection("");
    }}>
      ← Back
    </p>
  )}
      <h2 className="tt-title">Admin Timetable</h2>

      {!selectedClass && (
        <div className="class-grid">
          {CLASSES.map(c => (
        <div
        key={c}
        className="class-card"
        onClick={() => setSelectedClass(c)}
      >
        {typeof c === "number" ? `${c} Std` : c}
      </div>
      
          ))}
        </div>
      )}

      {selectedClass && !selectedSection && (
        <>
          <h3 className="tt-sub">
            Class {selectedClass} – Select Section
          </h3>

          <div className="section-row">
            {SECTIONS.map(sec => (
              <div
                key={sec}
                className="section-btn"
                onClick={() => setSelectedSection(sec)}
              >
                {sec}
              </div>
            ))}
          </div>

        </>
      )}

      {selectedClass && selectedSection && (
        <div className="tt-layout">

          <div className="tt-left">
            <h3 className="tt-sub">
              Class {selectedClass} – Section {selectedSection}
            </h3>

            <div className="day-row">
              {DAYS.map(d => (
                <button
                  key={d}
                  className={`day-btn ${selectedDay === d ? "active" : ""}`}
                  onClick={() => setSelectedDay(d)}
                >
                  {d}
                </button>
              ))}
            </div>

            {PERIODS.map(p => (
              <div key={p} className="period-row">
                <label>Period {p}</label>
                <input
                  placeholder="Enter Subject"
                  value={table[`p${p}`] || ""}
                  onChange={e =>
                    setTable({
                      ...table,
                      [`p${p}`]: e.target.value
                    })
                  }
                />
              </div>
            ))}

            {/* ⭐ BUTTON LOGIC ONLY — SAVE CODE UNCHANGED ⭐ */}
            <button
  className="save-btn"
  onClick={() => {
    // 🔐 Block Basic Plan
    if (!hasPremiumAccess) {
      setShowUpgrade(true);
      return;
    }
  
    // Sub-admin → approval flow
    if (role === "admin") {
      requestTimetableApproval();
    } else {
      // Master → direct save
      saveTimetable();
    }
  }}
  
>
  Save Timetable
</button>


           
          </div>

          <div className="tt-right">
            <SchoolCalendar
              adminUid={adminUid}
              role={role}
              onDateSelect={handleCalendarDateSelect}
            />
          </div>

        </div>
      )}
      {showUpgrade && (
  <UpgradePopup
    onClose={() => setShowUpgrade(false)}
    onUpgrade={() => {
      window.location.href = "/payment";
    }}
  />
)}

    </div>
  );
};

export default AdminTimetable;
