// src/app/account/page.js
"use client";

import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
  const { user, role, isAdmin, logout } = useAuth();

  return (
    <div className="card">
      <div className="row">
        <div>
          <div className="muted">Данные аккаунта</div>
          <div className="h2">{user?.name || "Пользователь"}</div>
          <div className="muted">{user?.email || ""}</div>
          <div className="muted">Роль: {String(role || "user")}</div>
          {isAdmin ? <div className="pill">Admin</div> : null}
        </div>

        <button className="btn" onClick={logout}>Выйти</button>
      </div>

      {isAdmin ? (
        <div style={{ marginTop: 12 }}>
          <a className="btn btnOutline" href="/admin">Перейти в админку</a>
        </div>
      ) : null}
    </div>
  );
}
