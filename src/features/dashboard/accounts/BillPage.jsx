import React, { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";


export default function BillPage({ adminUid, billStudentId, billDate, setActivePage }) {

  const [student, setStudent] = useState(null);
  const [payment, setPayment] = useState(null);
  const [allPayments, setAllPayments] = useState([]);

  const schoolLogo = localStorage.getItem("schoolLogo");

  useEffect(() => {
    const load = async () => {

      const stuSnap = await getDoc(
        doc(db, "users", adminUid, "students", billStudentId)
      );
      if (!stuSnap.exists()) return;
      setStudent({ id: billStudentId, ...stuSnap.data() });
      

      const q = query(
        collection(db, "users", adminUid, "Account", "accounts", "Income"),
        where("studentId", "==", billStudentId)
      );

      const snap = await getDocs(q);
      const list = [];
      snap.forEach(d => list.push(d.data()));
      setAllPayments(list);

      const todayPayments = list.filter(p => p.date === billDate);

      // last saved payment only
      const lastPayment = todayPayments[todayPayments.length - 1];
      
      setPayment(lastPayment);
      
    };

    if (adminUid && billStudentId && billDate) load();
  }, [adminUid, billStudentId, billDate]);

  if (!student || !payment) return <div>Loading...</div>;

  /* 🟢 FEE-WISE TOTAL CALCULATION */

  const feeWise = {};

  allPayments.forEach(p => {
    if (!p.feeId) return;

    if (!feeWise[p.feeId]) {
      feeWise[p.feeId] = {
        name: p.feeName || "Fee",
        total: p.totalFees || 0,
        discount: p.discountApplied || 0,
        paid: 0
      };
    }

    feeWise[p.feeId].paid += Number(p.paidAmount || 0);
  });

  const totalPayable = Object.values(feeWise).reduce(
    (t, f) => t + (f.total - f.discount),
    0
  );

  const totalPaid = Object.values(feeWise).reduce(
    (t, f) => t + f.paid,
    0
  );

  const balance = Math.max(0, totalPayable - totalPaid);

  /* -------------------------------- */
  const formatStage = (p) => {
    const fee = p.feeName || "Fees";
  
    if (!p.paymentType) return fee;
  
    if (p.paymentType.startsWith("term")) {
      const termNo = p.paymentType.replace("term", "");
      return `${fee} - Term ${termNo}`;
    }
  
    if (p.paymentType === "full") {
      return `${fee} - Full Payment`;
    }
  
    if (p.paymentType === "partial") {
      return `${fee} - Partial Payment`;
    }
  
    return `${fee}`;
  };
  const todayTotal = allPayments
  .filter(p => p.date === billDate)
  .reduce((t, p) => t + Number(p.paidAmount || 0), 0);


  return (
    <div className="bill-page">

      <span
        style={{ color: "#2140df", cursor: "pointer", fontWeight: 600 }}
        onClick={() => setActivePage("accounts")}
      >
        ← Back
      </span>

      <div className="bill-card">
  <div className="invoice invoice-responsive">


      <div className="invoice-header" style={{ display: "flex", alignItems: "center", gap: 12 ,alignContent:"center",textAlign:"center",justifyContent:"center"}}>

{schoolLogo ? (
  <img
    src={schoolLogo}
    alt="logo"
    style={{ width: 55, height: 55, objectFit: "contain",marginBottom: 10 }}
  />
) : null}

<div>
  <h1 style={{ margin: 0 }}>
    {localStorage.getItem("schoolName") || "School"}
  </h1>
  <p style={{ margin: 0 }}>Fee Receipt</p>
</div>

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
    .filter(p => p.date)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .map((p, i) => (
      <tr key={i} style={{ background: p.date === billDate ? "#e8f0ff" : "" }}>
        <td data-label="Date">{p.date}</td>
        <td data-label="Stage">{formatStage(p)}</td>
        <td data-label="Paid">₹{p.paidAmount}</td>
        <td data-label="Discount">₹{p.discountApplied || 0}</td>
        <td data-label="Balance">₹{p.balanceAfter ?? ""}</td>
      </tr>
    ))}
</tbody>

        </table>

        <hr />

        <div className="invoice-summary">
          <div><b>Payment Type:</b> {payment.paymentType}</div>
          <div><b>Payment Stage:</b> {payment.feeName }</div>
          <div><b>Total Paid:</b> ₹{totalPaid}</div>
          <div><b>Remaining Balance:</b> ₹{balance}</div>

          <div className="invoice-amount">
          Amount Received Today: ₹{todayTotal}

          </div>
        </div>

        <hr />

        <p style={{ textAlign: "center", fontSize: 14 }}>
          This is a system generated receipt. No signature required.
        </p>

        <div className="invoice-actions">
          <button onClick={() => window.print()}>
            🖨 Print / Save PDF
          </button>
        </div>

      </div>
      </div>
    </div>
  );
}
