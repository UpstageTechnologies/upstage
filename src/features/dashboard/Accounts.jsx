import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";

export default function Account({ adminUid }) {

  /* ================= STATE ================= */
  const [masterList, setMasterList] = useState([]);
  const [incomeList, setIncomeList] = useState([]);
  const [expenseList, setExpenseList] = useState([]);

  /* ===== Fees Master ===== */
  const [className, setClassName] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [mdate, setMdate] = useState("");

  /* ===== Students ===== */
  const [students, setStudents] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [parentName, setParentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  /* ===== Collect Fees ===== */
  const [selectedFee, setSelectedFee] = useState("");
  const [cdate, setCdate] = useState("");

  /* ===== Teachers ===== */
  const [teachers, setTeachers] = useState([]);
  const [teacherName, setTeacherName] = useState("");
  const [salaryMaster, setSalaryMaster] = useState("");
  const [teacher, setTeacher] = useState("");
  const [salaryDate, setSalaryDate] = useState("");

  /* ===== OTHER EXPENSE ===== */
  const [exName, setExName] = useState("");
  const [exAmt, setExAmt] = useState("");
  const [exDate, setExDate] = useState("");

  /* ================= FIRESTORE PATHS ================= */
  const feesMasterRef = collection(db,"users",adminUid,"Account","accounts","FeesMaster");
  const incomesRef    = collection(db,"users",adminUid,"Account","accounts","Income");
  const expensesRef   = collection(db,"users",adminUid,"Account","accounts","Expenses");

  const studentsRef   = collection(db,"users",adminUid,"Account","accounts","Students");
  const teachersRef   = collection(db,"users",adminUid,"Account","accounts","Teachers");

  /* ================= LOAD LIVE DATA ================= */
  useEffect(() => {
    if (!adminUid) return;

    onSnapshot(query(feesMasterRef,orderBy("date","desc")),s =>
      setMasterList(s.docs.map(d=>({id:d.id,...d.data()})))
    );

    onSnapshot(query(incomesRef,orderBy("date","desc")),s =>
      setIncomeList(s.docs.map(d=>({id:d.id,...d.data()})))
    );

    onSnapshot(query(expensesRef,orderBy("date","desc")),s =>
      setExpenseList(s.docs.map(d=>({id:d.id,...d.data()})))
    );

    onSnapshot(studentsRef, s =>
      setStudents(s.docs.map(d=>({id:d.id,...d.data()})))
    );

    onSnapshot(teachersRef, s =>
      setTeachers(s.docs.map(d=>({id:d.id,...d.data()})))
    );
  }, [adminUid]);


  /* ================= FEES MASTER SAVE ================= */
  const addMaster = async () => {
    if (!className || !name || !amount || !mdate)
      return alert("Fill all Fee Master fields");

    await addDoc(feesMasterRef,{
      className,
      name,
      amount:Number(amount),
      date:mdate,
      createdAt:new Date()
    });

    setClassName(""); setName(""); setAmount(""); setMdate("");
  };


  /* ================= CREATE STUDENT ================= */
  const addStudent = async () => {
    if (!studentName || !parentName || !studentClass)
      return alert("Fill all student fields");

    await addDoc(studentsRef,{
      name:studentName,
      parentName,
      className:studentClass,
      createdAt:new Date()
    });

    setStudentName("");
    setParentName("");
    setStudentClass("");
  };


  /* ================= COLLECT FEES ================= */
  const collectFees = async () => {
    const st = students.find(s=>s.id===selectedStudent);
    const fee = masterList.find(f=>f.id===selectedFee);

    if (!st || !fee || !cdate)
      return alert("Select student + fee + date");

    await addDoc(incomesRef,{
      studentId:st.id,
      studentName:st.name,
      className:st.className,
      feeName:fee.name,
      amount:fee.amount,
      date:cdate,
      createdAt:new Date()
    });

    setSelectedStudent("");
    setSelectedFee("");
    setCdate("");
  };

  const feesForStudentClass =
    masterList.filter(f=>f.className ===
      students.find(s=>s.id===selectedStudent)?.className);


  /* ================= CREATE TEACHER ================= */
  const addTeacher = async () => {
    if (!teacherName || !salaryMaster)
      return alert("Enter teacher + salary");

    await addDoc(teachersRef,{
      name:teacherName,
      salary:Number(salaryMaster),
      createdAt:new Date()
    });

    setTeacherName("");
    setSalaryMaster("");
  };


  /* ================= PAY SALARY ================= */
  const paySalary = async () => {
    const t = teachers.find(x=>x.id===teacher);
    if (!t || !salaryDate) return alert("Select teacher + date");

    await addDoc(expensesRef,{
      teacherId:t.id,
      teacher:t.name,
      amount:t.salary,
      type:"salary",
      date:salaryDate,
      createdAt:new Date()
    });

    setTeacher("");
    setSalaryDate("");
  };


  /* ================= ADD OTHER EXPENSE ================= */
  const addOtherExpense = async () => {
    if (!exName || !exAmt || !exDate)
      return alert("Enter expense details");

    await addDoc(expensesRef,{
      type:"other",
      name:exName,
      amount:Number(exAmt),
      date:exDate,
      createdAt:new Date()
    });

    setExName("");
    setExAmt("");
    setExDate("");
  };


  /* ================= CALC ================= */
  const totalIncome  = incomeList.reduce((t,x)=>t+x.amount,0);
  const totalExpense = expenseList.reduce((t,x)=>t+x.amount,0);
  const profit       = totalIncome-totalExpense;


  /* ================= UI ================= */
  return (
    <div style={{padding:20,maxWidth:900,margin:"auto"}}>

      <h2>Accounts</h2>

      {/* ========= FEES MASTER ========= */}
      <div className="card">
        <h3>Fees Master</h3>

        <select value={className} onChange={e=>setClassName(e.target.value)}>
          <option value="">Select Class</option>
          {["PreKG","LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"]
            .map(c=><option key={c}>{c}</option>)}
        </select>

        <input placeholder="Fee (Tuition, Dress...)"
          value={name} onChange={e=>setName(e.target.value)} />

        <input type="number" placeholder="Amount"
          value={amount} onChange={e=>setAmount(e.target.value)} />

        <input type="date" value={mdate} onChange={e=>setMdate(e.target.value)} />

        <button onClick={addMaster}>Save Master</button>
      </div>


      {/* ========= STUDENT + FEES ========= */}
      <div className="card">
        <h3>Students & Collect Fees</h3>

        <div className="section">
          <input placeholder="Student Name"
            value={studentName} onChange={e=>setStudentName(e.target.value)} />

          <input placeholder="Parent Name"
            value={parentName} onChange={e=>setParentName(e.target.value)} />

          <select value={studentClass} onChange={e=>setStudentClass(e.target.value)}>
            <option value="">Class</option>
            {["PreKG","LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"]
              .map(c=><option key={c}>{c}</option>)}
          </select>

          <button onClick={addStudent}>Create Student</button>
        </div>

        <hr/>

        <select value={selectedStudent}
          onChange={e=>setSelectedStudent(e.target.value)}>
          <option value="">Select Student</option>
          {students.map(s=>(
            <option key={s.id} value={s.id}>
              {s.name} ({s.className})
            </option>
          ))}
        </select>

        <select value={selectedFee}
          onChange={e=>setSelectedFee(e.target.value)}>
          <option value="">Select Fee</option>
          {feesForStudentClass.map(f=>(
            <option key={f.id} value={f.id}>
              {f.name} — ₹{f.amount}
            </option>
          ))}
        </select>

        <input type="date" value={cdate} onChange={e=>setCdate(e.target.value)} />

        <button onClick={collectFees}>Collect</button>
      </div>


      {/* ========= TEACHER + SALARY ========= */}
      <div className="card">
        <h3>Teachers & Salary</h3>

        <div className="section">
          <input placeholder="Teacher Name"
            value={teacherName} onChange={e=>setTeacherName(e.target.value)} />

          <input type="number" placeholder="Monthly Salary"
            value={salaryMaster} onChange={e=>setSalaryMaster(e.target.value)} />

          <button onClick={addTeacher}>Create Teacher</button>
        </div>

        <hr/>

        <select value={teacher} onChange={e=>setTeacher(e.target.value)}>
          <option value="">Select Teacher</option>
          {teachers.map(t=>(
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <input type="date"
          value={salaryDate} onChange={e=>setSalaryDate(e.target.value)} />

        <button onClick={paySalary}>Pay Salary</button>
      </div>


      {/* ========= OTHER EXPENSE ========= */}
      <div className="card">
        <h3>Other Expenses</h3>

        <input
          placeholder="Expense (Diesel, Repair, Stationary...)"
          value={exName}
          onChange={e=>setExName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Amount"
          value={exAmt}
          onChange={e=>setExAmt(e.target.value)}
        />

        <input
          type="date"
          value={exDate}
          onChange={e=>setExDate(e.target.value)}
        />

        <button onClick={addOtherExpense}>Add Expense</button>
      </div>


      {/* ========= FULL EXPENSE LIST ========= */}
      <div className="card">
        <h3>All Expenses</h3>

        <ul>
          {expenseList.map(e=>(
            <li key={e.id}>
              {e.type === "salary"
                ? <>Salary — {e.teacher}</>
                : <>{e.name}</>
              }
              &nbsp; — ₹{e.amount} ({e.date})
            </li>
          ))}
        </ul>
      </div>


      {/* ========= PROFIT ========= */}
      <div className="card">
        <h3>Profit</h3>
        <p>Income: ₹{totalIncome}</p>
        <p>Expense: ₹{totalExpense}</p>
        <h4>Profit: ₹{profit}</h4>
      </div>
    </div>
  );
}
