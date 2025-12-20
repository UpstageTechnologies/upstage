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
import "../Login/Login.css"; // 👈 SAME CSS

const ParentLogin = () => {
  const [parentId, setParentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!parentId || !password) {
      alert("Fill all fields");
      return;
    }

    try {
      // 🔥 SAME METHOD AS TEACHER LOGIN
      const snap = await getDocs(
        query(
          collectionGroup(db, "parents"),
          where("parentId", "==", parentId.trim()),
          where("password", "==", password.trim())
        )
      );

      if (snap.empty) {
        alert("Invalid credentials");
        return;
      }

      const docSnap = snap.docs[0];
      const parent = docSnap.data();

      // 🔑 SAME LOGIC
      const adminUid = docSnap.ref.parent.parent.id;

      // ✅ SESSION SAVE
      localStorage.setItem("role", "parent");
      localStorage.setItem("adminUid", adminUid);
      localStorage.setItem("parentId", parent.parentId);
      localStorage.setItem("parentName", parent.name);
      localStorage.setItem("studentId", parent.studentId);
      localStorage.setItem("studentName", parent.studentName);

      // 🚀 DASHBOARD
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
              placeholder="Parent ID"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
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
          *Only registered parent can login.
          </p>
        </div>
      </div>
    </>
  );
};

export default ParentLogin;
