import { cn } from "@/lib/cn";

export function Input({ className, ...props }) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2 text-[color:var(--text)] outline-none focus:ring-2 focus:ring-emerald-400/40",
        className
      )}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2 text-[color:var(--text)] outline-none focus:ring-2 focus:ring-emerald-400/40",
        className
      )}
    />
  );
}