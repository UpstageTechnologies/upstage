import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";

export default function FeesPage({ adminUid, mode, setActivePage }) {


  const [incomeList, setIncomeList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);
  const [showReport, setShowReport] = useState(false);
const [reportType, setReportType] = useState("month"); 
const [filteredReport, setFilteredReport] = useState([]);


const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");



const generateReport = () => {
  let data = mode === "income" ? incomeList : expenseList;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  if (reportType === "day") {
    data = data.filter(d => d.date === todayStr);
  }

  if (reportType === "month") {
    const month = todayStr.slice(0, 7); // yyyy-mm
    data = data.filter(d => d.date.startsWith(month));
  }

  if (reportType === "year") {
    const year = todayStr.slice(0, 4); // yyyy
    data = data.filter(d => d.date.startsWith(year));
  }

  if (reportType === "custom") {
    data = data.filter(d => d.date >= fromDate && d.date <= toDate);
  }

  setFilteredReport(data);
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

  useEffect(() => {
    if (!adminUid) return;

    let unsub = () => {};

    if (mode === "income") {
      unsub = onSnapshot(incomeRef, snap => {
        setIncomeList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }

    if (mode === "expenses") {
      unsub = onSnapshot(expenseRef, snap => {
        setExpenseList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }

    return () => unsub();
  }, [adminUid, mode]);

  return (
    <div className="accounts-wrapper fade-in">

  <div className="table-header">
  <span
        style={{ color: "#2140df", cursor: "pointer", fontWeight: 600 }}
        onClick={() => setActivePage("accounts")}
      >
        ← Back
      </span>
  

  
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

    <button onClick={generateReport} style={{marginLeft:12}}>Generate</button>
    <button onClick={()=>{setShowReport(false);setFilteredReport([]); }} style={{marginLeft:12}}>Close</button>
    <button onClick={() => window.print()} style={{marginLeft:12,margin:10}}>
      🖨 Print
    </button>

  </div>
)}
{filteredReport.length > 0 && (
  <div className="section-card pop report-print-area">
    <h3>📄 Report Result</h3>
    

    <table className="nice-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {filteredReport.map(r => (
          <tr key={r.id}>
            <td>{r.date}</td>
            <td>{r.studentName || r.name}</td>
            <td>₹{r.paidAmount || r.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>



  </div>
)}




      <h2 className="page-title">
        {mode === "income" ? "Income Details" : "Expenses Details"}
      </h2>

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
            <button style={{marginLeft:"30%"}}
    className="report-btn"
    onClick={() => {setShowReport(true);setFilteredReport([]);}}
    
  >
    📄 Report
  </button>
          </div>

          {/* 🆕 NEW ADMISSION */}
          {incomeTab === "new" && (
            <div className="section-card pop">
              <h3 className="section-title">New Admission Payments</h3>

              <div className="nice-table-wrapper">
                <table className="nice-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Parent</th>
                      <th>Class</th>
                      <th>Paid</th>
                      <th>Type</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeList
                      .filter(i => i.studentId && i.isNew !== false)
                      .map(i => (
                        <tr key={i.id}>
                          <td>{i.studentName}</td>
                          <td>{i.parentName}</td>
                          <td>{i.className}</td>
                          <td>₹{i.paidAmount}</td>
                          <td>{i.type}</td>
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
                      .filter(i => i.studentId && i.isNew === false)
                      .map(i => (
                        <tr key={i.id}>
                          <td>{i.studentName}</td>
                          <td>{i.className}</td>
                          <td>₹{i.paidAmount}</td>
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
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeList
                      .filter(i => i.type === "full")
                      .map(i => (
                        <tr key={i.id}>
                          <td>{i.studentName}</td>
                          <td>{i.className}</td>
                          <td>₹{i.paidAmount}</td>
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
                      .filter(i => i.type === "partial")
                      .map(i => (
                        <tr key={i.id}>
                          <td>{i.studentName}</td>
                          <td>{i.className}</td>
                          <td>₹{i.paidAmount}</td>
                          <td>
                            ₹{(i.totalFees || 0) - (i.paidAmount || 0)}
                          </td>
                          <td>{i.date}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
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
                    <td>{e.type}</td>
                    <td>{e.name}</td>
                    <td>₹{e.amount}</td>
                    <td>{e.date}</td>
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
