import React, { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../services/firebase";

import "../../dashboard_styles/Accounts.css";
export default function BillPage({ adminUid, billStudentId, billDate, setActivePage }) {

  const [student, setStudent] = useState(null);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    const load = async () => {
  
      const stuSnap = await getDoc(
        doc(db, "users", adminUid, "students", billStudentId)
      );
      setStudent(stuSnap.data());
  
      const q = query(
        collection(db, "users", adminUid, "Account", "accounts", "Income"),
        where("studentId", "==", billStudentId),
        where("date", "==", billDate)
      );
  
      const snap = await getDocs(q);
      snap.forEach(d => setPayment(d.data()));
    };
  
    if (adminUid && billStudentId && billDate) {
      load();
    }
  }, [adminUid, billStudentId, billDate]);
  

  if (!student || !payment) return <div>Loading...</div>;

  return (
    <div className="bill-page">
      <button onClick={() => setActivePage("accounts")}>← Back</button>
  
      <div className="bill-card invoice">
  
        {/* SCHOOL HEADER */}
        <div className="invoice-header">
          <h1>{localStorage.getItem("schoolName") || "RRR School"}</h1>
          <p>Fee Receipt</p>
        </div>
  
        <hr />
  
        {/* STUDENT INFO */}
        <div className="invoice-row">
          <div>
            <b>Student Name:</b> {student.studentName}<br />
            <b>Class:</b> {student.class}<br />
            <b>Parent:</b> {student.parentName}
          </div>
  
          <div style={{ textAlign: "right" }}>
            <b>Receipt Date:</b> {billDate}<br />
            <b>Receipt No:</b> {billStudentId.slice(0, 6).toUpperCase()}
          </div>
        </div>
  
        <hr />
  
        {/* FEE TABLE */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Total</th>
              <th>Paid</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>School Fees</td>
              <td>₹{payment.totalFees}</td>
              <td>₹{payment.paidAmount}</td>
            </tr>
          </tbody>
        </table>
  
        <hr />
  
        {/* SUMMARY */}
        <div className="invoice-summary">
          <div><b>Payment Type:</b> {payment.type}</div>
          <div className="invoice-amount">
            Amount Received: ₹{payment.paidAmount}
          </div>
        </div>
  
        <hr />
  
        <p style={{ textAlign: "center", fontSize: 14 }}>
          This is a system generated receipt. No signature required.
        </p>
  
        <div className="invoice-actions">
          <button onClick={() => window.print()}>🖨️ Print / Save PDF</button>
        </div>
      </div>
    </div>
    
  );
}
