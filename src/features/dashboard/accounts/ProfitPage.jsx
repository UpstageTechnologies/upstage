import React, { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, updateDoc,  deleteDoc, doc } from "firebase/firestore";
  import { db } from "../../../services/firebase";
import "../../dashboard_styles/Accounts.css";
import "../../dashboard_styles/studentSearch.css";
import { useNavigate } from "react-router-dom";
import OfficeStaff from "../OfficeStaff";
import BillPage from "./BillPage";   
import "../../dashboard_styles/IE.css";
import {  FaTrash } from "react-icons/fa";





export default function ProfitPage({
  adminUid,
  setActivePage,
  activePage = "",
  plan,
  trialAccess,
  trialExpiresAt,
  showUpgrade
}) {


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
const [selectedFees, setSelectedFees] = useState([]);
const [showFeesDropdown, setShowFeesDropdown] = useState(false);

const [entryType, setEntryType] = useState("");
const [feesMaster, setFeesMaster] = useState([]);
const [showIncomeType, setShowIncomeType] = useState(false);
const [incomeType, setIncomeType] = useState("");




const getSalaryFromInventory = (role, position, teacherName) => {
  return feesMaster.find(
    f =>
      f.type === "salary" &&
      f.category === role &&
      f.position === position &&
      f.name === teacherName
  );
};


const categories = [
  "Teaching Staff",
  "Non Teaching Staff"
];

const positions = {
  "Teaching Staff": ["Teacher"],
  "Non Teaching Staff": ["Helper", "ECA Staff"]
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
const [staffSearch, setStaffSearch] = useState("");
const [showStaffDropdown, setShowStaffDropdown] = useState(false);
const [showStaffType, setShowStaffType] = useState(false);






const getClassFees = (cls) => {
  if (!cls) return [];
  return feesMaster.filter(
    f =>
      f.type === "fees" &&
      String(f.className).trim() === String(cls).trim()
  );
};




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


const classFees = feesMaster.filter(
  f => f.type === "fees" && f.className === (studentMode === "new" ? newClass : oldClass)
);
useEffect(() => {
  if (!newClass) return;
  const total = selectedFees.reduce((t,f)=>t+f.amount,0);
  setNewTotal(total);
}, [selectedFees, newClass]);

useEffect(() => {
  if (!oldClass) return;
  const total = selectedFees.reduce((t,f)=>t+f.amount,0);
  setOldTotal(total);
}, [selectedFees, oldClass]);


const filteredPaymentTypes = paymentTypes.filter(p =>
  p.toLowerCase().includes(paymentSearch.toLowerCase())
);


  // EXPENSE
  const [expenseMode, setExpenseMode] = useState("");
  // 🔥 STAFF MODE (NEW / OLD)
const [staffMode, setStaffMode] = useState(""); 
// "new" | "old"

// New staff details
const [newStaffName, setNewStaffName] = useState("");
const [newStaffPhone, setNewStaffPhone] = useState("");


  
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



const filteredTeachers = teachers
  .filter(t => t.category === "Teaching Staff")
  .filter(t =>
    t.name?.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  const filteredNonTeachingStaff = teachers
  .filter(
    t =>
      t.category === "Non Teaching Staff" &&
      t.nonTeachingRole === salaryPosition
  )
  .filter(t =>
    t.name?.toLowerCase().includes(staffSearch.toLowerCase())
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
  
    // Office staff → always allowed
    if (isOfficeStaff) {
      cb();
      return;
    }
  
    const now = new Date();
  
    const hasAccess =
      plan === "premium" ||
      plan === "lifetime" ||
      (
        plan === "basic" &&
        trialAccess === true &&
        trialExpiresAt &&
        trialExpiresAt.toDate() > now
      );
  
    if (!hasAccess) {
      showUpgrade();
      return;
    }
  
    // 🚫 Apply limits ONLY when BASIC & NO TRIAL
    if (
      plan === "basic" &&
      !(trialAccess && trialExpiresAt && trialExpiresAt.toDate() > now)
    ) {
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
    }
  
    cb();
  };
  
  
  
  
  const saveNewAdmission = async () => {

  
    if (!newName || !newParent || !newClass || !newPayType || !entryDate)
      return alert("Fill all fields");
  
      const fee = selectedFees[0];
      if (!fee) return alert("Select fee");
      
      // 🚫 Prevent duplicate Admission for same fee
// 🚫 Prevent duplicate Admission for same fee
const alreadyPaid = incomeList.some(
  i =>
    i.feeId === fee.id &&
    i.className === newClass &&
    i.paymentStage === "Admission" &&
    i.studentName.toLowerCase() === newName.toLowerCase()
);

if (alreadyPaid) {
  alert("Admission already paid for this fee");
  return;
}

      
      // ✅ fee amount only
      const total = fee.amount;
      const discountAmount = newPayType === "full" ? total * 0.05 : 0;
      const payableAmount = total - discountAmount;
      
      
      
  
      let final = 0;
      if (newPayType === "full") {
        final = payableAmount;
      
      } else if (newPayType.startsWith("term")) {
        final = Number(newPayAmount);
      
      } else {
        if (!newPayAmount) return alert("Enter amount");
        final = Number(newPayAmount);
      }
      if (final > payableAmount) {
        alert("Cannot pay more than balance");
        return;
      }
      
      
      const balanceAfter = payableAmount - final;
      
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
      isNew: true,

    
      feeId: fee.id,
      feeName: fee.name,
      feeAmount: total,
    
      totalFees: total,
      discountApplied: discountAmount,
      payableAmount: payableAmount,
    
      paidAmount: final,
      balanceBefore: payableAmount,
      balanceAfter: balanceAfter,
    
      paymentType: newPayType,
      paymentStage: newPayType.startsWith("term") ? "Term" : "Admission",
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
  
    const fee = selectedFees[0];
    if (!fee) return alert("Select a fee");
    
    const total = fee.amount;

    // 👇 get correct payable balance (includes discount)
    const balance = getFeeBalance(stu.id, fee);
    
    // 🚫 BLOCK if balance already 0
    if (balance <= 0) {
      alert("This fee is already fully paid for this student");
      return;
    }
    
    const paidSoFar = getFeePaid(stu.id, fee.id);
    
    
  
    let discount = 0;
  
    // 5% discount ONLY if first payment and FULL
    if (paidSoFar === 0 && oldPayType === "full") {
      discount = total * 0.05;
    }
  
    const payable = total - discount;

    const balanceBefore = payable - paidSoFar;

        // 👈 true balance




  
    let final = 0;
  
    const termPaidCount = getTermPaidCount(stu.id, fee.id);

    const fixedTermAmount = Math.ceil(total / 3);

    
    
    if (oldPayType.startsWith("term")) {
      if (termPaidCount >= 3) {
        alert("All 3 terms already paid");
        return;
      }
    
      // 🔥 Term 3 → manual
      if (oldPayType === "term3") {
        if (!oldPayAmount) {
          alert("Enter Term 3 amount");
          return;
        }
        final = Number(oldPayAmount);
      } 
      // 🔹 Term 1 & Term 2 → auto
      else {
        final = fixedTermAmount;
      }
    }
    else if (oldPayType === "full") {
    
      final = balanceBefore;
    
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
      isNew: false,

      feeId: selectedFees[0]?.id || null,
feeName: selectedFees[0]?.name || "",
feeAmount: selectedFees[0]?.amount || 0,

  
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

  setSelectedFees([]); 
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
  const saveSalary = async () => {

    if (!salaryRole || !salaryPosition || !entryDate) {
      alert("Fill category, position & date");
      return;
    }
  
    // ================= OLD STAFF =================
    if (staffMode === "old") {
      if (!selName || !manualSalary) {
        alert("Select staff & salary");
        return;
      }
  
      await addDoc(expensesRef, {
        type: "salary",
        role: salaryRole,
        position: salaryPosition,
        name: selName,
        amount: Number(manualSalary),
        date: entryDate,
        createdAt: new Date()
      });
    }
  
    // ================= NEW STAFF =================
    if (staffMode === "new") {
      if (!newStaffName || !newStaffPhone || !manualSalary) {
        alert("Fill new staff details");
        return;
      }
    
      // 🔹 STEP A: CREATE STAFF
      const staffDocRef = await addDoc(
        collection(db, "users", adminUid, "teachers"),
        {
          name: newStaffName,
          phone: newStaffPhone,
          category: salaryRole,
          nonTeachingRole:
            salaryRole === "Non Teaching Staff" ? salaryPosition : "",
          teacherId: `ST-${Date.now()}`,
          assignedClasses: [],  
          createdAt: new Date()
        }
      );
    
      // 🔹 STEP B: SAVE EXPENSE (monthly payment)
      await addDoc(expensesRef, {
        type: "salary",
        role: salaryRole,
        position: salaryPosition,
        name: newStaffName,
        staffId: staffDocRef.id,
        amount: Number(manualSalary),
        date: entryDate,
        createdAt: new Date()
      });
    
      // 🔹 STEP C: SAVE SALARY IN INVENTORY (FeesMaster)
      await addDoc(
        collection(db, "users", adminUid, "Account", "accounts", "FeesMaster"),
        {
          type: "salary",
          category: salaryRole,
          position: salaryPosition,
          name: newStaffName,
          teacherId: staffDocRef.id,
          amount: Number(manualSalary),
          createdAt: new Date()
        }
      );
    }
    
    
  
    // 🔄 RESET
    setStaffMode("");
    setNewStaffName("");
    setNewStaffPhone("");
    setSalaryRole("");
    setSalaryPosition("");
    setSelName("");
    setManualSalary("");
  };
  
  
// how much paid for a specific fee
const getFeePaid = (studentId, feeId) =>
  incomeList
    .filter(i => i.studentId === studentId && i.feeId === feeId)
    .reduce((t, i) => t + Number(i.paidAmount || 0), 0);

// balance for that fee only
const getFeeBalance = (studentId, fee) => {
  const payments = incomeList.filter(
    i => i.studentId === studentId && i.feeId === fee.id
  );

  if (!payments.length) return fee.amount;

  // Find payable from any admission entry (not first)
  const admission = payments.find(
    p => p.paymentStage === "Admission" && p.feeId === fee.id
  );
  
  const payable = admission
  ? admission.payableAmount
  : payments[0].payableAmount || fee.amount;

  const paid = payments.reduce(
    (t, p) => t + Number(p.paidAmount || 0),
    0
  );

  return Math.max(0, payable - paid);   // 🚫 never go negative
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

  
// how many terms already paid
const getTermPaidCount = (studentId, feeId) =>
  incomeList.filter(
    i =>
      i.studentId === studentId &&
      i.feeId === feeId &&
      i.paymentStage === "Term"
  ).length;

  const getTermAmountUI = (studentId, fee) => {
    if (!studentId || !fee) return 0;
  
    const total = fee.amount;
    const paid = getFeePaid(studentId, fee.id);
    const balance = total - paid;
  
    const termPaid = getTermPaidCount(studentId, fee.id);
  
    const oneTerm = Math.ceil(total / 3);
  
    if (termPaid === 0) return oneTerm;     // Term 1
    if (termPaid === 1) return oneTerm;     // Term 2
    return balance;                         // Term 3 (final remaining)
  };
  
  
  const getNewTermAmount = (fee) => {
    if (!fee) return 0;
  
    const total = fee.amount;
    const termAmount = Math.ceil(total / 3);
    return termAmount;
  };
  useEffect(() => {
    if (!oldPayType.startsWith("term") || !selectedFees[0] || !oldStudent) return;
  
    const fee = selectedFees[0];
    const termAmt = getTermAmountUI(oldStudent, fee);
  
    setOldPayAmount(termAmt);
  }, [oldPayType, oldStudent, selectedFees]);
  
  useEffect(() => {
    if (!newPayType.startsWith("term") || !selectedFees[0]) return;
  
    const fee = selectedFees[0];
  
    const termAmt = Math.ceil(fee.amount / 3);
    setNewPayAmount(termAmt);
  
  }, [newPayType, selectedFees]);

  useEffect(() => {
    setTeacherSearch("");
    setStaffSearch("");
    setSelName("");
    setManualSalary("");
    setShowTeacherDropdown(false);
    setShowStaffDropdown(false);
  }, [salaryRole, salaryPosition]);
  
  
  useEffect(() => {
    if (isOfficeStaff) {
      setEntryType("income");     // default
      setIncomeMode("source");   // or student if you want
    }
  }, [isOfficeStaff]);
  // 🔥 ALWAYS KEEP AFTER ALL HOOKS
// ✅ AFTER ALL useEffect / useState / hooks



const deleteEntry = async (row) => {
  if (!window.confirm("Delete this entry?")) return;

  try {
    if (row.type === "income") {
      await deleteDoc(
        doc(db, "users", adminUid, "Account", "accounts", "Income", row.id)
      );
    }

    if (row.type === "expense") {
      await deleteDoc(
        doc(db, "users", adminUid, "Account", "accounts", "Expenses", row.id)
      );
    }

    console.log("Deleted successfully:", row.id);

  } catch (err) {
    console.error("Delete failed:", err);
    alert("Failed to delete entry");
  }
};

useEffect(() => {
  setSelName("");
  setManualSalary("");
  setNewStaffName("");
  setNewStaffPhone("");
}, [staffMode]);




  return (
    <>
    {activePage && activePage.startsWith("bill_") ? (
      <BillPage
        adminUid={adminUid}
        billStudentId={activePage.split("_")[1]}
        billDate={activePage.split("_")[2]}
        setActivePage={setActivePage}
      />
    ) : (
      <>
      
    
{!isOfficeStaff && (
  <span
    style={{ color: "#2140df", cursor: "pointer", fontWeight: 600 }}
    onClick={() => setActivePage("accounts")}
  >
    ← Back
  </span>
)}

      
      

      
      <h2 className="page-title">Accounts Dashboard</h2>
      {!isOfficeStaff && (
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
      )}

    



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
              setSelectedFees([]); 
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
        {/* ===== SELECT FEES FROM INVENTORY ===== */}
<div className="student-dropdown">
  <input
    placeholder="Select Fees"
    value={
      selectedFees.length
        ? selectedFees[0]?.name || ""
        : ""
    }
    readOnly
    onClick={()=>setShowFeesDropdown(!showFeesDropdown)}
  />

  {showFeesDropdown && (
    <div className="student-dropdown-list">
      {getClassFees(newClass || oldClass).map(fee => {
        const already = selectedFees.some(x=>x.id===fee.id);

        return (
          <div
            key={fee.id}
            className="student-option"
            style={{background: already ? "#eef7ff" : ""}}
            onClick={()=>{
              setSelectedFees([fee]);     // only one selection
              setShowFeesDropdown(false); // auto close dropdown
            }}
            
          >
            {fee.name} — ₹{fee.amount}
          </div>
        );
      })}
    </div>
  )}
</div>



{selectedFees[0] && (
  <input readOnly value={`Fee Total ₹${selectedFees[0].amount}`} />
)}



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
            const lower = type.toLowerCase().replace(" ", "");
            setNewPayType(lower);
          
            // 🔥 AUTO TERM AMOUNT
            if (lower.startsWith("term")) {
              const fee = selectedFees[0];
              if (fee) {
                setNewPayAmount(getNewTermAmount(fee));
              }
            }
          
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

{isFullPayment && selectedFees[0] && (
  <input
    readOnly
    value={`Payable ₹${selectedFees[0].amount - discount}`}
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

{newPayType.startsWith("term") && (
  <input
    readOnly
    value={`Payable ₹${newPayAmount}`}
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
    
    <input readOnly value={oldParent ? `Parent: ${oldParent}` : ""} 
    placeholder="Parenr Name"/>
    {/* ===== SELECT FEES FROM INVENTORY ===== */}
<div className="student-dropdown">
  <input
    placeholder="Select Fees"
    value={
      selectedFees.length
        ? selectedFees[0]?.name || ""

        : ""
    }
    readOnly
    onClick={()=>setShowFeesDropdown(!showFeesDropdown)}
  />

  {showFeesDropdown && (
    <div className="student-dropdown-list">
      {getClassFees(newClass || oldClass).map(fee => {
        const already = selectedFees.some(x=>x.id===fee.id);

        return (
          <div
            key={fee.id}
            className="student-option"
            style={{background: already ? "#eef7ff" : ""}}
            onClick={()=>{
              setSelectedFees([fee]);     // only one selection
              setShowFeesDropdown(false); // auto close dropdown
            }}
            
          >
            {fee.name} — ₹{fee.amount}
          </div>
        );
      })}
    </div>
  )}
</div>
{selectedFees[0] && (
  <input readOnly value={`Fee Total ₹${selectedFees[0].amount}`} />
)}



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
{["Full","Partial","Term 1","Term 2","Term 3"]
  .filter(p =>
    p.toLowerCase().includes(paymentSearch.toLowerCase())
  )
  .map(type => (

        <div
          key={type}
          className="student-option"
          onClick={() => {
            const lower = type.toLowerCase().replace(" ", "");
          
            setPaymentType(type);
            setOldPayType(lower);
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



{/* FULL PAYMENT */}
{oldPayType === "full" && oldStudent && selectedFees[0] && (
  <input
    readOnly
    value={`Payable ₹${
      getFeePaid(oldStudent, selectedFees[0].id) === 0
        ? Math.ceil(selectedFees[0].amount * 0.95)
        : getFeeBalance(oldStudent, selectedFees[0])
    }`}
  />
)}

{/* TERM 1 & TERM 2 → READONLY */}
{(oldPayType === "term1" || oldPayType === "term2") &&
  oldStudent &&
  selectedFees[0] && (
    <input
      readOnly
      value={`Payable ₹${getTermAmountUI(oldStudent, selectedFees[0])}`}
    />
)}

{/* 🔥 TERM 3 → MANUAL INPUT */}
{oldPayType === "term3" && (
  <input
    type="number"
    placeholder="Enter Term 3 Amount"
    value={oldPayAmount}
    onChange={e => setOldPayAmount(e.target.value)}
  />
)}

{/* PARTIAL */}
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

    {oldStudent && selectedFees[0] && (
  <div className="balance-text">
    Balance ₹{getFeeBalance(oldStudent, selectedFees[0])}
  </div>
)}





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

      {/* ===== STAFF TYPE (NEW / OLD) ===== */}
      <div className="popup-select">
  <div
    className="popup-input"
    onClick={() => setShowStaffType(!showStaffType)}
  >
    {staffMode
      ? staffMode === "new"
        ? "New Staff"
        : "Old Staff"
      : "Staff Type"}
    <span>▾</span>
  </div>

  {showStaffType && (
    <div className="popup-menu">
      <div
        onClick={() => {
          setStaffMode("new");
          setShowStaffType(false);   // 🔥 CLOSE
        }}
      >
        New Staff
      </div>

      <div
        onClick={() => {
          setStaffMode("old");
          setShowStaffType(false);   // 🔥 CLOSE
        }}
      >
        Old Staff
      </div>
    </div>
  )}
</div>


      {/* ===== NEW STAFF BASIC DETAILS ===== */}
{staffMode === "new" && (
  <>
    <input
      placeholder="Staff Name"
      value={newStaffName}
      onChange={e => setNewStaffName(e.target.value)}
    />

    <input
      placeholder="Phone Number"
      value={newStaffPhone}
      onChange={e => setNewStaffPhone(e.target.value)}
    />
  </>
)}

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
      {staffMode === "old" &&
  salaryRole === "Teaching Staff" &&
  salaryPosition === "Teacher" && (
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

                const salaryItem = getSalaryFromInventory(
                  salaryRole,
                  salaryPosition,
                  t.name
                );

                setManualSalary(salaryItem ? salaryItem.amount : "");
              }}
            >
              <strong>{t.name}</strong>
              <span>{t.teacherId}</span>
            </div>
          ))}
        </div>
      )}
    </div>
)}
{staffMode === "old" &&
  salaryRole === "Non Teaching Staff" &&
  salaryPosition && (
    <div className="student-dropdown">
      <input
        placeholder="Select Name"
        value={selName || staffSearch}
        onChange={e => {
          setStaffSearch(e.target.value);
          setSelName("");
          setShowStaffDropdown(true);
        }}
        onFocus={() => setShowStaffDropdown(true)}
      />

      {showStaffDropdown && (
        <div className="student-dropdown-list">
          {filteredNonTeachingStaff.map(staff => (
            <div
              key={staff.id}
              className="student-option"
              onClick={() => {
                setSelName(staff.name);
                setStaffSearch("");
                setShowStaffDropdown(false);

                const salaryItem = getSalaryFromInventory(
                  salaryRole,
                  salaryPosition,
                  staff.name
                );

                setManualSalary(salaryItem ? salaryItem.amount : "");
              }}
            >
              {staff.name}
            </div>
          ))}
        </div>
      )}
    </div>
)}






      {/* Salary */}
      <input
  type="number"
  placeholder="Salary"
  value={manualSalary}
  onChange={e => setManualSalary(e.target.value)}
  readOnly={staffMode === "old"}   // 🔥 IMPORTANT LINE
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
    <th>Actions</th>  
  </tr>
</thead>

<tbody>
  {(() => {
   const all = [
    ...incomeList
      .filter(i => i.date === entryDate)
      .map(i => ({
        id: i.id,
        type: "income",          // 👈 IMPORTANT
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
        type: "expense",         // 👈 IMPORTANT
        date: e.date,
        source: e.name,
        income: "",
        expense: isOfficeStaff ? "***" : (e.amount || 0),
        studentId: null
      }))
  ];
  
  
    
    
    // sort by date (latest first)
    // SORT: Date (latest first) → then Description A-Z
all.sort((a, b) => {
  if (a.date !== b.date) {
    return a.date > b.date ? -1 : 1;   // latest date first
  }
  return a.source.localeCompare(b.source); // A-Z inside same date
});

    
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
              <td colSpan={5} style={{ fontWeight: "bold", background: "#f3f3f3" }}>
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
  {row.type === "income" && row.studentId && (
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
<td data-label="Actions" style={{ textAlign: "center" }}>
  <button
    className="delete-btn"
    onClick={() => deleteEntry(row)}
  >
    <FaTrash /> Delete
  </button>
</td>



          </tr>

          {/* TOTAL ROW */}
          {isLastOfDate && (
            <tr style={{ fontWeight: "bold", background: "#fafafa" }}>
              <td data-label="Total"style={{ border: "1px solid #e5e7eb" }}>TOTAL</td>

              <td data-label="Income"style={{ color: "green", border: "1px solid #e5e7eb" }}>
              ₹{dateIncomeTotal}
              </td>

              <td data-label="Expense"style={{ color: "red", border: "1px solid #e5e7eb" }}>
              ₹{dateExpenseTotal}
              </td>

              {/* Bill column empty but border needed */}
              <td data-label="Report"style={{ border: "1px solid #e5e7eb" }}></td>

              <td style={{ border: "1px solid #e5e7eb" }}></td> 
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
    )}
    {activePage === "balancePayment" && (
  <BalancePaymentPage
    adminUid={adminUid}
    setActivePage={setActivePage}
  />
)}


      </>
  );
}
