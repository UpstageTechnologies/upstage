import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import "./PaymentSelection.css";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { email, password, isGoogle } = location.state || {};

  const goToLogin = () => {
    navigate("/dashboard");
  };

  const handlePaymentSuccess = async (planName) => {
    try {
      alert("Payment Successful!");
  
      const user = auth.currentUser;
      if (user) {
        // Update user's plan in Firestore
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          plan: planName.toLowerCase() // store as "premium" or "lifetime"
        });
      }
  
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };
  

  const openRazorpay = (amount, planName) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,  
      amount: amount * 100,          
      currency: "INR",
      name: "UpStageTeachnology",
      description: planName,
      handler: async function (response) {
        await handlePaymentSuccess(planName); // pass planName here
      },
      prefill: {
        email: email,
      },
      theme: {
        color: "#2140df",
      },
    };
  
    const rzp = new window.Razorpay(options);
    rzp.open();
  };
  

  return (
    <div className="wrapper">
      <div className="payment-body">
        <div className="payment-wrapper">
          <h2 className="payment-title">Select a Plan & Pay</h2>

          <div className="payment-container">

            {/* Basic Plan */}
            <div className="plan-box">
              <h3>Basic Plan</h3>
              <ul className="tick">
                <li>Limited Dashboard Analytics</li>
                <li>Any Three Classes</li>
                <li>200 Students</li>
                <ul className="wrong">
                  <li>Teacher / Parent / Student Login</li>
                  <li>Student Reports</li>
                </ul>
                </ul>
              

              <p className="price">
                <span className="old">₹99</span>
                <span className="new"> ₹0</span>
              </p>

              <p className="desc">No Specific Features</p>

              <button className="choose-btn" onClick={goToLogin}>
                Free
              </button>
            </div>

            {/* Premium Plan */}
            <div className="plan-box">
              <h3>Premium Plan</h3>
              <ul className="tick">
                <li>Dashboard Analytics</li>
                <li>Unlimited Classes</li>
                <li>Unlimited Students</li>
                <li>Teacher / Parent / Student Login</li>
                <li>Student Reports</li>
              </ul>

              <p className="price">
                <span className="old">₹399</span>
                <span className="new"> ₹299</span>
              </p>

              <p className="desc">All Features + Priority Support</p>

              <button
                className="choose-btn"
                onClick={() => openRazorpay(1, "Premium Plan")}
              >
                Buy Premium
              </button>
            </div>

            {/* Lifetime Access */}
            <div className="plan-box">
              <h3>Lifetime Access</h3>
              <ul className="tick">
                <li>Dashboard Analytics</li>
                <li>Unlimited Classes</li>
                <li>Unlimited Students</li>
                <li>Teacher / Parent / Student Login</li>
                <li>Student Reports</li>
              </ul>

              <p className="price">
                <span className="old">₹1999</span>
                <span className="new"> ₹999</span>
              </p>

              <p className="desc">One-Time Payment</p>

              <button
                className="choose-btn"
                onClick={() => openRazorpay(1, "Lifetime Access")}
            
              >
                Buy Lifetime
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
