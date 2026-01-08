import React, { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";

export default function Inventory({ adminUid }) {

  const [feesMaster, setFeesMaster] = useState([]);

  const [feeClass, setFeeClass] = useState("");
  const [feeName, setFeeName] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // yyyy-mm-dd
  });
  

  const feesRef = collection(
    db,"users",adminUid,"Account","accounts","FeesMaster"
  );

  /* 🔄 LOAD FEES SUMMARY */
  useEffect(() => {
    if (!adminUid) return;

    return onSnapshot(feesRef, snap =>
      setFeesMaster(snap.docs.map(d => ({ id:d.id, ...d.data() })))
    );
  }, [adminUid]);

  /* 💾 SAVE FEE */
  const saveFee = async () => {
    if (!feeClass || !feeName || !feeAmount || !date)
      return alert("Fill all fields");

    await addDoc(feesRef,{
      className: feeClass,
      name: feeName,
      amount: Number(feeAmount),
      date,
      createdAt: new Date()
    });

    setFeeClass("");
    setFeeName("");
    setFeeAmount("");
  };
  const groupedFees = feesMaster.reduce((acc, fee) => {
    if (!acc[fee.className]) {
      acc[fee.className] = [];
    }
    acc[fee.className].push(fee);
    return acc;
  }, {});
  

  return (
    <div className="accounts-wrapper fade-in">

      <h2 className="page-title">Inventory</h2>

      {/* ➕ ADD FEES */}
      <div className="section-card entries-card">
        <h3 className="section-title">Add Item</h3>

        <input type="date" value={date} onChange={e=>setDate(e.target.value)} />

        <div className="form-grid">
          <select value={feeClass} onChange={e=>setFeeClass(e.target.value)}>
            <option value="">Class</option>
            {["PreKG","LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"]
              .map(c => <option key={c}>{c}</option>)}
          </select>

          <input placeholder="Fee Name"
            value={feeName}
            onChange={e=>setFeeName(e.target.value)} />

          <input type="number" placeholder="Amount"
            value={feeAmount}
            onChange={e=>setFeeAmount(e.target.value)} />

          <button className="primary-btn glow" onClick={saveFee}>
            Save 
          </button>
        </div>
      </div>

      {/* 📊 FEES SUMMARY */}
      <div className="section-card pop">
        <h3 className="section-title">Fees Summary</h3>

        <div className="nice-table-wrapper">
          <table className="nice-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Fee Name</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
  {Object.entries(groupedFees).map(([className, fees]) =>
    fees.map((fee, index) => (
      <tr key={fee.id}>

        {/* CLASS MERGE */}
        {index === 0 && (
          <td
            rowSpan={fees.length}
            className="class-col"
            data-label="Class"
          >
            {className}
          </td>
        )}

        <td className="fee-name-col" data-label="Fee Name">
          {fee.name}
        </td>

        <td className="amount-col" data-label="Amount">
          ₹{fee.amount}
        </td>

      </tr>
    ))
  )}
</tbody>


          </table>
        </div>
      </div>

    </div>
  );
}
