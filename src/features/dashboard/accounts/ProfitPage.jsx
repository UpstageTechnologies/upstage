import React, { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";
import "../../dashboard_styles/studentSearch.css";
import { useNavigate } from "react-router-dom";




export default function ProfitPage({ adminUid, setActivePage }) {

  const [incomeList, setIncomeList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);
  

  const [entryType, setEntryType] = useState("");
  const [feesMaster, setFeesMaster] = useState([]);


  const [entryDate, setEntryDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // yyyy-mm-dd
  });
  

  // INCOME
  const [incomeMode, setIncomeMode] = useState("");
  const [studentMode, setStudentMode] = useState("");

  // source
  const [srcName, setSrcName] = useState("");
  const [srcAmt, setSrcAmt] = useState("");

  // students / fees
  const [students, setStudents] = useState([]);
  

  const [newName, setNewName] = useState("");
  const [newParent, setNewParent] = useState("");
  const [newClass, setNewClass] = useState("");
  const [newPayType, setNewPayType] = useState("");
  const [newPayAmount, setNewPayAmount] = useState("");
  const [newTotal, setNewTotal] = useState(0);

  const [oldClass, setOldClass] = useState("");
  const [oldStudent, setOldStudent] = useState("");
  const [oldParent, setOldParent] = useState("");
  const [oldTotal, setOldTotal] = useState(0);
  const [oldPayType, setOldPayType] = useState("");
  const [oldPayAmount, setOldPayAmount] = useState("");

  // EXPENSE
  const [expenseMode, setExpenseMode] = useState("");

  // salary
  const [salaryRole, setSalaryRole] = useState("");          // office | working
  const [salaryPosition, setSalaryPosition] = useState("");  // Principal / Teacher …
  const [selName, setSelName] = useState("");                // typed person name
  const [manualSalary, setManualSalary] = useState("");

  // other expense
  const [exName, setExName] = useState("");
  const [exAmt, setExAmt] = useState("");

  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentName, setSelectedStudentName] = useState("");


  


  
  const incomesRef  = collection(db,"users",adminUid,"Account","accounts","Income");
  const expensesRef = collection(db,"users",adminUid,"Account","accounts","Expenses");
  const studentsRef = collection(db, "users", adminUid, "students");
  const feesRef     = collection(db,"users",adminUid,"Account","accounts","FeesMaster");

  const studentsMainRef = collection(db, "users", adminUid, "students");
const parentsRef = collection(db, "users", adminUid, "parents");




  useEffect(()=>{

    if(!adminUid) return;
  
    onSnapshot(incomesRef, s =>
      setIncomeList(s.docs.map(d=>({id:d.id,...d.data()})))
    );
  
    onSnapshot(expensesRef, s =>
      setExpenseList(s.docs.map(d=>({id:d.id,...d.data()})))
    );
  
    onSnapshot(studentsRef, s =>
      setStudents(s.docs.map(d=>({id:d.id,...d.data()})))
    );
  

    onSnapshot(feesRef, s =>
      setFeesMaster(s.docs.map(d=>({id:d.id,...d.data()})))
    );
  
  },[adminUid]);
  
  const filteredStudents = students.filter(s =>
    String(s.class) === String(oldClass) &&
    s.studentName?.toLowerCase().includes(studentSearch.toLowerCase())
  );
  

  const getClassTotal = cls =>
    feesMaster.filter(f=>f.className===cls).reduce((t,f)=>t+(f.amount||0),0);

  /* ---------- INCOME: SOURCE ---------- */
  const saveSourceIncome = async ()=>{
    if(!srcName||!srcAmt||!entryDate) return alert("Fill all source fields");

    await addDoc(incomesRef,{
      source:true,
      studentName:srcName,
      paidAmount:Number(srcAmt),
      date:entryDate,
      createdAt:new Date()
    });

    setSrcName(""); setSrcAmt("");
  };


/* ---------- INCOME: NEW ADMISSION ---------- */
const saveNewAdmission = async () => {
  if (!newName || !newParent || !newClass || !newPayType || !entryDate)
    return alert("Fill all fields");

  const total = getClassTotal(newClass);

  let final = 0;
  if (newPayType === "full") {
    final = total - total * 0.05;
  } else {
    if (!newPayAmount) return alert("Enter partial amount");
    final = Number(newPayAmount);
  }

/* 1️⃣ CREATE PARENT */
const parentDocRef = await addDoc(
  collection(db, "users", adminUid, "parents"),
  {
    parentName: newParent,
    parentId: `P-${Date.now()}`,
    studentsCount: 1,
    students: [
      {
        studentName: newName,
        studentId: "TEMP",   // replace after student create
        class: newClass,
        section: ""
      }
    ],
    createdAt: new Date()
  }
);


/* 2️⃣ CREATE STUDENT */
const studentDocRef = await addDoc(
  collection(db, "users", adminUid, "students"),
  {
    studentName: newName,
    studentId: `S-${Date.now()}`,
    parentId: parentDocRef.id,
    parentName: newParent,
    class: newClass,
    section: "",
    createdAt: new Date()
  }
);

/* 3️⃣ UPDATE parent.students[] with REAL studentId */
await updateDoc(
  doc(db, "users", adminUid, "parents", parentDocRef.id),
  {
    students: [
      {
        studentId: studentDocRef.id,
        studentName: newName,
        class: newClass,
        section: ""
      }
    ]
  }
);


  /* 3️⃣ ✅ UPDATE PARENT WITH STUDENT LINK (CORRECT WAY) */
  await updateDoc(
    doc(db, "users", adminUid, "parents", parentDocRef.id),
    {
      students: [
        {
          studentDocId: studentDocRef.id,
          studentName: newName,
          class: newClass,
          section: ""
        }
      ]
    }
  );

  /* 4️⃣ CREATE INCOME */
  await addDoc(incomesRef, {
    studentId: studentDocRef.id,
    studentName: newName,
    parentId: parentDocRef.id,
    parentName: newParent,
    className: newClass,
    totalFees: total,
    type: newPayType,
    paidAmount: final,
    date: entryDate,
    createdAt: new Date()
  });

  /* RESET */
  setNewName("");
  setNewParent("");
  setNewClass("");
  setNewPayType("");
  setNewPayAmount("");
  setNewTotal(0);
};

  
  

  /* ---------- INCOME: OLD ADMISSION ---------- */
  const selectOldClass = cls=>{
    setOldClass(cls);
    setOldStudent(""); setOldParent("");
    setOldTotal(getClassTotal(cls));
  };

  const selectOldStudent = id=>{
    setOldStudent(id);
    const s = students.find(x=>x.id===id);
    if(s) setOldParent(s.parentName||"");
  };

  const saveOldAdmission = async ()=>{
    const stu = students.find(s=>s.id===oldStudent);
    if(!stu || !oldPayType || !entryDate) return alert("Fill all fields");
  
    let final = 0;
    if(oldPayType==="full") final = oldTotal - oldTotal * 0.05;
    else{
      if(!oldPayAmount) return alert("Enter partial amount");
      final = Number(oldPayAmount);
    }
  
    await addDoc(incomesRef,{
      studentId: stu.id,
      studentName: stu.studentName,   // ✅ FIX
      parentName: stu.parentName || "",
      className: stu.class,            // ✅ FIX
      totalFees: oldTotal,
      type: oldPayType,
      paidAmount: final,
      date: entryDate,
      createdAt: new Date()
    });
  
    setOldClass("");
    setOldStudent("");
    setOldParent("");
    setOldPayType("");
    setOldPayAmount("");
    setOldTotal(0);
  };
  


  /* ---------- EXPENSE: OTHERS ---------- */
  const navigate = useNavigate();

  const saveExpense = async ()=>{
    if(!exName||!exAmt||!entryDate) return alert("Fill expense");

    await addDoc(expensesRef,{
      type:"other",
      name:exName,
      amount:Number(exAmt),
      date:entryDate,
      createdAt:new Date()
    });

    setExName(""); setExAmt("");
  };

  /* ---------- EXPENSE: SALARY ---------- */
  const saveSalary = async ()=>{
    if(!salaryRole||!salaryPosition||!selName||!manualSalary||!entryDate)
      return alert("Fill all salary fields");

    await addDoc(expensesRef,{
      type:"salary",
      role:salaryRole,
      position:salaryPosition,
      name:selName,
      amount:Number(manualSalary),
      date:entryDate,
      createdAt:new Date()
    });

    setSalaryRole("");setSalaryPosition("");setSelName("");setManualSalary("");
  };

  /* ---------- FEE MASTER ---------- */
  const saveFee = async ()=>{
    if(!feeClass||!feeName||!feeAmount||!entryDate) return alert("Fill fields");

    await addDoc(feesRef,{
      className:feeClass,
      name:feeName,
      amount:Number(feeAmount),
      date:entryDate,
      createdAt:new Date()
    });

   
  };

  const totalIncome = incomeList.reduce((t,x)=>t+(x.paidAmount||0),0);
  const totalExpense= expenseList.reduce((t,x)=>t+(x.amount||0),0);
  const profit = totalIncome-totalExpense;

  return (
    
    <div className="accounts-wrapper fade-in">
      
      <div className="accounts-wrapper fade-in">

  <div className="stats-grid">

    <div className="info-card1">
      <div className="label">Total Income</div>
      <div className="value">₹{totalIncome}</div>
    </div>

    <div className="info-card2">
      <div className="label">Total Expenses</div>
      <div className="value">₹{totalExpense}</div>
    </div>

    <div className="info-card3">
      <div className="label">Profit</div>
      <div
        className="value"
        style={{ color: profit >= 0 ? "green" : "red" }}
      >
        ₹{profit}
      </div>
    </div>

  </div>

</div>



      <div className="section-card pop entries-card">
  <h3 className="section-title">Entries</h3>


        {/* ⭐ GLOBAL DATE */}
        <input
          type="date"
          value={entryDate}
          onChange={e=>setEntryDate(e.target.value)}
          style={{marginBottom:12}}
        />

        <select value={entryType} onChange={e=>setEntryType(e.target.value)}>
          <option value="">Choose</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          
        </select>

       {/* ================= INCOME ================= */}
{entryType === "income" && (
  <>
    {/* 🔹 MODE SELECT (Student / Source + New/Old side by side) */}
    <div className="form-grid two-col" style={{ marginTop: 12 }}>

      <select
        value={incomeMode}
        onChange={e => {
          setIncomeMode(e.target.value);
          setStudentMode("");
        }}
      >
        <option value="">Select</option>
        <option value="source">Source</option>
        <option value="student">Student</option>
      </select>

      {incomeMode === "student" && (
        <select
          value={studentMode}
          onChange={e => setStudentMode(e.target.value)}
        >
          <option value="">Select</option>
          <option value="new">New Admission</option>
          <option value="old">Old Admission</option>
        </select>
      )}

    </div>

    {/* 🔹 SOURCE INCOME */}
    {incomeMode === "source" && (
      <div className="form-grid" style={{ marginTop: 10 }}>
        <input
          placeholder="Source name"
          value={srcName}
          onChange={e => setSrcName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={srcAmt}
          onChange={e => setSrcAmt(e.target.value)}
        />
        <button className="primary-btn glow" onClick={saveSourceIncome}>
          Save
        </button>
      </div>
    )}

    {/* 🔹 NEW ADMISSION */}
    {incomeMode === "student" && studentMode === "new" && (
      <div className="form-grid income-grid">


        <input
          placeholder="Student Name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <input
          placeholder="Parent Name"
          value={newParent}
          onChange={e => setNewParent(e.target.value)}
        />

        <select
          value={newClass}
          onChange={e => {
            setNewClass(e.target.value);
            setNewTotal(getClassTotal(e.target.value));
          }}
        >
          <option value="">Class</option>
          {["PreKG","LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"]
            .map(c => <option key={c}>{c}</option>)}
        </select>

        <input readOnly value={newTotal ? `Total ₹${newTotal}` : ""} />

        <select value={newPayType} onChange={e => setNewPayType(e.target.value)}>
          <option value="">Payment Type</option>
          <option value="full">Full (5% OFF)</option>
          <option value="partial">Partial</option>
        </select>

        {newPayType === "full" && (
          <input
            readOnly
            value={`Payable ₹${(newTotal - newTotal * 0.05).toFixed(0)}`}
          />
        )}

        {newPayType === "partial" && (
          <input
            type="number"
            placeholder="Enter Amount"
            value={newPayAmount}
            onChange={e => setNewPayAmount(e.target.value)}
          />
        )}

        <button className="primary-btn glow" onClick={saveNewAdmission}>
          Save
        </button>
      </div>
    )}

    {/* 🔹 OLD ADMISSION */}
 {/* 🔹 OLD ADMISSION */}
{incomeMode === "student" && studentMode === "old" && (
  <div className="form-grid income-grid">


    {/* CLASS */}
    <select value={oldClass} onChange={e => selectOldClass(e.target.value)}>
      <option value="">Class</option>
      {["PreKG","LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"]
        .map(c => <option key={c}>{c}</option>)}
    </select>

    {/* 🔍 STUDENT SEARCH */}
    <div className="student-search-wrapper">

    <input
  placeholder="Search Student"
  value={studentSearch || selectedStudentName}
  onChange={e => {
    setStudentSearch(e.target.value);
    setSelectedStudentName("");
  }}
  onBlur={() => setTimeout(() => setStudentSearch(""), 150)}
/>


      {studentSearch && (
        <div className="student-search-list">
          {filteredStudents.map(s => (
            <div
              key={s.id}
              className="student-search-item"
              onClick={() => {
                setOldStudent(s.id);
                setSelectedStudentName(s.studentName); // 👈 NOW THIS WILL WORK
                setOldParent(s.parentName || "");
                setStudentSearch("");
              }}
              
              
              
            >
              {s.studentName}
            </div>
          ))}

          {filteredStudents.length === 0 && (
            <div className="student-search-item muted">
              No students found
            </div>
          )}
        </div>
      )}
    </div>

    {/* PARENT + TOTAL */}
    <input readOnly value={oldParent ? `Parent: ${oldParent}` : ""} />
    <input readOnly value={oldTotal ? `Total ₹${oldTotal}` : ""} />

    {/* PAYMENT TYPE */}
    <select value={oldPayType} onChange={e => setOldPayType(e.target.value)}>
      <option value="">Payment Type</option>
      <option value="full">Full (5% OFF)</option>
      <option value="partial">Partial</option>
    </select>

    {oldPayType === "full" && (
      <input
        readOnly
        value={`Payable ₹${(oldTotal - oldTotal * 0.05).toFixed(0)}`}
      />
    )}

    {oldPayType === "partial" && (
      <input
        type="number"
        placeholder="Enter Amount"
        value={oldPayAmount}
        onChange={e => setOldPayAmount(e.target.value)}
      />
    )}

    <button className="primary-btn glow" onClick={saveOldAdmission}>
      Save
    </button>

  </div>
)}

  </>
)}


        {/* ================= EXPENSE ================= */}
        {entryType==="expense" && (
          <>
            <select style={{marginTop:10}} value={expenseMode} onChange={e=>setExpenseMode(e.target.value)}>
              <option value="">Choose Expense</option>
              <option value="salary">Salary</option>
              <option value="others">Others</option>
            </select>

            {/* SALARY */}
            {expenseMode==="salary" && (
              <>
                <select
                  style={{marginTop:10}}
                  value={salaryRole}
                  onChange={e=>{setSalaryRole(e.target.value);setSalaryPosition("");setSelName("");}}
                >
                  <option value="">Select Category</option>
                  <option value="office">Office Staff</option>
                  <option value="working">Working Staff</option>
                </select>

                <div className="form-grid">

                  {/* position dropdown */}
                  <select
                    value={salaryPosition}
                    onChange={e=>setSalaryPosition(e.target.value)}
                  >
                    <option value="">Select Position</option>

                    {salaryRole==="office" && (
                      <>
                        <option value="Principal">Principal</option>
                        <option value="Clerk">Clerk</option>
                        <option value="Accountant">Accountant</option>
                        <option value="Receptionist">Receptionist</option>
                        <option value="Office Assistant">Office Assistant</option>
                      </>
                    )}

                    {salaryRole==="working" && (
                      <>
                        <option value="Teacher">Teacher</option>
                        <option value="Driver">Driver</option>
                        <option value="Cleaner">Cleaner</option>
                        <option value="Watchman">Watchman</option>
                        <option value="Helper">Helper</option>
                      </>
                    )}
                  </select>

                  {/* name typing */}
                  <input
                    placeholder="Person Name"
                    value={selName}
                    onChange={e=>setSelName(e.target.value)}
                  />

                  <input
                    type="number"
                    placeholder="Salary"
                    value={manualSalary}
                    onChange={e=>setManualSalary(e.target.value)}
                  />

                  <button className="primary-btn glow" onClick={saveSalary}>Save Salary</button>
                </div>
              </>
            )}

            {/* OTHERS */}
            {expenseMode==="others" && (
              <div className="form-grid">
                <input placeholder="Expense name" value={exName} onChange={e=>setExName(e.target.value)} />
                <input type="number" placeholder="Amount" value={exAmt} onChange={e=>setExAmt(e.target.value)} />
                <button className="primary-btn glow" onClick={saveExpense}>Save Expense</button>
              </div>
            )}
          </>
        )}

        {/* SET FEES */}
        {entryType==="fees" && (
          <div className="form-grid">
            <select value={feeClass} onChange={e=>setFeeClass(e.target.value)}>
              <option value="">Class</option>
              {["PreKG","LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"]
                .map(c=><option key={c}>{c}</option>)}
            </select>

            <input placeholder="Fee Name" value={feeName} onChange={e=>setFeeName(e.target.value)} />
            <input type="number" placeholder="Amount" value={feeAmount} onChange={e=>setFeeAmount(e.target.value)} />
            <button className="primary-btn glow" onClick={saveFee}>Save Fee</button>
          </div>
        )} 

      </div>

        <div className="nice-table-wrapper">
          <table className="nice-table1">
          <thead>
  <tr>
    <th>Discription</th>
    <th>Income</th>
    <th>Expense</th>
  </tr>
</thead>

<tbody>
  {(() => {
    const all = [
      ...incomeList.map(i => ({
        id: i.id,
        date: i.date,
        source: i.studentName || i.name || "Income",
        income: i.paidAmount || 0,
        expense: 0
      })),
    
      ...expenseList.map(e => ({
        id: e.id,
        date: e.date,
        source: e.name,
        income: 0,
        expense: e.amount || 0
      }))
    ];
    
    // sort by date (latest first)
    all.sort((a, b) => (a.date > b.date ? -1 : 1));
    
    let lastDate = null;
    let dateIncomeTotal = 0;
    let dateExpenseTotal = 0;

    return all.map((row, index) => {
      const nextRow = all[index + 1];
      const isLastOfDate = !nextRow || nextRow.date !== row.date;

      // totals add
      dateIncomeTotal += row.income;
      dateExpenseTotal += row.expense;

      return (
        <React.Fragment key={row.id}>

          {/* DATE */}
          {lastDate !== row.date && (
            <tr className="date-heading">
              <td colSpan={3} style={{ fontWeight: "bold", background: "#f3f3f3" }}>
                {lastDate = row.date}
              </td>
            </tr>
          )}

          {/* DATA ROW */}
          <tr>
            <td>{row.source}</td>

            <td style={{ color: "green" }}>
              {row.income ? `₹${row.income}` : ""}
            </td>

            <td style={{ color: "red" }}>
              {row.expense ? `₹${row.expense}` : ""}
            </td>
          </tr>

          {/* TOTAL ROW */}
          {isLastOfDate && (
            <tr style={{ fontWeight: "bold", background: "#fafafa" }}>
              <td>TOTAL</td>
              <td style={{ color: "green" }}>₹{dateIncomeTotal}</td>
              <td style={{ color: "red" }}>₹{dateExpenseTotal}</td>
            </tr>
          )}

          {/* RESET */}
          {isLastOfDate && (() => {
            dateIncomeTotal = 0;
            dateExpenseTotal = 0;
          })()}

        </React.Fragment>
      );
    });
  })()}
</tbody>


          </table>
        </div>
      </div>
  );
}
