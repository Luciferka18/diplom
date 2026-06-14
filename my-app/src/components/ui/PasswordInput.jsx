"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Eye, EyeOff } from "lucide-react";

export function PasswordInput({ 
  className, 
  placeholder = "Пароль", 
  showStrength = false, 
  value = "", 
  onChange,
  disabled,
  ...props 
}) {
  const [showPassword, setShowPassword] = useState(false);

  const getStrengthInfo = (pwd) => {
    let strength = 0;
    const checks = {
      length: pwd.length >= 8,
      number: /\d/.test(pwd),
      letter: /[a-zA-Zа-яА-ЯёЁ]/.test(pwd),
      special: /[^a-zA-Z0-9а-яА-ЯёЁ]/.test(pwd),
    };

    strength = Object.values(checks).filter(Boolean).length;

    const labels = ["Слабый", "Средний", "Хороший", "Надёжный"];
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-[color:var(--accent)]"];

    return {
      strength,
      label: labels[strength - 1] || "",
      color: colors[strength - 1] || "",
      percentage: (strength / 4) * 100,
    };
  };

  const strengthInfo = showStrength && value ? getStrengthInfo(value) : null;

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          className={cn(
            "w-full rounded-[14px] border border-[color:var(--stroke)] bg-[color:var(--elevated)] px-3.5 py-3 shadow-[var(--shadow-xs)] pr-11 text-[color:var(--text)] placeholder:text-[color:var(--muted2)] outline-none transition hover:border-[color:var(--stroke-strong)] focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--accent)_14%,transparent)]",
            className
          )}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {strengthInfo && (
        <div className="mt-2 space-y-1">
          <div className="h-1.5 w-full rounded-full bg-[color:var(--stroke)] overflow-hidden">
            <div
              className={`h-full ${strengthInfo.color} transition-all duration-300`}
              style={{ width: `${strengthInfo.percentage}%` }}
            />
          </div>
          {strengthInfo.label && (
            <p className="text-xs text-[color:var(--muted)]">{strengthInfo.label}</p>
          )}
        </div>
      )}
    </div>
  );
}
