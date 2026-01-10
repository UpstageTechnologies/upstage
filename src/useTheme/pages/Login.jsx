import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut
} from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "../styles/Login.css";
import logo from "../../assets/logo.jpeg";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";




const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role; 
  const provider = new GoogleAuthProvider();

  // NORMAL LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
  
    setLoading(true);
  
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
  
      const user = cred.user;
  
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        await signOut(auth);
        alert("Please register first");
        navigate("/register");
        return;
      }const d = userSnap.data();


      // ⭐ ⭐ IMPORTANT — save profile photo + name
localStorage.setItem("profilePhoto", d.photoURL || "");
localStorage.setItem("adminName", d.username || "Admin");
  
      // SAVE MASTER LOGIN INFO
localStorage.setItem("role", "master");
localStorage.setItem("adminUid", user.uid);

      navigate("/dashboard");
  
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  

  // FORGOT PASSWORD
  const handleForgotPassword = async () => {
    const email = prompt("Enter your registered email:");
    if (!email) return;

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link sent!");
    } catch (error) {
      alert(error.message);
    }
  };

  
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await signOut(auth);
        alert("Please register first ");
        navigate("/register");
        return;
      }

      navigate("/dashboard");

    } catch (error) {
      
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
          <a href="register">Register</a>
          <Link to="/choose-login" className="start-btn">School Login</Link>
        </div>
      </nav>
      
        <div className="log">
          <h2>
            Login  <span style={{ fontSize: "14px" }}> </span>
          </h2>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

            <p className="forgot-text" onClick={handleForgotPassword}>
              Forgot Password?
            </p>

            <button className="log-btn" type="submit" disabled={loading}>
            {loading ? "Loading..." : "Login"} 
            </button>

          </form>

          
          
            
              <p>--- or ---</p>

              <button className="google-btn" onClick={handleGoogleSignIn}>
                <FcGoogle /> Sign in with Google
              </button>

              <p>
                Don&apos;t have an account?{" "}
                <Link to="/register">Register</Link>
              </p>
            
          
        </div>
      </div>
      </div>
    </>
  );
};

export default Login;
