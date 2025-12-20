import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import "./Teacher.css";

const subjects = ["tamil", "english", "maths", "science", "social"];

const StudentDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // 🔥 GET FROM LOCAL STORAGE (RN FIX)
  const adminUid = localStorage.getItem("adminUid");
  const teacher =
    state?.teacher ||
    JSON.parse(localStorage.getItem("teacher"));

  const [students, setStudents] = useState([]);
  const [editStudent, setEditStudent] = useState(null);
  const [marks, setMarks] = useState({
    tamil: "",
    english: "",
    maths: "",
    science: "",
    social: ""
  });

  /* ===============================
     SAFE GUARD
     =============================== */
  useEffect(() => {
    if (!teacher || !adminUid) {
      navigate("/dashboard");
    }
  }, []);

  /* ===============================
     FETCH STUDENTS
     =============================== */
  const fetchStudents = async () => {
    if (!adminUid || !teacher) return;

    const snap = await getDocs(
      collection(db, "users", adminUid, "students")
    );

    const assigned = teacher.assignedClasses || [];

    const list = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(stu =>
        assigned.some(ac =>
          String(stu.className) === String(ac.className) &&
          String(stu.section).toUpperCase() ===
            String(ac.section).toUpperCase()
        )
      );

    setStudents(list);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  /* ===============================
     SAVE MARKS
     =============================== */
  const total = subjects.reduce(
    (sum, s) => sum + Number(marks[s] || 0),
    0
  );

  const saveMarks = async () => {
    if (!editStudent) return;

    await updateDoc(
      doc(db, "users", adminUid, "students", editStudent.id),
      { marks: { ...marks, total } }
    );

    setEditStudent(null);
    fetchStudents();
  };

  return (
    <div className="teacher-page">
      <h2>
        Students – Class{" "}
        {teacher?.assignedClasses?.[0]?.className}
        {teacher?.assignedClasses?.[0]?.section}
      </h2>

      <table className="teacher-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>ID</th>
            {subjects.map(s => (
              <th key={s}>{s.toUpperCase()}</th>
            ))}
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {students.length === 0 && (
            <tr>
              <td colSpan={subjects.length + 3}>
                No students found
              </td>
            </tr>
          )}

          {students.map(s => (
            <tr key={s.id}>
              <td>{s.studentName}</td>
              <td>{s.studentId}</td>

              {subjects.map(sub => (
                <td key={sub}>{s.marks?.[sub] ?? "-"}</td>
              ))}

              <td>{s.marks?.total ?? "-"}</td>

              <td>
                <button
                  onClick={() => {
                    setEditStudent(s);
                    setMarks(s.marks || {});
                  }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editStudent && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editStudent.studentName}</h3>

            {subjects.map(sub => (
              <input
                key={sub}
                type="number"
                value={marks[sub] || ""}
                onChange={e =>
                  setMarks({
                    ...marks,
                    [sub]: e.target.value
                  })
                }
              />
            ))}

            <p><b>Total : {total}</b></p>

            <button onClick={saveMarks}>Save</button>
            <button onClick={() => setEditStudent(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetails;
