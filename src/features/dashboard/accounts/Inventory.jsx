import React, { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot ,query} from "firebase/firestore";
import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";
import "../../dashboard_styles/studentSearch.css";



export default function Inventory({ adminUid, setActivePage, plan, showUpgrade }) {

  /* ================= STATES ================= */
  const [feesMaster, setFeesMaster] = useState([]);
  const [feesLoaded, setFeesLoaded] = useState(false);
  const [showEntryType, setShowEntryType] = useState(false);


  const [teachers, setTeachers] = useState([]);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [classSearch, setClassSearch] = useState("");
  const classes = ["PreKG","LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"];
  const [categorySearch, setCategorySearch] = useState("");
const [positionSearch, setPositionSearch] = useState("");
const [salaryCategory, setSalaryCategory] = useState("");

const [showCategory, setShowCategory] = useState(false);
const [showPosition, setShowPosition] = useState(false);

const [entrySearch, setEntrySearch] = useState("");
const [showEntryDropdown, setShowEntryDropdown] = useState(false);

const [incomeList, setIncomeList] = useState([]);
const [expenseList, setExpenseList] = useState([]);
const [feesList, setFeesList] = useState([]);


const entryTypes = ["Fees", "Salary"];

const filteredEntryTypes = entryTypes.filter(t =>
  t.toLowerCase().includes(entrySearch.toLowerCase())
);


const categories = ["Office Staff", "Working Staff"];

const positions = {
  "Office Staff": ["Principal","Clerk","Accountant","Receptionist"],
  "Working Staff": ["Teacher","Driver","Cleaner","Watchman","Helper"]
};

const filteredCategories = categories.filter(c =>
  c.toLowerCase().includes(categorySearch.toLowerCase())
);

const filteredPositions = (positions[salaryCategory] || []).filter(p =>
  p.toLowerCase().includes(positionSearch.toLowerCase())
);

  const filteredClasses = classes.filter(c =>
    c.toLowerCase().includes(classSearch.toLowerCase())
  );
  



  

  const [entryType, setEntryType] = useState(""); // fees | salary
  const [activeSummary, setActiveSummary] = useState("fees");

  const [feeClass, setFeeClass] = useState("");
  const [feeName, setFeeName] = useState("");
  const [feeAmount, setFeeAmount] = useState("");

  
  const [salaryPosition, setSalaryPosition] = useState("");


  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  /* ================= FIRESTORE ================= */
  const feesRef = collection(db, "users", adminUid, "Account", "accounts", "FeesMaster");
  const teachersRef = collection(db, "users", adminUid, "teachers");

  /* ================= LOAD ================= */
  useEffect(() => {
    if (!adminUid) return;
  
    const incomeRef = collection(db, "users", adminUid, "Account", "accounts", "Income");
    const expenseRef = collection(db, "users", adminUid, "Account", "accounts", "Expenses");
    const feesRef = collection(db, "users", adminUid, "FeesCollection");
  
    const unsubIncome = onSnapshot(query(incomeRef), snap => {
      setIncomeList(snap.docs.map(d => d.data()));
    });
  
    const unsubExpense = onSnapshot(query(expenseRef), snap => {
      setExpenseList(snap.docs.map(d => d.data()));
    });
  
    const unsubFees = onSnapshot(query(feesRef), snap => {
      setFeesList(snap.docs.map(d => d.data()));
    });
  
    return () => {
      unsubIncome();
      unsubExpense();
      unsubFees();
    };
  }, [adminUid]);
  
  useEffect(() => {
    if (!adminUid) return;

    const unsub1 = onSnapshot(feesRef, snap => {
      setFeesMaster(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setFeesLoaded(true);
    });

    const unsub2 = onSnapshot(teachersRef, snap => {
      setTeachers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [adminUid]);

  const filteredTeachers = teachers.filter(t =>
    t.name?.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  /* ================= SAVE ================= */
  const saveFee = async () => {
    if (!entryType || !feeAmount || !date) return alert("Fill all fields");

    if (entryType === "fees") {
      if (!feeClass || !feeName) return alert("Select class & fee name");

      await addDoc(feesRef, {
        type: "fees",
        className: String(feeClass).trim(),

        name: feeName,
        amount: Number(feeAmount),
        date,
        createdAt: new Date()
      });
    }

    if (entryType === "salary") {
      if (!salaryCategory || !salaryPosition || !selectedTeacher)
        return alert("Select Category, Position & Teacher");

      await addDoc(feesRef, {
        type: "salary",
        category: salaryCategory,
        position: salaryPosition,
        teacherId: selectedTeacher.id,
        name: selectedTeacher.name,
        amount: Number(feeAmount),
        date,
        createdAt: new Date()
      });
    }

    setEntryType("");
setFeeClass("");
setClassSearch("");
setFeeName("");
setFeeAmount("");
setSalaryCategory("");
setCategorySearch("");
setSalaryPosition("");
setPositionSearch("");
setSelectedTeacher(null);
setTeacherSearch("");

  };
  const changeEntryType = (type) => {
    setEntryType(type);
  
    setShowCategory(false);
    setShowPosition(false);
    setShowTeacherDropdown(false);
    setShowClassDropdown(false);
    setShowEntryDropdown(false);
  
    setCategorySearch("");
    setPositionSearch("");
    setTeacherSearch("");
    setClassSearch("");
    setEntrySearch("");
  };
  
  

  /* ================= DATA ================= */
  const feesData = feesMaster.filter(i => i.type === "fees");
  const salaryData = feesMaster.filter(i => i.type === "salary");

  const groupedFees = feesData.reduce((acc, item) => {
    if (!acc[item.className]) acc[item.className] = [];
    acc[item.className].push(item);
    return acc;
  }, {});

  /* ================= UI ================= */
  return (
    <div className="accounts-wrapper fade-in">

      <span onClick={() => setActivePage("accounts")} style={{ color: "#2140df", cursor: "pointer", fontWeight: 600 }}>
        ← Back
      </span>

      <h2 className="page-title">Inventory</h2>

      <div className="section-card entries-card">
        <h3 className="section-title">Add Item</h3>

        <div className="entries-box">
  <input
    type="date"
    value={date}
    onChange={e => setDate(e.target.value)}
  />

  <div className="student-dropdown">
    <input
      placeholder="Select Type"
      value={
        entryType
          ? entryType === "fees" ? "Fees" : "Salary"
          : entrySearch
      }
      onChange={e => {
        setEntrySearch(e.target.value);
        setEntryType("");
        setShowEntryDropdown(true);
      }}
      onFocus={() => setShowEntryDropdown(true)}
    />

    {showEntryDropdown && (
      <div className="student-dropdown-list">
        {filteredEntryTypes.map(type => (
          <div
            key={type}
            className="student-option"
            onClick={() => {
              changeEntryType(type.toLowerCase());
              setEntrySearch("");
              setShowEntryDropdown(false);
            }}
          >
            {type}
          </div>
        ))}
      </div>
    )}
  </div>
</div>



{entryType === "fees" && (
  <div className="fees-grid">

    <div className="student-dropdown">
      <input
        placeholder="Select Class"
        value={feeClass || classSearch}
        onChange={e=>{
          setClassSearch(e.target.value);
          setFeeClass("");
          setShowClassDropdown(true);
        }}
        onFocus={()=>setShowClassDropdown(true)}
      />
      {showClassDropdown && (
        <div className="student-dropdown-list">
          {filteredClasses.map(cls=>(
            <div key={cls} className="student-option"
              onClick={()=>{
                setFeeClass(cls);
                setClassSearch("");
                setShowClassDropdown(false);
              }}>
              Class {cls}
            </div>
          ))}
        </div>
      )}
    </div>

    <input
      placeholder="Fee Name"
      value={feeName}
      onChange={e=>setFeeName(e.target.value)}
    />

    <input
      type="number"
      placeholder="Amount"
      value={feeAmount}
      onChange={e=>setFeeAmount(e.target.value)}
    />

    <button className="save-btn" onClick={saveFee}>
      Save
    </button>

  </div>
)}


{entryType === "salary" && (
  <div className="salary-grid">

   

    {/* Category */}
    <div className="student-dropdown">
      <input
        placeholder="Select Category"
        value={salaryCategory || categorySearch}
        onChange={e=>{
          setCategorySearch(e.target.value);
          setSalaryCategory("");
          setShowCategory(true);
        }}
        onFocus={()=>setShowCategory(true)}
      />
      {showCategory && (
        <div className="student-dropdown-list">
          {filteredCategories.map(cat=>(
            <div
              key={cat}
              className="student-option"
              onClick={()=>{
                setSalaryCategory(cat);
                setCategorySearch("");
                setShowCategory(false);
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
        onChange={e=>{
          setPositionSearch(e.target.value);
          setSalaryPosition("");
          setShowPosition(true);
        }}
        onFocus={()=>setShowPosition(true)}
      />
      {showPosition && (
        <div className="student-dropdown-list">
          {filteredPositions.map(pos=>(
            <div
              key={pos}
              className="student-option"
              onClick={()=>{
                setSalaryPosition(pos);
                setPositionSearch("");
                setShowPosition(false);
              }}
            >
              {pos}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* ===== Row 2 ===== */}
    {/* Teacher */}
    <div className="student-dropdown">
      <input
        placeholder="Teacher"
        value={selectedTeacher?.name || teacherSearch}
        onChange={e=>{
          setTeacherSearch(e.target.value);
          setShowTeacherDropdown(true);
        }}
        onFocus={()=>setShowTeacherDropdown(true)}
      />
      {showTeacherDropdown && (
        <div className="student-dropdown-list">
          {filteredTeachers.map(t=>(
            <div
              key={t.id}
              className="student-option"
              onClick={()=>{
                setSelectedTeacher(t);
                setTeacherSearch("");
                setShowTeacherDropdown(false);
              }}
            >
              {t.name}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Amount */}
    <input
      type="number"
      placeholder="Amount"
      value={feeAmount}
      onChange={e=>setFeeAmount(e.target.value)}
    />

    
    {/* ===== Row 3 ===== */}
    <button
      className="save-btn"
      
      onClick={saveFee}
    >
      Save
    </button>
  </div>
)}


      </div>

      {/* SUMMARY */}
      <div style={{ display: "flex", gap: 10, marginTop: 20 ,marginBottom:20 }}>
        <button onClick={() => setActiveSummary("fees")}>Fees Summary</button>
        <button onClick={() => setActiveSummary("salary")}>Salary Summary</button>
      </div>

      {activeSummary === "fees" && (
        <table className="nice-table">
          <thead><tr><th>Class</th><th>Fee</th><th>Amount</th></tr></thead>
          <tbody> 
          {Object.entries(groupedFees).map(([cls, items]) =>
  items.map(i => (
    <tr key={i.id}>
      <td data-label="Class">{cls}</td>
      <td data-label="Fee Name">{i.name}</td>
      <td data-label="Amount">₹{i.amount}</td>
    </tr>
  ))
)}

          </tbody>
        </table>
      )}

      {activeSummary === "salary" && (
        <table className="nice-table">
          <thead><tr><th>Name</th><th>Amount</th><th>Date</th></tr></thead>
          <tbody>
            {salaryData.map(i => (
              <tr key={i.id}>
                <td data-label="Name">{i.name}</td>
                <td data-label="Amount">₹{i.amount}</td>
                <td date-label="Date">{i.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}
