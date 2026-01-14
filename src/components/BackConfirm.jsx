import { useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";

const BackConfirm = () => {
  const navigate = useNavigate();
  const blocking = useRef(true);

  useEffect(() => {
    // 🟢 Create a fake previous page so back won't exit app
    window.history.pushState({ page: "dashboard" }, "", window.location.href);

    const onPopState = async () => {
      if (!blocking.current) return;

      const ok = window.confirm("Do you want to logout and go to home page?");

      if (ok) {
        blocking.current = false;

      

localStorage.clear();
await signOut(auth);

// let browser finish popstate before routing
setTimeout(() => {
  navigate("/", { replace: true });
}, 50);

      } else {
        // Stay inside dashboard
        window.history.pushState({ page: "dashboard" }, "", window.location.href);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [navigate]);

  // 🔴 Prevent tab close / refresh
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  return null;
};

export default BackConfirm;