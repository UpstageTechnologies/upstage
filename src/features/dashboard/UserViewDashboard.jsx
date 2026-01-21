import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Home from "./Home";
import TeacherHome from "./TeacherHome";
import ParentHome from "./ParentHome";

export default function UserViewDashboard() {
  const [params] = useSearchParams();

  const role = params.get("role"); // admin | teacher | parent
  const id = params.get("id");

  const adminUid = localStorage.getItem("adminUid");

  useEffect(() => {
    if (!role || !id) return;

    // 🔐 backup
    sessionStorage.setItem("view_backup_role", localStorage.getItem("role"));
    sessionStorage.setItem("view_backup_adminId", localStorage.getItem("adminId"));
    sessionStorage.setItem("view_backup_teacherId", localStorage.getItem("teacherDocId"));
    sessionStorage.setItem("view_backup_parentId", localStorage.getItem("parentDocId"));

    // 🔁 override
    localStorage.setItem("role", role);

    if (role === "admin") localStorage.setItem("adminId", id);
    if (role === "teacher") localStorage.setItem("teacherDocId", id);
    if (role === "parent") localStorage.setItem("parentDocId", id);

    // ♻️ restore on close
    return () => {
      localStorage.setItem("role", sessionStorage.getItem("view_backup_role"));
      localStorage.setItem("adminId", sessionStorage.getItem("view_backup_adminId"));
      localStorage.setItem("teacherDocId", sessionStorage.getItem("view_backup_teacherId"));
      localStorage.setItem("parentDocId", sessionStorage.getItem("view_backup_parentId"));
    };
  }, [role, id]);

  return (
    <div className="home-page view-mode-full">
      {/* 🔒 VIEW MODE BANNER */}
      <div className="view-banner">
        <span>Viewing as {role?.toUpperCase()} — Read only</span>
        <button className="view-close-btn" onClick={() => window.close()}>
          ✕ Close
        </button>
      </div>

      {/* 🔥 ROLE BASED RENDER */}
      {role === "admin" && (
        <Home adminUid={adminUid} plan="premium" />
      )}

      {role === "teacher" && (
        <TeacherHome
          adminUid={adminUid}
          teacherId={id}
        />
      )}

      {role === "parent" && (
        <ParentHome
          adminUid={adminUid}
          parentId={id}
        />
      )}
    </div>
  );
}
