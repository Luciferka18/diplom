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
  leftIcon = null,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const getStrengthInfo = (pwd) => {
    const checks = {
      length: pwd.length >= 8,
      number: /\d/.test(pwd),
      letter: /[a-zA-Zа-яА-ЯёЁ]/.test(pwd),
      special: /[^a-zA-Z0-9а-яА-ЯёЁ]/.test(pwd),
    };

    const strength = Object.values(checks).filter(Boolean).length;
    const labels = ["Слабый", "Средний", "Хороший", "Надёжный"];
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-[color:var(--accent)]"];

    return {
      strength,
      label: labels[strength - 1] || "",
      color: colors[strength - 1] || "",
      percentage: (strength / 4) * 100,
    };
  };

  const strengthInfo = showStrength && value ? getStrengthInfo(String(value)) : null;

  return (
    <div className="w-full">
      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted)]">
            {leftIcon}
          </span>
        ) : null}
        <input
          type={showPassword ? "text" : "password"}
          className={cn(
            "w-full rounded-[14px] border border-[color:var(--stroke)] bg-[color:var(--elevated)] px-3.5 py-3 text-[color:var(--text)] shadow-[var(--shadow-xs)] outline-none transition placeholder:text-[color:var(--muted2)] hover:border-[color:var(--stroke-strong)] focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--accent)_14%,transparent)] disabled:cursor-not-allowed disabled:opacity-60",
            leftIcon ? "pl-10" : "",
            "pr-11",
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
          aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
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
