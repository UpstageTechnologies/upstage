import React, { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, updateDoc, doc } from "firebase/firestore";
  import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";
import "../../dashboard_styles/studentSearch.css";
import { useNavigate } from "react-router-dom";
import OfficeStaff from "../OfficeStaff";
import BillPage from "./BillPage";   
import "../../dashboard_styles/IE.css";






export default function ProfitPage({ adminUid, setActivePage, activePage = "",plan, showUpgrade }) {


  const role = localStorage.getItem("role");
const isOfficeStaff = role === "office_staff";


  const [incomeList, setIncomeList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);
  const [incomeLoaded, setIncomeLoaded] = useState(false);
const [expenseLoaded, setExpenseLoaded] = useState(false);
const [showStudentDropdown, setShowStudentDropdown] = useState(false);
const [showClassDropdown, setShowClassDropdown] = useState(false);
const [showExpenseType, setShowExpenseType] = useState(false);
const [showSalaryRole, setShowSalaryRole] = useState(false);
const [showSalaryPosition, setShowSalaryPosition] = useState(false);
// salary
const [salaryRole, setSalaryRole] = useState("");          
const [salaryPosition, setSalaryPosition] = useState("");


// ===== Searchable dropdown =====
const categories = ["Office Staff", "Working Staff"];

const positions = {
  "Office Staff": ["Principal","Clerk","Accountant","Receptionist","Office Assistant"],
  "Working Staff": ["Teacher","Driver","Cleaner","Watchman","Helper"]
};

const [categorySearch, setCategorySearch] = useState("");
const [positionSearch, setPositionSearch] = useState("");

const filteredCategories = categories.filter(c =>
  c.toLowerCase().includes(categorySearch.toLowerCase())
);

const filteredPositions = (positions[salaryRole] || []).filter(p =>
  p.toLowerCase().includes(positionSearch.toLowerCase())
);



const [newStudentSearch, setNewStudentSearch] = useState("");
const [showNewStudentDropdown, setShowNewStudentDropdown] = useState(false);
const [selectedNewStudent, setSelectedNewStudent] = useState(null);
const [showSalaryCategory, setShowSalaryCategory] = useState(false);
const [showSalaryPositionDD, setShowSalaryPositionDD] = useState(false);


const [teachers, setTeachers] = useState([]);
const [teacherSearch, setTeacherSearch] = useState("");
const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);

useEffect(() => {
  if (!adminUid) return;

  const teachersRef = collection(db, "users", adminUid, "teachers");

  const unsub = onSnapshot(teachersRef, snap => {
    setTeachers(
      snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
    );
  });

  return () => unsub();   // 🔥 very important
}, [adminUid]);





const [showStudentType, setShowStudentType] = useState(false);







const loaded = incomeLoaded && expenseLoaded;


  

  const [entryType, setEntryType] = useState("");
  const [feesMaster, setFeesMaster] = useState([]);
  const [showIncomeType, setShowIncomeType] = useState(false);
const [incomeType, setIncomeType] = useState("");



  const [entryDate, setEntryDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // yyyy-mm-dd
  });
  

  // INCOME
  const [incomeMode, setIncomeMode] = useState("");
  const [studentMode, setStudentMode] = useState("");

  const [showEntryType, setShowEntryType] = useState(false);

  


  // source
  const [srcName, setSrcName] = useState("");
  const [srcAmt, setSrcAmt] = useState("");

  // students / fees
  const [students, setStudents] = useState([]);

  
  

  const [newName, setNewName] = useState("");
  const [newParent, setNewParent] = useState("");
  const [newClass, setNewClass] = useState("");
  const [newPayType, setNewPayType] = useState("");

  // ================= DERIVED VALUES =================





  const [newPayAmount, setNewPayAmount] = useState("");
  const [newTotal, setNewTotal] = useState(0);

  const newAdmissionStudents = students.filter(s => {
    const paid = incomeList.some(i =>
      i.studentId === s.id && i.paymentStage === "Admission"
    );
  
    return (
      !paid &&
      s.studentName?.toLowerCase().includes(newStudentSearch.toLowerCase())
    );
  });



  const isFullPayment = newPayType === "full";

  const discount = isFullPayment ? newTotal * 0.05 : 0;
  


  const [oldClass, setOldClass] = useState("");
  const [oldStudent, setOldStudent] = useState("");
  const [oldParent, setOldParent] = useState("");
  const [oldTotal, setOldTotal] = useState(0);
  const [oldPayType, setOldPayType] = useState("");
  const [oldPayAmount, setOldPayAmount] = useState("");
  const paymentTypes = ["Full", "Partial", "Term 1", "Term 2", "Term 3"];

const [paymentType, setPaymentType] = useState("");
const [paymentSearch, setPaymentSearch] = useState("");
const [showPaymentDD, setShowPaymentDD] = useState(false);

const filteredPaymentTypes = paymentTypes.filter(p =>
  p.toLowerCase().includes(paymentSearch.toLowerCase())
);


  // EXPENSE
  const [expenseMode, setExpenseMode] = useState("");

  
  const [selName, setSelName] = useState("");                // typed person name
  const [manualSalary, setManualSalary] = useState("");

  // other expense
  const [exName, setExName] = useState("");
  const [exAmt, setExAmt] = useState("");

  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentName, setSelectedStudentName] = useState("");

  const allDates = [
    ...new Set([
      ...incomeList.map(i => i.date),
      ...expenseList.map(e => e.date)
    ])
  ].sort();   // ascending order
  
  const getClassTotal = (cls) =>
  feesMaster.filter(f => f.className === cls)
    .reduce((t, f) => t + (f.amount || 0), 0);

const getStudentPaid = (studentId) =>
  incomeList
    .filter(i => i.studentId === studentId)
    .reduce((t, i) => t + (i.paidAmount || 0), 0);

const getStudentBalance = (studentId, className) => {
  const total = getClassTotal(className);
  const paid = getStudentPaid(studentId);
  return total - paid;
};


  


 
  const currentPageIndex = allDates.indexOf(entryDate);
  const totalPages = allDates.length;

  const maxVisiblePages = 5;

const getVisiblePages = () => {
  let start = Math.max(0, currentPageIndex - Math.floor(maxVisiblePages / 2));
  let end = start + maxVisiblePages;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(0, end - maxVisiblePages);
  }

  return allDates.slice(start, end).map((d, i) => start + i);
};


  const goToPage = (index) => {
    if (index < 0 || index >= totalPages) return;
    setEntryDate(allDates[index]);
  };
  
  const prevPage = () => goToPage(currentPageIndex - 1);
  const nextPage = () => goToPage(currentPageIndex + 1);
  
  
  const incomesRef  = collection(db,"users",adminUid,"Account","accounts","Income");
  const expensesRef = collection(db,"users",adminUid,"Account","accounts","Expenses");
  const studentsRef = collection(db, "users", adminUid, "students");
  const feesRef     = collection(db,"users",adminUid,"Account","accounts","FeesMaster");

  const studentsMainRef = collection(db, "users", adminUid, "students");
const parentsRef = collection(db, "users", adminUid, "parents");



const filteredTeachers = teachers.filter(t =>
  t.name?.toLowerCase().includes(teacherSearch.toLowerCase())
);
useEffect(() => {
  if (!adminUid) return;

  const unsubIncome = onSnapshot(incomesRef, s => {
    setIncomeList(s.docs.map(d => ({ id: d.id, ...d.data() })));
    setIncomeLoaded(true);
  });

  const unsubExpense = onSnapshot(expensesRef, s => {
    setExpenseList(s.docs.map(d => ({ id: d.id, ...d.data() })));
    setExpenseLoaded(true);
  });

  const unsubStudents = onSnapshot(studentsRef, s => {
    setStudents(s.docs.map(d => ({ id: d.id, ...d.data() })));
  });

  const unsubFees = onSnapshot(feesRef, s => {
    setFeesMaster(s.docs.map(d => ({ id: d.id, ...d.data() })));
  });

  // 🔥 VERY IMPORTANT
  return () => {
    unsubIncome();
    unsubExpense();
    unsubStudents();
    unsubFees();
  };
}, [adminUid]);

  
  const filteredStudents = students.filter(s =>
    String(s.class) === String(oldClass) &&
    s.studentName?.toLowerCase().includes(studentSearch.toLowerCase())
  );
  

  

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
 
  
  const safeRequirePremium = (cb, type) => {
    if (!loaded && !isOfficeStaff) return;

  
    // 🔥 Office staff can always enter
    if (isOfficeStaff) {
      cb();
      return;
    }
  
    // Paid admins
    if (plan !== "basic") {
      cb();
      return;
    }
  
    // Basic plan limits
    const incomeCount = incomeList.filter(i => i.date === entryDate).length;
    const expenseCount = expenseList.filter(e => e.date === entryDate).length;
  
    if (type === "income" && incomeCount >= 1) {
      showUpgrade();
      return;
    }
  
    if (type === "expense" && expenseCount >= 1) {
      showUpgrade();
      return;
    }
  
    cb();
  };
  
  
  const saveNewAdmission = async () => {

  
    if (!newName || !newParent || !newClass || !newPayType || !entryDate)
      return alert("Fill all fields");
  
    const total = getClassTotal(newClass);
  
    let final = 0;
    if (newPayType === "full") {
      final = total - total * 0.05;
    } else {
      if (!newPayAmount) return alert("Enter amount");
      final = Number(newPayAmount);
    }
  // 🔹 generate readable Parent ID
const generatedParentId = `P-${Date.now()}`;
    /* ================= CREATE PARENT ================= */
    const parentDocRef = await addDoc(
      collection(db, "users", adminUid, "parents"),
      {
        parentName: newParent,
        parentId: generatedParentId,
        studentsCount: 1,
        students: [],
        createdAt: new Date()
      }
    );
    
    const studentDocRef = await addDoc(
      collection(db, "users", adminUid, "students"),
      {
        studentName: newName,
        studentId: `S-${Date.now()}`,
        parentId: generatedParentId,   // ✅ MATCH WITH PARENT
        parentName: newParent,
        class: newClass,
        section: "",
        createdAt: new Date()
      }
    );
    
    // update parent student list
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
    
  
    /* ================= UPDATE PARENT WITH STUDENT ================= */
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
  
    /* ================= CREATE INCOME ================= */
    await addDoc(incomesRef, {
      studentId: studentDocRef.id,
      studentName: newName,
      parentId: parentDocRef.id,
      parentName: newParent,
      className: newClass,
      totalFees: total,
      paymentType: newPayType,
      paidAmount: final,
      paymentStage: "Admission",
      date: entryDate,
      createdAt: new Date()
    });
  
    /* ================= RESET ================= */
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

  const saveOldAdmission = async () => {
    const stu = students.find(s => s.id === oldStudent);
    if (!stu || !oldPayType || !entryDate) return alert("Fill all fields");
  
    const total = getClassTotal(stu.class);
    const paidSoFar = getStudentPaid(stu.id);
  
    let discount = 0;
  
    // 5% discount ONLY if first payment and FULL
    if (paidSoFar === 0 && oldPayType === "full") {
      discount = total * 0.05;
    }
  
    const payable = total - discount;              // 👈 after discount
    const balanceBefore = payable - paidSoFar;     // 👈 true balance
  
    let final = 0;
  
    if (oldPayType === "full") {
      final = balanceBefore;                       // only remaining
    } else {
      if (!oldPayAmount) return alert("Enter amount");
      final = Number(oldPayAmount);
    }
  
    if (final > balanceBefore) {
      return alert("Cannot pay more than balance");
    }
  
    const balanceAfter = balanceBefore - final;    // 👈 correct
  
    await addDoc(incomesRef, {
      studentId: stu.id,
      studentName: stu.studentName,
      className: stu.class,
  
      totalFees: total,
      discountApplied: discount,
      payableAmount: payable,
  
      paidAmount: final,
      balanceBefore,
      balanceAfter,
  
      paymentType: oldPayType,
      paymentStage: paidSoFar === 0 ? "Admission" : "Term",
  
      date: entryDate,
      createdAt: new Date()
    });
  
    setOldClass("");
    setOldStudent("");
    setOldParent("");
    setOldPayType("");
    setOldPayAmount("");
    setOldTotal(0);
    setPaymentType("");
setPaymentSearch("");
setShowPaymentDD(false);

  };
  const selectedDate = entryDate;   // 👈 whatever date user selected

const todayIncome = incomeList
  .filter(i => i.date === selectedDate)
  .reduce((t, i) => t + Number(i.paidAmount || 0), 0);

const todayExpense = expenseList
  .filter(e => e.date === selectedDate)
  .reduce((t, e) => t + Number(e.amount || 0), 0);

const todayProfit = todayIncome - todayExpense;


  
  


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
  // 🔥 SHOW ONLY BILL PAGE
if (activePage && activePage.startsWith("bill_")) {
  return (
    <BillPage
      adminUid={adminUid}
      billStudentId={activePage.split("_")[1]}
      billDate={activePage.split("_")[2]}
      setActivePage={setActivePage}
     
    />
  );
}


  return (
    
    
    <>
       <span
        style={{ color: "#2140df", cursor: "pointer", fontWeight: 600 }}
        onClick={() => setActivePage("accounts")}
      >
        ← Back
      </span>
      
      

      
      <h2 className="page-title">Accounts Dashboard</h2>

      <div className="today-summary">

      <div
  className="today-card blue"
  style={{ padding: "14px 20px", minHeight: "90px" }}
>

    <span>Today Income</span>
    <h2 style={{ fontSize: "22px", marginTop: "4px" }}>
  ₹{todayIncome.toLocaleString("en-IN")}
</h2>

  </div>
  <div
  className="today-card yellow"
  style={{ padding: "14px 20px", minHeight: "90px" }}
> 

    <span>Today Expense</span>
    <h2>₹{todayExpense.toLocaleString("en-IN")}</h2>
  </div>

  <div
  className="today-card green"
  style={{ padding: "14px 20px", minHeight: "90px" }}
>

    <span>Today Profit</span>
    <h2>₹{todayProfit.toLocaleString("en-IN")}</h2>
  </div>

</div>

    



<div 
  className="section-card pop entries-card"
  style={{ marginTop: "40px" }}   // 👈 gap
>

  <h3 className="section-title">Entries</h3>
  <div className="entries-box">


        {/* ⭐ GLOBAL DATE */}
        <input
          type="date"
          value={entryDate}
          onChange={e=>setEntryDate(e.target.value)}
          style={{marginBottom:12}}
        />

        {/* ===== CHOOSE : Income / Expense ===== */}
<div className="popup-select">
  <div
    className="popup-input"
    onClick={() => setShowEntryType(!showEntryType)}
  >
    {entryType === "income"
      ? "Income"
      : entryType === "expense"
      ? "Expense"
      : "Choose"}
    <span>▾</span>
  </div>

  {showEntryType && (
    <div className="popup-menu">
      <div
        onClick={() => {
          setEntryType("income");
          setShowEntryType(false);
        }}
      >
        Income
      </div>

      <div
        onClick={() => {
          setEntryType("expense");
          setShowEntryType(false);
        }}
      >
        Expense
      </div>
    </div>
  )}
</div>


       {/* ================= INCOME ================= */}
       {entryType === "income" && (
  <>
    {/* ===== TOP ROW : SOURCE / STUDENT ===== */}
    <div className="entry-row source">


      {/* Popup Select : Source / Student */}
      <div className="popup-select">
        <div
          className="popup-input"
          onClick={() => setShowIncomeType(!showIncomeType)}
        >
          {incomeType || "Select"}
          <span>▾</span>
        </div>

        {showIncomeType && (
          <div className="popup-menu">
            <div
              onClick={() => {
                setIncomeType("Source");
                setIncomeMode("source");
                setStudentMode("");
                setShowIncomeType(false);
              }}
            >
              Source
            </div>

            <div
              onClick={() => {
                setIncomeType("Student");
                setIncomeMode("student");
                setShowIncomeType(false);
              }}
            >
              Student
            </div>
          </div>
        )}
      </div>

      {/* Student Type */}
      {incomeMode === "student" && (
        <div className="popup-select">
        <div
          className="popup-input"
          onClick={() => setShowStudentType(!showStudentType)}
        >
          {studentMode
            ? studentMode === "new"
              ? "New Admission"
              : "Old Admission"
            : "Type"}
          <span>▾</span>
        </div>
    
        {showStudentType && (
          <div className="popup-menu">
            <div
              onClick={() => {
                setStudentMode("new");
                setShowStudentType(false);
              }}
            >
              New Admission
            </div>
    
            <div
             onClick={() => {
              setStudentMode("old");
              setShowStudentType(false);
            
              // 🔥 RESET old admission states
              setOldPayType("");
              setOldPayAmount("");
              setOldClass("");
              setOldStudent("");
              setOldParent("");
              setOldTotal(0);
            }}
            
            >
              Old Admission
            </div>
          </div>
        )}
      </div>
      )}
    </div>

    {/* ================= SOURCE ================= */}
    {incomeMode === "source" && (
      <div className="entry-row source">

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
        <button className="save-btn" onClick={() => safeRequirePremium(saveSourceIncome, "income")}>
          Save
        </button>
      </div>
    )}

    {/* ================= NEW STUDENT ================= */}
    {incomeMode === "student" && studentMode === "new" && (
    <div className="entry-row source">

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
          {["PreKG","LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"].map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <input readOnly value={newTotal ? `Total ₹${newTotal}` : ""} />

        <div className="student-dropdown">
          
  <input
    placeholder="Select Payment Type"
    value={paymentType || paymentSearch}
    onChange={e => {
      setPaymentSearch(e.target.value);
      setPaymentType("");
      setShowPaymentDD(true);
    }}
    onFocus={() => setShowPaymentDD(true)}
  />

  {showPaymentDD && (
    <div className="student-dropdown-list">
      {filteredPaymentTypes.map(type => (
        <div
          key={type}
          className="student-option"
          onClick={() => {
            setPaymentType(type);
            setNewPayType(type.toLowerCase().replace(" ", "")); 
            setPaymentSearch("");
            setShowPaymentDD(false);
          }}
          
        >
          {type}
        </div>
      ))}

      {filteredPaymentTypes.length === 0 && (
        <div className="student-option muted">No result</div>
      )}
    </div>
  )}
</div>

{isFullPayment && (
  <input readOnly value={`Payable ₹${newTotal - discount}`} />
)}

{["partial","term1","term2","term3"].includes(newPayType) && (
  <input
    type="number"
    placeholder="Enter Amount"
    value={newPayAmount}
    onChange={e => setNewPayAmount(e.target.value)}
  />
)}


        <button className="save-btn" onClick={() => safeRequirePremium(saveNewAdmission, "income")}>
          Save
        </button>
      </div>
    )}

{incomeMode === "student" && studentMode === "old" && (
  <div className="entry-row source">

   {/* CLASS DROPDOWN */}
<div className="student-dropdown">

<input
  placeholder="Select Class"
  value={oldClass}
  readOnly
  onClick={() => setShowClassDropdown(!showClassDropdown)}
/>

{showClassDropdown && (
  <div className="student-dropdown-list">
    {["PreKG","LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"].map(cls => (
      <div
        key={cls}
        className="student-option"
        onClick={() => {
          selectOldClass(cls);
          setShowClassDropdown(false);   // 🔥 close after select
          setShowStudentDropdown(true); // auto open student dropdown
        }}
      >
        Class {cls}
      </div>
    ))}
  </div>
)}
</div>


    {/* Student Search */}
    <div className="student-dropdown">
    <input
  placeholder="Select Student"
  value={selectedStudentName || studentSearch}
  onChange={e => {
    setStudentSearch(e.target.value);
    setSelectedStudentName("");
    setShowStudentDropdown(true);
  }}
  onFocus={() => setShowStudentDropdown(true)}
/>


{showStudentDropdown && (
  <div className="student-dropdown-list">

        {filteredStudents.length === 0 && (
          <div className="student-option muted">No students</div>
        )}

        {filteredStudents.map(s => (
          <div
            key={s.id}
            className="student-option"
            onClick={() => {
              setOldStudent(s.id);
              setSelectedStudentName(s.studentName);
              setOldParent(s.parentName || "");
              setStudentSearch("");
              setOldClass(s.class);
              setOldTotal(getClassTotal(s.class));   // 🔥 THIS LINE
              setShowStudentDropdown(false);
            }}            
          >
            <strong>{s.studentName}</strong>
            <span>Class {s.class}</span>
          </div>
        ))}
      
      </div>
)}
    </div>
    
    <input readOnly value={oldParent ? `Parent: ${oldParent}` : ""} />
    <input readOnly value={oldTotal ? `Total ₹${oldTotal}` : ""} />

    <div className="student-dropdown">
  <input
    placeholder="Select Payment Type"
    value={paymentType || paymentSearch}
    onChange={e => {
      setPaymentSearch(e.target.value);
      setPaymentType("");
      setShowPaymentDD(true);
    }}
    onFocus={() => setShowPaymentDD(true)}
  />

  {showPaymentDD && (
    <div className="student-dropdown-list">
      {["Full","Partial"].filter(p =>
        p.toLowerCase().includes(paymentSearch.toLowerCase())
      ).map(type => (
        <div
          key={type}
          className="student-option"
          onClick={() => {
            setPaymentType(type);
            setOldPayType(type.toLowerCase());
            setPaymentSearch("");
            setShowPaymentDD(false);
          }}
        >
          {type}
        </div>
      ))}
    </div>
  )}
</div>


    {oldPayType === "full" && (
      <input readOnly value={`Payable ₹${(oldTotal - oldTotal * 0.05).toFixed(0)}`} />
    )}

    {oldPayType === "partial" && (
      <input
        type="number"
        placeholder="Enter Amount"
        value={oldPayAmount}
        onChange={e => setOldPayAmount(e.target.value)}
      />
    )}

    <button className="save-btn" onClick={() => safeRequirePremium(saveOldAdmission, "income")}>
      Save
    </button>
    {oldStudent && (() => {
  const balance = getStudentBalance(oldStudent, oldClass);
  const term = Math.ceil(balance / 3);

  return (
    <>
      <input readOnly value={`Balance ₹${balance}`} />
    
    </>
  );
})()}





  </div>
  
)}
 



  </>
)}




       {/* ================= EXPENSE ================= */}
{entryType==="expense" && (
<>
  {/* Expense Type */}
  <div className="popup-select">
    <div className="popup-input" onClick={() => setShowExpenseType(!showExpenseType)}>
      {expenseMode || "Choose Expense"}
      <span>▾</span>
    </div>

    {showExpenseType && (
      <div className="popup-menu">
        <div onClick={() => { setExpenseMode("salary"); setShowExpenseType(false); }}>
          Salary
        </div>
        <div onClick={() => { setExpenseMode("others"); setShowExpenseType(false); }}>
          Others
        </div>
      </div>
    )}
  </div>

  {expenseMode === "salary" && (
  <>
    <div className="entry-row">
  {/* CATEGORY */}
<div className="student-dropdown">
  <input
    placeholder="Select Category"
    value={salaryRole || categorySearch}
    onChange={e=>{
      setCategorySearch(e.target.value);
      setSalaryRole("");
      setShowSalaryCategory(true);
    }}
    onFocus={()=>setShowSalaryCategory(true)}
  />

  {showSalaryCategory && (
    <div className="student-dropdown-list">
      {filteredCategories.map(cat => (
        <div
          key={cat}
          className="student-option"
          onClick={()=>{
            setSalaryRole(cat);
            setCategorySearch("");
            setShowSalaryCategory(false);
            setSalaryPosition("");      // reset position
            setPositionSearch("");
          }}
        >
          {cat}
        </div>
      ))}
    </div>
  )}
</div>



      {/* Position */}
      <div className="student-dropdown">
  <input
    placeholder="Select Position"
    value={salaryPosition || positionSearch}
    onChange={e => {
      setPositionSearch(e.target.value);
      setSalaryPosition("");
      setShowSalaryPositionDD(true);
    }}
    onFocus={() => salaryRole && setShowSalaryPositionDD(true)}
    disabled={!salaryRole}
  />

  {showSalaryPositionDD && (
    <div className="student-dropdown-list">
      {filteredPositions.map(pos => (
        <div
          key={pos}
          className="student-option"
          onClick={() => {
            setSalaryPosition(pos);
            setPositionSearch("");
            setShowSalaryPositionDD(false);
          }}
        >
          {pos}
        </div>
      ))}

      {filteredPositions.length === 0 && (
        <div className="student-option muted">
          No positions found
        </div>
      )}
    </div>
  )}
</div>



      {/* Name */}
      {salaryRole === "working" && salaryPosition === "Teacher" && (
  <div className="student-dropdown">
    <input
      placeholder="Select Teacher"
      value={selName || teacherSearch}
      onChange={e => {
        setTeacherSearch(e.target.value);
        setSelName("");
        setShowTeacherDropdown(true);
      }}
      onFocus={() => setShowTeacherDropdown(true)}
    />

    {showTeacherDropdown && (
      <div className="student-dropdown-list">
        {filteredTeachers.map(t => (
          <div
            key={t.id}
            className="student-option"
            onClick={() => {
              setSelName(t.name);
              setTeacherSearch("");
              setShowTeacherDropdown(false);
            }}
          >
            <strong>{t.name}</strong>
            <span>{t.teacherId}</span>
          </div>
        ))}

        {filteredTeachers.length === 0 && (
          <div className="student-option muted">No teachers found</div>
        )}
      </div>
    )}
  </div>
)}
{!(salaryRole === "working" && salaryPosition === "Teacher") && (
  <input
    placeholder="Person Name"
    value={selName}
    onChange={e => setSelName(e.target.value)}
  />
)}



      {/* Salary */}
      <input
        type="number"
        placeholder="Salary"
        value={manualSalary}
        onChange={e => setManualSalary(e.target.value)}
      />
    </div>

    {/* Save row */}
    <div className="entry-row">
      <button
        className="save-btn"
        
        onClick={() => safeRequirePremium(saveSalary, "expense")}
      >
        Save
      </button>
    </div>
  </>
)}


  {/* ========== OTHERS ========== */}
  {expenseMode==="others" && (
    <div className="entry-row">
      <input placeholder="Expense name" value={exName} onChange={e=>setExName(e.target.value)} />
      <input type="number" placeholder="Amount" value={exAmt} onChange={e=>setExAmt(e.target.value)} />
      <button className="save-btn" onClick={() => safeRequirePremium(saveExpense,"expense")}>
        Save
      </button>
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
            <button onClick={() => safeRequirePremium(saveFee, "income")}>

Save Fee</button>
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
    <th>Bill</th>
  </tr>
</thead>

<tbody>
  {(() => {
   const all = [
    ...incomeList
      .filter(i => i.date === entryDate)
      .map(i => ({
        id: i.id,
        date: i.date,
        source: i.studentName || i.name || "Income",
        income: isOfficeStaff ? "***" : (i.paidAmount || 0),
        expense: "",
        studentId: i.studentId || null
      })),
  
    ...expenseList
      .filter(e => e.date === entryDate)
      .map(e => ({
        id: e.id,
        date: e.date,
        source: e.name,
        income: "",
        expense: isOfficeStaff ? "***" : (e.amount || 0),
        studentId: null
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
      dateIncomeTotal += Number(row.income) || 0;
      dateExpenseTotal += Number(row.expense) || 0;
      
      return (
        <React.Fragment key={row.id}>

          {/* DATE */}
          {lastDate !== row.date && (
            <tr className="date-heading">
              <td colSpan={4} style={{ fontWeight: "bold", background: "#f3f3f3" }}>
                {lastDate = row.date}
              </td>
            </tr>
          )}

          {/* DATA ROW */}
          <tr>
            <td data-label="Description">{row.source}</td>

            <td datalabel="Income"style={{ color: "green" }}>
  {row.income === "***" ? "***" : row.income ? `₹${row.income}` : ""}
</td>

<td datalabel="Expense"style={{ color: "red" }}>
  {row.expense === "***" ? "***" : row.expense ? `₹${row.expense}` : ""}
</td>
<td datalabel="Report" style={{ textAlign: "center" }}>
  {row.studentId && (
    <span
      style={{ cursor: "pointer", color: "#2140df", fontSize: 18 }}
      title="View Bill"
      onClick={() =>
        setActivePage(`bill_${row.studentId}_${row.date}`)
      }
    >
      invoice
    </span>
  )}
</td>


          </tr>

          {/* TOTAL ROW */}
          {isLastOfDate && (
            <tr style={{ fontWeight: "bold", background: "#fafafa" }}>
              <td datalabel="Total"style={{ border: "1px solid #e5e7eb" }}>TOTAL</td>

              <td datalabel="Income"style={{ color: "green", border: "1px solid #e5e7eb" }}>
              ₹{dateIncomeTotal}
              </td>

              <td datalabel="Expense"style={{ color: "red", border: "1px solid #e5e7eb" }}>
              ₹{dateExpenseTotal}
              </td>

              {/* Bill column empty but border needed */}
              <td datalabel="Report"style={{ border: "1px solid #e5e7eb" }}></td>
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
          <div className="pagination-bar">
  <div className="tab-buttons">

    <button
      className="tab-btn"
      disabled={currentPageIndex === 0}
      onClick={prevPage}
    >
      Previous
    </button>

    {getVisiblePages().map(i => (
  <button
    key={i}
    className={`tab-btn ${i === currentPageIndex ? "active" : ""}`}
    onClick={() => goToPage(i)}
  >
    {i + 1}
  </button>
))}


    <button
      className="tab-btn"
      disabled={currentPageIndex === totalPages - 1}
      onClick={nextPage}
    >
      Next
    </button>

  </div>
</div>
        </div>
        </div>
      </>
  );
}
