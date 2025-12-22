import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db, auth } from "../../services/firebase";

const Approvals = () => {
  const adminUid =
    auth.currentUser?.uid || localStorage.getItem("adminUid");

  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    if (!adminUid) return;

    const snap = await getDocs(
      collection(db, "users", adminUid, "approval_requests")
    );

    setRequests(
      snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(r => r.status === "pending")
    );
  };

  useEffect(() => {
    if (adminUid) fetchRequests();
  }, [adminUid]);

  /* ✅ APPROVE */
  const approve = async (r) => {
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

    await updateDoc(
      doc(db, "users", adminUid, "approval_requests", r.id),
      { status: "approved" }
    );

    fetchRequests();
  };

  /* ❌ REJECT */
  const reject = async (id) => {
    await updateDoc(
      doc(db, "users", adminUid, "approval_requests", id),
      { status: "rejected" }
    );
    fetchRequests();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Teacher Approvals</h2>

      {requests.length === 0 && <p>No pending approvals</p>}

      {requests.map(r => (
        <div key={r.id} style={{ border: "1px solid #ccc", padding: 10 }}>
          <p><b>Action:</b> {r.action}</p>
          <p><b>Requested by:</b> {r.createdBy}</p>

          <button onClick={() => approve(r)}>✅ Approve</button>
          <button onClick={() => reject(r.id)} style={{ marginLeft: 10 }}>
            ❌ Reject
          </button>
        </div>
      ))}
    </div>
  );
};

export default Approvals;
