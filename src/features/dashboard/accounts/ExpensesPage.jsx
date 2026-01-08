import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";

export default function ExpensesPage({ adminUid, setActivePage }) {

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  const profit = totalIncome - totalExpense;

  /* ----------- LOAD TOTAL INCOME ----------- */
  useEffect(() => {
    if (!adminUid) return;

    const ref = collection(
      db,
      "users",
      adminUid,
      "Account",
      "accounts",
      "Income"
    );

    const unsub = onSnapshot(ref, snap => {
      let sum = 0;
      snap.forEach(d => {
        sum += Number(d.data().paidAmount || 0);
      });
      setTotalIncome(sum);
    });

    return () => unsub();
  }, [adminUid]);

  /* ----------- LOAD TOTAL EXPENSE ----------- */
  useEffect(() => {
    if (!adminUid) return;

    const ref = collection(
      db,
      "users",
      adminUid,
      "Account",
      "accounts",
      "Expenses"
    );

    const unsub = onSnapshot(ref, snap => {
      let sum = 0;
      snap.forEach(d => {
        sum += Number(d.data().amount || 0);
      });
      setTotalExpense(sum);
    });

    return () => unsub();
  }, [adminUid]);

  return (
    <div className="accounts-wrapper fade-in">

      {/* ================= TOP SUMMARY ================= */}
      <h2 className="page-title">Accounts Dashboard</h2>

      <div className="stats-grid">

        <div className="info-card1">
          <div className="label">Total Income</div>
          <div className="value">
            ₹{totalIncome.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="info-card2">
          <div className="label">Total Expenses</div>
          <div className="value">
            ₹{totalExpense.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="info-card3">
          <div className="label">Profit</div>
          <div
            className="value"
            style={{ color: profit >= 0 ? "green" : "red" }}
          >
            ₹{profit.toLocaleString("en-IN")}
          </div>
        </div>

      </div>

      {/* ================= NAVIGATION BOXES ================= */}
      <div className="accounts-grid">

        {/* JOURNAL ENTRY */}
        <div
          className="accounts-card"
          onClick={() => setActivePage("profit")}
        >
          <h3>📒 Journal Entry</h3>
          <p>Add / View Income & Expenses</p>
        </div>

      

        {/* INVENTORY */}
        <div
          className="accounts-card"
          onClick={() => setActivePage("inventory")}
        >
          <h3>📦 Inventory</h3>
          <p>Fees Master</p>
        </div>

        {/* 🆕 INCOME */}
        <div
          className="accounts-card"
          onClick={() => setActivePage("income")}
        >
          <h3>💵 Income</h3>
          <p>View All Income Records</p>
        </div>

        {/* 🆕 EXPENSE */}
        <div
          className="accounts-card"
          onClick={() => setActivePage("expenses")}
        >
          <h3>💸 Expenses</h3>
          <p>View All Expense Records</p>
        </div>

      </div>

    </div>
  );
}
