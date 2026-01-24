import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";

export default function FeesPage({ adminUid, mode, setActivePage }) {


  const [incomeList, setIncomeList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);
  const [showReport, setShowReport] = useState(false);
const [reportType, setReportType] = useState("month"); 
const [printMode, setPrintMode] = useState(false);
const [reportData, setReportData] = useState([]);


const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
const [showTermDropdown, setShowTermDropdown] = useState(false);

const [showPendingPopup, setShowPendingPopup] = useState(false);
const [pendingClass, setPendingClass] = useState("");
const [pendingFee, setPendingFee] = useState(null);

const [feesMaster, setFeesMaster] = useState([]);
const [students, setStudents] = useState([]);
const [showGeneratedReport, setShowGeneratedReport] = useState(false);
const [reportFilter, setReportFilter] = useState("all"); 
// all | full | partial | term1 | term2 | term3 | pending

const [reportPendingClass, setReportPendingClass] = useState("");
const [reportPendingFee, setReportPendingFee] = useState(null);

const normalizePaymentType = (i) => {
  if (!i.paymentType) return "";

  return i.paymentType
    .toLowerCase()
    .replace(/\s+/g, "");
};


const generateReport = () => {
  let data = filterIncomeByDate().map(i => ({
    ...i,
    paymentType: normalizePaymentType(i)
  }));

  if (reportFilter === "new") {
    data = data.filter(i => i.isNew === true);
  }
  else if (reportFilter !== "all" && reportFilter !== "pending") {
    data = data.filter(i => i.paymentType === reportFilter);
  }

  if (reportFilter === "pending") {
    if (!reportPendingClass || !reportPendingFee) {
      alert("Please select class and fees");
      return;
    }

    data = students
      .filter(s => s.class === reportPendingClass)
      .map(s => {
        const balance = getBalance(s.id, reportPendingFee);
        if (balance <= 0) return null;

        return {
          id: s.id,
          studentName: s.studentName,
          className: reportPendingClass,
          balance,
          paidAmount: getPaidAmount(s.id, reportPendingFee.id),
          paymentType: "pending"
        };
      })
      .filter(Boolean);
  }

  setReportData(data);
  setShowGeneratedReport(true);
};





const filterIncomeByDate = () => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  let filtered = [...incomeList];

  if (reportType === "day") {
    filtered = filtered.filter(i => i.date === todayStr);
  }

  if (reportType === "month") {
    const month = todayStr.slice(0, 7);
    filtered = filtered.filter(i => i.date?.startsWith(month));
  }

  if (reportType === "year") {
    const year = todayStr.slice(0, 4);
    filtered = filtered.filter(i => i.date?.startsWith(year));
  }

  if (reportType === "custom") {
    if (!fromDate || !toDate) return [];
    filtered = filtered.filter(
      i => i.date >= fromDate && i.date <= toDate
    );
  }

  return filtered;
};


const applyDateFilter = (list) => {
  if (!printMode) return list;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  if (reportType === "day") {
    return list.filter(i => i.date === todayStr);
  }

  if (reportType === "month") {
    const month = todayStr.slice(0, 7);
    return list.filter(i => i.date?.startsWith(month));
  }

  if (reportType === "year") {
    const year = todayStr.slice(0, 4);
    return list.filter(i => i.date?.startsWith(year));
  }

  if (reportType === "custom") {
    if (!fromDate || !toDate) return list;
    return list.filter(
      i => i.date >= fromDate && i.date <= toDate
    );
  }

  return list;
};




  // 🔥 income sub-tab
  const [incomeTab, setIncomeTab] = useState("new"); 
  // new | old | full | partial

  const incomeRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Income"
  );

  const expenseRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "Expenses"
  );
  const feesRef = collection(
    db,
    "users",
    adminUid,
    "Account",
    "accounts",
    "FeesMaster"
  );
  
  const studentsRef = collection(
    db,
    "users",
    adminUid,
    "students"
  );
  

  useEffect(() => {
    if (!adminUid) return;
  
    let unsubIncome = () => {};
    let unsubExpense = () => {};
    let unsubFees = () => {};
    let unsubStudents = () => {};
  
    if (mode === "income") {
      unsubIncome = onSnapshot(incomeRef, snap => {
        setIncomeList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }
  
    if (mode === "expenses") {
      unsubExpense = onSnapshot(expenseRef, snap => {
        setExpenseList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }
  
    unsubFees = onSnapshot(feesRef, snap => {
      setFeesMaster(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  
    unsubStudents = onSnapshot(studentsRef, snap => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  
    return () => {
      unsubIncome();
      unsubExpense();
      unsubFees();
      unsubStudents();
    };
  }, [adminUid, mode]);
  
  const isPrintActive = (tab) => incomeTab === tab;

  // how much already paid for this fee
const getFeePaid = (studentId, feeId) =>
incomeList
  .filter(i => i.studentId === studentId && i.feeId === feeId)
  .reduce((t, i) => t + Number(i.paidAmount || 0), 0);

// balance using payableAmount (after discount)
const getFeeBalance = (studentId, fee) => {
const payments = incomeList.filter(
  i => i.studentId === studentId && i.feeId === fee
);

if (!payments.length) return 0;

const payable = payments[0].payableAmount || payments[0].totalFees || 0;
const paid = getFeePaid(studentId, fee);

return Math.max(0, payable - paid);
};
const getPaidAmount = (studentId, feeId) =>
  incomeList
    .filter(i => i.studentId === studentId && i.feeId === feeId)
    .reduce((t, i) => t + Number(i.paidAmount || 0), 0);

const getBalance = (studentId, fee) => {
  const payments = incomeList.filter(
    i => i.studentId === studentId && i.feeId === fee.id
  );

  if (!payments.length) return fee.amount;

  const admission = payments.find(p => p.paymentStage === "Admission");
  const payable = admission?.payableAmount || fee.amount;

  const paid = getPaidAmount(studentId, fee.id);
  return Math.max(0, payable - paid);
};



  return (
    <div className="accounts-wrapper fade-in">

  <div className="table-header">
  <span
        style={{ color: "#2140df", cursor: "pointer", fontWeight: 600 }}
        onClick={() => setActivePage("accounts")}
      >
        ← Back
      </span>
      <button style={{marginLeft:"30%"}}
    className="report-btn"
    onClick={() => setShowReport(true)}
    
  >
    📄 Report
  </button>
  

  
</div>
{showReport && (
  <div className="report-box">
    <h3>{mode === "income" ? "Income Report" : "Expense Report"}</h3>
    

    <select
      value={reportType}
      onChange={e => setReportType(e.target.value)}
    >
      <option value="year">Yearly</option>
      <option value="month">Monthly</option>
      <option value="day">Daily</option>
      <option value="custom">Custom</option>
    </select>

    {reportType === "custom" && (
      <>
        <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} />
        <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} />
      </>
    )}
    <select
  value={reportFilter}
  onChange={(e) => {
    setReportFilter(e.target.value);

    if (e.target.value === "pending") {
      setShowPendingPopup(true); // same popup
    }
  }}
>
  <option value="all">All</option>
  <option value="new">New Admission</option>
  <option value="full">Full Payment</option>
  <option value="partial">Partial Payment</option>
  <option value="term1">Term 1</option>
  <option value="term2">Term 2</option>
  <option value="term3">Term 3</option>
  <option value="pending">Pending Payment</option>
</select>


    <button onClick={generateReport} style={{marginLeft:12}}>Generate</button>
    <button onClick={() => {
  setShowReport(false);
  setShowGeneratedReport(false);
  setReportData([]);
}}>
  Close
</button>


    <button   onClick={() => {
    window.print();
    setPrintMode(false);
  }} style={{marginLeft:12,margin:10}}>
      🖨 Print
    </button>

  </div>
)}



      <h2 className="page-title">
        {mode === "income" ? "Income Details" : "Expenses Details"}
      </h2>
      {showGeneratedReport && (
  <div className="section-card pop print-area">
    <h3 className="section-title">
      Income Report – {reportFilter.toUpperCase()}
    </h3>

    <table className="nice-table">
  <thead>
    <tr>
      <th>Student</th>
      <th>Class</th>
      <th>Payment Type</th>
      <th>Paid</th>
      <th>Balance</th>
      <th>Date</th>
    </tr>
  </thead>

  <tbody>
    {reportData.length === 0 ? (
      <tr>
        <td colSpan="6" style={{ textAlign: "center" }}>
          No data found
        </td>
      </tr>
    ) : (
      reportData.map(i => {
        const balance =
          i.paymentType === "pending"
            ? i.balance
            : getFeeBalance(i.studentId, i.feeId);

        return (
          <tr key={i.id}>
            <td data-label="Student">{i.studentName}</td>
            <td data-label="Class">{i.className}</td>

            <td
              data-label="Payment Type"
              style={{ textTransform: "capitalize" }}
            >
              {i.paymentType}
            </td>

            <td data-label="Paid">₹{i.paidAmount || 0}</td>

            <td
              data-label="Balance"
              style={{ color: balance > 0 ? "red" : "green" }}
            >
              ₹{balance}
            </td>

            <td data-label="Date">{i.date || "-"}</td>
          </tr>
        );
      })
    )}
  </tbody>
</table>

  </div>
)}



      {/* ================= INCOME ================= */}
      {mode === "income" && (
        <>
          {/* 🔘 INCOME BUTTONS */}
         <div className="tab-buttons">

  <button
    className={incomeTab === "new" ? "tab-btn active" : "tab-btn"}
    onClick={() => setIncomeTab("new")}
  >
    New Admission
  </button>

  <button
    className={incomeTab === "old" ? "tab-btn active" : "tab-btn"}
    onClick={() => setIncomeTab("old")}
  >
    Old Admission
  </button>

  <button
    className={incomeTab === "full" ? "tab-btn active" : "tab-btn"}
    onClick={() => setIncomeTab("full")}
  >
    Full Payment
  </button>

  <button
    className={incomeTab === "partial" ? "tab-btn active" : "tab-btn"}
    onClick={() => setIncomeTab("partial")}
  >
    Partial Payment
  </button>

  {/* 🔽 TERMS DROPDOWN */}
  <div className="term-dropdown-wrapper">
    <button
      className={`tab-btn ${
        incomeTab.startsWith("term") ? "active" : ""
      }`}
      onClick={() => setShowTermDropdown(!showTermDropdown)}
    >
      Terms ▾
    </button>

    {showTermDropdown && (
      <div className="term-dropdown">
        <div onClick={() => { setIncomeTab("term1"); setShowTermDropdown(false); }}>
          Term 1
        </div>
        <div onClick={() => { setIncomeTab("term2"); setShowTermDropdown(false); }}>
          Term 2
        </div>
        <div onClick={() => { setIncomeTab("term3"); setShowTermDropdown(false); }}>
          Term 3
        </div>
      </div>
    )}
  </div>
  <button
  className={incomeTab === "pending" ? "tab-btn active" : "tab-btn"}
  onClick={() => {
    setIncomeTab("pending");
    setShowPendingPopup(true);
  }}
>
  Pending Payment
</button>




</div>
{showPendingPopup && (
  <div className="modal-backdrop">
    <div className="modal-box">
      <h3>Pending Payment</h3>

      {/* Class */}
      <select
        value={pendingClass}
        onChange={e => {
          setPendingClass(e.target.value);
          setPendingFee(null);
        }}
      >
        <option value="">Select Class</option>
        {["PreKG","LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"]
          .map(c => (
            <option key={c} value={c}>Class {c}</option>
        ))}
      </select>

      {/* Fees */}
      <select
        value={pendingFee?.id || ""}
        disabled={!pendingClass}
        onChange={e => {
          const fee = feesMaster.find(f => f.id === e.target.value);
          setPendingFee(fee);
        }}
      >
        <option value="">Select Fees</option>
        {feesMaster
          .filter(f => f.type === "fees" && f.className === pendingClass)
          .map(f => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
        ))}
      </select>

      <div style={{ marginTop: 12 }}>
      <button
  onClick={() => {
    if (!pendingClass || !pendingFee) return;

    // 🔥 REPORT pending values set pannrom
    setReportPendingClass(pendingClass);
    setReportPendingFee(pendingFee);

    setShowPendingPopup(false);
  }}
>
  OK
</button>


        <button onClick={() => setShowPendingPopup(false)}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
{incomeTab === "pending" && pendingClass && pendingFee && (
  <div className="section-card pop ">
    <h3 className="section-title">
      Pending Balance – Class {pendingClass}
    </h3>

    <p>
      Fees: <b>{pendingFee.name}</b>
    </p>

    <table className="nice-table">
      <thead>
        <tr>
          <th>Student</th>
          <th>Paid</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
        {students
          .filter(s => s.class === pendingClass)
          .map(s => {
            const balance = getBalance(s.id, pendingFee);
            if (balance <= 0) return null;

            return (
              <tr key={s.id}>
                <td data-label="Student Name">{s.studentName}</td>
                <td data-label="Paid">₹{getPaidAmount(s.id, pendingFee.id)}</td>
                <td data-label="Balance"style={{ color: "red" }}>₹{balance}</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  </div>
)}



          {/* 🆕 NEW ADMISSION */}
          {incomeTab === "new" &&  (
  <div className="section-card pop ">

              <h3 className="section-title">New Admission Payments</h3>

              <div className="nice-table-wrapper">
                <table className="nice-table">
                  <thead>
                    <tr>
                      <th >Student</th>
                      <th>Parent</th>
                      <th>Class</th>
                      <th>Paid</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeList
  .filter(i => i.isNew === true)


                      .map(i => (
                        <tr key={i.id}>
                          <td data-label="Student">{i.studentName}</td>
                          <td data-label="Parent">{i.parentName}</td>
                          <td data-label="Class">{i.className}</td>
                          <td data-label="Paid">₹{i.paidAmount}</td>
                          <td>{i.date}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 👨‍🎓 OLD ADMISSION */}
          {incomeTab === "old" && (
  <div className="section-card pop">


              <h3 className="section-title">Old Admission Payments</h3>

              <div className="nice-table-wrapper">
                <table className="nice-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Class</th>
                      <th>Paid</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                  {incomeList
                      .filter(i => i.isNew === false)

                      .map(i => (
                        <tr key={i.id}>
                          <td data-label="Student">{i.studentName}</td>
                          <td data-label="Class">{i.className}</td>
                          <td data-label="Paid">₹{i.paidAmount}</td>
                          <td>{i.date}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ✅ FULL PAYMENT */}
          {incomeTab === "full" && (
  <div className="section-card pop">


              <h3 className="section-title">Full Payment Students</h3>

              <div className="nice-table-wrapper">
                <table className="nice-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Class</th>
                      <th>Paid</th>
                      <th>Balance</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                  {incomeList
                      .filter(i => i.paymentType === "full")

                      .map(i => (
                        <tr key={i.id}>
                          <td data-label="Student">{i.studentName}</td>
                          <td data-label="Class">{i.className}</td>
                          <td data-label="Paid">₹{i.paidAmount}</td>
                          <td>
                            ₹0
                          </td>
                          <td>{i.date}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 🟡 PARTIAL PAYMENT */}
          {incomeTab === "partial" && (
 <div className="section-card pop">


              <h3 className="section-title">Partial Payment Students</h3>

              <div className="nice-table-wrapper">
                <table className="nice-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Class</th>
                      <th>Paid</th>
                      <th>Balance</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                  {incomeList
                      .filter(i => i.paymentType === "partial")

                      .map(i => (
                        <tr key={i.id}>
                          <td data-label="Student">{i.studentName}</td>
                          <td data-label="Class">{i.className}</td>
                          <td data-label="Paid">₹{i.paidAmount}</td>
                          <td>
                          ₹{getFeeBalance(i.studentId, i.feeId)}

                          </td>
                          <td>{i.date}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
{incomeTab === "term1" && (
  <div className="section-card pop">


    <h3 className="section-title">Term 1 Payments</h3>

    <table className="nice-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Class</th>
          <th>Paid</th>
          <th>Balance</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {applyDateFilter(incomeList)
          .filter(i => i.paymentType === "term1")
          .map(i => (
            <tr key={i.id}>
              <td data-label="Student">{i.studentName}</td>
              <td data-label="Class">{i.className}</td>
              <td data-label="Paid">₹{i.paidAmount}</td>
              <td>₹{getFeeBalance(i.studentId, i.feeId)}</td>

              <td>{i.date}</td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
)}
{incomeTab === "term2" && (
  <div className="section-card pop">


    <h3 className="section-title">Term 1 Payments</h3>

    <table className="nice-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Class</th>
          <th>Paid</th>
          <th>Balance</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
      {incomeList
          .filter(i => i.paymentType === "term2")
          .map(i => (
            <tr key={i.id}>
              <td data-label="Student">{i.studentName}</td>
              <td data-label="Class">{i.className}</td>
              <td data-label="Paid">₹{i.paidAmount}</td>
              <td>₹{getFeeBalance(i.studentId, i.feeId)}</td>

              <td>{i.date}</td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
)}
{incomeTab === "term3" && (
  <div className="section-card pop">


    <h3 className="section-title">Term 1 Payments</h3>

    <table className="nice-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Class</th>
          <th>Paid</th>
          <th>Balance</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
      {incomeList
          .filter(i => i.paymentType === "term3")
          .map(i => (
            <tr key={i.id}>
              <td data-label="Student">{i.studentName}</td>
              <td data-label="Class">{i.className}</td>
              <td data-label="Paid">₹{i.paidAmount}</td>
              <td>₹{getFeeBalance(i.studentId, i.feeId)}</td>

              <td>{i.date}</td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
)}

        </>
      )}

      {/* ================= EXPENSE ================= */}
      {mode === "expenses" && (
        <div className="section-card pop">
          <h3 className="section-title">Expenses Details</h3>

          <div className="nice-table-wrapper">
            <table className="nice-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {expenseList.map(e => (
                  <tr key={e.id}>
                    <td data-label="Type">{e.type}</td>
                    <td data-label="Name">{e.name}</td>
                    <td data-label="Amount">₹{e.amount}</td>
                    <td >{e.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
