import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";
import "../../dashboard_styles/ac.css";

export default function ExpensesPage({ adminUid, setActivePage }) {

  const [incomeList, setIncomeList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);

  const today = new Date().toISOString().split("T")[0];
  const role = localStorage.getItem("role");
  const isOfficeStaff = role === "office_staff";

  /* 🔥 FIREBASE */
  useEffect(() => {
    if (!adminUid) return;
    return onSnapshot(
      collection(db, "users", adminUid, "Account", "accounts", "Income"),
      snap => setIncomeList(snap.docs.map(d => d.data()))
    );
  }, [adminUid]);

  useEffect(() => {
    if (!adminUid) return;
    return onSnapshot(
      collection(db, "users", adminUid, "Account", "accounts", "Expenses"),
      snap => setExpenseList(snap.docs.map(d => d.data()))
    );
  }, [adminUid]);

  /* 🔢 TOTAL */
  const totalIncome = incomeList.reduce((s, i) => s + Number(i.paidAmount || 0), 0);
  const totalExpense = expenseList.reduce((s, e) => s + Number(e.amount || 0), 0);
  const profit = totalIncome - totalExpense;

  /* 📅 TODAY */
  const todayIncome = incomeList.filter(i => i.date === today).reduce((s, i) => s + Number(i.paidAmount || 0), 0);
  const todayExpense = expenseList.filter(e => e.date === today).reduce((s, e) => s + Number(e.amount || 0), 0);
  const todayProfit = todayIncome - todayExpense;

  const max = Math.max(totalIncome, totalExpense, Math.abs(profit), 1);

  /* 📊 MONTHLY PROFIT */
  const monthlyProfit = (() => {
    const map = {};

    incomeList.forEach(i => {
      if (!i.date) return;
      const m = i.date.slice(0, 7);
      map[m] = map[m] || { income: 0, expense: 0 };
      map[m].income += Number(i.paidAmount || 0);
    });

    expenseList.forEach(e => {
      if (!e.date) return;
      const m = e.date.slice(0, 7);
      map[m] = map[m] || { income: 0, expense: 0 };
      map[m].expense += Number(e.amount || 0);
    });

    return Object.keys(map).sort().map(m => ({
      month: m,
      profit: map[m].income - map[m].expense
    }));
  })();

  return (
    <div className="accounts-wrapper">

      {!isOfficeStaff && (
        <>
        {/* ================= ACCOUNTS SUMMARY LAYOUT ================= */}
<div className="summary-layout">

{/* ---------- LEFT SIDE : MONTHLY PROFIT FLOW ---------- */}
<div className="summary-left">

  {/* Top small stats */}
  <div className="attendance-panel">
    <div>
      <h4>Total Months</h4>
      <h2>{monthlyProfit.length}</h2>
    </div>

    <div>
      <h4>Current Profit</h4>
      <h1>₹{profit.toLocaleString("en-IN")}</h1>
    </div>
  </div>

  {/* Monthly Profit Flow */}
  <div className="monthly-flow2">

    <svg className="trend-line" viewBox="0 0 600 120" preserveAspectRatio="none">
      <path
        d="M 0 80 L 200 40 L 400 70 L 600 30"
        fill="none"
        stroke="#8ab6f9"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>

    {monthlyProfit.map((m, i) => (
      <div
        key={i}
        className={`flow-item ${m.profit >= 0 ? "green" : "orange"}`}
        style={{
          left: `${i * 35}%`,
          top: i % 2 === 0 ? "60px" : "15px"
        }}
      >
        <small>{m.month}</small>
        <b>₹{m.profit.toLocaleString("en-IN")}</b>
      </div>
    ))}

  </div>
</div>


{/* ---------- RIGHT SIDE : TOTAL PILLS ---------- */}
<div className="summary2-wrapper">

  <div className="summary-title">Overall Accounts</div>

  <div className="summary2-cards">

    {/* Income */}
    <div className="summary2-card">
      <div className="summary2-top">₹{totalIncome.toLocaleString("en-IN")}</div>
      <div className="summary2-fill fill-blue" />
      <div className="summary2-content">
        <i className="fa fa-arrow-up"></i>
        <span>Total Income</span>
      </div>
    </div>

    {/* Expense */}
    <div className="summary2-card">
      <div className="summary2-top">₹{totalExpense.toLocaleString("en-IN")}</div>
      <div className="summary2-fill fill-yellow" />
      <div className="summary2-content">
        <i className="fa fa-arrow-down"></i>
        <span>Total Expense</span>
      </div>
    </div>

    {/* Profit */}
    <div className="summary2-card">
      <div className="summary2-top">₹{profit.toLocaleString("en-IN")}</div>
      <div className="summary2-fill fill-green" />
      <div className="summary2-content">
        <i className="fa fa-chart-line"></i>
        <span>Total Profit</span>
      </div>
    </div>

  </div>
</div>

</div>
</>
      )}

      {/* NAV */}
      <div className="accounts-grid">
        <div className="accounts-card" onClick={() => setActivePage("profit")}>📒 Journal Entry</div>
        <div className="accounts-card" onClick={() => setActivePage("inventory")}>📦 Inventory</div>
        {!isOfficeStaff && (
          <>
            <div className="accounts-card" onClick={() => setActivePage("income")}>💵 Income</div>
            <div className="accounts-card" onClick={() => setActivePage("expenses")}>💸 Expenses</div>
          </>
        )}
      </div>

    </div>
  );
}
