import React, { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";
import "../../dashboard_styles/studentSearch.css";

export default function Inventory({ adminUid, setActivePage, plan, showUpgrade }) {

  /* ================= STATES ================= */
  const [feesMaster, setFeesMaster] = useState([]);
  const [feesLoaded, setFeesLoaded] = useState(false);

  const [teachers, setTeachers] = useState([]);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [entryType, setEntryType] = useState(""); // fees | salary
  const [activeSummary, setActiveSummary] = useState("fees");

  const [feeClass, setFeeClass] = useState("");
  const [feeName, setFeeName] = useState("");
  const [feeAmount, setFeeAmount] = useState("");

  const [salaryCategory, setSalaryCategory] = useState("");
  const [salaryPosition, setSalaryPosition] = useState("");

  const [showCategory, setShowCategory] = useState(false);
  const [showPosition, setShowPosition] = useState(false);

  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  /* ================= FIRESTORE ================= */
  const feesRef = collection(db, "users", adminUid, "Account", "accounts", "FeesMaster");
  const teachersRef = collection(db, "users", adminUid, "teachers");

  /* ================= LOAD ================= */
  useEffect(() => {
    if (!adminUid) return;

    const unsub1 = onSnapshot(feesRef, snap => {
      setFeesMaster(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setFeesLoaded(true);
    });

    const unsub2 = onSnapshot(teachersRef, snap => {
      setTeachers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [adminUid]);

  const filteredTeachers = teachers.filter(t =>
    t.name?.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  /* ================= SAVE ================= */
  const saveFee = async () => {
    if (!entryType || !feeAmount || !date) return alert("Fill all fields");

    if (entryType === "fees") {
      if (!feeClass || !feeName) return alert("Select class & fee name");

      await addDoc(feesRef, {
        type: "fees",
        className: feeClass,
        name: feeName,
        amount: Number(feeAmount),
        date,
        createdAt: new Date()
      });
    }

    if (entryType === "salary") {
      if (!salaryCategory || !salaryPosition || !selectedTeacher)
        return alert("Select Category, Position & Teacher");

      await addDoc(feesRef, {
        type: "salary",
        category: salaryCategory,
        position: salaryPosition,
        teacherId: selectedTeacher.id,
        name: selectedTeacher.name,
        amount: Number(feeAmount),
        date,
        createdAt: new Date()
      });
    }

    // RESET
    setEntryType("");
    setFeeClass("");
    setFeeName("");
    setFeeAmount("");
    setSalaryCategory("");
    setSalaryPosition("");
    setSelectedTeacher(null);
    setTeacherSearch("");
  };

  /* ================= DATA ================= */
  const feesData = feesMaster.filter(i => i.type === "fees");
  const salaryData = feesMaster.filter(i => i.type === "salary");

  const groupedFees = feesData.reduce((acc, item) => {
    if (!acc[item.className]) acc[item.className] = [];
    acc[item.className].push(item);
    return acc;
  }, {});

  /* ================= UI ================= */
  return (
    <div className="accounts-wrapper fade-in">

      <span onClick={() => setActivePage("accounts")} style={{ color: "#2140df", cursor: "pointer", fontWeight: 600 }}>
        ← Back
      </span>

      <h2 className="page-title">Inventory</h2>

      <div className="section-card entries-card">
        <h3 className="section-title">Add Item</h3>

        {!entryType && (
          <div className="entries-box">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            <select value={entryType} onChange={e => setEntryType(e.target.value)}>
              <option value="">Select Type</option>
              <option value="fees">Fees</option>
              <option value="salary">Salary</option>
            </select>
          </div>
        )}

        {entryType === "fees" && (
          <div className="entries-box">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            <select value={entryType} onChange={e => setEntryType(e.target.value)}>
              <option value="fees">Fees</option>
              <option value="salary">Salary</option>
            </select>

            <select value={feeClass} onChange={e => setFeeClass(e.target.value)}>
              <option value="">Class</option>
              {["PreKG","LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"].map(c => <option key={c}>{c}</option>)}
            </select>

            <input placeholder="Fee Name" value={feeName} onChange={e => setFeeName(e.target.value)} />
            <input type="number" placeholder="Amount" value={feeAmount} onChange={e => setFeeAmount(e.target.value)} />

            <button className="save-btn" onClick={saveFee}>Save</button>
          </div>
        )}

        {entryType === "salary" && (
          <div className="entries-box">

            <input type="date" value={date} onChange={e => setDate(e.target.value)} />

            <div className="popup-select">
              <div className="popup-input">Salary<span>▾</span></div>
            </div>

            <div className="popup-select">
              <div className="popup-input" onClick={() => setShowCategory(!showCategory)}>
                {salaryCategory || "Category"} <span>▾</span>
              </div>
              {showCategory && (
                <div className="popup-menu">
                  <div onClick={() => { setSalaryCategory("Office Staff"); setShowCategory(false); }}>Office Staff</div>
                  <div onClick={() => { setSalaryCategory("Working Staff"); setShowCategory(false); }}>Working Staff</div>
                </div>
              )}
            </div>

            <div className="popup-select">
              <div className="popup-input" onClick={() => setShowPosition(!showPosition)}>
                {salaryPosition || "Position"} <span>▾</span>
              </div>
              {showPosition && (
                <div className="popup-menu">
                  {salaryCategory === "Office Staff" && ["Principal","Clerk","Accountant","Receptionist"].map(p => (
                    <div key={p} onClick={() => { setSalaryPosition(p); setShowPosition(false); }}>{p}</div>
                  ))}
                  {salaryCategory === "Working Staff" && ["Teacher","Driver","Cleaner","Watchman","Helper"].map(p => (
                    <div key={p} onClick={() => { setSalaryPosition(p); setShowPosition(false); }}>{p}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="student-dropdown">
              <input
                placeholder="Search Teacher"
                value={selectedTeacher?.name || teacherSearch}
                onChange={e => {
                  setTeacherSearch(e.target.value);
                  setSelectedTeacher(null);
                  setShowTeacherDropdown(true);
                }}
                onFocus={() => setShowTeacherDropdown(true)}
              />

              {showTeacherDropdown && (
                <div className="student-dropdown-list">
                  {filteredTeachers.map(t => (
                    <div key={t.id} className="student-option" onClick={() => {
                      setSelectedTeacher(t);
                      setTeacherSearch("");
                      setShowTeacherDropdown(false);
                    }}>
                      <strong>{t.name}</strong>
                      <span>{t.teacherId}</span>
                    </div>
                  ))}
                  {filteredTeachers.length === 0 && <div className="student-option muted">No teachers</div>}
                </div>
              )}
            </div>

            <input type="number" placeholder="Amount" value={feeAmount} onChange={e => setFeeAmount(e.target.value)} />

            <button className="save-btn" onClick={saveFee}>Save</button>
          </div>
        )}
      </div>

      {/* SUMMARY */}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button onClick={() => setActiveSummary("fees")}>Fees Summary</button>
        <button onClick={() => setActiveSummary("salary")}>Salary Summary</button>
      </div>

      {activeSummary === "fees" && (
        <table className="nice-table">
          <thead><tr><th>Class</th><th>Fee</th><th>Amount</th></tr></thead>
          <tbody>
            {Object.entries(groupedFees).map(([cls, items]) =>
              items.map((i, idx) => (
                <tr key={i.id}>
                  {idx === 0 && <td rowSpan={items.length}>{cls}</td>}
                  <td>{i.name}</td>
                  <td>₹{i.amount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {activeSummary === "salary" && (
        <table className="nice-table">
          <thead><tr><th>Name</th><th>Amount</th><th>Date</th></tr></thead>
          <tbody>
            {salaryData.map(i => (
              <tr key={i.id}>
                <td>{i.name}</td>
                <td>₹{i.amount}</td>
                <td>{i.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}
