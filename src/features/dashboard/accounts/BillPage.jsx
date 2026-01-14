import React, { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";

export default function BillPage({ adminUid, billStudentId, billDate, setActivePage }) {

  const [student, setStudent] = useState(null);
  const [payment, setPayment] = useState(null);
  const [allPayments, setAllPayments] = useState([]);

  useEffect(() => {
    const load = async () => {

      // Load student
      const stuSnap = await getDoc(
        doc(db, "users", adminUid, "students", billStudentId)
      );
      setStudent({ id: billStudentId, ...stuSnap.data() });

      // Load all payments of this student
      const q = query(
        collection(db, "users", adminUid, "Account", "accounts", "Income"),
        where("studentId", "==", billStudentId)
      );

      const snap = await getDocs(q);
      const list = [];
      snap.forEach(d => list.push(d.data()));
      setAllPayments(list);

      // current receipt
      const today = list.find(p => p.date === billDate);
      setPayment(today);
    };

    if (adminUid && billStudentId && billDate) load();
  }, [adminUid, billStudentId, billDate]);
  

  if (!student || !payment) return <div>Loading...</div>;

  /* ---------------- CORRECT CALCULATION ---------------- */

  // first admission payment
  const firstPayment = allPayments.find(p => p.paymentStage === "Admission");

  const first = allPayments.find(p => p.totalFees);

const total = first?.totalFees || 0;
const discount = first?.discountApplied || 0;
const payable = total - discount;

const paid = allPayments.reduce(
  (t, p) => t + (p.paidAmount || 0),
  0
);

const balance = payable - paid;


  /* ---------------------------------------------------- */

  return (
    <div className="bill-page">
      <span
        style={{ color: "#2140df", cursor: "pointer", fontWeight: 600 }}
        onClick={() => setActivePage("accounts")}
      >
        ← Back
      </span>

      <div className="bill-card invoice">

        <div className="invoice-header">
          <h1>{localStorage.getItem("schoolName") || "RRR School"}</h1>
          <p>Fee Receipt</p>
        </div>

        <hr />

        <div className="invoice-row">
          <div>
            <b>Student:</b> {student.studentName}<br />
            <b>Class:</b> {student.class}<br />
            <b>Parent:</b> {student.parentName}
          </div>

       

          <div style={{ textAlign: "right" }}>
            <b>Date:</b> {billDate}<br />
            <b>Receipt No:</b> {billStudentId.slice(0, 6).toUpperCase()}
          </div>
        </div>

        <hr />

        <table className="invoice-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Stage</th>
              <th>Paid</th>
              <th>Discount</th>
              <th>Balance After</th>
            </tr>
          </thead>

          <tbody>
            {allPayments
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((p, i) => (
                <tr key={i} style={{ background: p.date === billDate ? "#e8f0ff" : "" }}>
                  <td>{p.date}</td>
                  <td>{p.paymentStage || "Fee"}</td>
                  <td>₹{p.paidAmount}</td>
                  <td>₹{p.discountApplied || 0}</td>
                  <td>₹{p.balanceAfter ?? ""}</td>
                </tr>
              ))}
          </tbody>
        </table>

        <hr />

        <div className="invoice-summary">
          <div><b>Payment Type:</b> {payment.paymentType || payment.type}</div>
          <div><b>Payment Stage:</b> {payment.paymentStage}</div>
          <div className="invoice-amount">
            Amount Received Today: ₹{payment.paidAmount}
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
