import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collectionGroup, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";

import logo from "../../assets/logo.jpeg";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/Login.css";

const ParentLogin = () => {
  const [parentId, setParentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    if (!parentId || !password) {
      alert("Fill all fields");
      return;
    }

    try {
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

      const adminUid = docSnap.ref.parent.parent.id;

      // ⭐ REAL FIRESTORE DOC ID
      localStorage.setItem("parentDocId", docSnap.id);

      // ⭐ PROFILE DATA
      localStorage.setItem("parentId", parent.parentId);
      localStorage.setItem("parentName", parent.parentName || "");
      localStorage.setItem("email", parent.email || "");
      localStorage.setItem("profilePhoto", parent.photoURL || "");

      // ⭐ SESSION
      localStorage.setItem("role", "parent");
      localStorage.setItem("adminUid", adminUid);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Login error");
    }
  };

  return (
    <div class="login-page">
    <div className="wrapper">
      <nav className="nav-bar">
        <img src={logo} alt="Company Logo" className="logo" />
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="#">about</a>
          <Link to="/choose-login" className="start-btn">School Login</Link>
        </div>
      </nav>

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

            <span className="eye" onClick={() => setShowPass(!showPass)}>
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button className="log-btn" type="submit" disabled={loading}>
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        <p style={{ marginTop: "15px" }}>
          *Only registered parent can login.
        </p>
      </div>
    </div></div>
  );
};

export default ParentLogin;
