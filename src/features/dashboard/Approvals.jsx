import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc
} from "firebase/firestore";
import { db, auth } from "../../services/firebase";

const Approvals = ({requirePremium }) => {
  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!adminUid) return;

    setLoading(true);

    const snap = await getDocs(
      collection(db, "users", adminUid, "approval_requests")
    );

    setRequests(
      snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(r => r.status === "pending")
    );

    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [adminUid]);


  /* ================= APPROVE ================= */
  const approveRequest = async (r) => {
    try {
      /* --- CALENDAR --- */
      if (r.module === "calendar") {

        if (r.action === "create") {
          await setDoc(
            doc(db, "users", adminUid, "calendar", r.targetDate),
            r.payload
          );
        }

        if (r.action === "delete") {
          await deleteDoc(
            doc(db, "users", adminUid, "calendar", r.targetDate)
          );
        }
      }


      /* --- TIMETABLE --- */
      if (r.module === "timetable") {

        await setDoc(
          doc(db, "users", adminUid, "timetables", r.classKey),
          { [r.day]: r.payload },
          { merge: true }
        );
      }


      /* --- TEACHERS (existing logic) --- */
      if (r.module === "teacher") {
        const base = ["users", adminUid, "teachers"];

        if (r.action === "create") {
          await addDoc(collection(db, ...base), r.payload);
        }

        if (r.action === "update") {
          await updateDoc(doc(db, ...base, r.targetId), r.payload);
        }

        if (r.action === "delete") {
          await deleteDoc(doc(db, ...base, r.targetId));
        }
      }
      /* --- PARENTS --- */
if (r.module === "parent") {
  const base = ["users", adminUid, "parents"];

  if (r.action === "create") {
    await addDoc(collection(db, ...base), {
      ...r.payload,
      role: "parent",
      createdAt: new Date()
    });
  }

  if (r.action === "update") {
    await updateDoc(
      doc(db, ...base, r.targetId),
      {
        ...r.payload,
        updatedAt: new Date()
      }
    );
  }

  if (r.action === "delete") {
    await deleteDoc(doc(db, ...base, r.targetId));
  }
}


/* --- STUDENTS --- */
if (r.module === "student") {
  const base = ["users", adminUid, "students"];

  if (r.action === "create") {
    const id = r.payload.studentId;

    await setDoc(
      doc(db, ...base, id),
      {
        ...r.payload,
        createdAt: new Date()
      }
    );
  }

  if (r.action === "update") {
    await updateDoc(
      doc(db, ...base, r.targetId),
      {
        ...r.payload,
        updatedAt: new Date()
      }
    );
  }

  if (r.action === "delete") {
    await deleteDoc(doc(db, ...base, r.targetId));
  }
}




      /* MARK APPROVED */
      await updateDoc(
        doc(db, "users", adminUid, "approval_requests", r.id),
        {
          status: "approved",
          approvedAt: new Date()
        }
      );

      fetchRequests();
      alert("✅ Approved successfully");

    } catch (err) {
      console.error(err);
      alert("Approval failed");
    }
  };


  const rejectRequest = async (id) => {
    await updateDoc(
      doc(db, "users", adminUid, "approval_requests", id),
      { status: "rejected", rejectedAt: new Date() }
    );

    fetchRequests();
  };


  return (
    <div style={{ padding: 20 }}>
      <h2>Approvals</h2>

      {loading && <p>Loading approvals...</p>}
      {!loading && requests.length === 0 && <p>No pending approvals</p>}

      {requests.map(r => (
        <div key={r.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 6,
            padding: 15,
            marginBottom: 15,
            maxWidth: 500
          }}
        >
          <p><b>Module:</b> {r.module}</p>
          <p><b>Action:</b> {r.action}</p>
          <p><b>Requested By:</b> {r.createdBy}</p>

          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => requirePremium(() => approveRequest(r))}
              style={{
                background: "green",
                color: "#fff",
                border: "none",
                padding: "6px 14px",
                marginRight: 10,
                cursor: "pointer",
                borderRadius: 4
              }}
            >
              ✅ Approve
            </button>

            <button
               onClick={() => requirePremium(() => rejectRequest(r.id))}
              style={{
                background: "red",
                color: "#fff",
                border: "none",
                padding: "6px 14px",
                cursor: "pointer",
                borderRadius: 4
              }}
            >
              ❌ Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Approvals;
