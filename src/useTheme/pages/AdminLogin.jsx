import React, { useState } from "react";
import { useNavigate ,Link } from "react-router-dom";
import {
  collectionGroup,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "../../services/firebase";

import logo from "../../assets/logo.jpeg";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/Login.css";

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
      if (admin.role !== "admin") {
        alert("Access denied");
        setLoading(false);
        return;
      }

      // 🔑 SUPER ADMIN UID (same pattern as teacher)
      const superAdminUid = docSnap.ref.parent.parent.id;

      const adminData = docSnap.data();

// ⭐ save profile photo + name
localStorage.setItem("profilePhoto", adminData.photoURL || "");
localStorage.setItem("adminName", adminData.name || "Admin");


      /* ✅ SESSION */
      localStorage.setItem("role", "admin");
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
      
      <div class="login-page">
      <div className="wrapper">
      <nav className="nav-bar">
        
        <img src={logo} alt="Company Logo" className="logo" />
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="#about">About</a>
          <Link to="/login" className="start-btn">Login</Link>
        </div>
      </nav>
        <div className="log">
          <h2>Login</h2>

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

            <button className="log-btn" type="submit" disabled={loading}>
             {loading ? "Loading..." : "Login"}
            </button>

          </form>

          <p style={{ marginTop: "15px" }}>
            *Only registered sub-admins can login.
          </p>
        </div>
      </div></div>
    </>
  );
};

export default AdminLogin;
