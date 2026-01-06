import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query
} from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";

export default function ExpensesPage({ adminUid }) {
  const [teachers, setTeachers] = useState([]);
  const [expenseList, setExpenseList] = useState([]);

  const [teacher, setTeacher] = useState("");
  const [salaryDate, setSalaryDate] = useState("");

  const [exName, setExName] = useState("");
  const [exAmt, setExAmt] = useState("");
  const [exDate, setExDate] = useState("");

  const [showDetails, setShowDetails] = useState(false);

  const teachersRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Teachers"
  );

  const expensesRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Expenses"
  );

  useEffect(() => {
    if (!adminUid) return;

    onSnapshot(teachersRef, (s) =>
      setTeachers(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    onSnapshot(query(expensesRef, orderBy("date", "desc")), (s) =>
      setExpenseList(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, [adminUid]);

  const paySalary = async () => {
    const t = teachers.find((x) => x.id === teacher);
    if (!t || !salaryDate) return alert("Select teacher + date");

    await addDoc(expensesRef, {
      type: "salary",
      teacher: t.name,
      amount: Number(t.salary),
      date: salaryDate,
      createdAt: new Date()
    });

    setTeacher("");
    setSalaryDate("");
  };

  const addOtherExpense = async () => {
    if (!exName || !exAmt || !exDate)
      return alert("Enter expense details");

    await addDoc(expensesRef, {
      type: "other",
      name: exName,
      amount: Number(exAmt),
      date: exDate,
      createdAt: new Date()
    });

    setExName("");
    setExAmt("");
    setExDate("");
  };

  return (
    <div className="accounts-wrapper fade-in">
      <h2 className="page-title">Expenses Management</h2>

      {/* SWITCH */}
      <div
        className="section-card pop"
        style={{ display: "flex", gap: 12, justifyContent: "center" }}
      >
        <button
          className={`primary-btn ${!showDetails && "glow"}`}
          onClick={() => setShowDetails(false)}
        >
          Forms
        </button>

        <button
          className={`primary-btn ${showDetails && "glow"}`}
          onClick={() => setShowDetails(true)}
        >
          Expense Details
        </button>
      </div>

      {/* ========= FORMS ========= */}
      {!showDetails && (
        <>
          {/* ===== SALARY ===== */}
          <div className="section-card pop">
            <div className="section-title">Pay Teacher Salary</div>

            <div className="form-grid">
              <select
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
              >
                <option value="">Select Teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — ₹{t.salary}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={salaryDate}
                onChange={(e) => setSalaryDate(e.target.value)}
              />

              <button className="primary-btn glow" onClick={paySalary}>
                Pay Salary
              </button>
            </div>
          </div>

          {/* ===== OTHER EXPENSE ===== */}
          <div className="section-card pop">
            <div className="section-title">Other Expenses</div>

            <div className="form-grid">
              <input
                placeholder="Expense (Diesel, Repair..)"
                value={exName}
                onChange={(e) => setExName(e.target.value)}
              />

              <input
                type="number"
                placeholder="Amount"
                value={exAmt}
                onChange={(e) => setExAmt(e.target.value)}
              />

              <input
                type="date"
                value={exDate}
                onChange={(e) => setExDate(e.target.value)}
              />

              <button className="primary-btn glow" onClick={addOtherExpense}>
                Add Expense
              </button>
            </div>
          </div>
        </>
      )}

      {/* ========= DETAILS ========= */}
      {showDetails && (
        <div className="section-card pop">
          <h3 className="section-title">Recent Expenses</h3>

          <div className="nice-table-wrapper">
            <table className="nice-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Teacher / Name</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {expenseList.map((e) => (
                  <tr key={e.id}>
                    <td data-label="Type">{e.type === "salary" ? "Salary" : "Other"}</td>
                    <td data-label="Name">{e.type === "salary" ? e.teacher : e.name}</td>
                    <td data-label="Amount">{e.amount}</td>
                    <td data-label="Date">{e.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
