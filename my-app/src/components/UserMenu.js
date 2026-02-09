"use client";

import { useEffect, useState } from "react";

export function UserMenu() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("fitlab_token");
      setIsAuthed(!!token);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("fitlab_token");
      window.location.href = "/";
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      {isAuthed ? (
        <>
          <a href="/dashboard" className="btn-outline text-xs">
            Кабинет
          </a>
          <button onClick={handleLogout} className="btn-outline text-xs px-4">
            Выйти
          </button>
        </>
      ) : (
        <>
          <a href="/auth/login" className="btn-outline text-xs">
            Войти
          </a>
          <a href="/auth/register" className="btn-outline text-xs">
            Регистрация
          </a>
        </>
      )}
    </div>
  );
}


