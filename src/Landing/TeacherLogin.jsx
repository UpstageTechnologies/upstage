import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  collectionGroup,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

import logo from "../logo.jpeg";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../Login/Login.css"; // 👈 same CSS as Login.jsx

const TeacherLogin = () => {
  const [teacherId, setTeacherId] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!teacherId || !password) {
      alert("Fill all fields");
      return;
    }

    try {
      const snap = await getDocs(
        query(
          collectionGroup(db, "teachers"),
          where("teacherId", "==", teacherId.trim()),
          where("password", "==", password.trim())
        )
      );

      if (snap.empty) {
        alert("Invalid credentials");
        return;
      }

      const docSnap = snap.docs[0];
      const teacher = docSnap.data();

      const adminUid = docSnap.ref.parent.parent.id;

      localStorage.setItem("role", "teacher");
      localStorage.setItem("adminUid", adminUid);
      localStorage.setItem("teacherId", teacher.teacherId);
      localStorage.setItem("teacherName", teacher.name);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Login error");
    }
  };

  return (
    <>
      <img src={logo} alt="Logo" className="logo" />

      <div className="wrapper">
        <div className="log">
          <h2>Login</h2>

          <form onSubmit={handleLogin}>
            <input
              placeholder="Teacher ID"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              required
            />

            <div className="password-wrapper">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="eye"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button className="log-btn" type="submit">
              Login
            </button>
          </form>

          <p style={{ marginTop: "15px" }}>
            *Only registered teachers can login.
          </p>
        </div>
      </div>
    </>
  );
};

export default TeacherLogin;
