import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";

export default function ProfitPage({ adminUid }) {
  const [incomeList, setIncomeList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);

  const incomesRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Income"
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

    onSnapshot(incomesRef, (s) =>
      setIncomeList(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    onSnapshot(expensesRef, (s) =>
      setExpenseList(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, [adminUid]);

  const totalIncome = incomeList.reduce(
    (t, x) => t + (x.paidAmount ?? x.amount ?? 0),
    0
  );

  const totalExpense = expenseList.reduce(
    (t, x) => t + (x.amount ?? 0),
    0
  );

  const profit = totalIncome - totalExpense;

  return (
    <div className="accounts-wrapper fade-in">
      <h2 className="page-title">Profit Summary</h2>

      {/* TOP SUMMARY BOXES */}
      <div
        className="section-card pop"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 14
        }}
      >
        <div className="info-box">
          <b>Total Income</b>
          <div style={{ fontSize: 22, marginTop: 6 }}>₹{totalIncome}</div>
        </div>

        <div className="info-box">
          <b>Total Expenses</b>
          <div style={{ fontSize: 22, marginTop: 6 }}>₹{totalExpense}</div>
        </div>

        <div className="info-box">
          <b>Profit</b>
          <div
            style={{
              fontSize: 22,
              marginTop: 6,
              color: profit >= 0 ? "green" : "red"
            }}
          >
            ₹{profit}
          </div>
        </div>
      </div>

      {/* DETAILS TABLE */}
      <div className="section-card pop">
        <h3 className="section-title">Breakdown</h3>

        <div className="nice-table-wrapper">
          <table className="nice-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {/* INCOME ROWS */}
              {incomeList.map((i) => (
                <tr key={i.id}>
                  <td data-label="Name">{i.studentName || "Income"}</td>
                  <td data-label="Type">Income</td>
                  <td data-label="Amount">₹{i.paidAmount ?? i.amount}</td>
                  <td data-label="Date">{i.date}</td>
                </tr>
              ))}

              {/* EXPENSE ROWS */}
              {expenseList.map((e) => (
                <tr key={e.id}>
                  <td data-label="Name">{e.type === "salary" ? e.teacher : e.name}</td>
                  <td data-label="Type">Expense</td>
                  <td data-label="Amount">₹{e.amount}</td>
                  <td data-label="Date">{e.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
