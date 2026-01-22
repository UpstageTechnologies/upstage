import React from "react";
import { useSearchParams } from "react-router-dom";
import Home from "./Home";
import TeacherHome from "./TeacherHome";
import ParentHome from "./ParentHome";

export default function UserViewDashboard() {
  const [params] = useSearchParams();

  const role = params.get("role"); // admin | teacher | parent
  const id = params.get("id");

  const adminUid = localStorage.getItem("adminUid");

  if (!role || !id) {
    return <div>Invalid view</div>;
  }

  return (
    <div className="home-page view-mode-full">
      {/* 🔒 VIEW MODE BANNER */}
      <div
        style={{
          background: "#FEF3C7",
          color: "#92400E",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 500
        }}
      >
        <span>
          Viewing as <b>{role.toUpperCase()}</b> — Read only
        </span>

        <button
          onClick={() => window.close()}
          style={{
            background: "#EF4444",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          ✕ Close
        </button>
      </div>

      {/* 🔥 ROLE BASED VIEW */}
      {role === "admin" && (
        <Home
          adminUid={adminUid}
          viewAs="admin"
          viewAdminId={id}
          plan="premium"   // read-only view → allow charts
        />
      )}

      {role === "teacher" && (
        <TeacherHome
          adminUid={adminUid}
          teacherId={id}
          viewAs="teacher"
        />
      )}

      {role === "parent" && (
        <ParentHome
          adminUid={adminUid}
          parentId={id}
          viewAs="parent"
        />
      )}
    </div>
  );
}
