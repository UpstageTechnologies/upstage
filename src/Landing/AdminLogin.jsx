import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collectionGroup,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "../firebase";

import logo from "../logo.jpeg";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../Login/Login.css";

const AdminLogin = () => {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!adminId || !password) {
      alert("Fill all fields");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      // 🔥 SAME AS TEACHER LOGIN (JUST admins)
      const q = query(
        collectionGroup(db, "admins"),
        where("adminId", "==", adminId.trim()),
        where("password", "==", password.trim())
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        alert("Invalid Admin ID or Password");
        setLoading(false);
        return;
      }

      const docSnap = snap.docs[0];
      const admin = docSnap.data();

      // ❗ ROLE CHECK (extra safety)
      if (admin.role !== "sub_admin") {
        alert("Access denied");
        setLoading(false);
        return;
      }

      // 🔑 SUPER ADMIN UID (same pattern as teacher)
      const superAdminUid = docSnap.ref.parent.parent.id;

      /* ✅ SESSION */
      localStorage.setItem("role", "sub_admin");
      localStorage.setItem("adminUid", superAdminUid);
      localStorage.setItem("adminId", admin.adminId);
      localStorage.setItem("adminName", admin.name);
      localStorage.setItem("email", admin.email);

      navigate("/dashboard");
    } catch (err) {
      console.error("Admin login error:", err);
      alert("Login error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <img src={logo} alt="Logo" className="logo" />

      <div className="wrapper">
        <div className="log">
          <h2>Admin Login</h2>

          <form onSubmit={handleLogin}>
            <input
              placeholder="Admin ID"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
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
            *Only registered sub-admins can login.
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
