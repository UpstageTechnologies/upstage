import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";

export default function FeesPage({ adminUid, mode }) {

  const [incomeList, setIncomeList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);

  // 🔥 income sub-tab
  const [incomeTab, setIncomeTab] = useState("new"); 
  // new | old | full | partial

  const incomeRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Income"
  );

  const expenseRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Expenses"
  );

  useEffect(() => {
    if (!adminUid) return;

    let unsub = () => {};

    if (mode === "income") {
      unsub = onSnapshot(incomeRef, snap => {
        setIncomeList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }

    if (mode === "expenses") {
      unsub = onSnapshot(expenseRef, snap => {
        setExpenseList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }

    return () => unsub();
  }, [adminUid, mode]);

  return (
    <div className="accounts-wrapper fade-in">

      <h2 className="page-title">
        {mode === "income" ? "Income Details" : "Expenses Details"}
      </h2>

      {/* ================= INCOME ================= */}
      {mode === "income" && (
        <>
          {/* 🔘 INCOME BUTTONS */}
          <div className="tab-buttons">
            <button
              className={incomeTab === "new" ? "tab-btn active" : "tab-btn"}
              onClick={() => setIncomeTab("new")}
            >
              New Admission
            </button>

            <button
              className={incomeTab === "old" ? "tab-btn active" : "tab-btn"}
              onClick={() => setIncomeTab("old")}
            >
              Old Admission
            </button>

            <button
              className={incomeTab === "full" ? "tab-btn active" : "tab-btn"}
              onClick={() => setIncomeTab("full")}
            >
              Full Payment
            </button>

            <button
              className={incomeTab === "partial" ? "tab-btn active" : "tab-btn"}
              onClick={() => setIncomeTab("partial")}
            >
              Partial Payment
            </button>
          </div>

          {/* 🆕 NEW ADMISSION */}
          {incomeTab === "new" && (
            <div className="section-card pop">
              <h3 className="section-title">New Admission Payments</h3>

              <div className="nice-table-wrapper">
                <table className="nice-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Parent</th>
                      <th>Class</th>
                      <th>Paid</th>
                      <th>Type</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeList
                      .filter(i => i.studentId && i.isNew !== false)
                      .map(i => (
                        <tr key={i.id}>
                          <td>{i.studentName}</td>
                          <td>{i.parentName}</td>
                          <td>{i.className}</td>
                          <td>₹{i.paidAmount}</td>
                          <td>{i.type}</td>
                          <td>{i.date}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 👨‍🎓 OLD ADMISSION */}
          {incomeTab === "old" && (
            <div className="section-card pop">
              <h3 className="section-title">Old Admission Payments</h3>

              <div className="nice-table-wrapper">
                <table className="nice-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Class</th>
                      <th>Paid</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeList
                      .filter(i => i.studentId && i.isNew === false)
                      .map(i => (
                        <tr key={i.id}>
                          <td>{i.studentName}</td>
                          <td>{i.className}</td>
                          <td>₹{i.paidAmount}</td>
                          <td>{i.date}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ✅ FULL PAYMENT */}
          {incomeTab === "full" && (
            <div className="section-card pop">
              <h3 className="section-title">Full Payment Students</h3>

              <div className="nice-table-wrapper">
                <table className="nice-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Class</th>
                      <th>Paid</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeList
                      .filter(i => i.type === "full")
                      .map(i => (
                        <tr key={i.id}>
                          <td>{i.studentName}</td>
                          <td>{i.className}</td>
                          <td>₹{i.paidAmount}</td>
                          <td>{i.date}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 🟡 PARTIAL PAYMENT */}
          {incomeTab === "partial" && (
            <div className="section-card pop">
              <h3 className="section-title">Partial Payment Students</h3>

              <div className="nice-table-wrapper">
                <table className="nice-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Class</th>
                      <th>Paid</th>
                      <th>Balance</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeList
                      .filter(i => i.type === "partial")
                      .map(i => (
                        <tr key={i.id}>
                          <td>{i.studentName}</td>
                          <td>{i.className}</td>
                          <td>₹{i.paidAmount}</td>
                          <td>
                            ₹{(i.totalFees || 0) - (i.paidAmount || 0)}
                          </td>
                          <td>{i.date}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ================= EXPENSE ================= */}
      {mode === "expenses" && (
        <div className="section-card pop">
          <h3 className="section-title">Expenses Details</h3>

          <div className="nice-table-wrapper">
            <table className="nice-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {expenseList.map(e => (
                  <tr key={e.id}>
                    <td>{e.type}</td>
                    <td>{e.name}</td>
                    <td>₹{e.amount}</td>
                    <td>{e.date}</td>
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
