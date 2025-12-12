import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import logo from "../logo.jpeg";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  

  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleForgotPassword = async () => {
    const email = prompt("Enter your registered email:");
  
    if (!email) return;
  
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link sent! Check your email.");
    } catch (error) {
      // Check if the error is because user not found
      if (error.code === "auth/user-not-found") {
        alert("This email is not registered. Please check and try again.");
      } else {
        alert(error.message);
      }
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (error) {
      
      
    }
  };

  return (
    <>
    
    
    
    
    <span>
    <img src={logo} alt="Company Logo" className="top-left-logo" /></span>
    <div className="wrapper">

      <div className="log">
        <h2>Login</h2>
      

        <form onSubmit={handleLogin}>
          {/* EMAIL */}
          

           <input 
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
           />
         


          {/* PASSWORD WITH SHOW/HIDE */}
          <div
            className="poss"
            style={{ position: "relative", width: "80%", margin: "0px 20px" }}
          >
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%" }}
            />

            <span
              onClick={() => setShowPass(!showPass)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "white",
              }}
            >
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <p className="forgot-text" onClick={handleForgotPassword}>
             Forgot Password?
          </p>


          {/* LOGIN BUTTON */}
          <button type="submit" className="log-button">Login</button>
        </form>

        <div className="or">--- or ---</div>

        {/* GOOGLE LOGIN BUTTON */}
        <button type="button" onClick={handleGoogleSignIn} className="google-btn">
          <FcGoogle className="google-icon" /> Sign in with Google
        </button>

        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
      </div>
    </>
  );
};

export default Login;
