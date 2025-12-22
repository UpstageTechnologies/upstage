import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import "../dashboard_styles/TeacherTimetable.css";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [1, 2, 3, 4, 5, 6];

const TeacherTimetable = () => {
  const adminUid = localStorage.getItem("adminUid");
  const teacherId = localStorage.getItem("teacherId");

  const [teacher, setTeacher] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= FETCH TEACHER ================= */
  const fetchTeacher = async () => {
    try {
      if (!adminUid || !teacherId) {
        setError("Admin UID or Teacher ID missing");
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "users", adminUid, "teachers"),
        where("teacherId", "==", teacherId)
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        setError("Teacher profile not found");
        setLoading(false);
        return;
      }

      setTeacher({ id: snap.docs[0].id, ...snap.docs[0].data() });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load teacher data");
      setLoading(false);
    }
  };

  /* ================= LOAD TIMETABLE ================= */
  const loadTimetable = async (cls) => {
    try {
      setTimetable({});

      const ref = doc(
        db,
        "users",
        adminUid,
        "timetables",
        `${cls.className}_${cls.section}`
      );

      const snap = await getDoc(ref);

      if (snap.exists()) {
        console.log("TIMETABLE 👉", snap.data());
        setTimetable(snap.data());
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= SUBJECT → PERIOD FINDER (SAFE) ================= */
  const getPeriodsForSubject = (day, subject) => {
    if (!timetable[day]) return [];

    const normalizedSubject = subject.trim().toLowerCase();

    return PERIODS.filter(p => {
      const value = timetable[day][`p${p}`];
      return (
        typeof value === "string" &&
        value.trim().toLowerCase() === normalizedSubject
      );
    });
  };

  useEffect(() => {
    fetchTeacher();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadTimetable(selectedClass);
    }
  }, [selectedClass]);

  /* ================= UI STATES ================= */
  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <h3>Loading timetable...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, color: "red" }}>
        <h3>{error}</h3>
      </div>
    );
  }

  return (
    <div className="tt-container">
      <h2 className="tt-title">My Timetable</h2>

      {/* ================= CLASS SELECTION ================= */}
      {!selectedClass && (
        <div className="class-grid">
          {teacher.assignedClasses?.map((cls, i) => (
            <div
              key={i}
              className="class-card"
              onClick={() => setSelectedClass(cls)}
            >
              <strong>
                Class {cls.className} - {cls.section}
              </strong>
              <br />
              <small>{cls.subject}</small>
            </div>
          ))}
        </div>
      )}

      {/* ================= SUBJECT + PERIOD VIEW ================= */}
      {selectedClass && (
        <>
          <h3 className="tt-sub">
            Class {selectedClass.className} - Section {selectedClass.section}
          </h3>

          <div className="table">
            <div className="period-row subject-row">
              <strong>{selectedClass.subject}</strong>
            </div>

            {DAYS.map(day => {
              const periods = getPeriodsForSubject(
                day,
                selectedClass.subject
              );

              return (
                <div key={day} className="period-row">
                  <span>{day}</span>
                  <span>
                    {periods.length > 0
                      ? `Period ${periods.join(", ")}`
                      : "No class"}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="back" onClick={() => setSelectedClass(null)}>
            ← Back to Classes
          </p>
        </>
      )}
    </div>
  );
};

export default TeacherTimetable;
