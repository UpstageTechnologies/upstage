import React, { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../services/firebase";
import "../styles/ApplicationForm.css";

export default function ApplicationForm() {

  const [form, setForm] = useState({
    studentName: "",
    class: "",
    dob: "",
    parentName: "",
    phone: "",
    address: ""
  });

  const handleChange = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (
      !form.studentName ||
      !form.class ||
      !form.parentName ||
      !form.phone ||
      !form.address ||
      !form.dob
    ) {
      alert("All fields required");
      return;
    }

    try {
      await addDoc(collection(db, "applications"), {
        ...form,
        status: "pending",
        createdAt: Timestamp.now()
      });

      alert("🎉 Application submitted successfully");

      setForm({
        studentName: "",
        class: "",
        dob: "",
        parentName: "",
        phone: "",
        address: ""
      });
    } catch (err) {
      console.error(err);
      alert("Something went wrong — try again.");
    }
  };

  return (
    <div className="appform-wrapper">
      <div className="appform-card">
        <h2 className="appform-title">Student Application Form</h2>

        <input
          className="appform-input"
          placeholder="Student Name"
          value={form.studentName}
          onChange={e => handleChange("studentName", e.target.value)}
        />

        <input
          className="appform-input"
          placeholder="Class"
          value={form.class}
          onChange={e => handleChange("class", e.target.value)}
        />

        <input
          className="appform-input"
          type="date"
          value={form.dob}
          onChange={e => handleChange("dob", e.target.value)}
        />

        <input
          className="appform-input"
          placeholder="Parent Name"
          value={form.parentName}
          onChange={e => handleChange("parentName", e.target.value)}
        />

        <input
          className="appform-input"
          placeholder="Phone"
          value={form.phone}
          onChange={e => handleChange("phone", e.target.value)}
        />

        <input
          className="appform-input"
          placeholder="Address"
          value={form.address}
          onChange={e => handleChange("address", e.target.value)}
        />

        <button className="appform-btn" onClick={handleSubmit}>
          Submit Application
        </button>
      </div>
    </div>
  );
}
