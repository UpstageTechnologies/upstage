import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query
} from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";

export default function FeesPage({ adminUid }) {
  const [masterList, setMasterList] = useState([]);
  const [incomeList, setIncomeList] = useState([]);

  // ---- STUDENTS ----
  const [students, setStudents] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [parentName, setParentName] = useState("");
  const [studentClass, setStudentClass] = useState("");

  // ---- FEES MASTER ----
  const [className, setClassName] = useState("");
  const [feeName, setFeeName] = useState("");
  const [amount, setAmount] = useState("");
  const [mdate, setMdate] = useState("");

  // ---- COLLECT FEES ----
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedFee, setSelectedFee] = useState("");
  const [cdate, setCdate] = useState("");

  // PAYMENT
  const [totalFees, setTotalFees] = useState(0);
  const [paymentType, setPaymentType] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [topTab, setTopTab] = useState("summary");


  // ---- TOGGLE DETAILS ----
  const [showDetails, setShowDetails] = useState(false);

  const feesMasterRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "FeesMaster"
  );

  const incomesRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Income"
  );

  const studentsRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Students"
  );

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!adminUid) return;

    onSnapshot(
      query(feesMasterRef, orderBy("date", "desc")),
      (s) => setMasterList(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    onSnapshot(
      query(incomesRef, orderBy("date", "desc")),
      (s) => setIncomeList(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    onSnapshot(studentsRef, (s) =>
      setStudents(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, [adminUid]);

  /* ================= SAVE MASTER ================= */
  const addMaster = async () => {
    if (!className || !feeName || !amount || !mdate)
      return alert("Fill all fields");

    await addDoc(feesMasterRef, {
      className,
      name: feeName,
      amount: Number(amount),
      date: mdate,
      createdAt: new Date()
    });

    setClassName("");
    setFeeName("");
    setAmount("");
    setMdate("");
  };

  /* ================= CREATE STUDENT ================= */
  const addStudent = async () => {
    if (!studentName || !parentName || !studentClass)
      return alert("Fill all student fields");

    await addDoc(studentsRef, {
      name: studentName,
      parentName,
      className: studentClass,
      createdAt: new Date()
    });

    setStudentName("");
    setParentName("");
    setStudentClass("");
  };

  /* ================= HANDLE STUDENT SELECT ================= */
  const handleStudentSelect = (e) => {
    const sid = e.target.value;
    setSelectedStudent(sid);

    const stu = students.find((s) => s.id === sid);
    if (!stu) return;

    const classFees = masterList.filter(
      (f) => f.className === stu.className
    );

    const total = classFees.reduce((a, b) => a + b.amount, 0);

    setTotalFees(total);
    setPaymentType("");
    setPayAmount("");
  };

  /* ================= COLLECT FEES ================= */
  const collectFees = async () => {
    const st = students.find((s) => s.id === selectedStudent);
    if (!st || !paymentType || !cdate)
      return alert("Fill all fields");

    let finalAmount = 0;

    if (paymentType === "full") {
      finalAmount = totalFees - totalFees * 0.05;
    } else {
      if (!payAmount) return alert("Enter partial amount");
      finalAmount = Number(payAmount);
    }

    await addDoc(incomesRef, {
      studentId: st.id,
      studentName: st.name,
      className: st.className,
      type: paymentType,
      totalFees,
      paidAmount: finalAmount,
      date: cdate,
      createdAt: new Date()
    });

    alert("Payment Recorded 👍");

    setSelectedStudent("");
    setPaymentType("");
    setPayAmount("");
    setCdate("");
    setTotalFees(0);
  };

  /* ================= CLASS SUMMARY ================= */
  const classSummary = masterList.reduce((acc, fee) => {
    if (!acc[fee.className]) {
      acc[fee.className] = {
        className: fee.className,
        fees: [],
        total: 0,
        date: fee.date
      };
    }

    acc[fee.className].fees.push({
      name: fee.name,
      amount: fee.amount
    });

    acc[fee.className].total += fee.amount;
    return acc;
  }, {});

  return (
    <div className="accounts-wrapper fade-in">
      <h2 className="page-title">Fees Management</h2>

      {/* SWITCH */}
      <div
        className="section-card pop"
        style={{ display: "flex", gap: 12, justifyContent: "center" }}
      >
        <button
          className={`primary-btn ${!showDetails && "glow"}`}
          onClick={() => setShowDetails(false)}
        >
          Forms
        </button>

        <button
          className={`primary-btn ${showDetails && "glow"}`}
          onClick={() => setShowDetails(true)}
        >
          Top Details
        </button>
      </div>

      {/* ========= FORMS ========= */}
      {!showDetails && (
        <>
          {/* ===== SET FEES ===== */}
          <div className="section-card pop">
            <div className="section-title">Set Fees</div>

            <div className="form-grid">
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              >
                <option value="">Class</option>
                {[
                  "PreKG",
                  "LKG",
                  "UKG",
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "10",
                  "11",
                  "12"
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <input
                placeholder="Fee Name"
                value={feeName}
                onChange={(e) => setFeeName(e.target.value)}
              />

              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <input
                type="date"
                value={mdate}
                onChange={(e) => setMdate(e.target.value)}
              />
            </div>

            <button className="primary-btn glow" onClick={addMaster}>
              Save Fee
            </button>
          </div>

          {/* ===== CREATE STUDENT ===== */}
          <div className="section-card pop">
            <div className="section-title">Create Student</div>

            <div className="form-grid">
              <input
                placeholder="Student Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />

              <input
                placeholder="Parent Name"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
              />

              <select
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
              >
                <option value="">Class</option>
                {[
                  "PreKG",
                  "LKG",
                  "UKG",
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "10",
                  "11",
                  "12"
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <button className="primary-btn glow" onClick={addStudent}>
                Create Student
              </button>
            </div>
          </div>

          {/* ===== COLLECT FEES ===== */}
          <div className="section-card pop">
            <div className="section-title">Collect Fees</div>

            <div className="form-grid">
              <select
                value={selectedStudent}
                onChange={handleStudentSelect}
              >
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.className}
                  </option>
                ))}
              </select>

              <input
                readOnly
                value={totalFees ? `Total Fees ₹${totalFees}` : ""}
                placeholder="Total Fees"
              />

              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
              >
                <option value="">Choose Payment Type</option>
                <option value="full">Full Payment (5% OFF)</option>
                <option value="partial">Partial Payment</option>
              </select>

              {paymentType === "full" && (
                <input
                  readOnly
                  value={`Payable ₹${(
                    totalFees - totalFees * 0.05
                  ).toFixed(0)}`}
                />
              )}

              {paymentType === "partial" && (
                <input
                  type="number"
                  placeholder="Enter Amount"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              )}

              <input
                type="date"
                value={cdate}
                onChange={(e) => setCdate(e.target.value)}
              />

              <button className="primary-btn glow" onClick={collectFees}>
                Collect
              </button>
            </div>
          </div>
        </>
      )}

      {/* ========= TOP DETAILS ========= */}
      
{showDetails && (
  <>
    {/* inner tabs */}
    <div
      className="section-card pop"
      style={{ display:"flex", gap:10, justifyContent:"center" }}
    >
      <button
        className={`primary-btn ${topTab==="summary" && "glow"}`}
        onClick={()=>setTopTab("summary")}
      >
        Fees Summary
      </button>

      <button
        className={`primary-btn ${topTab==="collected" && "glow"}`}
        onClick={()=>setTopTab("collected")}
      >
        Collected Fees
      </button>
    </div>

    {/* ===== SUMMARY TABLE ===== */}
    {topTab==="summary" && (
      <div className="section-card pop">
        <h3 className="section-title">Class Wise Fees Summary</h3>

        <div className="nice-table-wrapper">
          <table className="nice-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Fee Name</th>
                <th>Amount</th>
                <th>Schedule Date</th>
                <th style={{ textAlign:"right" }}>Total (Class)</th>
              </tr>
            </thead>

            <tbody>
              {Object.values(classSummary).map(cls => (
                <>
                  {cls.fees.map((f,i)=>(
                    <tr key={cls.className+i}>
                      <td>{i===0 && <b>{cls.className}</b>}</td>
                      <td>{f.name}</td>
                      <td>₹{f.amount}</td>
                      <td>{i===0 && cls.date}</td>

                      <td style={{textAlign:"right"}}>
                        {i===cls.fees.length-1 && <b>₹{cls.total}</b>}
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* ===== COLLECTED TABLE ===== */}
    {topTab==="collected" && (
      <div className="section-card pop">
        <h3 className="section-title">Collected Fees</h3>

        <div className="nice-table-wrapper">
          <table className="nice-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Type</th>
                <th>Paid</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {incomeList.map(r=>(
                <tr key={r.id}>
                  <td>{r.studentName}</td>
                  <td>{r.className}</td>
                  <td>{r.type==="full" ? "Full (5% OFF)" : "Partial"}</td>
                  <td>₹{r.paidAmount}</td>
                  <td>{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </>
)}

    </div>
  );
}
