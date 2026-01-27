// ==============================
// Settings.jsx (Internal CSS Version)
// ==============================
import React, { useEffect, useState } from "react";
import { collection, addDoc, deleteDoc, onSnapshot, doc } from "firebase/firestore";
import { db } from "../../../services/firebase";

export default function Settings({ adminUid }) {
  const [className, setClassName] = useState("");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminUid) return;

    const ref = collection(db, "users", adminUid, "Classes");
    const unsub = onSnapshot(ref, (snap) => {
      setClasses(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
      setLoading(false);
    });

    return () => unsub();
  }, [adminUid]);

  const addClass = async () => {
    if (!className.trim()) return alert("Enter class name");

    if (classes.some(c => c.name.toLowerCase() === className.toLowerCase())) {
      return alert("Class already exists");
    }

    await addDoc(collection(db, "users", adminUid, "Classes"), {
      name: className.trim(),
    });

    setClassName("","");
  };

  const deleteClass = async (id) => {
    if (!window.confirm("Delete this class?")) return;
    await deleteDoc(doc(db, "users", adminUid, "Classes", id));
  };

  return (
    <div className="settings-page">

      <div className="settings-header">
        <h1>⚙️ School Settings</h1>
        <p>Manage your classes easily</p>
      </div>

      <div className="settings-card">

        <div className="input-row">
          <input
            type="text"
            placeholder="Enter class name"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          <button onClick={addClass}>Add Class</button>
        </div>

        {loading ? (
          <p className="loading">Loading...</p>
        ) : (
          <div className="class-list">
            {classes.length === 0 && <p>No classes created</p>}

            {classes.map(c => (
              <div key={c.id} className="class-item">
                <span>Class {c.name}</span>
                <button className="delete-btn" onClick={() => deleteClass(c.id)}>✖</button>
              </div>
            ))}
          </div>
        )}
      </div>
<style>{`
:root {
  --primary: #4f46e5;
  --bg: #f5f7fb;
  --card: #ffffff;
  --text: #111827;
  --muted: #6b7280;
}

.settings-page {
  min-height: 100vh;
  padding: 40px;
  background: var(--bg);
  font-family: Inter, sans-serif;
}

.settings-header h1 {
  font-size: 32px;
  margin-bottom: 5px;
}

.settings-header p {
  color: var(--muted);
  margin-bottom: 25px;
}

.settings-card {
  max-width: 520px;
  background: var(--card);
  padding: 25px;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
}

.input-row {
  display: flex;
  gap: 10px;
}

.input-row input {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 15px;
}

.input-row input:focus {
  outline: none;
  border-color: var(--primary);
}

.input-row button {
  background: var(--primary);
  color: white;
  border: none;
  padding: 12px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.input-row button:hover {
  opacity: 0.9;
}

.class-list {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.class-item {
  background: #f3f4f6;
  padding: 12px 14px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.class-item span {
  font-weight: 500;
}

.delete-btn {
  background: transparent;
  border: none;
  font-size: 16px;
  color: #ef4444;
  cursor: pointer;
}

.delete-btn:hover {
  transform: scale(1.1);
}

.loading {
  margin-top: 20px;
  color: var(--muted);
}
/* ================= MOBILE & TABLET RESPONSIVE ================= */

@media (max-width: 768px){

  .settings-page{
    padding: 20px;
  }

  .settings-header h1{
    font-size: 24px;
  }

  .settings-header p{
    font-size: 14px;
  }

  .settings-card{
    max-width: 100%;
    padding: 18px;
    border-radius: 12px;
  }

  .input-row{
    flex-direction: column;   /* stack input & button */
    gap: 8px;
  }

  .input-row input{
    font-size: 14px;
    padding: 10px;
  }

  .input-row button{
    width: 100%;
    padding: 10px;
    font-size: 14px;
  }

  .class-item{
    padding: 10px 12px;
  }

  .class-item span{
    font-size: 14px;
  }

  .delete-btn{
    font-size: 14px;
  }
}

/* Extra Small Phones */
@media (max-width: 400px){

  .settings-header h1{
    font-size: 22px;
  }

  .settings-card{
    padding: 14px;
  }

  .class-item span{
    font-size: 13px;
  }

}

`}</style>

    </div>
  );
}
