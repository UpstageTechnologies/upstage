import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";

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
  
  const getPercent = (value, total) => {
    if (!total || total <= 0) return 0;
    return Math.min((value / total) * 100, 100);
  };
  
  // base = highest absolute value (like attendance total)

  
// FEES = student income only
const totalFees = incomeList
  .filter(i => i.studentId)
  .reduce((s, i) => s + Number(i.paidAmount || 0), 0);

// OTHER income (Source)
const otherIncome = incomeList
  .filter(i => !i.studentId)
  .reduce((s, i) => s + Number(i.paidAmount || 0), 0);

// TOTAL income
const totalIncome = totalFees + otherIncome;

// TOTAL expense
const totalExpense = expenseList.reduce(
  (s, e) => s + Number(e.amount || 0), 0
);
const profit = totalIncome - totalExpense;

const totalBase = Math.max(
  totalFees,
  totalIncome,
  totalExpense,
  Math.abs(profit),
  1
);

const pillData = [
  { label: "Fees Income", value: totalFees, color: "fill-purple", icon: "fa-graduation-cap" },
  { label: "Total Income", value: totalIncome, color: "fill-blue", icon: "fa-arrow-up" },
  { label: "Total Expense", value: totalExpense, color: "fill-red", icon: "fa-arrow-down" },
  { label: "Total Profit", value: profit, color: "fill-green", icon: "fa-chart-line" }
];

const maxValue = Math.max(...pillData.map(p => Math.abs(p.value)), 1);

const getFillPercent = (value) => {
  if (!value) return 5;              // tiny visible base
  return Math.min((Math.abs(value) / maxValue) * 100, 100);
};

  /// Today Income (fees + source)
const todayIncome = incomeList
.filter(i => i.date === today)
.reduce((s, i) => s + Number(i.paidAmount || 0), 0);

// Today Expense
const todayExpense = expenseList
.filter(e => e.date === today)
.reduce((s, e) => s + Number(e.amount || 0), 0);

// Today Profit
const todayProfit = todayIncome - todayExpense;


  const max = Math.max(totalIncome, totalExpense, Math.abs(profit), 1);

  const monthlyProfit = (() => {
    const map = {};
  
    incomeList.forEach(i => {
      if (!i.date) return;
      const m = i.date.slice(0,7);
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
    <>
      {!isOfficeStaff && (
        <>
  <div className="summary2-scroll">
  <div className="summary2-layout">


{/* ---------- LEFT SIDE : MONTHLY PROFIT FLOW ---------- */}
<div className="summary2-left">

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

  <div className="summary2-title">Overall Accounts</div>

  <div className="summary2-cards">
  {pillData.map((p, i) => (
    <div className="summary2-card" key={i}>
      <div className="summary2-top-fixed">
        ₹{p.value.toLocaleString("en-IN")}
      </div>

      {/* Fill proportional EXACTLY like attendance */}
      <div
        className={`summary2-fill ${p.color}`}
        style={{ height: `${getPercent(Math.abs(p.value), totalBase)}%` }}
      />

      <div className="summary2-content">
        <i className={`fa ${p.icon}`}></i>
        <span>{p.label}</span>
      </div>
    </div>
  ))}
</div>


</div>

</div>
</div>
</>
      )}
      {/* ===== TODAY SUMMARY ===== */}
      {!isOfficeStaff && (
<div className="today-summary">

<div className="today-card blue">
  <span>Today Income</span>
  <h2>₹{todayIncome.toLocaleString("en-IN")}</h2>
</div>

<div className="today-card yellow">
  <span>Today Expense</span>
  <h2>₹{todayExpense.toLocaleString("en-IN")}</h2>
</div>

<div className="today-card green">
  <span>Today Profit</span>
  <h2>₹{todayProfit.toLocaleString("en-IN")}</h2>
</div>

</div>
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

    </>
  );
}
