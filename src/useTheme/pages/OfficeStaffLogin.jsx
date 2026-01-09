import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  collectionGroup,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../services/firebase";

import logo from "../../assets/logo.jpeg";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/Login.css";

const OfficeStaffLogin = () => {
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!staffId || !password) {
      alert("Fill all fields");
      return;
    }

    setLoading(true);

    try {
      const snap = await getDocs(
        query(
          collectionGroup(db, "office_staffs"),
          where("staffId", "==", staffId.trim()),
          where("password", "==", password.trim())
        )
      );

      if (snap.empty) {
        alert("Invalid credentials");
        setLoading(false);
        return;
      }

      const docSnap = snap.docs[0];
      const staff = docSnap.data();

      // 🔥 parent admin UID
      const adminUid = docSnap.ref.parent.parent.id;

      // ⭐ STORE SESSION DATA
      localStorage.setItem("staffDocId", docSnap.id);
      localStorage.setItem("staffId", staff.staffId);
      localStorage.setItem("staffName", staff.name || "");
      localStorage.setItem("email", staff.email || "");
      localStorage.setItem("profilePhoto", staff.photoURL || "");
      localStorage.setItem("role", "office_staff");
      localStorage.setItem("adminUid", adminUid);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Login error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="wrapper">
        <nav className="nav-bar">
          <img src={logo} alt="Company Logo" className="logo" />
          <div className="nav-links">
            <a href="/">Home</a>
            <Link to="/choose-login" className="start-btn">
              School Login
            </Link>
          </div>
        </nav>

        <div className="log">
          <h2>Office Staff Login</h2>

          <form onSubmit={handleLogin}>
            <input
              placeholder="Staff ID"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
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
            *Only registered office staff can login.
          </p>
        </div>
      </div>
    </>
  );
};

export default OfficeStaffLogin;
