"use client";

import { cn } from "@/lib/cn";

export function PhoneInput({ 
  className, 
  value = "", 
  onChange, 
  placeholder = "+7 (___) ___-__-__",
  disabled,
  ...props 
}) {
  const formatPhone = (val) => {
    // Удаляем всё кроме цифр
    let digits = val.replace(/\D/g, "");
    
    // Если начинается с 8, заменяем на 7
    if (digits.startsWith("8")) {
      digits = "7" + digits.slice(1);
    }
    
    // Если не начинается с 7, добавляем 7
    if (!digits.startsWith("7") && digits.length > 0) {
      digits = "7" + digits;
    }
    
    // Форматируем: +7 (XXX) XXX-XX-XX
    if (digits.length <= 1) {
      return digits ? "+7" : "";
    }
    if (digits.length <= 4) {
      return `+7 (${digits.slice(1)}`;
    }
    if (digits.length <= 7) {
      return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    }
    if (digits.length <= 9) {
      return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };

  const handleChange = (e) => {
    const formatted = formatPhone(e.target.value);
    
    // Создаём событие с отформатированным значением
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value: formatted,
      },
    };
    
    // Для отправки на сервер используем чистый формат +7XXXXXXXXXX
    const rawValue = formatted.replace(/\D/g, "");
    if (rawValue.length === 11 && rawValue.startsWith("7")) {
      syntheticEvent.target.rawValue = `+${rawValue}`;
    } else {
      syntheticEvent.target.rawValue = formatted;
    }
    
    onChange?.(syntheticEvent);
  };

  return (
    <input
      type="tel"
      className={cn(
        "w-full rounded-[14px] border border-[color:var(--stroke)] bg-[color:var(--elevated)] px-3.5 py-3 shadow-[var(--shadow-xs)] text-[color:var(--text)] placeholder:text-[color:var(--muted2)] outline-none transition hover:border-[color:var(--stroke-strong)] focus:border-[color:var(--accent)] focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--accent)_14%,transparent)]",
        className
      )}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      {...props}
    />
  );
}
