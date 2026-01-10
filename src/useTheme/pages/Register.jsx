import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Register.css";
import logo from "../../assets/logo.jpeg";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, setDoc ,serverTimestamp } from "firebase/firestore";


const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  

  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  // GOOGLE SIGN-IN
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // STORE TO FIRESTORE
      await setDoc(doc(db, "users", user.uid), {
        username: username || "",
        email: user.email,
        isGoogle: true,
        plan: "basic",
        role: "master",
        createdAt: serverTimestamp()
      });

          // ⭐ SAVE LOGIN CONTEXT ⭐
    localStorage.setItem("role", "master");
    localStorage.setItem("adminUid", user.uid);

      navigate("/dashboard", {
        state: { email: user.email, isGoogle: true }
      });

    } catch (err) {
      
    }
  };

  // NORMAL REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // SAVE USER TO FIRESTORE
      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        isGoogle: false,
        plan: "basic",
        role: "master",
        createdAt: serverTimestamp()
      });
          // ⭐ SAVE LOGIN CONTEXT ⭐
    localStorage.setItem("role", "master");
    localStorage.setItem("adminUid", user.uid);

      navigate("/dashboard", {
        state: { email, password, username, isGoogle: false }
      });

    } catch (err) {
      setError(err.message);
    }finally {
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
          <a href="login">Login</a>
          <Link to="/choose-login" className="start-btn">School Login</Link>
        </div>
      </nav>
      
      <div className="log" style={{ marginTop: "80px" }}>
        <h2>Register</h2>

        <form onSubmit={handleRegister}>

          {/* USERNAME */}
          <input
            type="text"
            placeholder="User Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

        

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

{/* PASSWORD */}
<div className="password-wrapper">
  <input
    type={showPass ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />
  <span className="eye-icon" onClick={() => setShowPass(!showPass)}>
    {showPass ? <FaEyeSlash /> : <FaEye />}
  </span>

{/* CONFIRM PASSWORD */}
  <input
    type={showPass ? "text" : "password"}
    placeholder="Confirm Password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    required
  />
  <span className="eye-icon1" onClick={() => setShowPass(!showPass)}>
    
  </span>
</div>


          {error && <p style={{ color: "red" }}>{error}</p>}

          <button className="register-btn" type="submit" disabled={loading}>
             {loading ? "Loading..." : "Register"}
            </button>


          <button type="button" className="google-btn" onClick={handleGoogleSignIn}>
            <FcGoogle className="google-icon" /> Sign up with Google
          </button>
        </form>

        <p>
          Already have an account? <Link to="/Login">Login here</Link>
        </p>
      </div></div>
      </div>
      </>
  );
};

export default Register;
