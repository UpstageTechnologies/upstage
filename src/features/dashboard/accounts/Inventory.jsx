import React, { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";

export default function Inventory({ adminUid ,setActivePage ,requirePremium }) {

  /* ================= STATES ================= */
  const [feesMaster, setFeesMaster] = useState([]);

  const [entryType, setEntryType] = useState(""); // fees | salary
  const [activeSummary, setActiveSummary] = useState("fees"); // fees | salary

  const [feeClass, setFeeClass] = useState("");
  const [feeName, setFeeName] = useState("");
  const [salaryName, setSalaryName] = useState("");
  const [feeAmount, setFeeAmount] = useState("");

  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  /* ================= FIRESTORE REF ================= */
  const feesRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "FeesMaster"
  );

  const safeRequirePremium = requirePremium || ((cb) => cb());

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!adminUid) return;

    const unsub = onSnapshot(feesRef, snap => {
      setFeesMaster(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [adminUid]);

  /* ================= SAVE ================= */
  const saveFee = async () => {
    if (!entryType || !feeAmount || !date)
      return alert("Fill all fields");

    if (entryType === "fees") {
      if (!feeClass || !feeName)
        return alert("Select class & fee name");

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
      if (!salaryName)
        return alert("Enter salary name");

      await addDoc(feesRef, {
        type: "salary",
        name: salaryName,
        amount: Number(feeAmount),
        date,
        createdAt: new Date()
      });
    }

    // RESET
    setEntryType("");
    setFeeClass("");
    setFeeName("");
    setSalaryName("");
    setFeeAmount("");
  };

  /* ================= FILTER DATA ================= */
  const feesData = feesMaster.filter(i => i.type === "fees");
  const salaryData = feesMaster.filter(i => i.type === "salary");

  /* ================= GROUP FEES ================= */
  const groupedFees = feesData.reduce((acc, item) => {
    if (!acc[item.className]) acc[item.className] = [];
    acc[item.className].push(item);
    return acc;
  }, {});

  /* ================= UI ================= */
  return (
    <div className="accounts-wrapper fade-in">
       <span
        style={{ color: "#2140df", cursor: "pointer", fontWeight: 600 }}
        onClick={() => setActivePage("accounts")}
      >
        ← Back
      </span>

      <h2 className="page-title">Inventory</h2>

      {/* ================= ADD ITEM ================= */}
      <div className="section-card entries-card">
        <h3 className="section-title">Add Item</h3>

        {!entryType && (
          <div style={{ display: "flex", gap: 12 }}>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            <select value={entryType} onChange={e => setEntryType(e.target.value)}>
              <option value="">Select Type</option>
              <option value="fees">Fees</option>
              <option value="salary">Salary</option>
            </select>
          </div>
        )}

        {entryType === "fees" && (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            <select value={entryType} onChange={e => setEntryType(e.target.value)}>
              <option value="fees">Fees</option>
              <option value="salary">Salary</option>
            </select>

            <select value={feeClass} onChange={e => setFeeClass(e.target.value)}>
              <option value="">Class</option>
              {["PreKG","LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"]
                .map(c => <option key={c}>{c}</option>)}
            </select>

            <input
              placeholder="Fee Name"
              value={feeName}
              onChange={e => setFeeName(e.target.value)}
            />

            <input
              type="number"
              placeholder="Amount"
              value={feeAmount}
              onChange={e => setFeeAmount(e.target.value)}
              style={{ width: 120 }}
            />

            <button onClick={() => safeRequirePremium(saveFee)}>Save</button>
          </div>
        )}

        {entryType === "salary" && (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            <select value={entryType} onChange={e => setEntryType(e.target.value)}>
              <option value="salary">Salary</option>
              <option value="fees">Fees</option>
            </select>

            <input
              placeholder="Salary Name"
              value={salaryName}
              onChange={e => setSalaryName(e.target.value)}
            />

            <input
              type="number"
              placeholder="Amount"
              value={feeAmount}
              onChange={e => setFeeAmount(e.target.value)}
              style={{ width: 120 }}
            />

            <button onClick={saveFee}>Save</button>
          </div>
        )}
      </div>

      {/* ================= SUMMARY BUTTONS ================= */}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button
          onClick={() => setActiveSummary("fees")}
          style={{
            background: activeSummary === "fees" ? "#2563eb" : "#e5e7eb",
            color: activeSummary === "fees" ? "#fff" : "#000",
            padding: "6px 14px",
            borderRadius: 6,
            border: "none"
          }}
        >
          Fees Summary
        </button>

        <button
          onClick={() => setActiveSummary("salary")}
          style={{
            background: activeSummary === "salary" ? "#2563eb" : "#e5e7eb",
            color: activeSummary === "salary" ? "#fff" : "#000",
            padding: "6px 14px",
            borderRadius: 6,
            border: "none"
          }}
        >
          Salary Summary
        </button>
      </div>

      {/* ================= FEES SUMMARY ================= */}
      {activeSummary === "fees" && (
        <div className="section-card pop">
          <h3 className="section-title">Fees Summary</h3>

          <table className="nice-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Fee Name</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedFees).map(([cls, items]) =>
                items.map((item, index) => (
                  <tr key={item.id}>
                    {index === 0 && <td rowSpan={items.length}>{cls}</td>}
                    <td>{item.name}</td>
                    <td>₹{item.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= SALARY SUMMARY ================= */}
      {activeSummary === "salary" && (
        <div className="section-card pop">
          <h3 className="section-title">Salary Summary</h3>

          <table className="nice-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {salaryData.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>₹{item.amount}</td>
                  <td>{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
